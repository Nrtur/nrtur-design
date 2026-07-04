# nrtur — Rule-Based Automation: Research, Gap Analysis & Plan to Beat the Field

_Companion to [`AUTOMATIONS_AUDIT.md`](AUTOMATIONS_AUDIT.md). Where the audit covers the **visual flow builder** (the canvas + its runtime engine), this document covers the **other paradigm** every serious CRM ships alongside it: the lightweight, per-object **rule layer** — assignment, scoring, validation, SLA, and approval rules an admin configures in seconds without drawing a flow._

> **Scope.** Product / feature / UX of the in-memory `index.html` prototype. Backend/persistence is flagged in a line where relevant, not dwelt on. Competitor claims are **training-knowledge recall**, not verified testing — directional only.
>
> **Grounded in code.** Every "nrtur does / doesn't" claim below cites a real `index.html` line, verified in a 5-agent research sweep (2026-07-04).

---

## 1. The thesis in one paragraph

nrtur now has a genuinely **excellent visual flow builder that executes real effects** — the interpreter walks the authored node tree ([`autoRunNodes`, index.html:17332](../../index.html)) and actually mutates records (assign/round-robin, add/remove tag, `updateField` Owner/Status/Priority, enroll, branch), fed by a multi-entity created-event bus (`fireEntityAutomationEvents`, 17372) plus full deal-lifecycle firing. **What it lacks is the paradigm every serious CRM ships _next to_ the canvas:** a per-object **rule layer** — Assignment/routing, Scoring, Validation, SLA/Escalation, and Approval as declarative IF-condition-THEN rows an admin configures in seconds, evaluated on **create / edit / save** (not just create). This is exactly where Zoho and Salesforce win, and it's the highest-leverage thing nrtur can add.

**Readiness (rule-based automation dimension): `46 / 100` at research time → `~88 / 100` now that Phases 0–6 have shipped (trigger substrate · unified AND/OR conditions · Assignment · Scoring · Validation · SLA · Approval + Blueprint) — the in-memory-feasible ceiling. The remaining ~12 points are backend-only (durable persistence · server-side rule evaluation · a real durable scheduler/queue), out of scope for the prototype by design. Phase 7 (a unified `Settings › Rules` console + thin follow-ons: auto-response · data-transform · duplicate config · field-dependency) consolidates and rounds out the layer without moving the in-memory ceiling.**

---

## 2. What "rule-based automation" means (and why it's separate from the flow builder)

Two paradigms coexist in every mature CRM:

| | **Flow builder** (what nrtur has) | **Rule layer** (what nrtur lacks) |
|---|---|---|
| Authored as | a drawn canvas of nodes | a plain IF-condition-THEN row in a list |
| Who uses it | power users building multi-step journeys | admins encoding routine business logic in seconds |
| Fires on | (nrtur) create + deal-lifecycle | create / **edit** / save / stage-transition / **time** |
| Examples | "won → onboarding drip with waits & branches" | "on save, if Discount>20% then require approval"; "route US enterprise leads round-robin"; "+15 points if Title contains VP" |

The rule layer is the **backbone** — the vast majority of business logic is "on save, if X then Y." nrtur models automation almost entirely as a flow builder and has **no `Settings > Object > Rules` console** where that logic lives. The result: routine rules that take 20 seconds elsewhere must be drawn as a full flow here.

---

## 3. What nrtur already has (the mature rule-like surfaces)

Credit where due — nrtur is not starting from zero. Several genuine rule surfaces already ship:

