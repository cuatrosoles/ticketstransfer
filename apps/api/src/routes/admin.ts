/**
 * Rutas exclusivas para administradores - Firestore.
 */

import { Router } from 'express';
import { db, COLLECTIONS } from '../lib/firestore.js';
import { requireAuth, requireAdmin, type AuthRequest } from '../middleware/auth.js';
import { getPlatformSettings, invalidateSettingsCache } from '../lib/settings.js';
import { getOrCreateCustomer, listCustomerCards } from '../lib/mercadopago.js';

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

  let users = snap.docs.map((doc) => {
    const d = doc.data();
    return { id: doc.id, ...d, createdAt: d.createdAt?.toDate?.() ?? d.createdAt };
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
  const snap = await db()
    .collection(COLLECTIONS.KYC_VERIFICATIONS)
    .where('status', '==', 'EN_REVISION')
    .get();

  const list = await Promise.all(
    snap.docs.map(async (doc) => {
      const d = doc.data();
      const userDoc = await db().collection(COLLECTIONS.USERS).doc(d.userId || doc.id).get();
      const user = userDoc.data();
      return {
        id: doc.id,
        ...d,
        user: user ? { id: userDoc.id, email: user.email, firstName: user.firstName, lastName: user.lastName } : null,
        updatedAt: d.updatedAt?.toDate?.() ?? d.updatedAt,
      };
    })
  );
  res.json(list);
});

router.patch('/kyc/:userId', async (req: AuthRequest, res) => {
  const { userId } = req.params;
  const { status, rejectionReason } = req.body;
  if (status !== 'APROBADO' && status !== 'RECHAZADO') {
    res.status(400).json({ error: 'status debe ser APROBADO o RECHAZADO' });
    return;
  }
  await db().collection(COLLECTIONS.KYC_VERIFICATIONS).doc(userId).set(
    {
      status,
      rejectionReason: status === 'RECHAZADO' ? rejectionReason || 'Rechazado por el administrador' : null,
      reviewedAt: new Date(),
      reviewedBy: req.user!.id,
      updatedAt: new Date(),
    },
    { merge: true }
  );
  const kycDoc = await db().collection(COLLECTIONS.KYC_VERIFICATIONS).doc(userId).get();
  const userDoc = await db().collection(COLLECTIONS.USERS).doc(userId).get();
  res.json({
    ...kycDoc.data(),
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

/** Tickets pendientes de verificación (para aprobar/rechazar) */
router.get('/tickets/pending', async (_req, res) => {
  let docs: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>[] = [];
  try {
    const snap = await db()
      .collection(COLLECTIONS.TICKET_LISTINGS)
      .where('status', '==', 'PENDIENTE_VERIFICACION')
      .limit(100)
      .get();
    docs = [...snap.docs];
  } catch {
    docs = [];
  }

  if (docs.length === 0) {
    const allSnap = await db()
      .collection(COLLECTIONS.TICKET_LISTINGS)
      .orderBy('createdAt', 'desc')
      .limit(100)
      .get();
    docs = allSnap.docs.filter((d) => {
      const s = d.data().status;
      return s === 'PENDIENTE_VERIFICACION' || s === undefined || s === null;
    });
  }

  docs.sort((a, b) => {
    const aAt = a.data().createdAt?.toDate?.()?.getTime() ?? 0;
    const bAt = b.data().createdAt?.toDate?.()?.getTime() ?? 0;
    return bAt - aAt;
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
