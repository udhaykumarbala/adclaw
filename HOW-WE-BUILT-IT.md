# How We Built AdClaw

> A deep dive into the architecture, tech decisions, and integration of every component.

---

## System Architecture

```mermaid
graph TB
    subgraph User Layer
        TG[Telegram Bot]
        WEB[x402 Demo Page]
        DASH[Analytics Dashboard]
    end

    subgraph AdClaw Server - Express.js
        API[REST API]
        X402[x402 Payment Gate]
        TRACK[Tracker Engine]
        GEN[AI Campaign Generator]
    end

    subgraph OpenClaw Agent
        AGENT[Agent Runtime]
        SKILLS[6 Custom Skills]
        MEMORY[Memory System]
        CRON[Cron Scheduler]
    end

    subgraph GOAT Network - Bitcoin L2
        USDC[USDC Token]
        ERC[ERC-8004 Registry]
        RPC[Testnet3 RPC]
    end

    subgraph AI Providers
        OAI[OpenAI GPT-4o]
        OCL[OpenClaw Gateway]
    end

    TG -->|Chat| AGENT
    WEB -->|HTTP| API
    DASH -->|Poll| API

    AGENT -->|exec/curl| API
    API --> X402
    API --> TRACK
    API --> GEN

    GEN -->|Primary| OAI
    GEN -->|Optional| OCL
    OCL --> AGENT

    X402 -->|Verify Payment| USDC
    ERC -->|Agent #256| RPC
    USDC -->|Chain 48816| RPC

    TRACK -->|events.jsonl| API
    CRON -->|Hourly| AGENT

    style X402 fill:#e74c3c,color:#fff
    style ERC fill:#00b894,color:#fff
    style USDC fill:#f39c12,color:#fff
    style GEN fill:#6c5ce7,color:#fff
```

---

## Request Flow: x402 Payment → AI Campaign

```mermaid
sequenceDiagram
    participant Client
    participant Server as AdClaw Server
    participant GOAT as GOAT Testnet3
    participant AI as OpenAI / OpenClaw
    participant Pages as Landing Pages

    Client->>Server: GET /api/campaign
    Server->>Client: 402 Payment Required (0.10 USDC)

    Client->>GOAT: Transfer 0.10 USDC to AdClaw wallet
    GOAT-->>Client: TX confirmed (block #12020680)

    Client->>Server: POST /api/x402/demo/pay
    Server->>GOAT: ERC-20 transfer
    GOAT-->>Server: TX hash + receipt

    Client->>Server: POST /api/x402/demo/generate {description}
    Server->>AI: Generate campaign plan
    AI-->>Server: JSON campaign plan

    Server->>Pages: Write HTML to /public/sites/
    Server-->>Client: Campaign plan + live URL

    Note over Client,Pages: Client opens landing page
    Pages->>Server: tracker.js fires page_view
    Server->>Server: Append to events.jsonl
```

---

## Component Breakdown

### 1. Express.js Server (Port 3402)

The core API server handling all HTTP requests.

```mermaid
graph LR
    subgraph Routes
        R1[/api/campaign]
        R2[/api/landing]
        R3[/api/event]
        R4[/api/track]
        R5[/api/report]
        R6[/api/x402/demo]
        R7[/api/x402/webhook]
    end

    subgraph Middleware
        CORS[CORS]
        COMP[Compression]
        AUTH[Internal Auth]
        PAY[x402 Gate]
    end

    subgraph Static
        S1[/sites/*.html]
        S2[/events/*.html]
        S3[/dashboard/]
        S4[/x402-demo/]
        S5[/tracker.js]
    end

    REQ[Request] --> CORS --> COMP --> AUTH --> PAY --> Routes
    REQ --> Static
```

**Why Express.js?**
- Lightweight, zero-config, starts in <1 second
- Static file serving built-in (no nginx needed)
- TypeScript for type safety across all routes
- Compression middleware for smaller payloads over ngrok

