# Module 8 — Pipeline (Deals)

> **Route:** `pipeline` · `deal-detail` · `add-deal`
> **Components:** `PipelinePage` · `ObjectBoard` · `DealDetailPage` · `AddDealPage` · `DealOutcomeModal` · `NewPipelineModal` · `KanbanBoard`
> **Source lines (index.html):** 7368–8078

The Pipeline page is the central hub for all revenue-tracking activity. It is pipeline-first: the page title is the pipeline name, and switching pipelines is done from a dropdown in the title area — not from the CRM object tabs. Named deal pipelines (e.g., "Sales Pipeline", "Customer Onboarding") and custom-object pipelines all live under this one route. Pipelines themselves are Deals-only — Leads, Contacts, and Companies are no longer pipeline objects (the Leads page carries its own status-board view; see Module — Leads).

---

## 8.1 Pipeline Board View

**Route:** `pipeline` (default `boardView='board'`) · **Component:** `PipelinePage`

### Surface inventory

| Element | Detail |
|---|---|
| Skeleton | 1 000 ms; 5-column Kanban shimmer (column placeholder + 3 card shimmer each) |
| `PipelineSwitcher` | Dropdown in topbar subtitle listing all pipelines; Git-branch icon + pipeline name + chevron |
| Edit Stages toggle | Settings icon ⚙ next to pipeline name; turns into a green checkmark when active |
| View toggle | Board / List / Forecast button group (top-right) |
| `OmViewMenu` | Dropdown showing saved deal views (Favorites / System / Shared / Private / Smart Lists) |
| `OmFiltersButton` | Condition builder (AND/OR filter groups), same as other objects |
| `OmBoardSort` | "Sort within stages" dropdown — choose any field, asc/desc |
| View options ⋯ | AnchoredMenu: OmBoardSort + CardFieldsControl (board) or ColumnsControl (list) + Import deals |
| Metrics bar | 4 live metric tiles: Pipeline total, Won, Avg deal, Win rate + Forecast weighted total |
| `KanbanBoard` | Horizontally-scrollable columns; each column 290px |
| Column header | Stage colour dot + name + count badge + value (fmtK) + close % + ⋯ edit button |
| Deal card | Deal name (primary) + company sub-text + amount + tag pill + staleness dot/badge + owner avatar |
| "Add deal" footer | Dashed button at bottom of each column |
| Mobile stage tabs | Hidden on desktop; shows stage pill row above board; one column visible at a time |
| New Deal button | Brand-coloured, permission-gated |
| "Add stage" trailing column | Dashed 150px trailing slot on the right end of the board |
| `AppFooter` | "Drag deals between stages to move them" note |
| `DealOutcomeModal` | Appears on drag/drop to Won or Lost stage |

### Seed pipelines

The page seeds two deal pipelines:

**Sales Pipeline (id: 1)**

| Stage | Key | Colour | Close % | Rot threshold |
|---|---|---|---|---|
| Prospecting | `prospecting` | `#94a3b8` (slate) | 10% | 14d |
| Qualified | `qualified` | `#818cf8` (indigo) | 30% | 14d |
| Proposal | `proposal` | `#a78bfa` (violet) | 55% | 14d |
| Negotiation | `negotiation` | `#fbbf24` (amber) | 75% | 14d |
| Won | `won` | `#34d399` (emerald) | 100% | never |
| Lost | `lost` | `#f87171` (red) | 0% | never |

**Customer Onboarding (id: 2)** — 4 stages: Kickoff / In setup / Training / Live.

### Deal card fields (CardFieldsControl)

Six toggleable fields shown on each card:

| Field | Default on | Content |
|---|---|---|
| `name` | ✅ | Deal name primary (e.g. "Meridian — Managed CRM"); falls back to company name if `d.name` is blank. Company name shown as 11px muted sub-text below the deal name when both exist. |
| `amount` | ✅ | Deal value (right-aligned, bold) |
| `tags` | ✅ | Deal tag pill (e.g. "Follow up", "Contract sent") |
| `rot` | ✅ | Staleness dot + age OR "Stale Nd" amber badge if rotting |
| `contact` | ❌ | Primary contact name (from `primaryContact` or `contactsForCompany`) |
| `close` | ❌ | Expected close date |

The **rot indicator** renders differently based on `dealRotInfo(d, stage)`:
- Not rotting: coloured dot (red=hot, amber=warm, green=won, grey=cold) + age string (e.g. "5d")
- Rotting: amber "Stale Nd" badge + amber card border + ring
- Terminal stages (Won/Lost/Closed/Live) never flag as rotting

```
DEAL_ROT_DEFAULT = 14 days
dealRotInfo(d, stage) → { rotting: bool, days: number, thresh: number }
```

### Drag and drop behaviour

- Cards are `draggable` — HTML5 drag API, no external library
- Dragging is disabled when `editStages` is true
- Permission check: `canDrag = () => effCanObject('Deals','edit')` — no drag at read-only roles
- Visual feedback: dragged card goes `opacity-50 scale-[0.97]`; target column highlights with brand-500 border
- Drop on **Won or Lost column**: intercepts the move, stores `{dd, toStage, kind}` in `outcomePrompt` state, opens `DealOutcomeModal`. Move is only applied after the modal's "Mark Won/Lost" confirm.
- Drop detection: `/lost/.test(stageName)` → 'lost'; `/won|live/.test(stageName)` → 'won'
- All other drops: immediate move via `applyMove(dd, toStage)`

### applyMove

Two separate code paths:
1. **Real deals** (`stage.real === true`): updates `setDeals` — moves deal from its current `stageKey` to `toStage.key`, inserting it after the last deal already in that stage
2. **Demo/seed deals** (`stage.real` is falsy): mutates the `demo[]` array inside the pipeline's stage object

This distinction means real CRM deals and the prototype's seed data use different storage. Production will only have real deals.

