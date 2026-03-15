import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { v4 as uuid } from 'uuid';
import { TrackingEvent } from '../types';

export const trackRouter = Router();

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'events.jsonl');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

function appendEvent(event: TrackingEvent) {
  fs.appendFileSync(DATA_FILE, JSON.stringify(event) + '\n', 'utf-8');
}

export function readEvents(): TrackingEvent[] {
  if (!fs.existsSync(DATA_FILE)) return [];
  const content = fs.readFileSync(DATA_FILE, 'utf-8').trim();
  if (!content) return [];
  return content
    .split('\n')
    .filter(Boolean)
    .map(line => JSON.parse(line));
}

trackRouter.post('/', (req: Request, res: Response) => {
  try {
    const event: TrackingEvent = {
      id: uuid(),
      campaignId: req.body.campaignId || 'unknown',
      pageSlug: req.body.pageSlug || 'unknown',
      eventName: req.body.eventName || 'page_view',
      value: req.body.value || 0,
      clientId: req.body.clientId || 'anonymous',
      userAgent: req.body.userAgent || req.headers['user-agent'] || '',
      referrer: req.body.referrer || '',
      timestamp: new Date().toISOString(),
    };

    appendEvent(event);

    if (process.env.GA4_MEASUREMENT_ID && process.env.GA4_API_SECRET) {
      forwardToGA4(event).catch(() => {});
    }

    res.json({ success: true, eventId: event.id });
  } catch (err) {
    console.error('Track error:', err);
    res.status(500).json({ error: 'Failed to track event' });
  }
});

trackRouter.get('/', (req: Request, res: Response) => {
  try {
    const event: TrackingEvent = {
      id: uuid(),
      campaignId: (req.query.cid as string) || 'unknown',
      pageSlug: (req.query.page as string) || 'unknown',
      eventName: (req.query.event as string) || 'page_view',
      value: parseFloat(req.query.value as string) || 0,
      clientId: (req.query.uid as string) || 'anonymous',
      userAgent: req.headers['user-agent'] || '',
      referrer: req.headers.referer || '',
      timestamp: new Date().toISOString(),
    };

    appendEvent(event);

    const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    res.writeHead(200, { 'Content-Type': 'image/gif', 'Cache-Control': 'no-store' });
    res.end(pixel);
  } catch (err) {
    console.error('Pixel track error:', err);
    res.status(204).end();
  }
});

async function forwardToGA4(event: TrackingEvent) {
  const url = `https://www.google-analytics.com/mp/collect?measurement_id=${process.env.GA4_MEASUREMENT_ID}&api_secret=${process.env.GA4_API_SECRET}`;
  await fetch(url, {
    method: 'POST',
    body: JSON.stringify({
      client_id: event.clientId,
      events: [{
        name: event.eventName,
        params: {
          campaign_id: event.campaignId,
          page_slug: event.pageSlug,
          value: event.value,
        },
      }],
    }),
  });
}
