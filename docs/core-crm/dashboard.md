# Dashboard
_Module 3 · Verified from `index.html` lines 3840–4911 · 2026-06-30_

---

## (a) Complete surface inventory

Everything visible or interactive on the Dashboard page:

**Topbar**
- Time-based greeting: "Good morning / afternoon / evening, Alex"
- Today's date in long format
- "Customize" button (enters edit mode)
- "New Contact" button (permission-gated)

**Widget grid (view mode)**
- 3-column CSS grid, `grid-auto-flow: row dense`
- Each widget: rounded card, subtle border, hover darkens border
- Widget sizes: S (1×1), M (2×1), L (2×2), W (3×1 full-width)
- Skeleton loading state (1100ms delay on first paint)
- Empty state with CTA when grid has no widgets

**Edit mode** (entered via "Customize")
- Topbar changes: role badge chip, "Reset to default", "Save as [Role] default" (admin only), "Layout templates", "Add widget", "Done"
- Each widget gains: a "Drag" grip handle, size selector (S/M/L/W), gear (configure), X (remove)
- Corner resize handle (drag to snap to nearest size preset)
- Dashed placeholder tile at the end of the grid — click to open Widget Library
- Drag-to-reorder (HTML5 drag API; drop highlights target slot in brand color)

**Widget Library Panel** (right-side drawer, 340px)
- Search input
- 5 categories: Metrics (15 widgets), Lists (10), Charts (13), Calendar (1), Quick actions (3)
- Each entry: icon, name, default size badge (S/M/L), "Team" badge if role-restricted
- Mini wireframe thumbnail (shape preview, no data)
- Click adds widget + auto-opens its Config Drawer

**Widget Config Drawer** (right-side panel, 400px)
- Widget name (editable)
- Size selector (disabled sizes shown greyed if widget has a minimum)
- **Data tab** (CRM widgets): Source dropdown, Owner filter, Date range (preset + custom date-pickers), AND/OR filter builder (reuses Om condition rows), live "N records match" count chip
- **Display tab** (list widgets): rows to preview (3/5/10/15), column toggle checklist, sort field + direction
- **Display tab** (metric widgets): delta compare toggle, sparkline toggle, number format (Raw / $324k / %)
- **Visualize tab** (chart widgets): chart type picker (Bar, Line, Donut, Number, Funnel), X-axis / group-by dimension, Y-axis / measure (count, sum, avg, min, max + field), series / break-down-by (optional), sort + limit (Top 5/10/All), show values toggle, legend toggle, axis labels toggle, color scheme (Brand / Multi / Status)
- "Reset" button (clears all config for that widget)
- "Done" button (closes, shows toast "Widget updated")

**Layout Templates Modal** (full-height right panel, 680px)
- 3 templates: Sales Rep, Sales Manager, Executive
- Each shows: icon, name, role tag, description, widget count, live wireframe preview (icon + name + shape glyph per tile)
- Select → "Apply layout" (triggers confirm dialog: "This replaces your current layout")

**Persistence**
- Per-user layout saved to `localStorage` key `nrtur-dash-user`
- Admin-set workspace default per archetype: `nrtur-dash-default-rep/manager/exec`
- Resolution order: user override → workspace default for role → built-in role preset

**Role-based defaults** (6 presets mapped to 3 archetypes)
- Sales Rep → Rep archetype
- Read Only → Rep archetype
- Team Lead → Manager archetype
- Sales Manager → Manager archetype
- Admin → Exec archetype
- Owner → Exec archetype

**Role-restricted widgets** (hidden from lower roles in both grid and library)
- Leadership only: Weighted forecast, Pipeline coverage, Team goal
- Team only: Team leaderboard, Rep leaderboard, Rep performance, Team activity, Stale deals

**Footer**
- Widget count + editing state + hidden-widget count (e.g. "8 widgets · editing · 2 hidden for your role")

---

## (b) What every element does — in detail

### The widget grid
A 3-column CSS Grid with `gridAutoFlow: row dense`. "Dense" is the critical keyword: it back-fills gaps left by wide widgets, so the layout packs tightly without holes. Widgets snap to 4 size presets — S (1 col × 1 row), M (2 col × 1 row), L (2 col × 2 row), W (3 col × full-width). Each preset maps to a fixed grid span class. The minimum row height is 140px; taller widgets scale via row-span.

The `visibleLayout` is the stored layout filtered by role: widgets the current role can't see are stripped from rendering but kept in the stored list, so they reappear if the role changes. The `hiddenCount` is surfaced in the footer.

### Skeleton loading
`useSkeleton(1100)` — returns `true` for 1100ms on mount, then flips to `false`. During that window the page renders a skeleton placeholder instead of the real grid. This prevents a flash of unstyled empty grid while the context data initializes.

