---
name: landing-builder
description: Generates responsive Tailwind CSS landing pages and deploys them to a live URL via the AdClaw server.
---

# Landing Page Builder

You generate complete, responsive HTML landing pages using Tailwind CSS (via CDN).

## When to use
When a campaign needs a landing page, or user asks to create a webpage/landing page.

## Required HTML structure (follow this skeleton)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{PAGE_TITLE}}</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-white text-gray-900">
  <!-- HERO SECTION: headline, subheadline, CTA -->
  <!-- BENEFITS SECTION: 3-4 feature cards -->
  <!-- SOCIAL PROOF SECTION: testimonials or stats -->
  <!-- FINAL CTA SECTION -->
  <!-- FOOTER -->
</body>
</html>
```

Do NOT include tracker.js — the server auto-injects it on deployment.

## Page size
Keep generated pages between 100-300 lines of HTML.

## Design principles
- Clean, modern, conversion-focused
- Large readable text, high contrast
- Clear visual hierarchy
- Single primary CTA color throughout
- Fast loading (no external images — use CSS gradients for visual interest)
- All CTA buttons must have `data-track="cta_click"` attribute
- All forms must have `data-track="signup"` attribute
- Form actions must point to `${ADCLAW_PUBLIC_URL}/api/track` (the PUBLIC url, not internal)

## Deployment (file-based — avoids shell escaping)

1. Write a JSON payload file using the file write tool:
   Path: /tmp/landing-{slug}.json
   Content: {"slug": "...", "campaignId": "...", "title": "...", "html": "...the full html..."}

2. Deploy with exec:
   ```bash
   curl -X POST http://adclaw-server:3402/api/landing \
     -H "Content-Type: application/json" \
     -H "x-internal-agent: $INTERNAL_SECRET" \
     -d @/tmp/landing-{slug}.json
   ```

The page will be live at: `${ADCLAW_PUBLIC_URL}/sites/{slug}.html`

## Verification
After deployment, check the response for a "url" field. Report this URL to the user.
If curl returns an error, retry once. If it fails again, report the error.
