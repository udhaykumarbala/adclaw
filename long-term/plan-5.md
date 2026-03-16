# AdClaw Plan 5 — The Final Plan

**Created:** 2026-03-16
**Status:** FINAL. This is the plan Udhay follows.
**Reading time:** ~15 minutes

---

## Why AdClaw (and Not Just Semrush + Buffer)

The honest answer: for most people, Semrush + Buffer + Google Ads Manager would be the right call. Those tools are proven, maintained by dedicated teams, and require zero development time. Here is the specific case for why AdClaw is still worth building for Udhay:

**1. The tools don't compose.** Semrush tells you keyword X is ranking at position 14. Buffer schedules a tweet. Google Ads Manager shows your CTR dropped. But no existing tool suite connects these signals and acts on them. You, the human, are the integration layer -- checking three dashboards, making the decision, clicking the buttons. That is 5-8 hours/week of context-switching busywork for a side project. AdClaw replaces the human-as-glue layer.

**2. Cost at this scale.** Semrush Pro is $130/month. Buffer paid is $15/month. Canva Pro is $13/month. Ahrefs Lite is $99/month. Even picking just two of these is $145-245/month -- almost half the total budget. AdClaw's marginal cost after development is $30-60/month in Anthropic API fees, and it does more than any one of these tools because it orchestrates across them.

**3. AdClaw already exists in embryonic form.** This is not a greenfield build. OpenClaw is running. The Express.js server is built. Telegram works. The question is not "should I start a 3-month development project" but "should I spend 10-15 hours building 3 skills on top of infrastructure that already exists."

**4. The real alternative is doing nothing.** Be honest. If Udhay doesn't build AdClaw, he won't pay $245/month for Semrush + Buffer + Ahrefs for a side project. He will do marketing manually when he remembers, which is sporadically at best. AdClaw's value is not replacing professional tools -- it is replacing the zero-marketing scenario.

**The kill signal:** If after 8 weeks of running AdClaw, total human time spent on maintenance + fixes exceeds the time saved by automation, switch to a simpler manual workflow and stop development.

---

## The One Decision

The astrology site sells **personalized birth chart PDF reports for $15-25 each**.

Not readings. Not subscriptions. Not affiliate products. Not ad revenue.

Here is why:

- **Digital product = zero marginal cost.** Once the template is built, each sale is pure margin. No scheduling calls, no hourly time commitment, no inventory.
- **Birth chart data is computable.** The ephemeris skill generates the raw chart data. A well-designed template turns that data into a personalized 15-20 page PDF. This is one of the rare products where an AI agent can handle 80% of the fulfillment.
- **$15-25 is the impulse-buy price point for astrology.** Lower than a reading ($50-150), higher than nothing. Requires no sales call, no consultation. Credit card, done.
- **It creates a conversion event.** Without something to sell, there is no way to measure whether the marketing is working beyond vanity metrics (sessions, impressions). A $20 purchase is an unambiguous signal.
- **The math works at small scale.** 20 sales/month = $300-500/month = break-even on the total budget. That is 20 out of however many hundreds or thousands of visitors the site gets. Achievable by month 6-9 if the marketing works.

**The funnel:**
```
Blog post / Pinterest pin / Meta ad
         |
    Landing page with free birth chart calculator
         |
    Free result shown immediately (basic: Sun, Moon, Rising)
         |
    "Want the full 20-page interpretation? $19"
         |
    Purchase -> automated PDF generation -> email delivery
         |
    Email welcome sequence -> repeat purchases (compatibility, yearly forecast)
```

**Prerequisites before anything else:**
1. The birth chart calculator must exist on the site (even a basic one)
2. The paid PDF report template must be built
3. A payment processor (Stripe or Gumroad) must be connected
4. GA4 purchase event tracking must be working

If these are not done, no amount of marketing automation matters. Build the product first.

---

## MVP: Week 1

Stop planning. Start here. The goal for week 1 is to have something running that does useful work, even if it is minimal.

### What You Set Up (one evening, ~3 hours)

1. **OpenClaw gateway running on Mac Mini** (should already be done from the hackathon)
2. **Telegram bot connected** with two groups: `adclaw-alerts` and `adclaw-content`
3. **One skill: `search-console`** -- pulls SEO data from Google Search Console
4. **Two cron jobs:**
   - Daily SEO check (9:30 AM IST) -- pulls clicks/impressions, writes to memory, alerts on drops
   - Weekly report (Friday 6:30 PM IST) -- summarizes the week's SEO data, sends to Telegram
