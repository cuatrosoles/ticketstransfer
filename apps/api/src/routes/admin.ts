/**
 * Rutas exclusivas para administradores - Firestore.
 */

import { Router } from 'express';
import { db, COLLECTIONS } from '../lib/firestore.js';
import { requireAuth, requireAdmin, type AuthRequest } from '../middleware/auth.js';
import { getPlatformSettings, invalidateSettingsCache } from '../lib/settings.js';
import { getOrCreateCustomer, listCustomerCards } from '../lib/mercadopago.js';
import { getDiditSessionDecision, updateDiditSessionStatus } from '../lib/didit.js';
import {
  createPayoutToSeller,
  getSellerAmount,
  generateIdempotencyKey,
  markTransferAsManualComplete,
  retryTransfer,
} from '../lib/payouts.js';

const router = Router();

router.use(requireAuth);
router.use(requireAdmin);

/** Configuración de la plataforma */
router.get('/settings', async (_req, res) => {
  const settings = await getPlatformSettings();
  res.json({
    ...settings,
    mercadopago: {
      ...settings.mercadopago,
      accessToken: settings.mercadopago.accessToken ? '••••••••' + settings.mercadopago.accessToken.slice(-4) : '',
      publicKey: settings.mercadopago.publicKey ? '••••••••' + settings.mercadopago.publicKey.slice(-4) : '',
      webhookSecret: settings.mercadopago.webhookSecret ? '••••••••' : '',
    },
  });
});

router.put('/settings', async (req: AuthRequest, res) => {
  const body = req.body as Record<string, unknown>;
  const docRef = db().collection(COLLECTIONS.PLATFORM_SETTINGS).doc('main');
  const current = await getPlatformSettings();

  const updates: Record<string, unknown> = {
    updatedAt: new Date(),
  };

  if (typeof body.commissionPercentage === 'number' && body.commissionPercentage >= 0 && body.commissionPercentage <= 100) {
    updates.commissionPercentage = body.commissionPercentage;
  }

  if (typeof body.marketplaceHomePublicListingsLimit === 'number') {
    const n = Math.floor(body.marketplaceHomePublicListingsLimit);
    if (n >= 1 && n <= 50) {
      updates.marketplaceHomePublicListingsLimit = n;
    }
  }

  if (body.mercadopago && typeof body.mercadopago === 'object') {
    const mp = body.mercadopago as Record<string, unknown>;
    const useNew = (val: unknown, key: 'accessToken' | 'webhookSecret' | 'publicKey') =>
      typeof val === 'string' && val.length > 0 && !val.startsWith('••••') ? val : (current.mercadopago[key] || '');
    updates.mercadopago = {
      enabled: typeof mp.enabled === 'boolean' ? mp.enabled : current.mercadopago.enabled,
      accessToken: useNew(mp.accessToken, 'accessToken'),
      publicKey: useNew(mp.publicKey, 'publicKey'),
      webhookSecret: useNew(mp.webhookSecret, 'webhookSecret'),
      sandboxMode: typeof mp.sandboxMode === 'boolean' ? mp.sandboxMode : current.mercadopago.sandboxMode,
      backUrlBase: typeof mp.backUrlBase === 'string' ? mp.backUrlBase : (current.mercadopago.backUrlBase ?? ''),
      sandboxUsePayerTestCom: typeof mp.sandboxUsePayerTestCom === 'boolean' ? mp.sandboxUsePayerTestCom : (current.mercadopago.sandboxUsePayerTestCom ?? false),
      sandboxUseRealEmail: typeof mp.sandboxUseRealEmail === 'boolean' ? mp.sandboxUseRealEmail : (current.mercadopago.sandboxUseRealEmail ?? false),
    };
  }

  if (body.users && typeof body.users === 'object') {
    updates.users = { ...current.users, ...body.users };
  }

  if (body.visual && typeof body.visual === 'object') {
    updates.visual = { ...current.visual, ...body.visual };
  }

  await docRef.set(updates, { merge: true });
  invalidateSettingsCache();

  const updated = await getPlatformSettings();
  res.json({
    ...updated,
    mercadopago: {
      ...updated.mercadopago,
      accessToken: updated.mercadopago.accessToken ? '••••••••' + updated.mercadopago.accessToken.slice(-4) : '',
      publicKey: updated.mercadopago.publicKey ? '••••••••' + updated.mercadopago.publicKey.slice(-4) : '',
      webhookSecret: updated.mercadopago.webhookSecret ? '••••••••' : '',
    },
  });
});

router.get('/stats', async (_req, res) => {
  const [usersSnap, ordersSnap, disputesSnap, kycSnap, listingsSnap, ordersCompletedSnap, ticketsPendingSnap] = await Promise.all([
    db().collection(COLLECTIONS.USERS).get(),
    db().collection(COLLECTIONS.ORDERS).get(),
    db()
      .collection(COLLECTIONS.DISPUTES)
      .where('status', 'in', ['ABIERTA', 'EN_REVISION', 'ESPERANDO_INFO'])
      .get(),
    db().collection(COLLECTIONS.KYC_VERIFICATIONS).where('status', '==', 'EN_REVISION').get(),
    db().collection(COLLECTIONS.TICKET_LISTINGS).where('status', '==', 'DISPONIBLE').get(),
    db().collection(COLLECTIONS.ORDERS).where('status', '==', 'COMPLETADA').get(),
    db().collection(COLLECTIONS.TICKET_LISTINGS).where('status', '==', 'PENDIENTE_VERIFICACION').get(),
  ]);

  res.json({
    usersCount: usersSnap.size,
    ordersCount: ordersSnap.size,
    ordersCompleted: ordersCompletedSnap.size,
    disputesOpen: disputesSnap.size,
    kycPending: kycSnap.size,
    listingsCount: listingsSnap.size,
    ticketsPending: ticketsPendingSnap.size,
  });
});

