# Sprint 3.1 — Jira vs Design Validation (Native Automations Engine)

_Validation date: 2026-08-03 · Validator role: PM / BA / UX Architect / Solution Architect / QA Lead_
_Scope: the 12 FE tickets on the filtered board (assignee `sikandar.umrani.5`, label `nrtur-sprint-3.1`) under Epic **SCRUM-130 — EPIC 20: Native Automations Engine**._
_Source of truth: the design. Primary design = `index.html` (the live prototype). Supporting design docs = `docs/core-crm/automations.md` (§10.1–§10.7 + Developer Q&A), `docs/screens/automation-builder.md`, and the decision record `docs/audit/changes/r11-decisions-router-fieldtypes-smsfrom.md`._

> **How to read this report.** Every factual claim is tagged with evidence: a design-doc section (e.g. `automations.md §10.2`) and/or an `index.html` line number verified in the code. Where I state an _assumption_ it is labelled **[Assumption]**. Jira is **not** treated as correct; the design is.

---

## 0. Critical context you must absorb before the findings

There are **three** automation artifacts, and they are **not** in sync. This is the root cause of most findings.

| Artifact | What it is | State |
|---|---|---|
| **`index.html`** (root prototype) | The live, current canonical design the sprint should be built from | **Most advanced.** FlowList tree, router branching, real-record Test, 14 templates, status-differentiated save |
| **`docs/core-crm/automations.md`** | The written module spec (§10.1–§10.7) | **Partly stale.** §10.3 and the branch parts of §10.2 still describe the pre-2026-07-15 design (hard-coded Test contacts; "A/B or percentage split") |
| **`nrtur-design-system/project/pages/Automation Builder.html` / `Automations.html`** | Older static design-handoff exports | **Oldest.** Confirmed a drag-pan **canvas** — zero occurrences of `FlowList`, `Everyone else`, or `waitUntil` |

Most tickets were written to reconcile the **handoff exports** and the **spec doc** — but several of their "DEFECT to fix" statements are **already resolved in `index.html`**, or describe the _inferior_ version of a behaviour the live prototype has since improved. A developer porting from `index.html` (as the tech notes imply: "Next/React + TanStack Query + shadcn") will find some "defects" don't exist, and one ticket (SCRUM-143) actively specifies the **wrong** behaviour.

The `r11-decisions` record (dated 2026-07-15) is the reconciling authority: it says the router semantics and the real-record Test are **already built in `index.html`**, and my code audit confirms both.

---

## 1. Executive Summary

**Overall:** This is an unusually well-authored backlog. Every ticket carries a user story, scoped behaviours, testable acceptance criteria, a design reference, named backend dependencies, and an explicit out-of-scope list. Coverage of the automation surfaces (`automations.md` §10.1–§10.6) is essentially **complete**, and the backend/mobile split is clean (all cited BE tickets exist; mobile is carved out to SCRUM-558/559/560). The tickets are frequently **ahead** of the prototype on quality (they demand accessibility and loading/empty/error states the prototype lacks).

**But** the validation surfaced a consistent, high-impact failure mode: **ticket premises that are stale against the current `index.html`.** The five material issues:

1. **SCRUM-143 specifies the wrong branch model.** It calls the `branch` node a *"% or A/B split"* — but the design (per the 2026-07-15 decision and `index.html`) is a **conditional router**: each path carries a rule, a record takes the *first matching* path, and a trailing **"Everyone else"** default catches the rest. SCRUM-551 even claims "the same correction was applied to SCRUM-143," but SCRUM-143's body was never updated. **A developer building 143 to spec would build the wrong node.** (High risk.)
2. **SCRUM-143 omits a node kind.** The builder has **7** node kinds; the ticket lists **6**, missing **`mapFields`** ("Map webhook fields"). Nothing else in the sprint covers it either. (Medium.)
3. **SCRUM-609 (guardrails) partly duplicates an existing screen.** Its premise ("instead of relying on invisible defaults") is false for the frequency cap: a full **`SettingsFrequencyPage`** already exists in the design. Only the quiet-hours schedule is genuinely net-new. (Medium/High — risk of a duplicate surface + data-model conflict.)
4. **SCRUM-554's counts are stale.** It says "HTML has 3" templates; the design has **14** (`AUTO_TEMPLATES`). Its core defect (only `speed-to-lead` is wired) is real and accurate — but the real work is mapping 13 unwired recipes, which the ticket doesn't enumerate. (Medium.)
5. **SCRUM-556 and SCRUM-557 premises drifted.** `save()` already writes different `status` values (via a fragile toast-string sniff, not "no data difference"); and the `automations` route SCRUM-557 wants to "unify" is actually **dead code** (never rendered), not a live duplicate. (Low/Medium.)

**Smaller but real:** SCRUM-549 lists 8 trigger categories (design has **12**) and ignores the "Coming soon"/disabled trigger gating; the Logs "Export CSV" is a fake toast in the design (correctly flagged, wrong BE dependency cited); the success-% sparkline has no accessibility.

