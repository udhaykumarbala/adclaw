# AdClaw Long-Term — Autonomous Marketing Agent

## Start Here
**Read `plan-final.md`** — the definitive product spec. Team-ready, no timeline constraints.
**Reference `plan-4.md`** — for implementation details (exact code, configs, commands).
**Reference `plan-5.md`** — for the solo-operator-friendly version.

## Evolution

| Plan | Focus | Key Change |
|------|-------|-----------|
| plan-1.md | Full synthesis of all research | 16-section comprehensive plan |
| plan-2.md | Reality check | 22 issues fixed: budget math, timeline lies, technical impossibilities |
| plan-3.md | Practitioner truth | Killed Google Ads at this budget, cut content velocity, added honest timeline to revenue |
| plan-4.md | Implementation spec | Exact file structures, cron commands, skill code, day-by-day playbook |
| plan-5.md | **Final — simplified** | Cut 30% by ROI, forced monetization decision, de-risked week 1, defined kill criteria |

## Key Decisions Made (Plan 5)

- **Monetization**: Personalized birth chart PDFs at $15-25
- **Paid ads**: Meta only (Google Ads killed — budget too small)
- **Social**: Agent drafts content, human posts from personal accounts
- **Skills**: 5 total (not 11), built over 6 weeks in priority order
- **Cron**: Start with 4 jobs (not 9), add as system proves itself
- **Human time**: 6-10 hrs/week months 1-3, dropping to 2-4 hrs/week by month 6
- **Kill criteria**: Zero sales by month 6, or agent needs 4+ hrs/week debugging

## Research
- `research/apis-and-tools.md` — All marketing APIs, SDKs, auth methods, rate limits
- `research/market-research.md` — Competitors, astrology niche, compliance, risks
- `research/infrastructure.md` — OpenClaw daemon, skills, cron, Telegram, dashboard
