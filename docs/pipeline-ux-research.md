# How HubSpot, GoHighLevel & Zoho actually do pipelines — research

*Web-verified deep-dive (June 2026) commissioned to correct nrtur's pipeline UX. The first nrtur attempt used an "Object" selector at the top of the board; this research showed that's the wrong axis and drove the pipeline-first rebuild. Sources at the end.*

---

## The consensus model (all three agree)

1. **The primary board switcher is a named-pipeline dropdown** — you pick *which pipeline* (Sales, Onboarding, Renewals…), not *which object*.
2. **A pipeline is a first-class, user-named entity that owns its own ordered stages.** Renaming/reordering stages in one pipeline never touches another.
3. **A card belongs to exactly one pipeline + one stage** (two properties on the record). Moving across pipelines forces re-picking a stage, because stages are pipeline-specific.
4. **The object is chosen when you *create* the pipeline**, then implicit while you use the board. Nobody makes Contacts/Companies a "pipeline" — pipelines hold deal/opportunity/ticket/custom records that move through stages.
5. **Safe stage/pipeline deletion migrates records** ("move existing cards to which stage?") so nothing is orphaned.
6. **Per-stage probability → weighted board total; terminal Won/Lost stages** for forecasting.

---

## Per-CRM

### GoHighLevel (the most pipeline-centric — agency favorite)
- **Selector:** Opportunities → a **pipeline dropdown** at the top of the board is *the* selector; switching it swaps the whole Kanban. A sibling "Pipelines" tab lists/creates them (with stage count + last-updated).
- **Model:** a pipeline = a named, ordered stage set. **Every pipeline holds the same one object — the "Opportunity"** (GHL's word for a deal). Pipelines don't each define an object; they only define stages. `Status` (Open/Won/Lost/Abandoned) is a *separate axis* from stage.
- **Create:** Opportunities → Pipelines → "Create new pipeline" → name → add stages inline (Won/Lost auto-created) → reorder with arrows → per-stage color + dashboard-visibility toggles. Delete a stage forces a "move existing opportunities to…" picker.
- **Non-sales:** just another pipeline of Opportunities (Onboarding: Welcome→Intake→Kickoff→Assets→Live; Fulfillment per service).
- **Pitfalls to avoid:** cross-pipeline moves are broken-feeling (drag only works *within* a pipeline; bulk/automation **duplicates** instead of moving, sometimes stripping created-date/owner); Stage-vs-Status double-counting; card customizations stored per-user in browser localStorage (don't sync).

### HubSpot
- **Selector:** object-first (left nav: Deals/Tickets/custom), then a **named-pipeline dropdown** at the top-left of that object's board. Two-level, but the pipeline dropdown is the board switcher.
- **Model:** a pipeline is a named stage-set **attached to an object** (Deals, Tickets, Leads, Orders, custom objects). Pipeline + Stage are two properties on the record. Tickets call stages "statuses" (same engine, different word).
- **Create:** Settings → Objects → [object] → Pipelines tab → Create pipeline → name → stage table (+Add stage, inline rename, drag-reorder, color, deal probability). Per-stage **conditional required fields** ("you can't move the card here until X is filled") + per-stage **automation** (Automate tab). Required Closed-won (100%) / Closed-lost (0%).
- **Non-sales:** Tickets (built-in support pipeline), or a **custom object with its own pipeline** (onboarding, candidates).
- **Pitfalls to avoid:** tier-gated pipeline counts; deal-stage vs lifecycle-stage confusion; two automation homes (Automate tab vs Workflows). For a prototype: one consistent word ("stage"), one stage concept, one automation home.

### Zoho CRM
- **Selector:** Deals module Kanban → a **Layout** dropdown then a **Pipeline** dropdown (the pipeline picker only appears when "Categorize by = Stage").
- **Model:** a Pipeline is first-class but **Deals-only** and layout-bound: Module → Layout → Pipeline → Stage. Each pipeline owns its stages + probabilities.
- **Create:** Setup → Customization → Pipelines → + New Pipeline → name → associate a Layout → define stages (name, probability, record category) → drag to reorder. "Set as Default" per layout. Delete = mandatory **stage-mapping migration** ("Transfer and Delete").
- **Stage groups:** Open / Closed Won / Closed Lost categorize stages so the system knows terminal states + forecast roll-ups.
- **Non-sales:** a **custom module** + a stage picklist + a **Blueprint** (state machine enforcing transitions/required fields/actions) + Kanban. The named multi-pipeline UI itself stays Deals-only.
- **Pitfalls to avoid:** Deals-only restriction; heavy Layout coupling; the pipeline dropdown is hidden unless categorized-by-stage (discoverability); one Stage picklist partitioned per pipeline (confusing); Blueprint over-engineering locks reps out.

---

## What this means for nrtur

- **Lead with the pipeline, not the object.** nrtur already had a named-pipeline switcher — it was just cosmetic. The fix made it the single selector and listed deal pipelines **+ one per custom object** (so hiring/onboarding can be their own object, HubSpot-style — the most capable of the three models, vs GHL's single-Opportunity model).
- **Copy:** named-pipeline dropdown · each pipeline owns its stages · object tag per pipeline · per-stage probability + weighted total (already present for deals) · delete-with-migration (already present) · terminal Won/Lost.
- **Skip (prototype):** Zoho's Layout layer + Blueprint engine; HubSpot's tier maze; GHL's duplicate-on-cross-pipeline-move bug. One word ("stage"), one stage concept, always-visible pipeline picker.

---

*Sources (web-verified): HubSpot — Set up & manage object pipelines, Manage records in board view, Set up pipeline rules. GoHighLevel — Understanding Pipelines, Creating Pipelines (step-by-step), Understanding Opportunities. Zoho CRM — Multiple Sales Pipeline (help + tutorial), Creating Kanban Views, Blueprint. Companion: `pipeline-custom-objects-research.md`.*
