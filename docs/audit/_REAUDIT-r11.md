# R11 re-audit — the post-R10 delta (2026-07-15)

Correctness re-audit over everything landed since **R10 (2026-07-07)**: Wave 4 (calendar-first booking, multi-account calendar, record merge, meetings tab, custom-object field rules), SMS #1–#5 (inbound routing by number, STOP/HELP/START, deal picker, textable leads, thread session cards), the automation-builder rework, and the custom-field help/unique work. R10 was the last full correctness pass; ~20 feature commits had landed with no dedicated re-audit.

**Method.** 6 parallel finders over the delta areas (booking/calendar · SMS/MMS · automations · custom objects · record merge · a cross-cutting permission/honesty sweep) → **15 candidate defects**. Every candidate was then put through **refute-first adversarial verification** (22 independent skeptics; two diverse lenses — permission/reachability + compensating-mechanism — on each of the 7 High findings). **14 CONFIRMED, 1 REFUTED.** All 14 fixed in this pass. App re-verified in a headless browser: boots clean (all ~30 edits parse + render, zero runtime errors), and the class-capacity fix behaviorally confirmed live.

The core CRM model audited across R6–R10 (id-based links, Lead/Deal separation, single stage vocabulary, persisted outcomes/activities, capture→Lead) was **not** re-litigated and remains correct. R11's findings are all in the **newer feature surfaces**, and the dominant theme is again the R10 pattern: **a new mutating surface missing the permission gate its siblings already had.**

---

## High (7 → all fixed)

- **BOOK-D1 — booking could double-book against a calendar-native meeting.** The bookings store (`sched.meetings`) and the in-app calendar (`CalendarContext`) were merged for *display only*; booking availability read only `sched.meetings` + the static external-busy seed, never the live calendar. So a meeting scheduled from a Contact/Deal page or "New Event" left its slot bookable. **Fix:** the booking page now receives a fused busy set — `sched.meetings` + calendar events (`type:'meeting'`) mapped through the existing `calEventToMeeting` — so calendar-native meetings block slots (and count toward the daily cap) for the right host. *(Post-R10 regression — the Wave-4 calendar-first rebuild wired only the static seed + real bookings.)*

- **BOOK-D2 — a class/group event was capped at ONE attendee, and the "seats left" counter was fake.** Each class booking wrote a blocking host meeting, so after seat #1 the slot vanished for everyone; the "N of 20 left" label was a hash of the date/slot, unrelated to real bookings. **Fix:** a real seat model — class bookings are stamped `seatEventId`; a new `schedClassSeats()` counts actual reservations; the class slot stays open while `seats < capacity` (excluding the event's own seats from the host busy set so it doesn't self-block, while still honoring the host's *other* conflicts); the 3 "seats left" sites now show the real count; class is excluded from the single-host daily cap. **Behaviorally verified:** the demo webinar now offers every 9–5 slot at "20 of 20 left". *(Post-R10 regression.)*

- **MERGE-D1 — company merge orphaned company-linked tasks & calendar events.** The cross-context re-parent block ran only for `object==='contact'`; the company branch re-parented contacts/deals/activities but left tasks/events pointing (by `companyId`) at the soft-deleted loser. **Fix:** added a company branch re-parenting `CalendarContext` items by `companyId` in both `applyMerge` and `bulkMerge`.

- **MERGE-D2 — lead merge re-parented nothing but central activities.** `applyMerge` had no `object==='lead'` branch at all, so lead-linked tasks (`leadId`) and booked meetings orphaned onto the deleted lead. **Fix:** added a lead branch re-parenting cal items + sched meetings by `leadId`.

- **MERGE-D3 — deal merge lost the merged-away deal's whole timeline.** `doMergeDeals` filled the survivor's fields and soft-deleted the losers but never re-parented activities; the deal timeline reads strictly by the deal's own id, so the loser's notes/calls/comms vanished. **Fix:** `PipelinePage` now destructures `setActivities`; `doMergeDeals` re-parents the losers' activities (both `subjectId` and `dealId`-linked comms) onto the survivor, matching the contact/company merge.

