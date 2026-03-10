/**
 * Rutas de publicaciones de tickets - Firestore + Firebase Storage.
 */

import { Router } from 'express';
import multer from 'multer';
import { db, COLLECTIONS } from '../lib/firestore.js';
import { getAuth } from '../lib/firebase-admin.js';
import { uploadFile } from '../lib/firebase-storage.js';
import { redactImage, parsePixelateRegionsFromBody } from '../lib/image-redaction.js';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';
import { createTicketListingSchema } from '@tickets-transfer/shared';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.get('/', async (_req, res) => {
  const snap = await db()
    .collection(COLLECTIONS.TICKET_LISTINGS)
    .where('status', '==', 'DISPONIBLE')
    .orderBy('createdAt', 'desc')
    .limit(50)
    .get();

  const listings = await Promise.all(
    snap.docs.map(async (doc) => {
      const d = doc.data();
      const sellerDoc = await db().collection(COLLECTIONS.USERS).doc(d.sellerId).get();
      const sellerData = sellerDoc.data();
      const kycDoc = sellerDoc.exists
        ? await db().collection(COLLECTIONS.KYC_VERIFICATIONS).doc(d.sellerId).get()
        : null;
      return {
        id: doc.id,
        ...d,
        seller: sellerData
          ? {
              id: d.sellerId,
              reputationScore: sellerData.reputationScore ?? 0,
              kyc: kycDoc?.exists ? { status: kycDoc.data()?.status } : { status: 'PENDIENTE' },
            }
          : null,
        createdAt: d.createdAt?.toDate?.() ?? d.createdAt,
        updatedAt: d.updatedAt?.toDate?.() ?? d.updatedAt,
        eventDate: d.eventDate?.toDate?.() ?? d.eventDate,
      };
    })
  );
  res.json(listings);
});

router.get('/eventos', async (req, res) => {
  const { q, categoria, fecha } = req.query;
  const snap = await db()
    .collection(COLLECTIONS.TICKET_LISTINGS)
    .where('status', '==', 'DISPONIBLE')
    .orderBy('eventDate', 'asc')
    .limit(200)
    .get();

  let eventos = snap.docs.map((doc) => {
    const d = doc.data();
    return {
      id: doc.id,
      eventName: d.eventName,
      eventDate: d.eventDate?.toDate?.() ?? d.eventDate,
      eventPlace: d.eventPlace,
      sector: d.sector,
      tipoEntrada: d.tipoEntrada,
      price: d.price,
      currency: d.currency,
      category: d.category,
    };
  });

  if (typeof q === 'string' && q) {
    const ql = q.toLowerCase();
    eventos = eventos.filter((e) => (e.eventName || '').toLowerCase().includes(ql));
  }
  if (typeof categoria === 'string' && categoria) {
    eventos = eventos.filter((e) => e.category === categoria);
  }
  if (typeof fecha === 'string' && fecha) {
    const fd = new Date(fecha).getTime();
    eventos = eventos.filter((e) => {
      const ed = e.eventDate instanceof Date ? e.eventDate.getTime() : new Date(e.eventDate as string).getTime();
      return ed >= fd;
    });
  }

  res.json(eventos.slice(0, 100));
});

