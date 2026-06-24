/**
 * API compatible con react-native-edge-fade (MIT © Giulio Amato).
 * Implementación JS para RN 0.73 sin New Architecture.
 */

import type { ColorValue, StyleProp, ViewStyle } from 'react-native';

export type CurvePreset = 'smooth' | 'sharp' | 'gentle' | 'soft' | 'linear';

export type CubicBezierCurve = {
  type: 'cubicBezier';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

export type StopsCurve = {
  type: 'stops';
  values: number[];
};

export type EdgeFadeCurve = CurvePreset | CubicBezierCurve | StopsCurve;

export type EdgeFadeMode = 'mask' | 'overlay';

export type EdgeConfig = {
  size?: number;
  curve?: EdgeFadeCurve;
  color?: ColorValue;
};

export type EdgeFadeViewProps = {
  top?: boolean | number | EdgeConfig;
  bottom?: boolean | number | EdgeConfig;
  left?: boolean | number | EdgeConfig;
  right?: boolean | number | EdgeConfig;
  start?: boolean | number | EdgeConfig;
  end?: boolean | number | EdgeConfig;
  size?: number;
  curve?: EdgeFadeCurve;
  mode?: EdgeFadeMode;
  color?: ColorValue;
  radius?: number;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
};
