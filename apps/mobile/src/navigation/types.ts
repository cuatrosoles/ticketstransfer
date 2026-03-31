/**
 * Tipos de navegación – Tickets Transfer móvil
 * Ubicación: apps/mobile/src/navigation/types.ts
 */

export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  Main: { openMenu?: boolean };
  Home: undefined;
  Kyc: undefined;
  KycWebView: { sessionUrl: string };
  Publish: { editListingId?: string };
  ComprarTicket: undefined;
  /** Marketplace: catálogo completo de tickets públicos */
  Tienda: undefined;
  ComprarTicketDetalle: { listingId: string; password: string };
  MyListingDetail: { listingId: string };
  OrderPago: { orderId: string; checkoutUrl?: string };
  MyPurchases: undefined;
  MySales: undefined;
  Profile: undefined;
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
};
