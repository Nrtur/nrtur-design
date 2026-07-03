# Sub-spec: Auth & Permissions

_Detailed identity, session, RBAC, row-scope, and field-redaction contract for nrtur. Companion to [BACKEND_SPEC.md](../../BACKEND_SPEC.md) §1 (tenancy/identity), §5 (Auth & permissions), and §4 (the permission-checked API surface). Grounded by direct read of the prototype's `PERM_ROLE_SEED`, `effScopeRows`, `pipeAccessible`, `canMoveToStage`, and the `RoleProvider`/`_previewRole` layer in `index.html` (branch `main`)._

Conventions: JSON over HTTPS; `Authorization: Bearer <token>`; every request is workspace-scoped from the token; all timestamps ISO-8601 UTC; money is integer **minor units**; IDs are server UUIDv7 strings. `4xx` bodies use `{ "error": { "code", "message", "details" } }`.

> **Grounding note on terminology.** The prototype's per-object action keys are literally `view`, `create`, `edit`, `delete` (`PERM_ACTIONS` at index.html:14580) — *not* `read`. BACKEND_SPEC §5.2 abstractly writes "create/read/edit/delete"; this sub-spec uses the prototype's real key **`view`** on the wire and in DDL so the seed data transfers verbatim. Where BACKEND_SPEC says "read scope" it means the `view` action + the object's `scope`.

---

## 1. What the prototype actually implements (and what it fakes)

Verified in `index.html`:

| Concern | Prototype truth | Real backend must |
|---|---|---|
| Signed-in principal | `CURRENT_USER = {name:'Alex Morgan',avatar:'AM',color:'#3b82f6'}` (5117); true role `CURRENT_USER_ROLE='Owner'` (2519) — module-level constants | Derive principal from a validated session token; there is no login. |
| User identity key | Owners are stored as the **2-letter `avatar` code** (`'AM'`, `'SC'`…); `userByCode(code)` matches on `avatar` (6587). No stable user id exists. | Introduce real `user_id` (UUIDv7); keep `code` as a stable per-user display handle. `deal.owner` etc. become FKs to `user_id` (denorm `code` kept for display). |
| Effective role | `effectiveRole() = _previewRole || CURRENT_USER_ROLE` (2527) | `effectiveRole` = the session's real role; **preview never reaches the server** (see §8). |
| Object permission | `effCanObject(obj,act)` reads `PERM_ROLE_SEED[role].perms.objects[obj][act]` (2530) | Enforce server-side on every request. |
| Row scope | `effScopeRows(obj,rows,getOwner)` filters in-browser by `CURRENT_USER_CODE='AM'` / `CURRENT_USER_TEAM=['AM','SC','JK','RL']` (2537–2545) | Inject as a SQL predicate on every read (§4). |
| Team membership | **Faked**: `CURRENT_USER_TEAM` is a hardcoded array of codes "illustrative; excludes e.g. MR" (2538). There is no team entity. | Model real teams + membership (§4.4); resolve "my team" from the DB, not a constant. |
| Sensitive fields | `effCanSeeSensitive()` gates render; field defs carry `sensitive:true` on deal `amount` (8823), company `annualRevenue` (9303), lead `estValueNum` (9865). Masked client-side to `•••• — restricted` (6670). | **Omit** those fields from the JSON for roles below `PERM_SENSITIVE_VISIBLE` (§7) — masking client-side is not security. |
| Pipeline / stage auth | `pipeAccessible(p)` (8966), `dealPipeAccessible(d)` (8968), `canMoveToStage(stage)` (8970) — admins always pass. | Enforce as read predicate + move gate (§6). |
| Preview safety | `_previewRole` only set when `NAV_ADMIN_ROLES.indexOf(CURRENT_USER_ROLE)>=0` (22424); switcher reads TRUE role, exit reads TRUE role (2553–2558). | Preview is a pure client rendering concern; the server ignores any client-asserted role (§8). |
| Billing / features | `effCanManageBilling()` → `perms.billing`; `effCanBulkDelete/effCanExport()` → `perms.features.*` (2532–2534). | Enforce on the corresponding endpoints. |
| Custom roles | `SettingsPermissionsPage` clones `PERM_ROLE_SEED` into local React state; edits are **never persisted** (`save()` just toasts, 14666). Custom roles force `billing=false` (14670). | Persist role + role_permission rows per workspace; edits are audited (§9). |

**Everything below the "real backend must" column is net-new; everything in "prototype truth" is a verbatim port.**

