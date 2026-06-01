# Nrtur Design System

> The CRM small teams actually want to use.

This design system captures the visual language, components, and content voice of **Nrtur** — a dark, premium, integration-first CRM aimed at small businesses (1–5 people). The product covers contact management, sales pipelines, email sync, automations, and reporting, and is positioned as the "honest, no-enterprise-upsell" alternative to HubSpot.

It exists so an AI design agent (or a human designer) can produce on-brand interfaces, marketing pages, slides, and prototypes without re-deriving the look from scratch every time.

---

## Sources

This system was derived from the following repositories:

| Source | URL | Used for |
|---|---|---|
| `cadetsikandar/nrtur_ui` | https://github.com/cadetsikandar/nrtur_ui | Landing page + dashboard mockup components (Hero, Features, Pricing, Comparison, Testimonials, FAQ, DashboardMockup, Showcase, Footer). Source of color tokens, type scale, motion, copy voice. |
| `cadetsikandar/nrtur-landing-page` | https://github.com/cadetsikandar/nrtur-landing-page | Sibling repo with the same tree — kept as a backup reference. |

Both repos use React + Vite + Tailwind + Framer Motion + lucide-react. **Browse them directly to verify any pixel-level decision** — this README captures intent and the most important tokens, but the source has the final word.

---

## Index

| Path | What's there |
|---|---|
| `README.md` | This file. Read first. |
| `SKILL.md` | Agent-skill descriptor (cross-compatible with Claude Code skills). |
| `colors_and_type.css` | All CSS custom properties: colors, type ramp, semantic tokens, shadows, radii, spacing, motion. **Import this into any new artifact.** |
| `assets/` | Logo mark (SVG), favicon. Use `assets/nrtur-mark.svg` for the "n" logo tile. |
| `src/` | Original imported source code from the repo. Treat as canonical reference for component implementations. |
| `preview/` | Static HTML cards rendered in the Design System tab. One concept per card. |
| `ui_kits/landing/` | High-fidelity recreation of the marketing landing page as composable JSX components + an `index.html` demo. |
| `ui_kits/app/` | High-fidelity recreation of the in-product CRM dashboard (pipeline view) as composable JSX components + an `index.html` demo. |

---

## Brand & Product Snapshot

- **Product:** Nrtur (lowercase "nrtur" in display contexts).
- **Tagline:** *"The CRM small teams actually want to use."*
- **Positioning:** affordable, fast-to-set-up CRM for teams of 1–5 — contact management, pipeline, email sync, automations, reporting. Direct foil to HubSpot's enterprise complexity.
- **Pricing anchor:** Starter $29/user/mo, Pro $59 (most popular), Business $99. 14-day free trial, no credit card.
- **Aesthetic family:** Linear / Vercel / Raycast. Dark glassmorphism, premium SaaS.

---

## Content Fundamentals

The voice is **confident, plain-spoken, slightly cheeky**. It positions Nrtur as the obvious upgrade from over-bloated enterprise tools. Copy reads like a respected peer talking, not a marketer pitching.

### Tone & casing

- **Lowercase brand.** The product is written `nrtur` in body and CTA contexts. Sentence-case everywhere else.
- **Headlines: sentence case with a hard period.** "Everything you need. Nothing you don't." "Honest pricing. No surprises." "Loved by teams who move fast."
- **Section labels (eyebrows):** ALL CAPS, wide tracking, indigo-400. e.g. `FEATURES`, `PRICING`, `WHY NRTUR`, `TESTIMONIALS`.
- **No exclamation marks** in marketing copy (except in user testimonial quotes). Confidence comes from the period, not the !

### Pronouns & POV

- **"You" addresses the reader** — second person dominates ("Everything *you* need", "Built for teams of 1–5 who move fast").
- **"We" only appears in customer quotes** ("We switched from HubSpot after two years…"). Marketing copy avoids the corporate "we".
- **The competitor (HubSpot) is named directly.** Comparison is a feature, not a slight: "The obvious upgrade from HubSpot." This is a brand pillar.

### Punctuation quirks

- **Em dashes** (` — `) used as casual asides: *"…without HubSpot's complexity or price tag — built for teams of 1–5 who move fast."*
- **"Just"** is allowed and frequent: *"Just pick a plan and start using it today."*
- **Two-sentence rhythm.** Most paragraphs are two crisp sentences. The first states the value, the second sharpens it.
- **Numerals over words** for any quantity: *"5 min"*, *"$29"*, *"2,400+ teams"*.

