# Sub-spec: Deals & Pipeline API

_Detailed request/response schemas for the Deals & Pipeline module. Companion to [BACKEND_SPEC.md](../../BACKEND_SPEC.md) §2.4, §2.5, §3.2–3.4, §4, §8. Grounded in the prototype's deal model (`main`, commit `2b49aca`)._

Conventions: JSON over HTTPS; `Authorization: Bearer <token>`; every request is workspace-scoped from the token; all timestamps ISO-8601 UTC; money is integer **minor units** (cents) on the wire, formatted client-side. IDs are server UUIDv7 strings. `4xx` bodies use `{ "error": { "code", "message", "details" } }`.

---

## 1. Persistence schema (Postgres-flavoured)

```sql
-- The deal (the primary pipeline owns value/forecast/outcome — see §3.2 of the main spec).
deal (
  id              uuid pk,
  workspace_id    uuid not null,               -- tenancy; every query filters on this
  name            text,
  company_id      uuid null references company,
  primary_contact_id uuid null references contact,
  owner_code      text not null references app_user(code),
  amount          bigint null,                 -- minor units; null allowed
  amount_type     text,                        -- One-time|ACV|TCV|ARR|MRR
  currency        char(3) default 'USD',
  probability     smallint null,               -- 0..100; NULL = derive from primary stage
  close_date      date null,
  next_action     text null,                   -- enum, see §4.3
  forecast_cat    text null,                   -- Pipeline|Best case|Commit|...
  source          text null,
  pipeline_id     uuid not null references pipeline,  -- PRIMARY pipeline
  stage_key       text not null,               -- PRIMARY stage
  stage_entered_at timestamptz not null,
  outcome         jsonb null,                  -- {result:won|lost, reason, note, closed_at, closed_by}
  ad_source_key   text null,
  created_by      text, created_at timestamptz, updated_at timestamptz,
  archived        bool default false,
  deleted_at      timestamptz null, deleted_by text null
);
-- Many-to-many: additional contacts with a role.
deal_contact ( deal_id uuid, contact_id uuid, role text, primary key(deal_id,contact_id) );
-- Multi-pipeline enrollment: one row per placement (the primary is is_primary=true).
stage_placement (
  id uuid pk, deal_id uuid references deal, pipeline_id uuid references pipeline,
  stage_key text, is_primary bool, entered_at timestamptz
);
-- Append-only per-placement stage history (powers funnel + time-in-stage).
stage_history ( id uuid pk, deal_id uuid, pipeline_id uuid, stage_key text, at timestamptz, by text );

pipeline (
  id uuid pk, workspace_id uuid, name text, object text default 'deal',
  access text[] null,        -- roles allowed; null/empty = everyone
  handoffs jsonb null,       -- [{when_stage_key, mode:enroll|move, to_pipeline_id, to_stage_key}]
  position int
);
stage (
  id uuid pk, pipeline_id uuid references pipeline, key text, name text, color text,
  prob smallint,             -- stage win %
  rot_days int null,         -- staleness threshold
  required text[] null,      -- field keys gated on entry
  move_roles text[] null,    -- roles allowed to move a deal IN (null/empty = everyone)
  position int
);
```
**Indexes** (from main spec §8): `(workspace_id, pipeline_id, stage_key)`, `(workspace_id, owner_code)`, `(workspace_id, company_id)`, `(workspace_id, primary_contact_id)`, `(workspace_id, close_date)`, GIN full-text on `name` + company name. `stage_placement(deal_id)`, `stage_history(deal_id, pipeline_id, at)`.

---

## 2. Deal resource shape (API representation)

```jsonc
{
  "id": "0191c…",
  "name": "Summit — Renewal",
  "company": { "id": "0191…", "name": "Summit Digital" },   // null if unlinked
  "primaryContact": { "id": "0191…", "name": "James Rivera" },
  "additionalContacts": [ { "id": "0191…", "name": "Sarah Chen", "role": "Decision maker" } ],
  "owner": { "code": "JK", "name": "Jamie Kim", "color": "#8b5cf6" },
  "amount": 3100000, "currency": "USD", "amountType": "ARR",
  "value": "$31k",                       // server-formatted convenience (redacted if role can't see amounts)
  "probability": 55,                     // effective %: deal override ?? primary stage prob
  "probabilitySource": "stage",          // "stage" | "manual"
  "closeDate": "2026-06-28",
  "nextAction": "Negotiate",
  "forecastCat": "Commit",
  "primary": { "pipelineId": "0191…", "stageKey": "proposal" },
  "placements": [                        // multi-pipeline enrollment (§3.2)
    { "pipelineId": "0191…", "stageKey": "proposal", "primary": true,  "enteredAt": "2026-06-20T…" },
    { "pipelineId": "0192…", "stageKey": "kickoff",  "primary": false, "enteredAt": "2026-06-25T…" }
  ],
  "stale": { "rotting": true, "days": 47, "threshold": 14 },   // computed
  "outcome": null,                       // {result,reason,note,closedAt,closedBy} once closed
  "tags": ["expansion"],
  "createdAt": "2026-02-10T…", "updatedAt": "…", "archived": false
}
```
**Sensitive masking (§5.4 main):** if the effective role lacks amount visibility, `amount`/`value` are omitted (not zeroed).

