#!/usr/bin/env node
/**
 * Script de migración: PostgreSQL → Firebase (Auth, Firestore, Storage)
 *
 * Requiere:
 * - DATABASE_URL (PostgreSQL)
 * - GOOGLE_APPLICATION_CREDENTIALS o FIREBASE_SERVICE_ACCOUNT_JSON
 * - FIREBASE_STORAGE_BUCKET
 *
 * Ejecutar: node scripts/migrate-postgres-to-firebase.mjs
 * O: pnpm exec node scripts/migrate-postgres-to-firebase.mjs
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import admin from 'firebase-admin';
import https from 'https';
import http from 'http';

const prisma = new PrismaClient();

// Inicializar Firebase Admin
function initFirebase() {
  if (admin.apps.length > 0) return admin.app();
  const jsonCred = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (jsonCred) {
    const cred = JSON.parse(jsonCred);
    return admin.initializeApp({
      credential: admin.credential.cert(cred),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
  }
  if (credPath) {
    return admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
  }
  throw new Error('Configurá FIREBASE_SERVICE_ACCOUNT_JSON o GOOGLE_APPLICATION_CREDENTIALS');
}

const db = admin.firestore();
const auth = admin.auth();
const bucket = () => admin.storage().bucket(process.env.FIREBASE_STORAGE_BUCKET);

const COLLECTIONS = {
  USERS: 'users',
  USER_ONBOARDING: 'userOnboarding',
  KYC_VERIFICATIONS: 'kycVerifications',
  TICKET_LISTINGS: 'ticketListings',
  ORDERS: 'orders',
  ORDER_RATINGS: 'orderRatings',
  DISPUTES: 'disputes',
  DISPUTE_MESSAGES: 'disputeMessages',
  CONVERSATIONS: 'conversations',
  MESSAGES: 'messages',
};

/** Descarga un archivo desde URL y retorna Buffer */
function downloadUrl(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        downloadUrl(res.headers.location).then(resolve).catch(reject);
        return;
      }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

/** Sube un buffer a Firebase Storage y retorna la URL pública */
async function uploadToStorage(path, buffer, contentType = 'image/jpeg') {
  const file = bucket().file(path);
  await file.save(buffer, { metadata: { contentType } });
  await file.makePublic();
  return `https://storage.googleapis.com/${bucket().name}/${path}`;
}

/** Migra una URL a Storage si es local o descargable */
async function migrateFileUrl(url, basePath, defaultUrl = null) {
  if (!url) return defaultUrl;
  if (url.startsWith('https://storage.googleapis.com/')) return url; // Ya en Storage
  try {
    const buffer = url.startsWith('http') ? await downloadUrl(url) : null;
    if (!buffer) return url; // URL local no descargable, mantener
    const ext = url.split('.').pop()?.split('?')[0] || 'jpg';
    const storagePath = `${basePath}/${Date.now()}.${ext}`;
    return await uploadToStorage(storagePath, buffer);
  } catch (e) {
    console.warn('  No se pudo migrar archivo:', url, e.message);
    return url;
  }
}

