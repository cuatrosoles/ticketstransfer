/**
 * Pantalla Crear Cuenta – Datos personales (según imagen: Nombre, Apellido, Tipo DNI, Sexo, etc.).
 * Ubicación: apps/web/src/pages/Register.tsx
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AppHeader } from '../components/AppHeader';
import { z } from 'zod';
import {
  registerSchema,
  SEXO_OPCIONES,
  TIPO_DOCUMENTO,
  PREFIJO_TELEFONO_DEFAULT,
  formatCoordinates,
} from '@tickets-transfer/shared';

type RegisterInput = z.infer<typeof registerSchema>;

export function Register() {
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [geoBusy, setGeoBusy] = useState(false);
  const { register: doRegister } = useAuth();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      country: '',
      tipoDocumento: '',
      sexo: undefined,
      phonePrefix: PREFIJO_TELEFONO_DEFAULT,
      agreeTerms: false,
    },
  });

  const onSubmit = async (data: RegisterInput) => {
    setError('');
    try {
      await doRegister({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        country: data.country || undefined,
        tipoDocumento: data.tipoDocumento || undefined,
        sexo: data.sexo,
        phone: data.phone,
        phonePrefix: data.phonePrefix,
        dateOfBirth: data.dateOfBirth || undefined,
        city: data.city,
        province: data.province,
        postalCode: data.postalCode,
        latitude: latitude ?? undefined,
        longitude: longitude ?? undefined,
        locationSource: latitude != null && longitude != null ? 'gps' : undefined,
        cbuCvu: data.cbuCvu?.replace(/\D/g, '').slice(0, 22) || undefined,
        bankAlias: data.bankAlias?.trim() || undefined,
        bankName: data.bankName?.trim() || undefined,
      });
      navigate('/onboarding/preferencias');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al crear la cuenta');
    }
  };

  return (
    <div className="bg-pattern bg-pattern-auth">
      <Link to="/" className="back-link" style={{ position: 'absolute', left: 16, top: 80, zIndex: 2 }}>
        ← Volver
      </Link>
      <AppHeader title="CREAR CUENTA" />
      <div className="screen-center auth-screen">
        <div className="glass register-box">
          <form onSubmit={handleSubmit(onSubmit)}>
            {step === 1 && (
              <>
                <div className="input-wrap">
                  <label>Email</label>
                  <input type="email" className="input-field" placeholder="tu@email.com" {...register('email')} />
                  {errors.email && <p className="form-error">{errors.email.message}</p>}
                </div>
                <div className="input-wrap">
                  <label>Contraseña</label>
                  <input type="password" className="input-field" placeholder="••••••••" {...register('password')} />
                  {errors.password && <p className="form-error">{errors.password.message}</p>}
                </div>
                <div className="input-wrap">
                  <label>Confirmar contraseña</label>
                  <input type="password" className="input-field" placeholder="••••••••" {...register('confirmPassword')} />
                  {errors.confirmPassword && <p className="form-error">{errors.confirmPassword.message}</p>}
                </div>
                <div className="checkbox-wrap input-wrap">
                  <input type="checkbox" id="agree" {...register('agreeTerms')} />
                  <label htmlFor="agree">
                    Estoy de Acuerdo. <a href="/politica-privacidad" target="_blank" rel="noopener noreferrer">Política de Privacidad y uso de datos</a>
                  </label>
                </div>
                {errors.agreeTerms && <p className="form-error">{errors.agreeTerms.message}</p>}
                <div className="register-actions">
                  <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>VOLVER</button>
                  <button type="button" className="btn-primary" onClick={() => setStep(2)}>SIGUIENTE &gt;</button>
                </div>
              </>
            )}
            {step === 2 && (
              <>
                <div className="input-wrap">
                  <label>Nombre</label>
                  <div className="input-with-icon">
                    <User size={20} className="input-icon" />
                    <input className="input-field" placeholder="Nombre" {...register('firstName')} />
                  </div>
                  {errors.firstName && <p className="form-error">{errors.firstName.message}</p>}
                </div>
                <div className="input-wrap">
                  <label>Apellido</label>
                  <div className="input-with-icon">
                    <User size={20} className="input-icon" />
                    <input className="input-field" placeholder="Apellido" {...register('lastName')} />
                  </div>
                  {errors.lastName && <p className="form-error">{errors.lastName.message}</p>}
                </div>
                <div className="input-wrap">
                  <label>Tipo de DNI:</label>
                  <div className="input-with-icon">
                    <ChevronDown size={18} className="input-icon" style={{ right: 'auto', left: 12 }} />
                    <select className="input-field" {...register('tipoDocumento')}>
                      <option value="">Seleccionar</option>
                      {TIPO_DOCUMENTO.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="input-wrap">
                  <label>Sexo (según tu documento):</label>
                  <div className="sexo-buttons">
                    {SEXO_OPCIONES.map((s) => (
                      <button
                        key={s.value}
                        type="button"
                        className={`sexo-btn ${watch('sexo') === s.value ? 'selected' : ''}`}
                        onClick={() => setValue('sexo', s.value as 'MASC' | 'FEM' | 'X')}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                  {errors.sexo && <p className="form-error">{errors.sexo.message}</p>}
                </div>
                <div className="input-wrap">
                  <label>Fecha de Nacimiento</label>
                  <input type="date" className="input-field" placeholder="dd/mm/aaaa" {...register('dateOfBirth')} />
                  {errors.dateOfBirth && <p className="form-error">{errors.dateOfBirth?.message}</p>}
                </div>
                <div className="input-wrap">
                  <label>País</label>
                  <select className="input-field" {...register('country')}>
                    <option value="">Seleccionar</option>
                    <option value="AR">Argentina (+549)</option>
                  </select>
                </div>
                <div className="input-wrap">
                  <label>Nro de Teléfono:</label>
                  <div className="input-phone">
                    <span className="phone-prefix">+549</span>
                    <input
                      type="tel"
                      className="input-field"
                      placeholder="11 1234 5678"
                      {...register('phone')}
                    />
                  </div>
                  {errors.phone && <p className="form-error">{errors.phone?.message}</p>}
                </div>
                <div className="input-wrap">
                  <label>Ciudad</label>
                  <select className="input-field" {...register('city')}>
                    <option value="">Seleccionar</option>
                  </select>
                </div>
                <div className="input-wrap">
                  <label>Provincia</label>
                  <select className="input-field" {...register('province')}>
                    <option value="">Seleccionar</option>
                  </select>
                </div>
                <div className="input-wrap">
                  <label>Cod. Postal</label>
                  <input type="text" className="input-field" placeholder="Código postal" {...register('postalCode')} />
                </div>
                <div className="input-wrap">
                  <label>CBU/CVU (22 dígitos)</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="0000000000000000000000"
                    maxLength={22}
                    {...register('cbuCvu')}
                  />
                  {errors.cbuCvu && <p className="form-error">{errors.cbuCvu.message}</p>}
                </div>
                <div className="input-wrap">
                  <label>Alias bancario</label>
                  <input type="text" className="input-field" placeholder="mi.alias.mp" {...register('bankAlias')} />
                </div>
                <div className="input-wrap">
                  <label>Banco (opcional)</label>
                  <input type="text" className="input-field" placeholder="Nombre del banco" {...register('bankName')} />
                </div>
                <p className="text-muted" style={{ fontSize: 12, marginBottom: 12 }}>
                  Indicá CBU/CVU o alias para recibir pagos como vendedor. Podés editarlos después desde tu perfil.
                </p>
                <div className="input-wrap">
                  <label>Ubicación (eventos cercanos)</label>
                  <button
                    type="button"
                    className="btn-secondary btn-sm"
                    style={{ marginBottom: 8 }}
                    disabled={geoBusy || !navigator.geolocation}
                    onClick={() => {
                      if (!navigator.geolocation) return;
                      setGeoBusy(true);
                      navigator.geolocation.getCurrentPosition(
                        (pos) => {
                          setLatitude(pos.coords.latitude);
                          setLongitude(pos.coords.longitude);
                          setGeoBusy(false);
                        },
                        () => {
                          setError('No se pudo obtener la ubicación del navegador.');
                          setGeoBusy(false);
                        },
                        { enableHighAccuracy: true, timeout: 15000 }
                      );
                    }}
                  >
                    {geoBusy ? 'Ubicando…' : 'Usar mi ubicación actual'}
                  </button>
                  {latitude != null && longitude != null ? (
                    <p className="text-muted" style={{ fontSize: 12 }}>
                      {formatCoordinates(latitude, longitude)}{' '}
                      <button
                        type="button"
                        className="btn-link"
                        onClick={() => {
                          setLatitude(null);
                          setLongitude(null);
                        }}
                      >
                        Quitar
                      </button>
                    </p>
                  ) : (
                    <p className="text-muted" style={{ fontSize: 12 }}>
                      Opcional. Permite ver eventos cercanos a tu zona en la tienda.
                    </p>
                  )}
                </div>
                {error && <p className="form-error">{error}</p>}
                <div className="register-actions">
                  <button type="button" className="btn-secondary" onClick={() => setStep(1)}>VOLVER</button>
                  <button type="submit" className="btn-primary btn-glow">SIGUIENTE &gt;</button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
