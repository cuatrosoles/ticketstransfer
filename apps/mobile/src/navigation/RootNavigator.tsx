/**
 * Navegación principal – Stack + flujo auth
 * Header dentro del scroll en cada pantalla (sin sticky).
 */

import * as React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { UserMenuModal } from '../components/UserMenuModal';
import { useAuth } from '../context/AuthContext';
import { UserMenuProvider } from '../context/UserMenuContext';
import type { RootStackParamList } from './types';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { MainTabNavigator } from './MainTabNavigator';
import { KycScreen } from '../screens/KycScreen';
import { KycWebViewScreen } from '../screens/KycWebViewScreen';
import { PublishTicketScreen } from '../screens/PublishTicketScreen';
import { ComprarTicketScreen } from '../screens/ComprarTicketScreen';
import { ComprarTicketDetalleScreen } from '../screens/ComprarTicketDetalleScreen';
import { MyListingDetailScreen } from '../screens/MyListingDetailScreen';
import { MyPurchasesScreen } from '../screens/MyPurchasesScreen';
import { MySalesScreen } from '../screens/MySalesScreen';
import { TarjetasAdheridasScreen } from '../screens/TarjetasAdheridasScreen';
import { CardFormWebViewScreen } from '../screens/CardFormWebViewScreen';
import { ChatSoporteScreen } from '../screens/ChatSoporteScreen';
import { MensajesScreen } from '../screens/MensajesScreen';
import { MensajesConversationScreen } from '../screens/MensajesConversationScreen';
import { OrderPagoScreen } from '../screens/OrderPagoScreen';
import { OrderDetailScreen } from '../screens/OrderDetailScreen';
import { OrderPurchaseDetailsScreen } from '../screens/OrderPurchaseDetailsScreen';
import { AcercaScreen } from '../screens/AcercaScreen';
import { PoliticaPrivacidadScreen } from '../screens/PoliticaPrivacidadScreen';
import { TerminosYCondicionesScreen } from '../screens/TerminosYCondicionesScreen';
import { SolicitarBajaScreen } from '../screens/SolicitarBajaScreen';
import { RecomendacionesQuejasScreen } from '../screens/RecomendacionesQuejasScreen';
import { PreguntasFrecuentesScreen } from '../screens/PreguntasFrecuentesScreen';
import { AppLockScreen } from '../components/AppLockScreen';
import { useBranding } from '../context/BrandingContext';

const Stack = createNativeStackNavigator<RootStackParamList>();

const NO_HEADER = { headerShown: false };

export function RootNavigator() {
  const { user, loading, biometricEnabled, isAppUnlocked, unlockWithBiometrics, logout } = useAuth();
  const brand = useBranding();
  const [unlocking, setUnlocking] = React.useState(false);

  if (loading) {
    return null;
  }

  if (user && biometricEnabled && !isAppUnlocked) {
    return (
      <AppLockScreen
        unlocking={unlocking}
        onUnlock={async () => {
          if (unlocking) return;
          setUnlocking(true);
          try {
            await unlockWithBiometrics();
          } finally {
            setUnlocking(false);
          }
        }}
        onLogout={() => {
          void logout();
        }}
      />
    );
  }

  return (
    <UserMenuProvider>
      <Stack.Navigator
        screenOptions={{
          headerTintColor: brand.primaryLight,
          contentStyle: { backgroundColor: 'transparent' },
        }}
      >
        {!user ? (
        <>
          <Stack.Screen name="Welcome" component={WelcomeScreen} options={NO_HEADER} />
          <Stack.Screen name="Login" component={LoginScreen} options={NO_HEADER} />
          <Stack.Screen name="Register" component={RegisterScreen} options={NO_HEADER} />
          <Stack.Screen name="PoliticaPrivacidad" component={PoliticaPrivacidadScreen} options={NO_HEADER} />
          <Stack.Screen name="TerminosYCondiciones" component={TerminosYCondicionesScreen} options={NO_HEADER} />
        </>
      ) : (
        <>
          <Stack.Screen name="Main" component={MainTabNavigator} options={NO_HEADER} />
          <Stack.Screen name="Kyc" component={KycScreen} options={NO_HEADER} />
          <Stack.Screen name="KycWebView" component={KycWebViewScreen} options={NO_HEADER} />
          <Stack.Screen name="Publish" component={PublishTicketScreen} options={NO_HEADER} />
          <Stack.Screen name="ComprarTicket" component={ComprarTicketScreen} options={NO_HEADER} />
          <Stack.Screen name="ComprarTicketDetalle" component={ComprarTicketDetalleScreen} options={NO_HEADER} />
          <Stack.Screen name="OrderPurchaseDetails" component={OrderPurchaseDetailsScreen} options={NO_HEADER} />
          <Stack.Screen name="MyListingDetail" component={MyListingDetailScreen} options={NO_HEADER} />
          <Stack.Screen name="MyPurchases" component={MyPurchasesScreen} options={NO_HEADER} />
          <Stack.Screen name="MySales" component={MySalesScreen} options={NO_HEADER} />
          <Stack.Screen name="OrderDetail" component={OrderDetailScreen} options={NO_HEADER} />
          <Stack.Screen name="TarjetasAdheridas" component={TarjetasAdheridasScreen} options={NO_HEADER} />
          <Stack.Screen name="CardFormWebView" component={CardFormWebViewScreen} options={NO_HEADER} />
          <Stack.Screen name="ChatSoporte" component={ChatSoporteScreen} options={NO_HEADER} />
          <Stack.Screen name="Mensajes" component={MensajesScreen} options={NO_HEADER} />
          <Stack.Screen name="MensajesConversation" component={MensajesConversationScreen} options={NO_HEADER} />
          <Stack.Screen name="OrderPago" component={OrderPagoScreen} options={NO_HEADER} />
          <Stack.Screen name="Acerca" component={AcercaScreen} options={NO_HEADER} />
          <Stack.Screen name="PoliticaPrivacidad" component={PoliticaPrivacidadScreen} options={NO_HEADER} />
          <Stack.Screen name="TerminosYCondiciones" component={TerminosYCondicionesScreen} options={NO_HEADER} />
          <Stack.Screen name="SolicitarBaja" component={SolicitarBajaScreen} options={NO_HEADER} />
          <Stack.Screen name="RecomendacionesQuejas" component={RecomendacionesQuejasScreen} options={NO_HEADER} />
          <Stack.Screen name="PreguntasFrecuentes" component={PreguntasFrecuentesScreen} options={NO_HEADER} />
        </>
      )}
      </Stack.Navigator>
      {user && <UserMenuModal />}
    </UserMenuProvider>
  );
}
