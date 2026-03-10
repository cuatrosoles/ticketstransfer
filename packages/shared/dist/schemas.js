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
    username: z.string().min(2).optional(),
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
    isAdmin: z.boolean().optional(),
    role: z.enum(['user', 'admin']).optional(),
});
export const registerSchema = registerBase.refine((d) => d.password === d.confirmPassword, { message: 'Las contraseñas no coinciden', path: ['confirmPassword'] });
/** Para API: sin confirmPassword ni agreeTerms */
export const registerBodySchema = registerBase.omit({ confirmPassword: true, agreeTerms: true });
export const loginSchema = z.object({
    email: z.string().min(1, 'Email o nombre de usuario requerido'),
    password: z.string().min(1, 'Contraseña requerida'),
});
export const onboardingSchema = z.object({
    accion: z.array(z.enum(['VENTA', 'INTERCAMBIO'])).min(1, 'Elige al menos una acción'),
    ticketeras: z.array(z.string()).min(1, 'Elige al menos una ticketera'),
    appsBoletos: z.array(z.string()).min(1, 'Elige al menos una app de boletos'),
});
const ticketeraEnum = z.enum(['TICKETEK', 'ALLACCESS', 'TICKET_PLUS', 'OTRA']);
const appBoletosEnum = z.enum(['QUENTRO', 'ENIGMA', 'OTRA']);
const tipoEntradaEnum = z.enum(['GENERAL', 'CAMPO', 'PLATEA', 'VIP', 'OTRO']);
const categoriaEventoEnum = z.enum(['MUSICA', 'DEPORTES', 'TEATRO', 'FESTIVALES', 'OTRO']);
/** Normaliza fecha a YYYY-MM-DD desde DD/MM/YYYY, DD-MM-YYYY o YYYY-MM-DD */
function normalizeEventDate(val) {
    const s = String(val ?? '').trim();
    if (!s)
        return val;
    if (/^\d{4}-\d{2}-\d{2}/.test(s))
        return s.slice(0, 10);
    const match = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
    if (match) {
        const [, d, m, y] = match;
        return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }
    return val;
}
export const createTicketListingSchema = z.object({
    eventName: z.string().min(2, 'Nombre del evento requerido'),
    eventDate: z.preprocess(normalizeEventDate, z.string().regex(/^\d{4}-\d{2}-\d{2}/, 'Fecha inválida (usa AAAA-MM-DD o DD/MM/AAAA)')),
    eventPlace: z.string().optional().transform((s) => (s === '' ? undefined : s)),
    sector: z.string().optional().transform((s) => (s === '' ? undefined : s)),
    row: z.string().optional().transform((s) => (s === '' ? undefined : s)),
    seat: z.string().optional().transform((s) => (s === '' ? undefined : s)),
    quantityEntries: z.union([z.string(), z.number()]).optional(),
    tipoEntrada: tipoEntradaEnum,
    price: z.coerce.number().positive('Precio debe ser positivo'),
    currency: z.string().length(3).default('ARS'),
    ticketera: ticketeraEnum,
    appBoletos: appBoletosEnum,
    orderRef: z.string().optional().transform((s) => (s === '' ? undefined : s)),
    category: z.union([categoriaEventoEnum, z.literal('')]).optional().transform((v) => (v === '' ? undefined : v)),
});
export const createOrderSchema = z.object({
    ticketListingId: z.string().min(1, 'ID de publicación requerido'),
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
/** Opcional: regiones para pixelar (0-1). Si no se envía, la API usa regiones por defecto. */
export const pixelateRegionSchema = z.object({
    x: z.number().min(0).max(1),
    y: z.number().min(0).max(1),
    width: z.number().min(0.01).max(1),
    height: z.number().min(0.01).max(1),
});
export const pixelateRegionsSchema = z.array(pixelateRegionSchema).optional();
