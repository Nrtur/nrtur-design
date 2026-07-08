# nrtur — Pipeline / Deals Module Audit

_Date: 2026-07-03 · Auditor: crm-architect session · Scope: pipeline & deals module of the `index.html` prototype (~21.8k lines, React-in-browser, no backend — the prototype **is** the working spec)._

**Method.** Seven parallel code readers swept the live prototype (data model, pipeline structure, UI, automation, analytics, lifecycle) plus the canonical docs ([docs/crm-system.md](docs/crm-system.md), [docs/audit/_ARCHITECTURE.md](docs/audit/_ARCHITECTURE.md), [docs/core-crm/pipeline.md](docs/core-crm/pipeline.md)). Every claim below cites current `index.html` line ranges. Status labels: **implemented** (real state changes), **partial**, **simulated/cosmetic** (hardcoded copy, demo data, toast-only), **not implemented**.

**Prototype ground rule.** Nothing persists across reload (in-memory React state by design). Ratings judge the *working spec*, but real-vs-simulated is labeled per feature because a spec that fakes a behavior is not a spec for it.

---

## Phase 1 — Factual inventory

### 1.1 Data model

**Deal is a separate, first-class entity — not a status on Contact/Lead.**
- Own state array + context: `CrmDataContext` default (`index.html:3007`), App state seeded via `migrateLinks(COMPANIES_DATA, CONTACTS_DATA, dealsSeed())` (`21408–21424`), `updateDeal` patcher (`21493`). Live mirror `_liveDeals` (`21421`), display derivation `allDeals()` (`8224`).
- **Deal fields** (union across seeds `7478–7502` and create paths): `id`, `name`, `company` **+ `companyId`**, `primaryContact` **+ `primaryContactId`**, `additionalContacts[{contact,role}]` **+ `additionalContactIds[]`**, `fromLeadId`, `value` (display string) + `amount` (number), `stageKey` (machine key) + `dStage` (name; `stageName/stageColor` derived), `pipeline` (name string), `probability`, `closeDate`, `forecast` (`Pipeline|Best case|Commit`), `amountType` (`One-time|ACV|ARR`), `owner`/`ownerColor` (avatar initials — no User entity), `tags`/`dealTags`, `source` + ad attribution (`adSourceKey/adCampaign/fbclid`…), `outcome{result,reason,note,closedAt,closedBy}`, `nextAction`, `createdBy/createdAt/lastActivity`, soft-delete (`deleted/deletedAt/deletedBy`).
- Id links are **backfilled at boot** by `migrateLinks` (`21375–21406`) — name-seeded records get `companyId`/`primaryContactId`/`additionalContactIds` resolved (unmatched companies are auto-minted).

**Stage schema — one canonical source (Wave-1 fix).**
- `STAGES_DATA` (`7478–7502`): six stages `{key,name,color}` (Prospecting, Qualified, Proposal, Negotiation, Won, Lost); per-stage probability from `SALES_PROB` (`7821`).
- Derived vocabulary `DEAL_STAGES_ALL / DEAL_STAGE_ORDER / DEAL_STAGE_COLOR / DEAL_STAGE_KEY_BY_NAME` (`8081–8086`) feeds boards, detail, filters, import.

**Pipelines state shape** (`7823–7832`): `[{id, name, stages:[{id, key, real:true, name, color, prob, rotDays?}]}]`, seeded with *Sales Pipeline* (real stages, live deals) + *Customer Onboarding* (demo-card stages) + an optional onboarding-wizard pipeline (`3706–3722`, `7831–7832`). **Deal↔pipeline membership is a name string** with an orphan fallback to the default board (`dealInActivePipe`, `7876–7879`). The pipelines array is **component-local `useState`** — structure edits reset on navigation (conditional mount at `21570`).

**Seven deal-creation paths write inconsistent field subsets:**

