hackathon details: https://luma.com/hml6hbs3


# AdClaw: Autonomous Digital Marketing Agent

**Hackathon Project for OpenClaw Hack @ GOAT Network**  
**Date:** March 15, 2026  
**Team:** Solo (Udhaykumar)  
**Track:** GOAT Track (x402 + ERC-8004 + GOAT Testnet)  
**Goal:** Win the Mac Mini by building a fully autonomous AI agent that plans, creates, launches, monitors, and optimizes digital marketing campaigns — with real micropayments and on-chain identity.

---

## 🎯 Project Overview

AdClaw is a **persistent, self-hosted AI agent** built on **OpenClaw** that acts as your 24/7 digital marketing team.  

It:
- Plans complete campaigns from a single prompt
- Proactively requests creative descriptions from you
- Generates ad copy + image prompts
- Creates & launches ads on Google Ads + Meta Ads
- Tracks **every page event** (page_view, add_to_cart, purchase, etc.) via GA4 Measurement Protocol
- Monitors real-time performance (ROAS, CPA, CTR, conversions)
- Sends proactive optimization alerts
- Exposes paid endpoints via **x402** (other agents or humans pay USDC on GOAT Testnet)
- Has a portable on-chain identity via **ERC-8004**

**Live Demo Flow (5-minute judge demo):**
1. You: “Plan a ₹50k campaign for my Chennai coffee shop targeting 18-35 foodies.”
2. AdClaw: “Please send creative description + target keywords for the hero banner.”
3. You reply → AdClaw generates 5 ad variants, creates campaign, launches ads.
4. AdClaw simulates/tracks conversions and shows live report.
5. Another agent pays **0.3 USDC** via x402 → gets full campaign assets + report.
6. Show live **GOAT dashboard** + **ERC-8004 registry entry**.

**Why it wins:** Fully functional in <4 hours using pre-built ClawHub skills. Real economic autonomy on Bitcoin L2.

---

## 🛠️ Tech Stack (Exact Event Requirements)

| Layer              | Technology                          | Purpose |
|--------------------|-------------------------------------|---------|
| **Agent Runtime**  | OpenClaw + ClawHub skills           | Brain + 5,400+ pre-built tools |
| **Deployment**     | ClawUp (one-click edge hosting)     | Production in <60s |
| **Payments**       | x402 (Coinbase standard)            | Micropayments (USDC on GOAT) |
| **Identity**       | ERC-8004 (Non-Fungible Agents)      | On-chain discoverable ID + reputation |
| **Settlement**     | GOAT Network Testnet 3 (Bitcoin L2) | BTC-native yield & autonomous earning/spending |
| **Ad Platforms**   | adwhiz + ads-manager-agent skills   | Google + Meta automation |
| **Analytics**      | GA4 Measurement Protocol + cron     | Real page events & conversions |
| **Interface**      | Telegram / Web (built-in)           | Chat + HTTP/MCP endpoints |

All tools are **pre-installed via ClawHub** — no API key hell for core demo.

---

## ✨ Key Features

### 1. Campaign Planner
- Input: product, budget, target audience, goal
- Output: channels, budget split, timeline, expected ROAS, ad groups

### 2. Creative Requester (Proactive)
- Agent messages you: “Send me a creative description + target keywords for the hero ad”
- Uses your input + built-in copywriting skill to generate 5 variants

### 3. Ad Creation & Launch
- Auto-creates Google Ads campaigns, ad groups, keywords, responsive search ads
- Auto-creates Meta Ads (image + copy)
- Uses `adwhiz` and `ads-manager-agent` ClawHub skills

### 4. Page Event & Conversion Monitoring
- Tracks every event via GA4 Measurement Protocol
- Supports: `page_view`, `add_to_cart`, `begin_checkout`, `purchase`
- Real-time dashboard in chat + hourly cron reports

### 5. Performance Monitoring & Optimization
- Calculates ROAS, CPA, CTR
- Proactive alerts: “CTR dropped 15% — suggest new creative”
- Auto-optimization suggestions

### 6. x402 Paywall (GOAT Track)
- Endpoints `/campaign-plan` and `/create-ad` require 0.3 USDC micropayment
- Agents discover & pay autonomously

### 7. ERC-8004 Identity
- Portable NFT agent card with services, payment address, x402 flag
- Discoverable by other agents on GOAT registry

---

## 📁 Project Structure (Copy-Paste Ready)

```
AdClaw/
├── workspace/
│   ├── skills/
│   │   ├── campaign-planner/          # Custom skill
│   │   ├── ga4-tracker/               # Custom skill
│   │   └── x402-paywall/              # Middleware wrapper
│   ├── system-prompt.md               # Main agent instructions
│   └── agent-card.json                # For ERC-8004
├── .openclaw/                         # Auto-generated
├── deploy.sh                          # ClawUp one-click
└── README.md                          # This file
```

