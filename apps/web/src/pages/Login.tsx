/**
 * Pantalla de inicio de sesión (según imagen: Email, Contraseña, redes, Registrar aquí).
 * Ubicación: apps/web/src/pages/Login.tsx
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AppHeader } from '../components/AppHeader';
import { SocialIcons } from '../components/SocialIcons';

const loginSchema = z.object({
  email: z.string().min(1, 'Email o usuario requerido'),
  password: z.string().min(1, 'Contraseña requerida'),
});
type LoginInput = z.infer<typeof loginSchema>;

export function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setError('');
    try {
      await login(data.email, data.password);
      navigate('/home');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al iniciar sesión');
    }
  };

  return (
    <div className="bg-pattern bg-pattern-auth">
      <AppHeader title="INICIO" />
      <div className="screen-center auth-screen">
        <div className="glass login-box">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="input-wrap">
              <label>Email o Usuario:</label>
              <div className="input-with-icon">
                <Mail size={20} className="input-icon" />
                <input
                  type="text"
                  className="input-field"
                  placeholder="Email o Usuario"
                  {...register('email')}
                />
              </div>
              {errors.email && <p className="form-error">{errors.email.message}</p>}
            </div>
            <div className="input-wrap">
              <label>Contraseña:</label>
              <div className="input-with-icon">
                <Lock size={20} className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input-field"
                  placeholder="Contraseña"
                  {...register('password')}
                />
                <button
                  type="button"
                  className="input-icon-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && <p className="form-error">{errors.password.message}</p>}
            </div>
            <div className="text-center mb-2">
              <Link to="/forgot-password" className="link-forgot">¿Olvidaste tu contraseña?</Link>
            </div>
            {error && <p className="form-error">{error}</p>}
            <button type="submit" className="btn-primary btn-glow">
              Ingresar
            </button>
          </form>
          <p className="login-social-title">Seguinos en nuestras redes</p>
          <SocialIcons />
          <p className="login-register-text">
            ¿Aún no tienes una cuenta? <Link to="/register">Registrar aquí</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
