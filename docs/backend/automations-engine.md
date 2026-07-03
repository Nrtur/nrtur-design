# Sub-spec: Automations Engine

_Detailed request/response schemas and the durable-worker design for the Automations module. Companion to [BACKEND_SPEC.md](../../BACKEND_SPEC.md) §2.7, §4, §7, §10. Grounded in the prototype's automation runtime (`index.html`, `main`) — the `AUTOMATION RUNTIME` block (~L17211), `fireDealAutomationEvents`/`dealCondPass`/`runDealAutomations` (L17221–17253), `AUTO_INIT`/`AUTO_LOGS`/`STEP_PRESETS_A`/`LOGIC_PRESETS_A`/`TRIGGER_CATS` (L11707–11905, L17185–17210), `retroRunAutomation` (L8120), and the handoff functions `pipelineHandoffsFiring`/`handoffPatch`/`applyHandoffs`/`fireHandoffs` (L8355–8994)._

Conventions: JSON over HTTPS; `Authorization: Bearer <token>`; every request is workspace-scoped from the token; timestamps ISO-8601 UTC; money in integer **minor units**; server UUIDv7 ids; error bodies `{ "error": { "code", "message", "details" } }`.

**Reality check on the prototype.** The engine is genuinely wired for the three deal paths (`Deal created`, `Deal moved to <stage>`/`Deal won`/`Deal lost`, `Deal value changed`) — those emit events, evaluate `cond`, and produce real side-effects (a follow-up task, a ⚡ timeline entry, an incremented run count, a Logs row). **Everything else is simulated or not yet emitted**: `cond` is a single money-string regex (`dealCondPass`); flow steps are counted (`countFlow`) and rendered but **never executed** — `fireDealAutomationEvents` looks only at `steps[].label`, so a real send/wait/branch does nothing; `waits`/`branches`/`goals` are builder-only; contact/payment/invoice/tag/schedule triggers exist in `TRIGGER_CATS` but **nothing fires them**; `runs`/`success`/`spark`/`lastRun` are seeded display numbers; and catch-up (`retroRunAutomation`) writes logs synchronously with no queue. This sub-spec specifies what the real backend must do at each of those seams and marks every "prototype SIMULATES this" boundary explicitly.

---

## 1. Persistence schema (Postgres-flavoured)

