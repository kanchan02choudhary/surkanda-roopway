import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config, assertProductionConfig } from './config.js';
import contactRoutes from './routes/contact.js';
import bookingRoutes from './routes/bookings.js';
import adminRoutes from './routes/admin.js';
import webhookRoutes from './routes/webhook.js';
import { purgeOldDocuments } from './lib/cleanup.js';

if (config.env === 'production') assertProductionConfig();

const app = express();
app.set('trust proxy', 1); // behind Render/Railway/Nginx: real client IP for rate limiting
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: (origin, cb) => (!origin || config.corsOrigins.includes(origin) ? cb(null, true) : cb(new Error('Origin not allowed by CORS'))),
  methods: ['GET', 'POST', 'PUT', 'PATCH'], allowedHeaders: ['Content-Type', 'x-admin-api-key', 'x-booking-token'],
}));

// Razorpay webhook needs the raw body for signature verification — must be mounted BEFORE express.json()
app.use('/api/webhooks/razorpay', express.raw({ type: '*/*', limit: '1mb' }), webhookRoutes);

app.use(express.json({ limit: '1mb' }));
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: true, legacyHeaders: false }));

app.get('/api/health', (_, res) => res.json({ status: 'ok', service: 'Surkanda Ropeway API', db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' }));
app.use('/api/contact', contactRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', (_, res) => res.status(404).json({ message: 'Not found' }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.name === 'ZodError') return res.status(400).json({ message: err.issues?.[0]?.message || 'Invalid input.' });
  if (err.name === 'MulterError') return res.status(400).json({ message: err.code === 'LIMIT_FILE_SIZE' ? 'File is larger than 5 MB.' : err.message });
  if (err.message?.startsWith('Only PDF')) return res.status(400).json({ message: err.message });
  if (err.code === 11000) return res.status(409).json({ message: 'Duplicate record.' });
  const status = err.status || err.statusCode || 500;
  if (status >= 500) console.error(err);
  // Razorpay SDK errors carry err.error.description
  const message = status >= 500 ? (err.error?.description ? `Payment gateway error: ${err.error.description}` : 'Something went wrong. Please try again.') : err.message;
  res.status(status >= 400 && status < 600 ? status : 500).json({ message });
});

async function start() {
  if (!config.mongoUri) throw new Error('MONGODB_URI is not set');
  await mongoose.connect(config.mongoUri);
  console.log('MongoDB connected');
  purgeOldDocuments().catch((e) => console.error('cleanup failed', e.message));
  setInterval(() => purgeOldDocuments().catch((e) => console.error('cleanup failed', e.message)), 12 * 3600 * 1000).unref();
  const server = app.listen(config.port, () => console.log(`API running on ${config.port} (${config.env})`));
  const stop = () => server.close(() => mongoose.connection.close().finally(() => process.exit(0)));
  process.on('SIGTERM', stop); process.on('SIGINT', stop);
}
start().catch((e) => { console.error('Startup failed:', e.message); process.exit(1); });