**Bottom line for sprint planning:** the backlog is safe to plan, but **SCRUM-143 must be corrected before it is picked up**, and SCRUM-609/554/556/557 need premise fixes so developers aren't sent to "fix" non-defects or build inferior behaviour.

---

## 2. Design Coverage Score

**Coverage of the in-scope automation design (`automations.md` §10.1–§10.7) by the sprint tickets: ~92%.**

| Design section | Covered by | Coverage |
|---|---|---|
| §10.1 List + Template browser | SCRUM-250, 251, 554 | **Fully** |
| §10.2 Builder (FlowList, triggers, webhook, dirty) | SCRUM-143, 549, 550, 556 | **Partial** — branch model wrong (143), `mapFields` node missing, 4 trigger categories + liveness gate missing (549) |
| §10.3 Test modal | SCRUM-551 | **Fully** (best-authored ticket) |
| §10.4 Log modal | SCRUM-552 | **Fully** |
| §10.5 Enrolled modal | SCRUM-553 | **Fully** (minor: 5th `failed` state) |
| §10.6 Engagement modal | SCRUM-553 | **Fully** |
| §10.7 AI Lead Qualification | **SCRUM-555 (+BE SCRUM-546)** — _outside this sprint by design_ (`calendar-scheduling` label) | **Covered elsewhere** — correctly excluded |
| Guardrails (freq cap + quiet hours) | SCRUM-609 (+BE 608/548) | **Partial** — no design surface for automation guardrails; frequency cap duplicates `SettingsFrequencyPage` |

_§10.7 is **not** a gap: it is ticketed as SCRUM-555 and deliberately scoped to the Calendar/Booking domain (its rule editor lives in `EventTypeDrawer`, `index.html` L23108, not the automations builder). It simply doesn't match this board's `nrtur-sprint-3.1` filter._

---

## 3. Jira Quality Score

**~80% — high structural quality, dragged down by stale premises and a few under-specifications.**

| Dimension | Score | Notes |
|---|---|---|
| Structure (story / scope / AC / refs / deps / out-of-scope) | **9.5/10** | Exemplary and consistent across all 12 |
| Accuracy vs current design | **6/10** | Stale premises in 143, 554, 556, 557; wrong branch model in 143 |
| Completeness of scope | **7.5/10** | Missing `mapFields`, 4 trigger categories, trigger liveness, router config panel |
| Acceptance-criteria testability | **9/10** | Given/When-style, includes loading/empty/error + a11y on most tickets |
| UX-state & a11y coverage | **8.5/10** | Strong; a few responsive gaps (mitigated by mobile tickets) |
| Dependency correctness | **8/10** | BE deps mostly named; 250 cites wrong log endpoint; 553 omits 604/605 |

---

## 4. Screen-to-Ticket Mapping

| Design screen / component | Design ref | Jira ticket | Coverage | Notes |
|---|---|---|---|---|
| Automations list card (4 states, step strip, sparkline) | §10.1; `index.html` L21444–21459, `AUTO_ST` L20853 | SCRUM-250 | **Fully Covered** | Export CSV is a fake toast in design (L21469) |
| Active/Paused toggle + role gate | §10.1/§10.2; `toggleAuto` L21391, `readOnly` L15090 | SCRUM-251 | **Fully Covered** | Confirms real defects (cosmetic readOnly, non-reconciled toggle) |
| Builder — FlowList node tree | §10.2; `FlowList` L14976, `NodeTile` L14651 | SCRUM-143 | **Partially / Incorrect** | Branch model wrong; `mapFields` missing |
| Branch / "Split into paths" router | r11 §1; `makeNode` L14467, `autoRunNodes` L20994 | SCRUM-143 | **Incorrect** | Ticket says "% or A/B split"; design is a router + "Everyone else" |
| TriggerPicker + categories | §10.2; `TRIGGER_CATS` L14363 | SCRUM-549 | **Partially Covered** | 12 categories in design, 8 in ticket; liveness gate ignored |
| Entry conditions (CondRow) | §10.2; `entryOn` L15193, `CondRow` L14570 | SCRUM-549 | **Fully Covered** | — |
| Webhook trigger drawer | §10.2; L15186–15190 | SCRUM-550 | **Fully Covered** | But the `mapFields` consumer node is unticketed |
| Test modal | §10.3 + r11 §1; `AutomationTestModal` L15044 | SCRUM-551 | **Fully Covered** | Picker not searchable in design (shows first 3 real records) |
| Run-log modal | §10.4; `AutomationLogModal` L21185 | SCRUM-552 | **Fully Covered** | Opened from list + builder ✓ |
| Enrolled modal | §10.5; L21250 | SCRUM-553 | **Fully Covered** | 5th `failed` state not in ticket |
| Engagement modal | §10.6; L21293 | SCRUM-553 | **Fully Covered** | link-wrap/realtime BE deps not cited by number |
| Template browser + recipe wiring | §10.1/§10.2; `AUTO_TEMPLATES` L21342, `useTemplate` L21394 | SCRUM-554 | **Partially Covered** | Only `speed-to-lead` wired (real); counts stale (14 not 3) |
| Dirty-guard + draft/active save | §10.2 + Dev Q&A; `save` L15118, `dirty` L15109 | SCRUM-556 | **Partially / stale premise** | Status already differs (toast-sniff); no `beforeunload` |
| Route reconciliation | Dev Q&A; `AutomationsPage` L14499 (dead), `SettingsAutomationsPage` L21372 | SCRUM-557 | **Partially / stale premise** | `automations` is a dead route, not a live duplicate |
| Guardrail settings (freq cap + quiet hours) | `automation-builder.md` L30; `SettingsFrequencyPage` L19904 | SCRUM-609 | **Missing design surface** | Freq-cap page already exists; quiet-hours schedule is net-new |
| AI Lead Qualification rules | §10.7; `EventTypeDrawer` L23108, `qualEvaluate` L22809 | **SCRUM-555 (calendar)** | **Covered outside sprint** | Correctly excluded from automations sprint |

