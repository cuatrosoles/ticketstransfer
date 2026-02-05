/**
 * Rutas exclusivas para administradores.
 * Ubicación: apps/api/src/routes/admin.ts
 */
import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
const router = Router();
router.use(requireAuth);
router.use(requireAdmin);
/** Estadísticas para el dashboard */
router.get('/stats', async (_req, res) => {
    const [usersCount, ordersCount, disputesOpen, kycPending, listingsCount] = await Promise.all([
        prisma.user.count(),
        prisma.order.count(),
        prisma.dispute.count({ where: { status: { in: ['ABIERTA', 'EN_REVISION', 'ESPERANDO_INFO'] } } }),
        prisma.kycVerification.count({ where: { status: 'EN_REVISION' } }),
        prisma.ticketListing.count({ where: { status: 'DISPONIBLE' } }),
    ]);
    const ordersCompleted = await prisma.order.count({ where: { status: 'COMPLETADA' } });
    res.json({
        usersCount,
        ordersCount,
        ordersCompleted,
        disputesOpen,
        kycPending,
        listingsCount,
    });
});
/** Listar todos los usuarios */
router.get('/users', async (req, res) => {
    const { q, page = '1', limit = '20', role, kycStatus } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const where = {};
    if (typeof q === 'string' && q) {
        where.OR = [
            { email: { contains: q, mode: 'insensitive' } },
            { firstName: { contains: q, mode: 'insensitive' } },
            { lastName: { contains: q, mode: 'insensitive' } },
        ];
    }
    if (typeof role === 'string' && role)
        where.role = role;
    if (typeof kycStatus === 'string' && kycStatus) {
        where.kyc = { status: kycStatus };
    }
    const [users, total] = await Promise.all([
        prisma.user.findMany({
            where,
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                createdAt: true,
                kyc: { select: { status: true } },
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: Number(limit),
        }),
        prisma.user.count({ where }),
    ]);
    res.json({ users, total });
});
/** Listar KYC pendientes de revisión */
router.get('/kyc/pending', async (_req, res) => {
    const list = await prisma.kycVerification.findMany({
        where: { status: 'EN_REVISION' },
        include: {
            user: {
                select: { id: true, email: true, firstName: true, lastName: true },
            },
        },
        orderBy: { updatedAt: 'desc' },
    });
    res.json(list);
});
/** Aprobar o rechazar KYC */
router.patch('/kyc/:userId', async (req, res) => {
    const { userId } = req.params;
    const { status, rejectionReason } = req.body;
    if (status !== 'APROBADO' && status !== 'RECHAZADO') {
        res.status(400).json({ error: 'status debe ser APROBADO o RECHAZADO' });
        return;
    }
    const kyc = await prisma.kycVerification.update({
        where: { userId },
        data: {
            status,
            rejectionReason: status === 'RECHAZADO' ? (rejectionReason || 'Rechazado por el administrador') : null,
            reviewedAt: new Date(),
            reviewedBy: req.user.id,
        },
        include: { user: { select: { id: true, email: true } } },
    });
    res.json(kyc);
});
/** Listar todas las disputas */
router.get('/disputes', async (req, res) => {
    const { status } = req.query;
    const where = typeof status === 'string' && status ? { status: status } : {};
    const disputes = await prisma.dispute.findMany({
        where,
        include: {
            order: {
                include: {
                    ticketListing: { select: { eventName: true, eventDate: true } },
                    buyer: { select: { id: true, email: true } },
                    seller: { select: { id: true, email: true } },
                },
            },
            messages: { take: 1, orderBy: { createdAt: 'desc' } },
        },
        orderBy: { createdAt: 'desc' },
    });
    res.json(disputes);
});
/** Resolver disputa (admin) */
router.patch('/disputes/:id/resolve', async (req, res) => {
    const { id } = req.params;
    const { resolution } = req.body;
    if (resolution !== 'RESUELTA_FAVOR_COMPRADOR' && resolution !== 'RESUELTA_FAVOR_VENDEDOR') {
        res.status(400).json({ error: 'resolution debe ser RESUELTA_FAVOR_COMPRADOR o RESUELTA_FAVOR_VENDEDOR' });
        return;
    }
    const dispute = await prisma.dispute.findUnique({ where: { id }, include: { order: true } });
    if (!dispute)
        return res.status(404).json({ error: 'Disputa no encontrada' });
    const orderStatus = resolution === 'RESUELTA_FAVOR_COMPRADOR' ? 'DISPUTA_RESUELTA_COMPRADOR' : 'DISPUTA_RESUELTA_VENDEDOR';
    await prisma.$transaction([
        prisma.dispute.update({
            where: { id },
            data: { status: resolution, resolvedAt: new Date(), resolvedBy: req.user.id },
        }),
        prisma.order.update({
            where: { id: dispute.orderId },
            data: { status: orderStatus },
        }),
    ]);
    const updated = await prisma.dispute.findUnique({
        where: { id },
        include: { order: true },
    });
    res.json(updated);
});
/** Listar órdenes (admin) */
router.get('/orders', async (req, res) => {
    const { page = '1', limit = '20', status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const where = typeof status === 'string' && status ? { status: status } : {};
    const [orders, total] = await Promise.all([
        prisma.order.findMany({
            where,
            include: {
                ticketListing: { select: { eventName: true, price: true } },
                buyer: { select: { email: true } },
                seller: { select: { email: true } },
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: Number(limit),
        }),
        prisma.order.count({ where }),
    ]);
    res.json({ orders, total });
});
export const adminRouter = router;
