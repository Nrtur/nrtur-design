# Handoff: nrtur CRM — Full Frontend

## Overview
nrtur is a dark-glass CRM for small sales teams. This handoff covers **every screen** of the product: landing/auth, the main app shell (sidebar + topbar), and all feature pages. The prototype is a **high-fidelity, fully interactive** React SPA built as a design reference — your task is to recreate it in your production stack using the exact values documented here.

---

## About the Design Files
The files in `components/` are **design references written in React JSX** (Babel-transpiled, Tailwind CDN). They are not production-ready code. Treat them as a pixel-accurate specification: read the component JSX for exact spacing, colour usage, typography, and interaction logic, then reimplement in your chosen framework (Next.js + Tailwind is the natural fit given the existing token system).

Open `Prototype v2.html` in a browser to see the full interactive prototype. All components and pages are wired together.

---

## Fidelity
**High-fidelity.** Every colour, radius, shadow, font size, weight, spacing value, hover state, transition, loading state, and copy string is final. Recreate pixel-perfectly.

---

## Tech Stack (recommended)
| Layer | Recommendation |
|---|---|
| Framework | Next.js 14+ (App Router) |
| Styling | Tailwind CSS v3 + CSS custom properties from `design-tokens.css` |
| Icons | Inline SVG (lucide-style paths already in `shared.jsx` → copy the `I` object) |
| State | Zustand or React Context (per-page local state, no global store yet) |
| Auth | NextAuth.js |
| API | tRPC or REST over Prisma |

---

## Pages & Routes

| Route | Component | Description |
|---|---|---|
| `/` | `LandingPage` | Marketing landing with hero, features, pricing, testimonials, FAQ |
| `/signup` | `SignUpPage` | Email + password, Google OAuth button |
| `/signin` | `SignInPage` | Email + password, forgot password link |
| `/onboarding` | `OnboardingPage` step 1–4 | 4-step workspace setup wizard |
| `/dashboard` | `DashboardPage` | KPI cards, pipeline bar, activity feed, top contacts |
| `/contacts` | `ContactsPage` | Filterable table of contacts with skeleton loader |
| `/contacts/:id` | `ContactDetailPage` | 2-col layout: info panel + activity timeline |
| `/contacts/new` | `AddContactPage` | Form to create contact |
| `/contacts/:id/edit` | `EditContactPage` | Pre-filled edit form |
| `/pipeline` | `PipelinePage` | Kanban board with stage metrics + skeleton loader |
| `/pipeline/:id` | `DealDetailPage` | Deal detail with activity + stage mover |
| `/pipeline/new` | `AddDealPage` | Quick deal creation form |
| `/email` | `EmailInboxPage` | Inbox list + email reader panel |
| `/automations` | `AutomationsPage` | Workflow list + template grid |
| `/automations/builder` | `AutomationBuilderPage` | Drag-and-drop step canvas + action palette |
| `/automations/sequences` | `SMSSequencesPage` | SMS drip sequence list with stats |
| `/reports` | `ReportsPage` | Revenue chart, win rate, deal cycle, leaderboard |
| `/settings/general` | `SettingsGeneralPage` | Workspace name, timezone, danger zone |
| `/settings/team` | `SettingsTeamPage` | Member list + invite modal |
| `/settings/billing` | `SettingsBillingPage` | Plan, usage, payment card, invoices |
| `/settings/pipeline` | `SettingsPipelinePage` | Stage editor + probability sliders |
| `/settings/unsubscribes` | `SettingsUnsubscribesPage` | Suppression list + compliance toggles |
| `/settings/integrations` | `SettingsIntegrationsPage` | Gmail, Slack, Zapier, Stripe, HubSpot toggles |
| `/profile` | `ProfilePage` | Avatar, personal info, password change |

---

## App Shell