### Vocabulary cues — use

`obvious`, `honest`, `fast`, `actually`, `clean`, `simple`, `set it and forget it`, `month-to-month`, `no surprises`, `5 minutes`, `nothing slips through the cracks`, `pick a plan`, `move fast`.

### Vocabulary cues — avoid

`leverage`, `synergy`, `world-class`, `revolutionary`, `seamlessly`, `solution`, `unlock`, `empower`. Anything that smells like B2B SaaS boilerplate.

### Emoji

**Almost never.** The only emoji that appears in source is `🎉` once, inside a deal-status pill (`Won 🎉`) in the dashboard mockup. Treat that as a unique, in-product celebration — not a marketing motif. Marketing surfaces should never use emoji.

### Example specimens (verbatim from source)

- Hero: *"The CRM small teams actually want to use."* / *"Everything you need to manage contacts, close deals, and automate follow-ups — without HubSpot's complexity or price tag. Built for teams of 1–5 who move fast."*
- Pricing: *"Honest pricing. No surprises. Everything is month-to-month. No annual lock-in, no enterprise sales calls. Just pick a plan and start using it today."*
- Feature card body: *"A single source of truth for every contact. Enrich profiles, track interactions, and keep your team in sync — all in one clean view."*
- Trust badges: *"14-day free trial · No credit card required · Cancel anytime"*

---

## Visual Foundations

### Colors

- **Background is near-black, never pure black.** `#07070f` is the canonical page bg. Slightly elevated sections shift to `#09091a`; window chrome to `#0b0b18`. Pure `#000` is never used.
- **No light mode exists.** Don't author one. Foreground is white-with-alpha across 8 tiers (`--fg-1` solid → `--fg-8` 15%).
- **Brand is indigo-500 (`#6366f1`) → violet-600 (`#7c3aed`)**, applied as a gradient on the logo tile, on "gradient-text-brand" headlines, and as a soft glow behind hero artwork. Avoid using it as a flat fill in large areas.
- **Semantic colors** appear sparingly as `bg / text` pairs at low alpha: emerald for success, amber for warnings/follow-up, red for errors, blue for info/new, pink/teal as avatar accents.
- **Status pill pattern:** colored text + 10–15% alpha matching background + matching 20% border. Always rounded-full.

### Typography

- **Inter, everywhere.** Weights 300–900 loaded. There is no serif, no display alternate.
- The system loves **black weight (900) for display headlines** and tight tracking (`-0.02em` on hero, `-0.01em` on H2).
- Body text sits at **white/50** (`--fg-4`) by default — light, atmospheric, never pure white. Pure white is reserved for hard headlines and key numbers.
- Eyebrow labels: 12px, weight 600, indigo-400, ALL CAPS, **0.18em tracking** ("widest").

### Spacing

- **Sections breathe.** Vertical section padding is generally `py-28` (112px top + bottom).
- **8-pt scale** with frequent half-steps. The repo uses Tailwind, so common gaps: 4 / 6 / 8 / 12 / 16 / 20 / 24px. The CSS variables map these in `--space-1`…`--space-28`.
- **Container max width:** 1280px (`max-w-7xl`) for nav + hero + sections. Showcase is narrower (`max-w-6xl`). Comparison is narrowest (`max-w-5xl`).

### Backgrounds & motifs

- **Grid lines** — faint indigo grid (`60px × 60px`) on the hero. Animates with a slow `grid-pan` keyframe (8s loop, translates the gradient `0 → 80px`). Subtle, almost subliminal.
- **Glowing orbs** — large blurred circles in brand/violet at 8–20% opacity, positioned absolutely, `filter: blur(120px)`. Multiple per hero, fewer per section. Always behind content, never tinting it heavily.
- **Noise overlay** — a fixed, full-page SVG `feTurbulence` overlay at **2.5% opacity**. Adds film grain without being visible at a glance.
- **Radial fade** at the top of the hero (`radial-gradient(ellipse 80% 50% at 50% -10%, ...)`) to push the grid behind the headline.
- **Gradient fade-out** at the bottom of the hero to blend back into the page bg.

### Cards

