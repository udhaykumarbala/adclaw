---
name: adclaw-api
description: Interface to the AdClaw server API for deploying pages, tracking events, and managing campaigns.
---

# AdClaw API Interface

The AdClaw server runs at: **http://adclaw-server:3402**

IMPORTANT: Always include `-H "x-internal-agent: $INTERNAL_SECRET"` in every curl call.

## Available endpoints

### Create Campaign Record
```bash
curl -X POST http://adclaw-server:3402/api/campaign \
  -H "Content-Type: application/json" \
  -H "x-internal-agent: $INTERNAL_SECRET" \
  -d '{
    "name": "Campaign Name",
    "product": "Product description",
    "budget": 50000,
    "currency": "INR",
    "targetAudience": "18-35 foodies in Chennai",
    "goal": "awareness",
    "location": "Chennai",
    "channels": ["google_search", "meta", "instagram"],
    "budgetSplit": {"google_search": 40, "meta": 35, "instagram": 25},
    "timeline": "4 weeks",
    "kpis": {"ctr": ">2%", "conversion": ">5%"}
  }'
```
**Response:** `{"success": true, "campaign": {"id": "uuid-here", ...}}`
IMPORTANT: Extract the "id" field. You need it for all subsequent API calls.

### Deploy Landing Page (file-based)
```bash
curl -X POST http://adclaw-server:3402/api/landing \
  -H "Content-Type: application/json" \
  -H "x-internal-agent: $INTERNAL_SECRET" \
  -d @/tmp/landing-{slug}.json
```
**Response:** `{"success": true, "url": "https://public-url/sites/{slug}.html", "slug": "slug-name"}`

### Deploy Event Page (file-based)
```bash
curl -X POST http://adclaw-server:3402/api/event \
  -H "Content-Type: application/json" \
  -H "x-internal-agent: $INTERNAL_SECRET" \
  -d @/tmp/event-{slug}.json
```
**Response:** `{"success": true, "url": "https://public-url/events/{slug}.html", "slug": "slug-name"}`

### Update Campaign
```bash
curl -X PATCH http://adclaw-server:3402/api/campaign/{campaignId} \
  -H "Content-Type: application/json" \
  -H "x-internal-agent: $INTERNAL_SECRET" \
  -d '{"landingPageSlug": "slug", "status": "active"}'
```

### Get Analytics Report
```bash
curl -H "x-internal-agent: $INTERNAL_SECRET" http://adclaw-server:3402/api/report/{campaignId}
```

### List All Pages
```bash
curl http://adclaw-server:3402/api/pages
```

### Health Check
```bash
curl http://adclaw-server:3402/health
```

## Usage
Use the `exec` tool to run these curl commands. For deploying pages with HTML content, ALWAYS use the file-based method (write JSON to /tmp/ then curl with -d @file).