```sql
-- The automation definition (the prototype's AUTO_INIT row shape, made durable).
automation (
  id            uuid pk,
  workspace_id  uuid not null,                 -- tenancy; every query filters on this
  name          text not null,
  trigger       text not null,                 -- one of the TRIGGER_CATS strings, see §4
  trigger_config jsonb null,                   -- resolved trigger params (stage_key, tag, schedule cron, threshold…) — see §4.2
  status        text not null default 'draft', -- active | paused | draft | error  (AUTO_ST keys)
  cond          jsonb null,                    -- structured condition AST (§6). Legacy string kept in cond_legacy.
  cond_legacy   text null,                     -- e.g. "Deal value > $20k" — original prototype cond string, migrated once
  steps         jsonb not null default '[]',   -- flow tree: action/condition/branch/wait/waitUntil/goal nodes (§5)
  folder_id     uuid null,                     -- FolderedCards grouping (surface="automations")
  runs          bigint not null default 0,     -- authoritative counter (was a seeded display number)
  success_num   bigint not null default 0,     -- successful runs — success% = success_num/runs (prototype stored a bare %)
  last_run_at   timestamptz null,              -- ISO; prototype stored "12m ago" strings
  err_step      text null,                     -- "Step 3: Email invalid address" — last failing step label
  created_by    text, created_at timestamptz, updated_at timestamptz,
  archived      bool default false, deleted_at timestamptz null, deleted_by text null
);
-- One durable run per (automation, subject, trigger-instance). The queue worker owns this table.
automation_run (
  id            uuid pk,
  workspace_id  uuid not null,
  automation_id uuid not null references automation,
  subject_type  text not null,                 -- deal | contact | company | lead | custom | payment | invoice
  subject_id    uuid not null,
  trigger       text not null,                 -- the matched trigger string (denormalized for the log query)
  event_id      uuid not null,                 -- the emitted event that spawned this run (idempotency key, see §3)
  status        text not null,                 -- queued | running | success | warning | failed | skipped
  skip_reason   text null,                     -- "condition not met" | "suppressed" | "duplicate" — when status=skipped
  steps_total   int not null,                  -- nodes on the executed path (NOT tree total) — matches "3/3" render
  steps_reached int not null default 0,        -- steps completed before terminal/failure — matches "2/3"
  err_step      text null,                     -- failing node label, mirrored onto automation.err_step
  err_detail    text null,                     -- provider/validation message
  attempt       int not null default 0,        -- retry counter (§3)
  scheduled_at  timestamptz null,              -- next runnable time (waits/delays park here)
  started_at    timestamptz null, finished_at timestamptz null,
  created_at    timestamptz not null default now(),
  unique (workspace_id, automation_id, subject_id, event_id)   -- idempotency (§3)
);
-- Per-step execution trace inside a run (powers the run-detail drilldown; the prototype only rendered a summary row).
automation_run_step (
  id uuid pk, run_id uuid references automation_run, workspace_id uuid,
  node_id text,                                -- flow-tree node id (makeNode's id)
  kind text,                                   -- action | condition | branch | wait | waitUntil | goal
  label text,                                  -- STEP_PRESETS_A.label, e.g. "Send proposal"
  branch_taken text null,                      -- "yes" | "no" | lane label — for condition/branch nodes
  status text,                                 -- success | skipped | failed | waiting
  detail text null, at timestamptz
);
-- Cross-pipeline handoff rules live ON the pipeline (see deals sub-spec §1), enforced by this engine:
-- pipeline.handoffs jsonb = [{id, whenStageKey, mode:'enroll'|'move', toPipelineId, toStageKey}]
```
**Indexes:** `automation(workspace_id, status, trigger)` (the hot dispatch lookup — `fireDealAutomationEvents` filters `status==='active' && trigger∈events`); `automation_run(workspace_id, automation_id, created_at desc)` (run-log query); `automation_run(status, scheduled_at)` **partial** `WHERE status IN ('queued','waiting')` (the worker's poll); `automation_run(workspace_id, subject_type, subject_id)` (timeline lookups); `automation_run_step(run_id)`.

---

## 2. Resource shapes (API representation)

### 2.1 Automation

```jsonc
{
  "id": "0191c…",
  "name": "Proposal Follow-Up",
  "trigger": "Deal moved to Proposal",       // exact TRIGGER_CATS string
  "triggerConfig": { "stageKey": "proposal", "pipelineId": "0191…" },  // resolved params (§4.2)
  "status": "active",                        // active | paused | draft | error
  "cond": {                                  // structured AST (§6); null = always runs
    "op": "AND",
    "rules": [ { "field": "Deal value", "op": "greater than", "value": 2000000 } ]  // minor units
  },
  "condLegacy": "Deal value > $20k",          // original string, display-only after migration
  "steps": [ /* flow tree, §5 */ ],
  "runs": 91,                                 // authoritative counter
  "success": 97,                              // computed: round(success_num/runs*100)
  "lastRun": "2026-07-03T10:14:22Z",          // ISO (prototype rendered "1h ago")
  "errStep": null,                            // "Step 3: Email invalid address" when status=error
  "spark": [2,3,1,4,5,3,6,4,7,5,8,6,9,7],     // 14-bucket run sparkline — server-aggregated from automation_run
  "folderId": null,
  "createdAt": "…", "updatedAt": "…", "archived": false
}
```
The four `AUTO_ST` statuses (`active`/`paused`/`error`/`draft`) are the only legal values; `draft` and `paused` never dispatch (`fireDealAutomationEvents` matches `status==='active'` only).

### 2.2 Flow node (a `steps[]` element — from `STEP_PRESETS_A` + `LOGIC_PRESETS_A` + `makeNode`)

```jsonc
// action node (STEP_PRESETS_A.* + ACTION_DEFAULTS[key])
{ "id":"7_a3f2", "kind":"action", "key":"proposal", "label":"Send proposal",
  "config": { "template":"Proposal" } }                       // ACTION_DEFAULTS.proposal
// condition node (LOGIC_PRESETS_A.condition + makeNode defaults) — the yes/no branch
{ "id":"8_b1c9", "kind":"condition", "field":"Deal value", "op":"greater than", "value":"10",
  "yes":[ /* nodes */ ], "no":[ /* nodes */ ] }
// branch node (LOGIC_PRESETS_A.branch) — N lanes
{ "id":"9_c7", "kind":"branch", "lanes":[ {"id":"…","label":"Path A","nodes":[…]},
                                          {"id":"…","label":"Path B","nodes":[…]} ] }
// wait / waitUntil / goal
{ "id":"a_2","kind":"wait","delay":{ "n":2, "unit":"days" } }  // DELAY_UNITS
{ "id":"a_3","kind":"waitUntil","field":"Status","op":"is","value":"Customer","timeoutDelay":{"n":7,"unit":"days"} }
{ "id":"a_4","kind":"goal","field":"Status","op":"is","value":"Customer" }
```
`kind` ∈ `action|condition|branch|wait|waitUntil|goal|mapFields`. Action `key` ∈ the 30 `STEP_PRESETS_A` keys (`assign, welcome, sms, task, proposal, slack, reminder, scheduleMeeting, reengage, flag, celebrate, report, updateField, addTag, removeTag, webhook, createLead, convertLead, createCompany, createDeal, enrollSms, enrollEmail, enrollSmartList, removeSmartList, sendPush, sendInApp`). Send-type actions (`welcome, sms, proposal, reengage, enrollSms, enrollEmail, sendPush, sendInApp`) **defer to §6 of the main spec** (transport + suppression) — the server, never the client, decides whether a send actually goes out.

### 2.3 Run-log row (the `autoLogs` shape the UI renders — L17185, L17239)

```jsonc
{
  "id":"0191…", "auto":"Proposal Follow-Up",
  "subject": { "type":"deal", "id":"0191…", "name":"James Rivera", "avatar":"JR", "color":"#6366f1" },
  "status":"success",                         // success | warning | failed  (LOG_ST keys) — plus "skipped" (§6)
  "steps":"3/3",                              // steps_reached/steps_total
  "errStep":"Step 3: Email invalid address",  // present only when status=failed
  "at":"2026-07-03T10:14:22Z"                 // prototype rendered "1h ago"
}
```
The prototype's `contact` field is generalized to `subject{type,id,name,avatar,color}` because runs now fire on contacts/companies/leads/payments too, not just deals.

---

## 3. The durable async run worker

The prototype fires **synchronously inside a React setState** (`fireDealAutomationEvents` runs during `applyMove`). The backend replaces this with a queue so a slow send or a 30-day wait never blocks the triggering write.

**Pipeline:** `event bus (§4) → dispatch → automation_run rows (queued) → worker → step execution (§5) → log`.

1. **Dispatch (transactional with the trigger).** When a domain write emits an event (§4), inside the **same transaction** the server selects `automation WHERE status='active' AND trigger=<event.trigger> AND workspace_id=<ws>` (the hot index) and inserts one `automation_run` per match with `status='queued'`, `event_id=<event.id>`. The `unique(workspace_id, automation_id, subject_id, event_id)` constraint makes dispatch **idempotent** — a retried or double-delivered event inserts nothing new. This mirrors the prototype's `matched=automations.filter(a=>a.status==='active' && events.indexOf(a.trigger)>=0)` (L17231) but persists the intent before doing the work.
2. **Condition gate (§6).** The worker loads the run, evaluates `automation.cond` against the live subject. Fail → `status='skipped'`, `skip_reason='condition not met'`, and it **still writes a timeline event and a log row** (the prototype's `skipped.forEach(...)` at L17241 does exactly this: a `field`-type activity "Automation … did not run — Condition not met"). Pass → proceed. Missing/unparseable `cond` **fails open** (runs), matching `dealCondPass` returning `true` on no-match (L17224).
3. **Execute the flow tree (§5).** Walk `steps[]`; a `wait`/`waitUntil` parks the run: set `status='waiting'`, `scheduled_at=now()+delay`, and re-enqueue — the worker polls the partial index. Send steps call §6 (suppression-checked) and may resolve async via provider webhook.
4. **Retries & idempotency.** A failed step increments `attempt` and re-schedules with exponential backoff (cap ~5 attempts). Retries are safe because every side-effect is keyed: sends carry a dedup key `run_id:node_id`; task/activity writes upsert on the same key. This is the durable version of the note in main spec §7 ("retries are idempotent").
5. **Terminal states.** `success` (reached the last node on the path), `warning` (completed but a non-critical step soft-failed — the prototype seeds `warning` runs at L17189/17193), `failed` (a critical step exhausted retries → set `automation.status='error'` and `automation.err_step` = the node label, exactly the `AUTO_INIT` id:7 `errStep:'Step 3: Email invalid address'` pattern, L17204). On success, `automation.runs += 1`, `success_num += 1`, `last_run_at=now()` — the authoritative version of `setAutomations(...{runs:(x.runs||0)+1,lastRun:'Just now',success:...})` (L17238).

**Metrics.** `success% = success_num/runs`. `steps` render (`"2/3"`) = `steps_reached/steps_total` where `steps_total` counts nodes on the **taken** path, not the whole tree (`countFlow` at L11905 counts the tree for the builder summary, but a run only touches one branch). `spark[14]` is a server aggregate of runs bucketed over the trailing window.

---

## 4. The trigger event bus

### 4.1 Event payload (what the bus emits)

```jsonc
{
  "id": "0191…evt",              // UUIDv7 — the idempotency key carried into automation_run.event_id
  "workspaceId": "0191…",
  "trigger": "Deal moved to Proposal",   // MUST equal an automation.trigger string to match
  "subject": { "type":"deal", "id":"0191…" },
  "at": "2026-07-03T10:14:22Z",
  "payload": { "fromStageKey":"discovery", "toStageKey":"proposal", "pipelineId":"0191…" }
}
```
Matching is **exact string equality** on `trigger` (the prototype's `events.indexOf(a.trigger)>=0`, L17231). Stage triggers are therefore stage-name-baked: moving to "Proposal" emits both `"Deal stage changed"` and `"Deal moved to Proposal"` (see `runDealAutomations` at L17247 pushing `['Deal stage changed','Deal moved to '+toName]`, plus `'Deal won'`/`'Deal lost'` when the target is terminal).

### 4.2 What emits each trigger (the wiring the backend must add)

| Trigger string (from `TRIGGER_CATS`) | Emitting write | `payload` | Prototype status |
|---|---|---|---|
| `Deal created` | `POST /deals` | `{pipelineId,stageKey}` | **Wired** — `runDealCreatedAutomations` (L2408, deferred so the deal is in state first) |
| `Deal stage changed`, `Deal moved to <stage>`, `Deal won`, `Deal lost` | `POST /deals/{id}/move`, `/close` | `{fromStageKey,toStageKey,pipelineId}` | **Wired** — `runDealAutomations` via `applyMove`/`commitStage`/outcome confirm (L8361) |
| `Deal value changed` | `PATCH /deals/{id}` when `amount` changes | `{oldAmount,newAmount}` | **Wired** — `runDealValueAutomations` (L8819), guarded by `parseMoney` diff |
| `Deal inactive 7 days` | scheduler sweep (no activity on an open deal for N days) | `{days}` | **Simulated** — seeded `AUTO_INIT` id:5 only; nothing sweeps. Backend: nightly job over `deal.lastActivity`. |
| `Contact created`, `Contact updated`, `Status changed` | `POST/PATCH /contacts` | changed fields | **Not emitted** — automations exist (`AUTO_INIT` id:1,9700) but no contact write fires the bus. Backend must emit. |
| `Tag added`, `Tag removed`, `Tag added: <tag>` | tag mutation on any subject | `{tag,subjectType}` | **Not emitted.** `triggerConfig.tag` scopes it (e.g. `Cold Lead Nurture` = `Tag added: cold-lead`, L17203). |
| `Lead created`, `Lead qualified`, `Lead converted`, `New ad lead received` | `POST /leads`, `/convert`, ad-webhook ingest | `{leadId,source}` | **Not emitted** — `Speed-to-lead` (id:9501) listens but no ingest exists. |
| `Payment received`, `Payment failed`, `Subscription past-due`, `Invoice overdue`, `Invoice sent` | Stripe webhook + invoice-due sweep | `{invoiceId,amount}` | **Simulated** — payments module is Stripe-first but simulated; `Payment Received → Onboarding` (id:9) and `Invoice Reminder` (id:7) listen. Backend wires real webhooks (main §10). |
| `Meeting booked`, `Appointment booked/…/no-show`, `Form submitted`, `Task overdue` | scheduling/forms/tasks writes | subject refs | **Not emitted.** |
| `Scheduled` / `Every Monday 8am`, `Date field reached` | cron/scheduler | `{cron}` or `{dateField}` | **Simulated** — `Weekly Pipeline Digest` (id:4). See §8. |
| `Custom record created/updated/stage changed` | custom-object writes | `{objectId}` | **Not emitted.** |

`triggerConfig` holds the resolved parameters a bare string can't: which stage/pipeline for `Deal moved to <stage>`, which tag for `Tag added: <tag>`, the cron for `Scheduled`, the threshold for `Lead score reached`, the `N` for `Deal inactive N days`. The prototype smuggles some of these into the trigger string itself (`"Deal moved to Proposal"`, `"Tag added: cold-lead"`, `"Deal inactive 7 days"`); the backend keeps the display string but persists the machine-readable params in `trigger_config`.

---

## 5. Flow-tree execution

The prototype **builds and counts** the tree (`makeNode` L11893, `countFlow` L11905) but **executes nothing** — `fireDealAutomationEvents` only reads `steps[].label` to decide whether to spawn a task (`/task|remind|follow/i` at L17236) and to write the "steps: N/N" log. The backend must actually walk it:

```
execute(nodes, subject, run):
  for node in nodes:
    record automation_run_step(run, node)
    switch node.kind:
      action     → dispatch action (§5.1); send-types go through §6 suppression
      condition  → if evalCond(node, subject): execute(node.yes,…) else execute(node.no,…)   # yes/no lanes
      branch     → pick lane by node's routing (or run all lanes), execute(lane.nodes,…)
      wait       → park run: scheduled_at = now()+node.delay; return (worker resumes)          # DELAY_UNITS
      waitUntil  → park until evalCond(node) true OR node.timeoutDelay elapses
      goal       → if evalCond(node) already met, mark run success and STOP (early exit)
```
- **Only one branch of a `condition` executes** — so `steps_total` for the log is the count of nodes on the path actually taken, and `automation_run_step.branch_taken` records `"yes"`/`"no"`/lane label. `evalCond` on condition/`waitUntil`/`goal` nodes reuses the **same AST evaluator** as §6 (the node carries `{field, op, value}`, e.g. `makeNode(condition)` defaults to `field:'Deal value', op:'greater than', value:'5'`, L11895).
- **`wait`/`waitUntil` are the only reason runs are long-lived.** They set `automation_run.status='waiting'` + `scheduled_at`; the worker's partial index resumes them. `waitUntil` also carries a `timeoutDelay` (default `{n:7,unit:'days'}`, L11898) so it can't hang forever.
- **Action semantics** (`ACTION_DEFAULTS`, L11772): `assign`→set owner (`Round-robin`/`Deal owner`/rep); `task`/`reminder`→create a calendar task (the prototype's `addTask` at L22434 — assignee/due from config); `updateField`→patch a field (fires its own Activity + may cascade to `Deal value changed`); `addTag`/`removeTag`→tag mutation (can re-enter the bus as `Tag added`); `webhook`→outbound HTTP; `enrollEmail`/`enrollSms`→create a sequence enrollment (main §6 eligibility check); `slack`/`celebrate`/`report`/`flag`→notification channels; `createLead`/`createDeal`/`createCompany`/`convertLead`→record creation. **Every action that the prototype logs to the timeline must emit an Activity event** (main §4, last line) — the ⚡ "Automation … ran" `sequence` activity at L17237 is the template.

---

## 6. The condition AST (generalizing `dealCondPass`)

The prototype's condition gate is one regex over one string: `dealCondPass(cond, deal)` (L17221) matches `/(?:deal value|amount|value)\s*(>=|<=|>|<|=)\s*\$?([\d.,]+)(k|m)?/`, compares against `deal.amount ?? parseMoney(deal.value)`, and **fails open** (returns `true`) on anything it can't parse. It only understands money on deals. The backend generalizes this to a structured AST while preserving fail-open and the money-comparison behaviour verbatim.

```jsonc
// automation.cond — recursive AND/OR groups of leaf rules
{
  "op": "AND",                    // AND | OR
  "rules": [
    { "field": "Deal value", "op": "greater than", "value": 2000000 },   // minor units
    { "op": "OR", "rules": [
        { "field": "Lead status",  "op": "is",     "value": "Qualified" },
        { "field": "Lead score",   "op": "greater than", "value": 80 } ] }
  ]
}
```
- **Fields** come from `AUTO_COND_FIELDS` (L11745): `Status, Owner, Tag, Health score, Has open deal, Deal value, Last contacted, Lead status, Lead source, Lead score, Company type, Company industry`. **Operators** come from `AUTO_FIELD_OPS`/`FIELD_OPS` (`is, is not, greater than, less than`, L11747–11749); **value vocabularies** from `AUTO_FIELD_VALUES` (`LEAD_STATUSES, LEAD_SOURCES, COMPANY_TYPES, INDUSTRIES`, L11748). Money fields carry integer minor units on the wire (the prototype's `k`/`m` suffix parsing collapses into a normalized integer).
- **Migration of `cond_legacy`:** every seeded string (`"Deal value > $20k"`, `"Deal value > $10k"`, `"No reply in 7d"`) is parsed once into the AST. Money strings map cleanly via the `dealCondPass` regex; non-money strings the regex couldn't parse (`"No reply in 7d"` on `AUTO_INIT` id:5) **fail open today** — the backend must either model them as real conditions (a `No reply in N days` rule) or preserve fail-open. Do not silently start blocking runs that used to pass.
- **Condition vs. branch — two distinct roles.** `automation.cond` is the **enrollment gate** (evaluated once in §3 step 2; failure = the whole run is skipped-and-logged). A `condition` **node** inside `steps[]` (§5) is **in-flow branching** (evaluated mid-run; picks `yes`/`no`). They share the same leaf-rule evaluator but sit at different points.
- **Skipped-run logging is mandatory and user-visible.** On gate failure the backend writes exactly what the prototype writes (L17241): a `field`-category Activity on the subject — title `Automation "<name>" did not run`, body `Condition not met — <cond> (deal is <value>)` — and a run-log row with `status='skipped'`, `skip_reason='condition not met'`. This is the audit trail the UI's run-log modal and the "N skipped" toast (L17243) render.

---

## 7. Cross-pipeline handoffs

A handoff auto-enrolls or promotes a deal into **another** pipeline when it reaches a trigger stage — a pipeline-level rule, evaluated by this engine on the same stage-move event that fires stage automations. Rules live on `pipeline.handoffs` (deals sub-spec §1): `[{id, whenStageKey, mode:'enroll'|'move', toPipelineId, toStageKey}]`. The demo seed (L8955) is a won deal auto-enrolling into "Customer Onboarding" at Kickoff.

**Enforcement (mirrors `fireHandoffs`→`applyHandoffs`→`handoffPatch`, L8355–8994):** on a `POST /deals/{id}/move` that lands on `stageKey`, after stage automations dispatch, select `pipelineHandoffsFiring(sourcePipe, reachedStageKey)` = `handoffs.filter(h => h.whenStageKey===reachedStageKey && h.toPipelineId!=null)` (L8980) and apply each **against fresh deal state** (the prototype comment at L8981 is explicit: patch fresh so it never clobbers the stage change that triggered it):
- **`mode:'enroll'`** — append a non-primary `stagePlacement {pipelineId, stageKey, primary:false, at, history}`; **no-op if already enrolled** in the target (`handoffPatch` returns `null`, L8991). Placements **merge**, never replace (deals sub-spec §4.5).
- **`mode:'move'`** — promote the target pipeline to **primary** (value/forecast ownership moves; the old primary stays enrolled as `primary:false`), landing on `toStageKey` or the target's first real stage (L8986–8989).

Each fired handoff emits a ⚡ `sequence` Activity on the deal — `Pipeline handoff · <label>` / `Auto-triggered when the deal reached <stage> in <pipeline>` (L8357) — and surfaces in the move response alongside `automationsRun`.

```jsonc
// side-effects block returned by POST /deals/{id}/move (extends deals sub-spec §4.3)
{ "deal": { … },
  "automationsRun": ["Proposal Follow-Up"],
  "automationsSkipped": [ { "name":"New Lead Welcome Sequence", "reason":"condition not met" } ],
  "handoffs": [ { "mode":"enroll", "toPipelineId":"0192…", "toStageKey":"ob_kickoff", "label":"Enroll in Customer Onboarding · Kickoff" } ] }
```

---

## 8. Scheduled / cron triggers

The prototype has `Scheduled`/`Every Monday 8am` triggers in `TRIGGER_CATS` (L11855) and a seeded `Weekly Pipeline Digest` (`AUTO_INIT` id:4) but **no scheduler runs them** — `lastRun:'2d ago'` is a static string. The backend adds a scheduler component:
- `automation.trigger_config.cron` (e.g. `"0 8 * * MON"` for "Every Monday 8am") drives a durable cron. On fire, it emits a `Scheduled` event **per matching subject** (or one workspace-scoped run for digest-style automations that operate on an aggregate). `Date field reached` schedules a one-shot when a record's date field is set/edited; `Deal inactive N days` is a nightly sweep over `deal.lastActivity` emitting one event per stale open deal.
- Scheduled runs enter the **same** `automation_run` queue and honour the same `cond` gate, retries, and logging. Timezone is the workspace timezone.

---

## 9. Endpoints

All workspace-scoped; automations are an **admin/config surface** — creating/editing/activating requires an admin-tier role (`NAV_ADMIN_ROLES` = Owner/Admin per main §5.2); the run-log is readable by anyone who can read the subject.

### 9.1 List / get / create / update
- `GET /v1/automations?status=active&trigger=…&folderId=…&cursor=…` → `{ "automations":[…], "nextCursor":… }` (Automation shape §2.1). Powers the Settings automations grid (`FolderedCards surface="automations"`, L17519).
- `GET /v1/automations/{id}` → Automation §2.1 (includes the full `steps[]` tree).
- `POST /v1/automations` — body `{name, trigger, triggerConfig?, status?, cond?, steps?}`. New automations default `status:'draft'`, `runs:0`. Validates: `trigger` ∈ known set (or an inferable one via `TRIGGER_META`'s keyword fallback, L11878); `steps[]` is a well-formed tree (every `condition` has `yes`/`no`, every `branch` has `lanes`); `cond` is a valid AST.
- `PATCH /v1/automations/{id}` — partial. Editing `steps`/`trigger`/`cond` does **not** retroactively re-run — that's the explicit catch-up endpoint (§9.4).

### 9.2 Activate / pause — `POST /v1/automations/{id}/status` `{ "status":"active"|"paused"|"draft" }`
The single most consequential toggle: only `active` dispatches. Mirrors the prototype toggle (`StageAutomationModal` sets `status:'active'|'paused'`, L8219). Flipping to `active` starts dispatching on **future** events only — existing in-stage records are unaffected unless catch-up (§9.4) is run. 404 if outside scope; `422 INVALID_STATUS` for a value outside the four `AUTO_ST` keys.

### 9.3 Manual run — `POST /v1/automations/{id}/run` `{ "subjectType":"deal", "subjectIds":["0191…"] }`
Enqueues one `automation_run` per subject **bypassing the trigger match** (you're forcing it) but **still honouring the `cond` gate** and full flow execution. Returns `{ "queued": 3, "runIds":[…] }`. `event_id` is a fresh UUID so idempotency still holds per invocation.

### 9.4 Retroactive catch-up — `POST /v1/automations/{id}/catch-up` `{ "pipelineId":"…", "stageKey":"…" }`
The "run for N deals already here" action (`retroRunAutomation`, L8120; `StageAutomationModal` button L8243). Stage triggers only fire on **entry**, so deals already sitting in the stage never ran the rule. This endpoint resolves the records **currently** matching the automation's trigger scope (e.g. all open deals in `stageKey`), and enqueues a run for each — same queue, same `cond` gate, same execution. The prototype does this synchronously with no condition check and a "(catch-up)" timeline note (L8125); the backend runs it as a **bounded batch job** through the worker.
```jsonc
// 200
{ "matched": 6, "queued": 6, "jobId":"0191…" }   // prototype's "Run for 6 deals now"
```
Response toast mirrors L8129 (`"⚡ <name>" ran for N deals`). Runs increment `automation.runs` by the batch size (L8128), each stamped `status='success'` on completion.

### 9.5 Run-log query — `GET /v1/automations/{id}/runs?status=…&cursor=…`
Powers `AutomationLogModal` (L17270) and the Settings global log (L17488, which shows live runs first then seeded history). Returns run-log rows (§2.3) newest-first, filterable by `status` (`All|Success|Warning|Failed`, plus `Skipped`), with per-run failure detail (`errStep`). Aggregates for the modal header (`runs`, `success%`, `nFail`, `nWarn`) come from the same query.
- `GET /v1/automations/{id}/runs/{runId}` → the full `automation_run` + its `automation_run_step[]` trace (the drilldown the prototype couldn't render because it never executed steps).
- `GET /v1/automations/runs?subjectType=deal&subjectId=…` → all runs touching one record, for its Activity timeline.

---

## 10. Error codes (this module)

| HTTP | code | when |
|---|---|---|
| 403 | `FORBIDDEN` | non-admin role attempts create/update/activate/catch-up |
| 404 | `NOT_FOUND` | automation outside workspace scope (don't leak existence) |
| 422 | `INVALID_TRIGGER` | `trigger` not a known/inferable trigger string |
| 422 | `INVALID_STATUS` | status not in `active|paused|draft|error` |
| 422 | `INVALID_FLOW` | malformed `steps[]` tree (condition missing yes/no, branch missing lanes, unknown action key) |
| 422 | `INVALID_CONDITION` | `cond` AST references an unknown field/op or a value outside the field's vocabulary |
| 409 | `CATCHUP_IN_PROGRESS` | a catch-up batch for this automation+stage is already running |
| 409 | `AUTOMATION_ERRORED` | manual run/activate on an automation in `error` status without clearing `errStep` |

---

## 11. What the client stops doing (migration mapping)

Once these endpoints exist, the in-browser runtime dissolves into the worker:

| Prototype function / seam | Replaced by |
|---|---|
| `fireDealAutomationEvents(deal, events)` (L17229) — synchronous match+fire inside setState | Event bus (§4) → dispatch → queue (§3). The trigger write just emits an event; it no longer runs automations inline. |
| `dealCondPass(cond, deal)` (L17221) — money-string regex, fail-open | The condition AST evaluator (§6). The regex becomes the migration parser for `cond_legacy`. |
| `runDealAutomations` / `runDealCreatedAutomations` / `runDealValueAutomations` (L17246–17253) | The deal move/create/patch endpoints emit `Deal moved to <stage>`/`Deal won`/`Deal lost`/`Deal created`/`Deal value changed` events (§4.2) — the engine matches them server-side. |
| `steps[].label` heuristics (`/task|remind|follow/i`, L17236) — the only "execution" | Real flow-tree execution (§5): every node runs, sends go through §6, waits park in the queue. |
| `retroRunAutomation(auto, deals)` (L8120) + `StageAutomationModal` "Run for N deals now" (L8243) | `POST /automations/{id}/catch-up` (§9.4) as a bounded worker batch. |
| `fireHandoffs`/`applyHandoffs`/`handoffPatch` (L8355–8994) run client-side during `applyMove` | The move endpoint applies handoffs server-side (§7); the client just renders the returned `handoffs[]`. |
| `runs`/`success`/`lastRun`/`spark` seeded display numbers (`AUTO_INIT`) | Authoritative counters + `automation_run` aggregates (§1, §3). |
| `autoLogs` in-memory array + seeded `AUTO_LOGS` (L17185, L22333) | `automation_run` rows served by `GET /automations/{id}/runs` (§9.5); the "live rows first, seeded after" merge (L17488) disappears — all rows are real. |
| `_autoRt` App-render registration (L22431) — the whole shim that let a browser fake a worker | Deleted. The worker **is** the backend. |

The engine's domain semantics are already proven in the prototype for the deal paths; the backend's job is to make dispatch durable, actually execute the flow tree, emit the not-yet-wired triggers (contact/tag/lead/payment/schedule), and enforce the `cond` gate + suppression that a browser can't be trusted to. Nothing about the automation model is redesigned.

_File written for review; not persisted to the repo by this task. Path if you want it saved: `C:\Users\Admin\Downloads\Nrtur_design\docs\backend\automations-engine.md`._