### Sidebar — `AppSidebar`
- **Width:** 56px (`w-14`), icon-only
- **Background:** `#07070f` (surface-950)
- **Right border:** `1px solid rgba(255,255,255,0.05)`
- **Logo mark:** 32×32px rounded-lg, gradient `#6366f1 → #7c3aed`, uses `assets/nrtur-mark.svg`
- **Nav items:** 36×36px (`w-9 h-9`) rounded-xl buttons, icons 16px
  - Inactive: `text-white/30`, hover `text-white/70 bg-white/[0.04]`
  - Active: `bg-brand-500/20 text-brand-300 ring-1 ring-brand-500/25 shadow-[0_0_18px_rgba(99,102,241,0.35)]`
- **Sequences sub-link:** 28×28px (`w-7 h-7`) appears below Automations when on `/automations*` or `/sequences`
- **Bottom:** Settings gear + avatar button (navigates to `/profile`)

### Topbar — `AppTopbar`
- **Height:** ~56px, `px-7 py-3.5`
- **Background:** `#09091a` (surface-925)
- **Bottom border:** `1px solid rgba(255,255,255,0.05)`
- **Left:** page `<h1>` 22px/bold + optional subtitle 13px/white-50
- **Right:** optional `rightSlot` → search button → bell → avatar
- **Search button:** 152px wide, rounded-xl, `border-white/[0.08] bg-white/[0.04]`, clicking opens `GlobalSearchOverlay`, ⌘K badge click opens `CommandPalette`
- **Bell:** 36×36px, shows `NotifDropdown` on click, indigo dot indicator

### Footer — `AppFooter`
- **Height:** ~36px, `px-7 py-2`
- **Background:** `#07070f`
- **Top border:** `1px solid rgba(255,255,255,0.05)`
- **Left:** emerald dot (animated glowPulse) + "All systems operational" text
- **Right:** optional note + "3 team members online" + avatar stack

---

## Global Overlay Components

### `GlobalSearchOverlay`
- **Trigger:** click search button in topbar, or `window.__nrturOpenSearch()`
- **Backdrop:** `rgba(7,7,15,0.92)` + `backdrop-filter: blur(10px)`, covers full viewport
- **Panel:** `max-width: 620px`, centered, `margin-top: 96px`
- **Input:** 15px font, `border: 1px solid rgba(99,102,241,0.40)`, `border-radius: 12px`, focus ring `rgba(99,102,241,0.12)`
- **Results panel:** grouped by Contacts / Deals / Pages, each group has uppercase eyebrow label
- **First result:** highlighted with `background: rgba(99,102,241,0.10)`
- **ESC:** closes overlay (both keyboard and bottom-right hint)
- **Recent searches:** pill chips at bottom

### `CommandPalette`
- **Trigger:** `⌘K` (or `Ctrl+K`) anywhere, or click ⌘K badge in search bar
- **Width:** 560px, centered at `padding-top: 100px`
- **Background:** `rgba(11,11,24,0.98)` + brand glow shadow
- **Groups:** Navigate / Create / Recent
- **Keyboard nav:** ↑↓ to move selection, ↵ to navigate, ESC to close
- **Hover → `onMouseEnter`** updates selection index
- **Footer:** mono hints `↑↓ navigate · ↵ select · ESC close`

### `ConfirmModal`
- **Trigger:** `openConfirm({ title, body, confirmLabel, danger, onConfirm })`
- **Hook:** `const { confirmNode, openConfirm } = useConfirm()` — render `{confirmNode}` in page return
- **Backdrop:** `rgba(0,0,0,0.72)` + `blur(8px)`
- **Card:** 400px wide, `rgba(13,13,26,0.97)`, 16px radius, `blur(24px)`
- **Danger variant:** red icon tile, red filled confirm button (`#dc2626` → `#b91c1c` on hover)
- **Confirm variant:** indigo icon tile, brand-500 filled button
- **ESC:** closes without confirming

