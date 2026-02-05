/**
 * Navegación principal – Stack + flujo auth
 * Ubicación: apps/mobile/src/navigation/RootNavigator.tsx
 */

import * as React from 'react';
import { Image } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import type { RootStackParamList } from './types';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { KycScreen } from '../screens/KycScreen';
import { PublishTicketScreen } from '../screens/PublishTicketScreen';
import { MyPurchasesScreen } from '../screens/MyPurchasesScreen';
import { MySalesScreen } from '../screens/MySalesScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#0f172a' },
        headerTintColor: '#f8fafc',
        contentStyle: { backgroundColor: '#0f172a' },
      }}
    >
      {!user ? (
        <>
          <Stack.Screen
            name="Welcome"
            component={WelcomeScreen}
            options={{
              headerTitle: () => (
                <Image source={require('../assets/images/LogoTT-v01.png')} style={{ width: 400, height: 120 }} resizeMode="contain" />
              ),
            }}
          />
          <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Iniciar sesión' }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Crear cuenta' }} />
        </>
      ) : (
        <>
          <Stack.Screen name="Main" component={HomeScreen} options={{ title: 'Inicio' }} />
          <Stack.Screen name="Kyc" component={KycScreen} options={{ title: 'Verificación KYC' }} />
          <Stack.Screen name="Publish" component={PublishTicketScreen} options={{ title: 'Publicar ticket' }} />
          <Stack.Screen name="MyPurchases" component={MyPurchasesScreen} options={{ title: 'Mis compras' }} />
          <Stack.Screen name="MySales" component={MySalesScreen} options={{ title: 'Mis ventas' }} />
        </>
      )}
    </Stack.Navigator>
  );
}
