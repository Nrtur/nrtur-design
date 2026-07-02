# nrtur CRM — System Explainer & Correctness Audit

> **Audience:** a frontend + backend team that needs to *build* this CRM and is not assumed to know CRM concepts.
> **Author role:** CRM systems analyst. This document does **two** jobs, kept strictly separate:
> - **EXPLAIN** sections describe how the system actually works today (neutral).
> - **VERDICT / FIX** sections audit it against sound CRM modeling (blunt). A defect is called a defect here even when the EXPLAIN section just told you how it works.
>
> Every claim is grounded in a real file + line. CRM terms are defined on first use.

---

## STEP 0 — Scope check (read this before trusting anything below)

**There is no backend.** This repository is a single-file React prototype:

- `index.html` — ~20,925 lines, React via in-browser Babel, all logic + data inline.
- A static design system under `nrtur-design-system/` (HTML/CSS/JSX mockups, not wired to the app).
- No `package.json`, no migrations, no SQL, no ORM/entities, **no API calls to any server** (the `api.*` references in `index.html` are a local *folder-grouping* UI helper, not a network client).

**What this means for the audit.** The canonical rule "if you can only see the UI, stop — don't guess the data model" exists to prevent reverse-engineering a *hidden* backend schema from API calls. That is **not** the situation here. There is no hidden backend; the data model is present as **literal JavaScript** — `const` enums and seed arrays I can read directly. So:

- ✅ I am **not guessing** enum/status/stage values. Every value below is quoted from a literal in `index.html`.
- ❌ I **cannot** audit what does not exist in this repo: database constraints, foreign-key delete behavior, uniqueness/indexes, server-side validation, persistence. Where the canonical model talks about those, I say "must be defined by the backend team" rather than inventing a verdict.

**The prototype is therefore the de-facto specification.** This audit treats the in-memory model (object shapes, enum sets, status axes, conversion flow) as the blueprint the backend team will implement — which is exactly what it is for.

### Inventory & walkthrough order

| # | Component | Primary source (file:line) |
|---|---|---|
| 1 | Lead | `LEADS_DATA` [index.html:8479], `LEAD_STATUSES` [:8470], `LEAD_SOURCES` [:8473] |
| 2 | Contact | `CONTACTS_DATA` [:4886], `CONTACT_STATUSES` [:4909] (the one `cstatus` axis); heat derived via `contactHeat()` |
| 3 | Company (Account) | `COMPANIES_DATA` [:7866], `COMPANY_TYPES` [:7863] |
| 4 | Deal (Opportunity) | `STAGES_DATA` deals [:7393], `DEAL_STAGES_ALL`/`DEAL_STAGE_ORDER` derived [:7996–7997], persisted `deal.outcome` [:7952] |
| 5 | Pipeline & Stage | `STAGES_DATA` [:7393], Deals-only object picker `NewPipelineModal` [:7683], `addStage` [:7775] |
| 6 | Conversion (Lead → Contact + Company + Deal) | `buildConvertRecords` (id-linked) [:8589], bulk convert [:6245], `migrateLinks` [:21192] |
| 7 | Activity & Task (the timeline spine) | `buildActivityFeed` [:6683], `ACT_CAT` [:6540], task events [:17173] |
| 8 | Custom Objects | builder block [:19891], `customObjects` in context |
| 9 | Status / Lifecycle axes (cross-cutting) | synthesizes the status fields found across 1–4 |

**Verdict legend:** ✅ CONFORMS · ⚠️ RISKY (Low/Med/High) · ❌ DEFECT (Low/Med/High).

---

## Component 1 of 9 — Lead

### SOURCE
- Enum: `LEAD_STATUSES = ['New','Contacted','Nurturing','Sales-Ready','Disqualified']` — [index.html:8470](index.html)
- `LEAD_SOURCES = ['Web form','Referral','Cold outreach','Event','Ad','LinkedIn','Import']` — [index.html:8473](index.html)
- Seed records: `LEADS_DATA` — [index.html:8475](index.html)
- Funnel widget that consumes status: [index.html:4537](index.html)

### WHAT IT IS
A **Lead** is an unqualified, unvalidated inbound prospect — a name/email/company you captured but haven't confirmed is worth pursuing. It is meant to be cheap and disposable. In code, a lead record looks like:

```js
{id:1, name:'Olivia Bennett', company:'Brightwave Studio', email, phone, title,
 source:'Web form', status:'New', score:82, estValueNum:18000,
 companyId, convertedToContactId, convertedToCompanyId, convertedToDealId,
 owner:'AM', converted:false, archived:false, ...}   // index.html:8477
```

The key field is **`status`** — the lead's lifecycle *before* it becomes a real relationship. It runs **New → Contacted → Nurturing → Sales-Ready → Disqualified**, and this is a separate axis from the Deal pipeline (which keeps its own `Qualified` stage). No `pipeline` or `expectedCloseDate` lives on the Lead anymore — those are Deal concepts and attach to the Deal at conversion.

### WHY IT EXISTS HERE
The Leads page is the top of the funnel. A rep works a lead (calls, emails), decides if it's real, and either **Converts** it (Component 6) or marks it `Disqualified`/archives it. `score` (0–100, bucketed Hot/Warm/Cold) helps prioritize which leads to work. The Leads page also offers a **List / Board toggle** — the Board is a *status board view* grouped by lead status ([index.html:8749](index.html)), not a pipeline.

### SEE ALSO
- `status` is rendered by `LEAD_STATUS_CHIP` / `LEAD_STATUS_DOT`. Those maps define colors for exactly the five enum values.
- The dashboard **lead-funnel** widget and every saved view, property def, and booking path use the same five values: `['New','Contacted','Nurturing','Sales-Ready','Disqualified']` — [index.html:8470](index.html), [:4537](index.html).
- `'Qualified'` no longer exists on the Lead side — it lives only as a **Deal stage** (`DEAL_STAGE_ORDER`, [index.html:7997](index.html)). Lead status and deal stage are now cleanly separate vocabularies. See Component 9.
- The add-lead path guards status: `if(!LEAD_STATUSES.includes(status))status='New'`. The seed data now uses only the five canonical values.

### CONFUSION TO PRE-EMPT
- **"Is a Lead the same as a Contact?"** No. A Lead is a *maybe* — unvalidated, pre-relationship. A Contact (Component 2) is a *yes* — a validated person you've decided to work with. The bridge between them is Conversion (Component 6).
- **"Is lead `status` the same as a deal `stage`?"** No — and this is the single most important distinction in the whole system. **Lead status** (New → Contacted → Nurturing → Sales-Ready → Disqualified) = the lifecycle *before* money is on the table (is this worth pursuing?). **Deal stage** = the lifecycle of a specific revenue opportunity *after* conversion (how close is this money?). They are two different axes on two different objects with no shared vocabulary.
- **"Does a Lead carry a `pipeline` or an `expectedCloseDate`?"** No — those were removed. They are deal concepts and attach to the **Deal** at conversion.

### VERDICT
- ✅ **RESOLVED: lead status enum reconciled.** `LEAD_STATUSES` is now the single canonical set `New → Contacted → Nurturing → Sales-Ready → Disqualified` ([index.html:8470](index.html)), and the seed, chip/dot maps, dashboard funnel, saved views, property defs, and booking all use it. No off-enum `Working`/`Engaged` values remain, so no lead can fall out of the funnel.
- ✅ **RESOLVED: pipeline and close-date removed from the Lead.** The Lead no longer carries `pipeline` or `expectedCloseDate`; the Convert modal defaults the *deal* to `Sales Pipeline`. Pipelines belong to Deals only.
- ✅ **RESOLVED: no more `'Qualified'` collision on the Lead.** `Qualified` exists only as a Deal stage; the Lead's ready-to-convert state is now `Sales-Ready`. See Component 9.
- ✅ **CONFORMS:** `source` is a clean controlled enum; `converted`/`archived`/`deleted` give a soft-delete + lifecycle model; `score` with Hot/Warm/Cold bucketing is a sound prioritization pattern.

### FIX
*The three lead-side defects above have been applied in the prototype (see the changelog at the end of this document). The remaining backend recommendation:*
1. Store lead status as a constrained enum; reject/normalize on import.
2. Keep `pipeline`/close date on the **Deal** only (already true in the prototype).
3. Keep `Qualified` a Deal-stage word only; the Lead's ready-state is `Sales-Ready` (already true).

