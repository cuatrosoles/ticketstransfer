import { I18nManager } from 'react-native';
import type { EdgeConfig, EdgeFadeCurve, EdgeFadeViewProps } from './types';

const DEFAULT_SIZE = 80;
const DEFAULT_CURVE: EdgeFadeCurve = 'smooth';

type ResolvedEdge = { size: number; curve: EdgeFadeCurve; color?: string } | null;

export type NormalizedEdgeFade = {
  fadeTop: number;
  fadeBottom: number;
  fadeLeft: number;
  fadeRight: number;
  curveTop: EdgeFadeCurve;
  curveBottom: EdgeFadeCurve;
  curveLeft: EdgeFadeCurve;
  curveRight: EdgeFadeCurve;
  mode: 'mask' | 'overlay';
  overlayColor?: string;
  overlayColorTop?: string;
  overlayColorBottom?: string;
  overlayColorLeft?: string;
  overlayColorRight?: string;
};

function resolveEdge(
  prop: EdgeFadeViewProps['top'],
  size: number,
  curve: EdgeFadeCurve
): ResolvedEdge {
  if (!prop) return null;
  if (prop === true) return { size, curve };
  if (typeof prop === 'number') return { size: prop, curve };
  if (typeof prop === 'object' && (prop.size != null || prop.curve != null || prop.color != null)) {
    return {
      size: prop.size ?? size,
      curve: prop.curve ?? curve,
      color: prop.color != null ? String(prop.color) : undefined,
    };
  }
  return null;
}

export function resolveNativeProps(props: EdgeFadeViewProps): NormalizedEdgeFade {
  const size = props.size ?? DEFAULT_SIZE;
  const curve = props.curve ?? DEFAULT_CURVE;
  const isRTL = I18nManager.isRTL;
  const leftLogical = isRTL ? props.end : props.start;
  const rightLogical = isRTL ? props.start : props.end;

  const top = resolveEdge(props.top, size, curve);
  const bottom = resolveEdge(props.bottom, size, curve);
  const left = resolveEdge(leftLogical ?? props.left, size, curve);
  const right = resolveEdge(rightLogical ?? props.right, size, curve);

  const hasColor =
    props.color != null ||
    top?.color != null ||
    bottom?.color != null ||
    left?.color != null ||
    right?.color != null;

  return {
    fadeTop: top?.size ?? 0,
    fadeBottom: bottom?.size ?? 0,
    fadeLeft: left?.size ?? 0,
    fadeRight: right?.size ?? 0,
    curveTop: top?.curve ?? curve,
    curveBottom: bottom?.curve ?? curve,
    curveLeft: left?.curve ?? curve,
    curveRight: right?.curve ?? curve,
    mode: props.mode ?? (hasColor ? 'overlay' : 'mask'),
    overlayColor: props.color != null ? String(props.color) : undefined,
    overlayColorTop: top?.color,
    overlayColorBottom: bottom?.color,
    overlayColorLeft: left?.color,
    overlayColorRight: right?.color,
  };
}