router.get('/users', async (req: AuthRequest, res) => {
  const { q, page = '1', limit = '20', role, kycStatus } = req.query;
  const pageNum = Number(page);
  const limitNum = Number(limit);

  let query = db().collection(COLLECTIONS.USERS).orderBy('createdAt', 'desc');

  if (typeof role === 'string' && role) {
    query = query.where('role', '==', role) as FirebaseFirestore.Query;
  }

  const snap = await query.limit(limitNum * 3).get(); // Fetch extra for client filter

  type UserRow = { id: string; createdAt: unknown; email?: string; firstName?: string; lastName?: string; [key: string]: unknown };
  let users: UserRow[] = snap.docs.map((doc) => {
    const d = doc.data();
    return { id: doc.id, ...d, createdAt: d.createdAt?.toDate?.() ?? d.createdAt } as UserRow;
  });

  if (typeof q === 'string' && q) {
    const ql = q.toLowerCase();
    users = users.filter(
      (u) =>
        (u.email || '').toLowerCase().includes(ql) ||
        (u.firstName || '').toLowerCase().includes(ql) ||
        (u.lastName || '').toLowerCase().includes(ql)
    );
  }

  if (typeof kycStatus === 'string' && kycStatus) {
    const kycIds = await db()
      .collection(COLLECTIONS.KYC_VERIFICATIONS)
      .where('status', '==', kycStatus)
      .get();
    const kycUserIds = new Set(kycIds.docs.map((d) => d.data().userId || d.id));
    users = users.filter((u) => kycUserIds.has(u.id));
  }

  const total = users.length;
  const skip = (pageNum - 1) * limitNum;
  const paginated = users.slice(skip, skip + limitNum);

  const withKyc = await Promise.all(
    paginated.map(async (u) => {
      const kycDoc = await db().collection(COLLECTIONS.KYC_VERIFICATIONS).doc(u.id).get();
      return { ...u, kyc: kycDoc.exists ? { status: kycDoc.data()?.status } : { status: 'PENDIENTE' } };
    })
  );

  res.json({ users: withKyc, total });
});

/** Detalle completo de un usuario */
router.get('/users/:userId', async (req: AuthRequest, res) => {
  const { userId } = req.params;
  const userDoc = await db().collection(COLLECTIONS.USERS).doc(userId).get();
  if (!userDoc.exists) return res.status(404).json({ error: 'Usuario no encontrado' });
  const d = userDoc.data()!;
  const kycDoc = await db().collection(COLLECTIONS.KYC_VERIFICATIONS).doc(userId).get();
  const kyc = kycDoc.exists ? kycDoc.data() : null;
  const user = {
    id: userDoc.id,
    ...d,
    createdAt: d.createdAt?.toDate?.() ?? d.createdAt,
    updatedAt: d.updatedAt?.toDate?.() ?? d.updatedAt,
    dateOfBirth: d.dateOfBirth?.toDate?.() ?? d.dateOfBirth,
    kyc: kyc
      ? {
          status: kyc.status,
          rejectionReason: kyc.rejectionReason,
          diditSessionId: kyc.diditSessionId,
          reviewedAt: kyc.reviewedAt?.toDate?.() ?? kyc.reviewedAt,
          updatedAt: kyc.updatedAt?.toDate?.() ?? kyc.updatedAt,
        }
      : null,
  };
  res.json(user);
});

/** Actualizar usuario (campos editables) */
router.patch('/users/:userId', async (req: AuthRequest, res) => {
  const { userId } = req.params;
  const body = req.body as Record<string, unknown>;
  const docRef = db().collection(COLLECTIONS.USERS).doc(userId);
  const doc = await docRef.get();
  if (!doc.exists) return res.status(404).json({ error: 'Usuario no encontrado' });

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  const allowed = [
    'firstName', 'lastName', 'username', 'country', 'tipoDocumento', 'documentNumber',
    'sexo', 'phone', 'city', 'province', 'postalCode', 'role', 'reputationScore',
    'cbuCvu', 'bankName',
  ];
  for (const key of allowed) {
    if (body[key] !== undefined) {
      if (key === 'cbuCvu') {
        const val = typeof body[key] === 'string' ? (body[key] as string).replace(/\D/g, '').trim() || null : null;
        updates[key] = val && val.length === 22 ? val : null;
      } else {
        updates[key] = body[key] === '' || body[key] === null ? null : body[key];
      }
    }
  }
  await docRef.update(updates);
  const updated = await docRef.get();
  const d = updated.data()!;
  const kycDoc = await db().collection(COLLECTIONS.KYC_VERIFICATIONS).doc(userId).get();
  const kyc = kycDoc.exists ? kycDoc.data() : null;
  res.json({
    id: updated.id,
    ...d,
    createdAt: d.createdAt?.toDate?.() ?? d.createdAt,
    updatedAt: d.updatedAt?.toDate?.() ?? d.updatedAt,
    dateOfBirth: d.dateOfBirth?.toDate?.() ?? d.dateOfBirth,
    kyc: kyc ? { status: kyc.status, rejectionReason: kyc.rejectionReason } : null,
  });
});

/** Eliminar usuario (Firebase Auth + Firestore) */
router.delete('/users/:userId', async (req: AuthRequest, res) => {
  const { userId } = req.params;
  if (userId === req.user!.id) {
    return res.status(400).json({ error: 'No puedes eliminarte a ti mismo' });
  }
  const userDoc = await db().collection(COLLECTIONS.USERS).doc(userId).get();
  if (!userDoc.exists) return res.status(404).json({ error: 'Usuario no encontrado' });

  const { getAuth } = await import('../lib/firebase-admin.js');
  try {
    await getAuth().deleteUser(userId);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error al eliminar de Firebase Auth';
    return res.status(500).json({ error: msg });
  }
  await db().collection(COLLECTIONS.USERS).doc(userId).delete();
  await db().collection(COLLECTIONS.KYC_VERIFICATIONS).doc(userId).delete();
  res.json({ ok: true });
});

