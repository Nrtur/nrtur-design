# Lead ↔ Deal Separation (Wave 2)
_Priority: Critical · Status: fixed & render-verified · 2026-07-01_

This wave ends the collision between the **lead lifecycle** and the **deal pipeline**, and stops non-deal objects from masquerading as pipelines.

## How it was (the problems)
1. **"Qualified" meant two different things.** It was a **lead status** (`LEAD_STATUSES`) *and* a **deal pipeline stage** (`DEAL_STAGES_ALL`). On screen they looked identical, so a lead being "Qualified" was indistinguishable from a deal sitting in the "Qualified" stage — the classic lead/deal fusion.
2. **Leads, Contacts, and Companies could be turned into "pipelines."** The "New pipeline" dialog offered them alongside Deals, and each got a full drag-between-stages Kanban — presenting a contact's *status* and a company's *type* as if they were sales stages.
3. **Converted leads stayed editable.** After a lead was converted into a Contact/Company/Deal, you could still change its status, edit its fields, and log activity on the dead lead record.

## How it is now (the fix)
- **Lead statuses renamed so nothing collides with a deal stage:** the lead lifecycle is now **New → Contacted → Nurturing → Sales-Ready → Disqualified**. "Qualified" and "Unqualified" no longer exist on the lead side; the deal pipeline keeps its own "Qualified"/"Lost" stages untouched. The 5 seeded leads that were Qualified/Unqualified were migrated to Sales-Ready/Disqualified, and **every** consumer moved in lock-step — the status dropdowns, chip/dot colours, the dashboard conversion funnel + lead-funnel widgets (labels **and** the predicates behind them), saved views, export lists, automation trigger hints, the booking-flow status writer, and the property definitions.
- **Pipelines are Deals-only now.** Leads/Contacts/Companies were removed from the "New pipeline" object picker and from the aux-pipeline machinery, so they can no longer become pipeline boards. Custom objects can still have boards.
- **Leads got their own Board — on the Leads page.** The Leads page now has a **List / Board** toggle. The Board is a Kanban grouped by lead status (a *view* of leads, not a "pipeline"), reusing the same board engine as Deals. Dragging a card writes the lead's status. It lives on the Leads page, never in the deal-pipeline switcher.
- **Converted leads are locked read-only.** A single `canEditLead = can-edit AND not-converted` flag now gates the status dropdown, the inline properties, the "Edit lead" action, the schedule button, and the activity composer.

## The one trap we avoided
A shared colour map (`PILL_C`) colours **both** lead-status pills and deal-stage pills through one `'Qualified'` key. We **added** `Sales-Ready`/`Disqualified` keys rather than renaming `Qualified` — renaming it would have blanked the deal "Qualified" stage pill. Similarly, the Contacts' identical-looking status list, the lowercase form/booking "qualified" qualification system, and free-text `qualified` tags were all deliberately left untouched.

## Why this is better
- One word now means one thing. A lead is "Sales-Ready"; a deal can be "Qualified". No screen conflates them.
- Pipelines represent sales progressions only; a contact's status and a company's type are shown as what they are (categories/status views), not sales stages.
- Reporting is honest — the conversion funnel counts real Sales-Ready leads, and dragging on the new Leads board updates the right field.
- A converted lead can't be accidentally edited after it becomes a Contact/Deal.

## What you still need to decide
- Nothing blocks this wave. Open, deferred items:
  - **Contacts/Companies board views** were *not* added (they stay list + filters, as recommended — their status/type Kanban is rarely useful). Say the word if you want them.
  - The old pipeline-page code paths for lead/contact/company boards (`PipeObjSelect`, `ObjectBoard` built-in descriptors, an unused `pipeObject` state) are now **dead code** — harmless, left in place; can be cleaned up later.
  - `PROP_STAGES`/`SCHED_DEAL_STAGES` deal-stage consistency (from Wave 1's deferred list) is still open.

## Verified
- Babel parse clean; headless render (precompiled) mounts with **zero console errors**.
- `LEAD_STATUSES` = New/Contacted/Nurturing/Sales-Ready/Disqualified; seed leads migrated.
- Deal pipeline still shows all 6 stages incl. **Qualified**; **no "Sales-Ready" leaked into deals**.
- `PILL_C` keeps `Qualified` and gained `Sales-Ready` (deal pill safe).
- Leads page: List renders; **Board renders with Sales-Ready/Disqualified columns** and cards.
- Dashboard widgets show Sales-Ready with no stale "Qualified leads" labels.
- Converted lead (Sofia): shows "Converted" badge, no Convert button, status pill is a static/non-interactive read-only pill.
- Diff: 44 insertions / 42 deletions in `index.html`.

## Related decisions
See [../_ARCHITECTURE.md](../_ARCHITECTURE.md) → "Design decisions from owner Q&A" (D1: views vs pipelines) and the lead-lifecycle labels open choice (settled: rename only the collisions).
