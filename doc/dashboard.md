# Dashboard (`dashboard`)

## Purpose
The home screen after login — a **customizable widget board** summarizing pipeline, activity, and follow-ups. Component: `DashboardPage`.

## Entry points
- Sidebar Dashboard; logo click; end of onboarding; command palette.

## Components & state
- `DashboardPage` with edit mode (`editMode`) toggled by **Customize**/Done.
- `WIDGET_DEFS` — registry of ~25 widgets (types: `stat`, `count`, `bars`, `donut`, `line`, `activity`, `contacts`, `leaderboard`, `goal`, `actions`, `empty`).
- `renderWidgetBody` (per-type body), `DashboardWidget` (edit chrome: drag handle / gear / ×, HTML5 drag reorder), `WidgetConfigPopover` (name, date range, filter, chart type, goal target), `WidgetLibraryPanel` (320px, searchable, grouped, Team widgets gated by role), `LayoutTemplatesModal` (role-based starter layouts), `DEFAULT_LAYOUT` (8 widgets), 3-col grid with 1×/2× spans.
- Sample data: `DASH_ACT` (recent activity), widget `d` payloads (e.g. needs-followup, new-this-week).

## Use cases
- See pipeline value, win rate, weighted forecast, deals-by-stage at a glance.
- Triage: "Needs follow-up", "New this week", recent activity.
- Customize the board: add/remove/reorder/resize/configure widgets; apply a role template; reset to default.

## Step-by-step flows
**View:** open → topbar greeting + KPI/stat widgets, Deals-by-Stage bars, Recent Activity, side widgets.
**Customize:** Customize → dashed edit chrome appears → drag to reorder, gear → `WidgetConfigPopover`, × removes → **Add widget** opens `WidgetLibraryPanel` → pick widgets → Done.
**Templates:** open `LayoutTemplatesModal` → choose a role layout → confirm → board replaced.

## Limitations
- Widget data is static (numbers don't reflect real records). Layout/config isn't persisted across reload. Drilldowns (clicking a stat) mostly don't navigate.

## Suggestions
1. Make widgets read **live derived data** from the same stores as Contacts/Pipeline/Inbox.
2. Persist per-user layout; per-role default layouts on first login.
3. Click-through: each KPI/row deep-links to the filtered source (e.g., "Needs follow-up" → Contacts smart view).
4. Date-range + owner filters that actually recompute widget bodies.
5. Add scheduled email digests of the dashboard.

## Related
[contacts.md](contacts.md) · [pipeline.md](pipeline.md) · [reports.md](reports.md)