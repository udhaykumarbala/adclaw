# AdClaw: The Definitive Product Spec

**Status:** FINAL -- the product specification a team builds from
**Constraint removed:** This plan assumes a development team with no timeline pressure. Build the best system possible.
**First principle:** Maximize autonomous value per dollar of ad spend and per minute of human attention.

---

## 1. Product Vision

### What AdClaw Is

AdClaw is a fully autonomous marketing management system that owns the entire lifecycle of digital marketing for a business -- from strategy formation through content creation, campaign deployment, performance monitoring, optimization, and reporting -- with human involvement reduced to high-judgment decisions that take seconds, not hours.

No product on the market does this. Albert.ai manages paid ads autonomously but costs $2K+/month and ignores organic channels. Jasper generates content but cannot deploy or track it. Surfer optimizes SEO but does not write, publish, or promote. Revealbot automates ad rules but cannot think strategically. Every existing tool solves one slice and forces the human to be the integration layer between them.

AdClaw eliminates the human-as-glue problem. It is a single intelligence that sees all channels, all data, all budget, all content -- and acts on the complete picture.

### What Makes It Different

1. **Full-spectrum autonomy.** Organic SEO, paid ads, social, email, content -- one agent manages all of them as a unified system, not siloed tools.
2. **Continuous learning loop.** Every piece of content published, every dollar spent, every ranking gained or lost feeds back into the agent's decision model. It gets measurably better each week.
3. **Budget intelligence.** The agent does not just pace budgets. It understands ROI at the channel, campaign, keyword, and content level, and reallocates dynamically toward what produces revenue.
4. **30-second human interactions.** When the agent needs a human, it presents a binary choice with full context: approve/reject, pick A or B, confirm budget. No research, no context-switching, no dashboard diving.
5. **Self-healing operations.** The agent detects its own failures -- broken auth tokens, API rate limits, crashed processes, degraded content quality -- and either fixes them or escalates with a specific, actionable request.
6. **Niche intelligence.** For the astrology vertical, the agent has deep domain knowledge: ephemeris-verified transit dates, seasonal content calendars, audience psychographics, compliant ad copy patterns, and monetization funnels tuned to the niche.

### What It Cannot Do (And Knows It)

- It cannot replace human judgment on brand strategy, partnerships, or crisis response.
- It cannot produce production-quality images or video (it requests them from humans with precise specs).
- It cannot authentically represent a human personality on social platforms that punish inauthenticity (it drafts, humans post).
- It cannot guarantee outcomes -- it maximizes probability through data-driven iteration.

---

## 2. System Architecture

### Overview

```
                                  +-------------------+
                                  |   Human Operator  |
                                  |   (Telegram App)  |
                                  +--------+----------+
                                           |
                              Approve/reject/upload/direct
                                           |
                     +---------------------v---------------------+
                     |           Telegram Bot Gateway             |
                     |  (grammY, inline keyboards, media upload)  |
                     +---------------------+---------------------+
                                           |
              +----------------------------v----------------------------+
              |                    OpenClaw Gateway                      |
              |  (Mac Mini, launchd daemon, port 18789)                 |
              |                                                         |
              |  +------------------+  +-------------------+            |
              |  | Session Manager  |  |   Cron Scheduler  |            |
              |  | (compaction,     |  |   (jobs.json,     |            |
              |  |  pruning, memory)|  |    retry policy)  |            |
              |  +------------------+  +-------------------+            |
              |                                                         |
              |  +------------------+  +-------------------+            |
              |  | Webhook Server   |  |   Approval Engine |            |
              |  | (/hooks/*)       |  |   (exec + Lobster)|            |
              |  +------------------+  +-------------------+            |
              |                                                         |
              |  +--------------------------------------------------+   |
              |  |              Agent Intelligence Layer              |  |
              |  |  (Priority Engine + Feedback Loops + Quality Gates)|  |
              |  +--------------------------------------------------+   |
              |                                                         |
              +---+-----------+-----------+-----------+-----------+-----+
                  |           |           |           |           |
            +-----v---+ +----v----+ +----v----+ +----v----+ +----v----+
            | Skills  | | Skills  | | Skills  | | Skills  | | Skills  |
            | SEO     | | Content | | Paid Ads| |Analytics| | Social  |
            +---------+ +---------+ +---------+ +---------+ +---------+
                  |           |           |           |           |
         +--------v-----------v-----------v-----------v-----------v------+
         |                      External APIs                            |
         |  Search Console | GA4 | WordPress | Meta Ads | Ephemeris     |
         |  Google Ads (future) | Pinterest | MailerLite | Stripe       |
         +--------------------------------------------------------------+

              +--------------------------------------------------+
              |                   Data Layer                       |
              |  memory/ (Markdown) | tasks/ (JSON) | assets/     |
              |  Vector index (SQLite) | Cron history (JSONL)     |
              +--------------------------------------------------+

              +--------------------------------------------------+
              |               Dashboard (Vite + Lit SPA)          |
              |  Task board | Campaign overview | Cron management |
              |  Creative pipeline | Real-time logs               |
              +--------------------------------------------------+
```

### Component Breakdown

**OpenClaw Gateway** -- The always-on process running as a macOS LaunchAgent. Manages agent sessions, cron scheduling, webhook endpoints, health checks, and channel connections. Native launchd provides auto-restart on crash and access to macOS capabilities (browser with logged-in sessions, screen capture).

**Agent Intelligence Layer** -- The LLM-powered decision engine. Reads from memory, invokes skills, writes back results. Uses persistent named sessions for stateful workflows (SEO monitoring accumulates context over time) and isolated sessions for independent tasks (weekly reports).

**Skills** -- Tool folders that teach the agent how to interact with specific APIs. Each skill contains a SKILL.md (instructions) and associated scripts (Node.js executors). Skills are the agent's hands.

**Cron Scheduler** -- Built-in Gateway scheduler persisting jobs across restarts. Three schedule types: one-shot (future event), interval (fixed ms), cron expression (standard syntax). Each job specifies session mode, model, and delivery target.

**Webhook Server** -- HTTP endpoints for event-driven automation. CMS publishes a post -> webhook fires -> agent distributes to social. Stripe records a sale -> webhook fires -> agent updates revenue tracking. External monitoring detects downtime -> webhook fires -> agent investigates.

**Approval Engine** -- Multi-layer approval system. Exec approvals route to Telegram DM for command execution. Lobster workflow approvals pause pipelines at defined checkpoints with durable resume tokens. Chat-based approvals handle lightweight decisions inline.

**Dashboard** -- Built-in Vite + Lit SPA at localhost:18789. Chat interface, cron management, skill administration, real-time log tailing, config editing. Extended with a custom task board and creative pipeline (see Section 8).

**Data Layer** -- Markdown files for human-readable persistent state, JSON for structured data, SQLite for vector search, JSONL for cron history. All workspace-local, git-trackable, no external database dependency.

### Why This Architecture

- **No external database.** Files + SQLite. Zero ops burden. Git-trackable state.
- **No cloud deployment.** Runs on a Mac Mini at home. Zero hosting cost beyond the machine and internet.
- **No microservices.** One process (the Gateway) orchestrates everything. Skills are just folders, not services.
- **Extensible by design.** New channel = new skill folder. New API = new script. New workflow = new cron job or Lobster definition.
- **Resilient by default.** launchd restarts the Gateway. Cron jobs resume on schedule. Persistent sessions survive compaction. Memory files survive everything.

---

## 3. Agent Intelligence Layer

This is the brain of AdClaw. Everything else is plumbing. This section defines how the agent thinks.

### 3.1 Priority Engine

The agent needs to decide what to work on next. Not everything is equally important, and not everything is equally urgent.

**Priority Framework (evaluated every heartbeat and at the start of every cron session):**

```
TIER 0: EMERGENCY (interrupt anything)
  - Ad spend exceeding daily cap
  - Website down
  - API authentication failure
  - Ad account restricted/suspended
  - Agent health degraded (memory pressure, disk full)

TIER 1: REVENUE-IMPACTING (address within hours)
  - Active campaign performance anomaly (CPA 2x+ average)
  - Keyword ranking crash (top-10 query dropped 5+ positions)
  - Conversion rate significant change (>30% drop)
  - Payment processor error (Stripe webhook failure)
  - Email deliverability issue

TIER 2: OPTIMIZATION (address within 24 hours)
  - A/B test reached statistical significance
  - New high-opportunity keyword discovered
  - Content publishing pipeline stalled (draft waiting >48 hours)
  - Budget reallocation opportunity (ROI disparity between channels)
  - Creative fatigue detected (CTR declining 3+ consecutive days)

TIER 3: GROWTH (address within the week)
  - Content calendar gap (fewer than target articles planned for next 2 weeks)
  - New content topic identified from search trends
  - Seasonal content opportunity approaching (transit, retrograde, eclipse)
  - Link building outreach opportunity
  - Social content scheduling for next week

TIER 4: STRATEGIC (address monthly)
  - Channel performance review and budget rebalancing
  - Competitor content audit
  - SEO site-wide health check
  - Content refresh for aging articles
  - Monetization funnel optimization
```

**Decision Logic:**

The agent maintains a priority queue in `memory/system/priority-queue.md`. Every cron job and heartbeat can add items. Items are processed in tier order (0 first), with FIFO within tiers. Each item includes:

```markdown
## Priority Item
- **Tier:** 0-4
- **Category:** spend-alert | seo-drop | content-gap | optimization | ...
- **Created:** ISO timestamp
- **Source:** cron:daily-seo | heartbeat | webhook:stripe | manual
- **Summary:** One-line description
- **Data:** Relevant metrics or file references
- **Action Required:** What the agent should do
- **Human Required:** Yes/No -- if yes, what the human must do
- **Deadline:** When this becomes stale or escalates
```

### 3.2 Feedback Loops

The agent learns from outcomes. Every action the agent takes should eventually produce a measurable result, and that result should influence future actions.

**Content Feedback Loop:**

```
Agent writes article
    -> Published to WordPress
    -> After 7 days: Search Console shows impressions, clicks, position
    -> After 14 days: GA4 shows engagement (time on page, bounce rate, conversions)
    -> After 30 days: Stable ranking position established
    -> Agent records in memory/learning/content-performance.md:
        - Topic category: zodiac-profile | transit-guide | compatibility | ...
        - Target keyword: [keyword]
        - Word count: [count]
        - Headings structure: [count of H2/H3]
        - Internal links: [count]
        - Had human insight section: yes/no
        - 7-day impressions: [N]
        - 30-day average position: [N]
        - Bounce rate: [%]
        - Conversions attributed: [N]
    -> Agent identifies patterns:
        - Which topic categories perform best?
        - What word count range correlates with better rankings?
        - Does human insight correlate with engagement?
        - Which keywords actually convert vs just drive traffic?
    -> Next content-batch job references these patterns when choosing topics and structuring articles
```

**Ad Performance Feedback Loop:**

```
Agent creates ad variant
    -> Runs for 48 hours minimum (statistical minimum)
    -> Agent records: creative style, copy angle, audience segment, CTA type
    -> After 7 days: CPL, CTR, ROAS calculated
    -> Agent records outcome in memory/learning/ad-performance.md:
        - Creative type: image | carousel | video
        - Copy angle: educational | emotional | urgency | curiosity
        - Audience segment: interest-astrology | lookalike | retarget
        - CTA: learn-more | sign-up | get-yours
        - CTR: [%]
        - CPL: [$]
        - Conversion rate: [%]
    -> Agent identifies winning combinations and losing patterns
    -> Next campaign creation uses these patterns to generate higher-probability variants
    -> Agent proposes killing ad variants that match known losing patterns
```