---

## 3. Board (the scale contract — closes the scorecard's biggest ✗)

The client must never load a whole pipeline. The board endpoint returns bounded, paged columns with **server-computed** counts and sums.

### `GET /v1/pipelines/{pipelineId}/board`
Query: `?view=<savedViewId>&filter=<b64 json>&sort=closeDate:asc&limit=25&collapseClosed=true`

Auth: 403 if `!pipeAccessible(pipeline)` for the role. Row-scope (§5.3 main) and per-pipeline access are applied as SQL predicates before paging.

```jsonc
// 200
{
  "pipeline": { "id":"0191…", "name":"Sales Pipeline" },
  "columns": [
    {
      "stage": { "key":"proposal", "name":"Proposal", "color":"#a78bfa", "prob":55,
                 "rotDays":14, "required":["amount","closeDate"], "moveRoles":[] },
      "totalCount": 1240,                 // server-computed — NOT the length of `cards`
      "totalValue": 4166000000,           // sum(amount) over the whole column, in minor units
      "weightedValue": 2291300000,        // Σ amount * (deal.probability ?? stage.prob)/100
      "collapsed": false,                 // terminal columns default collapsed
      "cards": [ /* first `limit` Deal cards (trimmed shape) */ ],
      "nextCursor": "eyJvIjoxLCJpZCI6..."  // null when exhausted
    }
    // ... one per stage; won/lost columns return collapsed:true with counts only (cards:[])
  ]
}
```
### `GET /v1/pipelines/{pipelineId}/stages/{stageKey}/cards?cursor=…&limit=25`
Loads the next page for one column (the "Show N more" / expand-collapsed action). Same auth + filter.

### `GET /v1/pipelines/{pipelineId}/forecast?mode=stage|date&period=…`
Server-computed weighted forecast (open-only, deal-prob overrides stage-prob, booked shown separately) and the close-date period view. Response is summaries, never raw rows.

---

## 4. Deal CRUD & domain operations

