/**
 * Punto de entrada de la API Tickets Transfer v2.
 * Firebase: Auth, Firestore, Storage, Cloud Messaging.
 */

import 'dotenv/config';
import express, { type Request } from 'express';
import { getFirebaseAdmin } from './lib/firebase-admin.js';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import { authRouter } from './routes/auth.js';
import { usersRouter } from './routes/users.js';
import { ticketsRouter } from './routes/tickets.js';
import { ordersRouter } from './routes/orders.js';
import { disputesRouter } from './routes/disputes.js';
import { messagesRouter } from './routes/messages.js';
import { adminRouter } from './routes/admin.js';
import { healthRouter } from './routes/health.js';
import { webhooksRouter } from './routes/webhooks.js';
import { mercadopagoRouter } from './routes/mercadopago.js';
import { invalidateSettingsCache } from './lib/settings.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT ?? 3001;

// Necesario cuando la API está detrás de un proxy (Railway, etc.) para que express-rate-limit
// identifique correctamente la IP del cliente mediante X-Forwarded-For
app.set('trust proxy', 1);

const isProduction = process.env.NODE_ENV === 'production';
// En producción permitir cualquier origen (app móvil, web, etc.). En desarrollo solo orígenes configurados.
const corsOrigin = isProduction
  ? true
  : [
      process.env.CORS_ORIGIN_WEB || 'http://localhost:5173',
      process.env.CORS_ORIGIN_ADMIN || 'http://localhost:5174',
    ].filter(Boolean);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        'script-src': ["'self'", 'https://sdk.mercadopago.com', "'unsafe-inline'"],
        'connect-src': ["'self'", 'https://api.mercadopago.com', 'https://sdk.mercadopago.com'],
        'frame-src': ["'self'", 'https://www.mercadopago.com', 'https://sdk.mercadopago.com', 'https://*.mercadopago.com'],
      },
    },
  })
);
app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(
  express.json({
    limit: '2mb',
    verify: (req, _res, buf) => {
      (req as Request & { rawBody?: string }).rawBody = buf.toString('utf8');
    },
  })
);

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: { error: 'Demasiadas solicitudes' },
  })
);

invalidateSettingsCache();

// Inicializar Firebase al arrancar (para validar credenciales temprano)
try {
  getFirebaseAdmin();
  console.log('Firebase inicializado');
} catch (e) {
  console.warn('Firebase no configurado. Definí GOOGLE_APPLICATION_CREDENTIALS o FIREBASE_SERVICE_ACCOUNT_JSON.');
}

app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/webhooks', webhooksRouter);
app.use('/api/mercadopago', mercadopagoRouter);
app.use('/api/users', usersRouter);
app.use('/api/tickets', ticketsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/disputes', disputesRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/admin', adminRouter);

app.use((_req, res) => {
  res.status(404).json({ error: 'No encontrado' });
});

app.use((err: unknown, _req: express.Request, res: express.Response) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(PORT, () => {
  console.log(`API Tickets Transfer v2 en http://localhost:${PORT}`);
});
