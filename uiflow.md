# AdClaw Dashboard — UX Specification

> Single-page static HTML dashboard at `/dashboard`
> Talks to: GET /api/campaign, GET /api/campaign/:id, GET /api/report/:id, GET /api/pages, GET /health

---

## 1. User Personas

### Persona A: The Operator (Udhay)

- **Role:** Solo founder, manages campaigns via Telegram, needs visual oversight
- **Tech level:** High — web3 native, developer, understands marketing metrics
- **Context of use:** Checks dashboard on laptop between Telegram interactions, quick glances on mobile
- **Core need:** "Show me what's running, what's performing, and what needs my attention — in 5 seconds"
- **Frustrations:** Switching between Telegram and data views; no visual overview of what the agent has built
- **Frequency:** Multiple times daily, 30-second to 2-minute sessions

### Persona B: Hackathon Judge

- **Role:** Technical evaluator, judging 20+ projects in a day
- **Tech level:** High — understands web3 concepts but doesn't know AdClaw's internals
- **Context of use:** Given a URL, needs to see the system working immediately
- **Core need:** "Prove this is real, not a slide deck. Show me live data, real pages, actual on-chain activity — fast"
- **Frustrations:** Loading spinners, empty states with no context, unclear what the product does
- **Frequency:** One-time, 30-90 second visit

### Persona C: Potential Client (Agent or Human)

- **Role:** Another AI agent or human discovering AdClaw via ERC-8004 agent card
- **Tech level:** Variable — could be a programmatic agent reading JSON, or a human following a link
- **Context of use:** Arrived from on-chain discovery, evaluating whether to pay via x402
- **Core need:** "What services does this agent offer, what has it done, and how do I use it?"
- **Frustrations:** No proof of capability, unclear pricing, no way to see past work
- **Frequency:** One-time discovery, may return if they become a client

---

## 2. User Flows

### Flow A: Operator (Udhay) — Daily Check

```
1. Opens /dashboard
2. SEES: System health bar (green/red) + total campaigns count + total page views (all above the fold)
3. SCANS: Campaign cards — each showing status pill, name, key metric (views/clicks)
4. CLICKS: A campaign card to expand inline detail panel
5. SEES: Full analytics for that campaign — views, CTR, bounceRate, conversions, revenue
6. SEES: Links to the live landing page and event page (clickable, open in new tab)
7. OPTIONALLY: Scrolls down to "Generated Pages" gallery to see all pages the agent has built
8. CLOSES: Tab. Total time: 15-45 seconds
```

### Flow B: Hackathon Judge — First Impression

```
1. Opens /dashboard (given URL by Udhay during demo)
2. SEES IMMEDIATELY (no scroll):
   - "AdClaw" branding + one-line tagline: "Autonomous 24/7 Marketing Agent on GOAT Network"
   - System status: green dot + "Agent Online" (proves it's live)
   - Summary stats: X campaigns, Y pages generated, Z total events tracked
   - Prominent "Powered by" badges: OpenClaw + GOAT Network + x402 + ERC-8004
3. SCROLLS SLIGHTLY: Sees campaign cards with real data (not zeros)
4. CLICKS: A campaign card — sees analytics, clicks through to live landing page
5. SEES: The actual generated landing page in a new tab — proof the agent builds real things
6. RETURNS: Scrolls to "How It Works" section — 4-step flow diagram
7. NOTICES: x402 pricing table + ERC-8004 identity link (on-chain proof)
8. VERDICT: "This is real." Total time: 30-90 seconds
```

### Flow C: Potential Client — Capability Assessment

```
1. Arrives at /dashboard from ERC-8004 agent card link or direct URL
2. SEES: What AdClaw does (tagline + service list)
3. SCROLLS: To "Services & Pricing" — sees x402 pricing per service
4. SCROLLS: To "Portfolio" — generated pages gallery (proof of work)
5. CLICKS: A generated page to inspect quality
6. SEES: Campaign analytics (social proof — this agent has real usage)
7. DECIDES: Whether to interact via x402 API or Telegram
8. FINDS: API endpoint reference + Telegram bot link in footer
```

---

## 3. Information Architecture

### Page Sections (Top to Bottom)

