/**
 * Obtención de ubicación GPS en React Native (permisos Android/iOS).
 */

import { Platform, PermissionsAndroid, Alert } from 'react-native';
import Geolocation, { type GeoOptions } from '@react-native-community/geolocation';

export type CapturedLocation = {
  latitude: number;
  longitude: number;
};

export type ReverseGeocodeResult = {
  latitude: number;
  longitude: number;
  displayName: string;
  province: string | null;
  city: string | null;
  postalCode: string | null;
  street: string | null;
  houseNumber: string | null;
};

async function requestAndroidLocationPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  const fine = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    {
      title: 'Ubicación',
      message:
        'Tickets Transfer usa tu ubicación para mostrarte eventos cercanos y completar tu dirección.',
      buttonPositive: 'Permitir',
      buttonNegative: 'Cancelar',
    }
  );
  if (fine === PermissionsAndroid.RESULTS.GRANTED) return true;
  const coarse = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
    {
      title: 'Ubicación aproximada',
      message: 'Podemos usar ubicación aproximada si no concedés GPS preciso.',
      buttonPositive: 'Permitir',
      buttonNegative: 'Cancelar',
    }
  );
  return coarse === PermissionsAndroid.RESULTS.GRANTED;
}

function getPosition(options: GeoOptions): Promise<CapturedLocation> {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      (err) => reject(err),
      options
    );
  });
}

function friendlyLocationError(err: unknown): string {
  const geoErr = err as { code?: number; message?: string };
  if (geoErr.code === 1) {
    return 'Permiso de ubicación denegado. Activá el permiso en ajustes o completá la dirección manualmente.';
  }
  if (geoErr.code === 2) {
    return 'Ubicación no disponible. Verificá que el GPS esté activado o completá la dirección manualmente.';
  }
  if (geoErr.code === 3 || String(geoErr.message || '').toLowerCase().includes('timeout')) {
    return 'La ubicación tardó demasiado. Probá al aire libre, activá el GPS o completá la dirección manualmente.';
  }
  return geoErr.message || 'No se pudo obtener la ubicación';
}

/**
 * Obtiene la posición actual: primero red rápida (baja precisión), luego GPS fino.
 */
export async function getCurrentDeviceLocation(): Promise<CapturedLocation> {
  const ok = await requestAndroidLocationPermission();
  if (!ok) {
    throw new Error('Permiso de ubicación denegado');
  }

  try {
    return await getPosition({
      enableHighAccuracy: false,
      timeout: 28000,
      maximumAge: 300000,
    });
  } catch (firstErr) {
    try {
      return await getPosition({
        enableHighAccuracy: true,
        timeout: 45000,
        maximumAge: 0,
      });
    } catch {
      throw new Error(friendlyLocationError(firstErr));
    }
  }
}

export function showLocationError(message: string) {
  Alert.alert('Ubicación', message);
}
