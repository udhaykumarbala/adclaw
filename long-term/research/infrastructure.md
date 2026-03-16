# OpenClaw Infrastructure Research for 24/7 Autonomous Operation on Mac Mini

> Research compiled from https://docs.openclaw.ai (March 2026)

---

## Table of Contents

1. [Daemon Setup on Mac Mini](#1-daemon-setup-on-mac-mini)
2. [Skill Architecture for Complex Workflows](#2-skill-architecture-for-complex-workflows)
3. [External Tools Integration](#3-external-tools-integration)
4. [Telegram Integration Deep Dive](#4-telegram-integration-deep-dive)
5. [Dashboard Architecture for Human-in-the-Loop](#5-dashboard-architecture-for-human-in-the-loop)

---

## 1. Daemon Setup on Mac Mini

### 1.1 launchd vs Docker

OpenClaw offers two primary deployment modes for persistent operation:

#### Option A: Native launchd (Recommended for Mac Mini)

OpenClaw installs as a per-user LaunchAgent labeled `ai.openclaw.gateway` (or `ai.openclaw.<profile>` for named profiles).

**Installation:**
```bash
# Install via npm
npm install -g openclaw

# Run setup wizard (installs daemon automatically)
openclaw setup

# Or manually install the daemon service
openclaw gateway install --port 18789
```

**Service control:**
```bash
# Start/stop/restart
openclaw gateway start
openclaw gateway stop
openclaw gateway restart

# Check status with health probe
openclaw gateway status --deep

# Direct launchctl commands
launchctl kickstart -k gui/$UID/ai.openclaw.gateway    # force restart
launchctl bootout gui/$UID/ai.openclaw.gateway          # stop
```

**Advantages for Mac Mini:**
- Native macOS integration with TCC permissions (Accessibility, Screen Recording, Microphone, etc.)
- Direct access to AppleScript, camera, and system tools via node interface
- Lower resource overhead than Docker
- Access to the full macOS tool surface (Canvas, Camera, Screen Recording, `system.run`)

#### Option B: Docker

**Quick start:**
```bash
./docker-setup.sh   # builds image, runs wizard, starts via Docker Compose
```

**Image:** `ghcr.io/openclaw/openclaw` (tags: `main`, `latest`, `v2026.x.x`), based on `node:24-bookworm`.

**Key environment variables:**
- `OPENCLAW_IMAGE` -- use pre-built image
- `OPENCLAW_SANDBOX=1` -- enable agent sandboxing
- `OPENCLAW_HOME_VOLUME` -- persist `/home/node` across container replacements
- `OPENCLAW_EXTRA_MOUNTS` -- add host bind mounts

**Volumes (persistent):**
- `OPENCLAW_CONFIG_DIR` -> `/home/node/.openclaw`
- `OPENCLAW_WORKSPACE_DIR` -> `/home/node/.openclaw/workspace`

**Sandbox images available:**
- `openclaw-sandbox:bookworm-slim` (default)
- `openclaw-sandbox-common:bookworm-slim` (Node, Go, Rust)
- `openclaw-sandbox-browser:bookworm-slim` (browser automation)

**Disadvantages for Mac Mini:**
- Cannot access macOS TCC permissions (Accessibility, Screen Recording, etc.)
- Browser automation runs inside container, no access to host Chrome sessions
- Additional resource overhead from Docker runtime

#### Verdict

**Use native launchd** for a Mac Mini deployment focused on marketing automation. It provides full access to macOS capabilities (browser with logged-in sessions, AppleScript, screen capture) that are critical for browser-based ad platform monitoring.

### 1.2 Memory Management for Long-Running Agents

OpenClaw has built-in mechanisms for managing memory in long-running scenarios:

**Session compaction:**
- Auto-compaction triggers when a session nears the model's context window limit
- Summarizes older conversation into a compact summary, keeps recent messages intact
- Before compaction, a silent memory flush turn stores durable notes to disk
- Can use a cheaper/different model for compaction via `agents.defaults.compaction.model`

**Session pruning:**
- Configurable session retention: prune entries older than `30d` (default)
- Cap to `500` entries max
- Rotate `sessions.json` at `10mb`
- Disk budget enforcement via `maxDiskBytes`

**Process memory (Node.js):**
- Background process sessions exist only in memory and don't persist across restarts
- Background exec outputs have configurable caps and TTLs

**Recommended configuration for 24/7 operation:**
```json
{
  "agents": {
    "defaults": {
      "session": {
        "maintenance": {
          "pruneAfter": "14d",
          "maxEntries": 300,
          "maxStoreSize": "5mb",
          "maxDiskBytes": "500mb"
        }
      },
      "compaction": {
        "model": "anthropic/claude-sonnet-4-20250514"
      }
    }
  }
}
```

### 1.3 Log Rotation and Storage Management

**Log storage:** `/tmp/openclaw/` with daily rotation (`openclaw-YYYY-MM-DD.log`).

**Configuration (`~/.openclaw/openclaw.json`):**
```json
{
  "logging": {
    "file": "/tmp/openclaw/openclaw.log",
    "level": "info",
    "consoleLevel": "info",
    "consoleStyle": "compact",
    "redactSensitive": "tools"
  }
}
```

**Key details:**
- File logs use JSON format (one object per line), ideal for log aggregation
- `logging.level` controls file verbosity; `--verbose` only affects console
- Sensitive data redaction: tokens 18+ chars show first 6 + last 4 chars
- Custom `logging.redactPatterns` for regex-based masking

**Disk growth hotspots to monitor:**
- `media/` -- received media files
- `~/.openclaw/agents/<agentId>/sessions/` -- session transcripts (JSONL)
- `~/.openclaw/cron/runs/*.jsonl` -- cron job run history
- `/tmp/openclaw/` -- rolling file logs

**Recommended: Add a cron cleanup script on the Mac Mini:**
```bash
# /usr/local/bin/openclaw-cleanup.sh
# Run weekly via macOS cron or launchd
find /tmp/openclaw/ -name "*.log" -mtime +7 -delete
find ~/.openclaw/cron/runs/ -name "*.jsonl" -mtime +30 -delete
```

### 1.4 Auto-Restart on Crash

**launchd auto-restart:** The LaunchAgent plist inherently supports `KeepAlive`, meaning launchd will automatically restart the gateway if it crashes.

**Docker auto-restart:**
```yaml
# docker-compose.yml
services:
  openclaw-gateway:
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:18789/healthz"]
      interval: 30s
      timeout: 10s
      retries: 3
```

**Built-in health checks:**
- `/healthz` (or `/health`) -- shallow liveness check (unauthenticated)
- `/readyz` (or `/ready`) -- readiness including channel connectivity (unauthenticated)
- Deep health snapshot: `openclaw health --json` (authenticated, WebSocket)

**Channel-level auto-recovery:**
- `gateway.channelHealthCheckMinutes`: 5 (default) -- frequency of per-channel health checks
- `gateway.channelStaleEventThresholdMinutes`: 30 -- idle time before restart
- `gateway.channelMaxRestartsPerHour`: 10 -- rolling restart cap per channel/account

### 1.5 Monitoring Agent Health

**CLI monitoring:**
```bash
openclaw status              # local summary: reachability, update hint, auth age
openclaw status --all        # comprehensive diagnosis with color output
openclaw status --deep       # includes per-channel Gateway probes
openclaw health --json       # full health snapshot (JSON)
```

**In-chat monitoring:**
- Send `/status` in any connected channel (WhatsApp, Telegram, etc.) for a health check without invoking the agent

**Log monitoring:** Filter logs for: `web-heartbeat`, `web-reconnect`, `web-auto-reply`, `web-inbound`

**Recommended monitoring stack for Mac Mini:**
1. Use the heartbeat system to self-monitor (agent checks its own health)
2. Set up a cron job that POSTs health status to Telegram every hour
3. Use `openclaw doctor` for periodic diagnostics
4. Monitor the `/healthz` endpoint externally (e.g., UptimeRobot hitting a Tailscale URL)

---

## 2. Skill Architecture for Complex Workflows

### 2.1 How Skills Work

Skills are AgentSkills-compatible tool folders that teach agents how to use tools. Each skill is a directory containing a `SKILL.md` file with YAML frontmatter and Markdown instructions.

**Skill locations (by precedence, highest first):**
1. Workspace skills: `<workspace>/skills/` -- highest priority
2. Managed/local skills: `~/.openclaw/skills/` -- shared across agents
3. Bundled skills: shipped with OpenClaw -- lowest priority
4. Extra dirs: `skills.load.extraDirs` in config

**SKILL.md structure:**
```markdown
---
name: seo-audit
description: Performs comprehensive SEO audit on a given URL using browser and analysis tools.
---

# SEO Audit Skill

When asked to perform an SEO audit:

1. Open the target URL in the browser
2. Capture page title, meta description, headings structure
3. Check Core Web Vitals via PageSpeed API
4. Analyze keyword density and internal linking
5. Write findings to `memory/seo/YYYY-MM-DD-<domain>.md`
6. Return a summary with actionable recommendations
```

**Gating and filtering (restrict skills by platform, binaries, env vars):**
```json
{
  "metadata": {
    "openclaw": {
      "requires": { "bins": ["uv"], "env": ["GEMINI_API_KEY"] },
      "os": ["darwin"]
    }
  }
}
```

**Per-skill configuration in `openclaw.json`:**
```json
{
  "skills": {
    "entries": {
      "seo-audit": {
        "enabled": true,
        "env": { "PAGESPEED_API_KEY": "xxx" },
        "apiKey": "xxx"
      }
    }
  }
}
```

### 2.2 Chaining Skills for Multi-Step Marketing Workflows

OpenClaw supports several patterns for chaining complex workflows:

#### Pattern 1: Lobster Typed Workflow Runtime

Lobster is a workflow DSL that chains tool calls deterministically with built-in approval checkpoints. It replaces multiple LLM calls with a single structured operation.

**Example -- Content Distribution Pipeline:**
```yaml
name: content-distribute
args:
  url: ""
  title: ""
steps:
  - id: extract
    command: ["browser", "snapshot", "--url", "$args.url"]
  - id: classify
    command: ["llm-task", "--prompt", "Classify this content for social platforms"]
    stdin: "$extract.stdout"
  - id: draft-social
    command: ["llm-task", "--prompt", "Draft social posts for each platform"]
    stdin: "$classify.json"
  - id: approve-posts
    command: ["echo", "Posts ready for review"]
    approval: required
  - id: post-telegram
    command: ["message", "--channel", "telegram", "--to", "group:marketing"]
    stdin: "$draft-social.json"
    condition: "$approve-posts.approved"
```

**Key Lobster features:**
- Deterministic: one call instead of many LLM turns
- Built-in approvals: workflows pause before side effects until human approval
- Durable resume tokens: continue after approval without re-execution
- Returns JSON envelope with status (`ok` / `needs_approval` / `cancelled`)

#### Pattern 2: Cron-Triggered Multi-Step via Agent Sessions

Use cron jobs with persistent named sessions for workflows that maintain state across runs:

```bash
# Daily SEO check with persistent context
openclaw cron add --name "daily-seo-check" \
  --cron "0 9 * * *" --tz "Asia/Kolkata" \
  --sessionTarget "session:seo-monitor" \
  --message "Run the SEO audit skill on our top 5 pages. Compare with yesterday's results in memory. Report any ranking changes."

# Weekly performance report
openclaw cron add --name "weekly-report" \
  --cron "0 10 * 1 *" --tz "Asia/Kolkata" \
  --session isolated \
  --message "Generate weekly marketing performance report. Pull data from memory/campaigns/. Deliver summary." \
  --announce --channel telegram --to "group:marketing-team"
```

#### Pattern 3: Heartbeat-Driven Monitoring

Use HEARTBEAT.md for bundled periodic checks:

```markdown
# HEARTBEAT.md

## Every heartbeat (30 min):
1. Check if any new Telegram messages need response
2. Monitor active ad campaigns for budget alerts
3. Check website uptime

## If issues found:
- Send alert to Telegram group:marketing-alerts
- Log to memory/alerts/YYYY-MM-DD.md
```

#### Pattern 4: Hooks for Event-Driven Chains

Create hooks that trigger skill chains on specific events:

```typescript
// hooks/new-content/handler.ts
const handler = async (event) => {
  if (event.type !== "message" || !event.context?.text?.includes("#newpost")) return;
  // Trigger content distribution workflow
  event.messages.push({
    role: "system",
    content: "New blog post detected. Run the content-distribute Lobster workflow."
  });
};
export default handler;
```

### 2.3 Cron Job Setup for Scheduled Tasks

OpenClaw's cron system is a built-in Gateway scheduler that persists jobs across restarts. Jobs are stored at `~/.openclaw/cron/jobs.json`.

**Three schedule types:**

| Type | Use Case | Example |
|------|----------|---------|
| `--at` (one-shot) | Single future event | `--at "2026-04-01T09:00:00+05:30"` |
| `--every` (interval) | Fixed intervals (ms) | `--every 3600000` (hourly) |
| `--cron` (expression) | Standard cron syntax | `--cron "0 9 * * *"` |

**Execution modes:**

| Mode | When to Use |
|------|-------------|
| `--session main` | Task needs conversational context |
| `--session isolated` | Standalone task, no context pollution |
| `--sessionTarget "session:custom-id"` | Persistent context across runs |

**Marketing automation schedule:**

```bash
# Hourly: Ad spend monitoring
openclaw cron add --name "ad-monitor" \
  --every 3600000 \
  --session isolated --lightContext \
  --message "Check Google Ads and Meta Ads spend vs daily budget. Alert if >80% spent before 6pm." \
  --announce --channel telegram --to "chat:ADMIN_CHAT_ID"

# Daily 9 AM: SEO check
openclaw cron add --name "daily-seo" \
  --cron "0 9 * * *" --tz "Asia/Kolkata" \
  --sessionTarget "session:seo-tracker" \
  --message "Run SEO audit on top 5 pages. Compare with yesterday. Write results to memory/seo/."

# Weekly Monday 10 AM: Full report
openclaw cron add --name "weekly-report" \
  --cron "0 10 * * 1" --tz "Asia/Kolkata" \
  --session isolated \
  --message "Generate weekly marketing report from memory/campaigns/. Include: ad spend, SEO rankings, social engagement, content published." \
  --announce --channel telegram --to "group:marketing"

# Every 6 hours: Social media monitoring
openclaw cron add --name "social-monitor" \
  --cron "0 */6 * * *" --tz "Asia/Kolkata" \
  --session isolated --lightContext \
  --message "Check social media mentions and engagement. Flag anything needing response."
```

**Cron management:**
```bash
openclaw cron list              # Show all jobs
openclaw cron status <jobId>    # Job details + recent runs
openclaw cron run <jobId>       # Trigger immediately
openclaw cron update <jobId>    # Modify schedule
openclaw cron remove <jobId>    # Delete job
```

**Retry policy:**
- One-shot jobs: retry up to 3x with exponential backoff for transient errors
- Recurring jobs: backoff escalation (30s -> 1m -> 5m -> 15m -> 60m), reset after success

**Storage management:**
- Run history: `~/.openclaw/cron/runs/<jobId>.jsonl` (JSONL format)
- Isolated session pruning: default 24h (configurable)
- Log pruning: default 2MB or 2000 lines per job

### 2.4 Memory System: Maintaining State Across Sessions

OpenClaw's memory is built on plain Markdown files in the agent workspace, with optional vector search indexing.

#### Two Memory Layers

**1. Daily logs (`memory/YYYY-MM-DD.md`):**
- Append-only, loaded at session start
- Ideal for campaign performance snapshots, daily metrics
- Git-trackable for audit trails

**2. Long-term memory (`MEMORY.md`):**
- Curated, persistent reference material
- Loaded only in private sessions
- Ideal for brand guidelines, campaign strategy, client preferences

#### Memory Tools

- `memory_search` -- semantic retrieval over indexed snippets (vector + BM25 hybrid)
- `memory_get` -- targeted file reads with graceful degradation

#### Vector Memory Search

Creates per-agent SQLite index at `~/.openclaw/memory/<agentId>.sqlite`.

**Supported embedding providers:** OpenAI, Gemini, Voyage, Mistral, Ollama, local models.

**Search features:**
- Hybrid: semantic match + exact token matching (BM25)
- Diversity re-ranking (MMR)
- Temporal decay favoring recent notes
- Multimodal indexing (Gemini only): images and audio alongside text

#### Recommended Memory Structure for Marketing Agent

```
workspace/
  MEMORY.md                          # Brand guidelines, personas, strategy
  HEARTBEAT.md                       # Periodic check instructions
  memory/
    YYYY-MM-DD.md                    # Daily activity logs
    campaigns/
      google-ads-performance.md      # Rolling campaign metrics
      meta-ads-performance.md
      campaign-history.md            # Historical decisions and outcomes
    seo/
      YYYY-MM-DD-<domain>.md        # SEO audit snapshots
      ranking-history.md             # Keyword ranking over time
    content/
      blog-posts.md                  # Published content registry
      social-calendar.md             # Planned/posted social content
    alerts/
      YYYY-MM-DD.md                  # Daily alert log
  bank/
    entities/
      client-profiles.md             # Key client information
      competitor-analysis.md         # Competitor tracking
```

#### Configuration
```json
{
  "agents": {
    "defaults": {
      "memorySearch": {
        "provider": "openai",
        "query": {
          "hybrid": true
        }
      }
    }
  }
}
```

### 2.5 Handling Long-Running Tasks

OpenClaw provides several mechanisms for tasks spanning multiple agent turns:

**1. Background process execution:**
```
exec --background true --command "long-running-script.sh"
```
- Returns session ID immediately with brief output tail
- `process poll <sessionId>` to check progress
- `process log <sessionId>` for full output
- Caveat: sessions exist only in memory, don't survive Gateway restarts

**2. Custom session persistence:**
- Use `--sessionTarget "session:task-name"` in cron jobs
- Context carries across runs, enabling multi-day workflows
- Agent can check its own progress notes in memory files

**3. Queue modes for message handling:**
- `collect`: batch queued messages
- `steer`: interrupt current tool calls to handle new message
- `followup`: queue message for next turn

**4. Agent loop timeout:** Default 600 seconds per run. Configure per-agent or per-cron-job with `timeoutSeconds`.

---

## 3. OpenClaw + External Tools Integration

### 3.1 How MCP Servers Work with OpenClaw

OpenClaw supports MCP (Model Context Protocol) servers as tool providers. Skills and plugins can expose MCP-compatible tools that the agent can invoke during execution.

**Integration patterns:**
- Browser automation via Chrome DevTools MCP (`user` profile)
- Chrome extension relay for controlling existing browser tabs
- Remote CDP endpoints (Browserless, Browserbase) for headless automation
- Custom MCP servers for proprietary API access

**Configuration in `openclaw.json`:**
Skills that wrap MCP servers are configured via `skills.entries.<name>` with environment variables and API keys injected per agent run. Secrets are injected into the host process, not the sandbox, keeping them away from prompts and logs.

### 3.2 Browser Automation

OpenClaw includes a built-in browser automation tool with multiple profile modes:

#### Browser Profiles

| Profile | Use Case | Auth State |
|---------|----------|------------|
| `openclaw` (default) | Isolated managed Chromium | Fresh/managed |
| `user` | Attach to existing Chrome via DevTools MCP | Reuses logged-in sessions |
| `chrome-relay` | Control via extension relay | Reuses logged-in sessions |
| `remote` | Remote CDP (Browserless, Browserbase) | Configurable |

**Best for marketing automation:** Use `user` profile to leverage already-logged-in sessions for Google Ads, Meta Business Suite, analytics dashboards, etc.

**Capabilities:**
- Tab management: create, focus, close tabs with target IDs
- Interactions: click, type, drag, select, hover using snapshot `ref` IDs (not CSS selectors)
- Content capture: screenshots (full-page or element), snapshots, PDF exports
- State inspection: console logs, network requests, cookies, storage
- Environment simulation: geolocation, user-agent, timezone, device presets, dark mode

**Configuration:**
```json
{
  "browser": {
    "enabled": true,
    "defaultProfile": "user",
    "ssrfPolicy": {
      "dangerouslyAllowPrivateNetwork": true
    }
  }
}
```

**Security:** Browser binds to loopback only. SSRF guards navigation endpoints. JavaScript evaluation runs in page context -- disable with `browser.evaluateEnabled: false` if handling untrusted content.

### 3.3 File System Access

**Workspace structure:**
- Default workspace: `~/.openclaw/workspace`
- All tool operations (read/write/edit/exec) scoped to workspace directory
- Built-in tools: `read`, `write`, `edit`, `exec` (always available)

**Media handling:**
- Received media stored in `media/` directory
- Supports images, audio, documents, video
- Telegram media cap: 100 MB (configurable)
- Multimodal understanding: agent can process received images and audio

**Asset management for marketing:**
```
workspace/
  assets/
    images/           # Marketing images, ad creatives
    documents/        # Reports, proposals
    templates/        # Email templates, social post templates
  output/
    reports/          # Generated reports
    creatives/        # AI-generated content
```

### 3.4 Webhook-Triggered Actions

OpenClaw exposes webhook endpoints for external event-driven automation.

**Enable webhooks:**
```json
{
  "hooks": {
    "enabled": true,
    "token": "your-secret-token",
    "path": "/hooks",
    "defaultSessionKey": "hook:default",
    "allowRequestSessionKey": false
  }
}
```

**Core endpoints:**

**POST /hooks/wake** -- Enqueue a system event for the main session:
```bash
curl -X POST http://localhost:18789/hooks/wake \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"text": "New blog post published: Building AI Agents", "mode": "now"}'
```

**POST /hooks/agent** -- Run an isolated agent turn:
```bash
curl -X POST http://localhost:18789/hooks/agent \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "New blog post published at https://example.com/post. Distribute to social channels.",
    "channel": "telegram",
    "to": "group:marketing",
    "model": "anthropic/claude-sonnet-4-20250514",
    "timeoutSeconds": 120
  }'
```

**POST /hooks/<name>** -- Custom mapped endpoints (e.g., for CMS webhooks, Stripe events, etc.)

**Use case: Blog Post -> Social Distribution Pipeline:**

1. CMS (WordPress/Ghost) fires webhook on publish -> hits `/hooks/agent`
2. Agent receives blog URL and content
3. Agent drafts social posts for each platform
4. Agent posts to Telegram group for approval
5. On approval, agent distributes to social channels

**Security best practices:**
- Keep endpoints behind loopback, VPN, or trusted proxy
- Use dedicated hook tokens (separate from gateway auth)
- Restrict `allowedAgentIds` for multi-agent setups
- Rate limiting activates after repeated auth failures

### 3.5 Custom Hooks (Event-Driven)

Hooks execute TypeScript functions when specific events occur inside OpenClaw.

**Event types available:**

| Category | Events |
|----------|--------|
| Command | `command:new`, `command:reset`, `command:stop` |
| Session | `session:compact:before`, `session:compact:after` |
| Agent | `agent:bootstrap` |
| Gateway | `gateway:startup` |
| Message | `message:received`, `message:transcribed`, `message:preprocessed`, `message:sent` |

**Hook structure:**

```
hooks/
  my-hook/
    HOOK.md        # Metadata (YAML frontmatter)
    handler.ts     # TypeScript handler
```

**Example -- Auto-respond to new leads:**
```typescript
// hooks/lead-capture/handler.ts
const handler = async (event) => {
  if (event.type !== "message" || event.action !== "received") return;
  const text = event.context?.text || "";
  if (text.toLowerCase().includes("pricing") || text.toLowerCase().includes("interested")) {
    event.messages.push({
      role: "system",
      content: "Lead detected. Save contact info to memory/leads/. Send pricing info and notify the team."
    });
  }
};
export default handler;
```

**Hook management:**
```bash
openclaw hooks list              # Show all hooks
openclaw hooks enable hook-name  # Enable a hook
openclaw hooks disable hook-name # Disable a hook
openclaw hooks install <path>    # Install hook pack
```

---

## 4. Telegram Integration Deep Dive

OpenClaw's Telegram integration uses the **grammY** framework with the Bot API.

### 4.1 Setup

```bash
# 1. Create bot via @BotFather -> /newbot -> copy token
# 2. Configure in openclaw.json or env
export TELEGRAM_BOT_TOKEN="your-bot-token"

# 3. Start gateway and approve initial DM pairings
openclaw gateway start
```

**Configuration in `openclaw.json`:**
```json
{
  "channels": {
    "telegram": {
      "enabled": true,
      "accounts": {
        "default": {
          "token": "your-bot-token"
        }
      }
    }
  }
}
```

### 4.2 Sending Rich Messages

**Supported content types:**
- Text with HTML formatting (Telegram `parse_mode`)
- Inline buttons/keyboards
- Audio (voice notes vs. audio files distinguished)
- Video (supports `asVideoNote` flag for video notes)
- Static WEBP stickers
- Images and GIFs

**Text formatting:** Markdown-ish text is auto-rendered to Telegram-safe HTML. Raw HTML from models is escaped to reduce parse failures.

**Text chunk limit:** 4000 characters (configurable)

**Live streaming:** Preview messages with real-time edits via `editMessageText`. Streaming modes:
- `partial` -- update message as tokens arrive
- `block` -- send complete blocks
- `progress` -- show progress indicators

### 4.3 Inline Keyboards for Approval Workflows

Inline buttons are supported with configurable scope:

```json
{
  "channels": {
    "telegram": {
      "buttons": {
        "scope": "dm"    // "dm" | "group" | "all" | "allowlist"
      }
    }
  }
}
```

**Exec approval flow via Telegram:**
1. Agent needs to execute a command (e.g., deploy, send email)
2. Approval prompt sent to configured Telegram approver DM
3. Approver responds: `/approve <id> allow-once`, `allow-always`, or `deny`
4. Agent continues or aborts based on decision

**Configuration for approval routing:**
```json
{
  "approvals": {
    "exec": {
      "enabled": true,
      "mode": "targets",
      "targets": [
        { "channel": "telegram", "to": "123456789" }
      ]
    }
  }
}
```

**Forum topics:** Approval prompts preserve the topic thread for the prompt and post-approval follow-up.

### 4.4 Group Chat vs DM Patterns

**DM policies:**
- `pairing` (default): requires approval of new users
- `allowlist`: explicit numeric Telegram user IDs only
- `open`: unrestricted
- `disabled`: no DM access

**Group policies:**
- `open`: any group member can trigger the bot
- `allowlist` (default): sender must be in explicit allowlist
- `disabled`: no group access

**Per-group overrides:** Each group can have custom agent routing, access policies, and topic configurations.

**Forum supergroups:**
- Topic session keys append `:topic:<threadId>`
- Replies and typing target the specific topic thread
- Per-topic agent routing supported
- ACP session binding for topic-level isolation

**Threading in DMs:**
- `message_thread_id` support for threaded conversations
- Thread-aware session keys preserve context per thread

**Recommended pattern for marketing team:**
```
Telegram Groups:
  - marketing-team     (open) -> main agent, full access
  - marketing-alerts   (open) -> receive-only, agent sends alerts
  - content-review     (open) -> approval workflows for content

Telegram DMs:
  - Admin DM           -> full agent access + exec approvals
  - Team member DMs    -> read-only + task requests
```

### 4.5 Media Handling

**Receiving media:**
- Images, audio, video, documents automatically processed
- Media cap: 100 MB (configurable)
- Group history: 50 messages (configurable)

**Media understanding:** Agent can process received images (e.g., user sends screenshot of ad performance -> agent analyzes it).

**Reactions:** Bot can receive reaction notifications and send acknowledgment emojis. Configurable as `own` (bot-sent messages only) or `all`.

**Reply threading tags:**
- `[[reply_to_current]]` -- reply to the message that triggered the agent
- `[[reply_to:<id>]]` -- reply to a specific message by ID

### 4.6 Polling vs Webhook

**Long polling (default):** Simpler setup, no public URL needed. Ideal for Mac Mini behind NAT.

**Webhook mode:** Available with `webhookUrl` and `webhookSecret` configuration. Binds to `127.0.0.1:8787` by default. Better for high-traffic scenarios.

**Recommendation for Mac Mini:** Use long polling (default). No need to expose ports or set up reverse proxy.

---

## 5. Dashboard Architecture for Human-in-the-Loop

### 5.1 Control UI Overview

The Gateway dashboard is a **Vite + Lit SPA** served at `http://127.0.0.1:18789/` (default). It communicates via WebSocket for real-time updates.

**Access methods:**
- Local: `http://127.0.0.1:18789/`
- Remote: Tailscale Serve (tokenless option), SSH tunneling, or token-based auth
- CLI shortcut: `openclaw dashboard` (copies link, opens browser)

**Authentication:**
- Token-based (from `gateway.auth.token` or `OPENCLAW_GATEWAY_TOKEN`)
- Password authentication
- Tailscale identity integration
- WebSocket handshake enforces auth via `connect.params.auth`

### 5.2 Built-in Dashboard Features

**Chat & Session Management:**
- Non-blocking message sending with idempotency
- Live streaming of tool calls and agent events
- Abort capabilities (button, text, or programmatic)
- Session listing with presence tracking
- Per-session overrides: thinking mode, fast mode, verbose, reasoning

**Cron Job Management:**
- List/add/edit/run/enable/disable jobs
- Run history viewer
- Webhook delivery modes, staggering options
- Per-job agent and model overrides

**Skills Administration:**
- Enable/disable skills
- Install new skills
- Configure API keys

**Execution Approvals:**
- Edit allowlists for gateway and node execution
- Policy-based approval workflows (deny/allowlist/full)
- Per-agent overrides

**Real-Time Monitoring:**
- Node inventory and capabilities
- Instance presence lists
- Live gateway log tailing with filtering and export
- Health snapshots and event logging
- Multi-platform channel status (WhatsApp, Telegram, Discord, Slack)

**Configuration Management:**
- View and edit `openclaw.json` with concurrent edit protection (base-hash guards)
- Schema-driven form rendering
- Validation and restart capabilities

**Localization:** English, Chinese (Simplified/Traditional), Portuguese (Brazil), German, Spanish.

### 5.3 Task Management System Design

OpenClaw does not have a built-in Kanban/task management UI, but you can architect one using its primitives:

#### Option A: Memory-Based Task Tracking

Use workspace files as a task database:

```markdown
<!-- workspace/tasks/kanban.md -->
# Task Board

## Requested
- [ ] #T-042: Create Instagram carousel for product launch (requested by @admin, 2026-03-16)
- [ ] #T-041: Write blog post on AI marketing trends

## In Progress
- [~] #T-040: Monthly SEO report (agent working, cron:daily-seo)

## Review
- [?] #T-039: Google Ads copy variations (awaiting approval in Telegram)

## Done
- [x] #T-038: Weekly performance report (delivered 2026-03-15)
```

The agent reads/updates this file. Telegram serves as the interaction layer:
- User sends task request in Telegram -> agent adds to "Requested"
- Cron job picks up tasks -> moves to "In Progress"
- Agent completes work -> moves to "Review" + sends to Telegram for approval
- Human approves in Telegram -> agent moves to "Done"

#### Option B: Webhook-Driven External Dashboard

Build a lightweight web app that:
1. Displays tasks from the agent's memory files (read via Gateway API)
2. Allows task creation -> fires webhook to `/hooks/agent`
3. Shows real-time status via WebSocket connection to Gateway
4. Renders approval buttons that map to Telegram approval commands

### 5.4 Creative Pipeline

**Request -> Upload -> Review -> Approve flow:**

1. **Request:** User sends creative brief via Telegram (text + reference images)
2. **Agent processes:** Reads brief, generates copy/content, saves to `workspace/output/creatives/`
3. **Review:** Agent sends preview to Telegram group with inline approval buttons
4. **Approve:** Team member approves via Telegram `/approve` -> agent publishes/distributes

**Media flow:**
- User sends image in Telegram -> stored in `media/` -> agent can reference it
- Agent generates content -> saves to workspace -> sends back via Telegram
- Approval gates (Lobster workflows) pause before publishing

### 5.5 Real-Time Notifications

**WebSocket (built-in):**
- Control UI uses WebSocket for all real-time updates
- Live streaming of agent events, tool calls, and completions
- Session presence tracking

**Telegram as notification channel:**
- Cron jobs with `--announce --channel telegram --to "group:alerts"` for scheduled notifications
- Hooks for event-driven alerts (new message, error, budget threshold)
- Exec approvals routed to specific Telegram DMs

**Webhook delivery from cron:**
```bash
openclaw cron add --name "health-check" \
  --every 3600000 \
  --session isolated --lightContext \
  --delivery webhook --webhookUrl "https://your-dashboard.com/api/health" \
  --message "Report system health status"
```

### 5.6 Approval Workflow Architecture

OpenClaw provides a multi-layered approval system:

**Layer 1: Exec Approvals (command execution)**
- Policy: `deny` / `allowlist` / `full`
- Ask mode: `off` / `on-miss` / `always`
- Per-agent allowlists with glob patterns
- Safe bins fast-path for simple commands (`jq`, `cut`, `head`, etc.)
- Routed to Telegram DMs or channels

**Layer 2: Lobster Workflow Approvals (business logic)**
- Steps marked `approval: required` pause execution
- Durable resume tokens for async approval
- JSON response: `needs_approval` status with `resumeToken`
- Human approves -> `lobster resume --token <token> --decision approve`

**Layer 3: Chat-Based Approvals (lightweight)**
- Agent asks in Telegram: "Should I publish this post?"
- Human responds: "Yes" / "No" / "Edit: change the headline to..."
- Agent acts on response in next turn

**Recommended approval architecture for marketing:**
```
Critical actions (deploy, spend money):     -> Exec approvals (Telegram DM to admin)
Content publishing (social posts, emails):  -> Lobster workflow approvals
Routine decisions (report format, timing):  -> Chat-based in Telegram group
```

---

## Appendix A: Complete Mac Mini Setup Checklist

```bash
# 1. Install OpenClaw
npm install -g openclaw

# 2. Run setup wizard
openclaw setup

# 3. Configure Telegram
# - Create bot via @BotFather
# - Add token to config

# 4. Configure model provider
# - Set ANTHROPIC_API_KEY (or other provider)

# 5. Install as daemon
openclaw gateway install --port 18789

# 6. Start the gateway
openclaw gateway start

# 7. Verify health
openclaw status --deep

# 8. Set up workspace structure
mkdir -p ~/.openclaw/workspace/{memory/{campaigns,seo,content,alerts},assets/{images,documents,templates},output/{reports,creatives},skills,hooks}

# 9. Install marketing skills
# (Create custom skills in ~/.openclaw/workspace/skills/)

# 10. Set up cron jobs
# (See Section 2.3 for examples)

# 11. Configure monitoring
# (See Section 1.5 for recommendations)

# 12. Set up log cleanup
# (See Section 1.3 for cleanup script)
```

## Appendix B: Recommended openclaw.json for Marketing Agent

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
        "activeHours": { "start": "08:00", "end": "22:00" }
      },
      "session": {
        "resetPolicy": {
          "daily": "04:00"
        },
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
        "default": {
          "token": "YOUR_BOT_TOKEN"
        }
      },
      "dm": { "policy": "pairing" },
      "group": { "policy": "allowlist" },
      "buttons": { "scope": "all" }
    }
  },
  "hooks": {
    "enabled": true,
    "token": "YOUR_HOOK_TOKEN",
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
        { "channel": "telegram", "to": "YOUR_ADMIN_TELEGRAM_ID" }
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

## Appendix C: Key File Paths

| Path | Purpose |
|------|---------|
| `~/.openclaw/openclaw.json` | Main configuration |
| `~/.openclaw/workspace/` | Agent workspace root |
| `~/.openclaw/workspace/MEMORY.md` | Long-term curated memory |
| `~/.openclaw/workspace/HEARTBEAT.md` | Heartbeat check instructions |
| `~/.openclaw/workspace/memory/` | Daily logs and structured memory |
| `~/.openclaw/workspace/skills/` | Custom skills (highest precedence) |
| `~/.openclaw/workspace/hooks/` | Custom event hooks |
| `~/.openclaw/skills/` | Shared managed skills |
| `~/.openclaw/hooks/` | Shared managed hooks |
| `~/.openclaw/agents/<id>/sessions/` | Session transcripts |
| `~/.openclaw/cron/jobs.json` | Cron job definitions |
| `~/.openclaw/cron/runs/<jobId>.jsonl` | Cron run history |
| `~/.openclaw/memory/<agentId>.sqlite` | Vector memory index |
| `~/.openclaw/exec-approvals.json` | Execution approval rules |
| `/tmp/openclaw/` | Log files (daily rotation) |

## Appendix D: Key CLI Commands Reference

```bash
# Gateway lifecycle
openclaw gateway start|stop|restart|status
openclaw gateway install|uninstall

# Health & diagnostics
openclaw status [--all|--deep]
openclaw health --json
openclaw doctor

# Cron management
openclaw cron list|add|update|remove|run|status

# Skills
openclaw skills list|enable|disable

# Hooks
openclaw hooks list|enable|disable|install

# Sessions
openclaw sessions [--json]
openclaw sessions cleanup [--dry-run]

# Dashboard
openclaw dashboard

# Agent execution
openclaw agent --message "your prompt"

# Logs
openclaw logs [--tail]
```
