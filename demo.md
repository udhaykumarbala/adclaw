# AdClaw — 3-Minute Demo Plan

## The Problem with Live AI Demos

- LLM responses take 10-30 seconds
- OpenClaw + Telegram pairing could fail on venue WiFi
- The full agent flow (plan → build → deploy → track) takes 3+ minutes alone
- One failure during live demo = game over

## The Strategy: Pre-Warm + Live Proof + Safety Net

**Before stage:** Everything is already running, seeded, and warm.
**On stage:** Show results, do ONE fast live action, show blockchain proofs.
**Safety net:** If anything fails live, pre-built assets carry the demo.

---

## Pre-Demo Setup (Do 30 Minutes Before)

### Checklist

```
[ ] Server running on laptop (npm start in server/)
[ ] ngrok tunnel active → public URL
[ ] .env has ADCLAW_PUBLIC_URL set to ngrok URL
[ ] Seed script run → 200+ events in analytics
[ ] Demo landing page deployed (see demo.sh)
[ ] Demo event page deployed (see demo.sh)
[ ] Dashboard open in browser tab (localhost:3402/dashboard)
[ ] Landing page open in another tab
[ ] Terminal open with curl commands ready to paste
[ ] Phone has the landing page QR code ready to show judges
[ ] ERC-8004 registration done → tx hash saved
[ ] GOAT explorer tab open showing the tx
[ ] Telegram bot connected (if OpenClaw is running)
[ ] demo.sh has been run once end-to-end
```

### Run This Before Going on Stage

```bash
cd /path/to/adclaw
./scripts/demo.sh setup    # Seeds data, deploys pages, verifies everything
```

---

## The 3-Minute Script

### 0:00–0:20 — HOOK (talk, no screen)

> "Every small business needs marketing. But agencies cost thousands and take weeks. What if your entire marketing agency was an AI agent — that builds landing pages in seconds, tracks every click, and gets paid in crypto on Bitcoin L2?"

### 0:20–0:50 — DASHBOARD (switch to screen)

Show the dashboard (already loaded):

> "This is AdClaw's live dashboard. It's already managing a campaign for a Chennai coffee shop."

Point to:
- **KPI cards** — "99 page views, 17 CTA clicks, 33% CTR"
- **Live green dot** — "This updates in real-time"
- **Event breakdown chart** — "Every visitor action is tracked"

### 0:50–1:20 — LANDING PAGE (the wow moment)

Switch to the landing page tab:

> "AdClaw built this landing page autonomously. No templates, no Figma — the AI generated the entire thing."

**On screen:** Beautiful Tailwind CSS coffee shop page with hero, benefits, CTA.

> "Let me click this CTA button..."

Click the **Reserve Your Spot** button.

Switch back to dashboard or terminal:

```bash
curl -s http://localhost:3402/api/report/CAMPAIGN_ID | python3 -m json.tool
```

> "See? The click was tracked instantly. Every visitor, every action, real-time analytics."

### 1:20–1:50 — LIVE ACTION (fast, guaranteed to work)

In terminal:

> "Let me show you AdClaw working live. I'll ask it to generate a new report."

```bash
# This is fast — it's just reading data, no LLM needed
curl -s http://localhost:3402/api/report/CAMPAIGN_ID \
  -H "x-internal-agent: $INTERNAL_SECRET" | python3 -c "
import sys,json
d=json.load(sys.stdin)
r=d['report']
print(f'''
Campaign Report — Chennai Coffee Grand Opening
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Page Views:      {r['pageViews']}
Unique Visitors: {r['uniqueVisitors']}
CTA Clicks:      {r['ctaClicks']}
CTR:             {r['ctr']}%
Bounce Rate:     {r['bounceRate']}%
RSVPs:           {r['rsvps']}
Revenue:         ₹{r['revenue']}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
''')
"
```

> "Real data. Not mocked. The agent monitors this 24/7 and sends alerts when metrics drop."

### 1:50–2:20 — x402 PAYMENT (GOAT Track)

> "Other agents can discover and hire AdClaw. Here's what happens when they try to access a paid endpoint without paying:"

```bash
curl -s http://localhost:3402/api/campaign \
  | python3 -m json.tool | head -20
```

If x402 API is configured, this returns a 402 with payment details:

> "HTTP 402 — Payment Required. 0.10 USDC on GOAT Testnet3. The agent handles settlement on-chain. No API keys, no accounts — just pay and use."

*(If x402 fallback mode: show the PRICING constant from the code + the 402 JSON structure you prepared)*

### 2:20–2:45 — ERC-8004 IDENTITY (GOAT Track)

Switch to GOAT Explorer tab:

> "AdClaw has an on-chain identity via ERC-8004. Any agent can discover it, see its services, check its reputation."

Show the transaction on explorer. Show agent-card.json:

```bash
cat agent-card.json | python3 -m json.tool | head -15
```

> "Name, services, pricing, x402 support — all on-chain. This is the agent economy."

### 2:45–3:00 — CLOSE

> "AdClaw plans campaigns, builds landing pages, tracks every click, optimizes 24/7, and gets paid in USDC on Bitcoin L2. One builder, four hours, all on OpenClaw and GOAT Network. Thank you."

---

## Backup Plans

### If the server crashes
Pre-record a 30-second screen capture of the dashboard + landing page. Show that.

### If ngrok/WiFi fails
Everything works on localhost. Just use `http://localhost:3402`. Judges understand.

### If the landing page looks bad
Deploy the pre-built beautiful one (see `scripts/demo-landing.html`) before the demo.

### If the agent/Telegram doesn't respond
Skip the agent interaction. The server demo (dashboard + landing page + API + x402 + ERC-8004) is sufficient for all judging criteria.

### If ERC-8004 registration failed
Show the code + agent-card.json. Explain: "Registration happens at deploy time. Here's the on-chain identity format."

---

## What Judges Want to See (GOAT Track)

| Requirement | How We Show It | Backup |
|---|---|---|
| **OpenClaw agent** | Telegram bot + skills in workspace | Show AGENTS.md + SKILL.md files |
| **x402 payments** | 402 response with GOAT payment details | Show middleware code + pricing config |
| **ERC-8004 identity** | Live tx on GOAT Explorer | Show agent-card.json + registration script |
| **GOAT Testnet3** | Explorer showing chain ID 48816 | Show RPC URL and chain config |
| **Working demo** | Dashboard + landing page + real-time tracking | Pre-recorded backup |

---

## Demo Pacing Visualization

```
0:00                    1:00                    2:00                    3:00
|── HOOK ──|── DASHBOARD ──|── LANDING PAGE ──|── LIVE REPORT ──|── x402 ──|── ERC-8004 ──|── CLOSE ──|
   (talk)     (show stats)    (show + click)     (curl command)    (402 resp)  (explorer)     (1 line)
```

Key: never stay on one thing more than 30 seconds. Keep it moving.
