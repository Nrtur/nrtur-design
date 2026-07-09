# Reports (`reports`)

## Purpose
Analytics dashboard: revenue, deal counts, win rate, cycle time, plus charts (revenue/forecast bars, calls breakdown, etc.). Component: `ReportsPage`.

## Entry points
- Sidebar Reports; dashboard "Reports" widget; command palette.

## Components & state
- `ReportsPage` — `range` + `rangeOpen` date-range dropdown (`RANGES`: 7/30/90 days, quarter, YTD), `showExportToast`.
- `KPIS` (Revenue Won, Total Deals, Win Rate, Avg Deal Cycle — each with value/delta/sub). Revenue bar chart (`REV`, hover tooltips), a Calls section (made/received/missed/avg + per-day bars), and other breakdowns.

## Use cases
- Track revenue and pipeline health over a chosen period.
- Compare to prior period (deltas); review call activity; export.

## Step-by-step flows
**Filter:** pick a range from the dropdown → KPIs/charts reflect it (visually).
**Explore:** hover bars for tooltips.
**Export:** Export → toast (CSV stub).

## Limitations
- All numbers/charts are hardcoded; the range selector doesn't recompute from real data. Export is a stub. No drilldowns.

## Suggestions
1. Compute KPIs/charts from the live deal/contact/activity stores; real range filtering + comparisons.
2. Drilldown from any KPI/bar to the filtered records.
3. Custom report builder (pick metric, dimension, chart) + saved reports.
4. Scheduled email reports; CSV/PDF export; team leaderboards by owner.
5. Forecasting using stage probabilities (tie to [settings-pipeline.md](settings-pipeline.md)).

## Related
[dashboard.md](dashboard.md) · [pipeline.md](pipeline.md)