---

## 2. Persistence schema (Postgres-flavoured)

```sql
-- ── Identity & tenancy ───────────────────────────────────────────────────────
workspace (
  id            uuid pk,
  name          text not null,
  created_at    timestamptz not null default now()
);

app_user (                                   -- a real person; global across workspaces
  id            uuid pk,                      -- UUIDv7 (replaces the avatar-code identity)
  email         citext unique not null,
  name          text not null,
  password_hash text null,                    -- null if SSO-only
  created_at    timestamptz not null default now()
);

-- Membership binds a user to a workspace with exactly one role; `code` is the 2-letter
-- display handle the prototype used as an id (deal.owner='AM'). Unique per workspace.
membership (
  id            uuid pk,
  workspace_id  uuid not null references workspace(id),
  user_id       uuid not null references app_user(id),
  role_key      text not null references role(key_scoped),  -- FK below
  code          text not null,               -- 'AM','SC',… display + legacy owner join
  color         text,                        -- avatar color, e.g. '#3b82f6'
  status        text not null default 'Active',  -- Active|Pending|Suspended  (from members seed 14973)
  created_at    timestamptz not null default now(),
  unique (workspace_id, user_id),
  unique (workspace_id, code)
);
create index on membership (workspace_id, user_id);
create index on membership (workspace_id, code);

session (
  id            uuid pk,
  user_id       uuid not null references app_user(id),
  workspace_id  uuid not null references workspace(id),  -- the active workspace for this token
  token_hash    text not null,               -- sha256 of the opaque bearer token; never store raw
  issued_at     timestamptz not null default now(),
  expires_at    timestamptz not null,
  revoked_at    timestamptz null,
  ip            inet null, user_agent text null
);
create index on session (token_hash);
create index on session (user_id, expires_at);

-- ── RBAC ─────────────────────────────────────────────────────────────────────
-- One role row per (workspace, role_key). The 6 built-ins are seeded per workspace so a
-- workspace can edit/duplicate them (prototype's SettingsPermissionsPage) without touching others.
role (
  key_scoped    text pk,                      -- surrogate: workspace_id||':'||key  (or a uuid + unique)
  workspace_id  uuid not null references workspace(id),
  key           text not null,                -- 'Owner','Admin','Sales Manager','Team Lead','Sales Rep','Read Only', or custom
  color         text not null,                -- '#eab308' …
  description   text,
  builtin       bool not null default false,  -- built-ins can't be deleted; Owner is undeletable & never loses billing
  is_admin      bool not null default false,  -- true only for Owner/Admin (NAV_ADMIN_ROLES) — "admins always pass"
  sensitive_visible bool not null default false, -- membership of PERM_SENSITIVE_VISIBLE
  -- workspace feature flags (prototype perms.features + perms.billing)
  feat_settings   bool not null default false,
  feat_user_mgmt  bool not null default false,
  feat_export     bool not null default false,
  feat_bulk_delete bool not null default false,
  feat_manage_tags bool not null default false,
  feat_manage_seq bool not null default false,
  billing         bool not null default false,
  -- report sub-permissions (perms.report)
  report_view   bool not null default false,
  report_create bool not null default false,
  report_edit   bool not null default false,
  report_share  bool not null default false,
  position      int,
  unique (workspace_id, key)
);
create index on role (workspace_id);

-- Per-object CRUD + scope. One row per (role, object). `object` ∈ PERM_OBJECTS.
role_permission (
  role_key_scoped text not null references role(key_scoped) on delete cascade,
  object          text not null,             -- Contacts|Leads|Companies|Deals|Tasks|Sequences|Email Templates|Forms
  can_view        bool not null default false,
  can_create      bool not null default false,
  can_edit        bool not null default false,
  can_delete      bool not null default false,
  scope           text not null default 'All', -- Own|Team|All  (only meaningful when can_view)
  primary key (role_key_scoped, object)
);

-- ── Teams (net-new; the prototype hardcodes CURRENT_USER_TEAM) ────────────────
team (
  id uuid pk, workspace_id uuid not null references workspace(id), name text not null
);
team_member (
  team_id uuid not null references team(id),
  user_id uuid not null references app_user(id),
  primary key (team_id, user_id)
);
create index on team_member (user_id);

-- ── Permission-change audit (net-new; §9) ────────────────────────────────────
perm_audit (
  id uuid pk, workspace_id uuid not null, actor_user_id uuid not null,
  at timestamptz not null default now(),
  kind text not null,                        -- role.create|role.edit|role.delete|member.role_change|member.invite|member.suspend|feature.toggle
  target text,                               -- role key or member code/email
  before jsonb, after jsonb                  -- the diffed permission blob
);
create index on perm_audit (workspace_id, at desc);
```