5. **MEMORY.md written** with brand identity, budget, and the one monetization decision above

### What This Gives You Immediately

- You wake up every morning and the agent has already checked your SEO data
- Every Friday you get a summary without lifting a finger
- If something breaks (site goes down, rankings crash), you get an alert
- You have a working skill/cron pattern to copy for every subsequent skill

### What This Does NOT Include

- No paid ads (not ready yet)
- No content generation (build the wordpress skill next week)
- No Meta integration (needs 2+ weeks of API bootstrapping anyway)
- No Pinterest automation (pin manually, it takes 10 minutes)

The point is: the agent is alive and doing something useful on day 1. Not day 30.

---

## Build Order

Numbered. Do them in this order. Do not skip ahead.

### 1. Product (Week 0, before anything else)
- Build or finish the birth chart calculator on the WordPress site
- Create the paid PDF report template (even if rough)
- Connect Stripe/Gumroad for payments
- Set up GA4 purchase event tracking
- Write 3-5 foundational articles manually (About page, birth chart guide, 2-3 zodiac profiles)
- **Effort:** 15-25 hours of human work. No agent involved.

### 2. OpenClaw + Telegram + Search Console Skill (Week 1)
- Install/configure OpenClaw gateway as launchd daemon
- Create Telegram bot and groups
- Build `search-console` skill with `sc-query.js` script
- Set up 2 cron jobs (daily SEO, weekly report)
- Write MEMORY.md and HEARTBEAT.md
- **Effort:** 3-4 hours. Mostly copy-paste from plan-4 specs.

### 3. GA4 Skill + WordPress Skill (Week 2)
- Build `ga4` skill with `ga4-query.js` script (same Google SA, easy)
- Build `wordpress` skill with `wp-post.js` and `wp-read.js` scripts
- Add content-batch cron job (Tuesday mornings -- drafts 1 blog post)
- Test the full content pipeline: agent drafts, sends to Telegram, human reviews, agent publishes
- **Effort:** 4-6 hours.

### 4. Ephemeris Skill (Week 3)
- Build `ephemeris` skill for verifying astrological dates in content
- Test with upcoming Mercury retrograde dates
- If the `astronomia` npm package is too finicky, use a free REST API or pre-computed transit tables as fallback
- **Effort:** 2-4 hours.

### 5. Meta API Bootstrapping (Weeks 1-4, background task)
- Create Meta Developer App on day 1
- Run `meta-bootstrap.js` script 5-10x/day for 15+ days to accumulate API calls
- Apply for Advanced Access when threshold is met
- This runs in the background while you build other things
- **Effort:** 10 minutes/day for 3 weeks. Then done.

### 6. Meta Ads Skill (Week 5-6, after Advanced Access is granted)
- Build `meta-ads` skill with read and mutate scripts
- Create first campaign: email list building via free birth chart offer
- Start at $3/day, paused, requiring human approval to activate
- Add ad-spend-monitor cron job (3x/day weekdays)
- Add ad-optimization cron job (2x/week)
- **Effort:** 4-6 hours for the skill. Campaign setup is 1-2 hours.

### 7. Iterate and Stabilize (Weeks 7-12)
- Fix everything that broke in weeks 1-6
- Tune cron job frequency based on actual Anthropic API costs
- Build the weekly-seo-optimization cron job
- Build the monthly-strategy cron job
- Start manual Pinterest pinning (2-3 pins per published article)
- Set up MailerLite email welcome sequence
- **Effort:** 2-4 hours/week of maintenance and content review.

### DO NOT BUILD (cut from plan-4)
- Google Ads skill (budget too small, killed in plan-3)
- Custom dashboard (OpenClaw dashboard + Telegram is enough)
- Pinterest API automation (manual pinning works fine at 2-3 pins/week)
- Automated social posting on X/Reddit (X API costs $100/month, Reddit bans bots)
- MailerLite API skill (paste content into MailerLite manually, it takes 5 minutes)
- Image generation skill (human creates images in Canva, it takes 10 minutes)
- Reporting skill (agent generates reports from memory files without a dedicated skill)
- Multi-agent architecture (one agent is enough for one site)

---

## Daily Rhythm

### Automated (Agent Does This, No Human Involved)
| Time (IST) | What Happens |
|---|---|
| 8:00 AM | Heartbeats begin (every 30 min until 10 PM) |
| 9:30 AM | Daily SEO check: pull Search Console data, compare with yesterday, alert if drops |
| 9:30 AM, 2:30 PM, 7:30 PM (weekdays) | Ad spend monitor: check Meta spend vs daily cap, alert if pacing high |

