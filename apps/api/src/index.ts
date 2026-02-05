/**
 * Punto de entrada de la API Tickets Transfer v2.
 * Ubicación: apps/api/src/index.ts
 */

import 'dotenv/config';
import express from 'express';
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
import { adminRouter } from './routes/admin.js';
import { healthRouter } from './routes/health.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT ?? 3001;

const isProduction = process.env.NODE_ENV === 'production';
// En producción permitir cualquier origen (app móvil, web, etc.). En desarrollo solo orígenes configurados.
const corsOrigin = isProduction
  ? true
  : [
      process.env.CORS_ORIGIN_WEB || 'http://localhost:5173',
      process.env.CORS_ORIGIN_ADMIN || 'http://localhost:5174',
    ].filter(Boolean);

app.use(helmet());
app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json({ limit: '2mb' }));

const uploadsDir = path.join(__dirname, '..', 'uploads');
app.use('/uploads', express.static(uploadsDir));

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: { error: 'Demasiadas solicitudes' },
  })
);

app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/tickets', ticketsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/disputes', disputesRouter);
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
