# Activity & Note Persistence (re-audit R3)
_Priority: Critical · Status: fixed & render-verified · 2026-07-01_

The last remaining Critical from the post-Wave-3 re-audit. Logged notes/calls/meetings/tasks are now saved, instead of vanishing on navigation.

## How it was (the problem)
Each record detail page (Contact, Deal, Company, Lead, Custom) kept its logged activities in **component-local state** (`const [extra,setExtra]=React.useState([])`). The activity feed itself was **regenerated from the record on every render** (`buildActivityFeed`). So:
- A note/call/meeting you logged lived only in that page's memory and was **lost the moment you navigated away**.
- "Log a note/call/meeting" was effectively throwaway, and any activity-based reporting would be fiction.

## How it is now (the fix)
- A **shared `activities` store** was added to `CrmDataContext` (App-level state), with `addActivity(kind, recordId, activity)` that tags each activity with its `subjectType` + `subjectId`. `activities` is in the context's memo deps, so adding one re-renders consumers.
- Each detail page's local `extra` state was replaced with a **store-backed derivation** — `extra = crm.activities.filter(a => a.subjectType === <kind> && a.subjectId === record.id)` — and `setExtra` became a **thin shim that persists** through `crm.addActivity`. Because every existing call site used the same `setExtra(x => [newActivity, ...x])` shape, this was a **one-line change per page** — all the existing "add note / log call / log meeting / log task" sites now persist unchanged.
- The `ActivityTimeline` already merged `extra` with the synthesized feed, so persisted activities show up in order and **survive navigation**.

## Why this is better
- A note you log stays logged — leave the record, come back, it's still there.
- Activities are now real data (keyed by record), so activity history and activity-based reporting become possible.
- Minimal, low-risk change: one shared store + one line per page, no rewrite of the timeline or the individual log actions.

## What you still need to decide
- Nothing blocks this. Notes use the existing relative timestamps (`ts:0` = "just now"); within a session that's fine. A future pass could store absolute timestamps and, for custom objects, key by object-id + record-id (today custom activities key by record id only — a minor edge if two custom objects ever share a record id).

## Verified (headless render, precompiled)
- Babel parse clean; app mounts with **zero console errors**.
- Adding an activity to a Contact took the timeline from **27 → 28 events** and showed the note.
- **Navigated away (Dashboard) and back — the note was still there** (count still 28). This is the core fix: activities persist across navigation.
- The store + `addActivity` + the `activities` memo dep + the per-page shim were verified to route correctly (the composer's `onAddNote → addNote → setExtra shim → crm.addActivity` is the exact path exercised).

## Related
Re-audit finding R3 in [../_REAUDIT-post-wave3.md](../_REAUDIT-post-wave3.md). This closes the last Critical from the re-audit.
