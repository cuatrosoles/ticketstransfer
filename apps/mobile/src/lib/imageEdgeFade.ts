/**
 * Configuración del degradé de bordes (API react-native-edge-fade, port JS local).
 *
 * Ajustes globales por defecto:
 * - IMAGE_EDGE_FADE_TOP_SIZE / IMAGE_EDGE_FADE_TOP_COLOR
 * - IMAGE_EDGE_FADE_BOTTOM_SIZE / IMAGE_EDGE_FADE_BOTTOM_COLOR
 * - IMAGE_EDGE_FADE_DEFAULT_CURVE
 *
 * Por pantalla: props `top` y `bottom` en ImageEdgeFade / HeroImageBanner.
 *
 * Sin `color` → mode="mask" (alpha real; ideal sobre video).
 * Con `color` → mode="overlay" en ese borde (ideal sobre fondo sólido).
 */

import type { EdgeFadeCurve, EdgeFadeViewProps } from './edgeFade';

export type ImageEdgeFadeSide = {
  /** Profundidad del fade en dp. */
  heightPx?: number;
  size?: number;
  /** Overlay hacia este color. Sin color → mask (revela lo detrás). */
  color?: string;
  curve?: EdgeFadeCurve;
};

export const WELCOME_BACKGROUND_COLOR = '#020617';
export const COSMIC_BACKGROUND_COLOR = '#020617';

export const IMAGE_EDGE_FADE_TOP_SIZE = 56;
export const IMAGE_EDGE_FADE_TOP_COLOR = WELCOME_BACKGROUND_COLOR;

export const IMAGE_EDGE_FADE_BOTTOM_SIZE = 120;
export const IMAGE_EDGE_FADE_BOTTOM_COLOR = WELCOME_BACKGROUND_COLOR;

export const IMAGE_EDGE_FADE_DEFAULT_CURVE: EdgeFadeCurve = 'soft';

function sideSize(side: ImageEdgeFadeSide | undefined, fallback: number): number {
  return side?.size ?? side?.heightPx ?? fallback;
}

function sideCurve(side: ImageEdgeFadeSide | undefined): EdgeFadeCurve {
  return side?.curve ?? IMAGE_EDGE_FADE_DEFAULT_CURVE;
}

export function buildEdgeFadeViewProps(
  top?: ImageEdgeFadeSide | false,
  bottom?: ImageEdgeFadeSide | false
): Pick<EdgeFadeViewProps, 'top' | 'bottom' | 'mode' | 'curve'> {
  const props: Pick<EdgeFadeViewProps, 'top' | 'bottom' | 'mode' | 'curve'> = {
    curve: IMAGE_EDGE_FADE_DEFAULT_CURVE,
  };

  let useOverlay = false;

  if (top !== false && top !== undefined) {
    const size = sideSize(top, IMAGE_EDGE_FADE_TOP_SIZE);
    if (size > 0) {
      if (top.color) {
        props.top = { size, color: top.color, curve: sideCurve(top) };
        useOverlay = true;
      } else {
        props.top = { size, curve: sideCurve(top) };
      }
    }
  }

  if (bottom !== false && bottom !== undefined) {
    const size = sideSize(bottom, IMAGE_EDGE_FADE_BOTTOM_SIZE);
    if (size > 0) {
      if (bottom.color) {
        props.bottom = { size, color: bottom.color, curve: sideCurve(bottom) };
        useOverlay = true;
      } else {
        props.bottom = { size, curve: sideCurve(bottom) };
      }
    }
  }

  if (useOverlay) {
    props.mode = 'overlay';
  }

  return props;
}

/** Defaults con overlay para Welcome (fondo sólido). */
export function welcomeEdgeFadeDefaults(): Pick<EdgeFadeViewProps, 'top' | 'bottom' | 'mode' | 'curve'> {
  return buildEdgeFadeViewProps(
    { size: IMAGE_EDGE_FADE_TOP_SIZE, color: IMAGE_EDGE_FADE_TOP_COLOR },
    { size: IMAGE_EDGE_FADE_BOTTOM_SIZE, color: IMAGE_EDGE_FADE_BOTTOM_COLOR }
  );
}
