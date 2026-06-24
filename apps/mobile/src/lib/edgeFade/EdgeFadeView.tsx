import * as React from 'react';
import { StyleSheet, View, type LayoutChangeEvent, type StyleProp, type ViewStyle } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import LinearGradient from 'react-native-linear-gradient';
import { curveAlphas } from './curves';
import { resolveNativeProps, type NormalizedEdgeFade } from './normalize';
import type { EdgeFadeCurve, EdgeFadeViewProps } from './types';

const MASK_VISIBLE = 'rgba(255,255,255,1)';
const MASK_HIDDEN = 'rgba(255,255,255,0)';

function hexToRGB(color: string): [number, number, number] | null {
  const h = color.replace(/^#/, '');
  const full =
    h.length === 3
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h;
  if (/^[0-9a-f]{6}/i.test(full)) {
    return [
      parseInt(full.slice(0, 2), 16),
      parseInt(full.slice(2, 4), 16),
      parseInt(full.slice(4, 6), 16),
    ];
  }
  const m = color.match(/\d+(\.\d+)?/g);
  return m && m.length >= 3 ? [+m[0]!, +m[1]!, +m[2]!] : null;
}

function readSize(style: StyleProp<ViewStyle>): { width: number; height: number } {
  const flat = StyleSheet.flatten(style);
  const width = typeof flat?.width === 'number' ? flat.width : 0;
  const height = typeof flat?.height === 'number' ? flat.height : 0;
  return { width, height };
}

function maskAlpha(value: number): string {
  return `rgba(255,255,255,${Math.max(0, Math.min(1, value)).toFixed(4)})`;
}

/** Máscara vertical única: fundido real de alpha sobre todo el alto del view. */
function buildVerticalMaskGradient(
  height: number,
  n: NormalizedEdgeFade
): { colors: string[]; locations: number[] } {
  if (height <= 0) {
    return { colors: [MASK_VISIBLE], locations: [0] };
  }

  const stops: Array<{ loc: number; alpha: number }> = [];

  const pushStop = (loc: number, alpha: number) => {
    const clamped = Math.max(0, Math.min(1, loc));
    const last = stops[stops.length - 1];
    if (last && Math.abs(last.loc - clamped) < 0.0001) {
      last.alpha = alpha;
      return;
    }
    stops.push({ loc: clamped, alpha });
  };

  if (n.fadeTop > 0) {
    const alphas = curveAlphas(n.curveTop);
    const last = alphas.length - 1;
    alphas.forEach((alpha, i) => {
      pushStop((i / last) * (n.fadeTop / height), alpha);
    });
  } else {
    pushStop(0, 1);
  }

  const bottomStart = n.fadeBottom > 0 ? 1 - n.fadeBottom / height : 1;
  pushStop(Math.min(bottomStart, 1), 1);

  if (n.fadeBottom > 0) {
    const alphas = curveAlphas(n.curveBottom);
    const last = alphas.length - 1;
    alphas.forEach((alpha, i) => {
      pushStop(1 - (i / last) * (n.fadeBottom / height), alpha);
    });
  } else {
    pushStop(1, 1);
  }

  return {
    colors: stops.map((s) => maskAlpha(s.alpha)),
    locations: stops.map((s) => s.loc),
  };
}

function buildOverlayColors(
  color: string,
  curve: EdgeFadeCurve
): { colors: string[]; locations: number[] } {
  const rgb = hexToRGB(color);
  if (!rgb) return { colors: [MASK_HIDDEN, MASK_HIDDEN], locations: [0, 1] };
  const [r, g, b] = rgb;
  const alphas = curveAlphas(curve);
  const last = alphas.length - 1;
  return {
    colors: alphas.map((a) => `rgba(${r},${g},${b},${(1 - a).toFixed(4)})`),
    locations: alphas.map((_, i) => i / last),
  };
}

type EdgeSide = 'top' | 'bottom' | 'left' | 'right';

const GRADIENT_AXIS: Record<
  EdgeSide,
  { start: { x: number; y: number }; end: { x: number; y: number } }
> = {
  top: { start: { x: 0, y: 0 }, end: { x: 0, y: 1 } },
  bottom: { start: { x: 0, y: 1 }, end: { x: 0, y: 0 } },
  left: { start: { x: 0, y: 0 }, end: { x: 1, y: 0 } },
  right: { start: { x: 1, y: 0 }, end: { x: 0, y: 0 } },
};

function OverlayEdge({
  edge,
  size,
  curve,
  color,
}: {
  edge: EdgeSide;
  size: number;
  curve: EdgeFadeCurve;
  color: string;
}) {
  const { colors, locations } = buildOverlayColors(color, curve);
  const axis = GRADIENT_AXIS[edge];
  const isVertical = edge === 'top' || edge === 'bottom';

  return (
    <LinearGradient
      pointerEvents="none"
      colors={colors}
      locations={locations}
      start={axis.start}
      end={axis.end}
      style={[
        styles.overlayEdge,
        isVertical
          ? { left: 0, right: 0, height: size, [edge]: 0 }
          : { top: 0, bottom: 0, width: size, [edge]: 0 },
      ]}
    />
  );
}

function FullHeightMask({
  width,
  height,
  n,
}: {
  width: number;
  height: number;
  n: NormalizedEdgeFade;
}) {
  const { colors, locations } = buildVerticalMaskGradient(height, n);

  return (
    <LinearGradient
      colors={colors}
      locations={locations}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={{ width, height }}
    />
  );
}

export const EdgeFadeView = React.memo(function EdgeFadeView(props: EdgeFadeViewProps) {
  const n = resolveNativeProps(props);
  const { radius, style, children } = props;
  const presetSize = readSize(style);
  const [layoutSize, setLayoutSize] = React.useState(presetSize);

  React.useEffect(() => {
    if (presetSize.width > 0 && presetSize.height > 0) {
      setLayoutSize(presetSize);
    }
  }, [presetSize.width, presetSize.height]);

  const onLayout = React.useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    if (width > 0 && height > 0) {
      setLayoutSize({ width, height });
    }
  }, []);

  const radiusStyle =
    radius != null ? { borderRadius: radius, overflow: 'hidden' as const } : null;

  if (n.mode === 'overlay') {
    const edgeColor = (specific?: string) => String(specific ?? n.overlayColor ?? '');

    return (
      <View style={[styles.root, radiusStyle, style]} onLayout={onLayout}>
        {children}
        {n.fadeTop > 0 && (n.overlayColorTop ?? n.overlayColor) != null && (
          <OverlayEdge
            edge="top"
            size={n.fadeTop}
            curve={n.curveTop}
            color={edgeColor(n.overlayColorTop)}
          />
        )}
        {n.fadeBottom > 0 && (n.overlayColorBottom ?? n.overlayColor) != null && (
          <OverlayEdge
            edge="bottom"
            size={n.fadeBottom}
            curve={n.curveBottom}
            color={edgeColor(n.overlayColorBottom)}
          />
        )}
        {n.fadeLeft > 0 && (n.overlayColorLeft ?? n.overlayColor) != null && (
          <OverlayEdge
            edge="left"
            size={n.fadeLeft}
            curve={n.curveLeft}
            color={edgeColor(n.overlayColorLeft)}
          />
        )}
        {n.fadeRight > 0 && (n.overlayColorRight ?? n.overlayColor) != null && (
          <OverlayEdge
            edge="right"
            size={n.fadeRight}
            curve={n.curveRight}
            color={edgeColor(n.overlayColorRight)}
          />
        )}
      </View>
    );
  }

  const hasVerticalMask = n.fadeTop > 0 || n.fadeBottom > 0;
  if (!hasVerticalMask) {
    return (
      <View style={[styles.root, radiusStyle, style]} onLayout={onLayout}>
        {children}
      </View>
    );
  }

  const { width, height } = layoutSize;

  return (
    <View style={[styles.root, radiusStyle, style]} onLayout={onLayout}>
      <MaskedView
        style={StyleSheet.absoluteFill}
        androidRenderingMode="software"
        maskElement={
          width > 0 && height > 0 ? (
            <FullHeightMask width={width} height={height} n={n} />
          ) : (
            <View style={StyleSheet.absoluteFillObject} />
          )
        }
      >
        <View style={StyleSheet.absoluteFill}>{children}</View>
      </MaskedView>
    </View>
  );
});

const styles = StyleSheet.create({
  root: {
    overflow: 'hidden',
  },
  overlayEdge: {
    position: 'absolute',
    zIndex: 2,
  },
});

export type { EdgeFadeViewProps } from './types';
