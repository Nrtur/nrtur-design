# Deal & Pipeline Module — Full CRM Comparison Matrix

_Compiled 2026-07-03 · 23 products + nrtur · sources and per-claim verification tags in [PIPELINE_COMPETITOR_RESEARCH.md](PIPELINE_COMPETITOR_RESEARCH.md)._

**Legend:** ✅ verified present · ⚠️ partial / weak form / plan-gated caveat · ❌ verified or documented-absent · ❓ not documented publicly (unknown, NOT assumed absent). The **nrtur** row reflects the prototype as of commit `d12d59f` — every nrtur claim was render-verified in-session, not aspirational.

---

## Table 1 — Architecture & multi-pipeline

| CRM | Data model (where stage lives) | Multi-pipeline | Pipeline limit | One deal in MANY pipelines | Switching pipelines | Cross-pipeline automation |
|---|---|---|---|---|---|---|
| **nrtur** | `pipeline` + `stageKey` on deal + `stagePlacements[]` (D3, active) | ✅ | unlimited (prototype) | ✅ **enrollment: hero Add + arrows, independent stage per placement, primary owns value/forecast** (only Dynamics & Attio also have this) | ✅ primary switch promotes an existing enrollment or re-homes; history stamped | ❌ (backlog: tunnel recipe) |
| Pipedrive | `pipeline_id`+`stage_id`+`status` | ✅ | none documented | ❌ | manual pipeline+stage pick ×3 UIs; breaks progress reports | ❌ |
| HubSpot | `pipeline`+`dealstage` props | ✅ | 1/2/15/100 by tier | ❌ | forced pipeline+stage dialog | workflows |
| Salesforce | record type → sales process → `StageName` | ✅ | record-type caps/edition | ❌ | record-type change, NO remap wizard | flows |
| Dynamics 365 | BPF **instances** + statecode | ✅ | 10 BPFs/table, 30 stages | ✅ **up to 10 concurrent instances, independent stages** | switch renders another instance; state preserved | ✅ |
| Zoho CRM | Layout > Pipeline > Stage | ✅ | 0/5/10/20/50 | ❌ | move within layout; stage constrained per pipeline | CommandCenter |
| Zoho Bigin | Team Pipeline (layout) + Sub_Pipeline + Stage | ✅ | 1/3/5/15 (+$5 add-on) | ❌ | single/bulk Change Pipeline/Stage | ✅ **Connected Pipelines (auto-move)** |
| Freshsales | `deal_pipeline_id`+`deal_stage_id` | ✅ | 1/10/25 | ❌ | bulk update to pipeline+stage | workflows |
| SugarCRM | one global stage list (or per-RLI) | ❌ none | n/a | ❌ (RLI = per-line-item stages) | n/a (org mode switch is destructive) | ❌ |
| ActiveCampaign | `group`+`stage`+`status` | ✅ | **unlimited** | ❌ | field update; UI prompt ❓ | automations |
| Keap Pro/Max | stage + Status (no public API!) | ✅ | none documented | ❌ | pipeline+stage pick | stage-trigger automations |
| Close | `status_id` (status IS stage, grouped by pipeline) | ✅ | all plans, no cap | ❌ | set a status from the other pipeline | ❌ |
| Copper | `pipeline_id`+`pipeline_stage_id`+`status` | ✅ | none documented | ❌ (duplicate-on-Won offer) | instant layout re-render; landing stage ❓ | won-handoff duplicate |
| GoHighLevel | `pipelineId`+`pipelineStageId`+`status` | ✅ | none documented | ❌ (duplicates, setting-gated) | API supports; UI flow ❓ | workflow triggers |
| Nutshell | single stageset per lead | ✅ | 5/10/unlimited | ❌ (cloning advised) | `POST /leads/{id}/stageset`; stage mapping ❓ | auto-close, routing rules |
| Capsule | `milestone` (pipeline via milestone) | ✅ Growth+ | **max 30** | ❌ | pick milestone in target pipeline | ❌ |
| Insightly | `PIPELINE_ID`+`STAGE_ID`+state | ✅ | none documented | ❌ **explicit one-pipeline rule** | record edit / stage link | Activity Sets |
| monday CRM | item on ONE board; stage = Status column | boards | column/dashboard caps per plan | ❌ (mirrors read-only) | `move_item_to_board`, name-based column mapping | automations |
| Attio | stage on **list entry** (or Deals object) | lists | no cap | ✅ **entries: many lists, even 2× the same list** | add/remove entries | workflows |
| Streak | `stageKey` on box | ✅ | no cap | ❌ | move matches stages **by name string** — documented data-loss risk | ❌ |
| Folk | group-scoped single-select field | groups | no cap | ⚠️ per-group independent status (records; deals ❓) | manual re-add; values don't travel | ❌ |
| Bitrix24 | `CATEGORY_ID`+`STAGE_ID` (per-funnel dictionaries) | ✅ | plan-gated, numbers unpublished | ❌ (tunnel Copy = 2nd record) | bulk move / tunnels; API quirk: `crm.deal.update` silently ignores cross-funnel stage | ✅ **Tunnels (visual, Move/Copy)** |
| noCRM.io | lead: custom steps + fixed status | ✅ | 1 / unlimited | ❌ **explicit** | lands at step 1 of target | ❌ |
| Pipeline CRM | pipeline + probability-bearing stages | ✅ | **1/2/5** | ❌ (Copy keeps original) | explicit Move vs Copy | ❌ |
| aNinja | lead workflow status + flat opportunities | workflows | ❓ | ❓ | ❓ | step-change sequences |

