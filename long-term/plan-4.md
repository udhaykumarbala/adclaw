# AdClaw Long-Term Plan v4 — Executable Implementation Spec

**Created:** 2026-03-16
**Status:** Fourth iteration — from strategy to buildable spec
**Target:** Fully autonomous marketing agent running on Mac Mini via OpenClaw, managing an astrology website's marketing funnel on $300-500/month

---

## Changes from Plan 3

### What Plan 3 Got Right

Plan 3 is the first honest plan. It correctly:
- Killed Google Ads at this budget level
- Reduced content velocity to 4-6/month
- Put Pinterest first as fastest organic channel
- Gave realistic break-even timelines
- Identified the 5 real failure categories and their actual fixes
- Set a hard $100/month Anthropic API cap

### What Plan 3 Still Leaves Abstract

1. **Skills are described by name but never specified.** "Build a `search-console` skill" — what does the SKILL.md say? What scripts does it run? What does the agent actually do when it "runs the skill"?

2. **Cron jobs have messages but no operational context.** The cron message says "Run meta-ads skill. Check spend vs daily cap." But what does the agent read? What file does it write? What's the exact alert format?

3. **Task board is mentioned as "use memory files" but the data model is undefined.** How does the agent create a task? What does the task file look like? How does the human mark it done?

4. **Creative pipeline is described as a flow but never as data.** "Agent requests creative" — where is the request stored? How does the human know the spec? Where do they upload? How does the agent pick it up?

5. **API authentication is listed in a table but the step-by-step is missing.** "Service Account" — where do you get one? What file do you download? Where do you put it? How does the skill read it?

6. **Recovery procedures say "restart the gateway" but don't address state recovery.** What happens to the cron job that was running? What about the half-written memory file? Does the agent know it crashed?

7. **The first week instructions are "install openclaw, setup, start" but skip the 50 decisions between those commands.** Which model? Which Telegram groups to create? What to put in MEMORY.md before anything runs?

### What Plan 4 Changes

- Every skill gets its actual SKILL.md content and the exec scripts it depends on
- Every cron job gets the exact `openclaw cron add` command ready to paste
- Every API gets a numbered step-by-step authentication walkthrough
- The task board gets a JSON data model and file conventions
- The creative pipeline gets a concrete file structure and notification format
- Recovery procedures become runbooks with exact commands
- The first week becomes a day-by-day playbook with every command and every file

Where something cannot be specified exactly because it depends on runtime information (API keys, domain names, Telegram chat IDs), it uses `<PLACEHOLDER>` with a description. Where something needs research that hasn't been done, it's marked `NEEDS RESEARCH:`.

---

## 1. Exact File Structure

### Full Directory Tree

```
~/.openclaw/
├── openclaw.json                          # Main config (Section 10)
├── workspace/
│   ├── MEMORY.md                          # Brand/strategy long-term memory (Section 9)
│   ├── HEARTBEAT.md                       # Periodic check instructions (Section 8)
│   ├── package.json                       # npm dependencies for skill scripts
│   ├── node_modules/                      # installed deps
│   ├── .env                               # API secrets (Section 3)
│   ├── credentials/
│   │   ├── google-service-account.json    # Google SA key file
│   │   └── README.md                      # "Never commit this directory"
│   ├── skills/
│   │   ├── search-console/
│   │   │   └── SKILL.md                   # Section 4.1
│   │   ├── ga4/
│   │   │   └── SKILL.md                   # Section 4.2
│   │   ├── wordpress/
│   │   │   └── SKILL.md                   # Section 4.3
│   │   ├── ephemeris/
│   │   │   └── SKILL.md                   # Section 4.4
│   │   └── meta-ads/
│   │       └── SKILL.md                   # Section 4.5
│   ├── scripts/
│   │   ├── sc-query.js                    # Search Console data pull
│   │   ├── ga4-query.js                   # GA4 data pull
│   │   ├── wp-post.js                     # WordPress CRUD
│   │   ├── wp-read.js                     # WordPress read posts/pages
│   │   ├── ephemeris-check.js             # Planetary position lookup
│   │   ├── meta-ads-read.js               # Read Meta campaign data
│   │   ├── meta-ads-mutate.js             # Create/update Meta campaigns
│   │   └── health-check.js               # Token and API health verification
│   ├── hooks/
│   │   └── auth-failure/
│   │       ├── HOOK.md                    # Auth failure detection hook
│   │       └── handler.ts                 # Handler code
│   ├── memory/
│   │   ├── campaigns/
│   │   │   ├── meta-ads-performance.md    # Rolling campaign data
│   │   │   ├── weekly/                    # Weekly report archives
│   │   │   └── monthly/                   # Monthly report archives
│   │   ├── seo/
│   │   │   ├── latest.md                  # Most recent SEO snapshot
│   │   │   └── weekly-optimization.md     # SEO improvement suggestions
│   │   ├── content/
│   │   │   └── editorial-calendar.md      # Planned/published content registry
│   │   └── alerts/                        # Alert history
│   ├── tasks/
│   │   ├── board.json                     # Task board data (Section 5)
│   │   ├── creative-requests/             # Creative request specs (Section 6)
│   │   └── archive/                       # Completed task data
│   ├── assets/
│   │   ├── creatives/                     # Uploaded ad images
│   │   └── pins/                          # Pinterest pin images
│   └── output/
│       └── reports/                       # Generated report files
├── skills/                                # Shared skills (lower precedence)
├── cron/
│   ├── jobs.json                          # Cron job definitions (auto-managed)
│   └── runs/                              # Cron run history
└── memory/
    └── <agentId>.sqlite                   # Vector memory index
```

### package.json for Workspace Scripts

```json
{
  "name": "adclaw-workspace",
  "private": true,
  "type": "module",
  "dependencies": {
    "googleapis": "144.0.0",
    "@google-analytics/data": "4.8.0",
    "wpapi": "2.1.0",
    "astronomia": "4.1.1",
    "facebook-nodejs-business-sdk": "21.0.0",
    "dotenv": "16.4.7"
  }
}
```

Pin exact versions. Never use `^` or `~`.

---

## 2. Exact Cron Commands

Every cron job below is copy-pasteable after replacing `<PLACEHOLDERS>`.

### Non-LLM Jobs ($0/run)

```bash
# Website uptime — every 4 hours
openclaw cron add --name "uptime-check" \
  --cron "0 */4 * * *" --tz "Asia/Kolkata" \
  --session isolated --lightContext \
  --message "Execute this command and report the result: curl -sf -o /dev/null -w '%{http_code}' https://<YOUR_DOMAIN>. If the result is not 200, send an alert to Telegram channel adclaw-alerts with the message: CRITICAL: Website <YOUR_DOMAIN> returned HTTP [status code]. Check hosting immediately."

# Weekly disk cleanup — Sunday 3:30 AM IST (Saturday 10 PM UTC)
openclaw cron add --name "weekly-cleanup" \
  --cron "0 22 * * 6" --tz "UTC" \
  --session isolated --lightContext \
  --message "Execute these cleanup commands: 1) find /tmp/openclaw/ -name '*.log' -mtime +7 -delete 2) find ~/.openclaw/cron/runs/ -name '*.jsonl' -mtime +14 -delete. Then run: df -h / | tail -1. Report the disk usage percentage. If above 80%, alert Telegram adclaw-alerts."
```

### Haiku Jobs (~$0.003/run)

```bash
# Ad spend monitoring — 9 AM, 2 PM, 7 PM IST, weekdays only
# Only activate this AFTER Meta Ads launch (Phase 3, ~Week 11)
openclaw cron add --name "ad-spend-monitor" \
  --cron "30 3,8,13 * * 1-6" --tz "UTC" \
  --session isolated --lightContext \
  --message "Run the meta-ads skill in read mode. Pull today's spend for all active campaigns. Compare spend to the daily budget cap in MEMORY.md. Write one line to memory/campaigns/meta-ads-performance.md with format: YYYY-MM-DD HH:MM | spend: $X.XX | budget: $X.XX | pacing: XX%. If spend exceeds 80% of daily budget before 5 PM IST, send Telegram alert to adclaw-alerts: WARNING: Meta Ads spend at $X.XX (XX% of $X daily cap). Otherwise, do not send any Telegram message."

# Daily SEO check — 9:30 AM IST
openclaw cron add --name "daily-seo" \
  --cron "0 4 * * *" --tz "UTC" \
  --sessionTarget "session:seo-monitor" \
  --message "Run the search-console skill. Pull the last 3 days of data (Search Console has 2-3 day lag). Read memory/seo/latest.md for previous data. Compare: total clicks, total impressions, average position for top 10 queries. Overwrite memory/seo/latest.md with today's data in this format:

## SEO Snapshot YYYY-MM-DD
- Total clicks (3-day): X
- Total impressions (3-day): X
- Top queries (click desc):
  1. query | clicks | impressions | position
  2. ...
- Top pages (click desc):
  1. /path | clicks | impressions
  2. ...
- Changes from previous:
  - [list any query position changes > 3 positions]

Only alert Telegram adclaw-alerts if: any top-10 query dropped more than 5 positions, OR total clicks dropped more than 40% vs previous snapshot, OR a page returned 404/error in URL inspection."
```

### Sonnet Jobs (~$0.05-0.15/run)