---

## 🚀 Setup & Installation (15 mins)

### Step 1: Install OpenClaw (Venue or Local)
```bash
curl -fsSL https://get.openclaw.ai | bash
openclaw start
```

### Step 2: Install Pre-Built Skills
```bash
clawhub install adwhiz ads-manager-agent marketing-skills copywriting browser ga4
```

### Step 3: Add Custom Skills
Copy the two custom skill folders below into `~/.openclaw/workspace/skills/`

### Step 4: Deploy on ClawUp
```bash
clawup deploy --name AdClaw --plan pro-trial
```
→ Get live URL in <60 seconds.

### Step 5: GOAT Onboarding
1. Go to `goat-hackathon-2026.vercel.app`
2. Use `t.me/goathackbot` for test USDC + wallet
3. Register ERC-8004 identity (upload `agent-card.json` to Pinata/IPFS)

---

## 📋 Custom Skill Code (Ready to Copy)

### Skill 1: `campaign-planner` (SYSTEM PROMPT)
```markdown
# Campaign Planner + Creative Requester
You are AdClaw, autonomous digital marketing agent.

Rules:
1. Always ask for creative description if missing.
2. Use adwhiz and ads-manager-agent tools to create real campaigns.
3. After launch, call send_ga4_event for demo conversions.
4. For paid requests, only respond after x402 confirmation.
```

### Skill 2: `ga4-tracker` (TypeScript Tool)
```ts
// skills/ga4-tracker/SKILL.md
tools:
  - name: send_ga4_event
    description: "Track any page event or conversion"
    parameters:
      event_name: { type: "string", enum: ["page_view", "add_to_cart", "purchase"] }
      value: { type: "number" }
    execute: async ({ event_name, value }) => {
      const measurement_id = process.env.GA4_ID || "G-TEST123";
      await fetch(`https://www.google-analytics.com/mp/collect?measurement_id=${measurement_id}`, {
        method: "POST",
        body: JSON.stringify({
          client_id: "demo-client-123",
          events: [{ name: event_name, params: { value: value || 0 } }]
        })
      });
      return `✅ Tracked ${event_name} (value $${value}) — visible in GA4`;
    }
```

### Skill 3: x402 Paywall (Express Middleware)
Use official Coinbase x402 middleware (already in hackathon starter repo):
```ts
import { paymentMiddleware } from "@x402/express";

app.use(paymentMiddleware({
  "POST /campaign-plan": { price: "0.3 USDC", chain: "goat-testnet3" },
  "POST /create-ad": { price: "0.2 USDC", chain: "goat-testnet3" }
}));
```

---

## 🔗 ERC-8004 Agent Card (agent-card.json)

```json
{
  "name": "AdClaw - Autonomous Digital Marketer",
  "description": "Plans full campaigns, requests creatives, launches Google/Meta ads, tracks every page event & conversion in real-time, monitors performance. Pay-per-use via x402 on GOAT.",
  "image": "ipfs://QmYourImageHashHere",
  "services": [
    {
      "endpoint": "/campaign-plan",
      "description": "Complete campaign strategy + ad creation",
      "price": "0.3 USDC",
      "x402": true
    },
    {
      "endpoint": "/create-ad",
      "description": "Launch ads from creative description",
      "price": "0.2 USDC",
      "x402": true
    }
  ],
  "paymentAddress": "0xYourGOATTestnetWalletHere",
  "chain": "goat-testnet3",
  "version": "1.0"
}
```

Upload to Pinata → paste hash on dashboard.

---

## 📊 Demo Script (Copy for 5:45 PM Demos)

1. Open Telegram → talk to your live ClawUp agent
2. Run campaign plan prompt
3. Provide creative description when asked
4. Watch ads get created + events tracked
5. Simulate payment from second wallet (show x402 flow)
6. Show GOAT dashboard live payments + ERC-8004 entry

---

## 📈 Future Roadmap (Post-Hack)

- Real Meta/Google OAuth (add skill)
- Multi-agent marketplace (agents hiring AdClaw)
- Bitcoin yield auto-reinvestment
- TEE privacy mode
- Revenue share with GOAT ecosystem fund

---

## 🏆 Why This Wins the Mac Mini

- Uses **every** required tech: OpenClaw + ClawUp + x402 + ERC-8004 + GOAT
- Fully functional in 4 hours
- Real business use-case (agencies will pay)
- Live payments + on-chain identity shown in demo
- Built with pre-built skills → zero boilerplate

---


