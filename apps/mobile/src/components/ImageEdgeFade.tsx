/**
 * Wrapper de EdgeFadeView (API react-native-edge-fade) para banners hero.
 */

import * as React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { EdgeFadeView } from '../lib/edgeFade';
import { buildEdgeFadeViewProps, type ImageEdgeFadeSide } from '../lib/imageEdgeFade';

type Props = {
  top?: ImageEdgeFadeSide | false;
  bottom?: ImageEdgeFadeSide | false;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
};

export function ImageEdgeFade({ top, bottom, style, children }: Props) {
  const edgeProps = buildEdgeFadeViewProps(top, bottom);

  return (
    <EdgeFadeView {...edgeProps} style={style}>
      {children}
    </EdgeFadeView>
  );
}
