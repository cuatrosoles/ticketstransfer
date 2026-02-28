/**
 * Configuración de la plataforma - Tabs: General, Pasarelas, Usuarios, Visuales.
 */

import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Settings, CreditCard, Users, Palette } from 'lucide-react';

type MercadoPagoSettings = {
  enabled: boolean;
  accessToken: string;
  webhookSecret: string;
  sandboxMode: boolean;
  backUrlBase?: string;
};

type PlatformSettings = {
  commissionPercentage: number;
  mercadopago: MercadoPagoSettings;
  users?: Record<string, unknown>;
  visual?: Record<string, unknown>;
};

type TabId = 'general' | 'pasarelas' | 'usuarios' | 'visuales';

export function Configuracion() {
  const [tab, setTab] = useState<TabId>('general');
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<PlatformSettings>({
    commissionPercentage: 6.5,
    mercadopago: { enabled: false, accessToken: '', webhookSecret: '', sandboxMode: true },
  });

  useEffect(() => {
    api<PlatformSettings>('/api/admin/settings')
      .then((s) => {
        setSettings(s);
        setForm(s);
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
          </div>
        )}

        {tab === 'pasarelas' && (
          <div className="config-section">
            <h2>Mercado Pago</h2>
            <p className="text-muted">
              Configuración de la pasarela de pagos Mercado Pago (Checkout Pro).
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
          </div>
        )}

        {tab === 'usuarios' && (
          <div className="config-section">
            <h2>Ajustes de usuarios</h2>
            <p className="text-muted">
              Parámetros de registro, verificación y perfiles de usuario. (Próximamente)
            </p>
          </div>
        )}

        {tab === 'visuales' && (
          <div className="config-section">
            <h2>Ajustes visuales</h2>
            <p className="text-muted">
              Logo, colores, textos de la plataforma. (Próximamente)
            </p>
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