**Indexes that matter for scope enforcement:** the owner FK on every business table (`(workspace_id, owner_user_id)`) is what makes the Own/Team predicates index-only. Team resolution is a small `team_member` lookup, cached per-request.

---

## 3. Config shapes (real field names → JSON)

### 3.1 The role definition (the port of one `PERM_ROLE_SEED` entry)

`rolePerms(s)` (14596) expands a compact seed into `{objects, report, features, billing}`. The API returns the **expanded** shape so the client's `effCanObject`/`effScope`/`effCanManageBilling` read it unchanged:

```jsonc
// GET /v1/roles/Sales%20Rep  → exactly what rolePermsOf('Sales Rep') returns today
{
  "key": "Sales Rep",
  "color": "#3b82f6",
  "builtin": true,
  "desc": "Their own records only.",
  "isAdmin": false,                 // NAV_ADMIN_ROLES membership
  "sensitiveVisible": false,        // PERM_SENSITIVE_VISIBLE membership
  "perms": {
    "objects": {
      "Contacts":        { "view": true, "create": true, "edit": true, "delete": false, "scope": "Own" },
      "Leads":           { "view": true, "create": true, "edit": true, "delete": false, "scope": "Own" },
      "Companies":       { "view": true, "create": true, "edit": true, "delete": false, "scope": "Own" },
      "Deals":           { "view": true, "create": true, "edit": true, "delete": false, "scope": "Own" },
      "Tasks":           { "view": true, "create": true, "edit": true, "delete": false, "scope": "Own" },
      "Sequences":       { "view": true, "create": true, "edit": true, "delete": false, "scope": "Own" },
      "Email Templates": { "view": true, "create": true, "edit": true, "delete": false, "scope": "Own" },
      "Forms":           { "view": true, "create": true, "edit": true, "delete": false, "scope": "Own" }
    },
    "report":   { "view": true, "create": false, "edit": false, "share": false },
    "features": { "settings": false, "userMgmt": false, "export": false,
                  "bulkDelete": false, "manageTags": false, "manageSeq": false },
    "billing":  false
  }
}
```

> Note the prototype's `permObjAll(actions,scope)` applies the **same** actions+scope to all 8 objects for a built-in role — so e.g. Sales Rep is `Own` scope on *every* object, Read Only is `view`-only `All`-scope everywhere. Custom/edited roles can diverge per object (the matrix UI allows it), which is why `role_permission` is per-object rows, not one blob.

### 3.2 Seed rows for all six built-ins (verbatim from `PERM_ROLE_SEED`, index.html:14602–14608)

These are the exact values read from the prototype. Seed them into `role` + `role_permission` per workspace.

```jsonc
// Compact form (actions applied to ALL 8 objects; scope uniform per built-in):
[
  { "key":"Owner",         "color":"#eab308", "isAdmin":true,  "sensitiveVisible":true,
    "actions":["view","create","edit","delete"], "scope":"All",
    "report":["view","create","edit","share"],
    "features":{ "settings":true,  "userMgmt":true,  "export":true,  "bulkDelete":true,  "manageTags":true,  "manageSeq":true }, "billing":true,
    "desc":"Full access plus billing and workspace ownership." },

  { "key":"Admin",         "color":"#f59e0b", "isAdmin":true,  "sensitiveVisible":true,
    "actions":["view","create","edit","delete"], "scope":"All",
    "report":["view","create","edit","share"],
    "features":{ "settings":true,  "userMgmt":true,  "export":true,  "bulkDelete":true,  "manageTags":true,  "manageSeq":true }, "billing":false,
    "desc":"Manage users, roles, settings, integrations, and all data. No billing." },

  { "key":"Sales Manager", "color":"#6366f1", "isAdmin":false, "sensitiveVisible":true,
    "actions":["view","create","edit","delete"], "scope":"All",
    "report":["view","create","edit","share"],
    "features":{ "settings":false, "userMgmt":false, "export":true,  "bulkDelete":true,  "manageTags":true,  "manageSeq":true }, "billing":false,
    "desc":"All records, reports, sequences, and full team visibility." },

  { "key":"Team Lead",     "color":"#7c3aed", "isAdmin":false, "sensitiveVisible":true,
    "actions":["view","create","edit"],          "scope":"Team",
    "report":["view","create"],
    "features":{ "settings":false, "userMgmt":false, "export":true,  "bulkDelete":false, "manageTags":false, "manageSeq":false }, "billing":false,
    "desc":"Own and their team’s records, with limited reports." },

  { "key":"Sales Rep",     "color":"#3b82f6", "isAdmin":false, "sensitiveVisible":false,
    "actions":["view","create","edit"],          "scope":"Own",
    "report":["view"],
    "features":{ "settings":false, "userMgmt":false, "export":false, "bulkDelete":false, "manageTags":false, "manageSeq":false }, "billing":false,
    "desc":"Their own records only." },

  { "key":"Read Only",     "color":"#94a3b8", "isAdmin":false, "sensitiveVisible":false,
    "actions":["view"],                          "scope":"All",
    "report":["view"],
    "features":{ "settings":false, "userMgmt":false, "export":false, "bulkDelete":false, "manageTags":false, "manageSeq":false }, "billing":false,
    "desc":"View only — no create, edit, or delete." }
]
```

