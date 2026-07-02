# Re-audit R8 — four edge-case defects from the final confirmation sweep

_Priority: 2 Medium · 2 Low · Status: fixed & render-verified · 2026-07-02_

The final confirmation re-audit verified the three new High fixes (convert company-dedupe, close-from-detail outcome, tasks/meetings id-links) and R6/R7 all **HOLD with no regressions in their main paths** — but a completeness sweep surfaced **four edge-case defects**, three of them incompleteness in the recent fixes plus one pre-existing CSV bug. All four are fixed here.

## 1 · Medium — clearing a task's linked record left a **stale id** (the id-join kept it attached)
**Problem.** `calLinkIds` returned only the *matched* key (e.g. `{contactId}`) and `{}` when the name was empty/unknown. Because `calUpdateItem` shallow-merges, saving a task after **clearing** its "Related to" link wrote no `contactId` key, so the **old** `contactId` survived and the id-first `RecordTasks` join kept showing the task under the original record.
**Fix.** `calLinkIds` now **always** returns all three keys (`{contactId, leadId, companyId}`, `null` when unset). Clearing or re-linking now overwrites the stale id. Verified: `calLinkIds('contact','')` → `{contactId:null, leadId:null, companyId:null}`.

## 2 · Medium — CSV import coerced a valid **`Prospecting` → `Qualified`**
**Problem.** `importBuildRecord` (deal branch) whitelisted `['Qualified','Proposal','Negotiation','Won','Lost']` and defaulted to `'Qualified'`, silently dropping the canonical first stage on the CSV path (the drawer + sheet builders were already correct — this was the one R6 missed).
**Fix.** Whitelist now leads with `Prospecting` and the fallback defaults to `prospecting`. Verified: importing a deal with stage `Prospecting` (or blank) → `stageKey:'prospecting'`.

## 3 · Low — bulk Convert could **double-mint the same new company** within one batch
**Problem.** `buildConvertRecords` dedupes against the `_liveCompanies` render snapshot, which isn't updated mid-loop; converting two leads from the **same not-yet-existing** company in one bulk action minted **two** duplicates, splitting the two contacts/deals across them.
**Fix.** `doBulkConvert` now tracks newly-minted company names in a local map and reuses the first mint's id (rewriting `contact.companyId`/`deal.companyId`/`convertedToCompanyId`) for later same-named leads in the batch. Verified: two leads → **1** company, both link to it.

## 4 · Low — the deal-detail **stage-ladder dot** closed Won/Lost with no reason
**Problem.** The close-from-detail fix routed three paths (dropdown, "Move to" button, edit-save) through `DealOutcomeModal`, but a **fourth** path — clicking the Won/Lost **dot in the stage ladder** — still used a plain confirm that wrote only `stageKey`, no `outcome`. (Pre-existing, but now inconsistent with the routed paths.)
**Fix.** The ladder-dot Won/Lost branch now calls `commitStage(s)` → opens `DealOutcomeModal` like the other three. Verified: clicking the "Won" dot opens the outcome modal.

## Verified (headless render, precompiled)
- Babel parse clean; app mounts with **zero console errors**.
- Fixes 1–3 pass via direct global-function tests (`calLinkIds`, `importBuildRecord`, a `buildConvertRecords` batch loop); Fix 4 verified end-to-end (ladder "Won" dot → outcome modal opens).

## Related
Found by `crm-final-confirmation-reaudit`. Completes the convert-dedupe (intra-batch), close-from-detail (4th path), and tasks-id (clear-link) fixes; #2 extends R6's Prospecting-default to the CSV import path.
