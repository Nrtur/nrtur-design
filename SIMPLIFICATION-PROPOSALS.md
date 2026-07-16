# SIMPLIFICATION-PROPOSALS

**Proposals only — nothing here is implemented.** Owner decides. Census data from 2026-07-16 (post type/radius/glow passes).

## (a) Icon sizes: 19 distinct (8–34) → 4-step scale
Measured (`<I.* size={N}>`, 1,844 usages): 13×440, 14×298, 12×297, 11×257, 16×159, 15×106, 10×100, 9×69, 20×31, 18×24, 17×22, plus a tail (8, 19, 22–34).
**Proposed scale: 12 / 14 / 16 / 20.** Remap: 8–12→12 · 13–15→14 · 16–18→16 · 19+→20 (the lone 26/28/30/34 empty-state illustrations may stay 28 as a named exception). Requires JSX edits (size props), so it is out of Phase B's CSS-only scope by definition — S/M mechanical sweep when approved.

## (b) Pipeline deal-card signal budget
A stale card can show 5 colored signals at once: amber card wash + amber "Stale Nd" badge (L9351 region), colored action chip (emerald/blue), red/amber due indicator, colored avatar. **Proposal — one-accent hierarchy:** the card earns ONE accent (its most urgent signal, priority: overdue > stale > due-today > action chip), everything else renders neutral; the amber wash then only appears when staleness IS the top signal. This intersects the **open amber-wash decision** (logged as a product decision, not a layout flaw) — presented here, not decided.

## (c) glowPulse — 9 usages + 2 defs (keyframe L13 config, L28 CSS)
| line | element | recommendation |
|---|---|---|
| 3196 | topbar emerald "live" dot | **keep** — genuine liveness signal |
| 3574 | landing "Trusted by" brand dot | kill — decorative |
| 4026 | onboarding step eyebrow dot | kill — decorative |
| 4070 | onboarding "setting up" sparkle | keep — progress-in-flight cue |
| 4073 | onboarding checklist active dot | kill — the row highlight already marks it |
| 11672 | active-call avatar pulse | **keep** — call-in-progress state |
| 11825 | dialer avatar pulse | **keep** — same |
| 12169 | inbox "live sync" dot | **keep** — liveness signal |
| 12230 | inbox footer sync dot | kill — duplicates 12169 on the same page |
Net: keep 5 (all state/liveness), kill 4 (pure decoration). All are inline `style={{animation}}` props → JSX edits, out of CSS-only scope; S sweep when approved.

## (d) Metrics-bar accents
Pipeline `METRICS` (L9195–9200) uses **4 accents for 4 metrics** (brand, emerald, violet, amber) — color differentiates position, not meaning. **Proposal — minimal set of 2:** neutral icon tiles for Pipeline/Avg-deal/Win-rate, emerald reserved for Won (the only semantically positive metric); win-rate could earn emerald/red conditionally (≥50% / <50%) if a semantic accent is wanted. Same pattern generalizes to the dashboard stat tiles.
