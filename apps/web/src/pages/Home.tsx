/**
 * Home – Marketplace con destacados y recomendados personalizados.
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  getMarketplaceRecommended,
  recordListingInteraction,
  ensureImageUrl,
  type MarketplacePublicItem,
} from '../lib/api';
import { getEventImageCategoryFallback } from '@tickets-transfer/shared';

function formatEventDate(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function EventCard({ item, onOpen }: { item: MarketplacePublicItem; onOpen: () => void }) {
  const img =
    ensureImageUrl(item.eventImageUrl) || getEventImageCategoryFallback(item.category ?? 'OTRO');
  return (
    <button type="button" className="home-event-card glass" onClick={onOpen}>
      <div
        className="home-event-card__img"
        style={{ backgroundImage: `url(${img})` }}
        role="img"
        aria-label={item.eventName}
      />
      <div className="home-event-card__body">
        <h3>{item.eventName}</h3>
        <p className="text-muted">{formatEventDate(String(item.eventDate))}</p>
        {item.eventPlace ? <p className="text-muted">{item.eventPlace}</p> : null}
        {item.price != null ? (
          <p className="home-event-card__price">${item.price.toLocaleString('es-AR')} ARS</p>
        ) : null}
      </div>
    </button>
  );
}

export function Home() {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState<MarketplacePublicItem[]>([]);
  const [recommended, setRecommended] = useState<MarketplacePublicItem[]>([]);
  const [personalized, setPersonalized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getMarketplaceRecommended()
      .then((res) => {
        if (!cancelled) {
          setFeatured(res.featured ?? []);
          setRecommended(res.recommended ?? []);
          setPersonalized(Boolean(res.personalized));
        }
      })
      .catch(() => {
        if (!cancelled) setError('No se pudieron cargar los eventos.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const openListing = (item: MarketplacePublicItem) => {
    void recordListingInteraction(item.id, 'CLICK', item.category).catch(() => {});
    navigate('/comprar-ticket/detalle', { state: { listingId: item.id, password: '' } });
  };

  return (
    <div className="page-content">
      <h1 className="page-title">Tickets Transfer</h1>
      <p className="text-muted mb-2">Tu forma segura de revender e intercambiar entradas en Argentina.</p>

      <div className="home-actions" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 28 }}>
        <Link to="/publicar" className="glass" style={{ padding: 20, borderRadius: 12, textDecoration: 'none', color: 'var(--text)', fontWeight: 600 }}>
          Publicar ticket
        </Link>
        <Link to="/mis-compras" className="glass" style={{ padding: 20, borderRadius: 12, textDecoration: 'none', color: 'var(--text)', fontWeight: 600 }}>
          Mis compras
        </Link>
        <Link to="/mis-ventas" className="glass" style={{ padding: 20, borderRadius: 12, textDecoration: 'none', color: 'var(--text)', fontWeight: 600 }}>
          Mis ventas
        </Link>
      </div>

      <div className="home-section-head">
        <h2 className="home-section-title">Eventos destacados</h2>
        <Link to="/comprar-ticket" className="home-section-link">
          Ver todos
        </Link>
      </div>

      {loading ? (
        <div className="screen-center" style={{ minHeight: 120 }}>
          <div className="loader" />
        </div>
      ) : error ? (
        <p className="form-error">{error}</p>
      ) : featured.length === 0 ? (
        <p className="text-muted">No hay eventos destacados por el momento.</p>
      ) : (
        <div className="home-featured-row">
          {featured.map((item) => (
            <EventCard key={item.id} item={item} onOpen={() => openListing(item)} />
          ))}
        </div>
      )}

      <div className="home-section-head" style={{ marginTop: 32 }}>
        <div>
          <h2 className="home-section-title">Recomendados para vos</h2>
          {personalized ? (
            <p className="text-muted" style={{ fontSize: 13, margin: '4px 0 0' }}>
              Según tus gustos e interacciones
            </p>
          ) : null}
        </div>
        <Link to="/onboarding/preferencias" className="home-section-link">
          Ajustar gustos
        </Link>
      </div>

      {!loading && recommended.length > 0 ? (
        <div className="home-recommended-row">
          {recommended.map((item) => (
            <EventCard key={item.id} item={item} onOpen={() => openListing(item)} />
          ))}
        </div>
      ) : !loading ? (
        <p className="text-muted">
          Completá tus gustos en{' '}
          <Link to="/onboarding/preferencias">preferencias</Link> para ver recomendaciones personalizadas.
        </p>
      ) : null}
    </div>
  );
}