### The greeting
`new Date()` at render time: `< 12` → "Good morning", `< 18` → "Good afternoon", else "Good evening". The date is formatted with `toLocaleDateString(undefined, {month:'long', day:'numeric', year:'numeric'})` — respects the browser's locale.

### Edit mode
Toggling edit mode re-renders the grid with: (1) dashed card borders, (2) a "Drag" grip chip in the top-left of each card, (3) the size/configure/remove controls in the top-right, (4) a corner resize handle. The widget body is wrapped in `pointer-events-none select-none` during edit mode so clicks don't accidentally trigger widget actions while the user is repositioning things.

**Drag-to-reorder** uses the HTML5 Drag API. `onDragStart` records the source index; `onDragOver` sets the drag-target index; `onDrop` calls `reorder()`. Reorder only operates on the _visible_ list but maps back to the full layout array (which includes role-hidden widgets) so their relative order is preserved.

**Corner resize** uses mouse events (not drag). `mousedown` captures the card's current `getBoundingClientRect`, then `mousemove` computes how many grid columns / rows the cursor has moved across, snaps to the nearest size preset, and calls `onSizeLive` for immediate visual feedback. `mouseup` fires `onSizeEnd` which shows the toast.

### Widget Library Panel
A right-side drawer (fixed, `z-150`). The search filters both widget `name` and `desc`. Sections are built from `WIDGET_LIBRARY` and filtered by `widgetAllowsRole(id, effectiveRole())` — so a Rep opening the library never sees leadership widgets. Clicking a widget: adds it to the layout, closes the library, shows a toast ("Pipeline value added"), and auto-opens the Config Drawer for that widget — prompting the user to configure it immediately.

### Widget Config Drawer
The drawer opens _over_ the grid (not replacing it) at `z-180`. It has a live preview mechanism: every config change fires `onLiveConfig`, which immediately updates the widget's rendered config in the grid behind the drawer without waiting for "Done". "Done" just closes the drawer and shows a toast. "Reset" clears the widget's config object to `{}` (widget reverts to its defaults).

**For CRM widgets**, the filter builder reuses the exact same `OmCondRow` component used in Contacts/Leads/Companies list views — same operators, same field schema. The "N records match" chip recalculates live as the user adds/removes conditions, showing real count from the current in-memory dataset.

