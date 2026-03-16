# AdClaw Long-Term Plan v2 — Autonomous Marketing Agent for Astrology Niche

**Created:** 2026-03-16
**Status:** Second iteration — incorporates ruthless review of plan-1
**Target:** Fully autonomous marketing agent running on Mac Mini via OpenClaw, managing an astrology website's marketing funnel on $300-500/month

---

## Changes from Plan 1

### Critical Fixes

1. **Timeline: 15 weeks compressed into what is really 6+ months of work.** Plan 1 claims a solo developer can build 8 custom API skills, set up all OAuth flows, build a custom dashboard, launch paid campaigns, build a social presence, AND achieve "full autonomy" in 15 weeks. This is fantasy. The Google Ads API alone requires a developer token approval process that takes 2-10 business days, and you cannot test against real campaigns without it. Meta's Advanced API access requires 1,500+ successful calls over 15 days before you unlock usable rate limits. Building 8 skills with real error handling, retry logic, and edge cases is 2-3 weeks per skill, not a fraction of a week. Adjusted all timelines to realistic estimates, roughly doubling them.

2. **Budget math: Anthropic API costs are dangerously underestimated.** Plan 1 allocates $50-80/month for Anthropic API usage with Claude Sonnet running heartbeats every 30 minutes (48/day), hourly ad monitoring (24/day), daily SEO checks, daily social drafts, daily ad optimization, weekly content batches, weekly reports, weekly SEO optimization, weekly Reddit scans, and monthly strategy reviews. That is 72+ agent sessions per day minimum. Claude Sonnet at ~$3/million input tokens and ~$15/million output tokens, with each session consuming context window reads + tool calls + output — this will blow through $80/month within the first week. Revised to $150-250/month for Anthropic API, which forces a complete rethink of the budget allocation.

3. **Meta API Standard Access: 60 points max, 300s decay, 300s block.** Plan 1 assumes the agent can freely create campaigns, manage ad sets, and pull insights. But Standard Access gives you 60 points — that is 60 read operations or 20 write operations before a 5-minute block. You cannot run hourly monitoring AND daily optimization AND campaign creation on Standard Access. The plan never addresses how to get Advanced Access (1,500+ successful calls over 15 days, error rate below 15%, plus App Review). Added an explicit Meta API bootstrapping phase.

4. **Google Ads Keyword Planner requires Basic access minimum.** Plan 1 says to use Keyword Planner for free keyword research, but the API research notes that Explorer access "restricts keyword planning tools." You need Basic access (2 business days) at minimum. The plan treats this as available on Day 3-4 but the keyword strategy work is in Week 3. This dependency is not flagged. Fixed the sequencing.

5. **Indexing API is for JobPosting/BroadcastEvent only.** Plan 1 says "Agent submits to Search Console: Notify Google of new URL via Indexing API." The research explicitly states the Indexing API is "officially only for JobPosting and BroadcastEvent structured data types." Using it for blog posts is technically against policy and could result in access revocation. Removed this from the plan; replaced with sitemap submission + URL Inspection API for monitoring.

6. **snoowrap is archived; no maintained Reddit SDK exists.** Plan 1 mentions browsing Reddit via "browser skill" which is fine for reading, but any future programmatic Reddit integration would depend on an archived, unmaintained package. Made this risk explicit and recommended against ever automating Reddit posting.

7. **Pinterest API is never mentioned in the API research.** Plan 1 treats Pinterest as a key channel and assumes automated scheduling, but the entire API/tools research document has ZERO information about Pinterest's API, npm packages, authentication, or rate limits. The plan assumes capabilities that haven't been researched. Added a research task and fallback to manual/Tailwind approach.

8. **Email marketing platform integration is completely absent from the plan.** Market research recommends email as a Tier 2 channel with 30-40% open rates for astrology. The requirements don't mention it, but the budget allocations include email platform costs. Plan 1 never builds an email skill, never discusses email API integration, and never includes email in the cron schedule. Either add it or remove the budget line.

9. **30-60 minutes/week human time is a lie for the first 3 months.** Plan 1 claims the operator needs 30-60 min/week. But the plan asks the human to: review 3-4 blog posts per week (20 min each = 60-80 min), review 7 tweet drafts + 5 Pinterest descriptions + 3 Instagram captions per week (30 min), create ad creatives when requested (30-60 min per creative), post manually to X and Reddit (20 min/day = 140 min/week), review weekly performance reports (15 min), and handle monthly strategy review (60 min). That is 5-8 hours/week minimum during the building phase. Revised to honest estimates.

10. **No fallback for when Claude hallucinates astrological data.** Plan 1 mentions an `ephemeris` skill using `swisseph` or `astronomia` npm packages, but never integrates it into the content pipeline as a mandatory verification step. The market research warns that "factual errors destroy credibility instantly" in this niche. Made ephemeris verification a hard gate in the content pipeline, not optional.

### Significant Adjustments

11. **Content velocity target of 20+/month by month 3 is reckless.** Market research explicitly says "Quality over quantity — 4 excellent articles/month beats 20 mediocre ones" and warns about Google's scaled content abuse penalties. Plan 1's own research contradicts its success metrics. Revised to 8-12 quality articles/month.

12. **500 organic sessions/month in 3 months from a new site is optimistic.** New domains have a "Google sandbox" period of 3-6 months. Even with good content, ranking takes time. 500 sessions in 3 months is possible only if the domain already has authority. Adjusted targets based on whether the site is new or existing.

13. **$2/day Google Ads budget ($60/month) is largely wasted.** At $0.50-$2.00 CPC for astrology keywords, that is 30-120 clicks/month. With typical search ad conversion rates of 2-5%, that is 1-6 conversions/month — not enough data to optimize anything. You need ~100 conversions to start making statistically meaningful optimization decisions. At this budget, Google Ads produces noise, not signal. Recommendation: either skip Google Ads at $300/month budget or consolidate all paid budget into one platform.

14. **Missing: WordPress site doesn't exist yet?** The requirements say "side project: an astrology website" but never clarify whether it already exists. Plan 1 assumes WordPress is ready and just needs API setup. If the site needs to be built, that is a major unaccounted-for task. Added a conditional Phase 0.

15. **Canva Pro ($13/mo) isn't in Scenario A but creative requests assume visual tools.** At $300/month, there is no budget for design tools, yet the plan requires Pinterest pins, Instagram posts, and ad creatives — all visual-heavy. The human needs some tool to make visuals. Either budget for Canva or accept that visual channels (Pinterest, Instagram) must be deferred.

16. **OpenAI API for image evaluation is a nice-to-have, not essential.** Spending $5-25/month on GPT-4 Vision to check image dimensions and text overlay percentage is overkill. A simple Node.js script with `sharp` or `jimp` can check dimensions for free. Text overlay percentage can be estimated with basic image analysis. Removed OpenAI image eval from core budget; kept as optional.

17. **The "trust tiers" timeline doesn't account for data requirements.** Auto-publishing blog posts when "confidence > 0.8" is meaningless without defining what confidence means, how it's measured, and what training data establishes the threshold. This is hand-waving. Replaced with concrete criteria.

18. **Custom dashboard is unnecessary scope creep for Phase 1-3.** The Express.js dashboard with Kanban board, creative pipeline, campaign overview, content calendar, and performance charts is a significant frontend project. OpenClaw already has a dashboard. Telegram already handles approvals. Building a custom dashboard should be Phase 5+ at earliest, not woven throughout.

19. **No mention of Google Ads conversion tracking setup.** The plan creates campaigns with `MAXIMIZE_CONVERSIONS` bidding strategy but never discusses setting up conversion tracking (Google Tag, conversion actions, etc.). Without conversion tracking, maximize-conversions bidding has no signal to optimize on and will waste budget. Added this as a prerequisite.

