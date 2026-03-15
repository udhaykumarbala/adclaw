#!/bin/bash
set -e

# ══════════════════════════════════════════
#  AdClaw Demo Script
#  Usage:
#    ./scripts/demo.sh setup    — Full setup (run 30 min before demo)
#    ./scripts/demo.sh live     — Fire live events during demo
#    ./scripts/demo.sh report   — Pretty-print report for stage
#    ./scripts/demo.sh x402     — Show x402 payment response
#    ./scripts/demo.sh reset    — Clean everything for fresh start
# ══════════════════════════════════════════

BASE="${ADCLAW_SERVER_URL:-http://localhost:3402}"
SECRET="${INTERNAL_SECRET:-test-secret}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Colors
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m'

header() { echo -e "\n${CYAN}━━━ $1 ━━━${NC}\n"; }
ok() { echo -e "  ${GREEN}✓${NC} $1"; }
fail() { echo -e "  ${RED}✗${NC} $1"; }

# ── SETUP ──────────────────────────────────
cmd_setup() {
  echo -e "${BOLD}╔══════════════════════════════════════╗${NC}"
  echo -e "${BOLD}║     AdClaw Demo Setup                ║${NC}"
  echo -e "${BOLD}╚══════════════════════════════════════╝${NC}"

  # Check server
  header "1. Checking server health"
  if curl -sf "$BASE/health" > /dev/null 2>&1; then
    ok "Server running at $BASE"
  else
    fail "Server not running! Start it first:"
    echo "    cd server && PORT=3402 INTERNAL_SECRET=$SECRET node dist/index.js"
    exit 1
  fi

  # Clean old data
  header "2. Cleaning old data"
  rm -f "$PROJECT_DIR/server/data/events.jsonl" "$PROJECT_DIR/server/data/campaigns.json"
  rm -f "$PROJECT_DIR/server/public/sites/"*.html "$PROJECT_DIR/server/public/events/"*.html
  ok "Data cleaned"

  # Create campaign
  header "3. Creating demo campaign"
  RESP=$(curl -sf -X POST "$BASE/api/campaign" \
    -H "Content-Type: application/json" \
    -H "x-internal-agent: $SECRET" \
    -d '{
      "name": "Chennai Coffee Grand Opening",
      "product": "Artisan coffee shop — single origin, expert baristas",
      "budget": 50000,
      "currency": "INR",
      "targetAudience": "18-35 foodies, coffee lovers, remote workers in Chennai",
      "goal": "awareness + event signups for grand opening",
      "location": "Nungambakkam, Chennai 600034",
      "channels": ["google_search", "meta", "instagram"],
      "budgetSplit": {"google_search": 40, "meta": 35, "instagram": 25},
      "timeline": "4 weeks",
      "kpis": {"ctr": ">2%", "conversion": ">5%", "rsvps": ">200"}
    }')
  CID=$(echo "$RESP" | python3 -c "import sys,json; print(json.load(sys.stdin)['campaign']['id'])")
  ok "Campaign created: $CID"

  # Save campaign ID for other commands
  echo "$CID" > /tmp/adclaw-demo-cid.txt

  # Deploy landing page
  header "4. Deploying landing page"
  LANDING_HTML=$(cat "$SCRIPT_DIR/demo-landing.html")
  python3 -c "
import json
with open('/tmp/adclaw-demo-landing.json', 'w') as f:
    json.dump({
        'slug': 'chennai-coffee',
        'campaignId': '$CID',
        'title': 'Chennai Coffee Co. — Grand Opening',
        'html': open('$SCRIPT_DIR/demo-landing.html').read()
    }, f)
"
  RESP=$(curl -sf -X POST "$BASE/api/landing" \
    -H "Content-Type: application/json" \
    -H "x-internal-agent: $SECRET" \
    -d @/tmp/adclaw-demo-landing.json)
  LANDING_URL=$(echo "$RESP" | python3 -c "import sys,json; print(json.load(sys.stdin)['url'])")
  ok "Landing page: $LANDING_URL"

  # Deploy event page
  header "5. Deploying event page"
  python3 -c "
import json
html = '''<!DOCTYPE html>
<html lang=\"en\">
<head><meta charset=\"UTF-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1.0\">
<title>Grand Opening Event</title><script src=\"https://cdn.tailwindcss.com\"></script></head>
<body class=\"bg-gradient-to-b from-amber-50 to-white\">
<div class=\"max-w-2xl mx-auto px-6 py-20 text-center\">
<div class=\"inline-block px-4 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium mb-6\">Live Event</div>
<h1 class=\"text-5xl font-bold text-gray-900\">Grand Opening</h1>
<p class=\"text-2xl mt-4 text-gray-600\">March 22, 2026 — 7:00 AM</p>
<p class=\"mt-2 text-gray-500\">123 Coffee Lane, Nungambakkam, Chennai</p>
<div class=\"mt-8 bg-white rounded-2xl p-8 shadow-sm border border-amber-100\">
<h3 class=\"text-lg font-semibold mb-4\">RSVP for Free Coffee</h3>
<form data-track=\"rsvp\" class=\"space-y-3\">
<input type=\"text\" name=\"name\" placeholder=\"Your Name\" class=\"w-full p-3 border rounded-lg\">
<input type=\"email\" name=\"email\" placeholder=\"Email\" class=\"w-full p-3 border rounded-lg\">
<button type=\"submit\" data-track=\"cta_click\" class=\"w-full bg-amber-600 text-white py-3 rounded-lg text-lg font-semibold hover:bg-amber-700 transition\">Reserve My Spot</button>
</form></div>
<p class=\"mt-6 text-gray-400 text-sm\">First 100 visitors get free coffee all day</p>
</div></body></html>'''
with open('/tmp/adclaw-demo-event.json', 'w') as f:
    json.dump({'slug': 'grand-opening', 'campaignId': '$CID', 'html': html}, f)
"
  RESP=$(curl -sf -X POST "$BASE/api/event" \
    -H "Content-Type: application/json" \
    -H "x-internal-agent: $SECRET" \
    -d @/tmp/adclaw-demo-event.json)
  EVENT_URL=$(echo "$RESP" | python3 -c "import sys,json; print(json.load(sys.stdin)['url'])")
  ok "Event page: $EVENT_URL"

  # Activate campaign
  header "6. Activating campaign"
  curl -sf -X PATCH "$BASE/api/campaign/$CID" \
    -H "Content-Type: application/json" \
    -H "x-internal-agent: $SECRET" \
    -d '{"status":"active","landingPageSlug":"chennai-coffee","eventPageSlug":"grand-opening"}' > /dev/null
  ok "Campaign set to ACTIVE"

  # Seed events
  header "7. Seeding analytics (200 events)"
  ADCLAW_SERVER_URL="$BASE" INTERNAL_SECRET="$SECRET" npx tsx "$SCRIPT_DIR/seed-demo-data.ts" "$CID" 2>&1 | tail -1
  ok "Events seeded"

  # Summary
  header "Setup Complete"
  echo -e "  Campaign ID:  ${YELLOW}$CID${NC}"
  echo -e "  Landing Page: ${YELLOW}$LANDING_URL${NC}"
  echo -e "  Event Page:   ${YELLOW}$EVENT_URL${NC}"
  echo -e "  Dashboard:    ${YELLOW}$BASE/dashboard/${NC}"
  echo -e "  Report:       ${YELLOW}$BASE/api/report/$CID${NC}"
  echo ""
  echo -e "  ${BOLD}Open these in browser tabs before going on stage:${NC}"
  echo -e "  1. $BASE/dashboard/"
  echo -e "  2. $LANDING_URL"
  echo -e "  3. $EVENT_URL"
  echo ""
}