router.get('/:id', async (req, res) => {
  const doc = await db().collection(COLLECTIONS.TICKET_LISTINGS).doc(req.params.id).get();
  if (!doc.exists) return res.status(404).json({ error: 'No encontrado' });
  const d = doc.data()!;
  if (d.status !== 'DISPONIBLE') return res.status(404).json({ error: 'No encontrado' });

  const password = req.query.password as string | undefined;
  const pubPassword = d.publicationPassword;
  const showFull = !pubPassword || (password && password === pubPassword);

  const sellerDoc = await db().collection(COLLECTIONS.USERS).doc(d.sellerId).get();
  const sellerData = sellerDoc.data();
  const kycDoc = sellerDoc.exists
    ? await db().collection(COLLECTIONS.KYC_VERIFICATIONS).doc(d.sellerId).get()
    : null;

  const out: Record<string, unknown> = {
    id: doc.id,
    ...d,
    seller: sellerData
      ? {
          id: d.sellerId,
          firstName: sellerData.firstName,
          lastName: sellerData.lastName,
          username: sellerData.username,
          reputationScore: sellerData.reputationScore ?? 0,
          phoneVerified: sellerData.phoneVerified ?? false,
          emailVerified: sellerData.emailVerified ?? false,
          kyc: kycDoc?.exists ? { status: kycDoc.data()?.status } : { status: 'PENDIENTE' },
        }
      : null,
    showFull,
    createdAt: d.createdAt?.toDate?.() ?? d.createdAt,
    updatedAt: d.updatedAt?.toDate?.() ?? d.updatedAt,
    eventDate: d.eventDate?.toDate?.() ?? d.eventDate,
  };

  if (!showFull) {
    delete out.captureTicketUrl;
    delete out.captureOwnershipUrl;
    delete out.orderRef;
  }
  res.json(out);
});

