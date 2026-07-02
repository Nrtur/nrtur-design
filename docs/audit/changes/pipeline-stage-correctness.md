# Pipeline & Stage Correctness (Wave 1)
_Priority: Critical/High · Status: fixed & render-verified · 2026-07-01_

This is the first wave of fixes. It makes the deal pipeline's **stages** consistent everywhere and stops throwing away the **Won/Lost reason**. No data model was restructured yet — that's later waves.

## How it was (the problems)
1. **The app had ~9 different, disagreeing lists of "the deal stages."** The board seed said Prospecting → Qualified → Proposal → Negotiation → Won → Lost. But the deal **detail page** used a list that *left out Lost*, and the detail **Stage dropdown** used a list that *left out Prospecting*. So:
   - A deal that was actually in **Prospecting** displayed as **"Qualified"** on its detail page (the code literally fell back to "Qualified" for any stage it didn't recognise — `index.html:7990`).
   - You **could not move a deal to "Lost"** from parts of the detail page, and you could not pick **Prospecting** from the Stage dropdown at all.
2. **New deals defaulted to "Qualified."** Quick-add and the spreadsheet importer both created a new deal already sitting in *Qualified* instead of the true first stage, *Prospecting* (`index.html:2325`, `:2332`).
3. **The Won/Lost reason was collected, then thrown away.** When you dragged a deal into Won or Lost, a dialog asked *why* — but the answer was only used to build the little toast message and was **never saved on the deal** (`index.html:7927`). So "why are we losing deals?" could never be reported.

## How it is now (the fix)
- **One canonical stage vocabulary**, derived once from the pipeline seed (`STAGES_DATA`) and read everywhere (`index.html:7969`):
  - `DEAL_STAGES_ALL` — the full set incl. **Lost** — used by every stage **dropdown/filter/import**.
  - `DEAL_STAGE_ORDER` — the happy-path ladder **Prospecting → … → Won** (Lost is a terminal off-ramp, not a middle rung), used by the progress ladder and the "Move to next stage" button. Its value is unchanged, so that UI looks the same.
  - `DEAL_STAGE_COLOR` and `DEAL_STAGE_KEY_BY_NAME` are also derived from the same seed, so a stage's colour and its internal key can never drift apart.
- **The detail page now shows a deal's real stage.** A Prospecting deal reads "Prospecting" (verified live). The Stage dropdown now includes **Prospecting and Lost**, so every stage is reachable.
- **New deals start in Prospecting** (verified live for both quick-add and spreadsheet paths).
- **The Won/Lost reason + optional note are now saved on the deal** as `deal.outcome = {result, reason, note, closedAt, closedBy}`, and the reason is shown on the deal's detail page. This makes win/loss reporting possible.

## Why this is better
- The same deal now says the same stage on every screen — no more "Prospecting shows as Qualified."
- Salespeople can set any stage (including Lost) and see honest data.
- New deals enter at the true start of the pipeline, so the funnel and forecast are accurate.
- Loss reasons are captured for good, unlocking win/loss analysis later.

## What you still need to decide
- Nothing blocks this wave. Two **related consistency items were intentionally deferred** to keep this change small and safe — see below.

## Verified
- Babel parse of the whole file: clean (no syntax errors).
- Headless render (precompiled, real browser): app mounts with **zero console errors**; Pipeline board and Deal detail render; a prospecting deal shows "Prospecting"; new deals default to "Prospecting".
- Diff: 15 insertions / 11 deletions in `index.html` — surgical.

## Deferred to a follow-up (still divergent, lower severity)
Two stage lists in *other* modules were **not** touched in this wave and still differ from the canonical set. They don't cause the visible deal bugs above, but they should be unified next:
- `PROP_STAGES` (`index.html:14000`) — the property-builder's default deal-stage options (omits Prospecting).
- `SCHED_DEAL_STAGES` (`index.html:18553`) — the scheduling-automation stage dropdown (omits Won/Lost; different shape).
Also: the **detail ladder and Stage-pill paths** to Won/Lost don't yet capture a reason (only the **board-drag** path does). Capturing a reason on those paths is a small follow-up.

## Related decisions
See [../_ARCHITECTURE.md](../_ARCHITECTURE.md) → "Design decisions from owner Q&A" (D1–D4) and the key-decision on a single canonical stage list.