Constants that drive derived flags (verbatim):
- `NAV_ADMIN_ROLES = ['Owner','Admin']` (2518) → `isAdmin` / `role.is_admin`. **These roles bypass pipeline access, stage-move rights, and preview gating** ("admins always pass").
- `PERM_SENSITIVE_VISIBLE = ['Owner','Admin','Sales Manager','Team Lead']` (14594) → `sensitiveVisible` / `role.sensitive_visible`.
- Owner invariants (from the UI, 14655/14665/14670): the **Owner role always has `billing=true` and it cannot be turned off**; custom roles **never** get billing.

### 3.3 The authenticated principal (`/v1/me`)

```jsonc
{
  "user":      { "id":"0191…", "name":"Alex Morgan", "email":"alex@bloom.co" },
  "workspace": { "id":"0191…", "name":"Bloom Creative" },
  "membership":{ "code":"AM", "color":"#3b82f6", "status":"Active" },
  "role":      { /* full expanded role shape from §3.1 — the client caches this */ },
  "team":      { "id":"0191…", "name":"West", "memberCodes":["AM","SC","JK","RL"] },  // resolves CURRENT_USER_TEAM
  "canPreviewRoles": true    // == role.isAdmin; drives the "View as role" switcher (§8)
}
```
This single response replaces `CURRENT_USER`, `CURRENT_USER_ROLE`, `CURRENT_USER_CODE`, `CURRENT_USER_TEAM`, and `effPerms()` at boot.

---

## 4. Row-level scope as SQL predicates

The prototype computes scope in `effScopeRows` (2541):
```js
return rows.filter(r => s==='Own' ? own(r)===CURRENT_USER_CODE
                                  : CURRENT_USER_TEAM.indexOf(own(r))>=0);
// s==='All' → no filter
```
The backend applies the **equivalent predicate at query time**, on every read that touches a scoped object — list, get, board, global search, report aggregates, and the resolution step of any bulk op. The predicate is chosen by the effective role's `scope` for that object.

Let `:me` = the session's `user_id`, `:my_team` = the set of `user_id`s in the caller's teams (empty set if the user is in no team).

### 4.1 The three predicates

```sql
-- scope = 'All'  (Owner, Admin, Sales Manager, Read Only for most objects)
--   → no owner predicate; still workspace-scoped.
WHERE t.workspace_id = :ws

-- scope = 'Own'  (Sales Rep everywhere; the prototype's own(r)===CURRENT_USER_CODE)
WHERE t.workspace_id = :ws
  AND t.owner_user_id = :me

-- scope = 'Team'  (Team Lead; the prototype's CURRENT_USER_TEAM.indexOf(owner)>=0)
WHERE t.workspace_id = :ws
  AND t.owner_user_id = ANY(:my_team)      -- :my_team ALWAYS includes :me
```

**`workspace_id = :ws` is non-negotiable on every query, in front of every other predicate** — it is the tenancy boundary from BACKEND_SPEC §1. It is derived from the token's `session.workspace_id`, never from the request body or a query param.

### 4.2 Object-by-object scope for the built-ins (what the predicate resolves to)

| Object | Owner | Admin | Sales Manager | Team Lead | Sales Rep | Read Only |
|---|---|---|---|---|---|---|
| every object in `PERM_OBJECTS` | All | All | All | **Team** | **Own** | All (view-only) |

