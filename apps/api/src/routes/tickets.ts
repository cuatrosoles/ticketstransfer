/**
 * Rutas de publicaciones de tickets (listados).
 * Ubicación: apps/api/src/routes/tickets.ts
 */

import { Router } from 'express';
import multer from 'multer';
import { prisma } from '../lib/prisma.js';
import { uploadsDir } from '../lib/uploads.js';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';
import { createTicketListingSchema } from '@tickets-transfer/shared';

const router = Router();
const upload = multer({
  dest: uploadsDir,
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.get('/', async (_req, res) => {
  const listings = await prisma.ticketListing.findMany({
    where: { status: 'DISPONIBLE' },
    include: {
      seller: {
        select: { id: true, reputationScore: true, kyc: { select: { status: true } } },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  res.json(listings);
});

router.get('/eventos', async (req, res) => {
  const { q, categoria, fecha } = req.query;
  const where: Record<string, unknown> = { status: 'DISPONIBLE' };
  if (typeof q === 'string' && q) {
    where.eventName = { contains: q, mode: 'insensitive' };
  }
  if (typeof categoria === 'string' && categoria) {
    where.category = categoria;
  }
  if (typeof fecha === 'string' && fecha) {
    where.eventDate = { gte: new Date(fecha) };
  }
  const eventos = await prisma.ticketListing.findMany({
    where,
    select: {
      id: true,
      eventName: true,
      eventDate: true,
      eventPlace: true,
      sector: true,
      tipoEntrada: true,
      price: true,
      currency: true,
      category: true,
    },
    orderBy: { eventDate: 'asc' },
    take: 100,
  });
  res.json(eventos);
});

router.get('/:id', async (req, res) => {
  const listing = await prisma.ticketListing.findFirst({
    where: { id: req.params.id, status: 'DISPONIBLE' },
    include: {
      seller: {
        select: { id: true, reputationScore: true, kyc: { select: { status: true } } },
      },
    },
  });
  if (!listing) return res.status(404).json({ error: 'No encontrado' });
  res.json(listing);
});

router.post('/', requireAuth, upload.fields([
  { name: 'captureTicket', maxCount: 1 },
  { name: 'captureOwnership', maxCount: 1 },
]), async (req: AuthRequest, res) => {
  const body = { ...req.body, price: req.body.price != null ? Number(req.body.price) : undefined };
  const parsed = createTicketListingSchema.safeParse(body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Datos inválidos', details: parsed.error.flatten() });
    return;
  }
  const files = req.files as { [key: string]: Express.Multer.File[] };
  const baseUrl = process.env.APP_URL || 'http://localhost:3001';
  const captureTicketUrl = files.captureTicket?.[0] ? `${baseUrl}/uploads/${files.captureTicket[0].filename}` : undefined;
  const captureOwnershipUrl = files.captureOwnership?.[0] ? `${baseUrl}/uploads/${files.captureOwnership[0].filename}` : undefined;
  const publicationPassword = (req.body.publicationPassword as string) || undefined;
  const ticketeraOtra = (req.body.ticketeraOtra as string) || undefined;
  const appBoletosOtra = (req.body.appBoletosOtra as string) || undefined;
  const tipoEntradaOtro = (req.body.tipoEntradaOtro as string) || undefined;

  const listing = await prisma.ticketListing.create({
    data: {
      sellerId: req.user!.id,
      eventName: parsed.data.eventName,
      eventDate: new Date(parsed.data.eventDate),
      eventPlace: parsed.data.eventPlace,
      sector: parsed.data.sector,
      row: parsed.data.row,
      seat: parsed.data.seat,
      tipoEntrada: parsed.data.tipoEntrada,
      price: parsed.data.price,
      currency: parsed.data.currency,
      ticketera: parsed.data.ticketera,
      appBoletos: parsed.data.appBoletos,
      orderRef: parsed.data.orderRef,
      category: parsed.data.category ?? 'OTRO',
      status: 'PENDIENTE_VERIFICACION',
      captureTicketUrl,
      captureOwnershipUrl,
      publicationPassword,
      ticketeraOtra,
      appBoletosOtra,
      tipoEntradaOtro,
    },
  });
  res.status(201).json(listing);
});

router.get('/my/listings', requireAuth, async (req: AuthRequest, res) => {
  const listings = await prisma.ticketListing.findMany({
    where: { sellerId: req.user!.id },
    orderBy: { createdAt: 'desc' },
  });
  res.json(listings);
});

router.patch('/:id/pause', requireAuth, async (req: AuthRequest, res) => {
  const updated = await prisma.ticketListing.updateMany({
    where: { id: req.params.id, sellerId: req.user!.id },
    data: { status: 'PAUSADO' },
  });
  if (updated.count === 0) return res.status(404).json({ error: 'No encontrado' });
  res.json({ ok: true });
});

router.patch('/:id/activate', requireAuth, async (req: AuthRequest, res) => {
  const updated = await prisma.ticketListing.updateMany({
    where: { id: req.params.id, sellerId: req.user!.id },
    data: { status: 'DISPONIBLE' },
  });
  if (updated.count === 0) return res.status(404).json({ error: 'No encontrado' });
  res.json({ ok: true });
});

export const ticketsRouter = router;
