# Settings · Pipeline (`settings-pipeline`)

## Purpose
Configure pipeline **stages**: name, color, win-probability, ordering; plus stage-related rules. Component: `SettingsPipelinePage` (in `SettingsShell`).

## Entry points
- Settings → Pipeline; onboarding step 2 (template choice, conceptually).

## Components & state
- `SettingsPipelinePage` — `useConfirm`; `stages` (`{id,name,color,deals,prob}` seeded Prospecting/Qualified/Proposal/…); `newStage` input; `addStage()` appends a stage. Per-stage edit/reorder/delete; pipeline preference toggles.

## Use cases
- Add/rename/recolor/reorder/delete stages; set win-probability per stage (drives weighted forecast); configure stage rules.

## Step-by-step flows
**Add:** type stage name → Add → appended to `stages`.
**Edit:** click a stage to rename/recolor/set probability; delete (confirm).
**Reorder:** drag to reorder (intended).

## Limitations
- Stage edits are local to this page and **not** reflected in the Pipeline board (`STAGES_DATA`) or `DEAL_STAGE_ORDER`. Reorder DnD may be visual. Single pipeline.

## Suggestions
1. Single source of truth for stages shared by the board, deal detail, reports, and forecast.
2. Probabilities feed the **weighted forecast**; automation hooks on stage enter/exit.
3. Multiple named pipelines (B2B/Agency) with per-pipeline stages (matches onboarding templates).
4. Required fields per stage; rotting thresholds; stage SLAs.

## Related
[pipeline.md](pipeline.md) · [deal-detail.md](deal-detail.md) · [reports.md](reports.md) · [onboarding.md](onboarding.md)