- **Glass card:** `bg-white/[0.03]`, `border: 1px solid white/[0.06]`, `border-radius: 16px` (`rounded-2xl`), backdrop-blur. This is the workhorse.
- **Hover state:** border lifts to `white/10`, card translates `-1` to `-2px`, shadow swells to `--shadow-card-hi` (which adds an indigo `1px` outline + heavier outer shadow). 300ms ease.
- **Pricing "popular" card** breaks the glass pattern: it gets a brand-tinted gradient (`from-brand-500/10 to-transparent`), a brand-30% border, and the brand glow shadow.
- **Dashboard window:** outer shadow is `0 32px 120px rgba(0,0,0,0.7)` with a 7% white inset ring. Window chrome bar = `#0b0b18`, three macOS dots (red/yellow/green), centered URL pill (`app.nrtur.com`).

### Borders & shadows

- **Borders are almost always white-alpha**, not gray. The 8% / 6% / 4% tiers map to `--border-1/2/3/4`.
- **Two shadow families:** card shadows (black, blur 24–40px, with 1px white inset) and brand glows (indigo at 15–25%, blur 60–80px, with 1px brand inset). Never mix.
- No inner shadows. The aesthetic is **outer glow + crisp 1px ring**, not pressed.

### Corner radii

- Pills, dots, avatars: `9999px`.
- Buttons: `12px` (`rounded-xl`).
- Inputs, small chips, nav icons: `10–12px`.
- Cards: `16px` (`rounded-2xl`).
- Window/dashboard, hero glow halo: `24px` (`rounded-3xl`).

### Imagery & illustration

- The repo ships **zero photography** and **zero generic illustration**. Everything visual is either the logo tile, the dashboard mockup (HTML-rendered), or icon glyphs.
- Avatars in mockups are **solid-color circles with white initials** (blue / violet / emerald / amber / pink / teal). Do not introduce stock photos — the convention is "synthetic, content-rich UI as the hero image."
- If a real photo is ever required, treat it with cool tones, slight desaturation, and a heavy indigo color cast in shadows. But really: prefer UI screenshots over photos.

### Layout rules

- **Fixed navbar** at top, transparent on hero, then switches to `bg-[#07070f]/90` + `backdrop-blur-xl` + 6% bottom border once scrolled past 24px.
- **Hero is always centered**, max-w-7xl, then a centered dashboard mockup beneath that breaks the standard column by being `max-w-6xl`. The "headline → CTA → trust badges → mockup → stats bar → star rating" stack is the brand's signature first-fold.
- **Comparison and pricing sections use rigid grids** (`grid-cols-[1fr_160px_160px]`, `md:grid-cols-3`), not flex flow.

### Transparency & blur

- **Backdrop-blur is reserved for two surfaces:** the scrolled navbar (`backdrop-blur-xl`) and glass cards (`backdrop-blur-sm`). Don't apply it elsewhere.
- Solid-on-glass is the rule: text inside glass cards is full alpha at the top tier, then white-alpha for descending detail. Never glass-on-glass.

### Motion

- **Easing:** mostly `ease-out` (200–300ms) for hover and tab-switching; `ease-in-out` for the long ambient loops (float 6s, grid-pan 8s, glow-pulse 3s, marquee 30s).
- **Fade-up on scroll** is the primary entrance animation: `opacity 0 → 1`, `translateY(24–28px) → 0`, 600–700ms. Sequential children stagger in 100ms increments (`reveal-delay-1` through `reveal-delay-5`).
- **Float** (hero mockup): translates `0 → -12px → 0` over 6s, infinite, ease-in-out. Use sparingly — one floating element per screen, max.
- **Glow pulse** on the green "online" status dot and brand badge: opacity 0.5 → 1 → 0.5 over 3s.
- **Marquee** on the "trusted by" logo row: linear, 30s, pauses on hover.
- **Button hover:** translateY(-2px) + shadow swells from `--shadow-brand` to `--shadow-brand-lg`. Active state returns to translateY(0).
- **Press state:** subtle — same as active hover, no shrink/scale. No springy bounce.

### Iconography

See the full ICONOGRAPHY section below.

---

## Iconography

