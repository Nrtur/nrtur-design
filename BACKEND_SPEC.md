# nrtur — Backend Requirements Spec

_The blueprint for turning the working prototype into a buildable product. Compiled 2026-07-03 from the live `index.html` prototype (branch `main`, commit `fb1b6eb`)._

## 0. How to read this

The prototype is not a mockup — it is a **working spec**. Every entity, relationship, permission rule, and workflow below is already implemented and render-verified in the single-file React app; the in-memory `CrmDataContext` **is** the domain model. The backend's job is to serve those same shapes over the wire, add the four things a browser can't do (persistence, real sending, auth, scale), and change nothing about the domain semantics.

**Where the truth lives in the prototype** (so you can verify any claim here):
- Domain state surface → the `crm` context object (`index.html`, the `CrmDataContext` provider, ~line 22392).
- Permissions → `effCanObject` / `effScope` / `effScopeRows` / `PERM_ROLE_SEED` (~line 2519–2546).
- Pipeline/stage model → `pipelines` state, `stagePlacements`, `pipeAccessible`, `canMoveToStage`.
- Automations engine → `fireDealAutomationEvents` / `dealCondPass`.
- The current user/id conventions → `CURRENT_USER`, `Date.now()+random` id minting (replace with real ids — see §9).

**Non-negotiable principle:** the prototype spent its life removing fake/dead data (hardcoded status pills, fake scores, non-functional forms). The backend must not reintroduce any. Every value the API returns must be real or explicitly null.

---

## 1. Tenancy, identity, and conventions

- **Multi-tenant.** Every row belongs to a `workspace_id` (a company using nrtur). All queries are workspace-scoped; nothing crosses tenants. The prototype is single-workspace — add `workspace_id` to every table.
- **IDs.** The prototype mints ids with `Date.now()+random`. Replace with server-authoritative ids (UUIDv7 or bigserial). Client-supplied ids are never trusted.
- **Soft delete + recycle bin.** Records carry `deleted`, `deletedAt`, `deletedBy`; the UI restores within **30 days**, then hard-deletes. `archived` is a separate, reversible "hide from active lists" flag. Both must be first-class, not row removal.
- **Timestamps.** `createdAt`, `updatedAt` on everything; `createdBy` (user code). The prototype fakes some as strings ("3d ago") — the API returns real ISO timestamps and the client formats them.
- **Denormalized display fields.** The prototype mirrors names for display (`deal.company`, `deal.primaryContact`, `contact.co`) alongside the real FK (`companyId`, `primaryContactId`). Keep the FK authoritative; the API may return the denormalized name for convenience, but **renames must cascade** (see §3).

---

## 2. Core data model

Entities and their real fields (from the prototype seeds + property panels). `*` = required, `→` = foreign key.

### 2.1 Contact
`id* · first · last · name (derived) · email · phone · title (free text) · seniority (enum) · jobFunction (enum) · co (denorm) · companyId →Company · owner →User(code) · cstatus (Prospect|Customer|Lost) · tags[] →Tag · source (enum) · salutation · emails[] · phones[] · address{street,city,state,zip,country} · linkedin · lastActivity · lastContacted · dnc (bool) · createdBy · createdAt · archived · deleted/deletedAt/deletedBy`
Ad-attribution (nullable): `adPlatform · adSourceKey · adCampaign · adAdset · adFormName · utmSource/Medium/Campaign/Term/Content · fbclid · gclid`.
**Job title is free text** (researched decision — do not make it a picklist); **seniority** and **jobFunction** are the bounded classifiers. Lifecycle is **`cstatus` only** — the legacy `status` field is dead, do not port it.

### 2.2 Lead (first-class, separate from Contact)
`id* · name · first · last · company · companyDomain · email · phone · title · industry · employeesSize · score (0–100) · status (New|Contacted|Qualified|Disqualified|…) · estValue · estValueNum · source · owner · qual{} (qualification answers) · converted (bool) · convertedToContactId/CompanyId/DealId · convContact/convCompany/convDeal (denorm) · archived · deleted`
A Lead **converts** into a Contact (+ optional Company + Deal), id-linked, and becomes read-only (see §4 Convert).

