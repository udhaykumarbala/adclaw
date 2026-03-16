# AdClaw Long-Term Plan v1 — Autonomous Marketing Agent for Astrology Niche

**Created:** 2026-03-16
**Status:** First iteration — review, refine, then execute
**Target:** Fully autonomous marketing agent running on Mac Mini via OpenClaw, managing an astrology website's entire marketing funnel on $300-500/month

---

## 1. Executive Summary

### What We're Building

An autonomous marketing agent that runs 24/7 on a Mac Mini, managing the complete marketing lifecycle for an astrology website. The agent handles SEO monitoring, blog content drafting, paid ad campaign management (Google Ads + Meta Ads), social content creation, and performance reporting. It communicates with the human operator through Telegram and a web dashboard, requesting creative assets and approvals when needed.

### For Whom

A solo operator running a small-to-medium astrology content site. The operator has limited time (30-60 minutes/week for approvals and creative work) and a constrained budget ($300-500/month total marketing spend including tools). They want marketing to run on autopilot with quality guardrails.

### Why This Works

No product on the market combines content generation + ad campaign management + organic channel orchestration + autonomous optimization at a price point accessible to solo operators. Albert.ai does autonomous ads but starts at $2K+/month and ignores organic entirely. Jasper/Copy.ai generate content but cannot deploy it. AdClaw fills this gap by running as a local agent (no SaaS subscription) that orchestrates free/cheap APIs to manage the full marketing funnel.

### Why Astrology

- Massive search volume: "daily horoscope" alone gets 1M+ monthly searches
- Predictable content calendar tied to astronomical events (retrogrades, eclipses, lunar cycles)
- Evergreen + cyclical content mix means compounding organic traffic over time
- Relatively low CPC ($0.50-$2.00) compared to other commercial niches
- Passionate, engaged community across Pinterest, Instagram, Reddit, and X
- Visual niche with high Pinterest/Instagram potential

---

## 2. Architecture

### Physical Setup

```
Mac Mini (Apple Silicon, 16GB+ RAM)
├── OpenClaw Gateway (launchd daemon, ai.openclaw.gateway)
│   ├── Port 18789 (local dashboard + webhooks)
│   ├── Telegram Bot (long polling, no public URL needed)
│   └── Browser (user profile, logged into Google Ads / Meta / Analytics)
├── Workspace (~/.openclaw/workspace/)
│   ├── skills/          — Custom marketing skills (MCP tool wrappers)
│   ├── hooks/           — Event-driven automation
│   ├── memory/          — Daily logs, campaign data, SEO snapshots
│   ├── assets/          — Images, creatives, templates
│   └── output/          — Reports, generated content
├── Express.js Server (existing AdClaw API, port 3000)
│   └── Astrology website served from here (or separate WordPress)
└── Cron Jobs (OpenClaw built-in scheduler)
    ├── Hourly: Ad spend monitoring
    ├── Daily: SEO check, content scheduling, social posting
    ├── Weekly: Performance report, content batch generation
    └── Monthly: Strategy review, budget reallocation
```

### Data Flow

```
                    ┌─────────────────┐
                    │  Telegram Bot    │
                    │  (human comms)   │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  OpenClaw Agent  │
                    │  (Claude Sonnet) │
                    └────────┬────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
    ┌─────▼─────┐    ┌──────▼──────┐    ┌─────▼─────┐
    │  Organic   │    │    Paid     │    │ Analytics │
    │  Engine    │    │   Engine    │    │  Engine   │
    ├───────────┤    ├────────────┤    ├───────────┤
    │ WordPress │    │ Google Ads │    │ GA4 Data  │
    │ Search    │    │ Meta Ads   │    │ Search    │
    │ Console   │    │            │    │ Console   │
    └───────────┘    └────────────┘    └───────────┘
          │                  │                  │
          └──────────────────┼──────────────────┘
                             │
                    ┌────────▼────────┐
                    │  Memory System  │
                    │  (Markdown +    │
                    │   SQLite vector)│
                    └─────────────────┘
```

### OpenClaw Daemon Configuration

File: `~/.openclaw/openclaw.json`

```json
{
  "agents": {
    "defaults": {
      "model": "anthropic/claude-sonnet-4-20250514",
      "workspace": "~/.openclaw/workspace",
      "heartbeat": {
        "every": "30m",
        "target": "telegram",
        "lightContext": false,
        "activeHours": { "start": "06:00", "end": "23:00" }
      },
      "session": {
        "resetPolicy": { "daily": "04:00" },
        "maintenance": {
          "pruneAfter": "14d",
          "maxEntries": 300,
          "maxDiskBytes": "500mb"
        }
      },
      "compaction": {
        "model": "anthropic/claude-sonnet-4-20250514"
      },
      "memorySearch": {
        "provider": "openai",
        "query": { "hybrid": true }
      }
    }
  },
  "channels": {
    "telegram": {
      "enabled": true,
      "accounts": {
        "default": { "token": "$TELEGRAM_BOT_TOKEN" }
      },
      "dm": { "policy": "allowlist" },
      "group": { "policy": "allowlist" },
      "buttons": { "scope": "all" }
    }
  },
  "hooks": {
    "enabled": true,
    "token": "$OPENCLAW_HOOK_TOKEN",
    "internal": { "enabled": true }
  },
  "browser": {
    "enabled": true,
    "defaultProfile": "user"
  },
  "logging": {
    "level": "info",
    "consoleLevel": "info",
    "redactSensitive": "tools"
  },
  "approvals": {
    "exec": {
      "enabled": true,
      "mode": "targets",
      "targets": [
        { "channel": "telegram", "to": "$ADMIN_TELEGRAM_ID" }
      ]
    }
  },
  "skills": {
    "load": { "watch": true },
    "entries": {}
  },
  "gateway": {
    "channelHealthCheckMinutes": 5,
    "channelStaleEventThresholdMinutes": 30
  }
}
```

---

## 3. Phase 1: Foundation (Weeks 1-2)

### Goal

Get the Mac Mini running OpenClaw 24/7, connect all APIs with authentication, and establish the workspace structure. No marketing activity yet — just infrastructure.

### Week 1: Mac Mini + OpenClaw Setup

**Day 1-2: OpenClaw Installation**

```bash
# Install OpenClaw globally
npm install -g openclaw

# Run setup wizard
openclaw setup

# Install as launchd daemon
openclaw gateway install --port 18789
openclaw gateway start

# Verify health
openclaw status --deep
```

- Create Telegram bot via @BotFather, copy token
- Configure `openclaw.json` per the architecture section above
- Set up Telegram groups:
  - `adclaw-alerts` — receive-only alerts from agent
  - `adclaw-tasks` — human-in-the-loop task assignments
  - `adclaw-content` — content review and approval
- Pair admin Telegram DM with the bot
- Verify bidirectional communication: send "hello" in DM, agent responds

**Day 3-4: API Credentials and Authentication**

Set up all API credentials. Store in environment variables, never in code.

| Service | Auth Method | Setup Steps |
|---------|------------|-------------|
| Google Ads | OAuth 2.0 + Developer Token | 1. Create Google Cloud project. 2. Enable Google Ads API. 3. Create OAuth 2.0 credentials (Desktop app type). 4. Get developer token from Google Ads API Center (apply for Basic access — takes ~2 business days). 5. Generate refresh token via OAuth consent flow. |
| Meta Marketing API | OAuth 2.0 System User Token | 1. Create app on developers.facebook.com. 2. Add "Marketing API" product. 3. Create System User in Business Manager. 4. Generate long-lived system user token with `ads_management` + `ads_read` permissions. |
| Google Search Console | Service Account | 1. Create service account in Google Cloud Console. 2. Download JSON key file. 3. Add service account email as user in Search Console property. |
| GA4 | Service Account | 1. Use same service account as Search Console (or create separate). 2. Add service account email as "Viewer" in GA4 property settings. |
| WordPress | Application Passwords | 1. In WP Admin > Users > Profile, create Application Password. 2. Store username + app password. Site MUST use HTTPS. |
| OpenAI (DALL-E + GPT-4 Vision) | API Key | 1. Generate key at platform.openai.com. 2. Set spending limit. |
| Anthropic (for OpenClaw agent) | API Key | 1. Generate at console.anthropic.com. 2. Set spending limit. |

