/**
 * Retardo configurable antes de exigir biometría al volver a la app.
 * Persistencia local por usuario (preferencia de dispositivo, no sensible).
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export const BIOMETRIC_LOCK_DELAY_DEFAULT_SEC = 60;

export const BIOMETRIC_LOCK_DELAY_OPTIONS = [
  { value: 0, label: 'Inmediato' },
  { value: 30, label: '30 segundos' },
  { value: 60, label: '1 minuto' },
  { value: 180, label: '3 minutos' },
  { value: 300, label: '5 minutos' },
] as const;

export type BiometricLockDelaySec = (typeof BIOMETRIC_LOCK_DELAY_OPTIONS)[number]['value'];

const storageKey = (userId: string) => `tt:v1:biometric-lock-delay:${userId}`;

const VALID_VALUES = new Set<number>(BIOMETRIC_LOCK_DELAY_OPTIONS.map((o) => o.value));

export function isValidBiometricLockDelaySec(seconds: number): seconds is BiometricLockDelaySec {
  return VALID_VALUES.has(seconds);
}

export function formatBiometricLockDelayLabel(seconds: number): string {
  const opt = BIOMETRIC_LOCK_DELAY_OPTIONS.find((o) => o.value === seconds);
  return opt?.label ?? `${seconds} segundos`;
}

export async function getBiometricLockDelaySec(userId: string): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(storageKey(userId));
    if (raw == null) return BIOMETRIC_LOCK_DELAY_DEFAULT_SEC;
    const n = parseInt(raw, 10);
    if (!isValidBiometricLockDelaySec(n)) return BIOMETRIC_LOCK_DELAY_DEFAULT_SEC;
    return n;
  } catch {
    return BIOMETRIC_LOCK_DELAY_DEFAULT_SEC;
  }
}

export async function setBiometricLockDelaySec(userId: string, seconds: BiometricLockDelaySec): Promise<void> {
  await AsyncStorage.setItem(storageKey(userId), String(seconds));
}
