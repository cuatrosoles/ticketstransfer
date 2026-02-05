/**
 * Schemas Zod para validación – Tickets Transfer
 * Ubicación: packages/shared/src/schemas.ts
 */
import { z } from 'zod';
const registerBase = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(8, 'Mínimo 8 caracteres').regex(/[A-Z]/, 'Al menos una mayúscula').regex(/[0-9]/, 'Al menos un número'),
    confirmPassword: z.string(),
    firstName: z.string().min(1, 'Nombre requerido'),
    lastName: z.string().min(1, 'Apellido requerido'),
    country: z.string().optional(),
    tipoDocumento: z.string().optional(),
    sexo: z.enum(['MASC', 'FEM', 'X']).optional(),
    phone: z.string().optional(),
    phonePrefix: z.string().optional(),
    dateOfBirth: z.string().optional(),
    city: z.string().optional(),
    province: z.string().optional(),
    postalCode: z.string().optional(),
    agreeTerms: z.boolean().refine((v) => v === true, 'Debes aceptar la política de privacidad'),
});
export const registerSchema = registerBase.refine((d) => d.password === d.confirmPassword, { message: 'Las contraseñas no coinciden', path: ['confirmPassword'] });
/** Para API: sin confirmPassword ni agreeTerms */
export const registerBodySchema = registerBase.omit({ confirmPassword: true, agreeTerms: true });
export const loginSchema = z.object({
    email: z.string().min(1, 'Email o usuario requerido'),
    password: z.string().min(1, 'Contraseña requerida'),
});
export const onboardingSchema = z.object({
    accion: z.array(z.enum(['VENTA', 'INTERCAMBIO'])).min(1, 'Elige al menos una acción'),
    ticketeras: z.array(z.string()).min(1, 'Elige al menos una ticketera'),
    appsBoletos: z.array(z.string()).min(1, 'Elige al menos una app de boletos'),
});
const ticketeraEnum = z.enum(['TICKETEK', 'ALLACCESS', 'TICKETERA', 'TICKET_PLUS', 'OTRA']);
const appBoletosEnum = z.enum(['QUENTRO', 'ENIGMA', 'TICKET360', 'TICKETMAKER', 'OTRA']);
const tipoEntradaEnum = z.enum(['GENERAL', 'CAMPO', 'PLATEA', 'VIP', 'OTRO']);
const categoriaEventoEnum = z.enum(['MUSICA', 'DEPORTES', 'TEATRO', 'FESTIVALES', 'OTRO']);
export const createTicketListingSchema = z.object({
    eventName: z.string().min(2, 'Nombre del evento requerido'),
    eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}/),
    eventPlace: z.string().optional(),
    sector: z.string().optional(),
    row: z.string().optional(),
    seat: z.string().optional(),
    tipoEntrada: tipoEntradaEnum,
    price: z.number().positive('Precio debe ser positivo'),
    currency: z.string().length(3).default('ARS'),
    ticketera: ticketeraEnum,
    appBoletos: appBoletosEnum,
    orderRef: z.string().optional(),
    category: categoriaEventoEnum.optional(),
});
export const createOrderSchema = z.object({
    ticketListingId: z.string().uuid(),
    paymentMethod: z.enum(['mercadopago', 'stripe']),
});
export const confirmReceivedSchema = z.object({
    orderId: z.string().uuid(),
    received: z.boolean(),
});
export const openDisputeSchema = z.object({
    orderId: z.string().uuid(),
    reason: z.string().min(10, 'Describe el motivo de la disputa'),
});
