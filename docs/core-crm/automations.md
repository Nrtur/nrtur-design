# Module 10 — Automations

_Primary list: `SettingsAutomationsPage` (line 16390) · Builder: `AutomationBuilderPage` (line 11437)_
_Also accessible as standalone `AutomationsPage` (line 10930) via `automations` route_

---

## 10.1 Automations List + Template Browser

### Surface inventory

| Element | What it is |
|---|---|
| Header stat line | "N active · N paused · 389 runs this month" |
| New Automation button | Top-right CTA; routes to `automation-builder` |
| Read-only banner | Shown to non-admins: "Automations are shared workspace assets." |
| Workflow concept banner | Explains Trigger → Conditions → Actions pattern with icon trio |
| Sub-tabs | Workflows / Logs (2 tabs at top of content area) |
| Automation row card | Name, status badge, trigger category pill, trigger sentence, step strip, run count, success %, last-run timestamp, sparkline |
| Active/Paused toggle | Per-row toggle to pause or resume without opening the builder |
| Edit button | Routes to `automation-builder` |
| Enrolled button | Opens `EnrolledContactsModal` showing who is in the flow right now |
| Logs button | Opens `AutomationLogModal` showing run history |
| ··· menu | Duplicate · Delete (with confirm) |
| Error state | Red ring on card + "Last run failed — {step}" inline error with "View log" link |
| Draft state | No toggle/enrolled/logs buttons; shows "Draft — not yet activated" |
| Browse templates link | Opens `AutomationTemplatePanel` |
| Logs sub-tab | Filterable table: automation, contact, status, step count, timestamp; Export CSV |

### Step strip (per automation card)

Each automation card shows a horizontal strip of its steps — small icon badges connected by arrows. A blue "If {condition}" chip appends at the end when the automation has a branch condition. This lets the user understand the entire flow at a glance without opening the builder.

### Status states

| Status | Visual treatment |
|---|---|
| `active` | Brand icon, emerald "Active" badge, toggle on, sparkline in brand purple |
| `paused` | Muted icon, grey "Paused" badge, toggle off, sparkline slate, "Paused since {date}" |
| `draft` | Muted icon, grey "Draft" badge, no stats row, italic placeholder text |
| `error` | Red border glow, red "Error" badge, error detail row at bottom, sparkline red |

### Template browser (AutomationTemplatePanel)

Invoked by "Browse templates". Shows pre-built automation recipes. Selecting one calls `useTemplate(t)` which navigates to `automation-builder` with `nav.recipe` set — the builder pre-populates trigger + step nodes from the recipe.

Seeded templates: No-show recovery / Reminder cadence / Speed-to-lead / New Lead Welcome / Deal Won Celebration / Follow-up Sequence / Proposal Follow-Up + more.

---

### Design decisions

| Decision | Alternative | Why this | Tradeoff |
|---|---|---|---|
| Step strip visible on the list card | Click to expand steps | User sees the full automation logic without opening the builder; faster triage of "does this do what I think?" | Wide step strips wrap on mobile; long automations truncate |
| Admin-only edit; all roles see read-only | Any team member can edit | Automations run on shared contacts; a bad edit hits everyone | Non-admins can't self-service; need to ask admin for changes |
| Logs as a sub-tab on the list (not a separate page) | Separate Logs route | The log is contextually tied to the automation list — filtering by automation name makes sense here | The Logs tab is hidden until the user discovers the sub-tab; some users expect a top-level Logs page |
| Duplicate action | Start from scratch or clone via template | Iteration speed: "make a variant of this" is the most common workflow once an automation is proven | Duplicate creates a paused copy with "Copy of" prefix — easy to forget to rename it |

---

### Frontend — what needs to be built

- Automation list with status-aware card styling (4 visual states)
- Toggle component wired to `toggleAuto(id)` with optimistic UI
- Step strip renderer: horizontal icon badge list with arrow separators + condition chip
- Sparkline chart (`MiniSparkA`) per automation row
- ··· overflow menu with click-outside close
- `AutomationTemplatePanel` modal — grid of template cards → navigate with `nav.recipe`
- Logs sub-tab: filter dropdowns (automation, status, date range) + log table + Export CSV
- Role guard: `settingsIsAdmin()` gates edit/toggle/delete; non-admins see read-only banner