### 2.3 Company
`id* · name · domain · industry · type (Prospect|Customer|Partner|Competitor|…) · owner · size · annualRevenue · loc · tags[] · archived · deleted`

### 2.4 Deal
`id* · name · company (denorm) · companyId →Company · owner/ownerColor →User · pipeline (denorm name) · stageKey · dStage (denorm) · stagePlacements[] (see §3.2) · stageEnteredAt · stageHistory[{stageKey,at,by}] · probability (nullable; derived from stage when null) · closeDate · primaryContact (denorm) · primaryContactId →Contact · additionalContacts[{contact,role}] · additionalContactIds[] →Contact · nextAction (enum: Call|Email/follow-up|Send proposal|Run demo|Negotiate|Get signature|Internal review|Waiting on them|Onboard) · dealTags[] · source · amountType (One-time|ACV|TCV|ARR|MRR) · forecast (Pipeline|Best case|Commit|…) · outcome{result:won|lost,reason,note,closedAt,closedBy} · createdBy · createdAt · lastActivity · archived · deleted`
`value` (display string like "$31k") is derived from `amount` (number) — store `amount`, format on read.

### 2.5 Pipeline & Stage
Pipeline: `id* · name · object ('deal' | custom-object id) · stages[] · access[] (roles; empty=everyone) · handoffs[{whenStageKey,mode:enroll|move,toPipelineId,toStageKey}]`
Stage: `id* · key · name · color · prob (0–100, stage win %) · rotDays (staleness threshold) · required[] (field keys gated on entry) · moveRoles[] (roles allowed to move deals IN; empty=everyone, admins always)`

### 2.6 Activity (the timeline / audit log)
Append-only event log, keyed by subject. `id* · type (note|email|call|sms|meeting|task|sequence|field|dnc|tag|created|form|…) · cat (emails|calls|notes|tasks|deals|changes) · subjectType (contact|deal|company|lead|custom) · subjectId · title · body · actor →User · ts · payload{} · source`
The `field` type + `changes` category is the **change-tracking / audit trail** — every field edit emits one (label + old→new). Treat activities as immutable events.

### 2.7 Automation
`id* · name · trigger (string, see §7) · status (active|paused|draft|error) · steps[] (action/condition/branch/wait/goal nodes) · cond (condition string, e.g. "Deal value > $20k") · runs · success (%) · lastRun · errStep`
Plus `autoLogs[]` (per-run log rows).

### 2.8 Sequence & Enrollment
Sequence: `id* · name · channel (email|sms|push|inapp) · steps (count) · stepLabels[] · active · fromTemplate (nullable)`. Templates create a sequence **once**, then reuse.
Enrollment (real membership): `id* · seqId →Sequence · contactId →Contact · dealId →Deal · stage · at · by`

### 2.9 Payments module
`payInvoices[] · paySubs[] (subscriptions) · payLinks[] · payProducts[] · payQuotes[]` — Stripe-first, currently simulated. Invoice/payment events post to the contact/deal timeline.

### 2.10 Custom Objects
`{id · singular · plural · icon · color · fields[] (user-defined property schema) · records[]}` — user-defined record types that reuse the same list/detail/pipeline/activity machinery. Records have owner + the generic activity feed. A custom object can back its own pipeline.

### 2.11 Config & people
- `tagDefs[{id,name,color}]` — the single tag store (no parallel stores).
- `statusDefs` — configurable status vocabularies per object.
- `dealReasons{won[],lost[],lostExcluded[]}` — win/loss reason lists; `lostExcluded` reasons don't count against win rate.
- `TEAM_MEMBERS[{name, code, color, role}]` — users; `role` ∈ the 6 roles (§5).
- Tasks & Meetings (Scheduling module): calendar items linked to records; `RecordTasks` and the scheduling context.

---

## 3. Relationships & integrity rules (the hard part)

