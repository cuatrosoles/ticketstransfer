/**
 * Imágenes de portada de eventos – fallbacks por categoría (Unsplash, licencia libre).
 */
import { CATEGORIAS_EVENTOS } from './constants.js';
export type EventImageCategory = (typeof CATEGORIAS_EVENTOS)[number];
export type EventImageSource = 'official' | 'wikimedia' | 'generated' | 'fallback';
/** URLs estáticas de respaldo cuando no se encuentra imagen oficial. */
export declare const EVENT_IMAGE_CATEGORY_FALLBACKS: Record<EventImageCategory, string>;
export declare function normalizeEventImageCategory(raw?: string | null): EventImageCategory;
export declare function getEventImageCategoryFallback(category?: string | null): string;
