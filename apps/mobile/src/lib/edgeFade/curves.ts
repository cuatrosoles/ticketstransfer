import type { EdgeFadeCurve } from './types';

const SAMPLE_N = 32;

const PRESETS: Record<string, (p: number) => number> = {
  smooth: (p) => p ** 3,
  sharp: (p) => p ** 5,
  gentle: (p) => p ** 2,
  soft: (p) => Math.sin((p * Math.PI) / 2),
  linear: (p) => p,
};

function cubicBezierEval(x1: number, y1: number, x2: number, y2: number, x: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;
  let t = x;
  for (let i = 0; i < 8; i += 1) {
    const bxt = ((ax * t + bx) * t + cx) * t;
    const dbxt = (3 * ax * t + 2 * bx) * t + cx;
    if (Math.abs(dbxt) < 1e-6) break;
    t = Math.max(0, Math.min(1, t - (bxt - x) / dbxt));
  }
  return ((ay * t + by) * t + cy) * t;
}

function sampleCubicBezier(curve: { x1: number; y1: number; x2: number; y2: number }): number[] {
  const innerToOuter = Array.from({ length: SAMPLE_N }, (_, i) => {
    const x = i / (SAMPLE_N - 1);
    return parseFloat(
      (1 - cubicBezierEval(curve.x1, curve.y1, curve.x2, curve.y2, x)).toFixed(4)
    );
  });
  return innerToOuter.reverse();
}

export function curveAlphas(curve: EdgeFadeCurve | string): number[] {
  if (typeof curve === 'string') {
    const fn = PRESETS[curve] ?? PRESETS.smooth;
    return Array.from({ length: SAMPLE_N }, (_, i) => fn(i / (SAMPLE_N - 1)));
  }
  if (curve.type === 'cubicBezier') {
    return sampleCubicBezier(curve);
  }
  return curve.values.map((v) => Math.max(0, Math.min(1, v))).reverse();
}
