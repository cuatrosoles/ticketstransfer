/**
 * Utilidades de fecha/hora del evento (formularios publicar ticket).
 */
/** Valor para input type="datetime-local" (YYYY-MM-DDTHH:mm) */
export declare function toDatetimeLocalValue(d: Date): string;
export declare function parseDatetimeLocalValue(value: string): Date | null;
/** ISO para API / Firestore */
export declare function eventDateForApi(value: string): string;
/** Solo fecha YYYY-MM-DD (vista previa imagen, etc.) */
export declare function eventDateDateOnly(value: string): string;
export declare function formatEventDateTimeDisplay(value: string, locale?: string): string;
export declare function listingValueToDatetimeLocal(v: unknown): string;