20. **Agent model choice: Claude Sonnet for everything is expensive.** Using Sonnet for heartbeats, uptime checks, and log cleanup is wasteful. These are simple tasks that a cheaper model (Haiku) or even a bash script can handle. Differentiated model usage by task complexity.

21. **Market research recommends Pinterest as Tier 1, but the plan treats it as Phase 4.** If Pinterest is highest-ROI for astrology (3-6 month pin lifespan, visual search engine, perfect audience overlap), it should be in Phase 2 alongside SEO content, not deferred to Week 11-14. Moved Pinterest earlier.

22. **The plan never addresses what the astrology site actually monetizes.** ROAS requires revenue. The plan tracks ROAS but never discusses whether the site sells readings, courses, products, or runs on ad revenue. Without knowing the monetization model, conversion tracking, CPA targets, and budget allocation are all meaningless. Added a required monetization decision.

---

## 1. Executive Summary

### What We're Building

An autonomous marketing agent that runs 24/7 on a Mac Mini, managing the marketing lifecycle for an astrology website. The agent handles SEO monitoring, blog content drafting, paid ad campaign management (Google Ads + Meta Ads), social content creation, and performance reporting. It communicates with the human operator through Telegram, requesting creative assets and approvals when needed.

### For Whom

A solo operator running an astrology content site. The operator has limited time and a constrained budget ($300-500/month total marketing spend including tools and API costs). They want marketing to run with maximum automation and quality guardrails.

### Realistic Human Time Commitment