**Budget Feedback Loop:**

```
Monthly budget allocation decision
    -> Agent records: channel | allocated | spent | revenue attributed
    -> After 30 days: actual ROI per channel calculated
    -> Agent compares predicted ROI vs actual ROI
    -> Prediction error feeds into next month's allocation model
    -> Over time: allocation accuracy improves as the model accumulates data
```

**Quality Feedback Loop:**

```
Agent generates content
    -> Human edits before approving (or rejects)
    -> Agent records: original draft vs final published version
    -> Types of edits: factual correction | tone adjustment | added insight | restructure
    -> Agent learns which types of content need most editing
    -> Adjustment: increase emphasis on those quality dimensions in future drafts
    -> Track edit distance over time -- decreasing edit distance = improving quality
```

### 3.3 Budget Allocation Algorithm

The agent allocates budget using a modified Thompson Sampling approach -- a multi-armed bandit algorithm that balances exploiting known winners with exploring uncertain opportunities.

**How It Works:**

Each channel (SEO content, Meta Ads, Pinterest promoted, email) is an "arm" with a probability distribution of returns. The agent:

1. **Maintains a performance model** for each channel: historical spend, historical return (conversions, revenue), and uncertainty (how confident we are in the estimate).
2. **Samples from each channel's distribution** to get an expected return per dollar.
3. **Allocates proportional to expected return**, with a minimum exploration budget for each active channel (10% of total budget distributed equally to prevent starvation).
4. **Updates the model** monthly as new data arrives.
5. **Applies hard constraints:** no channel gets more than 60% of total budget (prevents over-concentration), no channel gets less than its minimum viable spend (below $3/day on Meta Ads is useless).

**Practical Implementation:**

This is not a complex ML model. In `memory/budget/allocation-model.md`:

```markdown
## Channel Performance Model (Updated Monthly)

### Meta Ads
- Total spend to date: $450
- Total attributed revenue: $380
- ROAS: 0.84
- Confidence: MEDIUM (3 months data)
- Trend: improving (ROAS was 0.6 -> 0.7 -> 0.84)
- Allocation recommendation: INCREASE (positive trend, approaching breakeven)

### SEO Content
- Total investment (API cost for content generation): $180
- Total attributed revenue (organic traffic -> conversions): $620
- ROAS: 3.44
- Confidence: HIGH (6 months data)
- Trend: compounding (organic traffic growing 15% MoM)
- Allocation recommendation: MAINTAIN (already at maximum content velocity)

### Pinterest
- Total spend: $0 (organic only)
- Total attributed traffic: 2,400 sessions
- Conversions from Pinterest traffic: 12
- Estimated value: $228
- Trend: steady
- Allocation recommendation: ADD promoted pins budget ($30-50/month) to test paid amplification

### Email
- Total spend (MailerLite): $30
- List size: 850
- Revenue from email campaigns: $190
- ROAS: 6.33
- Allocation recommendation: MAINTAIN (already efficient, growth limited by list size)
```

The agent writes this assessment monthly and uses it to propose the next month's budget split. Human approves or adjusts.

### 3.4 Content Generation Intelligence

The agent does not just "write blog posts." It operates a content intelligence system.

**Topic Selection:**