- **MERGE-D5 — record merge (contacts/companies/leads) was ungated.** A view-only role that could open a Duplicates tab could merge (soft-delete + re-parent) records — contradicting the permission matrix, which promises "Merge duplicates" is admin-only, and diverging from the correctly-gated sibling *deal* merge. **Fix:** `canMerge = settingsIsAdmin()`; early-return guards in `applyMerge`/`bulkMerge`; Merge / Bulk-merge buttons hidden for non-admins (with a "View only — merging is admin-only" hint), so the list stays browsable read-only.

- **SMS-D1 — the Inbox SMS/MMS composer Send was ungated.** A view-only user could send texts (write an activity, meter billable usage) while the same component's email Compose/Reply/Forward were correctly hidden via `effCanCreateAny()`. The brand-new lead-texting branch used this same button. **Fix:** Send button + textarea now gated on `effCanCreateAny()`, mirroring the email neighbors. *(Post-R10 regression — SMS #4.)*

---

## Medium (3 → all fixed)

- **SMS-D2 — lead inbound SMS bypassed STOP/HELP/START.** The lead branch of `simInboundSms` had no keyword handling, so a lead texting STOP was stored as an ordinary message, never suppressed, and stayed textable (contacts suppress correctly). *(Verified PARTIAL: the code asymmetry is real but only reachable via a hand-crafted call, not a shipped demo control.)* **Fix:** the lead branch now mirrors the contact branch — STOP writes a real phone-suppression row (protecting the number even if the lead later converts), START lifts it, HELP auto-replies. *(Post-R10 — SMS #4.)*

- **MERGE-D4 — no merge path re-parented sequence enrollments.** `seqEnrollments` (keyed by `contactId`) was never touched by any merge, so a merged-away contact's enrollment dangled on the dead record, the "enrolled-once" guard could re-enroll the survivor, and reply-unenroll missed it. **Fix:** contact merge (both `applyMerge` and `bulkMerge`) re-parents + de-dupes enrollments (`seqId|contactId`).

- **XCUT-3 — calendar single-event create/edit/delete/complete was ungated** while the sibling Tasks tab gates on `effCanObject('Tasks',…)`. **Fix:** New Event, `openNew`, `saveEvent`, `delEvent`, the CalUpcoming toggle/reorder, and the detail modal's Edit/Delete/Complete are now gated on the Tasks permission (the default Owner keeps full access; only genuinely view-only roles are restricted). *(Pre-existing, not a post-R10 regression — closed opportunistically as it's the same defect class.)*

---

## Low (4 → all fixed)

- **AUTO-D1 — branch-nested steps were dropped from the card preview.** `save()`'s flat-step walk recursed on `n.branches` (a key that never exists) instead of `n.lanes`, so steps inside a "Split into paths" node were missing from the list-card step count. Execution/re-editing were unaffected (the full node tree persists). **Fix:** `n.branches` → `n.lanes`. *(Pre-existing.)*

- **AUTO-D2 — the branch node executed only lane[0].** "Split into paths" (summarized in-app as "N parallel paths") silently dropped every path after the first at runtime and in the Test trace. **Fix:** the runtime and the simulation now iterate **all** lanes (parallel fan-out), so authored steps in every path run. *(Pre-existing. If the owner instead wants conditional routing — each record → exactly one named path — that is a separate feature: add a per-lane condition + editor. See open choices.)*

- **CUST-D1 — a Boolean custom-field default was stored as a boolean, mismatching the 'Yes'/'No' the control speaks**, so the record displayed "true" and a `Boolean is Yes` filter missed it. **Fix:** the Boolean default control now emits `'Yes'`/`'No'` strings, matching the field control, display, and filter. *(Post-R10 — the default-seeding was added 2026-07-13.)*

- **CUST-D3 — several builder-offered custom field types degraded silently.** Partially fixed: **(a)** a configured **Multi-select** default is now seeded as `[default]` instead of being dropped (was data loss); **(b)** **URL** now renders a real `type="url"` input. Deferred (owner decision — see below): **Date range** (renders a single date input) and **Lookup / Autocomplete** (render plain text; record-linking is already covered by the Relationships section). *(Pre-existing.)*

---

## Refuted (verified NOT a defect)