---

## 5. Ticket-by-Ticket Review

### SCRUM-143 — FE: Automation builder → reconcile to FlowList spec · **High** · ⚠ Needs correction before pickup
**Verdict: Partially complete + one incorrect requirement.**
- ✅ **Accurate:** The vertical FlowList tree is the right target and the correct model. `index.html` already implements it (`FlowList` L14976, `NodeTile` L14651 with top/bottom ports, `BranchSplit` L14694, `countFlow` L14476, flow-summary sidebar L15156, inline-editable name L15136, admin-gated Active toggle L15138). The "canvas" defect is real **but lives in the handoff export** `pages/Automation Builder.html` (verified: no `FlowList`/`waitUntil`), **not** in `index.html`.
- ❌ **Incorrect — branch model.** Scope says `branch (% or A/B split)`. The design is a **conditional router**: `makeNode` seeds `lanes:[{label:'Path A',cond:…},{label:'Everyone else',isDefault:true}]` (L14467) with the comment *"conditional router: conditioned path(s) + a trailing default 'Everyone else' lane"*; `autoRunNodes` runs *"the FIRST path whose rule matches … else the default"* (L20994); `NODE_DESCS.branch` = *"Route each record into the first path whose rule matches"* (L14270). There is **no** percentage/weight field anywhere. This directly contradicts `r11-decisions §1` and even SCRUM-551's own statement that "the same correction [was] applied to SCRUM-143." **The correction was never applied to 143.**
- ❌ **Missing node kind.** The builder has **7** kinds (`STEP_PRESETS_A` = `action`; `LOGIC_PRESETS_A` L14251 = `condition`, `branch`, **`mapFields`**, `wait`, `waitUntil`, `goal`). The ticket lists 6 and omits `mapFields` ("Map webhook fields", L14254) — the node that consumes captured webhook fields.
- ❌ **Missing:** the **router config UI** (per-path rules edited in the step config, each path's rule summary rendered under its name, the trailing "Everyone else" lane) — described in `r11 §1` but absent from 143's scope/AC.
- ⚠ **Minor inaccuracy (inherited from the doc):** scope says `FlowCfgProvider` passes `goTo`/`flowName`; in code it passes `{selId,setSelId,ent}` (L14867) while `goTo`/`flowName` are `FlowList` props (L15153). Harmless, but wrong as written.
- ⚠ **Under-specified:** per-kind **action node config forms** (which email template, which rep, which task) are not described — a shared gap with the doc.

### SCRUM-250 — FE: Automation list (spec-complete) · **High**
**Verdict: Complete and accurate.**
- ✅ All four status states (`AUTO_ST` L20853), step strip, `MiniSparkA` sparkline (L14493), Workflows/Logs sub-tabs (L21395), ··· menu (Duplicate→paused "Copy of" L21392; Delete-with-confirm L21451), and the Logs table all match the design.
- ❌ **Design fakes Export CSV:** the Logs "Export" button is `onClick={()=>showToast('Logs exported to CSV')}` (L21469) — no CSV is built. The ticket correctly requires it to "work," **but cites the wrong BE dependency** (SCRUM-249 `GET /automations/logs`); the dedicated endpoint is **SCRUM-603** (`GET /api/v1/automations/logs` + CSV export). Reusable client CSV builders already exist (`exportListCSV`, `exportCsv`).
- ✅ **Ahead of the design:** the AC requiring sparkline `aria-hidden` + text alt is correct — `MiniSparkA` currently has **no** `aria`/`role`/`title` (L14493).
- ⚠ **Minor:** scope quotes the header stat literally as "389 runs this month" — a mock value; should read as a computed *N runs this month*.

### SCRUM-251 — FE: Automation enable/disable — toggle + role gating · **High**
**Verdict: Complete and accurate — validated against real defects.**
- ✅ `readOnly = !settingsIsAdmin()` (L15090) is confirmed **cosmetic**: it only hides the Active/Test/Save buttons; the name input, trigger drawer, and node forms have **no `disabled`** and there is **no `<fieldset disabled>`** in the builder. The ticket's fieldset requirement is exactly right.
- ✅ `toggleAuto` (L21391) flips shared-store state synchronously with **no server reconciliation/rollback** — the ticket's optimistic-with-rollback requirement addresses a real gap.
- ✅ Strong AC (double-toggle debounce, `aria-pressed/checked`, backend-enforces-admin note).

### SCRUM-549 — FE: TriggerPicker + entry conditions · **Medium**
**Verdict: Partially complete — under-specifies the trigger catalog.**
- ❌ **Category count wrong.** `TRIGGER_CATS` (L14363) has **12** categories; the ticket lists **8**. Missing: **Time & System** (L14420), **Behavioral** (L14424), **Payments** (L14431), **Custom objects** (L14438).
- ❌ **Missing UX — trigger liveness.** `AUTO_LIVE_TRIGGERS` (L14446) marks most triggers not-yet-live; the picker renders them `disabled={!live}` as "Coming soon" (L15011). No ticket captures this (and it's central — historically ~10% of triggers fire). This must be an explicit behaviour + AC.
- ✅ Entry conditions (`entryOn` "Only continue if…" + `CondRow` field/op/value, L15193/L14570) and all 8 Lead triggers match the design exactly.
- ⚠ **[Assumption to reconcile]:** the ticket says the catalog comes from BE `SCRUM-248`; the design ships it **client-side** (`TRIGGER_CATS`). Decide whether FE renders a static catalog or a BE-provided one.

### SCRUM-550 — FE: Webhook trigger UI · **Medium**
**Verdict: Complete for the drawer; a companion node is unticketed.**
- ✅ Every sub-part is in the design: read-only URL (`hooks.nrtur.com/z/ab12cd`, L15187), Copy (L15187), Capture sample (L15189), field pills add-on-Enter/remove-with-× (L15190).
- ❌ **Gap (shared with 143):** captured webhook fields are consumed by the **`mapFields` node** (L14254), which no ticket builds. The webhook *input* is covered; the *mapping node* is not.

### SCRUM-551 — FE: Automation test modal · **Medium** · ★ Best-authored ticket
**Verdict: Complete and accurate; proactively de-staled.**
- ✅ Correctly rewritten (2026-07-30) to match `r11 §1` and `index.html`: record picker typed to the trigger (`_live` by `_ent`, L15053; `ent` derived from trigger L15204), shared evaluator (`simulateFlow` L15026 → `autoEvalCond`), `branch` renders "routed to Everyone else" (L15040), 7-status `ICON` map (L15069). The regression case ($100 deal vs "Amount > $50k" → Everyone else) is real.
- ⚠ **Design is not yet searchable:** the modal lists the **first 3 real records** (`slice(0,3)`, L15059), not a search box. The ticket's "searchable … recently-updated first" is a valid production upgrade — but QA cannot use the prototype as the visual reference for the search affordance (it's net-new).
- ⚠ The prototype is **client-only** (no server dry-run; `POST /automations/:id/test` returns 0 hits). The AC "the trace and a real run agree" cannot be verified in the prototype (no live engine) — it's a production guarantee resting on SCRUM-545. Flag as such.

### SCRUM-552 — FE: Automation run-log modal · **Medium**
**Verdict: Complete and accurate.** `AutomationLogModal` (L21185), `LOG_ST` (L21175), stats strip, chips (L21191), red failed-detail (L21211), two empty states (L21204), opened from **both** list ("Logs", L21447) and builder ("Run history", L15139/L15205). Strong AC. Correct BE dep (SCRUM-249).

### SCRUM-553 — FE: Enrolled + Engagement modals · **Medium**
**Verdict: Complete; two small omissions.**
- ✅ Both modals fully present: `EnrolledContactsModal` L21250 (`ENG_ICONS` L21248, `enrolleesFor` real+synthetic L21240, unsub override L21274); `EngagementModal` L21293 (conditional funnel L21296, 3-metric grid L21315, clickers wrapped-URL pill L21328, `EVIC` feed L21304).
- ❌ **Minor:** the design's `ENR_ST` includes a **5th** enrollment state, `failed`, with no matching chip; the ticket says "4 enrollment states."
- ⚠ **Dependency naming:** per-recipient clickers depend on **SCRUM-604** (link-wrap) and live enrollment on **SCRUM-605** (realtime channel); the ticket references "link-wrap service" generically without citing either number.

### SCRUM-554 — FE: Automation template browser wiring · **Medium**
**Verdict: Core defect correct; supporting counts stale; the real work is under-scoped.**
- ✅ **Accurate core defect:** only `speed-to-lead` is wired — `useTemplate` passes `nav.recipe` only for it (L21394), and the builder initializer special-cases only `_recipe==='speed-to-lead'` (L15097–15102); all others fall through to the default (assign + welcome + condition) flow.
- ❌ **Stale counts:** "HTML has 3" is wrong — `AUTO_TEMPLATES` seeds **14** recipes (L21342). "Doc lists 8" is loose — the doc lists 7 named + "more." The AC "Seed set matches the doc (8 recipes)" is ungrounded.
- ❌ **Under-scoped:** the substantive work is authoring the **trigger + FlowList node steps for the 13 unwired recipes** in the builder initializer; the ticket says "pre-fill for all recipes" but doesn't acknowledge those step definitions don't exist yet.

### SCRUM-556 — FE: Builder dirty-guard + save-as-draft · **Medium**
**Verdict: Half-stale premise; the dirty-guard half is accurate.**
- ❌ **Premise stale:** "Save as draft and Save both call `save(msg)` … no data difference" is no longer true. `save` (L15118) does `const draft=/draft/i.test(msg); … status: draft?'draft':(activated?'active':'paused')` — status **does** differ. The **real** defect is that draft-ness is inferred by **regex-matching the toast string** (fragile), and "Save" yields `active` **only if the Active toggle is on, else `paused`** (not unconditionally `active`, as the AC states). The Sequence builder already shows the right pattern: an explicit `asDraft` boolean (L20407).
- ✅ **Accurate:** in-app discard confirm exists (Cancel L15126, `navGuard` L15128) but there is **no `beforeunload`** guard — the ticket's browser-navigation AC fills a real gap.

### SCRUM-557 — FE: Automations route reconciliation · **Medium**
**Verdict: Underlying goal valid; premise overstates current reality.**
- ❌ **Premise stale:** `AutomationsPage` (route `automations`, L14499) is **dead code** — never rendered; the router mounts only `SettingsAutomationsPage` (L26422), and an in-code comment calls `automations` a *"dead route (black screen)"* (L14489). So it isn't "two live duplicate lists"; it's **one live list + one orphaned page**.
- ✅ **Accurate:** the builder always returns to `settings-automations` regardless of entry (`save`/`cancel`/`navGuard` → `settings-automations`, L15124/15126/15128).
- ✅ The **goal** (a single shared `<AutomationsList>` + origin-aware return) is architecturally sound for the Next.js port — but the immediate `index.html` reality is *delete/repoint the dead page*, which the ticket should state.

### SCRUM-609 — FE: Automation guardrail settings surface · **Medium** · ⚠ Weakest design grounding
**Verdict: Partly duplicative, partly net-new, with no design mock to validate against.**
- ❌ **Premise inaccurate for frequency cap:** "instead of relying on invisible defaults" is false — a full **`SettingsFrequencyPage`** already exists (route `settings-frequency`, L19904): per-channel toggle + stepper + window (day/week) + transactional-exempt, backed by `WORKSPACE_FREQ_CAP` (L26164); plus a per-sequence cap (L20661). The ticket doesn't acknowledge it → **risk of a duplicate frequency-cap surface** and a **data-model conflict** (ticket's `{max, windowHours}` vs the existing per-channel day/week model).
- ✅ **Quiet-hours schedule is genuinely net-new:** the design only has a **hard-coded boolean toggle** ("Only send 8am–7pm in the contact's timezone", L20660) — no start/end/timezone picker anywhere.
- ⚠ **No design surface:** guardrails appear only as a one-line _Suggestion_ (`automation-builder.md` L30). This ticket is grounded in the **backend** (`cmd/api/main.go`) not the design; there is no wireframe/surface-inventory to validate against. It is effectively a net-new UI ticket.
- ⚠ **Scope note:** the L30 suggestion bundles "frequency caps, DNC/unsubscribe respect, quiet hours"; DNC is (reasonably) deferred to BE SCRUM-548, but should be called out as a conscious split.