1. Pull current keyword data from Search Console (what are we ranking for? what are we close to ranking for?).
2. Cross-reference with ephemeris data (what astronomical events are coming in the next 30 days?).
3. Check editorial calendar for gaps (which zodiac profiles haven't been written? which compatibility guides are missing?).
4. Check content performance history (which topic categories have the best engagement/conversion?).
5. Score each potential topic: `score = (search_volume_proxy * ranking_probability * conversion_potential * timeliness) / content_effort`.
6. Select the highest-scoring topic that hasn't been written.

**Content Quality Gates:**

Before sending any draft to human review, the agent runs these checks:

| Gate | Check | Pass Criteria | Fail Action |
|------|-------|---------------|-------------|
| Factual accuracy | Ephemeris verification of all transit dates and planetary positions | All dates verified correct | Fix incorrect dates, re-verify |
| Keyword presence | Focus keyword in title, first 100 words, at least 2 H2s, meta description | All present | Add missing occurrences |
| Readability | Flesch-Kincaid grade level 8-10 (accessible but not childish) | Score in range | Simplify complex sentences or add depth |
| Word count | 1200-2500 words for blog posts | In range | Expand thin sections or trim bloat |
| Structure | Has H2 and H3 hierarchy, internal links to 2+ existing articles, no orphan sections | All present | Add structure |
| Human insight | Contains marked `[HUMAN INSIGHT NEEDED]` section with specific guidance | Section present with clear instructions | Add section |
| Uniqueness | Content adds original analysis not just reformulated generic info | Agent self-assessment | Flag for human attention |
| E-E-A-T signals | Author attribution, experience-based language, specific examples | Present | Add signals |
| CTA | Contains natural call-to-action toward birth chart calculator or PDF product | Present and non-pushy | Add subtle CTA |
| Meta | SEO title under 60 chars, meta description under 155 chars, slug is clean | All pass | Fix |

### 3.5 A/B Testing Framework

The agent does not test randomly. It follows a systematic testing protocol.

**For Ad Creatives:**

1. **Hypothesis first.** Every test has a written hypothesis: "Educational copy angles will produce lower CPL than urgency angles for the birth chart product, because astrology audiences respond to learning rather than FOMO."
2. **One variable.** Each test changes exactly one thing: copy angle, image style, CTA text, audience segment, or placement. Never multiple variables simultaneously.
3. **Minimum viable duration.** 48 hours or 200 impressions per variant, whichever comes later. No early stopping.
4. **Statistical rigor.** The agent calculates confidence intervals. It does not declare a winner on gut feel. At minimum, 90% confidence that the difference is real.
5. **Record everything.** In `memory/testing/ab-tests.md`, every test is logged with hypothesis, variants, duration, results, conclusion, and what changed as a result.
6. **Never stop testing.** There is always an active test. When one concludes, the next begins. The testing backlog is maintained in the priority queue.

**For Content:**

A/B testing content is slower (SEO takes weeks to show results), so the agent uses a different approach:

1. **Title testing.** For the same article, test 2 different titles by updating the title after 2 weeks and comparing CTR changes in Search Console.
2. **Meta description testing.** Same approach -- swap meta descriptions and measure CTR impact.
3. **Content format testing.** Track whether listicle-style vs narrative-style articles in the same category perform differently.
4. **CTA placement testing.** Alternate CTA positions (after intro, mid-article, end-of-article) across articles and track conversion rates.

---

## 4. Complete Skill Inventory

Skills are organized by domain. Each skill includes its purpose, the scripts it uses, the APIs it calls, and the data it reads/writes.

### 4.1 SEO Skills

#### search-console
- **Purpose:** Pull search analytics data, inspect URLs, check sitemaps
- **API:** Google Search Console API via `googleapis` package
- **Auth:** Google Service Account
- **Scripts:** `sc-query.js` (analytics, inspect, sitemaps commands)
- **Reads:** `memory/seo/latest.md` (for comparison)
- **Writes:** `memory/seo/latest.md`, `memory/seo/weekly-optimization.md`
- **Used by crons:** daily-seo, weekly-seo-opt, weekly-report

#### seo-audit
- **Purpose:** Comprehensive technical SEO audit of the site
- **Method:** Browser automation (Page Speed Insights API, crawl via fetch) + Search Console data
- **Scripts:** `seo-audit.js` (crawl site pages, check meta tags, heading structure, internal links, broken links, Core Web Vitals via PageSpeed API, schema markup validation)
- **Reads:** WordPress published pages list, Search Console data
- **Writes:** `memory/seo/audit-YYYY-MM-DD.md`
- **Used by crons:** monthly-seo-audit

#### keyword-research
- **Purpose:** Discover new keyword opportunities, cluster related terms, estimate difficulty
- **Method:** Analyze Search Console impression data (free proxy for search volume), Google autocomplete suggestions (browser scrape), competitor content analysis (browser fetch + parse)
- **Scripts:** `keyword-research.js` (mine SC data for impression-weighted opportunities, scrape autocomplete for cluster expansion)
- **Reads:** `memory/seo/latest.md`, published content list
- **Writes:** `memory/seo/keyword-clusters.md`, `memory/seo/opportunities.md`
- **Used by crons:** monthly-keyword-research

#### link-building
- **Purpose:** Identify link building targets and draft outreach
- **Method:** Browser to find relevant blogs, directories, resource pages that link to competitors. Draft outreach email templates.
- **Scripts:** `link-prospect.js` (search for "[niche] resource page", "[niche] blog", extract contact info)
- **Reads:** `memory/seo/competitors.md`, published content URLs
- **Writes:** `memory/seo/link-prospects.md`, `tasks/board.json` (creates human task for outreach)
- **Used by crons:** monthly-link-prospecting

### 4.2 Content Skills

#### wordpress
- **Purpose:** Create, read, update, publish blog posts and pages
- **API:** WordPress REST API via `wpapi` package
- **Auth:** Application Password
- **Scripts:** `wp-post.js` (create, update), `wp-read.js` (list, get)
- **Reads:** Editorial calendar, published post list
- **Writes:** Creates WordPress drafts, updates `memory/content/editorial-calendar.md`
- **Used by crons:** content-batch, content-publish (when human approves)

#### ephemeris
- **Purpose:** Calculate planetary positions, upcoming transits, verify astrological claims
- **API:** Swiss Ephemeris via `swisseph` package (preferred) or `astronomia` with VSOP87 data
- **Auth:** None (local computation)
- **Scripts:** `ephemeris-check.js` (positions, transits, verify)
- **Reads:** None
- **Writes:** Transit data to `memory/content/upcoming-transits.md`
- **Used by crons:** content-batch (for topic selection and fact verification), monthly-content-calendar

#### content-quality
- **Purpose:** Score content before it reaches human review
- **Method:** Automated checks -- readability scoring (Flesch-Kincaid), keyword density, heading structure validation, internal link presence, word count, meta tag completeness
- **Scripts:** `content-score.js` (takes HTML content, returns quality score with breakdowns)
- **Reads:** Published content list (for internal link suggestions)
- **Writes:** Quality score appended to draft in editorial calendar
- **Used by:** content-batch cron (runs before sending to Telegram for review)

#### email-content
- **Purpose:** Generate email newsletter content (weekly horoscope digest, product promotions, nurture sequences)
- **Method:** LLM generation guided by brand voice + current transit data
- **Scripts:** `email-draft.js` (generates email HTML from transit data + template)
- **Reads:** `memory/content/upcoming-transits.md`, brand voice from MEMORY.md, email templates from `assets/templates/`
- **Writes:** `memory/content/email-drafts/` directory
- **Used by crons:** weekly-email-draft

### 4.3 Paid Ads Skills

#### meta-ads
- **Purpose:** Full lifecycle management of Meta (Facebook/Instagram) advertising campaigns
- **API:** Meta Marketing API via `facebook-nodejs-business-sdk`
- **Auth:** System User token (long-lived), App Secret
- **Scripts:** `meta-ads-read.js` (campaigns, adsets, ads, spend-today, audience-insights), `meta-ads-mutate.js` (create-campaign, create-adset, create-ad, update-campaign, update-ad, update-budget)
- **Reads:** MEMORY.md (budget caps), `memory/campaigns/meta-ads-performance.md`, `memory/learning/ad-performance.md`
- **Writes:** `memory/campaigns/meta-ads-performance.md`
- **Used by crons:** ad-spend-monitor, ad-optimization, weekly-report, monthly-strategy
- **Guardrails:** All creates as PAUSED, budget changes capped at 20%/day, max 4 changes/hour/adset, human approval for activation

#### google-ads
- **Purpose:** Campaign management for Google Search and Display ads (activate when budget supports it)
- **API:** Google Ads API via `google-ads-api` (Opteo)
- **Auth:** OAuth 2.0 + Developer Token
- **Scripts:** `google-ads-read.js` (campaigns, keywords, search-terms, quality-scores), `google-ads-mutate.js` (create-campaign, update-bids, add-negative-keywords, pause-ads)
- **Reads:** MEMORY.md, `memory/campaigns/google-ads-performance.md`
- **Writes:** `memory/campaigns/google-ads-performance.md`
- **Guardrails:** Same as Meta -- PAUSED creates, budget caps, human approval for activation
- **Note:** Only activate when monthly ad budget reaches $300+. Below that threshold, Google Ads does not have enough data to learn.

#### ad-creative
- **Purpose:** Generate ad copy variants and coordinate creative asset requests
- **Method:** LLM generates multiple copy variants per brief. For image creatives, creates detailed specs and requests human creation. Optionally calls DALL-E/FLUX API for draft visuals.
- **Scripts:** `ad-copy-gen.js` (takes brief, returns N variants with copy angle labels), `creative-request.js` (creates task in board.json with specs for human designer)
- **Reads:** `memory/learning/ad-performance.md` (which copy angles work), brand voice
- **Writes:** `tasks/creative-requests/`, `tasks/board.json`
- **Used by:** ad-optimization cron (when creative refresh needed), manual trigger

### 4.4 Analytics Skills

#### ga4
- **Purpose:** Pull website traffic, engagement, and conversion data
- **API:** GA4 Data API via `@google-analytics/data`
- **Auth:** Google Service Account (same as Search Console)
- **Scripts:** `ga4-query.js` (traffic, pages, realtime, conversions, funnel)
- **Reads:** Previous reports for comparison
- **Writes:** GA4 data embedded in weekly/monthly reports
- **Used by crons:** weekly-report, monthly-strategy, ad-optimization (for conversion tracking)

#### anomaly-detection
- **Purpose:** Detect significant changes in any metric that warrant attention
- **Method:** Compare current period to rolling average. Flag deviations exceeding 2 standard deviations. Uses simple statistical methods -- no ML model needed.
- **Scripts:** `anomaly-check.js` (takes metric name, current value, historical values, returns significance assessment)
- **Reads:** All historical data in memory/
- **Writes:** Priority queue items for detected anomalies
- **Used by crons:** daily-seo (calls anomaly check on traffic metrics), ad-spend-monitor (calls anomaly check on spend/CPL)

#### attribution
- **Purpose:** Understand which channels and content drive actual conversions
- **Method:** GA4 conversion data cross-referenced with source/medium. Last-touch attribution by default, with first-touch data captured when available.
- **Scripts:** `attribution-report.js` (pulls conversion events with source data, builds attribution table)
- **Reads:** GA4 conversion data, Meta Ads conversion data
- **Writes:** `memory/analytics/attribution-YYYY-MM.md`
- **Used by crons:** monthly-strategy

#### funnel-analysis
- **Purpose:** Track user progression through the conversion funnel
- **Method:** GA4 funnel report: landing page -> birth chart calculator -> free result -> purchase page -> purchase completion
- **Scripts:** `funnel-report.js` (defines funnel steps, pulls GA4 funnel data, calculates drop-off rates)
- **Reads:** GA4 data
- **Writes:** `memory/analytics/funnel-YYYY-MM.md`
- **Used by crons:** monthly-strategy

### 4.5 Social Skills

#### social-content
- **Purpose:** Draft social media posts for all platforms, with platform-appropriate formatting
- **Method:** LLM generates platform-specific content from blog posts or standalone briefs. Formats for character limits, hashtag conventions, and platform tone.
- **Scripts:** `social-draft.js` (takes content or topic, target platforms, returns formatted drafts per platform)
- **Reads:** Published blog posts (for promotion), upcoming transits (for timely content), brand voice
- **Writes:** `memory/content/social-calendar.md`, `tasks/board.json` (assigns posting tasks to human)

#### pinterest
- **Purpose:** Create and schedule Pinterest pin descriptions, request pin images
- **Method:** Generate pin descriptions optimized for Pinterest search. Create detailed specs for pin images. Optionally call Pinterest API for scheduling (if budget supports Tailwind or direct API access).
- **Scripts:** `pinterest-draft.js` (generate pin descriptions and image specs from blog content)
- **Reads:** Published blog posts, pin performance data
- **Writes:** `memory/content/pinterest-queue.md`, `tasks/board.json` (for manual pinning tasks)

#### social-monitor
- **Purpose:** Monitor social media engagement and mentions
- **Method:** Browser automation to check engagement metrics on posted content. No API for X (too expensive at $100/month) or Reddit (archived SDK only). Use browser fetch for public page metrics.
- **Scripts:** `social-check.js` (fetch public engagement metrics from specified URLs)
- **Reads:** Social content calendar (URLs of posted content)
- **Writes:** `memory/social/engagement-YYYY-MM-DD.md`
- **Used by crons:** weekly-social-monitor

### 4.6 System Skills

#### health-check
- **Purpose:** Verify all API tokens are valid, all services are reachable, system resources are healthy
- **Scripts:** `health-check.js` (tests each API credential, checks disk space, checks memory usage, pings website)
- **Writes:** `memory/system/health-YYYY-MM-DD.md`
- **Used by crons:** daily-health-check

#### budget-guard
- **Purpose:** Centralized budget tracking and enforcement
- **Method:** Reads spend data from all paid channels, compares against configured caps, calculates run rates, projects end-of-month spend
- **Scripts:** `budget-check.js` (aggregates spend across Meta Ads + Google Ads + Anthropic API, compares to caps in MEMORY.md)
- **Reads:** MEMORY.md (budget caps), Meta/Google spend data, Anthropic usage
- **Writes:** `memory/budget/daily-spend-YYYY-MM-DD.md`, priority queue items for overspend alerts
- **Used by crons:** daily-budget-check

---

## 5. Automation vs Human Matrix

Every marketing action falls into one of four categories based on two dimensions: can the agent technically do it, and should the agent do it without human review.

### Full Agent Autonomy (No Human Involved)

| Action | Method | Why Autonomous |
|--------|--------|----------------|
| Pull Search Console data | API | Read-only, no risk |
| Pull GA4 data | API | Read-only, no risk |
| Pull Meta Ads performance data | API | Read-only, no risk |
| Monitor ad spend vs budget | API | Read-only, critical for safety |
| Pause overspending campaigns | API | Protective action, time-sensitive |
| Detect ranking drops | API + analysis | Read-only + alerting |
| Generate weekly/monthly reports | LLM + API data | Output is informational |
| Update memory files | File write | Internal state management |
| Run SEO audits | API + browser scrape | Read-only analysis |
| Identify keyword opportunities | SC data analysis | Read-only analysis |
| Score content quality | Automated checks | Pre-human-review filter |
| Verify astrological dates | Ephemeris computation | Factual verification |
| Schedule cron jobs | System | Operational management |
| Detect anomalies | Statistical analysis | Early warning system |
| Add negative keywords to ad campaigns | API | Protective, cost-saving, low risk |
| Pause underperforming individual ads | API | Protective, follows pre-approved rules |
| Log cleanup and disk management | System | Maintenance |

### Agent Creates, Human Reviews Before Deploy

| Action | Method | Why Human Review |
|--------|--------|-----------------|
| Blog post draft | LLM + WordPress API | Content quality, brand voice, E-E-A-T |
| Email newsletter content | LLM | Tone, accuracy, subscriber relationship |
| Ad copy variants | LLM | Compliance, brand alignment, sensitivity |
| Social media post drafts | LLM | Authenticity, cultural awareness |
| New ad campaign creation | API (created PAUSED) | Real money at stake, strategy alignment |
| Campaign activation | API | Explicit human consent to spend |
| Budget increase on any campaign | API | Must confirm dollar commitment |
| New audience targeting segment | API (not launched) | Targeting strategy is high-judgment |
| Landing page changes | WordPress API | Conversion impact, brand consistency |
| Monthly budget reallocation | Agent proposes, human confirms | Strategic financial decision |

### Agent Requests, Human Executes

| Action | Why Human Must Do It | Agent Provides |
|--------|---------------------|----------------|
| Post to X/Twitter | X API costs $100/month Basic tier; authenticity matters; personal account needed | Full post text, hashtags, optimal timing, thread structure |
| Post to Reddit | Bots get banned; community authenticity non-negotiable | Subreddit target, post content, engagement guidelines |
| Post to Instagram/TikTok | Personal account, visual content, no viable API at this tier | Caption text, hashtag set, posting time, content brief |
| Create Pinterest pins in Canva | Visual design beyond agent capability | Pin descriptions, dimensions, mood board reference, text overlay copy |
| Create ad images | Production visual creative beyond current AI quality | Detailed spec: dimensions, mood, color palette, text copy, reference examples |
| Record video content | Requires human presence and voice | Script, talking points, optimal length, platform specs |
| Manual outreach emails | Personal relationship building | Email template, target list, personalization notes |
| Respond to community comments | Authentic engagement requires human judgment | Suggested response drafts, context |

### Human Only (Agent Should Not Attempt)

| Action | Why |
|--------|-----|
| Brand strategy and positioning | Core business judgment |
| Product decisions (pricing, new products) | Strategic, not tactical |
| Crisis management | Reputation-critical, needs human nuance |
| Partnership and collaboration decisions | Relationship-dependent |
| Legal and compliance final sign-off | Liability |
| Creative direction (visual brand) | Aesthetic judgment |
| Personal consultations/readings | Core service requiring human connection |
| Account recovery (ad platform bans) | Platform relationship management |

---

## 6. Data Model

### 6.1 Memory File Structure

```
workspace/
  MEMORY.md                              # Brand identity, strategy, budget caps, channel config
  HEARTBEAT.md                           # Periodic check instructions

  memory/
    system/
      priority-queue.md                  # Active priority items
      health-YYYY-MM-DD.md              # Daily health check results

    seo/
      latest.md                          # Most recent SEO snapshot (overwritten daily)
      weekly-optimization.md             # Latest weekly SEO suggestions
      keyword-clusters.md               # Discovered keyword opportunities
      opportunities.md                   # Ranking opportunity zones
      competitors.md                     # Competitor content analysis
      audit-YYYY-MM-DD.md              # Periodic full audit results
      link-prospects.md                  # Link building targets

    content/
      editorial-calendar.md             # Master content plan + status tracker
      social-calendar.md                # Social posting schedule
      pinterest-queue.md                # Pins to create/post
      upcoming-transits.md              # Next 30 days of astrological events
      email-drafts/                     # Pending email content

    campaigns/
      meta-ads-performance.md           # Rolling Meta Ads data (append-only)
      google-ads-performance.md         # Rolling Google Ads data
      weekly/
        YYYY-MM-DD.md                   # Weekly report archive
      monthly/
        YYYY-MM.md                      # Monthly report archive

    budget/
      allocation-model.md              # Channel ROI model + allocation plan
      daily-spend-YYYY-MM-DD.md        # Daily spend tracking

    analytics/
      attribution-YYYY-MM.md           # Monthly attribution report
      funnel-YYYY-MM.md                # Monthly funnel analysis

    social/
      engagement-YYYY-MM-DD.md         # Social engagement tracking

    learning/
      content-performance.md           # What content patterns work (feedback loop data)
      ad-performance.md                # What ad patterns work
      keyword-conversions.md           # Which keywords actually drive revenue
      audience-insights.md             # What audience segments respond

    alerts/
      YYYY-MM-DD.md                    # Alert history
```

### 6.2 Task Board Schema

`tasks/board.json`:

```json
{
  "version": 2,
  "tasks": [
    {
      "id": "T-001",
      "type": "creative-request",
      "status": "requested",
      "priority": 2,
      "title": "Create Pinterest pin for 'Mercury Retrograde March 2026' article",
      "description": "Need a vertical pin (1000x1500px) with celestial/mercury theme...",
      "created": "2026-03-16T09:30:00+05:30",
      "created_by": "agent:content-batch",
      "assigned_to": "human",
      "deadline": "2026-03-18T18:00:00+05:30",
      "specs": {
        "dimensions": "1000x1500",
        "format": "PNG",
        "text_overlay": "Mercury Retrograde March 2026: What to Expect",
        "mood": "mystical, deep blue/purple, celestial",
        "reference": "https://pinterest.com/pin/example"
      },
      "attachments": [],
      "telegram_message_id": null,
      "completed_at": null,
      "result": null
    },
    {
      "id": "T-002",
      "type": "social-post",
      "status": "ready",
      "priority": 3,
      "title": "Post weekly horoscope thread to X",
      "description": "Thread of 13 tweets (intro + 12 signs) for this week's horoscope",
      "created": "2026-03-16T08:00:00+05:30",
      "created_by": "agent:social-content",
      "assigned_to": "human",
      "deadline": "2026-03-17T10:00:00+05:30",
      "content": {
        "platform": "x",
        "format": "thread",
        "posts": ["Tweet 1 text...", "Tweet 2 text..."],
        "hashtags": ["#weeklyhoroscope", "#astrology"]
      },
      "completed_at": null,
      "result": {
        "url": null,
        "engagement": null
      }
    }
  ],
  "counters": {
    "next_id": 3,
    "total_created": 2,
    "total_completed": 0,
    "total_cancelled": 0
  }
}
```

**Task Types:**

| Type | Created By | Assigned To | Example |
|------|-----------|-------------|---------|
| `creative-request` | Agent | Human | "Create ad image with these specs" |
| `social-post` | Agent | Human | "Post this content to X" |
| `content-review` | Agent | Human | "Review and approve this blog draft" |
| `ad-approval` | Agent | Human | "Approve activation of this campaign" |
| `budget-approval` | Agent | Human | "Approve budget increase to $X/day" |
| `manual-task` | Agent | Human | "Upload email list to MailerLite" |
| `investigation` | Agent | Human | "Ad account restricted -- investigate and appeal" |
| `fix-required` | Agent | Human | "WordPress Application Password expired -- regenerate" |

**Task Statuses:**

```
requested -> ready -> in_progress -> review -> done
                  \-> cancelled
                  \-> blocked (waiting on dependency)
```

### 6.3 Creative Pipeline Schema

`tasks/creative-requests/CR-001.json`:

```json
{
  "id": "CR-001",
  "status": "requested",
  "type": "ad-image",
  "campaign": "birth-chart-lead-gen",
  "spec": {
    "dimensions": "1080x1080",
    "format": "PNG or JPG",
    "primary_text": "Discover Your Cosmic Blueprint",
    "headline": "Free Birth Chart Reading",
    "description": "Enter your birth details and get an instant reading",
    "mood": "mystical but modern, dark background with constellation elements",
    "colors": ["#1a1a3e", "#7b68ee", "#ffd700"],
    "do": ["Include celestial imagery", "Make text legible on mobile", "Include subtle CTA"],
    "dont": ["No zodiac wheel clipart", "No excessive text", "No stock photo people"],
    "reference_urls": ["https://example.com/ref1.png"],
    "platform_specs": {
      "meta": { "primary_text_limit": 125, "headline_limit": 40 },
      "safe_zone": "Keep important elements in center 80%"
    }
  },
  "created": "2026-03-16T10:00:00+05:30",
  "deadline": "2026-03-19T18:00:00+05:30",
  "human_uploaded": null,
  "agent_review": null,
  "final_asset": null,
  "telegram_thread_id": null
}
```

**Creative Pipeline Flow:**

```
Agent identifies need (new campaign, creative fatigue, A/B test)
    |
    v
Agent creates CR-XXX.json with detailed specs
    |
    v
Agent sends spec to Telegram (adclaw-content group) with inline preview of requirements
    |
    v
Human creates asset in Canva/design tool
    |
    v
Human uploads image to Telegram (reply to the request message)
    |
    v
Agent receives image, stores in assets/creatives/CR-XXX.[ext]
    |
    v
Agent reviews: correct dimensions? text legible? matches spec?
    (Uses vision capability to check)
    |
    +--> PASS: Agent marks CR as "approved", deploys to ad platform
    |
    +--> FAIL: Agent sends feedback via Telegram:
              "Image is 800x600, needs 1080x1080. Text 'Free Reading'
               is cut off on the right side. Please resize and resubmit."
              Human revises and re-uploads.
```

### 6.4 A/B Test Record Schema

`memory/testing/ab-tests.md`:

```markdown
## AB-012: Copy Angle Test - Educational vs Curiosity
- **Status:** CONCLUDED
- **Platform:** Meta Ads
- **Campaign:** birth-chart-lead-gen
- **Hypothesis:** Educational copy ("Learn what your birth chart reveals") will outperform curiosity copy ("You won't believe what your birth chart says") for CPL
- **Variable:** Ad primary text (copy angle)
- **Control (A):** Educational - "Your birth chart is a map of the sky at the moment you were born. Discover what the planets reveal about your personality, relationships, and life path."
- **Variant (B):** Curiosity - "There's something hidden in the stars from the moment you were born. Your birth chart holds the answers. Are you ready to find out?"
- **Audience:** Same (astrology interest, 25-45, US)
- **Duration:** 7 days (March 1-7, 2026)
- **Results:**
  - A: 3,200 impressions, 89 clicks, 12 leads, CTR 2.78%, CPL $2.91
  - B: 3,150 impressions, 104 clicks, 8 leads, CTR 3.30%, CPL $4.37
- **Winner:** A (Educational) -- 33% lower CPL, 95% confidence
- **Insight:** Higher CTR does not mean better conversion. Curiosity drives more clicks but educational copy attracts more qualified leads.
- **Action Taken:** Paused variant B. All future lead-gen campaigns use educational copy angle as baseline.
- **Follow-up Test:** Test educational + social proof vs educational alone (AB-013)
```

---

## 7. Cron & Scheduling

### Complete Schedule

All times in IST (UTC+5:30). Cron expressions in UTC (IST - 5:30).

#### Every 30 Minutes (Active Hours 8AM-10PM IST)

| Job | Purpose | Model | Session |
|-----|---------|-------|---------|
| heartbeat | Check Telegram messages, monitor active campaigns, check website uptime | Haiku | main |

#### Hourly

| Job | Purpose | Model | Session |
|-----|---------|-------|---------|
| health-ping | Hit /healthz, verify gateway is responsive | None (curl) | N/A |

#### 3x Daily (Weekdays, when ads are running)

| Job | Cron (UTC) | Purpose | Model |
|-----|-----------|---------|-------|
| ad-spend-monitor | 30 3,8,13 * * 1-5 | Check Meta/Google spend vs daily cap | Haiku |

#### Daily

| Job | Cron (UTC) | Purpose | Model |
|-----|-----------|---------|-------|
| daily-seo | 0 4 * * * | Pull Search Console data, compare with yesterday, alert on drops | Haiku |
| daily-budget-check | 0 15 * * * | Aggregate all channel spend, project monthly total, alert if pacing over | Haiku |
| daily-health-check | 0 22 * * * | Verify all API tokens, check disk space, test connectivity | Haiku |

#### Weekly

| Job | Day/Cron (UTC) | Purpose | Model |
|-----|---------------|---------|-------|
| content-batch | Tue 3:00 | Draft 1-2 blog posts, generate social content, create Pinterest specs | Sonnet |
| weekly-seo-opt | Wed 5:00 | Analyze ranking opportunities, suggest optimizations | Sonnet |
| weekly-email-draft | Wed 14:00 | Draft weekly horoscope email newsletter | Sonnet |
| weekly-social-monitor | Thu 8:00 | Check engagement on posted social content | Haiku |
| weekly-report | Fri 13:00 | Full performance report across all channels | Sonnet |
| ad-optimization | Wed + Sat 16:00 | Review ad performance, propose changes | Sonnet |
| weekly-cleanup | Sun 22:00 | Log rotation, disk cleanup, session pruning | Haiku |

#### Monthly

| Job | Cron (UTC) | Purpose | Model |
|-----|-----------|---------|-------|
| monthly-strategy | 1st, 5:00 | Comprehensive review + next month strategy + budget reallocation proposal | Sonnet |
| monthly-seo-audit | 15th, 5:00 | Full technical SEO audit | Sonnet |
| monthly-keyword-research | 8th, 5:00 | Discover new keyword opportunities, update clusters | Sonnet |
| monthly-content-calendar | 1st, 8:00 | Plan next month's content based on transits + performance data | Sonnet |
| monthly-link-prospecting | 20th, 5:00 | Find link building opportunities, create outreach tasks | Sonnet |

### Estimated Monthly Cost

| Category | Jobs | Runs/Month | Cost/Run | Monthly |
|----------|------|-----------|----------|---------|
| Heartbeats | 1 | 420 (14hrs x 30 days) | $0.002 | $0.84 |
| Haiku crons | 5 | ~250 | $0.003 | $0.75 |
| Sonnet crons | 8 | ~50 | $0.08-0.15 | $5.00 |
| Ad-hoc queries | - | ~60 | $0.05 | $3.00 |
| **Subtotal** | | | | **$9.59** |
| Context growth + retries (3x) | | | | **$28.77** |
| **Realistic total** | | | | **$30-50/month** |

### Phase-In Schedule

**Week 1:** heartbeat, daily-seo, weekly-report, weekly-cleanup, daily-health-check (5 jobs)
**Week 2-3:** content-batch, weekly-seo-opt (7 jobs)
**Week 4:** weekly-email-draft, weekly-social-monitor (9 jobs)
**Week 6+ (ads launch):** ad-spend-monitor, ad-optimization, daily-budget-check (12 jobs)
**Month 2+:** monthly-strategy, monthly-seo-audit, monthly-keyword-research, monthly-content-calendar, monthly-link-prospecting (17 jobs)

Never add more than 2-3 new cron jobs per week. Each new job must run successfully for 5+ cycles before adding the next.

### What Triggers What (Event Chains)

```
daily-seo detects ranking crash
    -> Adds TIER 1 item to priority queue
    -> Alerts Telegram immediately
    -> weekly-seo-opt picks it up and investigates
    -> May trigger content-batch to write update/improvement

ad-spend-monitor detects overspend
    -> TIER 0: immediately pauses lowest-performing campaign
    -> Alerts Telegram
    -> Human reviews and approves resumed campaigns

content-batch publishes draft
    -> Sends to Telegram for review
    -> Human approves
    -> Agent publishes via WordPress API
    -> WordPress webhook fires -> /hooks/agent
    -> Agent creates social media distribution tasks
    -> Agent creates Pinterest pin specs
    -> Agent updates editorial calendar

monthly-strategy identifies underperforming channel
    -> Proposes budget reallocation
    -> Sends proposal to Telegram
    -> Human approves
    -> Agent updates MEMORY.md budget caps
    -> All subsequent ad-spend-monitor runs use new caps

Stripe webhook fires (purchase event)
    -> /hooks/agent receives purchase data
    -> Agent updates revenue tracking in memory
    -> Agent attributes to source channel
    -> Feeds into budget allocation model
```

---

## 8. Human-in-the-Loop UX

### 8.1 Telegram Experience

Telegram is the primary human interface. The design principle: the human should be able to manage everything from their phone in under 5 minutes per day.

**Telegram Groups:**

| Group | Purpose | What Appears Here |
|-------|---------|-------------------|
| `adclaw-alerts` | Urgent alerts + performance reports | Budget alerts, ranking drops, API failures, weekly/monthly reports |
| `adclaw-content` | Content review + creative pipeline | Blog drafts for review, social post drafts, creative requests, email drafts |

**Telegram DM (Admin):**
- Exec approval requests (when agent needs to run a command)
- Direct commands to agent ("Generate a blog post about the upcoming eclipse")
- Quick status checks ("/status")

**Interaction Patterns:**

**30-Second Approval:**
```
AGENT (adclaw-content):
  NEW DRAFT: "Mercury Retrograde March 2026: Survival Guide"
  WP Link: [admin edit link]
  Quality Score: 87/100 (readability: 92, SEO: 85, structure: 84)
  Focus keyword: "mercury retrograde march 2026"

  Human action: Review the [HUMAN INSIGHT] section and either:
  - Reply APPROVED to publish as-is
  - Reply with revision notes
  - Reply REJECT with reason
```

**One-Tap Budget Alert:**
```
AGENT (adclaw-alerts):
  WARNING: Meta Ads spend at $4.12 (82% of $5.00 daily cap)
  at 3:30 PM IST. Projected to exceed by 6 PM.

  [PAUSE ALL] [REDUCE 20%] [IGNORE TODAY]
```

The inline keyboard buttons map directly to agent actions. One tap, done.

**Creative Request with Full Spec:**
```
AGENT (adclaw-content):
  CREATIVE REQUEST: CR-015 - Instagram ad image

  Dimensions: 1080x1080 PNG
  Headline text: "Discover Your Cosmic Blueprint"
  Mood: Mystical, dark celestial, gold accents
  Reference: [attached reference image]

  Deadline: Thursday 6 PM

  Upload the image as a reply to this message.
```

Human takes a photo, makes it in Canva, or generates with an AI tool. Uploads as reply. Agent picks it up automatically.

**Weekly Digest (every Friday):**
```
AGENT (adclaw-alerts):
  WEEKLY REPORT: March 10-16, 2026

  TRAFFIC: 1,240 sessions (+12% WoW)
    Organic: 680 | Pinterest: 310 | Meta Ads: 180 | Direct: 70

  SEO: 2 new page-1 rankings
    "pisces compatibility" -> position 7 (was 14)
    "birth chart calculator" -> position 9 (was 22)

  ADS: $32.50 spent | 14 leads | CPL $2.32
    Best ad: "Educational v3" at $1.90 CPL

  CONTENT: 2 articles published, 4 Pinterest pins

  REVENUE: $57 (3 PDF sales)

  AGENT TIME SAVED: ~6.5 hours of manual work automated

  ACTION ITEMS:
  1. "Pisces compatibility" article needs internal links (agent will handle)
  2. Creative refresh needed for ad set B (request coming Monday)
```

### 8.2 Dashboard Experience

The OpenClaw built-in dashboard provides the web interface. Extend it with custom views for marketing-specific needs.

**Task Board View:**
- Kanban columns: Requested -> In Progress -> Review -> Done
- Filter by type (creative, social-post, content-review, approval)
- Each card shows: title, priority, deadline, who assigned
- Click to expand: full spec, attachments, conversation history
- Action buttons: Mark Done, Upload Asset, Send to Agent

**Campaign Overview:**
- Active campaigns across all channels
- Real-time spend vs budget gauges
- Key metrics: CPL, CTR, ROAS per campaign
- Trend charts (7-day rolling)
- One-click pause per campaign

**Content Calendar:**
- Monthly calendar view
- Color-coded by content type (blog, social, email, pin)
- Status indicators (planned, drafted, in-review, published)
- Astrological events overlaid (retrogrades, eclipses, full moons)
- Click to preview draft or published article

**Performance Dashboard:**
- Organic traffic trend (30/60/90 day)
- Keyword ranking tracker (top 20 keywords)
- Revenue attribution by channel
- Funnel visualization with conversion rates
- A/B test status board

### 8.3 Mobile-First Design Principles

All critical actions must be completable on a phone via Telegram:
1. **No dashboard required for daily operations.** Telegram handles all approvals, alerts, and status checks.
2. **Binary choices.** Every approval is approve/reject with context. No open-ended questions.
3. **Rich previews.** Article drafts include word count and quality score. Ad performance includes visual indicators (arrows up/down).
4. **Batch operations.** Weekly content batch arrives as a single message with numbered items. Reply "APPROVE 1,3" or "APPROVE ALL."
5. **Undo available.** Every action that can be undone (pause campaign, revert publish) is acknowledged with an undo option for 5 minutes.

---

## 9. Monitoring & Self-Healing

### 9.1 What the Agent Monitors

| Layer | What | How | Frequency |
|-------|------|-----|-----------|
| Infrastructure | Gateway process alive | launchd KeepAlive + /healthz endpoint | Continuous |
| Infrastructure | Disk space | `df -h` in health check | Daily |
| Infrastructure | Memory usage | `vm_stat` in health check | Daily |
| Infrastructure | Internet connectivity | Ping + DNS resolve | Every heartbeat |
| APIs | All API tokens valid | Test call to each service | Daily |
| APIs | Rate limit proximity | Track remaining quota from response headers | Per-call |
| Website | HTTP status | curl -sf | Every 4 hours |
| Website | Response time | curl timing | Every 4 hours |
| Website | SSL certificate expiry | openssl check | Weekly |
| Ads | Spend vs budget | Meta/Google API | 3x/day (weekdays) |
| Ads | Campaign status changes | Meta/Google API | 3x/day |
| Ads | Account health (restrictions) | Meta/Google API | Daily |
| SEO | Ranking changes | Search Console API | Daily |
| SEO | Indexing issues | URL Inspection API | After each publish |
| SEO | Traffic anomalies | GA4 + statistical analysis | Daily |
| Content | Draft aging (>48hrs unreviewed) | Task board timestamps | Every heartbeat |
| Content | Publishing pipeline stalls | Editorial calendar check | Daily |
| Budget | Monthly spend projection | Aggregate all channels | Daily |
| Budget | Channel ROI divergence | Performance data | Weekly |
| Quality | Content quality scores trending down | Score history analysis | Weekly |
| Quality | Ad creative fatigue (CTR declining) | Meta/Google performance data | Ad optimization cron |

### 9.2 Self-Healing Actions

| Problem Detected | Autonomous Fix | Escalation Trigger |
|-----------------|----------------|-------------------|
| Gateway crashed | launchd auto-restarts | If 3+ restarts in 1 hour |
| Session too large (context overflow) | Auto-compaction | Never (handled internally) |
| Disk >80% full | Run cleanup script, prune old logs/sessions | If still >80% after cleanup |
| Single API token expired | Log alert, skip dependent cron jobs | Always (human must refresh token) |
| Website returns 5xx | Retry 3x over 15 minutes | If still down after 15 min |
| Ad overspending | Pause lowest-performer | Always alert human |
| Meta rate limit hit | Back off 5 minutes, retry once | If retry fails |
| Cron job fails | Retry with exponential backoff (30s->1m->5m->15m->60m) | After 3 consecutive failures |
| Ad account restricted | Pause all campaigns in that account | Always (human must investigate) |
| Ranking crash (>5 positions on top-10 query) | Investigate in next SEO cron, propose fix | Always alert human |
| Content quality score below threshold | Block from publishing, request revisions | If 3+ consecutive low scores (systemic issue) |
| Budget projection exceeds monthly cap | Reduce daily budgets proportionally | Always alert human with proposed adjustment |
| Webhook endpoint unreachable | Queue events, retry when available | After 1 hour of failed delivery |

### 9.3 Alert Severity Levels

```
CRITICAL (red, immediate Telegram DM to admin):
  - Ad account suspended
  - Website down for 15+ minutes
  - Daily spend exceeded 120% of cap
  - All API auth failed simultaneously

WARNING (yellow, Telegram group alert):
  - Single API token expired
  - Spend pacing above 80% before 5PM
  - Ranking drop >5 positions
  - Cron job failed after 3 retries
  - Content pipeline stalled >48 hours

INFO (blue, included in weekly report only):
  - New keyword entered top 20
  - A/B test reached significance
  - Monthly spend on track
  - Content quality score above average

RESOLVED (green, follow-up to prior alert):
  - "RESOLVED: Website back up after 12 minutes"
  - "RESOLVED: Meta token refreshed successfully"
```

### 9.4 Dead Man's Switch

If the agent has not sent any Telegram message (including heartbeat confirmations) for 6 hours during active hours (8AM-10PM IST), something is fundamentally broken. Set up a separate, independent monitoring service (UptimeRobot free tier, hitting the /healthz endpoint) to alert via email/SMS when the gateway is unreachable. This monitor is independent of the agent itself.

---

## 10. Performance Optimization Engine

This is how AdClaw gets better over time, automatically.

### 10.1 Content Performance Tracking

Every published article is tracked across three time horizons:

| Horizon | When | Metrics | Action |
|---------|------|---------|--------|
| Immediate (48 hours) | 2 days post-publish | Indexed? Crawled? Any initial impressions? | If not indexed, submit to Indexing API, check for noindex issues |
| Short-term (7-14 days) | 1-2 weeks | First impressions, initial position, first clicks | Record baseline. If zero impressions after 14 days, investigate (content too thin, wrong keyword, technical issue) |
| Medium-term (30-60 days) | 1-2 months | Stable ranking position, click volume, bounce rate, conversions | Record in learning/content-performance.md. Identify if article is winner (page 1) or needs optimization (page 2) or is dead (page 3+) |
| Long-term (90+ days) | 3+ months | Sustained traffic, revenue attribution, backlinks earned | Content refresh candidates. High-traffic low-conversion -> optimize CTA. Declining traffic -> update and refresh. |

### 10.2 Keyword Learning

```
Initial keyword targeting (based on search volume + estimated difficulty)
    -> Publish content targeting keyword
    -> Track actual ranking over 30-90 days
    -> Record: keyword, content quality score, ranking achieved, time to rank
    -> Over time, build model of:
        - Which difficulty level keywords we can realistically rank for
        - How long it takes to rank for various competition levels
        - Which content formats rank best for which query types
        - Which keywords actually convert (not just drive traffic)
    -> Adjust keyword selection criteria based on learned model
    -> Prioritize keywords where: estimated difficulty <= proven capability AND search volume meets threshold AND conversion probability is above average
```

### 10.3 Audience Discovery

For paid campaigns, the agent systematically expands audience knowledge:

```
Start with seed audiences (astrology interest, 25-45, US)
    -> Run campaigns, collect conversion data
    -> Analyze converter profiles (what other interests do they have?)
    -> Create lookalike audiences from converters
    -> Test demographic variations (age brackets, geo)
    -> Record: audience segment, CPL, conversion rate, ROAS
    -> Build audience performance model:
        - Best performing age brackets
        - Best performing geos
        - Best performing interest combinations
        - Diminishing returns point for each audience (when does scaling hurt CPL?)
    -> Next campaign: allocate budget proportional to audience ROI
    -> Continuously test 10-20% of budget on new audience segments (exploration)
```

### 10.4 Dynamic Budget Reallocation

The agent does not wait for monthly reviews to shift budget. Within pre-approved bounds:

**Intra-Week Reallocation (autonomous, within same channel):**
- If ad set A has CPL 50%+ better than ad set B after 200+ impressions each, shift 20% of B's budget to A
- Maximum 1 reallocation per ad set per day
- Always maintain minimum viable budget per ad set ($3/day minimum)

**Cross-Channel Reallocation (requires human approval):**
- Monthly proposal: "Meta Ads ROAS improved to 2.1x. SEO content investment yielding 3.5x. Recommend shifting $30/month from Meta to content production (more articles = more long-term organic traffic)."
- Human approves or modifies
- Agent implements immediately

### 10.5 Killing Underperformers

The agent follows strict rules for stopping things that don't work:

**Ad-Level Kill Rules:**
- CTR below 0.5% after 1,000+ impressions -> Pause
- CPL more than 2.5x campaign average after 48+ hours -> Pause
- Zero conversions after $20 spend -> Pause
- CTR declining for 5 consecutive days -> Creative fatigue, pause and request new creative

**Campaign-Level Kill Rules:**
- Average CPL above $5 for 14 consecutive days -> Pause campaign, alert human for strategic review
- Zero conversions for 7 consecutive days (with 50+ clicks) -> Pause, investigate landing page
- Total spend exceeds 3x revenue attributed to campaign -> Recommend kill

**Content-Level Kill Signals:**
- Article published 90+ days with zero impressions -> Technical SEO issue, investigate and fix
- Article on page 3+ after 60 days -> Consider rewrite with different angle, or accept as low priority
- Article driving traffic but zero conversions -> Optimize CTA placement and copy

---

## 11. Integration Map

### External Service Registry

| Service | Purpose | Auth Method | Token Type | Refresh | Failure Mode |
|---------|---------|-------------|------------|---------|-------------|
| **Anthropic API** | LLM inference (agent brain) | API key | `sk-ant-*` | Never expires (key rotation recommended quarterly) | Agent cannot think. All crons fail. CRITICAL. |
| **Google Search Console** | SEO data | Google Service Account | JSON key file | Never expires | SEO monitoring blind. WARNING. |
| **Google Analytics 4** | Traffic + conversion data | Google Service Account | JSON key file (same as SC) | Never expires | Analytics blind. WARNING. |
| **WordPress REST API** | Content publishing | Application Password | Base64 user:pass | Never expires (until revoked) | Cannot publish content. WARNING. |
| **Meta Marketing API** | Paid ad management | System User token | Long-lived token | Potentially never (system user) | Ad management blind. Check spend caps still enforce at platform level. WARNING. |
| **Telegram Bot API** | Human communication | Bot token | String from BotFather | Never expires | Human comms broken. CRITICAL (use email fallback). |
| **Stripe Webhooks** | Revenue tracking | Webhook secret | Signing key | Never expires (until rotated) | Revenue attribution missing. WARNING. |
| **Swiss Ephemeris** | Astrological calculations | None (local) | N/A | N/A | Content fact-checking disabled. Low priority. |
| **MailerLite** | Email marketing | API key | `ml-*` | Never expires | Email automation stalled. LOW. |
| **Google Ads API** | Paid search management (future) | OAuth 2.0 + Dev Token | Refresh token | Refresh token auto-renews | Search ad management blind. WARNING. |
| **PageSpeed Insights** | Core Web Vitals | API key (optional) | String | Never expires | SEO audit incomplete. LOW. |

### Auth Health Check Protocol

The daily-health-check cron runs this sequence:

```
1. Anthropic: POST /v1/messages with minimal prompt -> expect 200
2. Google SA: list SC sites -> expect 200
3. WordPress: GET /wp-json/wp/v2/posts?per_page=1 -> expect 200
4. Meta: GET /me?access_token=TOKEN -> expect user object
5. Telegram: getMe API call -> expect bot info
6. Stripe: GET /v1/balance -> expect 200
7. Website: curl -sf SITE_URL -> expect 200

For each: record status in memory/system/health-YYYY-MM-DD.md
If ANY fails: alert Telegram with specific service name and error
```

### Token Refresh Calendar

Even "never expires" tokens should be verified monthly and rotated annually:

| Token | Verify | Rotate | How |
|-------|--------|--------|-----|
| Anthropic API key | Monthly (daily-health-check) | Annually | console.anthropic.com > new key > update env > restart gateway |
| Google SA key | Monthly | Annually | GCP Console > create new key > download > replace file > restart |
| WP App Password | Monthly | Annually | WP Admin > Profile > revoke old > create new > update .env |
| Meta System User | Monthly | Annually | Business Settings > generate new token > update .env |
| Telegram Bot | Monthly | Never (unless compromised) | BotFather > /revoke > /newbot (disruptive, avoid) |

---

## 12. The Astrology Niche Playbook

### 12.1 Monetization Model

**Primary Product: Personalized Birth Chart PDF Reports**
- Price: $19 (single report), $39 (bundle: birth chart + yearly forecast)
- Cost: $0 marginal (auto-generated from ephemeris data + template)
- Delivery: Automated via Stripe + email
- Target: 20-40 sales/month at steady state = $380-$760/month

**Secondary Products (Phase 2, month 6+):**
- Compatibility Report: $14 (requires two birth dates)
- Yearly Forecast PDF: $24 (updated annually per sign)
- Monthly Horoscope Email: Free tier (grows email list) + Premium ($4.99/month for extended readings)

**Tertiary Revenue (Phase 3, month 12+):**
- Affiliate partnerships with astrology apps (Co-Star, Pattern, TimePassages)
- Sponsored content (astrology-adjacent brands: crystals, wellness, meditation)
- Ad revenue from site traffic (AdSense/Mediavine once traffic qualifies)

### 12.2 Content Pillars

Organized by search intent and funnel position:

**Pillar 1: Zodiac Fundamentals (Top of Funnel)**
- 12 zodiac sign profiles (cornerstone content)
- 144 compatibility articles (12 x 12 pairings)
- Planet in sign articles (Sun in Aries, Moon in Scorpio, etc.)
- House placement guides (Sun in 7th house, etc.)
- Beginner guides: "How to Read Your Birth Chart," "What is a Rising Sign"

**Pillar 2: Transit & Event Content (Mid-Funnel, Time-Sensitive)**
- Mercury Retrograde guides (3-4x/year, MASSIVE search spikes)
- Eclipse season content (4-6x/year)
- Monthly horoscopes (12 articles/month per sign)
- New/Full Moon guides (2x/month)
- Seasonal content (Aries Season, Scorpio Season, etc.)
- Planet retrograde guides (Venus, Mars, Jupiter, Saturn)

**Pillar 3: Deep Astrology (Authority Building)**
- Saturn Return guide (major life transit, high search volume ages 27-30)
- Chiron Return guide
- North/South Node interpretations
- Synastry (relationship astrology) deep dives
- Electional astrology (choosing auspicious dates)

**Pillar 4: Lifestyle & Practical (Engagement + Virality)**
- "Best [activity] for Each Zodiac Sign" articles
- Zodiac gift guides (seasonal, commercial intent)
- Astrology and career/relationships/parenting angles
- Celebrity birth chart analyses (trending hooks)

### 12.3 Keyword Clusters

**Cluster 1: High Volume, Moderate Competition (Primary Targets)**
- `[sign] horoscope today/this week/this month` (e.g., "aries horoscope today") -- 100K+ monthly each
- `mercury retrograde [year]` -- 500K+ during retrograde periods
- `[sign] compatibility` (e.g., "leo and aquarius compatibility") -- 10K-50K each
- `birth chart` / `natal chart` -- 200K+ monthly
- `what is my rising sign` -- 50K+

**Cluster 2: High Intent, Lower Competition (Conversion Targets)**
- `birth chart reading online` -- Direct conversion intent
- `personalized horoscope report` -- Product search
- `astrology birth chart interpretation` -- Deep interest signal
- `[sign] birth chart meaning` -- Education + product bridge

**Cluster 3: Long-Tail, Low Competition (Quick Wins)**
- `moon in [sign] in [house]` -- Hundreds of combinations, 100-1K searches each
- `[sign] [sign] compatibility [year]` -- Time-stamped variants
- `[planet] retrograde in [sign] meaning` -- Specific transit queries
- `saturn return in [sign]` -- Generational queries with high intent

**Cluster 4: Seasonal Spikes (Calendar-Driven)**
- `[month] [year] horoscope` -- Monthly refresh, capture new year search spikes
- `mercury retrograde [month] [year]` -- Plan and publish 2 weeks before each retrograde
- `[sign] season [year]` -- Publish 1 week before season starts
- `solar eclipse [month] [year]` -- Publish 2 weeks before eclipse

### 12.4 Social Strategy by Platform

**Pinterest (Primary Social Channel):**
- 10-15 pins per week (mix of fresh and repins)
- Pin types: zodiac infographics, compatibility charts, transit calendars, article promotions
- Pin format: 1000x1500px vertical, text overlay with clear headline
- Board structure: one per zodiac sign + transits + compatibility + lifestyle
- SEO: titles and descriptions keyword-rich for Pinterest search
- Goal: drive traffic to blog articles and birth chart calculator
- Measurement: monthly click-throughs, saves, and impressions

**Instagram (Secondary, for brand building):**
- 4-5 posts per week: mix of carousels, single images, Reels
- Content: daily/weekly horoscope graphics, zodiac memes, astro-education carousels
- Stories: daily transit update, polls ("Which sign is most [trait]?"), behind-the-scenes
- Reels: 30-60s transit explanations, zodiac humor, monthly forecasts
- Bio link: Linktree or direct to birth chart calculator
- Engagement: respond to every comment for first 1000 followers, then daily engagement rounds
- Goal: build community, drive traffic to bio link
- Note: Agent drafts all captions and carousels. Human posts from personal account.

**X/Twitter (Tertiary, for authority):**
- 1-2 posts per day: transit updates, one-line horoscope predictions, article shares
- Threads: weekly horoscope threads (13 tweets: intro + 12 signs)
- Engagement: reply to trending astrology conversations, quote-tweet relevant content
- Goal: establish expertise, drive traffic to blog
- Note: Agent drafts all content. Human posts from personal account.

**Reddit (Minimal, for research and credibility):**
- Do NOT post links or promote. Participate genuinely in r/astrology and r/AskAstrologers.
- Answer questions with detailed, helpful responses (agent drafts, human posts)
- After 3+ months of genuine participation, occasional content sharing is tolerated
- Primary value: understand audience questions (content research) and build reputation

**Email (Retention engine):**
- Weekly horoscope digest (sent Sunday evening for the week ahead)
- New article notifications (2-3x/month)
- Product launch emails (birth chart PDF, seasonal reports)
- Welcome sequence: 5-email series introducing the site, astrology basics, and birth chart calculator
- Goal: build owned audience, drive repeat traffic, convert to paid products

### 12.5 Paid Ad Funnel Design

```
STAGE 1: AWARENESS (Meta Ads, $2-3/day)
  Target: Interest in astrology, 25-45, US/UK/Canada/Australia
  Ad format: Single image or short video
  Copy angle: Educational ("Your birth chart reveals...")
  CTA: "Get Your Free Birth Chart"
  Landing page: /free-birth-chart-calculator
  Pixel event: ViewContent
       |
STAGE 2: LEAD CAPTURE (on-site)
  User enters birth date, time, location
  Gets instant free result (Sun, Moon, Rising)
  Pixel event: Lead
  Email capture: "Get your full 20-page report delivered to your inbox"
       |
STAGE 3: CONVERSION (on-site + email)
  Upsell: "Unlock Your Complete Birth Chart Interpretation - $19"
  Payment: Stripe checkout
  Pixel event: Purchase
  Delivery: Automated PDF via email
       |
STAGE 4: RETENTION (email)
  Welcome sequence (days 1, 3, 5, 7, 14)
  Weekly horoscope digest
  Product upsells: compatibility report, yearly forecast
  Pixel event: Repeat Purchase
       |
STAGE 5: RETARGETING (Meta Ads, $1-2/day)
  Target: Website visitors who used calculator but didn't buy
  Ad format: Carousel showing sample pages from PDF report
  Copy: "Your complete birth chart interpretation is waiting"
  CTA: "Get Your Full Report"
  Duration: 7-30 day retarget window
```

### 12.6 Email Capture Strategy

- **Primary lead magnet:** Free birth chart calculator (instant result)
- **Secondary lead magnets:** "Your Monthly Horoscope" PDF (email-gated), "Mercury Retrograde Survival Guide" (email-gated during retrograde periods)
- **Capture points:** After free birth chart result ("Email me my full chart summary"), blog post CTAs ("Get your weekly horoscope"), exit-intent popup, footer newsletter signup
- **Expected opt-in rate:** 5-10% of calculator users, 2-3% of blog visitors
- **Email platform:** MailerLite (free up to 1,000 subscribers, automation included)
- **List hygiene:** Remove unengaged subscribers quarterly (no opens in 90 days)

### 12.7 Seasonal Calendar

The agent pre-plans content around these annual astrological events:

| Month | Major Events | Content to Prepare |
|-------|-------------|-------------------|
| January | Capricorn Season, New Year forecasts | "2027 Horoscope for [Sign]" x12, yearly forecast PDFs |
| February | Aquarius Season, Valentine's Day | Compatibility content, love horoscopes |
| March | Pisces Season, often Mercury Rx | Mercury retrograde guide, Pisces deep-dive |
| April | Aries Season (Astrological New Year) | New beginnings content, Aries profiles |
| May | Taurus Season, often eclipse season | Eclipse guide, grounding/earthy content |
| June | Gemini Season, Cancer Season start | Summer solstice content, communication themes |
| July | Cancer Season, often Mercury Rx | Retrograde guide, home/family astrology |
| August | Leo Season, Virgo Season start | Creative expression, birthday season content |
| September | Virgo Season, Libra Season start | Fall equinox, back-to-routine astrology |
| October | Libra Season, Scorpio Season start, often eclipse season | Eclipse guide, relationship focus, Halloween astrology |
| November | Scorpio Season, Sagittarius start, often Mercury Rx | Transformation content, retrograde guide |
| December | Sagittarius Season, Capricorn start | Year-in-review, holiday gift guides by sign |

**Pre-publish rule:** Retrograde guides published 2 weeks before retrograde starts. Eclipse guides published 3 weeks before eclipse. Monthly horoscopes published 3 days before month starts.

---

## 13. Budget Engine

### 13.1 Budget Architecture

```
TOTAL MONTHLY BUDGET: $X (set by human in MEMORY.md)
    |
    +-- Agent Operations (fixed costs)
    |     Anthropic API: $30-50/month (hard cap: $100)
    |     Hosting: $15-25/month
    |     MailerLite: $0-10/month
    |     Domain/SSL: $2/month
    |     Total fixed: $47-87/month
    |
    +-- Ad Spend (variable, managed by agent within limits)
    |     Meta Ads: $0-200/month (daily cap set at platform level)
    |     Google Ads: $0-150/month (daily cap set at platform level)
    |     Pinterest Promoted: $0-50/month
    |     Total ads: $0-400/month
    |
    +-- Tools (as needed)
    |     Canva Pro: $13/month (optional, for human designer)
    |     Total tools: $0-13/month
    |
    +-- Reserve: 10% of total budget (for unexpected costs or opportunity spending)
```

### 13.2 Daily Spend Limits

Set at the PLATFORM level (cannot be overridden by agent or API):

| Channel | Daily Cap | Monthly Max | When to Increase |
|---------|-----------|-------------|------------------|
| Meta Ads | $5/day | $150/month | When CPL < $3 for 14 consecutive days AND monthly revenue from Meta traffic > Meta spend |
| Google Ads | $5/day | $150/month | When quality score > 7/10 on primary keywords AND conversion rate > 2% |
| Anthropic API | N/A (monthly cap $100) | $100/month | Only if reducing cron frequency twice failed to control costs |

### 13.3 Automatic Reallocation Rules

The agent follows these rules autonomously (no human approval needed for intra-channel moves):

**Rule 1: Winner Takes More**
If ad set A has CPL 40%+ lower than ad set B for 7+ days with 100+ conversions each, shift 20% of B's budget to A. Maximum one shift per ad set per week.

**Rule 2: Kill the Loser**
If an ad has zero conversions after $25 spend, pause it. No exceptions.

**Rule 3: Creative Rotation**
When the winning ad's CTR drops 20% from its peak over 7 days (creative fatigue signal), request new creative and prepare replacement.

**Rule 4: Dayparting**
If data shows conversions concentrate in specific hours (e.g., 8PM-11PM), propose schedule adjustment. Implement after 30 days of data minimum.

### 13.4 Emergency Stop Triggers

Agent IMMEDIATELY pauses ALL campaigns (no human approval needed) when:

1. Daily spend across all platforms exceeds 150% of combined daily cap
2. CPA exceeds 5x the 30-day average (anomaly)
3. Click fraud detected (CTR >15% with zero conversions)
4. Ad account receives policy warning/restriction notification
5. Website is down (no point paying for traffic that can't convert)
6. Payment processor (Stripe) is returning errors (can't collect revenue)

After emergency pause:
- Send CRITICAL alert to Telegram DM
- Log full context in memory/alerts/
- Do NOT auto-resume. Human must explicitly approve resume.

### 13.5 ROI-Based Budget Scaling

Monthly, the agent calculates effective ROI per channel and proposes scaling:

```
Channel ROI = (Revenue attributed to channel) / (Total cost of channel including agent time)

If ROI > 2.0x for 2 consecutive months:
    -> Propose 25% budget increase for that channel
    -> "Meta Ads ROI is 2.3x. Recommend increasing daily cap from $5 to $6.25. Expected additional revenue: $X/month."

If ROI between 1.0x and 2.0x:
    -> Maintain current allocation
    -> "Meta Ads ROI is 1.4x. Maintaining current budget. Focus on optimizing CPL."

If ROI below 1.0x for 2 consecutive months:
    -> Propose 30% budget reduction
    -> "Google Ads ROI is 0.6x. Recommend reducing daily cap from $5 to $3.50. Savings can be redirected to better-performing channels."

If ROI below 0.5x for 3 consecutive months:
    -> Propose channel kill
    -> "Google Ads ROI is 0.3x after 3 months. Recommend pausing entirely and redirecting budget to Meta Ads (ROI 2.1x)."
```

### 13.6 Monthly Budget Reconciliation

On the 2nd of each month, the agent generates a reconciliation report:

```markdown
## Budget Reconciliation: [Month Year]

### Planned vs Actual
| Category | Planned | Actual | Variance |
|----------|---------|--------|----------|
| Anthropic API | $60 | $52 | -$8 (under) |
| Meta Ads | $120 | $134 | +$14 (over due to scaling winning campaign) |
| Google Ads | $90 | $78 | -$12 (under due to lower traffic) |
| Hosting | $20 | $20 | $0 |
| MailerLite | $0 | $0 | $0 |
| **Total** | **$290** | **$284** | **-$6** |

### Revenue
| Source | Revenue |
|--------|---------|
| Birth Chart PDFs | $342 (18 sales) |
| Compatibility Reports | $84 (6 sales) |
| **Total** | **$426** |

### Net P&L
Revenue: $426 - Costs: $284 = **Net: +$142**

### Month-over-Month Trend
[Jan: -$180, Feb: -$90, Mar: -$20, Apr: +$60, May: +$142]

### Recommendation for Next Month
Increase Meta Ads budget to $150 (from $120). ROAS 2.55x justifies increase.
Maintain all other allocations.
```

---

## 14. Quality Assurance

### 14.1 Content Quality Scoring

Every piece of content is scored before reaching human review. The score is a composite of automated checks:

**Blog Post Quality Score (0-100):**

| Dimension | Weight | Check | Scoring |
|-----------|--------|-------|---------|
| Readability | 15% | Flesch-Kincaid grade level | 8-10: full marks. 6-7 or 11-12: partial. Outside: fail. |
| Keyword Optimization | 15% | Focus keyword in title, H2, first 100 words, meta desc, URL | All 5: full marks. Each missing: -3 points. |
| Structure | 15% | H2 count (3-6), H3 usage, paragraph length (<300 words each), lists present | Full marks if all present. |
| Internal Links | 10% | Links to 2+ existing published articles | 2+: full marks. 1: half. 0: zero. |
| Word Count | 10% | 1200-2500 words for standard articles | In range: full marks. Within 200 of bounds: partial. |
| Meta Tags | 10% | Title <60 chars, description <155 chars, slug clean | All pass: full marks. |
| Human Insight Section | 10% | [HUMAN INSIGHT NEEDED] section present with clear guidance | Present: full marks. |
| Factual Accuracy | 10% | All astrological dates/positions verified via ephemeris | All verified: full marks. Any failure: zero (blocks publishing). |
| CTA Presence | 5% | Natural call-to-action present (not forced) | Present: full marks. |

**Minimum threshold for human review: 70/100.** Below 70, agent must revise and re-score before sending.

**Minimum threshold for publishing: 80/100** (after human review and edits).

### 14.2 Ad Creative Testing Framework

**Pre-Launch Checks:**
1. Image dimensions match platform requirements (1080x1080 for feed, 1080x1920 for stories)
2. Text overlay under 20% of image area (Meta best practice, though no longer enforced)
3. Ad copy does not violate personal attributes policy (no "Are you a [sign]?" phrasing)
4. CTA matches landing page content (no bait-and-switch)
5. Landing page loads in under 3 seconds
6. Tracking pixel fires on landing page (verified)

**Post-Launch Testing Protocol:**
1. Every new creative runs as a test against the current champion
2. Minimum test duration: 48 hours or 200 impressions (whichever is later)
3. Minimum test budget: $10 per variant
4. Statistical significance required: 90% confidence
5. Maximum simultaneous tests: 3 (to avoid diluting data)
6. Test log maintained in `memory/testing/ab-tests.md`

### 14.3 SEO Content Verification

Before any article is published:

1. **Title tag:** Under 60 characters, contains focus keyword, compelling
2. **Meta description:** Under 155 characters, contains focus keyword, includes CTA
3. **URL slug:** Clean, contains keyword, no stop words, under 5 words
4. **Heading hierarchy:** H1 (title only), H2s for major sections, H3s for subsections, no skipped levels
5. **Image alt text:** All images have descriptive alt text containing relevant keywords
6. **Schema markup:** Article schema with author, datePublished, dateModified
7. **Internal links:** Minimum 2 links to other site articles, using keyword-relevant anchor text
8. **External links:** 1-2 links to authoritative sources (establishes trust)
9. **Mobile rendering:** Content readable without horizontal scroll (spot-check via browser tool)
10. **Page speed:** Article page loads under 3 seconds on mobile (check via PageSpeed API)

### 14.4 Astrological Accuracy Verification

This is the most important quality gate for this niche. Incorrect astrological information destroys credibility instantly.

**Mandatory Checks:**
- Every mention of a planet "being in" a sign must be verified against ephemeris for the stated date
- Every retrograde start/end date must be verified
- Every eclipse date/type must be verified
- Every aspect (conjunction, opposition, trine, square) between planets must be verified for the stated date range
- Sign season dates (when the sun enters each sign) must be verified

**Prohibited:**
- Stating exact times for transits (the agent's ephemeris has day-level accuracy, not minute-level)
- Making up aspects or transits that sound plausible but aren't real
- Confusing tropical and sidereal zodiac (the site uses tropical unless explicitly stated)
- Using outdated transit information from the LLM's training data instead of live ephemeris calculations

**Process:**
```
Agent writes draft
    -> Ephemeris skill extracts all astronomical claims from text
    -> Each claim verified against computed positions
    -> Any discrepancy flagged with both the claim and the correct data
    -> Draft updated with corrections
    -> Verification report included in the draft sent to human review
```

### 14.5 Brand Voice Consistency

Maintained via MEMORY.md brand voice section, referenced by every content-generating cron job:

```markdown
## Brand Voice

### Tone
- Warm, knowledgeable, encouraging
- Mystical but grounded -- we honor the tradition while staying practical
- Never preachy, never condescending, never doom-and-gloom
- Treats astrology as a tool for self-understanding, not fortune-telling

### Language
- Use "the stars suggest" not "the stars will"
- Use "may experience" not "will experience"
- Avoid absolute predictions ("you WILL meet someone" is prohibited)
- Use inclusive language -- astrology applies to everyone regardless of background

### Vocabulary
- Say "birth chart" not "natal chart" (more accessible)
- Say "rising sign" not "ascendant" (in introductory content)
- Say "compatibility" not "synastry" (unless in deep-dive content)
- Use zodiac sign names, not glyph symbols, in body text

### Formatting
- Use the reader's zodiac sign name, never their zodiac emoji
- Capitalize zodiac sign names (Aries, not aries)
- Write out planet names (Mercury, not Hg)
- Dates in "Month Day, Year" format (March 16, 2026)
```

---

## 15. Metrics & KPIs

### 15.1 Organic Metrics

| Metric | Source | Frequency | Target (Month 6) | Target (Month 12) |
|--------|--------|-----------|-------------------|--------------------|
| Total organic sessions | GA4 | Weekly | 2,000/month | 8,000/month |
| Organic search clicks | Search Console | Daily | 1,500/month | 6,000/month |
| Total search impressions | Search Console | Daily | 50,000/month | 200,000/month |
| Page 1 rankings (top 10) | Search Console | Weekly | 10 keywords | 40 keywords |
| Average position (tracked keywords) | Search Console | Weekly | <20 | <12 |
| Pages indexed | Search Console | Monthly | 40 | 100+ |
| Domain authority proxy (referring domains) | Manual check | Monthly | 10 | 30 |
| Backlinks earned | Manual check | Monthly | 20 | 80+ |

### 15.2 Paid Metrics

| Metric | Source | Frequency | Target (Month 6) | Target (Month 12) |
|--------|--------|-----------|-------------------|--------------------|
| ROAS (return on ad spend) | Meta/Google + Stripe | Weekly | 1.5x | 2.5x |
| Cost per lead (CPL) | Meta/Google | 3x/day | <$3.00 | <$2.00 |
| Click-through rate (CTR) | Meta/Google | 3x/day | >1.5% | >2.0% |
| Cost per click (CPC) | Meta/Google | Weekly | <$1.50 | <$1.00 |
| Quality score (Google) | Google Ads | Weekly | >6/10 | >8/10 |
| Impression share | Meta/Google | Weekly | >30% | >50% |
| Conversion rate (click to purchase) | GA4 + Stripe | Weekly | >2% | >3.5% |

### 15.3 Social Metrics

| Metric | Source | Frequency | Target (Month 6) | Target (Month 12) |
|--------|--------|-----------|-------------------|--------------------|
| Pinterest monthly viewers | Pinterest Analytics | Monthly | 10,000 | 50,000 |
| Pinterest click-throughs | Pinterest Analytics | Weekly | 300/month | 1,500/month |
| Pinterest saves | Pinterest Analytics | Weekly | 200/month | 1,000/month |
| Instagram followers | Manual check | Monthly | 500 | 3,000 |
| Instagram engagement rate | Manual check | Monthly | >3% | >4% |
| X followers | Manual check | Monthly | 200 | 1,000 |
| Email subscribers | MailerLite | Weekly | 500 | 2,500 |
| Email open rate | MailerLite | Weekly | >30% | >30% |
| Email click rate | MailerLite | Weekly | >5% | >5% |

### 15.4 Content Metrics

| Metric | Source | Frequency | Target (Month 6) | Target (Month 12) |
|--------|--------|-----------|-------------------|--------------------|
| Articles published | Editorial calendar | Weekly | 4-6/month | 6-8/month |
| Average quality score | Content scoring | Weekly | >80 | >85 |
| Time to publish (draft to live) | Task board | Weekly | <72 hours | <48 hours |
| Index rate | Search Console | Monthly | >90% | >95% |
| Ranking velocity (days to page 2) | Search Console | Monthly | <45 days | <30 days |
| Content that ranks page 1 within 90 days | Search Console | Monthly | >20% | >35% |
| Pinterest pins per article | Manual count | Weekly | 2-3 | 3-5 |
| Social posts per article | Manual count | Weekly | 3-5 | 5-8 |

### 15.5 Business Metrics

| Metric | Source | Frequency | Target (Month 6) | Target (Month 12) |
|--------|--------|-----------|-------------------|--------------------|
| Revenue (total) | Stripe | Weekly | $300/month | $800/month |
| Revenue per session | GA4 + Stripe | Monthly | $0.15 | $0.10 (higher traffic, stable rev/session) |
| PDF report sales | Stripe | Weekly | 15/month | 40/month |
| Customer acquisition cost | Total costs / new customers | Monthly | <$15 | <$8 |
| Lifetime value (LTV) | Stripe repeat purchase analysis | Quarterly | $25 | $40 |
| Monthly recurring revenue (email premium) | Stripe | Monthly | $0 | $200+ |
| Break-even date | Budget reconciliation | Monthly | Month 7-9 | Achieved |
| Total P&L | Reconciliation | Monthly | -$100 to -$50 | +$200 to +$400 |

### 15.6 Agent Operational Metrics

| Metric | Source | Frequency | Target |
|--------|--------|-----------|--------|
| Tasks completed (by agent) | Task board | Weekly | >20/week |
| Tasks completed (by human) | Task board | Weekly | <10/week |
| Human time required | Self-report | Weekly | <2 hours/week by month 6 |
| Cron job success rate | Cron run history | Weekly | >95% |
| Mean time to detect anomaly | Alert log | Monthly | <4 hours |
| Mean time to resolve (agent-fixable) | Alert log | Monthly | <30 minutes |
| API cost per task | Anthropic usage / tasks completed | Monthly | <$0.25 |
| Content edit distance (agent draft vs final publish) | Content scoring | Monthly | Decreasing over time |
| A/B tests completed | Test log | Monthly | >4 |
| False positive alerts | Alert log review | Monthly | <10% of alerts |

### 15.7 Reporting Cadence

| Report | Audience | Frequency | Delivery |
|--------|----------|-----------|----------|
| Daily status | Agent internal + human glance | Daily 9:30 AM | Telegram (only if issues) |
| Weekly performance | Human operator | Friday 7 PM | Telegram + memory archive |
| Monthly strategy | Human operator | 1st of month | Telegram + memory archive |
| Monthly reconciliation | Human operator | 2nd of month | Telegram + memory archive |
| Quarterly business review | Human operator | Quarterly | Full report in memory + Telegram summary |

---

## Summary: The System at Steady State

At month 12, here is what a typical week looks like:

**What the agent does autonomously (zero human involvement):**
- Monitors SEO rankings and traffic daily, detects anomalies
- Tracks ad spend 3x/day, paces budgets, pauses overspenders
- Generates and scores content drafts
- Manages A/B tests (creates variants, measures results, picks winners)
- Produces weekly and monthly reports
- Maintains editorial calendar aligned with astrological events
- Proposes budget reallocation based on ROI data
- Detects creative fatigue and requests refreshes
- Monitors all API health and system resources
- Kills underperforming ads automatically
- Optimizes winning campaigns within approved bounds
- Generates email newsletter content
- Creates social media post drafts for all platforms
- Verifies astrological accuracy of all content
- Tracks attribution and funnel metrics

**What the human does (<2 hours/week):**
- **Monday (10 min):** Glance at Telegram. If nothing flagged, skip.
- **Tuesday (20-30 min):** Review blog draft(s) in Telegram, add personal insight, reply APPROVED.
- **Wednesday (15 min):** Review ad optimization proposal, approve/modify. Review email draft.
- **Thursday (15-20 min):** Create Pinterest pins in Canva from agent specs. Post social content from personal accounts.
- **Friday (5 min):** Read weekly report. Note anything to adjust.
- **Monthly (30 min):** Read monthly strategy + reconciliation. Approve budget changes.

**The numbers (realistic month 12 targets):**
- Revenue: $800/month from PDF reports + email premium
- Costs: $350/month (agent ops + ads + hosting)
- Net profit: $450/month
- Organic traffic: 8,000 sessions/month and growing
- Email list: 2,500 subscribers
- Content library: 100+ articles
- Human time: 1.5-2 hours/week
- Agent uptime: >99%

**What made the difference vs plans 1-5:**
- A development team built everything properly instead of solo-builder compromises
- Full skill inventory covering all marketing functions, not just the top 5
- A real learning system that tracks what works and feeds it back into decisions
- Systematic A/B testing instead of random experimentation
- Budget intelligence that reallocates dynamically, not just paces
- Quality gates that prevent bad content from reaching humans (reducing review burden)
- Self-healing that fixes most operational issues without human involvement
- Comprehensive monitoring that catches problems before they become crises
- Niche-specific playbook tuned to astrology's unique opportunities (seasonal content, ephemeris verification, visual-heavy social)

This is not a side project duct-taped together. It is a proper autonomous marketing system that happens to run on a Mac Mini. Build it right, and it compounds.

This is not a side project duct-taped together. It is a proper autonomous marketing system that happens to run on a Mac Mini. Build it right, and it compounds.