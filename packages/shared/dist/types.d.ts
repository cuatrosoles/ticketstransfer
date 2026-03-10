/**
 * Tipos compartidos – Tickets Transfer
 * Ubicación: packages/shared/src/types.ts
 */
export type AccionFlujo = (typeof import('./constants.js').ACCION_FLUJO)[number];
export type TicketeraId = (typeof import('./constants.js').TICKETERAS_IDS)[number];
export type AppBoletosId = (typeof import('./constants.js').APPS_BOLETOS_IDS)[number];
export type Sexo = 'MASC' | 'FEM' | 'X';
export type KycStatus = (typeof import('./constants.js').KYC_STATUS)[number];
export type OrderStatus = (typeof import('./constants.js').ORDER_STATUS)[number];
export type DisputeStatus = (typeof import('./constants.js').DISPUTE_STATUS)[number];
export interface UserPublic {
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    reputationScore?: number | null;
    role: string;
}
export interface OnboardingPayload {
    accion: AccionFlujo[];
    ticketeras: string[];
    appsBoletos: string[];
}
/** Región normalizada (0-1) para pixelar en imágenes de tickets. Fase 2: enviada por el cliente. */
export interface PixelateRegion {
    x: number;
    y: number;
    width: number;
    height: number;
}