### Human (5-10 minutes/day on average)
- Glance at Telegram notifications. If nothing flagged, do nothing.
- If a content draft is ready for review: read it, add your insights, reply APPROVED (20-30 min, happens ~2x/week, not daily)
- If a creative is requested: make it in Canva, send to Telegram (15-20 min, happens ~1x/week)

**Most days require zero human action.** The agent is quiet unless something needs attention. This is by design.

---

## Weekly Rhythm

| Day | Automated | Human |
|---|---|---|
| **Monday** | Nothing special | Glance at Telegram, plan the week |
| **Tuesday** | Content-batch cron: agent drafts 1 blog post, sends to Telegram | -- |
| **Wednesday** | Weekly SEO optimization: agent reviews ranking opportunities | Review blog draft, add insights, approve (20-30 min) |
| **Thursday** | Agent publishes approved article | Create 2-3 Pinterest pins for the article (15-20 min) |
| **Friday** | Weekly report generated and sent to Telegram | Read the report (5 min). Note anything to adjust. |
| **Saturday** | Ad optimization review (if Meta running) | Approve/reject ad changes if any (5 min) |
| **Sunday** | Minimal: uptime checks, heartbeats only | Rest |

**Total human time:** 1-2 hours/week in steady state (weeks 7+).

---

## Monthly Review

On the 1st of each month, the agent generates a monthly strategy report. You read it and answer these questions:

1. **Is the Anthropic API spend under $100?** If not, reduce cron frequency or switch more jobs to Haiku.
2. **How many articles were published?** Target: 4-6. If less, the content pipeline is broken. If more, quality may be slipping.
3. **Is organic traffic growing?** Even small growth (10% month-over-month) is fine in months 1-6. Flat is concerning. Declining means something is wrong with the content or technical SEO.
4. **Are Meta Ads generating email signups?** Target CPL (cost per lead) under $3. If above $5 consistently, the offer or targeting needs work.
5. **How many products sold?** This is the only metric that ultimately matters. Track it from month 1, even if the number is zero for months.
6. **How much total was spent?** Add up: Anthropic API + Meta Ads + hosting + any tools. Compare to revenue. When does break-even happen?

Write the answers in MEMORY.md under "Current State" so the agent has context for next month.

---

## Skills to Build

| # | Skill | Priority | Effort | When | Why |
|---|---|---|---|---|---|
| 1 | `search-console` | CRITICAL | 3 hours | Week 1 | SEO monitoring. Immediate value. |
| 2 | `ga4` | HIGH | 2 hours | Week 2 | Traffic data for reports. Same auth as search-console. |
| 3 | `wordpress` | HIGH | 3 hours | Week 2 | Content publishing pipeline. |
| 4 | `ephemeris` | MEDIUM | 3 hours | Week 3 | Astrological accuracy. Non-negotiable for content quality, but not urgent. |
| 5 | `meta-ads` | HIGH | 5 hours | Week 5-6 | Paid acquisition. Blocked by API bootstrapping anyway. |

**Total: 5 skills, ~16 hours of development.**

Skills that plan-4 specified but are CUT from this plan:
- `google-ads` -- killed. Budget too small.
- `seo-audit` -- replaced by browser + search-console data. Not worth a dedicated skill.
- `reporting` -- agent writes reports from memory files natively. No wrapper needed.
- `social-content` -- agent generates text natively. No wrapper needed.
- `budget-guard` -- built into meta-ads skill as logic, not a separate skill.

---

## Cron Jobs

Start with 4. Add more only after the first 4 are proven stable.

### Phase 1 (Week 1): Start with these

| Job | Schedule | Model | Est. $/month |
|---|---|---|---|
| `daily-seo` | 9:30 AM IST daily | Haiku | $0.15 |
| `weekly-report` | Friday 6:30 PM IST | Sonnet | $0.48 |
| `uptime-check` | Every 4 hours | Haiku | $0.36 |
| `weekly-cleanup` | Sunday 3:30 AM IST | Haiku | $0.01 |

**Phase 1 cron cost: ~$1/month**

### Phase 2 (Week 3): Add content

| Job | Schedule | Model | Est. $/month |
|---|---|---|---|
| `content-batch` | Tuesday 8:30 AM IST | Sonnet | $0.60 |
| `weekly-seo-opt` | Wednesday 10:30 AM IST | Sonnet | $0.24 |