```
/dashboard (single HTML page)
|
|-- [SECTION 1] Header Bar (sticky, always visible)
|   |-- AdClaw logo/wordmark (left)
|   |-- System health indicator (right) — green dot + "Online" / red dot + "Offline"
|   |-- Last updated timestamp (right)
|
|-- [SECTION 2] Hero Stats Strip (above the fold)
|   |-- Stat Card: Total Campaigns (from GET /api/campaign → campaigns.length)
|   |-- Stat Card: Pages Generated (from GET /api/pages → sites.length + events.length)
|   |-- Stat Card: Total Events Tracked (sum of all report totalEvents)
|   |-- Stat Card: System Uptime (from GET /health → status === 'ok')
|
|-- [SECTION 3] Campaign List (primary content)
|   |-- Section heading: "Campaigns"
|   |-- Campaign Card (repeated for each campaign from GET /api/campaign)
|   |   |-- Campaign name
|   |   |-- Status pill: planned (gray) | active (green) | paused (yellow) | completed (blue)
|   |   |-- Product name (secondary text)
|   |   |-- Budget display: "₹50,000" or "$2,500"
|   |   |-- Key metric preview: page views count (from report)
|   |   |-- Created date (relative: "2 hours ago")
|   |   |-- [EXPANDABLE] Campaign Detail Panel (toggles on click)
|   |       |-- Analytics Summary (from GET /api/report/:id)
|   |       |   |-- Page Views
|   |       |   |-- Unique Visitors
|   |       |   |-- CTA Clicks
|   |       |   |-- CTR (%)
|   |       |   |-- Bounce Rate (%)
|   |       |   |-- RSVPs / Signups
|   |       |   |-- Purchases
|   |       |   |-- Revenue
|   |       |-- Event Breakdown (bar list of event types + counts)
|   |       |-- Campaign Config
|   |       |   |-- Target Audience
|   |       |   |-- Goal
|   |       |   |-- Location
|   |       |   |-- Channels (pills)
|   |       |   |-- Timeline
|   |       |   |-- KPIs (key-value pairs)
|   |       |-- Page Links
|   |       |   |-- Landing Page: [link icon] "View Live Page" → /sites/{slug}.html (new tab)
|   |       |   |-- Event Page: [link icon] "View Event Page" → /events/{slug}.html (new tab)
|   |       |-- Ad Variants (collapsible sub-section)
|   |           |-- Platform pill (Google / Meta / Instagram)
|   |           |-- Headline
|   |           |-- Description
|   |           |-- CTA text
|
|-- [SECTION 4] Generated Pages Gallery
|   |-- Section heading: "Generated Pages"
|   |-- Two sub-sections: "Landing Pages" and "Event Pages"
|   |-- Each page shown as a card:
|   |   |-- Page filename (slug)
|   |   |-- Type pill: "Landing" (indigo) | "Event" (amber)
|   |   |-- "Open Page" link → opens in new tab
|
|-- [SECTION 5] How It Works (for judges + clients)
|   |-- 4-step horizontal flow:
|   |   1. "Chat via Telegram" — user sends campaign brief
|   |   2. "AI Plans Strategy" — AdClaw creates campaign plan
|   |   3. "Pages Go Live" — landing pages + event pages deployed
|   |   4. "Track & Optimize" — real-time analytics + cron optimization
|   |-- Each step: icon + title + one-line description
|
|-- [SECTION 6] Services & Pricing (for clients)
|   |-- Section heading: "x402 Pay-Per-Use Services"
|   |-- Pricing table:
|   |   | Service             | Endpoint        | Price     |
|   |   |---------------------|-----------------|-----------|
|   |   | Campaign Strategy   | POST /api/campaign | 0.10 USDC |
|   |   | Landing Page        | POST /api/landing  | 0.30 USDC |
|   |   | Event Page          | POST /api/event    | 0.20 USDC |
|   |   | Analytics Report    | GET /api/report    | 0.05 USDC |
|   |-- Subtitle: "Payments on GOAT Testnet3 (Chain ID: 48816)"
|
|-- [SECTION 7] Identity & Network
|   |-- ERC-8004 Agent ID (if registered) — links to GOAT explorer
|   |-- GOAT Network badge
|   |-- OpenClaw badge
|   |-- Wallet address (truncated with copy button)
|
|-- [SECTION 8] Footer
|   |-- "Built by Udhay for GOAT Hackathon 2025"
|   |-- Telegram bot link
|   |-- GitHub repo link (if public)
|   |-- API base URL
```

### Navigation Structure

No traditional navigation needed (single page). Instead:

- **Sticky header** with system status provides orientation at all times
- **Scroll-based discovery** — content is ordered by priority (stats first, campaigns second, context third)
- **In-page anchors** — header can optionally have subtle text links: "Campaigns" | "Pages" | "Pricing" that smooth-scroll to those sections
- **Expand/collapse** within campaign cards replaces page transitions

### Data Source Mapping