router.post(
  '/',
  requireAuth,
  upload.fields([
    { name: 'captureTicket', maxCount: 1 },
    { name: 'captureOwnership', maxCount: 1 },
  ]),
  async (req: AuthRequest, res) => {
    const userId = req.user!.id;
    const [userDoc, kycDoc, firebaseUser] = await Promise.all([
      db().collection(COLLECTIONS.USERS).doc(userId).get(),
      db().collection(COLLECTIONS.KYC_VERIFICATIONS).doc(userId).get(),
      getAuth().getUser(userId).catch(() => null),
    ]);
    const userData = userDoc.exists ? userDoc.data() : null;
    const kycData = kycDoc.exists ? kycDoc.data() : null;
    const kycStatus = kycData?.status ?? 'PENDIENTE';
    const emailVerified = userData?.emailVerified ?? firebaseUser?.emailVerified ?? false;
    const phoneVerified = userData?.phoneVerified ?? false;

    if (kycStatus !== 'APROBADO') {
      res.status(403).json({
        error: 'Para publicar tickets debés tener la verificación KYC aprobada.',
        code: 'KYC_REQUIRED',
      });
      return;
    }
    if (!emailVerified) {
      res.status(403).json({
        error: 'Para publicar tickets debés tener el email verificado.',
        code: 'EMAIL_VERIFICATION_REQUIRED',
      });
      return;
    }
    if (!phoneVerified) {
      res.status(403).json({
        error: 'Para publicar tickets debés tener el teléfono verificado.',
        code: 'PHONE_VERIFICATION_REQUIRED',
      });
      return;
    }

    const body = { ...req.body, price: req.body.price != null ? Number(req.body.price) : undefined };
    const parsed = createTicketListingSchema.safeParse(body);
    if (!parsed.success) {
      const flat = parsed.error.flatten();
      const fieldErrs = flat.fieldErrors as Record<string, string[]>;
      const firstKey = Object.keys(fieldErrs)[0];
      const firstMsg = firstKey ? fieldErrs[firstKey]?.[0] : flat.formErrors?.[0];
      const msg = firstMsg ? `Datos inválidos: ${firstMsg}` : 'Datos inválidos';
      res.status(400).json({ error: msg, details: flat });
      return;
    }
    const files = req.files as { [key: string]: Express.Multer.File[] };
    const listingId = db().collection(COLLECTIONS.TICKET_LISTINGS).doc().id;

    const pixelateRegions = parsePixelateRegionsFromBody(req.body as Record<string, unknown>);

    let captureTicketUrl: string | undefined;
    let captureOwnershipUrl: string | undefined;

    if (files.captureTicket?.[0]) {
      const file = files.captureTicket[0];
      const { buffer, mimeType } = await redactImage(file.buffer, {
        regions: pixelateRegions,
      });
      captureTicketUrl = await uploadFile(
        `tickets/${listingId}/capture_${Date.now()}.jpg`,
        buffer,
        mimeType
      );
    }
    if (files.captureOwnership?.[0]) {
      const file = files.captureOwnership[0];
      const { buffer, mimeType } = await redactImage(file.buffer, {
        regions: pixelateRegions,
      });
      captureOwnershipUrl = await uploadFile(
        `tickets/${listingId}/ownership_${Date.now()}.jpg`,
        buffer,
        mimeType
      );
    }

    const publicationPassword = (req.body.publicationPassword as string)?.trim() || null;
    const ticketeraOtra = (req.body.ticketeraOtra as string)?.trim() || null;
    const appBoletosOtra = (req.body.appBoletosOtra as string)?.trim() || null;
    const tipoEntradaOtro = (req.body.tipoEntradaOtro as string)?.trim() || null;
    const quantityEntries = parsed.data.quantityEntries != null ? String(parsed.data.quantityEntries) : null;

    const listingData = {
      sellerId: req.user!.id,
      eventName: parsed.data.eventName,
      eventDate: new Date(parsed.data.eventDate),
      eventPlace: parsed.data.eventPlace ?? null,
      sector: parsed.data.sector ?? null,
      row: parsed.data.row ?? null,
      seat: parsed.data.seat ?? null,
      quantityEntries,
      tipoEntrada: parsed.data.tipoEntrada,
      price: parsed.data.price,
      currency: parsed.data.currency ?? 'ARS',
      ticketera: parsed.data.ticketera,
      appBoletos: parsed.data.appBoletos,
      orderRef: parsed.data.orderRef ?? null,
      category: parsed.data.category ?? 'OTRO',
      status: 'PENDIENTE_VERIFICACION',
      captureTicketUrl: captureTicketUrl ?? null,
      captureOwnershipUrl: captureOwnershipUrl ?? null,
      publicationPassword,
      ticketeraOtra,
      appBoletosOtra,
      tipoEntradaOtro,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db().collection(COLLECTIONS.TICKET_LISTINGS).doc(listingId).set(listingData);

    const listing = { id: listingId, ...listingData };
    res.status(201).json(listing);
  }
);

router.get('/my/listings', requireAuth, async (req: AuthRequest, res) => {
  const snap = await db()
    .collection(COLLECTIONS.TICKET_LISTINGS)
    .where('sellerId', '==', req.user!.id)
    .orderBy('createdAt', 'desc')
    .get();

  const listings = snap.docs.map((doc) => {
    const d = doc.data();
    return {
      id: doc.id,
      ...d,
      createdAt: d.createdAt?.toDate?.() ?? d.createdAt,
      updatedAt: d.updatedAt?.toDate?.() ?? d.updatedAt,
      eventDate: d.eventDate?.toDate?.() ?? d.eventDate,
    };
  });
  res.json(listings);
});

router.patch('/:id/pause', requireAuth, async (req: AuthRequest, res) => {
  const doc = await db().collection(COLLECTIONS.TICKET_LISTINGS).doc(req.params.id).get();
  if (!doc.exists || doc.data()?.sellerId !== req.user!.id) return res.status(404).json({ error: 'No encontrado' });
  await db().collection(COLLECTIONS.TICKET_LISTINGS).doc(req.params.id).update({ status: 'PAUSADO', updatedAt: new Date() });
  res.json({ ok: true });
});

router.patch('/:id/activate', requireAuth, async (req: AuthRequest, res) => {
  const doc = await db().collection(COLLECTIONS.TICKET_LISTINGS).doc(req.params.id).get();
  if (!doc.exists || doc.data()?.sellerId !== req.user!.id) return res.status(404).json({ error: 'No encontrado' });
  await db().collection(COLLECTIONS.TICKET_LISTINGS).doc(req.params.id).update({ status: 'DISPONIBLE', updatedAt: new Date() });
  res.json({ ok: true });
});

export const ticketsRouter = router;
