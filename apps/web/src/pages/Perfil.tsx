/**
 * Página Mi perfil: datos del usuario, vista y edición.
 * Ubicación: apps/web/src/pages/Perfil.tsx
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getProfile, updateProfile, type Profile, type ProfileUpdate } from '../lib/api';
import { PROVINCIAS_ARGENTINA, CIUDADES_POR_PROVINCIA } from '../data/provinciasArgentina';
import { User, Mail, Phone, MapPin, Shield, Pencil, X, Check, CreditCard } from 'lucide-react';

function formatDate(value: string | null): string {
  if (!value) return '—';
  try {
    const d = new Date(value);
    return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch {
    return value;
  }
}

function KycBadge({ status }: { status: string }) {
  const labels: Record<string, string> = {
    PENDIENTE: 'Pendiente',
    EN_REVISION: 'En revisión',
    APROBADO: 'Verificado',
    RECHAZADO: 'Rechazado',
  };
  const label = labels[status] ?? status;
  const className =
    status === 'APROBADO' ? 'profile-kyc-badge profile-kyc-ok' :
    status === 'RECHAZADO' ? 'profile-kyc-badge profile-kyc-fail' :
    'profile-kyc-badge profile-kyc-pending';
  return <span className={className}>{label}</span>;
}

export function Perfil() {
  const { fetchUser } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState<ProfileUpdate>({
    firstName: '',
    lastName: '',
    phone: '',
    city: '',
    province: '',
    postalCode: '',
    cbuCvu: '',
    bankName: '',
  });

  const loadProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getProfile();
      setProfile(data);
      setForm({
        firstName: data.firstName ?? '',
        lastName: data.lastName ?? '',
        phone: data.phone ?? '',
        city: data.city ?? '',
        province: data.province ?? '',
        postalCode: data.postalCode ?? '',
        cbuCvu: data.cbuCvu ?? '',
        bankName: data.bankName ?? '',
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar el perfil');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await updateProfile({
        firstName: form.firstName?.trim() || undefined,
        lastName: form.lastName?.trim() || undefined,
        phone: form.phone?.trim() || undefined,
        city: form.city?.trim() || undefined,
        province: form.province || undefined,
        postalCode: form.postalCode?.trim() || undefined,
        cbuCvu: form.cbuCvu?.replace(/\D/g, '').slice(0, 22) || undefined,
        bankName: form.bankName?.trim() || undefined,
      });
      await loadProfile();
      await fetchUser();
      setEditing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setForm({
        firstName: profile.firstName ?? '',
        lastName: profile.lastName ?? '',
        phone: profile.phone ?? '',
        city: profile.city ?? '',
        province: profile.province ?? '',
        postalCode: profile.postalCode ?? '',
        cbuCvu: profile.cbuCvu ?? '',
        bankName: profile.bankName ?? '',
      });
    }
    setEditing(false);
    setError('');
  };

  const cities = form.province ? (CIUDADES_POR_PROVINCIA[form.province] ?? []) : [];

  if (loading) {
    return (
      <div className="page-content page-content-perfil">
        <div className="screen-center">
          <div className="loader" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="page-content page-content-perfil">
        <div className="perfil-card glass">
          {error && <p className="form-error">{error}</p>}
          <p className="text-muted">No se pudo cargar el perfil.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content page-content-perfil">
      <div className="perfil-card glass">
        <div className="perfil-header">
          <h2 className="perfil-title">Información personal</h2>
          {!editing ? (
            <button
              type="button"
              className="perfil-btn-edit"
              onClick={() => setEditing(true)}
              aria-label="Editar perfil"
            >
              <Pencil size={20} />
              Editar
            </button>
          ) : null}
        </div>

        {error && <p className="form-error">{error}</p>}

        {!editing ? (
          <div className="perfil-view">
            <div className="perfil-field">
              <Mail size={18} className="perfil-field-icon" />
              <div>
                <span className="perfil-field-label">Email</span>
                <span className="perfil-field-value">{profile.email}</span>
              </div>
            </div>
            <div className="perfil-field">
              <User size={18} className="perfil-field-icon" />
              <div>
                <span className="perfil-field-label">Nombre</span>
                <span className="perfil-field-value">{profile.firstName || '—'}</span>
              </div>
            </div>
            <div className="perfil-field">
              <User size={18} className="perfil-field-icon" />
              <div>
                <span className="perfil-field-label">Apellido</span>
                <span className="perfil-field-value">{profile.lastName || '—'}</span>
              </div>
            </div>
            <div className="perfil-field">
              <Phone size={18} className="perfil-field-icon" />
              <div>
                <span className="perfil-field-label">Teléfono</span>
                <span className="perfil-field-value">{profile.phone || '—'}</span>
              </div>
            </div>
            <div className="perfil-field">
              <MapPin size={18} className="perfil-field-icon" />
              <div>
                <span className="perfil-field-label">Ciudad</span>
                <span className="perfil-field-value">{profile.city || '—'}</span>
              </div>
            </div>
            <div className="perfil-field">
              <MapPin size={18} className="perfil-field-icon" />
              <div>
                <span className="perfil-field-label">Provincia</span>
                <span className="perfil-field-value">
                  {profile.province ? (PROVINCIAS_ARGENTINA.find(p => p.id === profile!.province)?.nombre ?? profile.province) : '—'}
                </span>
              </div>
            </div>
            <div className="perfil-field">
              <MapPin size={18} className="perfil-field-icon" />
              <div>
                <span className="perfil-field-label">Código postal</span>
                <span className="perfil-field-value">{profile.postalCode || '—'}</span>
              </div>
            </div>
            <div className="perfil-field">
              <CreditCard size={18} className="perfil-field-icon" />
              <div>
                <span className="perfil-field-label">CBU/CVU (para recibir pagos)</span>
                <span className="perfil-field-value">{profile.cbuCvu ? `****${profile.cbuCvu.slice(-4)}` : '—'}</span>
              </div>
            </div>
            {profile.dateOfBirth ? (
              <div className="perfil-field">
                <User size={18} className="perfil-field-icon" />
                <div>
                  <span className="perfil-field-label">Fecha de nacimiento</span>
                  <span className="perfil-field-value">{formatDate(profile.dateOfBirth)}</span>
                </div>
              </div>
            ) : null}
            <div className="perfil-kyc-row">
              <Shield size={18} className="perfil-field-icon" />
              <div>
                <span className="perfil-field-label">Verificación KYC</span>
                <KycBadge status={profile.kyc?.status ?? 'PENDIENTE'} />
                {profile.kyc?.rejectionReason ? (
                  <p className="perfil-kyc-reason">{profile.kyc.rejectionReason}</p>
                ) : null}
              </div>
            </div>
            {profile.reputationScore != null ? (
              <div className="perfil-field">
                <div>
                  <span className="perfil-field-label">Reputación</span>
                  <span className="perfil-field-value">{profile.reputationScore} pts</span>
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <form
            className="perfil-form"
            onSubmit={(e) => { e.preventDefault(); handleSave(); }}
          >
            <div className="input-wrap">
              <label>Email</label>
              <input
                type="email"
                className="input-field"
                value={profile.email}
                disabled
                readOnly
              />
              <p className="form-hint">El email no se puede modificar desde aquí.</p>
            </div>
            <div className="input-wrap">
              <label>Nombre</label>
              <input
                type="text"
                className="input-field"
                placeholder="Nombre"
                value={form.firstName}
                onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
              />
            </div>
            <div className="input-wrap">
              <label>Apellido</label>
              <input
                type="text"
                className="input-field"
                placeholder="Apellido"
                value={form.lastName}
                onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
              />
            </div>
            <div className="input-wrap">
              <label>Teléfono</label>
              <input
                type="tel"
                className="input-field"
                placeholder="11 1234 5678"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              />
            </div>
            <div className="input-wrap">
              <label>Provincia</label>
              <select
                className="input-field"
                value={form.province}
                onChange={(e) => setForm((f) => ({ ...f, province: e.target.value, city: '' }))}
              >
                <option value="">Seleccionar provincia</option>
                {PROVINCIAS_ARGENTINA.map((p) => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))}
              </select>
            </div>
            <div className="input-wrap">
              <label>Ciudad</label>
              <select
                className="input-field"
                value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                disabled={!form.province}
              >
                <option value="">{form.province ? 'Seleccionar ciudad' : 'Primero elegí una provincia'}</option>
                {cities.map((ciudad) => (
                  <option key={ciudad} value={ciudad}>{ciudad}</option>
                ))}
              </select>
            </div>
            <div className="input-wrap">
              <label>Código postal</label>
              <input
                type="text"
                className="input-field"
                placeholder="Código postal"
                value={form.postalCode}
                onChange={(e) => setForm((f) => ({ ...f, postalCode: e.target.value }))}
              />
            </div>
            <div className="input-wrap">
              <label>CBU/CVU (22 dígitos, para recibir pagos de ventas)</label>
              <input
                type="text"
                className="input-field"
                placeholder="0000000000000000000000"
                value={form.cbuCvu}
                maxLength={22}
                onChange={(e) => setForm((f) => ({ ...f, cbuCvu: e.target.value.replace(/\D/g, '').slice(0, 22) }))}
              />
              <p className="form-hint">Indispensable para recibir el dinero de tus ventas. Solo números.</p>
            </div>
            <div className="input-wrap">
              <label>Nombre del banco (opcional)</label>
              <input
                type="text"
                className="input-field"
                placeholder="Ej: Banco Nación"
                value={form.bankName}
                onChange={(e) => setForm((f) => ({ ...f, bankName: e.target.value }))}
              />
            </div>
            <div className="perfil-form-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={handleCancel}
                disabled={saving}
              >
                <X size={18} />
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-primary btn-glow"
                disabled={saving}
              >
                <Check size={18} />
                {saving ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