| Path | Where | Id-linked? | Notes |
|---|---|---|---|
| Quick-add drawer | `2342–2349`, links `2393–2401` | ✅ | contact→company auto-fill; no probability/forecast |
| Multi-add sheet | `2350–2353`, persist `2446` | ❌ | name-strings only; **no pipeline field** |
| Lead convert (single+bulk) | `8704–8722`, `6287–6289` | ✅ richest | `fromLeadId`, company dedupe, probability 30 |
| CSV/JSON import | `5108–5115`, commit `5188–5193` | ❌ | name strings only |
| Booking/scheduler | `18539–18549` | ✅ | `stageKey` only — **no `dStage`** |
| Funnel/form submit | `20037–20044` | partial | writes literal stage name; no `companyId` |
| AddDealPage route | `8179–8207` | — | **simulated/cosmetic** — Create button just navigates |

(The automation-builder "Create deal" action is config-only — no executor; all real `setDeals` insertions enumerated at `2392, 2446, 5193, 6289, 8895, 9037, 18546, 20043`.)

**Divergent stage/pipeline lists that still exist (partial):** the ghost name **`'Onboarding Pipeline'`** — a pipeline that does not exist (the real board is `'Customer Onboarding'`) — survives in ~10 selects/configs (`2158, 2169, 8120, 8626, 8804, 14170, 14225, 14256, 4126/4159/4466, 17100, 18867`); `PROP_STAGES` missing Prospecting (`14171`); `SCHED_DEAL_STAGES` missing Won/Lost (`18729`); sequence-builder stage options with phantom `'Lead'/'Proposal Sent'` stages (`15975`); deal filter schema omitting Lost (`5653`). A visibility fallback (R6) prevents deals tagged with a real-board-less pipeline from vanishing, but the naming was never unified.

**Lead vs Deal separation: implemented.** Leads have their own state (`21414`), lifecycle statuses `LEAD_STATUSES` (`8585` — New/Contacted/Nurturing/Sales-Ready/Disqualified; no stage overlap with deals), and a convert flow writing `convertedTo*Id` back-links. Oddity: leads expose a `Pipeline` field (`2169, 5646, 14256`) that nothing consumes.

**Custom-object pipelines**: the pipeline picker offers Deals + custom objects only (`7768–7785`); custom-object boards are session-only aux entries routed to `ObjectBoard` (`7846–7852`, `7677–7709`), grouped by a Single-select field's options (persisted into `customObjects`) — not stage arrays.

### 1.2 Pipeline structure

- **Multiple pipelines: partial.** The seed's second pipeline and any board created via `addPipeline`/`dupPipeline` (`7858–7859`) hold **demo-only** stages — they can never contain real deals (only `real:true` stages query live deals, and only Sales Pipeline has them). The onboarding-wizard pipeline is appended the same way. All pipeline/stage structure edits are **ephemeral** (reset on navigation).
- **Stage configurability: implemented (deal boards), twice.** Full in-place CRUD: add / insert-between / rename / recolor / reorder / delete + **probability slider** + **rotting threshold (`rotDays`)** (`7856–7872`, on-board edit `7980–7988`, drawer `8042–8075`). Custom-object boards edit their select-field options instead (`7732–7739`, persisted). Defect: `delStage`'s confirm copy promises "deals moved to previous stage" but deals keep dangling `stageKey`s.
- **Stage probability %: implemented — but two disconnected systems.** Per-**stage** `prob` drives the board's weighted Forecast chip/view (`7896–7897`, `8015–8035`); a separate per-**deal** `probability` field (`8120`) drives the dashboard's weighted-forecast stat (`4580`). The two are never reconciled.
- **Rotting/stale: implemented (logic), partial (data).** `dealRotInfo` (default 14d, per-stage `rotDays` override) renders amber card badges (`4368–4378`, `7989–7991`) — but ages come from **parsing seeded strings like `'3d'`** because no timestamps exist. `DashStaleDeals` uses its own config threshold and ignores `rotDays` (`4463–4477`).
- **Required fields per stage / enforced transitions / approvals (Blueprint-style): not implemented.** Searched exhaustively. The only transition gate is the Won/Lost reason modal (a soft gate — reason pre-selected). The per-property "Visible in pipelines/stages" setting is saved but never enforced (`14370–14431`).
- **Pipeline deletion: partial.** Typed-name confirm + last-pipeline guard (`7860`, `7941/8054`) but deals of a deleted pipeline are silently orphaned — architecture decision **D4 (delete-never-orphans) is decided and unbuilt**.