async function migrate() {
  console.log('Iniciando migración PostgreSQL → Firebase...\n');

  initFirebase();

  // 1. Usuarios → Firebase Auth + Firestore users
  console.log('1. Migrando usuarios...');
  const users = await prisma.user.findMany({ orderBy: { createdAt: 'asc' } });
  const userIdMap = new Map(); // oldId -> newId (puede ser el mismo si usamos UUID)

  for (const u of users) {
    try {
      // Crear en Firebase Auth con el mismo UID (UUID de PostgreSQL)
      const uid = u.id;
      try {
        await auth.createUser({
          uid,
          email: u.email,
          password: 'TempMigracion2024!', // Los usuarios deben resetear contraseña
          displayName: [u.firstName, u.lastName].filter(Boolean).join(' ').trim() || undefined,
        });
      } catch (e) {
        if (e.code === 'auth/uid-already-exists' || e.code === 'auth/email-already-exists') {
          console.log(`  Usuario ${u.email} ya existe en Firebase Auth, continuando...`);
        } else throw e;
      }

      userIdMap.set(u.id, uid);

      const userData = {
        email: u.email,
        username: u.username,
        numeroId: u.numeroId,
        firstName: u.firstName,
        lastName: u.lastName,
        country: u.country,
        tipoDocumento: u.tipoDocumento,
        documentNumber: u.documentNumber,
        sexo: u.sexo,
        phone: u.phone,
        phoneVerified: u.phoneVerified,
        dateOfBirth: u.dateOfBirth,
        city: u.city,
        province: u.province,
        postalCode: u.postalCode,
        role: u.role,
        emailVerified: u.emailVerified,
        reputationScore: u.reputationScore ?? 0,
        profileImageUrl: u.profileImageUrl,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
      };

      if (u.profileImageUrl && u.profileImageUrl.includes('http')) {
        userData.profileImageUrl = await migrateFileUrl(u.profileImageUrl, `avatars/${uid}`);
      }

      await db.collection(COLLECTIONS.USERS).doc(uid).set(userData);
      console.log(`  ✓ ${u.email}`);
    } catch (e) {
      console.error(`  ✗ ${u.email}:`, e.message);
    }
  }

  // 2. UserOnboarding
  console.log('\n2. Migrando onboarding...');
  const onboardings = await prisma.userOnboarding.findMany();
  for (const o of onboardings) {
    const newUserId = userIdMap.get(o.userId) || o.userId;
    await db.collection(COLLECTIONS.USER_ONBOARDING).doc(newUserId).set({
      userId: newUserId,
      accion: o.accion,
      ticketeras: o.ticketeras,
      appsBoletos: o.appsBoletos,
      createdAt: o.createdAt,
      updatedAt: o.updatedAt,
    });
  }
  console.log(`  ✓ ${onboardings.length} onboarding(s)`);

  // 3. KYC
  console.log('\n3. Migrando KYC...');
  const kycs = await prisma.kycVerification.findMany();
  for (const k of kycs) {
    const newUserId = userIdMap.get(k.userId) || k.userId;
    let dniFrontUrl = k.dniFrontUrl;
    let dniBackUrl = k.dniBackUrl;
    let selfieUrl = k.selfieUrl;
    if (k.dniFrontUrl?.startsWith('http')) {
      dniFrontUrl = await migrateFileUrl(k.dniFrontUrl, `kyc/${newUserId}`);
    }
    if (k.dniBackUrl?.startsWith('http')) {
      dniBackUrl = await migrateFileUrl(k.dniBackUrl, `kyc/${newUserId}`);
    }
    if (k.selfieUrl?.startsWith('http')) {
      selfieUrl = await migrateFileUrl(k.selfieUrl, `kyc/${newUserId}`);
    }
    await db.collection(COLLECTIONS.KYC_VERIFICATIONS).doc(newUserId).set({
      userId: newUserId,
      status: k.status,
      diditSessionId: k.diditSessionId,
      dniFrontUrl,
      dniBackUrl,
      selfieUrl,
      rejectionReason: k.rejectionReason,
      reviewedAt: k.reviewedAt,
      reviewedBy: k.reviewedBy,
      createdAt: k.createdAt,
      updatedAt: k.updatedAt,
    });
  }
  console.log(`  ✓ ${kycs.length} KYC(s)`);

  // 4. TicketListings (mapear sellerId)
  console.log('\n4. Migrando publicaciones de tickets...');
  const listings = await prisma.ticketListing.findMany();
  const listingIdMap = new Map();
  for (const t of listings) {
    const newSellerId = userIdMap.get(t.sellerId) || t.sellerId;
    const id = t.id;
    listingIdMap.set(t.id, id);

    let captureTicketUrl = t.captureTicketUrl;
    let captureOwnershipUrl = t.captureOwnershipUrl;
    if (t.captureTicketUrl?.startsWith('http')) {
      captureTicketUrl = await migrateFileUrl(t.captureTicketUrl, `tickets/${id}`);
    }
    if (t.captureOwnershipUrl?.startsWith('http')) {
      captureOwnershipUrl = await migrateFileUrl(t.captureOwnershipUrl, `tickets/${id}`);
    }

    await db.collection(COLLECTIONS.TICKET_LISTINGS).doc(id).set({
      sellerId: newSellerId,
      eventName: t.eventName,
      eventDate: t.eventDate,
      eventPlace: t.eventPlace,
      sector: t.sector,
      row: t.row,
      seat: t.seat,
      quantityEntries: t.quantityEntries,
      tipoEntrada: t.tipoEntrada,
      price: t.price,
      currency: t.currency,
      ticketera: t.ticketera,
      appBoletos: t.appBoletos,
      orderRef: t.orderRef,
      category: t.category,
      status: t.status,
      captureTicketUrl,
      captureOwnershipUrl,
      publicationPassword: t.publicationPassword,
      ticketeraOtra: t.ticketeraOtra,
      appBoletosOtra: t.appBoletosOtra,
      tipoEntradaOtro: t.tipoEntradaOtro,
      verificationResult: t.verificationResult,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    });
  }
  console.log(`  ✓ ${listings.length} ticket(s)`);

  // 5. Orders
  console.log('\n5. Migrando órdenes...');
  const orders = await prisma.order.findMany();
  const orderIdMap = new Map();
  for (const o of orders) {
    const id = o.id;
    orderIdMap.set(o.id, id);
    const newBuyerId = userIdMap.get(o.buyerId) || o.buyerId;
    const newSellerId = userIdMap.get(o.sellerId) || o.sellerId;

    let evidenceUrl = o.evidenceUrl;
    if (o.evidenceUrl?.startsWith('http')) {
      evidenceUrl = await migrateFileUrl(o.evidenceUrl, `evidence/${id}`);
    }

    await db.collection(COLLECTIONS.ORDERS).doc(id).set({
      ticketListingId: o.ticketListingId,
      buyerId: newBuyerId,
      sellerId: newSellerId,
      status: o.status,
      totalAmount: o.totalAmount,
      currency: o.currency,
      commissionAmount: o.commissionAmount,
      paymentIntentId: o.paymentIntentId,
      paymentMethod: o.paymentMethod,
      transferDeadline: o.transferDeadline,
      buyerConfirmedAt: o.buyerConfirmedAt,
      evidenceUrl,
      verificationResult: o.verificationResult,
      completedAt: o.completedAt,
      createdAt: o.createdAt,
      updatedAt: o.updatedAt,
    });
  }
  console.log(`  ✓ ${orders.length} orden(es)`);

  // 6. OrderRatings
  console.log('\n6. Migrando ratings...');
  const ratings = await prisma.orderRating.findMany();
  for (const r of ratings) {
    const newRaterId = userIdMap.get(r.raterId) || r.raterId;
    const newRatedUserId = userIdMap.get(r.ratedUserId) || r.ratedUserId;
    await db.collection(COLLECTIONS.ORDER_RATINGS).doc(`${r.orderId}_${newRaterId}`).set({
      orderId: r.orderId,
      raterId: newRaterId,
      ratedUserId: newRatedUserId,
      positive: r.positive,
      points: r.points,
      createdAt: r.createdAt,
    });
  }
  console.log(`  ✓ ${ratings.length} rating(s)`);

  // 7. Disputes
  console.log('\n7. Migrando disputas...');
  const disputes = await prisma.dispute.findMany();
  for (const d of disputes) {
    await db.collection(COLLECTIONS.DISPUTES).doc(d.id).set({
      orderId: d.orderId,
      status: d.status,
      reason: d.reason,
      resolution: d.resolution,
      resolvedAt: d.resolvedAt,
      resolvedBy: d.resolvedBy,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    });
  }
  console.log(`  ✓ ${disputes.length} disputa(s)`);

  // 8. DisputeMessages
  console.log('\n8. Migrando mensajes de disputas...');
  const disputeMsgs = await prisma.disputeMessage.findMany();
  for (const m of disputeMsgs) {
    const newUserId = userIdMap.get(m.userId) || m.userId;
    await db.collection(COLLECTIONS.DISPUTE_MESSAGES).doc(m.id).set({
      disputeId: m.disputeId,
      userId: newUserId,
      content: m.content,
      isModerator: m.isModerator,
      attachmentUrl: m.attachmentUrl,
      createdAt: m.createdAt,
    });
  }
  console.log(`  ✓ ${disputeMsgs.length} mensaje(s) de disputa`);

  // 9. Conversations (normalizar user1 < user2)
  console.log('\n9. Migrando conversaciones...');
  const convs = await prisma.conversation.findMany();
  const convIdMap = new Map();
  for (const c of convs) {
    const u1 = userIdMap.get(c.user1Id) || c.user1Id;
    const u2 = userIdMap.get(c.user2Id) || c.user2Id;
    const [user1Id, user2Id] = u1 < u2 ? [u1, u2] : [u2, u1];
    convIdMap.set(c.id, c.id);
    await db.collection(COLLECTIONS.CONVERSATIONS).doc(c.id).set({
      user1Id,
      user2Id,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    });
  }
  console.log(`  ✓ ${convs.length} conversación(es)`);

  // 10. Messages
  console.log('\n10. Migrando mensajes...');
  const msgs = await prisma.message.findMany();
  for (const m of msgs) {
    const newSenderId = userIdMap.get(m.senderId) || m.senderId;
    await db.collection(COLLECTIONS.MESSAGES).doc(m.id).set({
      conversationId: m.conversationId,
      senderId: newSenderId,
      content: m.content,
      readAt: m.readAt,
      createdAt: m.createdAt,
    });
  }
  console.log(`  ✓ ${msgs.length} mensaje(s)`);

  console.log('\n✅ Migración completada.');
  console.log('\nIMPORTANTE: Los usuarios migrados tienen contraseña temporal "TempMigracion2024!"');
  console.log('Deben usar "Olvidé mi contraseña" para establecer una nueva.');
}

migrate()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
