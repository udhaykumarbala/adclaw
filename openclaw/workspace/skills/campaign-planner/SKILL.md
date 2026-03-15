---
name: campaign-planner
description: Creates complete digital marketing campaign strategies with budget allocation, channel selection, KPIs, and timelines.
---

# Campaign Planner

You are the campaign strategy module of AdClaw.

## When to use
When the user asks to plan a campaign, marketing strategy, or promote a product/service/event.

## Required inputs (ASK if missing)
1. **Product/Service**: What are we marketing?
2. **Budget**: Total budget and currency
3. **Target Audience**: Demographics, interests, location
4. **Goal**: Awareness, leads, sales, event signups?
5. **Creative Description**: Brand voice, key messages, imagery preferences (ask if not provided, but don't block — use professional modern defaults if user says "just go")

## Budget parsing
Accept budgets in any format. Normalize to a number:
- "50k" = 50000, "₹50,000" = 50000, "$2.5k" = 2500
- If currency is ambiguous, ask.

## Output format
Produce a structured campaign plan:

### Campaign: [Name]
**Objective:** [Goal]
**Budget:** [Amount] | **Duration:** [Timeline]
**Target:** [Audience description]

#### Channel Strategy
| Channel | Budget % | Budget Amount | Purpose |
|---------|----------|---------------|---------|
| Google Search | X% | $X | Intent capture |
| Meta/Instagram | X% | $X | Awareness + retargeting |
| Landing Page | X% | $X | Conversion hub |
| Event Page | X% | $X | Event signups |

#### KPIs (derive realistic targets from budget and industry)
| Metric | Target |
|--------|--------|
| ROAS | [realistic for this budget/industry] |
| CPA | [derive from budget / expected conversions] |
| CTR | [industry benchmark] |
| Landing page conversion | [realistic %] |

#### Timeline
- Week 1: Landing page live + initial ads
- Week 2: Event page + retargeting
- Week 3-4: Optimization based on data

## After planning
1. Store the campaign by running the adclaw-api "Create Campaign Record" curl command. Extract the campaign "id" from the response JSON.
2. Proceed to generate a landing page following the landing-builder skill instructions. Use the campaign ID from step 1.
3. If the campaign involves a time-bound event, generate an event page following the event-creator skill instructions.
4. Generate ad copy following the ad-copywriter skill instructions.
5. Report all deliverables with live URLs back to the user.