```bash
# Content batch — Tuesday 8:30 AM IST
openclaw cron add --name "content-batch" \
  --cron "0 3 * * 2" --tz "UTC" \
  --sessionTarget "session:content-planner" \
  --message "You are writing blog content for an astrology website.

1. Run the ephemeris skill to get planetary positions for the next 14 days. Note any significant transits (planet ingresses, retrogrades starting/ending, major aspects).

2. Read memory/content/editorial-calendar.md to see what has been published and what is planned.

3. Identify the highest-priority unpublished topic from the calendar. If the calendar is empty, pick from this priority list:
   - Birth chart beginner guides (if fewer than 3 exist)
   - Zodiac sign profiles (if fewer than 12 exist)
   - Upcoming retrograde/transit guide (if a major transit is within 30 days)
   - Compatibility guides (if fewer than 5 exist)
   - Monthly horoscope (if none exists for current month)

4. Write 1 blog post draft using the wordpress skill. Set status to 'draft'. Include:
   - SEO title (under 60 chars)
   - Meta description (under 155 chars)
   - H2/H3 heading structure
   - 1200-2000 words
   - A clearly marked section: '## [HUMAN INSIGHT NEEDED]' where the human must add their personal interpretation (2-3 paragraphs). Describe what kind of insight is needed.
   - Internal links to existing published articles (read the published posts list first)
   - Focus keyword for RankMath

5. Update memory/content/editorial-calendar.md with the new draft entry: date, title, WP draft ID, status: draft, focus keyword.

6. Generate 2 Pinterest pin descriptions (100-200 chars each) for the article. Include suggested visual theme.

7. Send to Telegram adclaw-content with this format:
   NEW DRAFT: [title]
   WP Link: [admin draft link]
   Focus keyword: [keyword]
   Human action needed: Add personal insights in the marked section, then reply APPROVED or send revision notes.
   Pinterest pins: [2 descriptions with visual suggestions]"

# Ad optimization — Wednesday and Saturday 9:30 PM IST
# Only activate AFTER Meta Ads launch (Phase 3, ~Week 11)
openclaw cron add --name "ad-optimization" \
  --cron "0 16 * * 3,6" --tz "UTC" \
  --session isolated \
  --message "Run the meta-ads skill in read mode. Pull performance data for the last 7 days for all active campaigns, ad sets, and ads.

Calculate for each ad: CPL (cost per lead/conversion), CTR, CPC, impressions, spend.

Read memory/campaigns/meta-ads-performance.md for historical context.

Write analysis to memory/campaigns/meta-ads-performance.md (append, don't overwrite):

## Optimization Review YYYY-MM-DD
- Campaign: [name] | 7d spend: $XX | leads: XX | CPL: $XX
- Top performer: [ad name] | CPL: $XX | CTR: X%
- Worst performer: [ad name] | CPL: $XX | CTR: X%
- Recommendations:
  1. [specific action with reasoning]

If any ad has CPL more than 2x the campaign average over 7 days, recommend pausing it.
If any ad has CTR declining for 3+ consecutive days, flag creative fatigue.

Send recommendations to Telegram adclaw-alerts:
AD OPTIMIZATION REVIEW
[summary of top/bottom performers]
Recommended actions:
1. [action] — Reply APPROVE to execute, or SKIP
Do NOT execute any changes without human approval."

# Weekly report — Friday 6:30 PM IST
openclaw cron add --name "weekly-report" \
  --cron "0 13 * * 5" --tz "UTC" \
  --session isolated \
  --message "Generate the weekly marketing performance report.

1. Run search-console skill: get this week's total clicks, impressions, top queries.
2. Run ga4 skill: get this week's sessions by source/medium, top pages, user count.
3. Run meta-ads skill (if active): get this week's spend, leads, CPL.
4. Read memory/content/editorial-calendar.md: count articles published this week.
5. Read the previous weekly report from memory/campaigns/weekly/ for comparison.

Write to memory/campaigns/weekly/YYYY-MM-DD.md:

# Weekly Report: YYYY-MM-DD

## Traffic
- Total sessions: X (prev: X, change: +/-X%)
- Organic search: X sessions
- Pinterest: X sessions
- Meta Ads: X sessions
- Direct: X sessions
- Other: X sessions

## SEO
- Total clicks: X (prev: X)
- Total impressions: X
- Top 5 queries: [list]
- New page-1 rankings: [list or 'none']
- Rankings lost: [list or 'none']

## Meta Ads (if active)
- Spend: $XX
- Leads: XX
- CPL: $XX
- Best ad: [name] at $XX CPL
- Budget remaining this month: $XX

## Content
- Articles published: X
- Articles in draft: X
- Pinterest pins created: X

## Email (manual input from MEMORY.md)
- Subscribers: [from MEMORY.md current state]

## Action Items for Next Week
1. [specific recommendation]

Send the full report to Telegram adclaw-alerts."

# Weekly SEO optimization — Wednesday 10:30 AM IST
openclaw cron add --name "weekly-seo-opt" \
  --cron "0 5 * * 3" --tz "UTC" \
  --sessionTarget "session:seo-monitor" \
  --message "Review accumulated SEO data in memory/seo/latest.md.

Identify opportunity-zone pages: queries ranking position 5-20 where we have content.

For each opportunity:
- Current ranking position
- Monthly search volume estimate (use impressions as proxy)
- The URL ranking for it
- Specific suggestion: add content, improve title, add internal links, etc.

Write findings to memory/seo/weekly-optimization.md (overwrite with latest).

Only alert Telegram if there is a specific, actionable opportunity with estimated impact. Do not send noise."

# Monthly strategy — 1st of month, 10:30 AM IST
openclaw cron add --name "monthly-strategy" \
  --cron "0 5 1 * *" --tz "UTC" \
  --session isolated \
  --message "Generate the monthly marketing review.

1. Read all weekly reports from memory/campaigns/weekly/ for the past month.
2. Run all skills for fresh data: search-console, ga4, meta-ads (if active).
3. Read MEMORY.md for budget and strategy context.

Write to memory/campaigns/monthly/YYYY-MM.md:

# Monthly Review: [Month Year]

## Budget
- Anthropic API: $XX spent (cap: $100)
- Meta Ads: $XX spent
- Hosting: $XX
- Other: $XX
- Total: $XX / $[budget] cap

## Traffic Trends (4-week view)
[week-by-week comparison]

## SEO Progress
- Pages indexed: X
- Page-1 rankings: X (list top 5)
- Organic traffic trend: [up/flat/down] X%

## Content Published
- Articles: X total, X this month
- Pinterest pins: X this month

## Meta Ads (if active)
- Total spend: $XX
- Total leads: XX
- Average CPL: $XX
- ROAS estimate: [if tracking revenue]

## Email
- Subscribers: X (growth: +X this month)

## Recommendations for Next Month
1. [strategic recommendation]

## Budget Allocation for Next Month
[proposed split]

Send full report to Telegram adclaw-alerts with subject line: MONTHLY REVIEW [Month Year]."
```

### Estimated Monthly Cron Cost

| Job | Runs/Month | Cost/Run | Monthly |
|---|---|---|---|
| uptime-check | 180 | ~$0.002 | $0.36 |
| weekly-cleanup | 4 | ~$0.002 | $0.01 |
| ad-spend-monitor | 78 | $0.003 | $0.23 |
| daily-seo | 30 | $0.005 | $0.15 |
| content-batch | 4 | $0.15 | $0.60 |
| ad-optimization | 8 | $0.08 | $0.64 |
| weekly-report | 4 | $0.12 | $0.48 |
| weekly-seo-opt | 4 | $0.06 | $0.24 |
| monthly-strategy | 1 | $0.20 | $0.20 |
| heartbeats (12/day) | 360 | $0.002 | $0.72 |
| **Subtotal** | | | **$3.63** |
| Ad-hoc + retries + context (3x) | | | **$7-11** |
| Blog generation (from content-batch) | | | included above |
| **Realistic total** | | | **$25-40/month** |

---

## 3. Exact API Authentication Flow

### 3.1 Google Service Account (for Search Console + GA4)

Both Search Console and GA4 use the same service account. Do this once.

**Step 1: Create a Google Cloud Project**
1. Go to https://console.cloud.google.com/
2. Click "Select a project" dropdown at top, then "NEW PROJECT"
3. Name: `adclaw-marketing` (or whatever you want)
4. Click "CREATE"
5. Wait 30 seconds for project creation

**Step 2: Enable APIs**
1. In the project, go to "APIs & Services" > "Library"
2. Search for and enable each:
   - "Google Search Console API" — click Enable
   - "Google Analytics Data API" — click Enable
   - "Google Analytics Admin API" — click Enable (useful for listing properties)

**Step 3: Create Service Account**
1. Go to "APIs & Services" > "Credentials"
2. Click "+ CREATE CREDENTIALS" > "Service account"
3. Service account name: `adclaw-agent`
4. Service account ID: auto-fills (e.g., `adclaw-agent@adclaw-marketing.iam.gserviceaccount.com`)
5. Click "CREATE AND CONTINUE"
6. Skip the optional role assignment (click "CONTINUE")
7. Skip "Grant users access" (click "DONE")

**Step 4: Download Key File**
1. Click on the new service account in the list
2. Go to "KEYS" tab
3. Click "ADD KEY" > "Create new key"
4. Select "JSON" format
5. Click "CREATE" — file downloads automatically
6. Move the file:
```bash
mv ~/Downloads/<downloaded-file>.json ~/.openclaw/workspace/credentials/google-service-account.json
chmod 600 ~/.openclaw/workspace/credentials/google-service-account.json
```

**Step 5: Grant Access in Search Console**
1. Go to https://search.google.com/search-console
2. Select your property
3. Go to Settings > Users and permissions
4. Click "ADD USER"
5. Email: `adclaw-agent@adclaw-marketing.iam.gserviceaccount.com` (the service account email from Step 3)
6. Permission: "Full" (needed for URL inspection) or "Restricted" (read-only, sufficient for monitoring)
7. Click "ADD"

**Step 6: Grant Access in GA4**
1. Go to https://analytics.google.com/
2. Admin (gear icon) > Property > Property Access Management
3. Click "+" > "Add users"
4. Email: same service account email
5. Role: "Viewer" (sufficient for reading reports)
6. Click "Add"

**Step 7: Configure in .env**
```bash
# ~/.openclaw/workspace/.env
GOOGLE_SERVICE_ACCOUNT_PATH=./credentials/google-service-account.json
GA4_PROPERTY_ID=<your-ga4-property-id>
SEARCH_CONSOLE_SITE_URL=https://<your-domain>
```

To find your GA4 Property ID: Analytics > Admin > Property Settings > Property ID (numeric, e.g., `123456789`)

### 3.2 WordPress Application Password

**Step 1: Create Application Password**
1. Log into your WordPress admin at `https://<your-domain>/wp-admin/`
2. Go to Users > Profile (your user)
3. Scroll to "Application Passwords" section
4. Application Name: `adclaw-agent`
5. Click "Add New Application Password"
6. **Copy the password immediately** — it is shown only once. It looks like: `xxxx xxxx xxxx xxxx xxxx xxxx`

**Step 2: Configure in .env**
```bash
# ~/.openclaw/workspace/.env (append)
WP_URL=https://<your-domain>
WP_USERNAME=<your-wp-username>
WP_APP_PASSWORD=<the-application-password-no-spaces>
```

Remove spaces from the application password when storing it.

**Step 3: Verify**
```bash
curl -u "<WP_USERNAME>:<WP_APP_PASSWORD>" https://<your-domain>/wp-json/wp/v2/posts?per_page=1
```
Should return JSON array of posts. If it returns 401, check: (a) HTTPS is required for application passwords, (b) the password is correct without spaces.

### 3.3 Meta Marketing API

This is the most complex auth flow. Plan for 2+ hours and expect it to require revisiting.

**Step 1: Create Meta Developer App**
1. Go to https://developers.facebook.com/
2. Click "My Apps" > "Create App"
3. Select "Other" use case, then "Business" type
4. App name: `AdClaw Marketing Agent`
5. Contact email: your email
6. Business portfolio: select yours (or create one at business.facebook.com first)
7. Click "Create App"

**Step 2: Add Marketing API**
1. In the app dashboard, click "Add Products" in left sidebar
2. Find "Marketing API" and click "Set Up"
3. This adds `ads_management` and `ads_read` permissions

**Step 3: Create System User (for long-lived token)**
1. Go to https://business.facebook.com/settings/
2. Navigate to Users > System users
3. Click "Add" > Name: `adclaw-bot`, Role: "Admin"
4. Click "Create System User"
5. Click "Add Assets" > Select your Ad Account > Toggle "Manage campaigns" on
6. Click "Generate New Token"
7. Select the app from Step 1
8. Select permissions: `ads_management`, `ads_read`, `read_insights`
9. Token expiration: "Never" (if available) or maximum duration
10. Click "Generate Token"
11. **Copy the token immediately**

**Step 4: Configure in .env**
```bash
# ~/.openclaw/workspace/.env (append)
META_ACCESS_TOKEN=<system-user-token>
META_AD_ACCOUNT_ID=act_<your-ad-account-id>
META_APP_ID=<app-id>
META_APP_SECRET=<app-secret>
```

Find your Ad Account ID: Business Settings > Accounts > Ad Accounts > the numeric ID prefixed with `act_`.

**Step 5: Bootstrap to Advanced Access**
Standard Access has only 60 API points. You need Advanced Access (9,000 points) before running real campaigns.

```javascript
// Run this script daily for weeks 1-3 to accumulate API calls
// ~/.openclaw/workspace/scripts/meta-bootstrap.js
import { config } from 'dotenv';
import bizSdk from 'facebook-nodejs-business-sdk';
config();

const { FacebookAdsApi, AdAccount } = bizSdk;
const api = FacebookAdsApi.init(process.env.META_ACCESS_TOKEN);
const account = new AdAccount(process.env.META_AD_ACCOUNT_ID);

async function bootstrap() {
  // Simple read calls to accumulate successful API usage
  const campaigns = await account.getCampaigns([], { limit: 10 });
  console.log(`Campaigns: ${campaigns.length}`);

  const adSets = await account.getAdSets([], { limit: 10 });
  console.log(`Ad Sets: ${adSets.length}`);

  const insights = await account.getInsights(
    ['impressions', 'spend', 'clicks'],
    { date_preset: 'last_7d' }
  );
  console.log(`Insights: ${JSON.stringify(insights)}`);
}

bootstrap().catch(console.error);
```

Run this 5-10 times per day for 15+ days. After 1,500+ successful calls, go to developers.facebook.com > Your App > App Review > Permissions and Features > Request Advanced Access for `ads_management`.

**Step 6: Token Refresh Calendar Reminder**
System user tokens with "Never" expiry should last indefinitely. But set a monthly calendar reminder to verify the token still works:
```bash
curl "https://graph.facebook.com/v25.0/me?access_token=<TOKEN>"
```
If it returns your system user info, the token is valid. If 401/error, regenerate.

### 3.4 Anthropic API

**Step 1: Get API Key**
1. Go to https://console.anthropic.com/
2. Settings > API Keys > Create Key
3. Name: `adclaw-agent`
4. Copy the key (starts with `sk-ant-`)

**Step 2: Set Monthly Spending Limit**
1. In Anthropic Console, go to Plans & Billing > Spending Limits
2. Set Monthly limit: $100 (hard cap, non-negotiable)
3. Set Alert threshold: $60 (email alert when reached)

**Step 3: Configure**
```bash
# This goes in shell environment, not .env (OpenClaw reads it from env)
export ANTHROPIC_API_KEY=sk-ant-<your-key>
```

Or add to `~/.openclaw/openclaw.json` under agents config. The OpenClaw setup wizard handles this.

### 3.5 Telegram Bot

**Step 1: Create Bot**
1. Open Telegram, search for `@BotFather`
2. Send `/newbot`
3. Name: `AdClaw Marketing` (display name)
4. Username: `adclaw_marketing_bot` (must end with `bot`)
5. Copy the token BotFather gives you