### `NotifDropdown`
- **Width:** 320px (`w-80`), anchored to bell icon (top-right of topbar)
- **Background:** `rgba(13,13,26,0.97)` + `blur(24px)`
- **Tabs:** All / Unread — active tab has indigo underline glow
- **Unread badge:** brand-500 filled pill on Unread tab
- **Unread dot:** 6×6px brand-400 dot on left of unread rows
- **Empty state:** bell icon + "All caught up" text
- **Mark all read:** brand-300 text button top-right

---

## Skeleton Loaders

All data-loading pages show a shimmer skeleton for ~1 second before real content.

```css
/* Shimmer keyframe (inject once globally) */
@keyframes nrturShimmer {
  0%   { background-position: -200% 0; }
  100% { background-position:  200% 0; }
}
.skel {
  background: linear-gradient(90deg,
    rgba(255,255,255,0.04) 0%,
    rgba(255,255,255,0.09) 40%,
    rgba(255,255,255,0.04) 80%);
  background-size: 200% 100%;
  animation: nrturShimmer 1.7s ease-in-out infinite;
}
```

| Page | Delay | Skeleton content |
|---|---|---|
| Dashboard | 1100ms | 4 KPI cards + activity rows + contact list |
| Contacts | 900ms | 8 table rows (avatar + name lines + badges) |
| Pipeline | 1000ms | 4 metric cards + 5 kanban columns with cards |

---

## Design Tokens

Full token file: `design-tokens.css`. Key values:

### Surfaces (backgrounds)
```
--surface-950: #07070f   /* page bg */
--surface-925: #09091a   /* sidebar, section bg */
--surface-900: #0b0b18   /* window chrome */
--surface-850: #0d0d1a   /* deeper cards */
```

### Brand (indigo → violet)
```
--brand-400: #818cf8   /* hover text, accent */
--brand-500: #6366f1   /* primary buttons, active states */
--brand-600: #4f46e5   /* pressed */
--violet-500: #8b5cf6  /* secondary accent */
--violet-600: #7c3aed  /* gradient end */
```

### Semantic
```
--success:    #34d399   (emerald-400) bg: rgba(16,185,129,0.10)
--warning:    #fbbf24   (amber-400)   bg: rgba(245,158,11,0.10)
--danger:     #f87171   (red-400)     bg: rgba(239,68,68,0.10)
--info:       #60a5fa   (blue-400)    bg: rgba(59,130,246,0.10)
```

### Foreground (white at varying alpha)
```
--fg-1: rgba(255,255,255,1.00)   /* headings */
--fg-2: rgba(255,255,255,0.80)   /* secondary */
--fg-3: rgba(255,255,255,0.60)
--fg-4: rgba(255,255,255,0.50)   /* default body */
--fg-5: rgba(255,255,255,0.40)   /* muted */
--fg-6: rgba(255,255,255,0.30)   /* very muted */
--fg-7: rgba(255,255,255,0.25)
--fg-8: rgba(255,255,255,0.15)
```

### Borders
```
--border-1: rgba(255,255,255,0.10)
--border-2: rgba(255,255,255,0.08)
--border-3: rgba(255,255,255,0.06)   /* card border */
--border-4: rgba(255,255,255,0.05)
--border-brand: rgba(99,102,241,0.30)
```

### Glass fills (card backgrounds)
```
--glass-1: rgba(255,255,255,0.03)   /* default card */
--glass-2: rgba(255,255,255,0.04)   /* hover */
--glass-3: rgba(255,255,255,0.06)   /* pressed */
--glass-brand: rgba(99,102,241,0.10)
--glass-brand-strong: rgba(99,102,241,0.15)
```

### Shadows / glows
```
--shadow-brand:    0 0 0 1px rgba(99,102,241,0.30), 0 4px 60px rgba(99,102,241,0.15)
--shadow-brand-lg: 0 0 0 1px rgba(99,102,241,0.40), 0 8px 80px rgba(99,102,241,0.25)
--shadow-card:     0 0 0 1px rgba(255,255,255,0.06), 0 4px 24px rgba(0,0,0,0.40)
--shadow-window:   0 0 0 1px rgba(255,255,255,0.07), 0 32px 120px rgba(0,0,0,0.70)
```