These invariants are enforced in the prototype and **must** be enforced server-side (a client can't be trusted to).

### 3.1 Id-first linking with name fallback
Links are by **id** (`companyId`, `primaryContactId`, `additionalContactIds`), with the denormalized name kept only for display and legacy rows. Resolution order everywhere: id, then name match. New writes always set the id.

### 3.2 Multi-pipeline enrollment (nrtur's differentiator)
A deal has **one primary pipeline** (`pipeline`+`stageKey` = the owner of value/forecast/outcome/win-probability) and may be **enrolled** in others via `stagePlacements[{pipelineId, stageKey, primary, at, history[]}]`.
- The **primary placement owns the money** — enrolled placements never double-count in forecasts.
- Each placement has an **independent stage + its own per-placement history**.
- Moving the deal on a non-primary board edits only that placement.
- Setting a new primary swaps ownership (value/forecast move); it never orphans.
- Membership is by `pipelineId`, not the name string (survives renames).

### 3.3 Cascade rules
- **Rename cascades:** renaming a Company updates `contact.co`/`deal.company` (denorm) for all linked rows; renaming a Contact updates `deal.primaryContact` + `additionalContacts[].contact`. (Prototype: `updateCompany`/`updateContact`.)
- **Delete-never-orphans:** deleting a pipeline reassigns its primary deals to the next pipeline's first stage (history-stamped) and strips enrollments; deals are never left danging. Deleting a stage moves its deals to the previous stage.
- **Deal-won → Customer:** winning a deal advances its primary contact's `cstatus` to `Customer` (unless already Customer/Lost), logged on the contact's Changes tab. (Prototype: `promoteWonContact`.)
- **Lead convert:** creates id-linked Contact (+ Company + Deal), stamps `convertedTo*Id`, marks the lead read-only.
- **Deal merge:** 2–3 duplicates → one primary; id-linked gap-fill; timeline note.

### 3.4 Stage gates
A deal cannot **enter** a stage until its `required[]` fields are filled — enforced on **every** path (drag, quick-add, bulk, create-into-stage). The API rejects a stage move that would violate a gate (409 with the missing fields), matching the prototype's inline-fill flow.

---

## 4. API surface

REST (or GraphQL) over the model above. All endpoints are workspace-scoped and permission-checked (§5). Conventions: cursor pagination, `?filter=`, `?sort=`, `?fields=`; soft-delete via `DELETE` → recycle bin.

**CRUD (per entity):** `contacts, leads, companies, deals, pipelines, activities, automations, sequences, tags, dealReasons, customObjects, customObjects/{id}/records, pay*`.

**Domain operations** (not plain CRUD — these carry the invariants):
| Operation | Endpoint (illustrative) | Enforces |
|---|---|---|
| Move deal stage | `POST /deals/{id}/move {pipelineId,stageKey}` | stage gate (§3.4), move-rights (§5.3), placement rules (§3.2), fires automations (§7) |
| Win/Lose deal | `POST /deals/{id}/close {result,reason,note}` | reason required, promoteWonContact, outcome stamp |
| Reopen deal | `POST /deals/{id}/reopen` | restores pre-close stage from history, clears outcome |
| Enroll in pipeline | `POST /deals/{id}/enroll {pipelineId,stageKey}` | placement merge (never replace) |
| Set primary pipeline | `POST /deals/{id}/primary {pipelineId}` | value/forecast handoff |
| Merge deals | `POST /deals/merge {ids[],primaryId}` | id-linked gap-fill |
| Convert lead | `POST /leads/{id}/convert {…}` | id-linked Contact/Company/Deal, read-only lock |
| Bulk edit | `POST /{object}/bulk {ids[],patch}` | per-record permission, DNC where relevant |
| Stage bulk email/enroll | `POST /pipelines/{id}/stages/{key}/bulk {action}` | dedupe deals→contacts, skip DNC/no-email/already-enrolled (§6) |
| Run/enroll sequence | `POST /sequences/{id}/enroll {contactIds[]}` | suppression + already-enrolled checks (§6) |

Every mutation that the prototype logs to the timeline must emit an **Activity** event server-side (§2.6).

---

## 5. Auth & permissions

The prototype already defines a complete RBAC + row-level model. Port it verbatim as backend authorization; do not invent a new one.

### 5.1 Identity
Real accounts, sessions (JWT/session cookie), workspace membership. `CURRENT_USER` / `CURRENT_USER_ROLE` are the single seam — replace with the authenticated principal. Keep the "View as role" preview as a **read-only client concern** that never elevates real permissions.

### 5.2 Roles & object permissions (RBAC)
Six roles: **Owner, Admin, Sales Manager, Team Lead, Sales Rep, Read Only** (`ALL_DASH_ROLES`); admins = **Owner, Admin** (`NAV_ADMIN_ROLES`).
Each role's `PERM_ROLE_SEED` defines, per object (Contacts/Leads/Companies/Deals/Tasks/…): `{create, read, edit, delete, scope}` plus workspace features `{billing, bulkDelete, export}` and sensitive-field visibility. The API enforces `effCanObject(object, action)` on every request.

### 5.3 Row-level scope (Own / Team / All)
Per object, a role's `scope` limits which rows it sees/acts on: **Own** (`owner == me`), **Team** (`owner ∈ my team`), **All**. `effScopeRows` filters lists; the backend applies this as a **row-level security predicate** on every read — search included (a role must never see a record it can't access).