---

## Component 2 of 9 — Contact

### SOURCE
- Seed records: `CONTACTS_DATA` — [index.html:4886](index.html)
- `CONTACT_STATUSES = ['Prospect','Customer','Lost']` — [index.html:4909](index.html) (the one editable relationship axis, `cstatus`)
- Heat is **derived**, not stored: `contactHeat(score)` → Hot/Warm/Cold

### WHAT IT IS
A **Contact** is a validated individual person you have a real relationship with — typically the output of converting a Lead. A representative record:

```js
{id:1, name:'Sarah Chen', co:'Meridian Agency', companyId, email, phone, title:'CEO',
 cstatus:'Customer',        // the ONE stored relationship axis (Prospect/Customer/Lost)
 score:88, owner:'AM', source:'Referral',   // heat (Hot/Warm/Cold) derived from score
 emails:['s.chen@meridian.co'], phones:['+1 555-234-0000'],
 address:{...}, tags:[...], createdBy, createdAt, ...}   // index.html:4888
```

### WHY IT EXISTS HERE
The Contact is the hub of the relationship: it anchors the timeline (calls/emails/notes/tasks), links to a Company, and is the thing a Deal is "for." A real person belongs here; a maybe-person belongs in Leads.

### SEE ALSO
- A Contact links to its Company **by id** via `companyId`, alongside the display-name `co` field (`co:'Meridian Agency'`). The join helpers are id-first with a name fallback — `contactsForCompany`/`dealsForCompany` match on `company.id` first and only fall back to the name when an id is missing ([index.html:8118–8119](index.html)). A one-time `migrateLinks()` at app start ([index.html:21192](index.html)) backfills `companyId` and auto-creates any missing company, so no contact is orphaned.
- The Contact's **Deals panel is real**: it queries the contact's actual deals by id (`primaryContactId`/`additionalContactIds`/shared `companyId`) with a name fallback ([index.html:7219](index.html)) — it is no longer hardcoded demo data.
- The Contact has **two** email/phone representations: scalar `email`/`phone` *and* arrays `emails`/`phones` ([index.html:4888](index.html)).
- The Contact now carries **one** stored relationship axis — `cstatus` (Prospect/Customer/Lost). The old `lifecycle`, `pstatus`, and mixed `status` heat vocabulary were removed; heat is derived from `score`. This consolidation is the resolution of the old collision map; see Component 9.
- `CONTACT_STATUSES` ([index.html:4909](index.html)) is the editable dropdown for `cstatus`, and it matches the stored values exactly (`Prospect/Customer/Lost`) — the earlier `Lead` mismatch was removed.

### CONFUSION TO PRE-EMPT
- **"Which field is *the* status of a contact?"** `cstatus` (Prospect/Customer/Lost) — the single stored relationship axis. Heat (Hot/Warm/Cold) is a separate, derived temperature off `score`, not a lifecycle.
- **"Why is there both `email` and `emails`?"** Legacy/duplication. The scalar is the "primary"; the array is "all." They are not kept in sync by any code I can see, so they can disagree.
- **"A contact links to a company — one company or many?"** Exactly one, by id (`companyId`, with `co` kept as the display name). A person who works across two companies still cannot be represented — the single-company link is by design, not a modeling defect.
- **"Where do a contact's deals live?"** Not stored on the contact, but the Deals panel resolves them live by id — `deal.primaryContactId === contact.id` (with a name fallback), see Component 4.

### VERDICT
- ✅ **RESOLVED — one relationship axis on the Contact.** The four overlapping fields collapsed to a single stored `cstatus` (Prospect/Customer/Lost); `lifecycle`, `pstatus`, and the mixed `status` heat vocabulary were removed, and heat is now derived from `score`. Nothing on the contact can contradict itself about "what stage is this," and conversion no longer sets a `Customer` label on a brand-new prospect (Component 6).
- ✅ **RESOLVED — `cstatus` enum/data reconciled.** Editable options and stored values are the same set `['Prospect','Customer','Lost']` ([index.html:4909](index.html)); `Lead` was dropped (it belongs to the Lead object).
- ⚠️ **RISKY — Low: Contact↔Company is one-to-one (but now id-linked).** `co` remains the display name, but the real link is `companyId` and joins are id-first with a name fallback ([index.html:8118](index.html)). **Fixed:** renaming a company now cascades display names and never orphans its contacts/deals (id-linked), and `migrateLinks()` collapses missing companies. **Still a modeling limit:** the link is single-company, so a many-to-many "consultant at two clients" case can't be represented — that would need a `contact_company` join for the backend.
- ⚠️ **RISKY — Low: dual `email`/`emails` (and `phone`/`phones`).** Cost: two sources of truth that can drift; ambiguous which is canonical.

### FIX
*The four-axis collapse and enum reconciliation are applied in the prototype (only `cstatus` remains stored; heat is derived). Remaining backend recommendations:*
1. **Store no lifecycle axis on the Contact at all** — even `cstatus` should be *derived* from deals in the schema (Customer = has a Won deal; Opportunity = has an Open deal; otherwise just a contact) rather than stored. The prototype keeps `cstatus` only to keep the demo data rich. Temperature stays derived from `score`.
2. **Store company linkage by id, many-to-many.** The prototype already links by `companyId` (single company); the backend should widen this to a `contact_company` join (`contact_id`, `company_id`, `role`, `is_primary`) to model a person at two companies. Join on ids, never names.
3. Keep a single `emails[]`/`phones[]` with a `primary` flag; drop the scalar `email`/`phone` (or make them computed getters of the primary).

---

## Component 3 of 9 — Company (Account)

### SOURCE
- Seed records: `COMPANIES_DATA` — [index.html:7866](index.html)
- `COMPANY_TYPES = ['Customer','Prospect','Partner','Vendor']` — [index.html:7863](index.html); chip map [:7864](index.html)
- Name-based joins: `dealsForCompany` / `contactsForCompany` — [index.html:7894](index.html)
- Default views (filters) — [index.html:7882](index.html)

### WHAT IT IS
A **Company** (a.k.a. **Account** in Salesforce terms) is the organization a Contact belongs to — the B2B entity you sell *to*. Record shape:

```js
{id:1, name:'Meridian Agency', domain:'meridian.co', industry:'Marketing & Advertising',
 size:48, revenue:'$6M–$10M', annualRevenue:8000000, loc, type:'Customer',
 owner:'AM', parent:'', billing:{...}, shipping:{...}, tags:[...], ...}   // index.html:7868
```

### WHY IT EXISTS HERE
It lets you roll up multiple contacts and deals under one account, segment by `type`/`industry`/`size`, and answer account-level questions ("companies with open deals," "going cold 30+ days") via the saved views at [index.html:7882](index.html).

