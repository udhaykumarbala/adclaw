import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { v4 as uuid } from 'uuid';
import { LandingPage } from '../types';

export const landingRouter = Router();

const SITES_DIR = path.join(process.cwd(), 'public', 'sites');
const PUBLIC_URL = process.env.ADCLAW_PUBLIC_URL || 'http://localhost:3402';

if (!fs.existsSync(SITES_DIR)) fs.mkdirSync(SITES_DIR, { recursive: true });

function escapeAttr(s: string): string {
  return s.replace(/[&"'<>]/g, c =>
    ({ '&': '&amp;', '"': '&quot;', "'": '&#39;', '<': '&lt;', '>': '&gt;' }[c] || c)
  );
}

function sanitizeSlug(raw: string): string {
  const safe = raw.replace(/[^a-z0-9-]/gi, '-').toLowerCase();
  return safe || 'untitled';
}

landingRouter.post('/', (req: Request, res: Response) => {
  try {
    const { slug, campaignId, title, html } = req.body;

    if (!slug || !html) {
      return res.status(400).json({ error: 'slug and html are required' });
    }
    if (html.length > 500_000) {
      return res.status(400).json({ error: 'html exceeds 500KB limit' });
    }

    const safeSlug = sanitizeSlug(slug);
    const safeCampaignId = escapeAttr(campaignId || '');
    const filePath = path.join(SITES_DIR, `${safeSlug}.html`);

    let finalHtml = html;
    if (!finalHtml.includes('tracker.js')) {
      finalHtml = finalHtml.replace(
        '</body>',
        `<script src="/tracker.js" data-campaign="${safeCampaignId}" data-page="${safeSlug}"></script>\n</body>`
      );
    }

    fs.writeFileSync(filePath, finalHtml, 'utf-8');

    const page: LandingPage = {
      slug: safeSlug,
      campaignId: campaignId || uuid(),
      title: title || safeSlug,
      html: finalHtml,
      url: `${PUBLIC_URL}/sites/${safeSlug}.html`,
      createdAt: new Date().toISOString(),
    };

    res.json({
      success: true,
      url: page.url,
      slug: page.slug,
      message: `Landing page deployed at ${page.url}`,
    });
  } catch (err) {
    console.error('Landing page error:', err);
    res.status(500).json({ error: 'Failed to deploy landing page' });
  }
});

landingRouter.get('/:slug', (req: Request, res: Response) => {
  const safeSlug = sanitizeSlug(req.params.slug);
  const filePath = path.join(SITES_DIR, `${safeSlug}.html`);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Page not found' });
  }
  res.json({
    slug: safeSlug,
    url: `${PUBLIC_URL}/sites/${safeSlug}.html`,
    exists: true,
  });
});