### Metrics bar

Four hardcoded metric tiles + computed forecast:

| Metric | Value | Delta indicator |
|---|---|---|
| Pipeline | `fmtK(totalVal)` — sum of all visible deals | +12% (static) |
| Won | $134k (static) | +31% |
| Avg deal | $11.5k (static) | +4% |
| Win rate | 68% (static) | -2% |
| **Forecast** | `fmtK(fc_weightedTotal)` — sum(val × prob/100) | "weighted" label |

Only Pipeline and Forecast are computed live from the deal data. Won, Avg deal, Win rate are static seed numbers.

### Mobile behaviour

- `pipe-mob-tabs`: scrollable horizontal pill tab bar, one per stage. Visible only at narrow viewports via `hidden` + `pipe-mob-tabs` CSS class
- Clicking a stage pill tab sets `mobStage` index → that stage column gets `pipe-col-active` class, making it visible while others are hidden
- This means mobile board is single-column, navigated by tabs

---

### Design decisions

| Decision | Alternative | Why this | Tradeoff |
|---|---|---|---|
| Deal board always grouped by Stage | Allow grouping by Owner / Score / Tag (DEAL_GROUPS exists in code) | Stage IS the revenue funnel — grouping by anything else destroys the pipeline metaphor. Owner/Score are surfaced via filters and sort instead | Less flexibility than HubSpot, which lets managers group by owner to see team workload |
| Won/Lost columns visible on the board | Hide terminal stages; show only in a separate report | Serves as a live scorecard — reps see deals won this week without switching views | Won columns accumulate indefinitely and widen the board; production should auto-archive terminal deals older than 30 days |
| "Stale Nd" amber badge for rotting deals | Plain age label on every card | The rot badge fires only when `days >= rotDays` for that specific stage — a context-aware urgency signal, not just raw age | Reps must learn what "stale" means; a silent age dot is less alarming but also less actionable |
| HTML5 native drag-and-drop (no library) | dnd-kit, react-beautiful-dnd | Single-file prototype constraint — no npm dependencies | No keyboard accessibility, limited ARIA support, cross-browser inconsistencies; must replace with a proper library in production |
| Deal name as card primary label; company as sub-text | Company name only (original prototype behaviour) | A company can have multiple deals — showing only "Meridian Agency" makes two cards indistinguishable. Deal name carries the business context ("Managed CRM" vs "Add-on Services"). All major CRMs (Pipedrive, HubSpot, Salesforce, Attio) use deal name as primary | None — fallback to company name when `d.name` is blank ensures no card is empty |

---

### Three lenses

**Frontend**
- `dealsFor(stage)` first scopes deals to the **active pipeline** via `dealInActivePipe(d)` (`(d.pipeline || defaultPipe) === active.name`), then matches `stageKey`, then runs `omApplyFilter` + `omSortRows`. A deal appears only on its own pipeline's board — not on every pipeline that happens to have a stage with the same key. This is O(stages × deals × conditions) per frame; memoise with `useMemo([active.id, workFilter, workSort, _deals])`.
- `fc_stageRows` is computed once and shared by Board metrics, List (for the flat listFlat), and Forecast — it's the right single-computation pattern to keep.
- Mobile: `pipe-col-active` and `pipe-mob-tabs` are driven by CSS classes. The `mobStage` index must clamp to `active.stages.length - 1` (already done via `Math.min`).
- `publishRecordCtx('deal', allVisible.map(d=>d.id))` publishes visible deal IDs to a shared context for the global search highlight and for the `RecordSwitcher` on detail pages.

**Backend**
- `GET /pipeline/:pipelineId/deals?stage=...` — stages with their deals must be returned in stage order.
- The board's column values (`sval` = sum of visible deal amounts per stage) must be computable from deal data alone — no pre-aggregation needed.
- Drag-and-drop moves a deal from stage A to stage B: `PATCH /deals/:id { stageKey: 'proposal' }`. Backend must write the `stageKey` and update `lastActivity`.
- `rotDays` is a per-stage configuration stored on the pipeline, not on deals. The rotting indicator is computed client-side from `lastActivity`. Backend must return `lastActivity` as a timestamp on every deal.
- Won/Lost moves trigger outcome recording: `PATCH /deals/:id { stageKey, outcomeReason, outcomeNote, closedAt }`.

**Design**
- The 290px column width is the tightest practical width for a card with two rows of content. Cards that show all 6 fields at once would need 320px+ — use the CardFieldsControl to let users decide.
- The rotting card's amber border and ring uses the same amber as the "Going Cold" warning system in the Companies list. Visual consistency across the product: amber = needs attention.
- The metrics bar is information density without being noise. The static Won/Avg/Win rate tiles should become live once real data is flowing — but the layout is right.

---

### Competitive position

- **HubSpot Deals board**: 250px columns, groupable by pipeline OR stage OR team member. Shows deal name, amount, and close date by default. More grouping flexibility than nrtur's fixed-by-stage approach.
- **Pipedrive**: The canonical deal pipeline. Rotting is a first-class feature (configurable per stage). nrtur's rot system matches Pipedrive's model closely.
- **Salesforce Kanban**: Available in Lightning. No native rot indicator — requires custom fields or Apex triggers.
- **Close CRM**: Pipeline as a list of stages, not a Kanban board. Close is call-first; nrtur is board-first.
- **Attio**: Supports multiple view types (Kanban, list, board) with a flexible field-based grouping. More flexible than nrtur but less opinionated.

---

## 8.2 Pipeline List View

**Component:** `PipelinePage` (`boardView === 'list'`)

### Surface inventory

| Element | Detail |
|---|---|
| BulkBar | Appears when ≥1 deal selected; "Move stage" action is deal-specific |
| Column header row | Sticky, sortable, with freeze-first toggle |
| `DealRowDyn` | One row per deal; columns from `shownDealCols` |
| `DealStageDropdown` | Inline stage chip with colour; opens popup listing all stages |
| `ContactOwnerDropdown` | Inline owner assignment |
| `ColumnsControl` | Column show/hide + freeze-first toggle |
| Empty state | No deals icon + "No deals match this view" + "New Deal" CTA |

