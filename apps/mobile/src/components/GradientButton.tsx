/**
 * Botón primario: gradiente como web (linear-gradient(135deg, #2563eb → #3b82f6 → #60a5fa))
 */

import * as React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator, StyleProp } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

type Props = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary';
  style?: StyleProp<ViewStyle>;
  textStyle?: TextStyle;
};

export function GradientButton({
  title,
  onPress,
  disabled,
  loading,
  variant = 'primary',
  style,
  textStyle,
}: Props) {
  if (variant === 'secondary') {
    return (
      <TouchableOpacity
        style={[styles.secondary, style]}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color="#60a5fa" />
        ) : (
          <Text style={[styles.secondaryText, textStyle]}>{title}</Text>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.primaryWrap, style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={['#2563eb', '#3b82f6', '#60a5fa']}
        locations={[0, 0.5, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      />
      {loading ? (
        <ActivityIndicator color="#ffffff" />
      ) : (
        <Text style={[styles.primaryText, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  primaryWrap: {
    height: 52,
    borderRadius: 12,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  gradient: { ...StyleSheet.absoluteFillObject },
  primaryText: { color: '#ffffff', fontWeight: '600', fontSize: 16 },
  secondary: {
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#60a5fa',
    backgroundColor: 'transparent',
  },
  secondaryText: { color: '#60a5fa', fontWeight: '600', fontSize: 16 },
});