---

## 6. Missing Requirements (present in the design, absent from the sprint tickets)

| # | Missing requirement | Design evidence | Why it matters | Where it belongs |
|---|---|---|---|---|
| MR-1 | **`mapFields` node kind** (7th kind — "Map webhook fields") | `LOGIC_PRESETS_A` L14254; `makeNode` L14464 | Webhook automations can't route inbound fields into steps without it; the webhook UI (550) captures fields with no consumer node | New ticket, or add to SCRUM-143 + SCRUM-550 |
| MR-2 | **Router node configuration UI** (per-path rules, rule summary under each path name, trailing "Everyone else" lane) | `r11 §1`; `makeNode` L14467; canvas summary text | Without it the router node can't be configured; SCRUM-143 only (mis)names the node | Add to SCRUM-143 |
| MR-3 | **4 missing trigger categories** (Time & System, Behavioral, Payments, Custom objects) | `TRIGGER_CATS` L14420–14438 | Payments/behavioral triggers are core to the CRM; picker would be incomplete | Add to SCRUM-549 |
| MR-4 | **Trigger liveness / "Coming soon" gating** | `AUTO_LIVE_TRIGGERS` L14446; `disabled={!live}` L15011 | Most triggers are not live; users must see which are selectable | Add to SCRUM-549 |
| MR-5 | **Recipe step definitions for the 13 unwired templates** | `AUTO_TEMPLATES` L21342 (14 recipes) | The bulk of SCRUM-554's real work; unspecified | Expand SCRUM-554 |
| MR-6 | **Reconciliation of automation guardrails with existing `SettingsFrequencyPage`** | L19904 vs SCRUM-609 | Prevents a duplicate/competing frequency-cap screen and data model | New decision + SCRUM-609 |
| MR-7 | **5th enrollment state `failed`** | `ENR_ST` L21221 | Enrolled modal should represent/handle failed enrollments | Add to SCRUM-553 |

