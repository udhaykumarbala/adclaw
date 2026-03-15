import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

export const eventRouter = Router();

const EVENTS_DIR = path.join(process.cwd(), 'public', 'events');
const PUBLIC_URL = process.env.ADCLAW_PUBLIC_URL || 'http://localhost:3402';

if (!fs.existsSync(EVENTS_DIR)) fs.mkdirSync(EVENTS_DIR, { recursive: true });

function escapeAttr(s: string): string {
  return s.replace(/[&"'<>]/g, c =>
    ({ '&': '&amp;', '"': '&quot;', "'": '&#39;', '<': '&lt;', '>': '&gt;' }[c] || c)
  );
}

function sanitizeSlug(raw: string): string {
  const safe = raw.replace(/[^a-z0-9-]/gi, '-').toLowerCase();
  return safe || 'untitled';
}

eventRouter.post('/', (req: Request, res: Response) => {
  try {
    const { slug, campaignId, html } = req.body;

    if (!slug || !html) {
      return res.status(400).json({ error: 'slug and html are required' });
    }
    if (html.length > 500_000) {
      return res.status(400).json({ error: 'html exceeds 500KB limit' });
    }

    const safeSlug = sanitizeSlug(slug);
    const safeCampaignId = escapeAttr(campaignId || '');
    const filePath = path.join(EVENTS_DIR, `${safeSlug}.html`);

    let finalHtml = html;
    if (!finalHtml.includes('tracker.js')) {
      finalHtml = finalHtml.replace(
        '</body>',
        `<script src="/tracker.js" data-campaign="${safeCampaignId}" data-page="${safeSlug}"></script>\n</body>`
      );
    }

    fs.writeFileSync(filePath, finalHtml, 'utf-8');

    res.json({
      success: true,
      url: `${PUBLIC_URL}/events/${safeSlug}.html`,
      slug: safeSlug,
      message: `Event page deployed at ${PUBLIC_URL}/events/${safeSlug}.html`,
    });
  } catch (err) {
    console.error('Event page error:', err);
    res.status(500).json({ error: 'Failed to deploy event page' });
  }
});