### Backend — what needs to be provided

- `GET /automations` — list with status, runs, success%, last_run, steps summary
- `PATCH /automations/:id/status` — activate / pause
- `DELETE /automations/:id` — with in-progress run cancellation
- `POST /automations/:id/duplicate` — returns new record
- `GET /automations/logs?auto=&status=&range=` — execution log rows (automation, contact, status, step, timestamp)
- Template library served server-side or as a static asset; recipe pre-fill must be SSR-safe

---

## 10.2 Automation Builder

### Surface inventory

| Element | What it is |
|---|---|
| Breadcrumb header | "← Automations › {name}" — name is an inline editable input |
| Active toggle | `active` / `inactive` pill + toggle in header; admin-only |
| Run history button | Opens `AutomationLogModal` |
| Test button | Opens `AutomationTestModal`; admin-only |
| Cancel / Save as draft / Save buttons | Cancel confirms if dirty; Save drafts immediately and returns to list |
| Read-only banner | Non-admins see "Automations are shared workspace assets." |
| Trigger tile | Special top node (no top port); shows trigger name, category icon, hint; click opens Trigger config drawer |
| Trigger drawer | Slide-in panel: event picker button + "Only continue if…" entry condition toggle + CondRow |
| Trigger picker | Full panel (`TriggerPicker`) to change the trigger event |
| Webhook trigger expansion | When trigger is webhook: shows unique webhook URL + "Copy" + "Capture sample" to add incoming fields |
| `FlowList` node canvas | The main builder area; renders the step node tree vertically |
| Flow summary sidebar | Sticky right panel: counts of Actions / Conditions / Branches / Waits / Goals + "Test this flow" button |
| Toast | Bottom-center confirmation when saving |

### Node types in the canvas (`FlowList`)

The builder uses a node-tree model. Each node has a `kind`:

| Kind | What it does |
|---|---|
| `action` | A step that does something: send SMS, send email, assign rep, create task, notify Slack, create/update a lead (`createLead`), convert a lead, create a company/deal, etc. |
| `condition` | An If/then branch: evaluates a field value, routes to `yes` or `no` child lists |
| `wait` | A delay node: waits N minutes/hours/days/weeks before the next step |
| `waitUntil` | Wait until a specific date/time or event |
| `goal` | A terminal condition: if the contact reaches this state, exit the flow as "goal met" |
| `branch` | Percentage or A/B split |

### Trigger library (`TRIGGER_CATS`)

The `TriggerPicker` groups triggers by category (Contact / Lead / Company / Deal / Smart Lists / Messaging / Activity / Scheduling), each with a plain-language "fires when…" hint. The **Lead** category tracks the current lead lifecycle statuses (New · Contacted · Nurturing · Sales-Ready · Disqualified):

- **Lead created** — a new lead is captured or imported
- **Lead status changed** — hint "New → Contacted → Sales-Ready, etc."
- **Lead qualified** — fires when a lead is marked **Sales-Ready** (there is no separate "Qualified" lead status)
- **Lead score reached** / **Lead source is** / **Lead converted** / **Lead assigned**
- **New ad lead received** — a lead is captured from a connected ad platform (Meta, Google…)

Because inbound capture channels — ad platforms (`ingestAdLead`), forms & funnels (`runFunnelSubmit`), and booking — now create **Leads** (status New) rather than Contacts, the Lead-category triggers see real inbound traffic, and lead-based enrollment/entry conditions fire on genuinely new leads.

### Entry conditions

The "Only continue if…" toggle (`entryOn`) adds an entry filter on the trigger. Example: trigger = Contact created, entry condition = Status is "Lead" — so only newly-created leads enter the automation, not all contacts.

### Webhook trigger

When the selected trigger includes "webhook", the drawer expands to show:
- A unique webhook URL (`https://hooks.nrtur.com/z/ab12cd`)
- Copy button
- "Capture sample" button that adds a sample field set (Zapier-style)
- Editable field pills for incoming webhook fields; removable with ×; add with Enter

### Dirty state / discard confirm

`dirty` state tracks any change (node, trigger, name, toggle). Cancel checks `dirty` and opens a "Discard changes?" confirm before navigating away.

---

### Design decisions

