/**
 * Schemas Zod para validación – Tickets Transfer
 * Ubicación: packages/shared/src/schemas.ts
 */
import { z } from 'zod';
export declare const registerSchema: z.ZodEffects<z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    confirmPassword: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    username: z.ZodOptional<z.ZodString>;
    country: z.ZodOptional<z.ZodString>;
    tipoDocumento: z.ZodOptional<z.ZodString>;
    documentNumber: z.ZodOptional<z.ZodString>;
    sexo: z.ZodOptional<z.ZodEnum<["MASC", "FEM", "X"]>>;
    phone: z.ZodOptional<z.ZodString>;
    phoneAreaCode: z.ZodOptional<z.ZodString>;
    phonePrefix: z.ZodOptional<z.ZodString>;
    dateOfBirth: z.ZodOptional<z.ZodString>;
    city: z.ZodOptional<z.ZodString>;
    province: z.ZodOptional<z.ZodString>;
    postalCode: z.ZodOptional<z.ZodString>;
    agreeTerms: z.ZodEffects<z.ZodBoolean, boolean, boolean>;
    isAdmin: z.ZodOptional<z.ZodBoolean>;
    role: z.ZodOptional<z.ZodEnum<["user", "admin"]>>;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    agreeTerms: boolean;
    username?: string | undefined;
    country?: string | undefined;
    tipoDocumento?: string | undefined;
    documentNumber?: string | undefined;
    sexo?: "FEM" | "MASC" | "X" | undefined;
    phone?: string | undefined;
    phoneAreaCode?: string | undefined;
    phonePrefix?: string | undefined;
    dateOfBirth?: string | undefined;
    city?: string | undefined;
    province?: string | undefined;
    postalCode?: string | undefined;
    isAdmin?: boolean | undefined;
    role?: "user" | "admin" | undefined;
}, {
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    agreeTerms: boolean;
    username?: string | undefined;
    country?: string | undefined;
    tipoDocumento?: string | undefined;
    documentNumber?: string | undefined;
    sexo?: "FEM" | "MASC" | "X" | undefined;
    phone?: string | undefined;
    phoneAreaCode?: string | undefined;
    phonePrefix?: string | undefined;
    dateOfBirth?: string | undefined;
    city?: string | undefined;
    province?: string | undefined;
    postalCode?: string | undefined;
    isAdmin?: boolean | undefined;
    role?: "user" | "admin" | undefined;
}>, {
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    agreeTerms: boolean;
    username?: string | undefined;
    country?: string | undefined;
    tipoDocumento?: string | undefined;
    documentNumber?: string | undefined;
    sexo?: "FEM" | "MASC" | "X" | undefined;
    phone?: string | undefined;
    phoneAreaCode?: string | undefined;
    phonePrefix?: string | undefined;
    dateOfBirth?: string | undefined;
    city?: string | undefined;
    province?: string | undefined;
    postalCode?: string | undefined;
    isAdmin?: boolean | undefined;
    role?: "user" | "admin" | undefined;
}, {
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    agreeTerms: boolean;
    username?: string | undefined;
    country?: string | undefined;
    tipoDocumento?: string | undefined;
    documentNumber?: string | undefined;
    sexo?: "FEM" | "MASC" | "X" | undefined;
    phone?: string | undefined;
    phoneAreaCode?: string | undefined;
    phonePrefix?: string | undefined;
    dateOfBirth?: string | undefined;
    city?: string | undefined;
    province?: string | undefined;
    postalCode?: string | undefined;
    isAdmin?: boolean | undefined;
    role?: "user" | "admin" | undefined;
}>;
/** Para API: sin confirmPassword ni agreeTerms */
export declare const registerBodySchema: z.ZodObject<Omit<{
    email: z.ZodString;
    password: z.ZodString;
    confirmPassword: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    username: z.ZodOptional<z.ZodString>;
    country: z.ZodOptional<z.ZodString>;
    tipoDocumento: z.ZodOptional<z.ZodString>;
    documentNumber: z.ZodOptional<z.ZodString>;
    sexo: z.ZodOptional<z.ZodEnum<["MASC", "FEM", "X"]>>;
    phone: z.ZodOptional<z.ZodString>;
    phoneAreaCode: z.ZodOptional<z.ZodString>;
    phonePrefix: z.ZodOptional<z.ZodString>;
    dateOfBirth: z.ZodOptional<z.ZodString>;
    city: z.ZodOptional<z.ZodString>;
    province: z.ZodOptional<z.ZodString>;
    postalCode: z.ZodOptional<z.ZodString>;
    agreeTerms: z.ZodEffects<z.ZodBoolean, boolean, boolean>;
    isAdmin: z.ZodOptional<z.ZodBoolean>;
    role: z.ZodOptional<z.ZodEnum<["user", "admin"]>>;
}, "confirmPassword" | "agreeTerms">, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    username?: string | undefined;
    country?: string | undefined;
    tipoDocumento?: string | undefined;
    documentNumber?: string | undefined;
    sexo?: "FEM" | "MASC" | "X" | undefined;
    phone?: string | undefined;
    phoneAreaCode?: string | undefined;
    phonePrefix?: string | undefined;
    dateOfBirth?: string | undefined;
    city?: string | undefined;
    province?: string | undefined;
    postalCode?: string | undefined;
    isAdmin?: boolean | undefined;
    role?: "user" | "admin" | undefined;
}, {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    username?: string | undefined;
    country?: string | undefined;
    tipoDocumento?: string | undefined;
    documentNumber?: string | undefined;
    sexo?: "FEM" | "MASC" | "X" | undefined;
    phone?: string | undefined;
    phoneAreaCode?: string | undefined;
    phonePrefix?: string | undefined;
    dateOfBirth?: string | undefined;
    city?: string | undefined;
    province?: string | undefined;
    postalCode?: string | undefined;
    isAdmin?: boolean | undefined;
    role?: "user" | "admin" | undefined;
}>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const onboardingSchema: z.ZodObject<{
    accion: z.ZodArray<z.ZodEnum<["VENTA", "INTERCAMBIO"]>, "many">;
    ticketeras: z.ZodArray<z.ZodString, "many">;
    appsBoletos: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    accion: ("VENTA" | "INTERCAMBIO")[];
    ticketeras: string[];
    appsBoletos: string[];
}, {
    accion: ("VENTA" | "INTERCAMBIO")[];
    ticketeras: string[];
    appsBoletos: string[];
}>;
export declare const createTicketListingSchema: z.ZodObject<{
    eventName: z.ZodString;
    eventDate: z.ZodEffects<z.ZodString, string, unknown>;
    eventPlace: z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
    sector: z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
    row: z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
    seat: z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
    quantityEntries: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
    tipoEntrada: z.ZodEnum<["GENERAL", "CAMPO", "PLATEA", "VIP", "OTRO"]>;
    price: z.ZodNumber;
    currency: z.ZodDefault<z.ZodString>;
    ticketera: z.ZodEnum<["TICKETEK", "ALLACCESS", "TICKET_PLUS", "OTRA"]>;
    appBoletos: z.ZodEnum<["QUENTRO", "ENIGMA", "OTRA"]>;
    orderRef: z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
    category: z.ZodEffects<z.ZodOptional<z.ZodUnion<[z.ZodEnum<["MUSICA", "DEPORTES", "TEATRO", "FESTIVALES", "OTRO"]>, z.ZodLiteral<"">]>>, "MUSICA" | "DEPORTES" | "TEATRO" | "FESTIVALES" | "OTRO" | undefined, "" | "MUSICA" | "DEPORTES" | "TEATRO" | "FESTIVALES" | "OTRO" | undefined>;
}, "strip", z.ZodTypeAny, {
    eventName: string;
    eventDate: string;
    tipoEntrada: "OTRO" | "GENERAL" | "CAMPO" | "PLATEA" | "VIP";
    price: number;
    currency: string;
    ticketera: "TICKETEK" | "ALLACCESS" | "TICKET_PLUS" | "OTRA";
    appBoletos: "OTRA" | "QUENTRO" | "ENIGMA";
    eventPlace?: string | undefined;
    sector?: string | undefined;
    row?: string | undefined;
    seat?: string | undefined;
    quantityEntries?: string | number | undefined;
    orderRef?: string | undefined;
    category?: "MUSICA" | "DEPORTES" | "TEATRO" | "FESTIVALES" | "OTRO" | undefined;
}, {
    eventName: string;
    tipoEntrada: "OTRO" | "GENERAL" | "CAMPO" | "PLATEA" | "VIP";
    price: number;
    ticketera: "TICKETEK" | "ALLACCESS" | "TICKET_PLUS" | "OTRA";
    appBoletos: "OTRA" | "QUENTRO" | "ENIGMA";
    eventDate?: unknown;
    eventPlace?: string | undefined;
    sector?: string | undefined;
    row?: string | undefined;
    seat?: string | undefined;
    quantityEntries?: string | number | undefined;
    currency?: string | undefined;
    orderRef?: string | undefined;
    category?: "" | "MUSICA" | "DEPORTES" | "TEATRO" | "FESTIVALES" | "OTRO" | undefined;
}>;
/** Actualización parcial de publicación (vendedor); imágenes no se modifican por esta vía */
export declare const updateTicketListingSchema: z.ZodObject<{
    eventName: z.ZodOptional<z.ZodString>;
    eventDate: z.ZodOptional<z.ZodEffects<z.ZodString, string, unknown>>;
    eventPlace: z.ZodOptional<z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>>;
    sector: z.ZodOptional<z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>>;
    row: z.ZodOptional<z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>>;
    seat: z.ZodOptional<z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>>;
    quantityEntries: z.ZodOptional<z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>>;
    tipoEntrada: z.ZodOptional<z.ZodEnum<["GENERAL", "CAMPO", "PLATEA", "VIP", "OTRO"]>>;
    price: z.ZodOptional<z.ZodNumber>;
    currency: z.ZodOptional<z.ZodDefault<z.ZodString>>;
    ticketera: z.ZodOptional<z.ZodEnum<["TICKETEK", "ALLACCESS", "TICKET_PLUS", "OTRA"]>>;
    appBoletos: z.ZodOptional<z.ZodEnum<["QUENTRO", "ENIGMA", "OTRA"]>>;
    orderRef: z.ZodOptional<z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>>;
    category: z.ZodOptional<z.ZodEffects<z.ZodOptional<z.ZodUnion<[z.ZodEnum<["MUSICA", "DEPORTES", "TEATRO", "FESTIVALES", "OTRO"]>, z.ZodLiteral<"">]>>, "MUSICA" | "DEPORTES" | "TEATRO" | "FESTIVALES" | "OTRO" | undefined, "" | "MUSICA" | "DEPORTES" | "TEATRO" | "FESTIVALES" | "OTRO" | undefined>>;
} & {
    publicationPassword: z.ZodEffects<z.ZodOptional<z.ZodNullable<z.ZodString>>, string | null | undefined, string | null | undefined>;
    ticketeraOtra: z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
    appBoletosOtra: z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
    tipoEntradaOtro: z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
}, "strip", z.ZodTypeAny, {
    eventName?: string | undefined;
    eventDate?: string | undefined;
    eventPlace?: string | undefined;
    sector?: string | undefined;
    row?: string | undefined;
    seat?: string | undefined;
    quantityEntries?: string | number | undefined;
    tipoEntrada?: "OTRO" | "GENERAL" | "CAMPO" | "PLATEA" | "VIP" | undefined;
    price?: number | undefined;
    currency?: string | undefined;
    ticketera?: "TICKETEK" | "ALLACCESS" | "TICKET_PLUS" | "OTRA" | undefined;
    appBoletos?: "OTRA" | "QUENTRO" | "ENIGMA" | undefined;
    orderRef?: string | undefined;
    category?: "MUSICA" | "DEPORTES" | "TEATRO" | "FESTIVALES" | "OTRO" | undefined;
    publicationPassword?: string | null | undefined;
    ticketeraOtra?: string | undefined;
    appBoletosOtra?: string | undefined;
    tipoEntradaOtro?: string | undefined;
}, {
    eventName?: string | undefined;
    eventDate?: unknown;
    eventPlace?: string | undefined;
    sector?: string | undefined;
    row?: string | undefined;
    seat?: string | undefined;
    quantityEntries?: string | number | undefined;
    tipoEntrada?: "OTRO" | "GENERAL" | "CAMPO" | "PLATEA" | "VIP" | undefined;
    price?: number | undefined;
    currency?: string | undefined;
    ticketera?: "TICKETEK" | "ALLACCESS" | "TICKET_PLUS" | "OTRA" | undefined;
    appBoletos?: "OTRA" | "QUENTRO" | "ENIGMA" | undefined;
    orderRef?: string | undefined;
    category?: "" | "MUSICA" | "DEPORTES" | "TEATRO" | "FESTIVALES" | "OTRO" | undefined;
    publicationPassword?: string | null | undefined;
    ticketeraOtra?: string | undefined;
    appBoletosOtra?: string | undefined;
    tipoEntradaOtro?: string | undefined;
}>;
export declare const createOrderSchema: z.ZodObject<{
    ticketListingId: z.ZodString;
    paymentMethod: z.ZodEnum<["mercadopago", "stripe"]>;
}, "strip", z.ZodTypeAny, {
    ticketListingId: string;
    paymentMethod: "mercadopago" | "stripe";
}, {
    ticketListingId: string;
    paymentMethod: "mercadopago" | "stripe";
}>;
export declare const confirmReceivedSchema: z.ZodObject<{
    orderId: z.ZodString;
    received: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    received: boolean;
    orderId: string;
}, {
    received: boolean;
    orderId: string;
}>;
export declare const openDisputeSchema: z.ZodObject<{
    orderId: z.ZodString;
    reason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    orderId: string;
    reason: string;
}, {
    orderId: string;
    reason: string;
}>;
/** Opcional: regiones para pixelar (0-1). Si no se envía, la API usa regiones por defecto. */
export declare const pixelateRegionSchema: z.ZodObject<{
    x: z.ZodNumber;
    y: z.ZodNumber;
    width: z.ZodNumber;
    height: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    y: number;
    x: number;
    width: number;
    height: number;
}, {
    y: number;
    x: number;
    width: number;
    height: number;
}>;
export declare const pixelateRegionsSchema: z.ZodOptional<z.ZodArray<z.ZodObject<{
    x: z.ZodNumber;
    y: z.ZodNumber;
    width: z.ZodNumber;
    height: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    y: number;
    x: number;
    width: number;
    height: number;
}, {
    y: number;
    x: number;
    width: number;
    height: number;
}>, "many">>;
