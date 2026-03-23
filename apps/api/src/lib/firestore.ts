/**
 * Colecciones y helpers de Firestore.
 * Mapeo del esquema Prisma a Firestore.
 */

import { getFirestore } from './firebase-admin.js';
import type { FieldValue } from 'firebase-admin/firestore';

const db = () => getFirestore();

export const COLLECTIONS = {
  USERS: 'users',
  EMAIL_VERIFICATION_CODES: 'emailVerificationCodes',
  USER_ONBOARDING: 'userOnboarding',
  KYC_VERIFICATIONS: 'kycVerifications',
  TICKET_LISTINGS: 'ticketListings',
  ORDERS: 'orders',
  ORDER_RATINGS: 'orderRatings',
  DISPUTES: 'disputes',
  DISPUTE_MESSAGES: 'disputeMessages',
  CONVERSATIONS: 'conversations',
  MESSAGES: 'messages',
  PLATFORM_SETTINGS: 'platformSettings',
  SELLER_TRANSFERS: 'sellerTransfers',
} as const;

export type FirestoreFieldValue = FieldValue;

export { db };