**For chart widgets**, the Visualize tab controls: chart type (Bar, Line, Donut, Number, Funnel), X-axis (the grouping dimension — what the bars/segments represent), Y-axis (the measure — what you're counting or summing), and an optional Series (a second grouping dimension that splits each bar into coloured sub-segments). Not all chart types support Series — the dropdown is disabled with a grey overlay when it doesn't.

### Layout Templates Modal
3 role-based starting layouts. Selecting one and clicking "Apply" triggers a `useConfirm` dialog: "This replaces your current layout." Confirming replaces the stored layout and clears all per-widget configs. The wireframe preview in each template card is rendered by `DashTemplateWire` — which actually iterates the template's widget array, gets each widget's def (icon + type), and draws miniature tile shapes at the right grid spans with shape-appropriate glyphs (tiny bar chart, sparkline, donut, etc.). It's a real preview, not a screenshot.

### Persistence model
Three `localStorage` keys cooperate:
1. `nrtur-dash-user` — the current user's personal override (layout + configs). Written on every layout or config change.
2. `nrtur-dash-default-rep/manager/exec` — workspace default for each archetype. Written only when an admin clicks "Save as [Role] default".
3. Built-in presets (`DASH_ROLE_PRESETS`) — hardcoded fallback if neither key is set.

Resolution at load: `dashLoad('nrtur-dash-user')` → if null, `dashRoleDefault(arch)` which tries `nrtur-dash-default-{arch}` → if null, falls back to the built-in `DASH_ROLE_PRESETS` entry for the role.

---

## (c) Why this design, not an alternative?

| Decision | Alternative | Why this was chosen | Cost / tradeoff |
|---|---|---|---|
| 4 fixed size presets (S/M/L/W) | Free-drag pixel grid (like Notion or Figma) | Snap presets guarantee a gapless grid every time. Users can't create orphan half-width spaces or odd row heights. | Less granularity — users can't make a widget "slightly wider" |
| Role-aware defaults (6 roles → 3 archetypes) | One shared default for everyone | A Rep opening a dashboard sees their tasks and pipeline, not org-wide forecast numbers they can't act on | Admin has to configure 3 archetypes, not 1 |
| Per-user localStorage override on top of workspace default | Server-side saved preferences | Zero backend needed for the prototype. Each user's customizations persist in their browser only | Customizations are lost if the user clears storage or switches devices |
| Config Drawer as a side panel (not a modal) | Full-page config screen | The widget updates live behind the drawer as you configure — you see the result immediately | Less screen space for the controls; can feel cramped on narrow viewports |
| Widget Library hidden from the main grid | Always-visible widget palette on the side | Keeps the main grid uncluttered. The "Customize" mode is a deliberate mode shift, not always-on | Users may not discover dashboard customization if "Customize" button isn't obvious |
| HTML5 Drag API for reorder | Library-based drag (react-dnd, dnd-kit) | No dependencies. Works without installing anything — important for a single-file prototype | HTML5 drag has jank on some browsers, no touch-drag support (mobile reorder doesn't work) |

---

## (d) Performance & efficiency

**What it loads:** The Dashboard reads from `CrmDataContext` (contacts, leads, companies) which is already in memory from the app's top-level context. No separate fetch on mount. This is fast but means the dashboard data is only as fresh as the last full page load.

**Skeleton timing:** The 1100ms `useSkeleton` is artificial — it simulates a real loading state. In a production app with real API calls, this would be driven by actual data-fetching promises.

**Widget rendering:** Each widget body calls `renderWidgetBody(def, cfg, goTo, data, item.id)` — this filters and aggregates the in-memory data on every render. With 10–15 widgets, each doing a `.filter()` and potentially a `.reduce()` over hundreds of contacts, this happens on every state change (any widget config, drag, resize). There is no memoization of widget bodies between state changes.

**The real-world risk:** At ~500 contacts and ~10 widgets, this is fine. At 25,000 contacts (the Pro plan limit) with 15 widgets, recalculating all widget aggregates on every state change would cause noticeable lag. The fix is `React.useMemo` per widget body, keyed on the data slice and config, so a drag on widget 3 doesn't recalculate widget 7's numbers.

**Drag reorder:** Uses `setLayout` (replaces the entire layout array) on every drag event — this triggers a full re-render of the grid. A production version would debounce or use a drag library that defers commits.

**localStorage size:** The stored config object can grow large if users configure many chart widgets (filters, axis settings, custom names). localStorage has a 5MB cap per origin — not a real concern at this scale, but worth knowing.

---

## (e) Three lenses

### Frontend
- The 3-col CSS grid with `dense` packing is correct and elegant. The 4 size presets map cleanly to column/row spans.
- The live config update (`onLive`) is a nice pattern — the drawer stays open while the widget rerenders behind it.
- Reorder via HTML5 Drag is a known minefield: it doesn't work on touch (mobile), has cross-browser inconsistencies, and the drag ghost image is uncontrollable. A real implementation would use a library or pointer events.
- The corner resize handle uses `getBoundingClientRect` on `mousedown` — this is correct but the geometry math assumes the grid doesn't reflow during the drag (which is usually true but not guaranteed if the viewport resizes simultaneously).
- No `React.useMemo` or `React.useCallback` visible on widget bodies or data slices. Fine for prototype scale; a must-fix before production.

### Backend
- Currently 100% localStorage — no server state. In production: layout + configs are workspace + user data that need to live in a database, synced across devices and team members.
- The workspace default (admin "Save as Role default") writes to `localStorage` on the admin's device only. In production this would need to hit a workspace settings API so the default propagates to all users of that role.
- The data the widgets show is seeded static data from `CrmDataContext`. In production every widget needs a backend query — potentially 15 different queries per dashboard load. That's an N-query problem that needs a dashboard data endpoint or a GraphQL approach that fetches all widget payloads in one round-trip.
- Role-restricted widgets (Leadership/Team) need the server to enforce them, not just the frontend filter. A rep who knows the widget ID could add a leadership widget manually in production if the API doesn't validate it.

### Design
- The time-based greeting + date in the subtitle is a warm, human touch that good CRMs (Salesforce, Pipedrive) consistently miss.
- The 3 layout templates are role-named and use language the buyer understands ("Sales Rep", "Sales Manager", "Executive") — not generic presets.
- The live wireframe preview in the templates modal is significantly better than screenshots — it renders the actual widget layout at the true grid spans.
- The "Customize" button in the topbar is subtle (outline, not filled). Users who are satisfied with the default may never discover it. A first-time "Set up your dashboard" prompt would help.
- The "Team" badge in the widget library (amber, small) is easy to miss. A role-restricted widget a manager tries to add should be visually clearer about why some users can't see it.

---

## (f) Competitive position

_Note: this reflects knowledge of competitors as of early 2026, not verified in real time._

- **Salesforce / HubSpot:** Both have fully customizable dashboards but require significant setup time and are cluttered with options. Nrtur's 4-size snap grid is faster to learn.
- **Pipedrive:** Dashboard is mostly fixed — limited customization without add-ons.
- **Less Annoying CRM:** No custom dashboard at all — you get what they give you.
- **GoHighLevel:** Has dashboard widgets but the UX for configuring them is complex.

Nrtur's strongest point here: **role-aware defaults that are correct out of the box** — a rep gets a rep dashboard on first login without anyone configuring it. Competitors typically give everyone the same default and expect admins to set it up.

The live filter builder inside the widget config (reusing the same Om engine from the list views) is ahead of most competitors, which offer only a few preset filter options per widget.

---

## (g) Questions your developers and designers will ask

**Frontend**

**Q: How does the grid handle widgets of different heights? Does it break?**
A: `gridAutoFlow: row dense` handles it. When an L (2×2) widget is placed next to a small one, the grid auto-fills the remaining 1-column slot with the next S widget — no gap left behind. The `gridAutoRows: minmax(140px, auto)` means all widgets in the same row track are the same height, which prevents height mismatches. This is built into CSS Grid; no custom code needed.

**Q: Drag-and-drop doesn't work on mobile — what's the plan?**
A: The current HTML5 Drag API implementation has no touch support. This is a known gap. The fix is to replace with pointer-event-based drag (or a library like `@dnd-kit/core`) which works on both mouse and touch. For the prototype, mobile reordering is simply not supported — but the dashboard is readable on mobile (just not editable).

**Q: What's the persistence story if we move to a real backend?**
A: Right now everything is `localStorage`. The migration path: (1) Add a `GET /workspace/dashboard-defaults/:archetype` and `PUT /workspace/dashboard-defaults/:archetype` for admin-set defaults. (2) Add `GET /user/dashboard` and `PUT /user/dashboard` for per-user overrides. The frontend code already separates these two concepts cleanly — you'd replace `dashLoad`/`dashSave` with API calls, the rest of the logic stays the same.

**Q: Why does the dashboard recalculate all widget data on every state change? That's going to be slow.**
A: Yes — this is the main performance gap to fix before production. The solution is `React.useMemo` per widget body, with a dependency array of `[cfg, dataSlice]`. With that, a drag operation (which changes only `layout` state) won't trigger recalculation of any widget's numbers.

**Q: How do you prevent a Sales Rep from adding leadership widgets by editing localStorage?**
A: In the prototype you can't — it's frontend-only. In production, the "save layout" API must validate each widget ID against the user's role server-side and strip restricted widgets before saving.

**Backend**

**Q: 15 widgets × 25,000 contacts means 15 separate aggregation queries per dashboard load. How do you handle that?**
A: You must decide this. Two real options: (1) A dashboard data endpoint that accepts the full layout as a request body and returns all aggregations in one response — the backend runs them in parallel and returns a map of `{widgetId: result}`. (2) GraphQL where the client requests exactly the fields each widget needs in one query. Option 1 is simpler to build; option 2 is more flexible as widgets get more complex.

**Q: The widget filter builder supports the same field operators as the list views. How do you keep those in sync?**
A: The same `omFieldSchema` function generates the filter field definitions for both contexts. In production, this schema must be generated from the server-side field definitions so custom properties show up in both places — you can't maintain two separate lists.

**Design**

**Q: How does a new user discover "Customize"? The button is quite subtle.**
A: This is a real gap. You must decide: add a first-login tooltip/spotlight on "Customize" for new users, or promote it to a filled button. The current outline style treats it as a secondary action, but it's actually the main way a manager makes this page useful. Consider a first-time state with a more prominent prompt.

**Q: The layout templates are good, but they only apply at role level. Can a user have multiple saved dashboards?**
A: No — the current model is one dashboard per user. Switching is destructive (replaces your layout). Multiple named dashboard tabs (like Salesforce Home Pages) is a meaningful future feature that would require schema changes: instead of one `layout` array per user, you'd have `dashboards: [{name, layout, config}]`.

**Q: Why is the greeting always "Alex"? Is that hardcoded?**
A: Yes — `'Good morning, Alex'` uses the hardcoded demo username `Alex Morgan`. In production this reads from the authenticated user's display name from the session/profile context.

---

## Summary for a developer meeting

The Dashboard is a widget grid with 4 snap-to-size presets (S/M/L/W), a role-aware default layout that's correct out of the box, a live-preview config drawer, and a localStorage-backed persistence model. The main technical gaps to communicate are: (1) no `useMemo` on widget bodies — will hurt at production data scale; (2) HTML5 Drag doesn't work on touch; (3) persistence is 100% client-side; (4) role restrictions are frontend-only. All of these are known prototype limitations, not design mistakes — the architecture is right, the persistence and enforcement just need to move server-side.