## Table 2 — Stage configuration & governance

| CRM | Per-stage probability | Rotting / idle | Blocking required fields on stage entry | Extra governance |
|---|---|---|---|---|
| **nrtur** | ✅ | ✅ per-stage rotDays, amber cards | ✅ every move path, inline fill, bulk skip-and-report, chains into close modal | gates configured on the board columns |
| Pipedrive | ✅ | ✅ per pipeline | ✅ Pro+ — **bypassable via API/import/automations** | Important-fields nudge |
| HubSpot | ✅ | ⚠️ inactivity greying | ✅ conditional stage properties | **no-skip / no-backwards / stage-scoped edit / non-bypassable approvals (Ent)** |
| Salesforce | ✅ | ❌ | ⚠️ validation rules (unnamed) | Path guidance (non-blocking) |
| Dynamics | ❌ | ❌ (AI scoring) | ✅ named "stage-gating" | multi-table BPFs |
| Zoho CRM | ✅ (shared per stage NAME — wart) | ❌ | ✅ **Blueprint** (fields+checklists+attachments) | strongest gate engine |
| Bigin | ❌ | ❌ | ✅ Stage Transition Rules (Premier+) | **closure restrictions** |
| Freshsales | ✅ (not retroactive) | ✅ red cards + filter | ❌ | field dependency (form-save only) |
| Sugar | ✅ enforced, non-editable | ⚠️ report-only (Premier) | ❌ | RLI per-stream stages |
| ActiveCampaign | ❌ — **ML win probability** | ❌ | ❌ | — |
| Keap Pro/Max | ❌ (Classic: ✅) | ❌ | ❌ | stage enter/exit/closed triggers |
| Close | ❌ (per-deal confidence) | ❌ | ❌ | — |
| Copper | ✅ | ✅ "slipping" (not in new board) | ❓ | per-pipeline field layouts |
| GHL | ❌ | ✅ stale workflow trigger | ❌ | — |
| Nutshell | ❌ (per-lead confidence) | ✅ `isOverdue` in the data model | ⚠️ stage goals auto-advance (not blocking) | 9 evidence-based goal types |
| Capsule | ✅ required per milestone | ✅ `daysUntilStale` per stage | ❌ | probability-ordered columns |
| Insightly | ❌ | ❌ (warning icons) | ❌ | stage-triggered Activity Sets |
| monday | ⚠️ column, not stage metadata | ❌ | ✅ conditional status changes (being replaced) | — |
| Attio | ❌ | ✅ target_time_in_status red counter | ❌ (open feature request) | — |
| Streak | ❌ | ✅ days-in-stage magic columns | ❌ | — |
| Folk | ❌ | ❌ | ❌ | — |
| Bitrix24 | ❓ (deal field only) | ⚠️ activity counters | ✅ **per stage AND per pipeline** | per-stage move permissions |
| noCRM | ✅ per step (history-suggested) | ✅ **structural** (Standby requires a reminder) | ❌ | — |
| Pipeline CRM | ✅ (0/100 = closed) | ✅ Slipping Away + daily email | ❓ | health-status axis |
| aNinja | ⚠️ confidence on status | ❓ | ❓ | — |

