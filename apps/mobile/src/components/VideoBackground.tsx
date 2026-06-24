/**
 * Fondo en loop vía MP4 (una sola instancia en App.tsx).
 * Audio silenciado; cubre toda la pantalla sin interacción.
 */

import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import Video from 'react-native-video';

const BACKGROUND_VIDEO = require('../assets/video/cosmicBG-03.mp4');

export function VideoBackground() {
  return (
    <View style={styles.root} pointerEvents="none">
      <Video
        source={BACKGROUND_VIDEO}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
        repeat
        muted
        volume={0}
        paused={false}
        playInBackground={false}
        playWhenInactive={false}
        ignoreSilentSwitch="ignore"
        disableFocus
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#020617',
  },
});