- **A mature AND/OR condition engine** — [`omApplyFilter`, index.html:5805](../../index.html) evaluates `{match:'AND'|'OR', conds:[{fieldKey,op,value}]}` with rich per-type operators (_is any of_, _has all of_, _is empty_). It powers **Smart Lists across every object**. **But it only filters lists (read-only membership)** — it never triggers actions or blocks a save. This is the single most reusable asset for the whole plan.
- **Two real IF/THEN rule lists — booking-scoped.** `qualEvaluate` (19029) runs per-event-type qualification rules (`qualRules:[{q,op,value,action}]`, authored in the EventTypeDrawer with literal _IF question op value THEN qualify/disqualify/route_ UI) and **executes** — auto-qualifying and re-routing the host. Scheduling **Routing rules** (19923-19934) are a second IF/THEN list. Both **prove the row-UI pattern is buildable** — but are locked to the public booking widget, and the routing rules **aren't even persisted** (Save is a toast, 19937).
- **Stage gates — a real transition guard.** Per-stage `required:[fieldKeys]` (pipeline seed ~8971) enforced by `dealMissingFor` (7785) blocks a deal from entering/advancing a stage until named fields are filled, including gate-on-creation. This is a genuine Blueprint-style guard **on the "what is mandatory" axis**.
- **Soft validation.** `errorFor` (2392) blocks empty-required + bad-email on create/edit; the CSV importer's `validateRow` (5296) flags bad rows.
- **A fixed multi-signal dedupe engine.** `detectDuplicates` (6112) matches Email/Phone (high) + Name+Company (medium), powering the Settings > Duplicates page, per-object tabs, and an on-create modal with a merge flow. Detection + merge **ship** — only configurability is missing.
- **Assignment — three siloed implementations.** The automation `assign` action (`autoResolveOwner`, 17311), booking round-robin (`rrAssignFor`, 19098), and the ad-lead form owner string (9486). None share a routing-rule object; round-robin is a naive global `_autoRR++` counter and **"Least busy rep" is fake** — aliased to plain round-robin (17314).

---

## 4. The rule-type taxonomy — nrtur vs the field

The 14 rule types that make up the rule-based paradigm across Salesforce, Zoho, HubSpot, MS Dynamics, Freshsales, Pipedrive, and GoHighLevel. **Competitor coverage is training-knowledge recall.**

| # | Rule type | nrtur | The gap in one line |
|---|---|:--:|---|
| 1 | **Workflow Rules** (IF-condition-THEN on create/edit/save) | ◐ | Has the interpreter; has no rule-list console — every rule must be **drawn** as a flow. |
| 2 | **Assignment / Routing Rules** (round-robin, load-balance, territory, weighted, skill) | ◐→● | **Shipped:** shared per-object rule table + real least-busy. Territory/weighted/skill still to add. |
| 3 | **Lead / Deal Scoring Rules** (demographic + behavioral scorecard) | ○→● | **Shipped:** `scoreRules` scorecard + `recomputeScore` (real number, no random); score action + threshold trigger wired. Behavioral inputs + deal scoring to add. |
| 4 | **Validation Rules** (block a bad save via custom expression) | ◐→● | **Shipped:** `validateRecord` blocks create + bulk import with a custom cross-field message. Detail-edit / stage-move to add. |
| 5 | **Escalation / SLA / Time-based Rules** | ○→● | **Shipped:** `slaRules` on the scheduler fire task/notify/assign/tag on breach (deduped) + an SLA badge. Multi-tier ladders + durable timer to add. |
| 6 | **Approval Processes** | ○→● | **Shipped:** approval rules + an inbox gate a matching deal move behind sign-off; Approve applies the move. |
| 7 | **Blueprint / State-machine** (guided transitions) | ◐→● | **Shipped:** `DEAL_BLUEPRINT` allowed-transition guard on deal moves (no arbitrary stage jumps). Per-transition owner/permission to add. |
| 8 | **Duplicate Rules** (configurable match keys / policy) | ◐ | Detection + merge ship; match keys/thresholds/policy are **fixed** — no admin config. |
| 9 | **Field-dependency Rules** (cascading picklists) | ○ | Drawers render all fields independently — no controlling-field logic. |
| 10 | **Auto-response Rules** (declarative send-on-event) | ◐ | Exists only as an ad-hoc flow action — no standalone form/inbound → send-template rule. |
| 11 | **Data-transform / Normalization Rules** (format-on-save) | ○ | No format-on-save primitive; `updateField` writes literals only. |
| 12 | **Territory Management Rules** (geo/segment ownership) | ○ | No territory object; only a demo activity string. |
| 13 | **Case / Ticket Routing & Queue Rules** | ○ | Out of scope — nrtur has no Cases object today (future module). |
| 14 | **Update / Tag / Status dispatch + Scheduler** (trigger plumbing) | ○ | Triggers **authored** in TRIGGER_CATS but **nothing dispatches them** — the #1 enabler. |

`● full · ◐ partial · ○ none`

**Which types must nrtur ADD to beat the field:** #14 (trigger substrate — unblocks everything), #2 (Assignment Rules — biggest competitive win), #3 (Scoring), #4 (Validation), #5 (SLA/Escalation), #6 (Approval), then the console (#1) and fast follow-ons (#8/#9/#10/#11).

---

## 5. Full CRM use-case sweep (43 cases)