## Table 3 — Close semantics

| CRM | Won/Lost mechanism | Lost reasons | Win reasons | Reopen |
|---|---|---|---|---|
| **nrtur** | typed stages + `outcome{result,reason,note,closedAt,closedBy}` | ✅ configurable, prompted on every path | ✅ configurable, prompted | ✅ **restores pre-close stage from history, clears outcome, every path** |
| Pipedrive | separate `status` | ✅ freeform/predefined ≤100 | ❌ | ⚠️ API-writable; semantics ❓ |
| HubSpot | flagged stages + is_closed props | ✅ default property + report | ✅ default property | ❓ |
| Salesforce | stage-derived IsClosed/IsWon | ❌ (custom field) | ❌ | ⚠️ edit stage back |
| Dynamics | separate status + Opportunity Close activity | ✅ configurable status reasons | ✅ + custom close fields | ✅ **Reopen command** |
| Zoho CRM | stage types (forecast_type) | ❌ (Blueprint DIY) | ❌ | ❓ (forecast locks) |
| Bigin | closed stages (≤5) + drag targets | ❓ | ❓ | ❓ |
| Freshsales | Won/Lost stages in every pipeline | ✅ first-class field wired to Lost | ❌ | ❓ |
| Sugar | stage classification (+RLI status) | ❌ | ❌ | ⚠️ edit back; closed protected from delete |
| ActiveCampaign | separate status 0/1/2 | ❌ (custom field DIY) | ❌ | ⚠️ dropdown; side-effects ❓ |
| Keap | hybrid (columns + Status) / Classic: Win/Loss stages | ✅ Classic, **optionally required** | ✅ Classic, **optionally required** | ❓ |
| Close | status_type on stage (won/lost undeletable) | ❌ (custom field) | ❌ (custom field) | ⚠️ set active status |
| Copper | status incl. **Abandoned** | ✅ prompted dropdown + report | ❌ | ⚠️ API; clearing ❓ |
| GHL | status incl. abandoned + auto Won/Lost stages (dual!) | ✅ configurable, optional | ❌ | ⚠️ freely editable |
| Nutshell | status won/lost/**cancelled** | ✅ Outcomes + **competitor capture** | ❌ (price confirm instead) | ✅ **POST /reopen** |
| Capsule | complete milestones (prob 0/100) | ✅ + **includedForConversion** | ❌ | ✅ **restores prior milestone** |
| Insightly | 5-state field (incl. Suspended) | ✅ state reasons | ⚠️ state reasons on Won | ⚠️ via Suspended |
| monday | `is_done` labels + group convention | ❌ | ❌ | unmodeled |
| Attio | status options in stage attribute | ❌ (template DIY) | ❌ | ⚠️ history auditable |
| Streak | stage-NAME convention | ❌ | ❌ | unmodeled |
| Folk | Status field value + Closed at | ⚠️ recommended custom field | ❌ | unmodeled |
| Bitrix24 | stage semantics success/failure | ⚠️ multiple failure stages | ❌ | ⚠️ terminal stages exitable |
| noCRM | fixed status (Won/Lost/**Cancelled**) | ✅ Tags on closing | ❓ | ⚠️ duplicate-the-lead pattern |
| Pipeline CRM | probability-welded (0/100) | ✅ + optional **mandatory** prompt | ✅ same feature | ❓ |
| aNinja | opportunity status | ❌ (Note field) | ❌ | ❓ |

## Table 4 — Safety & permissions

| CRM | Delete a pipeline holding deals | Per-pipeline permissions |
|---|---|---|
| **nrtur** | ✅ auto-reassign to next pipeline's first stage, history stamped, never orphans | ❌ (role scopes only — backlog) |
| Pipedrive | ⚠️ stage delete KILLS its deals (30-day restore) | ❓ |
| HubSpot | ✅ blocked until evacuated | ✅ manage access + team restriction (Pro+) |
| Salesforce | ⚠️ stage delete prompts remap; process deactivation ❓ | ⚠️ via profiles ("not an access control mechanism") |
| Dynamics | ⚠️ deactivated BPF instances linger with banner | ✅ security roles per BPF |
| Zoho CRM | ✅ **prompted transfer + stage remap; closed deals preserved** | ✅ via layout permissions |
| Bigin | ❌ **records permanently deleted** (export-first warning) | ✅ profile-based per pipeline |
| Freshsales | ⚠️ silent move to default pipeline's first stage | ❌ |
| Sugar | n/a (mode switch deletes all RLIs + forecasts) | ⚠️ role-based dropdown filtering |
| ActiveCampaign | ❌ **API cascade-deletes stages AND deals** | ✅ user groups |
| Keap | ✅ **prompt: delete or migrate (cleanest UX)** | ❓ |
| Close | ✅ blocked (statuses must be empty/moved) | ❓ |
| Copper | ❌ must delete every opportunity incl. Won ("gone forever") | ⚠️ field layouts ("not a data security tool") |
| GHL | stage: move-first option ✅ · pipeline: ❓ | ❌ (module-level only) |
| Nutshell | ❓ (API implies "retired" state) | ❌ |
| Capsule | ✅ blocked with active opportunities | ❓ |
| Insightly | ✅ blocked while in use | ❌ (layouts only) |
| monday | ⚠️ Trash 30 days, restorable | ✅ board permissions (multi-level = Ultimate) |
| Attio | ⚠️ list + its attribute data permanently deleted; records survive | ✅ four-tier per-list |
| Streak | ❓ box fate undocumented | ✅ **six roles per pipeline** (most granular) |
| Folk | ⚠️ group fields + values deleted (weakly sourced) | ✅ group sharing |
| Bitrix24 | ✅ blocked (even recycle-bin deals count) | ✅ **per pipeline AND per stage** |
| noCRM | ❓ (step delete: leads fall back a step ✅) | ⚠️ Dream-edition pipeline-user linking |
| Pipeline CRM | ✅ forced reassignment (active + closed) | ❌ |
| aNinja | ❓ | ❌ (report visibility only) |

## Table 5 — Board UX & reporting

| CRM | Column totals | Weighted forecast | Funnel conversion report | Time-in-stage report | Win/loss reason report |
|---|---|---|---|---|---|
| **nrtur** | ✅ + live KPI strip | ✅ open-only view, deal-prob overrides stage-prob, booked shown separately | ✅ from real stage history | ✅ avg/max per stage | ✅ counts + $ per reason, both sides |
| Pipedrive | ✅ + weighted | ✅ forecast kanban (Pro+) | ✅ | ✅ deal duration | ✅ lost only |
| HubSpot | ✅ total/weighted/avg | ✅ + forecast tool (Pro+) | ✅ + skip handling | ✅ + velocity + push rate | ✅ loss reasons report |
| Salesforce | ❓ (kanban 200-card cap) | ✅ forecast categories | ⚠️ via reports | ✅ OpportunityHistory stage duration | ⚠️ custom |
| Dynamics | ✅ lane revenue+count | ⚠️ charts (no stage prob) | ✅ funnel chart | ⚠️ via BPF instance tables | ✅ via Opportunity Close |
| Zoho CRM | ✅ aggregate-by | ✅ + deep forecasting | ⚠️ | ⚠️ Stage History (exit-only) | ❌ |
| Bigin | ⚠️ stage summary | ❌ | ⚠️ funnel chart type | ❌ | ❌ |
| Freshsales | ✅ 3 modes | ✅ + commit workflow | ✅ stage movement | ✅ duration metrics | ✅ lost |
| Sugar | ❓ | ✅ | ✅ cohort funnels (Premier) | ✅ Sales Cycle/Idle trends | ⚠️ manual |
| ActiveCampaign | ❓ | ❌ (close-date forecast only) | ❌ | ❌ | ❌ |
| Keap Pro/Max | ❓ | ❌ (Classic ✅) | ❌ | ❌ | ✅ Classic |
| Close | ✅ actual/expected | ⚠️ expected values | ✅ + avg time to advance | ✅ | ❌ |
| Copper | ✅ (Sales Tracking) | ⚠️ report only | ❓ | ❓ | ✅ loss reasons report |
| GHL | ❓ | ❌ | ⚠️ linear-only (own caveat) | ❌ | ⚠️ widget filter |
| Nutshell | ✅ | ✅ confidence-weighted | ✅ + entry/exit timestamps CSV | ✅ via funnel CSV | ✅ losses by outcome+competitor |
| Capsule | ❓ | ✅ | ✅ conversion dashboard | ✅ **per-stage mean/median by user** | ✅ by reason/owner/team |
| Insightly | ⚠️ | ❌ | ⚠️ snapshot only | ❌ | ❌ |
| monday | ⚠️ widgets | ✅ Forecast Value column + view | ✅ label transitions | ⚠️ hover widget | ❌ |
| Attio | ✅ + calculations | ❌ | ✅ (Plus+) | ✅ (Pro+) | ❌ |
| Streak | ❓ | ⚠️ projected close value | ✅ | ✅ + entrances/exits/flow | ❌ |
| Folk | ✅ calc counters | ❌ | ❌ (no stage history at all) | ❌ | ⚠️ field breakdown |
| Bitrix24 | ✅ (hideable per role) | ❓ | ✅ classic + conversion funnels | ❓ | ⚠️ failure-stage split |
| noCRM | ⚠️ | ✅ | ✅ per-step performance | ❓ | ✅ closing-tag stats |
| Pipeline CRM | ⚠️ list totals | ✅ | ⚠️ | ⚠️ velocity (marketing-sourced) | ✅ won AND lost + Hindsight |
| aNinja | ❌ no board | ❌ | ❌ | ❌ | ❌ |

---

## nrtur scorecard vs the field (post-P0/P1/P2, all render-verified)

**At or above every product surveyed:** blocking stage gates on every move path with inline fill chaining into close-reason capture (nobody documents this combination) · symmetric configurable win+loss reasons with forced prompt (only Keap Classic + Pipeline CRM match) · reopen that restores the pre-close stage AND clears the stale outcome (Capsule restores, Dynamics/Nutshell have commands — none document outcome hygiene) · funnel + time-in-stage from real per-record history · honest forecast (open-only, deal-prob override, booked separated) · delete-never-orphans · deal merge with id-linked gap fill (Zoho-tier; Salesforce/Close/Copper/Freshsales can't merge deals at all).

**Now also ahead:** multi-pipeline enrollment shipped (D2 phase 2) — one deal in several pipelines with independent stages, view-switching hero, and no double-counted value; among all 23 competitors only Dynamics (BPF instances) and Attio (list entries) have an equivalent, and neither puts it on the deal card.

**Still behind (honest backlog):** per-pipeline permissions (Bitrix24/Streak/Attio lead) · pipeline referenced by name-string not id · creation into a gated stage is ungated · no close-date forecast kanban (Pipedrive) · no cross-pipeline automation (Bigin Connected Pipelines / Bitrix24 tunnels) · `includedForConversion` on lost reasons not implemented · secondary placements get entered-at timestamps but not full per-placement history · closing from a secondary placement's terminal stage moves only the placement (deal-level outcome stays with the primary).
