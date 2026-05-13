/**
 * Landing page pública de Tickets Transfer (v2).
 * Hero con descargas Android/iOS, "cómo funciona", beneficios, ticketeras
 * compatibles, capturas, y CTAs finales. Mantiene el flujo de login/registro.
 * Ubicación: apps/web/src/pages/Welcome.tsx
 */

import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  BadgeCheck,
  CreditCard,
  MessagesSquare,
  Smartphone,
  Apple,
  PlayCircle,
  Star,
  ChevronRight,
  Sparkles,
  Lock,
  Send,
  Search,
  Wallet,
  Ticket,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react';
import logoImg from '../assets/images/LogoTT-v01.png';
import { useBranding } from '../context/BrandingContext';
import { TICKETERAS, APPS_BOLETOS } from '@tickets-transfer/shared';

const ABOUT_TEXT =
  'Tickets Transfer es la app argentina para revender o intercambiar entradas-boletos digitales con la nueva metodología de QR mediante apps terciarizadas (Quentro, ENIGMA, T TICKET360, TICKETMAKER) descargadas desde sus ticketeras de origen. Funcionamos como mediadores entre vendedor y comprador para que tu venta o intercambio sea seguro, confiable y libre de estafas.';

const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1600&q=70',
  'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?auto=format&fit=crop&w=1600&q=70',
  'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=1600&q=70',
];

const SHOWCASE_IMAGE =
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1600&q=70';

const FEATURES: Array<{
  icon: LucideIcon;
  title: string;
  text: string;
}> = [
  {
    icon: ShieldCheck,
    title: 'Mediación segura',
    text: 'Actuamos entre vendedor y comprador para evitar estafas o fraudes. Tu pago queda retenido hasta la entrega correcta de la entrada.',
  },
  {
    icon: BadgeCheck,
    title: 'Identidad verificada (KYC)',
    text: 'Todos los usuarios pasan por una verificación de identidad. Comprás y vendés sabiendo con quién estás operando.',
  },
  {
    icon: CreditCard,
    title: 'Pagos con MercadoPago',
    text: 'Cobrá y pagá con tarjeta, transferencia o dinero en cuenta. Integración directa, sin pasos extra ni intermediarios opacos.',
  },
  {
    icon: MessagesSquare,
    title: 'Chat interno',
    text: 'Coordiná la entrega del QR con el comprador desde el chat de la app: rápido, privado y con historial moderado.',
  },
];

const STEPS: Array<{ icon: LucideIcon; title: string; text: string }> = [
  {
    icon: Send,
    title: 'Publicá tu entrada',
    text: 'Subí los datos del evento, el sector, el precio y una imagen referencial. Tu publicación queda visible para miles de compradores.',
  },
  {
    icon: Search,
    title: 'Encontrá comprador',
    text: 'Recibí mensajes, coordiná desde el chat interno y aceptá la oferta que más te convenga.',
  },
  {
    icon: Wallet,
    title: 'Cobrá seguro',
    text: 'Una vez confirmada la entrega del QR, liberamos el pago a tu cuenta de MercadoPago. Sin sorpresas.',
  },
];

function useReveal<T extends Element = HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            obs.disconnect();
          }
        });
      },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [visible]);
  return { ref, className: visible ? 'reveal reveal-in' : 'reveal' } as const;
}

function DownloadAndroidBadge({ href }: { href: string | null }) {
  const disabled = !href;
  return (
    <a
      href={disabled ? undefined : href!}
      target={disabled ? undefined : '_blank'}
      rel={disabled ? undefined : 'noopener noreferrer'}
      className={`store-badge ${disabled ? 'store-badge-disabled' : ''}`}
      aria-disabled={disabled || undefined}
      aria-label="Descargar para Android"
    >
      <PlayCircle size={32} aria-hidden />
      <span className="store-badge-text">
        <span className="store-badge-small">{disabled ? 'Próximamente' : 'Disponible en'}</span>
        <span className="store-badge-big">Google Play</span>
      </span>
    </a>
  );
}

