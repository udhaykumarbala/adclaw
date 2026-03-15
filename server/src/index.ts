import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import compression from 'compression';
import path from 'path';
import fs from 'fs';
import { campaignRouter } from './routes/campaign';
import { landingRouter } from './routes/landing';
import { eventRouter } from './routes/event';
import { reportRouter } from './routes/report';
import { trackRouter } from './routes/track';
import { x402PaymentGate } from './middleware/goat-x402';
import { x402WebhookRouter } from './routes/x402-webhook';

const app = express();
const PORT = parseInt(process.env.PORT || '3402');
const INTERNAL_SECRET = process.env.INTERNAL_SECRET || '';

// Middleware
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '5mb' }));

// Internal agent auth bypass
function internalBypass(req: Request, _res: Response, next: NextFunction) {
  if (INTERNAL_SECRET && req.headers['x-internal-agent'] === INTERNAL_SECRET) {
    (req as any).skipPayment = true;
  }
  next();
}
app.use(internalBypass);

// Serve generated pages
app.use('/sites', express.static(path.join(process.cwd(), 'public', 'sites'), { maxAge: '1h' }));
app.use('/events', express.static(path.join(process.cwd(), 'public', 'events'), { maxAge: '1h' }));
app.use('/dashboard', express.static(path.join(process.cwd(), 'public', 'dashboard')));
app.use('/tracker.js', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'tracker.js'));
});

// x402 payment gate (skipped for internal agent)
const paymentGate = x402PaymentGate();
function conditionalPayment(req: Request, res: Response, next: NextFunction) {
  if ((req as any).skipPayment) return next();
  paymentGate(req, res, next);
}

// API routes
app.use('/api/campaign', conditionalPayment, campaignRouter);
app.use('/api/landing', conditionalPayment, landingRouter);
app.use('/api/event', conditionalPayment, eventRouter);
app.use('/api/report', conditionalPayment, reportRouter);
app.use('/api/track', trackRouter);
app.use('/api/x402/webhook', x402WebhookRouter);  // x402 payment confirmations

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'adclaw-server', timestamp: new Date().toISOString() });
});

// List all generated pages
app.get('/api/pages', (_req, res) => {
  const sitesDir = path.join(process.cwd(), 'public', 'sites');
  const eventsDir = path.join(process.cwd(), 'public', 'events');

  const sites = fs.existsSync(sitesDir)
    ? fs.readdirSync(sitesDir).filter((f: string) => f.endsWith('.html'))
    : [];
  const events = fs.existsSync(eventsDir)
    ? fs.readdirSync(eventsDir).filter((f: string) => f.endsWith('.html'))
    : [];

  res.json({ sites, events });
});

// Global error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`AdClaw server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down...');
  server.close(() => process.exit(0));
});
process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down...');
  server.close(() => process.exit(0));
});
