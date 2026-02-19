/**
 * Constantes y esquema de registro – Duplicados locales para evitar dependencia de @tickets-transfer/shared.
 * Metro/React Native puede tener problemas resolviendo paquetes workspace.
 */

import { z } from 'zod';

export const SEXO_OPCIONES = [
  { value: 'FEM', label: 'Femenino' },
  { value: 'MASC', label: 'Masculino' },
  { value: 'X', label: 'X' },
] as const;

export const TIPO_DOCUMENTO = ['DNI', 'LC', 'LE', 'PASAPORTE'] as const;
export const PREFIJO_TELEFONO_DEFAULT = '+549';

const registerBase = z.object({
  email: z.string().email('Email inválido'),
  repeatEmail: z.string(),
  password: z.string().min(8, 'Mínimo 8 caracteres').regex(/[A-Z]/, 'Al menos una mayúscula').regex(/[0-9]/, 'Al menos un número'),
  confirmPassword: z.string(),
  firstName: z.string().min(1, 'Nombre requerido'),
  lastName: z.string().min(1, 'Apellido requerido'),
  username: z.string().min(2, 'Nombre de usuario requerido (ej: Valentin02)'),
  country: z.string().optional(),
  tipoDocumento: z.string().optional(),
  documentNumber: z.string().optional(),
  sexo: z.enum(['MASC', 'FEM', 'X']).optional(),
  phone: z.string().optional(),
  phoneAreaCode: z.string().optional(),
  phonePrefix: z.string().optional(),
  dateOfBirth: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  postalCode: z.string().optional(),
  agreeTerms: z.boolean().refine((v) => v === true, 'Debes aceptar la política de privacidad'),
});

export const registerSchema = registerBase
  .refine((d) => d.email === d.repeatEmail, { message: 'Los emails no coinciden', path: ['repeatEmail'] })
  .refine((d) => d.password === d.confirmPassword, { message: 'Las contraseñas no coinciden', path: ['confirmPassword'] });