### DEAL_COLS (list columns)

| Key | Label | Width | Default | Content |
|---|---|---|---|---|
| `name` | Opportunity | minmax(220px,1.7fr) | ✅ | Deal name (link to detail) + company sub-text |
| `company` | Company / Contact | 150px | ✅ | Company name + primaryContact sub-text |
| `stageName` | Stage | 132px | ✅ | `DealStageDropdown` inline chip |
| `amount` | Amount | 104px | ✅ | Deal value, bold tabular-nums |
| `owner` | Owner | 80px | ✅ | `ContactOwnerDropdown` inline |
| `closeDate` | Close date | 112px | ✅ | Formatted "Jun 28" style |
| `age` | Age | 80px | ✅ | Heat dot (hot/warm/won/cold colour) + age string |
| `pipeline` | Pipeline | 130px | ❌ | Pipeline name |
| `score` | Heat | 84px | ❌ | Pill chip: Hot/Warm/Cold/Won |
| `source` | Source | 120px | ❌ | Source text |
| `nextAction` | Next action | 1.2fr | ❌ | Next action text |
| `tags` | Tags | 1.2fr | ❌ | Tag chips (up to 3) |

### List view specifics

- **Flat list**: deals from all stages combined — not grouped by stage. Sorted by `closeDate` ASC if no active sort.
- **Per-pipeline column config**: `colsMap[activeId]` — each pipeline can have its own column set.
- **Freeze first column**: optional sticky left column; the Opportunity name stays visible while scrolling right. Toggled via `ColumnsControl`.
- **Minimum width**: `Math.max(900, 240 + (shownCols.length - 1) * 150 + 56)` — prevents the list from becoming too compressed.
- **Inline stage change**: `DealStageDropdown` in the Stage column triggers `applyMove` via `lvStage`. No outcome modal from the list view — only board drag-drop triggers it.
- **Inline owner**: `ContactOwnerDropdown` in the Owner column.
- **Navigate to deal**: clicking the `name` column cell opens `deal-detail`. The ArrowRight icon on hover also navigates. Only works for real (non-demo) deals: `d._stage && d._stage.real`.
- **BulkBar for deals**: includes "Move stage" dropdown (all stages of the active pipeline) in addition to shared actions (Assign owner, Add tag, Remove tag, Archive, Delete).

---

## 8.3 Forecast View

**Component:** `PipelinePage` (`boardView === 'forecast'`)

### Surface inventory

| Element | Detail |
|---|---|
| Header | "Weighted forecast" title + "Open value × stage probability" subtitle |
| Total display | Weighted total (right-aligned, 20px bold) + unweighted total sub-text |
| Stage table | One row per stage: colour dot + name + count + probability + unweighted value + weighted value |
| Progress bar | Horizontal bar showing each stage's share of total pipeline value |
| Footer row | "Weighted total" + sum |

### Computation

```
fc_stageRows = active.stages.map(stage => {
  deals = dealsFor(stage)          // filtered + sorted deals for this stage
  val = sum(parseMoney(d.value))   // unweighted stage value
  weighted = val × (stage.prob / 100)
  return { stage, deals, val, weighted }
})
fc_weightedTotal = sum(fc_stageRows.weighted)
```

The weighted forecast appears in two places: in the metrics bar (on every view) and in the Forecast tab's big number. The computation is the same.

### Design decision

| Decision | Alternative | Why this | Tradeoff |
|---|---|---|---|
| Stage probability weighted forecast | Commit-based forecast (reps manually flag each deal as Commit / Best case / Omitted) | Simpler — the stage already implies a conversion rate; no rep input required. The `forecast` field on deals exists but is deliberately unused here | Less accurate for mature teams who know which specific deals will close vs. which are aspirational; a future version can layer commit categories on top |

---

## 8.4 Edit Stages Mode

**Component:** `PipelinePage` (`editStages` state)

### Activation

Toggled via the ⚙ Settings icon button in the topbar subtitle (next to the pipeline name). While `editStages` is true:
- The ⚙ icon turns into a green ✓ checkmark button
- Two additional buttons appear: Duplicate pipeline (Copy icon) and Delete pipeline (Trash icon, disabled if only 1 pipeline)
- The pipeline name becomes an editable input in the title area
- The Kanban board switches from drag-to-move to drag-to-reorder mode
- Deal card click-to-open is disabled

### Edit actions per stage column

| Action | UI | Behaviour |
|---|---|---|
| Reorder stage | Drag handle (Grip icon) + drag column | `onDropStage(i)` — splices `stages` array |
| Insert stage between | "+" buttons between columns | `insertStageAt(index)` — splices new stage at that index |
| Rename stage | Inline input in column header | `renameStage(id, name)` on blur; blank name → "Untitled stage" |
| Set probability | Range slider (0–100%) in column header | `setProb(id, value)` |
| Set rot threshold | Number input (days) — hidden for Won/Lost/Closed/Live | `setRot(id, value)` |
| Change colour | Click the colour dot → 3-preset + custom colour wheel | `setColor(id, colour)` |
| Delete stage | X button | `delStage(stage)` → confirm dialog → "Deals in this stage will be moved to the previous stage." Disabled if only 1 stage. |
| Add stage (trailing) | Dashed "Add stage" column at the far right | `addStageInline()` → new stage with generated id + auto-focus the name input |

### Pipeline-level actions (visible when editStages is true)