### 4.1 List / search
`GET /v1/deals?filter=…&sort=…&cursor=…&limit=50&q=summit`
Row-scope + `dealPipeAccessible` predicates applied (a role never sees deals in pipelines it can't access — §5.4 main). Full-text `q` searches name/company. Returns `{ "deals":[…], "nextCursor":… }`.

### 4.2 Get / create / update
- `GET /v1/deals/{id}` → Deal shape (§2). 404 if outside scope (indistinguishable from not-found — don't leak existence).
- `POST /v1/deals` — requires `Deals.create`. Body: `{name, companyId?, primaryContactId?, amount?, pipelineId, stageKey, closeDate?, …}`.
  **Stage gate (§3.4 main):** if `stageKey` has `required[]` fields unfilled → `409`:
  ```jsonc
  { "error": { "code":"STAGE_GATE", "message":"Missing required fields to enter Proposal",
               "details": { "stage":"proposal", "missing":["amount","closeDate"] } } }
  ```
  On success, stamps `stageEnteredAt` + first `stage_history` row, fires `Deal created` automations (§7 main).
- `PATCH /v1/deals/{id}` — requires `Deals.edit` (+ scope). Partial patch. Editing `amount` fires `Deal value changed` automations. Renames cascade denorm fields.

### 4.3 Move stage — `POST /v1/deals/{id}/move`
The most-guarded operation. Body: `{ "pipelineId":"0191…", "stageKey":"negotiation" }` (pipelineId identifies which *placement* to move — enrolled or primary).
Enforcement order:
1. `Deals.edit` + scope, else `403`.
2. `canMoveToStage(targetStage)` — per-stage move rights, else `403 MOVE_RIGHTS`.
3. Stage gate on the target, else `409 STAGE_GATE` (as above).
4. If target is terminal (won/lost) → **reason required**: respond `422 REASON_REQUIRED` unless the body also carries `{ "outcome": { "result":"won", "reason":"…", "note":"" } }`.
Effects (transactional): update the placement's `stage_key`; append `stage_history`; if primary → update deal `stage_key`/`stage_entered_at`; on win → `promoteWonContact`; fire stage automations (with condition gating) + cross-pipeline handoffs; emit Activity events.
```jsonc
// 200 → the updated Deal (§2), plus any side-effects surfaced:
{ "deal": { … }, "automationsRun": ["Proposal Follow-Up"], "automationsSkipped": [], "handoffs": [] }
```

### 4.4 Close / reopen
- `POST /v1/deals/{id}/close` `{ "result":"won|lost", "reason":"…", "note":"" }` → sets `outcome`, moves to the won/lost stage, `promoteWonContact` on win. `422` if reason missing and workspace requires it.
- `POST /v1/deals/{id}/reopen` → restores the pre-close stage from `stage_history`, clears `outcome`. `409` if not currently closed.

### 4.5 Enrollment & primary (multi-pipeline)
- `POST /v1/deals/{id}/enroll` `{ "pipelineId":"0192…", "stageKey":"kickoff" }` → **merges** a placement (never replaces the array). `409` if already enrolled there.
- `POST /v1/deals/{id}/primary` `{ "pipelineId":"0192…" }` → swaps primary; value/forecast ownership moves; never orphans. `403` if target pipeline not accessible.
- `DELETE /v1/deals/{id}/placements/{pipelineId}` → removes an enrollment (cannot remove the primary; `409`).

### 4.6 Merge — `POST /v1/deals/merge`
`{ "ids":["a","b"], "primaryId":"a" }` (2–3 ids). Primary wins conflicts; id-linked fields gap-filled from losers; losers soft-deleted with a merge pointer; timeline note on the survivor. `422` if `ids` not 2–3 or not all accessible.

### 4.7 Bulk & stage-scoped bulk
- `POST /v1/deals/bulk` `{ "ids":[…], "patch":{…} }` or `{ "ids":[…], "op":"move|archive|delete|assign", … }`. Per-record permission re-checked server-side; partial success returns per-id results.
- `POST /v1/pipelines/{id}/stages/{key}/bulk` `{ "action":"email|enrollSequence", "sequenceId?":"…", "templateKey?":"…" }` — resolves the stage's deals to **unique contacts**, runs the eligibility check, returns the review payload the UI renders:
  ```jsonc
  { "recipients":[{"contactId":"…","name":"…","dealCount":2}],
    "skipped":[{"name":"Ravi Lee","reason":"Do Not Contact"},
               {"name":"Pivot Studio","reason":"No contact linked"}],
    "sequenceId":"cs_nudge" }   // created-once from template if templateKey given
  }
  ```
  A second `POST …?confirm=true` performs the enroll/send (via the sending system, §6 main) and writes enrollments + Activity events.

---

## 5. Error codes (this module)

| HTTP | code | when |
|---|---|---|
| 403 | `FORBIDDEN` | object permission or row-scope denies the action |
| 403 | `MOVE_RIGHTS` | `stage.moveRoles` excludes the role |
| 403 | `PIPELINE_ACCESS` | pipeline not accessible to the role |
| 409 | `STAGE_GATE` | required fields unfilled for target stage (details.missing) |
| 409 | `ALREADY_ENROLLED` / `NOT_CLOSED` / `CANNOT_REMOVE_PRIMARY` | enrollment/close invariants |
| 422 | `REASON_REQUIRED` | terminal move without an outcome reason |
| 422 | `INVALID_MERGE` | wrong count or inaccessible ids |

---

## 6. What the client stops doing

Once these endpoints exist, the prototype's `PipelinePage` changes are mechanical: `dealsFor(stage)` → `GET …/board` per column with a cursor; `applyMove`/`onBulkStage`/`commitStage` → the `move`/`bulk` endpoints (the client-side gate checks become optimistic UI, the server is authoritative); forecasts/funnels → the summary endpoints. `allDeals()` and the in-memory filtering disappear entirely — that's the scale fix.

---

_Next sub-specs available on request: §5 Auth & permissions (roles, scope predicates, session/tenant), §6 Sending & deliverability (transport, suppression, enrollment lifecycle, webhooks), §7 Automations engine (trigger events, condition AST, run worker)._
