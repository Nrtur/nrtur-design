# Phase 2 proposal — dark white-alpha elevation system

**Status: PROPOSAL ONLY — nothing implemented.** Owner decides.
Data: full census of 2,100 `bg-white/[α]` usages + 331 role-classified samples across all 8 levels (10-agent pass, 2026-07-16), plus contrast math over the post-ramp surfaces (`s950 #07070f / s900 #11111e / s850 #191921`).

## 1. What the 8 alpha levels actually do (measured roles)

The 8 levels serve **6 distinct roles**, not 8 elevations — and the roles are smeared across neighbouring levels rather than mapped one-to-one:

| role | where it lives today | evidence |
|---|---|---|
| **Passive surface** (bordered card / panel / inset / KPI tile) | 0.02, 0.03, 0.035 (+ strays 0.015/0.018/0.025) | 0.03 = canonical card (16/26 samples); 0.02 = same recipe one nesting deeper; "card vs inset" distinguishable only by DOM depth |
| **Record-card / active-card variant** | 0.035 (active) paired with 0.02 (muted/off) | kanban deal/lead cards; automation cards muted→0.02 |
| **Control resting + form fields** | 0.04 (dominant: 25/44 controls, 14/44 fields), drifting into 0.05 | the 647× `/[0.04]` is ~57% secondary buttons/toggles, ~32% inputs — **not** cards, **not** dividers |
| **Chip / badge / icon-tile / track** | 0.05–0.08 (badge 0.06 canonical, tracks 0.06/0.08) | count pills, disabled-CTA bg (0.06 = `cursor-not-allowed` idiom), progress tracks |
| **Hover state** | 0.05/0.06/0.07/0.08 as `hover:` (451 usages) | +0.03 raise for filled surfaces (85% consistent: 0.04→0.07 ×165, 0.05→0.08 ×30, 0.03→0.06 ×18); ghost rows split arbitrarily between 0.05 (×106) and 0.06 (×92) |
| **Pressed / open / selected** | 0.08 | menu-open buttons, active segmented tabs |

**Two myths killed by measurement:**
- *"0.04 is used for dividers interchangeably"* — false. Only 40 hairline elements (1.9% of bg usages) use bg-white fills at all, none at 0.04; the divider load is the separate 2,076-usage `border-white/[α]` family. No CSS aliases entangle them.
- *"The scale is invisible"* — half-fixed already. The Task-1 base ramp made **cross-base** contrast real (a 0.04 wash lifts Δ4.5 L\* on a panel or card). What remains invisible is **within-base neighbour discrimination**: adjacent alphas differ by ~1.0–1.1 L\* on the same base (0.04 control next to 0.05 chip = indistinguishable), and one class can mean "resting" here and "hover" there.

**Corroborating fact:** the light theme *already* collapses these 8 dark levels into **3 buckets** (`0.01–0.035→#ffffff`, `0.04–0.05→#eef1f6`, `0.06–0.10→#e4e9f1`) — the design itself admits at most 3 visually distinct intents per base.

## 2. Proposed semantic elevation tokens

Six tokens, spaced ≥0.03 alpha apart so same-base neighbours differ by ≥3 L\*:

| token | value | absorbs (usage count) |
|---|---|---|
| `--el-surface` | rgba(255,255,255,0.03) | bare 0.015/0.018/0.02/0.025/0.03/0.035 (≈506) |
| `--el-control` | rgba(255,255,255,0.06) | bare 0.04/0.045/0.05 (≈759) — controls & fields finally sit visibly above their card |
| `--el-chip` | rgba(255,255,255,0.08) | badges/pills/tracks now at 0.05–0.08 (≈195) |
| `--el-hover` | resting **+0.04** | filled-surface hovers (0.06/0.07/0.08 `hover:` ≈327) — keeps the existing "+Δ" convention, widened to visible |
| `--el-ghost-hover` | rgba(255,255,255,0.07) | transparent-resting row/menu hovers (0.05/0.06 `hover:` split, ≈198) — one value, ends the arbitrary split |
| `--el-active` | rgba(255,255,255,0.12) | pressed/open/selected (0.08 today, ≈47) — for the first time distinct from hover |

Kept as-is deliberately: the disabled-CTA idiom (`bg-white/[0.06] + text-white/30 + cursor-not-allowed`) — its *pairing* is the affordance; and the `border-white` hairline family (separate system, out of scope).

## 3. Migration paths & blast radius

**Stage 1 — CSS value remap (recommended; same technique as the font/radius passes):**
~14 rules of the form `.app-shell .bg-white\/\[0\.04\]{background-color:rgba(255,255,255,0.06)}` (+ hover variants). No JSX, no class renames, reversible by deleting the rules. Light theme is untouched — its `[data-theme="light"]` overrides carry `!important` and higher specificity, so they keep winning. Blast radius: every remap shifts *all* usages of that class together; because role-per-class is ~85–95% pure at the extremes but mixed in the middle (0.05 is both "control drift" and "menu-item hover"), expect a handful of spots (measured ≤15%) that land one notch brighter than ideal — cosmetic, not breaking. Effort: S (an afternoon incl. headless verification).

**Stage 2 — semantic class migration in JSX (NOT recommended for the prototype):**
Replacing ~2,100 class occurrences with token classes fixes the 15% mixed cases and gives devs named intent, but it's a JSX-wide mechanical rewrite that risks the Babel-parseable constraint and invalidates the light-block selectors keyed on these class names (they'd all need matching renames — the exact failure mode the light system was built to avoid). If wanted, do it in the real product build, not here.

**Decision needed from owner:** approve Stage 1 (CSS-only respacing) / defer entirely / or cherry-pick only the two highest-value rules (ghost-hover unification and control-vs-surface separation).