| Dashboard Element | API Endpoint | Response Field |
|---|---|---|
| Total Campaigns count | GET /api/campaign | campaigns.length |
| Campaign list | GET /api/campaign | campaigns[] |
| Campaign detail | GET /api/campaign/:id | campaign object |
| Campaign analytics | GET /api/report/:id | report object + eventBreakdown[] |
| Pages list | GET /api/pages | sites[] + events[] |
| System status | GET /health | status field |
| Total events (hero stat) | GET /api/report (all summary) | campaigns[].totalEvents summed |

---

## 4. Content Priority

### Above the Fold (visible without any scrolling, ~600px viewport height)

**Must be visible immediately:**

1. **AdClaw wordmark** — establishes identity (top-left, header)
2. **System health indicator** — green dot + "Agent Online" or red dot + "Agent Offline" (top-right, header)
3. **Hero stats strip** — 4 stat cards in a horizontal row:
   - Total Campaigns (number, large font)
   - Pages Generated (number, large font)
   - Events Tracked (number, large font)
   - Agent Status (green checkmark or red X)
4. **First 1-2 campaign cards** — visible enough to show the list starts here, inviting scroll
5. **Tech stack badges** — small row below stats: "OpenClaw | GOAT Network | x402 | ERC-8004" (helps judges immediately understand the stack)

### Secondary Content (first scroll, 600-1200px)

- Full campaign list with expandable detail panels
- Campaign analytics data (inside expanded panels)
- Links to live generated pages

### Tertiary Content (deeper scroll, 1200px+)

- Generated Pages gallery
- "How It Works" explainer
- Services & Pricing table
- ERC-8004 identity details
- Footer with links

### Hidden/Expandable Content (never visible by default)

- **Campaign detail panels** — collapsed by default, expand on click
- **Ad variants** — nested collapse inside campaign detail (click "Show Ad Copy" to reveal)
- **Raw event breakdown** — collapsed inside analytics, shows individual event type counts
- **Full API documentation** — not on dashboard at all (lives in swagger/api_test.html)

---

## 5. Interaction Patterns

### 5.1 Real-Time Updates

**Polling Strategy:**

| Data | Poll Interval | Trigger |
|---|---|---|
| GET /health | Every 30 seconds | Automatic (always) |
| GET /api/campaign | Every 60 seconds | Automatic (always) |
| GET /api/pages | Every 60 seconds | Automatic (always) |
| GET /api/report/:id | Every 45 seconds | Only when a campaign detail panel is expanded |
| All endpoints | On page focus | When user returns to the tab (visibilitychange event) |

**Update Animations:**

- **Stat counters** — when a number changes, animate from old value to new value using a counting animation (200ms ease-out). The number briefly highlights with a subtle background pulse (pale green for increase, pale red for decrease) then fades back.
- **New campaign appearance** — if a new campaign appears in the list, it slides in from the top with a 300ms ease-out animation and a brief highlight border.
- **Health status transitions** — the green/red dot pulses once on status change. The text fades between "Online"/"Offline" with a 200ms crossfade.
- **Stale data indicator** — if any poll fails 3 times consecutively, show a subtle amber banner below the header: "Dashboard data may be stale. Last successful update: [time]."

### 5.2 Click Targets and Expandable Sections

**Campaign Card (click to expand):**
- Entire card is clickable (cursor: pointer on hover)
- On hover: subtle shadow elevation increase + 1px upward translate (transform: translateY(-1px))
- On click: card expands downward, revealing the detail panel with a 250ms ease-out slide animation
- Chevron icon rotates 180 degrees to indicate open/close state
- Only one campaign can be expanded at a time (accordion pattern) — expanding one collapses the previously open one
- Expanded card has a left border accent (4px, brand color) to distinguish it from collapsed cards

**Ad Variants (nested expand inside campaign detail):**
- Toggle link text: "Show Ad Copy (N variants)" / "Hide Ad Copy"
- Expands inline with 200ms slide animation
- Each variant is a mini-card with platform icon + content

**Page Gallery Cards:**
- Hover: scale(1.02) with shadow
- Click: opens page URL in new tab (target="_blank", rel="noopener")

**Stat Cards (hero section):**
- Not clickable — purely informational
- On hover: no interaction (avoids confusion)

**External Links (landing pages, event pages, explorer):**
- Open in new tab always
- Show external link icon (arrow-up-right) next to link text
- Links are underlined on hover, not by default

### 5.3 Mobile-First Responsive Strategy

**Breakpoints (mobile-first, min-width):**