### Radii
```
--radius-sm:  8px   /* logo mark */
--radius-md:  10px
--radius-lg:  12px  /* buttons */
--radius-xl:  14px
--radius-2xl: 16px  /* cards */
--radius-3xl: 24px  /* hero / window chrome */
--radius-full: 9999px
```

### Spacing scale
```
4 / 8 / 12 / 16 / 20 / 24 / 28 / 32 / 40 / 48 / 64 / 80 / 112px
```

---

## Typography

**Font family:** `Inter` (Google Fonts, weights 300–900)
**Mono fallback:** `ui-monospace, SFMono-Regular, Menlo, Consolas`
**Anti-aliasing:** `-webkit-font-smoothing: antialiased`

| Name | Size | Weight | Tracking | Usage |
|---|---|---|---|---|
| display-1 | 82px | 900 | -0.02em | Hero headline |
| h1 | 48px | 900 | -0.02em | Section heading |
| h2 | 32px | 800 | -0.01em | Card section heading |
| h3 | 20px | 700 | -0.005em | Card title |
| h4 | 16px | 600 | — | Sub-heading |
| body-lg | 18px | 400 | — | Lead paragraph |
| body | 14px | 400 | — | Default UI text |
| small | 12px | 400 | — | Metadata |
| eyebrow | 12px | 600 | 0.18em | Section labels (uppercase) |

**Gradient text utilities:**
```css
.gradient-text {
  background: linear-gradient(90deg, #fff, #fff 60%, rgba(255,255,255,0.6));
  -webkit-background-clip: text; color: transparent;
}
.gradient-text-brand {
  background: linear-gradient(90deg, #818cf8, #a78bfa);
  -webkit-background-clip: text; color: transparent;
}
```

---

## Button Patterns

### Primary (brand)
```css
background: #6366f1;
color: #fff;
font-weight: 600;
padding: 12px 24px;
border-radius: 12px;
box-shadow: var(--shadow-brand);
transition: transform 200ms, background 200ms, box-shadow 200ms;
/* hover: bg #818cf8, shadow-brand-lg, translateY(-2px) */
/* active: translateY(0) */
```

### Secondary (ghost)
```css
background: rgba(255,255,255,0.05);
border: 1px solid rgba(255,255,255,0.10);
color: rgba(255,255,255,0.80);
font-weight: 500;
padding: 12px 24px;
border-radius: 12px;
/* hover: bg rgba(255,255,255,0.10), border rgba(255,255,255,0.20), color white */
```

### Danger (destructive)
```css
background: #dc2626;
color: #fff;
font-weight: 600;
border: none;
border-radius: 10px;
/* hover: background #b91c1c */
```

### Brand-ghost (for inline CTAs like "+ New deal")
```css
background: rgba(99,102,241,0.10);
border: 1px solid rgba(99,102,241,0.20);
color: #818cf8;
font-size: 11px;
font-weight: 500;
padding: 6px 12px;
border-radius: 10px;
```

---

## Card / Glass Pattern

All cards follow this base:
```css
background: rgba(255,255,255,0.03);
border: 1px solid rgba(255,255,255,0.06);
border-radius: 16px;          /* --radius-2xl */
backdrop-filter: blur(6px);
```

Hover variant adds: `border-color: rgba(255,255,255,0.10)`

Brand-accented card:
```css
background: rgba(99,102,241,0.10);
border: 1px solid rgba(99,102,241,0.20);
box-shadow: var(--shadow-brand);
```

---

## Status Badge / Chip Pattern