---

## 7. Missing / Incorrect Acceptance Criteria (rewrites)

**SCRUM-143 — replace the branch AC and add coverage:**
- Given a `branch` (router) node, When a record is evaluated, Then it follows the **first path whose rule matches**, top-to-bottom; if none match it follows the **"Everyone else"** default lane, and **no record is dropped**.
- Given the branch config panel, Then each path exposes an editable rule (`CondRow`/rule group) and the canvas renders each path's **rule summary** beneath its name.
- The builder renders **all 7** node kinds including **`mapFields`**; `countFlow` reflects each.
- _(Remove any "percentage / A/B split" language — that is an explicitly deferred, separate additive feature per `r11 §1`.)_

**SCRUM-549 — add:**
- All **12** `TRIGGER_CATS` categories render with their triggers + hints.
- Non-live triggers render **disabled with a "Coming soon" affordance** and cannot be selected; only live triggers are pickable.

**SCRUM-554 — replace the count AC:**
- **Every** seeded recipe (all 14 in `AUTO_TEMPLATES`) navigates with `nav.recipe` and the builder pre-populates that recipe's **trigger + node steps**; none falls through to the default flow.
- An unknown recipe name shows an error toast, not a silent default.

**SCRUM-556 — correct the status AC:**
- "Save as draft" persists `status:'draft'`; "Save" persists `status:'active'` **when the Active toggle is on**, else `status:'paused'` — via an **explicit parameter** (e.g. `asDraft`/`activate`), **not** by inspecting the toast text.