**Key design decisions:**
- **JSONL for events** — append-only writes, no race conditions under concurrent tracking requests
- **Atomic JSON writes for campaigns** — write to `.tmp` then `fs.renameSync` to prevent corruption
- **HTML escaping on all injected values** — prevents stored XSS via campaignId in tracker script tags
- **Global error handler** — no unhandled exception crashes the server during demo

---

### 2. x402 Payment Gate

```mermaid
graph TD
    REQ[Incoming Request] --> CHECK{Has x-internal-agent header?}
    CHECK -->|Yes, matches secret| PASS[Allow Through - 200]
    CHECK -->|No| PRICE{Route in pricing table?}
    PRICE -->|No| PASS
    PRICE -->|Yes| SDK{GOAT x402 SDK available?}
    SDK -->|Yes| ORDER[Create Order via SDK]
    SDK -->|No| STATIC[Static 402 Response]
    ORDER -->|Success| DYNAMIC[402 with Order ID]
    ORDER -->|Fail| STATIC
    DYNAMIC --> CLIENT[Client Pays USDC]
    CLIENT --> RETRY[Retry with X-Order-Id]
    RETRY --> VERIFY[Verify Order Status]
    VERIFY -->|Confirmed| PASS
```

**Pricing table:**

| Endpoint | Price | USDC Wei |
|----------|-------|----------|
| `/api/campaign` | 0.10 USDC | 100,000 |
| `/api/landing` | 0.30 USDC | 300,000 |
| `/api/event` | 0.20 USDC | 200,000 |
| `/api/report` | 0.05 USDC | 50,000 |

**Why this design?**
- Internal agent bypasses payment via shared secret — the agent shouldn't pay itself
- Fallback chain: SDK → static 402 — demo works even when GOAT API is unreachable
- GOAT x402 SDK is ESM-only; loaded via dynamic `import()` to work with our CommonJS build

---

### 3. ERC-8004 On-Chain Identity

```mermaid
graph LR
    subgraph Registration
        CARD[agent-card.json] -->|Host on GitHub| URI[Raw GitHub URL]
        URI --> CONTRACT[IdentityRegistry.register]
        CONTRACT -->|TX 0x960cc5...| CHAIN[GOAT Testnet3]
        CHAIN --> ID[Agent #256]
    end

    subgraph Discovery
        OTHER[Other Agents] -->|Query Registry| CONTRACT
        CONTRACT -->|Return URI| OTHER
        OTHER -->|Fetch| CARD
        OTHER -->|See services + pricing| PAY[Pay via x402]
    end
```

**Contract:** `0x556089008Fc0a60cD09390Eca93477ca254A5522` (Testnet3)

**Agent Card structure:**
```json
{
  "name": "AdClaw — Autonomous Marketing Agency",
  "x402Support": true,
  "services": [
    { "name": "campaign-plan", "endpoint": "/api/campaign" },
    { "name": "landing-page", "endpoint": "/api/landing" },
    { "name": "event-page", "endpoint": "/api/event" },
    { "name": "analytics-report", "endpoint": "/api/report" }
  ],
  "registrations": [{ "agentId": "256" }]
}
```

**Technical notes:**
- ethers.js v6 with bracket notation `registry['register(string)']` to disambiguate overloaded functions
- Agent URI updated on-chain via `setAgentURI` after GitHub push
- Two confirmed TXs: registration + URI update

---

### 4. Landing Page Generator

```mermaid
graph TD
    PROMPT[User Description] --> AI[AI generates Tailwind HTML]
    AI --> JSON[Write JSON to /tmp/]
    JSON --> CURL[curl -d @file to /api/landing]
    CURL --> VALIDATE[Validate slug + size < 500KB]
    VALIDATE --> ESCAPE[HTML-escape campaignId]
    ESCAPE --> INJECT[Auto-inject tracker.js]
    INJECT --> WRITE[Write to /public/sites/slug.html]
    WRITE --> SERVE[Live at PUBLIC_URL/sites/slug.html]

    SERVE --> VISIT[Visitor opens page]
    VISIT --> TRACKER[tracker.js fires]
    TRACKER --> EVENTS[page_view, cta_click, scroll_25/50/75, form_submit]
    EVENTS --> JSONL[Append to events.jsonl]
```

