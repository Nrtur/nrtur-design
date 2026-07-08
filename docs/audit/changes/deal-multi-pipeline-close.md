# Multi-pipeline per-placement close (A4) (2026-07-08)

_Closing the deferred **A4** defect from the [deal-exit lifecycle](deal-exit-lifecycle.md) work: marking a deal Won/Lost on a **secondary (enrolled) pipeline** must not mark the whole deal closed._

## The problem
A deal can be enrolled in several pipelines at once via `stagePlacements` (one `primary:true` placement owns the deal-level truth — `stageKey`, `outcome`; the others track only their own position). The deal-level `outcome` is what `dealClosedKind`/`dealIsOpen` read, and it drives the KPI strip, the Won/Lost/Closed views, rotting, cross-page open-deal filters, and the win/loss report.

The board's terminal-close flow stamped a **global** deal-level `outcome` regardless of which pipeline you closed on. So dragging a deal into the Won/Lost column on a *secondary* board — or bulk-moving it there — marked the **entire deal** Won/Lost while its **primary placement was still open**. `dealClosedKind` then reported the deal closed everywhere, contradicting the primary board (which still showed it in an open column).

The deal **detail page already did this right** — its enrolled-view branch (`commitStage`, `if(!_viewIsPrimary){…}`) moves only the placement and never prompts for an outcome. The board simply hadn't been brought to parity.

## What shipped
The rule, applied everywhere: **a Won/Lost outcome is deal-level truth and is only captured on the deal's PRIMARY board.** An enrolled-pipeline terminal move just advances that placement (mirrors the detail page).

**Six board/detail modal sites** — each now opens the outcome modal only when `_isPrimaryOf(deal, active)` (this board is the deal's primary pipeline); an enrolled terminal move falls straight through to `applyMove` (placement-only, no reason prompt):
- board drag `onMove` (the real drag path) · `moveDeal` · list-inline `lvStage` · `StageGateModal` `onSave`
- bulk `onBulkStage` splits the selection into `_primMoves` (→ modal) and `_enrMoves` (→ `applyMove` immediately)
- `DealOutcomeModal` `onConfirm` — the **authoritative gate**: the deal-level `outcome` stamp + `promoteWonContact` + ad `reportConversion` are restricted to a `_primIds` set (primary placements only). `applyMove` had already advanced each placement correctly; this stops the global stamp.

**A seventh self-applying site — the approval grant** (surfaced by an adversarial review, confirmed real). Moving a deal to a terminal stage can require sign-off; granting the approval (`decideApproval`) re-applies the move and stamped a global outcome with no primary check. It was safe *only* because approvals are requested exclusively from primary moves — but nothing bound a request to the pipeline that was primary *at request time*. A user could request approval on primary A, switch the primary to B while it sat pending, then have the approver grant the stale request → global close while B is open (a TOCTOU of the exact A4 shape). Fix: the two `requestApproval` callers now stamp `pipelineId` (the primary at request time); `decideApproval` re-checks `dealPrimaryPipeId(deal) === ap.pipelineId` and, if the primary was switched, advances that pipeline's **placement only** — no global outcome, no contact promotion, no won/lost automations. Legacy approvals with no `pipelineId` keep the original deal-level path, so existing behavior is unchanged.

**Forecast ↔ KPI reconciliation** (also surfaced by the review). Once an enrolled close is placement-only, the Forecast's "Closed won · booked, not forecast" line disagreed with the KPI "Won" tile on a secondary board: the KPI classifies by `dealClosedKind` (deal-level), the Forecast row classified by the placement's stage (`_stageKeyHere`), so it booked an open deal's value as won revenue. `fc_wonRow` now scopes its deals to `dealClosedKind(d)==='won'` — "booked" means deal-level won, matching the KPI. No-op on a primary board (won-column deals carry a stamped outcome).

## Verified (headless CDP)
Boots clean, zero runtime errors after all edits. Invariants: `dealPrimaryPipeId` picks the primary placement; `_isPrimaryOf` is `true` on the primary board / `false` on a secondary board; a deal at a `won`-stage on its *enrolled* placement with no deal-level outcome → `dealClosedKind === null` (**open globally** — the core guarantee). The `decideApproval` gate was exercised on synthetic multi-placement deals: still-primary → global path (unchanged); primary-switched → placement-only, the demoted pipeline's placement advances to Won while the current primary placement and the deal-level `outcome` stay untouched (`dealClosedKind === null`).

## Reviewed
A 4-lens adversarial workflow (completeness / predicate-correctness / primary-path regression / enrolled display) + a verify pass. It confirmed the six modal sites are correctly gated, found the two extra real issues fixed above, and **verified as a false alarm** a "stale pipeline name" legacy-deal edge (needs a deal with no `stagePlacements` AND a `pipeline` string matching no real pipeline AND not the default name — not producible by current seed data).

## Left as-is (deliberate, low)
- **Terminal-column count badge vs KPI on a secondary board** — the column header count/`$` subtotal is intentionally board-local (it shows the cards actually in that column, including an enrolled placement-won), while the KPI "Won" is deal-level. These measure different things by design; forcing them to match would misreport the column's real contents.
- **Legacy stale-name false-negative** — the verified-false-alarm edge above; latent, pre-existing, not producible today.
- **`decideApproval` terminal test** still uses `/won|lost/i` rather than `dealTerminalKind` — orthogonal to A4; switching it risks changing custom-terminal-key detection, so left for a separate pass.