| Decision | Alternative | Why this | Tradeoff |
|---|---|---|---|
| Vertical node tree (not horizontal canvas) | Drag-and-drop canvas like Make.com or n8n | Vertical list is simpler to read for linear flows; most automations ARE linear; no spatial layout skill required | Deeply branched trees become tall and hard to scan; horizontal canvas scales better for complex logic |
| Recipe pre-load via `nav.recipe` | Template chooser modal inside the builder | User selects a template on the list page → builder opens already configured; saves one modal interaction | Pre-loaded recipes are hard to discover; user may not realise they can start from scratch |
| Inline name editing in breadcrumb header | Separate "rename" modal or settings section | Name is always visible while building; rename is one click | Easy to accidentally edit the name while tabbing; no character-limit feedback |
| `settingsIsAdmin()` gate on Test and edit controls | Role-based at the route level | Non-admins can still VIEW the builder in read-only mode (useful for understanding what an automation does) | Admin check is runtime JS; not a true auth boundary — backend must enforce independently |
| Entry condition toggle (optional filter) | Required condition for every automation | Most automations fire on all events of a type; the filter is optional to reduce friction for the simple case | Users may forget to set an entry condition and fire the automation on every contact |

---

### Frontend — what needs to be built

- `NodeTile` component: eyebrow label, accent color, icon, title, summary text, top/bottom port connectors, selected state
- `FlowList`: recursive node renderer for the tree; handles `yes`/`no` branches with nested `FlowList`s
- `FlowCfgProvider`: context that passes `goTo`, `flowName`, and any flow-level config to deep nodes
- `TriggerPicker`: full-panel trigger event selector grouped by category
- `CondRow`: single condition row (field selector + op selector + value input)
- Webhook field pill editor (add/remove/capture-sample)
- `countFlow(nodes)`: recursive counter for summary sidebar numbers
- `makeNode(preset)`: factory that creates a new node from a preset definition (`STEP_PRESETS_A`, `LOGIC_PRESETS_A`)
- Dirty-state guard on Cancel
- Admin-only gate on all mutating controls

### Backend — what needs to be provided

- `POST /automations` — create draft
- `PUT /automations/:id` — update trigger, name, nodes (full replace or JSON patch)
- `POST /automations/:id/activate` — validate + mark active
- `GET /automations/:id/logs` — run history (used by the in-builder Log modal)
- Webhook endpoint provisioning: `POST /webhooks` → returns a stable URL per automation
- Webhook field capture: `POST /webhooks/:id/sample` → stores the incoming payload schema

---

## 10.3 Automation Test Modal

### Surface inventory

| Element | What it is |
|---|---|
| Panel header | "Test automation" + "Simulate the flow — conditions pick the path." |
| Contact picker | 3 hard-coded QUICK contacts (Sarah Chen, James Rivera, Priya Nair) with status + deal + tag info |
| Run simulation button | Disabled until a contact is selected |
| Simulation trace | Step-by-step trace with depth indentation; icon + status color per step |
| Run again button | Resets `ran` state to re-run with same or different contact |

### Trace status icons

| Status | Icon | Color | Meaning |
|---|---|---|---|
| `ok` | Check | Emerald | Step executed successfully |
| `yes` | GitBranch | Emerald | Condition was true; took yes branch |
| `no` | GitBranch | Slate | Condition was false; took no branch |
| `wait` | Clock | Amber | Delay step; pauses here |
| `branch` | Filter | Purple | A/B or percentage split |
| `exit` | Target | Emerald | Goal met; flow exited |
| `skip` | X | Slate | Step was skipped (e.g. contact already has value) |

### `simulateFlow(flow, contact, out, depth)`

The simulation is a client-side pure function. It walks the node tree and pushes trace entries into `out[]`. Conditions evaluate based on the selected contact's properties (status, deal value, tag). The depth param drives the left indentation so branching is visually clear.

---

### Design decisions