/** Tarjetas adheridas de un usuario (solo metadata) */
router.get('/users/:userId/cards', async (req: AuthRequest, res) => {
  const { userId } = req.params;
  const userDoc = await db().collection(COLLECTIONS.USERS).doc(userId).get();
  if (!userDoc.exists) return res.status(404).json({ error: 'Usuario no encontrado' });
  const userData = userDoc.data()!;
  const email = userData.email;
  if (!email || typeof email !== 'string') {
    return res.json({ cards: [], user: { id: userId, email: null } });
  }
  try {
    const settings = await getPlatformSettings();
    const customerId = await getOrCreateCustomer(userId, email, settings.mercadopago.sandboxMode);
    if (!userData.mpCustomerId) {
      await db().collection(COLLECTIONS.USERS).doc(userId).update({
        mpCustomerId: customerId,
        updatedAt: new Date(),
      });
    }
    const cards = await listCustomerCards(customerId);
    res.json({
      cards,
      user: {
        id: userId,
        email: (userData as Record<string, unknown>).email,
        firstName: (userData as Record<string, unknown>).firstName,
        lastName: (userData as Record<string, unknown>).lastName,
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error al listar tarjetas';
    res.status(500).json({ error: msg });
  }
});

router.get('/kyc/pending', async (_req, res) => {
  const [enRevisionSnap, pendienteSnap] = await Promise.all([
    db().collection(COLLECTIONS.KYC_VERIFICATIONS).where('status', '==', 'EN_REVISION').get(),
    db().collection(COLLECTIONS.KYC_VERIFICATIONS).where('status', '==', 'PENDIENTE').get(),
  ]);

  const allDocs = [...enRevisionSnap.docs, ...pendienteSnap.docs];
  const filteredDocs = allDocs.filter((doc) => {
    const d = doc.data();
    if (d.status === 'EN_REVISION') return true;
    if (d.status === 'PENDIENTE') {
      return !!(d.diditSessionId || d.dniFrontUrl || d.dniBackUrl || d.selfieUrl);
    }
    return false;
  });

  const list = await Promise.all(
    filteredDocs.map(async (doc) => {
      const d = doc.data();
      const userDoc = await db().collection(COLLECTIONS.USERS).doc(d.userId || doc.id).get();
      const user = userDoc.data();
      const item: Record<string, unknown> = {
        id: doc.id,
        ...d,
        user: user ? { id: userDoc.id, email: user.email, firstName: user.firstName, lastName: user.lastName } : null,
        updatedAt: d.updatedAt?.toDate?.() ?? d.updatedAt,
      };
      if (d.diditSessionId) {
        const result = await getDiditSessionDecision(d.diditSessionId);
        item.diditSession = result.ok ? result.data : null;
      }
      return item;
    })
  );
  res.json(list);
});

/** Detalle completo de una verificación KYC (Didit + legacy). Usado por pantalla KycDetail. */
router.get('/kyc/:userId/detail', async (req: AuthRequest, res) => {
  const { userId } = req.params;
  const kycDoc = await db().collection(COLLECTIONS.KYC_VERIFICATIONS).doc(userId).get();
  if (!kycDoc.exists) return res.status(404).json({ error: 'Verificación KYC no encontrada' });
  const d = kycDoc.data()!;
  const sessionId = d.diditSessionId;
  const userDoc = await db().collection(COLLECTIONS.USERS).doc(userId).get();
  const user = userDoc.exists ? userDoc.data() : null;

  const base = {
    id: userId,
    status: d.status || 'PENDIENTE',
    rejectionReason: d.rejectionReason ?? null,
    dniFrontUrl: d.dniFrontUrl ?? null,
    dniBackUrl: d.dniBackUrl ?? null,
    selfieUrl: d.selfieUrl ?? null,
    diditSessionId: sessionId ?? null,
    reviewedAt: d.reviewedAt?.toDate?.() ?? d.reviewedAt,
    updatedAt: d.updatedAt?.toDate?.() ?? d.updatedAt,
    user: user ? { id: userId, email: user.email, firstName: user.firstName, lastName: user.lastName } : null,
  };

  if (!sessionId) {
    return res.json({ ...base, hasDiditSession: false, didit: null });
  }

  const result = await getDiditSessionDecision(sessionId);
  res.json({ ...base, hasDiditSession: true, didit: result.ok ? result.data : null });
});

/** Sincronizar estado KYC desde Didit (cuando el webhook falla o no llega) */
router.post('/kyc/:userId/sync-didit', async (req: AuthRequest, res) => {
  const { userId } = req.params;
  const kycDoc = await db().collection(COLLECTIONS.KYC_VERIFICATIONS).doc(userId).get();
  if (!kycDoc.exists) return res.status(404).json({ error: 'Verificación KYC no encontrada' });
  const kycData = kycDoc.data()!;
  const sessionId = kycData.diditSessionId;
  if (!sessionId) {
    return res.status(400).json({ error: 'Esta verificación no tiene sesión Didit' });
  }

  const result = await getDiditSessionDecision(sessionId);
  if (!result.ok) {
    const status = result.status >= 400 ? result.status : 502;
    return res.status(status).json({ error: result.message });
  }

  const status = result.data.status ?? '';
  const mapStatus = (s: string): 'PENDIENTE' | 'EN_REVISION' | 'APROBADO' | 'RECHAZADO' => {
    if (s === 'Approved') return 'APROBADO';
    if (s === 'Declined') return 'RECHAZADO';
    if (s === 'In Review') return 'EN_REVISION';
    return 'PENDIENTE';
  };
  const ourStatus = mapStatus(status);

  await db().collection(COLLECTIONS.KYC_VERIFICATIONS).doc(userId).set(
    {
      status: ourStatus,
      ...(ourStatus === 'APROBADO' || ourStatus === 'RECHAZADO' ? { reviewedAt: new Date() } : {}),
      updatedAt: new Date(),
    },
    { merge: true }
  );

  res.json({
    ok: true,
    status: ourStatus,
    diditStatus: status,
    message: `Sincronizado desde Didit: ${ourStatus}`,
  });
});

router.patch('/kyc/:userId', async (req: AuthRequest, res) => {
  const { userId } = req.params;
  const { status, rejectionReason, sendEmail, comment } = req.body as {
    status: 'APROBADO' | 'RECHAZADO' | 'RESUBMIT';
    rejectionReason?: string;
    sendEmail?: boolean;
    comment?: string;
  };
  if (status !== 'APROBADO' && status !== 'RECHAZADO' && status !== 'RESUBMIT') {
    res.status(400).json({ error: 'status debe ser APROBADO, RECHAZADO o RESUBMIT' });
    return;
  }

  const kycDoc = await db().collection(COLLECTIONS.KYC_VERIFICATIONS).doc(userId).get();
  if (!kycDoc.exists) return res.status(404).json({ error: 'Verificación KYC no encontrada' });
  const kycData = kycDoc.data()!;
  const diditSessionId = kycData.diditSessionId;

  if (diditSessionId && (status === 'APROBADO' || status === 'RECHAZADO' || status === 'RESUBMIT')) {
    const diditStatus = status === 'APROBADO' ? 'Approved' : status === 'RECHAZADO' ? 'Declined' : 'Resubmitted';
    const userDoc = await db().collection(COLLECTIONS.USERS).doc(userId).get();
    const userEmail = userDoc.exists ? userDoc.data()?.email : undefined;
    const result = await updateDiditSessionStatus(diditSessionId, {
      new_status: diditStatus,
      comment: comment || rejectionReason || (status === 'APROBADO' ? 'Aprobado manualmente' : status === 'RECHAZADO' ? 'Rechazado por el administrador' : 'Reenviar documentación'),
      send_email: sendEmail === true,
      email_address: sendEmail ? userEmail : undefined,
      email_language: 'es',
    });
    if (!result.ok) {
      return res.status(500).json({ error: result.error || 'Error al actualizar Didit' });
    }
  }

  if (status !== 'RESUBMIT') {
    await db().collection(COLLECTIONS.KYC_VERIFICATIONS).doc(userId).set(
      {
        status: status === 'APROBADO' ? 'APROBADO' : 'RECHAZADO',
        rejectionReason: status === 'RECHAZADO' ? (rejectionReason || comment || 'Rechazado por el administrador') : null,
        reviewedAt: new Date(),
        reviewedBy: req.user!.id,
        updatedAt: new Date(),
      },
      { merge: true }
    );
  } else {
    await db().collection(COLLECTIONS.KYC_VERIFICATIONS).doc(userId).set(
      { status: 'PENDIENTE', rejectionReason: null, updatedAt: new Date() },
      { merge: true }
    );
  }

  const updatedKyc = await db().collection(COLLECTIONS.KYC_VERIFICATIONS).doc(userId).get();
  const userDoc = await db().collection(COLLECTIONS.USERS).doc(userId).get();
  res.json({
    ...updatedKyc.data(),
    user: userDoc.exists ? { id: userId, email: userDoc.data()?.email } : null,
  });
});

router.get('/disputes', async (req: AuthRequest, res) => {
  let query = db().collection(COLLECTIONS.DISPUTES).orderBy('createdAt', 'desc');
  if (typeof req.query.status === 'string' && req.query.status) {
    query = query.where('status', '==', req.query.status) as FirebaseFirestore.Query;
  }
  const snap = await query.limit(100).get();

  const disputes = await Promise.all(
    snap.docs.map(async (doc) => {
      const d = doc.data();
      const orderDoc = await db().collection(COLLECTIONS.ORDERS).doc(d.orderId).get();
      const order = orderDoc.data()!;
      const listingDoc = await db().collection(COLLECTIONS.TICKET_LISTINGS).doc(order.ticketListingId).get();
      const buyerDoc = await db().collection(COLLECTIONS.USERS).doc(order.buyerId).get();
      const sellerDoc = await db().collection(COLLECTIONS.USERS).doc(order.sellerId).get();
      const messagesSnap = await db()
        .collection(COLLECTIONS.DISPUTE_MESSAGES)
        .where('disputeId', '==', doc.id)
        .orderBy('createdAt', 'desc')
        .limit(1)
        .get();
      return {
        id: doc.id,
        ...d,
        order: {
          ...order,
          ticketListing: listingDoc.exists ? listingDoc.data() : null,
          buyer: buyerDoc.exists ? { id: order.buyerId, email: buyerDoc.data()?.email } : null,
          seller: sellerDoc.exists ? { id: order.sellerId, email: sellerDoc.data()?.email } : null,
        },
        messages: messagesSnap.empty ? [] : [messagesSnap.docs[0].data()],
        createdAt: d.createdAt?.toDate?.() ?? d.createdAt,
        updatedAt: d.updatedAt?.toDate?.() ?? d.updatedAt,
      };
    })
  );
  res.json(disputes);
});

router.patch('/disputes/:id/resolve', async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { resolution } = req.body;
  if (resolution !== 'RESUELTA_FAVOR_COMPRADOR' && resolution !== 'RESUELTA_FAVOR_VENDEDOR') {
    res.status(400).json({ error: 'resolution debe ser RESUELTA_FAVOR_COMPRADOR o RESUELTA_FAVOR_VENDEDOR' });
    return;
  }
  const disputeDoc = await db().collection(COLLECTIONS.DISPUTES).doc(id).get();
  if (!disputeDoc.exists) return res.status(404).json({ error: 'Disputa no encontrada' });
  const dispute = disputeDoc.data()!;

  const orderStatus = resolution === 'RESUELTA_FAVOR_COMPRADOR' ? 'DISPUTA_RESUELTA_COMPRADOR' : 'DISPUTA_RESUELTA_VENDEDOR';

  await db().collection(COLLECTIONS.DISPUTES).doc(id).update({
    status: resolution,
    resolvedAt: new Date(),
    resolvedBy: req.user!.id,
    updatedAt: new Date(),
  });
  await db().collection(COLLECTIONS.ORDERS).doc(dispute.orderId).update({ status: orderStatus, updatedAt: new Date() });

  const updatedDoc = await db().collection(COLLECTIONS.DISPUTES).doc(id).get();
  const orderDoc = await db().collection(COLLECTIONS.ORDERS).doc(dispute.orderId).get();
  res.json({
    ...updatedDoc.data(),
    order: orderDoc.exists ? orderDoc.data() : null,
  });
});

router.get('/conversations', async (req: AuthRequest, res) => {
  const { page = '1', limit = '30' } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const snap = await db()
    .collection(COLLECTIONS.CONVERSATIONS)
    .orderBy('updatedAt', 'desc')
    .limit(Number(limit) + skip)
    .get();

  const total = snap.size;
  const conversations = await Promise.all(
    snap.docs.slice(skip).map(async (doc) => {
      const c = doc.data();
      const user1Doc = await db().collection(COLLECTIONS.USERS).doc(c.user1Id).get();
      const user2Doc = await db().collection(COLLECTIONS.USERS).doc(c.user2Id).get();
      const lastMsgSnap = await db()
        .collection(COLLECTIONS.MESSAGES)
        .where('conversationId', '==', doc.id)
        .orderBy('createdAt', 'desc')
        .limit(1)
        .get();
      return {
        id: doc.id,
        ...c,
        user1: user1Doc.exists ? { id: c.user1Id, ...user1Doc.data() } : null,
        user2: user2Doc.exists ? { id: c.user2Id, ...user2Doc.data() } : null,
        messages: lastMsgSnap.empty ? [] : [lastMsgSnap.docs[0].data()],
        updatedAt: c.updatedAt?.toDate?.() ?? c.updatedAt,
      };
    })
  );
  res.json({ conversations, total });
});

router.get('/conversations/:id/messages', async (req: AuthRequest, res) => {
  const { id } = req.params;
  const convDoc = await db().collection(COLLECTIONS.CONVERSATIONS).doc(id).get();
  if (!convDoc.exists) return res.status(404).json({ error: 'Conversación no encontrada' });

  const conv = convDoc.data()!;
  const user1Doc = await db().collection(COLLECTIONS.USERS).doc(conv.user1Id).get();
  const user2Doc = await db().collection(COLLECTIONS.USERS).doc(conv.user2Id).get();
  const messagesSnap = await db()
    .collection(COLLECTIONS.MESSAGES)
    .where('conversationId', '==', id)
    .orderBy('createdAt', 'asc')
    .get();

  const messages = await Promise.all(
    messagesSnap.docs.map(async (m) => {
      const md = m.data();
      const senderDoc = await db().collection(COLLECTIONS.USERS).doc(md.senderId).get();
      return {
        id: m.id,
        ...md,
        sender: senderDoc.exists ? { id: md.senderId, ...senderDoc.data() } : null,
        createdAt: md.createdAt?.toDate?.() ?? md.createdAt,
      };
    })
  );

  res.json({
    id: convDoc.id,
    user1: user1Doc.exists ? { id: conv.user1Id, ...user1Doc.data() } : null,
    user2: user2Doc.exists ? { id: conv.user2Id, ...user2Doc.data() } : null,
    messages,
  });
});

/** Tickets pendientes (ruta específica antes de :id) */
router.get('/tickets/pending', async (_req, res) => {
  const snap = await db()
    .collection(COLLECTIONS.TICKET_LISTINGS)
    .orderBy('createdAt', 'desc')
    .limit(200)
    .get();
  const docs = snap.docs.filter((d) => {
    const s = d.data().status;
    return s === 'PENDIENTE_VERIFICACION' || s === undefined || s === null;
  });
  const tickets = await Promise.all(
    docs.map(async (doc) => {
      const d = doc.data();
      const sellerDoc = await db().collection(COLLECTIONS.USERS).doc(d.sellerId).get();
      const seller = sellerDoc.exists ? sellerDoc.data() : null;
      return {
        id: doc.id,
        ...d,
        seller: seller ? { id: d.sellerId, email: seller.email, firstName: seller.firstName, lastName: seller.lastName } : null,
        eventDate: d.eventDate?.toDate?.() ?? d.eventDate,
        createdAt: d.createdAt?.toDate?.() ?? d.createdAt,
        updatedAt: d.updatedAt?.toDate?.() ?? d.updatedAt,
      };
    })
  );
  res.json({ tickets });
});

/** Listar todos los tickets (con filtro opcional por status) */
router.get('/tickets', async (req: AuthRequest, res) => {
  const { status, page = '1', limit = '50' } = req.query;
  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(100, Math.max(1, Number(limit)));
  const statusFilter = typeof status === 'string' && status && status !== 'TODOS' ? status : null;

  const snap = await db()
    .collection(COLLECTIONS.TICKET_LISTINGS)
    .orderBy('createdAt', 'desc')
    .limit(500)
    .get();

  let docs = [...snap.docs];
  if (statusFilter) {
    docs = docs.filter((d) => (d.data().status ?? 'PENDIENTE_VERIFICACION') === statusFilter);
  }
  const total = docs.length;
  const skip = (pageNum - 1) * limitNum;
  const paginated = docs.slice(skip, skip + limitNum);

  const tickets = await Promise.all(
    paginated.map(async (doc) => {
      const d = doc.data();
      const sellerDoc = await db().collection(COLLECTIONS.USERS).doc(d.sellerId).get();
      const seller = sellerDoc.exists ? sellerDoc.data() : null;
      return {
        id: doc.id,
        ...d,
        seller: seller ? { id: d.sellerId, email: seller.email, firstName: seller.firstName, lastName: seller.lastName } : null,
        eventDate: d.eventDate?.toDate?.() ?? d.eventDate,
        createdAt: d.createdAt?.toDate?.() ?? d.createdAt,
        updatedAt: d.updatedAt?.toDate?.() ?? d.updatedAt,
      };
    })
  );
  res.json({ tickets, total });
});

/** Detalle de un ticket */
router.get('/tickets/:id', async (req: AuthRequest, res) => {
  const { id } = req.params;
  const doc = await db().collection(COLLECTIONS.TICKET_LISTINGS).doc(id).get();
  if (!doc.exists) return res.status(404).json({ error: 'Ticket no encontrado' });
  const d = doc.data()!;
  const sellerDoc = await db().collection(COLLECTIONS.USERS).doc(d.sellerId).get();
  const seller = sellerDoc.exists ? sellerDoc.data() : null;
  res.json({
    id: doc.id,
    ...d,
    seller: seller ? { id: d.sellerId, email: seller.email, firstName: seller.firstName, lastName: seller.lastName } : null,
    eventDate: d.eventDate?.toDate?.() ?? d.eventDate,
    createdAt: d.createdAt?.toDate?.() ?? d.createdAt,
    updatedAt: d.updatedAt?.toDate?.() ?? d.updatedAt,
  });
});

/** Actualizar ticket (campos editables) */
router.patch('/tickets/:id', async (req: AuthRequest, res) => {
  const { id } = req.params;
  const body = req.body as Record<string, unknown>;
  const docRef = db().collection(COLLECTIONS.TICKET_LISTINGS).doc(id);
  const doc = await docRef.get();
  if (!doc.exists) return res.status(404).json({ error: 'Ticket no encontrado' });

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  const allowed = ['eventName', 'eventDate', 'eventPlace', 'sector', 'row', 'seat', 'quantityEntries', 'tipoEntrada', 'tipoEntradaOtro', 'price', 'currency', 'ticketera', 'ticketeraOtra', 'appBoletos', 'appBoletosOtra', 'orderRef', 'category', 'status'];
  for (const key of allowed) {
    if (body[key] !== undefined) {
      if (key === 'eventDate' && body[key]) {
        updates[key] = new Date(body[key] as string);
      } else if (key === 'price' && body[key] !== undefined) {
        updates[key] = Number(body[key]);
      } else {
        updates[key] = body[key] === '' || body[key] === null ? null : body[key];
      }
    }
  }
  await docRef.update(updates);
  const updated = await docRef.get();
  const d = updated.data()!;
  const sellerDoc = await db().collection(COLLECTIONS.USERS).doc(d.sellerId).get();
  const seller = sellerDoc.exists ? sellerDoc.data() : null;
  res.json({
    id: updated.id,
    ...d,
    seller: seller ? { id: d.sellerId, email: seller.email, firstName: seller.firstName, lastName: seller.lastName } : null,
    eventDate: d.eventDate?.toDate?.() ?? d.eventDate,
    createdAt: d.createdAt?.toDate?.() ?? d.createdAt,
    updatedAt: d.updatedAt?.toDate?.() ?? d.updatedAt,
  });
});

/** Eliminar ticket (soft delete: status -> ELIMINADO) */
router.delete('/tickets/:id', async (req: AuthRequest, res) => {
  const { id } = req.params;
  const docRef = db().collection(COLLECTIONS.TICKET_LISTINGS).doc(id);
  const doc = await docRef.get();
  if (!doc.exists) return res.status(404).json({ error: 'Ticket no encontrado' });
  await docRef.update({
    status: 'ELIMINADO',
    updatedAt: new Date(),
  });
  res.json({ ok: true });
});

/** Aprobar ticket: PENDIENTE_VERIFICACION -> DISPONIBLE */
router.patch('/tickets/:id/approve', async (req: AuthRequest, res) => {
  const { id } = req.params;
  const docRef = db().collection(COLLECTIONS.TICKET_LISTINGS).doc(id);
  const doc = await docRef.get();
  if (!doc.exists) return res.status(404).json({ error: 'Ticket no encontrado' });
  const data = doc.data()!;
  const status = data.status ?? 'PENDIENTE_VERIFICACION';
  if (status !== 'PENDIENTE_VERIFICACION') {
    return res.status(400).json({ error: 'El ticket no está pendiente de verificación' });
  }
  await docRef.update({
    status: 'DISPONIBLE',
    reviewedAt: new Date(),
    reviewedBy: req.user!.id,
    rejectionReason: null,
    updatedAt: new Date(),
  });
  const updated = await docRef.get();
  res.json(updated.data());
});

/** Rechazar ticket: PENDIENTE_VERIFICACION -> RECHAZADO */
router.patch('/tickets/:id/reject', async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { rejectionReason } = req.body;
  const docRef = db().collection(COLLECTIONS.TICKET_LISTINGS).doc(id);
  const doc = await docRef.get();
  if (!doc.exists) return res.status(404).json({ error: 'Ticket no encontrado' });
  const data = doc.data()!;
  const status = data.status ?? 'PENDIENTE_VERIFICACION';
  if (status !== 'PENDIENTE_VERIFICACION') {
    return res.status(400).json({ error: 'El ticket no está pendiente de verificación' });
  }
  await docRef.update({
    status: 'RECHAZADO',
    rejectionReason: typeof rejectionReason === 'string' ? rejectionReason.trim() || 'Rechazado por el administrador' : 'Rechazado por el administrador',
    reviewedAt: new Date(),
    reviewedBy: req.user!.id,
    updatedAt: new Date(),
  });
  const updated = await docRef.get();
  res.json(updated.data());
});

/** Detalle completo de una orden */
router.get('/orders/:orderId', async (req: AuthRequest, res) => {
  const { orderId } = req.params;
  const orderDoc = await db().collection(COLLECTIONS.ORDERS).doc(orderId).get();
  if (!orderDoc.exists) return res.status(404).json({ error: 'Orden no encontrada' });
  const d = orderDoc.data()!;
  const listingDoc = await db().collection(COLLECTIONS.TICKET_LISTINGS).doc(d.ticketListingId).get();
  const buyerDoc = await db().collection(COLLECTIONS.USERS).doc(d.buyerId).get();
  const sellerDoc = await db().collection(COLLECTIONS.USERS).doc(d.sellerId).get();
  const listing = listingDoc.exists ? { id: listingDoc.id, ...listingDoc.data() } : null;
  const buyer = buyerDoc.exists ? { id: d.buyerId, ...buyerDoc.data() } : null;
  const seller = sellerDoc.exists ? { id: d.sellerId, ...sellerDoc.data() } : null;
  const disputeDoc = await db().collection(COLLECTIONS.DISPUTES).where('orderId', '==', orderId).limit(1).get();
  const dispute = disputeDoc.empty ? null : { id: disputeDoc.docs[0].id, ...disputeDoc.docs[0].data() };
  res.json({
    id: orderDoc.id,
    ...d,
    ticketListing: listing,
    buyer,
    seller,
    dispute,
    createdAt: d.createdAt?.toDate?.() ?? d.createdAt,
    updatedAt: d.updatedAt?.toDate?.() ?? d.updatedAt,
    transferDeadline: d.transferDeadline?.toDate?.() ?? d.transferDeadline,
  });
});

/** Actualizar orden (status y campos editables) */
router.patch('/orders/:orderId', async (req: AuthRequest, res) => {
  const { orderId } = req.params;
  const body = req.body as Record<string, unknown>;
  const docRef = db().collection(COLLECTIONS.ORDERS).doc(orderId);
  const doc = await docRef.get();
  if (!doc.exists) return res.status(404).json({ error: 'Orden no encontrada' });

  const prevData = doc.data()!;
  const newStatus = body.status as string | undefined;
  const statusBecomesCompleted = newStatus === 'COMPLETADA' && prevData.status !== 'COMPLETADA';

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  const allowed = ['status', 'totalAmount', 'commissionAmount'];
  for (const key of allowed) {
    if (body[key] !== undefined) {
      if (key === 'totalAmount' || key === 'commissionAmount') {
        updates[key] = Number(body[key]);
      } else {
        updates[key] = body[key];
      }
    }
  }
  await docRef.update(updates);
  const updated = await docRef.get();
  const d = updated.data()!;

  if (statusBecomesCompleted) {
    const totalAmount = d.totalAmount ?? 0;
    const commissionAmount = d.commissionAmount ?? 0;
    const sellerAmount = getSellerAmount(totalAmount, commissionAmount);
    const sellerId = d.sellerId;
    const currency = d.currency || 'ARS';

    const existingTransfer = await db()
      .collection(COLLECTIONS.SELLER_TRANSFERS)
      .where('orderId', '==', orderId)
      .where('status', 'in', ['ENVIADO', 'COMPLETADO', 'ENVIADO_MANUAL'])
      .limit(1)
      .get();

    if (existingTransfer.empty && sellerAmount > 0) {
      const sellerDoc = await db().collection(COLLECTIONS.USERS).doc(sellerId).get();
      const sellerData = sellerDoc.data();
      const cbuCvu = sellerData?.cbuCvu;
      const result = await createPayoutToSeller({
        orderId,
        sellerId,
        amount: sellerAmount,
        currency,
        cbuCvu: (cbuCvu && typeof cbuCvu === 'string' ? cbuCvu : '') || '',
        accountHolderName: sellerData?.firstName && sellerData?.lastName ? `${sellerData.firstName} ${sellerData.lastName}` : undefined,
        idempotencyKey: generateIdempotencyKey(orderId),
        performedBy: req.user!.id,
      });
      if (result.success) {
        await docRef.update({ sellerTransferId: result.transferId });
      }
    }
  }
  const listingDoc = await db().collection(COLLECTIONS.TICKET_LISTINGS).doc(d.ticketListingId).get();
  const buyerDoc = await db().collection(COLLECTIONS.USERS).doc(d.buyerId).get();
  const sellerDoc = await db().collection(COLLECTIONS.USERS).doc(d.sellerId).get();
  res.json({
    id: updated.id,
    ...d,
    ticketListing: listingDoc.exists ? { id: listingDoc.id, ...listingDoc.data() } : null,
    buyer: buyerDoc.exists ? { email: buyerDoc.data()?.email } : null,
    seller: sellerDoc.exists ? { email: sellerDoc.data()?.email } : null,
    createdAt: d.createdAt?.toDate?.() ?? d.createdAt,
    updatedAt: d.updatedAt?.toDate?.() ?? d.updatedAt,
  });
});

/** Cancelar/eliminar orden (soft: status -> CANCELADA) */
router.delete('/orders/:orderId', async (req: AuthRequest, res) => {
  const { orderId } = req.params;
  const docRef = db().collection(COLLECTIONS.ORDERS).doc(orderId);
  const doc = await docRef.get();
  if (!doc.exists) return res.status(404).json({ error: 'Orden no encontrada' });
  const data = doc.data()!;
  const status = data.status ?? 'PENDIENTE_PAGO';
  if (status === 'COMPLETADA') {
    return res.status(400).json({ error: 'No se puede cancelar una orden completada' });
  }
  await docRef.update({
    status: 'CANCELADA',
    updatedAt: new Date(),
  });
  res.json({ ok: true });
});

/** Listar transferencias a vendedores (para dashboard y transferencia manual) */
router.get('/transfers', async (req: AuthRequest, res) => {
  const { page = '1', limit = '30', status } = req.query;
  const pageNum = Number(page);
  const limitNum = Math.min(Number(limit), 100);
  const skip = (pageNum - 1) * limitNum;

  let query = db().collection(COLLECTIONS.SELLER_TRANSFERS).orderBy('createdAt', 'desc');
  if (typeof status === 'string' && status) {
    query = query.where('status', '==', status) as FirebaseFirestore.Query;
  }
  const snap = await query.limit(skip + limitNum).get();

  const transfers = await Promise.all(
    snap.docs.slice(skip, skip + limitNum).map(async (doc) => {
      const d = doc.data();
      const sellerDoc = await db().collection(COLLECTIONS.USERS).doc(d.sellerId).get();
      const orderDoc = await db().collection(COLLECTIONS.ORDERS).doc(d.orderId).get();
      return {
        id: doc.id,
        ...d,
        seller: sellerDoc.exists ? { id: d.sellerId, email: sellerDoc.data()?.email, firstName: sellerDoc.data()?.firstName, lastName: sellerDoc.data()?.lastName, cbuCvu: sellerDoc.data()?.cbuCvu } : null,
        order: orderDoc.exists ? { id: d.orderId, totalAmount: orderDoc.data()?.totalAmount } : null,
        createdAt: d.createdAt?.toDate?.() ?? d.createdAt,
        updatedAt: d.updatedAt?.toDate?.() ?? d.updatedAt,
        completedAt: d.completedAt?.toDate?.() ?? d.completedAt,
      };
    })
  );
  res.json({ transfers, total: snap.size });
});

/** Marcar transferencia como enviada manualmente (admin realizó la transferencia fuera de la plataforma) */
router.post('/transfers/:transferId/manual-complete', async (req: AuthRequest, res) => {
  const { transferId } = req.params;
  await markTransferAsManualComplete(transferId, req.user!.id);
  res.json({ ok: true });
});

/** Reintentar transferencia fallida o pendiente manual */
router.post('/transfers/:transferId/retry', async (req: AuthRequest, res) => {
  const { transferId } = req.params;
  const result = await retryTransfer(transferId);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }
  res.json({ ok: true });
});

