/**
 * Deriva gradientes y tonos a partir del color primario de marca (admin / Firestore visual).
 */

export type Rgb = { r: number; g: number; b: number };

export function parseHexColor(input: string | undefined | null): Rgb | null {
  if (!input || typeof input !== 'string') return null;
  let h = input.trim();
  if (h.startsWith('#')) h = h.slice(1);
  if (h.length === 3) {
    h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  }
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function mix(a: Rgb, b: Rgb, t: number): Rgb {
  return {
    r: Math.round(a.r * (1 - t) + b.r * t),
    g: Math.round(a.g * (1 - t) + b.g * t),
    b: Math.round(a.b * (1 - t) + b.b * t),
  };
}

function toHex(c: Rgb): string {
  return (
    '#' +
    [c.r, c.g, c.b]
      .map((x) => Math.max(0, Math.min(255, x)).toString(16).padStart(2, '0'))
      .join('')
  );
}

/** Tres paradas para LinearGradient (oscuro → base → claro). */
export function primaryToGradientTriplet(primaryHex: string | undefined | null): [string, string, string] {
  const base = parseHexColor(primaryHex);
  if (!base) return ['#2563eb', '#3b82f6', '#60a5fa'];
  const dark = mix(base, { r: 15, g: 23, b: 42 }, 0.35);
  const light = mix(base, { r: 248, g: 250, b: 252 }, 0.28);
  return [toHex(dark), toHex(base), toHex(light)];
}

export function primaryLightHex(primaryHex: string | undefined | null): string {
  const base = parseHexColor(primaryHex);
  if (!base) return '#60a5fa';
  return toHex(mix(base, { r: 248, g: 250, b: 252 }, 0.35));
}