- **Icon library: [lucide-react](https://lucide.dev/) v0.400.** This is the canonical icon system. Every icon in the source comes from Lucide — no custom SVGs, no other icon libraries, no SVG sprite sheet, no icon font.
- **Stroke style:** Lucide's default — 24×24 viewBox, **2px stroke**, round caps, round joins, no fill. Don't mix stroke weights.
- **Sizes in use:** 8px (tiny inline chevrons), 10–13px (status pills, inline indicators), 14–16px (button + nav icons), 22px (feature-card icons), 18–20px (mobile menu toggle).
- **Color:** icons inherit `currentColor` and are tinted by the surrounding text color — `text-white/60`, `text-brand-400`, `text-emerald-400`, etc. The icon is never a different hue from its label.
- **Background "icon chip" pattern:** for feature cards, the icon sits in a 48×48 rounded-2xl tile filled with a low-alpha brand-or-semantic gradient (`from-brand-500/20 to-violet-500/20`). The icon itself is the matching solid color.

### Lucide icons known to be in use

`ArrowRight`, `Play`, `Star`, `CheckCircle2`, `Check`, `X`, `LayoutDashboard`, `Users`, `GitBranch`, `Mail`, `Zap`, `Settings`, `Search`, `Bell`, `ChevronDown`, `MoreHorizontal`, `TrendingUp`, `Shield`, `BarChart3`, `Globe`, `Clock`, `Layers`, `Quote`, `Menu`.

### Loading Lucide in HTML artifacts

Two good options:

```html
<!-- Option A: per-icon SVG from the Lucide CDN. Lightweight, no JS. -->
<img src="https://unpkg.com/lucide-static@latest/icons/users.svg"
     width="16" height="16"
     style="filter: invert(1) opacity(0.6)" alt="" />

<!-- Option B: full Lucide JS, then use data attributes. -->
<script src="https://unpkg.com/lucide@latest"></script>
<i data-lucide="users"></i>
<script>lucide.createIcons();</script>
```

For React/JSX artifacts, prefer importing from `lucide-react` directly (matches the source repo).

### Logo / brand mark

- The Nrtur mark is a rounded-corner **indigo→violet gradient tile (8px radius)** with a bold lowercase `n` centered inside. The gradient runs top-left → bottom-right: `#6366f1 → #7c3aed`. The "n" is Inter Black (900), white, slightly inset.
- Two display sizes in the source: **32px** (navbar/comparison header, `rounded-lg`) and **20px** (inline chips, `rounded-md`).
- See `assets/nrtur-mark.svg` for the canonical asset. Don't recreate it inline; reference the file or copy it into the artifact's folder.

### Emoji & unicode

- **No emoji in marketing.** A single `🎉` ships inside a "Won 🎉" deal-status pill in the dashboard mockup; treat as a one-off in-product affordance.
- **Unicode punctuation matters:** the brand uses true en dashes (`–`) for ranges (`teams of 1–5`) and em dashes (` — `) for asides. Hyphens are reserved for hyphenated words.

---

## Font substitutions / open questions

- **Inter is loaded from Google Fonts**, not bundled. If an artifact needs offline support, download Inter as a VF (`Inter-VariableFont_slnt,wght.woff2`) and drop it into `fonts/`. The `colors_and_type.css` `@import` line can then be replaced with an inline `@font-face`. **No substitution flagged** — Inter is the canonical face.
- **No icon font bundled.** Lucide is CDN-only. If the artifact needs to ship offline, copy individual Lucide SVGs into `assets/icons/`.

---

## How to use this system

For a new HTML artifact (prototype, slide, mock):

1. Add `<link rel="stylesheet" href="colors_and_type.css">` (or copy the file alongside).
2. Set `<body>` to `background: var(--surface-950); color: var(--fg-1); font-family: var(--font-sans);` — or just rely on the defaults the CSS already applies.
3. Drop the `<div class="noise-overlay"></div>` once at the root for the grain.
4. Build content with `.glass-card`, `.btn-primary`, `.btn-secondary`, `.eyebrow`, `.gradient-text`, `.gradient-text-brand`. Headings can use `h1` `.h1` etc. directly.
5. For icons, reach for **Lucide** first (CDN snippet above). Don't draw SVGs by hand.
6. For motion, add `.fade-up`, `.float`, `.glow-pulse` classes. Stagger with `animation-delay`.
7. When you need a fuller component (sidebar, kanban card, pricing tile), open the matching file in `ui_kits/` and copy from there.

---

## Caveats

- **The two source repos (`nrtur_ui` and `nrtur-landing-page`) ship identical trees** at the commit imported. If they diverge in the future, this system reflects `nrtur_ui` as of the imported commit.
- **No real photography / illustration assets shipped with the source.** If a future surface needs hero imagery, treat it as an open design question — the canonical solution is a rendered product UI, not a photo.
- **Pipeline tab content in `Showcase.tsx` is a placeholder string** (`"Full pipeline view — drag & drop deals across stages"`). The `DashboardMockup` is the real, fully-built pipeline view.