| Token | Breakpoint | Target Device |
|-------|-----------|---------------|
| base  | 0-639px   | Phones (375px iPhone SE, 390px iPhone 14) |
| sm    | 640px+    | Large phones, small tablets |
| md    | 768px+    | Tablets (iPad Mini, iPad) |
| lg    | 1024px+   | Small laptops, iPad Pro |
| xl    | 1280px+   | Desktop monitors |

**KPI Grid Columns:**
- base: `grid-template-columns: repeat(2, 1fr)` -- compact 2-column on phones
- md: `repeat(3, 1fr)` -- 3 columns on tablets
- lg: `repeat(auto-fit, minmax(180px, 1fr))` -- fluid on desktop

**Chart Grid:**
- base: single column stack (full width)
- md+: 2-column side-by-side

**Funnel + Feed Grid:**
- base: single column stack
- md+: 2-column side-by-side

**Pages Gallery:**
- base: single column, full width per page link
- sm+: `repeat(auto-fill, minmax(200px, 1fr))`

**Collapsible Sections (mobile only, < 768px):**
- Funnel: collapsed by default (below the fold)
- Generated Pages: collapsed by default
- Event Feed: expanded by default (shows activity for judges)
- On md+ screens: sections are always visible, collapse chevrons hidden

**Touch Targets:**
- All interactive elements enforce `min-height: 44px` (Apple HIG)
- Campaign selector `<select>` has `min-height: 44px`, full-width on mobile
- Page links, retry buttons, refresh button: all 44px minimum
- Event feed items: `min-height: 44px` for easy tapping

**Typography Scaling:**
- KPI values: 22px (base) -> 28px (sm) -> 32px (lg)
- KPI labels: 10px (base) -> 11px (sm)
- Card titles: 11px (base) -> 12px (sm)
- Event feed text: 12px (base) -> 13px (sm)
- Header title: 18px (base) -> 22px (sm)

**Mobile Performance:**
- Poll interval: 12s on mobile (vs 8s desktop) -- battery friendly
- Feed poll: 10s on mobile (vs 5s desktop)
- Campaign poll: 45s on mobile (vs 30s desktop)
- Max feed items: 15 on mobile (vs 20 desktop)
- Visibility API pauses all polling when tab/app is backgrounded

**Sticky Header:**
- Fixed to top on scroll with `position: sticky; z-index: 50`
- Gains `backdrop-filter: blur(12px)` and border on scroll > 10px
- Compact: 44px height on mobile, grows slightly on desktop

**PWA-lite Meta Tags:**
- `<meta name="viewport">` with `viewport-fit=cover` for notched phones
- `<meta name="theme-color" content="#0f1117">` for browser chrome
- `<meta name="apple-mobile-web-app-capable" content="yes">`
- `<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">`
- Inline SVG favicon (zero network requests for icon)

**Safe Area Insets:**
- CSS `env(safe-area-inset-*)` for notched devices (iPhone X+)
- Applied to dashboard padding and toast positioning

**Demo-Specific (Judges on phones):**
- First 2 seconds visible: AdClaw branding, live green dot, 2x2 KPI grid with animated numbers
- Pulsing green dot on header + feed section = "alive" signal
- Shimmer skeletons load instantly even on slow WiFi
- Connecting overlay shows immediately, hides when first data arrives
- Toast notification at bottom for connection issues (visible on phone)

### 5.4 Empty States

**No campaigns yet (GET /api/campaign returns empty array):**
```
[Illustration: simple line drawing of a rocket on a launch pad]

"No campaigns yet"

"AdClaw is ready to work. Send a campaign brief via Telegram
to create your first campaign."

[Button: "Open Telegram Bot" → t.me/adclaw_bot]
```
- Hero stat cards still show, but with "0" values (not hidden)
- "How It Works" section remains visible — especially important for this state

**No events yet for a campaign (GET /api/report/:id returns "No events recorded yet"):**
```
Inside the expanded campaign detail panel:

"No analytics data yet"

"Events will appear here as visitors interact with your
campaign pages. This usually takes a few minutes after
the first page view."

[Subtle animated dots: ● ● ● indicating "waiting"]
```
- Do NOT show a table of zeros
- Do NOT show charts with empty axes
- Show the campaign configuration data (audience, budget, channels) — that information is always available

**No generated pages (GET /api/pages returns empty arrays):**
```
[Illustration: simple line drawing of a blank page with a plus icon]

"No pages generated yet"

"When AdClaw creates landing pages or event pages, they'll
appear here with live preview links."
```

