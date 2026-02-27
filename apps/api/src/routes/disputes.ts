/**
 * Rutas de disputas - Firestore.
 */

import { Router } from 'express';
import { db, COLLECTIONS } from '../lib/firestore.js';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';
import { openDisputeSchema } from '@tickets-transfer/shared';

const router = Router();

router.use(requireAuth);

router.post('/', async (req: AuthRequest, res) => {
  const parsed = openDisputeSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Datos inválidos', details: parsed.error.flatten() });
    return;
  }
  const { orderId, reason } = parsed.data;

  const orderDoc = await db().collection(COLLECTIONS.ORDERS).doc(orderId).get();
  if (!orderDoc.exists) return res.status(404).json({ error: 'Orden no encontrada' });
  const order = orderDoc.data()!;
  if (order.buyerId !== req.user!.id && order.sellerId !== req.user!.id) {
    return res.status(404).json({ error: 'Orden no encontrada' });
  }

  const existingDispute = await db()
    .collection(COLLECTIONS.DISPUTES)
    .where('orderId', '==', orderId)
    .limit(1)
    .get();
  if (!existingDispute.empty) return res.status(409).json({ error: 'Ya existe una disputa para esta orden' });

  const disputeId = db().collection(COLLECTIONS.DISPUTES).doc().id;
  const disputeData = {
    orderId,
    reason,
    status: 'ABIERTA',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  await db().collection(COLLECTIONS.DISPUTES).doc(disputeId).set(disputeData);
  await db().collection(COLLECTIONS.ORDERS).doc(orderId).update({ status: 'EN_DISPUTA', updatedAt: new Date() });

  const listingDoc = await db().collection(COLLECTIONS.TICKET_LISTINGS).doc(order.ticketListingId).get();
  res.status(201).json({
    id: disputeId,
    ...disputeData,
    order: { id: orderId, ...order, ticketListing: listingDoc.exists ? listingDoc.data() : null },
  });
});

router.get('/my', async (req: AuthRequest, res) => {
  const ordersSnap = await db()
    .collection(COLLECTIONS.ORDERS)
    .where('status', '==', 'EN_DISPUTA')
    .get();

  const orderIds = ordersSnap.docs
    .filter((d) => {
      const o = d.data();
      return o.buyerId === req.user!.id || o.sellerId === req.user!.id;
    })
    .map((d) => d.id);

  if (orderIds.length === 0) return res.json([]);

  const disputesSnap = await db()
    .collection(COLLECTIONS.DISPUTES)
    .where('orderId', 'in', orderIds.slice(0, 10))
    .get();

  const disputes = await Promise.all(
    disputesSnap.docs.map(async (doc) => {
      const d = doc.data();
      const orderDoc = await db().collection(COLLECTIONS.ORDERS).doc(d.orderId).get();
      const order = orderDoc.data()!;
      const listingDoc = await db().collection(COLLECTIONS.TICKET_LISTINGS).doc(order.ticketListingId).get();
      return {
        id: doc.id,
        ...d,
        order: { id: orderDoc.id, ...order, ticketListing: listingDoc.exists ? listingDoc.data() : null },
        createdAt: d.createdAt?.toDate?.() ?? d.createdAt,
        updatedAt: d.updatedAt?.toDate?.() ?? d.updatedAt,
      };
    })
  );
  res.json(disputes);
});

router.get('/:id', async (req: AuthRequest, res) => {
  const doc = await db().collection(COLLECTIONS.DISPUTES).doc(req.params.id).get();
  if (!doc.exists) return res.status(404).json({ error: 'No encontrado' });
  const d = doc.data()!;

  const orderDoc = await db().collection(COLLECTIONS.ORDERS).doc(d.orderId).get();
  const order = orderDoc.data()!;
  const isParty = order.buyerId === req.user!.id || order.sellerId === req.user!.id;
  if (!isParty && req.user!.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado' });
  }

  const listingDoc = await db().collection(COLLECTIONS.TICKET_LISTINGS).doc(order.ticketListingId).get();
  const buyerDoc = await db().collection(COLLECTIONS.USERS).doc(order.buyerId).get();
  const sellerDoc = await db().collection(COLLECTIONS.USERS).doc(order.sellerId).get();

  const messagesSnap = await db()
    .collection(COLLECTIONS.DISPUTE_MESSAGES)
    .where('disputeId', '==', req.params.id)
    .orderBy('createdAt', 'asc')
    .get();

  const messages = await Promise.all(
    messagesSnap.docs.map(async (m) => {
      const md = m.data();
      const userDoc = await db().collection(COLLECTIONS.USERS).doc(md.userId).get();
      return {
        id: m.id,
        ...md,
        user: userDoc.exists ? { id: md.userId, email: userDoc.data()?.email } : null,
        createdAt: md.createdAt?.toDate?.() ?? md.createdAt,
      };
    })
  );

  res.json({
    id: doc.id,
    ...d,
    order: {
      id: orderDoc.id,
      ...order,
      ticketListing: listingDoc.exists ? listingDoc.data() : null,
      buyer: buyerDoc.exists ? { id: order.buyerId, email: buyerDoc.data()?.email } : null,
      seller: sellerDoc.exists ? { id: order.sellerId, email: sellerDoc.data()?.email } : null,
    },
    messages,
    createdAt: d.createdAt?.toDate?.() ?? d.createdAt,
    updatedAt: d.updatedAt?.toDate?.() ?? d.updatedAt,
  });
});

router.post('/:id/messages', async (req: AuthRequest, res) => {
  const { content } = req.body;
  const disputeDoc = await db().collection(COLLECTIONS.DISPUTES).doc(req.params.id).get();
  if (!disputeDoc.exists) return res.status(404).json({ error: 'No encontrado' });
  const dispute = disputeDoc.data()!;

  const orderDoc = await db().collection(COLLECTIONS.ORDERS).doc(dispute.orderId).get();
  const order = orderDoc.data()!;
  const isParty = order.buyerId === req.user!.id || order.sellerId === req.user!.id;
  if (!isParty && req.user!.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado' });
  }

  const messageId = db().collection(COLLECTIONS.DISPUTE_MESSAGES).doc().id;
  const messageData = {
    disputeId: req.params.id,
    userId: req.user!.id,
    content: String(content || '').slice(0, 2000),
    isModerator: req.user!.role === 'admin',
    createdAt: new Date(),
  };
  await db().collection(COLLECTIONS.DISPUTE_MESSAGES).doc(messageId).set(messageData);

  const userDoc = await db().collection(COLLECTIONS.USERS).doc(req.user!.id).get();
  res.status(201).json({
    id: messageId,
    ...messageData,
    user: { id: req.user!.id, email: userDoc.data()?.email },
  });
});

export const disputesRouter = router;
