/**
 * Preferencias de usuario y motor de recomendación – Tickets Transfer
 */
import { CATEGORIAS_EVENTOS } from './constants.js';
/** Preferencias explícitas (onboarding / perfil) con etiquetas amigables */
export declare const PREFERENCIAS_EVENTO: readonly [{
    readonly id: "MUSICA";
    readonly label: "Recitales / Música";
    readonly listingCategories: readonly ["MUSICA"];
}, {
    readonly id: "DEPORTES";
    readonly label: "Deportes";
    readonly listingCategories: readonly ["DEPORTES"];
}, {
    readonly id: "TEATRO";
    readonly label: "Teatro";
    readonly listingCategories: readonly ["TEATRO"];
}, {
    readonly id: "STAND_UP";
    readonly label: "Stand-up";
    readonly listingCategories: readonly ["TEATRO", "OTRO"];
}, {
    readonly id: "FESTIVALES";
    readonly label: "Festivales";
    readonly listingCategories: readonly ["FESTIVALES"];
}, {
    readonly id: "OTRO";
    readonly label: "Otros";
    readonly listingCategories: readonly ["OTRO"];
}];
export declare const PREFERENCIAS_EVENTO_IDS: ("MUSICA" | "DEPORTES" | "TEATRO" | "FESTIVALES" | "OTRO" | "STAND_UP")[];
export type CategoriaEvento = (typeof CATEGORIAS_EVENTOS)[number];
import type { ListingInteractionType } from './types.js';
/** Peso por tipo de interacción (actualiza categoryScores) */
export declare const INTERACTION_WEIGHTS: Record<ListingInteractionType, number>;
/** Categoría de listing que coincide con una preferencia explícita */
export declare function listingMatchesPreferencia(listingCategory: string | null | undefined, preferenciaId: string): boolean;
/** Puntaje de recomendación para un listing dado el perfil de preferencias */
export declare function scoreListingForUser(listing: {
    category?: string | null;
    createdAt?: Date | string | number | null;
}, prefs: {
    explicitCategories?: string[];
    categoryScores?: Record<string, number>;
}): number;
export declare function labelForPreferencia(id: string): string;
export declare function labelForCategoriaEvento(cat: string | null | undefined): string;