**SCRUM-609 — add:**
- If an automation-level frequency cap is introduced, its relationship to the existing workspace `SettingsFrequencyPage` and per-sequence caps is defined (extend vs separate), and the persisted shape is reconciled with `WORKSPACE_FREQ_CAP`.

**SCRUM-250 — add:** Export CSV produces a real downloadable CSV (reusing `exportCsv`), backed by **SCRUM-603**.

---

## 8. Missing UX Behaviours

| Behaviour | Status in tickets | Design evidence / note |
|---|---|---|
| Sparkline accessibility (aria/text alt) | ✅ Required by SCRUM-250 | Design lacks it (`MiniSparkA` L14493) — ticket is ahead |
| "Coming soon"/disabled trigger state | ❌ Not in any ticket | `disabled={!live}` L15011 — **add to 549** |
| Router per-path rule summaries on canvas | ❌ Not in 143 | `r11 §1` — **add to 143** |
| `beforeunload` guard on dirty builder | ✅ Required by SCRUM-556 | Design has in-app guard only (no beforeunload) — ticket is ahead |
| Responsive / mobile layouts | ⚠ Thin in FE tickets | **Mitigated:** covered by mobile tickets SCRUM-558/559/560. Web components should still be responsive (design flags 500px Test panel, 560px log modal, step-strip wrapping) |
| Toast/optimistic feedback on toggle | ✅ SCRUM-251 | Design toggle is optimistic-in-store but non-reconciled |
| Focus-trap / Esc on modals/drawers | ✅ Present across 551/552/553/556 | Good |

---

## 9. Missing Business Rules

| Rule | In tickets? | Design evidence |
|---|---|---|
| Duplicate creates a **paused** "Copy of" clone | ✅ 250 | L21392 |
| Draft has no toggle/enrolled/logs | ✅ 250/251 | `{!isDraft&&…}` L21447 |
| Admin gate is runtime JS, **not** an auth boundary; BE must enforce | ✅ 251 | Dev Q&A / `settingsIsAdmin()` |
| Router: first-match wins, "Everyone else" catches the rest, no record dropped | ❌ **Not in 143** | `autoRunNodes` L20994 |
| Disqualify-wins / order-dependent qualification rules | N/A here | §10.7 → SCRUM-555 (calendar) |
| **Partial execution / no rollback** on mid-flow failure | ❌ Not surfaced | Dev Q&A: steps 1–2 stay executed when step 3 fails. Mostly BE (resume/idempotency = SCRUM-548/761), but the log copy "Step N failed" could imply a clean stop. Low priority — consider a note in 552 |
| Frequency-cap window semantics (per-channel day/week vs `windowHours`) | ⚠ Conflicting | `WORKSPACE_FREQ_CAP` L26164 vs SCRUM-609 shape |