**Step 2: Create Telegram Groups**
1. Create group: `adclaw-alerts` — for alerts, reports, performance data
2. Create group: `adclaw-content` — for content drafts, creative requests, approvals
3. Add your bot to both groups
4. Get group chat IDs: send a message in each group, then:
```bash
curl "https://api.telegram.org/bot<BOT_TOKEN>/getUpdates"
```
Look for `"chat":{"id":-XXXXXXXXX}` — the negative number is the group chat ID.

**Step 3: Get Your Personal Chat ID**
1. Send any message to the bot directly
2. Run the getUpdates curl again
3. Find your personal `"from":{"id":XXXXXXXXX}` — this is your admin chat ID

**Step 4: Configure in openclaw.json**
```json
{
  "channels": {
    "telegram": {
      "enabled": true,
      "accounts": {
        "default": {
          "token": "<BOT_TOKEN>"
        }
      }
    }
  }
}
```

Store group chat IDs and admin ID in MEMORY.md for the agent to reference:
```markdown
## Telegram Configuration
- Bot username: @adclaw_marketing_bot
- Admin chat ID: <YOUR_PERSONAL_CHAT_ID>
- adclaw-alerts group ID: <ALERTS_GROUP_ID>
- adclaw-content group ID: <CONTENT_GROUP_ID>
```

---

## 4. Exact Skill Implementations

### 4.1 Search Console Skill

**File: `~/.openclaw/workspace/skills/search-console/SKILL.md`**

```markdown
---
name: search-console
description: Query Google Search Console for SEO data — clicks, impressions, queries, page performance, and URL inspection.
---

# Search Console Skill

You have access to a Google Search Console data pull script.

## Available Commands

### Pull search analytics data
```
exec node scripts/sc-query.js analytics --days <N> --dimensions <dim1,dim2>
```
- `--days`: Number of days to look back (default: 7, max: 90, note: data has 2-3 day lag)
- `--dimensions`: Comma-separated: query, page, device, country, date
- Returns JSON: `{ rows: [{ keys: [...], clicks, impressions, ctr, position }], totals: { clicks, impressions } }`

### Inspect a URL
```
exec node scripts/sc-query.js inspect --url <full-url>
```
- Returns: indexing status, crawl info, mobile usability
- Use this to check if newly published pages are indexed

### List sitemaps
```
exec node scripts/sc-query.js sitemaps
```
- Returns list of submitted sitemaps and their status

## When to Use

- **Daily SEO check**: Run `analytics --days 3 --dimensions query,page` to get recent performance
- **After publishing a new article**: Run `inspect --url <article-url>` to check indexing status
- **Weekly optimization**: Run `analytics --days 28 --dimensions query` to find opportunity-zone queries (position 5-20)

## Output Format

Always write results to memory/seo/ files. The daily cron writes to memory/seo/latest.md. The weekly optimization writes to memory/seo/weekly-optimization.md.

## Error Handling

If the script returns an authentication error (code 401 or 403), DO NOT retry. Instead:
1. Log the error to memory/alerts/YYYY-MM-DD.md
2. Alert Telegram adclaw-alerts: "ALERT: Search Console authentication failed. Human must verify service account access."
3. Stop the current task
```

**File: `~/.openclaw/workspace/scripts/sc-query.js`**

```javascript
import { google } from 'googleapis';
import { readFileSync } from 'fs';
import { config } from 'dotenv';
config();

const keyFile = process.env.GOOGLE_SERVICE_ACCOUNT_PATH || './credentials/google-service-account.json';
const siteUrl = process.env.SEARCH_CONSOLE_SITE_URL;

const auth = new google.auth.GoogleAuth({
  keyFile,
  scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
});

const searchconsole = google.searchconsole({ version: 'v1', auth });
const webmasters = google.webmasters({ version: 'v3', auth });

const command = process.argv[2];
const args = {};
for (let i = 3; i < process.argv.length; i += 2) {
  args[process.argv[i].replace('--', '')] = process.argv[i + 1];
}

async function analytics() {
  const days = parseInt(args.days || '7');
  const dimensions = (args.dimensions || 'query').split(',');

  const endDate = new Date();
  endDate.setDate(endDate.getDate() - 3); // 3-day lag
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - days);

  const fmt = (d) => d.toISOString().split('T')[0];

  const res = await searchconsole.searchanalytics.query({
    siteUrl,
    requestBody: {
      startDate: fmt(startDate),
      endDate: fmt(endDate),
      dimensions,
      rowLimit: 25000,
    },
  });

  const rows = (res.data.rows || []).map(r => ({
    keys: r.keys,
    clicks: r.clicks,
    impressions: r.impressions,
    ctr: (r.ctr * 100).toFixed(2) + '%',
    position: r.position.toFixed(1),
  }));

  const totals = rows.reduce((acc, r) => ({
    clicks: acc.clicks + r.clicks,
    impressions: acc.impressions + r.impressions,
  }), { clicks: 0, impressions: 0 });

  console.log(JSON.stringify({ rows: rows.slice(0, 100), totals, dateRange: { start: fmt(startDate), end: fmt(endDate) } }, null, 2));
}

async function inspect() {
  const url = args.url;
  if (!url) { console.error('--url required'); process.exit(1); }

  const res = await searchconsole.urlInspection.index.inspect({
    requestBody: {
      inspectionUrl: url,
      siteUrl,
    },
  });

  const result = res.data.inspectionResult;
  console.log(JSON.stringify({
    url,
    indexStatus: result.indexStatusResult?.coverageState,
    crawledAs: result.indexStatusResult?.crawledAs,
    lastCrawl: result.indexStatusResult?.lastCrawlTime,
    pageFetch: result.indexStatusResult?.pageFetchState,
    mobileUsability: result.mobileUsabilityResult?.verdict,
  }, null, 2));
}

async function sitemaps() {
  const res = await webmasters.sitemaps.list({ siteUrl });
  const maps = (res.data.sitemap || []).map(s => ({
    path: s.path,
    lastSubmitted: s.lastSubmitted,
    isPending: s.isPending,
    warnings: s.warnings,
    errors: s.errors,
  }));
  console.log(JSON.stringify(maps, null, 2));
}

try {
  if (command === 'analytics') await analytics();
  else if (command === 'inspect') await inspect();
  else if (command === 'sitemaps') await sitemaps();
  else { console.error('Usage: sc-query.js <analytics|inspect|sitemaps> [options]'); process.exit(1); }
} catch (err) {
  console.error(JSON.stringify({ error: err.message, code: err.code || err.response?.status }));
  process.exit(1);
}
```

### 4.2 GA4 Skill

**File: `~/.openclaw/workspace/skills/ga4/SKILL.md`**

```markdown
---
name: ga4
description: Query Google Analytics 4 for website traffic data — sessions, users, page views, sources, conversions.
---

# GA4 Skill

You have access to a GA4 data query script.

## Available Commands

### Run a traffic report
```
exec node scripts/ga4-query.js traffic --days <N>
```
- Returns: sessions, users, pageviews, bounce rate, grouped by source/medium
- Default: last 7 days

### Run a pages report
```
exec node scripts/ga4-query.js pages --days <N> --limit <N>
```
- Returns: top pages by sessions
- Default: last 7 days, top 20 pages

### Run a realtime report
```
exec node scripts/ga4-query.js realtime
```
- Returns: active users in last 30 minutes, top pages, top sources

### Check conversions
```
exec node scripts/ga4-query.js conversions --days <N>
```
- Returns: conversion events (email_signup, purchase, etc.) with counts

## When to Use

- **Weekly report**: Run `traffic --days 7` and `pages --days 7` for the performance report
- **After publishing content**: Run `realtime` a few hours later to see if traffic is arriving
- **Monthly review**: Run `traffic --days 30` and `conversions --days 30`

## Error Handling

Same as search-console skill. Auth errors (401/403) should be logged and alerted, not retried.
```

**File: `~/.openclaw/workspace/scripts/ga4-query.js`**

```javascript
import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { config } from 'dotenv';
config();

const keyFile = process.env.GOOGLE_SERVICE_ACCOUNT_PATH || './credentials/google-service-account.json';
const propertyId = process.env.GA4_PROPERTY_ID;

const client = new BetaAnalyticsDataClient({ keyFilename: keyFile });

const command = process.argv[2];
const args = {};
for (let i = 3; i < process.argv.length; i += 2) {
  args[process.argv[i].replace('--', '')] = process.argv[i + 1];
}

async function traffic() {
  const days = parseInt(args.days || '7');
  const [response] = await client.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate: `${days}daysAgo`, endDate: 'today' }],
    dimensions: [{ name: 'sessionSourceMedium' }],
    metrics: [
      { name: 'sessions' },
      { name: 'totalUsers' },
      { name: 'screenPageViews' },
      { name: 'bounceRate' },
    ],
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    limit: 20,
  });

  const rows = (response.rows || []).map(r => ({
    sourceMedium: r.dimensionValues[0].value,
    sessions: parseInt(r.metricValues[0].value),
    users: parseInt(r.metricValues[1].value),
    pageviews: parseInt(r.metricValues[2].value),
    bounceRate: (parseFloat(r.metricValues[3].value) * 100).toFixed(1) + '%',
  }));

  const totals = response.totals?.[0]?.metricValues || [];
  console.log(JSON.stringify({
    dateRange: `${days} days`,
    totals: {
      sessions: parseInt(totals[0]?.value || 0),
      users: parseInt(totals[1]?.value || 0),
      pageviews: parseInt(totals[2]?.value || 0),
    },
    bySource: rows,
  }, null, 2));
}

async function pages() {
  const days = parseInt(args.days || '7');
  const limit = parseInt(args.limit || '20');
  const [response] = await client.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate: `${days}daysAgo`, endDate: 'today' }],
    dimensions: [{ name: 'pagePath' }],
    metrics: [{ name: 'sessions' }, { name: 'screenPageViews' }, { name: 'averageSessionDuration' }],
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    limit,
  });

  const rows = (response.rows || []).map(r => ({
    page: r.dimensionValues[0].value,
    sessions: parseInt(r.metricValues[0].value),
    pageviews: parseInt(r.metricValues[1].value),
    avgDuration: parseFloat(r.metricValues[2].value).toFixed(0) + 's',
  }));

  console.log(JSON.stringify({ dateRange: `${days} days`, pages: rows }, null, 2));
}

async function realtime() {
  const [response] = await client.runRealtimeReport({
    property: `properties/${propertyId}`,
    dimensions: [{ name: 'unifiedScreenName' }],
    metrics: [{ name: 'activeUsers' }],
    limit: 10,
  });

  const rows = (response.rows || []).map(r => ({
    page: r.dimensionValues[0].value,
    activeUsers: parseInt(r.metricValues[0].value),
  }));

  const total = response.totals?.[0]?.metricValues?.[0]?.value || '0';
  console.log(JSON.stringify({ activeUsers: parseInt(total), topPages: rows }, null, 2));
}

async function conversions() {
  const days = parseInt(args.days || '7');
  const [response] = await client.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate: `${days}daysAgo`, endDate: 'today' }],
    dimensions: [{ name: 'eventName' }],
    metrics: [{ name: 'eventCount' }, { name: 'totalUsers' }],
    dimensionFilter: {
      orGroup: {
        expressions: [
          { filter: { fieldName: 'eventName', stringFilter: { matchType: 'EXACT', value: 'purchase' } } },
          { filter: { fieldName: 'eventName', stringFilter: { matchType: 'EXACT', value: 'sign_up' } } },
          { filter: { fieldName: 'eventName', stringFilter: { matchType: 'EXACT', value: 'generate_lead' } } },
        ],
      },
    },
    orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
  });

  const rows = (response.rows || []).map(r => ({
    event: r.dimensionValues[0].value,
    count: parseInt(r.metricValues[0].value),
    users: parseInt(r.metricValues[1].value),
  }));

  console.log(JSON.stringify({ dateRange: `${days} days`, conversions: rows }, null, 2));
}

try {
  if (command === 'traffic') await traffic();
  else if (command === 'pages') await pages();
  else if (command === 'realtime') await realtime();
  else if (command === 'conversions') await conversions();
  else { console.error('Usage: ga4-query.js <traffic|pages|realtime|conversions> [options]'); process.exit(1); }
} catch (err) {
  console.error(JSON.stringify({ error: err.message, code: err.code }));
  process.exit(1);
}
```

### 4.3 WordPress Skill

**File: `~/.openclaw/workspace/skills/wordpress/SKILL.md`**

