# Landing (`landing`)

## Purpose
Public marketing homepage — pitches the product and routes visitors to sign up / sign in. Component: `LandingPage`. Renders outside `.app-shell` (always dark).

## Entry points
- Default page on load (`page` starts at `landing`).
- "nrtur" logo / back links on auth pages return here.

## Components & data
- `LandingPage({goTo})`; helper `GlowBg` (ambient background).
- Hardcoded arrays: `FEATURES` (Contact mgmt, Pipeline, Automations, Email sync, Reports, Team), `PRICING` (Starter free / Pro $59 / Business $149), `TESTIMONIALS`.

## Use cases
- Understand what Nrtur does (feature grid).
- Compare plans.
- Convert: "Start free trial" / "Get started" → `signup`; "Sign in" → `signin`.

## Step-by-step flow
1. Visitor lands → hero + nav (Sign in / Get started).
2. Scrolls features, pricing, testimonials.
3. Clicks a CTA → `goTo('signup')` (or `signin`).

## Limitations
- Purely static; no real pricing/checkout, no analytics, links only route within the prototype.

## Suggestions
1. Wire CTAs to plan selection so the chosen plan pre-fills signup/billing.
2. Add a live product screenshot/loop or interactive demo embed.
3. SEO/meta, OG tags, and a real marketing CMS for copy.
4. "Book a demo" path for the Business plan (calendar embed).
5. Cookie/consent + analytics (see overview: production).

## Related
[signup.md](signup.md) · [signin.md](signin.md) · [settings-billing.md](settings-billing.md)