---

## 10. Suggested Ticket Improvements (concise, per ticket)

- **SCRUM-143:** Correct the `branch` model to the router semantics; add `mapFields` (7th kind); add the router config-panel scope + AC; fix the `FlowCfgProvider` prop description; note that `index.html` (not the handoff canvas) is the reference implementation; add a line on action-node config forms.
- **SCRUM-250:** Cite **SCRUM-603** for the log/CSV endpoint; note Export CSV is currently a toast stub; de-literalise "389 runs".
- **SCRUM-251:** No change — accurate. (Optionally cross-link the `<fieldset>` fix to 143's canvas.)
- **SCRUM-549:** Raise categories 8 → 12; add the trigger-liveness/"Coming soon" behaviour + AC; resolve the client-vs-BE catalog assumption.
- **SCRUM-550:** Cross-reference the `mapFields` node (MR-1) as the downstream consumer.
- **SCRUM-551:** Clarify that the searchable picker and server dry-run are net-new vs the prototype (which shows first-3 records, client-only); keep everything else.
- **SCRUM-552:** No change — accurate. (Optional: note partial-execution wording.)
- **SCRUM-553:** Add the 5th `failed` enrollment state; cite **SCRUM-604** and **SCRUM-605**.
- **SCRUM-554:** Fix counts (14 templates, not 3); rewrite AC to "all recipes wired"; add a sub-task to author the 13 recipes' node steps.
- **SCRUM-556:** Rewrite the premise (status already differs via toast-sniff) and the status AC (explicit `asDraft`; Save → active-or-paused); reference the Sequence builder's `asDraft` pattern (L20407).
- **SCRUM-557:** Restate the premise ( `automations` is dead code, not a live duplicate); keep the shared-component + origin-aware-return goal; add "remove/repoint the dead route."
- **SCRUM-609:** Add a reconciliation step with `SettingsFrequencyPage`; split clearly into "quiet-hours schedule (net-new)" and "frequency cap (extend existing)"; attach a design mock since none exists.

---

## 11. Proposed New Jira Tickets

> Only where the work is genuinely separable from an existing ticket. The rest are folded in via §10.

**NEW-1 — FE: `mapFields` webhook field-mapping node**
- **User story:** As an admin, I want a "Map fields" node so that fields captured from an inbound webhook populate downstream steps.
- **Business value:** Completes the webhook automation path (SCRUM-550 captures fields but nothing consumes them).
- **Functional requirements:** Add the `mapFields` kind to the builder (it exists in `LOGIC_PRESETS_A` L14254); config maps captured webhook field pills → CRM fields; renders as a `NodeTile`; counted by `countFlow`.
- **AC:** Node appears in the logic-node picker; mapping rows add/remove; a webhook-triggered flow can map ≥1 field and reference it in a later step; loading/empty/error + a11y states.
- **Dependencies:** SCRUM-143 (FlowList), SCRUM-550 (webhook capture), SCRUM-541 (BE provisioning).
- **Priority:** Medium · **Labels:** `nrtur-sprint-3.1`, FE · **Estimate:** 3 pts.

**NEW-2 — FE: Trigger liveness / "Coming soon" states in TriggerPicker** _(or fold into SCRUM-549)_
- **User story:** As an admin, I want unavailable triggers clearly marked so I only pick ones that actually fire.
- **Functional requirements:** Consume `AUTO_LIVE_TRIGGERS` (L14446); render non-live triggers disabled with a "Coming soon" affordance (`disabled={!live}` L15011); live triggers selectable.
- **AC:** Non-live triggers are non-selectable and visibly marked; live set is accurate to the registry (BE SCRUM-248); a11y state on disabled items.
- **Priority:** Medium · **Estimate:** 2 pts.

**NEW-3 — Spike/Decision: Reconcile automation guardrails with `SettingsFrequencyPage`**
- **Goal:** Decide whether SCRUM-609's automation frequency cap **extends** the existing workspace frequency page (L19904) + per-sequence caps, or is a **separate** per-tenant control; define the single persisted model.
- **Output:** A one-page decision + updated SCRUM-609/608 payload shape. **Blocks:** SCRUM-609. · **Priority:** High (unblocks 609) · **Estimate:** 1–2 pts.

---

## 12. Risk Assessment

| Risk | Cause | Impact | Likelihood | Rating |
|---|---|---|---|---|
| **Wrong branch node built** | SCRUM-143 specifies "% or A/B split" vs the design's router | Core automation logic diverges from the built prototype and every mainstream CRM; rework + data-model churn | High (ticket reads as authoritative) | **High** |
| **Duplicate frequency-cap surface** | SCRUM-609 unaware of `SettingsFrequencyPage` | Two competing screens + conflicting data models for the same concept | Medium | **High** |
| **Missing `mapFields` node** | Omitted from 143; no other ticket | Webhook automations can't use their captured fields | Medium | **Medium** |
| **Developers "fix" non-defects** | Stale premises in 554/556/557 (counts, no-diff save, dead route) | Wasted effort; possible regressions when "unifying" dead code or re-plumbing a working save | Medium | **Medium** |
| **Incomplete trigger picker** | 549 lists 8 of 12 categories; ignores liveness | Payments/behavioral triggers absent; users try to pick non-firing triggers | Medium | **Medium** |
| **CSV export dependency mis-wired** | 250 cites 249 not 603 | FE blocked/points at the wrong endpoint | Low–Med | **Medium** |
| **Recipe wiring under-scoped** | 554 doesn't enumerate 13 recipes' steps | Estimate blows out mid-sprint | Medium | **Medium** |
| **Prototype-as-spec confusion for net-new bits** | 551 search + 609 quiet-hours have no prototype visuals | QA lacks a visual oracle; inconsistent build | Low | **Low** |
| **"Trace == live run agree" unverifiable in prototype** | 551 AC assumes a live engine that doesn't exist yet | AC can't be closed until SCRUM-545 lands | Medium | **Low** (sequencing) |

---

## 13. Prioritized Action Plan

**P0 — before any 143-family work is picked up**
1. **Fix SCRUM-143's branch model** to the router semantics; add `mapFields`; add the router config-panel scope/AC (§5, §7). This is the single highest-leverage correction.
2. **Resolve the guardrail duplication** (NEW-3): decide SCRUM-609 vs `SettingsFrequencyPage`; lock the persisted shape. Blocks 609.

**P1 — premise corrections (prevent wasted/rework)**
3. Re-baseline **SCRUM-554** (14 templates; "all wired"; add recipe-step sub-tasks).
4. Re-baseline **SCRUM-556** (explicit `asDraft`; correct status AC) and **SCRUM-557** (dead-route reality; keep shared-component goal).
5. Expand **SCRUM-549** (12 categories + liveness) — NEW-2 or inline.

**P2 — accuracy & completeness**
6. **SCRUM-250:** point CSV at SCRUM-603; de-literalise the stat line.
7. **SCRUM-553:** add `failed` state; cite SCRUM-604/605.
8. **SCRUM-551:** annotate search + server dry-run as net-new vs prototype.
9. File **NEW-1** (`mapFields`) if not folded into 143/550.

**P3 — hygiene**
10. Update `automations.md` §10.2/§10.3 to match the built router + real-record Test (retire the stale "A/B split" / "3 hard-coded contacts" language) so the spec and `index.html` stop disagreeing.
11. Add a one-line note to affected tickets: **"`index.html` is the reference implementation; the `pages/*.html` handoff exports are superseded."**

---

### Appendix A — Evidence index (key `index.html` symbols)

`FlowList` L14976 · `NodeTile` L14651 · `BranchSplit` L14694 · `makeNode` L14464 · `STEP_PRESETS_A` L14222 · `LOGIC_PRESETS_A` L14251 (incl. `mapFields` L14254) · `countFlow` L14476 · `TRIGGER_CATS` L14363 (12 cats) · `AUTO_LIVE_TRIGGERS` L14446 · `CondRow` L14570 · webhook drawer L15186–15190 · `AutomationTestModal` L15044 · `simulateFlow` L15026 · trace `ICON` L15069 · `save()` L15118 · `dirty` L15109 · `readOnly` L15090 · `AUTO_ST` L20853 · `SettingsAutomationsPage` L21372 · list card L21444–21459 · fake CSV toast L21469 · `AutomationLogModal` L21185 · `EnrolledContactsModal` L21250 · `EngagementModal` L21293 · `AUTO_TEMPLATES` L21342 (14 recipes) · `useTemplate` L21394 · `toggleAuto` L21391 · dead `AutomationsPage` L14499 (comment L14489) · `SettingsFrequencyPage` L19904 · quiet-hours toggle L20660 · `qualEvaluate` L22809 / `EventTypeDrawer` L23108 (§10.7 → SCRUM-555).

### Appendix B — Epic SCRUM-130 backlog (dependency map)

FE (this sprint): 143, 250, 251, 549, 550, 551, 552, 553, 554, 556, 557, 609.
BE dependencies (all exist): 544 (CRUD/lifecycle), 542 (node semantics), 248 (trigger registry), 541 (webhook provisioning), 545 (server dry-run), 249 (logging/stats), 543 (enrollment/engagement APIs), 547 (template library), 540 (action executors), 603 (log CSV export), 604 (link-wrap), 605 (realtime enrollment), 606 (channel gating, email-only), 608 (guardrail config store), 548 (guardrail enforcement), 142 (shared step-runner), 759–766 (schema, versioning, sender, kill-switches, fairness, reconciler, rollups, River spike).
Adjacent (correctly outside this sprint): **555** (FE AI qualification, `calendar-scheduling`), **546** (BE qualification engine).
Mobile (separate): 558 (list), 559 (enrolled+engagement), 560 (run-log).
