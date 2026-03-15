# AdClaw — Full Build Plan

> Autonomous 24/7 Digital Marketing Agent on OpenClaw + GOAT Network
> Generates landing pages, event pages, ad campaigns. Tracks, analyzes, optimizes. Sells services via x402.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Prerequisites](#2-prerequisites)
3. [Project Structure](#3-project-structure)
4. [Docker Compose Setup](#4-docker-compose-setup)
5. [OpenClaw Agent Configuration](#5-openclaw-agent-configuration)
6. [Express API Server (Sidecar)](#6-express-api-server-sidecar)
7. [Custom OpenClaw Skills](#7-custom-openclaw-skills)
8. [Landing Page Generator](#8-landing-page-generator)
9. [Event Page Generator](#9-event-page-generator)
10. [Ad Copy Engine](#10-ad-copy-engine)
11. [Analytics & Tracking System](#11-analytics--tracking-system)
12. [GOAT x402 Payment Integration](#12-goat-x402-payment-integration)
13. [ERC-8004 On-Chain Identity](#13-erc-8004-on-chain-identity)
14. [Cron-Based Optimization Loop](#14-cron-based-optimization-loop)
15. [Telegram Bot Interface](#15-telegram-bot-interface)
16. [Testing & Demo Flow](#16-testing--demo-flow)
17. [Network Reference](#17-network-reference)

---

## 1. Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                     DOCKER COMPOSE                               │
│                                                                  │
│  ┌─────────────────────┐     ┌──────────────────────────────┐   │
│  │  openclaw-gateway    │     │  adclaw-server (Express.js)  │   │
│  │                     │     │                              │   │
│  │  - AI Agent Runtime │────▶│  - Serves landing pages      │   │
│  │  - Custom Skills    │     │  - Serves event pages        │   │
│  │  - Telegram Bot     │     │  - x402 payment middleware   │   │
│  │  - Cron Scheduler   │     │  - Analytics receiver        │   │
│  │  - Memory System    │     │  - Campaign API endpoints    │   │
│  │  - File Write/Exec  │     │  - Dashboard UI              │   │
│  │                     │     │                              │   │
│  │  Port: 18789        │     │  Port: 3402                  │   │
│  └─────────────────────┘     └──────────────┬───────────────┘   │
│                                              │                   │
└──────────────────────────────────────────────┼───────────────────┘
                                               │
                          ┌────────────────────┼────────────────────┐
                          │                    │                    │
                    ┌─────▼─────┐     ┌───────▼───────┐    ┌──────▼──────┐
                    │ GOAT      │     │ GA4           │    │ Telegram    │
                    │ Testnet3  │     │ Measurement   │    │ Bot API     │
                    │           │     │ Protocol      │    │             │
                    │ - x402 API│     │               │    │             │
                    │ - ERC-8004│     │               │    │             │
                    │ - Explorer│     │               │    │             │
                    └───────────┘     └───────────────┘    └─────────────┘
```

**How it works:**
1. User messages AdClaw via **Telegram** (or webhook)
2. OpenClaw agent processes the request using **custom skills**
3. Agent calls **adclaw-server** APIs via file-write + `exec` (curl with `@file`) to avoid shell escaping issues
4. adclaw-server generates HTML pages, handles payments, collects analytics
5. Agent uses **cron jobs** for 24/7 monitoring and optimization
6. External clients pay via **x402** on GOAT Testnet3 to access services
7. Agent is discoverable via **ERC-8004** identity on GOAT

---

## 2. Prerequisites

### On Your Mac
```bash
# Docker Desktop (required)
# Download from https://docker.com/products/docker-desktop/

# Verify
docker --version          # 24+
docker compose version    # v2+

# Node.js (for local dev/testing)
node --version            # 20+
npm --version             # 10+

# Git
git init adclaw && cd adclaw
```

### API Keys & Accounts Needed

| Service | What You Need | Where to Get |
|---------|---------------|--------------|
| **Anthropic / OpenAI** | API key for LLM (Claude or GPT) | console.anthropic.com / platform.openai.com |
| **Telegram** | Bot token | @BotFather on Telegram → `/newbot` |
| **GOAT Testnet3** | Wallet + test BTC | bridge.testnet3.goat.network/faucet |
| **GOAT x402** | Merchant API key + secret + merchant ID | Hackathon Telegram bot or goat.network dashboard |
| **GA4** (optional) | Measurement ID + API Secret | analytics.google.com → Admin → Data Streams |
| **Pinata/IPFS** (optional) | API key for hosting agent card | pinata.cloud |

### GOAT Testnet3 Wallet Setup
```bash
# Generate or import a wallet. You need the private key for ERC-8004 registration.
# Get test BTC from faucet: https://bridge.testnet3.goat.network/faucet
# Get test USDC: hackathon Telegram bot (t.me/goathackbot)
```

---

## 3. Project Structure

```
adclaw/
├── docker-compose.yml               # Orchestrates both services
├── .env                              # All secrets (gitignored)
├── .env.example                      # Template
├── plan.md                           # This file
├── base.md                           # Original hackathon notes
│
├── openclaw/                         # OpenClaw agent config
│   ├── config/
│   │   └── openclaw.json             # Gateway configuration
│   ├── workspace/
│   │   ├── AGENTS.md                 # Agent operating instructions
│   │   ├── SOUL.md                   # Agent persona
│   │   ├── USER.md                   # User identity
│   │   ├── IDENTITY.md              # Agent name/identity
│   │   ├── TOOLS.md                  # Tool notes
│   │   ├── MEMORY.md                 # Long-term memory index
│   │   ├── memory/                   # Daily memory logs
│   │   └── skills/                   # Custom AdClaw skills
│   │       ├── campaign-planner/
│   │       │   └── SKILL.md
│   │       ├── landing-builder/
│   │       │   └── SKILL.md
│   │       ├── event-creator/
│   │       │   └── SKILL.md
│   │       ├── ad-copywriter/
│   │       │   └── SKILL.md
│   │       ├── analytics-monitor/
│   │       │   └── SKILL.md
│   │       └── adclaw-api/
│   │           └── SKILL.md
│   └── credentials/                  # OAuth tokens (auto-managed)
│
├── server/                           # Express.js sidecar
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── index.ts                  # Express app entry
│   │   ├── routes/
│   │   │   ├── campaign.ts           # POST /api/campaign
│   │   │   ├── landing.ts            # POST /api/landing
│   │   │   ├── event.ts              # POST /api/event
│   │   │   ├── report.ts             # GET /api/report/:id
│   │   │   └── track.ts             # POST /api/track
│   │   ├── middleware/
│   │   │   └── goat-x402.ts          # GOAT x402 payment gating
│   │   ├── services/
│   │   │   ├── page-generator.ts     # HTML generation engine
│   │   │   ├── tracker.ts            # Analytics collection
│   │   │   └── erc8004.ts            # On-chain registration
│   │   ├── lib/
│   │   │   ├── goat.ts               # GOAT network helpers
│   │   │   └── templates.ts          # HTML template strings
│   │   └── types.ts                  # TypeScript interfaces
│   ├── public/
│   │   ├── sites/                    # Generated landing pages
│   │   ├── events/                   # Generated event pages
│   │   ├── dashboard/
│   │   │   └── index.html            # Analytics dashboard UI
│   │   └── tracker.js                # Lightweight tracking script
│   └── data/
│       ├── campaigns.json            # Campaign store (JSON)
│       └── events.jsonl              # Analytics events store (append-only JSONL)
│
└── scripts/
    ├── register-erc8004.ts           # One-time agent registration
    ├── seed-demo-data.ts             # Seed demo analytics
    └── test-x402-payment.ts          # Test payment flow
```

---

## 4. Docker Compose Setup

### Step 4.1: Create `.env`

```bash
# === LLM Provider ===
ANTHROPIC_API_KEY=sk-ant-...
# OR
OPENAI_API_KEY=sk-...

# === Telegram ===
TELEGRAM_BOT_TOKEN=123456:ABC-DEF...

# === GOAT Network ===
GOAT_PRIVATE_KEY=0x...your_testnet_wallet_private_key
GOAT_RPC_URL=https://rpc.testnet3.goat.network
GOAT_CHAIN_ID=48816
GOAT_EXPLORER_URL=https://explorer.testnet3.goat.network

# === GOAT x402 ===
GOATX402_API_URL=https://api.x402.goat.network
GOATX402_API_KEY=your_api_key
GOATX402_API_SECRET=your_api_secret
GOATX402_MERCHANT_ID=your_merchant_id

# === ERC-8004 ===
ERC8004_IDENTITY_REGISTRY=0x8004A169FB4a3325136EB29fA0ceB6D2e539a432
ERC8004_REPUTATION_REGISTRY=0x8004BAa17C55a88189AE136b182e5fdA19dE9b63

# === GA4 (optional) ===
GA4_MEASUREMENT_ID=G-XXXXXXX
GA4_API_SECRET=your_secret

# === AdClaw Server ===
ADCLAW_SERVER_URL=http://adclaw-server:3402
ADCLAW_PUBLIC_URL=https://your-public-url.ngrok.io  # or tunnel URL
ADCLAW_SERVER_PORT=3402
INTERNAL_SECRET=change-me-to-a-random-string       # Agent→server auth bypass for x402

# === OpenClaw Gateway ===
OPENCLAW_GATEWAY_TOKEN=your_secure_gateway_token
```

### Step 4.2: Create `docker-compose.yml`

```yaml
services:
  # === OpenClaw AI Agent ===
  openclaw-gateway:
    image: ghcr.io/openclaw/openclaw:latest
    container_name: adclaw-agent
    restart: unless-stopped
    ports:
      - "127.0.0.1:18789:18789"
    volumes:
      - ./openclaw/config:/home/node/.openclaw                  # Config + credentials
      - ./openclaw/workspace:/home/node/.openclaw/workspace     # Agent workspace + skills
    environment:
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - OPENAI_API_KEY=${OPENAI_API_KEY:-}
      - TELEGRAM_BOT_TOKEN=${TELEGRAM_BOT_TOKEN}
      - ADCLAW_SERVER_URL=http://adclaw-server:3402
      - ADCLAW_PUBLIC_URL=${ADCLAW_PUBLIC_URL}
      - INTERNAL_SECRET=${INTERNAL_SECRET}
    env_file:
      - .env
    networks:
      - adclaw-net
    depends_on:
      adclaw-server:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-fsS", "http://127.0.0.1:18789/healthz"]
      interval: 30s
      timeout: 5s
      retries: 3

  # === OpenClaw CLI (for onboarding & management) ===
  openclaw-cli:
    image: ghcr.io/openclaw/openclaw:latest
    container_name: adclaw-cli
    network_mode: "service:openclaw-gateway"
    volumes:
      - ./openclaw/config:/home/node/.openclaw
      - ./openclaw/workspace:/home/node/.openclaw/workspace
    environment:
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - TELEGRAM_BOT_TOKEN=${TELEGRAM_BOT_TOKEN}
    env_file:
      - .env
    profiles:
      - cli    # Only runs when explicitly invoked

  # === AdClaw Express Server (Landing Pages + x402 + Analytics) ===
  adclaw-server:
    build:
      context: ./server
      dockerfile: Dockerfile
    container_name: adclaw-server
    restart: unless-stopped
    ports:
      - "127.0.0.1:3402:3402"
    volumes:
      - ./server/public:/app/public       # Generated pages persist
      - ./server/data:/app/data           # Analytics data persists
    environment:
      - PORT=3402
      - GOAT_PRIVATE_KEY=${GOAT_PRIVATE_KEY}
      - GOAT_RPC_URL=${GOAT_RPC_URL}
      - GOAT_CHAIN_ID=${GOAT_CHAIN_ID}
      - GOATX402_API_URL=${GOATX402_API_URL}
      - GOATX402_API_KEY=${GOATX402_API_KEY}
      - GOATX402_API_SECRET=${GOATX402_API_SECRET}
      - GOATX402_MERCHANT_ID=${GOATX402_MERCHANT_ID}
      - ERC8004_IDENTITY_REGISTRY=${ERC8004_IDENTITY_REGISTRY}
      - ERC8004_REPUTATION_REGISTRY=${ERC8004_REPUTATION_REGISTRY}
      - GA4_MEASUREMENT_ID=${GA4_MEASUREMENT_ID:-}
      - GA4_API_SECRET=${GA4_API_SECRET:-}
      - ADCLAW_PUBLIC_URL=${ADCLAW_PUBLIC_URL}
      - INTERNAL_SECRET=${INTERNAL_SECRET}
    env_file:
      - .env
    networks:
      - adclaw-net
    healthcheck:
      test: ["CMD", "curl", "-fsS", "http://127.0.0.1:3402/health"]
      interval: 15s
      timeout: 3s
      retries: 3

networks:
  adclaw-net:
    driver: bridge
```

### Step 4.3: Server Dockerfile

Create `server/.dockerignore` first:

```
node_modules
dist
.env
data/
public/sites/*
public/events/*
*.md
```

```dockerfile
# server/Dockerfile — multi-stage build

# === Build stage ===
FROM node:20-slim AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build

# === Production stage ===
FROM node:20-slim
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
COPY public/ ./public/
RUN mkdir -p /app/data /app/public/sites /app/public/events

# Run as non-root
USER node

EXPOSE 3402
CMD ["node", "dist/index.js"]
```

### Step 4.4: First Run

```bash
# 1. Build and start the Express server first
docker compose up -d adclaw-server

# 2. Run OpenClaw onboarding (interactive — sets up LLM provider)
docker compose run --rm openclaw-cli onboard

# 3. Configure Telegram channel
docker compose run --rm openclaw-cli channels add --channel telegram --token "$TELEGRAM_BOT_TOKEN"

# 4. Start the gateway
docker compose up -d openclaw-gateway

# 5. Verify health
curl http://127.0.0.1:18789/healthz    # OpenClaw
curl http://127.0.0.1:3402/health      # AdClaw server

# 6. Access OpenClaw dashboard
docker compose run --rm openclaw-cli dashboard --no-open
# → Open http://127.0.0.1:18789/ with the printed token

# 7. Approve Telegram pairing
docker compose run --rm openclaw-cli pairing list telegram
docker compose run --rm openclaw-cli pairing approve telegram <CODE>
```

---

## 5. OpenClaw Agent Configuration

### Step 5.1: `openclaw/config/openclaw.json`

```json
{
  "version": 2,
  "gateway": {
    "port": 18789,
    "auth": {
      "mode": "token"
    }
  },
  "models": {
    "default": "anthropic/claude-sonnet-4-20250514",
    "thinking": "anthropic/claude-sonnet-4-20250514"
  },
  "channels": {
    "telegram": {
      "enabled": true,
      "dmPolicy": "open"
    }
  },
  "agents": {
    "defaults": {
      "workspace": "~/.openclaw/workspace"
    }
  },
  "cron": {
    "enabled": true
  },
  "hooks": {
    "enabled": true
  },
  "skills": {
    "load": {
      "watch": true
    }
  },
  "web": {
    "provider": "brave"
  }
}
```

### Step 5.2: `openclaw/workspace/AGENTS.md`

```markdown
# AdClaw — Autonomous Digital Marketing Agent

You are AdClaw, a 24/7 autonomous digital marketing agent. You plan campaigns, generate landing pages, create event pages, write ad copy, track analytics, and optimize performance.

## Core Capabilities

You have access to these custom skills:
- **campaign-planner** — Create full campaign strategies
- **landing-builder** — Generate and deploy landing pages
- **event-creator** — Generate and deploy event pages
- **ad-copywriter** — Write multi-platform ad copy variants
- **analytics-monitor** — Track and analyze campaign performance
- **adclaw-api** — Interact with the AdClaw server API

## How You Work

### When a user asks for a campaign:
1. Ask for: product/service, budget, target audience, goal, location
2. If user hasn't provided a creative description, ask for it. If they seem in a hurry or say "just do it", use a professional modern tone with clean design as the default.
3. Follow the campaign-planner skill instructions to create strategy
4. Follow the landing-builder skill instructions to generate a landing page
5. Follow the event-creator skill instructions if there's a launch event
6. Follow the ad-copywriter skill instructions for ad variants
7. Report back with all deliverables + live URLs

### Campaign State Tracking
When executing a campaign flow, maintain this state throughout:
- campaign_id: (extract from POST /api/campaign response — the "id" field)
- landing_slug: (extract from POST /api/landing response — the "slug" field)
- event_slug: (extract from POST /api/event response — the "slug" field)
- ad_variants: (the copy you generated)
ALWAYS extract IDs from API responses. NEVER fabricate IDs.
Pass the campaign_id to every subsequent API call in the flow.

### When monitoring performance:
1. Follow the analytics-monitor skill instructions to pull latest data
2. Report the metrics the API returns as-is. Do NOT recalculate or estimate.
3. If any metric is off target, proactively suggest optimizations
4. If a landing page underperforms, offer to regenerate it

### When handling x402 paid requests:
1. The AdClaw server handles payment verification
2. You fulfill the request only after the server confirms payment
3. Deliver the full package: strategy + landing page + ad copy

## Communication Style
- Professional but friendly
- Lead with action, not questions (unless you need creative input)
- Always provide deliverable URLs when you create pages
- Show metrics in clean tables

## Server API
The AdClaw server runs at: http://adclaw-server:3402
(Also available via ADCLAW_SERVER_URL env var.)
Use the adclaw-api skill for endpoint reference.

IMPORTANT: When making API calls via exec/curl, ALWAYS include this header:
  -H "x-internal-agent: $INTERNAL_SECRET"
This bypasses x402 payment for your own requests.

## URL Rules
- For API calls (curl commands from exec): use http://adclaw-server:3402
- For URLs in generated HTML (form actions, links visible to end users): use $ADCLAW_PUBLIC_URL
NEVER put the internal Docker URL in generated HTML — visitors can't reach it.

## Rules
1. Ask for creative description, but don't block on it — use sensible defaults if user is in a hurry
2. NEVER make up analytics data — only report what the tracking system returns
3. ALWAYS embed tracking in generated pages
4. For paid requests, verify payment before delivery
5. Keep memory of all campaigns in your memory system
6. When the report API returns empty data, say "No events recorded yet" — do NOT generate a table of zeros
```

### Step 5.3: `openclaw/workspace/SOUL.md`

```markdown
# AdClaw Persona

I am AdClaw, your autonomous marketing agency. I don't just plan — I build.

**Personality:** Results-driven, proactive, creative. I care about ROI.
**Tone:** Professional but approachable. Like a senior marketing lead.
**Emoji use:** Minimal. Data speaks louder.
**Boundaries:** I generate marketing content and pages. I don't execute real ad spend without explicit confirmation. I don't access personal data beyond what's shared with me.
```

### Step 5.4: `openclaw/workspace/IDENTITY.md`

```markdown
name: AdClaw
tagline: Your 24/7 Autonomous Marketing Agency
```

### Step 5.5: `openclaw/workspace/USER.md`

```markdown
# User

Name: Udhay
Role: Founder / Solo Builder
Knows: Web3, marketing, development
Prefers: Direct answers, live demos, working code over slides
```

---

## 6. Express API Server (Sidecar)

### Step 6.1: `server/package.json`

```json
{
  "name": "adclaw-server",
  "version": "1.0.0",
  "scripts": {
    "build": "tsc",
    "dev": "tsx watch src/index.ts",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "express": "^4.21.0",
    "cors": "^2.8.5",
    "compression": "^1.7.4",
    "ethers": "^6.13.0",
    "uuid": "^10.0.0"
  },
  "devDependencies": {
    "typescript": "^5.6.0",
    "tsx": "^4.19.0",
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/compression": "^1.7.5",
    "@types/uuid": "^10.0.0",
    "@types/node": "^20.0.0"
  }
}
```

### Step 6.2: `server/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "declaration": true
  },
  "include": ["src/**/*"]
}
```

### Step 6.3: `server/src/index.ts`

```typescript
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

const app = express();
const PORT = parseInt(process.env.PORT || '3402');
const INTERNAL_SECRET = process.env.INTERNAL_SECRET || '';

// Middleware
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '5mb' }));

// Internal agent auth bypass — skips x402 for requests from OpenClaw agent
function internalBypass(req: Request, _res: Response, next: NextFunction) {
  if (INTERNAL_SECRET && req.headers['x-internal-agent'] === INTERNAL_SECRET) {
    (req as any).skipPayment = true;
  }
  next();
}
app.use(internalBypass);

// Serve generated pages with caching
app.use('/sites', express.static(path.join(__dirname, '../public/sites'), { maxAge: '1h' }));
app.use('/events', express.static(path.join(__dirname, '../public/events'), { maxAge: '1h' }));
app.use('/dashboard', express.static(path.join(__dirname, '../public/dashboard')));
app.use('/tracker.js', express.static(path.join(__dirname, '../public/tracker.js'), { maxAge: '1d' }));

// x402 payment gate on external-facing routes (skipped for internal agent calls)
const paymentGate = x402PaymentGate();
function conditionalPayment(req: Request, res: Response, next: NextFunction) {
  if ((req as any).skipPayment) return next();
  paymentGate(req, res, next);
}

// API routes — x402-gated routes first, then free routes
app.use('/api/campaign', conditionalPayment, campaignRouter);
app.use('/api/landing', conditionalPayment, landingRouter);
app.use('/api/event', conditionalPayment, eventRouter);
app.use('/api/report', conditionalPayment, reportRouter);
app.use('/api/track', trackRouter);  // tracking is always free

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'adclaw-server', timestamp: new Date().toISOString() });
});

// Landing page index (list all generated pages)
app.get('/api/pages', (_req, res) => {
  const sitesDir = path.join(__dirname, '../public/sites');
  const eventsDir = path.join(__dirname, '../public/events');

  const sites = fs.existsSync(sitesDir)
    ? fs.readdirSync(sitesDir).filter((f: string) => f.endsWith('.html'))
    : [];
  const events = fs.existsSync(eventsDir)
    ? fs.readdirSync(eventsDir).filter((f: string) => f.endsWith('.html'))
    : [];

  res.json({ sites, events });
});

// Global error handler — prevents server crash on unhandled errors
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Graceful shutdown
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`AdClaw server running on port ${PORT}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down...');
  server.close(() => process.exit(0));
});
process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down...');
  server.close(() => process.exit(0));
});
```

### Step 6.4: `server/src/types.ts`

```typescript
export interface Campaign {
  id: string;
  name: string;
  product: string;
  budget: number;
  currency: string;
  targetAudience: string;
  goal: string;
  location: string;
  channels: string[];
  budgetSplit: Record<string, number>;
  timeline: string;
  kpis: Record<string, string>;
  adVariants: AdVariant[];
  landingPageSlug?: string;
  eventPageSlug?: string;
  createdAt: string;
  status: 'planned' | 'active' | 'paused' | 'completed';
}

export interface AdVariant {
  platform: 'google' | 'meta' | 'instagram';
  headline: string;
  description: string;
  cta: string;
  imagePrompt?: string;
}

export interface LandingPage {
  slug: string;
  campaignId: string;
  title: string;
  html: string;
  url: string;
  createdAt: string;
}

export interface EventPage {
  slug: string;
  campaignId: string;
  eventName: string;
  date: string;
  location: string;
  html: string;
  url: string;
  createdAt: string;
}

export interface TrackingEvent {
  id: string;
  campaignId: string;
  pageSlug: string;
  eventName: string;   // page_view, cta_click, scroll_50, rsvp, purchase
  value?: number;
  clientId: string;
  userAgent?: string;
  referrer?: string;
  timestamp: string;
}

export interface AnalyticsReport {
  campaignId: string;
  period: string;
  pageViews: number;
  uniqueVisitors: number;
  ctaClicks: number;
  rsvps: number;
  purchases: number;
  revenue: number;
  bounceRate: number;
  avgTimeOnPage: number;
  ctr: number;
  cpa: number;
  roas: number;
}
```

---

## 7. Custom OpenClaw Skills

### Step 7.1: Campaign Planner — `openclaw/workspace/skills/campaign-planner/SKILL.md`

```markdown
---
name: campaign-planner
description: Creates complete digital marketing campaign strategies with budget allocation, channel selection, KPIs, and timelines.
---

# Campaign Planner

You are the campaign strategy module of AdClaw.

## When to use
When the user asks to plan a campaign, marketing strategy, or promote a product/service/event.

## Required inputs (ASK if missing)
1. **Product/Service**: What are we marketing?
2. **Budget**: Total budget and currency
3. **Target Audience**: Demographics, interests, location
4. **Goal**: Awareness, leads, sales, event signups?
5. **Creative Description**: Brand voice, key messages, imagery preferences (ask if not provided, but don't block — use professional modern defaults if user says "just go")

## Budget parsing
Accept budgets in any format. Normalize to a number:
- "50k" = 50000, "₹50,000" = 50000, "$2.5k" = 2500
- If currency is ambiguous, ask.

## Output format
Produce a structured campaign plan:

### Campaign: [Name]
**Objective:** [Goal]
**Budget:** [Amount] | **Duration:** [Timeline]
**Target:** [Audience description]

#### Channel Strategy
| Channel | Budget % | Budget Amount | Purpose |
|---------|----------|---------------|---------|
| Google Search | X% | $X | Intent capture |
| Meta/Instagram | X% | $X | Awareness + retargeting |
| Landing Page | X% | $X | Conversion hub |
| Event Page | X% | $X | Event signups |

#### KPIs (derive realistic targets from budget and industry — do NOT use hardcoded values)
| Metric | Target |
|--------|--------|
| ROAS | [realistic for this budget/industry] |
| CPA | [derive from budget ÷ expected conversions] |
| CTR | [industry benchmark] |
| Landing page conversion | [realistic %] |

#### Timeline
- Week 1: Landing page live + initial ads
- Week 2: Event page + retargeting
- Week 3-4: Optimization based on data

## After planning
1. Store the campaign by running the adclaw-api "Create Campaign Record" curl command. Extract the campaign "id" from the response JSON.
2. Proceed to generate a landing page following the landing-builder skill instructions. Use the campaign ID from step 1.
3. If the campaign involves a time-bound event, generate an event page following the event-creator skill instructions.
4. Generate ad copy following the ad-copywriter skill instructions.
5. Report all deliverables with live URLs back to the user.
```

### Step 7.2: Landing Builder — `openclaw/workspace/skills/landing-builder/SKILL.md`

```markdown
---
name: landing-builder
description: Generates responsive Tailwind CSS landing pages and deploys them to a live URL via the AdClaw server.
---

# Landing Page Builder

You generate complete, responsive HTML landing pages using Tailwind CSS (via CDN).

## When to use
When a campaign needs a landing page, or user asks to create a webpage/landing page.

## How to generate

Create a COMPLETE, self-contained HTML file with:
- Tailwind CSS via CDN (`<script src="https://cdn.tailwindcss.com"></script>`)
- Hero section with headline + subheadline + CTA button
- Benefits/features section (3-4 cards)
- Social proof / testimonials section
- Final CTA section
- Footer with brand info
- Mobile-responsive design
- Tracking script embedded: `<script src="/tracker.js"></script>`
- All CTA buttons with `data-track="cta_click"` attribute
- RSVP/signup forms with `data-track="signup"` attribute

## Required HTML structure (follow this skeleton exactly)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{PAGE_TITLE}}</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-white text-gray-900">
  <!-- HERO SECTION: headline, subheadline, CTA -->
  <!-- BENEFITS SECTION: 3-4 feature cards -->
  <!-- SOCIAL PROOF SECTION: testimonials or stats -->
  <!-- FINAL CTA SECTION -->
  <!-- FOOTER -->
</body>
</html>
```

IMPORTANT: Do NOT include tracker.js in the HTML — the server auto-injects it on deployment.

## Page size
Keep generated pages between 100-300 lines of HTML. Do not over-engineer.

## Deployment (file-based — avoids shell escaping issues)

IMPORTANT: Do NOT pass HTML inline in a curl -d argument. It WILL break due to shell escaping.
Instead, use this two-step process:

1. Write a JSON payload file using the file write tool:
   Write to: /tmp/landing-{slug}.json
   Content: {"slug": "...", "campaignId": "...", "title": "...", "html": "...the full html..."}

2. Then deploy with exec:
   ```bash
   curl -X POST http://adclaw-server:3402/api/landing \
     -H "Content-Type: application/json" \
     -H "x-internal-agent: $INTERNAL_SECRET" \
     -d @/tmp/landing-{slug}.json
   ```

The page will be live at: `${ADCLAW_PUBLIC_URL}/sites/{slug}.html`

## Verification
After deployment, check the response for a "url" field. Report this URL to the user.
If curl returns an error, retry once. If it fails again, report the error.

## Design principles
- Clean, modern, conversion-focused
- Large readable text, high contrast
- Clear visual hierarchy
- Single primary CTA color throughout
- Fast loading (no external images — use CSS gradients for visual interest)
- All CTA buttons must have `data-track="cta_click"` attribute
- All forms must have `data-track="signup"` attribute
- Form actions must point to `${ADCLAW_PUBLIC_URL}/api/track` (the PUBLIC url, not internal)
```

### Step 7.3: Event Creator — `openclaw/workspace/skills/event-creator/SKILL.md`

```markdown
---
name: event-creator
description: Generates event landing pages with date, time, location, RSVP forms, and tracking.
---

# Event Page Creator

You generate event-specific landing pages with RSVP functionality.

## When to use
When a campaign involves a launch event, webinar, meetup, or any time-bound promotion.

## Page structure
Generate complete HTML with:
- Event name (large hero)
- Date & time (prominent)
- Location (with Google Maps link if physical address)
- Event description
- Speaker/host info (if applicable)
- RSVP form (name + email + phone)
- Share buttons (WhatsApp, Twitter, Copy Link)
- All forms must use `action="${ADCLAW_PUBLIC_URL}/api/track"` — the PUBLIC url, not internal
- All forms must have `data-track="rsvp"` attribute

IMPORTANT: Do NOT include tracker.js — the server auto-injects it.

## IMPORTANT: Public vs Internal URLs
- For curl commands (deployment): use http://adclaw-server:3402
- For HTML content (form actions, links visible to end users): use ${ADCLAW_PUBLIC_URL}
NEVER put the internal Docker URL in generated HTML — visitors can't reach it.

## Deployment (file-based — avoids shell escaping)

1. Write JSON payload to /tmp/event-{slug}.json using file write tool
2. Deploy with exec:
   ```bash
   curl -X POST http://adclaw-server:3402/api/event \
     -H "Content-Type: application/json" \
     -H "x-internal-agent: $INTERNAL_SECRET" \
     -d @/tmp/event-{slug}.json
   ```

Live at: `${ADCLAW_PUBLIC_URL}/events/{slug}.html`
```

### Step 7.4: Ad Copywriter — `openclaw/workspace/skills/ad-copywriter/SKILL.md`

```markdown
---
name: ad-copywriter
description: Generates multi-platform ad copy variants (Google, Meta, Instagram) with headlines, descriptions, and CTAs.
---

# Ad Copywriter

You write high-converting ad copy for multiple platforms.

## When to use
When a campaign needs ad creatives, or user asks for ad copy.

## Output format

Generate 5 variants per platform:

### Google Search Ads
For each variant:
- **Headline 1** (30 chars max)
- **Headline 2** (30 chars max)
- **Headline 3** (30 chars max)
- **Description 1** (90 chars max)
- **Description 2** (90 chars max)
- **Display URL path**
- **Target keywords** (5-10)

### Meta/Instagram Ads
For each variant:
- **Primary text** (125 chars for best performance)
- **Headline** (40 chars)
- **Description** (30 chars)
- **CTA button** (Shop Now / Learn More / Sign Up / Book Now)
- **Image prompt** (detailed description for AI image generation)

## Character limits are HARD limits
- Google Headline: EXACTLY 30 chars or fewer. Count every character including spaces.
- Google Description: EXACTLY 90 chars or fewer.
- Meta Primary text: 125 chars. Meta Headline: 40 chars. Meta Description: 30 chars.
After generating each variant, verify character counts. Show counts in parentheses.
Example: "Best Coffee in Chennai" (22 chars)

## Copywriting principles
- Lead with benefit, not feature
- Create urgency without being spammy
- Match the brand voice from creative description
- Include social proof when possible
- Each variant should test a different angle (emotional, rational, urgency, social proof, curiosity)
```

### Step 7.5: Analytics Monitor — `openclaw/workspace/skills/analytics-monitor/SKILL.md`

```markdown
---
name: analytics-monitor
description: Monitors campaign analytics, computes KPIs (ROAS, CPA, CTR), and suggests optimizations.
---

# Analytics Monitor

You monitor campaign performance and suggest optimizations.

## When to use
- When user asks for a report or campaign status
- During cron-based monitoring runs
- When proactively checking campaign health

## How to get data

Fetch analytics from the AdClaw server:

```bash
curl -H "x-internal-agent: $INTERNAL_SECRET" http://adclaw-server:3402/api/report/{campaignId}
```

## Data interpretation rules
1. The report API returns pre-computed metrics. Use them as-is. Do NOT recalculate.
2. If ROAS is 0, report "ROAS: N/A (no spend data linked)" — do NOT say ROAS is zero.
3. If total events < 10, report "Insufficient data for meaningful analysis" instead of computing percentages from tiny sample sizes.
4. NEVER extrapolate or estimate metrics not in the API response.
5. If the API returns {"message": "No events recorded yet"}, say exactly that. Do NOT generate a table of zeros or speculate about expected performance.

## Metrics reference (for interpreting API response)

| Metric | What It Means | Alert Threshold |
|--------|--------------|-----------------|
| ctr | CTA clicks / page views | < 1.5% |
| bounceRate | % of visitors with no interaction | > 70% |
| purchases | total purchase events tracked | depends on goal |
| revenue | sum of purchase event values | depends on budget |
| rsvps | form submissions + signups | depends on goal |

## Report format

### Campaign: [Name] — Performance Report
**Period:** [date range]
**Status:** [On Track / Needs Attention / Critical]

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| Page Views | X | X | ... |
| CTR | X% | >2% | ... |
| Conversions | X | X | ... |
| ROAS | Xx | >3x | ... |

### Recommendations
1. [Specific actionable suggestion]
2. [Specific actionable suggestion]

## Optimization triggers
- If CTR < 1.5%: Suggest new ad copy variants
- If bounce rate > 70%: Suggest landing page changes (move CTA above fold, simplify)
- If ROAS < 2x: Suggest budget reallocation between channels
- If conversion rate < 3%: Suggest A/B test for landing page
```

### Step 7.6: AdClaw API — `openclaw/workspace/skills/adclaw-api/SKILL.md`

```markdown
---
name: adclaw-api
description: Interface to the AdClaw server API for deploying pages, tracking events, and managing campaigns.
---

# AdClaw API Interface

The AdClaw server runs at: **http://adclaw-server:3402**
If the env var ADCLAW_SERVER_URL is set, use that instead.

IMPORTANT: Always include `-H "x-internal-agent: $INTERNAL_SECRET"` in every curl call.
This bypasses x402 payment verification for internal agent requests.

## Available endpoints

### Create Campaign Record
```bash
curl -X POST http://adclaw-server:3402/api/campaign \
  -H "Content-Type: application/json" \
  -H "x-internal-agent: $INTERNAL_SECRET" \
  -d '{
    "name": "Chennai Coffee Grand Opening",
    "product": "Coffee shop",
    "budget": 50000,
    "currency": "INR",
    "targetAudience": "18-35 foodies in Chennai",
    "goal": "awareness",
    "location": "Chennai",
    "channels": ["google_search", "meta", "instagram"],
    "budgetSplit": {"google_search": 40, "meta": 35, "instagram": 25},
    "timeline": "4 weeks",
    "kpis": {"ctr": ">2%", "conversion": ">5%"}
  }'
```
**Response:** `{"success": true, "campaign": {"id": "abc-123-uuid", ...}}`
IMPORTANT: Extract the "id" field from the response. You need it for all subsequent API calls.

### Deploy Landing Page (use file-based method from landing-builder skill)
```bash
curl -X POST http://adclaw-server:3402/api/landing \
  -H "Content-Type: application/json" \
  -H "x-internal-agent: $INTERNAL_SECRET" \
  -d @/tmp/landing-{slug}.json
```
**Response:** `{"success": true, "url": "https://public-url/sites/{slug}.html", "slug": "slug-name"}`

### Deploy Event Page (use file-based method from event-creator skill)
```bash
curl -X POST http://adclaw-server:3402/api/event \
  -H "Content-Type: application/json" \
  -H "x-internal-agent: $INTERNAL_SECRET" \
  -d @/tmp/event-{slug}.json
```
**Response:** `{"success": true, "url": "https://public-url/events/{slug}.html", "slug": "slug-name"}`

### Update Campaign (add page slugs, ad variants, change status)
```bash
curl -X PATCH http://adclaw-server:3402/api/campaign/{campaignId} \
  -H "Content-Type: application/json" \
  -H "x-internal-agent: $INTERNAL_SECRET" \
  -d '{"landingPageSlug": "slug", "status": "active"}'
```

### Track Event
```bash
curl -X POST http://adclaw-server:3402/api/track \
  -H "Content-Type: application/json" \
  -d '{"campaignId": "abc-123", "pageSlug": "coffee-shop", "eventName": "page_view", "clientId": "demo-1", "value": 0}'
```

### Get Analytics Report
```bash
curl -H "x-internal-agent: $INTERNAL_SECRET" http://adclaw-server:3402/api/report/{campaignId}
```

### List All Pages
```bash
curl http://adclaw-server:3402/api/pages
```

### Health Check
```bash
curl http://adclaw-server:3402/health
```

## Usage
Use the `exec` tool to run these curl commands. For deploying pages with HTML content, ALWAYS use the file-based method (write JSON to /tmp/ then curl with -d @file).
```

---

## 8. Landing Page Generator

### Step 8.1: `server/src/routes/landing.ts`

```typescript
import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { v4 as uuid } from 'uuid';
import { LandingPage } from '../types';

export const landingRouter = Router();

const SITES_DIR = path.join(__dirname, '../../public/sites');
const PUBLIC_URL = process.env.ADCLAW_PUBLIC_URL || 'http://localhost:3402';

if (!fs.existsSync(SITES_DIR)) fs.mkdirSync(SITES_DIR, { recursive: true });

// HTML-escape values injected into page attributes (prevents stored XSS)
function escapeAttr(s: string): string {
  return s.replace(/[&"'<>]/g, c =>
    ({ '&': '&amp;', '"': '&quot;', "'": '&#39;', '<': '&lt;', '>': '&gt;' }[c] || c)
  );
}

function sanitizeSlug(raw: string): string {
  const safe = raw.replace(/[^a-z0-9-]/gi, '-').toLowerCase();
  return safe || 'untitled';  // guard against empty result
}

// POST /api/landing — save and serve a landing page
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

    // Inject tracking script if not already present
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

// GET /api/landing/:slug — get page metadata
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
```

### Step 8.2: `server/public/tracker.js`

```javascript
// AdClaw Lightweight Tracker
// Auto-injected into every generated page by the server.
(function() {
  var script = document.querySelector('script[data-campaign]');
  var campaignId = script ? script.getAttribute('data-campaign') : 'unknown';
  var pageSlug = script ? script.getAttribute('data-page') : 'unknown';
  var serverUrl = script ? (script.getAttribute('data-server') || '') : '';

  // localStorage can throw in Safari private browsing
  var clientId;
  try {
    clientId = localStorage.getItem('adclaw_cid');
    if (!clientId) {
      clientId = Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem('adclaw_cid', clientId);
    }
  } catch(e) {
    clientId = Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  function track(eventName, value) {
    var baseUrl = serverUrl || window.location.origin;
    var payload = {
      campaignId: campaignId,
      pageSlug: pageSlug,
      eventName: eventName,
      clientId: clientId,
      value: value || 0,
      userAgent: navigator.userAgent,
      referrer: document.referrer
    };
    fetch(baseUrl + '/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(function() {});
  }

  // Auto-track page view
  track('page_view');

  // Track CTA clicks
  document.addEventListener('click', function(e) {
    var el = e.target.closest('[data-track]');
    if (el) track(el.getAttribute('data-track'), el.getAttribute('data-value') || 0);
  });

  // Track scroll depth (throttled with requestAnimationFrame)
  var scrolled = {};
  var scrollTicking = false;
  window.addEventListener('scroll', function() {
    if (!scrollTicking) {
      scrollTicking = true;
      requestAnimationFrame(function() {
        var scrollable = document.body.scrollHeight - window.innerHeight;
        if (scrollable <= 0) { scrollTicking = false; return; }  // content fits viewport
        var pct = Math.round((window.scrollY / scrollable) * 100);
        [25, 50, 75, 100].forEach(function(threshold) {
          if (pct >= threshold && !scrolled[threshold]) {
            scrolled[threshold] = true;
            track('scroll_' + threshold);
          }
        });
        scrollTicking = false;
      });
    }
  });

  // Track form submissions
  document.addEventListener('submit', function(e) {
    var form = e.target;
    var trackAttr = form.getAttribute('data-track');
    if (trackAttr) track(trackAttr);
    else track('form_submit');
  });

  // Expose globally
  window.adclaw = { track: track };
})();
```

---

## 9. Event Page Generator

### Step 9.1: `server/src/routes/event.ts`

```typescript
import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

export const eventRouter = Router();

const EVENTS_DIR = path.join(__dirname, '../../public/events');
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
```

---

## 10. Ad Copy Engine

No server route needed — the OpenClaw agent generates ad copy directly using the `ad-copywriter` skill. It's pure LLM output returned in chat.

---

## 11. Analytics & Tracking System

### Step 11.1: `server/src/routes/track.ts`

```typescript
import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { v4 as uuid } from 'uuid';
import { TrackingEvent } from '../types';

export const trackRouter = Router();

// JSONL format (one JSON object per line) — append-only, no race conditions
const DATA_FILE = path.join(__dirname, '../../data/events.jsonl');

// Append a single event (atomic, no read-modify-write)
function appendEvent(event: TrackingEvent) {
  fs.appendFileSync(DATA_FILE, JSON.stringify(event) + '\n', 'utf-8');
}

// Read all events (only used by report endpoint, not on every write)
export function readEvents(): TrackingEvent[] {
  if (!fs.existsSync(DATA_FILE)) return [];
  return fs.readFileSync(DATA_FILE, 'utf-8')
    .trim()
    .split('\n')
    .filter(Boolean)
    .map(line => JSON.parse(line));
}

// POST /api/track — receive tracking event
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
      timestamp: new Date().toISOString(),  // always server-side timestamp
    };

    appendEvent(event);

    // Forward to GA4 if configured
    if (process.env.GA4_MEASUREMENT_ID && process.env.GA4_API_SECRET) {
      forwardToGA4(event).catch(() => {});
    }

    res.json({ success: true, eventId: event.id });
  } catch (err) {
    console.error('Track error:', err);
    res.status(500).json({ error: 'Failed to track event' });
  }
});

// GET with query params (image pixel tracking)
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

    // Return 1x1 transparent GIF
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
```

### Step 11.2: `server/src/routes/report.ts`

```typescript
import { Router, Request, Response } from 'express';
import { readEvents } from './track';  // shared JSONL reader

export const reportRouter = Router();

// GET /api/report/:campaignId
reportRouter.get('/:campaignId', (req: Request, res: Response) => {
  try {
    const { campaignId } = req.params;
    const allEvents = readEvents();
    const events = allEvents.filter(e => e.campaignId === campaignId);

    if (events.length === 0) {
      return res.json({ campaignId, message: 'No events recorded yet', events: [] });
    }

    const pageViews = events.filter(e => e.eventName === 'page_view').length;
    const uniqueVisitors = new Set(events.filter(e => e.eventName === 'page_view').map(e => e.clientId)).size;
    const ctaClicks = events.filter(e => e.eventName === 'cta_click').length;
    const interactions = events.filter(e => e.eventName !== 'page_view').length;
    const rsvps = events.filter(e => e.eventName === 'rsvp' || e.eventName === 'signup' || e.eventName === 'form_submit').length;
    const purchases = events.filter(e => e.eventName === 'purchase').length;
    const revenue = events.filter(e => e.eventName === 'purchase').reduce((sum, e) => sum + (e.value || 0), 0);

    // Bounce = visitors with page_view but NO other interaction
    const visitorsWithInteraction = new Set(
      events.filter(e => e.eventName !== 'page_view' && !e.eventName.startsWith('scroll_'))
        .map(e => e.clientId)
    );
    const bounceRate = uniqueVisitors > 0
      ? Math.round(((uniqueVisitors - visitorsWithInteraction.size) / uniqueVisitors) * 100)
      : 0;

    const report = {
      campaignId,
      period: `${events[0].timestamp} — ${events[events.length - 1].timestamp}`,
      pageViews,
      uniqueVisitors,
      ctaClicks,
      interactions,
      rsvps,
      purchases,
      revenue,
      bounceRate,
      ctr: pageViews > 0 ? Math.round((ctaClicks / pageViews) * 10000) / 100 : 0,
      avgOrderValue: purchases > 0 ? Math.round(revenue / purchases) : null,
      // CPA and ROAS require spend data — not available from tracking alone
      cpa: null as number | null,
      roas: null as number | null,
    };

    res.json({
      report,
      totalEvents: events.length,
      eventBreakdown: Object.entries(
        events.reduce((acc: Record<string, number>, e) => {
          acc[e.eventName] = (acc[e.eventName] || 0) + 1;
          return acc;
        }, {})
      ).map(([name, count]) => ({ name, count })),
    });
  } catch (err) {
    console.error('Report error:', err);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

// GET /api/report — all campaigns summary
reportRouter.get('/', (_req: Request, res: Response) => {
  try {
    const events = readEvents();
    const campaigns = [...new Set(events.map(e => e.campaignId))];

    const summaries = campaigns.map(id => {
      const cEvents = events.filter(e => e.campaignId === id);
      return {
        campaignId: id,
        totalEvents: cEvents.length,
        pageViews: cEvents.filter(e => e.eventName === 'page_view').length,
        lastEvent: cEvents[cEvents.length - 1]?.timestamp,
      };
    });

    res.json({ campaigns: summaries });
  } catch (err) {
    console.error('Report list error:', err);
    res.status(500).json({ error: 'Failed to list reports' });
  }
});
```

### Step 11.3: `server/src/routes/campaign.ts`

```typescript
import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { v4 as uuid } from 'uuid';
import { Campaign } from '../types';

export const campaignRouter = Router();

const DATA_FILE = path.join(__dirname, '../../data/campaigns.json');

function readCampaigns(): Campaign[] {
  if (!fs.existsSync(DATA_FILE)) return [];
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}

// Atomic write: write to temp file then rename
function writeCampaigns(campaigns: Campaign[]) {
  const tmp = DATA_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(campaigns, null, 2), 'utf-8');
  fs.renameSync(tmp, DATA_FILE);
}

// POST /api/campaign — create campaign record
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

// PATCH /api/campaign/:id — update campaign (status, slugs, variants)
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

// GET /api/campaign/:id
campaignRouter.get('/:id', (req: Request, res: Response) => {
  const campaigns = readCampaigns();
  const campaign = campaigns.find(c => c.id === req.params.id);
  if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
  res.json({ success: true, campaign });
});

// GET /api/campaign — list all
campaignRouter.get('/', (_req: Request, res: Response) => {
  res.json({ success: true, campaigns: readCampaigns() });
});
```

---

## 12. GOAT x402 Payment Integration

### Step 12.1: Understanding GOAT's x402 Flow

GOAT's x402 is **NOT** Coinbase's `@x402/express`. It uses a separate SDK with HMAC authentication.

**Flow:**
1. Client requests a paid endpoint
2. Server creates an order via GOAT x402 API (`POST /api/v1/orders`)
3. Client receives order details (amount, payment address, chain)
4. Client pays on-chain (USDC on GOAT Testnet3)
5. Server polls order status (`GET /api/v1/orders/{order_id}`)
6. Once settled, server delivers the resource

### Step 12.2: `server/src/middleware/goat-x402.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

const API_URL = process.env.GOATX402_API_URL || 'https://api.x402.goat.network';
const API_KEY = process.env.GOATX402_API_KEY || '';
const API_SECRET = process.env.GOATX402_API_SECRET || '';
const MERCHANT_ID = process.env.GOATX402_MERCHANT_ID || '';

interface PricingRule {
  price: string;
  token: string;
  description: string;
}

// HMAC-SHA256 signing for GOAT x402 API
function signRequest(method: string, path: string, body: string, timestamp: string): string {
  const message = `${method}\n${path}\n${body}\n${timestamp}`;
  return crypto.createHmac('sha256', API_SECRET).update(message).digest('hex');
}

// Fetch with timeout (10s) to prevent hanging requests
async function fetchWithTimeout(url: string, opts: RequestInit, timeoutMs = 10000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...opts, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function createOrder(amount: string, token: string, description: string): Promise<any> {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const path = '/api/v1/orders';
  const body = JSON.stringify({
    merchantId: MERCHANT_ID,
    amount,
    token,
    chain: 'goat-testnet3',
    description,
  });

  const signature = signRequest('POST', path, body, timestamp);

  const res = await fetchWithTimeout(`${API_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY,
      'X-Timestamp': timestamp,
      'X-Sign': signature,
    },
    body,
  });

  return res.json();
}

async function checkOrderStatus(orderId: string): Promise<any> {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const orderPath = `/api/v1/orders/${orderId}`;
  const signature = signRequest('GET', orderPath, '', timestamp);

  const res = await fetchWithTimeout(`${API_URL}${orderPath}`, {
    headers: {
      'X-API-Key': API_KEY,
      'X-Timestamp': timestamp,
      'X-Sign': signature,
    },
  });

  return res.json();
}

// Pricing configuration
const PRICING: Record<string, PricingRule> = {
  'POST /api/campaign': { price: '0.10', token: 'USDC', description: 'Campaign strategy' },
  'POST /api/landing':  { price: '0.30', token: 'USDC', description: 'Landing page generation' },
  'POST /api/event':    { price: '0.20', token: 'USDC', description: 'Event page generation' },
  'GET /api/report':    { price: '0.05', token: 'USDC', description: 'Analytics report' },
};

// Middleware factory
export function x402PaymentGate(pricing: Record<string, PricingRule> = PRICING) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Check if this route requires payment
    const routeKey = `${req.method} ${req.baseUrl}`;
    const rule = pricing[routeKey];

    if (!rule) return next(); // No payment required

    // Check for existing payment proof header
    const paymentProof = req.headers['x-payment-proof'] as string;
    const orderId = req.headers['x-order-id'] as string;

    if (orderId && paymentProof) {
      // Verify existing payment
      try {
        const status = await checkOrderStatus(orderId);
        if (status.status === 'settled' || status.status === 'completed') {
          return next(); // Payment verified
        }
      } catch (e) {
        // Fall through to payment required
      }
    }

    // No valid payment — create order and return 402
    try {
      const order = await createOrder(rule.price, rule.token, rule.description);

      return res.status(402).json({
        error: 'Payment Required',
        x402: true,
        order: {
          id: order.orderId || order.id,
          amount: rule.price,
          token: rule.token,
          chain: 'goat-testnet3',
          chainId: 48816,
          description: rule.description,
          paymentAddress: order.paymentAddress,
          expiresAt: order.expiresAt,
        },
        instructions: 'Send payment to the specified address, then retry with X-Order-Id and X-Payment-Proof headers.',
      });
    } catch (e) {
      // If x402 API is unavailable, allow through (hackathon fallback)
      console.error('x402 API error, allowing through:', e);
      return next();
    }
  };
}
```

### Step 12.3: Wire x402 into Express

Already integrated in `server/src/index.ts` (Step 6.3) via `conditionalPayment` middleware. The `internalBypass` middleware checks `x-internal-agent` header against `INTERNAL_SECRET` env var, and the `paymentGate` is created once at startup (not per-request).

---

## 13. ERC-8004 On-Chain Identity

### Step 13.1: `server/src/services/erc8004.ts`

```typescript
import { ethers } from 'ethers';

const RPC_URL = process.env.GOAT_RPC_URL || 'https://rpc.testnet3.goat.network';
const PRIVATE_KEY = process.env.GOAT_PRIVATE_KEY || '';
const IDENTITY_REGISTRY = process.env.ERC8004_IDENTITY_REGISTRY || '0x8004A169FB4a3325136EB29fA0ceB6D2e539a432';

const IDENTITY_ABI = [
  'function register(string agentURI) external returns (uint256)',
  'function register() external returns (uint256)',
  'function setAgentWallet(uint256 agentId, address newWallet, uint256 deadline, bytes signature) external',
  'function setMetadata(uint256 agentId, string key, bytes value) external',
  'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
];

// Reuse provider/signer across calls
const provider = new ethers.JsonRpcProvider(RPC_URL);
const signer = PRIVATE_KEY ? new ethers.Wallet(PRIVATE_KEY, provider) : null;

export async function registerAgent(agentURI: string): Promise<{ agentId: string; txHash: string }> {
  if (!signer) throw new Error('GOAT_PRIVATE_KEY is not configured');
  const registry = new ethers.Contract(IDENTITY_REGISTRY, IDENTITY_ABI, signer);

  console.log(`Registering agent with URI: ${agentURI}`);

  // Use bracket notation to disambiguate overloaded register()
  const tx = await registry['register(string)'](agentURI);
  const receipt = await tx.wait();

  // Extract agentId from Transfer event
  const transferEvent = receipt.logs.find(
    (log: any) => log.topics[0] === ethers.id('Transfer(address,address,uint256)')
  );

  const agentId = transferEvent
    ? ethers.toBigInt(transferEvent.topics[3]).toString()
    : 'unknown';

  console.log(`Agent registered! ID: ${agentId}, TX: ${receipt.hash}`);

  return { agentId, txHash: receipt.hash };
}

export async function setAgentMetadata(agentId: string, key: string, value: string) {
  if (!signer) throw new Error('GOAT_PRIVATE_KEY is not configured');
  const registry = new ethers.Contract(IDENTITY_REGISTRY, IDENTITY_ABI, signer);

  const tx = await registry.setMetadata(BigInt(agentId), key, ethers.toUtf8Bytes(value));
  await tx.wait();
}
```

### Step 13.2: `agent-card.json` (Host on IPFS via Pinata)

```json
{
  "type": "https://eips.ethereum.org/EIPS/eip-8004#registration-v1",
  "name": "AdClaw — Autonomous Marketing Agency",
  "description": "24/7 AI agent that plans campaigns, generates landing pages, creates event pages, writes ad copy, tracks analytics, and optimizes performance. Pay-per-use via x402 on GOAT.",
  "image": "ipfs://QmAdClawLogoHash",
  "x402Support": true,
  "active": true,
  "services": [
    {
      "name": "campaign-plan",
      "endpoint": "/api/campaign",
      "version": "1.0",
      "skills": ["marketing", "strategy", "analytics"],
      "domains": ["digital-marketing", "advertising"]
    },
    {
      "name": "landing-page",
      "endpoint": "/api/landing",
      "version": "1.0",
      "skills": ["web-design", "html", "conversion-optimization"]
    },
    {
      "name": "event-page",
      "endpoint": "/api/event",
      "version": "1.0",
      "skills": ["event-marketing", "web-design"]
    },
    {
      "name": "analytics-report",
      "endpoint": "/api/report",
      "version": "1.0",
      "skills": ["analytics", "reporting", "optimization"]
    }
  ],
  "registrations": [
    {
      "agentRegistry": "eip155:48816:0x8004A169FB4a3325136EB29fA0ceB6D2e539a432",
      "agentId": null
    }
  ]
}
```

### Step 13.3: `scripts/register-erc8004.ts`

```typescript
import { registerAgent } from '../server/src/services/erc8004';

// Run: npx tsx scripts/register-erc8004.ts <ipfs-uri>
const agentURI = process.argv[2] || 'ipfs://QmYourAgentCardHash';

async function main() {
  console.log('Registering AdClaw on ERC-8004...');
  const result = await registerAgent(agentURI);
  console.log('Registration complete!');
  console.log(`Agent ID: ${result.agentId}`);
  console.log(`TX Hash: ${result.txHash}`);
  console.log(`View on explorer: ${process.env.GOAT_EXPLORER_URL}/tx/${result.txHash}`);

  // Update agent-card.json with actual agentId (keep as string to avoid BigInt precision loss)
  const fs = require('fs');
  const card = JSON.parse(fs.readFileSync('agent-card.json', 'utf-8'));
  card.registrations[0].agentId = result.agentId;
  fs.writeFileSync('agent-card.json', JSON.stringify(card, null, 2));
  console.log('Updated agent-card.json with agentId');
}

main().catch(console.error);
```

---

## 14. Cron-Based Optimization Loop

### Step 14.1: Set Up Monitoring Cron

After the agent is running, configure cron jobs via CLI:

```bash
# Hourly performance check
docker compose run --rm openclaw-cli cron add \
  --name "hourly-performance-check" \
  --cron "0 * * * *" \
  --tz "Asia/Kolkata" \
  --session isolated \
  --message "Run analytics-monitor skill. Check all active campaigns. If any metric is below threshold, send alert via Telegram with specific recommendations. Check: CTR < 1.5%, bounce rate > 70%, conversion rate < 3%." \
  --announce \
  --channel telegram

# Daily summary report
docker compose run --rm openclaw-cli cron add \
  --name "daily-campaign-summary" \
  --cron "0 9 * * *" \
  --tz "Asia/Kolkata" \
  --session isolated \
  --message "Generate a daily summary report for all active campaigns. Include: total page views, conversions, revenue, and top/bottom performing pages. Compare to yesterday. Send via Telegram." \
  --announce \
  --channel telegram

# Weekly optimization suggestions
docker compose run --rm openclaw-cli cron add \
  --name "weekly-optimization" \
  --cron "0 10 * * 1" \
  --tz "Asia/Kolkata" \
  --session isolated \
  --message "Analyze all campaign data from the past week. Identify: (1) Best performing ad variants, (2) Worst performing landing pages, (3) Budget reallocation suggestions, (4) New keyword opportunities. Provide actionable recommendations." \
  --model "opus" \
  --thinking high \
  --announce \
  --channel telegram
```

### Step 14.2: Verify Cron

```bash
docker compose run --rm openclaw-cli cron list
# Should show all three jobs

# Test run manually
docker compose run --rm openclaw-cli cron run <jobId>
```

---

## 15. Telegram Bot Interface

### Step 15.1: Create Bot

1. Open Telegram → message `@BotFather`
2. Send `/newbot`
3. Name: `AdClaw Marketing Bot`
4. Username: `adclaw_bot` (or similar available name)
5. Copy the token → put in `.env` as `TELEGRAM_BOT_TOKEN`

### Step 15.2: Configure in OpenClaw

Already done in `openclaw.json` (Step 5.1). After gateway starts:

```bash
# Add Telegram channel
docker compose run --rm openclaw-cli channels add --channel telegram --token "$TELEGRAM_BOT_TOKEN"

# Start gateway
docker compose up -d openclaw-gateway

# Approve pairing
docker compose run --rm openclaw-cli pairing list telegram
docker compose run --rm openclaw-cli pairing approve telegram <CODE>
```

### Step 15.3: Test

Message the bot on Telegram:
> "Plan a campaign for my Chennai coffee shop grand opening, ₹50k budget, targeting 18-35 foodies"

Expected flow:
1. Agent asks for creative description
2. You provide it
3. Agent generates campaign plan + landing page + ad copy
4. Agent sends back links + report

---

## 16. Testing & Demo Flow

### Step 16.1: Local Testing

```bash
# Start everything
docker compose up -d

# Test server health
curl http://localhost:3402/health

# Test landing page deployment manually
curl -X POST http://localhost:3402/api/landing \
  -H "Content-Type: application/json" \
  -d '{
    "slug": "test-page",
    "campaignId": "test-001",
    "title": "Test Landing Page",
    "html": "<!DOCTYPE html><html><head><script src=\"https://cdn.tailwindcss.com\"></script></head><body class=\"bg-gray-50\"><div class=\"max-w-4xl mx-auto py-20 text-center\"><h1 class=\"text-5xl font-bold\">Test Page</h1><button data-track=\"cta_click\" class=\"mt-8 bg-blue-600 text-white px-8 py-4 rounded-lg text-xl\">Click Me</button></div></body></html>"
  }'

# Visit: http://localhost:3402/sites/test-page.html

# Test tracking
curl -X POST http://localhost:3402/api/track \
  -H "Content-Type: application/json" \
  -d '{"campaignId":"test-001","pageSlug":"test-page","eventName":"page_view","clientId":"demo-1"}'

# Test report
curl http://localhost:3402/api/report/test-001

# Test x402 (will return 402 without payment)
curl -v http://localhost:3402/api/campaign
```

### Step 16.2: Expose Publicly (for Demo)

```bash
# Option A: ngrok
ngrok http 3402
# Copy the https URL → put in .env as ADCLAW_PUBLIC_URL
# Restart: docker compose restart adclaw-server

# Option B: Cloudflare Tunnel
cloudflared tunnel --url http://localhost:3402
```

### Step 16.3: Full Demo Script

```
1. Open Telegram → message @adclaw_bot
2. Send: "Plan a campaign for my Chennai coffee shop grand opening.
   Budget: ₹50,000. Target: 18-35 foodies in Chennai."
3. Agent asks for creative description → provide it
4. Agent creates:
   - Campaign strategy (in chat)
   - Landing page (live URL)
   - Event page (live URL)
   - 5 Google + 5 Meta ad variants
5. Open landing page on phone → show real-time tracking
6. Show analytics dashboard at /dashboard
7. Show x402: curl the paid endpoint → get 402 response with payment details
8. Show ERC-8004: agent identity on GOAT explorer
```

---

## 17. Network Reference

### GOAT Testnet3

| Property | Value |
|----------|-------|
| **Network Name** | GOAT Testnet3 |
| **Chain ID** | 48816 (0xBEB0) |
| **RPC URL** | `https://rpc.testnet3.goat.network` |
| **Explorer** | `https://explorer.testnet3.goat.network` |
| **Faucet** | `https://bridge.testnet3.goat.network/faucet` |
| **Native Token** | BTC (18 decimals) |

### ERC-8004 Contracts (GOAT Mainnet — Chain 2345)

| Contract | Address |
|----------|---------|
| IdentityRegistry | `0x8004A169FB4a3325136EB29fA0ceB6D2e539a432` |
| ReputationRegistry | `0x8004BAa17C55a88189AE136b182e5fdA19dE9b63` |

> **Note:** ERC-8004 contracts listed are for GOAT mainnet (chain 2345). At the hackathon, confirm if testnet3 has separate contract addresses — use the addresses from the workshop/onboarding checklist.

### GOAT x402 API

| Property | Value |
|----------|-------|
| **API URL** | `https://api.x402.goat.network` |
| **Auth** | HMAC-SHA256 (X-API-Key + X-Timestamp + X-Sign) |
| **Supported Tokens** | USDC, USDT |
| **Create Order** | `POST /api/v1/orders` |
| **Check Status** | `GET /api/v1/orders/{order_id}` |
| **Get Proof** | `GET /api/v1/orders/{order_id}/proof` |

### Key URLs

| Resource | URL |
|----------|-----|
| GOAT x402 Repo | `https://github.com/GOATNetwork/x402` |
| Coinbase x402 (reference) | `https://github.com/coinbase/x402` |
| OpenClaw Docs | `https://docs.openclaw.ai` |
| ClawHub | `https://clawhub.ai` |
| ERC-8004 Spec | `https://github.com/erc-8004/erc-8004-contracts` |

---

## Quick Start Summary

```bash
# 1. Clone and configure
cd adclaw
cp .env.example .env
# Fill in all API keys in .env

# 2. Build and start
docker compose up -d adclaw-server
docker compose run --rm openclaw-cli onboard
docker compose run --rm openclaw-cli channels add --channel telegram --token "$TELEGRAM_BOT_TOKEN"
docker compose up -d openclaw-gateway

# 3. Approve Telegram
docker compose run --rm openclaw-cli pairing approve telegram <CODE>

# 4. Register ERC-8004 (after uploading agent-card.json to IPFS)
npx tsx scripts/register-erc8004.ts ipfs://QmYourHash

# 5. Set up cron monitoring
docker compose run --rm openclaw-cli cron add --name "hourly-check" --cron "0 * * * *" --session isolated --message "Check all campaigns" --announce --channel telegram

# 6. Expose publicly
ngrok http 3402

# 7. Test via Telegram
# Message the bot with a campaign request
```
