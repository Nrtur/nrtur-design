# Closing a deal from its detail page now records a Won/Lost reason

_Priority: High · Status: fixed & render-verified · 2026-07-02_

Marking a deal Won or Lost from the **deal detail page** now captures a reason and note (the same `DealOutcomeModal` the Kanban board uses) and persists it on `deal.outcome` — previously only board-drag did.

## How it was (the problem)
The board's drag-to-Won/Lost routed through `DealOutcomeModal` and saved `deal.outcome` (Wave 1). But the **detail page** had three ways to close a deal that all committed the stage **silently, with no reason**:
1. the **stage dropdown/pill** (`onDealField('dStage', …)`),
2. the **"Move to Won"** header button,
3. the **edit drawer** saving `dStage`.

A rep who closed a deal from its record lost the win/loss reason entirely — so win/loss reporting was only as complete as the reps who happened to close via the board.

## How it is now (the fix)
- Added `commitStage(stageName)` to `DealDetailPage`: for a terminal stage (Won/Lost) it opens `DealOutcomeModal` (via new `dealOutcome` state) instead of committing; for any other stage it commits directly as before.
- All three close paths now go through `commitStage` — dropdown/pill, the "Move to …" button, and the edit-drawer save (which applies its other fields first, then routes the stage).
- On confirm, the modal writes `stageKey` **and** `outcome:{result, reason, note, closedAt, closedBy}` — the exact shape the board produces — and toasts "Deal marked Won · <reason>".

## Why this is better
- Win/loss reason is captured **wherever** a deal is closed, so forecasting and win/loss analysis see every closed deal.
- One consistent close experience (same modal, same reasons) on the board and the record.

## What you still need to decide
- Reasons are still a hard-coded list per outcome (shared with the board). A user-editable **Reason lookup** entity remains a separate (Medium) backlog item.

## Verified (headless render, precompiled)
- Babel parse clean; app mounts with **zero console errors**.
- Navigated to a deal at **Negotiation**, fired **"Move to Won"** → the outcome modal opened; confirming with the default reason set `stageKey:'won'` **and** `outcome:{result:'won', reason:'Best fit / value', note:'', closedAt, closedBy:'Alex Morgan'}`, and the modal closed.
- `commitStage` routing reconstructed: Won/Lost defer to the modal; Proposal/Negotiation commit directly.

## Related
Extends Wave 1 (persist Won/Lost outcome) to the detail page; reuses `DealOutcomeModal`. The shared Reason-lookup entity is still open.
