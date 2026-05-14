/**
 * Rutas de publicaciones de tickets - Firestore + Firebase Storage.
 */

import { Router } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { db, COLLECTIONS } from '../lib/firestore.js';
import { getAuth } from '../lib/firebase-admin.js';
import { storeListingCaptureWithRedaction } from '../lib/ticket-listing-images.js';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';
import { createTicketListingSchema } from '@tickets-transfer/shared';
import { getMarketplaceHomePublicListingsLimit } from '../lib/settings.js';

/** PATCH /mine/:id — mismo criterio que en shared/schemas (evita import roto si no se pushea packages/shared). */
const updateTicketListingSchema = createTicketListingSchema.partial().extend({
  publicationPassword: z
    .string()
    .nullable()
    .optional()
    .transform((s) => (s === '' ? null : s)),
  ticketeraOtra: z.string().optional().transform((s) => (s === '' ? undefined : s)),
  appBoletosOtra: z.string().optional().transform((s) => (s === '' ? undefined : s)),
  tipoEntradaOtro: z.string().optional().transform((s) => (s === '' ? undefined : s)),
});

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.get('/', async (_req, res) => {
  const snap = await db()
    .collection(COLLECTIONS.TICKET_LISTINGS)
    .where('status', '==', 'DISPONIBLE')
    .where('visibility', '==', 'PUBLIC')
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
    .where('visibility', '==', 'PUBLIC')
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

/** Marketplace: tickets públicos. `?scope=store` lista hasta 100 para la Tienda; sin query usa límite de inicio (Admin). */
router.get('/marketplace/public', async (req, res) => {
  const scope = typeof req.query.scope === 'string' ? req.query.scope : '';
  const homeLimit = await getMarketplaceHomePublicListingsLimit();
  const limit = scope === 'store' ? 100 : Math.min(100, homeLimit);
  const snap = await db()
    .collection(COLLECTIONS.TICKET_LISTINGS)
    .where('status', '==', 'DISPONIBLE')
    .where('visibility', '==', 'PUBLIC')
    .orderBy('createdAt', 'desc')
    .limit(limit)
    .get();

  const items = await Promise.all(
    snap.docs.map(async (doc) => {
      const d = doc.data();
      const sellerDoc = await db().collection(COLLECTIONS.USERS).doc(d.sellerId).get();
      const sellerData = sellerDoc.data();
      const eventDate = d.eventDate?.toDate?.() ?? d.eventDate;
      const name =
        sellerData &&
        ([sellerData.firstName, sellerData.lastName].filter(Boolean).join(' ') || sellerData.username || 'Vendedor');
      return {
        id: doc.id,
        eventName: d.eventName,
        eventDate,
        eventPlace: d.eventPlace ?? null,
        quantityEntries: d.quantityEntries ?? null,
        seller: sellerData
          ? {
              id: d.sellerId,
              displayName: name,
              reputationScore: sellerData.reputationScore ?? 0,
            }
          : { id: d.sellerId, displayName: 'Vendedor', reputationScore: 0 },
      };
    })
  );
  res.json({ limit, items, scope: scope === 'store' ? 'store' : 'home' });
});

router.get('/:id', async (req, res) => {
  const doc = await db().collection(COLLECTIONS.TICKET_LISTINGS).doc(req.params.id).get();
  if (!doc.exists) return res.status(404).json({ error: 'No encontrado' });
  const d = doc.data()!;
  if (d.status !== 'DISPONIBLE') return res.status(404).json({ error: 'No encontrado' });

  const password = req.query.password as string | undefined;
  const pubPassword = d.publicationPassword;
  const isPublicListing = d.visibility === 'PUBLIC';
  const showFull =
    isPublicListing || !pubPassword || (password != null && password === pubPassword);

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

  delete out.captureTicketOriginalUrl;
  delete out.captureOwnershipOriginalUrl;
  if (!showFull) {
    delete out.captureTicketUrl;
    delete out.captureOwnershipUrl;
    delete out.orderRef;
  }
  delete out.publicationPassword;
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

    let captureTicketUrl: string | undefined;
    let captureTicketOriginalUrl: string | undefined;
    let captureOwnershipUrl: string | undefined;
    let captureOwnershipOriginalUrl: string | undefined;

    const ticketFile = files.captureTicket?.[0];
    const ownershipFile = files.captureOwnership?.[0];
    if (ticketFile && ownershipFile) {
      const [ticketRes, ownershipRes] = await Promise.all([
        storeListingCaptureWithRedaction(listingId, 'ticket', ticketFile),
        storeListingCaptureWithRedaction(listingId, 'ownership', ownershipFile),
      ]);
      captureTicketOriginalUrl = ticketRes.originalUrl;
      captureTicketUrl = ticketRes.redactedUrl;
      captureOwnershipOriginalUrl = ownershipRes.originalUrl;
      captureOwnershipUrl = ownershipRes.redactedUrl;
    } else {
      if (ticketFile) {
        const { originalUrl, redactedUrl } = await storeListingCaptureWithRedaction(listingId, 'ticket', ticketFile);
        captureTicketOriginalUrl = originalUrl;
        captureTicketUrl = redactedUrl;
      }
      if (ownershipFile) {
        const { originalUrl, redactedUrl } = await storeListingCaptureWithRedaction(
          listingId,
          'ownership',
          ownershipFile
        );
        captureOwnershipOriginalUrl = originalUrl;
        captureOwnershipUrl = redactedUrl;
      }
    }

    let publicationPassword = (req.body.publicationPassword as string)?.trim() || null;
    const vis = parsed.data.visibility;
    let visibility: 'PUBLIC' | 'PRIVATE' | undefined;
    if (vis === 'PUBLIC') {
      visibility = 'PUBLIC';
      publicationPassword = null;
    } else if (vis === 'PRIVATE') {
      visibility = 'PRIVATE';
      if (!publicationPassword || publicationPassword.length < 4) {
        res.status(400).json({
          error: 'Las publicaciones privadas requieren una contraseña de al menos 4 caracteres.',
          code: 'PRIVATE_PASSWORD_REQUIRED',
        });
        return;
      }
    } else {
      visibility = undefined;
    }
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
      status: 'DISPONIBLE',
      ...(visibility !== undefined ? { visibility } : {}),
      captureTicketUrl: captureTicketUrl ?? null,
      captureTicketOriginalUrl: captureTicketOriginalUrl ?? null,
      captureOwnershipUrl: captureOwnershipUrl ?? null,
      captureOwnershipOriginalUrl: captureOwnershipOriginalUrl ?? null,
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

router.get('/mine/:listingId', requireAuth, async (req: AuthRequest, res) => {
  const doc = await db().collection(COLLECTIONS.TICKET_LISTINGS).doc(req.params.listingId).get();
  if (!doc.exists || doc.data()?.sellerId !== req.user!.id) {
    return res.status(404).json({ error: 'No encontrado' });
  }
  const d = doc.data()!;
  res.json({
    id: doc.id,
    ...d,
    publicationPassword: d.publicationPassword ?? null,
    createdAt: d.createdAt?.toDate?.() ?? d.createdAt,
    updatedAt: d.updatedAt?.toDate?.() ?? d.updatedAt,
    eventDate: d.eventDate?.toDate?.() ?? d.eventDate,
  });
});

router.patch('/mine/:listingId', requireAuth, async (req: AuthRequest, res) => {
  const doc = await db().collection(COLLECTIONS.TICKET_LISTINGS).doc(req.params.listingId).get();
  if (!doc.exists || doc.data()?.sellerId !== req.user!.id) {
    return res.status(404).json({ error: 'No encontrado' });
  }
  const d = doc.data()!;
  const parsed = updateTicketListingSchema.safeParse(req.body);
  if (!parsed.success) {
    const flat = parsed.error.flatten();
    const msg = flat.formErrors[0] || 'Datos inválidos';
    return res.status(400).json({ error: msg, details: flat });
  }
  const payload = parsed.data;
  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (payload.eventName !== undefined) updates.eventName = payload.eventName;
  if (payload.eventPlace !== undefined) updates.eventPlace = payload.eventPlace ?? null;
  if (payload.sector !== undefined) updates.sector = payload.sector ?? null;
  if (payload.row !== undefined) updates.row = payload.row ?? null;
  if (payload.seat !== undefined) updates.seat = payload.seat ?? null;
  if (payload.orderRef !== undefined) updates.orderRef = payload.orderRef ?? null;
  if (payload.ticketera !== undefined) updates.ticketera = payload.ticketera;
  if (payload.appBoletos !== undefined) updates.appBoletos = payload.appBoletos;
  if (payload.tipoEntrada !== undefined) updates.tipoEntrada = payload.tipoEntrada;
  if (payload.currency !== undefined) updates.currency = payload.currency;
  if (payload.category !== undefined) updates.category = payload.category ?? null;
  if (payload.ticketeraOtra !== undefined) updates.ticketeraOtra = payload.ticketeraOtra ?? null;
  if (payload.appBoletosOtra !== undefined) updates.appBoletosOtra = payload.appBoletosOtra ?? null;
  if (payload.tipoEntradaOtro !== undefined) updates.tipoEntradaOtro = payload.tipoEntradaOtro ?? null;
  if (payload.eventDate !== undefined) updates.eventDate = new Date(payload.eventDate);
  if (payload.price !== undefined) updates.price = payload.price;
  if (payload.quantityEntries !== undefined) {
    updates.quantityEntries =
      payload.quantityEntries === '' || payload.quantityEntries == null
        ? null
        : String(payload.quantityEntries);
  }
  if (payload.visibility !== undefined) updates.visibility = payload.visibility;
  if (payload.publicationPassword !== undefined) {
    updates.publicationPassword =
      payload.publicationPassword == null || payload.publicationPassword === ''
        ? null
        : String(payload.publicationPassword).trim();
  }

  const nextVis = (updates.visibility as string | undefined) ?? d.visibility;
  const nextPwd =
    updates.publicationPassword !== undefined
      ? String(updates.publicationPassword ?? '').trim()
      : String(d.publicationPassword || '').trim();

  if (nextVis === 'PUBLIC') {
    updates.visibility = 'PUBLIC';
    updates.publicationPassword = null;
  } else if (nextVis === 'PRIVATE') {
    if (nextPwd.length < 4) {
      return res.status(400).json({
        error: 'Publicación privada: indicá una contraseña de al menos 4 caracteres.',
        code: 'PRIVATE_PASSWORD_REQUIRED',
      });
    }
  } else {
    const legacyOpen = d.visibility == null && !String(d.publicationPassword || '').trim();
    if (payload.visibility === 'PRIVATE') {
      if (nextPwd.length < 4) {
        return res.status(400).json({
          error: 'Publicación privada: indicá una contraseña de al menos 4 caracteres.',
          code: 'PRIVATE_PASSWORD_REQUIRED',
        });
      }
      updates.visibility = 'PRIVATE';
    } else if (!legacyOpen && nextPwd.length < 4) {
      return res.status(400).json({
        error: 'Publicación privada: indicá una contraseña de al menos 4 caracteres.',
        code: 'PRIVATE_PASSWORD_REQUIRED',
      });
    } else if (legacyOpen && payload.publicationPassword !== undefined && nextPwd.length > 0 && nextPwd.length < 4) {
      return res.status(400).json({
        error: 'La contraseña debe tener al menos 4 caracteres.',
        code: 'PRIVATE_PASSWORD_REQUIRED',
      });
    }
  }

  const keys = Object.keys(updates).filter((k) => k !== 'updatedAt');
  if (keys.length === 0) {
    return res.status(400).json({ error: 'Ningún campo para actualizar' });
  }

  await db().collection(COLLECTIONS.TICKET_LISTINGS).doc(req.params.listingId).update(updates);
  const refreshed = await db().collection(COLLECTIONS.TICKET_LISTINGS).doc(req.params.listingId).get();
  const refreshedData = refreshed.data()!;
  res.json({
    id: refreshed.id,
    ...refreshedData,
    publicationPassword: refreshedData.publicationPassword ?? null,
    createdAt: refreshedData.createdAt?.toDate?.() ?? refreshedData.createdAt,
    updatedAt: refreshedData.updatedAt?.toDate?.() ?? refreshedData.updatedAt,
    eventDate: refreshedData.eventDate?.toDate?.() ?? refreshedData.eventDate,
  });
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