| Decision | Alternative | Why this | Tradeoff |
|---|---|---|---|
| 3 hardcoded QUICK contacts | Let user pick any contact from CRM | Instant simulation without a search/API call; each QUICK contact represents a different archetype (customer, prospect, cold) | Does not simulate against the user's real data — a condition that checks "deal > $10k" may not match QUICK contacts the way it would match real ones |
| Client-side simulation only | Server-side dry-run | No network needed; immediate feedback | Cannot simulate steps that depend on live data (e.g. "check if contact has an open deal") — those steps always return a fixed result |
| Slide-in panel from right | Full-screen modal | Builder canvas stays visible behind the panel; user can still reference the flow while reading the trace | 500px panel is narrow on small screens; trace + contact picker compete for space |

---

### Frontend — what needs to be built

- Right-panel slide-in animation (`arIn` keyframe)
- `simulateFlow` recursive function: evaluates node kinds and condition logic against the contact object
- Trace row: depth-based left margin, status icon + color lookup from `ICON` map
- State machine: `sel` (selected contact) → `ran` (simulation triggered) → `out[]` (trace results)

### Backend — what needs to be provided

- None required for the prototype simulation
- Production: `POST /automations/:id/test` with `{ contactId }` → returns a full server-side dry-run trace including live CRM data lookups

---

## 10.4 Automation Log Modal

### Surface inventory

| Element | What it is |
|---|---|
| Header | "Run log" + automation name |
| Stats strip | Total runs · Success % · Failed count · Warning count |
| Status filter chips | All / Success / Warning / Failed |
| Log rows | Contact avatar + name · step count · timestamp · status badge |
| Error detail | For failed rows: "Step N failed — action could not complete" in red below the row |
| Empty state | Two variants: "No runs yet" (automation never ran) vs "Nothing matches this filter" |

### `logsForAuto(auto)`

Client-side function that generates log rows from the automation's `runs` count and `status`. In production this would be a backend query. The log modal is accessible from both the list page (via "Logs" button) and the builder (via "Run history" button).

---

### Design decisions

| Decision | Alternative | Why this | Tradeoff |
|---|---|---|---|
| Modal (not a page) for logs | Dedicated `/automations/:id/logs` route | User opens log without leaving the list view; quick check and back | Deep investigation (scrolling hundreds of rows) is cramped in a 560px modal; a full page would be better for high-volume automations |
| Step count shown as "N/M steps" | Full step-by-step breakdown per log row | List stays scannable; expanding a row for full trace is a separate interaction | "3/5 steps" doesn't tell you which step failed; user must look at the error detail line |
| Same modal from builder and list | Separate log views | One component, no duplication | Builder log context is sparse (automation just created, 0 runs) — the modal handles this with empty-state messaging |

---

### Frontend — what needs to be built

- Modal with status-filter chip tabs + filtered log list
- `LOG_ST` status map: success / warning / failed → badge styles + dot colors
- `logsForAuto(auto)` data function (replace with API call in production)
- Error detail row: conditionally rendered below failed log entries
- Two empty states based on whether `all.length === 0`

### Backend — what needs to be provided

- `GET /automations/:id/logs?status=&limit=&offset=` — paginated run logs
- Each log entry: `{ contact, avatar, color, steps: "3/5", status, time, errStep? }`
- Aggregate stats: `{ total, successPct, failCount, warnCount }` — ideally as a separate lightweight endpoint so the header stats load fast even if the row list is paginated

---

## 10.5 Enrolled Contacts Modal

### Surface inventory

| Element | What it is |
|---|---|
| Header | "Enrolled contacts" + flow name + "who is at which step right now" |
| Stats strip | Active count · Completed count (if > 0) · Exited count (if > 0) |
| Status filter chips | All / Active / Waiting / Completed / Exited |
| Contact row | Avatar · Name · Current step label + "Step N of M" + entered timestamp · Engagement icons · Status badge |
| Engagement icons | Delivered / Opened / Clicked link / Replied — small colored icons per contact |
| Unsubscribed variant | If `e.eng.unsub` is true and status is `exited`, badge shows "Unsubscribed" instead of "Exited" |
| Empty state | "No one is enrolled yet" or "Nothing matches this filter" |

### Enrollment states

| Status | Meaning |
|---|---|
| `active` | Contact is at a step and the step is running |
| `waiting` | Contact is at a delay node; waiting for the timer to fire |
| `completed` | Contact has finished all steps |
| `exited` | Contact left the flow early (unsubscribed, manual removal, or goal met) |

### `enrolleesFor(flow)`

