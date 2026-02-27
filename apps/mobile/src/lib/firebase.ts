/**
 * Configuración de Firebase para la app móvil.
 * Requiere google-services.json (Android) y GoogleService-Info.plist (iOS).
 * @react-native-firebase/app inicializa automáticamente con esos archivos.
 */

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import messaging from '@react-native-firebase/messaging';

export { auth, firestore, storage, messaging };
