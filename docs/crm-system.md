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
| 1 | Lead | `LEADS_DATA` [index.html:8202], `LEAD_STATUSES` [:8197], `LEAD_SOURCES` [:8200] |
| 2 | Contact | `CONTACTS_DATA` [:4886], `CONTACT_STATUSES` [:4909], `STATUS_CHIP` [:4908], `CSTATUS_CHIP` [:4910] |
| 3 | Company (Account) | `COMPANIES_DATA` [:7866], `COMPANY_TYPES` [:7863] |
| 4 | Deal (Opportunity) | `STAGES_DATA` deals [:7290], live `deals` state [:20596], `DEAL_STAGE_ORDER` [:7736] |
| 5 | Pipeline & Stage | `STAGES_DATA` [:7290], `STAGE_COLORS` [:7477], `addStage` [:7509], `AD_PIPELINES` [:8238] |
| 6 | Conversion (Lead → Contact + Company + Deal) | `buildConvertRecords` [:8316], `doConvert` [:8500]/[:8638] |
| 7 | Activity & Task (the timeline spine) | `buildActivityFeed` [:6683], `ACT_CAT` [:6540], task events [:17173] |
| 8 | Custom Objects | builder block [:19891], `customObjects` in context |
| 9 | Status / Lifecycle axes (cross-cutting) | synthesizes the status fields found across 1–4 |

**Verdict legend:** ✅ CONFORMS · ⚠️ RISKY (Low/Med/High) · ❌ DEFECT (Low/Med/High).

---

## Component 1 of 9 — Lead

### SOURCE
- Enum: `LEAD_STATUSES = ['New','Working','Nurturing','Qualified','Unqualified']` — [index.html:8197](index.html)
- `LEAD_SOURCES = ['Web form','Referral','Cold outreach','Event','Ad','LinkedIn','Import']` — [index.html:8200](index.html)
- Seed records: `LEADS_DATA` — [index.html:8202](index.html)
- Funnel widget that consumes status: [index.html:4537](index.html)

### WHAT IT IS
A **Lead** is an unqualified, unvalidated inbound prospect — a name/email/company you captured but haven't confirmed is worth pursuing. It is meant to be cheap and disposable. In code, a lead record looks like:

```js
{id:1, name:'Olivia Bennett', company:'Brightwave Studio', email, phone, title,
 source:'Web form', status:'Qualified', score:82, estValueNum:18000,
 owner:'AM', converted:false, archived:false,
 pipeline:'Sales Pipeline', expectedCloseDate:'2026-07-30', ...}   // index.html:8204
```

The key field is **`status`** — the lead's lifecycle *before* it becomes a real relationship.

### WHY IT EXISTS HERE
The Leads page is the top of the funnel. A rep works a lead (calls, emails), decides if it's real, and either **Converts** it (Component 6) or marks it `Unqualified`/archives it. `score` (0–100, bucketed Hot/Warm/Cold at [index.html:8201](index.html)) helps prioritize which leads to work.

### SEE ALSO
- `status` is rendered by `LEAD_STATUS_CHIP` / `LEAD_STATUS_DOT` — [index.html:8198–8199](index.html). Those maps define colors for exactly the five enum values.
- The dashboard **lead-funnel** widget hard-codes the same five values as its row order: `['New','Working','Nurturing','Qualified','Unqualified']` — [index.html:4537](index.html).
- `'Qualified'` *also* appears as a **Deal stage** (`DEAL_STAGE_ORDER`, [index.html:7736](index.html)) and as a **Contact** `status`/`pstatus` value. See Component 9.
- The add-lead path guards status: `if(!LEAD_STATUSES.includes(status))status='New'` — [index.html:2326](index.html), [:5027](index.html). The **seed data does not go through that guard.**

### CONFUSION TO PRE-EMPT
- **"Is a Lead the same as a Contact?"** No. A Lead is a *maybe* — unvalidated, pre-relationship. A Contact (Component 2) is a *yes* — a validated person you've decided to work with. The bridge between them is Conversion (Component 6).
- **"Is lead `status` the same as a deal `stage`?"** No — and this is the single most important distinction in the whole system. **Lead status** = the lifecycle *before* money is on the table (is this worth pursuing?). **Deal stage** = the lifecycle of a specific revenue opportunity *after* conversion (how close is this money?). They are two different axes on two different objects. The fact that `'Qualified'` is spelled identically in both does not make them the same thing.
- **"Why does a Lead have a `pipeline` and an `expectedCloseDate`?"** It shouldn't (see Verdict). Those are deal concepts that leaked onto the lead.

### VERDICT
- ❌ **DEFECT — High: seed data contains statuses that aren't in the enum.** `LEADS_DATA` seeds `status:'Contacted'` ([index.html:8205](index.html), [:8214](index.html)) and `status:'Engaged'` ([index.html:8206](index.html)) — neither is a member of `LEAD_STATUSES`. **Rule broken:** an enum field's stored values must be a subset of the enum. **Concrete symptom:** the dashboard lead-funnel ([index.html:4537](index.html)) iterates only the five canonical values, so every `Contacted`/`Engaged` lead is silently **invisible** in the funnel and in any status filter built from `LEAD_STATUSES`; `LEAD_STATUS_CHIP['Contacted']` is `undefined`, so those rows render with no status color. This is exactly the failure that "enum options hard-deleted / drifted" causes.
- ❌ **DEFECT — High: pipeline and close-date live on the Lead.** Leads carry `pipeline:'Sales Pipeline'` and `expectedCloseDate` ([index.html:8204](index.html)). **Rule broken:** *pipelines belong to Deals, not Leads* — a lead has no money on the table to forecast. **Symptom:** you can "enroll a lead in a pipeline" and set a close date before any deal exists, producing forecast numbers for opportunities that don't exist yet, and forcing the question "which pipeline?" at the wrong moment in the lifecycle.
- ⚠️ **RISKY — Med: `'Qualified'` collides with the deal stage of the same name** (full treatment in Component 9). Cost: every developer and every report has to carry the object context ("Qualified *what*?") to disambiguate; a careless join or filter will mix leads and deals.
- ✅ **CONFORMS:** `source` is a clean controlled enum; `converted`/`archived`/`deleted` give a soft-delete + lifecycle model; `score` with Hot/Warm/Cold bucketing is a sound prioritization pattern.