**Phase 2 cron cost: ~$1.85/month cumulative**

### Phase 3 (Week 6): Add ads monitoring

| Job | Schedule | Model | Est. $/month |
|---|---|---|---|
| `ad-spend-monitor` | 9:30 AM, 2:30 PM, 7:30 PM IST weekdays | Haiku | $0.23 |
| `ad-optimization` | Wednesday + Saturday 9:30 PM IST | Sonnet | $0.64 |

**Phase 3 cron cost: ~$2.72/month cumulative**

### Phase 4 (Month 3): Add strategy

| Job | Schedule | Model | Est. $/month |
|---|---|---|---|
| `monthly-strategy` | 1st of month 10:30 AM IST | Sonnet | $0.20 |

**Final cron cost: ~$2.92/month + heartbeats ($0.72) = $3.64/month**

With 3x reality buffer for context growth, retries, and ad-hoc queries: **$25-40/month Anthropic API total.**

That is 9 cron jobs total, but you only start with 4. The rest prove themselves in.

---

## Human Time Budget

Be honest about this. If it exceeds the budget, the project is not sustainable.

| Month | Hours/Week | What You're Doing |
|---|---|---|
| Month 0 (prerequisites) | 10-15 hrs total | Building the product: calculator, PDF template, payment, foundational articles |
| Month 1 (weeks 1-4) | 5-8 hrs/week | Building skills, fixing bugs, writing first content, manual Pinterest |
| Month 2 (weeks 5-8) | 3-5 hrs/week | Content review, Pinterest pins, Meta Ads setup, fixing what broke |
| Month 3-6 (steady state) | 1-3 hrs/week | Content review + approval, reading reports, occasional fixes |
| Month 7+ (mature) | 30-60 min/week | Glance at reports, approve ad changes, monthly strategy review |

**The honest truth:** Month 1 is development-heavy. If you cannot commit 5-8 hours/week in month 1, delay the start. There is no shortcut through the setup phase.

---

## Money Budget

| Phase | Anthropic API | Meta Ads | Hosting | Other | Total |
|---|---|---|---|---|---|
| Month 1 (setup) | $30-50 | $0 | $15-25 | $0 | $45-75 |
| Month 2 (content) | $40-70 | $0 | $15-25 | $0 | $55-95 |
| Month 3 (ads start) | $50-80 | $90-120 ($3-4/day) | $15-25 | $0 | $155-225 |
| Month 4-6 (steady) | $60-100 | $90-150 | $15-25 | $0-13 (Canva Pro optional) | $165-288 |
| Month 7+ (scaling) | $60-100 | $150-200 | $15-25 | $13 | $238-338 |

**Hard caps (set these in the provider consoles, non-negotiable):**
- Anthropic API: $100/month
- Meta Ads: $5/day max at campaign level ($150/month)
- Total monthly: $350 absolute ceiling in months 1-6

**Break-even target:** 15-25 PDF report sales/month at $19 each = $285-475/month. Realistic by month 6-9 if everything works.

---

## When to Quit

These are kill criteria. If any of these are true, stop spending money and re-evaluate:

### At 3 months:
- **Zero organic search impressions** for any non-branded query. This means Google is not indexing or ranking the content at all. Something fundamental is wrong (penalized, noindex, extremely bad content).
- **Anthropic API costs consistently over $100** despite reducing cron frequency twice. The agent is too expensive for the value it provides.
- **The agent has required more than 4 hours/week of debugging/fixing** in every week of month 3. It is creating work, not saving it.

### At 6 months:
- **Zero product sales.** If the birth chart PDF has not sold a single copy in 6 months of marketing, the product-market fit is wrong. The problem is the product or the niche, not the marketing agent.
- **Fewer than 500 organic sessions/month.** The content strategy is not working at the scale needed.
- **Meta Ads CPL consistently above $5** with no downward trend after 3 months of optimization. The targeting or offer is fundamentally wrong.
- **Total spend exceeds $2,000** with total revenue under $200. The ROI math does not work.

### At 12 months:
- **Not breaking even.** If total revenue from the astrology site does not cover total costs (agent + ads + hosting) by month 12, this is a hobby, not a business. Decide if you are okay with that.

### Positive signal to double down:
- Product sales are recurring and growing (even slowly)
- Organic traffic is growing month-over-month
- Meta Ads CPL is under $2 and trending down
- Total human time is under 2 hours/week
- You are enjoying the process

---

## What to Do When It Breaks (Playbook)

