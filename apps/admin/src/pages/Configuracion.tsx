/**
 * Configuración de la plataforma - Tabs: General, Pasarelas, Usuarios, Visuales.
 */

import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Settings, CreditCard, Users, Palette, Bell } from 'lucide-react';

type MercadoPagoSettings = {
  enabled: boolean;
  accessToken: string;
  publicKey: string;
  webhookSecret: string;
  sandboxMode: boolean;
  backUrlBase?: string;
  sandboxUsePayerTestCom?: boolean;
  sandboxUseRealEmail?: boolean;
};

type PlatformSettings = {
  commissionPercentage: number;
  marketplaceHomePublicListingsLimit: number;
  mercadopago: MercadoPagoSettings;
  users?: Record<string, unknown>;
  visual?: Record<string, unknown>;
  notifications?: Record<string, unknown>;
};

type TabId = 'general' | 'pasarelas' | 'usuarios' | 'visuales' | 'notificaciones';

export function Configuracion() {
  const [tab, setTab] = useState<TabId>('general');
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<PlatformSettings>({
    commissionPercentage: 6.5,
    marketplaceHomePublicListingsLimit: 6,
    mercadopago: { enabled: false, accessToken: '', publicKey: '', webhookSecret: '', sandboxMode: true },
    users: {},
    visual: {},
    notifications: {},
  });

  useEffect(() => {
    api<PlatformSettings>('/api/admin/settings')
      .then((s) => {
        setSettings(s);
        setForm({
          ...s,
          users: s.users && typeof s.users === 'object' ? { ...s.users } : {},
          visual: s.visual && typeof s.visual === 'object' ? { ...s.visual } : {},
          notifications: s.notifications && typeof s.notifications === 'object' ? { ...s.notifications } : {},
        });
      })
      .catch(() => setSettings(null))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await api<PlatformSettings>('/api/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(form),
      });
      setSettings(updated);
      setForm(updated);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Cargando configuración…</p>;
  if (!settings) return <p>No se pudo cargar la configuración.</p>;

  const tabs = [
    { id: 'general' as TabId, label: 'Ajustes generales', icon: Settings },
    { id: 'pasarelas' as TabId, label: 'Pasarelas de pago', icon: CreditCard },
    { id: 'usuarios' as TabId, label: 'Ajustes de usuarios', icon: Users },
    { id: 'visuales' as TabId, label: 'Ajustes visuales', icon: Palette },
    { id: 'notificaciones' as TabId, label: 'Notificaciones / push', icon: Bell },
  ];

  return (
    <>
      <div className="admin-header">
        <h1 className="admin-title">Configuración</h1>
      </div>

      <div className="config-tabs">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            className={`config-tab ${tab === id ? 'active' : ''}`}
            onClick={() => setTab(id)}
          >
            <Icon size={18} style={{ marginRight: 8 }} />
            {label}
          </button>
        ))}
      </div>

      <div className="config-content">
        {tab === 'general' && (
          <div className="config-section">
            <h2>Cargo por servicio (comisión)</h2>
            <p className="text-muted">
              Porcentaje que la plataforma cobra sobre el valor total de cada operación de compra-venta de tickets.
            </p>
            <div className="form-group">
              <label>Porcentaje de comisión (%)</label>
              <input
                type="number"
                min={0}
                max={100}
                step={0.1}
                value={form.commissionPercentage ?? 6.5}
                onChange={(e) =>
                  setForm((f) => ({ ...f, commissionPercentage: parseFloat(e.target.value) || 0 }))
                }
              />
            </div>
            <div className="form-group">
              <label>Tickets públicos en el inicio (app móvil)</label>
              <input
                type="number"
                min={1}
                max={50}
                step={1}
                value={form.marketplaceHomePublicListingsLimit ?? 6}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    marketplaceHomePublicListingsLimit: Math.min(
                      50,
                      Math.max(1, parseInt(e.target.value, 10) || 6)
                    ),
                  }))
                }
              />
              <small className="text-muted">
                Cantidad máxima de publicaciones <strong>públicas</strong> en la sección “Tickets a la Venta” del
                inicio. Por defecto 6 (grilla de 2 columnas × 3 filas).
              </small>
            </div>
          </div>
        )}

        {tab === 'pasarelas' && (
          <div className="config-section">
            <h2>Mercado Pago</h2>
            <p className="text-muted">
              Configuración de la pasarela de pagos Mercado Pago (Checkout Pro + Checkout API para tarjetas adheridas).
            </p>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={form.mercadopago?.enabled ?? false}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      mercadopago: { ...(f.mercadopago || {}), enabled: e.target.checked },
                    }))
                  }
                />
                {' '}Activado
              </label>
            </div>
            <div className="form-group">
              <label>Access Token</label>
              <input
                type="password"
                placeholder={form.mercadopago?.accessToken ? '•••••••• (dejar vacío para mantener)' : 'APP_USR-xxx'}
                value={form.mercadopago?.accessToken?.startsWith('••••') ? '' : (form.mercadopago?.accessToken || '')}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    mercadopago: { ...(f.mercadopago || {}), accessToken: e.target.value },
                  }))
                }
              />
              <small className="text-muted">
                Credencial de producción o prueba. Si está configurado, se muestra como ••••••••
              </small>
            </div>
            <div className="form-group">
              <label>Public Key (Checkout API)</label>
              <input
                type="password"
                placeholder={form.mercadopago?.publicKey ? '•••••••• (dejar vacío para mantener)' : 'APP_USR-xxx'}
                value={form.mercadopago?.publicKey?.startsWith('••••') ? '' : (form.mercadopago?.publicKey || '')}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    mercadopago: { ...(f.mercadopago || {}), publicKey: e.target.value },
                  }))
                }
              />
              <small className="text-muted">
                Necesaria para tokenizar tarjetas en la app (Tarjetas Adheridas). Si está configurado, se muestra como ••••••••
              </small>
            </div>
            <div className="form-group">
              <label>Webhook Secret</label>
              <input
                type="password"
                placeholder={form.mercadopago?.webhookSecret ? '•••••••• (dejar vacío para mantener)' : 'Clave secreta del webhook'}
                value={form.mercadopago?.webhookSecret?.startsWith('••••') ? '' : (form.mercadopago?.webhookSecret || '')}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    mercadopago: { ...(f.mercadopago || {}), webhookSecret: e.target.value },
                  }))
                }
              />
            </div>
            <div className="form-group">
              <label>URL de retorno (tras el pago)</label>
              <input
                type="text"
                placeholder="ticketTransfer:// (app) o https://tu-web.com (web)"
                value={form.mercadopago?.backUrlBase ?? ''}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    mercadopago: { ...(f.mercadopago || {}), backUrlBase: e.target.value },
                  }))
                }
              />
              <small className="text-muted">
                Solo app móvil: usá <code>ticketTransfer://</code> para que el retorno abra la app. Con web: URL pública de tu sitio.
              </small>
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={form.mercadopago?.sandboxMode ?? true}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      mercadopago: { ...(f.mercadopago || {}), sandboxMode: e.target.checked },
                    }))
                  }
                />
                {' '}Modo Sandbox (pruebas)
              </label>
              <small className="text-muted">
                Usar credenciales de prueba. Desactivar para producción.
              </small>
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={form.mercadopago?.sandboxUsePayerTestCom ?? false}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      mercadopago: { ...(f.mercadopago || {}), sandboxUsePayerTestCom: e.target.checked },
                    }))
                  }
                />
                {' '}Usar test_payer_1@testuser.com en sandbox
              </label>
              <small className="text-muted">
                Customer compartido (mismo email que el formulario). Formato requerido por MP: test_payer_[0-9]@testuser.com
              </small>
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={form.mercadopago?.sandboxUseRealEmail ?? false}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      mercadopago: { ...(f.mercadopago || {}), sandboxUseRealEmail: e.target.checked },
                    }))
                  }
                />
                {' '}Usar email real (error 234 - credenciales producción)
              </label>
              <small className="text-muted">
                Si aparece &quot;Invalid domain user email for productive customer&quot;, activá esto. Usa el email real del usuario.
              </small>
            </div>
          </div>
        )}

        {tab === 'usuarios' && (
          <div className="config-section">
            <h2>Ajustes de usuarios</h2>
            <p className="text-muted">
              Parámetros opcionales leídos por la app o documentación interna. Se guardan en Firestore bajo{' '}
              <code>platformSettings/main.users</code>.
            </p>
            <div className="form-group">
              <label>Email de soporte (texto libre)</label>
              <input
                type="text"
                className="input"
                value={String(form.users?.supportEmail ?? '')}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    users: { ...(f.users || {}), supportEmail: e.target.value || undefined },
                  }))
                }
              />
            </div>
            <div className="form-group">
              <label>URL centro de ayuda / FAQ</label>
              <input
                type="url"
                className="input"
                placeholder="https://…"
                value={String(form.users?.helpCenterUrl ?? '')}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    users: { ...(f.users || {}), helpCenterUrl: e.target.value || undefined },
                  }))
                }
              />
            </div>
            <div className="form-group">
              <label>Texto legal o aviso en registro (HTML o texto plano)</label>
              <textarea
                className="input"
                rows={4}
                value={String(form.users?.registrationDisclaimer ?? '')}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    users: { ...(f.users || {}), registrationDisclaimer: e.target.value || undefined },
                  }))
                }
              />
            </div>
          </div>
        )}

        {tab === 'visuales' && (
          <div className="config-section">
            <h2>Ajustes visuales</h2>
            <p className="text-muted">
              Marca, colores y tipografías para la web/app si las consumen desde configuración. Firestore:{' '}
              <code>platformSettings/main.visual</code>.
            </p>
            <div className="form-group">
              <label>Nombre de la app (marca)</label>
              <input
                type="text"
                className="input"
                value={String(form.visual?.appName ?? '')}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    visual: { ...(f.visual || {}), appName: e.target.value || undefined },
                  }))
                }
              />
            </div>
            <div className="form-group">
              <label>Tagline / subtítulo</label>
              <input
                type="text"
                className="input"
                value={String(form.visual?.tagline ?? '')}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    visual: { ...(f.visual || {}), tagline: e.target.value || undefined },
                  }))
                }
              />
            </div>
            <div className="form-group">
              <label>Color primario (hex)</label>
              <input
                type="text"
                className="input"
                placeholder="#3b82f6"
                value={String(form.visual?.primaryColor ?? '')}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    visual: { ...(f.visual || {}), primaryColor: e.target.value || undefined },
                  }))
                }
              />
            </div>
            <div className="form-group">
              <label>Color secundario (hex)</label>
              <input
                type="text"
                className="input"
                placeholder="#64748b"
                value={String(form.visual?.secondaryColor ?? '')}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    visual: { ...(f.visual || {}), secondaryColor: e.target.value || undefined },
                  }))
                }
              />
            </div>
            <div className="form-group">
              <label>Color de acento (hex)</label>
              <input
                type="text"
                className="input"
                placeholder="#22c55e"
                value={String(form.visual?.accentColor ?? '')}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    visual: { ...(f.visual || {}), accentColor: e.target.value || undefined },
                  }))
                }
              />
            </div>
            <div className="form-group">
              <label>URL del logo</label>
              <input
                type="url"
                className="input"
                placeholder="https://…"
                value={String(form.visual?.logoUrl ?? '')}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    visual: { ...(f.visual || {}), logoUrl: e.target.value || undefined },
                  }))
                }
              />
            </div>
            <div className="form-group">
              <label>URL favicon</label>
              <input
                type="url"
                className="input"
                value={String(form.visual?.faviconUrl ?? '')}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    visual: { ...(f.visual || {}), faviconUrl: e.target.value || undefined },
                  }))
                }
              />
            </div>
            <div className="form-group">
              <label>Tipografía títulos (CSS font-family)</label>
              <input
                type="text"
                className="input"
                placeholder="Cooper Black, serif"
                value={String(form.visual?.fontFamilyHeading ?? '')}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    visual: { ...(f.visual || {}), fontFamilyHeading: e.target.value || undefined },
                  }))
                }
              />
            </div>
            <div className="form-group">
              <label>Tipografía cuerpo (CSS font-family)</label>
              <input
                type="text"
                className="input"
                placeholder="system-ui, sans-serif"
                value={String(form.visual?.fontFamilyBody ?? '')}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    visual: { ...(f.visual || {}), fontFamilyBody: e.target.value || undefined },
                  }))
                }
              />
            </div>
          </div>
        )}

        {tab === 'notificaciones' && (
          <div className="config-section">
            <h2>Notificaciones y push</h2>
            <p className="text-muted">
              Metadatos o textos por defecto para FCM (la app debe leerlos si los implementás). Firestore:{' '}
              <code>platformSettings/main.notifications</code>. El envío real usa Firebase; probá desde el detalle de
              usuario.
            </p>
            <div className="form-group">
              <label>Título por defecto (admin / sistema)</label>
              <input
                type="text"
                className="input"
                value={String(form.notifications?.defaultTitle ?? '')}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    notifications: { ...(f.notifications || {}), defaultTitle: e.target.value || undefined },
                  }))
                }
              />
            </div>
            <div className="form-group">
              <label>Prefijo del cuerpo del mensaje</label>
              <input
                type="text"
                className="input"
                value={String(form.notifications?.defaultBodyPrefix ?? '')}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    notifications: { ...(f.notifications || {}), defaultBodyPrefix: e.target.value || undefined },
                  }))
                }
              />
            </div>
          </div>
        )}

        <div className="config-actions">
          <button type="button" className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </>
  );
}