```jsx
// Contact status chips
Active:    bg-emerald-500/12 text-emerald-300 ring-1 ring-emerald-500/25
Hot:       bg-red-500/12 text-red-300 ring-1 ring-red-500/25
Warm:      bg-amber-500/12 text-amber-300 ring-1 ring-amber-500/25
New:       bg-blue-500/12 text-blue-300 ring-1 ring-blue-500/25
Qualified: bg-brand-500/12 text-brand-300 ring-1 ring-brand-500/25
Lead:      bg-white/[0.06] text-white/55 ring-1 ring-white/[0.08]
```

Each chip has a `1.5×1.5` colour dot on the left (same colour, `rounded-full`).

---

## Toast System

- **Position:** fixed, top-right, `z-index: 9999`, `gap: 10px`, `pointer-events: none`
- **Slide-in animation:** `translateX(20px) → 0` in 280ms
- **Auto-dismiss:** 4200ms
- **Structure:** `3px left border` (semantic colour) + frosted glass bg + icon chip + title + body + dismiss X

| Variant | Border & icon | Background |
|---|---|---|
| Success | `#34d399` | `rgba(16,185,129,0.12)` |
| Error | `#f87171` | `rgba(239,68,68,0.12)` |
| Warning | `#fbbf24` | `rgba(245,158,11,0.12)` |
| Info | `#818cf8` | `rgba(99,102,241,0.12)` |

---

## Toggle Switch

```css
/* Track */
width: 40px; height: 24px; border-radius: 9999px;
/* Off: */ background: rgba(255,255,255,0.08); ring: 1px rgba(255,255,255,0.08)
/* On:  */ background: #6366f1;
           box-shadow: 0 0 0 3px rgba(99,102,241,0.18), 0 0 20px rgba(99,102,241,0.35)

/* Thumb */
width: 20px; height: 20px; border-radius: 9999px; background: white;
transition: left 200ms; left: 2px (off) → 18px (on)
```

---

## Background Motifs

### Grid pattern (app pages)
```css
background-image:
  linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px),
  linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px);
background-size: 60px 60px;
```

### Noise overlay (landing page)
```css
position: fixed; inset: 0; pointer-events: none; z-index: 0;
opacity: 0.025;
background-image: url(fractalNoise SVG); background-size: 128px;
```

### Orb glows
```css
position: absolute; border-radius: 9999px; pointer-events: none;
filter: blur(120px–180px);
/* Primary: */  width: 600px; height: 600px; background: rgba(99,102,241,0.10–0.18)
/* Secondary: */ width: 480px; height: 480px; background: rgba(124,58,237,0.07–0.12)
```

---

## Page-specific Notes

### Dashboard
- Greeting: "Good morning, Alex 👋" (personalise with real user name)
- KPI cards use a 2×2 grid on mobile, 4-col on desktop
- Pipeline stage bar: horizontal progress bars by stage
- Activity feed: icon chips with uppercase eyebrow labels (EMAIL SENT, DEAL MOVED, etc.)

### Contacts
- Table columns: `1.8fr 1.4fr 110px 110px 90px 110px 36px`
- Sticky header with `backdrop-filter: blur(12px)` + `background: rgba(9,9,26,0.90)`
- Row hover: `background: rgba(255,255,255,0.025)`
- Contact detail: 35/65 grid split (left: profile panel, right: timeline)
- Delete button opens `ConfirmModal`, on confirm navigates back to `/contacts`

### Pipeline (Kanban)
- Column width: flex-equal, `min-width: 0`, no horizontal scroll
- Card hover: `translateY(-1px)` via `.deal-card` class
- Stage header has count + value pills
- Score dots: hot=red, warm=amber, cold=grey, won=emerald

### Automations
- Sub-nav tabs: Workflows / Sequences (shared `AutomationsSubNav` component)
- Automation cards have active/paused toggle (`Toggle` component)
- Builder: step canvas (left) + action palette (right, `sticky top-4`)
- Remove step button → `ConfirmModal`

