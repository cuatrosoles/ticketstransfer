/**
 * Onboarding de gustos – web
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PREFERENCIAS_EVENTO } from '@tickets-transfer/shared';
import { completeTasteOnboarding } from '../lib/api';

export function PreferencesOnboarding() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggle = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const onContinue = async () => {
    if (selected.length === 0) {
      setError('Elegí al menos un tipo de evento');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await completeTasteOnboarding(selected);
      navigate('/home');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudieron guardar tus preferencias');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-content" style={{ maxWidth: 560, margin: '0 auto' }}>
      <h1 className="page-title">¿Qué eventos te gustan?</h1>
      <p className="text-muted mb-2">
        Elegí los tipos que más te interesan. Personalizaremos la sección &quot;Recomendados para vos&quot; en Inicio.
      </p>

      <div className="prefs-chip-grid">
        {PREFERENCIAS_EVENTO.map((pref) => {
          const active = selected.includes(pref.id);
          return (
            <button
              key={pref.id}
              type="button"
              className={`prefs-chip${active ? ' prefs-chip--active' : ''}`}
              onClick={() => toggle(pref.id)}
            >
              {pref.label}
            </button>
          );
        })}
      </div>

      {error ? <p className="form-error">{error}</p> : null}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 24 }}>
        <button type="button" className="btn-primary" disabled={loading} onClick={onContinue}>
          {loading ? 'Guardando…' : 'Continuar'}
        </button>
        <button type="button" className="btn-secondary" disabled={loading} onClick={() => navigate('/home')}>
          Omitir por ahora
        </button>
      </div>
    </div>
  );
}