```markdown
---
name: wordpress
description: Create, read, update, and publish blog posts on the WordPress site. Manages content lifecycle from draft to publish.
---

# WordPress Skill

You have access to WordPress CRUD scripts for managing blog content.

## Available Commands

### Create a draft post
```
exec node scripts/wp-post.js create --title "<title>" --content "<html-content>" --status draft --meta-title "<seo-title>" --meta-desc "<meta-description>" --focus-keyword "<keyword>"
```
- `--title`: Post title
- `--content`: Full HTML content of the post. Use proper H2/H3 structure.
- `--status`: draft (default), publish, pending
- `--meta-title`: SEO title for RankMath (optional, defaults to title)
- `--meta-desc`: Meta description for RankMath (optional)
- `--focus-keyword`: Focus keyword for RankMath (optional)
- Returns: `{ id: 123, link: "https://...", editLink: "https://.../wp-admin/post.php?post=123&action=edit", status: "draft" }`

### Read posts
```
exec node scripts/wp-read.js list --status <status> --per-page <N>
```
- `--status`: draft, publish, pending, any (default: publish)
- `--per-page`: number of posts (default: 10)
- Returns: array of `{ id, title, status, date, link, slug }`

### Read a single post
```
exec node scripts/wp-read.js get --id <post-id>
```
- Returns full post with content, meta, categories, tags

### Update a post
```
exec node scripts/wp-post.js update --id <post-id> --title "<new-title>" --content "<new-content>" --status publish
```
- Only include fields you want to change

### Publish a draft
```
exec node scripts/wp-post.js update --id <post-id> --status publish
```

## Content Guidelines

1. ALWAYS create posts as `draft` first. Never publish directly.
2. Include `[HUMAN INSIGHT NEEDED]` sections in drafts where human must add personal interpretation.
3. After human approves via Telegram, update status to `publish`.
4. After publishing, update memory/content/editorial-calendar.md with publish date and URL.

## Error Handling

- 401: Authentication failed. Alert Telegram, stop. Human must regenerate Application Password.
- 403: Permission denied. The WP user may not have Editor/Admin role.
- 5xx: Server error. Log and retry once after 30 seconds. If retry fails, alert Telegram.
```

**File: `~/.openclaw/workspace/scripts/wp-post.js`**

```javascript
import WPAPI from 'wpapi';
import { config } from 'dotenv';
config();

const wp = new WPAPI({
  endpoint: `${process.env.WP_URL}/wp-json`,
  username: process.env.WP_USERNAME,
  password: process.env.WP_APP_PASSWORD,
});

const args = {};
for (let i = 3; i < process.argv.length; i += 2) {
  const key = process.argv[i].replace('--', '');
  args[key] = process.argv[i + 1];
}

const command = process.argv[2];

async function create() {
  const postData = {
    title: args.title,
    content: args.content,
    status: args.status || 'draft',
  };

  // RankMath SEO fields via meta
  const meta = {};
  if (args['meta-title']) meta.rank_math_title = args['meta-title'];
  if (args['meta-desc']) meta.rank_math_description = args['meta-desc'];
  if (args['focus-keyword']) meta.rank_math_focus_keyword = args['focus-keyword'];
  if (Object.keys(meta).length > 0) postData.meta = meta;

  const post = await wp.posts().create(postData);
  console.log(JSON.stringify({
    id: post.id,
    link: post.link,
    editLink: `${process.env.WP_URL}/wp-admin/post.php?post=${post.id}&action=edit`,
    status: post.status,
  }));
}

async function update() {
  const id = parseInt(args.id);
  if (!id) { console.error('--id required'); process.exit(1); }

  const updateData = {};
  if (args.title) updateData.title = args.title;
  if (args.content) updateData.content = args.content;
  if (args.status) updateData.status = args.status;

  const meta = {};
  if (args['meta-title']) meta.rank_math_title = args['meta-title'];
  if (args['meta-desc']) meta.rank_math_description = args['meta-desc'];
  if (args['focus-keyword']) meta.rank_math_focus_keyword = args['focus-keyword'];
  if (Object.keys(meta).length > 0) updateData.meta = meta;

  const post = await wp.posts().id(id).update(updateData);
  console.log(JSON.stringify({
    id: post.id,
    link: post.link,
    status: post.status,
    modified: post.modified,
  }));
}

try {
  if (command === 'create') await create();
  else if (command === 'update') await update();
  else { console.error('Usage: wp-post.js <create|update> [options]'); process.exit(1); }
} catch (err) {
  console.error(JSON.stringify({ error: err.message, code: err.data?.status || err.code }));
  process.exit(1);
}
```

**File: `~/.openclaw/workspace/scripts/wp-read.js`**

```javascript
import WPAPI from 'wpapi';
import { config } from 'dotenv';
config();

const wp = new WPAPI({
  endpoint: `${process.env.WP_URL}/wp-json`,
  username: process.env.WP_USERNAME,
  password: process.env.WP_APP_PASSWORD,
});

const args = {};
for (let i = 3; i < process.argv.length; i += 2) {
  const key = process.argv[i].replace('--', '');
  args[key] = process.argv[i + 1];
}

const command = process.argv[2];

async function list() {
  const status = args.status || 'publish';
  const perPage = parseInt(args['per-page'] || '10');

  let query = wp.posts().perPage(perPage).order('desc').orderby('date');
  if (status !== 'any') query = query.status(status);

  const posts = await query;
  const result = posts.map(p => ({
    id: p.id,
    title: p.title.rendered,
    status: p.status,
    date: p.date,
    link: p.link,
    slug: p.slug,
  }));
  console.log(JSON.stringify(result, null, 2));
}

async function get() {
  const id = parseInt(args.id);
  if (!id) { console.error('--id required'); process.exit(1); }

  const post = await wp.posts().id(id);
  console.log(JSON.stringify({
    id: post.id,
    title: post.title.rendered,
    content: post.content.rendered,
    excerpt: post.excerpt.rendered,
    status: post.status,
    date: post.date,
    modified: post.modified,
    link: post.link,
    slug: post.slug,
    categories: post.categories,
    tags: post.tags,
    meta: post.meta,
    yoast_head_json: post.yoast_head_json,
  }, null, 2));
}

try {
  if (command === 'list') await list();
  else if (command === 'get') await get();
  else { console.error('Usage: wp-read.js <list|get> [options]'); process.exit(1); }
} catch (err) {
  console.error(JSON.stringify({ error: err.message, code: err.data?.status || err.code }));
  process.exit(1);
}
```

### 4.4 Ephemeris Skill

**File: `~/.openclaw/workspace/skills/ephemeris/SKILL.md`**

```markdown
---
name: ephemeris
description: Calculate planetary positions, upcoming transits, retrogrades, and astrological events. Used for content accuracy verification and editorial calendar planning.
---

# Ephemeris Skill

You have access to an astronomical ephemeris script for verifying astrological data.

## Available Commands

### Get planetary positions for a date
```
exec node scripts/ephemeris-check.js positions --date YYYY-MM-DD
```
- Returns: positions of Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto in zodiac signs and degrees
- Default: today

### Get upcoming transits
```
exec node scripts/ephemeris-check.js transits --days <N>
```
- Returns: planet ingresses (sign changes), stations (retrograde/direct), major aspects within next N days
- Default: 30 days

### Verify a specific claim
```
exec node scripts/ephemeris-check.js verify --claim "Mercury enters Aries on April 15, 2026"
```
- Returns: true/false with actual data

## MANDATORY Usage

1. EVERY blog post that mentions a transit date, retrograde period, or planetary position MUST be verified with this skill before publishing.
2. Run `transits --days 14` at the start of every content-batch cron job to identify timely content opportunities.
3. If verify returns false for any claim in a draft, the draft MUST be corrected before human review.

## Accuracy Note

The astronomia library calculates positions to approximately 0.01 degree accuracy for modern dates. This is sufficient for astrology content (zodiac sign placement, approximate degrees). It is NOT sufficient for exact aspect timing to the minute — round to the nearest day for transit dates.
```

**File: `~/.openclaw/workspace/scripts/ephemeris-check.js`**

```javascript
import * as astronomia from 'astronomia';
const { solar, planetposition, julian, sexagesimal } = astronomia;

// Planet data from VSOP87 theory bundled with astronomia
import vsop87Bearth from 'astronomia/data/vsop87Bearth.js';
import vsop87Bmercury from 'astronomia/data/vsop87Bmercury.js';
import vsop87Bvenus from 'astronomia/data/vsop87Bvenus.js';
import vsop87Bmars from 'astronomia/data/vsop87Bmars.js';
import vsop87Bjupiter from 'astronomia/data/vsop87Bjupiter.js';
import vsop87Bsaturn from 'astronomia/data/vsop87Bsaturn.js';

// NEEDS RESEARCH: Verify astronomia's exact import paths and VSOP87 data format.
// The library has changed its export structure across versions.
// Test with: node -e "import('astronomia').then(m => console.log(Object.keys(m)))"
// If imports fail, fall back to the Swiss Ephemeris npm package (swisseph)
// or use a simpler approach with pre-computed ephemeris data files.

const SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
               'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

function eclipticLonToSign(lon) {
  const deg = lon * 180 / Math.PI;
  const normalised = ((deg % 360) + 360) % 360;
  const signIndex = Math.floor(normalised / 30);
  const signDegree = normalised % 30;
  return { sign: SIGNS[signIndex], degree: signDegree.toFixed(1) };
}

const command = process.argv[2];
const args = {};
for (let i = 3; i < process.argv.length; i += 2) {
  args[process.argv[i].replace('--', '')] = process.argv[i + 1];
}

async function positions() {
  const dateStr = args.date || new Date().toISOString().split('T')[0];
  const [y, m, d] = dateStr.split('-').map(Number);
  const jd = julian.CalendarGregorianToJD(y, m, d);

  // NEEDS RESEARCH: Confirm exact API for astronomia planetary positions.
  // The approach below is the documented pattern but needs runtime verification.
  // If astronomia doesn't work cleanly, alternative: use a REST API like
  // https://api.visibleplanets.dev/ or pre-computed tables.

  console.log(JSON.stringify({
    date: dateStr,
    note: 'NEEDS RESEARCH: Full implementation requires verifying astronomia VSOP87 imports. Placeholder output.',
    positions: {
      Sun: { sign: 'Placeholder', degree: '0.0' },
    }
  }, null, 2));
}

async function transits() {
  const days = parseInt(args.days || '30');
  // NEEDS RESEARCH: Computing transits requires checking planet positions
  // day by day and detecting sign changes and stations.
  // This is computationally feasible but requires careful implementation.
  // Approximate approach: check each planet's longitude daily, detect when
  // it crosses a 30-degree boundary (sign change) or reverses direction (station).

  console.log(JSON.stringify({
    daysAhead: days,
    note: 'NEEDS RESEARCH: Transit detection requires day-by-day position scanning. Implementation pending astronomia verification.',
    transits: []
  }, null, 2));
}

async function verify() {
  const claim = args.claim;
  if (!claim) { console.error('--claim required'); process.exit(1); }

  // NEEDS RESEARCH: Parse natural language claims into verifiable astronomical queries.
  // For MVP, support structured claims like:
  // "Mercury in Aries on 2026-04-15" -> check Mercury longitude on that date
  // "Mercury retrograde starts 2026-04-01" -> check Mercury apparent motion direction

  console.log(JSON.stringify({
    claim,
    verified: null,
    note: 'NEEDS RESEARCH: Claim verification requires NL parsing + ephemeris lookup. MVP: verify date-specific planet-in-sign claims only.',
  }, null, 2));
}

try {
  if (command === 'positions') await positions();
  else if (command === 'transits') await transits();
  else if (command === 'verify') await verify();
  else { console.error('Usage: ephemeris-check.js <positions|transits|verify> [options]'); process.exit(1); }
} catch (err) {
  console.error(JSON.stringify({ error: err.message }));
  process.exit(1);
}
```

**NEEDS RESEARCH: The `astronomia` npm package's exact API and import structure.** The library exists and performs VSOP87 planetary calculations, but the import paths and method signatures need to be verified at install time. If `astronomia` proves too complex to wire up, alternatives:
1. `swisseph` npm package (bindings to Swiss Ephemeris C library) — more accurate but requires native compilation
2. A free ephemeris REST API for lookups (less reliable for automation)
3. Pre-computed transit tables downloaded as JSON files (simplest, but static)

### 4.5 Meta Ads Skill

**File: `~/.openclaw/workspace/skills/meta-ads/SKILL.md`**

