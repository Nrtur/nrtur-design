# Deal exit / closed-deal lifecycle (2026-07-08)

_How deals leave the active pipeline and where closed deals are viewed later. Design driven by a 7-agent web-verified study (Salesforce / HubSpot / Pipedrive / GoHighLevel / Zoho + the Jira/kanban "Done" pattern)._

## The problem
Won/Lost were **permanent columns** on the board (expanded by default, growing unbounded), there was **no dedicated way to review closed deals** (`DEAL_VIEWS_DEFAULT` shipped no Won/Lost/Closed view — you hand-built a Stage filter), and several terminal-detection paths used ad-hoc name regexes that disagreed with the shared `dealTerminalKind`/`dealClosedKind` authority.

## Research verdict (the shape adopted)
Two industry philosophies: **remove-from-board** (Pipedrive — Won/Lost are statuses, closing pulls the deal off the active pipeline; the purest "Jira Done" match) vs **permanent-columns** (HubSpot/Zoho/GHL/Salesforce-Won — closed deals sit in the last columns and you filter them off). Universal truths: **nothing auto-closes a stale deal** (every CRM flags/alerts; the human acts) and **closed deals are never deleted — just relocated to a findable place** (list/saved-view filters + reports). nrtur adopts the Pipedrive/Jira model: keep the working board on open work, make closed deals findable in dedicated views.

## What shipped
- **Won / Lost / Closed saved views** added to `DEAL_VIEWS_DEFAULT` (filter on `stageName is any of […]`, the same mechanism the app's own "Won" funnel nav uses). This is the "watch closed deals later, like Jira Done" answer.
- **Terminal columns collapse by default** on the *unfiltered* board (reuses the existing `closedOpen` collapse infra) — clean board focused on open work; the collapsed column still shows its value + a "Show N" expander. **When a filter/view is active** (`workFilter.conds.length>0`) the terminal columns **auto-expand**, so the Won/Lost/Closed views actually show their deals. User can override either way.
- **Terminal-detection fixes** — routed three ad-hoc checks through the shared authority: the drag handler `onMove` (was `/won|live/` — a stage named "live" was wrongly treated as Won) now uses `dealTerminalKind`; the KPI strip `_openBd/_wonBd/_lostBd` (was literal `stageKey==='won'`) now uses `dealClosedKind`/`dealIsOpen` so they agree with the board columns for custom-named pipelines; `dealRotInfo` (was `/won|lost|closed|live/` name regex) now uses `dealClosedKind(d) || dealTerminalKind(stage)` so a "Closed"-named stage can't rot and a closed deal never shows a stale badge.

## Stale handling — unchanged, and correct
nrtur already matches every CRM: rotting is a **flag** (per-stage `rotDays` → amber "Stale Nd" badge) plus an SLA "no activity" rule that fires a task/notification. **Nothing auto-moves or auto-closes** a stale deal — the human decides to mark it Lost or re-engage. No change needed (only the rotting terminal-check honesty fix above).

## Deferred (flagged, not done this pass)
- ~~**Multi-pipeline per-placement close (A4)**~~ — **RESOLVED 2026-07-08**, see [deal-multi-pipeline-close.md](deal-multi-pipeline-close.md). Closing a deal on a secondary/enrolled pipeline no longer stamps a global outcome; the outcome is captured only on the deal's primary board (seven sites gated, incl. the approval-grant TOCTOU an adversarial review surfaced) and the Forecast's booked-won row now agrees with the KPI.
- **True "recent-close" time-cutoff** — `outcome.closedAt` is stamped, but the demo's seed close dates are historical (May/June), so a strict N-day cutoff would empty the terminal columns on load. Collapse-by-default achieves the clean-board goal without it; the time-cutoff is a natural backend-era refinement.
- **Lost value in the forecast** — the forecast surfaces only "Closed won · booked"; lost value shows only in the Lost column / Win-Loss report. Low; left as-is.

## Verified (headless CDP)
Boots clean, zero runtime errors. Default board: 2 terminal columns collapsed, a won deal (Forge & Co) hidden. Applying the Won view: terminal columns auto-expand (0 collapsed), Forge + Bluewave visible, open deals (Meridian) hidden. Helpers: `dealClosedKind({outcome:{result:'won'}})==='won'`, `dealTerminalKind({name:'Won'})==='won'`, `dealTerminalKind({name:'live'})===null`. Uncommitted.
