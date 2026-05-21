/**
 * Tipos de navegación – Tickets Transfer móvil
 * Ubicación: apps/mobile/src/navigation/types.ts
 */

import type { NavigatorScreenParams } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

/** Pestañas inferiores (Main autenticado) */
export type MainTabParamList = {
  Home: { refreshListings?: boolean } | undefined;
  Tienda: undefined;
  MisTickets: undefined;
  Favoritos: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  PreferencesOnboarding: undefined;
  Main: NavigatorScreenParams<MainTabParamList> | undefined;
  Kyc: undefined;
  KycWebView: { sessionUrl: string };
  Publish: { editListingId?: string };
  ComprarTicket: undefined;
  ComprarTicketDetalle: { listingId: string; password: string };
  MyListingDetail: { listingId: string };
  OrderDetail: { orderId: string; source: 'buyer' | 'seller' };
  OrderPurchaseDetails: { listingId: string; password: string };
  OrderPago: { orderId: string; checkoutUrl?: string };
  OrderPaymentResult: { orderId: string; status?: 'success' | 'failure' | 'pending' };
  MyPurchases: undefined;
  MySales: undefined;
  TarjetasAdheridas: undefined;
  CardFormWebView: { returnTo?: 'OrderPago'; orderId?: string } | undefined;
  ChatSoporte: undefined;
  Mensajes: undefined;
  MensajesConversation: {
    conversationId: string;
    otherUser: {
      id: string;
      email: string;
      firstName?: string | null;
      lastName?: string | null;
      username?: string | null;
      numeroId?: string | null;
      profileImageUrl?: string | null;
    };
  };
  Acerca: undefined;
  PoliticaPrivacidad: undefined;
  TerminosYCondiciones: undefined;
  SolicitarBaja: undefined;
  RecomendacionesQuejas: undefined;
  PreguntasFrecuentes: undefined;
};

export type RootStackNavigationProp = NativeStackNavigationProp<RootStackParamList>;

/** Desde una pantalla dentro de tabs hacia rutas del stack raíz */
export type TabCompositeNavigationProp<T extends keyof MainTabParamList> = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, T>,
  RootStackNavigationProp
>;
