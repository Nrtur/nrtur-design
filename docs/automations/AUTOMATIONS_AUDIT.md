# nrtur — Automations: Ground-Truth Audit, Fixes & Roadmap

_Ground-truth audit of the Automations module (2026-07-04), grounded in the real `index.html`. Companion visual: the **Automations Audit** artifact. This document is the source of record; the artifact mirrors it._

> **Scope.** Product/feature/UX of the in-memory prototype. Backend/persistence is flagged in a line where relevant, not dwelt on. Competitor claims are **training-knowledge recall**, not verified testing — directional only.

---

## 1. Verdict

**nrtur ships a world-class visual flow _builder_ around what was a deal-only _engine_.** The audit found a make.com-class builder — recursive branching, waits, goals, ~25 configurable actions, a working test simulator, deep monitoring — but at audit time almost none of that authoring reached runtime: one deal-only event bus fired ~10% of the trigger catalog, and `save()` discarded the flow's real config.

Two foundational fixes have since landed (see §3), materially lifting the engine. The remaining gaps and the plan to become best-in-class (including the **rule-based automation** layer other CRMs ship) are below.

| Dimension | Score | Notes |
|---|---:|---|
| Flow-engine readiness (at audit) | **27 / 100** | Beautiful builder, deal-only runtime; ~10% of triggers fired. |
| Flow-engine readiness (after §3 fixes) | **materially higher** | Interpreter + multi-entity created bus now execute real effects. |
| **Rule-based-automation readiness (today)** | **46 / 100** | Excellent flow builder, but **no rule-list layer** — see [`RULES_BASED_AUTOMATION.md`](RULES_BASED_AUTOMATION.md). |
| **Rule-based-automation readiness (if the plan ships)** | **88 / 100** | The remaining 12 pts are backend-only (persistence, durable timers). |

---

## 2. The core finding — Builder vs Engine

| What you can **build** (rich, real) | What actually **ran** (at audit) |
|---|---|
| 62 triggers across 12 entity categories | 7 deal events only (~10%) |
| 25 action presets with real config drawers | 1 real effect: a generic follow-up task |
| Recursive Yes/No branches + 2–4 lane splits | branches/waits/goals discarded on save |
| wait / wait-until / goal logic nodes | no scheduler — time/date/delay inert |
| a working Test simulator | condition gate: deal-value regex, fails open |
| monitoring: runs, success%, logs, enrolled | every run hardcoded `success` |

The gap between what you could draw and what actually ran was the whole story. `save()` flattened the node tree to step-**labels**, so `fireDealAutomationEvents` only ever produced one task + a timeline note, regardless of the authored steps.

---

## 3. Fixes landed

### #1 — The engine is now an **interpreter** of the authored node tree — `d2220db`
- `save()` **persists the full node tree** (`nodes` + entry filter), not just labels.
- `fireDealAutomationEvents` **interprets** it for a fired deal automation:
  - **Real in-memory effects** where clean: `assign` (round-robin / named owner via `setDeals` + `ownerColor`), `addTag`/`removeTag` (`dealTags`), `updateField` Owner/Priority, `enrollEmail`/`enrollSms` (`setSeqEnrollments`, deduped).
  - **Distinct observable effects** otherwise: "Email sent · <template>", "SMS sent", "🔔 <channel> notified", push/in-app/webhook/create/report — one timeline line each.
  - **Condition nodes are evaluated against the deal** (`autoEvalCond`: deal value / owner / tag, fails open) and route into the real Yes/No branch; goal nodes early-exit; waits are noted-and-skipped (no scheduler yet).
- Seeded/legacy automations (no node tree) keep the original label behaviour — no regression.
- _Verified (CDP): an assign action reassigned a deal SC→JK; addTag applied the tag; a $9k deal took the yes-branch; save persists a 3-node tree; zero errors._

### #2 — Multi-entity **event bus** — `add9b28`
- `autoCtx(ent)` resolves the per-entity setter (`setDeals`/`setContacts`/`setLeads`/`setCompanies`) + tag field (`dealTags` vs `tags`).
- The interpreter (`autoRunNodes` / `autoEvalCond` / `autoResolveOwner`) now takes a **record + ctx** instead of a hardcoded deal — real mutations work on **contacts / leads / companies**, not just deals (assign, add/remove tag, `updateField` Owner/Status/Priority, enroll).
- New `fireEntityAutomationEvents(ent, record, events)` + a shared `autoExecuteFired()`; `fireDealAutomationEvents` routes through the same executor (identical behaviour + the deal-value cond gate).
- The central record-create site fires **"<Entity> created"** for every object type (was `object === 'deal'` only), so Contact / Lead / Company created automations now run.
- _Verified (CDP): the interpreter reassigned a contact's owner, tagged it, set its status via `setContacts`; a seeded active "Contact created" automation fired (`runs 0→1`); the deal path still worked; zero errors._

**Net:** a "Lead created → assign round-robin → tag → enroll" automation now runs end-to-end for the first time. Real trigger coverage moved from ~10% (deal-only) to the create + deal-lifecycle core.

---

## 4. Strengths (credit where due)

- **Deal-stage automation is genuinely wired end-to-end** — the single most valuable CRM automation.
- **Honest runtime condition gating** — `dealCondPass` runs vs skips per deal and logs both outcomes.
- **An excellent visual flow builder** — recursive tree, real branch lanes, deep-clone, per-action config pickers. Visually rivals/beats Pipedrive & HubSpot.
- **A working test simulator** — walks the full authored tree, branches, honors goals/waits.
- **Strong monitoring & observability IA** — per-card runs/success%/sparkline, logs table, enrolled step-view, engagement funnel.
- **Retroactive stage catch-up** — a real "enroll existing records" primitive.

---

