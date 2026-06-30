# Pipeline / Kanban for objects beyond Deals — research & recommendation

*Question: how should the pipeline (kanban board) cover custom objects — not just Deals — the way other CRMs do? Grounded in the actual code; competitor notes are web-verified (sources at the end).*

---

## TL;DR

Today nrtur has **one** kanban (`PipelinePage`) and it's **wired to Deals only**. Every other object — Contacts, Companies, Leads, Tasks, and all **Custom Objects** — is a table.

The industry has converged on a **generic** answer: a kanban board is just a **view that groups records by a single-select / status field**, and it works on *any* object (standard or custom). The good news: **nrtur's data model already supports this** — a custom object can have a "Single select" field, its value is stored as a plain string on the record, and there's already an update path. The missing piece is purely **view-layer** (a board renderer + a "group by this field" picker + drag-to-move).

**Recommendation: add a generic "Board" view (group-by-a-select-field) to custom objects — don't clone the Deals pipeline per object.** Medium effort, high payoff, matches how Salesforce / Zoho / monday / Airtable / Attio all do it.

> **✅ Built (this branch):** `CustomObjectListPage` now has a **Table / Board** toggle and a **Group by** picker (over the object's Single-select fields). The board renders one column per option (+ an "Uncategorized" column), with colored headers + counts; cards show the record name, company, a couple of field pills, and the owner; **drag-to-move** patches the chosen field via `crm.updateCustomRecord` (gated by `effCanCustom('edit')`). Owner-scoping and the Om filter/search carry over (it shares the same scoped `list`). Verified on the demo **Projects** object grouped by **Stage** — including a drag that moved a record between columns.
>
> **✅ Built (step ⑤ — shared engine, this branch):** the board layout + card drag-and-drop are now a single reusable **`KanbanBoard`** component (defined just above `PipelinePage`). **Both** the Deals pipeline *and* the custom-object board render through it — the Deals board passes its rich stage headers (incl. inline stage-editing), deal cards (rotting, card-field toggles), the won/lost outcome modal (via `onMove`), the stage-reorder drag (`colProps`), and the insert-stage / add-stage slots (`leading` / `trailing`); the custom board passes its simpler header/card. Verified end-to-end with 0 console errors: Deals Board renders (6 stages, 16 cards, forecast), a non-terminal drag moves a deal, a drag onto **Won** fires the **Mark Won** modal, Edit-stages still works, List + Forecast views unaffected; the custom Projects board still drags. (Steps ④ option ordering and ⑥ per-stage rules remain as fast-follows.)
>
> **✅ Built (Deals group-by, this branch):** the Deals Board now has a **Group by** picker (`Stage` / `Owner` / `Score` / `Tag`) in the board toolbar — the same generic "group records by a field" capability custom objects have, but on a built-in object. `Stage` is the default and keeps the full pipeline (stage-edit, won/lost, forecast, mobile stage tabs); the other fields render a generic board through the *same* `KanbanBoard` engine — columns are the field's distinct values (+ a `None` column), with per-column count + weighted $ sum, and **drag-to-reassign** writes the field (deriving `ownerColor` via `arOwnerColor` for Owner, and copying `tagBg`/`tagFg` for Tag). Verified with 0 console errors: switching to Owner shows rep columns (SC/JK/RL/MR/AM) and a drag re-assigned a deal's owner; Score and Tag pivot correctly; switching back to Stage restores the pipeline unchanged. This is the first half of the "let any object — Deals included — get the generic group-by board" recommendation.
>
> **⚠️ Superseded — first attempt (object-selector):** an early version put an **Object** selector (Deals/Leads/Companies/Contacts/custom) at the top of the board. That was the wrong axis — it copied the Airtable/monday "group by a field" *lens*, not the CRM *pipeline* model. Web research on HubSpot, GoHighLevel and Zoho (see `pipeline-ux-research.md`) confirmed all three lead with a **named-pipeline dropdown**, where a pipeline is a first-class entity that owns its own stages and a card lives in exactly one pipeline + one stage; the object is decided when you *create* the pipeline, not switched on the board. Nobody treats Contacts/Companies as pipelines.
>
> **✅ Built (pipeline-first, this branch — the correction):** the Pipeline page's single switcher is now the **named-pipeline dropdown** (the existing one, fixed + extended), not an object selector. `allPipelines` = the deal pipelines (`object:'deal'`) **plus one derived pipeline per custom object that has a stage field** (`{id:'cop_'+id, name, object, customObj}`); each menu row shows the object it tracks (`Sales Pipeline · Deals`, `Customer Onboarding · Deals`, `Projects · Project`). Selecting a deal pipeline shows the full rich board; selecting a custom-object pipeline early-returns the generic `ObjectBoard` (grouped by that object's stage field, drag-to-move via `updateCustomRecord`), which carries its **own** pipeline switcher in its header so you can jump back. Routing is driven by the selected pipeline's `object`, and `active` stays a valid deal pipeline so the deal hooks never see a non-deal pipeline. Verified with 0 console errors: the switcher lists all three pipelines with object tags; picking Projects renders Planning/In progress/On hold/Complete and a drag moved a record; switching back to Sales restores the rich pipeline with the Won modal, edit-stages and Stage/Owner/Score/Tag group-by intact.
>
> **✅ Built (ObjectBoard parity + stage editor, this branch):** the custom-object board now matches the deals board visually and functionally — 290px columns, two-line stage headers (name + count, then `N · X% of total`), a summary bar (`Total · Stages · {terminal} %`), per-column `+ Add {singular}` footers, a `New {singular}` button, and a real **stage editor** (toggle "Edit stages") that adds / renames / recolors / reorders / deletes the grouping single-select field's options — persisted on the custom-object def via `setCustomObjects`, with record values migrated on rename/delete (colors stored in a new `field.optColors` map). Stage editing is gated to custom-object pipelines grouped by a select field. Verified 0 errors: parity controls present, Edit-stages shows rename/color/reorder/delete + "Add stage", adding a stage created a 5th column, "Done" returns to the normal two-line header; the deals board is untouched.
>
> **✅ Built (shared PipelineSwitcher, this branch):** the pipeline switcher was the most visible drift — the deals page used a rich `data-pipe-menu` GitBranch dropdown while the object board used a plain native `<select>`. Extracted that dropdown into one `PipelineSwitcher` component (defined above the board components) now used by **both** the deals page and `ObjectBoard`, so the switcher is byte-identical everywhere (same entries, object tags, counts, checkmarks, "New pipeline"). `addPipeline` is passed down to object boards so "New pipeline" works from them too. Verified 0 errors: the two boards render the same switcher menu; no native pipeline `<select>` remains; switching deal↔custom both ways works. *Remaining deal-only chrome (not yet on object pipelines): List/Forecast views, Filters/saved-views, won/lost + per-stage probability/forecast — these are genuinely deal-specific.* *Deferred:* multiple **real** deal pipelines that partition the deal pool (today only Sales holds real deals; Customer Onboarding is demo) — needs `addPipeline`→real stages + `deal.pipelineId` + an add-deal pipeline assignment.

