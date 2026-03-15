# AdClaw — Pitch Deck (10 Slides)

---

## Slide 1: Title

**AdClaw**
Your 24/7 Autonomous Marketing Agency

*Pay with crypto. Get a campaign. No humans needed.*

GOAT Track | OpenClaw Hack 2026 | Solo Build

---

## Slide 2: The Problem

Every small business needs marketing.

- Agencies cost $2,000–$20,000/month
- Freelancers take days to deliver
- DIY tools still need a human at the wheel
- No one works at 3 AM

---

## Slide 3: The Solution

AdClaw is an **AI agent** that IS the agency.

Describe your business → Pay 0.10 USDC → Get:
- Complete campaign strategy
- Live landing page (real URL)
- Event page with RSVP
- Ad copy for Google + Meta
- Real-time analytics

All in under 30 seconds.

---

## Slide 4: Live Demo

1. Type: *"Coffee shop in Chennai, 50k budget, 18-35 foodies"*
2. Pay **0.30 USDC** on GOAT Testnet3
3. AI generates full campaign
4. Landing page goes live instantly
5. Every click tracked in real-time

**Try it:** `[ngrok URL]/x402-demo/`

---

## Slide 5: How It Works

```
User Prompt → x402 Payment (USDC) → AI Generation → Deployed Assets
                    ↓                      ↓               ↓
             GOAT Testnet3           GPT-4o / OpenClaw   Live URLs
                    ↓                                      ↓
             On-chain proof                          tracker.js
                                                          ↓
                                                    Analytics Dashboard
```

---

## Slide 6: GOAT Track Integration

**x402 Payments**
- HTTP 402 on all endpoints
- Real USDC transfers on GOAT Testnet3
- 3 live transactions on explorer

**ERC-8004 Identity**
- Agent #256 registered on-chain
- Discoverable on GOAT Dashboard
- Services + pricing in agent card

**Testnet3**
- Chain 48816 | 3 confirmed TXs
- USDC contract: `0x29d1...fa1`

---

## Slide 7: Tech Stack

| Layer | Tech |
|-------|------|
| Agent | OpenClaw + 6 custom skills |
| AI | GPT-4o-mini (+ OpenClaw optional) |
| Server | Express.js + TypeScript |
| Payments | GOAT x402 SDK + USDC |
| Identity | ERC-8004 on GOAT Testnet3 |
| Analytics | Custom tracker.js + JSONL |
| Dashboard | Vanilla JS, CSS-only charts |
| Deploy | Docker Compose + ngrok |

---

## Slide 8: What Makes This Different

| Other hackathon projects | AdClaw |
|---|---|
| Chatbot that answers questions | Agent that **builds things** |
| Mock data | **Real** USDC payments on-chain |
| Slides about what it could do | **Live URLs** judges can open |
| Needs API keys to demo | Works end-to-end right now |

---

## Slide 9: Business Model

```
/api/campaign       →  0.10 USDC
/api/landing-page   →  0.30 USDC
/api/event-page     →  0.20 USDC
/api/report         →  0.05 USDC
```

- Agent-to-agent commerce via x402
- No accounts, no subscriptions, no invoices
- Pay per use. Instant delivery. On-chain receipt.

---

## Slide 10: Thank You

**AdClaw** — One agent. Zero employees. Infinite campaigns.

- GitHub: `github.com/udhaykumarbala/adclaw`
- Live: `[ngrok URL]/x402-demo/`
- Agent #256 on GOAT Testnet3
- Built solo in one afternoon

---
---

# Speaker Notes

## Slide 1
> "Hi, I'm Udhay. I built AdClaw — an AI agent that works harder than any marketing intern, never takes a coffee break, and actually *gets paid* in crypto. Let's just say it has a better work ethic than my last agency."

## Slide 2
> "Small businesses have two options: spend thousands on an agency, or spend hours figuring out Meta Ads Manager — which, let's be honest, is designed to confuse you into spending more. What if your marketing team was an AI that never sleeps, never bills hourly, and never asks for a standing desk?"

## Slide 3
> "AdClaw doesn't just *plan* campaigns — it *builds* them. Landing pages, event pages, ad copy — all deployed at live URLs. It's like hiring a full marketing team, except this one accepts USDC and doesn't need a Slack channel."

## Slide 4
> "Let me show you the magic. I type a description, I pay 30 cents in USDC on GOAT Testnet, and... boom — a full campaign with a live landing page. No templates. No drag-and-drop. Just AI and vibes. Actually, AI and *on-chain receipts* — much better than vibes."

## Slide 5
> "The architecture is simple: your money goes in, marketing comes out. The middle part? That's just x402 payments, GPT-4o, and a tracker.js that watches everything like a helicopter parent. Every click, every scroll — AdClaw sees it all. GDPR lawyers, please look away."

## Slide 6
> "For the GOAT track — we're not just *talking* about x402, we're *spending* USDC with it. Agent #256 is registered on-chain via ERC-8004. You can look it up on the explorer right now. It's the only marketing agent on GOAT Testnet with a better on-chain reputation than most DeFi protocols. Granted, the bar was low."

## Slide 7
> "Tech stack: Express for speed, OpenClaw for brains, GOAT for payments, and pure CSS for charts because apparently I enjoy suffering. No Chart.js was harmed in the making of this dashboard. Also no React — this dashboard loads faster than you can say 'npm install'."

## Slide 8
> "Most hackathon projects demo a chatbot that answers 'what is Bitcoin.' AdClaw generates a full landing page, deploys it at a real URL, and tracks when you click the CTA button. Go ahead, open it on your phone. I'll wait. The tracker already knows you're here."

## Slide 9
> "The business model is beautifully simple: you pay, you get marketing. No subscriptions, no 'enterprise plan,' no 'let's schedule a call.' Just USDC in, campaign out. It's like a vending machine, except instead of chips, you get a complete digital marketing strategy. And the vending machine has an on-chain identity."

## Slide 10
> "One person, one afternoon, one agent that does the work of an entire agency. If you need me, I'll be in the corner watching my agent earn USDC while I eat the free food. Thank you!"