### 5.4 Pipeline-level & stage-level authorization
- **Per-pipeline access** (`pipeline.access[]`): restricted pipelines vanish from the switcher/board/search for roles not listed (admins always). `dealPipeAccessible()` hides restricted-pipeline deals from **global search/lists** — enforce as an additional read predicate.
- **Per-stage move rights** (`stage.moveRoles[]`, Bitrix24 pattern): only listed roles may move a deal **into** a stage (empty=everyone, admins always). `canMoveToStage()` gates the move endpoint — reject with 403.
- **Sensitive-field masking:** roles below the sensitive-visible list get masked values (e.g. amount) — the API must **omit/redact** those fields, not just hide them client-side.

---

## 6. Sending & deliverability (the biggest net-new system)

The prototype's email/SMS/sequences are **simulated** (timeline entries, no wire). The backend must make them real, and this is where most of the compliance surface lives. Model it on the researched cross-CRM patterns already baked into the prototype's stage-bulk flow.

**Requirements:**
- **Real transport:** an email service (domain auth: SPF/DKIM/DMARC, dedicated IPs/warmup) and an SMS provider. Per-workspace sender identities.
- **Server-side suppression is authoritative:** DNC (`contact.dnc`), the suppression list (unsub/bounce/blocked domains), and per-channel suppression are enforced **at send time** — a client can never bypass them. The prototype's `contactEmailSuppressed` + DNC checks are the rules; the server owns them.
- **Enrollment lifecycle:** `seqEnrollments` is real state. On enroll → schedule steps; **auto-unenroll** on reply / meeting booked / unsubscribe / bounce (unsubscribe & bounce non-disableable). Reply/bounce/open events arrive via provider **webhooks**.
- **Rate & batch rails:** throttle sends (e.g. HubSpot's 3/min, tiered daily caps) or drip-batch large audiences (GHL pattern). Bulk enroll runs a named **eligibility check** and returns a per-record skip list (already-enrolled, no email, DNC, suppressed) — the prototype's stage-bulk review sheet is the contract.
- **Deliverability telemetry:** delivered/open/click/reply/bounce/unsub per message, aggregated onto the sequence stats the UI already renders.

---

## 7. Automations engine (server-side)

The prototype fires a reusable event core (`fireDealAutomationEvents`) on real transitions; the backend runs the same engine as a durable, async worker.

- **Triggers** (already wired in the UI): `Deal created · Deal moved to <stage> · Deal won · Deal lost · Deal value changed · Contact created · New ad lead received · Payment received/failed · Invoice overdue · Tag added · Deal inactive N days · scheduled (Every Monday 8am)` …
- **Condition gating:** an automation's `cond` **gates execution** — evaluate it against the record (the prototype's `dealCondPass` parses money comparisons; the backend generalizes to a structured condition AST: field/op/value, plus branch nodes with `yes/no`). Skipped runs are logged ("did not run — condition not met"), matching the prototype.
- **Branch/step execution:** walk the flow tree (action/condition/branch/wait/goal), execute the matching branch, honoring suppression (§6) for any send step.
- **Cross-pipeline handoffs:** `pipeline.handoffs` auto-enroll/move a deal into another pipeline when it reaches a trigger stage.
- **Retroactive catch-up:** turning on a stage automation can enroll deals **already** in the stage (the "run for N deals already here" action).
- **Idempotency + run log:** each run is recorded (`autoLogs`), run counts/success tracked; retries are idempotent.