```markdown
---
name: meta-ads
description: Read and manage Meta (Facebook/Instagram) ad campaigns. Monitors spend, pulls performance data, and can create/modify campaigns with human approval.
---

# Meta Ads Skill

You have access to Meta Marketing API scripts for managing paid campaigns.

## Available Commands

### Read campaign performance
```
exec node scripts/meta-ads-read.js campaigns --days <N>
```
- Returns: all campaigns with spend, impressions, clicks, conversions, CPL
- Default: last 7 days

### Read ad set performance
```
exec node scripts/meta-ads-read.js adsets --campaign-id <id> --days <N>
```
- Returns: ad set breakdowns within a campaign

### Read individual ad performance
```
exec node scripts/meta-ads-read.js ads --campaign-id <id> --days <N>
```
- Returns: per-ad metrics for creative performance comparison

### Read today's spend
```
exec node scripts/meta-ads-read.js spend-today
```
- Returns: today's spend across all active campaigns. Fast, lightweight call.

### Create a campaign (REQUIRES HUMAN APPROVAL)
```
exec node scripts/meta-ads-mutate.js create-campaign --name "<name>" --objective OUTCOME_LEADS --daily-budget <cents> --status PAUSED
```
- ALWAYS create campaigns as PAUSED. Human must approve before activating.
- Budget is in cents (e.g., 500 = $5.00/day)

### Update campaign status
```
exec node scripts/meta-ads-mutate.js update-campaign --id <campaign-id> --status <ACTIVE|PAUSED>
```

### Pause an ad
```
exec node scripts/meta-ads-mutate.js update-ad --id <ad-id> --status PAUSED
```

## Budget Guardrails

1. NEVER create a campaign with daily budget exceeding the cap in MEMORY.md.
2. NEVER activate a campaign without explicit human approval via Telegram.
3. When monitoring spend, compare against MEMORY.md budget guardrails.
4. If total daily spend across all campaigns exceeds the daily cap, PAUSE the lowest-performing campaign immediately and alert Telegram.
5. Budget increases require human approval. Budget decreases are auto-approved.
6. Maximum 4 budget changes per ad set per hour (Meta API limit).

## Error Handling

- 190 (OAuthException): Token expired. Alert Telegram immediately. Do not retry.
- 17 (rate limit): Wait 5 minutes, retry once. If still failing, stop and alert.
- 272 (ad account restricted): Alert Telegram as CRITICAL. Pause all campaigns.
- Any unrecognized error: Log full error body to memory/alerts/, alert Telegram, stop.
```

**File: `~/.openclaw/workspace/scripts/meta-ads-read.js`**

```javascript
import { config } from 'dotenv';
import bizSdk from 'facebook-nodejs-business-sdk';
config();

const { FacebookAdsApi, AdAccount, Campaign } = bizSdk;
const api = FacebookAdsApi.init(process.env.META_ACCESS_TOKEN);
const account = new AdAccount(process.env.META_AD_ACCOUNT_ID);

const command = process.argv[2];
const args = {};
for (let i = 3; i < process.argv.length; i += 2) {
  args[process.argv[i].replace('--', '')] = process.argv[i + 1];
}

async function campaigns() {
  const days = parseInt(args.days || '7');
  const today = new Date().toISOString().split('T')[0];
  const start = new Date();
  start.setDate(start.getDate() - days);
  const startStr = start.toISOString().split('T')[0];

  const campaignsList = await account.getCampaigns(
    [Campaign.Fields.id, Campaign.Fields.name, Campaign.Fields.status, Campaign.Fields.daily_budget],
    { limit: 50 }
  );

  const results = [];
  for (const c of campaignsList) {
    const insights = await new Campaign(c.id).getInsights(
      ['spend', 'impressions', 'clicks', 'actions', 'cost_per_action_type', 'ctr', 'cpc'],
      { time_range: { since: startStr, until: today } }
    );

    const data = insights[0] || {};
    const leads = (data.actions || []).find(a => a.action_type === 'lead' || a.action_type === 'offsite_conversion.fb_pixel_lead');

    results.push({
      id: c.id,
      name: c.name,
      status: c.status,
      dailyBudget: c.daily_budget ? `$${(parseInt(c.daily_budget) / 100).toFixed(2)}` : 'N/A',
      spend: `$${parseFloat(data.spend || 0).toFixed(2)}`,
      impressions: parseInt(data.impressions || 0),
      clicks: parseInt(data.clicks || 0),
      ctr: data.ctr ? `${parseFloat(data.ctr).toFixed(2)}%` : '0%',
      leads: leads ? parseInt(leads.value) : 0,
      cpl: leads && parseFloat(data.spend) > 0
        ? `$${(parseFloat(data.spend) / parseInt(leads.value)).toFixed(2)}`
        : 'N/A',
    });
  }

  console.log(JSON.stringify({ dateRange: `${startStr} to ${today}`, campaigns: results }, null, 2));
}

async function spendToday() {
  const today = new Date().toISOString().split('T')[0];
  const insights = await account.getInsights(
    ['spend', 'impressions', 'clicks'],
    { time_range: { since: today, until: today } }
  );
  const data = insights[0] || {};
  console.log(JSON.stringify({
    date: today,
    totalSpend: `$${parseFloat(data.spend || 0).toFixed(2)}`,
    impressions: parseInt(data.impressions || 0),
    clicks: parseInt(data.clicks || 0),
  }, null, 2));
}

async function adsets() {
  const campaignId = args['campaign-id'];
  if (!campaignId) { console.error('--campaign-id required'); process.exit(1); }
  const days = parseInt(args.days || '7');
  const today = new Date().toISOString().split('T')[0];
  const start = new Date();
  start.setDate(start.getDate() - days);
  const startStr = start.toISOString().split('T')[0];

  const campaign = new Campaign(campaignId);
  const adSetsList = await campaign.getAdSets(['id', 'name', 'status', 'daily_budget'], { limit: 50 });

  const results = [];
  for (const as of adSetsList) {
    const insights = await new bizSdk.AdSet(as.id).getInsights(
      ['spend', 'impressions', 'clicks', 'actions', 'ctr'],
      { time_range: { since: startStr, until: today } }
    );
    const data = insights[0] || {};
    results.push({
      id: as.id,
      name: as.name,
      status: as.status,
      spend: `$${parseFloat(data.spend || 0).toFixed(2)}`,
      impressions: parseInt(data.impressions || 0),
      clicks: parseInt(data.clicks || 0),
    });
  }
  console.log(JSON.stringify({ campaignId, dateRange: `${startStr} to ${today}`, adSets: results }, null, 2));
}

async function ads() {
  const campaignId = args['campaign-id'];
  if (!campaignId) { console.error('--campaign-id required'); process.exit(1); }
  const days = parseInt(args.days || '7');
  const today = new Date().toISOString().split('T')[0];
  const start = new Date();
  start.setDate(start.getDate() - days);
  const startStr = start.toISOString().split('T')[0];

  const campaign = new Campaign(campaignId);
  const adsList = await campaign.getAds(['id', 'name', 'status', 'creative'], { limit: 50 });

  const results = [];
  for (const ad of adsList) {
    const insights = await new bizSdk.Ad(ad.id).getInsights(
      ['spend', 'impressions', 'clicks', 'actions', 'ctr', 'cpc'],
      { time_range: { since: startStr, until: today } }
    );
    const data = insights[0] || {};
    const leads = (data.actions || []).find(a => a.action_type === 'lead');
    results.push({
      id: ad.id,
      name: ad.name,
      status: ad.status,
      spend: `$${parseFloat(data.spend || 0).toFixed(2)}`,
      clicks: parseInt(data.clicks || 0),
      ctr: data.ctr ? `${parseFloat(data.ctr).toFixed(2)}%` : '0%',
      leads: leads ? parseInt(leads.value) : 0,
    });
  }
  console.log(JSON.stringify({ campaignId, dateRange: `${startStr} to ${today}`, ads: results }, null, 2));
}

try {
  if (command === 'campaigns') await campaigns();
  else if (command === 'spend-today') await spendToday();
  else if (command === 'adsets') await adsets();
  else if (command === 'ads') await ads();
  else { console.error('Usage: meta-ads-read.js <campaigns|spend-today|adsets|ads> [options]'); process.exit(1); }
} catch (err) {
  console.error(JSON.stringify({ error: err.message, code: err.status || err.code, type: err.type }));
  process.exit(1);
}
```

**File: `~/.openclaw/workspace/scripts/meta-ads-mutate.js`**

```javascript
import { config } from 'dotenv';
import bizSdk from 'facebook-nodejs-business-sdk';
config();

const { FacebookAdsApi, AdAccount, Campaign, Ad } = bizSdk;
const api = FacebookAdsApi.init(process.env.META_ACCESS_TOKEN);
const account = new AdAccount(process.env.META_AD_ACCOUNT_ID);

const command = process.argv[2];
const args = {};
for (let i = 3; i < process.argv.length; i += 2) {
  args[process.argv[i].replace('--', '')] = process.argv[i + 1];
}

async function createCampaign() {
  const name = args.name;
  const objective = args.objective || 'OUTCOME_LEADS';
  const dailyBudget = args['daily-budget'];
  const status = args.status || 'PAUSED';

  if (!name || !dailyBudget) {
    console.error('--name and --daily-budget required');
    process.exit(1);
  }

  const campaign = await account.createCampaign([], {
    [Campaign.Fields.name]: name,
    [Campaign.Fields.objective]: objective,
    [Campaign.Fields.status]: status,
    [Campaign.Fields.special_ad_categories]: [],
  });

  console.log(JSON.stringify({
    id: campaign.id,
    name,
    objective,
    status,
    dailyBudget: `$${(parseInt(dailyBudget) / 100).toFixed(2)}`,
    action: 'CREATED AS PAUSED. Human must approve activation.',
  }));
}

async function updateCampaign() {
  const id = args.id;
  const status = args.status;
  if (!id) { console.error('--id required'); process.exit(1); }

  const updateFields = {};
  if (status) updateFields[Campaign.Fields.status] = status;

  const campaign = new Campaign(id);
  const result = await campaign.update([], updateFields);

  console.log(JSON.stringify({
    id,
    updatedStatus: status,
    success: true,
  }));
}

async function updateAd() {
  const id = args.id;
  const status = args.status;
  if (!id) { console.error('--id required'); process.exit(1); }

  const ad = new Ad(id);
  const result = await ad.update([], { status });

  console.log(JSON.stringify({ id, updatedStatus: status, success: true }));
}

try {
  if (command === 'create-campaign') await createCampaign();
  else if (command === 'update-campaign') await updateCampaign();
  else if (command === 'update-ad') await updateAd();
  else { console.error('Usage: meta-ads-mutate.js <create-campaign|update-campaign|update-ad> [options]'); process.exit(1); }
} catch (err) {
  console.error(JSON.stringify({ error: err.message, code: err.status || err.code, type: err.type }));
  process.exit(1);
}
```

---

## 5. Task Board Data Model

### Where It Lives

`~/.openclaw/workspace/tasks/board.json`

The agent reads and writes this file. The human interacts with tasks via Telegram only (not by editing JSON).

### JSON Structure

```json
{
  "version": 1,
  "lastUpdated": "2026-03-16T10:30:00Z",
  "nextTaskId": 5,
  "tasks": [
    {
      "id": "T-001",
      "type": "creative-request",
      "status": "requested",
      "priority": "high",
      "title": "Feed image for Email List campaign",
      "description": "1080x1080 cosmic/zodiac aesthetic for Meta lead gen campaign",
      "createdAt": "2026-04-15T09:00:00Z",
      "updatedAt": "2026-04-15T09:00:00Z",
      "dueDate": "2026-04-18T00:00:00Z",
      "assignee": "human",
      "creator": "agent",
      "details": {
        "format": "1080x1080",
        "purpose": "Meta Ads - Email List campaign feed placement",
        "visualDirection": "Starfield with zodiac wheel, cosmic purple/blue palette",
        "textOverlay": "Keep under 20% of image area",
        "ctaText": "Get Your Free Birth Chart Guide",
        "complianceNotes": "No zodiac sign assertions. General cosmic framing.",
        "referenceFile": null
      },
      "resolution": null,
      "telegramMessageId": null,
      "linkedFiles": []
    },
    {
      "id": "T-002",
      "type": "content-review",
      "status": "in-review",
      "priority": "medium",
      "title": "Review draft: Mercury Retrograde April 2026 Guide",
      "description": "Blog post needs human insight sections filled in",
      "createdAt": "2026-04-15T03:00:00Z",
      "updatedAt": "2026-04-15T10:00:00Z",
      "dueDate": "2026-04-17T00:00:00Z",
      "assignee": "human",
      "creator": "agent",
      "details": {
        "wpDraftId": 456,
        "wpEditLink": "https://your-site.com/wp-admin/post.php?post=456&action=edit",
        "focusKeyword": "mercury retrograde april 2026",
        "insightSectionsNeeded": 2,
        "pinterestPinDescriptions": [
          "Mercury Retrograde April 2026: Your complete survival guide with exact dates and what to expect",
          "When does Mercury go retrograde in April 2026? Everything you need to know"
        ]
      },
      "resolution": null,
      "telegramMessageId": 12345,
      "linkedFiles": []
    },
    {
      "id": "T-003",
      "type": "social-post",
      "status": "completed",
      "priority": "low",
      "title": "Post X thread: Venus enters Taurus",
      "description": "Agent drafted thread, human posts from personal account",
      "createdAt": "2026-04-14T07:00:00Z",
      "updatedAt": "2026-04-14T19:00:00Z",
      "dueDate": "2026-04-14T23:59:00Z",
      "assignee": "human",
      "creator": "agent",
      "details": {
        "platform": "x",
        "content": "Thread: Venus enters Taurus today...",
        "hashtags": "#astrology #venus #taurus",
        "postUrl": null
      },
      "resolution": {
        "completedAt": "2026-04-14T18:30:00Z",
        "notes": "Posted. URL: https://x.com/user/status/123",
        "postUrl": "https://x.com/user/status/123"
      },
      "telegramMessageId": 12340,
      "linkedFiles": []
    }
  ]
}
```

