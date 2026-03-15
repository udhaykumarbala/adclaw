# AdClaw Dashboard -- Visual Design System

> Single static HTML file. Tailwind CSS via CDN. No React, no build step.
> Dark mode primary. Premium data-driven aesthetic.
> Target file: `server/public/dashboard/index.html`

---

## Table of Contents

1. [Design Tokens](#1-design-tokens)
2. [Component Library](#2-component-library)
3. [Layout Grid](#3-layout-grid)
4. [Dark Mode Specification](#4-dark-mode-specification)
5. [Micro-interactions](#5-micro-interactions)
6. [Full Page Skeleton](#6-full-page-skeleton)
7. [Quick Reference](#7-quick-reference-copy-paste-class-strings)

---

## 1. Design Tokens

### 1.1 Color Palette

| Token | Hex | Tailwind Class | Usage |
|-------|-----|----------------|-------|
| **Primary** | `#6366F1` | `indigo-500` | CTA buttons, active states, links |
| **Primary Hover** | `#4F46E5` | `indigo-600` | Button hover, focused links |
| **Primary Light** | `#818CF8` | `indigo-400` | Accents on dark surfaces, highlights |
| **Primary Muted** | `#312E81` | `indigo-900` | Tinted backgrounds, badge bg |
| **Secondary** | `#06B6D4` | `cyan-500` | Secondary actions, info accents |
| **Accent** | `#F59E0B` | `amber-500` | Warnings, highlights, attention |
| **Success** | `#10B981` | `emerald-500` | Positive trends, active badges |
| **Success Muted** | `#064E3B` | `emerald-900` | Success background tint |
| **Warning** | `#F59E0B` | `amber-500` | Paused states, caution alerts |
| **Warning Muted** | `#78350F` | `amber-900` | Warning background tint |
| **Error** | `#EF4444` | `red-500` | Negative trends, error states |
| **Error Muted** | `#7F1D1D` | `red-900` | Error background tint |
| **Info** | `#3B82F6` | `blue-500` | Completed badges, info toasts |
| **Info Muted** | `#1E3A5F` | `blue-900` | Info background tint |

**Neutrals (dark mode palette):**

| Token | Hex | Tailwind Class | Usage |
|-------|-----|----------------|-------|
| **BG Root** | `#030712` | `gray-950` | Page background |
| **BG Surface** | `#111827` | `gray-900` | Cards, panels |
| **BG Elevated** | `#1F2937` | `gray-800` | Hover states, inputs, nested cards |
| **Border Default** | `#374151` | `gray-700` | Card borders on hover, dividers |
| **Border Subtle** | `#1F2937` | `gray-800` | Default card borders |
| **Text Primary** | `#F9FAFB` | `gray-50` | Headlines, primary text |
| **Text Secondary** | `#9CA3AF` | `gray-400` | Labels, descriptions |
| **Text Tertiary** | `#6B7280` | `gray-500` | Placeholders, disabled |
| **Text Muted** | `#4B5563` | `gray-600` | Timestamps, decorative |
| **Text On Color** | `#FFFFFF` | `white` | Text on colored backgrounds |

### 1.2 Typography

**Font Stack (loaded via Google Fonts):**

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

**Tailwind config override (inline in HTML `<script>` tag):**

```html
<script>
tailwind.config = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      }
    }
  }
}
</script>
```

**Type Scale:**

| Element | Tailwind Classes | Rendered Size |
|---------|-----------------|---------------|
| **Page Title (h1)** | `text-3xl font-bold tracking-tight text-gray-50` | 30px |
| **Section Title (h2)** | `text-xl font-semibold tracking-tight text-gray-50` | 20px |
| **Card Title (h3)** | `text-base font-semibold text-gray-50` | 16px |
| **Subsection (h4)** | `text-sm font-semibold text-gray-50` | 14px |
| **Body** | `text-sm text-gray-400` | 14px |
| **Body Large** | `text-base text-gray-300` | 16px |
| **Small / Caption** | `text-xs text-gray-500` | 12px |
| **Stat Number** | `text-3xl font-bold tabular-nums tracking-tight text-gray-50` | 30px |
| **Mono / Code** | `text-xs font-mono text-gray-400` | 12px |
| **Badge Text** | `text-xs font-medium` | 12px |
| **Tiny Label** | `text-[10px] text-gray-600` | 10px |

### 1.3 Spacing Scale

Using Tailwind defaults. Key recurring values:

| Usage | Tailwind | Pixels |
|-------|----------|--------|
| Inner card padding | `p-5` or `p-6` | 20px / 24px |
| Section gap | `gap-6` | 24px |
| Card gap in grid | `gap-4` or `gap-5` | 16px / 20px |
| Between label and value | `gap-1` | 4px |
| Between major sections | `space-y-8` | 32px |
| Page horizontal padding | `px-6 lg:px-8` | 24px / 32px |
| Page top padding | `pt-6` | 24px |

### 1.4 Border Radius

| Element | Tailwind | Pixels |
|---------|----------|--------|
| Cards | `rounded-xl` | 12px |
| Buttons | `rounded-lg` | 8px |
| Badges | `rounded-full` | 9999px |
| Inputs | `rounded-lg` | 8px |
| Avatars | `rounded-full` | 9999px |
| Modals / Drawers | `rounded-2xl` | 16px |
| Progress bars | `rounded-full` | 9999px |

### 1.5 Shadow Values

Dark mode relies on borders, not shadows. Shadows are reserved for elevated elements:

| Element | Tailwind |
|---------|----------|
| Card default | (none -- use `border border-gray-800` instead) |
| Card hover | `shadow-lg shadow-black/20` |
| Dropdown | `shadow-xl shadow-black/30` |
| Modal overlay | `shadow-2xl shadow-black/50` |
| Glow effect (accent) | `shadow-[0_0_20px_rgba(99,102,241,0.15)]` |

### 1.6 Transition Defaults

All interactive elements use:
```
transition-all duration-200 ease-out
```

---

## 2. Component Library

Every component below gives exact Tailwind classes. Copy-paste directly.

---

### 2.1 Stat Card

Big number + label + trend indicator. Used in the top stats row.

```html
<!-- Stat Card -->
<div class="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-all duration-200">
  <div class="flex items-center justify-between mb-3">
    <span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Page Views</span>
    <div class="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
      <svg class="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
      </svg>
    </div>
  </div>
  <div class="flex items-end gap-3">
    <span class="text-3xl font-bold tabular-nums tracking-tight text-gray-50" data-count="1247">1,247</span>
    <!-- Positive trend -->
    <span class="inline-flex items-center gap-0.5 text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full mb-1">
      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 17l9.2-9.2M17 17V7H7"/>
      </svg>
      12%
    </span>
  </div>
  <p class="text-xs text-gray-600 mt-2">vs. last 7 days</p>
</div>

<!-- Negative trend variant (swap the trend span above with this): -->
<span class="inline-flex items-center gap-0.5 text-xs font-medium text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full mb-1">
  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 7l-9.2 9.2M7 7v10h10"/>
  </svg>
  3%
</span>
```

**Stat card icon tint colors by type:**

| Metric | Icon BG | Icon Color |
|--------|---------|------------|
| Page Views | `bg-indigo-500/10` | `text-indigo-400` |
| Unique Visitors | `bg-cyan-500/10` | `text-cyan-400` |
| CTA Clicks | `bg-emerald-500/10` | `text-emerald-400` |
| Conversions | `bg-amber-500/10` | `text-amber-400` |

**Stat card row (4 across):**
```html
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  <!-- 4x Stat Cards -->
</div>
```

---

### 2.2 Campaign Card

Name, status badge, budget, key metrics, action links.

```html
<div class="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-all duration-200 group">
  <!-- Header -->
  <div class="flex items-start justify-between mb-4">
    <div class="min-w-0 flex-1">
      <h3 class="text-base font-semibold text-gray-50 truncate">Chennai Coffee Grand Opening</h3>
      <p class="text-xs text-gray-500 mt-0.5 font-mono">ID: abc-123-uuid</p>
    </div>
    <!-- Status badge (see 2.3 for all variants) -->
    <span class="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 ml-3 shrink-0">
      <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
      Active
    </span>
  </div>

  <!-- Budget + timeline -->
  <div class="flex items-center gap-4 mb-4 text-sm">
    <div class="flex items-center gap-1.5 text-gray-400">
      <svg class="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      <span>INR 50,000</span>
    </div>
    <div class="flex items-center gap-1.5 text-gray-400">
      <svg class="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
      </svg>
      <span>4 weeks</span>
    </div>
  </div>

  <!-- Key metrics row -->
  <div class="grid grid-cols-3 gap-3 mb-4 py-3 border-t border-b border-gray-800">
    <div>
      <p class="text-xs text-gray-500">Views</p>
      <p class="text-sm font-semibold text-gray-50 tabular-nums">1,247</p>
    </div>
    <div>
      <p class="text-xs text-gray-500">CTR</p>
      <p class="text-sm font-semibold text-gray-50 tabular-nums">3.2%</p>
    </div>
    <div>
      <p class="text-xs text-gray-500">Conv.</p>
      <p class="text-sm font-semibold text-gray-50 tabular-nums">87</p>
    </div>
  </div>

  <!-- Channel badges -->
  <div class="flex flex-wrap gap-1.5 mb-4">
    <span class="text-xs px-2 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700">Google</span>
    <span class="text-xs px-2 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700">Meta</span>
    <span class="text-xs px-2 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700">Instagram</span>
  </div>

  <!-- Actions -->
  <div class="flex items-center gap-3 pt-1">
    <a href="#" class="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors">View Report</a>
    <span class="text-gray-700">|</span>
    <a href="#" class="text-xs font-medium text-gray-400 hover:text-gray-300 transition-colors">Landing Page</a>
    <span class="text-gray-700">|</span>
    <a href="#" class="text-xs font-medium text-gray-400 hover:text-gray-300 transition-colors">Edit</a>
  </div>
</div>
```

**Campaign cards grid:**
```html
<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
  <!-- Campaign Cards -->
</div>
```

---

### 2.3 Status Badge

Four states: planned, active, paused, completed.

```html
<!-- Planned (gray) -->
<span class="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-gray-400/10 text-gray-400 border border-gray-400/20">
  <span class="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
  Planned
</span>

<!-- Active (green + pulse animation on dot) -->
<span class="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-400/10 text-emerald-400 border border-emerald-400/20">
  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
  Active
</span>

<!-- Paused (amber) -->
<span class="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20">
  <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
  Paused
</span>

<!-- Completed (blue) -->
<span class="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-blue-400/10 text-blue-400 border border-blue-400/20">
  <span class="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
  Completed
</span>
```

**Pattern:** `bg-{color}-400/10 text-{color}-400 border border-{color}-400/20`

---

### 2.4 Metric Bar

Horizontal progress bar with label and value.

```html
<!-- Default (indigo) -->
<div class="space-y-1.5">
  <div class="flex items-center justify-between">
    <span class="text-xs font-medium text-gray-400">Google Search</span>
    <span class="text-xs font-semibold tabular-nums text-gray-50">40%</span>
  </div>
  <div class="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
    <div class="h-full bg-indigo-500 rounded-full transition-all duration-700 ease-out" style="width: 40%"></div>
  </div>
</div>

<!-- Success variant (green) -- value class: text-emerald-400, fill class: bg-emerald-500 -->
<!-- Warning variant (amber) -- value class: text-amber-400, fill class: bg-amber-500 -->
<!-- Danger variant (red) -- value class: text-red-400, fill class: bg-red-500 -->
```

**Stacked metric bars:**
```html
<div class="space-y-4">
  <!-- Metric Bar -->
  <!-- Metric Bar -->
  <!-- Metric Bar -->
</div>
```

---

### 2.5 Event Feed

Real-time scrolling list of tracking events.

```html
<div class="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
  <!-- Header -->
  <div class="flex items-center justify-between px-5 py-3 border-b border-gray-800">
    <h3 class="text-sm font-semibold text-gray-50">Live Events</h3>
    <div class="flex items-center gap-1.5">
      <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
      <span class="text-xs text-emerald-400 font-medium">Live</span>
    </div>
  </div>

  <!-- Scrollable list -->
  <div class="max-h-80 overflow-y-auto divide-y divide-gray-800/50" id="event-feed">

    <!-- Event item: page_view -->
    <div class="flex items-center gap-3 px-5 py-3 hover:bg-gray-800/50 transition-colors">
      <div class="w-7 h-7 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0">
        <svg class="w-3.5 h-3.5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
        </svg>
      </div>
      <div class="min-w-0 flex-1">
        <p class="text-sm text-gray-300 truncate">
          <span class="font-medium text-gray-50">page_view</span>
          <span class="text-gray-600 mx-1">/</span>
          <span class="text-gray-500 font-mono text-xs">coffee-shop</span>
        </p>
      </div>
      <span class="text-xs text-gray-600 tabular-nums shrink-0">2s ago</span>
    </div>

    <!-- Event item: cta_click -->
    <div class="flex items-center gap-3 px-5 py-3 hover:bg-gray-800/50 transition-colors">
      <div class="w-7 h-7 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
        <svg class="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"/>
        </svg>
      </div>
      <div class="min-w-0 flex-1">
        <p class="text-sm text-gray-300 truncate">
          <span class="font-medium text-emerald-400">cta_click</span>
          <span class="text-gray-600 mx-1">/</span>
          <span class="text-gray-500 font-mono text-xs">coffee-shop</span>
        </p>
      </div>
      <span class="text-xs text-gray-600 tabular-nums shrink-0">15s ago</span>
    </div>

    <!-- Event item: rsvp -->
    <div class="flex items-center gap-3 px-5 py-3 hover:bg-gray-800/50 transition-colors">
      <div class="w-7 h-7 rounded-full bg-cyan-500/10 flex items-center justify-center shrink-0">
        <svg class="w-3.5 h-3.5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
        </svg>
      </div>
      <div class="min-w-0 flex-1">
        <p class="text-sm text-gray-300 truncate">
          <span class="font-medium text-cyan-400">rsvp</span>
          <span class="text-gray-600 mx-1">/</span>
          <span class="text-gray-500 font-mono text-xs">grand-opening</span>
        </p>
      </div>
      <span class="text-xs text-gray-600 tabular-nums shrink-0">1m ago</span>
    </div>

    <!-- Event item: scroll_50 -->
    <div class="flex items-center gap-3 px-5 py-3 hover:bg-gray-800/50 transition-colors">
      <div class="w-7 h-7 rounded-full bg-gray-500/10 flex items-center justify-center shrink-0">
        <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
        </svg>
      </div>
      <div class="min-w-0 flex-1">
        <p class="text-sm text-gray-300 truncate">
          <span class="font-medium text-gray-400">scroll_50</span>
          <span class="text-gray-600 mx-1">/</span>
          <span class="text-gray-500 font-mono text-xs">coffee-shop</span>
        </p>
      </div>
      <span class="text-xs text-gray-600 tabular-nums shrink-0">2m ago</span>
    </div>

  </div>
</div>
```

**Event type icon colors:**

| Event | Icon BG | Icon Color | Event Name Color |
|-------|---------|------------|------------------|
| `page_view` | `bg-indigo-500/10` | `text-indigo-400` | `text-gray-50` |
| `cta_click` | `bg-emerald-500/10` | `text-emerald-400` | `text-emerald-400` |
| `rsvp` | `bg-cyan-500/10` | `text-cyan-400` | `text-cyan-400` |
| `purchase` | `bg-amber-500/10` | `text-amber-400` | `text-amber-400` |
| `scroll_*` | `bg-gray-500/10` | `text-gray-400` | `text-gray-400` |
| `form_submit` | `bg-blue-500/10` | `text-blue-400` | `text-blue-400` |

---

### 2.6 Empty State

No illustrations. Text-driven with a CTA.

```html
<div class="bg-gray-900 border border-gray-800 border-dashed rounded-xl p-12 text-center">
  <div class="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center mx-auto mb-4">
    <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
    </svg>
  </div>
  <h3 class="text-base font-semibold text-gray-50 mb-1">No campaigns yet</h3>
  <p class="text-sm text-gray-500 mb-6 max-w-sm mx-auto">Create your first campaign to start tracking performance. AdClaw will generate landing pages, ad copy, and analytics automatically.</p>
  <button class="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-lg transition-colors">
    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
    </svg>
    Create Campaign
  </button>
</div>
```

---

### 2.7 Page Link Card

Thumbnail preview + URL + copy button for generated landing/event pages.

```html
<div class="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition-all duration-200 group">
  <!-- Preview (CSS gradient, no image) -->
  <div class="h-32 bg-gradient-to-br from-indigo-900/40 via-gray-900 to-cyan-900/30 relative flex items-center justify-center">
    <div class="text-center">
      <div class="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center mx-auto mb-2 backdrop-blur-sm">
        <svg class="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
        </svg>
      </div>
      <span class="text-xs text-white/40">Landing Page</span>
    </div>
    <!-- Type badge -->
    <span class="absolute top-2 left-2 text-[10px] font-medium px-2 py-0.5 rounded bg-black/40 text-white/70 backdrop-blur-sm">SITE</span>
  </div>

  <!-- Info -->
  <div class="p-4">
    <h4 class="text-sm font-semibold text-gray-50 truncate mb-1">Chennai Coffee Grand Opening</h4>
    <div class="flex items-center gap-2">
      <p class="text-xs text-gray-500 font-mono truncate flex-1">/sites/coffee-shop.html</p>
      <button
        onclick="navigator.clipboard.writeText(this.dataset.url); this.textContent='Copied!'; setTimeout(()=>this.textContent='Copy',1500)"
        data-url="https://your-url.ngrok.io/sites/coffee-shop.html"
        class="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors shrink-0 cursor-pointer">
        Copy
      </button>
    </div>
    <div class="flex items-center gap-3 mt-3 pt-3 border-t border-gray-800">
      <a href="#" target="_blank" class="text-xs font-medium text-gray-400 hover:text-gray-300 transition-colors">Open</a>
      <span class="text-gray-700">|</span>
      <span class="text-xs text-gray-600">Created 2h ago</span>
    </div>
  </div>
</div>
```

**Event page variant:** change gradient to `from-amber-900/30 via-gray-900 to-indigo-900/20` and badge text to `EVENT`.

**Page cards grid:**
```html
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  <!-- Page Link Cards -->
</div>
```

---

### 2.8 Chart Placeholder (CSS-only Bar Chart)

No chart library. Pure CSS bars.

```html
<div class="bg-gray-900 border border-gray-800 rounded-xl p-5">
  <div class="flex items-center justify-between mb-5">
    <h3 class="text-sm font-semibold text-gray-50">Events (7 days)</h3>
    <div class="flex items-center gap-4">
      <div class="flex items-center gap-1.5">
        <span class="w-2.5 h-2.5 rounded-sm bg-indigo-500"></span>
        <span class="text-xs text-gray-500">Views</span>
      </div>
      <div class="flex items-center gap-1.5">
        <span class="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span>
        <span class="text-xs text-gray-500">Clicks</span>
      </div>
    </div>
  </div>

  <!-- Chart bars -->
  <div class="flex items-end gap-2 h-40">
    <!-- Each day: a flex column with bars growing upward -->
    <div class="flex-1 flex flex-col items-center gap-1">
      <div class="w-full flex-1 flex flex-col justify-end gap-0.5">
        <div class="w-full bg-indigo-500/80 rounded-t-sm transition-all duration-700" style="height: 60%"></div>
        <div class="w-full bg-emerald-500/80 rounded-t-sm transition-all duration-700" style="height: 20%"></div>
      </div>
      <span class="text-[10px] text-gray-600">Mon</span>
    </div>
    <div class="flex-1 flex flex-col items-center gap-1">
      <div class="w-full flex-1 flex flex-col justify-end gap-0.5">
        <div class="w-full bg-indigo-500/80 rounded-t-sm transition-all duration-700" style="height: 80%"></div>
        <div class="w-full bg-emerald-500/80 rounded-t-sm transition-all duration-700" style="height: 35%"></div>
      </div>
      <span class="text-[10px] text-gray-600">Tue</span>
    </div>
    <div class="flex-1 flex flex-col items-center gap-1">
      <div class="w-full flex-1 flex flex-col justify-end gap-0.5">
        <div class="w-full bg-indigo-500/80 rounded-t-sm transition-all duration-700" style="height: 45%"></div>
        <div class="w-full bg-emerald-500/80 rounded-t-sm transition-all duration-700" style="height: 15%"></div>
      </div>
      <span class="text-[10px] text-gray-600">Wed</span>
    </div>
    <div class="flex-1 flex flex-col items-center gap-1">
      <div class="w-full flex-1 flex flex-col justify-end gap-0.5">
        <div class="w-full bg-indigo-500/80 rounded-t-sm transition-all duration-700" style="height: 90%"></div>
        <div class="w-full bg-emerald-500/80 rounded-t-sm transition-all duration-700" style="height: 40%"></div>
      </div>
      <span class="text-[10px] text-gray-600">Thu</span>
    </div>
    <div class="flex-1 flex flex-col items-center gap-1">
      <div class="w-full flex-1 flex flex-col justify-end gap-0.5">
        <div class="w-full bg-indigo-500/80 rounded-t-sm transition-all duration-700" style="height: 70%"></div>
        <div class="w-full bg-emerald-500/80 rounded-t-sm transition-all duration-700" style="height: 30%"></div>
      </div>
      <span class="text-[10px] text-gray-600">Fri</span>
    </div>
    <div class="flex-1 flex flex-col items-center gap-1">
      <div class="w-full flex-1 flex flex-col justify-end gap-0.5">
        <div class="w-full bg-indigo-500/80 rounded-t-sm transition-all duration-700" style="height: 100%"></div>
        <div class="w-full bg-emerald-500/80 rounded-t-sm transition-all duration-700" style="height: 45%"></div>
      </div>
      <span class="text-[10px] text-gray-600">Sat</span>
    </div>
    <div class="flex-1 flex flex-col items-center gap-1">
      <div class="w-full flex-1 flex flex-col justify-end gap-0.5">
        <div class="w-full bg-indigo-500/80 rounded-t-sm transition-all duration-700" style="height: 55%"></div>
        <div class="w-full bg-emerald-500/80 rounded-t-sm transition-all duration-700" style="height: 25%"></div>
      </div>
      <span class="text-[10px] text-gray-600">Sun</span>
    </div>
  </div>
</div>
```

---

### 2.9 Header / Nav Bar

Top navigation with brand, status indicator, and section links.

```html
<header class="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800">
  <div class="max-w-screen-2xl mx-auto px-6 lg:px-8">
    <div class="flex items-center justify-between h-14">
      <!-- Left: Brand + Nav -->
      <div class="flex items-center gap-6">
        <div class="flex items-center gap-2.5">
          <div class="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center">
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
          </div>
          <span class="text-base font-bold text-gray-50 tracking-tight">AdClaw</span>
        </div>

        <nav class="hidden md:flex items-center gap-1">
          <a href="#overview" class="px-3 py-1.5 text-sm font-medium text-gray-50 bg-gray-800 rounded-lg">Overview</a>
          <a href="#campaigns" class="px-3 py-1.5 text-sm font-medium text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 rounded-lg transition-colors">Campaigns</a>
          <a href="#pages" class="px-3 py-1.5 text-sm font-medium text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 rounded-lg transition-colors">Pages</a>
          <a href="#events" class="px-3 py-1.5 text-sm font-medium text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 rounded-lg transition-colors">Events</a>
        </nav>
      </div>

      <!-- Right: Status + Actions -->
      <div class="flex items-center gap-4">
        <div class="hidden sm:flex items-center gap-1.5 text-xs">
          <span id="status-dot" class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span id="status-text" class="text-gray-400">Agent Online</span>
        </div>

        <div class="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-800 border border-gray-700">
          <span class="text-[10px] font-bold text-amber-400">GOAT</span>
          <span class="text-[10px] text-gray-500">Testnet3</span>
        </div>

        <button onclick="location.reload()" class="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 flex items-center justify-center transition-colors" title="Refresh data">
          <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</header>
```

**Nav link states:**
- Active: `text-gray-50 bg-gray-800 rounded-lg`
- Inactive: `text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 rounded-lg transition-colors`

---

### 2.10 Toast / Alert

Notifications for success, error, info, warning states.

```html
<!-- Toast Container (fixed, top-right) -->
<div id="toast-container" class="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">

  <!-- Success Toast -->
  <div class="pointer-events-auto flex items-start gap-3 bg-gray-900 border border-emerald-500/30 rounded-xl p-4 shadow-xl shadow-black/30 max-w-sm animate-slide-in">
    <div class="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
      <svg class="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
      </svg>
    </div>
    <div class="flex-1 min-w-0">
      <p class="text-sm font-medium text-gray-50">Campaign created</p>
      <p class="text-xs text-gray-400 mt-0.5">Landing page deployed successfully.</p>
    </div>
    <button onclick="this.parentElement.remove()" class="text-gray-500 hover:text-gray-300 transition-colors shrink-0">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
      </svg>
    </button>
  </div>

  <!-- Error Toast: swap border-emerald-500/30 -> border-red-500/30, bg-emerald-500/20 -> bg-red-500/20, text-emerald-400 -> text-red-400 -->
  <!-- Info Toast: swap to border-blue-500/30, bg-blue-500/20, text-blue-400 -->
  <!-- Warning Toast: swap to border-amber-500/30, bg-amber-500/20, text-amber-400 -->

</div>
```

**Toast border/icon color mapping:**

| Type | Border | Icon BG | Icon Color |
|------|--------|---------|------------|
| Success | `border-emerald-500/30` | `bg-emerald-500/20` | `text-emerald-400` |
| Error | `border-red-500/30` | `bg-red-500/20` | `text-red-400` |
| Info | `border-blue-500/30` | `bg-blue-500/20` | `text-blue-400` |
| Warning | `border-amber-500/30` | `bg-amber-500/20` | `text-amber-400` |

---

### 2.11 Buttons

```html
<!-- Primary -->
<button class="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-950">
  Create Campaign
</button>

<!-- Secondary -->
<button class="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium rounded-lg border border-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-950">
  View Details
</button>

<!-- Ghost -->
<button class="inline-flex items-center gap-2 px-4 py-2.5 text-gray-400 hover:text-gray-200 hover:bg-gray-800 text-sm font-medium rounded-lg transition-colors">
  Cancel
</button>

<!-- Danger -->
<button class="inline-flex items-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-medium rounded-lg border border-red-500/20 transition-colors">
  Delete
</button>

<!-- Icon Button (small square) -->
<button class="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 flex items-center justify-center transition-colors">
  <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">...</svg>
</button>
```

---

### 2.12 Data Table

For report views and campaign listings in tabular format.

```html
<div class="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
  <table class="w-full text-left">
    <thead>
      <tr class="border-b border-gray-800">
        <th class="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
        <th class="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
        <th class="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Views</th>
        <th class="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">CTR</th>
        <th class="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Conv.</th>
        <th class="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">ROAS</th>
      </tr>
    </thead>
    <tbody class="divide-y divide-gray-800/50">
      <tr class="hover:bg-gray-800/30 transition-colors">
        <td class="px-5 py-3.5">
          <p class="text-sm font-medium text-gray-50">Chennai Coffee Launch</p>
          <p class="text-xs text-gray-500 font-mono">abc-123-uuid</p>
        </td>
        <td class="px-5 py-3.5">
          <!-- Use status badge from 2.3 -->
        </td>
        <td class="px-5 py-3.5 text-sm tabular-nums text-gray-300 text-right">1,247</td>
        <td class="px-5 py-3.5 text-sm tabular-nums text-gray-300 text-right">3.2%</td>
        <td class="px-5 py-3.5 text-sm tabular-nums text-gray-300 text-right">87</td>
        <td class="px-5 py-3.5 text-sm tabular-nums font-medium text-emerald-400 text-right">4.2x</td>
      </tr>
    </tbody>
  </table>
</div>
```

---

## 3. Layout Grid

### 3.1 Overall Decision: Top-nav, single column, max-width constrained

No sidebar. Top navigation bar with a single-column layout constrained to `max-w-screen-2xl` (1536px). This works best for a single HTML file without routing, and scales cleanly from mobile to ultrawide.

### 3.2 Page Structure

```
+--------------------------------------------------+
| HEADER (sticky, full-width, backdrop blur)       |
+--------------------------------------------------+
| max-w-screen-2xl mx-auto px-6 lg:px-8 pt-6      |
|                                                    |
| [Section: Overview]                                |
| +--------+ +--------+ +--------+ +--------+       |
| | Stat   | | Stat   | | Stat   | | Stat   |       |
| +--------+ +--------+ +--------+ +--------+       |
|                                                    |
| [Section: Charts + Live Events]                    |
| +----------------------+ +------------------+      |
| | Bar Chart (2/3)      | | Event Feed (1/3) |      |
| +----------------------+ +------------------+      |
|                                                    |
| [Section: Campaigns]                               |
| +-----------+ +-----------+ +-----------+          |
| | Campaign  | | Campaign  | | Campaign  |          |
| +-----------+ +-----------+ +-----------+          |
|                                                    |
| [Section: Pages]                                   |
| +-------+ +-------+ +-------+ +-------+           |
| | Page  | | Page  | | Page  | | Page  |           |
| +-------+ +-------+ +-------+ +-------+           |
|                                                    |
| [Section: Budget Split + KPIs]                     |
| +----------------------+ +------------------+      |
| | Metric Bars (1/2)    | | KPI Table (1/2)  |      |
| +----------------------+ +------------------+      |
|                                                    |
| FOOTER                                             |
+--------------------------------------------------+
```

### 3.3 Responsive Breakpoints

| Breakpoint | Tailwind Prefix | Width | Behavior |
|------------|-----------------|-------|----------|
| Mobile | (default) | < 640px | Single column. Everything stacks. |
| Tablet | `sm:` | 640px+ | 2-col stat cards. 2-col page cards. |
| Desktop | `lg:` | 1024px+ | 4-col stats. Chart+feed side-by-side. 3-col campaigns. |
| Wide | `xl:` | 1280px+ | 4-col page cards. More breathing room. |
| Ultrawide | `2xl:` | 1536px | Content maxes out, centered. |

### 3.4 Section Layout Classes

```html
<!-- Full page wrapper -->
<div class="min-h-screen bg-gray-950 text-gray-50 font-sans antialiased">

  <!-- Header (component 2.9) -->
  <header class="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800">...</header>

  <!-- Main content -->
  <main class="max-w-screen-2xl mx-auto px-6 lg:px-8 pt-6 pb-12 space-y-8">

    <!-- Page title -->
    <div>
      <h1 class="text-3xl font-bold tracking-tight text-gray-50">Dashboard</h1>
      <p class="text-sm text-gray-500 mt-1">Real-time campaign performance and analytics</p>
    </div>

    <!-- Stat cards (4-up) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- 4x Stat Card -->
    </div>

    <!-- Chart + Event Feed (2/3 + 1/3) -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div class="lg:col-span-2">
        <!-- CSS Bar Chart -->
      </div>
      <div>
        <!-- Event Feed -->
      </div>
    </div>

    <!-- Campaigns section -->
    <div>
      <div class="flex items-center justify-between mb-5">
        <h2 class="text-xl font-semibold tracking-tight text-gray-50">Campaigns</h2>
        <button class="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-lg transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          New Campaign
        </button>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        <!-- Campaign Cards (or Empty State) -->
      </div>
    </div>

    <!-- Generated Pages section -->
    <div>
      <h2 class="text-xl font-semibold tracking-tight text-gray-50 mb-5">Generated Pages</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <!-- Page Link Cards (or Empty State) -->
      </div>
    </div>

    <!-- Budget Split + KPIs (side by side) -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">

      <!-- Budget allocation -->
      <div class="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h3 class="text-sm font-semibold text-gray-50 mb-4">Budget Allocation</h3>
        <div class="space-y-4">
          <!-- Metric Bars -->
        </div>
      </div>

      <!-- KPI overview -->
      <div class="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h3 class="text-sm font-semibold text-gray-50 mb-4">KPI Targets</h3>
        <div class="space-y-3">
          <div class="flex items-center justify-between py-2 border-b border-gray-800">
            <span class="text-sm text-gray-400">CTR</span>
            <span class="text-sm font-semibold text-gray-50 tabular-nums">3.2% <span class="text-emerald-400 text-xs">/ >2%</span></span>
          </div>
          <div class="flex items-center justify-between py-2 border-b border-gray-800">
            <span class="text-sm text-gray-400">Conversion Rate</span>
            <span class="text-sm font-semibold text-gray-50 tabular-nums">7.2% <span class="text-emerald-400 text-xs">/ >5%</span></span>
          </div>
          <div class="flex items-center justify-between py-2 border-b border-gray-800">
            <span class="text-sm text-gray-400">ROAS</span>
            <span class="text-sm font-semibold text-gray-50 tabular-nums">4.2x <span class="text-emerald-400 text-xs">/ >3x</span></span>
          </div>
          <div class="flex items-center justify-between py-2">
            <span class="text-sm text-gray-400">CPA</span>
            <span class="text-sm font-semibold text-gray-50 tabular-nums">INR 574 <span class="text-amber-400 text-xs">/ &lt;500</span></span>
          </div>
        </div>
      </div>

    </div>

  </main>

  <!-- Footer -->
  <footer class="border-t border-gray-800 mt-12">
    <div class="max-w-screen-2xl mx-auto px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="flex items-center gap-2">
        <div class="w-5 h-5 rounded bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center">
          <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/>
          </svg>
        </div>
        <span class="text-xs text-gray-500">AdClaw -- Autonomous Marketing Agent on GOAT Network</span>
      </div>
      <div class="flex items-center gap-4 text-xs text-gray-600">
        <span>Powered by OpenClaw + x402</span>
        <span class="text-gray-700">|</span>
        <a href="https://goat.network" class="hover:text-gray-400 transition-colors">GOAT Testnet3</a>
      </div>
    </div>
  </footer>

  <!-- Toast Container -->
  <div id="toast-container" class="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none"></div>
</div>
```

---

## 4. Dark Mode Specification

Dark mode is the **only** mode. No light/dark toggle.

### 4.1 Surface Color Mapping

| Surface | Tailwind Class | Hex | Usage |
|---------|---------------|-----|-------|
| Root background | `bg-gray-950` | `#030712` | `<body>`, page bg |
| Card / Panel | `bg-gray-900` | `#111827` | All cards, panels |
| Elevated / Hover | `bg-gray-800` | `#1F2937` | Hover states, inputs, nested panels |
| Input background | `bg-gray-800` | `#1F2937` | Form inputs, text areas |
| Default border | `border-gray-800` | `#1F2937` | Most card borders |
| Hover border | `border-gray-700` | `#374151` | Card hover, active borders |
| Subtle divider | `border-gray-800/50` | | Dividers inside cards |

### 4.2 Text Contrast (WCAG compliance on gray-950 background)

| Role | Class | Hex | Ratio vs gray-950 |
|------|-------|-----|--------------------|
| Primary text | `text-gray-50` | `#F9FAFB` | 18.3:1 (AAA) |
| Secondary text | `text-gray-400` | `#9CA3AF` | 5.5:1 (AA) |
| Tertiary / disabled | `text-gray-500` | `#6B7280` | 3.8:1 (AA Large) |
| Decorative | `text-gray-600` | `#4B5563` | 2.6:1 (decorative only) |
| Accent (indigo) | `text-indigo-400` | `#818CF8` | 5.2:1 (AA) |
| Success text | `text-emerald-400` | `#34D399` | 7.1:1 (AA) |
| Warning text | `text-amber-400` | `#FBBF24` | 9.3:1 (AA) |
| Error text | `text-red-400` | `#F87171` | 5.6:1 (AA) |

### 4.3 Interactive State Colors

| State | Background | Border | Text |
|-------|-----------|--------|------|
| Default card | `bg-gray-900` | `border-gray-800` | `text-gray-50` |
| Hovered card | `bg-gray-900` | `border-gray-700` | `text-gray-50` |
| Selected / active | `bg-gray-800` | `border-indigo-500/50` | `text-gray-50` |
| Focused input | `bg-gray-800` | `ring-2 ring-indigo-500 border-transparent` | `text-gray-50` |
| Disabled | `bg-gray-900 opacity-50` | `border-gray-800` | `text-gray-600` |

### 4.4 Colored Background Tints (badges, alerts, tags)

Pattern: `bg-{color}-400/10 text-{color}-400 border border-{color}-400/20`

```
/* Success */ bg-emerald-400/10 text-emerald-400 border-emerald-400/20
/* Warning */ bg-amber-400/10   text-amber-400   border-amber-400/20
/* Error   */ bg-red-400/10     text-red-400     border-red-400/20
/* Info    */ bg-blue-400/10    text-blue-400    border-blue-400/20
/* Neutral */ bg-gray-400/10    text-gray-400    border-gray-400/20
/* Primary */ bg-indigo-500/10  text-indigo-400  border-indigo-500/20
```

### 4.5 Gradient Accents

For visual interest without images:

```html
<!-- Card with gradient accent line at top -->
<div class="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
  <div class="h-0.5 bg-gradient-to-r from-indigo-500 via-cyan-500 to-indigo-500"></div>
  <div class="p-5">...</div>
</div>

<!-- Page preview gradient -->
<div class="bg-gradient-to-br from-indigo-900/40 via-gray-900 to-cyan-900/30"></div>
```

---

## 5. Micro-interactions

### 5.1 Skeleton Loading States

Display while data is being fetched. Use Tailwind `animate-pulse`.

```html
<!-- Skeleton: Stat Card -->
<div class="bg-gray-900 border border-gray-800 rounded-xl p-5 animate-pulse">
  <div class="flex items-center justify-between mb-3">
    <div class="h-3 w-20 bg-gray-800 rounded"></div>
    <div class="w-8 h-8 rounded-lg bg-gray-800"></div>
  </div>
  <div class="flex items-end gap-3">
    <div class="h-8 w-24 bg-gray-800 rounded"></div>
    <div class="h-5 w-14 bg-gray-800 rounded-full mb-1"></div>
  </div>
  <div class="h-3 w-16 bg-gray-800 rounded mt-2"></div>
</div>

<!-- Skeleton: Campaign Card -->
<div class="bg-gray-900 border border-gray-800 rounded-xl p-5 animate-pulse">
  <div class="flex items-start justify-between mb-4">
    <div>
      <div class="h-4 w-48 bg-gray-800 rounded mb-2"></div>
      <div class="h-3 w-24 bg-gray-800 rounded"></div>
    </div>
    <div class="h-6 w-16 bg-gray-800 rounded-full"></div>
  </div>
  <div class="flex gap-4 mb-4">
    <div class="h-3 w-20 bg-gray-800 rounded"></div>
    <div class="h-3 w-16 bg-gray-800 rounded"></div>
  </div>
  <div class="grid grid-cols-3 gap-3 mb-4 py-3 border-t border-b border-gray-800">
    <div><div class="h-3 w-10 bg-gray-800 rounded mb-1"></div><div class="h-4 w-12 bg-gray-800 rounded"></div></div>
    <div><div class="h-3 w-8 bg-gray-800 rounded mb-1"></div><div class="h-4 w-10 bg-gray-800 rounded"></div></div>
    <div><div class="h-3 w-10 bg-gray-800 rounded mb-1"></div><div class="h-4 w-8 bg-gray-800 rounded"></div></div>
  </div>
  <div class="flex gap-2 mb-4">
    <div class="h-5 w-14 bg-gray-800 rounded"></div>
    <div class="h-5 w-12 bg-gray-800 rounded"></div>
    <div class="h-5 w-16 bg-gray-800 rounded"></div>
  </div>
  <div class="flex gap-3 pt-1">
    <div class="h-3 w-16 bg-gray-800 rounded"></div>
    <div class="h-3 w-20 bg-gray-800 rounded"></div>
  </div>
</div>

<!-- Skeleton: Event Feed Item -->
<div class="flex items-center gap-3 px-5 py-3 animate-pulse">
  <div class="w-7 h-7 rounded-full bg-gray-800 shrink-0"></div>
  <div class="flex-1">
    <div class="h-3.5 w-40 bg-gray-800 rounded"></div>
  </div>
  <div class="h-3 w-10 bg-gray-800 rounded shrink-0"></div>
</div>
```

### 5.2 Number Count-Up Animation

Animates stat numbers when they enter the viewport.

```javascript
// Count-up animation for stat numbers
function animateCountUp(element, target, duration = 1200) {
  const start = 0;
  const startTime = performance.now();
  const formatter = new Intl.NumberFormat();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Ease-out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(start + (target - start) * eased);
    element.textContent = formatter.format(current);
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

// Auto-trigger on elements with data-count attribute
function initCountUps() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10);
        if (!isNaN(target)) animateCountUp(el, target);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('[data-count]').forEach(el => observer.observe(el));
}

document.addEventListener('DOMContentLoaded', initCountUps);
```

**Usage on elements:**
```html
<span class="text-3xl font-bold tabular-nums tracking-tight text-gray-50" data-count="1247">0</span>
```

### 5.3 Hover Effects on Cards

Base hover is already in card classes: `hover:border-gray-700 transition-all duration-200`.

For enhanced glow on important cards:

```html
<div class="bg-gray-900 border border-gray-800 rounded-xl p-5
            hover:border-gray-700 hover:shadow-[0_0_20px_rgba(99,102,241,0.08)]
            transition-all duration-200 group">
  <!-- Use group-hover: for child element effects -->
  <h3 class="... group-hover:text-indigo-400 transition-colors">Campaign Name</h3>
</div>
```

### 5.4 Custom Animations (CSS)

Add this `<style>` block inside `<head>`:

```html
<style>
  /* Toast slide-in from right */
  @keyframes slide-in {
    from { opacity: 0; transform: translateX(16px); }
    to { opacity: 1; transform: translateX(0); }
  }
  .animate-slide-in { animation: slide-in 0.3s ease-out; }

  /* Event feed item fade-in from top */
  @keyframes feed-in {
    from { opacity: 0; transform: translateY(-8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-feed-in { animation: feed-in 0.25s ease-out; }

  /* Glow pulse for live indicator */
  @keyframes glow-pulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.4); }
    50% { box-shadow: 0 0 0 4px rgba(52, 211, 153, 0); }
  }
  .animate-glow-pulse { animation: glow-pulse 2s ease-in-out infinite; }

  /* Progress bar fill animation */
  @keyframes bar-fill { from { width: 0; } }
  .animate-bar-fill { animation: bar-fill 0.8s ease-out; }

  /* Custom scrollbar for dark mode */
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: #111827; }
  ::-webkit-scrollbar-thumb { background: #374151; border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: #4B5563; }
</style>
```

### 5.5 Toast JavaScript Helper

```javascript
function showToast(type, title, message, duration = 4000) {
  const container = document.getElementById('toast-container');
  const colors = {
    success: { border: 'border-emerald-500/30', bg: 'bg-emerald-500/20', text: 'text-emerald-400' },
    error:   { border: 'border-red-500/30',     bg: 'bg-red-500/20',     text: 'text-red-400' },
    info:    { border: 'border-blue-500/30',     bg: 'bg-blue-500/20',    text: 'text-blue-400' },
    warning: { border: 'border-amber-500/30',    bg: 'bg-amber-500/20',   text: 'text-amber-400' },
  };
  const c = colors[type] || colors.info;
  const icons = {
    success: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>',
    error:   '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>',
    info:    '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>',
    warning: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>',
  };

  const toast = document.createElement('div');
  toast.className = `pointer-events-auto flex items-start gap-3 bg-gray-900 ${c.border} rounded-xl p-4 shadow-xl shadow-black/30 max-w-sm animate-slide-in`;
  toast.innerHTML = `
    <div class="w-6 h-6 rounded-full ${c.bg} flex items-center justify-center shrink-0 mt-0.5">
      <svg class="w-3.5 h-3.5 ${c.text}" fill="none" stroke="currentColor" viewBox="0 0 24 24">${icons[type] || icons.info}</svg>
    </div>
    <div class="flex-1 min-w-0">
      <p class="text-sm font-medium text-gray-50">${title}</p>
      ${message ? `<p class="text-xs text-gray-400 mt-0.5">${message}</p>` : ''}
    </div>
    <button class="text-gray-500 hover:text-gray-300 transition-colors shrink-0" onclick="this.parentElement.remove()">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
    </button>
  `;
  container.appendChild(toast);
  if (duration > 0) {
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(16px)';
      toast.style.transition = 'all 0.2s ease-in';
      setTimeout(() => toast.remove(), 200);
    }, duration);
  }
}
```

### 5.6 Data Refresh Polling

```javascript
const API_BASE = window.location.origin;

async function fetchDashboardData() {
  try {
    const [healthRes, pagesRes] = await Promise.all([
      fetch(`${API_BASE}/health`),
      fetch(`${API_BASE}/api/pages`),
    ]);
    const health = await healthRes.json();
    const pages = await pagesRes.json();

    // Update status indicator
    const statusDot = document.getElementById('status-dot');
    const statusText = document.getElementById('status-text');
    if (health.status === 'ok') {
      statusDot.className = 'w-2 h-2 rounded-full bg-emerald-400 animate-pulse';
      statusText.textContent = 'Agent Online';
      statusText.className = 'text-gray-400';
    } else {
      statusDot.className = 'w-2 h-2 rounded-full bg-red-400';
      statusText.textContent = 'Offline';
      statusText.className = 'text-red-400';
    }

    renderPages(pages);
  } catch (err) {
    console.error('Dashboard fetch failed:', err);
  }
}

// Initial load + 30s polling
fetchDashboardData();
setInterval(fetchDashboardData, 30000);
```

---

## 6. Full Page Skeleton

Complete HTML skeleton tying everything together. This is the starting point for `server/public/dashboard/index.html`.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AdClaw Dashboard</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
            mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
          }
        }
      }
    }
  </script>
  <style>
    @keyframes slide-in { from { opacity:0; transform:translateX(16px); } to { opacity:1; transform:translateX(0); } }
    .animate-slide-in { animation: slide-in 0.3s ease-out; }
    @keyframes feed-in { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
    .animate-feed-in { animation: feed-in 0.25s ease-out; }
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: #111827; }
    ::-webkit-scrollbar-thumb { background: #374151; border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: #4B5563; }
  </style>
</head>
<body class="min-h-screen bg-gray-950 text-gray-50 font-sans antialiased">

  <!-- HEADER (component 2.9) -->
  <header class="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800">
    ...
  </header>

  <!-- MAIN CONTENT -->
  <main class="max-w-screen-2xl mx-auto px-6 lg:px-8 pt-6 pb-12 space-y-8">

    <!-- Title -->
    <div>...</div>

    <!-- Stat Cards Row -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="stats-grid">...</div>

    <!-- Chart + Event Feed -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div class="lg:col-span-2" id="chart-section">...</div>
      <div id="feed-section">...</div>
    </div>

    <!-- Campaigns -->
    <div id="campaigns-section">...</div>

    <!-- Pages -->
    <div id="pages-section">...</div>

    <!-- Budget + KPIs -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5" id="kpi-section">...</div>

  </main>

  <!-- FOOTER -->
  <footer class="border-t border-gray-800 mt-12">...</footer>

  <!-- TOAST CONTAINER -->
  <div id="toast-container" class="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none"></div>

  <!-- SCRIPTS: count-up, toast helper, data fetching -->
  <script>
    // See sections 5.2, 5.5, 5.6 for full implementations
  </script>

</body>
</html>
```

---

## 7. Quick Reference: Copy-Paste Class Strings

For developers who just need the raw class strings:

```
STAT_CARD:            bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-all duration-200
STAT_LABEL:           text-xs font-medium text-gray-500 uppercase tracking-wider
STAT_VALUE:           text-3xl font-bold tabular-nums tracking-tight text-gray-50
TREND_UP:             inline-flex items-center gap-0.5 text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full
TREND_DOWN:           inline-flex items-center gap-0.5 text-xs font-medium text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full

BADGE_PLANNED:        inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-gray-400/10 text-gray-400 border border-gray-400/20
BADGE_ACTIVE:         inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-400/10 text-emerald-400 border border-emerald-400/20
BADGE_PAUSED:         inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20
BADGE_COMPLETED:      inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-blue-400/10 text-blue-400 border border-blue-400/20

BTN_PRIMARY:          inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-lg transition-colors
BTN_SECONDARY:        inline-flex items-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium rounded-lg border border-gray-700 transition-colors
BTN_GHOST:            inline-flex items-center gap-2 px-4 py-2.5 text-gray-400 hover:text-gray-200 hover:bg-gray-800 text-sm font-medium rounded-lg transition-colors
BTN_DANGER:           inline-flex items-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-medium rounded-lg border border-red-500/20 transition-colors

CARD:                 bg-gray-900 border border-gray-800 rounded-xl
CARD_PADDING:         p-5
CARD_HOVER:           hover:border-gray-700 transition-all duration-200

PAGE_BG:              min-h-screen bg-gray-950 text-gray-50 font-sans antialiased
HEADER:               sticky top-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800
CONTENT:              max-w-screen-2xl mx-auto px-6 lg:px-8 pt-6 pb-12 space-y-8

SECTION_TITLE:        text-xl font-semibold tracking-tight text-gray-50
PAGE_TITLE:           text-3xl font-bold tracking-tight text-gray-50

PROGRESS_TRACK:       w-full h-2 bg-gray-800 rounded-full overflow-hidden
PROGRESS_FILL:        h-full rounded-full transition-all duration-700 ease-out

TABLE_HEADER:         px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider
TABLE_CELL:           px-5 py-3.5 text-sm tabular-nums text-gray-300

NAV_ACTIVE:           px-3 py-1.5 text-sm font-medium text-gray-50 bg-gray-800 rounded-lg
NAV_INACTIVE:         px-3 py-1.5 text-sm font-medium text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 rounded-lg transition-colors

EMPTY_STATE:          bg-gray-900 border border-gray-800 border-dashed rounded-xl p-12 text-center
SKELETON:             animate-pulse bg-gray-800 rounded
```