---

## What nrtur does today

**The pipeline is Deals-only.** `PipelinePage` (`index.html:7531`) is the single kanban in the app (Board / List / Forecast views). It's hardwired to Deals throughout:
- Cards come from `CrmDataContext.deals`; grouping is `deals.filter(d => d.stageKey === stage.key)` — the grouping field is the literal `d.stageKey`.
- Drag-to-move writes `{stageKey: toStage.key}`; the Won/Lost columns force a deal-specific outcome modal; the forecast assumes a `$ value` per deal; cards hardcode deal fields and link to `deal-detail`; permissions are all `effCanObject('Deals', …)`.
- **Object type is never a parameter** — `'deal'` / `'Deals'` / `stageKey` are baked in.

Stages themselves are reasonably generic (`{key, name, color, prob}`, fully editable, multi-pipeline switcher) — but the *board* around them is a deals-only monolith. *(Side note: the multi-pipeline UI exists, but the deal→pipeline link is a loose unpersisted string the board doesn't actually route by — worth tidying separately.)*

**Custom Objects are a clean, table-only system.** `customObjects` lives in `CrmDataContext`; the builder lets an author define up to 5 objects with typed fields. Crucially:
- The field types include **Single select**, **Multi select**, and **Boolean** — i.e. status-capable fields. The demo "Projects" object already has a **"Stage"** Single-select (`Planning / In progress / On hold / Complete`) — but the app renders it as an ordinary colored pill with **no pipeline semantics** (no ordering, no drag-to-advance, no rollups).
- A record stores each select value as a **flat scalar** at `rec[fieldKey]`, and there's already an update path (`crm.updateCustomRecord(def.id, rec.id, {[fieldKey]: newValue})`).
- The list page runs the shared Om filter/sort engine — but has **no group-by / board mode**.

So the storage model is *already* board-ready; only the view is missing.

---

## How other CRMs do it

Two schools, and a clear winner for a flexible CRM:

| Approach | CRMs | How it works |
|---|---|---|
| **Generic "group-by-a-select-field" board** (the winner) | **Salesforce, Zoho, monday, Airtable, Attio** | A kanban is a *view setting*, not a special object. You pick a single-select / status / picklist field; its options become the columns; dragging a card sets that field. Works on standard **and custom** objects. |
| **First-class "pipeline" property** (richer, narrower) | **HubSpot** | A board appears only if the object has a configured *pipeline* — an ordered-stage property with per-stage required fields, automations, and probability. Available on many objects incl. custom objects (Enterprise). More powerful, more setup. |
| **Bespoke deals-only pipeline** (outlier) | **Pipedrive** | The kanban is hard-wired to Deals; no user-defined objects, no generic board (leads sit in a separate inbox and must convert to deals). |

**The dominant pattern is the generic one:** *a single-select field defines the columns + a board view groups by it + drag updates the field.* Salesforce literally exposes "Kanban" as a Display-As mode of any list view; Zoho's Kanban is enabled on any module that has a picklist; monday/Airtable/Attio are object-agnostic by design.

Notably, **nrtur's Deals pipeline today is closest to Pipedrive's bespoke model** — the one approach the rest of the industry has moved *away* from for anything beyond deals.

---

## Recommendation

**Build a generic Board view for custom objects (and, ideally, any object) — grouped by a designated Single-select field. Do not clone the Deals pipeline per object.**

Concretely, lowest-friction first:

1. **Add a "Board" view toggle to `CustomObjectListPage`** beside the existing table. A small "Group by" picker lists the object's Single-select fields; the chosen field's `options[]` become the columns; each record sits in the column matching `rec[fieldKey]`.
2. **Drag-to-move** patches the one field via the existing `crm.updateCustomRecord` — no schema change. Reuse `PipelinePage`'s column/card styling and the Om filter scaffolding for the cards.
3. **Per-column count + sum** (reuse the forecast math, but generic — sum any Currency/Number field the user picks, not a hardcoded `$ value`).

Then, optionally:
4. **Option ordering** — add an order to a select field's options so columns aren't just array-order (today there's no ordering metadata).
5. **Promote it to a shared engine** — ✅ **done (this branch).** Extracted a generic `KanbanBoard` that owns the column layout + card drag-and-drop + drop placeholder; callers supply `columns` (`{key, header, rows, footer}`), `renderCard(row, col, dragProps, dragging)`, `onMove(id, fromKey, toKey)`, `canDrag`, `dragEnabled`, and styling/slot hooks (`colClass` / `bodyClass` / `colProps` / `leading` / `trailing`). The ~5 couplings the audit flagged were all resolved by passing them in: the deals data source + `stageKey` write live in `onMove` (which still routes won/lost through the outcome modal), deal-shaped cards live in `renderCard`, and the stage-editing chrome lives in the header node + `colProps`/`leading`/`trailing`. Both Deals and custom objects now render through the one component.
6. **Later / power-tier:** HubSpot/Zoho-style per-stage rules (required fields, allowed transitions, automations) layered on the same status field.

**Why this and not "give every object its own Deals-style pipeline":** the generic board is less code, matches user expectations from every modern tool, needs no new data model (the select field *is* the pipeline), and keeps the powerful Deals pipeline (forecast, won/lost, probability) as a specialized superset rather than something to duplicate five times.

**Effort:** Medium — it's a view-layer feature; the data model already fits. **Risk:** Low (additive; the table view stays). **Benefit:** High — turns "Custom Objects" from static tables into workflow boards (projects, tickets, applicants, properties…), which is the main reason teams adopt custom objects.

---

## Verdict

**Approved — generic group-by-select Board view for custom objects. Readiness to build: ~85/100.** The only real design choices are (a) whether to ship it custom-objects-only first or generalize to all objects, and (b) whether to refactor the Deals board into the shared engine now or later (recommend: ship the generic board for custom objects first, refactor Deals into it as a fast-follow).

---

*Sources (web-verified by the research pass): HubSpot pipelines & board view, set-up-pipeline-automations; Salesforce Kanban guide + Kanban configuration + Path/Kanban Trailhead; Zoho CRM Kanban views + customizing-kanban; Pipedrive data organization + pipeline-management + "leads as kanban" community thread; monday.com Kanban view; Airtable Kanban views; Attio create-and-manage-kanban-views + status-tracking changelog.*

*Companion docs: `custom-objects-research.md`, `crm-system.md`, `customization-research.md`.*