/** Transferencia manual: crear registro para una orden y marcar como pendiente (admin hará la transferencia fuera) */
router.post('/orders/:orderId/transfer-manual', async (req: AuthRequest, res) => {
  const { orderId } = req.params;
  const orderDoc = await db().collection(COLLECTIONS.ORDERS).doc(orderId).get();
  if (!orderDoc.exists) return res.status(404).json({ error: 'Orden no encontrada' });
  const orderData = orderDoc.data()!;
  if (orderData.status !== 'COMPLETADA') {
    return res.status(400).json({ error: 'Solo se puede crear transferencia manual para órdenes completadas' });
  }

  const existing = await db()
    .collection(COLLECTIONS.SELLER_TRANSFERS)
    .where('orderId', '==', orderId)
    .limit(1)
    .get();
  if (!existing.empty) {
    const t = existing.docs[0].data();
    if (['ENVIADO', 'COMPLETADO', 'ENVIADO_MANUAL'].includes(t.status)) {
      return res.status(400).json({ error: 'Ya existe una transferencia completada para esta orden' });
    }
  }

  const totalAmount = orderData.totalAmount ?? 0;
  const commissionAmount = orderData.commissionAmount ?? 0;
  const sellerAmount = getSellerAmount(totalAmount, commissionAmount);
  const transferId = db().collection(COLLECTIONS.SELLER_TRANSFERS).doc().id;

  await db()
    .collection(COLLECTIONS.SELLER_TRANSFERS)
    .doc(transferId)
    .set({
      orderId,
      sellerId: orderData.sellerId,
      amount: sellerAmount,
      currency: orderData.currency || 'ARS',
      status: 'PENDIENTE_MANUAL',
      idempotencyKey: generateIdempotencyKey(orderId),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

  res.status(201).json({ transferId, amount: sellerAmount, currency: orderData.currency || 'ARS' });
});

router.get('/orders', async (req: AuthRequest, res) => {
  const { page = '1', limit = '20', status } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  let query = db().collection(COLLECTIONS.ORDERS).orderBy('createdAt', 'desc');
  if (typeof status === 'string' && status) {
    query = query.where('status', '==', status) as FirebaseFirestore.Query;
  }
  const snap = await query.limit(skip + Number(limit)).get();

  const orders = await Promise.all(
    snap.docs.slice(skip).map(async (doc) => {
      const d = doc.data();
      const listingDoc = await db().collection(COLLECTIONS.TICKET_LISTINGS).doc(d.ticketListingId).get();
      const buyerDoc = await db().collection(COLLECTIONS.USERS).doc(d.buyerId).get();
      const sellerDoc = await db().collection(COLLECTIONS.USERS).doc(d.sellerId).get();
      return {
        id: doc.id,
        ...d,
        ticketListing: listingDoc.exists ? { id: listingDoc.id, ...listingDoc.data() } : null,
        buyer: buyerDoc.exists ? { email: buyerDoc.data()?.email } : null,
        seller: sellerDoc.exists ? { email: sellerDoc.data()?.email } : null,
        createdAt: d.createdAt?.toDate?.() ?? d.createdAt,
        updatedAt: d.updatedAt?.toDate?.() ?? d.updatedAt,
      };
    })
  );
  res.json({ orders, total: snap.size });
});

export const adminRouter = router;