Environment variables to set (in `~/.zshrc` or LaunchAgent plist):

```bash
# Google
export GOOGLE_ADS_CLIENT_ID="..."
export GOOGLE_ADS_CLIENT_SECRET="..."
export GOOGLE_ADS_DEVELOPER_TOKEN="..."
export GOOGLE_ADS_REFRESH_TOKEN="..."
export GOOGLE_ADS_CUSTOMER_ID="..."
export GOOGLE_SERVICE_ACCOUNT_KEY_PATH="~/.openclaw/secrets/google-sa.json"
export GA4_PROPERTY_ID="..."

# Meta
export META_ACCESS_TOKEN="..."
export META_APP_ID="..."
export META_APP_SECRET="..."
export META_AD_ACCOUNT_ID="..."

# WordPress
export WP_BASE_URL="https://your-astrology-site.com"
export WP_USERNAME="..."
export WP_APP_PASSWORD="..."

# OpenAI
export OPENAI_API_KEY="..."

# Anthropic
export ANTHROPIC_API_KEY="..."

# Telegram
export TELEGRAM_BOT_TOKEN="..."

# OpenClaw
export OPENCLAW_GATEWAY_TOKEN="..."
```

**Day 5: Workspace Structure**

```bash
mkdir -p ~/.openclaw/workspace/{memory/{campaigns,seo,content,alerts,analytics},assets/{images,documents,templates},output/{reports,creatives,blog-drafts},skills/{google-ads,meta-ads,search-console,ga4,wordpress,seo-audit,social-content,reporting},hooks/{new-content,lead-capture,budget-alert}}
```

Create `~/.openclaw/workspace/MEMORY.md`:

```markdown
# AdClaw Marketing Agent — Long-Term Memory

## Brand Identity
- Site: [your-astrology-site.com]
- Niche: Western astrology (tropical zodiac)
- Voice: Warm, knowledgeable, encouraging but honest. Not doom-and-gloom.
- Target audience: Women 25-44, interested in self-development through astrology
- Differentiator: Accurate transit data + practical life advice, not vague platitudes

## Content Guidelines
- Always verify planetary transit dates against ephemeris before publishing
- Never make guaranteed predictions ("you WILL meet someone" is wrong; "this transit favors new connections" is fine)
- Include "for entertainment/educational purposes" disclaimer on readings
- Named human author on every blog post with bio
- Meta ads: NEVER assert viewer's zodiac sign ("Are you a Scorpio?" = policy violation)

## Budget Guardrails
- Monthly total budget: $XXX (set during Phase 1)
- Google Ads daily cap: set at platform level, never rely on agent-side caps only
- Meta Ads daily cap: set at platform level
- Max budget increase per day: 20%
- Max budget changes per day: 2
- Any spend above $XX/day requires human approval via Telegram

## Active Campaigns
(Agent updates this section as campaigns are created)

## Keyword Strategy
(Agent populates during Phase 2)
```

### Week 2: Custom MCP Skills for Each API

Since no marketing-specific MCP servers exist, we build custom skills wrapping each API. Each skill is a directory under `~/.openclaw/workspace/skills/` with a `SKILL.md` and supporting Node.js scripts.

**Skill: google-ads**

File: `skills/google-ads/SKILL.md`

```markdown
---
name: google-ads
description: Manage Google Ads campaigns — create, read, update, pause, report.
---

# Google Ads Skill

## Available Operations

### Read Campaign Performance
When asked about Google Ads performance, run:
exec node skills/google-ads/report.js --type=campaign --days=7

### Read Keyword Performance
exec node skills/google-ads/report.js --type=keyword --days=7

### Create Search Campaign
exec node skills/google-ads/create-campaign.js --name="..." --budget=... --keywords="..."

### Pause Campaign
exec node skills/google-ads/pause.js --campaignId=...

### Update Bids
exec node skills/google-ads/update-bids.js --campaignId=... --adjustment=...

### Add Negative Keywords
exec node skills/google-ads/negative-keywords.js --campaignId=... --keywords="..."

## Rules
- Never exceed daily budget set in MEMORY.md
- Budget increases max 20% per day
- Always check current spend before making changes
- Log all changes to memory/campaigns/google-ads-performance.md
```

Supporting script pattern (`skills/google-ads/report.js`):

```javascript
// npm packages needed: google-ads-api
const { GoogleAdsApi, enums, toMicros } = require('google-ads-api');

const client = new GoogleAdsApi({
  client_id: process.env.GOOGLE_ADS_CLIENT_ID,
  client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
  developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
});

const customer = client.Customer({
  customer_id: process.env.GOOGLE_ADS_CUSTOMER_ID,
  refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN,
});

// Report logic here — output JSON to stdout for agent to parse
```

**Repeat this pattern for each skill:**

| Skill Directory | npm Package | Operations |
|----------------|-------------|------------|
| `skills/google-ads/` | `google-ads-api` | Campaign CRUD, keyword management, bid management, reporting |
| `skills/meta-ads/` | `facebook-nodejs-business-sdk` | Campaign CRUD, ad set management, creative upload, insights |
| `skills/search-console/` | `googleapis` | Search analytics, sitemap management, URL inspection |
| `skills/ga4/` | `@google-analytics/data` | Traffic reports, conversion data, real-time visitors |
| `skills/wordpress/` | `wpapi` | Post CRUD, media upload, category/tag management, Yoast SEO metadata |
| `skills/seo-audit/` | `axios` + `cheerio` | On-page SEO checks, meta tag analysis, internal link audits |
| `skills/social-content/` | (agent-generated text) | Draft social posts, generate hashtags, create thread outlines |
| `skills/reporting/` | All of the above | Aggregate cross-channel performance into Markdown reports |

**Install all npm packages in the workspace:**

```bash
cd ~/.openclaw/workspace
npm init -y
npm install google-ads-api facebook-nodejs-business-sdk googleapis @google-analytics/data wpapi openai axios cheerio
```

**End of Phase 1 deliverables:**
- OpenClaw running 24/7 with auto-restart
- All APIs authenticated and verified (run each skill's read operation to confirm)
- Telegram groups set up and agent responsive
- Workspace structure and memory initialized
- All skills created with basic read operations working
- Log rotation and cleanup cron in place

---

## 4. Phase 2: Organic Engine (Weeks 3-6)

### Goal

Build the content and SEO foundation. Start publishing blog posts, optimize existing content, and establish the keyword strategy. No paid ads yet — this phase is about compounding organic assets.

### Week 3: SEO Audit and Keyword Strategy

**Automated SEO Audit (skill: seo-audit)**

The agent runs a comprehensive audit of the astrology site:
1. Crawl all pages using `axios` + `cheerio` (no need for Screaming Frog)
2. Check each page for: title tag, meta description, H1/H2 structure, internal links, image alt text, page load indicators
3. Query Search Console for: indexed pages, crawl errors, sitemap status
4. Query GA4 for: top landing pages, bounce rates, session duration
5. Write findings to `memory/seo/YYYY-MM-DD-audit.md`
6. Send summary to Telegram `adclaw-alerts` group

**Keyword Strategy for Astrology Niche**

The agent builds an initial keyword map. Since we're not paying for Ahrefs/Semrush ($99-130/month we can't afford), we use free data from:

- **Google Search Console**: What queries we already rank for (existing site)
- **Google Ads Keyword Planner**: Search volume and competition (free with Google Ads account)
- **Manual research via agent**: Agent uses browser to analyze SERP competitors for target keywords

**Target keyword categories:**

| Category | Example Keywords | Search Volume | Competition | Content Type |
|----------|-----------------|---------------|-------------|-------------|
| Evergreen - Sign Profiles | "aries traits", "scorpio personality" | 10K-100K/mo each | Medium | Long-form guide (2000+ words) |
| Evergreen - Compatibility | "aries and libra compatibility" | 1K-10K/mo each | Low-Medium | Long-form guide (1500+ words), 144 total combos |
| Evergreen - Birth Chart | "moon in scorpio meaning", "rising sign calculator" | 5K-50K/mo each | Medium | Long-form explainer |
| Cyclical - Horoscopes | "aries horoscope april 2026" | 10K-50K/mo each | High | Monthly article, 12/month |
| Cyclical - Retrogrades | "mercury retrograde 2026", "venus retrograde dates" | 100K-2M during events | Medium | Pre-publish before each retrograde |
| Cyclical - Lunar | "full moon march 2026 astrology" | 10K-50K/mo | Low-Medium | Bi-monthly article |
| Trending | "celebrity birth chart", "zodiac memes" | Variable | Low | As opportunities arise |

