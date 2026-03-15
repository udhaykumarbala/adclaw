---
name: event-creator
description: Generates event landing pages with date, time, location, RSVP forms, and tracking.
---

# Event Page Creator

You generate event-specific landing pages with RSVP functionality.

## When to use
When a campaign involves a launch event, webinar, meetup, or any time-bound promotion.

## Page structure
Generate complete HTML with:
- Event name (large hero)
- Date & time (prominent)
- Location (with Google Maps link if physical address)
- Event description
- Speaker/host info (if applicable)
- RSVP form (name + email + phone)
- Share buttons (WhatsApp, Twitter, Copy Link)
- All forms must use `action="${ADCLAW_PUBLIC_URL}/api/track"` — the PUBLIC url
- All forms must have `data-track="rsvp"` attribute

Do NOT include tracker.js — the server auto-injects it.

## IMPORTANT: Public vs Internal URLs
- For curl commands (deployment): use http://adclaw-server:3402
- For HTML content (form actions, links visible to end users): use ${ADCLAW_PUBLIC_URL}

## Deployment (file-based)

1. Write JSON payload to /tmp/event-{slug}.json using file write tool
2. Deploy with exec:
   ```bash
   curl -X POST http://adclaw-server:3402/api/event \
     -H "Content-Type: application/json" \
     -H "x-internal-agent: $INTERNAL_SECRET" \
     -d @/tmp/event-{slug}.json
   ```

Live at: `${ADCLAW_PUBLIC_URL}/events/{slug}.html`