### SEE ALSO
- `type` (`Customer/Prospect/Partner/Vendor`) overlaps semantically with Contact `cstatus`: **"Customer" now lives in two places** — `Company.type` (a relationship *category*) and `Contact.cstatus` (the contact's relationship axis). The old third place, `Contact.lifecycle`, was removed. See Component 9.
- `parent` (e.g. Bloom Creative `parent:'Summit Digital'`, [index.html:7870](index.html)) is a **company hierarchy by name string** — same name-linkage pattern as everywhere else.
- `domain` exists and is the natural dedupe key, but the seed deliberately contains **un-deduped** records: `Meridian Agency`/`Meridian Agency Inc.`, `Summit Digital`/`Summit Digital LLC` (tagged `duplicate-import`, [index.html:7879–7880](index.html)).

### CONFUSION TO PRE-EMPT
- **"Company vs Contact?"** Company is the *org*; Contact is a *person* at that org. A deal is usually with a Company through one or more Contacts.
- **"Is `type` the company's deal stage?"** No. `type` is the *relationship kind* (are they a customer, a prospect, a partner, or a vendor). It is not a pipeline and not a per-deal status.
- **"How are a company's contacts/deals found?"** By the company **id** (`contact.companyId` / `deal.companyId`), with a name fallback when an id is missing — `contactsForCompany`/`dealsForCompany` are id-first ([index.html:8118–8119](index.html)).

### VERDICT
- ✅ **RESOLVED — Company is the id hub.** Contacts and deals link by `companyId`, and the join helpers match on id first ([index.html:8118–8119](index.html)); `parent` remains a name-string hierarchy. **Rename-safety:** renaming a company cascades its display name to children and never orphans them, because the link is the id, not the string. `migrateLinks()` ([index.html:21192](index.html)) auto-creates any missing company and backfills ids at app start, so the previously seeded duplicate accounts no longer split one account's pipeline. (`domain` remains the natural dedupe key for a future merge flow.)
- ⚠️ **RISKY — Low: `type` overlaps the contact relationship vocabulary.** `Customer`/`Prospect` live on both the company (`type`) and the contact (`cstatus`). **Cost:** when a company is `type:'Customer'` but its only contact is `cstatus:'Prospect'`, which is true? Nothing reconciles them — though the surface is now smaller (two fields, not four), and the backend recommendation is to derive both from won deals.
- ✅ **CONFORMS:** `domain` present as a dedupe key; `parent` gives account hierarchy; `billing`/`shipping` address split and `annualRevenue` (numeric) alongside `revenue` (banded display) are sound. The saved-view predicates ([index.html:7882](index.html)) are a clean segmentation model.

### FIX
1. Contacts/deals now join by `companyId` (done in the prototype); `parent` is still a name string. For the backend, make `parent` an id too, and enforce `domain` uniqueness (or a dedupe/merge flow) so duplicate imports collapse to one account.
2. Keep `type` strictly as *relationship kind*; do not let it imply a deal stage or a contact lifecycle. Decide whether "Customer-ness" is owned by the Company, the Contact, or *derived from won deals* — and store it in exactly one place (recommend: derived from won deals; see Component 9).

---

## Component 4 of 9 — Deal (Opportunity)

### SOURCE
- Seeded deals nested inside stages: `STAGES_DATA[].deals` — [index.html:7290](index.html)
- Live deals state (the real store), seeded by flattening stages: `useState(()=>STAGES_DATA.flatMap(s=>s.deals.map(d=>({...d,stageKey:s.key}))))` — [index.html:20596](index.html); helper `dealsSeed()` — [index.html:7847](index.html)
- Stage order/colors: `DEAL_STAGE_ORDER` [index.html:7736](index.html), `DEAL_STAGE_COLOR` [:7737](index.html)
- Board move logic (dual store) — [index.html:7522](index.html)

### WHAT IT IS
A **Deal** (a.k.a. **Opportunity**) is one specific revenue pursuit: a named amount of money you might win from an account, tracked through pipeline stages. Record shape:

```js
{id:1, name:'Meridian — Managed CRM', company:'Meridian Agency', companyId, value:'$8,400', amount:8400,
 stageKey:'prospecting', dStage:'Prospecting', pipeline:'Sales Pipeline',
 probability:30, closeDate:'2026-07-15',
 primaryContact:'Sarah Chen', primaryContactId, additionalContactIds:[...],
 additionalContacts:[{contact:'James Rivera',role:'Champion'}],
 outcome:{result:'won'|'lost', reason, note, closedAt, closedBy},  // set only when closed
 source, amountType:'One-time', forecast:'Pipeline', owner, dealTags:[...]}   // index.html:7394

### WHY IT EXISTS HERE
Deals are what the pipeline board and the revenue forecast are built on. `amount` × stage `probability` drives the weighted forecast; `forecast` category (`Pipeline/Best case/Commit`) is a manual override; `closeDate` drives "closing this quarter." A deal moves stage-to-stage until it's `Won` or `Lost`.

### SEE ALSO
- A deal points at its account and people **by id, alongside the display names**: `companyId` + `company:'Meridian Agency'`, `primaryContactId` + `primaryContact:'Sarah Chen'`, and `additionalContactIds:[…]` next to `additionalContacts:[{contact, role}]` ([index.html:7394](index.html)). Joins are id-first with a name fallback; `migrateLinks()` backfills any missing ids ([index.html:21192](index.html)). A deal's **Primary contact resolves the real named person** (`primaryContactId`), not "the first contact at the company" ([index.html:8010](index.html)).
- `stageKey` (machine key, e.g. `'prospecting'`) and `dStage` (display name, `'Prospecting'`) are **both stored on every deal** — two fields for one fact.
- The board **scopes deals by their pipeline** — a deal shows only on its own pipeline, not on every board that shares a `stageKey`.
- `outcome` is set only when a deal is **closed Won or Lost**: it persists `{result, reason, note, closedAt, closedBy}` on the deal and is shown on the deal ([index.html:7952](index.html), [:8060](index.html)).
- The `additionalContacts` role values (`Champion`, `Decision maker`) are the right idea — a deal↔contact link *with a role*.

### CONFUSION TO PRE-EMPT
- **"Why does a deal sit 'under' a contact in the UI?"** Because a deal is *for* a person/account — it represents money tied to that relationship. One account/contact can have many deals over time (new business, renewal, expansion). The deal is the unit of revenue; the contact is who you're dealing with.
- **"Lead vs Deal?"** A Lead is a pre-qualification *maybe* with no committed opportunity. A Deal is a *qualified* opportunity with an amount and a stage. Converting a Lead is what spawns a Deal (Component 6).
- **"Is a deal's `stage` the same as a lead's `status`?"** No — see Component 9. Stage = money lifecycle (post-conversion); status = pursuit lifecycle (pre-conversion).
- **"Where is the single list of all deals?"** The live `deals` array in context ([index.html:20596](index.html)). But beware the dual store below.

### VERDICT
- ✅ **RESOLVED: deals reference contacts and companies by id.** `companyId`, `primaryContactId`, and `additionalContactIds` are stored alongside the display names, joins are id-first with a name fallback, and `migrateLinks()` backfills ids at app start ([index.html:7394](index.html), [:8010](index.html), [:21192](index.html)). Renaming a contact or company no longer detaches the deal, and a deal's Primary contact resolves the real person. (The display-name fields remain for rendering; the id is the link.)
- ⚠️ **RISKY — Med: deals are stored in two places.** The live `deals` array holds deals keyed by `stageKey` ([index.html:20596](index.html)), **but** the pipeline board also keeps deals inside per-stage `demo:[]` arrays for user-added stages, and `applyMove` branches on "real vs demo" ([index.html:7522](index.html)). **Cost:** two code paths for "move a deal," and a deal's home depends on whether its stage was seeded or user-created. For the backend this collapses to one `deals` table with a `stage_id` FK — flag it so the team does **not** reproduce the split.
- ⚠️ **RISKY — Low: `stageKey` + `dStage` denormalized on every deal.** Two fields encode one fact; they can drift if a stage is renamed. Store `stage_id` only; derive the display name from the stage.
- ✅ **CONFORMS:** `additionalContacts` with `role` is the correct deal↔contacts-with-role pattern; `amount` (numeric) + `probability` + `closeDate` + `forecast` category is a sound opportunity model; soft-delete via `deleted/deletedAt/deletedBy` ([index.html:7292](index.html), [:7750](index.html)) is correct.

### FIX
1. **Reference by id.** `deal.company_id`, a `deal_contacts` join (`deal_id`, `contact_id`, `role`, `is_primary`). Keep the role idea — it's already half-right.
2. **One deal store, one stage pointer.** Single `deals` table; `stage_id` FK; drop the `demo[]`-vs-`real` split and the redundant `dStage` string.
3. Add **field-level history** on `amount` and `stage_id` (the canonical model calls this out) so forecasting/velocity reporting is trustworthy. Not present today.

---

## Component 5 of 9 — Pipeline & Stage

### SOURCE
- The (one) modeled pipeline's stages — the **single canonical source**: `STAGES_DATA` — [index.html:7393](index.html)
- Derived from it: `DEAL_STAGES_ALL` (full set incl. Lost) [index.html:7996](index.html), `DEAL_STAGE_ORDER` (happy-path ladder, Lost off-ramp) [:7997](index.html), `DEAL_STAGE_COLOR` [:7998](index.html)
- User-editable stages: `addStage` [index.html:7775](index.html), `STAGE_COLORS`, per-pipeline stage editor
- Deal-outcome capture on close: `DealOutcomeModal` + persisted `deal.outcome` — [index.html:7952](index.html)

### WHAT IT IS
A **Pipeline** is an ordered set of **Stages** a Deal moves through. A **Stage** is one step (e.g. Prospecting → Qualified → Proposal → Negotiation → Won/Lost), carrying an order, a color, and a win-probability default. In code, the canonical stages are:

```js
STAGES_DATA = [
  {key:'prospecting', name:'Prospecting', ...}, {key:'qualified', name:'Qualified', ...},
  {key:'proposal', ...}, {key:'negotiation', ...},
  {key:'won', name:'Won', ...}, {key:'lost', name:'Lost', ...}   // index.html:7290–7308
]
```

Users can add stages on the board (`addStage`, [index.html:7509](index.html)), each getting a `prob` (probability) default.

### WHY IT EXISTS HERE
The pipeline board (kanban) is the deal-management heart of the app: columns are stages, cards are deals, dragging a card advances the deal and changes its weighted forecast contribution.

- **One canonical stage source.** `DEAL_STAGES_ALL`, `DEAL_STAGE_ORDER`, and `DEAL_STAGE_COLOR` are all now **derived from `STAGES_DATA`** ([index.html:7996–7998](index.html)) — there is no longer a hand-maintained parallel list that can drift. `DEAL_STAGES_ALL` includes `Lost`, so it is reachable in every stage select and filter; `DEAL_STAGE_ORDER` is the happy-path ladder and treats `Lost` as a terminal off-ramp rather than a linear rung.
- New deals default to the **first stage, `Prospecting`** (not `Qualified`).
- **`pipeline` is a free-text string** on deals only (leads no longer carry it). The **"New pipeline" object picker is Deals-only** — it offers Deals plus any custom objects, and Leads/Contacts/Companies were removed ([index.html:7687](index.html)); the Leads "Board" is a status-board view, not a pipeline. Only the Sales pipeline (`STAGES_DATA`) has canonical stages; user-added pipelines define their own stages on the board.
- Stage name `'Qualified'` now lives **only** on the Deal — the Lead's equivalent state is `Sales-Ready`, so there is no more cross-object `Qualified` collision (Component 9).

### CONFUSION TO PRE-EMPT
- **"What object does the pipeline belong to?"** It must belong to the **Deal**. In this codebase it's a string that's stamped on both Deals *and* Leads — the Lead usage is wrong (Component 1).
- **"Are Won and Lost stages, or something else?"** Here they're modeled as **stages** (`STAGES_DATA` keys `won`/`lost`). That's a legitimate convention (Salesforce does the same with Closed Won/Closed Lost), but it means "stage" mixes *progress* with *final outcome* — see Verdict.
- **"Can different deal types use different stages?"** Yes — you can create a new deal pipeline from the "New pipeline" picker and edit its stages on the board. Each pipeline owns its own stage list.

### VERDICT
- ✅ **RESOLVED: one canonical source of truth for the stage list.** `DEAL_STAGES_ALL` / `DEAL_STAGE_ORDER` / `DEAL_STAGE_COLOR` are all derived from `STAGES_DATA` ([index.html:7996–7998](index.html)); there is no parallel hand-maintained list to drift. `Lost` is reachable everywhere via `DEAL_STAGES_ALL`, and a closed deal's outcome is captured and persisted separately (`deal.outcome`, [index.html:7952](index.html)) so the stepper never has to encode "lost" as a linear rung.
- ⚠️ **RISKY — Med (residual): a `deal.pipeline` name still isn't a first-class entity with its own id.** Deal pipelines are user-creatable and each owns its stages, but the link is still the pipeline *name* string rather than a `pipeline_id` FK. **For the backend:** promote Pipeline to an entity with `id` + ordered stages and reference it by id.
- ⚠️ **RISKY — Med: Won/Lost are still modeled as stages.** They remain in the ordered stage set, so "average days in stage" / "win rate by stage" math still mixes a terminal outcome with in-progress steps. **Partly mitigated:** closing a deal now also writes a structured, persisted `deal.outcome` (`{result:'won'|'lost', reason, note, closedAt, closedBy}`, [index.html:7952](index.html)) that captures the win/loss *reason* — the reporting-clean split (a separate `status` = Open/Won/Lost) is still a backend recommendation, but the outcome data now exists on the deal.
- ✅ **CONFORMS:** stages are user-editable with a per-stage probability (`prob`) default ([index.html:7775](index.html)) — this matches the Pipedrive-style per-pipeline stage model and is the right direction.

### FIX
1. **Make Pipeline a real entity** with `id`, `name`, and an ordered `stages` collection; `deal.pipeline_id` + `deal.stage_id` (FKs). Delete the free-text `pipeline` string and the standalone `DEAL_STAGE_ORDER`/`DEAL_STAGE_COLOR` constants — derive order/color from the stage rows.
2. **Split outcome from progress:** promote `deal.outcome` to a first-class `deal.status ∈ {Open, Won, Lost}` and keep `Won`/`Lost` out of the ordered stage list (or mark them terminal, flagged `is_won`/`is_lost`). The prototype already persists the win/loss *reason* on `deal.outcome`; this step just moves the Open/Won/Lost flag off the stage axis for clean stage-velocity reporting.
3. Reference the pipeline by `pipeline_id` (deal pipelines are already user-creatable with their own stages; only the id link is missing).

---

## Component 6 of 9 — Conversion (Lead → Contact + Company + Deal)

### SOURCE
- Record builder: `buildConvertRecords(lead,payload)` — [index.html:8589](index.html)
- Modal UI: `ConvertLeadModal` — [index.html:8607](index.html)
- Bulk convert (Leads bulk-bar): [index.html:6245](index.html)

### WHAT IT IS
**Conversion** is the moment a Lead is promoted into the "real" objects. `buildConvertRecords` **precomputes ids** for the three records so they are born id-linked, then produces up to three records from one lead — a **Contact**, optionally a **Company**, and optionally a **Deal** — and the caller inserts them and stamps the lead as converted with back-links:

```js
// ids are minted up front, so the records link to each other by id
const contactId=base+1, companyId=base+2, dealId=base+3;
contact.companyId = company ? companyId : null;
deal.companyId = company ? companyId : null;  deal.primaryContactId = contactId;
updateLead(l.id,{converted:true, convertedToContactId:contact.id,
  convertedToCompanyId:company?.id, convertedToDealId:deal?.id, ...});   // index.html:8589–8601
```

The new deal is created at the **first stage**: `stageKey:'prospecting', dStage:'Prospecting', probability:30` ([index.html:8600](index.html)). The **bulk-bar "Convert"** runs each selected lead through the same builder — producing an id-linked Contact (+Company +Deal) per lead behind a confirm, then marking them converted ([index.html:6245](index.html)) — it is no longer a toast-only fake.

### WHY IT EXISTS HERE
This is the canonical CRM lifecycle hinge: *Lead captured → worked → Qualified → CONVERT (spawns Contact [+Company] + Deal) → Deal enters pipeline at first stage.* The flow is exactly the right shape.

### SEE ALSO
- **Both back-links and forward links are by id.** Back-links: `convertedToContactId/CompanyId/DealId` on the lead. Forward links: `deal.primaryContactId = contactId`, `deal.companyId`/`contact.companyId = companyId` ([index.html:8596–8600](index.html)) — the display-name fields (`primaryContact`, `company`, `co`) are carried alongside for rendering, but the id is the link. This closes the name-only fragility that used to be reproduced at conversion time.
- The new **contact is set with a single relationship axis**, not four: only `status:'Active'` (a display badge) and `cstatus:'Prospect'` ([index.html:8596](index.html)). It is no longer stamped `lifecycle:'Customer'`/`pstatus`. See Component 9.
- Pipeline enrollment correctly targets the **Deal** here (`deal.pipeline`), which is the right object — contrast with the Lead, which no longer carries a `pipeline` at all (Component 1).

### CONFUSION TO PRE-EMPT
- **"What does Convert actually create?"** One Contact (always), one Company (if chosen), one Deal (if chosen) — three objects from one lead, with the lead marked `converted:true` and kept for history (not deleted).
- **"Does the pipeline attach to the lead or the deal?"** At conversion it attaches to the **Deal** (correct). The lead's own `pipeline` field is vestigial and wrong (Component 1).
- **"What stage does the new deal start in?"** Always `Prospecting` (first stage), probability 30 — a sound default.

### VERDICT
- ✅ **CONFORMS — the conversion *flow* is correct.** It spawns Contact (+Company) + Deal, enrolls the Deal at the first pipeline stage, and preserves the lead with id-based back-links. This is the canonical lifecycle done right and is the strongest part of the model. Principle satisfied: *pipeline enrolls the Deal at conversion, not the Lead.*
- ✅ **RESOLVED: no more contradictory four-axis stamping.** The new contact is set to `cstatus:'Prospect'` only (plus a display `status` badge); it is no longer stamped `lifecycle:'Customer'` on a brand-new prospect, so converted contacts are no longer auto-mislabeled as customers ([index.html:8596](index.html)).
- ✅ **RESOLVED: forward links written by id.** The deal and contact are linked by the precomputed ids (`deal.primaryContactId`, `deal.companyId`, `contact.companyId`, [index.html:8596–8600](index.html)); the name fields are kept only for display.

### FIX
*The conversion-side defects above are applied in the prototype. Remaining backend recommendation:*
1. Derive the contact's relationship label (Customer/Opportunity/Contact) from its deals rather than storing even `cstatus` (Component 9).
2. Carry only ids into the schema; the display-name fields are a prototype convenience.

---

## Component 7 of 9 — Activity & Task (the timeline spine)

### SOURCE
- Feed builder: `buildActivityFeed(kind,rec,ctx)` — [index.html:6683](index.html)
- Activity categories: `ACT_CAT = [all, emails, calls, notes, tasks, deals, changes]` — [index.html:6540](index.html); metadata `ACT_META` [:6541](index.html)
- Polymorphic source maps: `ACT_SRC_PAGE`/`ACT_SRC_ICON` (`deal/contact/company/lead`) — [index.html:6562–6563](index.html)
- Tasks as calendar events: `type:'task'` items with `linkType`/`contact`/`company`/`deal`/`subtasks` — [index.html:17173](index.html), filtered at [:3970](index.html), [:18579](index.html)

### WHAT IT IS
An **Activity** is a timeline event logged against a record — a note, call, email, meeting, or task. A **Task** is an activity with a due state (date, assignee, done/overdue) plus `subtasks`. In this prototype the *seed* timeline for a record is **generated** by `buildActivityFeed(kind, rec, ctx)`, and any items the user logs are **persisted in a shared `CrmDataContext.activities` store** keyed by `subjectType`+`subjectId` ([index.html:21240](index.html), [:21305](index.html)). Each record page reads its logged items back from that store (`crm.activities.filter(...)`, [index.html:7238](index.html), [:8016](index.html)), so notes/calls/meetings/tasks **survive leaving and returning** to the record — they are no longer component-local state lost on navigation.

### WHY IT EXISTS HERE
"Activity is the spine" — contacts, companies, and deals are nodes; activities are the edges that make the data useful. The timeline is what a rep reads to know "what happened with this account and what's next." Tasks being modeled as events (not a separate silo) is why a due task shows up on both the calendar and the record timeline.

### SEE ALSO
- An activity/task references its parent **by name string** again: `contact:'Emily Tran'`, `company:'Forge & Co'`, `deal:'Forge & Co · $44,000'`, with a `linkType` discriminator ([index.html:17173](index.html)).
- `ACT_SRC_PAGE` ([index.html:6562](index.html)) shows the intended polymorphism: an activity can originate from a `deal`, `contact`, `company`, or `lead`.
- Tasks are filtered out of the events list everywhere via `type==='task'` ([index.html:3970](index.html), [:18579](index.html)) — confirming tasks live *inside* the unified event/activity store, not separately.

### CONFUSION TO PRE-EMPT
- **"Is a Task different from an Activity?"** A Task *is* an Activity subtype (one with a due date and done state). Don't build a separate tasks table.
- **"Can one activity belong to a contact *and* a deal at once?"** It needs to (logging one call should appear on the person, the deal, and the company). Today an event has a single `linkType` + name, which points at one parent — see Verdict.
- **"Is the timeline real data?"** The *seed* timeline is **generated** per render by `buildActivityFeed`. Items the user logs are **persisted** in the shared `crm.activities` store and survive navigation ([index.html:21305](index.html)). There is still no single cross-record activity *table* the backend can adopt wholesale, but a session-persistent store now exists.

### VERDICT
- ✅ **RESOLVED (prototype): logged activities now persist across navigation.** New notes/calls/meetings/tasks are written to the shared `CrmDataContext.activities` store keyed by record ([index.html:21305](index.html)) and read back per record ([index.html:7238](index.html)), so they no longer vanish on leaving and returning. **Residual (for the build):** the seed timeline is still generated per render, so the backend must still design one first-class, persisted `activities` table — but the prototype now demonstrates the persistence behavior rather than losing it.
- ⚠️ **RISKY — Med: single-parent activity links by name.** An event carries one `linkType` + a name string ([index.html:17173](index.html)). **Rule at risk:** an activity should link polymorphically to contact **and** deal **and** company simultaneously; single-parent models force duplicate logging and broken timelines. **Symptom:** log a call on a deal and it won't appear on the contact's timeline unless re-logged.
- ✅ **CONFORMS:** Tasks-as-activities (not a separate silo), the note/call/email/meeting/task subtypes (`ACT_CAT`), and subtasks are all sound. The intended polymorphism is visible in `ACT_SRC_PAGE`.

### FIX
1. **Design a first-class `activities` table:** `id`, `type` (note/call/email/meeting/task), `body`, `actor`, `occurred_at`, plus task fields (`due_at`, `assignee_id`, `done`), and **many-to-many polymorphic links** (an `activity_links` join to any of contact/company/deal). Join by id.
2. Let one logged activity attach to multiple parents (contact + deal + company) so the timeline isn't duplicated.
3. Keep tasks inside this table (a `type='task'` with due state) — the prototype already has this right.

---

## Component 8 of 9 — Custom Objects

### SOURCE
- Builder + pages block: `// Custom Objects — user-defined record types (Projects, Tickets, …)` — [index.html:19891](index.html)
- Definitions store: `crm.customObjects` (one source of truth) — referenced [index.html:19895](index.html), [:19918](index.html), [:20138](index.html)
- Relationship form `CoRelForm`, target meta `coTargetMeta` — [index.html:19918](index.html), [:19975](index.html)
- Surfaced in global search/nav — [index.html:1650](index.html), [:2586](index.html)

### WHAT IT IS
**Custom Objects** are user-defined record types (the demo seeds a "Projects" object) so a tenant can model things the standard objects (Lead/Contact/Company/Deal) don't cover — e.g. Projects, Tickets. Each object defines its own fields (reusing the standard property editor) and relationships to other objects (`CoRelForm`), and gets a generic list page + record-detail page, search entries, and nav.

### WHY IT EXISTS HERE
It's the "flexible-but-bounded customization" escape hatch: rather than hard-coding every industry's objects, a small team can add the one or two extra record types they need.

### SEE ALSO
- Definitions live in **one place** — `crm.customObjects` ([index.html:19895](index.html)) — which is the right call (single source of truth).
- Custom-object **relationships** reuse the same target/lookup machinery, and (consistent with the rest of the app) resolve records **by name** in places like `coLinkRecord`/lookup helpers ([index.html:19924](index.html), [:19933](index.html)).
- Custom records reuse the standard ActivityTimeline (`kind='custom'`) and RecordTasks — so they inherit the same timeline model as Component 7.

### CONFUSION TO PRE-EMPT
- **"Is this how I add a field to a Contact?"** No — custom *fields* extend an existing object; custom *objects* create a brand-new record type. Different features.
- **"Are custom objects first-class like Deals?"** In the UI, yes (list + detail + timeline + search + nav). In the data model they're generic records under a definition, which is the standard, scalable approach.

### VERDICT
- ✅ **CONFORMS:** user-defined record types with a single definition store, reused field/relationship editors, and reused timeline/tasks. This matches the "custom objects only with a clear, bounded model" principle and avoids unbounded schema sprawl.
- ⚠️ **RISKY — Low: relationships resolve by name** ([index.html:19924](index.html)), the same fragility as the standard objects. For the backend, link custom records by id.

### FIX
- No structural change to the concept. When building the backend, give custom objects and their relationships id-based links and per-tenant limits (object count, field count, index strategy) so customization stays bounded.

---

## Component 9 of 9 — Status / Lifecycle axes (cross-cutting)

> This component synthesizes findings from 1–4. It is the **root cause** of most of the confusion in this system, so it gets its own treatment.

### SOURCE
Every status-like field and its real, in-code vocabulary:

| Field | Lives on | Real values (from code) | Source |
|---|---|---|---|
| `status` | **Lead** | New, Contacted, Nurturing, Sales-Ready, Disqualified | [index.html:8470](index.html) |
| `cstatus` | **Contact** | Prospect, Customer, Lost | [index.html:4909](index.html) |
| *heat (derived)* | **Contact** | Hot / Warm / Cold — **derived from `score`** (not stored) | `contactHeat()` |
| `dStage`/`stageKey` | **Deal** | Prospecting, Qualified, Proposal, Negotiation, Won, Lost | [index.html:7393](index.html), [:7997](index.html) |
| `type` | **Company** | Customer, Prospect, Partner, Vendor | [index.html:7863](index.html) |

*(The old `Contact.lifecycle`, `Contact.pstatus`, and the mixed `Contact.status` heat vocabulary were removed — see the "Applied to the prototype" changelog at the end. What remains is one axis per object.)*

### WHAT IT IS (the explanation a confused dev needs)
There are only **three** legitimate lifecycle axes in a CRM, and they live on different objects:

1. **Lead status** — the *pre-conversion* pursuit lifecycle (New → Contacted → Nurturing → Sales-Ready → Disqualified). On the **Lead**.
2. **Deal stage** — the *post-conversion* money lifecycle (Prospecting → … → Won/Lost). On the **Deal**.
3. **Contact lifecycle** — *optionally*, a person-level marketing-to-customer axis (Lead → MQL/SQL → Opportunity → Customer). On the **Contact**.

This codebase **now has one axis per object** — the eight fused status-ish fields were consolidated (see the changelog). The collision analysis below is retained to explain *what was wrong and why the fix matters*; each item notes how it was resolved.

### THE COLLISIONS (named, with proof) — now resolved
- **`Qualified` used to mean four things** (Lead status, Deal stage, Contact `status` chip, Contact `pstatus`). **Resolved:** `Qualified` now exists only as a **Deal stage**; the Lead's ready-to-convert state is `Sales-Ready`, and the contact `pstatus`/`status`-chip vocabularies were removed. The word means exactly one thing.
- **`Customer` used to mean three things** (Contact `cstatus`, Contact `lifecycle`, Company `type`). **Resolved:** `Contact.lifecycle` was removed; the post-conversion relationship lives on `cstatus` (Prospect/Customer/Lost), and `Company.type` stays a distinct relationship-kind category.
- **`Lead` used to mean three things** across Contact `status`/`cstatus`/`lifecycle` on top of the Lead object. **Resolved:** those contact fields were dropped or narrowed; "Lead" is now just the Lead object, and `cstatus` no longer offers `Lead`.
- **`pstatus` used to be the lead status copied onto the contact** — **removed entirely.** The pre-conversion phase lives on `lead.status`; the contact no longer carries a frozen snapshot of it.

### CONFUSION TO PRE-EMPT
- **"If a record says `Qualified`, what does it mean?"** Now unambiguous — it is a **Deal stage** (the only place `Qualified` lives). The Lead's equivalent state is `Sales-Ready`.
- **"Which field decides if someone is a customer?"** On the contact, `cstatus` (Prospect/Customer/Lost) is the single relationship axis; conversion no longer force-sets `Customer`. `Company.type` is a separate relationship-kind category. (The backend should derive "Customer" from a won deal — see the note at the section end.)
- **"Are lead status and deal stage the same pipeline?"** No. They are different axes on different objects, with **no shared vocabulary** now, and must never be merged or filtered together.

### VERDICT
- ✅ **RESOLVED — one lifecycle axis per object.** The eight fused fields collapsed to: `lead.status` (New → Contacted → Nurturing → Sales-Ready → Disqualified), `deal.stageKey/dStage` (+ persisted `deal.outcome`), `cstatus` (Prospect/Customer/Lost) on the Contact, and `Company.type` as a relationship category. Contact `lifecycle`, `pstatus`, and the mixed `status` heat vocabulary were removed (heat is now derived from `score`). No word (`Qualified`/`Customer`/`Lead`) spans multiple axes anymore, so reporting/filtering can answer "what stage is this record at," and converted contacts are no longer auto-mislabeled. **Residual (backend):** the prototype still *stores* `cstatus`; the backend should derive the contact relationship label from deals instead.

### FIX (the target model)
Collapse to three axes, one per object, with non-overlapping vocabularies:

| Axis | Object | Proposed values | Replaces |
|---|---|---|---|
| **Lead status** | Lead | New → Contacted → Nurturing → **Qualified** → Unqualified | `Lead.status` (fold in `Contacted`/`Engaged`) |
| **Deal stage** | Deal | Prospecting → Proposal → Negotiation → Closed, **plus** `status: Open/Won/Lost` | `Deal.dStage/stageKey` (drop a "Qualified" deal stage) |
| **Contact relationship** | Contact | *(not stored)* Customer / Opportunity / Contact — **derived from deals** | replaces `Contact.lifecycle` |

**Resolving the `Qualified` collision:** two clean options exist — keep `Qualified` on *one* object and rename the other. **The prototype took the inverse of this table:** it kept `Qualified` as the **Deal stage** and renamed the Lead's ready-to-convert state to **`Sales-Ready`** (full lead axis: New → Contacted → Nurturing → Sales-Ready → Disqualified). Either way the word now means exactly one thing; the shipped choice is `Sales-Ready` on the Lead, `Qualified` on the Deal.

Then: **delete all four contact status fields — `Contact.status`, `Contact.cstatus`, `Contact.pstatus`, *and* `Contact.lifecycle`.** A contact stores no lifecycle axis; derive a relationship label from its deals when one needs to be shown (Customer = has a Won deal; Opportunity = has an Open deal; otherwise just a contact). This is the small-team choice — fewer fields, zero sync burden, and it can never contradict the deals (which is precisely how conversion mislabeled new prospects as `Customer`). Keep `Company.type` strictly as relationship kind (Customer/Prospect/Partner/Vendor) and document that it is **not** a lifecycle. Derive any Hot/Warm/Cold "temperature" from `score`. *(If a marketing funnel — MQL/SQL — is ever needed for people with no deal yet, that belongs on the Lead, not the Contact.)*

---

## STEP 3 — System health verdict, root causes, fixes

### SYSTEM HEALTH VERDICT
**Are they on the right path? Yes on *flow*, and now largely yes on *fields* too.** The object set is correct (Lead, Contact, Company, Deal, Pipeline/Stage, Activity, Custom Objects all exist and map to the canonical model), and the **conversion flow is genuinely well-modeled** — it spawns Contact + Company + Deal, enrolls the *Deal* (not the Lead) at the first stage, and mints all three id-linked. That is the hardest thing to get right, and they got it right.

The field-level defects that used to undermine the model — overlapping status axes, enum/data drift, name-string relationships — **have now been applied in the prototype** (one axis per object, reconciled enums, id-based links with Company as the hub, persisted activities, capture-creates-Leads). The table below marks each original finding's current status; a few residual items remain as *backend* recommendations (derive contact relationship from deals, promote Pipeline/activities to first-class id'd entities).