Tries to find matching rows in `ENROLLEES` by `flow.name`. If none match, it generates synthetic rows from `flow.atStep[]` (the per-step enrollment counts from `autoFlow(a)`). This fallback ensures any automation has enrollee data even without real fixture data.

---

### Design decisions

| Decision | Alternative | Why this | Tradeoff |
|---|---|---|---|
| Step tracker as "Step N of M" text | Visual progress bar per contact | Compact; N of M is clear and doesn't need extra width | Progress bar would give a faster at-a-glance sense of where each person is in the flow |
| Engagement icons (4 tiny colored icons) | Engagement % aggregated across all contacts | Per-contact view tells you exactly who opened, clicked, or replied — actionable for sales follow-up | Icons are small (20×20px); users may not know what each icon means without a legend |
| Shared modal for automations + sequences | Separate modal per object type | `EnrolledContactsModal` accepts a generic `flow` object; reused in sequences tab too | The `flow` object must have `name`, `steps`, `atStep` — the caller must structure it correctly |

---

### Frontend — what needs to be built

- `enrolleesFor(flow)` function with real-data + synthetic-data fallback
- `ENG_ICONS` map: `[key, Icon, color, title]` tuples → small icon chips with hover title
- Status chips with counts in header stats strip
- Unsubscribe override in badge display logic
- Empty state with two message variants

### Backend — what needs to be provided

- `GET /automations/:id/enrollments?status=&limit=&offset=` — live enrollment rows
- Each row: `{ contact, avatar, step, stepLabel, status, enteredAt, engagement: { delivered, opened, clicked, replied, unsub? } }`
- Step count `M` from the automation definition (not the log)
- Real-time updates (polling or WebSocket) so "Active" contacts reflect their current step

---

## 10.6 Engagement Modal

### Surface inventory

| Element | What it is |
|---|---|
| Header | "Engagement" + flow name |
| Funnel bars | Sent → Delivered → Opened → Clicked → Replied — horizontal progress bars with absolute count + percentage |
| Metric grid | 3 cards: Bounce rate · Unsub rate · Reply rate (colored %, count of N/sent below) |
| Top clicked links | Ranked list of link labels with bar chart + click count; only shown if `flow.clicked != null` |
| Per-recipient link tracking | Table of who clicked + which link + wrapped URL + timestamp; only shown if `flow.clickers` has data |
| Recent activity feed | Event list: opened / clicked / replied / bounced / unsubscribed — contact name + detail + time |

### Funnel calculation

All percentages are `Math.round(n / sent * 100)`. Stages are conditionally included: `opened` and `clicked` only appear if the flow has those values non-null (email/push channels have them; SMS may not).

### Per-recipient link tracking

Each contact gets a unique wrapped URL (e.g. `nrtur.app/r/abc123`). When a click happens, the redirect maps back to the contact record. This means "who clicked" is exact, not estimated from aggregate rates. The `flow.clickers` array carries `{ contact, avatar, color, message, wrapped, time }`.

---

### Design decisions

| Decision | Alternative | Why this | Tradeoff |
|---|---|---|---|
| Funnel bars (horizontal progress) | Vertical funnel chart (trapezoid shape) | Horizontal bars are easier to build and label precisely in CSS; absolute numbers + % both shown | Not as visually striking as a traditional funnel; some users expect the tapering trapezoid |
| Unique wrapped links per contact | Aggregate click tracking (pixel-based) | Per-contact click data enables sales actions ("Ava clicked the pricing page — follow up now") | Requires a redirect service; every link in every message must be wrapped before send; URL wrapping can trigger spam filters |
| Bounce / Unsub / Reply as a 3-card grid | Inline metrics in the funnel | Negative signals (bounce, unsub) separated visually from the main funnel; colored differently (amber/red) | Grid adds vertical space; on small modals it pushes the link section below the fold |
| Recent activity feed in the same modal | Separate "Activity" tab | All engagement context in one scroll; no tab-switching while investigating a flow | Feed is limited to recent events; for full history a dedicated events page is needed |

---

### Frontend — what needs to be built

