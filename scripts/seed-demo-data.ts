#!/usr/bin/env npx tsx
/**
 * Seeds demo analytics data for the AdClaw dashboard.
 * Run: npx tsx scripts/seed-demo-data.ts [campaignId]
 */

const CAMPAIGN_ID = process.argv[2] || 'demo-campaign-001';
const SERVER = process.env.ADCLAW_SERVER_URL || 'http://localhost:3402';
const SECRET = process.env.INTERNAL_SECRET || 'test-secret';

const EVENT_TYPES = [
  { name: 'page_view', weight: 50 },
  { name: 'scroll_25', weight: 15 },
  { name: 'scroll_50', weight: 10 },
  { name: 'scroll_75', weight: 5 },
  { name: 'cta_click', weight: 8 },
  { name: 'rsvp', weight: 4 },
  { name: 'form_submit', weight: 3 },
  { name: 'purchase', weight: 2 },
];

function pickEvent(): string {
  const total = EVENT_TYPES.reduce((s, e) => s + e.weight, 0);
  let r = Math.random() * total;
  for (const e of EVENT_TYPES) {
    r -= e.weight;
    if (r <= 0) return e.name;
  }
  return 'page_view';
}

async function seed() {
  // Create demo campaign if none provided
  if (!process.argv[2]) {
    console.log('Creating demo campaign...');
    const res = await fetch(`${SERVER}/api/campaign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-internal-agent': SECRET },
      body: JSON.stringify({
        name: 'Chennai Coffee Grand Opening',
        product: 'Artisan coffee shop',
        budget: 50000,
        currency: 'INR',
        targetAudience: '18-35 foodies in Chennai',
        goal: 'awareness + event signups',
        location: 'Chennai, Tamil Nadu',
        channels: ['google_search', 'meta', 'instagram'],
        budgetSplit: { google_search: 40, meta: 35, instagram: 25 },
        timeline: '4 weeks',
        status: 'active',
      }),
    });
    const data = await res.json();
    console.log(`Campaign: ${data.campaign.id}`);
  }

  // Seed 200 events over the past 7 days
  const now = Date.now();
  const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
  const clientIds = Array.from({ length: 50 }, (_, i) => `visitor-${i + 1}`);

  console.log(`Seeding 200 events for campaign ${CAMPAIGN_ID}...`);

  for (let i = 0; i < 200; i++) {
    const event = {
      campaignId: CAMPAIGN_ID,
      pageSlug: Math.random() > 0.3 ? 'chennai-coffee' : 'grand-opening',
      eventName: pickEvent(),
      clientId: clientIds[Math.floor(Math.random() * clientIds.length)],
      value: 0,
    };

    if (event.eventName === 'purchase') {
      event.value = Math.floor(Math.random() * 500) + 100;
    }

    await fetch(`${SERVER}/api/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });

    if (i % 50 === 0) console.log(`  ${i}/200...`);
  }

  console.log('Done! 200 events seeded.');
  console.log(`View report: curl ${SERVER}/api/report/${CAMPAIGN_ID}`);
}

seed().catch(console.error);