(Built-ins apply one scope uniformly across all 8 objects — see §3.1 note. Custom roles may set a different scope per object, which is why the predicate is chosen per `(role, object)` from `role_permission.scope`.)

### 4.3 Interaction with the `view` bit

Scope only narrows *which* rows; the `view` bit decides *whether the object is queryable at all*. If `can_view=false` for the object, the endpoint returns `403 FORBIDDEN` before any scope predicate runs (no built-in role has `view=false`, but a custom role can). A role with `view=true, scope='Own'` and `edit=false` can list its own rows but every mutation is `403`.

### 4.4 Team membership modelling (replacing the hardcoded array)

The prototype's `CURRENT_USER_TEAM=['AM','SC','JK','RL']` is a fiction (2538). The real `:my_team` is computed per request:

```sql
-- All user_ids that share at least one team with the caller, plus the caller.
SELECT DISTINCT tm2.user_id
FROM team_member tm1
JOIN team_member tm2 ON tm2.team_id = tm1.team_id
WHERE tm1.user_id = :me
UNION SELECT :me;
```
A user in no team has `:my_team = {:me}`, so a Team-scoped role with no team degrades safely to Own-scope (never to All). "Team" is defined by shared team membership, not by a manager hierarchy — matching the flat `indexOf` semantics of the prototype. If a workspace later wants manager→report hierarchies, extend `team` with a parent pointer; the predicate stays the same shape.

---

## 5. Object-permission enforcement at the API boundary

Every endpoint runs, in order:

1. **Authenticate** — validate bearer token → `session` → `(user_id, workspace_id, role)`. Missing/expired/revoked → `401 UNAUTHENTICATED`.
2. **Object gate** — `effCanObject(object, action)` server-side: look up `role_permission[(role,object)].can_<action>`. False → `403 FORBIDDEN`. This mirrors the prototype's ~40 `effCanObject('Deals','edit')`-style call sites, which today only hide buttons.
3. **Scope predicate** — inject §4's predicate into the query. For a mutation on a specific record, load the record *with the scope predicate applied*; if it doesn't come back, the caller can't act on it.
4. **Field redaction** — strip sensitive fields on the way out (§7).

### 5.1 Not-found-vs-forbidden leakage rule (BACKEND_SPEC §5.3: "must never see a record it can't access")

A single rule prevents existence leaks:

