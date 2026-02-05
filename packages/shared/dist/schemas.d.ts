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
    country: z.ZodOptional<z.ZodString>;
    tipoDocumento: z.ZodOptional<z.ZodString>;
    sexo: z.ZodOptional<z.ZodEnum<["MASC", "FEM", "X"]>>;
    phone: z.ZodOptional<z.ZodString>;
    phonePrefix: z.ZodOptional<z.ZodString>;
    dateOfBirth: z.ZodOptional<z.ZodString>;
    city: z.ZodOptional<z.ZodString>;
    province: z.ZodOptional<z.ZodString>;
    postalCode: z.ZodOptional<z.ZodString>;
    agreeTerms: z.ZodEffects<z.ZodBoolean, boolean, boolean>;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    agreeTerms: boolean;
    country?: string | undefined;
    tipoDocumento?: string | undefined;
    sexo?: "FEM" | "MASC" | "X" | undefined;
    phone?: string | undefined;
    phonePrefix?: string | undefined;
    dateOfBirth?: string | undefined;
    city?: string | undefined;
    province?: string | undefined;
    postalCode?: string | undefined;
}, {
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    agreeTerms: boolean;
    country?: string | undefined;
    tipoDocumento?: string | undefined;
    sexo?: "FEM" | "MASC" | "X" | undefined;
    phone?: string | undefined;
    phonePrefix?: string | undefined;
    dateOfBirth?: string | undefined;
    city?: string | undefined;
    province?: string | undefined;
    postalCode?: string | undefined;
}>, {
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    agreeTerms: boolean;
    country?: string | undefined;
    tipoDocumento?: string | undefined;
    sexo?: "FEM" | "MASC" | "X" | undefined;
    phone?: string | undefined;
    phonePrefix?: string | undefined;
    dateOfBirth?: string | undefined;
    city?: string | undefined;
    province?: string | undefined;
    postalCode?: string | undefined;
}, {
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    agreeTerms: boolean;
    country?: string | undefined;
    tipoDocumento?: string | undefined;
    sexo?: "FEM" | "MASC" | "X" | undefined;
    phone?: string | undefined;
    phonePrefix?: string | undefined;
    dateOfBirth?: string | undefined;
    city?: string | undefined;
    province?: string | undefined;
    postalCode?: string | undefined;
}>;
/** Para API: sin confirmPassword ni agreeTerms */
export declare const registerBodySchema: z.ZodObject<Omit<{
    email: z.ZodString;
    password: z.ZodString;
    confirmPassword: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    country: z.ZodOptional<z.ZodString>;
    tipoDocumento: z.ZodOptional<z.ZodString>;
    sexo: z.ZodOptional<z.ZodEnum<["MASC", "FEM", "X"]>>;
    phone: z.ZodOptional<z.ZodString>;
    phonePrefix: z.ZodOptional<z.ZodString>;
    dateOfBirth: z.ZodOptional<z.ZodString>;
    city: z.ZodOptional<z.ZodString>;
    province: z.ZodOptional<z.ZodString>;
    postalCode: z.ZodOptional<z.ZodString>;
    agreeTerms: z.ZodEffects<z.ZodBoolean, boolean, boolean>;
}, "confirmPassword" | "agreeTerms">, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    country?: string | undefined;
    tipoDocumento?: string | undefined;
    sexo?: "FEM" | "MASC" | "X" | undefined;
    phone?: string | undefined;
    phonePrefix?: string | undefined;
    dateOfBirth?: string | undefined;
    city?: string | undefined;
    province?: string | undefined;
    postalCode?: string | undefined;
}, {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    country?: string | undefined;
    tipoDocumento?: string | undefined;
    sexo?: "FEM" | "MASC" | "X" | undefined;
    phone?: string | undefined;
    phonePrefix?: string | undefined;
    dateOfBirth?: string | undefined;
    city?: string | undefined;
    province?: string | undefined;
    postalCode?: string | undefined;
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
    eventDate: z.ZodString;
    eventPlace: z.ZodOptional<z.ZodString>;
    sector: z.ZodOptional<z.ZodString>;
    row: z.ZodOptional<z.ZodString>;
    seat: z.ZodOptional<z.ZodString>;
    tipoEntrada: z.ZodEnum<["GENERAL", "CAMPO", "PLATEA", "VIP", "OTRO"]>;
    price: z.ZodNumber;
    currency: z.ZodDefault<z.ZodString>;
    ticketera: z.ZodEnum<["TICKETEK", "ALLACCESS", "TICKETERA", "TICKET_PLUS", "OTRA"]>;
    appBoletos: z.ZodEnum<["QUENTRO", "ENIGMA", "TICKET360", "TICKETMAKER", "OTRA"]>;
    orderRef: z.ZodOptional<z.ZodString>;
    category: z.ZodOptional<z.ZodEnum<["MUSICA", "DEPORTES", "TEATRO", "FESTIVALES", "OTRO"]>>;
}, "strip", z.ZodTypeAny, {
    eventName: string;
    eventDate: string;
    tipoEntrada: "OTRO" | "GENERAL" | "CAMPO" | "PLATEA" | "VIP";
    price: number;
    currency: string;
    ticketera: "TICKETEK" | "ALLACCESS" | "TICKETERA" | "TICKET_PLUS" | "OTRA";
    appBoletos: "OTRA" | "QUENTRO" | "ENIGMA" | "TICKET360" | "TICKETMAKER";
    eventPlace?: string | undefined;
    sector?: string | undefined;
    row?: string | undefined;
    seat?: string | undefined;
    orderRef?: string | undefined;
    category?: "MUSICA" | "DEPORTES" | "TEATRO" | "FESTIVALES" | "OTRO" | undefined;
}, {
    eventName: string;
    eventDate: string;
    tipoEntrada: "OTRO" | "GENERAL" | "CAMPO" | "PLATEA" | "VIP";
    price: number;
    ticketera: "TICKETEK" | "ALLACCESS" | "TICKETERA" | "TICKET_PLUS" | "OTRA";
    appBoletos: "OTRA" | "QUENTRO" | "ENIGMA" | "TICKET360" | "TICKETMAKER";
    eventPlace?: string | undefined;
    sector?: string | undefined;
    row?: string | undefined;
    seat?: string | undefined;
    currency?: string | undefined;
    orderRef?: string | undefined;
    category?: "MUSICA" | "DEPORTES" | "TEATRO" | "FESTIVALES" | "OTRO" | undefined;
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