| Action | Trigger | Behaviour |
|---|---|---|
| Rename pipeline | Editable input in topbar title | `renamePipeline(name)` on blur |
| Duplicate pipeline | Copy icon button | `dupPipeline()` — creates a copy with same stages (demo arrays empty), switches to new pipeline |
| Delete pipeline | Trash icon button (disabled if `pipelines.length <= 1`) | `delPipeline()` → confirm dialog → `requireText: active.name` → removes from `pipelines`, switches to next remaining |

### Colour picker

6 presets (`STAGE_PRESET6 = ['#94a3b8','#818cf8','#a78bfa','#fbbf24','#34d399','#60a5fa']`) + a `CustomColorWheel` component for any hex colour. The current stage colour is shown with a double ring (selection indicator).

### Stage probability implications

Win probability is used for the Forecast weighted total. Setting a stage to 100% marks it as closed-won; 0% marks it as closed-lost. These aren't enforced — just convention the forecast relies on.

---

### Design decisions

| Decision | Alternative | Why this | Tradeoff |
|---|---|---|---|
| Stage editing inline on the board | Dedicated "Settings > Pipelines" page (Pipedrive's approach) | Inline keeps context — you see how the board looks as you rename, reorder, and recolour stages. No context switch needed | The ⚙ icon is easy to miss; discoverability is lower than a named settings page |
| Deleting a stage auto-moves deals to the previous stage | Prompt user to choose a destination stage | Safest non-destructive default — deals never disappear | If stage order is Prospecting → Negotiation → Won and you delete Negotiation, deals land back in Prospecting instead of somewhere more appropriate; production should let the user pick the destination |
| `cfgOpen` right-panel drawer exists but has no trigger | Remove it | Was an earlier parallel implementation of stage editing (420px side panel, lines 7929–7961) | Dead code — no UI button opens it. Must be removed before production or it will confuse developers |

---

### Three lenses

**Frontend**
- `editStages` disables `dragEnabled` on `KanbanBoard` so deal drag-drop doesn't interfere with stage drag-drop
- `focusStageId` state: when a new stage is added inline, the corresponding column header input auto-focuses via `autoFocus={focusStageId===stage.id}`
- `focusName` state: when creating a new pipeline, the pipeline name input auto-focuses in the title bar
- Stage order changes are in-memory only. Production needs `PATCH /pipelines/:id { stages: [...] }` with the new stage order

**Backend**
- Stage definitions live on the pipeline, not on individual deals: `{ stages: [{ id, name, color, prob, rotDays }] }`
- `rotDays` per-stage allows different freshness expectations at different pipeline stages (e.g., Negotiation deals rot faster than Prospecting deals)
- Deleting a stage requires: (1) find all deals in that stage, (2) move them to the target stage, (3) delete the stage record — all in one transaction
- Pipeline name/stage changes must be propagated to any deal with that stageKey if stage keys are name-based (in the prototype, `stageKey` is a stable key like `'prospecting'`, not the display name — preserve this separation)

---

## 8.5 New Pipeline Modal

**Component:** `NewPipelineModal` · Width: 520px centered

### Surface inventory

| Element | Detail |
|---|---|
| Header | "Create pipeline" + "Choose what this pipeline tracks" |
| Object grid | 2-col grid of object option buttons — **Deals + any custom objects only** (no Leads/Contacts/Companies) |
| Pipeline name input | Only shown when `obj === 'deal'`; auto-focused |
| Info text | Shown for a custom object: describes the board it will open |
| Footer | Cancel + "Create pipeline" (deals) / "Open pipeline" (custom object) |

### Object options

The picker (`OBJS`) is `[{k:'deal',…}]` concatenated with the workspace's custom objects. Leads, Contacts, and Companies were removed — pipelines are Deals-only, and those objects are no longer pipeline objects.

| Option | Label | Description | Behaviour on create |
|---|---|---|---|
| `deal` | Deals | "Sales opportunities" | Creates a new pipeline with "Lead in" + "Won" stages; navigates to it with `editStages=true` |
| _(custom objects)_ | Object plural name | "Custom object" | Switches to `cop_{objectId}` pipeline |

For Deals: "Create pipeline" → `addPipeline(name)` → new pipeline object with id=Date.now(), two starter stages, `setEditStages(true)`, `setFocusName(true)`.

For a custom object: button label is "Open pipeline" — just switches `activeId` to the `cop_{objectId}` pipeline. No new pipeline is created; the custom-object board already exists.

### Design decision

| Decision | Alternative | Why this | Tradeoff |
|---|---|---|---|
| "Open pipeline" for a custom object navigates instead of creating | Create a separate pipeline record per custom object | The custom-object board already exists — there's nothing to create. The modal's role for these objects is navigation, not creation. Button label changes to "Open pipeline" to signal this | Users who expect every option in the modal to behave the same way (create) may be confused by the asymmetry |
| Pipelines are Deals-only; Leads/Contacts/Companies removed from the picker | Keep them as selectable "pipeline" objects | A pipeline is a revenue funnel; Leads have their own status-board view on the Leads page, and grouping Contacts/Companies by a status field is a table concern, not a pipeline. Removing them keeps "pipeline" meaning the deal funnel | Users migrating from GHL/HubSpot (where any object can be a pipeline) lose that flexibility; custom-object boards remain the escape hatch |

---

## 8.6 Deal Detail Page

**Route:** `deal-detail` (param: deal `id`) · **Component:** `DealDetailPage`

### Surface inventory

| Section | Element | Detail |
|---|---|---|
| **Header** | Breadcrumb | "← Pipeline > [company name]"; back navigates to pipeline |
| | RecordSwitcher | Arrow buttons cycle through deals |
| | "Move to [next stage]" | Brand button; advances to next stage in `DEAL_STAGE_ORDER` |
| | Schedule button | Opens `CalEventFormModal` |
| | More menu (⋯) | Edit deal / Create invoice / Create quote / Delete deal |
| **Left panel** | Profile card | Company name (24px) + value (32px bold) + current stage pill |
| | Stage progress bar | 5 dot steps: Prospecting / Qualified / Proposal / Negotiation / Won |
| | `RecordProperties` | Primary + secondary fields |
| **Right panel** | `RecordTasks` | Tasks matched by deal company |
| | `ActivityTimeline` | `kind="deal"`, note + schedule only |
| **Footer** | `RecordMetaFooter` | Created by / Created at / Last activity |
| **Drawers** | `RecordEditDrawer` | 2 groups: Deal + Additional details |
| | `CalEventFormModal` | Pre-filled with deal + company + contact |

### Stage progress bar

`DEAL_STAGE_ORDER` = `STAGES_DATA` with Lost filtered out → `['Prospecting','Qualified','Proposal','Negotiation','Won']` — 5 steps, not including Lost (Lost is a terminal off-ramp, not a linear rung).

```
DEAL_STAGE_COLOR = {
  Prospecting: '#94a3b8', Qualified: '#818cf8', Proposal: '#a78bfa',
  Negotiation: '#fbbf24', Won: '#34d399'
}
```

Each dot:
- Done (≤ current index): filled with stage colour + glow shadow
- Current: filled + double ring halo (`0 0 0 3px colour33, 0 0 10px colour99`)
- Future: grey placeholder

Clicking a dot advances or retreats the deal to that stage:
- Clicking "Won" or "Lost" → opens confirm dialog (inline `openConfirm`) before applying
- Clicking any other stage → applies immediately

**"Move to [next stage]"** button in the header: shortcut to advance one stage without clicking the progress bar. Disappears when the deal is on the last stage (Won).

### Primary fields (dealPrimary)

| Key | Label | Type | Notes |
|---|---|---|---|
| `name` | Name | text | required |
| `amount` | Amount | currency | **SENSITIVE** — masked below Team Lead |
| `pipeline` | Pipeline | select | Sales Pipeline / Onboarding Pipeline (hardcoded, not dynamic) |
| `dStage` | Stage | pill | Prospecting / Qualified / Proposal / Negotiation / Won / Lost (`DEAL_STAGES_ALL`) |
| `probability` | Probability | percent | 0–100 |
| `closeDate` | Expected close date | date | |
| `owner` | Owner | owner | |
| `primaryContact` | Primary contact | lookup | → contact-detail (resolves the real named person via `d.primaryContactId`, id-first, name fallback) |
| `company` | Company | lookup | → company-detail (resolves via `d.companyId`, id-first, name fallback) |
| `nextAction` | Next action | text | |
| `dealTags` | Tags | tags | |
| `dStatus` | Status | pill | read-only: Open / Won / Lost |

The `primaryContact` and `company` lookups now resolve by id first (`d.primaryContactId` / `d.companyId`), falling back to the display-name match, then — for the contact only — to the first contact at the company. This means a deal's Primary contact links to the actual named person, not merely "the first contact at the company".

⚠️ **Prototype inconsistency:** `pipeline` field lists only "Sales Pipeline" and "Onboarding Pipeline" as hardcoded options — it doesn't read from the `pipelines` state in `PipelinePage`. Changes to pipeline names or new pipelines won't appear here. Production must populate this from the pipelines API.

`dStage` pill options are `DEAL_STAGES_ALL` — the full canonical stage set (Prospecting / Qualified / Proposal / Negotiation / Won / Lost), derived from `STAGES_DATA`. This is now the one source of truth shared by every deal screen; there is no longer a separate hardcoded five-item list.

### Secondary fields (dealSecondary)

| Key | Label | Type | Options |
|---|---|---|---|
| `additionalContacts` | Additional contacts | relcontacts | contact links with role labels |
| `source` | Source | select | Website / Referral / LinkedIn / Cold outreach / Event / Other |
| `amountType` | Amount type | select | One-time / ACV / TCV / ARR / MRR |
| `forecast` | Forecast category | select | Pipeline / Best case / Commit / Closed / Omitted |

### More menu actions

| Item | Gate | Action |
|---|---|---|
| Edit deal | `effCanObject('Deals','edit')` | Opens `RecordEditDrawer` |
| Create invoice | `effCanPay('create')` | → `payments` page, tab=invoices, pre-filled contact + company + dealId |
| Create quote | `effCanPay('create')` | → `payments` page, tab=quotes, pre-filled (stub) |
| Delete deal | `effCanObject('Deals','delete')` | Confirm dialog, `requireText: d.name || d.company`, soft delete |

### ActivityTimeline on Deal Detail

`kind="deal"`, supports `onAddNote` + `onSchedule` only. No email compose, no dialer — deals are company-level, not contact-level. Notes added via `onAddNote` create a `mkAct('note')` item; `extra` now reads from the shared `crm.activities` store (filtered by `subjectType==='deal'` + `subjectId`) and `setExtra` writes via `crm.addActivity`, so logged notes/tasks **persist across navigation** rather than being lost on leaving the record.

RecordTasks match: `t.deal?.includes(d.company) || t.company === d.company` — a loose match by company name.

### Stage change via `onDealField`

When the `dStage` property is edited in `RecordProperties` or `RecordEditDrawer`:
```
onDealField('dStage', 'Proposal') →
  setStage(v)
  updateDeal(d.id, { dStage: v, stageKey: DEAL_STAGE_KEY_BY_NAME[v] || d.stageKey })
```

The name→key lookup is `DEAL_STAGE_KEY_BY_NAME`, the canonical map derived from `STAGES_DATA` (covers all stages incl. Prospecting and Lost) — not a hand-written subset. This keeps the local `stage` display state in sync with the persisted `stageKey`.

---

### Design decisions

| Decision | Alternative | Why this | Tradeoff |
|---|---|---|---|
| Deal value shown as 32px bold in the profile card | Value only in the `RecordProperties` panel like any other field | The value is the single most important fact on the page — it determines whether the deal deserves the time being spent. 32px makes it impossible to miss without opening the edit drawer. Same choice Pipedrive makes | Duplicates the field (profile card + properties panel); both must stay in sync |
| Stage progress bar has 5 dots (Prospecting → Won), no Lost dot | Include Lost as a 6th terminal dot | Lost is a funnel exit, not a forward step. Showing it as the last dot implies it's a goal to reach. Keeping the bar aspirational (ends at Won) is better for rep motivation | A lost deal shows a stage pill saying "Lost" with no dot highlighted — the progress bar doesn't reflect the true terminal state; production should handle this with a distinct "Closed - Lost" visual state |
| `amount` and `primaryContact` appear in both the profile card and `RecordProperties` | Profile card read-only only; remove from properties panel | `RecordProperties` is the editing surface. Profile card is read context. Same dual-role pattern used on Contact and Company detail pages | Looks like duplication; new developers will wonder why the field appears twice |

---

### Three lenses

**Frontend**
- `DEAL_STAGES_ALL`, `DEAL_STAGE_ORDER`, `DEAL_STAGE_COLOR`, and `DEAL_STAGE_KEY_BY_NAME` are module-level constants all **derived from `STAGES_DATA`** — one canonical stage vocabulary shared by the detail ladder, stage selects, filters, and name→key mapping. `DEAL_STAGE_ORDER` is `STAGES_DATA` minus Lost (the happy-path ladder); `DEAL_STAGES_ALL` is the full set including Lost.
- `allDeals()` is called at the top of `DealDetailPage` to get the current deal. This reads from `_liveDeals` (the CrmDataContext deals) and falls back to `STAGES_DATA` seed. The detail page should receive the deal via prop or route param, not re-query the global list.
- `omLayoutSplit(dealPrimary, dealSecondary, 'Deals', _propsCtx)` merges with custom properties from `PropertiesContext`, same as other detail pages.
- The CalEventFormModal is pre-filled with `{ type:'meeting', deal: d.company+'·'+d.value, company: d.company, contact: dealContact?.name, linkType: 'contact' }` — the deal reference is a concatenated display string, not a structured ID.

**Backend**
- `GET /deals/:id` must return: all primary fields, `stageKey`, `stageName`, `stageColor`, `owner`, `ownerColor`, `primaryContactId` + `primaryContact`, `companyId` + `company`, `createdBy`, `createdAt`, `lastActivity`. (The prototype now stores the id links alongside the display names.)
- Updating `dStage` must validate that the new stage exists in the deal's pipeline.
- `additionalContacts` is an array of `{contact: string, role: string}` mirrored by `additionalContactIds[]` — the lookup relation. Ids are the authoritative link; the name strings are denormalised display copies.
- `amount` with `sensitive:true` requires field-level visibility control — same as `annualRevenue` on Company.
- Delete is soft delete: `{ deleted: true, deletedAt, deletedBy }`. Restore available from Recycle Bin.

---

## 8.7 Add Deal Page

**Route:** `add-deal` · **Component:** `AddDealPage`

### Surface inventory

| Element | Detail |
|---|---|
| Header | Breadcrumb "Pipeline > New deal"; X close button → pipeline |
| Icon + title | GitBranch icon + "Add a deal" + "Start tracking a new opportunity in your pipeline." |
| Form card | `rounded-2xl` container |
| Footer | Cancel (→ pipeline) + "Create deal" (→ deal-detail, stub) |

### Fields

| Field | Width | Type | Notes |
|---|---|---|---|
| Deal name | full (col-span-2) | text | Placeholder "e.g. Q3 Retainer" |
| Company | full (col-span-2) | text | Placeholder "Search or add..." |
| Deal value | half | currency | $ prefix, mono input |
| Close date | half | date picker | `colorScheme: dark` |
| Stage | full (col-span-2) | select | Options: `DEAL_STAGE_ORDER` (Prospecting/Qualified/Proposal/Negotiation/Won) |

**Absent from Add Deal form:**
- Pipeline selector (defaults to active pipeline)
- Owner (defaults to current user)
- Primary contact (assigned after creation)
- Tags, probability, forecast category, source (all secondary)
- Amount type (ACV/ARR/etc.)

No validation in prototype. "Create deal" navigates to `deal-detail` with no ID passed (stub).

### Design decision

| Decision | Alternative | Why this | Tradeoff |
|---|---|---|---|
| Deal name and Company fields full-width (col-span-2) | Half-width like Value and Close date | These two fields are the deal's identifiers — they appear on board cards, list rows, and search results. Full width prevents truncation during entry and signals their importance | Uses more vertical space on the form |

---

## 8.8 Deal Outcome Modal

**Component:** `DealOutcomeModal` · Width: 440px centered

### Triggers

Two paths:
1. **Board drag-drop** onto a Won or Lost column → `setOutcomePrompt({dd, toStage, kind})` → modal
2. **NOT triggered** by clicking stage dots on the Deal Detail progress bar — that uses inline `openConfirm` (simpler "are you sure?" dialog, no reason capture)

Stage name detection: `/lost/.test(nm)` → 'lost'; `/won|live/.test(nm)` → 'won'. The `/live/` match means any stage named "Live" also triggers the won outcome modal (used in Customer Onboarding pipeline).

### Content

| Element | Won | Lost |
|---|---|---|
| Header icon | TrendUp (emerald) | TrendDown (red) |
| Header colour | emerald ring | red ring |
| Title | "Mark Won" | "Mark Lost" |
| Subtitle | "[Deal name] → [stage name]" | "[Deal name] → [stage name]" |
| Reason buttons | 6 pre-set reasons, 2-col grid | 6 pre-set reasons, 2-col grid |
| Note textarea | Optional, 2 rows | Optional, 2 rows |
| Confirm button | "Mark Won" (emerald bg) | "Mark Lost" (red bg) |

**Won reasons:** Best fit / value · Competitive price · Strong relationship · Product capabilities · Good timing · Other

**Lost reasons:** Price too high · Chose a competitor · No budget · No decision / timing · Went silent · Not a fit

Default: first option pre-selected. Exactly one must be selected (buttons are radio-style, no multi-select).

### On confirm

```
onConfirm(reason, note) →
  applyMove(outcomePrompt.dd, outcomePrompt.toStage)
  setDeals(ds => ds.map(x => x.id===dd.id
    ? {...x, outcome:{ result: kind, reason, note: note||'', closedAt: Date.now(), closedBy: 'Alex Morgan' }}
    : x))
  toast("Deal marked Won · [reason]")
  setOutcomePrompt(null)
```

The reason and note are now **persisted on the deal** as `deal.outcome = { result, reason, note, closedAt, closedBy }`. The deal detail page surfaces it below the profile-card stage pill (e.g. "Won · Competitive price — [note]", emerald for won / red for lost).

---

### Design decisions

| Decision | Alternative | Why this | Tradeoff |
|---|---|---|---|
| Require a win/loss reason (no "skip") | Optional reason or no reason capture | Outcome reasons are the dataset for win/loss analysis. Capturing at the moment of the drag — when the rep knows why — is the highest-quality collection point. HubSpot, Pipedrive, and Salesforce all support this | Adds a mandatory step every time a deal is moved to Won/Lost; reps in a hurry may pick whatever reason is first |
| 6 pre-set reasons (not a free-text field) | Open text field for custom reason | Structured options → consistent data → reportable. Free text produces "price" / "Price" / "too expensive" / "PRICE" — all meaning the same thing but unanalysable. The optional Note field captures extra context | Pre-sets may not fit every industry; teams with unusual loss patterns will overuse "Other" |
| Progress bar on Deal Detail uses a simple confirm dialog (not the full outcome modal) | Always use the full outcome modal for Won/Lost moves | The progress bar handles general stage navigation in both directions — backward moves should not force a reason. The outcome modal fires at drag-drop where intent to close is clearest | Reps who mark Won via the detail page don't leave a win reason; outcome data is incomplete if they bypass the board |

---

## 8.9 Custom-Object Pipelines (ObjectBoard)

**Component:** `ObjectBoard` · Rendered when `selPipe.object !== 'deal'`

### What it is

When the active pipeline is a custom-object pipeline (`cop_{customObjectId}`), `PipelinePage` renders `ObjectBoard` instead of its own board. ObjectBoard is a Kanban + list view for a custom CRM object. Leads, Contacts, and Companies are no longer pipeline objects, so ObjectBoard now serves custom objects only.

### allPipelines composition

```javascript
allPipelines = [
  ...pipelines,   // deal pipelines (id:1 Sales, id:2 Onboarding, etc.)
  ..._auxPipes,   // custom-object pipelines opened on demand
]
```

`_auxPipes` derives from `auxPipelines` — custom-object pipelines the user has opened from the New-pipeline modal, mapped to `{ id:'cop_'+o.id, name:o.plural, object:o.id, customObj:o }`. `addAuxPipeline(cop_…)` adds the entry the first time it's opened (or just switches to it if already present). Built-in Leads/Contacts/Companies pipelines are gone — they are no longer part of the switcher.

### Grouping

ObjectBoard groups records by a field, selectable via a "Group by" dropdown in the toolbar. For a custom object the available groups are **all its Single select fields + Owner**.

The column values come from the chosen field's distinct values across all records. The order respects the field's `options` array first, then any values found in records that aren't in the options.

> **Note:** The component still carries a dormant `BUILT` map for `lead`/`contact`/`company` (used only as an unreachable `BUILT[objKind] || BUILT.lead` fallback). Since pipelines are Deals-only, those built-in objects are never routed here anymore — `allPipelines` only ever produces deal or `cop_` custom-object pipelines. Treat the `BUILT` map as dead code pending removal.

### Cards

Simpler than deal cards:
- Record name (bold)
- Sub-text: `r_company` (the custom record's company field)
- Owner avatar + initials + name
- Hover arrow

No amount, no rot indicator, no tag pill, no configurable card fields.

### Edit stages

Available for **custom objects** on **non-owner group fields** (`canEditStages = !!custom && gf !== 'owner' && canEdit`):
- Insert stage between columns
- Rename stage (editable input)
- Set stage colour (12-colour palette `STAGE_PAL`)
- Delete stage — sets records in that stage to empty string
- Add stage (trailing dashed column)
- Reorder by drag

### Remove from pipelines

The gear menu's "Remove from pipelines" action removes only the pipeline **view** — the custom object and its records are untouched:
1. Opens a confirm dialog ("Remove '[plural]' from pipelines?", body: "the [plural] and their records are not affected. You can add it back anytime from 'New pipeline'.")
2. Calls `onDeletePipeline()` → drops the entry from `auxPipelines`
3. Toast + switches to pipeline id 1 (Sales Pipeline)

The custom object definition is **not** deleted here — reopen the board anytime from the New-pipeline modal. (Deleting the object itself lives in Settings → Custom objects.)

### Board vs List view

ObjectBoard has its own Board/List toggle. List view is a simple `<table>`: record name + sub-text | group-by field (colour dot + value) | Owner avatar + name. Clicking a row navigates to `custom-record`.

### Gear menu (Settings icon on ObjectBoard)

| Item | Condition | Action |
|---|---|---|
| Edit stages | `canEditStages` | Toggles `editStages` on the board |
| Open [plural] | always | Navigates to the custom object's main list page (`custom-object`) |
| Configure object | custom only | `goTo('settings-custom-objects')` |
| Remove from pipelines | custom only | Confirm dialog → removes the pipeline view only (object + records untouched) |

---

### Design decisions

| Decision | Alternative | Why this | Tradeoff |
|---|---|---|---|
| Pipeline hosts Deals + custom-object boards only; Leads get a status board on their own page | Keep Leads/Contacts/Companies as pipeline objects too | "Pipeline" should mean the deal revenue funnel. Leads have their own List/Board status view on the Leads page; Contacts/Companies grouping is a table concern. Custom objects still get Kanban boards here for genuinely funnel-shaped custom workflows | Managers lose one unified Kanban surface for every object; they now look in two places (Pipeline for deals/custom, Leads page for the lead status board) |
| Only Single select fields qualify for Kanban column grouping on custom objects | Allow any field type as a grouping axis | Only a finite discrete set of values creates finite columns. Text/number/date/relation fields produce unlimited or unmanageable column sets | Custom objects with no Single select fields get no board view at all — they must use list view only |
| Removing a custom-object pipeline removes the view only, not the object | Delete the object and its records with the pipeline | The pipeline view is decoupled from the object definition (added on demand via `auxPipelines`). Removing it is non-destructive; the object still lives in Settings → Custom objects and can be re-added anytime | A user wanting to fully delete a custom object must do it from Settings, not from the pipeline gear menu — two locations for two different intents |

---

### Three lenses (ObjectBoard)

**Frontend**
- `ObjectBoard` re-uses `KanbanBoard` — same drag/drop primitives as the deals board
- `omApplyFilter(baseRows, workFilter, omFields)` applies the same filter engine used on list pages
- `move(id, toVal)` calls `crm.updateCustomRecord(custom.id, id, {[gf]: toVal})` for custom records. (The `desc.set(...)` branch exists for the dormant built-in fallback and is not reached in normal use.)
- The `doneCol` detection (`/complete|done|won|live|closed/i.test(c.val)`) drives the completion % shown in the summary bar — it identifies the "terminal success" column automatically from its name

**Backend**
- For custom objects: `PATCH /custom-records/:id { [fieldKey]: newValue }`
- Stage rename for custom objects must cascade: all records with the old value need to be updated to the new value — `renameStage` does both the field `options` update and the records update atomically in the prototype
- Removing a custom-object pipeline is a **view-only** operation: it drops the entry from `auxPipelines` and does not touch the object definition or its records. Deleting the object itself is a separate `DELETE /custom-objects/:id` (cascades to records) invoked from Settings → Custom objects

---

### Developer Q&A (Module 8 combined)

**Q: The board only shows one pipeline at a time. If a deal is in two pipelines, how is that handled?**
A: The prototype has no concept of a deal belonging to multiple pipelines. A deal has a single `stageKey` that corresponds to one pipeline. If production needs multi-pipeline tracking (e.g., a deal in both a Sales pipeline and an Onboarding pipeline), the data model needs a join table: `deal_pipeline_stage (dealId, pipelineId, stageId)`. This is a significant model change.

**Q: Won and Lost stages are in `STAGES_DATA` but are "terminal" — deals in them never rot and shouldn't be actively managed. Should they be collapsed or hidden?**
A: The prototype shows them as full-width columns. A better UX would be to collapse or side-scroll Won/Lost into a summary (e.g., "5 won · $238k" compact section) to keep the actionable stages prominent. The `rotDays` guard (`/won|lost|closed|live/i.test(stageName)`) already excludes terminal stages from rot detection. Production should also exclude them from the "visible deals" count in the metrics bar.

**Q: `dealsFor(stage)` runs `omApplyFilter` + `omSortRows` on every render for every stage column. At 10 stages × 100 deals × 5 filter conditions, how bad is this?**
A: 10 × 100 × 5 = 5 000 comparisons per render. Not catastrophic at small scale, but it fires on every state update — including hover events that re-render cards. Memoize `dealsFor` with `useMemo([active.id, workFilter, workSort, _deals])`. In production with 1 000+ deals, also consider windowed rendering within each column.

**Q: Does `DealOutcomeModal` store the outcome reason and note on the deal record?**
A: Yes. `onConfirm(reason, note)` calls `applyMove`, then `setDeals(...)` to write `deal.outcome = { result, reason, note, closedAt, closedBy }` onto the moved deal, then toasts. The deal detail page reads `d.outcome` and renders the reason + note under the profile-card stage pill. Production maps this to `PATCH /deals/:id { outcomeReason, outcomeNote, closedAt }`.

**Q: The stage progress bar on Deal Detail uses `DEAL_STAGE_ORDER` (5 items) but `STAGES_DATA` has 6 stages including Lost. How does a Lost deal look on the detail page?**
A: A lost deal shows the stage pill as "Lost" (via `d.stageName`) but the progress bar only highlights up to Won — there's no Lost dot. The progress bar doesn't know the deal is Lost. Production should: either add a Lost dot (exit indicator) to the progress bar, or hide the progress bar for terminal deals and show a different "Closed - Lost" state card.

**Q: The `additionalContacts` field is typed as `relcontacts` and stores `[{contact: string, role: string}]`. How is this different from `primaryContact`?**
A: `primaryContact` is the display name; `additionalContacts` is an array of `{contact, role}` pairs. Deals now also carry **id links alongside** the names — `deal.primaryContactId`, `deal.companyId`, and `deal.additionalContactIds[]` — backfilled by the one-time `migrateLinks()` at app start and minted on every live create path. Joins resolve id-first with name fallback, so a deal's Primary contact links to the real named person (not "the first contact at the company"). Production can drop the denormalised name strings once ids are authoritative everywhere.

**Q: Custom object pipelines with `canEditStages` allow renaming stages on the board. Does renaming cascade to records?**
A: Yes — `renameStage(oldv, nv)` in ObjectBoard updates both `o.fields[].options` (the field definition) AND `o.records[r][gf]` (all records with the old value) in one `updObj` call. This is an atomic in-memory update. Production needs a transaction: `BEGIN → UPDATE custom_field_options SET value=new WHERE value=old → UPDATE custom_records SET field_value=new WHERE field_value=old → COMMIT`.