### 1.3 UI

- **Kanban board: implemented.** `PipelinePage` (`7786–8079`): per-stage columns via `dealsFor` (`7879` — live deals by `stageKey` + pipeline scope + shared filter/sort engine), HTML5 drag-and-drop through generic `KanbanBoard` (`7639–7658`, `7996`), terminal-stage interception (`7873–7875`) into `DealOutcomeModal` (`7573–7599`). Configurable card fields incl. rotting badge (`7504–7519`, `7809`), stage editing in place, saved views + smart lists (`7793–7808`, `5754–5776`), board/list/forecast modes persisted to sessionStorage (`7810–7811`).
- **List view: implemented.** Shared list infra with per-pipeline columns, inline stage dropdown `lvStage` (`7917`), owner dropdown, and a deal `BulkBar` (move stage / owner / tags / delete, `6267–6324`).
- **Forecast view: implemented** — genuine weighted computation (stage value × editable stage probability, `7895–7897`, `8015–8035`); stage-grouped only and **includes Won/Lost** in the roll-up.
- **Deal detail: implemented.** Stage ladder + Move-to-next both funnel through `commitStage` (`8110–8119`, `8139`, `8156–8157`) → same outcome modal; inline properties + edit drawer resolve `primaryContactId`/`companyId` via searchable lookups (`8114–8127`, `6595–6700`); `RelatedRecordsPanel` (custom-object reverse links, `8161`); tasks panel (shared store; matches by company name-string, `8164`); persisted timeline notes (`8165`).
- **Simulated/cosmetic (labeled honestly):** `AddDealPage` route is a stateless form (`8179–8207`); *Customer Onboarding* columns run on hardcoded demo cards that never open a detail page (`7825–7830`); KPI strip **WON $134k / AVG DEAL $11.5k / WIN RATE 68% and all delta chips are hardcoded** (`7888–7893`); the "n open deals" subtitle counts Won/Lost; the deal-detail Pipeline select is a hardcoded 2-item list (`8120`); delete-stage confirm copy is false.
- **Dead code:** `moveDeal`, `dragDeal/dropStageId`, `pipeObject`, `PipeObjSelect`, the `cfgOpen` edit drawer, `DEAL_GROUPS` group-by state (`7790, 7812–7813, 7841–7842, 7875, 7677–7679, 8043–8075`).

### 1.4 Automation

