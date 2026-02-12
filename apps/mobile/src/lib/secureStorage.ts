/**
 * Almacenamiento seguro + autenticación biométrica
 * Usa Keychain (iOS) y Keystore (Android) - nunca AsyncStorage para datos sensibles.
 * Ubicación: apps/mobile/src/lib/secureStorage.ts
 */

import * as Keychain from 'react-native-keychain';
import ReactNativeBiometrics from 'react-native-biometrics';
import { Platform } from 'react-native';

const SERVICE_NAME = 'com.ttmobiletemp.auth';
const TOKEN_USERNAME = 'user';
const BIOMETRICS_ENABLED_KEY = 'biometricsEnabled';

const rnBiometrics = new ReactNativeBiometrics();

export type BiometricType = 'FaceID' | 'TouchID' | 'Biometrics' | null;

export interface BiometricAvailability {
  available: boolean;
  type: BiometricType;
  error?: string;
}

/**
 * Verifica si el dispositivo tiene sensores biométricos disponibles.
 */
export async function isBiometricAvailable(): Promise<BiometricAvailability> {
  try {
    const { available, biometryType } = await rnBiometrics.isSensorAvailable();
    if (available && biometryType) {
      const type: BiometricType =
        biometryType === 'Face ID'
          ? 'FaceID'
          : biometryType === 'Touch ID'
            ? 'TouchID'
            : 'Biometrics';
      return { available: true, type };
    }
    return { available: false, type: null };
  } catch (e) {
    return {
      available: false,
      type: null,
      error: e instanceof Error ? e.message : 'Error al verificar biométricos',
    };
  }
}

/**
 * Muestra el prompt biométrico para validar al usuario.
 * Uso: activación de biométricos o re-ingreso a la app.
 */
export async function promptBiometric(message: string = 'Autenticarse para continuar'): Promise<boolean> {
  try {
    const { success } = await rnBiometrics.simplePrompt({
      promptMessage: message,
      cancelButtonText: 'Cancelar',
    });
    return success;
  } catch {
    return false;
  }
}

/**
 * Guarda el token de forma segura.
 * - Si useBiometric = true: requiere biométrico para acceder (Keychain con accessControl).
 * - Si useBiometric = false: guarda en Keychain sin protección biométrica (más seguro que AsyncStorage).
 */
export async function setSecureToken(token: string, useBiometric: boolean): Promise<void> {
  const options: Keychain.Options = {
    service: SERVICE_NAME,
    accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
  };

  if (useBiometric && Platform.OS === 'ios') {
    options.accessControl = Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET;
  }
  if (useBiometric && Platform.OS === 'android') {
    options.accessControl = Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET;
  }

  await Keychain.setGenericPassword(TOKEN_USERNAME, token, options);
}

/**
 * Obtiene el token del almacenamiento seguro.
 * Si fue guardado con protección biométrica, el sistema mostrará el prompt automáticamente.
 */
export async function getSecureToken(): Promise<string | null> {
  try {
    const creds = await Keychain.getGenericPassword({ service: SERVICE_NAME });
    return creds ? creds.password : null;
  } catch {
    return null;
  }
}

/**
 * Elimina el token del almacenamiento seguro.
 */
export async function removeSecureToken(): Promise<void> {
  await Keychain.resetGenericPassword({ service: SERVICE_NAME });
}

/**
 * Guarda la preferencia de biométricos habilitados (valor no sensible, AsyncStorage sería aceptable,
 * pero usamos Keychain para centralizar credenciales).
 */
export async function setBiometricsEnabled(enabled: boolean): Promise<void> {
  try {
    if (enabled) {
      await Keychain.setGenericPassword(BIOMETRICS_ENABLED_KEY, 'true', {
        service: `${SERVICE_NAME}.prefs`,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
      });
    } else {
      await Keychain.resetGenericPassword({ service: `${SERVICE_NAME}.prefs` });
    }
  } catch {
    // Ignorar errores de preferencias
  }
}

/**
 * Obtiene si el usuario tiene biométricos habilitados.
 */
export async function getBiometricsEnabled(): Promise<boolean> {
  try {
    const creds = await Keychain.getGenericPassword({
      service: `${SERVICE_NAME}.prefs`,
    });
    return creds?.password === 'true';
  } catch {
    return false;
  }
}

/**
 * Desactiva biométricos: obtiene el token (puede pedir validación biométrica),
 * lo re-guarda sin protección biométrica y actualiza la preferencia.
 */
export async function disableBiometrics(): Promise<boolean> {
  try {
    const token = await getSecureToken();
    if (!token) return false;
    await setSecureToken(token, false);
    await setBiometricsEnabled(false);
    return true;
  } catch {
    return false;
  }
}