### Task Types

| Type | Created When | Human Action |
|---|---|---|
| `creative-request` | Agent needs an ad image or pin visual | Create image in Canva/AI tool, upload to assets/ |
| `content-review` | Agent finishes a blog draft | Review in WP, add insights, reply APPROVED |
| `social-post` | Agent drafts social content | Post from personal account, share URL |
| `ad-approval` | Agent recommends campaign changes | Reply APPROVE or REJECT in Telegram |
| `manual-action` | Agent needs something it can't do via API | Follow instructions, confirm done |

### Task Statuses

```
requested -> in-progress -> in-review -> completed
                                     -> rejected (loops back to requested with notes)
```

### How the Agent Creates a Task

1. Agent writes a new entry to `board.json` with status `requested`
2. Agent sends a Telegram message to the appropriate group with task details
3. Agent stores the Telegram message ID in the task's `telegramMessageId` field

Example agent behavior (in a cron job or ad-hoc session):
```
1. Read tasks/board.json
2. Determine a creative is needed for the new campaign
3. Append new task to the tasks array
4. Increment nextTaskId
5. Write updated board.json
6. Send formatted message to Telegram adclaw-content:

   TASK T-004: Creative Request (HIGH priority)
   Campaign: Email List - Birth Chart Offer
   Format: 1080x1080 (Feed) + 1080x1920 (Stories)
   Visual: Cosmic/zodiac aesthetic, starfield or zodiac wheel
   Text overlay: Keep under 20% of image
   CTA: "Get Your Free Birth Chart Guide"
   Compliance: No sign-specific assertions
   Due: April 18

   Reply with the image file when ready, or SKIP if you need more time.
```

### How the Human Completes a Task

**For creative requests:**
1. Human sees the Telegram message
2. Human creates the image
3. Human sends the image as a reply in Telegram (or uploads to `assets/creatives/`)
4. Agent detects the media reply, validates dimensions
5. Agent updates task status to `completed` in board.json
6. Agent uses the creative in the campaign

**For content reviews:**
1. Human clicks the WP edit link in the Telegram message
2. Human edits the draft, adds insight sections
3. Human replies in Telegram: `APPROVED` (or sends revision notes)
4. Agent detects approval, publishes the post, updates task

**For ad approvals:**
1. Human reads the optimization recommendation in Telegram
2. Human replies: `APPROVE` or `REJECT: [reason]`
3. Agent executes or abandons the change, updates task

**For social posts:**
1. Human reads the drafted content in Telegram
2. Human posts from their personal account
3. Human replies with the post URL
4. Agent records the URL, starts tracking referral traffic

---

## 6. Creative Pipeline Implementation

### Step-by-Step Data Flow

```
Agent identifies need for creative
        |
        v
Agent creates task in board.json (type: creative-request)
        |
        v
Agent sends Telegram message to adclaw-content with full spec
(format, dimensions, visual direction, CTA, compliance notes)
        |
        v
Human receives notification on phone/desktop
        |
        v
Human creates image (Canva, AI tool, Photoshop, etc.)
        |
        v
Human sends image as reply in Telegram
        |
        v
OpenClaw receives media, stores in media/ directory
        |
        v
Agent detects media reply to creative request message
(matches via telegramMessageId or reply-to context)
        |
        v
Agent validates:
  - Is the image the right dimensions? (use: exec identify -format "%wx%h" <file>)
  - Is it a supported format? (JPEG, PNG, WebP)
  - Does it meet Meta's < 20% text rule? (approximate check only — NEEDS RESEARCH on automating this)
        |
        v
If valid:
  1. Agent copies file from media/ to assets/creatives/<task-id>-<format>.<ext>
  2. Agent updates task status to "completed" in board.json
  3. Agent replies in Telegram: "Creative received and validated. Will use in [campaign name]."
  4. Agent uploads image to Meta Ads Creative library via API

If invalid:
  1. Agent replies in Telegram: "Image doesn't meet spec: [reason]. Please re-upload."
  2. Task stays in "in-progress" status
```

### File Structure for Creatives

```
assets/creatives/
├── T-004-1080x1080-feed.png      # Named by task ID + format
├── T-004-1080x1920-stories.png
├── T-007-1000x1500-pin.png
└── README.md                      # "Creative assets. Managed by agent. Do not delete."
```

### Creative Request Template (What Agent Sends to Telegram)

```
CREATIVE REQUEST #T-XXX
Priority: HIGH / MEDIUM / LOW
Due: YYYY-MM-DD

Campaign: [campaign name]
Placement: [Feed / Stories / Pinterest Pin / Blog Header]

Specs:
- Format: [WxH pixels]
- File type: PNG or JPEG
- Max file size: 30MB

Visual Direction:
[2-3 sentences describing the look and feel]

Text on Image:
- Headline: "[text]" (or: no text overlay)
- Keep text under 20% of image area

Compliance:
- [any restrictions specific to the platform or niche]

Reference: [link to similar creative or "none"]

Reply to this message with the image file when ready.
```

### NEEDS RESEARCH: Automated Text-on-Image Percentage Check

Meta rejects ads with > 20% text overlay. Automating this check requires either:
1. Using Meta's own Text Overlay Tool API (if it still exists — it was deprecated in 2020 but may have a successor)
2. Running OCR on the image (e.g., Tesseract via `node-tesseract-ocr`) and estimating text area as percentage of total pixels
3. Sending the image to Claude Vision with the prompt "What percentage of this image is covered by text?" — costs ~$0.01 per check

For MVP: skip automated checking. The human creating the image is responsible for keeping text under 20%. The agent reminds them in the request.

---

## 7. Monitoring and Alerting

### What the Agent Checks and When

| Check | Frequency | Trigger | Alert Channel |
|---|---|---|---|
| Website uptime (HTTP 200) | Every 4 hours | HTTP status != 200 | Telegram adclaw-alerts: CRITICAL |
| Meta Ads daily spend | 3x/day weekdays | Spend > 80% of daily cap before 5 PM IST | Telegram adclaw-alerts: WARNING |
| Meta Ads account status | 3x/day weekdays | Account restricted or ad rejected | Telegram adclaw-alerts: CRITICAL |
| SEO ranking drops | Daily | Any top-10 query drops > 5 positions | Telegram adclaw-alerts: WARNING |
| SEO traffic crash | Daily | Total clicks < 60% of previous day | Telegram adclaw-alerts: WARNING |
| Skill auth failure | On every skill run | 401/403 error from any API | Telegram adclaw-alerts: CRITICAL |
| Disk space | Weekly (Sunday) | Usage > 80% | Telegram adclaw-alerts: WARNING |
| Anthropic API spend | Weekly (Friday) | Spend > $60 by day 15 of month | Telegram adclaw-alerts: WARNING (reduce crons) |
| OpenClaw heartbeat | Every 30 min (active hours) | No heartbeat for 2+ hours | External monitor (UptimeRobot) |

### Alert Format

All Telegram alerts follow this format:

```
[SEVERITY]: [SHORT DESCRIPTION]

Details: [1-2 sentences with specifics]
Impact: [what's affected]
Action needed: [what the human should do]
Automated action taken: [what the agent already did, or "none"]
```

Example:
```
CRITICAL: Meta Ads account restricted

Details: Ad account act_123456 returned error 272 (Ad Account Disabled) at 14:30 IST.
Impact: All Meta ad campaigns are no longer delivering. Lead generation is paused.
Action needed: Log into Meta Business Suite, review the restriction reason, and submit an appeal.
Automated action taken: All campaigns paused via API. No further Meta API calls will be made until you confirm the account is restored.
```

### Severity Levels

| Severity | Meaning | Expected Human Response Time |
|---|---|---|
| CRITICAL | Revenue-impacting or system-breaking | Within 4 hours |
| WARNING | Degraded performance or approaching limits | Within 24 hours |
| INFO | Routine notification, no action needed | Read at convenience |

### Escalation Path

```
1. First alert: Telegram adclaw-alerts group message
2. If CRITICAL and no human response within 2 hours:
   Agent sends DM to admin personal chat (higher notification priority)
3. If still no response within 4 hours:
   Agent takes conservative defensive action:
   - Pause all paid campaigns
   - Reduce crons to essential only (uptime + SEO daily)
   - Log the escalation to memory/alerts/
4. Agent continues defensive mode until human explicitly confirms resolution
```

### HEARTBEAT.md Implementation

**File: `~/.openclaw/workspace/HEARTBEAT.md`**

```markdown
# Heartbeat Checks

## Every heartbeat (30 min during active hours 8 AM - 10 PM IST):

1. Check for new Telegram messages that need response (task completions, approvals, questions).
2. Check tasks/board.json for any tasks with status "requested" that are past their due date. If found, send a reminder to Telegram adclaw-content.
3. If any cron job has not run successfully in the last 2x its expected interval, log a warning to memory/alerts/.

## Do NOT do on every heartbeat:
- Do not pull API data (that's what cron jobs are for)
- Do not generate content
- Do not send messages unless there's something requiring attention
- Keep heartbeat cost under $0.005 by using minimal context
```

---

## 8. Recovery Procedures

### Scenario: Agent Crashes at 3 AM

**What happens automatically:**
1. The OpenClaw gateway process dies (OOM, unhandled exception, Node.js crash)
2. launchd detects the process exit
3. launchd restarts the gateway (KeepAlive is set in the LaunchAgent plist)
4. Gateway starts up, re-reads `openclaw.json`, reconnects to Telegram, reloads cron jobs from `~/.openclaw/cron/jobs.json`

**What state is lost:**
- Any in-flight agent session that was running at crash time. If a cron job was mid-execution, that run is lost.
- Background process sessions (they exist only in memory)
- Any pending tool call results that hadn't been written to disk

**What state survives:**
- All cron job definitions (persisted in `jobs.json`)
- All memory files (on disk)
- Task board (on disk)
- All credentials and config

**What the agent does on next wake:**
The next scheduled cron job runs normally. The agent reads its memory files to rebuild context. There is no special "I just crashed" detection needed because:
- Cron jobs are idempotent — running the SEO check again just gets fresh data
- Memory files are the source of truth, not session memory
- Tasks in board.json reflect last-known state

**What could go wrong:**
- A cron job was writing to a memory file when the crash happened. The file could be corrupted (partial write). **Mitigation:** Write to a temp file first, then rename (atomic on macOS). This should be implemented in the scripts, not left to the agent.
- The crash was caused by a recurring issue (OOM from memory leak). The gateway restarts, hits the same issue, crashes again, creating a restart loop. **Mitigation:** launchd's `ThrottleInterval` prevents restart storms (default: 10 seconds). If the process crashes 10+ times per hour, `channelMaxRestartsPerHour` stops channel restarts. Check logs at `/tmp/openclaw/` to diagnose.

**Manual recovery runbook:**

