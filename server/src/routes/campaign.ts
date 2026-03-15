import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { v4 as uuid } from 'uuid';
import { Campaign } from '../types';

export const campaignRouter = Router();

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'campaigns.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

function readCampaigns(): Campaign[] {
  if (!fs.existsSync(DATA_FILE)) return [];
  const content = fs.readFileSync(DATA_FILE, 'utf-8').trim();
  if (!content) return [];
  return JSON.parse(content);
}

function writeCampaigns(campaigns: Campaign[]) {
  const tmp = DATA_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(campaigns, null, 2), 'utf-8');
  fs.renameSync(tmp, DATA_FILE);
}

campaignRouter.post('/', (req: Request, res: Response) => {
  try {
    const budget = Number(req.body.budget);
    if (isNaN(budget) || budget < 0) {
      return res.status(400).json({ error: 'budget must be a positive number' });
    }

    const campaign: Campaign = {
      id: uuid(),
      name: req.body.name || 'Untitled Campaign',
      product: req.body.product || '',
      budget,
      currency: req.body.currency || 'INR',
      targetAudience: req.body.targetAudience || '',
      goal: req.body.goal || '',
      location: req.body.location || '',
      channels: req.body.channels || [],
      budgetSplit: req.body.budgetSplit || {},
      timeline: req.body.timeline || '',
      kpis: req.body.kpis || {},
      adVariants: req.body.adVariants || [],
      landingPageSlug: req.body.landingPageSlug,
      eventPageSlug: req.body.eventPageSlug,
      createdAt: new Date().toISOString(),
      status: 'planned',
    };

    const campaigns = readCampaigns();
    campaigns.push(campaign);
    writeCampaigns(campaigns);

    res.json({ success: true, campaign });
  } catch (err) {
    console.error('Campaign create error:', err);
    res.status(500).json({ error: 'Failed to create campaign' });
  }
});

campaignRouter.patch('/:id', (req: Request, res: Response) => {
  try {
    const campaigns = readCampaigns();
    const idx = campaigns.findIndex(c => c.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Campaign not found' });

    const allowed = ['status', 'landingPageSlug', 'eventPageSlug', 'adVariants', 'kpis'];
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        (campaigns[idx] as any)[key] = req.body[key];
      }
    }

    writeCampaigns(campaigns);
    res.json({ success: true, campaign: campaigns[idx] });
  } catch (err) {
    console.error('Campaign update error:', err);
    res.status(500).json({ error: 'Failed to update campaign' });
  }
});

campaignRouter.get('/:id', (req: Request, res: Response) => {
  const campaigns = readCampaigns();
  const campaign = campaigns.find(c => c.id === req.params.id);
  if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
  res.json({ success: true, campaign });
});

campaignRouter.get('/', (_req: Request, res: Response) => {
  res.json({ success: true, campaigns: readCampaigns() });
});