### Agent stops responding on Telegram
```bash
openclaw gateway status
# If not running:
openclaw gateway restart
# If still not running, check logs:
cat /tmp/openclaw/openclaw-$(date +%Y-%m-%d).log | tail -50
# If OOM:
openclaw sessions cleanup
openclaw gateway restart
```

### API authentication fails (401/403 from any skill)
1. Agent auto-alerts on Telegram with the specific API that failed
2. Check the relevant credential:
   - Google: Service account may have been removed from SC/GA4. Re-add it.
   - WordPress: Application password may have been revoked. Regenerate.
   - Meta: System user token may have expired. Regenerate in Business Settings.
3. Update `.env` with new credential
4. Restart gateway: `openclaw gateway restart`
5. Manually trigger the failed cron job: `openclaw cron run <job-name>`

### Meta Ads account gets restricted
1. Agent auto-pauses all campaigns (if token still works)
2. Log into Meta Business Suite, review restriction reason
3. Submit appeal if appropriate
4. Delete `memory/alerts/meta-auth-failed.md` flag when resolved
5. Restart ad campaigns manually (agent will not auto-restart paused campaigns)

### Anthropic API costs spiking
1. Check usage at console.anthropic.com
2. If above $60 by mid-month, reduce immediately:
   - Disable: `ad-spend-monitor`, `weekly-seo-opt`, `monthly-strategy`
   - Reduce `daily-seo` to every-other-day
   - Keep: `uptime-check`, `weekly-report`, `content-batch`
3. Investigate: are sessions getting too long? Is context window bloated?
4. Run: `openclaw sessions cleanup`

### Mac Mini loses power or reboots
- Everything auto-recovers. launchd restarts the gateway.
- Cron jobs resume on their next scheduled time (missed jobs do NOT retroactively run).
- Meta Ads continue running on Meta's servers regardless.
- Check `openclaw cron list` to verify crons are intact.

### Content quality is declining
- Symptom: Agent drafts are generic, rankings are stagnant
- Check: Are you actually adding human insights to every article? If you are rubber-stamping approvals, quality will suffer.
- Fix: Spend more time per article (20-30 min), or reduce article count to 2-3/month and make each one exceptional.

---

## Appendix: Implementation Reference

For exact file structures, SKILL.md contents, script code, cron commands, API authentication walkthroughs, task board data model, creative pipeline specs, MEMORY.md template, and openclaw.json configuration, refer to **plan-4.md** in this directory.

Plan 4 is the technical reference manual. Plan 5 is what you actually follow.

Key sections in plan-4 to reference when building:
- Section 1: Exact file structure
- Section 2: Copy-pasteable cron commands
- Section 3: Step-by-step API authentication for each service
- Section 4: Complete SKILL.md and script code for all 5 skills
- Section 5: Task board JSON data model
- Section 6: Creative pipeline implementation
- Section 7: Monitoring and alerting specs
- Section 8: Recovery procedures (detailed)
- Section 9: MEMORY.md template
- Section 10: Complete openclaw.json
- Section 11: Day-by-day first week playbook

---

## Summary: The Entire Plan on One Page

**What you are building:** An autonomous marketing agent that manages an astrology website selling $19 birth chart PDF reports.

**The stack:** Mac Mini + OpenClaw + Telegram + 5 custom skills + 9 cron jobs (added incrementally).

**Month 1:** Build product (calculator + PDF + payments). Set up OpenClaw. Build search-console and wordpress skills. Start Meta API bootstrapping. Pin to Pinterest manually. Agent drafts blog posts, you review and publish. **Cost: $50-75. Revenue: $0. Human time: 5-8 hrs/week.**

**Month 2-3:** Build remaining skills. Launch Meta Ads at $3/day for email list building. Content pipeline is running. Pinterest is driving initial traffic. **Cost: $155-225. Revenue: $0-100. Human time: 3-5 hrs/week.**

**Month 4-6:** Everything is running. Optimize Meta Ads. Grow email list. Publish 4-6 articles/month. Organic traffic starts to compound. First product sales. **Cost: $165-288. Revenue: $100-400. Human time: 1-3 hrs/week.**

**Month 7-12:** Steady state. Agent runs autonomously. You review weekly reports and approve content. Add new products (compatibility reports, yearly forecast). **Cost: $238-338. Revenue: $300-1000. Human time: 30-60 min/week.**

**Break-even:** Month 6-9 if everything works. Month never if the product does not sell.

**Start today.** Not next week. Open your terminal and type `openclaw status --deep`. If it responds, you are already ahead of the plan.