# ── LIVE EVENTS (fire during demo to make dashboard update) ──
cmd_live() {
  CID=$(cat /tmp/adclaw-demo-cid.txt 2>/dev/null || echo "demo-campaign-001")
  echo -e "${BOLD}Firing live events...${NC}"

  for i in $(seq 1 10); do
    for evt in page_view page_view cta_click page_view scroll_50; do
      curl -sf -X POST "$BASE/api/track" \
        -H "Content-Type: application/json" \
        -d "{\"campaignId\":\"$CID\",\"pageSlug\":\"chennai-coffee\",\"eventName\":\"$evt\",\"clientId\":\"live-visitor-$RANDOM\"}" > /dev/null &
    done
    sleep 0.5
  done
  wait
  ok "50 live events fired — dashboard should be updating"
}

# ── PRETTY REPORT (show on stage) ──
cmd_report() {
  CID=$(cat /tmp/adclaw-demo-cid.txt 2>/dev/null || echo "demo-campaign-001")

  curl -sf "$BASE/api/report/$CID" -H "x-internal-agent: $SECRET" | python3 -c "
import sys, json
d = json.load(sys.stdin)
r = d['report']
print()
print('  \033[1m\033[36mCampaign Report — Chennai Coffee Grand Opening\033[0m')
print('  \033[36m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\033[0m')
print(f'  Page Views:      \033[1m{r[\"pageViews\"]}\033[0m')
print(f'  Unique Visitors: \033[1m{r[\"uniqueVisitors\"]}\033[0m')
print(f'  CTA Clicks:      \033[1m{r[\"ctaClicks\"]}\033[0m')
print(f'  CTR:             \033[1m{r[\"ctr\"]}%\033[0m')
print(f'  Bounce Rate:     \033[1m{r[\"bounceRate\"]}%\033[0m')
print(f'  RSVPs:           \033[1m{r[\"rsvps\"]}\033[0m')
print(f'  Purchases:       \033[1m{r[\"purchases\"]}\033[0m')
print(f'  Revenue:         \033[1m₹{r[\"revenue\"]}\033[0m')
print(f'  Total Events:    \033[1m{d[\"totalEvents\"]}\033[0m')
print('  \033[36m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\033[0m')
print()
"
}