```bash
# 1. Check if gateway is running
openclaw gateway status

# 2. If not running, check why
cat /tmp/openclaw/openclaw-$(date +%Y-%m-%d).log | tail -100

# 3. If OOM or memory issue, clear session state and restart
openclaw sessions cleanup
openclaw gateway restart

# 4. Verify crons are intact
openclaw cron list

# 5. Verify Telegram is connected
# Send a test message to the bot — it should respond

# 6. Check disk space
df -h /

# 7. If disk full, emergency cleanup
find /tmp/openclaw/ -name "*.log" -mtime +3 -delete
find ~/.openclaw/cron/runs/ -name "*.jsonl" -mtime +7 -delete
openclaw sessions cleanup --dry-run  # preview what would be cleaned
openclaw sessions cleanup             # actually clean
```

### Scenario: OAuth Token Expires During Active Campaign

**Symptoms:** meta-ads skill returns error 190 (OAuthException). Ad spend monitoring cron jobs log failures.

**Automated response (built into HEARTBEAT.md and skill error handling):**
1. Agent detects auth error
2. Agent pauses all Meta Ads campaigns via API (this call may also fail if token is dead — in that case, campaigns continue running on their own until human intervenes)
3. Agent sends CRITICAL alert to Telegram
4. Agent stops all Meta Ads cron jobs from making API calls (sets a flag in memory/alerts/meta-auth-failed.md)
5. Subsequent ad-spend-monitor cron runs check for this flag first and skip if present

**Human recovery:**
1. Go to Business Settings > System Users > Regenerate token
2. Copy new token
3. Update `~/.openclaw/workspace/.env` with new `META_ACCESS_TOKEN`
4. Delete `memory/alerts/meta-auth-failed.md` flag file
5. Restart gateway: `openclaw gateway restart`
6. Verify: run `node scripts/meta-ads-read.js spend-today` manually

### Scenario: Mac Mini Loses Power

**Automated recovery:**
1. Power returns, Mac Mini boots (auto-login configured in System Settings > Users > Login Options)
2. launchd starts the OpenClaw gateway automatically
3. Gateway reconnects to Telegram
4. Cron jobs resume on their next scheduled time

**What to check after extended outage (> 1 hour):**
- Was a cron job supposed to run during the outage? Check `openclaw cron list` — the next run time will show when it will fire next. OpenClaw cron does NOT retroactively run missed jobs.
- Were Meta Ads running during the outage? Yes — Meta Ads run on Meta's servers regardless of whether your agent is alive. No data is lost; the agent picks it up on the next monitoring cron.
- Is there a campaign budget issue? If the outage lasted through an entire day, the agent missed 3 spend checks. But Meta has its own daily budget cap set at the campaign level, so overspend is bounded by whatever you set in Meta Ads Manager.

### Scenario: npm Package Breaks After Update

**Prevention (from Plan 3):** Pin exact versions. Never run `npm update` automatically.

**If it happens anyway:**

```bash
# 1. Identify which script is failing
node scripts/sc-query.js analytics --days 3 2>&1
# Look at error message

# 2. Check what changed
cd ~/.openclaw/workspace
npm ls <broken-package>

# 3. Roll back to known working version
npm install <package>@<previous-version> --save-exact

# 4. Test
node scripts/sc-query.js analytics --days 3

# 5. If rollback doesn't work, check the package's GitHub for breaking changes
# and update the script code accordingly
```

---

## 9. MEMORY.md Template (Complete)

**File: `~/.openclaw/workspace/MEMORY.md`**

```markdown
# AdClaw Marketing Agent — Long-Term Memory

## Brand Identity
- Site: <YOUR_DOMAIN>
- Niche: Western astrology (or Vedic — update if different)
- Voice: <WARM_MYSTICAL | ACADEMIC_ANALYTICAL | CASUAL_HUMOROUS> — pick one
- Target audience: Women 25-54 interested in astrology, self-discovery, spiritual growth
- Differentiator: Native birth chart calculator + genuine interpretive insights
- Monetization: Track <A_DIGITAL_PRODUCTS | B_READING_PRACTICE>
- Author: <NAME>, <CREDENTIALS>, <BIO_URL>

## Telegram Configuration
- Bot username: @<BOT_USERNAME>
- Admin chat ID: <YOUR_PERSONAL_CHAT_ID>
- adclaw-alerts group ID: <ALERTS_GROUP_ID>
- adclaw-content group ID: <CONTENT_GROUP_ID>
- Approval routing: All CRITICAL alerts go to admin DM. All other alerts go to adclaw-alerts group.

## Budget Guardrails
- Monthly total budget: $<300_OR_500>
- Anthropic API hard cap: $100/month (set in Anthropic console)
- Meta Ads daily cap: $<3_TO_7> (set at campaign level in Meta)
- Max budget increase per day: 20%
- Any new campaign creation: requires human approval
- If API spend > $60 by day 15: reduce to essential crons only (daily-seo + weekly-report)
- Budget decrease: auto-approved
- Budget increase: requires human approval

## Content Guidelines
- MANDATORY: Verify ALL planetary transit dates via ephemeris skill before publishing
- MANDATORY: Every article must contain human-written insight sections (marked [HUMAN INSIGHT NEEDED])
- MANDATORY: Named human author on every blog post with bio
- Never make guaranteed predictions ("you WILL meet someone")
- Include "for educational/entertainment purposes" disclaimer in footer
- Maximum 6 articles/month (quality gate to avoid scaled content abuse flags)
- Focus keyword set via RankMath for every article
- Internal linking: every new article links to at least 2 existing articles

## Ad Copy Rules (Meta)
- NEVER assert viewer's zodiac sign ("Are you a Scorpio?" = POLICY VIOLATION)
- NEVER make health, financial, or relationship guarantees
- Frame general: "Explore what the stars reveal" = COMPLIANT
- Text overlay on images: under 20% of image area
- All new ad copy must follow approved templates below

## Approved Ad Copy Templates
Meta Lead Gen:
- "The universe wrote a story in the stars the moment you were born. Discover yours."
- "Your birth chart is a cosmic blueprint. Get a free interpretation."
- "What do the planets say about your path? Explore your unique birth chart."

Meta Retargeting:
- "You started exploring your chart. Ready to go deeper?"
- "Your cosmic blueprint awaits. Complete your birth chart reading."

## API Credentials Location
All secrets are in ~/.openclaw/workspace/.env — never commit this file.
- Google Service Account: credentials/google-service-account.json
- WordPress: Application Password in .env
- Meta: System User Token in .env (check monthly for expiry)
- Anthropic: Set in shell environment / openclaw.json

## Current State (Agent Updates This Section)
- Current phase: <1-5>
- Autonomy level: human-approves-all
- Active Meta campaigns: none (update when launched)
- Email subscribers: 0 (update weekly)
- Published articles: 0 (update after each publish)
- Pinterest pins: 0 (update weekly)
- Top-performing content: none yet
- Last monthly review: N/A
```

---

## 10. openclaw.json (Complete, Ready to Use)

**File: `~/.openclaw/openclaw.json`**

```json
{
  "agents": {
    "defaults": {
      "model": "anthropic/claude-sonnet-4-20250514",
      "workspace": "~/.openclaw/workspace",
      "heartbeat": {
        "every": "30m",
        "target": "telegram",
        "lightContext": true,
        "activeHours": { "start": "08:00", "end": "22:00" }
      },
      "session": {
        "resetPolicy": {
          "daily": "04:00"
        },
        "maintenance": {
          "pruneAfter": "7d",
          "maxEntries": 200,
          "maxStoreSize": "3mb",
          "maxDiskBytes": "300mb"
        }
      },
      "compaction": {
        "model": "anthropic/claude-haiku-3-20250313"
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
          "token": "<TELEGRAM_BOT_TOKEN>"
        }
      },
      "dm": { "policy": "pairing" },
      "group": { "policy": "allowlist" },
      "buttons": { "scope": "all" }
    }
  },
  "hooks": {
    "enabled": true,
    "token": "<GENERATE_RANDOM_32_CHAR_STRING>",
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
        { "channel": "telegram", "to": "<YOUR_ADMIN_TELEGRAM_CHAT_ID>" }
      ]
    }
  },
  "skills": {
    "load": { "watch": true },
    "entries": {}
  },
  "gateway": {
    "channelHealthCheckMinutes": 5,
    "channelStaleEventThresholdMinutes": 30,
    "channelMaxRestartsPerHour": 5
  }
}
```

### Placeholders to Replace

| Placeholder | Where to Get It |
|---|---|
| `<TELEGRAM_BOT_TOKEN>` | From @BotFather when creating bot (Section 3.5, Step 1) |
| `<GENERATE_RANDOM_32_CHAR_STRING>` | Run: `openssl rand -hex 16` |
| `<YOUR_ADMIN_TELEGRAM_CHAT_ID>` | From Telegram getUpdates (Section 3.5, Step 3) |

---

## 11. First Week Playbook

### Day 1 (Monday): OpenClaw + Telegram — 3-4 hours

**Morning (2 hours):**

```bash
# 1. Install OpenClaw
npm install -g openclaw

# 2. Run setup wizard — follow prompts for:
#    - Anthropic API key
#    - Model selection (Claude Sonnet for default)
#    - Workspace location (accept default ~/.openclaw/workspace)
openclaw setup

# 3. Set Anthropic monthly cap
# Go to https://console.anthropic.com/ > Plans & Billing > Spending Limits
# Set monthly limit: $100
# Set alert: $60

# 4. Create workspace structure
mkdir -p ~/.openclaw/workspace/{credentials,skills/{search-console,ga4,wordpress,ephemeris,meta-ads},scripts,hooks/auth-failure,memory/{campaigns/weekly,campaigns/monthly,seo,content,alerts},tasks/{creative-requests,archive},assets/{creatives,pins},output/reports}

# 5. Initialize npm in workspace
cd ~/.openclaw/workspace
npm init -y
npm install --save-exact googleapis@144.0.0 @google-analytics/data@4.8.0 wpapi@2.1.0 astronomia@4.1.1 facebook-nodejs-business-sdk@21.0.0 dotenv@16.4.7
```

**Note on npm versions:** The versions above are pinned as of this writing. Before running, check the current latest stable version of each package and pin to that. The principle is: pick a version, pin it, don't auto-update.

**Afternoon (1.5 hours):**

```bash
# 6. Create Telegram bot
# Open Telegram > @BotFather > /newbot
# Name: AdClaw Marketing
# Username: adclaw_<unique>_bot
# Copy the token

# 7. Create Telegram groups
# Create group: "adclaw-alerts"
# Create group: "adclaw-content"
# Add your bot to both groups
# Send a message in each group

# 8. Get chat IDs
curl "https://api.telegram.org/bot<TOKEN>/getUpdates" | python3 -m json.tool
# Note down: your personal chat ID, each group's chat ID

# 9. Write openclaw.json
# Copy the template from Section 10, replace all placeholders
# Save to ~/.openclaw/openclaw.json

# 10. Install and start gateway
openclaw gateway install --port 18789
openclaw gateway start

# 11. Verify
openclaw status --deep
# Send "hello" to the bot in Telegram — it should respond
```

**Evening (30 min):**

```bash
# 12. Write MEMORY.md
# Copy template from Section 9, fill in all decisions:
#   - Domain, niche, voice, audience
#   - Monetization track (A or B)
#   - Budget ($300 or $500)
#   - Author identity
#   - Telegram chat IDs
# Save to ~/.openclaw/workspace/MEMORY.md

# 13. Write HEARTBEAT.md
# Copy from Section 7
# Save to ~/.openclaw/workspace/HEARTBEAT.md

# 14. Verify heartbeat
# Wait 30 min, check that bot sends a heartbeat message in Telegram
```

### Day 2 (Tuesday): Google APIs + WordPress — 2-3 hours

```bash
# 1. Create Google Cloud project and service account
# Follow Section 3.1, Steps 1-4
# Download JSON key to ~/.openclaw/workspace/credentials/google-service-account.json
chmod 600 ~/.openclaw/workspace/credentials/google-service-account.json

# 2. Enable APIs in Google Cloud Console
# - Google Search Console API
# - Google Analytics Data API
# - Google Analytics Admin API

# 3. Grant service account access to Search Console
# Follow Section 3.1, Step 5

# 4. Grant service account access to GA4
# Follow Section 3.1, Step 6

# 5. Create WordPress Application Password
# Follow Section 3.2

# 6. Write .env file
cat > ~/.openclaw/workspace/.env << 'ENVEOF'
GOOGLE_SERVICE_ACCOUNT_PATH=./credentials/google-service-account.json
GA4_PROPERTY_ID=<your-property-id>
SEARCH_CONSOLE_SITE_URL=https://<your-domain>
WP_URL=https://<your-domain>
WP_USERNAME=<your-wp-username>
WP_APP_PASSWORD=<your-app-password>
META_ACCESS_TOKEN=placeholder-set-later
META_AD_ACCOUNT_ID=act_placeholder
META_APP_ID=placeholder
META_APP_SECRET=placeholder
ENVEOF

# 7. Create skill scripts
# Copy sc-query.js from Section 4.1 to ~/.openclaw/workspace/scripts/sc-query.js
# Copy ga4-query.js from Section 4.2 to ~/.openclaw/workspace/scripts/ga4-query.js
# Copy wp-post.js from Section 4.3 to ~/.openclaw/workspace/scripts/wp-post.js
# Copy wp-read.js from Section 4.3 to ~/.openclaw/workspace/scripts/wp-read.js

# 8. Create SKILL.md files
# Copy each SKILL.md from Section 4.1-4.3 to their respective skill directories

# 9. Test each skill manually
cd ~/.openclaw/workspace
node scripts/sc-query.js analytics --days 7
node scripts/ga4-query.js traffic --days 7
node scripts/wp-read.js list --status publish --per-page 5
```

