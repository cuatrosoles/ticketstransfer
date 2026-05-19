/**
 * Schemas Zod para validación – Tickets Transfer
 * Ubicación: packages/shared/src/schemas.ts
 */
import { z } from 'zod';
import { parseDatetimeLocalValue } from './event-datetime.js';
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
/** Visibilidad en el marketplace: público aparece en inicio; privado solo con ID + contraseña compartida por el vendedor */
export const listingVisibilitySchema = z.enum(['PUBLIC', 'PRIVATE']);
/** Normaliza a ISO (fecha y hora) desde datetime-local, ISO, DD/MM/YYYY, etc. */
function normalizeEventDate(val) {
    const s = String(val ?? '').trim();
    if (!s)
        return val;
    const parsed = parseDatetimeLocalValue(s);
    if (parsed)
        return parsed.toISOString();
    return val;
}
const eventDateSchema = z
    .string()
    .min(1, 'Fecha del evento requerida')
    .refine((s) => {
    const d = parseDatetimeLocalValue(s) ?? new Date(s);
    return !Number.isNaN(d.getTime());
}, 'Fecha u hora inválida');
export const createTicketListingSchema = z.object({
    eventName: z.string().min(2, 'Nombre del evento requerido'),
    eventDate: z.preprocess(normalizeEventDate, eventDateSchema),
    eventAddress: z.string().min(2, 'Dirección requerida').transform((s) => s.trim()),
    eventCity: z.string().min(2, 'Ciudad requerida').transform((s) => s.trim()),
    eventPlace: z
        .string()
        .min(2, 'Nombre del recinto requerido (como figura en la ticketera)')
        .transform((s) => s.trim()),
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
    /** Si no se envía, la API trata la publicación como legada (mismo comportamiento que antes). */
    visibility: listingVisibilitySchema.optional(),
});
/** Actualización parcial de publicación (vendedor); imágenes no se modifican por esta vía */
export const updateTicketListingSchema = createTicketListingSchema.partial().extend({
    publicationPassword: z
        .string()
        .nullable()
        .optional()
        .transform((s) => (s === '' ? null : s)),
    ticketeraOtra: z.string().optional().transform((s) => (s === '' ? undefined : s)),
    appBoletosOtra: z.string().optional().transform((s) => (s === '' ? undefined : s)),
    tipoEntradaOtro: z.string().optional().transform((s) => (s === '' ? undefined : s)),
});
export const createOrderSchema = z
    .object({
    ticketListingId: z.string().min(1, 'ID de publicación requerido'),
    paymentMethod: z.enum(['mercadopago', 'stripe']),
    /** Medio principal donde el comprador recibirá la transferencia del ticket */
    deliveryMethod: z.enum(['usuario', 'id', 'email', 'telefono', 'otro']).optional(),
    deliveryUsername: z
        .string()
        .max(400)
        .optional()
        .transform((s) => (s != null && String(s).trim() ? String(s).trim() : undefined)),
    deliveryIdNumber: z
        .string()
        .max(200)
        .optional()
        .transform((s) => (s != null && String(s).trim() ? String(s).trim() : undefined)),
    deliveryEmail: z
        .string()
        .max(320)
        .optional()
        .transform((s) => (s != null && String(s).trim() ? String(s).trim() : undefined)),
    deliveryPhone: z
        .string()
        .max(40)
        .optional()
        .transform((s) => (s != null && String(s).trim() ? String(s).trim() : undefined)),
    deliveryOther: z
        .string()
        .max(500)
        .optional()
        .transform((s) => (s != null && String(s).trim() ? String(s).trim() : undefined)),
    /** Compatibilidad con clientes que envían un solo texto (p. ej. app móvil antigua con OTRO) */
    deliveryDetail: z
        .string()
        .max(500)
        .optional()
        .transform((s) => (s != null && String(s).trim() ? String(s).trim() : undefined)),
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
