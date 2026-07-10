/**

 * Header unificado – Back + Logo centrado + Título + slot derecho.

 */



import * as React from 'react';

import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import { BrandLogo, BRAND_LOGO_HEIGHT_COMPACT } from './BrandLogo';

import { headerBottomPadding, headerTopPadding } from '../theme';



/** Ancho fijo de columnas laterales para centrar el logo respecto al contenido. */

const HEADER_SIDE_WIDTH = 44;



type Props = {

  title: string;

  showBack?: boolean;

  onBack?: () => void;

  rightSlot?: React.ReactNode;

  /** Contenido junto al título (ej. avatar del contacto en chat) */

  titleRight?: React.ReactNode;

  /** Logo remoto opcional (sobreescribe branding). */

  logoUri?: string | null;

};



export function ScreenHeader({

  title,

  showBack,

  onBack,

  rightSlot,

  titleRight,

  logoUri,

}: Props) {

  return (

    <View style={styles.container}>

      <View style={styles.row}>

        <View style={styles.sideCol}>

          {showBack && onBack ? (

            <TouchableOpacity onPress={onBack} style={styles.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>

              <Text style={styles.backIcon}>←</Text>

            </TouchableOpacity>

          ) : null}

        </View>

        <View style={styles.centerCol}>

          <BrandLogo uri={logoUri} height={BRAND_LOGO_HEIGHT_COMPACT} style={styles.logo} />

        </View>

        <View style={[styles.sideCol, styles.sideColRight]}>{rightSlot ?? null}</View>

      </View>

      <View style={styles.titleRow}>

        <Text style={[styles.title, titleRight ? styles.titleWithExtra : undefined]} numberOfLines={2}>

          {title}

        </Text>

        {titleRight ? <View style={styles.titleRightWrap}>{titleRight}</View> : null}

      </View>

    </View>

  );

}



const styles = StyleSheet.create({

  container: {

    width: '100%',

    paddingTop: headerTopPadding,

    paddingBottom: headerBottomPadding,

  },

  row: {

    flexDirection: 'row',

    alignItems: 'center',

    minHeight: HEADER_SIDE_WIDTH,

  },

  sideCol: {

    width: HEADER_SIDE_WIDTH,

    minHeight: HEADER_SIDE_WIDTH,

    alignItems: 'flex-start',

    justifyContent: 'center',

  },

  sideColRight: {

    alignItems: 'flex-end',

  },

  centerCol: {

    flex: 1,

    alignItems: 'center',

    justifyContent: 'center',

  },

  backBtn: {

    width: 40,

    height: 40,

    borderRadius: 20,

    backgroundColor: 'rgba(255,255,255,0.1)',

    alignItems: 'center',

    justifyContent: 'center',

    borderWidth: 1,

    borderColor: 'rgba(96, 165, 250, 0.35)',

  },

  backIcon: { fontSize: 22, color: '#f8fafc' },

  logo: {

    height: BRAND_LOGO_HEIGHT_COMPACT,

    maxWidth: HEADER_SIDE_WIDTH * 4,

  },

  titleRow: {

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'center',

    marginTop: 12,

    gap: 10,

    paddingHorizontal: 2,

  },

  title: {

    fontSize: 20,

    fontWeight: '800',

    fontFamily: 'Cooper-Black',

    letterSpacing: 0.5,

    color: '#f8fafc',

    textAlign: 'center',

    flexShrink: 1,

  },

  titleWithExtra: { flex: 1, textAlign: 'center' as const },

  titleRightWrap: { flexShrink: 0 },

});


