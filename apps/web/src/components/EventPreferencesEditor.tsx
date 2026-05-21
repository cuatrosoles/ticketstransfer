/**
 * Editor de preferencias de eventos – web
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PREFERENCIAS_EVENTO, labelForPreferencia } from '@tickets-transfer/shared';
import { updateUserPreferences, type UserPreferences } from '../lib/api';

type Props = {
  preferences: UserPreferences;
  onUpdated: (prefs: UserPreferences) => void;
};

export function EventPreferencesEditor({ preferences, onUpdated }: Props) {
  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState<string[]>(preferences.eventPreferences);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const toggle = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const save = async () => {
    if (selected.length === 0) {
      setError('Elegí al menos un tipo de evento');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const updated = await updateUserPreferences(selected);
      onUpdated(updated);
      setEditing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  if (!editing) {
    return (
      <div className="perfil-prefs-block">
        <div className="perfil-prefs-head">
          <h3 className="perfil-prefs-title">Eventos que te gustan</h3>
          <button type="button" className="perfil-prefs-edit" onClick={() => { setSelected(preferences.eventPreferences); setEditing(true); }}>
            Editar
          </button>
        </div>
        {preferences.eventPreferences.length === 0 ? (
          <p className="text-muted">
            Aún no configuraste tus gustos.{' '}
            <Link to="/onboarding/preferencias">Completar onboarding</Link>
          </p>
        ) : (
          <div className="perfil-prefs-tags">
            {preferences.eventPreferences.map((id) => (
              <span key={id} className="perfil-prefs-tag">
                {labelForPreferencia(id)}
              </span>
            ))}
          </div>
        )}
        {preferences.topCategories.length > 0 ? (
          <p className="text-muted" style={{ fontSize: 13, marginTop: 8 }}>
            También aprendemos de lo que ves: {preferences.topCategories.map((t) => t.label).join(', ')}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="perfil-prefs-block">
      <h3 className="perfil-prefs-title">Editar gustos</h3>
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
      <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
        <button type="button" className="btn-primary" disabled={saving} onClick={save}>
          {saving ? 'Guardando…' : 'Guardar'}
        </button>
        <button type="button" className="btn-secondary" disabled={saving} onClick={() => setEditing(false)}>
          Cancelar
        </button>
      </div>
    </div>
  );
}