### Original ❌ DEFECTs and ⚠️ RISKs, with current status

| Sev | Type | Finding | Status now |
|---|---|---|---|
| **High** | ❌ DEFECT | Fused/duplicated lifecycle axes (`Qualified`/`Customer`/`Lead` span multiple fields; `pstatus` duplicates lead status) | ✅ Resolved — one axis per object (Component 9) |
| **High** | ❌ DEFECT | Four contradictory status fields on Contact | ✅ Resolved — `lifecycle`/`pstatus` removed; `cstatus` + derived heat remain |
| **High** | ❌ DEFECT | Relationships by name string, not id (deal→contact/company, contact→company) | ✅ Resolved — id-linked (`companyId`/`primaryContactId`/`additionalContactIds`), Company as hub, `migrateLinks()` backfills |
| **High** | ❌ DEFECT | Lead status enum/data drift → leads vanish from funnel | ✅ Resolved — `LEAD_STATUSES` canonical; seed obeys it |
| **High** | ❌ DEFECT | Pipeline + close date on the Lead | ✅ Resolved — removed from the Lead; attach to Deal at convert |
| **High** | ⚠️ RISKY | No persisted, polymorphic activity store (the spine) | ◐ Partly — logged activities now persist across nav (`crm.activities`); a first-class table is still a backend task |
| **High** | ⚠️ RISKY | Account relationships name-joined → duplicate accounts split one pipeline | ✅ Resolved — id-first joins; `migrateLinks()` collapses missing companies |
| **High** | ⚠️ RISKY | Multiple drifting sources of truth for the stage list | ✅ Resolved — all derived from `STAGES_DATA`; Lost reachable |
| **High** | ❌ DEFECT | Conversion sets `lifecycle:'Customer'` on a brand-new prospect | ✅ Resolved — sets `cstatus:'Prospect'` only |
| **Med** | ❌ DEFECT | "Pipeline" is a string, not an entity owning stages | ◐ Partly — deal pipelines are user-creatable with their own stages; still linked by name, not `pipeline_id` |
| **Med** | ❌ DEFECT | `cstatus` enum/data mismatch (`Lead` not in `CONTACT_STATUSES`) | ✅ Resolved — `cstatus` = Prospect/Customer/Lost only |
| **Med** | ❌ DEFECT | Contact↔Company is one-to-one, not many-to-many with role | ◐ Now id-linked & rename-safe; still single-company (m:n is a backend task) |
| **Med** | ⚠️ RISKY | Won/Lost modeled as stages — conflates progress with outcome | ◐ Partly — still stages, but a structured `deal.outcome` (reason+note) now persists on close |
| **Med** | ⚠️ RISKY | Deals stored in two places (`deals` array vs per-stage `demo[]`) | Unchanged (prototype convenience) |
| **Med** | ⚠️ RISKY | Single-parent activity links → duplicate logging | Unchanged (backend task) |
| **Low** | ⚠️ RISKY | `stageKey`+`dStage` denormalized; `email`+`emails` dual; custom-obj links by name | Unchanged (backend cleanups) |

