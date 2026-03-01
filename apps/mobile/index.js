import { AppRegistry } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import App from './App';
import { name as appName } from './app.json';

// Handler para notificaciones recibidas en background (evita el warning)
messaging().setBackgroundMessageHandler(async () => {
  // La notificación se muestra automáticamente por el sistema
});

AppRegistry.registerComponent(appName, () => App);