**Priority content to create first (highest SEO ROI):**
1. 12 zodiac sign profile pages (cornerstone content)
2. Mercury retrograde guide for the current/next retrograde period
3. "How to Read Your Birth Chart" beginner guide
4. Top 10 highest-volume compatibility pairs

### Week 4-5: Content Production Pipeline

**Batch Content Generation (weekly cron job, Mondays 8 AM IST)**

The agent generates a week's worth of content in one session:

1. **Check astrological calendar**: What transits, retrogrades, new/full moons are happening this week and next?
2. **Check content gaps**: What planned content hasn't been written yet? (from `memory/content/editorial-calendar.md`)
3. **Generate drafts**: Write 3-4 blog posts as drafts in WordPress (status: `draft`)
4. **SEO optimize each**: Title tag, meta description, focus keyword, internal links to existing content
5. **Notify human**: Send Telegram message to `adclaw-content` with titles, summaries, and links to WP drafts
6. **Wait for approval**: Human reviews, edits, approves in WordPress admin
7. **Agent publishes**: On approval (or on scheduled date), agent sets status to `publish`
8. **Agent submits to Search Console**: Notify Google of new URL via Indexing API (works best for structured data pages)

**Content templates the agent uses:**

For blog posts, the agent follows this structure stored in `MEMORY.md`:

```
Blog Post Template:
1. Hook (1-2 sentences, address reader's curiosity)
2. Quick answer (for featured snippet capture)
3. Detailed explanation (with H2/H3 subheadings for each major point)
4. Practical advice ("How to work with this energy")
5. Related content links (internal links to 3-5 other articles)
6. CTA (newsletter signup, free birth chart, etc.)

Meta description: 150-160 chars, include primary keyword, compelling reason to click
Title tag: Primary keyword near the front, 50-60 chars
```

**WordPress Yoast SEO Integration:**

When creating/updating posts via `wpapi`, the agent sets Yoast SEO metadata through post meta fields:

```javascript
wp.posts().create({
  title: 'Mercury Retrograde April 2026 — What Every Sign Needs to Know',
  content: '...full HTML content...',
  status: 'draft',
  categories: [astrologyCategory.id],
  meta: {
    _yoast_wpseo_focuskw: 'mercury retrograde april 2026',
    _yoast_wpseo_metadesc: 'Mercury goes retrograde April 12-May 5, 2026. Here is what it means for your sign and how to navigate communication breakdowns.',
    _yoast_wpseo_title: 'Mercury Retrograde April 2026 — Guide for All 12 Signs'
  }
});
```

### Week 6: SEO Monitoring and Optimization

**Daily SEO check (cron: 9 AM IST)**

Agent runs the `search-console` skill:
1. Pull yesterday's search analytics (queries, clicks, impressions, CTR, position)
2. Compare with previous day's data in `memory/seo/`
3. Flag: position drops > 3 positions, CTR drops > 20%, new queries appearing
4. Write results to `memory/seo/YYYY-MM-DD.md`
5. If anomalies detected, send alert to `adclaw-alerts`

**Weekly SEO optimization (cron: Wednesdays 10 AM IST)**

Agent reviews accumulated data:
1. Identify pages ranking positions 5-15 (opportunity zone — close to page 1 or could move up)
2. Suggest content updates: expand thin sections, add internal links, update meta descriptions
3. Identify cannibalization (multiple pages targeting same keyword)
4. Create tasks for human if manual action needed
5. Write optimization report to `memory/seo/weekly-optimization.md`

**End of Phase 2 deliverables:**
- 15-20 blog posts published and indexed
- Keyword strategy documented and prioritized
- SEO baseline established with daily monitoring
- Content production pipeline running weekly
- Telegram content approval workflow proven

---

## 5. Phase 3: Paid Campaigns (Weeks 7-10)

### Goal

Launch Google Ads and Meta Ads campaigns with tight budgets, strict guardrails, and careful monitoring.

### Week 7: Google Ads Setup

**Before launching: Set platform-level safety nets**
1. In Google Ads UI: Set account-level daily budget cap (e.g., $5/day = $150/month)
2. In Google Ads UI: Enable billing alerts at 50%, 80%, 100% of monthly budget
3. In AdClaw MEMORY.md: Document daily cap, monthly cap, max bid limits

**Campaign 1: High-Intent Search (transactional keywords)**

```javascript
// Using google-ads-api package
const campaignBudget = await customer.campaignBudgets.create({
  name: 'Astro Readings - Daily Budget',
  amount_micros: toMicros(3.00), // $3/day = ~$90/month
  delivery_method: enums.BudgetDeliveryMethod.STANDARD,
});

const campaign = await customer.campaigns.create({
  name: 'Astro Readings - Search',
  campaign_budget: campaignBudget.resource_name,
  advertising_channel_type: enums.AdvertisingChannelType.SEARCH,
  status: enums.CampaignStatus.PAUSED, // Start paused, enable after review
  bidding_strategy_type: enums.BiddingStrategyType.MAXIMIZE_CONVERSIONS,
  network_settings: {
    target_google_search: true,
    target_search_network: false,
    target_content_network: false,
  },
});
```

**Target keywords (exact match and phrase match only):**
- `[birth chart reading online]` — high intent, looking to purchase
- `[astrology consultation]` — high intent
- `"personalized horoscope report"` — transactional
- `[natal chart reading]` — transactional
- `[astrology reading near me]` — if offering local services

**Negative keywords (critical to avoid waste):**
- `free`, `meaning`, `what is`, `definition`, `wikipedia`, `calculator` (informational intent, will not convert)
- `learn astrology`, `astrology course` (educational intent)
- `zodiac sign`, `horoscope today` (too broad, low intent)