### ROOT CAUSES (the 1–3 decisions that generated most of the confusion — now addressed)
1. **No single lifecycle axis per object → fixed.** The overlapping status fields (`status`, `cstatus`, `lifecycle`, `pstatus`, plus deal stage and company type) were consolidated to one axis per object, dissolving the `Qualified`/`Customer`/`Lead` collisions. → Component 9.
2. **Name-as-foreign-key → fixed for the core objects.** Records now link by id (`companyId`, `primaryContactId`, `additionalContactIds`) with Company as the hub and a one-time `migrateLinks()` backfill; joins are id-first with a name fallback. Renames are safe. Parent-company and activity links remain name-based (backend follow-ups). → Components 2, 3, 4, 7.
3. **Lead/Deal boundary leak → fixed.** `pipeline`/`expectedCloseDate` were removed from the Lead, and conversion no longer force-sets `Customer`; capture channels create Leads (not Contacts). The lifecycle is now cleanly separated end to end. → Components 1, 6, 8.

### PRIORITIZED FIX LIST (what's done vs. what remains for the backend)
*Items 1–3 and the core of 4 are **applied in the prototype**; the rest are backend follow-ups.*
1. ✅ **One lifecycle vocabulary per object.** Dropped `Contact.lifecycle`/`pstatus` and the mixed `status` heat vocab; `cstatus` (Prospect/Customer/Lost) is the one stored axis; `Qualified` is Deal-only; win/loss captured on `deal.outcome`. *Backend:* derive the contact relationship from deals rather than storing `cstatus`. — Component 9.
2. ✅ **Enums reconciled with seed data** — `LEAD_STATUSES` and `cstatus` now match their data. — Components 1, 2.
3. ✅ **`pipeline`/`closeDate` moved off the Lead; conversion no longer sets `Customer`.** — Components 1, 6.
4. ◐ **Id-based relationships for the core objects are in** (`companyId`, `primaryContactId`, `additionalContactIds`, Company as hub, `migrateLinks()` backfill). *Backend:* add the m:n `deal_contacts`/`contact_company`/`activity_links` joins and id the parent-company link. — Components 2–4, 7.
5. **Make Pipeline a first-class entity** with owned stages linked by `pipeline_id` (deal pipelines are already user-creatable; only the id link is missing). *Medium effort.* — Component 5.
6. **Design the persistent, polymorphic activity table** (the prototype now persists logged activities across nav, but not as a first-class multi-parent table). *Medium effort.* — Component 7.