**Why file-based deployment (not inline curl)?**
- HTML in curl `-d` argument breaks on quotes, backticks, `$(...)` patterns
- File-based: agent writes JSON to `/tmp/`, then `curl -d @file` — zero escaping issues
- This was the #1 risk identified in code review and fixed before build

---

### 5. Analytics Tracking

```mermaid
graph LR
    subgraph tracker.js - Embedded in every page
        PV[page_view - auto]
        CTA[cta_click - data-track attr]
        SCROLL[scroll_25/50/75/100 - throttled RAF]
        FORM[form_submit / rsvp]
    end

    subgraph Server
        POST[POST /api/track]
        PIXEL[GET /api/track - 1x1 GIF]
        APPEND[appendFileSync - JSONL]
        GA4[Forward to GA4 - optional]
    end

    subgraph Report
        READ[Read events.jsonl]
        CALC[Compute: CTR, bounce rate, revenue]
        RESP[JSON response]
    end

    PV --> POST
    CTA --> POST
    SCROLL --> POST
    FORM --> POST
    POST --> APPEND
    APPEND --> GA4
    READ --> CALC --> RESP
```

**Key design decisions:**
- **Append-only JSONL** — no read-modify-write race conditions
- **Server-side timestamps** — client timestamps can't be trusted
- **`requestAnimationFrame` throttle on scroll** — prevents 60 events/sec
- **`localStorage` in try/catch** — Safari private browsing throws on access
- **Division-by-zero guard** — when content fits viewport, `scrollable <= 0`

---

### 6. OpenClaw Agent Skills

```mermaid
graph TD
    MSG[User Message via Telegram] --> AGENT[OpenClaw Agent]
    AGENT --> AGENTS[AGENTS.md - Master Instructions]

    AGENTS --> S1[campaign-planner]
    AGENTS --> S2[landing-builder]
    AGENTS --> S3[event-creator]
    AGENTS --> S4[ad-copywriter]
    AGENTS --> S5[analytics-monitor]
    AGENTS --> S6[adclaw-api]

    S1 -->|Strategy| S6
    S2 -->|Deploy page| S6
    S3 -->|Deploy event| S6
    S5 -->|Fetch report| S6

    S6 -->|curl with internal secret| API[AdClaw Server]

    style S6 fill:#6c5ce7,color:#fff
```

**6 skills, each a `SKILL.md` file:**

| Skill | Purpose | Uses exec? |
|-------|---------|-----------|
| `campaign-planner` | Strategy, budget, KPIs, timeline | No (pure LLM) |
| `landing-builder` | Generate HTML, deploy via API | Yes (file write + curl) |
| `event-creator` | Event page with RSVP | Yes (file write + curl) |
| `ad-copywriter` | Google + Meta ad copy with char limits | No (pure LLM) |
| `analytics-monitor` | Read reports, suggest optimizations | Yes (curl) |
| `adclaw-api` | API reference with examples | No (reference only) |

---

### 7. AI Generation (Dual Backend)

```mermaid
graph TD
    REQ[Generate Request] --> CHECK{OPENCLAW_URL configured?}
    CHECK -->|Yes + backend=openclaw| OC[OpenClaw Gateway]
    CHECK -->|No or default| OAI[OpenAI GPT-4o-mini]

    OC -->|POST /v1/chat/completions| AGENT[Agent with Skills]
    OC -->|Fails| OAI

    OAI -->|Success| PARSE[Parse JSON from response]
    OAI -->|Fails| FALLBACK[Static Template]

    AGENT -->|Success| PARSE
    PARSE --> RESULT[Campaign Plan JSON]
    FALLBACK --> RESULT
```

**Why dual backend?**
- **OpenAI** (default): works instantly, no Docker needed, GPT-4o-mini is fast + cheap
- **OpenClaw** (optional): shows the full agent pipeline for the hackathon — request goes through the agent runtime with all 6 skills loaded
- **Fallback**: if both fail, returns a structured template — demo never breaks