# ── x402 DEMO ──
cmd_x402() {
  header "x402 Payment Gate Demo"
  echo -e "  ${YELLOW}Requesting campaign endpoint without payment...${NC}"
  echo ""
  HTTP_CODE=$(curl -sf -o /tmp/adclaw-x402-resp.json -w "%{http_code}" "$BASE/api/campaign")
  if [ "$HTTP_CODE" = "402" ]; then
    echo -e "  ${RED}HTTP 402 — Payment Required${NC}"
    python3 -m json.tool /tmp/adclaw-x402-resp.json
  else
    echo -e "  ${YELLOW}HTTP $HTTP_CODE — x402 in fallback mode (GOAT API not configured)${NC}"
    echo ""
    echo -e "  With GOAT x402 configured, this returns:"
    echo '  {'
    echo '    "error": "Payment Required",'
    echo '    "x402": true,'
    echo '    "order": {'
    echo '      "amount": "0.10",'
    echo '      "token": "USDC",'
    echo '      "chain": "goat-testnet3",'
    echo '      "chainId": 48816'
    echo '    }'
    echo '  }'
  fi
  echo ""
}

# ── RESET ──
cmd_reset() {
  header "Resetting demo data"
  rm -f "$PROJECT_DIR/server/data/events.jsonl" "$PROJECT_DIR/server/data/campaigns.json"
  rm -f "$PROJECT_DIR/server/public/sites/"*.html "$PROJECT_DIR/server/public/events/"*.html
  rm -f /tmp/adclaw-demo-cid.txt /tmp/adclaw-demo-landing.json /tmp/adclaw-demo-event.json
  ok "All data cleared"
}

# ── MAIN ──
case "${1:-help}" in
  setup)  cmd_setup ;;
  live)   cmd_live ;;
  report) cmd_report ;;
  x402)   cmd_x402 ;;
  reset)  cmd_reset ;;
  *)
    echo "Usage: $0 {setup|live|report|x402|reset}"
    echo ""
    echo "  setup   Full demo preparation (run 30 min before)"
    echo "  live    Fire live events (run during demo for dashboard updates)"
    echo "  report  Pretty-print campaign report (show on stage)"
    echo "  x402    Show x402 payment response"
    echo "  reset   Clean all data for fresh start"
    ;;
esac
