export type DateInput =
  | string
  | number
  | Date
  | {
      toDate?: () => Date;
      seconds?: number;
      _seconds?: number;
    }
  | null
  | undefined;

export function parseDateInput(value: DateInput): Date | null {
  if (value == null) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === 'string' || typeof value === 'number') {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  if (typeof value.toDate === 'function') {
    const d = value.toDate();
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const sec = value.seconds ?? value._seconds;
  if (typeof sec === 'number') {
    const d = new Date(sec * 1000);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}

export function formatDate(value: DateInput, locale: string = 'es-AR'): string {
  const d = parseDateInput(value);
  if (!d) return '—';
  return d.toLocaleDateString(locale);
}

export function formatDateTime(value: DateInput, locale: string = 'es-AR'): string {
  const d = parseDateInput(value);
  if (!d) return '—';
  return d.toLocaleString(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTime(value: DateInput, locale: string = 'es-AR'): string {
  const d = parseDateInput(value);
  if (!d) return '—';
  return d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
}