### ADD / REMOVE
**Add (missing today):**
- Stable `id`/`external_id`-based relationships on every object (the backend's #1 prerequisite).
- A real, persisted `activities` table with polymorphic, multi-parent links.
- `Deal.status` (Open/Won/Lost) separate from `stage`.
- Field-level history on `deal.amount` and `deal.stage` (needed for trustworthy forecasting).
- A real `Pipeline` entity with per-pipeline stages.
- A `contact_company` and `deal_contacts` join (many-to-many + role).

**Remove (redundant today):**
- `Contact.status`, `Contact.cstatus`, `Contact.pstatus`, **and `Contact.lifecycle`** — store no lifecycle axis on the Contact; derive a relationship label (Customer/Opportunity/Contact) from its deals when needed.
- `Lead.pipeline`, `Lead.expectedCloseDate`.
- The standalone `DEAL_STAGE_ORDER`/`DEAL_STAGE_COLOR` constants and inline stage literals (derive from stage rows).
- Redundant `dStage` (keep `stage_id`), and scalar `email`/`phone` (keep arrays + primary flag).
- The per-stage `demo[]` deal store (one `deals` table).

---

## Target Model (corrected) — the design to build to

> This is the **decided** target design. Where a per-component FIX above offered alternatives, the decision is recorded here and this section is authoritative.

### The objects and what each is FOR

| Object | Plain meaning | The one question it answers |
|---|---|---|
| **Lead** | An unvalidated maybe — captured but not yet confirmed worth pursuing | "Is this worth pursuing at all?" |
| **Contact** | A real, validated person (born from converting a Lead) | "Who am I dealing with?" |
| **Company (Account)** | The organization a Contact belongs to | "Which org is this?" |
| **Deal (Opportunity)** | One specific chunk of revenue you're chasing | "How much, how likely, what stage?" |
| **Pipeline** | An ordered set of Stages a Deal travels (an *entity*, not a string) | "What's the path to closing?" |
| **Stage** | One step of a pipeline, owns order + color + probability default | "Where on the path is this deal?" |
| **Activity** | A logged note/call/email/meeting/**task** on the timeline | "What happened, and what's next?" |

### One status axis per object (the core decision)

Three lifecycle axes, none sharing a word. The Contact stores **no** axis.

| Axis | Lives on | Values | Applies |
|---|---|---|---|
| **Lead status** | Lead | New → Contacted → Nurturing → **Sales-Ready** → Disqualified | BEFORE conversion |
| **Deal stage** | Deal | Prospecting → Qualified → Proposal → Negotiation → Won/Lost | AFTER conversion |
| **Deal outcome** | Deal | Open / Won / Lost | the result, kept separate from stage |
| **Company type** | Company | Customer / Prospect / Partner / Vendor — a *category*, not a lifecycle | always |
| **Contact relationship** | Contact | *(not stored)* — **derived** from deals: Customer (has a Won deal) / Opportunity (has an Open deal) / else Contact | always |

Rules attached to this table:
1. **`Qualified` lives only on the Lead.** No "Qualified" deal stage — Deals start at Prospecting.
2. **Won/Lost is an outcome, not a stage.** A deal has a *stage* (progress) and a *status* (Open/Won/Lost). Keeping them separate is what makes "days in stage" and "win rate by stage" reporting trustworthy.
3. **The Contact stores no lifecycle field.** Derive a relationship label from its deals when displaying one.

### Derive, never store
- **"Customer"** → from a Won deal (don't set it at conversion).
- **Hot / Warm / Cold** → from `score`.
- **Deal probability default** → from its stage (rep can override on the deal).
- **Stage order / color / name** → from the stage record (the prototype already derives `DEAL_STAGE_ORDER`/`_COLOR` from `STAGES_DATA`).

### Relationships — all by stable ID, never by name
- **Contact ↔ Company:** many-to-many, with a *role* and one marked *primary*.
- **Company → Company:** parent/child hierarchy, by ID.
- **Deal → Company:** one account per deal.
- **Deal ↔ Contacts:** many-to-many with a *role* (Decision maker, Champion); one primary. *(The prototype now stores `primaryContactId` + `additionalContactIds` alongside the display names; the backend only needs the m:n `deal_contacts` join to carry the role.)*
- **Activity ↔ Contact / Company / Deal:** many-to-many, polymorphic — one logged call attaches to the person, the deal, AND the company at once (log once, not three times).
- **Lead → on convert:** spawns a Contact (+Company) + Deal, ID-linked both ways; the Lead is kept, marked converted.

### The end-to-end lifecycle
1. A **Lead** arrives → status **New**.
2. Rep works it (New → Contacted → Nurturing); activities log to the lead's timeline.
3. Worth it → status **Sales-Ready** → **Convert**. Not worth it → **Disqualified** (archive).
4. Convert creates a **Contact**, a **Company** (if new), and a **Deal**; the Lead is kept and linked by ID.
5. The **Deal** — not the Lead — enters a **Pipeline** at its first **Stage**, carrying amount, close date, probability.
6. The Deal advances stage by stage; activities/tasks log against it and appear on the contact + company too.
7. The Deal's **outcome** is set **Won** or **Lost**. On Won, the contact *reads as* Customer (derived) — nothing is hand-set.

### What this removes from today's model
- All four contact status fields (`status`, `cstatus`, `pstatus`, `lifecycle`) → none stored; derive a label from deals.
- `Lead.pipeline`, `Lead.expectedCloseDate` → move to the Deal.
- Won/Lost as stages → a separate Open/Won/Lost outcome.
- Every name-based link → ID-based.
- Free-text `pipeline` string → a real Pipeline entity that owns its stages.

---

### Applied to the prototype (`index.html`) — June 2026

The following corrections were made directly in the prototype and verified (Babel parse clean + headless render with zero JS errors across dashboard, contacts list, contact detail, and leads):

- **Lead status standardized** (later relabeled in Waves 1–3 to `New → Contacted → Nurturing → Sales-Ready → Disqualified` — see below). The off-enum seed values `Working`→`Contacted` and `Engaged`→`Nurturing` were remapped; chip/dot maps, the dashboard funnel order, the saved view, and the lead-status form options were all aligned, so no lead can fall outside the enum.
- **Contact reduced to one relationship axis.** `lifecycle` and `pstatus` were removed everywhere (seed data, contact-detail pills, list column, filters, import/export, settings card, automation set-field, and all six contact-creation builders). The contact-detail page now shows a single **Status** pill bound to `cstatus`; the heat badge is the orthogonal temperature axis (reworked in round 3 — see below).
- **Conversion no longer mislabels.** The convert flow no longer stamps `lifecycle:'Customer'` / `pstatus` on a brand-new contact; it sets only `cstatus:'Prospect'`.
- **`cstatus` finalized to `Prospect` / `Customer` / `Lost`** — the single post-conversion relationship axis. `Lead` was dropped (it belongs to the Lead object; the pre-conversion lifecycle lives on `lead.status`), and the funnel/demo contacts that used it now default to `Prospect`.
- **Not changed at this round (later addressed in Waves 1–3):** Won/Lost remained pipeline stages, the deal-stage names were left intact, and relationships were still name-based. (Waves 1–3 below then added a persisted `deal.outcome` and id-based linking with Company as the hub.)

**Follow-up cleanup (rounds 2–3):**
- **`pipeline` + `expectedCloseDate` removed from the Lead.** They existed only to pre-fill the Convert modal's deal defaults. Removed from the lead builder, detail fields, filters, and seed data; the Convert modal now defaults the *deal* to `Sales Pipeline` / empty close (still user-editable). Pipeline now lives only on the Deal.
- **Dead `mktStatus` field removed** (was written on AddRecordDrawer contacts, never read).
- **Heat reworked to a clean, derived temperature.** The contact `status`/"Heat" badge no longer stores a mixed `Active/New/Lead/Qualified` vocabulary; it is now **derived from `score`** as Hot (≥70) / Warm (≥40) / Cold via a `contactHeat()` helper, used by the dashboard "Most active" widget and the list Heat column. The dead `STATUS_CHIP` constant was deleted and the dead `ContactsFilterPanel`'s status vocabulary was cleaned, so no `Lead`/`Qualified` heat values remain anywhere.
- **Resolved — `cstatus` = `Prospect` / `Customer` / `Lost`.** Dropped `Lead` because it belongs to the Lead object. The lifecycle is now cleanly split across two objects: **`lead.status`** owns the pre-conversion phase (relabeled in Waves 1–3 to New → Contacted → Nurturing → Sales-Ready → Disqualified) and **`cstatus`** owns the post-conversion relationship (Prospect → Customer, or Lost). No status vocabulary is shared between the two.

> **Prototype vs. backend:** the prototype *stores* `cstatus` as the single relationship axis to keep the curated demo data rich. The backend should instead **derive** that label from deals (Customer = won deal, Opportunity = open deal, else Contact), as described above — don't carry a hand-set relationship field into the schema.

**Waves 1–3 + re-audit (July 2026):**
- **Lead lifecycle relabeled and fully separated from the deal pipeline.** `LEAD_STATUSES` is now `New → Contacted → Nurturing → Sales-Ready → Disqualified`. `Qualified`/`Unqualified` no longer exist on the Lead side (the Deal pipeline keeps its own `Qualified` stage); dashboards, funnels, saved views, property defs, and booking all use the new labels.
- **Pipelines are Deals-only + scoped.** Leads/Contacts/Companies were removed from the "New pipeline" object picker (Deals + custom objects only). The Leads page gained a **List/Board toggle** — a status board *view* grouped by lead status, not a pipeline. The pipeline board scopes deals to *their own* pipeline (a deal shows only on its pipeline, not on every board sharing a `stageKey`).
- **Deal stages have one canonical source.** `DEAL_STAGES_ALL` / `DEAL_STAGE_ORDER` / `DEAL_STAGE_COLOR` are derived from `STAGES_DATA`; new deals default to **Prospecting** (not Qualified); **Lost is reachable everywhere**; closing a deal Won/Lost captures a reason + note now **persisted on `deal.outcome`** and shown on the deal.
- **Id-based linking, Company as the hub.** Records link by id — `contact.companyId`, `deal.companyId`, `deal.primaryContactId`, `deal.additionalContactIds` — alongside the display names. A one-time `migrateLinks()` at app start auto-creates missing companies and backfills ids; joins are id-first with a name fallback. A deal's Primary contact resolves the real named person; the Contact **Deals panel is now real** (queries the contact's actual deals). Renaming a company cascades display names and never orphans children. The lead-convert flow and every live create path mint id-linked records; the **deal form auto-fills Company from the picked Contact**.
- **Activities/notes persist across navigation.** Logged notes/calls/meetings/tasks are stored in a shared `CrmDataContext.activities` store keyed by record, so they survive leaving and returning (were component-local, lost on nav).
- **Capture channels create Leads (status New), not Contacts.** Ad platforms (`ingestAdLead`), forms & funnels (`runFunnelSubmit` — honors the form's lead|contact toggle, defaults to lead), and booking all create Leads with three-way dedupe (known Contact updated in place, known Lead updated, else a new Lead). Ad-lead feed rows route to lead-detail.
- **Bulk Convert is real.** The Leads bulk-bar "Convert" runs each selected lead through the id-linked Contact + Company + Deal builder (behind a confirm) and marks them converted — no longer a toast-only fake.
- **Converted leads are read-only** — status/edit/schedule/notes are gated once a lead is converted.

---

*When the team later shares their build flow, map each of their errors back to the component and root cause above (most will trace to Root Cause 1 — no single lifecycle axis — or Root Cause 2 — name-as-foreign-key).*