## 5. Use-case coverage (post-fix)

| Use case | Status | Note |
|---|---|---|
| Deal-stage-entry tasks | ✅ full | first-class path |
| Deal won → onboarding/handoff | ◐→✅ | actions now execute for the deal; enroll writes a real enrollment |
| Deal lost → nurture | ◐→✅ | enroll/tag now run on the deal |
| **Lead created → assign/tag/enroll** | ◐→✅ | **now runs via the multi-entity bus (#2)** |
| **Contact created → welcome/enroll** | ✕→✅ | **now fires** |
| Internal Slack / team notify | ◐ | observable ("🔔 #sales notified"); real Slack send is out of scope |
| No-reply follow-up | ✕ | needs inbound listener + scheduler |
| Rotting-deal / stuck alert | ✕ | needs scheduler |
| Meeting booked → prep | ✕ | booking flow doesn't dispatch yet |
| Form submit → create + notify | ✕ | webhook/form inbound not wired |
| Inactivity re-engagement | ✕ | needs scheduler + non-deal update dispatch |
| Renewal / date reminder | ✕ | needs scheduler |
| Field-change tag / update | ◐ | deal-value change fires; contact/lead field-change dispatch pending |
| Invoice-overdue dunning | ✕ | payments don't dispatch + needs scheduler |
| Birthday / date touchpoint | ✕ | needs scheduler |

---

## 6. Feature comparison vs the field

> nrtur ratings grounded in code; competitor columns are **training-knowledge recall** — directional, not verified.

| Capability | nrtur | HubSpot | Zoho | Pipedrive | GHL |
|---|:--:|:--:|:--:|:--:|:--:|
| Deal/stage-change triggers (execute) | ● | ● | ● | ● | ● |
| Multi-entity triggers | ◐→● (created) | ● | ● | ◐ | ● |
| Date/time/scheduled (cron) | ○ | ● | ● | ◐ | ● |
| Webhook / inbound (form, email, ad) | ○ | ● | ◐ | ◐ | ● |
| AND/OR condition grouping | ○ | ● | ● | ◐ | ◐ |
| If/else branching (canvas) | ◐→● | ● | ● | ○ | ● |
| Delays / waits | ◐ | ● | ● | ○ | ● |
| Goal / exit criteria | ◐ | ● | ◐ | ○ | ◐ |
| Re-enrollment / enroll-once dedupe | ○ (enroll deduped) | ● | ◐ | ○ | ◐ |
| Multi-channel actions | ◐ | ◐ | ◐ | ○ | ● |
| Internal notification | ◐ | ● | ● | ● | ● |
| Round-robin assignment | ◐→● | ● | ● | ● | ● |
| Cross-object / create-record actions | ◐ | ● | ● | ◐ | ◐ |
| Enroll into a sequence from automation | ◐→● | ● | ◐ | ○ | ● |
| Test / dry-run | ◐ | ◐ | ◐ | ○ | ◐ |
| Run analytics & monitoring | ◐ | ● | ◐ | ◐ | ● |
| Error / failure states & retries | ○ | ● | ◐ | ◐ | ◐ |
| Edit an existing automation | ○ | ● | ● | ● | ● |
| Working template library | ◐ | ● | ● | ● | ● |

_● full · ◐ partial · ○ none. `◐→●` = lifted by the #1/#2 fixes._

---

## 7. Remaining gaps (ranked)

- **[High] No scheduler / clock.** Every `setInterval` is UI-only, so time/date/inactivity/delay triggers and wait-node timers can't run — rotting-deal alerts, renewals, dunning, no-reply follow-ups, birthdays, real delays. _Fix: one app-level "automation tick" that scans for elapsed-time/date conditions and advances wait timers via the entity bus._
- **[High] Edit opens a blank builder.** Every card's Edit calls `goTo('automation-builder')` with no id → always the default flow, and Save creates a **new** record. _Fix: pass `editId`, seed the builder from the record, `savedId = editId`._
- **[High] Update / tag / status-change dispatch not wired.** The bus fires "created" but not the many update/tag/status mutation sites. _Fix: dispatch from the field-commit / tag / status handlers per entity._
- **[High] No AND/OR condition grouping in automations.** Every condition is a single clause; the real AND/OR engine (`omApplyFilter`) is bound to Smart Lists only. _Fix: reuse `omApplyFilter` + its AND/OR toggle in the entry filter and condition nodes (see the rule-based plan)._
- **[Medium] No enrollment ledger / re-enrollment control** at the automation level (enroll action is deduped, but no per-automation enroll-once).
- **[Medium] No real failure states / retries** — every run is hardcoded `success`.
- **[Medium] Templates cosmetic (13/14) + two divergent list pages/libraries.**
- **[Low] No version history / ownership; dead Logs date-range filter + CSV export.**

---

## 8. Roadmap

1. ✅ **Persist node tree + interpreter** (`d2220db`).
2. ✅ **Multi-entity event bus — created triggers** (`add9b28`).
3. **Scheduler tick** — time/date/inactivity + wait timers.
4. **Fix Edit** — load the clicked automation, update in place.
5. **Extend the bus** — update / tag / status-change dispatch.
6. **AND/OR conditions in automations** — reuse `omApplyFilter`.
7. **Rule-based automation layer** — assignment / scoring / validation / SLA / approval rules (see [`RULES_BASED_AUTOMATION.md`](RULES_BASED_AUTOMATION.md)).
8. **Enrollment ledger + failure states/retries.**
9. **Real template recipes + collapse legacy duplicates.**
10. **Version history / ownership.**

---

_See [`RULES_BASED_AUTOMATION.md`](RULES_BASED_AUTOMATION.md) for the rule-based-automation research (what the top CRMs ship, what nrtur must add to be best-in-class) and the full CRM use-case sweep._
