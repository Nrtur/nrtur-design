# Tasks & meetings link to their record by id (not just name)

_Priority: High · Status: fixed & render-verified · 2026-07-02 · scope: contained id-fix_

Tasks and calendar events (meetings/calls) created from a record now carry the linked record's **id**, and a record's task list matches **id-first** — so renaming a contact/lead (or two records sharing a name) no longer orphans or cross-links their tasks.

## How it was (the problem)
Calendar items (`CalendarContext`) linked to a record only by **name string** (`contact`, `company`, `deal`) plus a `linkType`. `RecordTasks` matched tasks to a record purely by name (`t.contact===c.name`). Consequences:
- **Rename orphaning** — rename a contact and their tasks/meetings silently detached (name no longer matched).
- **Duplicate-name cross-linking** — two people named "John Smith" shared each other's tasks.

## How it is now (the fix — contained)
- Added a `_liveLeads` mirror (alongside `_liveContacts`/`_liveCompanies`/`_liveDeals`) and a top-level `calLinkIds(relType, name)` resolver.
- **On save**, both the task form (`TaskFormModal`) and the event form (`CalEventFormModal`) resolve the currently-selected link name → id via the live mirrors and stamp `contactId` / `leadId` / `companyId` onto the item. Resolving at save time means re-linking in the picker always produces the correct id — no stale prefill ids.
- `RecordTasks` joins are now **id-first with a name fallback**:
  - Contact page: `t.contactId!=null ? t.contactId===c.id : (t.contact===c.name && t.linkType!=='lead')`
  - Lead page: `t.leadId!=null ? t.leadId===l.id : (t.contact===l.name && t.linkType==='lead')`

Legacy/seed items (no id) keep matching by name, so nothing breaks; every **new** item is id-linked.

## Why this is better
- A record's tasks/meetings stay attached through renames and survive duplicate names.
- Consistent with the id-first-with-name-fallback pattern used across contacts/deals (Wave 3).
- No seed rewrite, no cross-context cascade — low regression risk.

## What was intentionally left (contained scope)
- The **calendar list views** (filters, chips, `primaryLink`, event-detail nav) still read the stored name strings for display/navigation. The record→task **join** is now id-robust; the calendar's own display name can lag a rename until reopened. Full id-migration of every calendar list/filter + the composite `deal` string was the larger option and is deferred.
- The `deal` link remains a composite display string (`"Company · $value"`); no record-page task panel joins on it.

## Verified (headless render, precompiled)
- Babel parse clean; app mounts with **zero console errors**.
- `calLinkIds('contact','Sarah Chen') → {contactId:1}`, `calLinkIds('company','Meridian Agency') → {companyId:1}`.
- Injected a task with `contactId:1` but a deliberately **wrong** display name → it **still appears** on Sarah Chen's (id 1) record (id-first join). Name-only **seed** tasks still appear (fallback). A `linkType:'lead'` task does **not** leak onto the contact page.

## Related
Contained id-fix chosen over full migration. Extends Wave 3 id-linking to the Calendar model's record joins.
