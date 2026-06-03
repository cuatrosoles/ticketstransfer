/**
 * Obtención de ubicación GPS en React Native (permisos Android/iOS).
 */

import { Platform, PermissionsAndroid, Alert } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

export type CapturedLocation = {
  latitude: number;
  longitude: number;
};

async function requestAndroidLocationPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    {
      title: 'Ubicación',
      message:
        'Tickets Transfer usa tu ubicación para mostrarte eventos cercanos y mejorar las publicaciones.',
      buttonPositive: 'Permitir',
      buttonNegative: 'Cancelar',
    }
  );
  return granted === PermissionsAndroid.RESULTS.GRANTED;
}

/**
 * Obtiene la posición actual del dispositivo (una lectura).
 */
export async function getCurrentDeviceLocation(): Promise<CapturedLocation> {
  const ok = await requestAndroidLocationPermission();
  if (!ok) {
    throw new Error('Permiso de ubicación denegado');
  }

  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      (err) => {
        reject(new Error(err.message || 'No se pudo obtener la ubicación'));
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  });
}

export function showLocationError(message: string) {
  Alert.alert('Ubicación', message);
}
