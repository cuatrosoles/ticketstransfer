/**
 * Preferencias de usuario y motor de recomendación – Tickets Transfer
 */
/** Preferencias explícitas (onboarding / perfil) con etiquetas amigables */
export const PREFERENCIAS_EVENTO = [
    { id: 'MUSICA', label: 'Recitales / Música', listingCategories: ['MUSICA'] },
    { id: 'DEPORTES', label: 'Deportes', listingCategories: ['DEPORTES'] },
    { id: 'TEATRO', label: 'Teatro', listingCategories: ['TEATRO'] },
    { id: 'STAND_UP', label: 'Stand-up', listingCategories: ['TEATRO', 'OTRO'] },
    { id: 'FESTIVALES', label: 'Festivales', listingCategories: ['FESTIVALES'] },
    { id: 'OTRO', label: 'Otros', listingCategories: ['OTRO'] },
];
export const PREFERENCIAS_EVENTO_IDS = PREFERENCIAS_EVENTO.map((p) => p.id);
/** Peso por tipo de interacción (actualiza categoryScores) */
export const INTERACTION_WEIGHTS = {
    VIEW: 1,
    CLICK: 2,
    FAVORITE_ADD: 5,
    FAVORITE_REMOVE: -3,
};
const PREF_TO_LISTING = new Map(PREFERENCIAS_EVENTO.map((p) => [p.id, p.listingCategories]));
/** Categoría de listing que coincide con una preferencia explícita */
export function listingMatchesPreferencia(listingCategory, preferenciaId) {
    const cats = PREF_TO_LISTING.get(preferenciaId);
    if (!cats)
        return false;
    const cat = listingCategory || 'OTRO';
    return cats.includes(cat);
}
/** Puntaje de recomendación para un listing dado el perfil de preferencias */
export function scoreListingForUser(listing, prefs) {
    const category = listing.category || 'OTRO';
    let score = 0;
    for (const prefId of prefs.explicitCategories ?? []) {
        if (listingMatchesPreferencia(category, prefId))
            score += 10;
    }
    score += prefs.categoryScores?.[category] ?? 0;
    if (listing.createdAt) {
        const ts = listing.createdAt instanceof Date
            ? listing.createdAt.getTime()
            : new Date(listing.createdAt).getTime();
        if (!Number.isNaN(ts)) {
            const ageDays = (Date.now() - ts) / (24 * 3600 * 1000);
            score += Math.max(0, 2 - ageDays * 0.3);
        }
    }
    return score;
}
export function labelForPreferencia(id) {
    return PREFERENCIAS_EVENTO.find((p) => p.id === id)?.label ?? id;
}
export function labelForCategoriaEvento(cat) {
    const c = cat || 'OTRO';
    const map = {
        MUSICA: 'Música',
        DEPORTES: 'Deportes',
        TEATRO: 'Teatro',
        FESTIVALES: 'Festivales',
        OTRO: 'Otros',
    };
    return map[c] ?? c;
}
