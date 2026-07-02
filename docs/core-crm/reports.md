# Module 19 — Reports

_Component: `ReportsPage` (line 11723, comment block from 11687) · Route: `reports`_

**Central fact:** Reports is not a separate analytics implementation. It reuses the Dashboard's entire widget engine verbatim — `WIDGET_DEFS`, `WIDGET_META`, `DashboardWidget`, `WidgetConfigDrawer`, `DashChartViz`, `renderWidgetBody`, `WidgetLibraryPanel`, and every aggregation helper. The code says so directly (comment, lines 11687–11696):

> "Reports reach full parity with the dashboard by REUSING its widget engine... What's report-specific lives here: per-ROLE report presets (richer than the 3 dashboard archetypes) and the resolution precedence."

Read this doc alongside Module 3 (Dashboard) — most of "how a widget works" is documented there implicitly by virtue of being the same component.

---

## 19.1 Reports Page

### Surface inventory

| Element | What it is |
|---|---|
| App sidebar | Standard `AppSidebar active="reports"` — no page-level role gate; every role can open Reports |
| Widget grid | Responsive CSS grid (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`, `gridAutoFlow:'row dense'`); same `DashboardWidget` card component as Dashboard |
| Role preset | Auto-populated widget layout based on signed-in user's role (6 presets, see below) |
| Date range dropdown | `RANGES = ['Last 7 days','Last 30 days','Last 90 days','This quarter','Year to date']` — **cosmetic only, not wired to any widget's data** |
| Export CSV button | Gated by `effCanExport()`; click shows a "CSV downloaded" toast — **no file is actually generated** |
| Edit mode toggle | Same drag/resize/add/remove widget affordances as Dashboard edit mode |
| "Save as {role} report" | Admin-only; writes the current layout as the default for all users with that role |
| "Save workspace default" | Admin-only; writes the current layout as the fallback for every role |
| Widget card | Same `DashboardWidget` shell — chart/list/metric body, gear icon → `WidgetConfigDrawer`, drill-down on click |
| Whole-page empty state | When `vis.length===0 && !editMode`: `BarChart` icon, "Your report is empty", "Add report widgets to build a view that works for you.", "Add widget" CTA |
| Per-widget empty state | `WidgetEmpty`/`DashEmptyBody`: "Configure this widget" or widget-specific copy (e.g. "No stale deals — nice!") |
| Footer note | `"{N} report widgets · editing"` while editing, else the hardcoded static string `"Data refreshed 2 minutes ago"` — **not a real timestamp** |
| Loading state | **Not found** — no skeleton screen (Dashboard has `DashboardSkeleton` via `useSkeleton(1100)`; Reports has no equivalent) |
| Error state | **Not found** — aggregation call sites wrap in `try/catch`; failures are silently swallowed and fall through to the empty state, never a distinct error message |

### `REPORT_ROLE_PRESETS` — 6 role-specific default layouts

| Role | Sample widgets in default preset |
|---|---|
| Sales Rep | call-stats, emails-sent, lead-conversion, goal-progress, deals-by-stage, engagement-trend, tasks-due |
| Read Only | pipeline-value, win-rate, deals-by-stage, lead-funnel, recent-activity |
| Team Lead | team-leaderboard, rep-performance, deals-by-stage, conversion-funnel, team-activity, stale-deals |
| Sales Manager | weighted-forecast, pipeline-coverage, win-rate, team-leaderboard, conversion-funnel, deals-by-stage, sequence-perf, rep-performance |
| Admin | weighted-forecast, win-rate, pipeline-coverage, team-leaderboard, rep-leaderboard, conversion-funnel, deals-by-stage, sequence-perf, engagement-trend, activity-feed |
| Owner | weighted-forecast, win-rate, pipeline-coverage, team-goal, team-leaderboard, conversion-funnel, sequence-perf, contact-growth, activity-feed |

There is no fixed "Revenue Report" / "Activity Report" page — every chart is a widget, and a "report" is simply an arranged set of widgets for a role.

### Resolution precedence

`reportResolved(role)`: **user's personal override** (`localStorage['nrtur-report-user']`) → **admin workspace default** (`localStorage['nrtur-report-ws-default']`) → **per-role saved preset** (`localStorage['nrtur-report-role-<role>']`) → **hardcoded `REPORT_ROLE_PRESETS` built-in**.

### Chart rendering — no charting library

All charts are hand-rolled SVG/HTML, not a library like Recharts or Chart.js:
- `DashChartViz` — generic renderer for `DASH_CHART_TYPES`: **Bar, Stacked, Grouped, Line, Area, Donut, Funnel, Number, Table** (9 types; each has a `series: boolean` flag for whether a 2nd breakdown dimension is supported)
- Bespoke widgets with their own inline SVG: `DashSparkline`, `DashEngagement` (Opens/Clicks/Replies), `DashConversionFunnel`, `DashGoalProgress` (circular progress ring)
- Legacy hand-coded `bars`/`donut`/`line` types inside `renderWidgetBody`, predating `DashChartViz`, still used by some widgets
- No `<canvas>` anywhere — pure SVG/DOM

### Drill-down behavior

- Chart segments: `dashPickNav` builds a filter model and calls `goTo(meta.nav, {wf})` — e.g. clicking a "Won" bar navigates to Pipeline pre-filtered to Won deals
- List rows: `goTo(meta.detail || meta.nav, r.id)` opens the record detail page directly
- Stat cards: clicking navigates to `meta.nav` (e.g. pipeline-value → Pipeline page)

---

### Design decisions

| Decision | Alternative | Why this | Tradeoff |
|---|---|---|---|
| Reuse Dashboard's entire widget engine instead of building a dedicated Reports engine | Separate Reports data model, chart components, and config UI | One customization language for both surfaces — a widget built for Dashboard automatically works in Reports, and vice versa; dramatically less code to maintain | Reports has zero visualizations or capabilities beyond what Dashboard already offers; it reads as "Dashboard with different defaults" rather than a distinct analytics product — hard to justify as a separate nav item without report-only capabilities (scheduling, sharing, real export) |
| 6-role preset system (`REPORT_ROLE_PRESETS`) instead of Dashboard's 3 archetypes | Reuse Dashboard's 3 archetypes (rep/manager/exec) for Reports too | A Team Lead's team report is meaningfully different from a Sales Manager's full-team report — the code comment explicitly justifies this distinction | Two parallel role-modeling systems (3 archetypes for Dashboard, 6 roles for Reports) sharing the same widget engine but different preset shapes — a maintenance burden if a 7th role is ever added, since it must be added in two places with different structures |
| Precedence chain (user > admin default > role preset > built-in) resolved client-side via localStorage | Server-side resolution with a real settings table | Simple to reason about with no backend; matches the rest of the prototype's persistence pattern | No cross-device sync, no audit trail of who changed a role preset, and clearing browser storage silently reverts a user to the built-in default with no warning |
| Date range selector present in the UI | Omit the control until it's wired up | Signals the intended feature and previews the layout for when it's implemented | As shipped, it is actively misleading — a user picks "This quarter" expecting the numbers to change and nothing happens; this reads as a bug, not a considered scope cut, and needs to be flagged clearly |
| CSV export simulated (toast only, no file) | Build the real export pipeline before exposing the button | Lets the affordance and permission-gating (`effCanExport()`) be validated in the prototype without a backend | Same risk as the date range — a user who clicks Export and gets nothing will read it as broken, not as "not yet built" |

---

### Frontend — what needs to be built

- `ReportsPage`: role-preset resolution (`reportResolved`), `layout`/`configs` state persisted via `dashSave`, edit-mode toggle, `isAdmin`-gated save buttons
- All widget rendering is **already built** if Dashboard (Module 3) is built — `DashboardWidget`, `WidgetConfigDrawer`, `DashChartViz`, `WidgetLibraryPanel`, `renderWidgetBody` are shared, not duplicated
- Date range dropdown: needs to actually feed into `dashApplyCfg`'s per-widget date logic, or be removed
- CSV export: wire the button to a real download flow once the backend endpoint exists
- Footer "Data refreshed" string: replace hardcoded text with a real last-fetched timestamp
- Loading state: add a skeleton (page-level or per-widget) once queries are asynchronous

### Backend — what needs to be provided

- Real aggregation queries per widget (replacing client-side compute-from-full-dataset) — `GET /reports/widgets/:id/data?object=&measure=&dimension=&filters=&range=`
- Server-side enforcement of Own/Team/All data scoping (currently client-side `effScopeRows`, trusted, not verified)
- Real CSV/export generation endpoint, streamed as a file download
- Persistence for report layouts: `report_layouts` table keyed by `(workspace_id, user_id | role | 'workspace_default')`, replacing the three localStorage keys
- If sharing/scheduling is ever built (see Q&A): a job scheduler + server-side chart rendering (to image/PDF) + email delivery

---

## 19.2 Custom Report Builder (`WidgetConfigDrawer`)

_Lines 4586–4702 — there is no separate `ReportBuilder` component; "building a custom report" means configuring a widget through this shared drawer, opened via the gear icon on any widget card._

### Surface inventory — Data tab

| Field | What it does |
|---|---|
| Source | `DASH_SOURCES[object]` — e.g. for Deals: Sales Pipeline / Onboarding Pipeline / All pipelines |
| Owner | Anyone / Me / My team / a named rep |
| Date range preset | all / week / month / quarter / year / custom — **per-widget**, independent of the page-level date selector |
| Filter builder | Full condition-row builder (`OmCondRow`) with AND/OR toggle — same engine used by list-view filters elsewhere in the app |
| Live match count | "`<N>` records match" chip updates as filters change |

### Surface inventory — Visualize tab (chart widgets only)

| Field | What it does |
|---|---|
| Chart type | One of 9 `DASH_CHART_TYPES`: Bar / Stacked / Grouped / Line / Area / Donut / Funnel / Number / Table |
| X-axis / group-by | A dimension field — `select`, `owner`, `date`, `multiselect`, or `boolean` type; date dimensions reveal a granularity picker (Day/Week/Month/Quarter) |
| Y-axis / measure | An aggregation (`count`/`sum`/`avg`/`min`/`max`) over a `number` or `currency` field |
| Series / breakdown | An optional 2nd dimension — only available for Stacked, Grouped, Line, and Area chart types |
| Sort & limit | Top 5 / Top 10 / All, ascending or descending |
| Display options | Show values / legend / axis labels toggles; color scheme: Brand (5-shade indigo ramp) / Multi (10-color cycling palette) / Status (semantic — pipeline stage colors, lead-status colors, company-type colors, rep colors) |

### Object type coverage

Only **`contact`, `company`, `deal`, `lead`** are selectable as a report's data source (plus synthetic non-CRM sources like `task`/`activity`/`meeting`/`sequence`/`call` used by specific bespoke widgets). **Custom Objects (Module 21) are not selectable** — `dashObjRows` and `omFieldSchema` only branch on the four built-in object types.

Custom **properties** added to those four built-in objects (e.g. a custom field added to Deals) DO flow into the dimension/measure pickers automatically, since `omFieldSchema` merges custom properties into the same schema used everywhere else in the app. So: "add a custom field to Deals" is reportable immediately; "create a whole Custom Object" is not reportable at all — an inconsistency worth knowing about.

### Bespoke widgets bypass the generic builder

Widgets marked `custom: true` in `WIDGET_META` (e.g. `tasks-due`, `activity-feed`, `sequence-perf`, `goal-progress`, `conversion-funnel`, `stale-deals`) don't use the Data/Visualize machinery above. Instead they render a declarative `controls[]` array (per-widget, in `WIDGET_META`) — simple `{key, label, type, options, default}` controls rendered by `renderCtrl`.

### Saving

Fully `localStorage`-based via `dashLoad`/`dashSave` — the same plain-JSON persistence pattern Dashboard uses, under different keys (`nrtur-report-user`, `nrtur-report-ws-default`, `nrtur-report-role-<role>`). No backend, no dedicated React Context for report definitions. An admin-facing editor for role/workspace presets also exists at Settings → Dashboards (`SettingsDashCustomizePage`), which edits both Dashboard archetype defaults and Report role presets via a `surface` toggle.

### Sharing / scheduling

**Not found.** No "email this report weekly," no shareable link, no export-and-send flow anywhere in the code.

---

### Design decisions

| Decision | Alternative | Why this | Tradeoff |
|---|---|---|---|
| Only 4 built-in objects reportable; Custom Objects excluded | Generalize the aggregation engine to accept any object's schema, including Custom Objects | The 4 built-ins have stable, known field shapes that the existing `dashObjRows`/`dashFields` code was written against | A workspace that relies heavily on Custom Objects (the product's own "Projects" demo object, for instance) gets zero reporting on that data — a real gap given Custom Objects are pitched as first-class |
| Custom properties on built-in objects included automatically; custom object types are not | Treat both consistently (either both in, or both out) | Custom properties came "for free" because `omFieldSchema` already merges them in app-wide for filtering; extending to whole custom objects needs new aggregation code that wasn't written | Confusing asymmetry to explain to a customer: "add a field → reportable instantly" but "add an object → not reportable ever" |
| Bespoke `custom:true` widgets use a hand-built `controls[]` config instead of the generic Data/Visualize model | Force every widget through the same generic aggregation model | Some widgets (task due-dates, sequence performance) don't map cleanly onto count/sum/avg-over-a-dimension; a hand-built control set is simpler for these | Two different configuration paradigms live in the same drawer depending on which widget is open — inconsistent UX, and every new bespoke widget requires actual code, not just a registry entry |
| Reports/layouts saved to `localStorage`, no backend | Persist to a real reports table | Consistent with the rest of the no-backend prototype; trivial to implement | Not actually shareable across people or devices in any real sense — "workspace default" is really just "whatever the last admin's browser saved," with no version history or audit trail |
| Live preview recomputes on every keystroke/selection with no visible debounce | Debounce, or defer aggregation until the drawer closes | Instant feedback while configuring feels responsive in a prototype with small in-memory datasets | At real data volumes (thousands+ records), synchronous client-side re-aggregation on every field/dimension change will visibly lag the drawer |

---

### Frontend — what needs to be built

- `WidgetConfigDrawer`: Data tab (source/owner/date-range/filter builder reusing `OmCondRow`), Visualize tab (chart type/dimension/measure/series/sort/display), live match-count chip
- Debounce the live-preview aggregation call before wiring to a real backend
- Declarative `controls[]` renderer (`renderCtrl`) for bespoke `custom:true` widgets

### Backend — what needs to be provided

- Generalize the aggregation endpoint to accept Custom Objects as a source: `GET /reports/aggregate?object=&measure=&dimension=&filters=` where `object` can be a custom object type, not just the 4 built-ins — ideally sharing the same field-schema resolver `CustomObjectListPage` already uses for its own filter/sort engine
- Server-side filter evaluation (mirroring the Om filter engine) so large datasets aren't pulled to the client just to be filtered
- If sharing/scheduling ships: a job scheduler (cron-like recurrence), server-side chart-to-image/PDF rendering, and delivery via the existing email pipeline (Module 12)
- Server-side enforcement of the `report.{view,create,edit,share}` permission (see Q&A) if the Permission Matrix entry is meant to do anything

---

## Developer Q&A

**Q: Reports reuses Dashboard's entire widget engine. Is Reports actually a different feature, or just Dashboard with a different name?**
A: Functionally, almost entirely the same feature — the code's own comment confirms this is intentional, not accidental duplication avoided after the fact. What differs: (a) a richer 6-role preset system vs. Dashboard's 3 archetypes, (b) page chrome — a date-range selector and CSV export button that Dashboard doesn't have. Everything else (chart types, widgets, config UI, drill-down) is identical. The intended distinction — Dashboard is "my personalized homepage," Reports is "the curated view for reviewing/sharing" — isn't yet enforced in the code, since Reports has no real export or sharing capability beyond a fake CSV toast.

**Q: The date range selector on Reports doesn't filter anything. Is this a bug to fix before shipping?**
A: Yes — treat it as a known gap, not a design choice. The `range` state renders in the UI and is never read by any widget's aggregation. Fix: either wire it to override every visible widget's date range at once, or remove the control so it stops implying functionality that doesn't exist.

**Q: CSV Export shows a toast but doesn't download a file. What's needed for real export?**
A: A backend endpoint that re-runs the currently visible widgets' aggregations server-side, serializes to CSV (one file, one per widget, or a combined workbook), and streams it back with `Content-Disposition: attachment`. The permission gate (`effCanExport()`) is already correctly wired — only the actual generation is missing.

**Q: Can a report show data from a Custom Object (e.g. a "Projects" object)? Module 21 treats Custom Objects as first-class.**
A: No. `dashObjRows` and `omFieldSchema` only branch on `contact/company/lead/deal`. A workspace built around Custom Objects gets zero reporting on that data today. This needs the aggregation engine generalized to accept a custom object's field schema — ideally sharing the resolver `CustomObjectListPage` already built for its own filtering, rather than writing a second one.

**Q: The Permission Matrix has a "Reports & Dashboards" row with view/create/edit/share toggles per role. Does turning off "Share" for Sales Rep actually stop them from sharing a report?**
A: No — this permission is a dead stub. It's fully built and seeded with real per-role defaults in Settings, but no code in `ReportsPage` reads `report.view`/`report.create`/`report.edit`/`report.share`. The only permission actually enforced on this page is `effCanExport()` (a separate, export-specific check). This is worth surfacing directly to stakeholders: the settings screen implies protection that isn't there yet.

**Q: Dashboard shows a loading skeleton while data loads; Reports doesn't. Intentional?**
A: No evidence it's intentional — reads as an oversight from reusing Dashboard's structure without reusing its `useSkeleton()` call. It's invisible today because both pages compute from an in-memory context with no network delay. Once real backend queries exist, Reports needs its own loading state — likely per-widget skeletons, since different widgets' queries will resolve at different times, rather than one whole-page skeleton like Dashboard's.

**Q: Is there any way to schedule a report to be emailed weekly, or share a report link externally?**
A: Not found anywhere in the code — no scheduling UI, no share-link generation, no email-delivery hook. If this is on the roadmap, it needs: a real "Share" action wired to the currently-dead permission (previous question), a recurrence model (daily/weekly/monthly + recipient list), and a backend job that renders the report server-side (email clients can't run React) and sends it through the existing email pipeline.

**Q: Live preview re-aggregates on every config change with no debounce. Will this be slow with real data?**
A: In the prototype, `crm.deals`/`contacts`/etc. are small in-memory arrays, so recomputing on every keystroke is invisible. At production scale (thousands of records), doing this synchronously and client-side on every field/dimension change will visibly lag the config drawer. Fix with both: debounce `onLive` by ~300ms, and eventually push aggregation to a backend "preview" endpoint that returns just a summary, not full row data.