### FIX
1. **Reconcile the enum with the data.** Decide one canonical lead-status set and make the seed obey it. The seed implies the *intended* set is `New → Contacted → Working → Nurturing → Qualified → Unqualified` (it actually uses `Contacted`/`Engaged`). Pick one vocabulary; if `Contacted` is real, add it to `LEAD_STATUSES` and the chip/dot maps; delete `Engaged` or define it. **Backend:** store lead status as a constrained enum; reject/normalize on import (don't silently keep `Engaged`).
2. **Remove `pipeline` and `expectedCloseDate` from the Lead.** These attach to the **Deal** at conversion (Component 6 already does this correctly). A lead may keep a *non-binding* `estValueNum` for prioritization, but not a pipeline or a forecast close date.
3. Resolve the `'Qualified'` collision by keeping it **only on the Lead** and dropping a "Qualified" *deal* stage (Deals start at `Prospecting`, which conversion already does). See Component 9 / Target Model.

---

## Component 2 of 9 — Contact

### SOURCE
- Seed records: `CONTACTS_DATA` — [index.html:4886](index.html)
- `CONTACT_STATUSES = ['Prospect','Customer','Lost']` — [index.html:4909](index.html)
- `STATUS_CHIP = {Active, Hot, Warm, New, Lead, Qualified}` — [index.html:4908](index.html)
- `CSTATUS_CHIP = {Lead, Prospect, Customer, Lost}` — [index.html:4910](index.html)

### WHAT IT IS
A **Contact** is a validated individual person you have a real relationship with — typically the output of converting a Lead. A representative record:

```js
{id:1, name:'Sarah Chen', co:'Meridian Agency', email, phone, title:'CEO',
 status:'Active', cstatus:'Customer', lifecycle:'Customer', pstatus:'Qualified',
 score:88, owner:'AM', source:'Referral',
 emails:['s.chen@meridian.co'], phones:['+1 555-234-0000'],
 address:{...}, tags:[...], createdBy, createdAt, ...}   // index.html:4888
```

### WHY IT EXISTS HERE
The Contact is the hub of the relationship: it anchors the timeline (calls/emails/notes/tasks), links to a Company, and is the thing a Deal is "for." A real person belongs here; a maybe-person belongs in Leads.

### SEE ALSO
- A Contact links to its Company **by name string** via the `co` field (`co:'Meridian Agency'`), and joins are done by name — `dealsForCompany(co.name)`, `contactsForCompany(co.name)` ([index.html:7894](index.html)). No company **id** is stored on the contact.
- The Contact has **two** email/phone representations: scalar `email`/`phone` *and* arrays `emails`/`phones` ([index.html:4888](index.html)).
- The Contact carries **four** distinct status-like fields — `status`, `cstatus`, `lifecycle`, `pstatus` — each with its own vocabulary. This is the heart of the audit; see Component 9 for the full collision map.
- `CONTACT_STATUSES` ([index.html:4909](index.html)) is the editable dropdown for `cstatus`, but it lists only `Prospect/Customer/Lost` while `CSTATUS_CHIP` and the seed also use `Lead` ([index.html:4887](index.html) `cstatus:'Lost'`, [index.html:4910](index.html) `Lead:`).

### CONFUSION TO PRE-EMPT
- **"Which field is *the* status of a contact?"** There is no single answer in the code today — there are four (`status`, `cstatus`, `lifecycle`, `pstatus`). That ambiguity is a defect, not a feature; see the Verdict.
- **"Why is there both `email` and `emails`?"** Legacy/duplication. The scalar is the "primary"; the array is "all." They are not kept in sync by any code I can see, so they can disagree.
- **"A contact links to a company — one company or many?"** Exactly one, by name string (`co`). A person who works across two companies cannot be represented.
- **"Where do a contact's deals live?"** Not on the contact. Deals are matched to a contact by name (`deal.primaryContact === contact.name`), see Component 4.

### VERDICT
- ❌ **DEFECT — High: four overlapping status axes on one object.** A single contact stores `status` (vocabulary `Active/Hot/Warm/New/Lead/Qualified`, [index.html:4908](index.html)), `cstatus` (`Prospect/Customer/Lost/Lead`), `lifecycle` (`Lead/Sales Qualified Lead/Opportunity/Customer`, seen across [index.html:4888–4906](index.html)), and `pstatus` (`New/Contacted/Nurturing/Qualified`). **Rule broken:** one object, one lifecycle axis (plus at most one orthogonal axis with a clearly different meaning). **Symptom:** these fields *contradict each other in the seed* — e.g. James Rivera is `status:'Hot'`, `lifecycle:'Opportunity'`, `pstatus:'Contacted'` ([index.html:4889](index.html)); after conversion a contact is set to `cstatus:'Prospect'` **and** `lifecycle:'Customer'` simultaneously ([index.html:8322](index.html), and Component 6). No report, filter, or automation can trust "what stage is this contact at" because four fields answer differently.
- ❌ **DEFECT — Med: `cstatus` enum/data mismatch.** Editable options are `['Prospect','Customer','Lost']` ([index.html:4909](index.html)) but data + chip map include `Lead` ([index.html:4910](index.html)). Same class of bug as Lead status drift. **Symptom:** a contact with `cstatus:'Lead'` can be displayed (chip exists) but never re-selected from the dropdown.
- ❌ **DEFECT — Med: Contact↔Company is one-to-one by name string.** `co` is a single string ([index.html:4888](index.html)); joins are name-based ([index.html:7894](index.html)). **Rule broken:** Contact↔Company should be many-to-many with a role, joined by id. **Symptom:** (a) renaming a company orphans all its contacts and deals; (b) the duplicate companies "Meridian Agency" vs "Meridian Agency Inc." ([index.html:7868](index.html)/[:7879](index.html)) split the same person's relationships; (c) a consultant who works at two clients can't be modeled.
- ⚠️ **RISKY — Low: dual `email`/`emails` (and `phone`/`phones`).** Cost: two sources of truth that can drift; ambiguous which is canonical.

### FIX
1. **Store no lifecycle axis on the Contact at all** — *delete* `status`, `cstatus`, `pstatus`, **and** `lifecycle`. A contact's "where are they" is fully derivable from its deals (Customer = has a Won deal; Opportunity = has an Open deal; otherwise just a contact). Compute a relationship label on the fly when you need to display one; never store it (storing it is exactly what caused the `Customer`-on-a-new-prospect bug). If an "engagement temperature" (Hot/Warm/Cold) is wanted, derive it from `score`. (See the Target Model section for the consolidated design.)
2. **Store company linkage by id, many-to-many.** Replace `co:'<name>'` with a `contact_company` join (`contact_id`, `company_id`, `role`, `is_primary`). Join on ids, never names.
3. Make `cstatus`/`lifecycle` options and stored values one set; validate on import.
4. Keep a single `emails[]`/`phones[]` with a `primary` flag; drop the scalar `email`/`phone` (or make them computed getters of the primary).

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
- `type` (`Customer/Prospect/Partner/Vendor`) overlaps semantically with Contact `cstatus`/`lifecycle`: **"Customer" is defined in three different places** — `Company.type`, `Contact.cstatus`, `Contact.lifecycle`. See Component 9.
- `parent` (e.g. Bloom Creative `parent:'Summit Digital'`, [index.html:7870](index.html)) is a **company hierarchy by name string** — same name-linkage pattern as everywhere else.
- `domain` exists and is the natural dedupe key, but the seed deliberately contains **un-deduped** records: `Meridian Agency`/`Meridian Agency Inc.`, `Summit Digital`/`Summit Digital LLC` (tagged `duplicate-import`, [index.html:7879–7880](index.html)).

### CONFUSION TO PRE-EMPT
- **"Company vs Contact?"** Company is the *org*; Contact is a *person* at that org. A deal is usually with a Company through one or more Contacts.
- **"Is `type` the company's deal stage?"** No. `type` is the *relationship kind* (are they a customer, a prospect, a partner, or a vendor). It is not a pipeline and not a per-deal status.
- **"How are a company's contacts/deals found?"** By matching the company **name** string (`dealsForCompany(name)`), not by a foreign key.

### VERDICT
- ⚠️ **RISKY — High: all account relationships are name-string joins.** `dealsForCompany(co.name)`, `contactsForCompany(co.name)`, and `parent:'<name>'` ([index.html:7870](index.html), [:7894](index.html)). **Cost / symptom:** the two seeded duplicate accounts (`Meridian Agency` vs `Meridian Agency Inc.`) will each match different contacts/deals by name, **splitting one real account's pipeline across two records** — the exact problem `domain`-based dedupe is supposed to prevent. Renames silently break the graph.
- ⚠️ **RISKY — Med: `type` overlaps the contact lifecycle vocabulary.** `Customer`/`Prospect` live on both the company (`type`) and the contact (`cstatus`/`lifecycle`). **Cost:** when a company is `type:'Customer'` but its only contact is `lifecycle:'Lead'`, which is true? Nothing reconciles them.
- ✅ **CONFORMS:** `domain` present as a dedupe key; `parent` gives account hierarchy; `billing`/`shipping` address split and `annualRevenue` (numeric) alongside `revenue` (banded display) are sound. The saved-view predicates ([index.html:7882](index.html)) are a clean segmentation model.

### FIX
1. **Join contacts/deals/parent by `company_id`, not name.** Enforce `domain` uniqueness (or a dedupe/merge flow) so `Meridian Agency` and `Meridian Agency Inc.` collapse to one account.
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
{id:1, name:'Meridian — Managed CRM', company:'Meridian Agency', value:'$8,400', amount:8400,
 stageKey:'prospecting', dStage:'Prospecting', pipeline:'Sales Pipeline',
 probability:30, closeDate:'2026-07-15', primaryContact:'Sarah Chen',
 additionalContacts:[{contact:'James Rivera',role:'Champion'}],
 source, amountType:'One-time', forecast:'Pipeline', owner, dealTags:[...]}   // index.html:7293
```

### WHY IT EXISTS HERE
Deals are what the pipeline board and the revenue forecast are built on. `amount` × stage `probability` drives the weighted forecast; `forecast` category (`Pipeline/Best case/Commit`) is a manual override; `closeDate` drives "closing this quarter." A deal moves stage-to-stage until it's `Won` or `Lost`.

### SEE ALSO
- A deal points at its account and people **by name string**: `company:'Meridian Agency'`, `primaryContact:'Sarah Chen'`, `additionalContacts:[{contact:'James Rivera', role}]` ([index.html:7293](index.html)). No `contact_id`/`company_id`.
- `stageKey` (machine key, e.g. `'prospecting'`) and `dStage` (display name, `'Prospecting'`) are **both stored on every deal** — two fields for one fact.
- `pipeline` is the same free-text string used on Leads ([index.html:8204](index.html)) — see Component 5.
- The `additionalContacts` role values (`Champion`, `Decision maker`) are the right idea — a deal↔contact link *with a role*.

### CONFUSION TO PRE-EMPT
- **"Why does a deal sit 'under' a contact in the UI?"** Because a deal is *for* a person/account — it represents money tied to that relationship. One account/contact can have many deals over time (new business, renewal, expansion). The deal is the unit of revenue; the contact is who you're dealing with.
- **"Lead vs Deal?"** A Lead is a pre-qualification *maybe* with no committed opportunity. A Deal is a *qualified* opportunity with an amount and a stage. Converting a Lead is what spawns a Deal (Component 6).
- **"Is a deal's `stage` the same as a lead's `status`?"** No — see Component 9. Stage = money lifecycle (post-conversion); status = pursuit lifecycle (pre-conversion).
- **"Where is the single list of all deals?"** The live `deals` array in context ([index.html:20596](index.html)). But beware the dual store below.

### VERDICT
- ❌ **DEFECT — High: deals reference contacts and companies by name string, not id.** `company`, `primaryContact`, `additionalContacts[].contact` are all names ([index.html:7293](index.html), [:8326](index.html)). **Rule broken:** entity relationships must be by stable id (`external_id` on every entity). **Symptom:** rename "Sarah Chen" and the deal silently detaches; the duplicate "Meridian Agency"/"Meridian Agency Inc." accounts can't both own this deal correctly; forecasting and "deals by account" reports are only as reliable as exact string matches.
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
- The (one) modeled pipeline's stages: `STAGES_DATA` — [index.html:7290](index.html)
- `DEAL_STAGE_ORDER = ['Prospecting','Qualified','Proposal','Negotiation','Won']` — [index.html:7736](index.html)
- `DEAL_STAGE_COLOR` — [index.html:7737](index.html); `STAGE_BY_KEY` — [index.html:7845](index.html)
- User-editable stages: `addStage` [index.html:7509](index.html), `addStageInline` [:7518](index.html), `STAGE_COLORS` [:7477](index.html), edit UI [:7651](index.html)
- Pipeline names: `AD_PIPELINES = ['Sales Pipeline','Onboarding Pipeline']` — [index.html:8238](index.html)

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

### SEE ALSO
- **Three different sources define "the stages":** (a) `STAGES_DATA` (6 stages incl. Won + Lost), (b) `DEAL_STAGE_ORDER` (5 stages, **omits Lost**, [index.html:7736](index.html)), and (c) the user-editable runtime `stages` state ([index.html:7509](index.html)). The import/quick-add path uses yet another inline literal `['Prospecting','Qualified','Proposal','Negotiation','Won']` ([index.html:5026](index.html)).
- **`pipeline` is a free-text string** on deals and leads (`'Sales Pipeline'`, `'Onboarding Pipeline'`). `AD_PIPELINES` ([index.html:8238](index.html)) lists two names, but **only one pipeline's stages are actually modeled** (`STAGES_DATA` is the Sales pipeline). The "Onboarding Pipeline" has no stage definitions anywhere.
- Stage name `'Qualified'` is identical to the Lead status `'Qualified'` — Component 9.

### CONFUSION TO PRE-EMPT
- **"What object does the pipeline belong to?"** It must belong to the **Deal**. In this codebase it's a string that's stamped on both Deals *and* Leads — the Lead usage is wrong (Component 1).
- **"Are Won and Lost stages, or something else?"** Here they're modeled as **stages** (`STAGES_DATA` keys `won`/`lost`). That's a legitimate convention (Salesforce does the same with Closed Won/Closed Lost), but it means "stage" mixes *progress* with *final outcome* — see Verdict.
- **"Can different deal types use different stages?"** The data implies two pipelines (Sales, Onboarding) but only one has stages defined, so in practice: no, not yet.

### VERDICT
- ⚠️ **RISKY — High: multiple, drifting sources of truth for the stage list.** `STAGES_DATA` (6, with Lost) vs `DEAL_STAGE_ORDER` (5, no Lost) vs the editable runtime stages vs inline literals at [index.html:5026](index.html)/[:8326](index.html). **Symptom:** `DEAL_STAGE_ORDER` omitting `Lost` means any stepper/progress UI built from it can't represent a lost deal's stage; add a stage in the UI and the `DEAL_STAGE_ORDER`/`DEAL_STAGE_COLOR` constants don't know about it.
- ❌ **DEFECT — Med: "Pipeline" is a string, not an object with its own stages.** `pipeline:'Onboarding Pipeline'` can be set on a deal, but no stages exist for it; `STAGES_DATA` only models the Sales pipeline. **Rule broken:** a pipeline is *an entity that owns ordered stages*; per-pipeline stage definitions are required. **Symptom:** a deal "in" the Onboarding pipeline has Sales stages or none — the board can't render it correctly.
- ⚠️ **RISKY — Med: Won/Lost as stages conflate progress and outcome.** **Cost:** "average days in stage," "win rate by stage," and probability math get muddy because a terminal outcome sits in the same dimension as in-progress steps. The cleaner model is `stage` (progress) + a separate `status` = Open/Won/Lost (outcome) on the deal.
- ✅ **CONFORMS:** stages are user-editable with a per-stage probability (`prob`) default ([index.html:7509](index.html)) — this matches the Pipedrive-style per-pipeline stage model and is the right direction.

### FIX
1. **Make Pipeline a real entity** with `id`, `name`, and an ordered `stages` collection; `deal.pipeline_id` + `deal.stage_id` (FKs). Delete the free-text `pipeline` string and the standalone `DEAL_STAGE_ORDER`/`DEAL_STAGE_COLOR` constants — derive order/color from the stage rows.
2. **Split outcome from progress:** add `deal.status ∈ {Open, Won, Lost}`; keep `Won`/`Lost` out of the ordered stage list (or mark them as terminal stages flagged `is_won`/`is_lost`). This fixes both the `DEAL_STAGE_ORDER`-omits-Lost bug and the stage-velocity reporting.
3. Define the Onboarding pipeline's stages, or remove it until it exists.

---

## Component 6 of 9 — Conversion (Lead → Contact + Company + Deal)

### SOURCE
- Record builder: `buildConvertRecords(lead,payload)` — [index.html:8316](index.html)
- Apply + back-link: `doConvert` — [index.html:8500](index.html) (Leads page) and [:8638](index.html) (Lead detail)
- Modal UI: `ConvertLeadModal` — [index.html:8333](index.html)

### WHAT IT IS
**Conversion** is the moment a Lead is promoted into the "real" objects. `buildConvertRecords` produces up to three records from one lead — a **Contact**, optionally a **Company**, and optionally a **Deal** — and `doConvert` inserts them and stamps the lead as converted with back-links:

```js
setContacts(a=>[contact,...a]); if(company) setCompanies(...); if(deal) setDeals(...);
updateLead(l.id,{converted:true, convertedToContactId:contact.id,
  convertedToCompanyId:company?.id, convertedToDealId:deal?.id,
  convContact:contact.name, convCompany, convDeal});   // index.html:8638
```

The new deal is created at the **first stage**: `stageKey:'prospecting', dStage:'Prospecting', probability:30` ([index.html:8326](index.html)).

### WHY IT EXISTS HERE
This is the canonical CRM lifecycle hinge: *Lead captured → worked → Qualified → CONVERT (spawns Contact [+Company] + Deal) → Deal enters pipeline at first stage.* The flow is exactly the right shape.

### SEE ALSO
- **Back-links are by id** (`convertedToContactId/CompanyId/DealId`, [index.html:8638](index.html)) — good. **Forward links are by name** (`deal.primaryContact = contact.name`, `deal.company = lead.company`, [index.html:8326](index.html)) — the Component 4 defect, reproduced at conversion time.
- The new **contact gets all four status axes set at once** ([index.html:8322](index.html)): `status:'Active'`, `cstatus:'Prospect'`, `lifecycle:'Customer'`, `pstatus:lead.status||'Qualified'`. See Component 9.
- Pipeline enrollment correctly targets the **Deal** here (`deal.pipeline`), which is the right object — contrast with the Lead carrying a `pipeline` (Component 1).

### CONFUSION TO PRE-EMPT
- **"What does Convert actually create?"** One Contact (always), one Company (if chosen), one Deal (if chosen) — three objects from one lead, with the lead marked `converted:true` and kept for history (not deleted).
- **"Does the pipeline attach to the lead or the deal?"** At conversion it attaches to the **Deal** (correct). The lead's own `pipeline` field is vestigial and wrong (Component 1).
- **"What stage does the new deal start in?"** Always `Prospecting` (first stage), probability 30 — a sound default.

### VERDICT
- ✅ **CONFORMS — the conversion *flow* is correct.** It spawns Contact (+Company) + Deal, enrolls the Deal at the first pipeline stage, and preserves the lead with id-based back-links. This is the canonical lifecycle done right and is the strongest part of the model. Principle satisfied: *pipeline enrolls the Deal at conversion, not the Lead.*
- ❌ **DEFECT — High: conversion stamps a contradictory, four-axis status onto the new contact.** `lifecycle:'Customer'` on a contact whose deal just entered **Prospecting** is wrong — they are a *prospect with an open deal*, not a customer (no deal is won). Simultaneously `cstatus:'Prospect'` says the opposite. ([index.html:8322](index.html)). **Symptom:** every converted contact is immediately mis-classified as a Customer in any `lifecycle`-based report, inflating customer counts and breaking funnel math the instant a lead converts.
- ⚠️ **RISKY — Med: forward links written by name.** The deal/company are linked to the contact by name string at creation ([index.html:8326](index.html)), so the conversion inherits Component 4's fragility even though it had the ids in hand (it just used `cname`).

### FIX
1. On conversion, set **one** lifecycle value that reflects reality: contact `lifecycle = 'Opportunity'` (open deal exists) or `'Sales Qualified Lead'` — **never `'Customer'`** until a deal is Won. Drive "Customer" off a won deal instead (Component 9).
2. Use the ids you already created: `deal.contact_id = contact.id`, `deal.company_id = company.id` — don't write `primaryContact:cname`.
3. Stop setting `status`/`cstatus`/`pstatus` here at all once Component 2's consolidation lands.

---

## Component 7 of 9 — Activity & Task (the timeline spine)

### SOURCE
- Feed builder: `buildActivityFeed(kind,rec,ctx)` — [index.html:6683](index.html)
- Activity categories: `ACT_CAT = [all, emails, calls, notes, tasks, deals, changes]` — [index.html:6540](index.html); metadata `ACT_META` [:6541](index.html)
- Polymorphic source maps: `ACT_SRC_PAGE`/`ACT_SRC_ICON` (`deal/contact/company/lead`) — [index.html:6562–6563](index.html)
- Tasks as calendar events: `type:'task'` items with `linkType`/`contact`/`company`/`deal`/`subtasks` — [index.html:17173](index.html), filtered at [:3970](index.html), [:18579](index.html)

### WHAT IT IS
An **Activity** is a timeline event logged against a record — a note, call, email, meeting, or task. A **Task** is an activity with a due state (date, assignee, done/overdue) plus `subtasks`. In this prototype the timeline for a record is **generated** by `buildActivityFeed(kind, rec, ctx)` and augmented by a session-local `extra` array of newly logged items ([index.html:7138](index.html)).

### WHY IT EXISTS HERE
"Activity is the spine" — contacts, companies, and deals are nodes; activities are the edges that make the data useful. The timeline is what a rep reads to know "what happened with this account and what's next." Tasks being modeled as events (not a separate silo) is why a due task shows up on both the calendar and the record timeline.

### SEE ALSO
- An activity/task references its parent **by name string** again: `contact:'Emily Tran'`, `company:'Forge & Co'`, `deal:'Forge & Co · $44,000'`, with a `linkType` discriminator ([index.html:17173](index.html)).
- `ACT_SRC_PAGE` ([index.html:6562](index.html)) shows the intended polymorphism: an activity can originate from a `deal`, `contact`, `company`, or `lead`.
- Tasks are filtered out of the events list everywhere via `type==='task'` ([index.html:3970](index.html), [:18579](index.html)) — confirming tasks live *inside* the unified event/activity store, not separately.

### CONFUSION TO PRE-EMPT
- **"Is a Task different from an Activity?"** A Task *is* an Activity subtype (one with a due date and done state). Don't build a separate tasks table.
- **"Can one activity belong to a contact *and* a deal at once?"** It needs to (logging one call should appear on the person, the deal, and the company). Today an event has a single `linkType` + name, which points at one parent — see Verdict.
- **"Is the timeline real data?"** Mostly **generated** per render by `buildActivityFeed` plus session-only `extra`. There is no persistent activity store. The backend must build one.

### VERDICT
- ⚠️ **RISKY — High (for the build): there is no persisted, polymorphic activity store.** Timelines are produced by `buildActivityFeed` ([index.html:6683](index.html)) and held in transient `extra` state ([index.html:7138](index.html)). **Cost:** this is fine for a prototype but means the single most important table in the CRM doesn't exist yet — the backend team must design it deliberately, not infer it from the mock.
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
| `status` | **Lead** | New, Working, Nurturing, Qualified, Unqualified | [index.html:8197](index.html) |
| `status` *(seed, off-enum)* | Lead | + Contacted, Engaged | [index.html:8205–8206](index.html) |
| `status` | **Contact** | Active, Hot, Warm, New, Lead, Qualified | [index.html:4908](index.html) |
| `cstatus` | **Contact** | Prospect, Customer, Lost (+ Lead) | [index.html:4909–4910](index.html) |
| `lifecycle` | **Contact** | Lead, Sales Qualified Lead, Opportunity, Customer | [index.html:4888–4906](index.html) |
| `pstatus` | **Contact** | New, Contacted, Nurturing, Qualified | [index.html:4889](index.html), [:4901–4903](index.html) |
| `dStage`/`stageKey` | **Deal** | Prospecting, Qualified, Proposal, Negotiation, Won, Lost | [index.html:7290](index.html), [:7736](index.html) |
| `type` | **Company** | Customer, Prospect, Partner, Vendor | [index.html:7863](index.html) |

### WHAT IT IS (the explanation a confused dev needs)
There are only **three** legitimate lifecycle axes in a CRM, and they live on different objects:

1. **Lead status** — the *pre-conversion* pursuit lifecycle (New → Working → Qualified → Disqualified). On the **Lead**.
2. **Deal stage** — the *post-conversion* money lifecycle (Prospecting → … → Won/Lost). On the **Deal**.
3. **Contact lifecycle** — *optionally*, a person-level marketing-to-customer axis (Lead → MQL/SQL → Opportunity → Customer). On the **Contact**.

This codebase has **eight** status-ish fields spread across the objects, and the same words appear on several axes at once.

### THE COLLISIONS (named, with proof)
- **`Qualified` means four things:** a Lead status ([index.html:8197](index.html)), a Deal stage ([index.html:7736](index.html)), a Contact `status` chip ([index.html:4908](index.html)), and a Contact `pstatus` ([index.html:4903](index.html)). Pre-conversion pursuit and post-conversion money now share a word.
- **`Customer` means three things:** Contact `cstatus`, Contact `lifecycle`, and Company `type`. Nothing reconciles them.
- **`Lead` means three things:** a Contact `status` value, a Contact `cstatus` value, and a Contact `lifecycle` value — *and* it's the name of a whole separate object.
- **`pstatus` is literally the lead status copied onto the contact:** conversion sets `pstatus: lead.status` ([index.html:8322](index.html)). So a converted contact carries a frozen snapshot of its old lead status on a 4th field.

### CONFUSION TO PRE-EMPT
- **"If a record says `Qualified`, what does it mean?"** Unanswerable without knowing *which object and which field*. That's the bug.
- **"Which field decides if someone is a customer?"** Today: three fields can disagree (`Company.type`, `Contact.cstatus`, `Contact.lifecycle`), and conversion sets `lifecycle:'Customer'` before any deal is won ([index.html:8322](index.html)). None is authoritative.
- **"Are lead status and deal stage the same pipeline?"** No. They are different axes on different objects and must never be merged or filtered together.

### VERDICT
- ❌ **DEFECT — High: fused/duplicated lifecycle axes.** Eight status fields, with `Qualified`/`Customer`/`Lead` each spanning multiple axes, and `pstatus` duplicating lead status onto contacts. **Rule broken:** one object, one lifecycle axis; distinct lifecycles must not share a vocabulary. **Symptom:** reporting, filtering, and automation cannot reliably answer "what stage is this record at," and converted contacts are auto-mislabeled `Customer`. This is the dominant source of the team's confusion.

### FIX (the target model)
Collapse to three axes, one per object, with non-overlapping vocabularies:

| Axis | Object | Proposed values | Replaces |
|---|---|---|---|
| **Lead status** | Lead | New → Contacted → Nurturing → **Qualified** → Unqualified | `Lead.status` (fold in `Contacted`/`Engaged`) |
| **Deal stage** | Deal | Prospecting → Proposal → Negotiation → Closed, **plus** `status: Open/Won/Lost` | `Deal.dStage/stageKey` (drop a "Qualified" deal stage) |
| **Contact relationship** | Contact | *(not stored)* Customer / Opportunity / Contact — **derived from deals** | replaces `Contact.lifecycle` |

**Resolving the `Qualified` collision:** keep `Qualified` on the Lead only, and let Deals start at `Prospecting` (which conversion already does). Now `Qualified` means exactly one thing in the whole system — a lead ready to convert — and no rename is needed.

Then: **delete all four contact status fields — `Contact.status`, `Contact.cstatus`, `Contact.pstatus`, *and* `Contact.lifecycle`.** A contact stores no lifecycle axis; derive a relationship label from its deals when one needs to be shown (Customer = has a Won deal; Opportunity = has an Open deal; otherwise just a contact). This is the small-team choice — fewer fields, zero sync burden, and it can never contradict the deals (which is precisely how conversion mislabeled new prospects as `Customer`). Keep `Company.type` strictly as relationship kind (Customer/Prospect/Partner/Vendor) and document that it is **not** a lifecycle. Derive any Hot/Warm/Cold "temperature" from `score`. *(If a marketing funnel — MQL/SQL — is ever needed for people with no deal yet, that belongs on the Lead, not the Contact.)*

---

## STEP 3 — System health verdict, root causes, fixes

### SYSTEM HEALTH VERDICT
**Are they on the right path? Mostly yes on *flow*, no on *fields*.** The object set is correct (Lead, Contact, Company, Deal, Pipeline/Stage, Activity, Custom Objects all exist and map to the canonical model), and the **conversion flow is genuinely well-modeled** — it spawns Contact + Company + Deal and enrolls the *Deal* (not the Lead) at the first stage. That is the hardest thing to get right, and they got it right.

The model is undermined by **field-level discipline**: too many overlapping status axes, enum/data drift, and name-string relationships instead of ids. None of these is fatal, but all of them must be fixed before a backend is built, because they will otherwise be baked into a schema.

### All ❌ DEFECTs and ⚠️ RISKs, highest severity first

| Sev | Type | Finding | Location |
|---|---|---|---|
| **High** | ❌ DEFECT | Fused/duplicated lifecycle axes (`Qualified`/`Customer`/`Lead` span multiple fields; `pstatus` duplicates lead status) | Component 9 — [index.html:4888](index.html), [:7736](index.html), [:8197](index.html), [:8322](index.html) |
| **High** | ❌ DEFECT | Four contradictory status fields on Contact | [index.html:4888](index.html), [:8322](index.html) |
| **High** | ❌ DEFECT | Relationships by name string, not id (deal→contact/company, contact→company, parent, activities) | [index.html:7293](index.html), [:7894](index.html), [:8326](index.html), [:17173](index.html) |
| **High** | ❌ DEFECT | Lead status enum/data drift (`Contacted`/`Engaged` not in `LEAD_STATUSES`) → leads vanish from funnel | [index.html:8197](index.html) vs [:8205–8206](index.html), [:4537](index.html) |
| **High** | ❌ DEFECT | Pipeline + close date on the Lead | [index.html:8204](index.html) |
| **High** | ⚠️ RISKY | No persisted, polymorphic activity store (the spine) — must be designed for backend | [index.html:6683](index.html) |
| **High** | ⚠️ RISKY | Account relationships name-joined → duplicate accounts split one pipeline | [index.html:7868/7879](index.html), [:7894](index.html) |
| **High** | ⚠️ RISKY | Multiple drifting sources of truth for the stage list | [index.html:7290](index.html) vs [:7736](index.html) vs [:7509](index.html) |
| **High** | ❌ DEFECT | Conversion sets `lifecycle:'Customer'` on a brand-new prospect | [index.html:8322](index.html) |
| **Med** | ❌ DEFECT | "Pipeline" is a string, not an entity owning stages (Onboarding has no stages) | [index.html:8238](index.html), [:7290](index.html) |
| **Med** | ❌ DEFECT | `cstatus` enum/data mismatch (`Lead` not in `CONTACT_STATUSES`) | [index.html:4909–4910](index.html) |
| **Med** | ❌ DEFECT | Contact↔Company is one-to-one, not many-to-many with role | [index.html:4888](index.html) |
| **Med** | ⚠️ RISKY | Won/Lost modeled as stages — conflates progress with outcome | [index.html:7290](index.html) |
| **Med** | ⚠️ RISKY | Deals stored in two places (`deals` array vs per-stage `demo[]`) | [index.html:20596](index.html), [:7522](index.html) |
| **Med** | ⚠️ RISKY | Single-parent activity links → duplicate logging | [index.html:17173](index.html) |
| **Low** | ⚠️ RISKY | `stageKey`+`dStage` denormalized; `email`+`emails` dual; custom-obj links by name | [index.html:7293](index.html), [:4888](index.html), [:19924](index.html) |

### ROOT CAUSES (the 1–3 decisions generating most of the confusion)
1. **No single lifecycle axis per object.** The team kept adding status fields (`status`, `cstatus`, `lifecycle`, `pstatus`, plus deal stage and company type) instead of deciding *one axis per object*. This generates the `Qualified`/`Customer`/`Lead` collisions and the "which field is the truth" problem. → Component 9.
2. **Name-as-foreign-key.** Records reference each other by display name everywhere (`co`, `company`, `primaryContact`, `parent`, activity `linkType`). This is the source of the duplicate-account split, the rename-fragility, and untrustworthy rollups. → Components 2, 3, 4, 7.
3. **Lead/Deal boundary leak.** Deal-only concepts (`pipeline`, `expectedCloseDate`) live on the Lead, and the converted Contact is force-set to `Customer`. The lifecycle is *mostly* separated (conversion is right) but leaks at the edges. → Components 1, 6.

### PRIORITIZED FIX LIST (impact ÷ effort, do top-down)
1. **Pick one lifecycle vocabulary per object and delete the rest** (drop `Contact.status/cstatus/pstatus` *and* `Contact.lifecycle` — derive a contact's relationship label from its deals; keep `Qualified` on the Lead only; split deal `status` Open/Won/Lost from stage). *Highest impact, pure-decision effort.* — Component 9.
2. **Reconcile every enum with its seed data** (lead `Contacted`/`Engaged`; contact `cstatus:'Lead'`). *High impact, low effort.* — Components 1, 2.
3. **Move `pipeline`/`closeDate` off the Lead; stop setting `lifecycle:'Customer'` at conversion.** *High impact, low effort, schema-shaping.* — Components 1, 6.
4. **Introduce ids and id-based relationships** (`company_id`, `deal_contacts`, `contact_company`, `activity_links`). *Highest long-term impact, medium effort — do before any data is persisted.* — Components 2–4, 7.
5. **Make Pipeline an entity** with owned stages; one stage source of truth. *Medium impact, medium effort.* — Component 5.
6. **Design the persistent, polymorphic activity store.** *High impact (it's the spine), medium effort.* — Component 7.

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
| **Lead status** | Lead | New → Contacted → Nurturing → **Qualified** → Unqualified | BEFORE conversion |
| **Deal stage** | Deal | Prospecting → Proposal → Negotiation → Closed | AFTER conversion |
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
- **Stage order / color / name** → from the stage record (not from constants).

### Relationships — all by stable ID, never by name
- **Contact ↔ Company:** many-to-many, with a *role* and one marked *primary*.
- **Company → Company:** parent/child hierarchy, by ID.
- **Deal → Company:** one account per deal.
- **Deal ↔ Contacts:** many-to-many with a *role* (Decision maker, Champion); one primary. *(nrtur's `additionalContacts` is this idea — just switch to IDs.)*
- **Activity ↔ Contact / Company / Deal:** many-to-many, polymorphic — one logged call attaches to the person, the deal, AND the company at once (log once, not three times).
- **Lead → on convert:** spawns a Contact (+Company) + Deal, ID-linked both ways; the Lead is kept, marked converted.

### The end-to-end lifecycle
1. A **Lead** arrives → status **New**.
2. Rep works it (New → Contacted → Nurturing); activities log to the lead's timeline.
3. Worth it → status **Qualified** → **Convert**. Not worth it → **Unqualified** (archive).
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

- **Lead status standardized** to `New → Contacted → Nurturing → Qualified → Unqualified`. The off-enum seed values `Working`→`Contacted` and `Engaged`→`Nurturing` were remapped; chip/dot maps, the dashboard funnel order, the saved "Working" view, and the lead-status form options were all aligned, so no lead can fall outside the enum.
- **Contact reduced to one relationship axis.** `lifecycle` and `pstatus` were removed everywhere (seed data, contact-detail pills, list column, filters, import/export, settings card, automation set-field, and all six contact-creation builders). The contact-detail page now shows a single **Status** pill bound to `cstatus`; the heat badge is the orthogonal temperature axis (reworked in round 3 — see below).
- **Conversion no longer mislabels.** The convert flow no longer stamps `lifecycle:'Customer'` / `pstatus` on a brand-new contact; it sets only `cstatus:'Prospect'`.
- **`cstatus` finalized to `Prospect` / `Customer` / `Lost`** — the single post-conversion relationship axis. `Lead` was dropped (it belongs to the Lead object; the pre-conversion lifecycle lives on `lead.status`), and the funnel/demo contacts that used it now default to `Prospect`.
- **Not changed, by request:** Won/Lost remain pipeline stages (no separate outcome field), the deal-stage names were left intact, and relationships remain name-based (the ID-based refactor is a backend concern).

**Follow-up cleanup (rounds 2–3):**
- **`pipeline` + `expectedCloseDate` removed from the Lead.** They existed only to pre-fill the Convert modal's deal defaults. Removed from the lead builder, detail fields, filters, and seed data; the Convert modal now defaults the *deal* to `Sales Pipeline` / empty close (still user-editable). Pipeline now lives only on the Deal.
- **Dead `mktStatus` field removed** (was written on AddRecordDrawer contacts, never read).
- **Heat reworked to a clean, derived temperature.** The contact `status`/"Heat" badge no longer stores a mixed `Active/New/Lead/Qualified` vocabulary; it is now **derived from `score`** as Hot (≥70) / Warm (≥40) / Cold via a `contactHeat()` helper, used by the dashboard "Most active" widget and the list Heat column. The dead `STATUS_CHIP` constant was deleted and the dead `ContactsFilterPanel`'s status vocabulary was cleaned, so no `Lead`/`Qualified` heat values remain anywhere.
- **Resolved — `cstatus` = `Prospect` / `Customer` / `Lost`.** Dropped `Lead` because it belongs to the Lead object. The lifecycle is now cleanly split across two objects: **`lead.status`** owns the pre-conversion phase (New → Contacted → Nurturing → Qualified → Unqualified) and **`cstatus`** owns the post-conversion relationship (Prospect → Customer, or Lost). No status vocabulary is shared between the two.

> **Prototype vs. backend:** the prototype *stores* `cstatus` as the single relationship axis to keep the curated demo data rich. The backend should instead **derive** that label from deals (Customer = won deal, Opportunity = open deal, else Contact), as described above — don't carry a hand-set relationship field into the schema.

---

*When the team later shares their build flow, map each of their errors back to the component and root cause above (most will trace to Root Cause 1 — no single lifecycle axis — or Root Cause 2 — name-as-foreign-key).*