Every automation use case a CRM is expected to handle, judged **post-fix** (after the #1/#2 interpreter + multi-entity-bus fixes). **5 full · 14 partial · 24 none.**

### Lead management
| Use case | Support | Note / what's needed |
|---|:--:|---|
| Web-form / ad-lead capture creates a record | ◐ | Create fires "Lead created" so a flow can react; **no standalone capture→route→respond rule**. |
| Lead assignment / round-robin | ◐ | `assign` mutates owner via a real counter — but naive global, fake least-busy, no shared table. |
| Territory / skill / weighted routing | ○ | None; the one true routing list (19923) is booking-scoped + not persisted. |
| Lead scoring (demographic + behavioral) | ○→● | **Shipped:** `recomputeScore` scorecard (Settings › Lead scoring), computed on create + edit; threshold fires "Lead score reached". Behavioral inputs still to add. |
| Lead qualification rules | ◐ | Real & executing — but **locked to the booking widget** (`qualEvaluate` 19029). |
| Lead nurture / drip enrollment | ◐ | Enroll **works** (17351); drip **cadence never advances** — waits skipped (no scheduler). |
| Lead re-engagement / cold-lead revival | ○ | No "untouched N days" fire — needs scheduler + inactivity dispatch. |
| Lead deduplication on create | ◐ | Real detect + merge (6112/5497); **match keys/thresholds/policy fixed** — no config. |

### Deal / pipeline
| Use case | Support | Note / what's needed |
|---|:--:|---|
| Deal created → auto tasks / onboarding kickoff | ● | Most complete path — real tasks/assign/tag/enroll via the interpreter. |
| Stage-change tasks (per-stage checklist) | ● | Fires on real board/list/detail transitions; deal cond-gated. |
| Deal rotting / stale-deal alert | ○ | No scheduler computes days-in-stage — trigger inert. |
| Deal won → onboarding / customer lifecycle | ● | Fires; runs onboarding actions; Deal-won→Customer already shipped. |
| Deal lost → nurture / recycle | ◐ | Fires + can enroll — but ongoing cadence needs the scheduler. |
| Big-deal / discount approval process | ○ | No approval primitive; cond can **detect** a big deal but can't gate on sign-off. |

### Activity & tasks
| Use case | Support | Note / what's needed |
|---|:--:|---|
| Auto-create follow-up task | ● | `task/reminder/flag` → real `addTask` (17343). Works today. |
| Meeting booked → prep task / host routing | ◐ | Booking routes the host; but booking events **don't feed the automation bus**. |
| Call logged → follow-up sequence | ○ | No activity-event dispatch — category exists, no emitter. |
| Overdue task escalation | ○ | Overdue surfaces in a panel but fires no automation; needs scheduler. |

### Data hygiene
| Use case | Support | Note / what's needed |
|---|:--:|---|
| Validation rule — block bad save (custom expression) | ○→● | **Shipped:** `validateRecord` blocks create + bulk import with a custom message (cross-field AND/OR). Detail-edit / stage-move to add. |
| Required-field enforcement | ● | `errorFor` (2392) + CSV `validateRow` + per-stage `required:[]` gates. |
| Deduplication (detect + merge) | ◐ | Works; configurability doesn't. |
| Standardize / format-on-save (data transform) | ○ | No normalization primitive; update events don't even dispatch. |

### Assignment / routing
| Use case | Support | Note / what's needed |
|---|:--:|---|
| Load-balance assignment | ○→● | **Shipped:** `autoOpenCount` (open deals + active leads per rep) drives a real least-busy = argmin. |
| Reassign on inactivity / owner absence | ○ | No scheduler to detect an inactive owner / OOO. |

### SLA / escalation
| Use case | Support | Note / what's needed |
|---|:--:|---|
| First-response SLA timer | ○→● | **Shipped:** an SLA rule ("New lead untouched N days") fires escalation actions on breach + shows a countdown badge. |
| Resolution / no-touch SLA breach | ○→● | **Shipped:** per-object SLA rules ("open deal no activity N days") fire task/notify/assign on the scheduler. |

### Notification
| Use case | Support | Note / what's needed |
|---|:--:|---|
| Internal notification (Slack / in-app / push) | ◐ | Runs as observable labels on wired triggers; real send + broader dispatch needed. |
| Customer-facing auto-email / SMS on event | ◐ | Enroll is real; send is simulated; only create/deal events fire. |
| Scheduled digest / recurring summary | ○ | `report` is a label; cron triggers have no engine. |

### Approval
| Use case | Support | Note / what's needed |
|---|:--:|---|
| Discount / refund / high-value approval | ○→● | **Shipped:** an approval rule ("deals > $50k need sign-off to close") gates the deal move; the approver decides in the inbox. |

### Lifecycle / renewal
| Use case | Support | Note / what's needed |
|---|:--:|---|
| Onboarding sequence after won | ◐ | Kicks off immediately; multi-day steps need the scheduler. |
| Renewal / anniversary reminder | ○ | No date-field-reached fire. |
| Churn / health-score-drop intervention | ○ | Health is a static bucket; no recompute, no threshold event. |

### Marketing
| Use case | Support | Note / what's needed |
|---|:--:|---|
| Ad-lead → route + auto-respond | ◐ | Fires "Lead created"; route+respond isn't one persisted rule; naive round-robin. |
| Form-submit → send template (auto-response) | ◐ | Flow can respond; no standalone auto-response primitive; send is a label. |
| Inbound webhook → automation | ◐ | `webhook` is an **outbound** action; no inbound-webhook **trigger**. |
| Multi-step drip campaign timing | ○ | Enrolls but never advances step 2+ (waits skipped). |

### Reporting
| Use case | Support | Note / what's needed |
|---|:--:|---|
| Scheduled report / KPI digest | ○ | `report` is a label; cron has no engine. |

### The rule-list paradigm itself
| Use case | Support | Note / what's needed |
|---|:--:|---|
| Standalone per-object IF-THEN workflow rule list | ○ | **THE core gap** — no rules console; every rule must be drawn as a flow. |
| Edit-time / tag / status-change rules | ○ | Triggers exist (11870-11889); **nothing dispatches them**. |
| AND/OR multi-condition rule logic | ○ | Conditions are single field/op/value; the AND/OR engine is siloed to Smart Lists. |
| Field-dependency (cascading picklist) rules | ○ | Drawers render fields independently. |
| Approval / Blueprint transition guards | ○ | Gates check field presence, not approval or allowed transitions. |

**The pattern in the "none" column is overwhelmingly one of two missing enablers: (a) the trigger substrate (edit/tag/status/time dispatch), and (b) the rule-list console. Build those two and ~20 of the 24 "none" cases become reachable.**

---

## 6. What to add to be best-in-class (ranked)

Eight additions, each designed to **reuse existing engines** — the `omApplyFilter` AND/OR model, the node interpreter, the multi-entity event bus, and the stage-gate block-and-highlight plumbing. Nothing here needs a new execution engine.

### ⚡ Critical

**1 · Trigger substrate — edit/tag/status dispatch + a simulated-time scheduler** &nbsp;✅ **SHIPPED** (`b4eee2f` · `41487e1` · `56d39a0`)
_The single highest-leverage enabler; everything below was half-inert without it._
A `fireRecordUpdate(ent,before,after)` helper now diffs a record edit and fires Contact/Lead/Company **updated · status · tag · owner** triggers, wired into the canonical `update*` helpers, the list inline setters, and the bulk bar. A simulated-time engine (`_autoNow` + a **"+1 day"** control on the Automations header) scans for age/due/inactivity breaches and fires "Deal inactive 7 days" / "Task overdue" / "Invoice overdue" (deduped), and **`wait`/`wait-until` nodes now pause and resume** on advance instead of being skipped. Reuses `fireEntityAutomationEvents` verbatim. _Verified headless (CDP): edit-triggers fire + effects land; a paused flow resumes on advance; nested waits no longer drop the flow tail. Backend: durable timers need a server (one line)._

**2 · Unified AND/OR condition model — shared by rules AND automations** &nbsp;✅ **SHIPPED** (`8d5348e` · `73bdf82` · `ce6d8ab`)
`autoEvalCond` and `dealCondPass` now evaluate the `omApplyFilter` `{match, conds}` model when a node/automation carries one (type-aware operators, AND/OR), with the legacy single-condition path kept as fallback; `autoFieldsFor(ent)` resolves the per-entity field schema. Condition/goal nodes are authored with the **embedded Smart-Lists `OmFiltersButton`** (via the new `AutoCondEditor`), so the flow builder gains the same AND/OR power Smart Lists have — the single condition primitive every future rule type will reuse. _Verified headless (runtime eval + live render + adversarial-review hardening). Backend: none — pure in-memory._

**3 · Assignment / Routing Rules — a shared, persisted, first-class table** &nbsp;✅ **SHIPPED** (`b238602` · `11d082d` · `73ba9cf`)
_nrtur's single biggest competitive win in this space — now real._ A per-object ordered table lives at **Settings › Assignment rules** (per-object tabs): "IF `<AND/OR conditions>` THEN assign to `<least busy | round-robin | specific rep>`", first match wins, with a configurable rep pool. `resolveAssignment(object,record)` evaluates the rules via the Phase-1 `omApplyFilter` engine and runs on **record create** + **ad-lead capture**. `autoOpenCount` gives a **real** least-busy (open deals + active leads per rep → argmin); `autoResolveOwner`'s "Least busy rep" now uses it (was the fake alias). _Verified headless (engine: rule-match / first-match-wins / real least-busy == argmin; console: render + author; + adversarial-review hardening). Deferred: territory/weighted/skill routing (a criteria→pool extension), and persisting the booking routing rules onto this table._

### 🔶 High

**4 · Lead / Deal Scoring Rules — a scorecard that computes a real number** &nbsp;✅ **SHIPPED** (`4bd2319` · `a8bd929` · `be81e3d` · `c4c29e5`)
`scoreRules:[{when:conditionModel, points}]` in CrmDataContext (seeded 4 lead rules), authored at **Settings › Lead scoring**. `recomputeScore(object,record)` = base(25) + Σ points for each matching rule (via `omApplyFilter`), clamped 0–100 — and it runs on **every lead-create path** and on **edit**, so `record.score` is a real number (the random seeds are gone) that `leadScoreBucket` buckets. The dead `updateField→'Lead score'` action is wired (add/subtract/reset), and **"Lead score reached" dispatches on threshold crossing** (create/edit/interpreter). _Verified headless (exact sums, +N/Reset action, single crossing fire, multi-action accumulation) + adversarial-review hardening. Deal scoring reuses the same engine — a fast follow-on._

**5 · Validation Rules — block a bad save with a custom error** &nbsp;✅ **SHIPPED** (`7702142` · `5c85e0d` · `96f526e`)
`validationRules:[{when:conditionModel, message}]` per object (seeded 3 cross-field rules), authored at **Settings › Validation rules**. `validateRecord(object,record)` returns the first matching rule's message (via `omApplyFilter`) — the rule describes the **invalid** state. Wired into the create drawer (a red banner blocks the save before persist) and the **bulk import** (invalid rows are skipped with a count); empty/malformed rules fail open. Reuses the Phase-1 AND/OR condition builder. _Verified headless (exact block messages, valid/non-matching pass, safe on empty/malformed) + adversarial-review hardening (permission-gate the condition editor, bulk-import coverage). Deferred: detail-edit / stage-move / lead-conversion validation — the conversion path is a deliberate transform, not fresh manual entry._

**6 · SLA / Escalation Rules — time-breach ladders on the scheduler** &nbsp;✅ **SHIPPED** (`5aa2929` · `0e3f86e` · `e22523e`)
Built on the Phase-0 scheduler. `slaRules:[{object, when, withinDays, then:{task,notify,assignTo,tag}}]` (seeded 2), authored at **Settings › SLA rules**. `scanBreaches` now scans each SLA rule: a matching record whose age (days-since-activity + simulated advance) ≥ `withinDays` fires the rule's actions **once** (deduped) via the interpreter (task/notify/assign/tag) and logs an SLA-breach note; open-deal guard skips won/lost. `slaStatus(object,rec)` drives a countdown/breach **badge** on the lead detail ("SLA · 2d left" / "SLA breached"). _Verified headless (breach fires on +N-day advance, dedupe holds, badge renders) + adversarial-review hardening (new rules start disabled; empty-condition = "all records" warning). Breaches evaluate on the manual "+1 day" control (a durable server timer is the one backend line)._

### ◆ Medium

**7 · Approval Processes + Blueprint transition guards** &nbsp;✅ **SHIPPED** (`b5ae4ae` · `245df19` · `0beddbb`)
_(a) Approval:_ `approvalRules` (seeded: deals > $50k need sign-off to close) + an in-memory `approvals` inbox at **Settings › Approvals**. `needsApproval` matches the deal (target stage merged) via `omApplyFilter`; the deal-detail `commitStage` gate creates a **pending approval and blocks** the move; the inbox's Approve applies the gated move (firing the same won/lost automations + contact promotion as a normal move), Reject leaves it. _(b) Blueprint:_ `DEAL_BLUEPRINT` allowed-transition map + `blueprintAllows(from,to)` enforced in `commitStage` — a deal can only move to a sanctioned next stage (adjacent/Lost/reopen); custom-pipeline stages stay unrestricted. _Verified headless (gate matches / Approve moves + fires the won lifecycle; blueprint blocks skips) + adversarial-review hardening (won-lifecycle parity, permission-gated inbox). Board/list enforcement + a stage-config UI are fast follow-ons._

**8 · Per-object Workflow Rule console + fast follow-ons**
The umbrella UI: `Settings > <Object> > Rules` listing all rule types as plain IF-THEN rows **compiled into the same interpreter** (`autoRunNodes`) — an admin never draws a flow for routine logic. Plus thin presets over the same primitives: **Auto-response** (form/inbound → send template), **Data-transform** (title-case/format-phone/trim-tags on save, as new small interpreter actions beside `updateField`), configurable **Duplicate** match-keys/threshold/policy (feeding `detectDuplicates` 6112 + `DuplicateDetectionModal` 5497), and **Field-dependency** (a per-field "controlled by" map applied in the drawer render).

---

## 7. Roadmap (build order)

Ordered so each phase unblocks the next; every phase is in-memory-feasible.

0. ✅ **Foundation — trigger substrate (SHIPPED, `b4eee2f`/`41487e1`/`56d39a0`).** Edit/tag/status emitters at the mutation sites + a simulated-time scheduler that drains waits and scans breaches. _Unblocked everything below._
1. ✅ **Unified condition model (SHIPPED, `8d5348e`/`73bdf82`/`ce6d8ab`).** `autoEvalCond` + `dealCondPass` evaluate the `omApplyFilter` AND/OR model; condition nodes authored with the embedded `OmFiltersButton`. _Every rule and flow can now express AND/OR._
2. ✅ **Assignment / Routing Rules (SHIPPED, `b238602`/`11d082d`/`73ba9cf`).** Per-object rule table at Settings › Assignment rules; `resolveAssignment` via `omApplyFilter`; real least-busy (`autoOpenCount` argmin) + per-pool round-robin; wired into create + ad-lead.
3. ✅ **Scoring Rules (SHIPPED, `4bd2319`/`a8bd929`/`be81e3d`/`c4c29e5`).** `scoreRules` scorecard + `recomputeScore` on every create + edit; random seeds removed; score action + "Lead score reached" threshold dispatch wired.
4. ✅ **Validation Rules (SHIPPED, `7702142`/`5c85e0d`/`96f526e`).** `validationRules` + `validateRecord` block a bad save in the create drawer + bulk import with a custom message; authored at Settings › Validation rules.
5. ✅ **SLA / Escalation Rules (SHIPPED, `5aa2929`/`0e3f86e`/`e22523e`).** `slaRules` scanned by `scanBreaches`; breach fires interpreter actions (task/notify/assign/tag) deduped; `slaStatus` badge on the lead detail; authored at Settings › SLA rules.
6. **Approval + Blueprint.** In-memory approval request + inbox card gating stage-commit; `allowedNext:[]` transition guards.
7. **Rules console + fast follow-ons.** The `Settings > <Object> > Rules` console (compiles IF-THEN rows into `autoRunNodes`); Auto-response, Data-transform, Duplicate config, Field-dependency.

**Backend track (parallel, one line):** persistence, server-side rule evaluation, and a durable scheduler/queue are the only pieces not in-memory-feasible — noted, but the prototype stays fully client-side.

---

## 8. Verdict

**Approved — build the rule layer; it's the clearest path to category-leading automation.** nrtur already owns the two hardest assets most CRMs charge for: a real execution interpreter and a mature AND/OR condition engine. The gap is not capability, it's **surfacing** — the rules paradigm that lets an admin encode routine logic without drawing a flow. The plan above reuses what exists rather than rebuilding, so the leverage is unusually high: **Phase 0 alone (trigger substrate) flips ~20 of the 24 unsupported use cases from "impossible" to "reachable."**

**Rule-based automation readiness: `46 / 100` today → `88 / 100` if §6 ships.** The 12 points that remain are backend-only (durable persistence, server-side evaluation, real durable timers) — out of scope for the prototype by design.

---

_See [`AUTOMATIONS_AUDIT.md`](AUTOMATIONS_AUDIT.md) for the flow-builder audit (builder-vs-engine finding, the #1/#2 fixes that made the engine an interpreter, feature comparison, and remaining flow-builder gaps). The two documents are the source of record; the **Automations Audit** artifact mirrors them._