- Funnel bar renderer: `stages[]` array → conditional renders based on null check
- 3-metric grid with color coding (amber for bounce, red for unsub, purple for reply)
- Link breakdown: `ENG_LINKS` with proportional bar segments
- Per-recipient clickers table: wrapped URL pill in `sky-300` with copy affordance
- `EVIC` icon map for the activity feed: opened / clicked / replied / bounced / unsub
- `EngagementModal` accepts a generic `flow` prop shared between automations and sequences

### Backend — what needs to be provided

- `GET /flows/:id/engagement` — `{ sent, delivered, opened, clicked, replied, bounced, unsub, clickers[] }`
- Link redirect service: `POST /links/wrap` for each URL before send; `GET /links/:token` for redirect + click recording
- Activity feed: `GET /flows/:id/engagement/events?limit=20` — recent engagement events with contact + event type + timestamp
- Aggregate rates must be time-range filterable (all-time default; last 30 days for sequences)

---

## 10.7 AI Lead Qualification Rules (QUAL_ACTIONS)

### What this is

Not a standalone page — a sub-system used by the Calendar/Booking module. When an event type has a custom form attached, the event type editor exposes "Qualification rules": if/then rules evaluated against form answers when a lead books a meeting.

### Rule structure

Each rule has:
- `q` — the question field (from the attached custom form)
- `op` — operator: `is` / `contains` / `greater than`
- `value` — the target value to compare against
- `action` — one of `qualify` / `disqualify` / `route`
- `rep` — (only for `route`) which team member to assign

**Defined at line 17807-17808:**
```
const QUAL_OPS=['is','contains','greater than'];
const QUAL_ACTIONS=[['qualify','Qualify'],['disqualify','Disqualify'],['route','Route to rep']];
```

### `qualEvaluate(rules, ansByLabel)` — line 17814

Takes the rule set and a map of `{ questionLabel → answer }`. Evaluates each rule in order:
- `disqualify` wins: once set to `disqualified`, it cannot be overridden
- `qualify` only applies if not already `disqualified`
- `route` sets `routeRep` independently of qualify/disqualify

Returns `{ status, routeRep, reasons[] }`.

### Result display

- `qualified` → emerald "Qualified" badge (`QualBadge`)
- `disqualified` → amber "Review" badge (not shown as "Disqualified" to avoid alarming the invitee if they see confirmation emails)
- `route` → routes the booking to a specific rep

A `QualificationCard` component (line 17841) on the contact/lead detail page shows which form was filled, the answers, and the resulting status.

---

### Design decisions

| Decision | Alternative | Why this | Tradeoff |
|---|---|---|---|
| Rules evaluated in order, disqualify wins | Priority scoring system | Simple deterministic logic; no "weight" configuration needed; predictable for non-technical users | Cannot express "qualify if A AND NOT B"; order-dependent rules can surprise users who add a late qualifying rule that never fires because an early disqualify rule already ran |
| "Review" label instead of "Disqualified" on the badge | Show "Disqualified" literally | External-facing materials (email confirmations, calendar invites) might CC the invitee — "Review" is less off-putting | Internally, "Review" is ambiguous; a sales rep needs to know the actual status, not a softened label |
| Linked to event type, not to the automation system | Stand-alone qualification module or QUAL_ACTIONS in automations | Qualification happens at booking time; the result is stored on the contact and triggers routing — it naturally fits the calendar/scheduling domain | The qualification engine is isolated from the main automation builder; users can't use these conditions inside an automation node |
| `greater than` as the only numeric operator | Full set: `>`, `<`, `>=`, `<=`, `between` | Budget/revenue fields are the primary use case; "greater than X" covers "is this lead big enough?" | Cannot express "revenue between 10k and 50k" without two separate rules |

---

### Frontend — what needs to be built

- Rule list editor inside the event type settings: add/remove rules; `q` dropdown (populated from attached form fields), `op` select, `value` input, `action` select, conditional `rep` picker for route action
- `qualEvaluate` called client-side when testing qualification logic
- `QualBadge` shown on lead/contact detail header and list rows
- `QualificationCard` on detail pages showing form name, answers, status, and link to the form builder

### Backend — what needs to be provided

- `PATCH /event-types/:id` — include `qualRules[]` in the payload
- `POST /bookings/:id/qualify` — server-side evaluate against the booking's form submission; store `{ status, routeRep, reasons }` on the booking and propagate to the lead/contact record
- Routing: `POST /leads/:id/assign` with `repId` for the `route` action
- `GET /contacts/:id/qualification` — returns the most recent qualification result for display on the detail page