Troubleshoot any errors before proceeding. Common issues:
- Service account email not added to Search Console / GA4
- Wrong GA4 Property ID (it's the numeric ID, not the stream ID)
- WordPress Application Password has spaces (remove them)
- HTTPS not enabled on WordPress (required for Application Passwords)

### Day 3 (Wednesday): Meta API + Ephemeris + Remaining Skills — 2-3 hours

```bash
# 1. Create Meta Developer App
# Follow Section 3.3, Steps 1-4

# 2. Update .env with real Meta credentials
# Edit ~/.openclaw/workspace/.env — replace the placeholder values

# 3. Create meta-ads scripts
# Copy meta-ads-read.js from Section 4.5
# Copy meta-ads-mutate.js from Section 4.5

# 4. Create meta-ads SKILL.md from Section 4.5

# 5. Test Meta API (basic read)
cd ~/.openclaw/workspace
node scripts/meta-ads-read.js campaigns --days 7
# Expect: empty campaigns list or existing campaigns

# 6. Start Meta API bootstrapping
# Copy meta-bootstrap.js from Section 3.3, Step 5
# Run it 5-10 times today:
node scripts/meta-bootstrap.js
# Set a daily reminder to run this 5-10x/day for the next 2 weeks

# 7. Create ephemeris skill
# Copy ephemeris-check.js from Section 4.4
# Copy ephemeris SKILL.md from Section 4.4
# Test:
node scripts/ephemeris-check.js positions --date 2026-03-16

# 8. Create task board
echo '{"version":1,"lastUpdated":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","nextTaskId":1,"tasks":[]}' > ~/.openclaw/workspace/tasks/board.json

# 9. Create editorial calendar
cat > ~/.openclaw/workspace/memory/content/editorial-calendar.md << 'EOF'
# Editorial Calendar

## Published
(none yet)

## Drafts
(none yet)

## Planned
1. [Evergreen] Zodiac Sign Profile: Aries — target: Week 5
2. [Evergreen] What Is a Birth Chart? Complete Beginner Guide — target: Week 5
3. [Evergreen] Zodiac Sign Profile: Taurus — target: Week 6
(add more as needed)
EOF
```

### Day 4 (Thursday): Cron Jobs + Integration Testing — 2-3 hours

```bash
# 1. Add all cron jobs
# Copy each cron command from Section 2 and run them.
# Start with non-LLM and Haiku jobs only.
# DO NOT add the ad-spend-monitor or ad-optimization jobs yet (no Meta campaigns).

# Essential crons for Day 1:
openclaw cron add --name "uptime-check" \
  --cron "0 */4 * * *" --tz "Asia/Kolkata" \
  --session isolated --lightContext \
  --message "Execute this command and report the result: curl -sf -o /dev/null -w '%{http_code}' https://<YOUR_DOMAIN>. If the result is not 200, send an alert to Telegram channel adclaw-alerts with the message: CRITICAL: Website <YOUR_DOMAIN> returned HTTP [status code]. Check hosting immediately."

openclaw cron add --name "weekly-cleanup" \
  --cron "0 22 * * 6" --tz "UTC" \
  --session isolated --lightContext \
  --message "Execute these cleanup commands: 1) find /tmp/openclaw/ -name '*.log' -mtime +7 -delete 2) find ~/.openclaw/cron/runs/ -name '*.jsonl' -mtime +14 -delete. Then run: df -h / | tail -1. Report the disk usage percentage. If above 80%, alert Telegram adclaw-alerts."

openclaw cron add --name "daily-seo" \
  --cron "0 4 * * *" --tz "UTC" \
  --sessionTarget "session:seo-monitor" \
  --message "Run the search-console skill. Pull the last 3 days of data. Read memory/seo/latest.md for previous data. Compare total clicks and top query positions. Overwrite memory/seo/latest.md with today's snapshot. Only alert Telegram adclaw-alerts if any top-10 query dropped more than 5 positions or total clicks dropped more than 40%."

# Content cron — add now but it won't produce anything useful until Phase 0 content exists:
openclaw cron add --name "content-batch" \
  --cron "0 3 * * 2" --tz "UTC" \
  --sessionTarget "session:content-planner" \
  --message "Read memory/content/editorial-calendar.md. If there are planned topics ready for drafting, run the ephemeris skill for this week's planetary positions, then create 1 blog post draft using the wordpress skill. Follow all content guidelines in MEMORY.md. Send draft details to Telegram adclaw-content for human review. If no topics are ready, do nothing."

openclaw cron add --name "weekly-report" \
  --cron "0 13 * * 5" --tz "UTC" \
  --session isolated \
  --message "Generate weekly marketing report. Run search-console and ga4 skills for this week's data. Read previous report from memory/campaigns/weekly/. Write new report to memory/campaigns/weekly/$(date +%Y-%m-%d).md. Send summary to Telegram adclaw-alerts."

openclaw cron add --name "weekly-seo-opt" \
  --cron "0 5 * * 3" --tz "UTC" \
  --sessionTarget "session:seo-monitor" \
  --message "Review SEO data in memory/seo/latest.md. Identify queries ranking position 5-20 where we have content. Write optimization suggestions to memory/seo/weekly-optimization.md. Only alert Telegram if there is a specific actionable opportunity."

openclaw cron add --name "monthly-strategy" \
  --cron "0 5 1 * *" --tz "UTC" \
  --session isolated \
  --message "Generate monthly review. Read all weekly reports and memory files. Run all skills for fresh data. Write comprehensive report to memory/campaigns/monthly/$(date +%Y-%m).md. Send to Telegram adclaw-alerts."

# 2. Verify crons
openclaw cron list

# 3. Manually trigger the daily SEO check to verify it works
openclaw cron run daily-seo

# 4. Check Telegram — did the result come through?
# If yes, verify the data matches what Search Console shows

# 5. Set up external uptime monitoring
# Go to https://uptimerobot.com/ (free tier)
# Add monitor: HTTP(s) type
# URL: http://<MAC_MINI_TAILSCALE_IP>:18789/healthz
# Or if no external access: skip this and rely on Telegram heartbeats
```

### Day 5 (Friday): Pinterest Setup + First Content — 3-4 hours

**This is a human task, not agent work.**

```bash
# 1. Create Pinterest business account (if not done)
# https://business.pinterest.com/
# Convert personal account or create new

# 2. Create boards (keyword-optimized names):
# Board 1: "Zodiac Sign Personality Traits"
# Board 2: "Birth Chart Reading for Beginners"
# Board 3: "Astrology Compatibility Guides"
# Board 4: "Mercury Retrograde Survival Tips"
# Board 5: "Monthly Horoscope [Year]"

# 3. If the site doesn't have 5 foundational articles yet (from Phase 0):
# WRITE THEM MANUALLY. Not with the agent. Not with AI.
# These establish E-E-A-T and must be genuinely human-written:
#   - About page with author bio and credentials
#   - "What Is a Birth Chart?" beginner guide
#   - 2-3 zodiac sign profiles with personal interpretive insights
# This is the most time-intensive part of Day 5.

# 4. Create 2-3 pins per existing article in Canva (free tier)
# Format: 1000x1500 vertical
# Pin to appropriate boards
# Include article URL in pin description

# 5. Test the content pipeline end-to-end:
# Send a message to the agent in Telegram:
# "Please draft a blog post about Aries personality traits. Use the wordpress skill to create a draft. Verify any astrological claims with the ephemeris skill."
# Verify: agent creates WP draft, sends confirmation with edit link
```

### Day 6 (Saturday): Review + Fixes — 1-2 hours

```bash
# 1. Review everything from the week
openclaw status --deep
openclaw cron list
openclaw health --json

# 2. Check Anthropic API usage
# https://console.anthropic.com/ > Usage
# Note actual spend so far this week

# 3. Review any agent memory files created
cat ~/.openclaw/workspace/memory/seo/latest.md
cat ~/.openclaw/workspace/memory/content/editorial-calendar.md

# 4. Fix any issues discovered:
# - Skills that errored
# - Telegram messages that didn't send
# - Cron jobs that ran but produced wrong output

# 5. Continue Meta API bootstrapping
node ~/.openclaw/workspace/scripts/meta-bootstrap.js
# Run 5-10 times
```

### Day 7 (Sunday): Rest + Plan Week 2

**Minimal activity.** The agent runs on autopilot for the first time:
- Uptime checks run every 4 hours
- Heartbeats every 30 min during active hours
- No content or SEO crons fire on Sunday

**Review plan for Week 2:**
- Continue Meta API bootstrapping (5-10 calls/day)
- Refine skill scripts based on Day 4-6 testing
- Start first automated content draft cycle (Tuesday cron)
- Create more Pinterest pins (human task)
- Monitor API costs

---

## 12. Things That Need Research Before Implementation

These items are flagged throughout the plan. Consolidating them here with priority.

| Item | Priority | Why It's Blocked | Estimated Research Time |
|---|---|---|---|
| `astronomia` npm package exact API and imports | HIGH (blocks ephemeris skill) | Library's export structure needs runtime verification. May need to switch to `swisseph` or a REST API. | 2-4 hours |
| RankMath REST API field names for SEO meta | MEDIUM (blocks SEO optimization in WP) | The field names `rank_math_title`, `rank_math_description`, `rank_math_focus_keyword` are documented but may vary by RankMath version. Test against actual WP install. | 1 hour |
| Meta Ad Creative upload via API | MEDIUM (blocks Phase 3 creative deployment) | The Meta Marketing SDK can upload images to the creative library, but the exact flow for creating an Ad with uploaded creative needs to be tested. The `meta-ads-mutate.js` script only handles campaigns — ad set and ad creation with creative attachment needs to be added. | 4-6 hours |
| Automated text-on-image percentage check | LOW (human handles this manually for now) | Options: Tesseract OCR, Claude Vision, or Meta's deprecated tool. For MVP, skip and rely on human judgment. | 2-3 hours |
| Pinterest API developer access | LOW (manual pinning works for Phase 1-3) | Pinterest API requires applying for developer access and app review. Research the current application process and whether it's worthwhile at this scale. | 1-2 hours |
| Meta system user token "Never expire" availability | MEDIUM | Whether "Never" is actually available depends on the business account type and app review status. If not available, the longest option may be 60 days, requiring a renewal reminder. | 30 min (check during setup) |
| OpenClaw exec command argument passing with special characters | MEDIUM | Blog post content with quotes, HTML, and special characters may break when passed as `--content` argument. May need to use stdin or temp files instead. Test with actual HTML content. | 1-2 hours |

---

## 13. What This Plan Does NOT Cover (and Why)

1. **Google Ads implementation**: Removed per Plan 3. At $300-500/month budget, Google Ads is a waste. If budget increases to $500+ and Meta is profitable, build a google-ads skill then.

2. **Custom dashboard**: Removed per Plan 3. OpenClaw's built-in dashboard + Telegram is sufficient for a solo operator. A custom dashboard is a separate multi-week project with no marketing ROI.

3. **Automated social posting**: X costs $100/month for API write access. Reddit bans detected automation. The agent drafts; the human posts. This is intentional, not a limitation.

4. **Email automation skill**: MailerLite handles welcome sequences and newsletters natively. The agent drafts content; the human pastes it into MailerLite. Building a MailerLite API skill is a Phase 5 optimization.

5. **Image generation**: Plan 3 correctly identified that human-created images are better for ad creatives at this stage. The creative pipeline (Section 6) handles this via the task board.

6. **A/B testing framework**: At $3-5/day Meta budget, you don't have enough volume for statistically significant A/B tests. Manual creative rotation based on weekly performance reviews is sufficient.

7. **Multi-agent architecture**: One agent is enough. Multi-agent adds complexity with no benefit at this scale.