**API unreachable (GET /health fails or returns non-ok):**
```
Header status changes to: [red dot] "Agent Offline"

Below the header, a full-width amber banner appears:

"Unable to connect to AdClaw server. The dashboard will
retry automatically. Check that the server is running on
port 3402."

[Last successful connection: 2 minutes ago]
```
- All cached data remains visible (don't clear the page)
- Stat cards show last known values with a subtle opacity reduction (opacity: 0.6)
- Polling continues at normal intervals

### 5.4 Loading States

**Initial page load:**
- Show the static HTML structure immediately (header, section headings, card skeletons)
- Campaign cards show as placeholder skeletons: gray rounded rectangles pulsing at 1.5s interval
- Stat cards show "—" as placeholder text
- All API calls fire in parallel on DOMContentLoaded
- Once data arrives, skeleton is replaced with a 150ms fade-in

**Expanding a campaign card (report data loading):**
- Show a single centered spinner (16px, brand color) inside the expanding panel
- Replace with content once GET /api/report/:id responds
- If report fetch fails, show: "Could not load analytics. [Retry]"

### 5.5 Responsive Behavior

See Section 5.3 for the full mobile-first responsive strategy. Summary:

**Desktop (lg, 1024px+):**
- KPI stats: auto-fit fluid grid (4-5 cards per row)
- Charts: 2-column grid
- Funnel + Feed: 2-column grid
- Page gallery: auto-fill grid (3+ cards per row)
- All sections visible, no collapse chevrons
- Full padding (24px), full font sizes

**Tablet (md, 768-1023px):**
- KPI stats: 3-column grid
- Charts: 2-column grid
- Funnel + Feed: 2-column grid
- Page gallery: auto-fill (2+ cards per row)
- All sections visible, no collapse chevrons

**Mobile (base, <768px):**
- KPI stats: 2-column compact grid (8px gap)
- Charts: stacked single column
- Funnel + Feed: stacked single column
- Page gallery: single column, full width
- Funnel and Pages sections collapsed by default (tap to expand)
- Feed section expanded (shows activity)
- Reduced font sizes, compact padding (12px)
- Campaign selector takes full available width
- All touch targets minimum 44px
- Slower polling (12s) for battery life

---

## 6. Accessibility Requirements

### 6.1 Color Contrast

**Color Palette (all must meet WCAG 2.1 AA minimum 4.5:1 for normal text, 3:1 for large text):**

| Element | Foreground | Background | Ratio |
|---|---|---|---|
| Body text | #1a1a2e (near-black) | #ffffff (white) | 16.6:1 |
| Secondary text | #4a5568 (gray-600) | #ffffff | 7.0:1 |
| Status "Online" text | #065f46 (green-800) | #d1fae5 (green-100) | 5.8:1 |
| Status "Offline" text | #991b1b (red-800) | #fee2e2 (red-100) | 6.1:1 |
| Status "Planned" pill | #374151 (gray-700) | #e5e7eb (gray-200) | 7.2:1 |
| Status "Active" pill | #065f46 (green-800) | #d1fae5 (green-100) | 5.8:1 |
| Status "Paused" pill | #92400e (yellow-800) | #fef3c7 (yellow-100) | 5.4:1 |
| Status "Completed" pill | #1e40af (blue-800) | #dbeafe (blue-100) | 5.6:1 |
| Link text | #2563eb (blue-600) | #ffffff | 4.7:1 |
| Stat card number | #1a1a2e | #f8fafc (gray-50) | 15.8:1 |

**Never rely on color alone:**
- Status pills include text labels ("Active", "Planned"), not just colored dots
- Health indicator uses both a colored dot AND text ("Online"/"Offline")
- Charts/graphs (if added later) must use patterns or labels in addition to color

### 6.2 Keyboard Navigation

**Tab Order (logical, follows visual layout):**
1. Skip-to-content link (visually hidden, first focusable element)
2. Header nav links (if present): "Campaigns" | "Pages" | "Pricing"
3. Campaign cards — each card is focusable (tabindex="0")
4. Within expanded campaign card: analytics section, page links, ad variants toggle
5. Page gallery cards
6. Pricing table links
7. Footer links

**Keyboard Interactions:**
- `Enter` or `Space` on a campaign card: toggles expand/collapse (same as click)
- `Enter` or `Space` on a page gallery card: opens page in new tab
- `Escape` when a campaign card is expanded: collapses it and returns focus to the card
- `Tab` moves through interactive elements in DOM order
- Focus ring: 2px solid #2563eb (blue-600) with 2px offset, visible on all focusable elements
- Focus ring only visible on keyboard navigation (`:focus-visible`), not on mouse click

**ARIA Attributes:**
- Campaign cards: `role="button"`, `aria-expanded="true/false"`, `aria-controls="panel-{id}"`
- Campaign detail panels: `role="region"`, `aria-labelledby="card-{id}"`, `id="panel-{id}"`
- Status indicator: `role="status"`, `aria-live="polite"` (announces changes)
- Stat cards: `aria-label="Total campaigns: 5"` (reads the context, not just the number)
- Loading skeletons: `aria-hidden="true"`, content areas have `aria-busy="true"` while loading
- External links: include `aria-label` that indicates new tab, e.g. `aria-label="View landing page (opens in new tab)"`
- Stale data banner: `role="alert"` so screen readers announce it immediately

### 6.3 Screen Reader Considerations

**Page Title:** "AdClaw Dashboard — Autonomous Marketing Agent"

**Landmark Regions:**
- `<header>` — contains branding + system status
- `<main>` — contains all dashboard content
- `<section aria-labelledby="section-heading-id">` — for each major section
- `<footer>` — contains links + attribution

**Dynamic Content Announcements:**
- When poll updates change a stat number: the stat card container has `aria-live="polite"` so changes are announced without interrupting the user
- When health status changes: `aria-live="assertive"` on the status element (important change)
- When a campaign card expands: focus moves to the first element inside the detail panel
- When a campaign card collapses: focus returns to the card itself

**Semantic HTML:**
- Campaign list: `<ul>` with `<li>` for each card
- Stats: use `<dl>` (description list) with `<dt>` for label and `<dd>` for value
- Pricing table: proper `<table>` with `<thead>`, `<th scope="col">`, `<tbody>`
- Headings: proper hierarchy (h1 for page title, h2 for sections, h3 for campaign names)
- No heading level skips

### 6.4 Motion and Reduced Motion

- All animations respect `prefers-reduced-motion: reduce`:
  - Counting animations become instant value swaps
  - Slide/expand animations become instant show/hide
  - Hover transforms are disabled
  - Pulse animations on status dots are disabled
  - Skeleton loading pulse replaced with static gray

### 6.5 Text and Zoom

- All text uses `rem` units, not `px` (respects browser font size settings)
- Dashboard remains functional at 200% browser zoom
- No text is embedded in images
- Minimum touch target size: 44x44px (for mobile interactions)
- Line height: 1.5 minimum for body text, 1.2 for headings

---

## Appendix A: Component Specifications

### A.1 Stat Card Component

```
┌─────────────────────────┐
│  [icon]                 │
│                         │
│  12                     │  ← large number (text-3xl, font-bold)
│  Total Campaigns        │  ← label (text-sm, text-gray-500)
└─────────────────────────┘

Width: 25% on desktop (4 across), 50% on tablet (2x2), 100% on mobile
Background: #f8fafc (gray-50)
Border: 1px solid #e2e8f0 (gray-200)
Border-radius: 12px
Padding: 20px
```

### A.2 Campaign Card Component (Collapsed)

```
┌──────────────────────────────────────────────────────────────────┐
│  [status pill: Active]   Chennai Coffee Grand Opening        ▼  │
│                          Coffee shop · ₹50,000 · 2 hours ago    │
│                          147 page views                         │
└──────────────────────────────────────────────────────────────────┘

Width: 100% (max-width: 900px, centered)
Background: #ffffff
Border: 1px solid #e2e8f0
Border-radius: 8px
Padding: 16px 20px
Margin-bottom: 12px
Hover: box-shadow increases, translateY(-1px)
```

### A.3 Campaign Card Component (Expanded)

```
┌──────────────────────────────────────────────────────────────────┐
│  [status pill: Active]   Chennai Coffee Grand Opening        ▲  │
│                          Coffee shop · ₹50,000 · 2 hours ago    │
│                          147 page views                         │
├──────────────────────────────────────────────────────────────────┤
│  ANALYTICS                                                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │ 147      │ │ 98       │ │ 23       │ │ 15.6%    │          │
│  │ Views    │ │ Unique   │ │ Clicks   │ │ CTR      │          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                       │
│  │ 42%      │ │ 7        │ │ 2        │                       │
│  │ Bounce   │ │ RSVPs    │ │ Purchases│                       │
│  └──────────┘ └──────────┘ └──────────┘                       │
│                                                                  │
│  EVENT BREAKDOWN                                                │
│  page_view ████████████████████████░░░░░  147                   │
│  cta_click ██████░░░░░░░░░░░░░░░░░░░░░░   23                   │
│  scroll_50 ████░░░░░░░░░░░░░░░░░░░░░░░░   15                   │
│  rsvp      ██░░░░░░░░░░░░░░░░░░░░░░░░░░    7                   │
│  purchase  █░░░░░░░░░░░░░░░░░░░░░░░░░░░    2                   │
│                                                                  │
│  CAMPAIGN DETAILS                                               │
│  Target: 18-35 foodies in Chennai                               │
│  Goal: Awareness                                                │
│  Channels: [Google] [Meta] [Instagram]                          │
│  Timeline: 4 weeks                                              │
│                                                                  │
│  PAGES                                                          │
│  🔗 Landing Page: View Live → /sites/coffee-shop.html           │
│  🔗 Event Page: View Event → /events/coffee-launch.html         │
│                                                                  │
│  [Show Ad Copy (5 variants)]                                    │
└──────────────────────────────────────────────────────────────────┘

Left border: 4px solid brand color (#2563eb)
Background: #ffffff
Transition: max-height 250ms ease-out
```

### A.4 Health Indicator

```
Online state:   [●] Agent Online    (● is #10b981, bg pill is #d1fae5)
Offline state:  [●] Agent Offline   (● is #ef4444, bg pill is #fee2e2)
Loading state:  [○] Checking...     (○ is #9ca3af, bg pill is #f3f4f6)

The dot pulses with a 2s CSS animation (scale 1.0 → 1.3 → 1.0) when online.
Positioned in the header, right-aligned.
```

---

## Appendix B: API Call Sequence on Page Load

```
DOMContentLoaded
├── fetch GET /health                    → update header status
├── fetch GET /api/campaign              → render campaign cards + hero stat
├── fetch GET /api/pages                 → render pages gallery + hero stat
└── fetch GET /api/report (all summary)  → compute total events for hero stat

All four fire in parallel (Promise.all).
Render each section as its data arrives (don't wait for all).

After initial load:
├── setInterval(fetchHealth, 30000)
├── setInterval(fetchCampaigns, 60000)
├── setInterval(fetchPages, 60000)
└── document.addEventListener('visibilitychange', fetchAll)

On campaign card expand:
└── fetch GET /api/report/:id → render analytics inside panel
    (cached for 30s — don't re-fetch if expanded within cache window)
    setInterval(fetchReport, 45000) while panel is open
    clearInterval when panel is closed
```

---

## Appendix C: Dashboard Data Visualization Layer

> Implementation lives in `/server/public/dashboard/index.html` (single static HTML, zero libraries)

### C.1 KPI Stat Cards

**Primary KPIs** (large stat cards, always visible):
- Page Views, Unique Visitors, CTA Clicks, CTR, Revenue

**Secondary KPIs** (same row, smaller visual weight):
- Bounce Rate, RSVPs/Signups, Purchases

**Nullable KPIs** (shown as "N/A" with tooltip "Requires ad spend data"):
- CPA, ROAS -- both are null when no ad spend data is linked

**Trend Indicators:**
- Computed by diffing current report against the previous poll's report
- Up arrow (green) for improvement, down arrow (red) for decline
- Bounce rate inverts: up = bad, down = good
- On first load (no previous data): shows "baseline" label
- Count-up animation (600ms ease-out cubic) on value changes

### C.2 Event Breakdown (CSS Horizontal Bar Chart)

- Sorted descending by count
- `width` animated from 0 to proportional % on render (0.8s ease)
- 7 rotating gradient colors via CSS classes `.c1`-`.c7`
- Max bar = 100% of track width; others proportional

### C.3 Channel Budget Split (CSS Donut via conic-gradient)

- Uses `conic-gradient()` on a circular div with an inner "hole" div
- Segments from `campaign.budgetSplit` record
- Legend with color swatches, amounts, and percentages
- Center shows total budget in campaign currency

### C.4 Conversion Funnel (CSS Step-Down)

Steps: Page Views -> CTA Clicks -> RSVPs/Signups -> Purchases
- Each bar width proportional to the first step (max = 100%)
- Drop-off percentages shown between steps
- Bars animated from width:0 to target width on render
- Steps with zero count after the last nonzero are hidden; minimum 2 steps shown

### C.5 Real-time Event Feed

- Scrolling list, max 20 items, new items slide in at top
- CSS `@keyframes feed-slide-in` for entry animation
- Each item: event type icon + display name + page slug + client ID + relative timestamp
- Timestamps auto-refresh every 10 seconds ("5s ago", "2m ago")
- Max-height with overflow-y: auto (custom scrollbar styling)

### C.6 Polling Strategy

| Data | Interval | Notes |
|---|---|---|
| Report + KPIs | 8 seconds | Refreshes selected campaign's analytics |
| Campaign list | 30 seconds | Detects new campaigns, status changes |
| Pages list | 30 seconds | Detects newly generated pages |
| Feed timestamps | 10 seconds | Re-renders relative time labels |

- Polling pauses when tab is hidden (`visibilitychange` API)
- Immediate refresh on tab re-focus
- All timers cleared and restarted on visibility change

### C.7 States

**Connecting:** Full-screen overlay with spinner, "Connecting to AdClaw..."
**Loading:** Skeleton placeholders for each section (shimmer animation)
**Empty:** Per-section empty states with icon + message + hint text
**Error:** Per-section error with retry button; stale data preserved
**Live:** Green pulsing dot + "Updated HH:MM:SS" timestamp

### C.8 Performance

- DOM limited to 20 feed items max (older items discarded)
- Bar/funnel animations use CSS transitions (GPU-composited)
- No chart libraries -- all visualization is CSS-only
- Count-up uses `requestAnimationFrame` with ease-out cubic
- Tab visibility API prevents background polling waste

---

## Appendix D: Visual Design Tokens

```
Brand color:           #2563eb (blue-600) — used for links, active states, accent borders
Brand dark:            #1e40af (blue-800) — used for header background
Background:            #f8fafc (gray-50) — page background
Card background:       #ffffff — card surfaces
Text primary:          #1a1a2e — headings, numbers
Text secondary:        #4a5568 — labels, descriptions
Text tertiary:         #9ca3af — timestamps, meta info
Border:                #e2e8f0 — card borders, dividers
Success:               #10b981 — online status, positive metrics
Warning:               #f59e0b — paused status, alert thresholds
Danger:                #ef4444 — offline status, critical metrics
Info:                  #6366f1 — completed status, info badges

Font family:           system-ui, -apple-system, sans-serif (no external font load)
Heading weight:        700
Body weight:           400
Number weight:         600 (semi-bold for dashboard numbers)

Border radius:
  Cards:               8px
  Pills/badges:        9999px (fully rounded)
  Stat cards:          12px
  Buttons:             6px

Spacing scale:         4px base (4, 8, 12, 16, 20, 24, 32, 48)
Max content width:     1120px (centered)
```

---

## 16. Product Landing Page (`/`)

> Added: 2026-03-15
> File: `server/public/index.html`
> Route: `GET /` (served by `index.ts`)

### Purpose

Public-facing product marketing page for AdClaw. Distinct from the analytics dashboard (`/dashboard`). This page answers "What is AdClaw?" for hackathon judges, potential clients, and on-chain discoverers arriving from the ERC-8004 agent card.

### Sections (top to bottom)

```
[Fixed Nav]          — Logo + nav links + "Launch Agent" CTA
[Hero]               — Headline, sub-headline, CTA pair, animated gradient orb, perspective grid
[Stats Bar]          — 4 key metrics (24/7, <30s deploy, $0.01/call, 100% on-chain)
[Features Grid]      — 6 glass cards: AI Strategy, Page Gen, Analytics, USDC Payments, ERC-8004, Telegram
[How It Works]       — 3-step flow with terminal-style code blocks
[Architecture]       — Tech stack details + agent-card.json code preview
[Pricing]            — 3-tier: Explorer (free), Agent ($0.01/call), Enterprise (custom)
[On-Chain Identity]  — ERC-8004 verification badge + GOAT explorer link
[Final CTA]          — "Deploy an agent" + Telegram + Dashboard buttons
[Footer]             — Brand, ERC-8004 status, links
```

### Visual System

- **Theme:** Ultra-dark cyberpunk, inspired by Vercel + Linear + Cursor
- **Background:** `#06070b` root, dot grid pattern, aurora gradient mesh (animated), perspective grid floor
- **Hero Visual:** Animated conic-gradient orb (420px, 12s spin, 6s breathe), concentric ring pulses, 8 floating CSS particles
- **Cards:** Glassmorphism (backdrop-filter: blur(20px) saturate(1.2)), animated gradient border on hover (conic-gradient via @property --border-angle)
- **Buttons:** Primary glow (gradient bg + box-shadow bloom on hover), ghost secondary (border + hover fill)
- **Typography:** System font stack, hero 7xl/extrabold, section headers 5xl/bold, body sm-lg/regular
- **Animations:** IntersectionObserver scroll reveal, orb spin/breathe, aurora drift, grid scroll, particle float, pulse dot, nav blur-on-scroll

### Routes Added

| Route | Method | Handler | Purpose |
|-------|--------|---------|---------|
| `/` | GET | `index.ts` sendFile | Serve landing page HTML |
| `/.well-known/agent.json` | GET | `index.ts` sendFile | A2A agent card for discovery |

### Dependencies

- Tailwind CSS CDN (landing page only; dashboard remains pure CSS)
- No external fonts, no external images, no JS frameworks