- **CUST-D2 — "required is unenforced when a field is also Hidden / off the create form."** The code mechanics reproduce, but this is **correct** handling of contradictory admin config: a hidden or create-excluded field has no input at create time, so enforcing "required" there is unsatisfiable and would deadlock the drawer (an unsaveable record); for create-off-but-*visible* fields, required still fires on edit. The only real gap is a missing builder-side warning — a Low UX nicety, **not** a runtime defect. Left as-is; noted as an optional guardrail below.

---

## Also verified genuinely-correct (no change needed)

- The **SMS routing spine** (a prior-round red flag) is now substantially real: inbound routes by number/identity, STOP writes real suppression for contacts, leads persist by id, MMS persists with `contactId`, session slicing is lossless, the deal-picker never guesses when >1 open deal.
- The **calendar-first booking** engine: min-notice / no-past slots, buffers, daily cap, round-robin (union) vs collective (intersection), real edit/delete (no fake-success), canonical Meetings tab, and the multi-account **read-set** are all correct. (The **write-destination** is modeled + persisted but never consumed at booking time — there is no external-write surface in the prototype, so it is display-only, not a false-success bug.)
- **Automation** "Coming soon" badging exactly matches which triggers the engine fires; `save()` preserves the flow tree; seed fabricated-runs are honestly reconciled; the honest-Slack step holds at runtime; the uncommitted **FlowInserter portal** change (automation "Add step" picker) has no functional regression.
- **Custom objects:** the prior R9 Rich-text/Attachment drawer-corruption defect is **fixed** (round-trips cleanly); unique/required/default/hidden enforcement, id-keyed relationships, and per-object permission gating (now persistent) are all correct.
- Contact merge re-parents all four child classes; merges are non-destructive (soft-delete + restore); create-time contact dedupe is real; tag merge is clean.

---

## Open choices — SETTLED 2026-07-15 (all three decided + implemented)

Benchmarked against mainstream CRMs and decided by the owner. See `changes/r11-decisions-router-fieldtypes-smsfrom.md` for the plain-English write-up.

- ~~**Automation branch semantics.**~~ **DECIDED: conditional routing.** "Split into paths" is now an N-way router — each path carries a rule, records take the **first matching** path, and a trailing **"Everyone else"** default catches the rest. This matches every mainstream builder (HubSpot if/then branches with "None met", Salesforce Flow Decision, ActiveCampaign/GHL If-Else), and parallel fan-out was redundant anyway (stacked sequential steps already all run). Built, not just specced.
- ~~**Custom field types Date range / Lookup / Autocomplete.**~~ **DECIDED: removed from the custom-object picker** (standard objects untouched). Each duplicated something nrtur already does better: a span = two Date fields (the HubSpot/Salesforce/Airtable convention — no single range type), record-linking = the **Relationships** section, typeahead = a searchable **Single select**. One honest way to do each thing.
- ~~**SMS sender-number persistence.**~~ **DECIDED: persisted.** The chosen number is now written onto the outbound message + activity and shown on the bubble ("· via +1…"), matching what every Twilio-based CRM records per message and completing the A2P audit trail.

### Still open (not blocking)

- **Optional builder guardrail (from the refuted CUST-D2):** warn in the property editor when a field is marked *Required* **and** *Hidden* / off the create form (an unsatisfiable-at-create combination). Purely a UX nicety.
- **Should a scheduled *call* also block booking slots?** Today only calendar events of type *meeting* block availability. A timed call is arguably also a conflict — one-line change if wanted.
- **Class daily-cap:** class events are exempt from the per-day meeting cap (their own capacity governs). If a class session should instead count as *one* toward the cap, that's a small tweak.

---

## Verification

Headless browser (served build): boots clean, React mounts, Babel compiles the full 3.3MB script with **no syntax error** (only the expected "deoptimised styling >500KB" perf note); Pipeline, Calendar, and the Bookings preview all render with **zero runtime console errors**. **Behavioral:** the class booking page now shows every 9 AM–4 PM slot at "20 of 20 left" (real seat count from zero bookings, previously a per-slot hash), and the slot is no longer self-blocked. A regression review over the full R11 diff was run adversarially. **Uncommitted** — owner tests locally before commit.