function DownloadIosBadge({ href }: { href: string | null }) {
  const disabled = !href;
  return (
    <a
      href={disabled ? undefined : href!}
      target={disabled ? undefined : '_blank'}
      rel={disabled ? undefined : 'noopener noreferrer'}
      className={`store-badge ${disabled ? 'store-badge-disabled' : ''}`}
      aria-disabled={disabled || undefined}
      aria-label="Descargar para iOS"
    >
      <Apple size={32} aria-hidden />
      <span className="store-badge-text">
        <span className="store-badge-small">{disabled ? 'Próximamente' : 'Descargar en'}</span>
        <span className="store-badge-big">App Store</span>
      </span>
    </a>
  );
}

export function Welcome() {
  const { appName, tagline, logoUrl, downloadUrlAndroid, downloadUrlIos } = useBranding();
  const logoSrc = logoUrl || logoImg;

  const stepsReveal = useReveal<HTMLDivElement>();
  const featuresReveal = useReveal<HTMLDivElement>();
  const showcaseReveal = useReveal<HTMLDivElement>();
  const compatReveal = useReveal<HTMLDivElement>();
  const ctaReveal = useReveal<HTMLDivElement>();

  return (
    <div className="landing">
      <div className="landing-bg" aria-hidden>
        <div className="landing-bg-grid" />
        <div className="landing-bg-glow landing-bg-glow-a" />
        <div className="landing-bg-glow landing-bg-glow-b" />
        <div className="landing-bg-glow landing-bg-glow-c" />
      </div>

      <header className="landing-nav">
        <div className="landing-container landing-nav-inner">
          <Link to="/" className="landing-nav-brand" aria-label={appName}>
            <img src={logoSrc} alt={appName} />
          </Link>
          <nav className="landing-nav-links" aria-label="Navegación principal">
            <a href="#como-funciona">¿Cómo funciona?</a>
            <a href="#beneficios">Beneficios</a>
            <a href="#compatibilidad">Compatibilidad</a>
            <a href="#descargar">Descargar</a>
          </nav>
          <div className="landing-nav-actions">
            <Link to="/login" className="landing-btn landing-btn-ghost">
              Iniciar sesión
            </Link>
            <Link to="/register" className="landing-btn landing-btn-primary">
              Registrarme
            </Link>
          </div>
        </div>
      </header>

      <section className="landing-hero">
        <div className="landing-container landing-hero-grid">
          <div className="landing-hero-text">
            <span className="landing-eyebrow">
              <Sparkles size={14} aria-hidden /> La forma segura de revender entradas en Argentina
            </span>
            <h1 className="landing-h1">
              Comprá, vendé e <span className="landing-gradient-text">intercambiá entradas</span> sin
              miedo a estafas
            </h1>
            <p className="landing-lead">
              {tagline || 'Mediamos entre vendedor y comprador. QR digital, identidad verificada y pagos protegidos con MercadoPago.'}
            </p>

            <div className="landing-hero-cta" id="descargar">
              <DownloadAndroidBadge href={downloadUrlAndroid} />
              <DownloadIosBadge href={downloadUrlIos} />
            </div>

            <div className="landing-hero-meta">
              <div className="landing-rating" aria-label="Calificación 4.8 sobre 5">
                <span className="landing-stars">
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                </span>
                <strong>4.8</strong>
                <span className="landing-rating-text">opiniones positivas</span>
              </div>
              <Link to="/register" className="landing-link-arrow">
                Crear cuenta gratis <ArrowRight size={16} aria-hidden />
              </Link>
            </div>
          </div>

          <div className="landing-hero-visual" aria-hidden>
            <div className="landing-hero-card">
              <img src={logoSrc} alt="" className="landing-hero-logo" />
              <div className="landing-hero-card-shine" />
            </div>
            <div className="landing-hero-floats">
              <div className="float-card float-card-a">
                <Ticket size={20} />
                <div>
                  <strong>Entrada vendida</strong>
                  <span>Hace 2 minutos</span>
                </div>
              </div>
              <div className="float-card float-card-b">
                <ShieldCheck size={20} />
                <div>
                  <strong>Pago liberado</strong>
                  <span>$ 32.500 ARS</span>
                </div>
              </div>
              <div className="float-card float-card-c">
                <BadgeCheck size={20} />
                <div>
                  <strong>Identidad verificada</strong>
                  <span>Vendedor confiable</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-strip">
        <div className="landing-container">
          <p className="landing-strip-text">
            <Lock size={14} aria-hidden /> Mediamos entre vendedor y comprador • KYC obligatorio •
            Pagos con MercadoPago • Soporte humano
          </p>
        </div>
      </section>

      <section className="landing-section" id="como-funciona">
        <div className="landing-container">
          <div className="landing-section-head">
            <span className="landing-eyebrow landing-eyebrow-center">¿Cómo funciona?</span>
            <h2 className="landing-h2">Vendé tu entrada en 3 pasos</h2>
            <p className="landing-section-sub">
              Una experiencia simple, transparente y pensada para el ecosistema de QR digital que
              usan hoy las ticketeras argentinas.
            </p>
          </div>

          <div className={`landing-steps ${stepsReveal.className}`} ref={stepsReveal.ref}>
            {STEPS.map((s, i) => (
              <article key={s.title} className="landing-step">
                <div className="landing-step-number">{String(i + 1).padStart(2, '0')}</div>
                <div className="landing-step-icon">
                  <s.icon size={26} />
                </div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-section landing-section-alt" id="beneficios">
        <div className="landing-container">
          <div className="landing-section-head">
            <span className="landing-eyebrow landing-eyebrow-center">Por qué confiar</span>
            <h2 className="landing-h2">Pensado para no dejar nada librado al azar</h2>
            <p className="landing-section-sub">
              Combinamos identidad verificada, mediación humana y un flujo de pago retenido para
              proteger cada operación.
            </p>
          </div>

          <div className={`landing-features ${featuresReveal.className}`} ref={featuresReveal.ref}>
            {FEATURES.map((f) => (
              <article key={f.title} className="landing-feature">
                <div className="landing-feature-icon">
                  <f.icon size={24} />
                </div>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-section landing-showcase">
        <div className="landing-container">
          <div className={`landing-showcase-grid ${showcaseReveal.className}`} ref={showcaseReveal.ref}>
            <div className="landing-showcase-media">
              <img src={SHOWCASE_IMAGE} alt="Show en vivo con luces de escenario" loading="lazy" />
              <div className="landing-showcase-media-overlay" />
              <div className="landing-showcase-images">
                {HERO_IMAGES.map((src, i) => (
                  <img
                    key={src}
                    src={src}
                    alt=""
                    loading="lazy"
                    className={`landing-showcase-thumb landing-showcase-thumb-${i + 1}`}
                  />
                ))}
              </div>
            </div>
            <div className="landing-showcase-text">
              <span className="landing-eyebrow">Sobre Tickets Transfer</span>
              <h2 className="landing-h2 landing-h2-left">
                La metodología <span className="landing-gradient-text">QR digital</span>, ahora con
                respaldo
              </h2>
              <p className="landing-lead landing-lead-left">{ABOUT_TEXT}</p>
              <ul className="landing-check-list">
                <li>
                  <BadgeCheck size={18} /> 100% argentino, soporte local
                </li>
                <li>
                  <BadgeCheck size={18} /> Mediación humana en cada operación
                </li>
                <li>
                  <BadgeCheck size={18} /> Transferencia del QR coordinada por chat interno
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-section" id="compatibilidad">
        <div className="landing-container">
          <div className="landing-section-head">
            <span className="landing-eyebrow landing-eyebrow-center">Compatibilidad</span>
            <h2 className="landing-h2">Ticketeras y apps de boletos soportadas</h2>
            <p className="landing-section-sub">
              Si compraste tu entrada en alguna de las ticketeras de origen más usadas en Argentina,
              podés operarla acá.
            </p>
          </div>

          <div className={`landing-compat ${compatReveal.className}`} ref={compatReveal.ref}>
            <div className="landing-compat-block">
              <h4>Ticketeras de origen</h4>
              <div className="landing-chip-grid">
                {TICKETERAS.map((t) => (
                  <span key={t.id} className="landing-chip">
                    <Ticket size={14} aria-hidden /> {t.label}
                  </span>
                ))}
              </div>
            </div>
            <div className="landing-compat-block">
              <h4>Apps de boletos digitales</h4>
              <div className="landing-chip-grid">
                {APPS_BOLETOS.map((a) => (
                  <span key={a.id} className="landing-chip">
                    <Smartphone size={14} aria-hidden /> {a.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-section landing-section-cta">
        <div className="landing-container">
          <div className={`landing-cta ${ctaReveal.className}`} ref={ctaReveal.ref}>
            <div className="landing-cta-text">
              <span className="landing-eyebrow">Descargá la app</span>
              <h2 className="landing-h2 landing-h2-left">Llevá Tickets Transfer en tu bolsillo</h2>
              <p className="landing-lead landing-lead-left">
                Publicá, comprá y coordiná entregas desde tu teléfono. Notificaciones push, chat en
                tiempo real y soporte para tickets QR de las principales ticketeras argentinas.
              </p>
              <div className="landing-hero-cta landing-hero-cta-block">
                <DownloadAndroidBadge href={downloadUrlAndroid} />
                <DownloadIosBadge href={downloadUrlIos} />
              </div>
              <p className="landing-cta-help">
                ¿Preferís usar la web? <Link to="/register">Creá tu cuenta acá</Link> y empezá en
                segundos.
              </p>
            </div>
            <div className="landing-cta-visual" aria-hidden>
              <div className="landing-phone">
                <div className="landing-phone-notch" />
                <div className="landing-phone-screen">
                  <img src={logoSrc} alt="" />
                  <div className="landing-phone-card">
                    <Ticket size={18} />
                    <div>
                      <strong>Coldplay – Estadio River</strong>
                      <span>Platea VIP · $ 95.000</span>
                    </div>
                    <ChevronRight size={18} />
                  </div>
                  <div className="landing-phone-card landing-phone-card-alt">
                    <Wallet size={18} />
                    <div>
                      <strong>Pago liberado</strong>
                      <span>Acreditado en MercadoPago</span>
                    </div>
                    <ChevronRight size={18} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="landing-container landing-footer-grid">
          <div className="landing-footer-brand">
            <img src={logoSrc} alt={appName} />
            <p>
              Mediamos entre vendedor y comprador para que tu venta o intercambio de entradas sea
              seguro y exitoso. ¡Gracias por confiar en {appName}!
            </p>
          </div>
          <div className="landing-footer-links">
            <h5>Producto</h5>
            <a href="#como-funciona">¿Cómo funciona?</a>
            <a href="#beneficios">Beneficios</a>
            <a href="#descargar">Descargar app</a>
          </div>
          <div className="landing-footer-links">
            <h5>Cuenta</h5>
            <Link to="/login">Iniciar sesión</Link>
            <Link to="/register">Registrarme</Link>
          </div>
          <div className="landing-footer-links">
            <h5>Legales</h5>
            <Link to="/terminos-y-condiciones">Términos y condiciones</Link>
            <Link to="/politica-privacidad">Política de privacidad</Link>
            <Link to="/soporte">Soporte</Link>
          </div>
        </div>
        <div className="landing-footer-bottom">
          <div className="landing-container landing-footer-bottom-inner">
            <span>© {new Date().getFullYear()} {appName}. Todos los derechos reservados.</span>
            <span className="landing-footer-bottom-meta">
              Hecho con <span className="landing-heart" aria-hidden>♥</span> en Argentina
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
