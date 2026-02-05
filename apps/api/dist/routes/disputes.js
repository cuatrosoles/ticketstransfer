/**
 * Rutas de disputas.
 * Ubicación: apps/api/src/routes/disputes.ts
 */
import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { openDisputeSchema } from '@tickets-transfer/shared';
const router = Router();
router.use(requireAuth);
router.post('/', async (req, res) => {
    const parsed = openDisputeSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: 'Datos inválidos', details: parsed.error.flatten() });
        return;
    }
    const { orderId, reason } = parsed.data;
    const order = await prisma.order.findFirst({
        where: {
            id: orderId,
            OR: [{ buyerId: req.user.id }, { sellerId: req.user.id }],
        },
    });
    if (!order)
        return res.status(404).json({ error: 'Orden no encontrada' });
    const existing = await prisma.dispute.findUnique({ where: { orderId } });
    if (existing)
        return res.status(409).json({ error: 'Ya existe una disputa para esta orden' });
    const dispute = await prisma.dispute.create({
        data: { orderId, reason, status: 'ABIERTA' },
        include: { order: true },
    });
    await prisma.order.update({
        where: { id: orderId },
        data: { status: 'EN_DISPUTA' },
    });
    res.status(201).json(dispute);
});
router.get('/my', async (req, res) => {
    const orders = await prisma.order.findMany({
        where: {
            OR: [{ buyerId: req.user.id }, { sellerId: req.user.id }],
            status: 'EN_DISPUTA',
        },
        select: { id: true },
    });
    const disputeIds = orders.map((o) => o.id);
    const disputes = await prisma.dispute.findMany({
        where: { orderId: { in: disputeIds } },
        include: { order: { include: { ticketListing: true } } },
    });
    res.json(disputes);
});
router.get('/:id', async (req, res) => {
    const dispute = await prisma.dispute.findFirst({
        where: { id: req.params.id },
        include: {
            order: {
                include: {
                    ticketListing: true,
                    buyer: { select: { id: true, email: true } },
                    seller: { select: { id: true, email: true } },
                },
            },
            messages: { include: { user: { select: { id: true, email: true } } }, orderBy: { createdAt: 'asc' } },
        },
    });
    if (!dispute)
        return res.status(404).json({ error: 'No encontrado' });
    const isParty = dispute.order.buyerId === req.user.id || dispute.order.sellerId === req.user.id;
    if (!isParty && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Acceso denegado' });
    }
    res.json(dispute);
});
router.post('/:id/messages', async (req, res) => {
    const { content } = req.body;
    const dispute = await prisma.dispute.findFirst({
        where: { id: req.params.id },
        include: { order: true },
    });
    if (!dispute)
        return res.status(404).json({ error: 'No encontrado' });
    const isParty = dispute.order.buyerId === req.user.id || dispute.order.sellerId === req.user.id;
    if (!isParty && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Acceso denegado' });
    }
    const message = await prisma.disputeMessage.create({
        data: {
            disputeId: dispute.id,
            userId: req.user.id,
            content: String(content || '').slice(0, 2000),
            isModerator: req.user.role === 'admin',
        },
        include: { user: { select: { id: true, email: true } } },
    });
    res.status(201).json(message);
});
export const disputesRouter = router;