### Settings
- Sub-nav: General / Team / Billing / Pipeline / Unsubscribes / Integrations / API
- All destructive actions (Remove member, Delete workspace, Delete stage) go through `ConfirmModal`
- Pipeline page: inline stage editing with range sliders for close probability
- Unsubscribes: type chips (bounce / manual / complaint / gdpr), re-subscribe via indigo confirm modal

---

## Interactions & Animations

| Pattern | Duration | Easing | Properties |
|---|---|---|---|
| Button hover lift | 200ms | ease | `translateY(-2px)`, box-shadow |
| Page fade-up | 400ms | ease-out | `opacity 0→1`, `translateY(8px→0)` |
| Toast slide-in | 280ms | ease | `translateX(20px→0)`, `opacity` |
| Glow pulse | 3s | ease-in-out | `opacity 0.5→1` (infinite) |
| Float (hero) | 6s | ease-in-out | `translateY(0 → -12px)` (infinite) |
| Sidebar active glow | instant | — | `box-shadow: 0 0 18px rgba(99,102,241,0.35)` |
| Toggle transition | 200ms | ease | `left`, `background` |
| Overlay open | ~60ms | — | `backdrop-filter` fade |

---

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `⌘K` / `Ctrl+K` | Open command palette |
| `ESC` | Close any overlay (search, command palette, confirm modal) |
| `↑` / `↓` | Navigate command palette results |
| `↵` | Select highlighted result in command palette |

---

## Icons
All icons are **inline SVG**, lucide-react style (24×24 viewBox, `stroke="currentColor"`, `fill="none"`, `strokeLinecap="round"`, `strokeLinejoin="round"`). Default stroke-width: 2. See `components/shared.jsx` → `const I = { ... }` for all icon paths.

**Recommended production approach:** install `lucide-react` and use the same icon names (they match 1:1).

---

## Assets

| File | Usage |
|---|---|
| `assets/nrtur-mark.svg` | 32×32 sidebar icon, auth pages, favicon |
| `assets/nrtur-logo.png` | Full wordmark (239×119), landing/onboarding headers |

---

## State Management Notes

| Scope | State |
|---|---|
| Global | `page` (current route), `searchOpen`, `cmdOpen` (overlay visibility) |
| Per-page | Filter tabs, sort, search query, modal open/close |
| Contacts | `CONTACTS_DATA` array (replace with API call) |
| Pipeline | `STAGES_DATA` with nested `deals` arrays (replace with API) |
| Automations | `AUTOMATIONS_DATA`, step list in builder |
| Settings/Team | Member list, invite modal open |
| Settings/Pipeline | Stage list (add/remove/reorder/rename) |

---

## Files in This Bundle

```
design_handoff_nrtur_crm/
├── README.md                         ← This file
├── design-tokens.css                 ← All CSS custom properties
├── Prototype v2.html                 ← Open in browser to see full prototype
├── assets/
│   ├── nrtur-mark.svg                ← App icon mark (32×32)
│   └── nrtur-logo.png                ← Full wordmark (239×119)
└── components/
    ├── shared.jsx                    ← Icons, sidebar, topbar, overlays, skeleton, toggles
    ├── app.jsx                       ← Router, global state, overlay rendering
    ├── pages-auth.jsx                ← Landing, SignUp, SignIn, Onboarding
    ├── pages-dashboard.jsx           ← Dashboard + skeleton
    ├── pages-contacts.jsx            ← Contacts list, detail, add, edit + skeleton
    ├── pages-pipeline.jsx            ← Kanban, deal detail, add deal + skeleton
    ├── pages-automations.jsx         ← Automations, builder, SMS sequences
    ├── pages-email.jsx               ← Email inbox + composer
    ├── pages-reports.jsx             ← Reports & analytics
    └── pages-settings.jsx           ← All settings tabs + profile
```

---

## Questions?
All design decisions are visible in the prototype JSX. If a value isn't documented here, inspect the corresponding component in `components/` — every px, hex, and easing is in the source.