---

### 8. Docker Compose Architecture

```mermaid
graph TB
    subgraph Docker Network: adclaw-net
        GW[openclaw-gateway :18789]
        CLI[openclaw-cli]
        SRV[adclaw-server :3402]
    end

    subgraph Volumes
        V1[./openclaw/config → /home/node/.openclaw]
        V2[./openclaw/workspace → skills + AGENTS.md]
        V3[./server/public → generated pages]
        V4[./server/data → analytics JSONL]
    end

    subgraph External
        NGROK[ngrok tunnel :3402]
        GOAT[GOAT Testnet3]
        OPENAI[OpenAI API]
    end

    GW -->|OpenAI-compat API| SRV
    CLI -->|shares network| GW
    SRV --> NGROK
    SRV --> GOAT
    SRV --> OPENAI
    GW --> OPENAI

    GW --- V1
    GW --- V2
    SRV --- V3
    SRV --- V4
```

**Three services:**
1. `openclaw-gateway` — AI agent runtime with Telegram, cron, skills
2. `openclaw-cli` — onboarding & management (runs on demand)
3. `adclaw-server` — Express API, pages, tracking, payments, dashboard

---

## On-Chain Transactions

```mermaid
timeline
    title AdClaw on GOAT Testnet3 (Chain 48816)
    ERC-8004 Registration : TX 0x960cc5... : Agent #256 created : Block 12019974
    URI Update : TX 0xb5d722... : Agent card linked : Block 12020201
    USDC Payment : TX 0x2166b2... : 0.30 USDC received : Block 12020680
```

| TX | Purpose | Hash |
|----|---------|------|
| Agent Registration | ERC-8004 identity created | `0x960cc533b164ff451306bb07b5f5edba92b95a2a8854809f0ac09cd656605e6c` |
| URI Update | Link agent card JSON | `0xb5d722d0ddc866175928df3b6d310a7e3344aa5c6352db36a24f448ca4947dc3` |
| USDC Payment | Real x402 payment (0.30 USDC) | `0x2166b255876d2ab2f79292d6f04432f6380834c732d80abc18f73d59bccd7206` |

---

## Security Measures

| Threat | Mitigation |
|--------|-----------|
| XSS via campaignId in HTML | `escapeAttr()` on all injected values |
| Path traversal via slug | `sanitizeSlug()` strips everything except `a-z0-9-` |
| HTML bomb (huge payload) | 500KB size limit on POST |
| Race conditions on write | JSONL append-only for events, atomic rename for campaigns |
| Agent paying its own x402 | `x-internal-agent` header bypass |
| Server crash during demo | Global error handler + try/catch on every route |
| Scroll event spam | `requestAnimationFrame` throttle in tracker.js |
| localStorage errors | try/catch wrapper for Safari private browsing |

---

## Tech Stack Summary

```mermaid
pie title Lines of Code by Component
    "Express Server (TypeScript)" : 450
    "OpenClaw Skills (Markdown)" : 350
    "Dashboard (HTML/CSS/JS)" : 2437
    "x402 Demo Page" : 420
    "Tracker.js" : 70
    "Scripts" : 200
    "Config & Docker" : 150
```

| Technology | Why We Chose It |
|-----------|----------------|
| **TypeScript** | Type safety across routes, catches bugs at build time |
| **Express.js** | Lightweight, no boilerplate, serves static files natively |
| **ethers.js v6** | Best Ethereum library for contract interaction |
| **GOAT x402 SDK** | Official SDK for payment order creation |
| **OpenAI GPT-4o-mini** | Fast, cheap, good at structured JSON output |
| **Tailwind CSS (CDN)** | Zero build step for generated pages |
| **Vanilla JS** | Dashboard loads in <100ms, no framework overhead |
| **JSONL** | Append-only, concurrent-safe, no database needed |
| **Docker Compose** | Two services orchestrated with health checks |
| **ngrok** | Instant public URL for demo |

---

*Built solo at OpenClaw Hack 2026, Chennai. Agent #256 on GOAT Testnet3.*
