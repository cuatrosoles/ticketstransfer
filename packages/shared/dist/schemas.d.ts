/**
 * Schemas Zod para validación – Tickets Transfer
 * Ubicación: packages/shared/src/schemas.ts
 */
import { z } from 'zod';
export declare const registerSchema: z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodObject<{
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
    /** Ubicación GPS opcional al registrarse (para eventos cercanos). */
    latitude: z.ZodEffects<z.ZodOptional<z.ZodNumber>, number | undefined, unknown>;
    longitude: z.ZodEffects<z.ZodOptional<z.ZodNumber>, number | undefined, unknown>;
    locationSource: z.ZodOptional<z.ZodEnum<["gps", "manual", "geocode"]>>;
    agreeTerms: z.ZodEffects<z.ZodBoolean, boolean, boolean>;
    isAdmin: z.ZodOptional<z.ZodBoolean>;
    role: z.ZodOptional<z.ZodEnum<["user", "admin"]>>;
    /** CBU/CVU (22 dígitos) o alias bancario — al menos uno requerido para recibir pagos */
    cbuCvu: z.ZodOptional<z.ZodString>;
    bankAlias: z.ZodOptional<z.ZodString>;
    bankName: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    agreeTerms: boolean;
    latitude?: number | undefined;
    longitude?: number | undefined;
    locationSource?: "gps" | "manual" | "geocode" | undefined;
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
    cbuCvu?: string | undefined;
    bankAlias?: string | undefined;
    bankName?: string | undefined;
}, {
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    agreeTerms: boolean;
    latitude?: unknown;
    longitude?: unknown;
    locationSource?: "gps" | "manual" | "geocode" | undefined;
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
    cbuCvu?: string | undefined;
    bankAlias?: string | undefined;
    bankName?: string | undefined;
}>, {
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    agreeTerms: boolean;
    latitude?: number | undefined;
    longitude?: number | undefined;
    locationSource?: "gps" | "manual" | "geocode" | undefined;
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
    cbuCvu?: string | undefined;
    bankAlias?: string | undefined;
    bankName?: string | undefined;
}, {
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    agreeTerms: boolean;
    latitude?: unknown;
    longitude?: unknown;
    locationSource?: "gps" | "manual" | "geocode" | undefined;
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
    cbuCvu?: string | undefined;
    bankAlias?: string | undefined;
    bankName?: string | undefined;
}>, {
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    agreeTerms: boolean;
    latitude?: number | undefined;
    longitude?: number | undefined;
    locationSource?: "gps" | "manual" | "geocode" | undefined;
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
    cbuCvu?: string | undefined;
    bankAlias?: string | undefined;
    bankName?: string | undefined;
}, {
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    agreeTerms: boolean;
    latitude?: unknown;
    longitude?: unknown;
    locationSource?: "gps" | "manual" | "geocode" | undefined;
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
    cbuCvu?: string | undefined;
    bankAlias?: string | undefined;
    bankName?: string | undefined;
}>, {
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    agreeTerms: boolean;
    latitude?: number | undefined;
    longitude?: number | undefined;
    locationSource?: "gps" | "manual" | "geocode" | undefined;
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
    cbuCvu?: string | undefined;
    bankAlias?: string | undefined;
    bankName?: string | undefined;
}, {
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    agreeTerms: boolean;
    latitude?: unknown;
    longitude?: unknown;
    locationSource?: "gps" | "manual" | "geocode" | undefined;
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
    cbuCvu?: string | undefined;
    bankAlias?: string | undefined;
    bankName?: string | undefined;
}>;
/** Para API: sin confirmPassword ni agreeTerms */
export declare const registerBodySchema: z.ZodEffects<z.ZodEffects<z.ZodObject<Omit<{
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
    /** Ubicación GPS opcional al registrarse (para eventos cercanos). */
    latitude: z.ZodEffects<z.ZodOptional<z.ZodNumber>, number | undefined, unknown>;
    longitude: z.ZodEffects<z.ZodOptional<z.ZodNumber>, number | undefined, unknown>;
    locationSource: z.ZodOptional<z.ZodEnum<["gps", "manual", "geocode"]>>;
    agreeTerms: z.ZodEffects<z.ZodBoolean, boolean, boolean>;
    isAdmin: z.ZodOptional<z.ZodBoolean>;
    role: z.ZodOptional<z.ZodEnum<["user", "admin"]>>;
    /** CBU/CVU (22 dígitos) o alias bancario — al menos uno requerido para recibir pagos */
    cbuCvu: z.ZodOptional<z.ZodString>;
    bankAlias: z.ZodOptional<z.ZodString>;
    bankName: z.ZodOptional<z.ZodString>;
}, "confirmPassword" | "agreeTerms">, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    latitude?: number | undefined;
    longitude?: number | undefined;
    locationSource?: "gps" | "manual" | "geocode" | undefined;
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
    cbuCvu?: string | undefined;
    bankAlias?: string | undefined;
    bankName?: string | undefined;
}, {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    latitude?: unknown;
    longitude?: unknown;
    locationSource?: "gps" | "manual" | "geocode" | undefined;
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
    cbuCvu?: string | undefined;
    bankAlias?: string | undefined;
    bankName?: string | undefined;
}>, {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    latitude?: number | undefined;
    longitude?: number | undefined;
    locationSource?: "gps" | "manual" | "geocode" | undefined;
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
    cbuCvu?: string | undefined;
    bankAlias?: string | undefined;
    bankName?: string | undefined;
}, {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    latitude?: unknown;
    longitude?: unknown;
    locationSource?: "gps" | "manual" | "geocode" | undefined;
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
    cbuCvu?: string | undefined;
    bankAlias?: string | undefined;
    bankName?: string | undefined;
}>, {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    latitude?: number | undefined;
    longitude?: number | undefined;
    locationSource?: "gps" | "manual" | "geocode" | undefined;
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
    cbuCvu?: string | undefined;
    bankAlias?: string | undefined;
    bankName?: string | undefined;
}, {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    latitude?: unknown;
    longitude?: unknown;
    locationSource?: "gps" | "manual" | "geocode" | undefined;
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
    cbuCvu?: string | undefined;
    bankAlias?: string | undefined;
    bankName?: string | undefined;
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
/** Onboarding de gustos: tipos de eventos que le interesan al usuario */
export declare const tasteOnboardingSchema: z.ZodObject<{
    eventPreferences: z.ZodArray<z.ZodEnum<["MUSICA", "DEPORTES", "TEATRO", "STAND_UP", "FESTIVALES", "OTRO"]>, "many">;
}, "strip", z.ZodTypeAny, {
    eventPreferences: ("MUSICA" | "DEPORTES" | "TEATRO" | "FESTIVALES" | "OTRO" | "STAND_UP")[];
}, {
    eventPreferences: ("MUSICA" | "DEPORTES" | "TEATRO" | "FESTIVALES" | "OTRO" | "STAND_UP")[];
}>;
/** Actualización parcial de preferencias desde el perfil */
export declare const userPreferencesPatchSchema: z.ZodObject<{
    eventPreferences: z.ZodOptional<z.ZodArray<z.ZodEnum<["MUSICA", "DEPORTES", "TEATRO", "STAND_UP", "FESTIVALES", "OTRO"]>, "many">>;
}, "strip", z.ZodTypeAny, {
    eventPreferences?: ("MUSICA" | "DEPORTES" | "TEATRO" | "FESTIVALES" | "OTRO" | "STAND_UP")[] | undefined;
}, {
    eventPreferences?: ("MUSICA" | "DEPORTES" | "TEATRO" | "FESTIVALES" | "OTRO" | "STAND_UP")[] | undefined;
}>;
/** Registro de interacción con un listing (vista, click, favorito) */
export declare const listingInteractionSchema: z.ZodObject<{
    listingId: z.ZodString;
    type: z.ZodEnum<["VIEW", "CLICK", "FAVORITE_ADD", "FAVORITE_REMOVE"]>;
    category: z.ZodOptional<z.ZodEnum<["MUSICA", "DEPORTES", "TEATRO", "FESTIVALES", "OTRO"]>>;
}, "strip", z.ZodTypeAny, {
    type: "VIEW" | "CLICK" | "FAVORITE_ADD" | "FAVORITE_REMOVE";
    listingId: string;
    category?: "MUSICA" | "DEPORTES" | "TEATRO" | "FESTIVALES" | "OTRO" | undefined;
}, {
    type: "VIEW" | "CLICK" | "FAVORITE_ADD" | "FAVORITE_REMOVE";
    listingId: string;
    category?: "MUSICA" | "DEPORTES" | "TEATRO" | "FESTIVALES" | "OTRO" | undefined;
}>;
/** Visibilidad en el marketplace: público aparece en inicio; privado solo con ID + contraseña compartida por el vendedor */
export declare const listingVisibilitySchema: z.ZodEnum<["PUBLIC", "PRIVATE"]>;
export type ListingVisibility = z.infer<typeof listingVisibilitySchema>;
export declare const createTicketListingSchema: z.ZodObject<{
    eventName: z.ZodString;
    eventDate: z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, unknown>;
    eventAddress: z.ZodEffects<z.ZodString, string, string>;
    eventCity: z.ZodEffects<z.ZodString, string, string>;
    eventPlace: z.ZodEffects<z.ZodString, string, string>;
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
    /** Si no se envía, la API trata la publicación como legada (mismo comportamiento que antes). */
    visibility: z.ZodOptional<z.ZodEnum<["PUBLIC", "PRIVATE"]>>;
    /** Coordenadas del recinto/evento (opcional; si faltan, la API puede geocodificar dirección+ciudad). */
    eventLatitude: z.ZodEffects<z.ZodOptional<z.ZodNumber>, number | undefined, unknown>;
    eventLongitude: z.ZodEffects<z.ZodOptional<z.ZodNumber>, number | undefined, unknown>;
    eventLocationSource: z.ZodOptional<z.ZodEnum<["gps", "manual", "geocode"]>>;
}, "strip", z.ZodTypeAny, {
    ticketera: "TICKETEK" | "ALLACCESS" | "TICKET_PLUS" | "OTRA";
    eventName: string;
    eventDate: string;
    eventAddress: string;
    eventCity: string;
    eventPlace: string;
    tipoEntrada: "OTRO" | "GENERAL" | "CAMPO" | "PLATEA" | "VIP";
    price: number;
    currency: string;
    appBoletos: "OTRA" | "QUENTRO" | "ENIGMA";
    category?: "MUSICA" | "DEPORTES" | "TEATRO" | "FESTIVALES" | "OTRO" | undefined;
    sector?: string | undefined;
    row?: string | undefined;
    seat?: string | undefined;
    quantityEntries?: string | number | undefined;
    orderRef?: string | undefined;
    visibility?: "PUBLIC" | "PRIVATE" | undefined;
    eventLatitude?: number | undefined;
    eventLongitude?: number | undefined;
    eventLocationSource?: "gps" | "manual" | "geocode" | undefined;
}, {
    ticketera: "TICKETEK" | "ALLACCESS" | "TICKET_PLUS" | "OTRA";
    eventName: string;
    eventAddress: string;
    eventCity: string;
    eventPlace: string;
    tipoEntrada: "OTRO" | "GENERAL" | "CAMPO" | "PLATEA" | "VIP";
    price: number;
    appBoletos: "OTRA" | "QUENTRO" | "ENIGMA";
    category?: "" | "MUSICA" | "DEPORTES" | "TEATRO" | "FESTIVALES" | "OTRO" | undefined;
    eventDate?: unknown;
    sector?: string | undefined;
    row?: string | undefined;
    seat?: string | undefined;
    quantityEntries?: string | number | undefined;
    currency?: string | undefined;
    orderRef?: string | undefined;
    visibility?: "PUBLIC" | "PRIVATE" | undefined;
    eventLatitude?: unknown;
    eventLongitude?: unknown;
    eventLocationSource?: "gps" | "manual" | "geocode" | undefined;
}>;
/** Actualización parcial de publicación (vendedor); imágenes no se modifican por esta vía */
export declare const updateTicketListingSchema: z.ZodObject<{
    eventName: z.ZodOptional<z.ZodString>;
    eventDate: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, unknown>>;
    eventAddress: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    eventCity: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    eventPlace: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
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
    visibility: z.ZodOptional<z.ZodOptional<z.ZodEnum<["PUBLIC", "PRIVATE"]>>>;
    eventLatitude: z.ZodOptional<z.ZodEffects<z.ZodOptional<z.ZodNumber>, number | undefined, unknown>>;
    eventLongitude: z.ZodOptional<z.ZodEffects<z.ZodOptional<z.ZodNumber>, number | undefined, unknown>>;
    eventLocationSource: z.ZodOptional<z.ZodOptional<z.ZodEnum<["gps", "manual", "geocode"]>>>;
} & {
    publicationPassword: z.ZodEffects<z.ZodOptional<z.ZodNullable<z.ZodString>>, string | null | undefined, string | null | undefined>;
    ticketeraOtra: z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
    appBoletosOtra: z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
    tipoEntradaOtro: z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
}, "strip", z.ZodTypeAny, {
    ticketera?: "TICKETEK" | "ALLACCESS" | "TICKET_PLUS" | "OTRA" | undefined;
    category?: "MUSICA" | "DEPORTES" | "TEATRO" | "FESTIVALES" | "OTRO" | undefined;
    eventName?: string | undefined;
    eventDate?: string | undefined;
    eventAddress?: string | undefined;
    eventCity?: string | undefined;
    eventPlace?: string | undefined;
    sector?: string | undefined;
    row?: string | undefined;
    seat?: string | undefined;
    quantityEntries?: string | number | undefined;
    tipoEntrada?: "OTRO" | "GENERAL" | "CAMPO" | "PLATEA" | "VIP" | undefined;
    price?: number | undefined;
    currency?: string | undefined;
    appBoletos?: "OTRA" | "QUENTRO" | "ENIGMA" | undefined;
    orderRef?: string | undefined;
    visibility?: "PUBLIC" | "PRIVATE" | undefined;
    eventLatitude?: number | undefined;
    eventLongitude?: number | undefined;
    eventLocationSource?: "gps" | "manual" | "geocode" | undefined;
    publicationPassword?: string | null | undefined;
    ticketeraOtra?: string | undefined;
    appBoletosOtra?: string | undefined;
    tipoEntradaOtro?: string | undefined;
}, {
    ticketera?: "TICKETEK" | "ALLACCESS" | "TICKET_PLUS" | "OTRA" | undefined;
    category?: "" | "MUSICA" | "DEPORTES" | "TEATRO" | "FESTIVALES" | "OTRO" | undefined;
    eventName?: string | undefined;
    eventDate?: unknown;
    eventAddress?: string | undefined;
    eventCity?: string | undefined;
    eventPlace?: string | undefined;
    sector?: string | undefined;
    row?: string | undefined;
    seat?: string | undefined;
    quantityEntries?: string | number | undefined;
    tipoEntrada?: "OTRO" | "GENERAL" | "CAMPO" | "PLATEA" | "VIP" | undefined;
    price?: number | undefined;
    currency?: string | undefined;
    appBoletos?: "OTRA" | "QUENTRO" | "ENIGMA" | undefined;
    orderRef?: string | undefined;
    visibility?: "PUBLIC" | "PRIVATE" | undefined;
    eventLatitude?: unknown;
    eventLongitude?: unknown;
    eventLocationSource?: "gps" | "manual" | "geocode" | undefined;
    publicationPassword?: string | null | undefined;
    ticketeraOtra?: string | undefined;
    appBoletosOtra?: string | undefined;
    tipoEntradaOtro?: string | undefined;
}>;
export declare const createOrderSchema: z.ZodObject<{
    ticketListingId: z.ZodString;
    paymentMethod: z.ZodEnum<["mercadopago", "stripe", "bank_transfer"]>;
    /** Medio principal donde el comprador recibirá la transferencia del ticket */
    deliveryMethod: z.ZodOptional<z.ZodEnum<["usuario", "id", "email", "telefono", "otro"]>>;
    deliveryUsername: z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
    deliveryIdNumber: z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
    deliveryEmail: z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
    deliveryPhone: z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
    deliveryOther: z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
    /** Compatibilidad con clientes que envían un solo texto (p. ej. app móvil antigua con OTRO) */
    deliveryDetail: z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
}, "strip", z.ZodTypeAny, {
    ticketListingId: string;
    paymentMethod: "mercadopago" | "stripe" | "bank_transfer";
    deliveryMethod?: "email" | "usuario" | "id" | "telefono" | "otro" | undefined;
    deliveryUsername?: string | undefined;
    deliveryIdNumber?: string | undefined;
    deliveryEmail?: string | undefined;
    deliveryPhone?: string | undefined;
    deliveryOther?: string | undefined;
    deliveryDetail?: string | undefined;
}, {
    ticketListingId: string;
    paymentMethod: "mercadopago" | "stripe" | "bank_transfer";
    deliveryMethod?: "email" | "usuario" | "id" | "telefono" | "otro" | undefined;
    deliveryUsername?: string | undefined;
    deliveryIdNumber?: string | undefined;
    deliveryEmail?: string | undefined;
    deliveryPhone?: string | undefined;
    deliveryOther?: string | undefined;
    deliveryDetail?: string | undefined;
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
export { notificationPreferencesPatchSchema } from './notification-preferences.js';
export { NOTIFICATION_PREFERENCE_KEYS, NOTIFICATION_PREFERENCE_LABELS, DEFAULT_NOTIFICATION_PREFERENCES, mergeNotificationPreferences, allowsPushType, pushTypeToPreferenceKey, type NotificationPreferenceKey, type NotificationPreferences, } from './notification-preferences.js';