| Phase | Weeks | Human Hours/Week | What the Human Does |
|-------|-------|-----------------|---------------------|
| Phase 0 (if site doesn't exist) | 1-3 | 10-15 | Build WordPress site, write initial content, set up hosting |
| Phase 1: Foundation | 1-4 | 5-8 | API credential setup, tool configuration, testing |
| Phase 2: Organic Engine | 5-12 | 4-6 | Review/edit blog drafts, create pin visuals, approve content |
| Phase 3: Paid Campaigns | 13-18 | 3-5 | Create ad creatives, review campaign setups, approve budgets |
| Phase 4: Social Presence | 19-24 | 3-5 | Post to X/Reddit, review social drafts, engage communities |
| Phase 5: Optimization | 25+ | 1-3 | Weekly review, creative uploads, strategic decisions |

This is honest. "30-60 minutes/week" is a 6-month goal, not a Week 1 reality.

### Why Astrology

- Massive search volume: "daily horoscope" gets 1M+ monthly searches
- Predictable content calendar tied to astronomical events
- Evergreen + cyclical content mix means compounding organic traffic
- Relatively low CPC ($0.50-$2.00) compared to commercial niches
- Passionate community across Pinterest, Instagram, Reddit, and X
- Visual niche with high Pinterest/Instagram potential

### Required Decision Before Starting: Monetization Model

The entire plan depends on how the site makes money. Define this first:

| Model | Implication for Plan | Conversion Tracking |
|-------|---------------------|-------------------|
| **Astrology readings (paid service)** | Google Ads high-intent search works; Meta lead gen works | Purchase/booking event |
| **Digital products (birth chart PDFs, courses)** | Similar to readings; product pages needed | Purchase event |
| **Ad revenue (AdSense/display ads)** | No point running paid ads — all focus on organic traffic | Pageview/session duration |
| **Freemium (free charts, paid premium)** | Lead gen via Meta, nurture via email | Signup + upgrade events |
| **Affiliate (recommend astrology tools/apps)** | Content-first; paid ads less relevant | Click + conversion on partner |

**If the site monetizes through ad revenue or affiliate only, cut Phases 3 entirely. Paid ads to drive traffic to a site that earns $5-20 RPM is negative ROI at this budget.**

---

## 2. Architecture

### Physical Setup

```
Mac Mini (Apple Silicon, 16GB+ RAM)
├── OpenClaw Gateway (launchd daemon, ai.openclaw.gateway)
│   ├── Port 18789 (dashboard + webhooks)
│   ├── Telegram Bot (long polling)
│   └── Browser (user profile, logged into Google Ads / Meta / Analytics)
├── Workspace (~/.openclaw/workspace/)
│   ├── skills/          — Custom marketing skills
│   ├── hooks/           — Event-driven automation
│   ├── memory/          — Daily logs, campaign data, SEO snapshots
│   ├── assets/          — Images, creatives, templates
│   └── output/          — Reports, generated content
├── Express.js Server (existing AdClaw API, port 3000)
│   └── Astrology site (or separate WordPress)
└── Cron Jobs (OpenClaw built-in scheduler)
    ├── Every 4h: Ad spend monitoring (lightweight, use Haiku)
    ├── Daily: SEO check, social drafting
    ├── Weekly: Performance report, content batch, SEO optimization
    └── Monthly: Strategy review, budget reallocation
```

### Key Architecture Change from Plan 1: Model Tiering

Not every agent task needs Claude Sonnet. Use cheaper models for simple tasks:

| Task Type | Model | Estimated Cost/Run | Frequency |
|-----------|-------|-------------------|-----------|
| Uptime check | Bash script (no LLM) | $0 | Every 4 hours |
| Ad spend monitoring | Claude Haiku | ~$0.002 | Every 4 hours |
| SEO data pull | Claude Haiku | ~$0.005 | Daily |
| Social content drafting | Claude Sonnet | ~$0.05 | Daily |
| Blog post generation | Claude Sonnet | ~$0.15 | 2-3x/week |
| Campaign optimization | Claude Sonnet | ~$0.08 | Daily |
| Weekly report | Claude Sonnet | ~$0.10 | Weekly |
| Monthly strategy | Claude Sonnet | ~$0.20 | Monthly |
| Log cleanup | Bash script (no LLM) | $0 | Weekly |

**Estimated monthly Anthropic API cost (realistic): $80-150/month**

This is still the largest single cost. Monitor it weekly.

### OpenClaw Daemon Configuration

File: `~/.openclaw/openclaw.json`

```json
{
  "agents": {
    "defaults": {
      "model": "anthropic/claude-sonnet-4-20250514",
      "workspace": "~/.openclaw/workspace",
      "heartbeat": {
        "every": "60m",
        "target": "telegram",
        "lightContext": true,
        "activeHours": { "start": "07:00", "end": "23:00" }
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
        "model": "anthropic/claude-haiku-3-20240307"
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

**Changes from Plan 1:**
- Heartbeat interval: 30m -> 60m (halves Anthropic API cost for heartbeats)
- Heartbeat `lightContext`: false -> true (cheaper, sufficient for health checks)
- Compaction model: Sonnet -> Haiku (compaction is summarization, Haiku is sufficient and much cheaper)

---

## 3. Phase 0: Prerequisites (Before Week 1)

### Goal

Ensure the astrology website exists and has baseline content before building any automation. If the site already exists and has 10+ pages of content, skip to Phase 1.

### If the Site Doesn't Exist

| Task | Time | Notes |
|------|------|-------|
| Purchase domain | 30 min | Choose a brandable domain with "astro" or zodiac-related term |
| Set up WordPress hosting | 1-2 hours | Any managed WordPress host (SiteGround, Cloudways, etc.). Must have HTTPS. |
| Install WordPress + theme | 2-3 hours | Astra or GeneratePress (fast, SEO-friendly). Install Yoast SEO or RankMath. |
| Write 5 foundational articles manually | 10-15 hours | Do NOT use AI for these. Google's E-E-A-T signals need a human author with demonstrated expertise. Write: About page, 2-3 zodiac sign profiles, 1 birth chart guide. |
| Set up GA4 tracking | 1 hour | Install GA4 tag, set up basic events |
| Set up Google Search Console | 30 min | Verify property, submit sitemap |
| Create social accounts | 1 hour | Pinterest business account, X account, Instagram account (optional) |

**Why write 5 articles manually:** A brand-new domain with zero human-written content that suddenly publishes 20 AI articles will trigger Google's scaled content abuse detection. Establishing a human authorship baseline is critical.

### Required Decisions (Document in MEMORY.md)

1. **Monetization model** (see Executive Summary table)
2. **Brand voice** (warm/mystical? academic/analytical? casual/humorous?)
3. **Target audience** (demographics, psychographics)
4. **Western vs. Vedic astrology** (different audience, different keywords)
5. **Monthly budget commitment** ($300 or $500 or somewhere between)

---

## 4. Phase 1: Foundation (Weeks 1-4)

### Goal

Get the Mac Mini running OpenClaw 24/7, connect all APIs with authentication, and establish the workspace structure. No marketing activity yet — infrastructure only.

**Timeline change from Plan 1:** 2 weeks -> 4 weeks. Building 8 custom skill wrappers with proper error handling, testing each API integration end-to-end, and handling the inevitable OAuth headaches is a month of work, not two weeks.

### Week 1: OpenClaw + Telegram Setup

**Day 1-2: OpenClaw Installation**

```bash
npm install -g openclaw
openclaw setup
openclaw gateway install --port 18789
openclaw gateway start
openclaw status --deep
```

- Create Telegram bot via @BotFather, copy token
- Configure `openclaw.json` per the architecture section
- Set up Telegram groups:
  - `adclaw-alerts` — alerts from agent
  - `adclaw-tasks` — human task assignments
  - `adclaw-content` — content review and approval
- Pair admin Telegram DM with the bot
- Verify bidirectional communication

**Day 3-5: API Credential Setup**

| Service | Auth Method | Setup Steps | Expected Time | Gotchas |
|---------|------------|-------------|---------------|---------|
| Google Ads | OAuth 2.0 + Developer Token | Create GCP project, enable API, create OAuth creds, apply for Basic access | 2-3 days (Basic access approval takes ~2 business days) | Cannot use Keyword Planner until Basic access approved |
| Meta Marketing API | OAuth 2.0 System User Token | Create app, add Marketing API, create System User, generate token | 1 day | Starts with Standard Access (60 points) — very limited |
| Google Search Console | Service Account | Create SA, download JSON, add to Search Console | 1 hour | SA must be added as user in SC manually |
| GA4 | Service Account | Same SA or new one, add as Viewer | 30 min | |
| WordPress | Application Passwords | Create app password in WP admin | 15 min | Site MUST use HTTPS |
| Anthropic | API Key | Generate at console.anthropic.com, set spending limit | 15 min | Set a hard monthly spending limit immediately |
| OpenAI (optional) | API Key | Generate at platform.openai.com | 15 min | Only needed if using DALL-E or GPT-4 Vision |

**Critical: Meta API Bootstrapping Plan**

Standard Access (60 points max, 300s decay, 300s block) is barely usable. To get Advanced Access:

1. Week 1-2: Make simple read calls (campaign list, ad account info) — each costs 1 point
2. Accumulate 1,500+ successful calls over 15 days — this means ~100 calls/day, paced across the day
3. Keep error rate below 15%
4. Apply for App Review once threshold is met
5. **Do NOT attempt campaign creation until Advanced Access is granted**

This means Meta Ads campaigns cannot launch until Week 5-6 at earliest, not Week 8 as Plan 1 states.

### Week 2-3: Core Skills Development

Build skills in priority order. Each skill needs: SKILL.md, Node.js script(s), error handling, retry logic, output formatting.

**Install npm packages:**

```bash
cd ~/.openclaw/workspace
npm init -y
npm install google-ads-api facebook-nodejs-business-sdk googleapis @google-analytics/data wpapi axios cheerio astronomia sharp
```

**Skill build order (by dependency and value):**

| Priority | Skill | npm Package | Est. Build Time | Why This Order |
|----------|-------|-------------|----------------|----------------|
| 1 | `search-console` | `googleapis` | 2-3 days | Simplest Google API, immediate SEO value |
| 2 | `ga4` | `@google-analytics/data` | 2-3 days | Same auth pattern as SC, immediate analytics value |
| 3 | `wordpress` | `wpapi` | 2-3 days | Needed before content production |
| 4 | `ephemeris` | `astronomia` | 1-2 days | MUST work before any content is published |
| 5 | `seo-audit` | `axios` + `cheerio` | 2-3 days | Informs content strategy |
| 6 | `google-ads` | `google-ads-api` | 3-5 days | Complex API, many operations |
| 7 | `meta-ads` | `facebook-nodejs-business-sdk` | 3-5 days | Complex API, rate limit constraints |
| 8 | `reporting` | Aggregates above | 2-3 days | Depends on all other skills |

**Total realistic build time: 18-27 working days = 4-5 weeks**

This is why Phase 1 is 4 weeks, not 2.

### Week 4: Integration Testing + Workspace Setup

**Workspace structure:**

```bash
mkdir -p ~/.openclaw/workspace/{memory/{campaigns,seo,content,alerts,analytics},assets/{images,documents,templates},output/{reports,creatives,blog-drafts},skills/{search-console,ga4,wordpress,ephemeris,seo-audit,google-ads,meta-ads,reporting,budget-guard,social-content},hooks/{budget-alert}}
```

**Create MEMORY.md** (same as Plan 1, with additions):

```markdown
# AdClaw Marketing Agent — Long-Term Memory

## Brand Identity
- Site: [your-astrology-site.com]
- Niche: Western astrology (tropical zodiac)
- Voice: Warm, knowledgeable, encouraging but honest. Not doom-and-gloom.
- Target audience: Women 25-44, interested in self-development through astrology
- Differentiator: Accurate transit data + practical life advice, not vague platitudes
- Monetization: [DEFINE BEFORE STARTING]

## Content Guidelines
- MANDATORY: Verify ALL planetary transit dates via ephemeris skill before publishing
- Never make guaranteed predictions
- Include "for entertainment/educational purposes" disclaimer
- Named human author on every blog post with bio
- Meta ads: NEVER assert viewer's zodiac sign

## Budget Guardrails
- Monthly total budget: $XXX
- Google Ads daily cap: set at platform level
- Meta Ads daily cap: set at platform level
- Max budget increase per day: 20%
- Max budget changes per day: 2
- Any spend above $XX/day requires human approval
- Anthropic API monthly limit: $XXX (set in console.anthropic.com)

## Forbidden Ad Copy Phrases
- "We predict your future"
- "100% accurate"
- "Are you a [sign]?"
- "[Sign] — this will change your life"
- "Guaranteed results"
- Any health, financial, or relationship guarantees
```

**End-of-phase testing checklist:**
- [ ] OpenClaw running 24/7 with auto-restart verified (kill process, confirm it restarts)
- [ ] Each skill's read operation works (run manually, check output)
- [ ] Telegram groups set up and agent responds to messages
- [ ] Ephemeris skill returns correct dates for next Mercury retrograde
- [ ] WordPress skill can create a draft post and read it back
- [ ] Search Console skill can pull search analytics
- [ ] GA4 skill can pull traffic report
- [ ] Google Ads skill can list campaigns (even if empty)
- [ ] Meta Ads skill can read account info (even with Standard Access limits)
- [ ] Log rotation and cleanup cron in place
- [ ] MEMORY.md populated with all required decisions

---

## 5. Phase 2: Organic Engine (Weeks 5-12)

### Goal

Build the content and SEO foundation. Start publishing blog posts, optimize existing content, establish keyword strategy. No paid ads yet — this phase is about compounding organic assets.

**Timeline change from Plan 1:** 4 weeks -> 8 weeks. Content production at quality takes time. Rushing 20 articles in 4 weeks guarantees mediocre content that won't rank.

### Week 5-6: SEO Audit and Keyword Strategy

**Automated SEO Audit (skill: seo-audit)**

Agent runs a comprehensive audit:
1. Crawl all existing pages using `axios` + `cheerio`
2. Check: title tags, meta descriptions, H1/H2 structure, internal links, image alt text
3. Query Search Console: indexed pages, crawl errors, sitemap status
4. Query GA4: top landing pages, bounce rates, session duration
5. Write findings to `memory/seo/YYYY-MM-DD-audit.md`
6. Send summary to Telegram `adclaw-alerts`

**Keyword Strategy (without paid SEO tools)**

Since we cannot afford Ahrefs ($99/mo) or Semrush ($130/mo), use free sources:

- **Google Search Console**: Existing ranking queries (if site has history)
- **Google Ads Keyword Planner**: Search volume and competition (requires Basic access — should be approved by now)
- **Agent browser research**: Analyze SERP competitors for target keywords
- **Google Trends**: Seasonal patterns for astrology terms
- **Google autocomplete/People Also Ask**: Long-tail keyword discovery

**Target keyword categories:**

| Category | Examples | Volume | Competition | Content Type |
|----------|---------|--------|-------------|-------------|
| Evergreen - Sign Profiles | "aries traits", "scorpio personality" | 10K-100K/mo | Medium | Long-form guide (2000+ words) |
| Evergreen - Compatibility | "aries and libra compatibility" | 1K-10K/mo | Low-Medium | Long-form guide (1500+ words) |
| Evergreen - Birth Chart | "moon in scorpio meaning" | 5K-50K/mo | Medium | Long-form explainer |
| Cyclical - Retrogrades | "mercury retrograde 2026" | 100K-2M during events | Medium | Pre-publish before each retrograde |
| Cyclical - Lunar | "full moon march 2026 astrology" | 10K-50K/mo | Low-Medium | Bi-monthly article |

**Priority content (highest SEO ROI):**
1. 12 zodiac sign profile pages (cornerstone content) — but publish 2-3 per week, not all at once
2. Mercury retrograde guide for the next retrograde period
3. "How to Read Your Birth Chart" beginner guide
4. Top 5 highest-volume compatibility pairs

### Week 7-10: Content Production Pipeline

**Weekly content cadence (realistic for quality):**
- 2-3 blog posts per week (8-12 per month)
- Each post goes through: Agent drafts -> Ephemeris verification -> Human review -> Agent publishes

**Content pipeline (every Monday, 8 AM IST):**

1. Agent checks astrological calendar via ephemeris skill
2. Agent checks content gaps in `memory/content/editorial-calendar.md`
3. Agent generates 2-3 blog post drafts in WordPress (status: `draft`)
4. **MANDATORY: Agent runs ephemeris verification on all dates/transits mentioned**
5. Agent SEO-optimizes: title tag, meta description, focus keyword, internal links
6. Agent sends to Telegram `adclaw-content` with titles, summaries, and WP draft links
7. Human reviews, edits, approves (target: within 48 hours)
8. Agent publishes approved posts
9. Agent submits updated sitemap to Search Console (NOT Indexing API — that is for JobPosting only)

**Yoast SEO Integration:**

```javascript
wp.posts().create({
  title: 'Mercury Retrograde April 2026 — What Every Sign Needs to Know',
  content: '...full HTML content...',
  status: 'draft',
  categories: [astrologyCategory.id],
  meta: {
    _yoast_wpseo_focuskw: 'mercury retrograde april 2026',
    _yoast_wpseo_metadesc: 'Mercury goes retrograde April 12-May 5, 2026...',
    _yoast_wpseo_title: 'Mercury Retrograde April 2026 — Guide for All 12 Signs'
  }
});
```

### Week 8-10: Pinterest Foundation (Moved Earlier from Plan 1's Phase 4)

**Why moved earlier:** Market research identifies Pinterest as Tier 1 for astrology — equal priority to SEO. Pins have 3-6 month lifespans. Starting earlier means compounding value sooner.

**Research gap: Pinterest API has not been researched.** Before building automation:
1. Research Pinterest API capabilities, authentication, rate limits
2. Evaluate Tailwind as an alternative scheduling tool ($15/mo if budget allows)
3. Determine if API-based scheduling is feasible or if manual/Tailwind is the only path

**Regardless of API status, start creating pins immediately:**
- For each blog post, agent generates 2-3 pin descriptions with keywords
- Agent sends creative brief to Telegram (dimensions: 1000x1500 vertical)
- Human creates pin image using Canva (free tier or Pro)
- Human pins manually or via Tailwind
- Agent tracks which pins drive traffic (via GA4 referral data)

**Pinterest SEO:**
- Pin titles: Include primary keyword
- Pin descriptions: 200-300 chars, keyword-rich but natural
- Board names: Keyword-optimized ("Zodiac Compatibility Guides", "Monthly Horoscopes 2026")

### Week 11-12: SEO Monitoring and Optimization

**Daily SEO check (cron: 9 AM IST)**

```bash
openclaw cron add --name "daily-seo-check" \
  --cron "30 3 * * *" --tz "Asia/Kolkata" \
  --sessionTarget "session:seo-monitor" \
  --message "Run search-console skill. Pull yesterday's analytics. Compare with memory/seo/. Flag position drops >3, CTR drops >20%, new queries. Write to memory/seo/YYYY-MM-DD.md. Alert on anomalies."
```

**Weekly SEO optimization (cron: Wednesdays 10 AM IST)**

Agent reviews accumulated data:
1. Identify pages ranking 5-15 (opportunity zone)
2. Suggest content updates: expand thin sections, add internal links, update meta descriptions
3. Identify keyword cannibalization
4. Create tasks for human if manual action needed
5. Write to `memory/seo/weekly-optimization.md`

**End of Phase 2 deliverables:**
- 20-30 blog posts published and indexed
- Keyword strategy documented and prioritized
- SEO baseline established with daily monitoring
- Content production pipeline running weekly
- Pinterest presence started with pins for all published content
- Telegram content approval workflow proven
- Ephemeris verification integrated into content pipeline

---

## 6. Phase 3: Paid Campaigns (Weeks 13-20)

### Goal

Launch paid campaigns with tight budgets, strict guardrails, and careful monitoring. Only proceed if the monetization model supports paid acquisition (i.e., the site sells something or captures leads for a monetizable funnel).

**If the site is ad-revenue or affiliate only: SKIP THIS PHASE. Focus all resources on organic growth.**

### Prerequisite: Conversion Tracking (Week 13)

**This was completely missing from Plan 1.** You cannot run paid campaigns with `MAXIMIZE_CONVERSIONS` bidding without conversion tracking. Without it, Google/Meta have no signal to optimize.

1. **Set up Google Ads conversion tracking:**
   - Define conversion actions (purchase, booking, email signup, etc.)
   - Install Google Tag (gtag.js) on the site
   - Verify conversions are firing in Google Ads UI
   - Wait 2-3 days for data to flow

2. **Set up Meta Pixel:**
   - Install Meta Pixel on the site
   - Set up standard events (Lead, Purchase, etc.)
   - Verify events in Events Manager
   - Wait for pixel to accumulate data (ideally 50+ events before launching campaigns)

3. **Set up GA4 conversion events:**
   - Mark key events as conversions in GA4
   - Verify attribution is working

### Week 14-15: Google Ads Setup

**Before launching: Platform-level safety nets**
1. Google Ads UI: Set account-level daily budget cap
2. Google Ads UI: Enable billing alerts at 50%, 80%, 100% of monthly budget
3. Document all caps in MEMORY.md

**Budget Decision for Google Ads:**

| Total Monthly Budget | Google Ads Allocation | Verdict |
|---------------------|----------------------|---------|
| $300/month | $60/month ($2/day) | NOT RECOMMENDED. 30-120 clicks/month is noise. Skip Google Ads. Put everything into Meta. |
| $500/month | $100/month ($3.30/day) | Marginal. Only if targeting very specific high-intent keywords with proven conversion. |

**If proceeding with Google Ads:**

```javascript
const campaignBudget = await customer.campaignBudgets.create({
  name: 'Astro Readings - Daily Budget',
  amount_micros: toMicros(3.30),
  delivery_method: enums.BudgetDeliveryMethod.STANDARD,
});

const campaign = await customer.campaigns.create({
  name: 'Astro Readings - Search',
  campaign_budget: campaignBudget.resource_name,
  advertising_channel_type: enums.AdvertisingChannelType.SEARCH,
  status: enums.CampaignStatus.PAUSED,
  // DO NOT use MAXIMIZE_CONVERSIONS until you have 30+ conversions
  // Start with MANUAL_CPC or MAXIMIZE_CLICKS to gather data
  bidding_strategy_type: enums.BiddingStrategyType.MAXIMIZE_CLICKS,
  network_settings: {
    target_google_search: true,
    target_search_network: false,
    target_content_network: false,
  },
});
```

**Important bidding strategy note:** Plan 1 uses `MAXIMIZE_CONVERSIONS` from day one. This is wrong. Smart bidding strategies need historical conversion data to work. Start with `MAXIMIZE_CLICKS` or `MANUAL_CPC`, gather 30+ conversions, THEN switch to `MAXIMIZE_CONVERSIONS`.

**Target keywords (exact and phrase match only):**
- `[birth chart reading online]`
- `[astrology consultation]`
- `"personalized horoscope report"`
- `[natal chart reading]`

**Negative keywords:**
- `free`, `meaning`, `what is`, `definition`, `wikipedia`, `calculator`
- `learn astrology`, `astrology course`
- `zodiac sign`, `horoscope today`

### Week 16-17: Meta Ads Setup

**Prerequisite: Meta API must have Advanced Access by now.** If App Review hasn't been approved, delay this phase and continue with organic work.

**Campaign 1: Lead Generation**

Primary offer: Free personalized birth chart summary in exchange for email.

```javascript
const campaign = await account.createCampaign([], {
  [Campaign.Fields.name]: 'Astro Lead Gen - Birth Chart Offer',
  [Campaign.Fields.objective]: 'OUTCOME_LEADS',
  [Campaign.Fields.status]: Campaign.Status.paused,
  [Campaign.Fields.special_ad_categories]: [],
});
```

**Targeting:**
- Interest: Astrology, Horoscopes, Zodiac signs, Birth chart, Tarot
- Age: 25-54
- Placement: Instagram Feed, Instagram Stories, Facebook Feed

**Budget:** $3-5/day depending on total budget.

**Ad creative request (via Telegram):**

```
CREATIVE REQUEST #CR-001
Campaign: Meta Lead Gen - Birth Chart Offer
Format: 1080x1080 (Feed) + 1080x1920 (Stories)
Visual: Cosmic/zodiac aesthetic, starfield or zodiac wheel
Text overlay: 'Discover Your Cosmic Blueprint' (keep text under 20%)
CTA: 'Get Your Free Birth Chart'
Reference: brand guide in MEMORY.md
Deadline: [date]
Priority: HIGH
```

**Compliant ad copy:**
- DO: "Explore what the stars reveal about your path"
- DO: "Discover the secrets in your birth chart"
- DON'T: "Are you a Scorpio? This reading will change your life"
- DON'T: "Capricorns — your year starts now!"

### Week 18-20: Campaign Monitoring and Optimization

**Ad spend monitoring (cron: every 4 hours, NOT hourly)**

```bash
openclaw cron add --name "ad-spend-monitor" \
  --cron "0 */4 * * *" --tz "Asia/Kolkata" \
  --session isolated --lightContext \
  --message "Check Google Ads and Meta Ads spend vs daily budget. Alert if >80% spent before 6 PM. Alert if CPC up >50% vs yesterday. Alert if 0 impressions >6 hours. Log to memory/campaigns/."
```

**Why every 4 hours instead of hourly:** At $3-5/day budgets, hourly monitoring costs more in Anthropic API calls than the ad spend it's protecting. A $2/day Google Ads campaign checked hourly means ~$0.05/check x 24 = $1.20/day in monitoring costs — 60% of the ad spend itself. Every 4 hours is sufficient.

**Daily optimization (cron: 10 PM IST):**

Agent reviews:
1. Campaign-level metrics: spend, impressions, clicks, CTR, conversions, CPA
2. Keyword-level (Google): pause keywords with CPA > 2x target after 50+ clicks
3. Ad-level: pause ads with CTR < 50% of ad group average after 500+ impressions
4. Search term report (Google): add irrelevant terms as negatives
5. Log to `memory/campaigns/YYYY-MM-DD.md`

**Budget reallocation rules:**
- If Google CPA is 2x+ worse than Meta CPA for 14 consecutive days: shift 20% of Google budget to Meta
- If either platform CPA is below target: increase budget by 10% (max 20%/day)
- Never reallocate more than 30% of total budget in a single week
- Any budget increase above 20% requires human approval

**End of Phase 3 deliverables:**
- Conversion tracking verified on all platforms
- Google Ads search campaign live (if budget justifies it)
- Meta Ads lead gen campaign live
- Ad spend monitoring with alerts
- Daily optimization running
- Budget guardrails proven
- First performance report delivered

---

## 7. Phase 4: Social Presence (Weeks 21-28)

### Goal

Establish presence on X and Reddit. Agent creates content; human posts from personal accounts.

### X (Twitter) Strategy

**Posting approach:** Agent drafts; human posts from personal account.

**Why human posts:** Astrology X values personal voice. Bot-like accounts get ignored.

**Content types:**
1. Transit alerts: "Mercury enters Aries today. Communication gets bold and direct."
2. Sign threads: "Thread: What each zodiac sign does when they catch feelings"
3. Hot takes: "Hot take: Virgo risings are the most misunderstood rising sign"
4. Meme energy: Zodiac humor
5. Event-based: Celebrity charts, current events through astro lens

**Agent workflow:**
1. Daily cron (7 AM IST): Agent generates 2 tweet drafts based on today's transits
2. Sends to Telegram `adclaw-content`
3. Human reviews, personalizes, posts from their X account
4. Human sends tweet URL back to agent
5. Agent tracks (via GA4 referral data, not X API — avoid $100/month X API cost)

**X API decision: Do NOT pay for X API access.** At $100/month for Basic, it consumes 20-33% of the entire marketing budget for minimal value. Human posts manually. Agent just drafts.

### Reddit Strategy

**Critical: The agent NEVER posts directly to Reddit. Never.**

**Agent's role:**
1. Weekly cron: Agent browses target subreddits via browser skill
2. Agent drafts thoughtful responses to 3-5 trending questions
3. Sends to Telegram `adclaw-content`
4. Human reviews, personalizes, posts from their Reddit account
5. Human provides URLs back to agent

**Reddit rules the human MUST follow:**
- 90/10 rule: 90% genuine participation, 10% max self-promotion
- No site links in first 4+ weeks of participation
- Build genuine karma first
- Never automate Reddit posting — bans are permanent

### End of Phase 4 deliverables:
- X content pipeline running (agent drafts, human posts)
- Reddit engagement active (agent researches, human participates)
- Social content calendar maintained
- Cross-channel content repurposing workflow proven

---

## 8. Phase 5: Optimization and Autonomy (Weeks 29+)

### Goal

Agent runs with increasing autonomy. Human spends 1-3 hours per week on approvals, creative uploads, and strategic decisions.

### Autonomy Criteria (NOT Time-Based — Performance-Based)

Plan 1 used arbitrary week numbers. That is meaningless. Trust is earned through demonstrated performance:

| Autonomy Level | Criteria to Unlock | What Changes |
|---------------|-------------------|-------------|
| **Level 0: Full Oversight** | Default starting state | Everything requires human approval |
| **Level 1: Routine Autonomy** | 20+ blog posts published with <10% revision rate; 0 factual errors caught; 4+ weeks of ad campaigns with 0 budget overruns | Routine social content auto-posts; ad bid adjustments within 15% auto-approved; budget decreases auto-approved |
| **Level 2: Content Autonomy** | 50+ blog posts with <5% revision rate; consistent brand voice confirmed by human; 0 SEO penalties | Blog posts auto-publish after ephemeris verification passes; new ad copy within template library auto-approved |
| **Level 3: Strategic Autonomy** | 6+ months of operation; clear positive ROAS trend; 0 account bans or policy violations | Monthly budget reallocation within 20% range auto-approved; new keyword targets auto-approved |

**Emergency override always available:** Telegram command "/stop all" pauses everything immediately.

### Agent Self-Monitoring

**HEARTBEAT.md:**

```markdown
# HEARTBEAT.md

## Every heartbeat (60 min):
1. Check for pending overdue human tasks
2. Check active ad campaigns for anomalous metrics
3. Check website uptime (simple HTTP GET)
4. Check for failed scheduled content

## If issues found:
- INFO: Log only
- WARNING: Alert Telegram adclaw-alerts
- CRITICAL: Auto-pause affected campaigns + immediate Telegram alert

## Severity:
- INFO: Minor metric change
- WARNING: Notable deviation, needs attention within 24h
- CRITICAL: Budget overspend, site down, campaign error
```

### Weekly Autonomous Cycle

```
Monday 8 AM:    Generate content batch (blog, social, ad copy)
Monday 8:30:    Send to Telegram for review
Tuesday-Wed:    Human reviews (target: 1-2 hours total)
Wednesday:      Publish approved content
Thursday:       Mid-week performance check
Friday 5 PM:    Weekly performance report
Weekend:        Anomaly monitoring only
Sunday:         Plan next week based on astrological calendar
```

### Monthly Strategy Review

1st of each month, agent generates:
1. Last month's performance vs. goals
2. Budget breakdown: what was spent where, ROAS by channel
3. Top-performing content and campaigns
4. Underperforming areas and recommended changes
5. Next month's astrological calendar and content opportunities
6. Recommended budget reallocation
7. New experiments to try

Sent to Telegram. Human provides strategic direction. Agent executes.

---

## 9. Skills Map

| Skill | Purpose | npm Package | Auth | Key Operations |
|-------|---------|-------------|------|----------------|
| `search-console` | SEO monitoring | `googleapis` | Service Account | Search analytics, URL inspection, sitemap management |
| `ga4` | Website analytics | `@google-analytics/data` | Service Account | Traffic reports, conversions, real-time data |
| `wordpress` | Blog CMS | `wpapi` | App Password | Post CRUD, media upload, Yoast SEO meta |
| `ephemeris` | Astrological accuracy | `astronomia` | N/A (local) | Verify transit dates, retrogrades, lunar phases |
| `seo-audit` | On-page SEO | `axios` + `cheerio` | N/A | Crawl pages, check meta tags, heading structure |
| `google-ads` | Paid search | `google-ads-api` | OAuth 2.0 + Dev Token | Campaign CRUD, bid management, reporting |
| `meta-ads` | Paid social | `facebook-nodejs-business-sdk` | OAuth 2.0 System User | Campaign CRUD, insights, audience management |
| `reporting` | Cross-channel reports | All above | All above | Aggregate data, generate Markdown reports |
| `social-content` | Social drafting | None (agent text) | N/A | Tweet drafts, Pinterest descriptions, captions |
| `budget-guard` | Spending safety | Ads APIs | Same as ads | Check spend vs caps, enforce limits, emergency pause |
| `content-calendar` | Editorial planning | None (memory files) | N/A | Maintain calendar, plan around astro events |

**Removed from Plan 1:** `image-eval` skill. Image dimension checking can be done with `sharp` (no LLM needed). Brand compliance checking can be part of the agent's regular reasoning when reviewing uploaded images via Telegram.

---

## 10. Cron Schedule

All times in IST (Asia/Kolkata).

### Non-LLM Jobs (bash scripts, $0 cost)

```bash
# Website uptime check — every 4 hours
# Simple curl check, no LLM needed
openclaw cron add --name "uptime-check" \
  --cron "0 */4 * * *" --tz "Asia/Kolkata" \
  --session isolated --lightContext \
  --message "Run: curl -sf -o /dev/null -w '%{http_code}' https://your-site.com. If not 200, alert Telegram adclaw-alerts as CRITICAL."

# Monthly cleanup — 1st of month, 3 AM IST
openclaw cron add --name "monthly-cleanup" \
  --cron "0 21 1 * *" --tz "Asia/Kolkata" \
  --session isolated --lightContext \
  --message "Delete log files older than 7 days from /tmp/openclaw/. Delete cron run history older than 30 days. Report disk usage."
```

### Lightweight Jobs (use Haiku model override if possible)

```bash
# Ad spend monitoring — every 4 hours during active hours
openclaw cron add --name "ad-spend-monitor" \
  --cron "0 6,10,14,18,22 * * *" --tz "Asia/Kolkata" \
  --session isolated --lightContext \
  --message "Run budget-guard skill. Check spend vs daily caps. Alert if >80% spent before 6 PM. Alert if CPC up >50%. Log to memory/campaigns/."
```

### Standard Jobs (Sonnet)

```bash
# Daily SEO check — 9 AM IST
openclaw cron add --name "daily-seo-check" \
  --cron "30 3 * * *" --tz "Asia/Kolkata" \
  --sessionTarget "session:seo-monitor" \
  --message "Run search-console skill. Pull yesterday's analytics. Compare with memory/seo/. Flag position drops >3, CTR drops >20%. Write to memory/seo/YYYY-MM-DD.md."

# Daily social prep — 7 AM IST
openclaw cron add --name "daily-social-prep" \
  --cron "30 1 * * *" --tz "Asia/Kolkata" \
  --session isolated \
  --message "Check today's transits via ephemeris skill. Generate 2 tweet drafts. Send to Telegram adclaw-content."

# Daily ad optimization — 10 PM IST
openclaw cron add --name "daily-ad-optimization" \
  --cron "30 16 * * *" --tz "Asia/Kolkata" \
  --session isolated \
  --message "Run google-ads and meta-ads skills. Review today's performance. Pause keywords/ads with CPA >2x target. Add negatives from search terms. Log to memory/campaigns/YYYY-MM-DD.md."
```

### Weekly Jobs

```bash
# Monday content batch — 8 AM IST
openclaw cron add --name "weekly-content-batch" \
  --cron "30 2 * * 1" --tz "Asia/Kolkata" \
  --sessionTarget "session:content-planner" \
  --message "Check astrological calendar via ephemeris. Check content gaps. Write 2-3 blog post drafts in WordPress. Generate social content. Send to Telegram adclaw-content."

# Friday report — 5 PM IST
openclaw cron add --name "weekly-report" \
  --cron "30 11 * * 5" --tz "Asia/Kolkata" \
  --session isolated \
  --message "Generate weekly performance report from all channels. Include spend, CPA, ROAS, top content, SEO changes. Write to memory/campaigns/weekly/. Send to Telegram." \
  --announce --channel telegram --to "group:adclaw-alerts"

# Wednesday SEO optimization — 10 AM IST
openclaw cron add --name "weekly-seo-optimization" \
  --cron "30 4 * * 3" --tz "Asia/Kolkata" \
  --sessionTarget "session:seo-monitor" \
  --message "Review accumulated SEO data. Identify opportunity-zone pages (ranking 5-15). Suggest updates. Check cannibalization. Write to memory/seo/weekly-optimization.md."
```

### Monthly Jobs

```bash
# Monthly strategy — 1st of month, 10 AM IST
openclaw cron add --name "monthly-strategy" \
  --cron "30 4 1 * *" --tz "Asia/Kolkata" \
  --session isolated \
  --message "Generate monthly strategy review. 30-day data from all channels. ROAS by channel. Content performance. SEO trajectory. Budget recommendations. Write to memory/campaigns/monthly/. Send to Telegram."
```

### Estimated Monthly Cron API Cost

| Job | Frequency | Est. Cost/Run | Monthly Cost |
|-----|-----------|--------------|-------------|
| Uptime check | 6x/day | $0 (bash) | $0 |
| Ad spend monitor | 5x/day | $0.005 | $0.75 |
| Daily SEO | 1x/day | $0.01 | $0.30 |
| Daily social | 1x/day | $0.05 | $1.50 |
| Daily ad optimization | 1x/day | $0.08 | $2.40 |
| Weekly content | 1x/week | $0.15 | $0.60 |
| Weekly report | 1x/week | $0.10 | $0.40 |
| Weekly SEO opt | 1x/week | $0.08 | $0.32 |
| Monthly strategy | 1x/month | $0.20 | $0.20 |
| Monthly cleanup | 1x/month | $0 (bash) | $0 |
| Heartbeats | 16x/day | $0.005 | $2.40 |
| **Cron subtotal** | | | **~$9/month** |
| Ad-hoc interactions | ~30/month | $0.05-0.15 | $1.50-4.50 |
| Blog post generation | 8-12/month | $0.15 | $1.20-1.80 |
| **Total estimated** | | | **$12-16/month** |

**Note:** These are optimistic estimates. Real-world usage will be higher due to context window growth, retries, and longer tool-use chains. Budget $80-150/month for Anthropic API to be safe. If costs spike, reduce heartbeat frequency or switch more tasks to Haiku.

---

## 11. Human-in-the-Loop Workflows

### Creative Pipeline

```
Step 1: Agent Requests Creative (Telegram)
  "CREATIVE REQUEST #CR-XXX
   Campaign: [campaign name]
   Format: [dimensions]
   Visual: [description]
   Text overlay: [text, under 20% of image]
   CTA: [call to action]
   Reference: brand guide in MEMORY.md
   Deadline: [date]
   Priority: HIGH / MEDIUM / LOW"

Step 2: Human Creates
  Uses Canva, Midjourney, or any design tool.
  Uploads to Telegram or OpenClaw dashboard.

Step 3: Agent Verifies
  Checks dimensions programmatically (sharp library).
  Reviews content against policy guidelines.
  Responds: "APPROVED" or "NEEDS REVISION: [feedback]"

Step 4: Agent Deploys
  Uploads to Meta/Google via API.
  Creates ad with approved creative + pre-approved copy.
```

### Social Posting Pipeline

```
Step 1: Agent drafts (daily cron)
  Generates tweet/post drafts based on today's transits.
  Sends to Telegram adclaw-content.

Step 2: Human reviews
  Responds: "Post as-is" / "Edit: [changes]" / "Skip"

Step 3: Human posts
  Posts from personal account (X, Reddit).
  Sends URL back to agent.

Step 4: Agent tracks
  Saves URL to memory/content/social-calendar.md.
  Tracks referral traffic via GA4.
```

### Approval Matrix

| Action | Phase 1-4 | After Level 1 | After Level 2 | After Level 3 |
|--------|-----------|---------------|---------------|---------------|
| Blog post publish | Human required | Human required | Auto if ephemeris passes | Auto if ephemeris passes |
| Social post | Human required | Auto for routine | Auto | Auto |
| Ad copy change | Human required | Auto within templates | Auto within templates | Auto within templates |
| New campaign | Human required | Human required | Human required | Human required |
| Budget increase <20% | Human required | Auto-approved | Auto-approved | Auto-approved |
| Budget increase >20% | Human required | Human required | Human required | Human required |
| Pause underperformer | Human required | Auto-approved | Auto-approved | Auto-approved |
| Emergency pause | Auto always | Auto always | Auto always | Auto always |

---

## 12. Budget Allocation

### Scenario A: $300/Month Total

| Category | Monthly Cost | Notes |
|----------|-------------|-------|
| **Anthropic API** | $80-120 | THE largest cost. Set hard limit in console. |
| **Meta Ads** | $90-120 | $3-4/day, lead gen only. Skip Google Ads at this budget. |
| **Domain + hosting** | $10-20 | If not already covered |
| **OpenAI API** | $5-10 | Only if using for specific tasks; optional |
| **Buffer** | $30-60 | For unexpected costs |
| **Total** | $215-270 | |

**What's NOT in this budget:**
- Google Ads (not enough budget to be useful)
- Canva Pro (use free tier, accept limited templates)
- Email platform (use free tier of MailerLite, 1000 subscribers)
- SEO tools (use free alternatives only)
- X API (human posts manually)
- Pinterest scheduling tools (manual or free tier)

### Scenario B: $500/Month Total

| Category | Monthly Cost | Notes |
|----------|-------------|-------|
| **Anthropic API** | $100-150 | More agent interactions |
| **Meta Ads** | $120-150 | $4-5/day, lead gen + retargeting |
| **Google Ads** | $60-80 | $2-3/day, only high-intent keywords. Optional. |
| **Canva Pro** | $13 | Visual content for Pinterest/social |
| **Domain + hosting** | $10-20 | |
| **Email platform** | $0-15 | Free tier may suffice |
| **OpenAI API** | $5-15 | DALL-E for occasional creative generation |
| **Buffer/testing** | $30-50 | |
| **Total** | $338-493 | |

### Budget Rules Enforced by Agent

1. Platform-level daily caps set in Google Ads UI and Meta Ads UI (cannot be overridden by API)
2. Anthropic API monthly spending limit set in console.anthropic.com (cannot be overridden by agent)
3. Agent tracks cumulative spend daily, reconciles with platform numbers
4. If spend tracking shows >10% discrepancy, alert immediately
5. Monthly budget committed at start of month; no increases without human approval
6. If any channel ROAS drops below 0.5x for 14 consecutive days, recommend pausing

---

## 13. Risk Mitigation

### Ad Account Bans

| Risk | Prevention | Detection | Recovery |
|------|-----------|-----------|----------|
| Google policy violation | Pre-screen copy against forbidden phrases in MEMORY.md; never claim guaranteed predictions | Monitor ad disapprovals daily via API | Appeal within 7 days; replace offending copy |
| Meta personal attributes violation | Template library in MEMORY.md; agent checks every ad | Monitor rejection rate; if >10%, pause and audit | Edit rejected ads; restriction usually lifts in 24-72h |
| Bot-like API behavior | Max 2 budget changes/day; 20% max increase; human-like pacing | Monitor for "unusual activity" warnings | Slow down changes; add human review temporarily |
| Payment failures | Keep payment current with backup card; billing alerts | Monitor billing status weekly | Update payment immediately |

### Content Quality

| Risk | Prevention | Detection | Recovery |
|------|-----------|-----------|----------|
| Astrological inaccuracies | MANDATORY ephemeris verification on all dates/transits BEFORE publishing | Human review + reader feedback | Correct immediately; issue correction notice |
| Generic AI content | Brand voice guide; human editing pass on all blog content | Track engagement — generic content gets lower engagement | Rewrite with personality; add unique analysis |
| SEO penalty for AI content | Quality over quantity (8-12/month max); named author; unique value | Monitor Search Console for ranking drops | Reduce volume; improve quality; add expertise signals |

### Budget Overruns

| Risk | Prevention | Detection | Recovery |
|------|-----------|-----------|----------|
| Agent overspends | Platform-level daily caps (non-overridable) | Ad spend monitoring every 4 hours | Auto-pause if >100% of cap |
| Anthropic API cost spike | Hard monthly limit in console.anthropic.com | Track weekly in reporting | Reduce cron frequency; switch tasks to Haiku |
| Monthly budget creep | Committed at start of month in MEMORY.md | Weekly reconciliation in Friday report | Reduce remaining days' spend |

### Technical Failures

| Risk | Prevention | Detection | Recovery |
|------|-----------|-----------|----------|
| OpenClaw crash | launchd KeepAlive auto-restart | /healthz monitoring; Telegram heartbeat | Auto-restart; check logs if repeated |
| API token expiry | Long-lived tokens; monthly validity check | 401 errors detected by agent | Refresh tokens; regenerate if needed |
| Mac Mini offline | UPS; auto-reconnect network | Telegram bot goes offline | Auto-recovery via launchd on boot |
| Disk space | Weekly cleanup cron; log rotation | Monitor in monthly cleanup | Delete old logs; archive memory files |
| Meta API rate limit hit | Respect 60-point cap (Standard) or plan for Advanced | HTTP 429 responses; header monitoring | Back off; reduce call frequency; batch operations |

---

## 14. Legal/Compliance

### Astrology Ad Policies

**Google Ads:**
- Allowed: readings, horoscope services, birth chart analysis, education
- Not allowed: guaranteed predictions, health claims, financial advice via astrology

**Meta Ads:**
- NEVER assert personal attributes ("Are you a [sign]?" = violation)
- Frame as general: "Explore what the stars reveal" = compliant
- Expect higher-than-average rejection rates

**Compliant ad copy templates (in MEMORY.md):**

```
Google Search Ads:
- "Explore Your Birth Chart | Personalized Astrology Reading"
- "Understand Your Cosmic Blueprint | Professional Natal Chart Analysis"

Meta Ads:
- "The universe has a story written just for you. Discover it."
- "Your birth chart holds answers. Explore what the cosmos reveals."

NEVER:
- "We predict your future" / "100% accurate"
- "Are you a [sign]?" / "[Sign] — this will change your life"
- Health, financial, or relationship guarantees
```

### FTC, Privacy, Email

- "For entertainment/educational purposes" disclaimer on website
- Clear pricing and refund policies
- GDPR: Birth charts collect personal data — privacy policy required
- Cookie consent for GA4, Meta Pixel
- CAN-SPAM: Physical address, unsubscribe link, honest subject lines
- Consider voluntary AI content disclosure (builds trust)

### Reddit

- Never automate Reddit posting
- Follow each subreddit's rules
- Build karma before linking to site

---

## 15. Success Metrics

### 3 Months (End of Phase 2)

| Metric | Target (New Site) | Target (Existing Site) | How Measured |
|--------|-------------------|----------------------|-------------|
| Blog posts published | 20-30 | 20-30 added | WordPress |
| Pages indexed | 80%+ of published | 90%+ | Search Console |
| Organic impressions | 1,000+/month | Baseline + 50% | Search Console |
| Organic sessions | 100-300/month | Baseline + 30% | GA4 |
| Keywords ranking page 1 | 2-5 long-tail | 5-10 | Search Console |
| OpenClaw uptime | >95% | >95% | Heartbeat logs |
| All skills functional | 8/8 | 8/8 | Manual test |
| Content approval rate | >70% first-draft | >80% first-draft | Tracking |

### 6 Months (End of Phase 4)

| Metric | Target | How Measured |
|--------|--------|-------------|
| Organic sessions | 500-1,500/month | GA4 |
| Blog posts total | 50-70 | WordPress |
| Keywords ranking page 1 | 10-25 | Search Console |
| Email subscribers | 200-500 (if running lead gen) | Email platform |
| Pinterest monthly impressions | 5,000+ | Pinterest analytics |
| Ad spend within budget | 100% (0 overruns) | Budget reconciliation |
| Human time/week | <3 hours average | Self-tracked |
| Ad account health | 0 suspensions | Platform status |

### 12 Months

| Metric | Target | How Measured |
|--------|--------|-------------|
| Organic sessions | 3,000-10,000/month | GA4 |
| Blog posts total | 100+ | WordPress |
| Keywords ranking page 1 | 50+ | Search Console |
| Email subscribers | 1,000-3,000 | Email platform |
| Human time/week | <1 hour average | Self-tracked |
| Agent autonomy level | Level 2-3 | Approval logs |
| Content quality (approval rate) | >90% first-draft | Tracking |

### North Star Metrics

1. **Organic traffic growth rate**: MoM increase in organic sessions. Target: 20-30% MoM for first 6 months.
2. **Cost per lead** (if applicable): Total spend / leads. Target: <$5/lead.
3. **Human hours per week**: Target: <1 hour by month 12.
4. **Content velocity at quality**: Quality articles/month. Target: 8-12/month steady state.

---

## 16. Contingency Plans

### If Anthropic API Costs Exceed Budget

1. Reduce heartbeat frequency to every 2 hours
2. Switch all lightweight tasks to Haiku
3. Reduce daily social drafting to 3x/week
4. Move ad monitoring to 2x/day instead of 6x/day
5. Generate content bi-weekly instead of weekly
6. Nuclear option: reduce to essential crons only (daily SEO + weekly report + weekly content)

### If Meta Ads Account Gets Restricted

1. Pause all Meta campaigns immediately
2. Review rejected ads, identify policy violation
3. Submit appeal with corrected ads
4. While waiting: shift all paid budget to Google Ads (if running)
5. If permanent ban: focus entirely on organic + consider Reddit Ads as alternative

### If Google Penalizes AI Content

1. Immediately reduce publishing volume to 2-4 articles/month
2. Audit all published content for quality issues
3. Add substantial human editing/unique insights to all articles
4. Strengthen author bios and E-E-A-T signals
5. Build more backlinks through genuine community participation
6. Wait 2-4 months for recovery after changes

### If Organic Traffic Doesn't Grow After 6 Months

1. Audit content against competing sites
2. Check technical SEO (site speed, mobile, Core Web Vitals)
3. Evaluate keyword difficulty — may be targeting terms that are too competitive
4. Pivot to longer-tail, lower-competition keywords
5. Consider investing in backlink building (guest posts, HARO/Connectively)
6. Re-evaluate whether the niche/domain can compete

### If Human Cannot Sustain Required Time Commitment

1. Reduce content cadence (4 articles/month instead of 8-12)
2. Drop Reddit and X (no manual posting needed)
3. Focus on SEO + Meta Ads only (most automated channels)
4. Accept slower growth in exchange for sustainability
5. Consider hiring a VA for creative work ($200-400/month)

---

## Appendix: First 30 Content Pieces (Prioritized)

### Batch 1 (Weeks 5-8): Cornerstone Content

1. "How to Read Your Birth Chart: A Complete Beginner's Guide"
2. "What Is a Rising Sign and Why Does It Matter?"
3. "Aries: Personality Traits, Strengths, and Challenges"
4. "Taurus: Personality Traits, Strengths, and Challenges"
5. "Gemini: Personality Traits, Strengths, and Challenges"
6. "Cancer: Personality Traits, Strengths, and Challenges"

### Batch 2 (Weeks 9-12): Mix of Cornerstone + Cyclical

7-12. Remaining zodiac sign profiles (Leo through Pisces)
13. "Mercury Retrograde: What It Really Means (And What It Doesn't)"
14. "Mercury Retrograde [Next Date] — Survival Guide for Every Sign"
15. "[Next Month] Full Moon in [Sign] — What It Means for You"

### Batch 3 (Weeks 13-16): Compatibility + Trending

16-20. Top 5 most-searched compatibility pairs
21. "The 12 Houses in Astrology Explained"
22. "What Your Moon Sign Says About Your Emotional Needs"
23. "Saturn Return — What It Means and When It Happens"

### Batch 4 (Weeks 17-24): Expand and Deepen

24-30. Next 5 compatibility pairs + seasonal/trending content based on what's performing

---

## Appendix: Key File Paths

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
| `~/.openclaw/workspace/output/` | Reports, creatives, drafts |
| `~/.openclaw/workspace/tasks/kanban.md` | Human task board |
| `~/.openclaw/cron/jobs.json` | Scheduled job definitions |
| `~/.openclaw/secrets/` | API keys, SA JSON (gitignored) |
| `/tmp/openclaw/` | Rotating log files |

---

*Plan v2 — Created 2026-03-16. Fixes 22 issues from Plan 1. Review before execution.*
