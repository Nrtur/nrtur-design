---
name: nrtur-design
description: Use this skill to generate well-branded interfaces and assets for Nrtur, an integration-first CRM for small businesses (1–5 people). Use it for production code, throwaway prototypes, mocks, slides, landing pages, in-app surfaces, anything Nrtur-flavored. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

# Nrtur design skill

Read the `README.md` file within this skill — it is the most important file. It documents:

- **Sources** the system was derived from (GitHub repos with the original React + Tailwind + Framer Motion implementation).
- **Content fundamentals** — voice, casing, punctuation quirks, vocab to use and avoid.
- **Visual foundations** — colors, type, spacing, motifs (grid + orbs + noise), cards, shadows, motion.
- **Iconography** — Lucide stroke icons, the indigo→violet logo mark, emoji policy.
- **Index** — what each other file is for.

Then explore the other available files:

- `colors_and_type.css` — CSS variables for every token. **Drop this into any new artifact.** Defines `--brand-500`, `--fg-1…8`, `--surface-950`, `.btn-primary`, `.glass-card`, `.eyebrow`, `.gradient-text-brand`, animation utilities, etc.
- `assets/` — the logo mark (`nrtur-mark.svg`). Always reference, don't redraw.
- `preview/` — small HTML cards demonstrating each token / component in isolation. Useful as visual reference when you need to remember what a status pill looks like, what the corner-radii scale is, etc.
- `ui_kits/landing/` — composable JSX for the marketing landing page (Navbar, Hero, FeatureGrid, ComparisonTable, PricingTable, Testimonials, FinalCTA, Footer + a `DashboardMockup`). Demo at `ui_kits/landing/index.html`.
- `ui_kits/app/` — composable JSX for the in-product CRM web app (Sidebar, Topbar, Dashboard, Pipeline kanban, Contacts table, Inbox, Automations, Analytics views + shared fixture data). Demo at `ui_kits/app/index.html`.
- `src/` — the original imported source code (React + TypeScript + Tailwind). Canonical reference if anything in this skill is ambiguous.

## How to use

If creating **visual artifacts** (slides, mocks, throwaway prototypes, marketing pages, hero shots):

- Copy `colors_and_type.css` and `assets/nrtur-mark.svg` into the artifact's folder.
- Reach for `ui_kits/landing/` or `ui_kits/app/` components first — copy whichever you need and trim.
- Use Lucide icons via CDN (see Iconography section of README) — do not hand-draw SVGs.
- The visual signature: near-black background (`#07070f`), indigo→violet brand gradient, glass cards (`bg white/3 + border white/6 + radius 16`), Inter all weights, subtle grid + orbs + noise behind hero sections.

If working on **production code**:

- Open `src/` to see the real implementations — Tailwind classes, Framer Motion animations, IntersectionObserver-based reveal hook, `tailwind.config.js` with brand color stops.
- Treat the kit files as a reference; production should use the Tailwind classes and `index.css` patterns from the source.

If the user invokes this skill **without other guidance**:

- Ask them what they want to build or design (slide deck? landing variant? new in-app view? prototype of a new feature?).
- Ask any clarifying questions about scope, audience, and whether they want pixel-faithful work or want to push the brand somewhere new.
- Then act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

## Things to never do

- Don't add light-mode styles. Nrtur is dark-only.
- Don't introduce a new icon library. Use Lucide or copy SVGs from `assets/`.
- Don't use emoji in marketing copy. Only `🎉` exists, and only in an in-product "Won 🎉" pill.
- Don't write the brand name as "Nrtur" or "NRTUR" in display/CTA contexts — it's lowercase `nrtur`.
- Don't soften the HubSpot comparison. The brand pillar is *"The obvious upgrade from HubSpot"* — name names.