- **On stage change: nothing fires. Not implemented.** Every stage-change path (`applyMove 7874`, `lvStage 7917`, `onBulkStage 7920`, kanban `onMove 7996`, `commitStage 8113`, `updateDeal 21493`) only mutates deal state and toasts. No event emitter, no dispatcher, no run/execute machinery exists (the file's only `dispatchEvent` uses are the toast bridge and display-prefs refresh).
- **Automations module: simulated/cosmetic.** `AUTO_INIT` cards — e.g. *Proposal Follow-Up* (trigger "Deal moved to Proposal", runs:91) and *Deal Won Celebration* (runs:62) — carry **hardcoded run counts, success %, sparklines, lastRun** (`16347–16359`, `16564–16685`). Toggles/duplicate/delete are session state with zero runtime effect. Logs subtab filters the 8-row seeded `AUTO_LOGS` (`16337–16346`); per-automation logs/enrollees are synthesized filler (`16362–16439`); CSV export is toast-only.
- **Automation builder: partial (rich spec, no runtime).** Real editable node tree: 11 trigger categories incl. deal triggers (*created / stage changed / moved to Proposal / won / lost / value changed / inactive 7 days*, `10957–11036`), **If/then yes-no branches, up-to-4-way splits, wait/waitUntil/goal nodes**, entry filter, ~28 configurable actions (`11419–11499`). **Save is toast+navigate** (`11618`) — flows are never persisted or executed. Test is an honest client-side simulation (`11551–11563`).
- **Webhooks / event bus / workflow engine: not implemented** (config-string UI only: `11017`, `11677–11682`, `10883`).
- **Real native side-effects exist outside the automations module** (direct procedural code): booking submit creates deal + meeting + paid invoice inline (`18540–18569`); funnel/form submit creates lead/contact/deal/task natively but only *counts* attached automations in a toast (`19997–20055`, `20409–20418`); ad-lead "Speed-to-lead fired ⚡" is a hardcoded `const speedy=true` flag (`21460`).
- So: **the design language supports conditions/branching; the runtime is nonexistent** — flat or otherwise.

### 1.5 Analytics

- **Computed from live deals (implemented):** board **PIPELINE $** (`7885–7889`); board **weighted FORECAST** (`7895–7897` + Forecast view `8015–8035`); dashboard/report widget engine — deals-by-stage bar/donut, rep revenue, leaderboards via `dashAgg` (`4214–4245`, `4303–4315`); live stat cards via `dashStatLive` (`4574–4585`) incl. a *per-deal-probability* weighted forecast (a different weighting than the board's per-stage one); lead→deal conversion funnel — **lead-status based** (`4490–4506`).
- **Simulated/cosmetic:** board KPIs **WON / AVG DEAL / WIN RATE + every trend delta** (`7888–7893`); stat-card deltas (`3852–3855`); pipeline-coverage & quota-attainment goals (`3877–3880`); ReportsPage date-range, Export CSV, "refreshed 2 minutes ago" (`11901–11948`).
- **Not implemented:**
  - **Stage-entry timestamps** — nothing records when a deal entered its stage (`applyMove` writes only `stageKey/dStage`; the sole real timestamp is `outcome.closedAt`). Rotting/stale math parses seeded strings like `'3d'` (`dashDealAgeDays`, `4368`). → **no true time-in-stage anywhere**.
  - **Stage→stage conversion rates** — no computation exists (the only funnel is lead-status based).
  - **Win/loss reporting from `deal.outcome`** — reasons are captured richly but **never aggregated**; the win-rate stat counts `stageKey==='won'` only (`4581`); outcome renders once on the detail header (`8157`).

### 1.6 Deal lifecycle

- **Won/Lost handling: implemented on 2 of 3 surfaces.** Board drag (`7996 → outcomePrompt → 8039`) and **all four detail-page paths** (stage pill, Move-to-next, edit-drawer save, ladder dot → `commitStage 8113 → 8172`) capture `outcome:{result:'won'|'lost', reason, note, closedAt:Date.now(), closedBy:'Alex Morgan'}` — `closedAt` real, `closedBy` hardcoded (no User entity).
  **Defect:** the list view's inline stage dropdown (`lvStage 7917`) and BulkBar move-stage (`onBulkStage 7920`) call `applyMove` directly — deals are closed **with no modal and no outcome recorded**.
  **Fragility:** terminal detection is a stage-**name** regex (`/lost/`, `/won|live/`, `7875`, `8113`) — a renamed terminal stage silently bypasses capture, and a stage named "Live" triggers the Won modal.
- **Lost-reason capture: partial.** Two hardcoded 6-item reason lists (won + lost variants) inside `DealOutcomeModal` (`7575–7577`). Configurable Reason lookup entity: **not implemented**. Seeded Won/Lost deals carry no outcome.
- **Reopen: implemented — with a stale-data defect.** A closed deal can move back to any open stage from every surface. `outcome` is **never cleared** (no code writes `outcome:null`), so a reopened deal keeps its "Won · reason" banner; only the derived `dStatus` self-corrects.
- **Deletion: implemented.** Soft-delete (`{deleted:true,deletedAt,deletedBy}`) from detail (typed-name confirm, `8104`) and bulk (typed DELETE, `6320`), permission-gated (`effCanObject('Deals','delete')` + `effCanBulkDelete`); admin-gated Recycle Bin with real restore + purge (`12182–12235`); the 30-day window is display-only.
- **Duplicate / merge deals: not implemented** (the dedupe engine covers contact/lead/company only, `5970–5979`).
- **Won → revenue:** dashboards genuinely compute won revenue / win-rate / goals from `stageKey==='won'` (`4539–4594`) — including outcome-less bulk-closed deals; winning a deal triggers **no** invoice/payment (invoices only via manual Create-invoice with `dealId` prefill, `8145`); ads `reportConversion` and the dialer's "Mark deal won" are toast-only (`21478`, `9500`).

---

## Phase 2 — Benchmark

Baseline features per competitor are as supplied in the audit brief (Pipedrive, HubSpot, Zoho, aNinja). Where I add detail beyond that brief, it is **training-knowledge recall, not verified fact — confirm before quoting externally** (marked †).

| Dimension | nrtur today | Rating |
|---|---|---|
| **Data model** | Separate Deal object with pipeline/stage/amount/close-date/probability/forecast-category + structured `outcome` + id-linked contact/company/lead — matches the HubSpot deal-object baseline and exceeds aNinja's lead-status-as-pipeline. Caveats: pipeline membership by name string; ~10 divergent stage/pipeline config lists; ephemeral pipeline config. | **At Pipedrive–HubSpot level** (shape), with named prototype caveats |
| **Pipeline structure & UI** | Real Kanban DnD, configurable cards, per-stage probability **and rotting thresholds** (Pipedrive's signature pair), saved views, list + weighted-forecast views. But: only one pipeline can hold real deals — multi-pipeline is cosmetic (Zoho's baseline is real multi-pipeline); no required-fields-per-stage (HubSpot baseline); no Blueprint-style enforced transitions (Zoho). | **At Pipedrive–HubSpot level for a single pipeline; behind Zoho on multi-pipeline & enforcement** |
| **Automation** | Zero runtime: nothing fires on stage change — aNinja's flat status-change triggers *actually execute*†, so at runtime nrtur is behind even the weak baseline. The builder's *design* (branching, splits, goals, deal triggers) is beyond Pipedrive's flat stage-automations† and at Zoho's conditional-workflow level — but it is a drawing, not an engine. | **Behind aNinja (runtime) / At-Zoho (design spec only)** |
| **Analytics** | Real: pipeline value, weighted forecast (two variants), deals-by-stage/rep charts, lead→deal count funnel. Missing the entire time axis: no stage-entry timestamps → no time-in-stage, no stage-conversion rates, no velocity; win/loss reasons captured but never reported; several KPIs hardcoded. | **Above aNinja, below Pipedrive–HubSpot** |
| **Lifecycle** | Won/Lost with mandatory reason+note on board drag and every detail path (both won *and* lost — stronger default than Pipedrive's optional lost-reason†); soft-delete + Recycle Bin + permissions. Deductions: list/bulk close bypasses capture; outcome never cleared on reopen; no merge; `closedBy` hardcoded. | **At Pipedrive–HubSpot level** (capture), with two named defects |

---

## Phase 3 — Verdict & roadmap

### 3.1 Architectural verdict

**Recommended: the hybrid — a pure deal-pipeline core (Pipedrive-style) with *lightweight, selective* process enforcement (HubSpot-style per-stage required fields + the existing mandatory close-reasons). Not full Zoho Blueprint. Not the lead-status model.**

Why, for growth-focused SMBs:
1. **The lead-status model (aNinja) is a regression nrtur already engineered away from.** The codebase deliberately separated the Lead lifecycle (`LEAD_STATUSES`, status board) from the Deal pipeline — the one-axis-per-object rule is the canonical decision in [docs/crm-system.md](docs/crm-system.md) (§ target model) and shipped decision **D1** in [_ARCHITECTURE.md](docs/audit/_ARCHITECTURE.md). Collapsing back would forfeit multi-deal-per-contact, weighted forecasting, and win/loss analytics.
2. **Growth SMBs run more than one process** (sales + onboarding/delivery/renewal) — exactly why the owner already decided **D2/D3**: multi-pipeline via `stagePlacements:[{pipelineId,stageId,primary?}]` with one *primary* placement driving all reporting. That decision is recorded and unbuilt; the roadmap implements it rather than re-litigating it. The shipped pipeline-first navigation (named-pipeline picker listing deal + custom-object boards) also stays — it is a recorded owner decision.
3. **Full Blueprint (enforced transitions + approvals) is enterprise friction at SMB scale** — an admin has to author transition matrices, and reps hit walls. The 20% that yields 80% of the value for this market: **(a)** required fields on stage entry (deal amount before Proposal, close date before Negotiation), **(b)** mandatory close reasons — which nrtur already has on most paths. Ship those two gates; skip approval chains.

**Verdict: Approved with changes — readiness 58/100.** The single-pipeline experience and the deal object are genuinely competitive; the score is dragged down by the automation runtime being 0% real, the missing time axis, and multi-pipeline being cosmetic.

### 3.2 Prioritized gap list

Constraints respected: single-file `index.html`, Babel-parseable, in-memory model; decisions D1–D4 and pipeline-first navigation are fixed inputs, not open questions.

**P0 — blocks competitiveness**

| # | Gap | Change where | Scope |
|---|---|---|---|
| P0-1 | **Automation runtime for deal events.** A stage transition must actually run enabled automations (create task, log activity, enroll sequence, notify — all real in-prototype state changes). Add a dispatcher invoked from the stage-write paths; persist builder saves into an automations store; drive run counts/logs from real executions instead of seeds. Without this nrtur is behind even the weak baseline. | stage writes `7874/7917/7920/7996/8113/21493`; module `16347–16685`; builder save `11618` | **L** |
| P0-2 | **Stage-entry timestamps** (`stageEnteredAt` + append-only `stageHistory[]`) written on every stage change and every create path; backfill in `migrateLinks`. This one field unlocks the entire missing analytics axis (time-in-stage, real rotting, stage-conversion, velocity) and real automation triggers ("inactive 7 days"). | writes `7874, 8113, 7917, 7920`; creates `2346, 2353, 5108, 8720, 18546, 20043`; backfill `21375–21406` | **M** |
| P0-3 | **Close the outcome bypass:** route list-view inline stage change and bulk move-stage through `DealOutcomeModal` (same interception the board/detail already use). Also swap terminal detection from name-regex to a stage flag (`isWon/isLost`) so renamed stages can't bypass capture. | `7917, 7920, 6311–6313`; regex sites `7875, 8113` | **S** |
| P0-4 | **Unify pipeline naming & compute the board KPIs.** Kill the `'Onboarding Pipeline'` ghost across ~10 selects (single source: the live pipelines list); reconcile `PROP_STAGES`/`SCHED_DEAL_STAGES`/sequence stage lists with `DEAL_STAGES_ALL`; replace hardcoded WON/AVG-DEAL/WIN-RATE KPIs with computations from live deals + `outcome`. | ghost sites `2158, 2169, 8120, 8626, 8804, 14170–14171, 14225, 14256, 4126/4159/4466, 17100, 18729, 18867, 15975, 5653`; KPIs `7888–7893` | **M** |

**P1 — differentiators**

| # | Gap | Change where | Scope |
|---|---|---|---|
| P1-1 | **Implement decided D2/D3/D4:** `stagePlacements[]` multi-pipeline (independent per-pipeline stages, one primary placement drives reporting), wire *Customer Onboarding* to real deals, and pipeline-delete guards (block-or-reassign). All four follow-ups are pre-decided in [_ARCHITECTURE.md](docs/audit/_ARCHITECTURE.md) §D2–D4. | `7823–7879` (pipelines/scoping), `7860` (delete), `21375+` (migration) | **L** |
| P1-2 | **Win/loss analytics from `outcome`:** reason-breakdown report widget, win-rate computed from `outcome.result` (not bare `stageKey`), lost-reason trends; plus a **configurable Reason lookup** in settings replacing the hardcoded lists. | `4581`, widget defs `3852+`, reasons `7575–7577` → settings entity | **M** |
| P1-3 | **Per-stage required fields** (HubSpot-baseline): stage editor gains `requiredFields[]`; stage-entry gate (modal in the existing `DealOutcomeModal` pattern) when required deal properties are empty. | stage editor `7856–7872`; gates `7874/8113`; field schema `5651` | **M** |
| P1-4 | **Persist pipeline/stage config** — lift the `pipelines` array from PipelinePage-local state into App/`CrmDataContext` (the `customObjects` pattern) so structure edits survive navigation. | `7823–7832` → `21400s` | **M** |
| P1-5 | **Reopen semantics:** clear (or archive to history) `outcome` when a closed deal re-enters an open stage; log a "reopened" timeline entry. | `8113`, `7874` | **S** |

**P2 — nice-to-have**

| # | Gap | Change where | Scope |
|---|---|---|---|
| P2-1 | Forecast view v2: exclude Won/Lost from the weighted roll-up, add forecast-category (Commit/Best-case) grouping — the `forecast` field already exists unused — and reconcile the two probability systems (stage-prob vs per-deal) into one override model. | `7895–7897, 8015–8035, 4580, 8120` | **M** |
| P2-2 | Deal duplicate-detection / merge (extend the existing dedupe engine to deals). | `5970–5979` | **M** |
| P2-3 | Normalize the create paths: sheet + import should run the same id-linking pass as quick-add; booking should write `dStage`; funnel should link `companyId`. | `2446, 5188–5193, 18546, 20043` | **S–M** |
| P2-4 | Dead-code sweep: `AddDealPage` stub, `moveDeal`, `cfgOpen` drawer, `DEAL_GROUPS`, `PipeObjSelect`; fix the false delete-stage confirm copy. | `8179–8207, 7875, 8043–8075, 7812, 7677` | **S** |
| P2-5 | Real `closedBy`/owner identity — depends on the User-entity backlog item (known, large). | outcome writes `8039/8172` | **M–L (dependency)** |

### 3.3 Already ahead — market these

1. **Mandatory close reasons on *both* Won and Lost, by default, on board drag and every detail-page path** — with reason + free-text note persisted on the deal. Pipedrive treats lost reasons as an optional configuration and won reasons barely exist†; nrtur's capture-by-default posture is a genuine data-quality story (once P0-3 closes the list/bulk hole).
2. **Per-stage rotting thresholds in the stage editor + on-card rotting badges** — Pipedrive's signature deal-rotting feature, already present (`7864, 7982, 7989–7991`), and it becomes fully real the moment P0-2 lands timestamps.
3. **Custom objects attach to deals — both directions.** A Project/Contract links to a deal and the deal shows it back (`RelatedRecordsPanel`, `8161`, `20863–20888`). HubSpot gates custom objects behind Enterprise†; at SMB price point this is a differentiator.
4. **Weighted forecast view driven by editable per-stage probabilities directly on the board** (`8015–8035`) — forecast-grade UX inside the pipeline surface rather than a separate reports module.
5. **Native capture→deal chain:** forms, funnels, and the booking scheduler create id-linked deals natively — booking even creates the meeting *and collects payment via invoice inline* (`18540–18569`) — where competitors typically need integration glue†.
6. **The automation builder's UX** (If/then branches, 4-way splits, wait-until, goal nodes, deal-specific triggers) is designed beyond Pipedrive's flat automations† — it becomes a marketable claim only after P0-1 gives it a runtime; until then it must not be marketed as working automation.

---

*Constraints honored: no code was modified in this session; analysis only. All `NNNN` citations are `index.html` line numbers verified during this audit; docs citations name their file. † = training-knowledge recall about competitors — verify before external use.*
