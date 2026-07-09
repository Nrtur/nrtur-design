# Pipeline (`pipeline`)

## Purpose
Kanban board of deals across stages with a metrics strip and weighted forecast. Component: `PipelinePage`.

## Entry points
- Sidebar Pipeline; sidebar **+** → New deal; dashboard "Deals by Stage" → View; command palette.

## Components & state
- `PipelinePage` — `useSkeleton` load, `METRICS` strip (Pipeline / Won / Avg deal / Win rate), forecast pill, Filter + **New Deal** in topbar `rightSlot`.
- Columns from `STAGES_DATA` (each: key, name, color, count, value, deals[]). Sticky column header (dot, name, count, value). Deal cards show company, value, tag, score dot, age, owner.
- Stage helpers: `DEAL_STAGE_ORDER`, `DEAL_STAGE_COLOR`.

## Use cases
- See all open deals by stage; scan value/forecast.
- Open a deal; add a deal to a stage; filter the board.

## Step-by-step flows
**Browse:** open → 5 stage columns, horizontally scrollable; each card → `deal-detail`.
**Add:** New Deal (or column "Add deal") → `add-deal` (date/stage prefilled where wired).
**Metrics:** top strip + forecast pill summarize totals.

## Limitations
- **No real drag-to-move** between stages (cards are `cursor-grab` but DnD isn't implemented). Counts/values are static from `STAGES_DATA`. Filter is visual.

## Suggestions
1. Implement HTML5/pointer **drag-and-drop** to move cards between stages, updating stage + recomputing column totals/forecast (and logging the change).
2. Real filters (owner, value, tag, age) + saved board views.
3. Inline quick-edit on cards (value, close date, owner); rotting-deal indicators.
4. WIP limits / stage probabilities feeding the weighted forecast (tie to [settings-pipeline.md](settings-pipeline.md)).
5. Multiple pipelines (B2B/Agency) selectable, per onboarding template.

## Related
[deal-detail.md](deal-detail.md) · [add-deal.md](add-deal.md) · [settings-pipeline.md](settings-pipeline.md) · [reports.md](reports.md)