- **Object-level denial** (role lacks `view`/`create`/`edit`/`delete` on the object type) → `403 FORBIDDEN`. This reveals only that the *object type* is restricted, which is not sensitive.
- **Row-level denial** (the object is viewable in principle, but this specific row is outside the caller's scope *or* in an inaccessible pipeline) → **`404 NOT_FOUND`**, identical to a genuinely missing id. A Sales Rep requesting a teammate's deal must not be able to distinguish "exists but not yours" from "never existed." This is the same rule as the deals sub-spec §4.2 ("404 if outside scope — indistinguishable from not-found — don't leak existence").

```jsonc
// GET /v1/deals/{id} where the deal exists but owner_user_id ∉ scope
// 404  (NOT 403 — 403 would confirm the id exists)
{ "error": { "code":"NOT_FOUND", "message":"Deal not found" } }
```

### 5.2 Feature-gated endpoints (the workspace-level bits)

| Guard (prototype fn) | `role` column | Endpoints it gates |
|---|---|---|
| `effCanManageBilling()` | `billing` | `GET/POST /v1/billing/*`, `settings-billing` reads |
| `effCanBulkDelete()` | `feat_bulk_delete` | `op:"delete"` on `POST /v1/{object}/bulk` (note: **combined** with per-object `delete` — the prototype requires both: `effCanObject(OBJ,'delete') && effCanBulkDelete()`, 6414) |
| `effCanExport()` | `feat_export` | `GET /v1/{object}/export`, the "Export CSV" action |
| `features.userMgmt` | `feat_user_mgmt` | `/v1/members/*`, invite, role change |
| `features.settings` | `feat_settings` | workspace-settings writes |
| `features.manageTags` | `feat_manage_tags` | `/v1/tags`, `/v1/dealReasons`, status vocab |
| `features.manageSeq` | `feat_manage_seq` | create/edit `/v1/sequences`, `/v1/automations` |
| `report.*` | `report_*` | reporting endpoints (view/create/edit/share of saved reports) |

Feature denial is `403 FORBIDDEN` (the object-existence concern doesn't apply — these are capabilities, not records).

---

## 6. Pipeline-level & stage-level authorization

These are already specced operationally in the deals sub-spec; here is the **authorization** layer they enforce, grounded in the three prototype functions.

### 6.1 Per-pipeline access — `pipeAccessible` (index.html:8966)

```js
function pipeAccessible(p){ if(!p) return false;
  const r=effectiveRole();
  if(NAV_ADMIN_ROLES.indexOf(r)>=0) return true;         // admins always
  const a=p.access; if(!a||!a.length) return true;        // null/[] = everyone
  return a.indexOf(r)>=0; }
```
Backend port — a **read predicate**, not just a 403:
- `GET /v1/pipelines/{id}/board` and `GET /v1/pipelines/{id}` → `403 PIPELINE_ACCESS` when `!pipeAccessible`.
- **Record-level hide** (`dealPipeAccessible`, 8968): in `GET /v1/deals`, global search, and every list, a deal is excluded when its **primary** pipeline is inaccessible. As SQL:
  ```sql
  AND ( p.access IS NULL OR cardinality(p.access) = 0
        OR :role_is_admin
        OR :effective_role = ANY(p.access) )
  ```
  joined via the deal's primary `stage_placement.pipeline_id` (`dealPrimaryPipeId`, 8973). A hidden-pipeline deal is `404` on direct GET, per §5.1.

### 6.2 Per-stage move rights — `canMoveToStage` (index.html:8970)

```js
function canMoveToStage(stage){ if(!stage) return true;
  const roles=stage.moveRoles; if(!roles||!roles.length) return true;  // empty = everyone
  const r=effectiveRole();
  if(NAV_ADMIN_ROLES.indexOf(r)>=0) return true;                        // admins always
  return roles.indexOf(r)>=0; }
```
Gates `POST /v1/deals/{id}/move` (and drag, quick-add-into-stage, bulk-move) on the **target** stage: `!canMoveToStage(targetStage)` → `403 MOVE_RIGHTS`. This is the second check in the deals sub-spec's move-enforcement order (after `Deals.edit`+scope, before the stage gate).

### 6.3 Enforcement precedence for a move

```
401 (auth)  →  403 FORBIDDEN (Deals.edit + scope)  →  403 PIPELINE_ACCESS (target pipeline)
            →  403 MOVE_RIGHTS (target stage.moveRoles)  →  409 STAGE_GATE (required fields)
            →  422 REASON_REQUIRED (terminal move w/o outcome)  →  200
```
The permission checks (401/403) always precede the data-integrity checks (409/422): never reveal a stage-gate detail to a caller who isn't even allowed to move the deal.

---

## 7. Sensitive-field redaction (omit, never zero)

Verified sensitive fields (field defs carrying `sensitive:true`):

| Object | Field (`key`) | JSON field |
|---|---|---|
| Deal | `amount` (8823) | `amount`, plus the derived `value` string |
| Company | `annualRevenue` (9303) | `annualRevenue` |
| Lead | `estValueNum` (9865) | `estValueNum`, plus derived `estValue` |

Rule (BACKEND_SPEC §5.4; prototype `effCanSeeSensitive`, 2546): a principal whose role is **not** in `PERM_SENSITIVE_VISIBLE` (`role.sensitive_visible=false` → Sales Rep, Read Only, and any custom role not flagged) gets those fields **omitted entirely** from every response — list, detail, board card, export row, report. The prototype renders `•••• — restricted` (6670); that is a *client* affordance. The wire must not carry the number at all, and must not zero it (a zero is a lie the client would chart).

```jsonc
// Same deal, two roles:
// Sales Manager (sensitiveVisible) →
{ "id":"0191…", "name":"Summit — Renewal", "amount":3100000, "value":"$31k", "amountType":"ARR", … }

// Sales Rep (NOT sensitiveVisible) → amount & value keys absent
{ "id":"0191…", "name":"Summit — Renewal", "amountType":"ARR", … }
```

Redaction is applied by the serializer as the last step, *after* scope filtering, uniformly across every endpoint (there is no endpoint that may leak a sensitive field). Write-side: a `PATCH` that includes `amount` from a non-sensitive role is rejected `403 FORBIDDEN` (you can't set what you can't see) rather than silently dropped.

Sensitive visibility is a **cross-cut**, independent of the object `edit` bit: a Sales Rep can edit *their own* deal's name/stage but still cannot see or set its amount.

---

## 8. "View as role" — a strictly read-only client concern

The preview layer (`_previewRole` / `RoleProvider`, 2520–2559) is a UI convenience that lets an admin see the app as a lower role renders it. It is **client-only and can never elevate**. Verified invariants to preserve:

1. **Never leaves the browser.** The server derives the effective role from the session's real role, full stop. The API ignores any client-supplied "acting as" header or body field. There is **no** `X-Preview-Role`, and if one were sent it would be discarded. (The whole point of the deals/scope predicates is that they run on the *real* role server-side.)
2. **Only admins can preview.** `_previewRole` is forced to `null` unless `NAV_ADMIN_ROLES.indexOf(CURRENT_USER_ROLE)>=0` (22424); `setPreviewRole` early-returns for non-admins (2554). `/v1/me` returns `canPreviewRoles = role.isAdmin` so the client knows whether to show the switcher — but this is advisory; the server never trusts it for authorization.
3. **Preview can only ever *narrow*.** Because the real token still carries the admin role, preview can only make the *client* hide things. It cannot grant a real Sales Rep the Owner view — a Sales Rep has `canPreviewRoles=false` and no switcher. Even if a malicious client forged a preview state, every server response is still computed from the real role, so nothing is exposed.
4. **Never-lock-out rule.** The switcher and the "Exit preview" control read the **true** role, not the effective one (`rc.trueRole`, 2557/2578) — an admin previewing "Read Only" can always switch back, because the control that ends the preview isn't itself gated by the previewed role. Server-side there is nothing to enforce here (the real role is unchanged), but any future server-rendered nav must apply the same rule: gate the exit affordance on the real role.

**Contract for the backend:** preview is out of scope for the API entirely. Do not add a preview parameter. If product later wants server-verified impersonation (e.g. support staff acting as a user), that is a *different* feature (audited, time-boxed, its own token) — not this read-only role preview.

---

## 9. Auth & permission endpoints

All bodies JSON; all but `login` require a valid bearer token.

### 9.1 Session lifecycle

```jsonc
// POST /v1/auth/login        { "email":"alex@bloom.co", "password":"…" }
// 200
{ "token":"<opaque bearer>", "expiresAt":"2026-07-04T…",
  "workspaces":[ { "id":"0191…", "name":"Bloom Creative", "role":"Admin" } ],  // memberships
  "activeWorkspaceId":"0191…" }
// 401 { "error": { "code":"INVALID_CREDENTIALS", … } }
```
- Token is opaque; only its `sha256` is stored (`session.token_hash`). Cookie or `Authorization: Bearer` both acceptable; cookie must be `HttpOnly; Secure; SameSite=Lax`.
- The active workspace is a property of the session (`session.workspace_id`), so `workspace_id = :ws` on every query needs no client input.

```jsonc
// GET  /v1/me                → §3.3 principal
// POST /v1/auth/logout       → revokes the current session (sets revoked_at). 204.
// POST /v1/auth/switch-workspace   { "workspaceId":"0192…" }
//   requires an active membership in the target; mints a session bound to that workspace,
//   revokes/rotates the old. 403 NOT_A_MEMBER if no membership row. Returns a fresh /me.
```

`switch-workspace` is the multi-tenancy seam: it never merges data across workspaces — it re-scopes `:ws`. A user with memberships in two workspaces has two different roles/scopes, resolved fresh from `membership` + `role`.

### 9.2 Role administration (gated by `features.userMgmt`)

```jsonc
// GET    /v1/roles                          → all roles (expanded, §3.1)
// POST   /v1/roles     { "name","fromTemplate" }   → clone a template's matrix; billing forced false (14670)
// PATCH  /v1/roles/{key}  { partial perms }  → edit matrix / scope / features
// DELETE /v1/roles/{key}                     → 409 if builtin; members must be reassigned first
```
Server-enforced invariants (matching the UI's guardrails):
- Owner role: `billing` cannot be set false; role cannot be deleted (`isOwner` guard, 14655/14665).
- Built-in roles cannot be deleted (`builtin:true`); they *can* be edited (the matrix is live-editable in the prototype).
- Custom roles: `billing` always false on create and non-settable.
- Every write emits a `perm_audit` row with the before/after permission blob.

### 9.3 Membership administration (gated by `features.userMgmt`)

```jsonc
// GET   /v1/members                      → [{ code,name,email,role,color,status }]  (seed 14973)
// POST  /v1/members/invite   { "email","role" }   → status:'Pending'; creates a teamInvite
// PATCH /v1/members/{code}   { "role":"Team Lead" }  → change a member's role  (setRole, 14979)
// POST  /v1/members/{code}/suspend | /reactivate
```
Guardrails: cannot remove the last Owner; cannot demote the last Owner below Owner; a member's own role change is allowed only by another admin (no self-elevation). Each is a `perm_audit` event.

### 9.4 Permission-change auditing (BACKEND_SPEC §10 auditability)

Every mutation in §9.2–9.3 writes `perm_audit` (`kind`, `target`, `before`, `after`, `actor_user_id`, `at`). This is the *governance* trail and is **separate** from the per-record Activity log (§2.6). Rationale: a role edit isn't attached to any one contact/deal, and permission history must survive record deletion. Expose read-only at `GET /v1/audit/permissions?since=…` (admins only).

---

## 10. Error codes (this module)

| HTTP | code | when |
|---|---|---|
| 401 | `UNAUTHENTICATED` | missing / expired / revoked token |
| 401 | `INVALID_CREDENTIALS` | bad email/password on login |
| 403 | `FORBIDDEN` | object-level `effCanObject` denial, or a feature bit (`billing`/`export`/`bulkDelete`/`userMgmt`/…) is off |
| 403 | `PIPELINE_ACCESS` | `!pipeAccessible` for the target pipeline |
| 403 | `MOVE_RIGHTS` | `stage.moveRoles` excludes the effective role |
| 403 | `NOT_A_MEMBER` | `switch-workspace` to a workspace the user has no membership in |
| 404 | `NOT_FOUND` | record outside row-scope **or** in an inaccessible pipeline **or** genuinely absent (all indistinguishable — §5.1) |
| 409 | `BUILTIN_ROLE` | attempt to delete a built-in role |
| 409 | `LAST_OWNER` | attempt to remove/demote the last Owner |
| 422 | `OWNER_BILLING_LOCKED` | attempt to disable billing on the Owner role |

(Stage-gate `409 STAGE_GATE` and terminal `422 REASON_REQUIRED` are owned by the deals sub-spec; listed there.)

---

## 11. What the client stops doing (migration map)

Once these endpoints exist, the prototype's permission machinery becomes **advisory UI** — the same functions still run to hide buttons and grey out actions, but the server is authoritative:

| Prototype (index.html) | Becomes |
|---|---|
| `CURRENT_USER` / `CURRENT_USER_ROLE` / `CURRENT_USER_CODE` / `CURRENT_USER_TEAM` constants | fields of `GET /v1/me`; team resolved from `team_member` (§4.4), not a hardcoded array |
| `effCanObject(obj,act)` (2530) at ~40 call sites | still gates buttons client-side; **re-enforced** at every endpoint (§5). Client checks are optimistic. |
| `effScopeRows(obj,rows,getOwner)` (2541) | disappears — the server returns only in-scope rows via the §4 predicates; the client never filters for permission. `allDeals()`-then-`effScopeRows` (4161) becomes a scoped `GET /v1/deals`. |
| `effCanSeeSensitive()` + `sensitive:true` render mask (6670) | server **omits** the field (§7); the `•••• — restricted` UI shows when the key is absent. |
| `effCanManageBilling / effCanBulkDelete / effCanExport` (2532–2534) | still hide the controls; the corresponding endpoints re-check the feature bit (§5.2). |
| `pipeAccessible` / `dealPipeAccessible` / `canMoveToStage` (8966–8970) | client hides restricted pipelines/stages; server enforces as read predicate + `403 PIPELINE_ACCESS`/`MOVE_RIGHTS` (§6). |
| `RoleProvider` / `_previewRole` / `ViewAsSwitcher` (2520–2578) | **unchanged and client-only** — never sent to the server (§8). |
| `SettingsPermissionsPage` local `roles` state + no-op `save()` (14647/14666) | `roles`/`role_permission` persisted per workspace; `save()` → `PATCH /v1/roles/{key}`, audited (§9.2). |
| `members` local state + `setRole` (14972/14979) | `/v1/members*`, audited (§9.3). |

The net effect matches BACKEND_SPEC §5's mandate: **port the RBAC + row-level model verbatim, enforce it at the boundary, and let the prototype's permission functions degrade into optimistic client hints.**

---

_The file above is the complete sub-spec. Suggested path: `C:\Users\Admin\Downloads\Nrtur_design\docs\backend\auth-permissions-api.md` (sibling of `deals-pipeline-api.md`). Companion sub-specs still open: §6 Sending & deliverability, §7 Automations engine._