---

## 8. Scale — what the board needs from the server

This is the single biggest ✗ on the competitive scorecard, and it's purely a backend/API concern. The prototype holds every deal in browser memory and renders every card; the fix is entirely server-side.

The API must let the client **never load the whole dataset**:
- **Paged board columns:** `GET /pipelines/{id}/board` returns, per stage, the **first N cards + a cursor + the stage's total count and total value** (server-computed aggregates). The client renders a bounded set and pages on scroll. (The prototype already caps columns at 25 + collapses closed columns — that UI is ready for a real cursor.)
- **Server-side filter/sort/search:** the Om filter model, sorts, and saved views execute as DB queries on **indexed** columns — never client scans.
- **Aggregates on the server:** pipeline value, weighted forecast (open-only, deal-prob overrides stage-prob), funnel conversion, time-in-stage, win/loss-by-reason — computed by the DB from `stageHistory`/`outcome`, returned as summaries. The client charts them; it does not aggregate raw rows.
- **Closed deals age out:** Won/Lost columns page/collapse by default; old closed deals are fetched on demand, not streamed.
- **Indexing guidance:** `(workspace_id, pipeline_id, stage_key)`, `(workspace_id, owner)`, `(workspace_id, company_id)`, `(workspace_id, primary_contact_id)`, `closeDate`, full-text on names/companies.

---

## 9. Migration from the prototype

1. **Schema from §2** — one table per entity + join tables for many-to-many (`deal_contacts`, `stage_placements`, `enrollments`, tags). Denormalized display names become computed/cached, not source-of-truth.
2. **IDs → server-authoritative** (UUIDv7/serial); drop `Date.now()+random`.
3. **Seed data** (the `*_DATA` / `AUTO_INIT` / `defaultPipelinesSeed` arrays) becomes migration fixtures / a demo-workspace seeder.
4. **The `CrmDataContext` becomes the API client** — same shapes, now fetched. Replace the `set*` React setters with mutations that call the endpoints; the components change almost nothing.
5. **Feature flags** for the net-new systems (sending, automations worker) so the UI can ship against stubs first.

---

## 10. Non-functional requirements

- **Consistency:** cascade/rename/merge/close operations are transactional (all-or-nothing).
- **Auditability:** the Activity log is append-only and immutable; field changes are events (§2.6).
- **Recycle bin:** 30-day soft-delete restore, then hard-delete job.
- **Rate limits & abuse:** on sends (§6) and bulk operations.
- **Webhooks:** inbound from Stripe (payments) and the email/SMS providers (delivery/engagement) → post Activity events.
- **Observability:** per-automation run metrics, send deliverability, query latency for the board endpoints.

---

## Build order (recommended)

1. **Data model + CRUD + auth/RBAC + row-scope** — makes the prototype real & multi-user (unblocks persistence, the base ✗).
2. **Board scale endpoints (§8)** — unblocks the scorecard's biggest gap.
3. **Automations worker (§7)** — the engine already has the event core; make it durable.
4. **Sending & deliverability (§6)** — the largest net-new system and the heaviest compliance surface; do it last, behind a flag, once the rest is stable.

Everything the domain needs is already proven in the prototype. The backend is not a redesign — it's persistence, authorization at the API boundary, three async systems (scale queries, automations, sending), and nothing invented.
