/**
 * Rutas de órdenes (compra, pago, confirmación, evidencia).
 * Ubicación: apps/api/src/routes/orders.ts
 */

import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { prisma } from '../lib/prisma.js';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';
import { createOrderSchema, confirmReceivedSchema } from '@tickets-transfer/shared';
import { HORAS_MAX_TRANSFERENCIA_VENDEDOR } from '@tickets-transfer/shared';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = Router();
const upload = multer({
  dest: path.join(__dirname, '..', '..', 'uploads'),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.use(requireAuth);

router.post('/', async (req: AuthRequest, res) => {
  const parsed = createOrderSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Datos inválidos', details: parsed.error.flatten() });
    return;
  }
  const { ticketListingId, paymentMethod } = parsed.data;

  const listing = await prisma.ticketListing.findFirst({
    where: { id: ticketListingId, status: 'DISPONIBLE' },
  });
  if (!listing) {
    res.status(404).json({ error: 'Ticket no disponible' });
    return;
  }
  if (listing.sellerId === req.user!.id) {
    res.status(400).json({ error: 'No puedes comprar tu propio ticket' });
    return;
  }

  const commissionAmount = listing.price * 0.05;
  const totalAmount = listing.price + commissionAmount;
  const transferDeadline = new Date();
  transferDeadline.setHours(transferDeadline.getHours() + HORAS_MAX_TRANSFERENCIA_VENDEDOR);

  const order = await prisma.order.create({
    data: {
      ticketListingId,
      buyerId: req.user!.id,
      sellerId: listing.sellerId,
      status: 'PENDIENTE_PAGO',
      totalAmount,
      commissionAmount,
      currency: listing.currency,
      paymentMethod,
      transferDeadline,
    },
    include: {
      ticketListing: true,
      seller: { select: { id: true, email: true } },
    },
  });

  res.status(201).json({
    order,
    paymentNeeded: true,
    message: 'Integrar Mercado Pago o Stripe para completar el pago.',
  });
});

router.get('/my/purchases', async (req: AuthRequest, res) => {
  const orders = await prisma.order.findMany({
    where: { buyerId: req.user!.id },
    include: { ticketListing: true, seller: { select: { id: true, reputationScore: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(orders);
});

router.get('/my/sales', async (req: AuthRequest, res) => {
  const orders = await prisma.order.findMany({
    where: { sellerId: req.user!.id },
    include: { ticketListing: true, buyer: { select: { id: true, email: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(orders);
});

router.get('/:id', async (req: AuthRequest, res) => {
  const order = await prisma.order.findFirst({
    where: {
      id: req.params.id,
      OR: [{ buyerId: req.user!.id }, { sellerId: req.user!.id }],
    },
    include: {
      ticketListing: true,
      buyer: { select: { id: true, email: true } },
      seller: { select: { id: true, email: true } },
    },
  });
  if (!order) return res.status(404).json({ error: 'No encontrado' });
  res.json(order);
});

router.post('/:id/confirm-payment', async (req: AuthRequest, res) => {
  const order = await prisma.order.findFirst({
    where: { id: req.params.id, buyerId: req.user!.id, status: 'PENDIENTE_PAGO' },
  });
  if (!order) return res.status(404).json({ error: 'No encontrado' });
  await prisma.order.update({
    where: { id: order.id },
    data: { status: 'ESPERANDO_TRANSFERENCIA' },
  });
  res.json({ ok: true, status: 'ESPERANDO_TRANSFERENCIA' });
});

router.post('/:id/transfer-done', async (req: AuthRequest, res) => {
  const order = await prisma.order.findFirst({
    where: { id: req.params.id, sellerId: req.user!.id },
  });
  if (!order) return res.status(404).json({ error: 'No encontrado' });
  if (order.status !== 'ESPERANDO_TRANSFERENCIA') {
    return res.status(400).json({ error: 'Estado no permite marcar transferencia' });
  }
  await prisma.order.update({
    where: { id: order.id },
    data: { status: 'TRANSFERIDO_VENDEDOR' },
  });
  res.json({ ok: true });
});

router.post('/:id/confirm-received', async (req: AuthRequest, res) => {
  const parsed = confirmReceivedSchema.safeParse({
    orderId: req.params.id,
    received: req.body.received,
  });
  if (!parsed.success) {
    res.status(400).json({ error: 'Datos inválidos' });
    return;
  }
  const order = await prisma.order.findFirst({
    where: { id: req.params.id, buyerId: req.user!.id },
  });
  if (!order) return res.status(404).json({ error: 'No encontrado' });
  await prisma.order.update({
    where: { id: order.id },
    data: {
      status: parsed.data.received ? 'ESPERANDO_CONFIRMACION_COMPRADOR' : order.status,
      buyerConfirmedAt: parsed.data.received ? new Date() : null,
    },
  });
  res.json({ ok: true });
});

router.post('/:id/evidence', upload.single('evidence'), async (req: AuthRequest, res) => {
  const order = await prisma.order.findFirst({
    where: { id: req.params.id, buyerId: req.user!.id },
  });
  if (!order) return res.status(404).json({ error: 'No encontrado' });
  const baseUrl = process.env.APP_URL || 'http://localhost:3001';
  const evidenceUrl = req.file ? `${baseUrl}/uploads/${req.file.filename}` : undefined;
  if (!evidenceUrl) {
    res.status(400).json({ error: 'Archivo requerido' });
    return;
  }
  await prisma.order.update({
    where: { id: order.id },
    data: { evidenceUrl, status: 'EVIDENCIA_SUBIDA' },
  });
  res.json({ ok: true, status: 'EVIDENCIA_SUBIDA' });
});

export const ordersRouter = router;