**Ad copy guidelines (compliant with Google's astrology policies):**
- DO: "Explore Your Birth Chart — Personalized Astrology Reading"
- DO: "Discover Your Cosmic Blueprint — Professional Natal Chart Analysis"
- DON'T: "We'll Predict Your Future" (guaranteed prediction)
- DON'T: "100% Accurate Horoscope" (accuracy guarantee)

### Week 8: Meta Ads Setup

**Campaign 1: Lead Generation (email list building)**

Primary offer: Free personalized birth chart summary in exchange for email. This builds the email list (the most valuable owned audience).

```javascript
const adsSdk = require('facebook-nodejs-business-sdk');
const AdAccount = adsSdk.AdAccount;
const Campaign = adsSdk.Campaign;

const api = adsSdk.FacebookAdsApi.init(process.env.META_ACCESS_TOKEN);
const account = new AdAccount(`act_${process.env.META_AD_ACCOUNT_ID}`);

const campaign = await account.createCampaign([], {
  [Campaign.Fields.name]: 'Astro Lead Gen - Birth Chart Offer',
  [Campaign.Fields.objective]: 'OUTCOME_LEADS',
  [Campaign.Fields.status]: Campaign.Status.paused, // Start paused
  [Campaign.Fields.special_ad_categories]: [], // No special categories for astrology
});
```

**Targeting:**
- Interest: Astrology, Horoscopes, Zodiac signs, Birth chart, Tarot
- Age: 25-54
- Gender: All (but monitor — astrology audience skews 70%+ female)
- Placement: Instagram Feed, Instagram Stories, Facebook Feed (test each)

**Budget:** $5/day ($150/month), set at ad set level AND at account level as a safety cap.

**Ad creative requirements (send to human via Telegram):**

```
CREATIVE REQUEST via Telegram:
"I need a Meta ad creative for our birth chart lead gen campaign.

Specs:
- 1080x1080 (Instagram feed) AND 1080x1920 (Stories)
- Visual: Mystical/cosmic aesthetic, starfield or zodiac wheel
- Text overlay: 'Discover Your Cosmic Blueprint' (keep text under 20% of image)
- CTA: 'Get Your Free Birth Chart'
- Brand colors: [reference brand guide in MEMORY.md]
- Mood: Inviting, magical, not dark/scary

Please upload to the dashboard when ready.
Deadline: Wednesday for Thursday launch."
```

**Ad copy (compliant with Meta's personal attributes policy):**
- DO: "Explore what the stars reveal about your path" (general)
- DO: "Discover the secrets in your birth chart" (general, no sign assertion)
- DON'T: "Are you a Scorpio? This reading will change your life" (asserts personal attribute)
- DON'T: "Capricorns — your year starts now!" (asserts viewer's sign)

### Week 9-10: Campaign Monitoring and Optimization

**Hourly ad spend monitoring (cron: every 60 minutes)**

```bash
openclaw cron add --name "ad-spend-monitor" \
  --every 3600000 \
  --session isolated --lightContext \
  --message "Check Google Ads and Meta Ads current spend vs daily budget. If any campaign has spent >80% of daily budget before 6 PM IST, alert via Telegram. If any campaign CPC has increased >50% vs yesterday, alert. If any campaign has 0 impressions for >3 hours, alert. Log results to memory/campaigns/." \
  --announce --channel telegram --to "group:adclaw-alerts"
```

**Daily campaign optimization (cron: 10 PM IST, after day's data settles)**

Agent reviews:
1. Campaign-level: spend, impressions, clicks, CTR, conversions, CPA
2. Keyword-level (Google): pause keywords with CPA > 2x target after 50+ clicks
3. Ad-level: pause ads with CTR < 50% of ad group average after 500+ impressions
4. Search term report (Google): add irrelevant terms as negatives
5. Placement report (Meta): exclude poor-performing placements
6. Write daily performance log to `memory/campaigns/YYYY-MM-DD.md`

**Budget reallocation rules (agent follows, documented in MEMORY.md):**
- If Google CPA is 2x+ worse than Meta CPA for 7 consecutive days: shift 20% of Google budget to Meta
- If either platform has CPA below target: increase that platform's budget by 10% (max 20%/day)
- Never reallocate more than 30% of total budget in a single week
- Any budget increase above 20% requires human approval via Telegram

**End of Phase 3 deliverables:**
- Google Ads search campaign live and optimized
- Meta Ads lead gen campaign live and optimized
- Hourly spend monitoring with alerts
- Daily optimization running autonomously
- Budget guardrails proven (no overspend incidents)
- First performance report delivered to human

---

## 6. Phase 4: Social Presence (Weeks 11-14)

### Goal

Establish presence on X, Reddit, and Pinterest. The agent creates content; the human posts from personal accounts for authenticity.

### X (Twitter) Strategy

**Posting approach:** Agent drafts; human posts from personal account.

**Why human posts:** Astrology X values personal voice. Bot-like accounts get ignored. The human operator should build their personal brand as an astrologer.

**Content types that work for astrology on X:**
1. **Transit alerts:** "Mercury enters Aries today. Communication gets bold and direct. Think before you tweet. (ironic, I know)" — timely, useful, personality-driven
2. **Sign threads:** "Thread: What each zodiac sign does when they catch feelings" — high engagement, shareable
3. **Hot takes:** "Hot take: Virgo risings are the most misunderstood rising sign" — drives engagement through agreement/disagreement
4. **Meme energy:** Zodiac meme screenshots, relatable astro humor
5. **Event-based:** Commentary on celebrity charts, world events through astro lens

**Posting schedule:** 1-2 tweets/day, optimally between 9-11 AM and 7-9 PM IST (overlaps US morning and India evening).

**Agent workflow:**
1. Daily cron (7 AM IST): Agent generates 2 tweet drafts based on today's transits
2. Sends to Telegram `adclaw-content` with text, suggested posting time, hashtags
3. Human reviews, personalizes voice, posts from their X account
4. Human sends tweet URL back to agent
5. Agent tracks engagement (likes, retweets, replies) if X API access is available

**X API access decision:**
- Free tier ($0): 1,500 posts/month, minimal read access. Sufficient for posting if automating directly.
- Basic tier ($100/month): 3,000 posts + 10,000 reads. Needed for engagement tracking.
- **Recommendation:** Start with NO paid X API. Human posts manually (free). Agent just drafts content. Re-evaluate after 3 months if the channel proves valuable.

### Reddit Strategy

**Critical rule: Reddit hates bots and self-promotion. The agent NEVER posts directly to Reddit.**

**Target subreddits:**
- `r/astrology` (800K+ members) — educational discussion only, zero promotion
- `r/AskAstrologers` (300K+ members) — answer questions genuinely, demonstrate expertise
- `r/spirituality` (1M+ members) — broader spiritual discussion
- `r/zodiacsigns` (varies) — lighter zodiac content
- `r/AstrologyChartShare` (varies) — birth chart analysis practice

**Agent's role:**
1. Weekly cron (Monday 9 AM IST): Agent browses target subreddits (via browser skill), identifies trending questions and discussions
2. Agent drafts thoughtful, helpful responses to 3-5 questions
3. Sends drafts to Telegram `adclaw-content`
4. Human reviews, personalizes, posts from their Reddit account
5. Human provides post/comment URLs back to agent
6. Agent tracks which topics generated interest (inform content strategy)

**What the human MUST follow on Reddit:**
- 90/10 rule: 90% genuine community participation, 10% max self-promotion
- Never link to the astrology site in the first 2-4 weeks of participation
- When linking, it must be genuinely helpful (e.g., "I wrote a detailed guide about this on my blog: [link]" in response to a specific question)
- Build genuine karma and reputation first
- Never use the same link more than 2-3 times total across all subreddits

### Pinterest Strategy

**Pinterest is the highest-ROI social channel for astrology.** Pins have 3-6 month lifespans, it's a visual search engine, and the audience overlaps perfectly.

**Content types:**
1. **Zodiac infographics:** "Aries Season 2026 — What to Expect" with key dates and themes
2. **Compatibility visuals:** "Aries x Libra Compatibility" — clean design with key traits
3. **Birth chart explainers:** "What Your Moon Sign Means" — visual breakdown
4. **Blog article pins:** Featured image for each blog post, linking back to site
5. **Quote pins:** "The stars incline, they do not compel" — aesthetic astro quotes

**Automation potential:** HIGH. Pinterest has a scheduling API, and pin descriptions + alt text can be fully agent-generated.

**Agent workflow:**
1. For each blog post published, agent generates 2-3 pin descriptions with keywords
2. Agent sends creative brief to Telegram (dimensions: 1000x1500 vertical pins)
3. Human creates the pin image (or uses Canva templates)
4. Human uploads to dashboard
5. Agent verifies dimensions and quality
6. Agent schedules pin publication via Pinterest API or Tailwind

**Pinterest-specific SEO:**
- Pin titles: Include primary keyword ("Aries Compatibility Guide 2026")
- Pin descriptions: 200-300 chars, keyword-rich but natural ("Discover Aries compatibility with every zodiac sign. Learn about Aries love matches, friendship dynamics, and workplace compatibility in this comprehensive guide.")
- Board names: Keyword-optimized ("Zodiac Compatibility Guides", "Monthly Horoscopes 2026", "Birth Chart Basics")

**End of Phase 4 deliverables:**
- X content pipeline running (agent drafts, human posts)
- Reddit engagement strategy active (agent identifies opportunities, human participates)
- Pinterest pins created for all published blog content
- Social content calendar maintained in `memory/content/social-calendar.md`
- Cross-channel content repurposing workflow proven

---

## 7. Phase 5: Full Autonomy (Weeks 15+)

### Goal

Agent runs 24/7 with minimal human input. Human spends 30-60 minutes per week on approvals and creative uploads. Agent handles everything else.

### Autonomy Tiers (Trust Building)

```
Week 1-6 (Low Trust):
  - ALL content requires human approval before publishing
  - ALL ad changes require human approval
  - Agent cannot increase budgets without asking
  - Human reviews every report manually

Week 7-12 (Building Trust):
  - Routine social content auto-publishes (agent has learned voice)
  - Blog posts still require approval
  - Ad bid adjustments within 20% auto-approved
  - Budget decreases auto-approved, increases require approval
  - Agent generates weekly report, human reviews

Week 13-20 (Moderate Trust):
  - Blog posts auto-publish if confidence score > 0.8
  - New campaigns still require approval
  - Ad optimization fully autonomous within guardrails
  - Monthly budget reallocation auto-approved within 30% range
  - Human reviews bi-weekly

Week 21+ (High Trust):
  - Nearly everything auto-executes
  - Only NEW strategies, new campaign types, budget increases > 30% need approval
  - Human does weekly 15-min review
  - Emergency stop always available via Telegram "/stop all"
```

### Weekly Autonomous Cycle

```
Monday 8 AM:    Generate week's content batch (blog, social, ad copy variants)
Monday 8:30 AM: Send batch to Telegram for human review
Tuesday:        Human reviews (30-60 min), approves/edits
Wednesday:      Publish approved blog posts, schedule social content
Thursday:       Mid-week ad performance check, adjust bids if needed
Friday 5 PM:    Generate weekly performance report
Saturday:       Minimal operation — monitor for anomalies only
Sunday:         Plan next week's content based on astrological calendar
```

### Agent Self-Monitoring

**HEARTBEAT.md** (checked every 30 minutes during active hours):

```markdown
# HEARTBEAT.md

## Every heartbeat:
1. Check if there are pending tasks assigned to human that are overdue
2. Check if any ad campaign has anomalous metrics (CPC spike, CTR crash, budget overspend)
3. Check if the astrology website is responding (basic uptime check)
4. Check if any scheduled content failed to publish

## If issues found:
- Send alert to Telegram adclaw-alerts with severity (INFO / WARNING / CRITICAL)
- Log to memory/alerts/YYYY-MM-DD.md
- If CRITICAL: auto-pause affected campaigns and notify immediately

## Severity definitions:
- INFO: Minor metrics change, FYI only
- WARNING: Notable deviation requiring attention within 24 hours
- CRITICAL: Budget overspend, site down, campaign error — immediate action needed
```

### Monthly Strategy Review

On the 1st of each month, agent generates a comprehensive strategy document:
1. Last month's performance vs. goals
2. Budget breakdown: what was spent where, what returned
3. Top-performing content and campaigns
4. Underperforming areas and recommended changes
5. Next month's astrological calendar and content opportunities
6. Recommended budget reallocation
7. New experiments to try

Sent to Telegram for human review. Human provides strategic direction. Agent executes.

---

## 8. OpenClaw Skills Map

Every skill the agent needs, what it does, which API/package it uses.

| Skill Name | Purpose | npm Package | Auth Method | Key Operations |
|-----------|---------|-------------|-------------|----------------|
| `google-ads` | Paid search campaign management | `google-ads-api` (Opteo) | OAuth 2.0 + Developer Token | Create campaigns, ad groups, keywords; read performance via GAQL; update bids; pause/enable; add negatives |
| `meta-ads` | Paid social campaign management | `facebook-nodejs-business-sdk` | OAuth 2.0 System User Token | Create campaigns, ad sets, ads; upload creatives; read insights; manage audiences |
| `search-console` | SEO monitoring and URL management | `googleapis` (google.searchconsole v1) | Service Account | Search analytics queries; URL inspection; sitemap management; indexing requests |
| `ga4` | Website analytics | `@google-analytics/data` | Service Account | Run reports (traffic, conversions, engagement); real-time data; audience data |
| `wordpress` | Blog content management | `wpapi` | Application Password | Post CRUD (create/read/update/delete); media upload; category management; Yoast SEO meta fields |
| `seo-audit` | Technical and on-page SEO analysis | `axios` + `cheerio` | N/A (scrapes own site) | Crawl pages; check meta tags, headings, links; identify errors; score pages |
| `social-content` | Social media content drafting | None (agent-generated text) | N/A | Generate tweet drafts, Reddit response drafts, Pinterest descriptions, Instagram captions |
| `reporting` | Cross-channel performance reports | All of the above | All of the above | Aggregate data from all channels; generate Markdown reports; calculate ROAS, CPA, engagement |
| `ephemeris` | Astrological accuracy verification | `swisseph` or `astronomia` (npm) | N/A (local computation) | Verify transit dates, retrograde periods, lunar phases; generate astrological calendar |
| `content-calendar` | Editorial planning | None (memory files) | N/A | Maintain editorial calendar; plan content around astrological events; track publication status |
| `image-eval` | Creative quality assessment | `openai` (GPT-4 Vision) | OpenAI API Key | Evaluate uploaded creatives for ad compliance, brand consistency, quality; check text overlay percentage |
| `budget-guard` | Spending safety system | `google-ads-api` + `facebook-nodejs-business-sdk` | Same as ad platforms | Check spend vs caps; enforce rate limits on budget changes; trigger alerts; emergency pause |

---

## 9. Cron Schedule

All times in IST (Asia/Kolkata). Every cron uses `--session isolated` unless it needs persistent context.

### Hourly Jobs

```bash
# Ad spend monitoring — every hour, all day
openclaw cron add --name "ad-spend-monitor" \
  --every 3600000 \
  --session isolated --lightContext \
  --message "Run the budget-guard skill. Check Google Ads and Meta Ads current spend vs daily caps. Alert if >80% spent before 6 PM. Alert if CPC up >50% vs yesterday. Alert if 0 impressions for >3 hours. Log to memory/campaigns/." \
  --announce --channel telegram --to "group:adclaw-alerts"
```

### Daily Jobs

```bash
# Morning SEO check — 9 AM IST daily
openclaw cron add --name "daily-seo-check" \
  --cron "30 3 * * *" --tz "Asia/Kolkata" \
  --sessionTarget "session:seo-monitor" \
  --message "Run search-console skill. Pull yesterday's search analytics. Compare with data in memory/seo/. Flag position drops >3, CTR drops >20%, new queries. Write to memory/seo/YYYY-MM-DD.md. Alert on anomalies."

# Evening ad optimization — 10 PM IST daily
openclaw cron add --name "daily-ad-optimization" \
  --cron "30 16 * * *" --tz "Asia/Kolkata" \
  --session isolated \
  --message "Run google-ads and meta-ads skills. Review today's performance. Pause keywords/ads with CPA >2x target after 50+ clicks. Add negative keywords from search term report. Log changes to memory/campaigns/YYYY-MM-DD.md."

# Social content scheduling — 7 AM IST daily
openclaw cron add --name "daily-social-prep" \
  --cron "30 1 * * *" --tz "Asia/Kolkata" \
  --session isolated \
  --message "Check today's astrological transits. Generate 2 tweet drafts and 1 Instagram caption based on today's energy. Send to Telegram adclaw-content for human to post. Include suggested posting times and hashtags."

# Website uptime check — every 4 hours
openclaw cron add --name "uptime-check" \
  --cron "0 */4 * * *" --tz "Asia/Kolkata" \
  --session isolated --lightContext \
  --message "Check if the astrology website is responding (HTTP GET to homepage). If down or slow (>5s), alert Telegram adclaw-alerts as CRITICAL."
```

### Weekly Jobs

```bash
# Monday content batch — 8 AM IST Mondays
openclaw cron add --name "weekly-content-batch" \
  --cron "30 2 * * 1" --tz "Asia/Kolkata" \
  --sessionTarget "session:content-planner" \
  --message "Generate this week's content batch. Check astrological calendar for upcoming events. Write 3 blog post drafts in WordPress (status: draft). Generate 7 tweet drafts, 5 Pinterest descriptions, 3 Instagram captions. Store in memory/content/. Send summary to Telegram adclaw-content for review."

# Friday performance report — 5 PM IST Fridays
openclaw cron add --name "weekly-report" \
  --cron "30 11 * * 5" --tz "Asia/Kolkata" \
  --session isolated \
  --message "Generate weekly performance report. Pull data from Google Ads, Meta Ads, GA4, and Search Console. Include: total spend, CPA, ROAS, top keywords, top content, SEO rankings changes, social engagement. Compare to previous week. Write report to memory/campaigns/weekly/YYYY-WW.md. Send formatted summary to Telegram adclaw-alerts." \
  --announce --channel telegram --to "group:adclaw-alerts"

# Wednesday SEO optimization — 10 AM IST Wednesdays
openclaw cron add --name "weekly-seo-optimization" \
  --cron "30 4 * * 3" --tz "Asia/Kolkata" \
  --sessionTarget "session:seo-monitor" \
  --message "Review accumulated SEO data. Identify pages ranking 5-15 (opportunity zone). Suggest meta description updates. Identify internal linking opportunities. Check for keyword cannibalization. Write recommendations to memory/seo/weekly-optimization.md. Send top 3 actionable items to Telegram adclaw-tasks."

# Reddit opportunity scan — Sunday 9 AM IST
openclaw cron add --name "weekly-reddit-scan" \
  --cron "30 3 * * 0" --tz "Asia/Kolkata" \
  --session isolated \
  --message "Browse r/astrology, r/AskAstrologers, r/spirituality using browser skill. Identify 5 trending questions or discussions where we could provide valuable insight. Draft helpful responses. Send to Telegram adclaw-content for human to review and post."
```

### Monthly Jobs

```bash
# Monthly strategy review — 1st of each month, 10 AM IST
openclaw cron add --name "monthly-strategy" \
  --cron "30 4 1 * *" --tz "Asia/Kolkata" \
  --session isolated \
  --message "Generate monthly strategy review. Pull 30-day data from all channels. Calculate: total spend, total revenue/leads, overall ROAS, channel-level ROAS, content performance, SEO trajectory. Compare to previous month. Recommend budget reallocation. Plan next month's content around astrological calendar. Write to memory/campaigns/monthly/YYYY-MM.md. Send to Telegram adclaw-alerts."

# Monthly cleanup — 2nd of each month, 3 AM IST
openclaw cron add --name "monthly-cleanup" \
  --cron "0 21 1 * *" --tz "Asia/Kolkata" \
  --session isolated --lightContext \
  --message "Run disk cleanup. Delete log files older than 7 days from /tmp/openclaw/. Delete cron run history older than 30 days. Prune memory files older than 90 days (archive, don't delete). Report disk usage to Telegram."
```

---

## 10. Human-in-the-Loop Workflows

### Creative Pipeline

```
Step 1: Agent Requests Creative
  Agent sends Telegram message to adclaw-content:
  "CREATIVE REQUEST #CR-042
   Campaign: Meta Lead Gen - Birth Chart Offer
   Format: 1080x1080 (Feed) + 1080x1920 (Stories)
   Visual: Cosmic/zodiac aesthetic
   Text overlay: 'Discover Your Cosmic Blueprint'
   CTA: 'Get Your Free Birth Chart'
   Reference: [link to brand guide]
   Deadline: Wednesday 5 PM IST
   Priority: HIGH"

Step 2: Human Creates
  Human uses Canva, Midjourney, or any design tool to create the image.
  Human uploads to the OpenClaw dashboard (media upload) or sends via Telegram.

Step 3: Agent Reviews
  Agent uses GPT-4 Vision (image-eval skill) to check:
  - Correct dimensions
  - Text overlay under 20% (Meta requirement)
  - Brand color consistency
  - No policy violations (no health claims, no personal attributes in text)
  Agent responds: "APPROVED" or "NEEDS REVISION: [specific feedback]"

Step 4: Agent Deploys
  Agent uploads creative to Meta Ads via API.
  Agent creates ad using approved creative + pre-approved ad copy.
  Campaign goes live (if already approved) or enters approval queue.
```

### Social Posting Pipeline

```
Step 1: Agent Drafts Content
  Agent generates drafts based on today's astrology:
  "SOCIAL POST DRAFT - X (Twitter)
   Text: 'Venus enters Taurus today. Love gets practical, sensual, and real.
   Stop chasing butterflies. Build something that lasts. 🌹'
   Hashtags: #VenusInTaurus #Astrology #ZodiacSeason
   Best time to post: 10 AM IST / 12:30 AM EST
   Thread potential: YES - could expand into sign-by-sign thread"

Step 2: Human Reviews
  Human reads in Telegram adclaw-content group.
  Responds: "Post as-is" or "Edit: [changes]" or "Skip this one"

Step 3: Human Posts
  Human copies text, posts from their personal X/Reddit account.
  Human sends the post URL back to agent in Telegram.

Step 4: Agent Tracks
  Agent saves URL to memory/content/social-calendar.md with post details.
  If X API access available: tracks engagement at 1h, 6h, 24h marks.
  Results feed into next content generation cycle.
```

### Approval Tiers

| Action Type | Phase 1-6 (Low Trust) | Phase 7-14 (Building) | Phase 15+ (High Trust) |
|------------|----------------------|----------------------|----------------------|
| Blog post publish | Human approval required | Human approval required | Auto-publish if confidence > 0.8 |
| Social media draft | Human approval required | Auto-approve routine posts | Auto-approve all |
| Ad copy change | Human approval required | Auto-approve within templates | Auto-approve within templates |
| New campaign creation | Human approval required | Human approval required | Human approval required |
| Budget increase < 20% | Human approval required | Auto-approved | Auto-approved |
| Budget increase > 20% | Human approval required | Human approval required | Human approval required |
| Bid adjustment < 20% | Human approval required | Auto-approved | Auto-approved |
| Pause underperformer | Human approval required | Auto-approved | Auto-approved |
| Emergency pause | Auto-approved always | Auto-approved always | Auto-approved always |

---

## 11. Dashboard Requirements

### Built-in OpenClaw Dashboard (http://127.0.0.1:18789/)

Use as-is for:
- **Chat interface**: Direct interaction with agent
- **Cron management**: View/edit/trigger all scheduled jobs
- **Skill administration**: Enable/disable skills, configure API keys
- **Log tailing**: Real-time agent activity monitoring
- **Health monitoring**: Gateway status, channel connectivity

### Custom Marketing Dashboard (build on top of Express.js server)

Extend the existing AdClaw Express.js server with these views:

**1. Task Board**
- Kanban-style board: Requested > In Progress > Review > Done
- Agent creates tasks, human moves them through stages
- Tasks stored in `workspace/tasks/kanban.md` (agent reads/writes)
- Dashboard reads this file via Express API

**2. Creative Pipeline**
- Visual grid showing: all creative requests, their status, uploaded assets
- Upload dropzone for human to add creatives
- Approval buttons (Approve / Request Revision)
- Agent picks up approved creatives from the pipeline

**3. Campaign Overview**
- Real-time cards for each active campaign:
  - Today's spend / daily cap
  - CTR, CPC, CPA
  - Trend arrows (up/down vs. yesterday)
- Pulls from `memory/campaigns/` files

**4. Content Calendar**
- Monthly view showing:
  - Published blog posts
  - Scheduled social posts
  - Astrological events (retrogrades, eclipses, full moons)
  - Upcoming content deadlines
- Reads from `memory/content/editorial-calendar.md`

**5. Performance Dashboard**
- Charts: weekly traffic, ad spend, conversions, email subscribers
- Data from GA4, Google Ads, Meta Ads aggregated in weekly reports
- Goal tracking: are we on track for monthly targets?

### Access

- Local: `http://127.0.0.1:18789/` for OpenClaw dashboard
- Remote: Tailscale Serve (if accessing from phone/other device)
- Express dashboard: `http://127.0.0.1:3000/dashboard`

---

## 12. Budget Allocation

### Scenario A: $300/Month Total

| Category | Monthly Cost | Notes |
|----------|-------------|-------|
| **Ad Spend** | | |
| Google Ads | $60 | $2/day, search only, high-intent keywords |
| Meta Ads | $90 | $3/day, lead gen for email list |
| **Tools** | | |
| Anthropic API (Claude, for OpenClaw agent) | $50-80 | ~Sonnet usage for daily crons + interactions |
| OpenAI API (GPT-4 Vision for image eval) | $5-10 | Light usage, creative evaluation only |
| Domain + hosting | $10-20 | If not already covered |
| **Total** | ~$235-270 | Leaves $30-65 buffer |

**What's free at this tier:**
- Google Ads API: free (pay for ads only)
- Meta Marketing API: free (pay for ads only)
- Google Search Console: free
- GA4: free
- WordPress REST API: free
- OpenClaw: free (self-hosted)
- Telegram: free
- Pinterest organic: free
- X organic: free (no API cost if human posts manually)
- Reddit organic: free

### Scenario B: $500/Month Total

| Category | Monthly Cost | Notes |
|----------|-------------|-------|
| **Ad Spend** | | |
| Google Ads | $100 | $3.30/day, search + remarketing |
| Meta Ads | $150 | $5/day, lead gen + retargeting |
| **Tools** | | |
| Anthropic API | $60-100 | More agent interactions, longer sessions |
| OpenAI API (DALL-E + Vision) | $15-25 | Some creative generation + evaluation |
| Canva Pro | $13 | Social media visuals and pin design |
| Email platform (MailerLite/ConvertKit) | $0-15 | Free tier may suffice initially |
| Domain + hosting | $10-20 | If not already covered |
| **Reserve/Testing** | $50-70 | Test new channels, experiment |
| **Total** | ~$418-493 | Flexible buffer for experiments |

### Budget Rules Enforced by Agent

1. Platform-level daily caps set in Google Ads UI and Meta Ads UI (non-overridable by API)
2. Agent tracks cumulative spend daily and reconciles with platform-reported numbers
3. If spend tracking shows >10% discrepancy, alert immediately
4. Monthly budget committed at start of month; no mid-month increases without human approval
5. 10% of ad budget reserved for A/B testing new approaches
6. If any channel ROAS drops below 0.5x for 14 consecutive days, agent recommends pausing

---

## 13. Risk Mitigation

### Ad Account Bans

| Risk | Prevention | Detection | Recovery |
|------|-----------|-----------|----------|
| Google policy violation (misleading astrology claims) | Pre-screen all ad copy against forbidden phrases list in MEMORY.md. Never claim guaranteed predictions. | Monitor for ad disapprovals via API — check daily. | Appeal within 7 days. Replace offending copy. If account suspended, apply for reinstatement with corrected ads. |
| Meta personal attributes violation ("Are you a Scorpio?") | Ad copy template library in MEMORY.md with pre-approved patterns. Agent checks every ad against these before submitting. | Monitor for ad rejections in insights. Track rejection rate — if >10%, pause and audit. | Edit rejected ads immediately. If account restricted, submit appeal with corrected ads. Restriction usually lifts in 24-72 hours. |
| Suspicious bot-like behavior (rapid API changes) | Rate limit all API calls. Max 2 budget changes/day. Max 20% budget increase/day. Gradual, human-like change patterns. | Monitor for "unusual activity" warnings from platforms. | Slow down change frequency. Add human review for all changes temporarily. |
| Payment failures | Keep payment method current with backup card. Set billing alerts. | Monitor billing status weekly. | Update payment immediately. Most platforms auto-retry failed payments. |

### Content Quality

| Risk | Prevention | Detection | Recovery |
|------|-----------|-----------|----------|
| Astrological inaccuracies (wrong dates, fake aspects) | Use ephemeris skill to verify ALL transit dates before publishing. Maintain verified transit calendar. | Human review catches errors. Reader complaints tracked. | Correct immediately. Issue correction notice. Update article with accurate info. |
| Generic AI-sounding content | Brand voice guide in MEMORY.md. Human editing pass on all blog content. Vary sentence structure in prompts. | Track engagement metrics — generic content gets lower engagement. | Rewrite with more personality. Add personal anecdotes and unique analysis. |
| Google SEO penalty for AI content | Quality over quantity (4 excellent articles > 20 mediocre). Named human author with bio. Unique analysis in every piece. | Monitor Search Console for ranking drops. Track indexed page count. | Reduce publishing volume. Improve quality. Add more human expertise signals. Wait 1-2 months for recovery. |

### Budget Overruns

| Risk | Prevention | Detection | Recovery |
|------|-----------|-----------|----------|
| Agent overspends daily budget | Platform-level daily caps (cannot be overridden by API). Agent has separate daily cap check. | Hourly spend monitoring cron. Alert at 80% of daily cap. | Auto-pause campaigns if >100% of cap before day ends. |
| Monthly budget creep | Monthly budget committed at start of month in MEMORY.md. Agent cannot exceed without approval. | Weekly budget reconciliation in Friday report. | Reduce remaining days' spend to fit monthly cap. |
| Wasted spend on bad keywords/audiences | Negative keyword management. Daily search term review. Audience exclusions. | CPA monitoring — alert if CPA > 2x target. | Pause offending keywords/audiences immediately. Reallocate budget to performers. |

### Technical Failures

| Risk | Prevention | Detection | Recovery |
|------|-----------|-----------|----------|
| OpenClaw gateway crash | launchd KeepAlive auto-restarts. | /healthz endpoint monitored. Telegram /status command. | Auto-restart via launchd. If repeated crashes, check logs at /tmp/openclaw/. |
| API auth token expiry | Use long-lived tokens (Meta system user, Google refresh token). Calendar reminder to check token validity monthly. | API calls return 401 — agent detects and alerts. | Refresh tokens. For Meta: regenerate system user token. For Google: refresh token auto-renews. |
| Mac Mini goes offline (power/network) | UPS for power protection. Auto-reconnect WiFi/Ethernet. | Telegram bot goes offline — no heartbeat. External uptime monitor (UptimeRobot on Tailscale URL). | Auto-recovery on boot (launchd starts OpenClaw). Check network. Resume campaigns. |
| Disk space exhaustion | Weekly cleanup cron. Log rotation. Memory file pruning. | Monitor disk usage in monthly cleanup cron. | Delete old logs and cron history. Archive old memory files. |

---

## 14. Legal/Compliance

### Astrology-Specific Ad Policies

**Google Ads — What's Allowed:**
- Astrology readings, horoscope services, birth chart analyses, astrology education, astrology apps
- Entertainment-framed astrology content

**Google Ads — What's NOT Allowed:**
- Guaranteed predictions ("We WILL predict your future")
- Health claims through astrology ("Your stars say you should stop taking medication")
- Financial advice through astrology ("Buy stocks on this date")
- Targeting vulnerable users (implying they need astrology to solve serious problems)

**Meta Ads — Critical Rules:**
- NEVER assert personal attributes: "Are you a [sign]?" is a policy violation
- Frame as general information: "Explore what the stars reveal" is compliant
- Video ads get approved more easily than text-heavy static images
- Expect higher-than-average rejection rates — build appeal time into workflow

**Compliant Ad Copy Templates (store in MEMORY.md):**

```
Google Search Ads:
- "Explore Your Birth Chart | Personalized Astrology Reading"
- "Understand Your Cosmic Blueprint | Professional Natal Chart Analysis"
- "What Do the Stars Say? | Get Your Personalized Horoscope"

Meta Ads:
- "The universe has a story written just for you. Discover it."
- "Your birth chart holds answers. Explore what the cosmos reveals."
- "Curious about what the stars say? Get your free birth chart summary."

NEVER USE:
- "We predict your future"
- "100% accurate horoscope"
- "Are you a [sign]?"
- "[Sign] — this will change your life"
- "Guaranteed results"
- Health, financial, or relationship guarantees
```

### FTC Compliance

- Include "for entertainment/educational purposes" disclaimer on the website
- Clear pricing and refund policies on all purchase pages
- Disclose material connections in any testimonials
- CAN-SPAM compliance for email: physical address, unsubscribe link, honest subject lines
- Consider voluntary AI content disclosure on blog posts (builds trust)

### Privacy / GDPR / CCPA

- Birth chart readings collect personal data (date of birth, time, location) — GDPR-protected data
- Privacy policy MUST explain what data is collected, why, and how it's used
- Cookie consent banner for GA4 tracking, Meta Pixel
- Data deletion mechanism required (at minimum, a contact email for deletion requests)
- Email marketing: double opt-in for EU users (GDPR), clear unsubscribe mechanism

### Reddit Compliance

- Never automate posting to Reddit
- Follow each subreddit's specific rules (read sidebars)
- 90/10 rule: genuine participation must vastly outweigh self-promotion
- Build karma organically before any self-linking

---

## 15. Tech Stack

### Core Infrastructure

| Component | Tool | Version/Details |
|-----------|------|----------------|
| Agent Runtime | OpenClaw | Latest stable, installed via npm |
| Agent Model | Claude Sonnet 4 | `anthropic/claude-sonnet-4-20250514` |
| Compaction Model | Claude Sonnet 4 | Same model for cost-effective compaction |
| Hosting | Mac Mini | Apple Silicon, 16GB+ RAM, macOS |
| Process Manager | launchd | Native macOS, `ai.openclaw.gateway` |
| Communication | Telegram Bot API | Via grammY (built into OpenClaw) |
| Dashboard | OpenClaw Control UI | Vite + Lit SPA at port 18789 |
| Custom Dashboard | Express.js | Existing AdClaw server at port 3000 |

### npm Packages (install in workspace)

```json
{
  "dependencies": {
    "google-ads-api": "^16.x",
    "facebook-nodejs-business-sdk": "^25.x",
    "googleapis": "^140.x",
    "@google-analytics/data": "^4.x",
    "wpapi": "^2.x",
    "openai": "^4.x",
    "axios": "^1.x",
    "cheerio": "^1.x",
    "astronomia": "^4.x"
  }
}
```

| Package | Purpose | Auth Method |
|---------|---------|-------------|
| `google-ads-api` (Opteo) | Google Ads campaign management. GAQL queries, campaign/ad group/keyword CRUD, bid management. | OAuth 2.0 + Developer Token |
| `facebook-nodejs-business-sdk` (official) | Meta Ads campaign management. Campaign/ad set/ad CRUD, insights, audience management. | OAuth 2.0 System User Token |
| `googleapis` (official) | Google Search Console (searchconsole v1, webmasters v3), Google Indexing API v3. | Service Account JSON key |
| `@google-analytics/data` (official) | GA4 reporting. runReport, batchRunReports, runRealtimeReport. | Service Account JSON key |
| `wpapi` (node-wpapi) | WordPress REST API client. Post/page/media CRUD, category management, Yoast meta. | Application Password over HTTPS |
| `openai` | DALL-E image generation (if needed), GPT-4 Vision for creative evaluation. | API Key |
| `axios` | HTTP client for APIs without SDKs (Stability AI, BFL FLUX, custom endpoints). | Various |
| `cheerio` | HTML parsing for SEO audits. Parse page structure, extract meta tags, count headings. | N/A |
| `astronomia` | Astronomical calculations. Verify transit dates, planetary positions, lunar phases. | N/A (local computation) |

### MCP Servers (custom-built)

No pre-built marketing MCP servers exist. Build custom wrappers using `@modelcontextprotocol/sdk`:

```bash
npm install @modelcontextprotocol/sdk
```

However, for Phase 1-3, using skill-based scripts (exec'd by the agent) is simpler and more maintainable than full MCP servers. MCP server wrapping can be done in Phase 5 when the system is mature.

### External Services (free tier usage)

| Service | Cost | Usage |
|---------|------|-------|
| Google Cloud Console | Free | OAuth credentials, service accounts, Ads API access |
| Meta Business Suite | Free | Ad account, system user tokens |
| Google Search Console | Free | SEO monitoring |
| Google Analytics 4 | Free | Website analytics |
| WordPress | Free | Self-hosted CMS with REST API |
| Telegram | Free | Bot communication |
| Pinterest | Free | Organic pinning (API for scheduling optional) |
| UptimeRobot | Free tier | External health monitoring |
| Tailscale | Free tier | Remote access to Mac Mini dashboard |

### Optional Paid Tools (if budget allows)

| Tool | Cost | Value |
|------|------|-------|
| Canva Pro | $13/month | Social media and pin design templates |
| MailerLite/ConvertKit | $0-15/month | Email marketing automation |
| Tailwind (Pinterest scheduler) | $15/month | Pinterest scheduling and analytics |
| DALL-E / FLUX API | $5-20/month | AI-generated ad creatives (reduces human creative workload) |

---

## 16. Success Metrics

### 1 Month (End of Phase 2)

| Metric | Target | How Measured |
|--------|--------|-------------|
| Blog posts published | 10-15 | WordPress post count |
| Pages indexed in Google | 80%+ of published pages | Search Console coverage report |
| Organic impressions | Baseline established | Search Console analytics |
| OpenClaw uptime | >95% | Heartbeat logs |
| Telegram workflow functional | Agent <-> Human communication working daily | Manual verification |
| All API integrations working | 8/8 skills functional | Run each skill's read operation |

### 3 Months (End of Phase 4)

| Metric | Target | How Measured |
|--------|--------|-------------|
| Organic traffic | 500+ sessions/month (from near zero) | GA4 |
| Blog posts published | 40-50 total | WordPress |
| Keywords ranking page 1 | 5-10 keywords | Search Console |
| Email subscribers (if running lead gen) | 200-500 | Email platform |
| Google Ads CPA | Below $X target (define based on conversion value) | Google Ads reporting |
| Meta Ads cost per lead | Below $X target | Meta Ads insights |
| Ad spend within monthly budget | 100% (no overruns) | Budget reconciliation |
| Human time per week | <2 hours on average | Self-tracked |
| Content approval turnaround | <48 hours from agent draft to publish | Task board |

### 6 Months (End of Phase 5)

| Metric | Target | How Measured |
|--------|--------|-------------|
| Organic traffic | 2,000+ sessions/month | GA4 |
| Blog posts published | 100+ total | WordPress |
| Keywords ranking page 1 | 25-50 keywords | Search Console |
| Email subscribers | 1,000-2,000 | Email platform |
| Pinterest monthly impressions | 10,000+ | Pinterest analytics |
| Overall ROAS (if selling products/services) | >2x | Revenue / total spend |
| Agent autonomy level | 70%+ actions without human approval | Approval logs |
| Human time per week | <1 hour on average | Self-tracked |
| Ad account health | Zero suspensions or major policy violations | Platform status |
| Content quality score | 80%+ approval rate on first draft | Approval tracking |

### North Star Metrics

1. **Organic traffic growth rate**: Month-over-month increase in organic sessions. Target: 30%+ MoM for first 6 months.
2. **Cost per qualified lead**: Total marketing spend / total qualified leads (email signups, consultation bookings). Target: <$5 per lead.
3. **Human hours per week**: The entire point is autonomy. Target: <1 hour/week by month 6.
4. **Content velocity**: Number of quality content pieces published per month. Target: 20+/month by month 3.

---

## Appendix: Astrology Content Ideas — First 30 Articles

### Cornerstone (Evergreen, Highest Priority)

1. "Aries: Personality Traits, Strengths, and Challenges"
2. "Taurus: Personality Traits, Strengths, and Challenges"
3. (Repeat for all 12 signs — 12 articles)
4. "How to Read Your Birth Chart: A Complete Beginner's Guide"
5. "What Is a Rising Sign and Why Does It Matter?"
6. "The 12 Houses in Astrology Explained"
7. "Mercury Retrograde: What It Really Means (And What It Doesn't)"

### Cyclical (Time-Sensitive, Plan Around Astrological Calendar)

18. "Mercury Retrograde [Month] [Year] — Survival Guide for Every Sign"
19. "[Month] [Year] Full Moon in [Sign] — What It Means for You"
20. "Aries Season [Year] — What to Expect"
21. "Eclipse Season [Month] [Year] — Your Complete Guide"

### Compatibility (High Volume, Long-Tail)

22. "Aries and Libra Compatibility: Love, Friendship, and Beyond"
23. "Scorpio and Pisces Compatibility: The Deepest Water Sign Match"
24. "Leo and Aquarius Compatibility: Opposites Attract?"
(Prioritize the 10 most-searched pairs first, then expand to all 144)

### Trending/Viral Potential

25. "What Your Moon Sign Says About Your Emotional Needs"
26. "The Most Misunderstood Zodiac Signs, Ranked"
27. "Zodiac Signs as [Current Pop Culture Reference]"
28. "What Your Birth Chart Says About Your Career Path"
29. "The Luckiest Zodiac Signs of [Year]"
30. "How Each Sign Handles a Breakup"

---

## Appendix: Key File Paths Quick Reference

| Path | Purpose |
|------|---------|
| `~/.openclaw/openclaw.json` | Main OpenClaw configuration |
| `~/.openclaw/workspace/` | Agent workspace root |
| `~/.openclaw/workspace/MEMORY.md` | Long-term brand/strategy memory |
| `~/.openclaw/workspace/HEARTBEAT.md` | Periodic health check instructions |
| `~/.openclaw/workspace/memory/` | Daily logs, campaigns, SEO, content |
| `~/.openclaw/workspace/skills/` | Custom marketing skills |
| `~/.openclaw/workspace/hooks/` | Event-driven automation hooks |
| `~/.openclaw/workspace/assets/` | Images, templates, brand assets |
| `~/.openclaw/workspace/output/` | Generated reports, creatives, drafts |
| `~/.openclaw/workspace/tasks/kanban.md` | Human task board |
| `~/.openclaw/cron/jobs.json` | All scheduled job definitions |
| `~/.openclaw/secrets/` | API keys, service account JSON (gitignored) |
| `/tmp/openclaw/` | Rotating log files |

---

*Plan v1 — Created 2026-03-16. Review and iterate before execution.*
