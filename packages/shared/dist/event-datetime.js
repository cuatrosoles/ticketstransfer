/**
 * Utilidades de fecha/hora del evento (formularios publicar ticket).
 */
/** Valor para input type="datetime-local" (YYYY-MM-DDTHH:mm) */
export function toDatetimeLocalValue(d) {
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
export function parseDatetimeLocalValue(value) {
    const s = value.trim();
    if (!s)
        return null;
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(s)) {
        const d = new Date(s);
        return Number.isNaN(d.getTime()) ? null : d;
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
        const d = new Date(`${s}T12:00:00`);
        return Number.isNaN(d.getTime()) ? null : d;
    }
    const m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})(?:\s+(\d{1,2}):(\d{2}))?/);
    if (m) {
        const [, d, mo, y, h, min] = m;
        const dt = new Date(Number(y), Number(mo) - 1, Number(d), h != null ? Number(h) : 12, min != null ? Number(min) : 0);
        return Number.isNaN(dt.getTime()) ? null : dt;
    }
    const d = new Date(s);
    return Number.isNaN(d.getTime()) ? null : d;
}
/** ISO para API / Firestore */
export function eventDateForApi(value) {
    const d = parseDatetimeLocalValue(value);
    if (!d)
        return value.trim();
    return d.toISOString();
}
/** Solo fecha YYYY-MM-DD (vista previa imagen, etc.) */
export function eventDateDateOnly(value) {
    const d = parseDatetimeLocalValue(value);
    if (!d) {
        const s = value.trim();
        return /^\d{4}-\d{2}-\d{2}/.test(s) ? s.slice(0, 10) : s;
    }
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
export function formatEventDateTimeDisplay(value, locale = 'es-AR') {
    const d = parseDatetimeLocalValue(value);
    if (!d)
        return value.trim() || 'Seleccionar fecha y hora';
    return d.toLocaleString(locale, {
        weekday: 'short',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}
export function listingValueToDatetimeLocal(v) {
    if (v == null)
        return '';
    let d = null;
    if (typeof v === 'string') {
        d = parseDatetimeLocalValue(v) ?? (Number.isNaN(new Date(v).getTime()) ? null : new Date(v));
    }
    else if (v instanceof Date) {
        d = v;
    }
    else if (typeof v === 'object' && v !== null && '_seconds' in v) {
        d = new Date(v._seconds * 1000);
    }
    else if (typeof v === 'object' && v !== null && 'toDate' in v && typeof v.toDate === 'function') {
        d = v.toDate();
    }
    if (!d || Number.isNaN(d.getTime()))
        return '';
    return toDatetimeLocalValue(d);
}
