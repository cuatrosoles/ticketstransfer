/**
 * Navegación principal – Stack + flujo auth
 * Header unificado: Back + Logo + Título + User (compacto).
 */

import * as React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ScreenHeader } from '../components/ScreenHeader';
import { UserMenuButton } from '../components/UserMenuButton';
import { UserMenuModal } from '../components/UserMenuModal';
import { useAuth } from '../context/AuthContext';
import { UserMenuProvider } from '../context/UserMenuContext';
import type { RootStackParamList } from './types';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { KycScreen } from '../screens/KycScreen';
import { KycWebViewScreen } from '../screens/KycWebViewScreen';
import { PublishTicketScreen } from '../screens/PublishTicketScreen';
import { ComprarTicketScreen } from '../screens/ComprarTicketScreen';
import { MyPurchasesScreen } from '../screens/MyPurchasesScreen';
import { MySalesScreen } from '../screens/MySalesScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { TarjetasAdheridasScreen } from '../screens/TarjetasAdheridasScreen';
import { ChatSoporteScreen } from '../screens/ChatSoporteScreen';
import { MensajesScreen } from '../screens/MensajesScreen';
import { MensajesConversationScreen } from '../screens/MensajesConversationScreen';
import { OrderPagoScreen } from '../screens/OrderPagoScreen';
import { AcercaScreen } from '../screens/AcercaScreen';
import { PoliticaPrivacidadScreen } from '../screens/PoliticaPrivacidadScreen';
import { TerminosYCondicionesScreen } from '../screens/TerminosYCondicionesScreen';
import { SolicitarBajaScreen } from '../screens/SolicitarBajaScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const HEADER_OPTIONS = {
  headerTransparent: true,
  headerStyle: { backgroundColor: 'transparent' },
  headerBackVisible: false,
  headerShadowVisible: false,
};