---

## Developer Q&A

**Q: What is the data shape of a node in the Automation Builder?**
A: From `makeNode(preset)`: `{ kind, id, label, Icon, bg, fg }`. The `kind` determines behaviour: `action` nodes are leaf steps; `condition` nodes also carry `{ field, op, value, yes: Node[], no: Node[] }` — two recursive child arrays. `wait`/`waitUntil` nodes carry `{ delay: {n, unit} }`. The tree is recursive — a `condition` node's `yes` branch can itself contain another `condition`. `countFlow(nodes)` walks this tree recursively to build the summary sidebar counts.

**Q: What's the difference between `AutomationsPage` (route `automations`) and `SettingsAutomationsPage` (route `settings-automations`)? They look identical.**
A: They serve the same feature from different navigation contexts. `AutomationsPage` (line 10930) renders with `AppSidebar active="automations"` — accessed directly from the main sidebar. `SettingsAutomationsPage` (line 16390) renders with `SettingsSubNav` — accessed from Settings or Engage Hub. The builder (`AutomationBuilderPage`) always navigates back to `settings-automations`, not `automations`. If a user entered from the main sidebar `automations` route, Save lands them on a different list page than where they started. This is a navigation bug.

**Q: How does `simulateFlow` evaluate conditions — does it use real contact data?**
A: No. The QUICK contacts are hardcoded in the modal: `{ name:'Sarah Chen', cstatus:'Customer', deal:'$28k', tag:'top-lead', days:3 }`. Condition evaluation compares `deal > 10` against those hardcoded values. A real production test must call `POST /automations/:id/test { contactId }` with live CRM data — the UI already has a "contact selection" step that implies this but the current implementation never hits a server.

**Q: If an automation errors on step 3 of 5 (e.g., Slack send fails), do steps 1–2 roll back?**
A: No rollback exists. The error state on the list card shows "Last run failed — {errStep}" but steps 1–2 that already executed stay executed. Most automation actions (send email, create task) are not transactional and cannot be undone. Production design decision: either accept partial execution with a "resume from failed step" option, or make all actions idempotent so a retry of the full run is safe.

**Q: The builder shows a "Save as draft" button and a "Save" button. What's the difference?**
A: Both call the same `save(msg)` function with different toast messages — `save('Saved as draft')` vs `save('Automation saved')`. There is no difference in the data saved. The `activated` toggle in the header is what controls whether the automation actually runs. "Save as draft" is just a label convention to signal "save but don't activate." In production, the two paths should produce different `status` values: `draft` vs `active`.

**Q: Non-admins can open the builder in read-only mode. Are the canvas inputs actually disabled?**
A: Not fully. `readOnly = !settingsIsAdmin()` hides the Active toggle, Test button, Save buttons, and shows the read-only banner — but the canvas inputs (name field, node forms in the trigger drawer, etc.) have no `disabled` attribute. A non-admin can type in the name or open the trigger drawer and edit fields, but cannot save. The canvas should use `<fieldset disabled={readOnly}>` like `SettingsAutomationsPage` does for the workflow list, but the builder doesn't apply this guard.

**Q: The template "Use template" flow navigates to the builder with `nav.recipe`. What if the recipe name doesn't match any case in the builder's initialiser?**
A: The builder's `useState` init falls through to the default flow: a pre-built condition node tree (assign → welcome → if deal > 10k → proposal/slack, else task). Only `'speed-to-lead'` is handled as a named recipe. All other templates from `AUTO_TEMPLATES` navigate to the builder without a recipe — the user lands on the default flow, not the template's steps. The template steps exist only in `AUTO_TEMPLATES` seed data and are not wired to the builder.

**Q: `qualEvaluate` runs rules in array order, and `disqualify` permanently wins. What happens if a user accidentally puts `disqualify` as the first rule?**
A: All subsequent `qualify` rules are silently skipped. The user gets a "Review" badge on every lead, even qualified ones. There is no rule ordering UI (drag-to-reorder) in the prototype — rules are appended in creation order. Production must either add reordering or change the evaluation to "last matching rule wins" (which is more intuitive but breaks the disqualify-wins guarantee).
