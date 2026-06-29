# Pipeline / Kanban for objects beyond Deals — research & recommendation

*Question: how should the pipeline (kanban board) cover custom objects — not just Deals — the way other CRMs do? Grounded in the actual code; competitor notes are web-verified (sources at the end).*

---

## TL;DR

Today nrtur has **one** kanban (`PipelinePage`) and it's **wired to Deals only**. Every other object — Contacts, Companies, Leads, Tasks, and all **Custom Objects** — is a table.

The industry has converged on a **generic** answer: a kanban board is just a **view that groups records by a single-select / status field**, and it works on *any* object (standard or custom). The good news: **nrtur's data model already supports this** — a custom object can have a "Single select" field, its value is stored as a plain string on the record, and there's already an update path. The missing piece is purely **view-layer** (a board renderer + a "group by this field" picker + drag-to-move).

**Recommendation: add a generic "Board" view (group-by-a-select-field) to custom objects — don't clone the Deals pipeline per object.** Medium effort, high payoff, matches how Salesforce / Zoho / monday / Airtable / Attio all do it.

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
5. **Promote it to a shared engine** — extract `PipelinePage`'s board into a generic `KanbanBoard({rows, setRows, groupByFieldKey, columns, cardFields, detailRoute})` and have **both** Deals and custom objects render through it. The audit confirms the scaffolding is conceptually generic; reuse is blocked only by ~5 hardcoded couplings (the `stageKey` literal, the deals data source, deal schema/columns/permissions, deal-shaped cards, and deal behaviors like the won/lost modal).
6. **Later / power-tier:** HubSpot/Zoho-style per-stage rules (required fields, allowed transitions, automations) layered on the same status field.

**Why this and not "give every object its own Deals-style pipeline":** the generic board is less code, matches user expectations from every modern tool, needs no new data model (the select field *is* the pipeline), and keeps the powerful Deals pipeline (forecast, won/lost, probability) as a specialized superset rather than something to duplicate five times.

**Effort:** Medium — it's a view-layer feature; the data model already fits. **Risk:** Low (additive; the table view stays). **Benefit:** High — turns "Custom Objects" from static tables into workflow boards (projects, tickets, applicants, properties…), which is the main reason teams adopt custom objects.

---

## Verdict

**Approved — generic group-by-select Board view for custom objects. Readiness to build: ~85/100.** The only real design choices are (a) whether to ship it custom-objects-only first or generalize to all objects, and (b) whether to refactor the Deals board into the shared engine now or later (recommend: ship the generic board for custom objects first, refactor Deals into it as a fast-follow).

---

*Sources (web-verified by the research pass): HubSpot pipelines & board view, set-up-pipeline-automations; Salesforce Kanban guide + Kanban configuration + Path/Kanban Trailhead; Zoho CRM Kanban views + customizing-kanban; Pipedrive data organization + pipeline-management + "leads as kanban" community thread; monday.com Kanban view; Airtable Kanban views; Attio create-and-manage-kanban-views + status-tracking changelog.*

*Companion docs: `custom-objects-research.md`, `crm-system.md`, `customization-research.md`.*