export function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <UserMenuProvider>
      <Stack.Navigator
        screenOptions={{
          headerTintColor: '#f8fafc',
          contentStyle: { backgroundColor: 'transparent' },
        }}
      >
        {!user ? (
        <>
          <Stack.Screen
            name="Welcome"
            component={WelcomeScreen}
            options={{
              ...HEADER_OPTIONS,
              headerTitle: () => <ScreenHeader title="¡BIENVENIDOS!" />,
              headerLeft: () => null,
              headerRight: () => null,
            }}
          />
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={({ navigation }) => ({
              ...HEADER_OPTIONS,
              headerTitle: () => (
                <ScreenHeader title="INICIAR SESIÓN" showBack onBack={() => navigation.goBack()} />
              ),
              headerLeft: () => null,
              headerRight: () => null,
            })}
          />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={({ navigation }) => ({
              ...HEADER_OPTIONS,
              headerTitle: () => (
                <ScreenHeader title="CREAR CUENTA" showBack onBack={() => navigation.goBack()} />
              ),
              headerLeft: () => null,
              headerRight: () => null,
            })}
          />
          <Stack.Screen
            name="PoliticaPrivacidad"
            component={PoliticaPrivacidadScreen}
            options={({ navigation }) => ({
              ...HEADER_OPTIONS,
              headerTitle: () => (
                <ScreenHeader title="Política de privacidad" showBack onBack={() => navigation.goBack()} />
              ),
              headerLeft: () => null,
              headerRight: () => null,
            })}
          />
          <Stack.Screen
            name="TerminosYCondiciones"
            component={TerminosYCondicionesScreen}
            options={({ navigation }) => ({
              ...HEADER_OPTIONS,
              headerTitle: () => (
                <ScreenHeader title="Términos y condiciones" showBack onBack={() => navigation.goBack()} />
              ),
              headerLeft: () => null,
              headerRight: () => null,
            })}
          />
        </>
      ) : (
        <>
          <Stack.Screen
            name="Main"
            component={HomeScreen}
            options={({ navigation }) => ({
              ...HEADER_OPTIONS,
              headerTitle: () => (
                <ScreenHeader
                  title="INICIO"
                  showBack={navigation.canGoBack()}
                  onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined}
                  rightSlot={<UserMenuButton />}
                />
              ),
              headerLeft: () => null,
              headerRight: () => null,
            })}
          />
          <Stack.Screen
            name="Kyc"
            component={KycScreen}
            options={({ navigation }) => ({
              ...HEADER_OPTIONS,
              headerTitle: () => (
                <ScreenHeader
                  title="Verificación KYC"
                  showBack
                  onBack={() => navigation.goBack()}
                  rightSlot={<UserMenuButton />}
                />
              ),
              headerLeft: () => null,
              headerRight: () => null,
            })}
          />
          <Stack.Screen
            name="KycWebView"
            component={KycWebViewScreen}
            options={{
              ...HEADER_OPTIONS,
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="Publish"
            component={PublishTicketScreen}
            options={{ ...HEADER_OPTIONS, headerShown: false }}
          />
          <Stack.Screen
            name="ComprarTicket"
            component={ComprarTicketScreen}
            options={({ navigation }) => ({
              ...HEADER_OPTIONS,
              headerTitle: () => (
                <ScreenHeader
                  title="Comprar Ticket"
                  showBack
                  onBack={() => navigation.goBack()}
                  rightSlot={<UserMenuButton />}
                />
              ),
              headerLeft: () => null,
              headerRight: () => null,
            })}
          />
          <Stack.Screen
            name="MyPurchases"
            component={MyPurchasesScreen}
            options={({ navigation }) => ({
              ...HEADER_OPTIONS,
              headerTitle: () => (
                <ScreenHeader
                  title="Mis compras"
                  showBack
                  onBack={() => navigation.goBack()}
                  rightSlot={<UserMenuButton />}
                />
              ),
              headerLeft: () => null,
              headerRight: () => null,
            })}
          />
          <Stack.Screen
            name="MySales"
            component={MySalesScreen}
            options={({ navigation }) => ({
              ...HEADER_OPTIONS,
              headerTitle: () => (
                <ScreenHeader
                  title="Mis ventas"
                  showBack
                  onBack={() => navigation.goBack()}
                  rightSlot={<UserMenuButton />}
                />
              ),
              headerLeft: () => null,
              headerRight: () => null,
            })}
          />
          <Stack.Screen
            name="Profile"
            component={ProfileScreen}
            options={({ navigation }) => ({
              ...HEADER_OPTIONS,
              headerTitle: () => (
                <ScreenHeader
                  title="Mi perfil"
                  showBack
                  onBack={() => navigation.goBack()}
                  rightSlot={<UserMenuButton />}
                />
              ),
              headerLeft: () => null,
              headerRight: () => null,
            })}
          />
          <Stack.Screen
            name="TarjetasAdheridas"
            component={TarjetasAdheridasScreen}
            options={({ navigation }) => ({
              ...HEADER_OPTIONS,
              headerTitle: () => (
                <ScreenHeader
                  title="Tarjetas adheridas"
                  showBack
                  onBack={() => navigation.goBack()}
                  rightSlot={<UserMenuButton />}
                />
              ),
              headerLeft: () => null,
              headerRight: () => null,
            })}
          />
          <Stack.Screen
            name="ChatSoporte"
            component={ChatSoporteScreen}
            options={({ navigation }) => ({
              ...HEADER_OPTIONS,
              headerTitle: () => (
                <ScreenHeader
                  title="Chat Soporte"
                  showBack
                  onBack={() => navigation.goBack()}
                  rightSlot={<UserMenuButton />}
                />
              ),
              headerLeft: () => null,
              headerRight: () => null,
            })}
          />
          <Stack.Screen
            name="Mensajes"
            component={MensajesScreen}
            options={({ navigation }) => ({
              ...HEADER_OPTIONS,
              headerTitle: () => (
                <ScreenHeader
                  title="Mensajes"
                  showBack
                  onBack={() => navigation.goBack()}
                  rightSlot={<UserMenuButton />}
                />
              ),
              headerLeft: () => null,
              headerRight: () => null,
            })}
          />
          <Stack.Screen
            name="MensajesConversation"
            component={MensajesConversationScreen}
            options={({ navigation, route }) => {
              const params = route.params as RootStackParamList['MensajesConversation'];
              const title =
                params.otherUser?.username ||
                [params.otherUser?.firstName, params.otherUser?.lastName].filter(Boolean).join(' ') ||
                params.otherUser?.email ||
                'Conversación';
              return {
                ...HEADER_OPTIONS,
                headerTitle: () => (
                  <ScreenHeader
                    title={title}
                    showBack
                    onBack={() => navigation.goBack()}
                    rightSlot={<UserMenuButton />}
                  />
                ),
                headerLeft: () => null,
                headerRight: () => null,
              };
            }}
          />
          <Stack.Screen
            name="OrderPago"
            component={OrderPagoScreen}
            options={({ navigation }) => ({
              ...HEADER_OPTIONS,
              headerTitle: () => (
                <ScreenHeader
                  title="Pago"
                  showBack
                  onBack={() => navigation.goBack()}
                  rightSlot={<UserMenuButton />}
                />
              ),
              headerLeft: () => null,
              headerRight: () => null,
            })}
          />
          <Stack.Screen
            name="Acerca"
            component={AcercaScreen}
            options={({ navigation }) => ({
              ...HEADER_OPTIONS,
              headerTitle: () => (
                <ScreenHeader
                  title="Acerca de"
                  showBack
                  onBack={() => navigation.goBack()}
                  rightSlot={<UserMenuButton />}
                />
              ),
              headerLeft: () => null,
              headerRight: () => null,
            })}
          />
          <Stack.Screen
            name="PoliticaPrivacidad"
            component={PoliticaPrivacidadScreen}
            options={({ navigation }) => ({
              ...HEADER_OPTIONS,
              headerTitle: () => (
                <ScreenHeader
                  title="Política de privacidad"
                  showBack
                  onBack={() => navigation.goBack()}
                  rightSlot={<UserMenuButton />}
                />
              ),
              headerLeft: () => null,
              headerRight: () => null,
            })}
          />
          <Stack.Screen
            name="TerminosYCondiciones"
            component={TerminosYCondicionesScreen}
            options={({ navigation }) => ({
              ...HEADER_OPTIONS,
              headerTitle: () => (
                <ScreenHeader
                  title="Términos y condiciones"
                  showBack
                  onBack={() => navigation.goBack()}
                  rightSlot={<UserMenuButton />}
                />
              ),
              headerLeft: () => null,
              headerRight: () => null,
            })}
          />
          <Stack.Screen
            name="SolicitarBaja"
            component={SolicitarBajaScreen}
            options={({ navigation }) => ({
              ...HEADER_OPTIONS,
              headerTitle: () => (
                <ScreenHeader
                  title="Solicitar baja de cuenta"
                  showBack
                  onBack={() => navigation.goBack()}
                  rightSlot={<UserMenuButton />}
                />
              ),
              headerLeft: () => null,
              headerRight: () => null,
            })}
          />
        </>
      )}
      </Stack.Navigator>
      {user && <UserMenuModal />}
    </UserMenuProvider>
  );
}
