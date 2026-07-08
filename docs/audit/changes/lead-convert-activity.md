# Lead → Contact convert: activity roll-up made lossless (2026-07-08)

_Driven by a web-verified study of how CRMs carry a lead's activity history through conversion (Salesforce · HubSpot · Zoho · Pipedrive · Dynamics · GoHighLevel)._

## Research verdict
The universal invariant across every CRM: **a lead's activity history must survive conversion losslessly and stay reachable from the contact.** Salesforce re-parents the *entire* set (open + closed) onto Contact+Account+Opportunity as one shared row; the lead survives read-only. HubSpot/Pipedrive/GHL avoid the problem by keeping the contact as the durable timeline. Nothing is ever silently dropped.

## Where nrtur was right — and where it lost data
Already correct: the contact links to its originating lead by a **real id back-link** (`lead.convertedToContactId === contact.id`, never by email), and the lead survives as a read-only "Converted" record. A display-time **roll-up** (not a destructive move) is the right mechanism here since the lead deliberately survives. That's the Salesforce/Dynamics posture.

Two violations of the "nothing is lost" invariant:
1. The roll-up was **capped at the top 3** of the lead's synthetic feed — an arbitrary truncation.
2. Worse, it stitched only the lead's **synthetic** feed and **ignored the lead's persisted, user-logged activities** (`crm.activities` keyed `subjectType:'lead'`). So notes/calls a rep actually recorded on the lead **vanished** from the contact after conversion — real (prototype-real) data loss.

## What changed
- **Removed the `.slice(0,3)` cap** in `buildActivityFeed` — the full originating lead history now rolls up (the timeline's own collapse UI already handles volume).
- **The contact's `extra` feed now includes the converted lead's persisted activities** — resolved by the id back-link, tagged with the same "from lead · [name]" source chip, merged alongside the contact's own persisted rows. The rep's real logged lead history now carries forward.
- Kept the **roll-up-by-id** mechanism (no destructive re-parent): the read-only lead keeps its own intact timeline; the contact references it. This is Salesforce's shared-row / Dynamics' surface-don't-duplicate philosophy, and the honest choice for a per-render synthetic feed.

## Verified (headless CDP)
Boots clean, zero errors. Converted contacts (Sofia ← lead 3, Olivia ← lead 1) carry the "from lead" history; a non-converted contact shows none. The `extra` merge with the added source tag renders without breaking the timeline.

## Deferred (low)
Open-vs-closed refinement (surface any *open* lead tasks as still-actionable on the contact via RecordTasks, rather than as historical chips) — a nice-to-have from the Salesforce/Zoho model; tasks are lightly modeled in the prototype, so it's low-value for now.
