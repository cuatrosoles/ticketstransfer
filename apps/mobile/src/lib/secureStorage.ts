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

const rnBiometrics = new ReactNativeBiometrics({ allowDeviceCredentials: true });

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
    options.accessControl = Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET_OR_DEVICE_PASSCODE;
  }

  await Keychain.setGenericPassword(TOKEN_USERNAME, token, options);
}

/**
 * Obtiene el token del almacenamiento seguro.
 * Si biométricos están activados, pasa accessControl y authenticationPrompt para que
 * el sistema muestre el prompt biométrico al recuperar (requerido en iOS/Android).
 */
export async function getSecureToken(userId: string | null = null): Promise<string | null> {
  try {
    const biometricsEnabled = await getBiometricsEnabledForUser(userId);
    const options: Keychain.Options = { service: SERVICE_NAME };

    if (biometricsEnabled) {
      options.accessControl =
        Platform.OS === 'android'
          ? Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET_OR_DEVICE_PASSCODE
          : Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET;
      options.authenticationPrompt = {
        title: 'Autenticarse para continuar',
        cancel: 'Cancelar',
      };
    }

    const creds = await Keychain.getGenericPassword(options);
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
  return setBiometricsEnabledForUser(null, enabled);
}

function prefsServiceForUser(userId: string | null): string {
  if (!userId) return `${SERVICE_NAME}.prefs`;
  return `${SERVICE_NAME}.prefs.${userId}`;
}

export async function setBiometricsEnabledForUser(userId: string | null, enabled: boolean): Promise<void> {
  try {
    const service = prefsServiceForUser(userId);
    if (enabled) {
      await Keychain.setGenericPassword(BIOMETRICS_ENABLED_KEY, 'true', {
        service,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
      });
    } else {
      await Keychain.resetGenericPassword({ service });
    }
  } catch {
    // Ignorar errores de preferencias
  }
}

/**
 * Obtiene si el usuario tiene biométricos habilitados.
 */
export async function getBiometricsEnabled(): Promise<boolean> {
  return getBiometricsEnabledForUser(null);
}

export async function getBiometricsEnabledForUser(userId: string | null): Promise<boolean> {
  try {
    const creds = await Keychain.getGenericPassword({
      service: prefsServiceForUser(userId),
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
export async function disableBiometrics(userId: string | null = null): Promise<boolean> {
  try {
    const token = await getSecureToken(userId);
    if (!token) return false;
    await setSecureToken(token, false);
    await setBiometricsEnabledForUser(userId, false);
    return true;
  } catch {
    return false;
  }
}
