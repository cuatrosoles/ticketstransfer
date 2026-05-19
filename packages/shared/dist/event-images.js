/**
 * Imágenes de portada de eventos – fallbacks por categoría (Unsplash, licencia libre).
 */
import { CATEGORIAS_EVENTOS } from './constants.js';
/** URLs estáticas de respaldo cuando no se encuentra imagen oficial. */
export const EVENT_IMAGE_CATEGORY_FALLBACKS = {
    MUSICA: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=800&q=80&fm=jpg',
    DEPORTES: 'https://images.unsplash.com/photo-1461896836934-ffe607be7d0e?auto=format&fit=crop&w=800&q=80&fm=jpg',
    TEATRO: 'https://images.unsplash.com/photo-1503090549741-5a710f340b0b?auto=format&fit=crop&w=800&q=80&fm=jpg',
    FESTIVALES: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=800&q=80&fm=jpg',
    OTRO: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=800&q=80&fm=jpg',
};
export function normalizeEventImageCategory(raw) {
    if (raw && CATEGORIAS_EVENTOS.includes(raw)) {
        return raw;
    }
    return 'OTRO';
}
export function getEventImageCategoryFallback(category) {
    return EVENT_IMAGE_CATEGORY_FALLBACKS[normalizeEventImageCategory(category)];
}
