# Deal & Pipeline Module — Cross-CRM Verified Research

_Researched 2026-07-03 · 22 products · 7 parallel research passes · 150+ official pages fetched (help centers + developer API references)._

**Verification legend** — every claim in the appendix carries a source URL and a tag:
- **VERIFIED** — an official page was fetched and states it.
- **PARTIAL** — official source implies it, or content came via search snippet of an official page.
- **UNVERIFIED** — could not be confirmed; treat as unknown, NOT as fact.

Products covered: Pipedrive, HubSpot, Salesforce, Microsoft Dynamics 365 Sales, Zoho CRM, Zoho Bigin, Freshsales, SugarCRM, ActiveCampaign, Keap (Pro/Max + Max Classic), Close, Copper, GoHighLevel, Nutshell, Capsule, Insightly, monday CRM, Attio, Streak, Folk, Bitrix24, noCRM.io, Pipeline CRM, aNinja.

---

## Part 1 — The architecture question: where does "stage" live, and can one deal be in many pipelines?

### 1.1 The dominant model: ONE deal → ONE pipeline → ONE stage (two linked scalar fields)

In every classic CRM verified, the deal record carries a **single pipeline reference and a single stage reference**, and the pipeline constrains which stage values are legal:

| CRM | Fields on the deal (from API docs) | Evidence grade |
|---|---|---|
| Pipedrive | `pipeline_id` + `stage_id` (+ separate `status`) | VERIFIED |
| HubSpot | `pipeline` + `dealstage` properties | VERIFIED |
| Zoho CRM | `Layout` > `Pipeline` > `Stage` (stage values constrained per pipeline) | VERIFIED |
| Freshsales | `deal_pipeline_id` + `deal_stage_id` | VERIFIED |
| Close | `status_id` (the status IS the stage; each status belongs to one pipeline) | VERIFIED |
| Copper | `pipeline_id` + `pipeline_stage_id` (+ status) | VERIFIED |
| GoHighLevel | `pipelineId` + `pipelineStageId` (+ status) | VERIFIED |
| Bitrix24 | `CATEGORY_ID` (funnel) + `STAGE_ID` (per-funnel dictionary) | VERIFIED |
| Nutshell | single stageset per lead (`POST /leads/{id}/stageset`) | VERIFIED |
| Capsule | `milestone` (nested; pipeline reached through the milestone) | VERIFIED |
| Insightly | `PIPELINE_ID` + `STAGE_ID` — "Only one Pipeline may be applied to each record" | VERIFIED (rule) |
| noCRM.io | "A lead can only be placed in one pipeline, it can't be in two different pipelines at the same time" | VERIFIED (explicit) |
| Salesforce | `RecordTypeId` (binds one Sales Process) + `StageName` | VERIFIED |
| monday CRM | item belongs to exactly one board; stage = a Status column value | VERIFIED |
| Streak | box carries a single `stageKey`; stages defined by its one pipeline | VERIFIED |
| Pipeline CRM / Bigin / Sugar / AC / Keap | same single-membership pattern | VERIFIED/PARTIAL |

**Answer to "is stage a separate field per pipeline on the deal?": No — in the classic model there is one stage field whose legal values switch with the pipeline field.** Nobody stores a stage-per-pipeline map on a classic deal record.

### 1.2 The exceptions: true multi-pipeline residency exists in exactly TWO architectures

1. **Microsoft Dynamics 365 — Business Process Flow instances** (VERIFIED): "Each row can have multiple process instances associated (each for a different business process flow definition, up to a total of 10)." Each instance stores its own stage state in its own table. Switching the rendered process "maintains its state and can be switched back." Won/Lost is a separate status field, so closing is orthogonal to all processes. This is the enterprise-grade version of "one deal at different stages in different pipelines."
2. **Attio — list entries** (VERIFIED): stage lives on the **list entry**, not the record. One record can be in many lists with an independent stage per entry — and even appear twice in the SAME list. This is the modern-tool version, but note: Attio's own *Deals object* stage is single-valued; the multi-residency applies to records tracked through lists.

Partial analogues: **Folk** (group-scoped fields → independent status per group, but no stage history at all), **SugarCRM Revenue Line Items** (per-revenue-stream stages within ONE opportunity — a different axis).

**Everyone else solves cross-team flows without multi-residency, in one of two verified ways:**
- **Copy/duplicate**: Copper (offers duplication into another pipeline when a deal is Won), Bitrix24 (tunnel "Copy" mode), Pipeline CRM ("Copy… keeping the original for reporting"), Nutshell (lead cloning), GHL (duplicate opportunities per contact, setting-gated).
- **Automated handoff (move)**: Bigin **Connected Pipelines** (records auto-move between team pipelines on logic), Bitrix24 **tunnels** (drawn visually between stages of two pipelines, with delays/conditions), Copper won-handoff, Keap/GHL stage-trigger automations.

### 1.3 What happens on a pipeline switch (the user's "check all conditions" ask)

- **A forced stage pick in the destination is the norm.** HubSpot opens a dialog where you must pick pipeline AND stage; Pipedrive requires both in all three of its move methods; Capsule requires picking a milestone; Keap requires pipeline + stage; Zoho constrains you to the target pipeline's stage list. **No mainstream CRM auto-maps stages by name or position** (VERIFIED across those five; nrtur's keep-stage-if-same-key + else-first-stage behavior is actually *more* automated than the market).
- **No "enrollment before switching" exists in classic CRMs** — switching IS just editing the pipeline field + picking a stage. Prior "adding" to the target pipeline is only a concept in Dynamics (instances) and Attio (entries).
- **History risks are real and documented**: Pipedrive — "Deal progress reports only reflect movements within the current pipeline… If you often move deals between pipelines, review your pipeline structure." Salesforce — no remap wizard on record-type change; orphaned stages need manual cleanup. Streak — cross-pipeline moves match stages/columns **by name string** with documented data-loss risk. Bitrix24 API — `crm.deal.update` **silently ignores** a cross-funnel STAGE_ID.

### 1.4 Won/Lost: three verified camps (a claim like "everyone does it as stages" is false)

- **Separate status field, decoupled from stage**: Pipedrive (`status` open/won/lost), ActiveCampaign (0/1/2 — "when you update the stage… the deal's status will remain Open"), Copper (Open/Won/Lost/**Abandoned**), GoHighLevel (open/won/lost/abandoned + status API), Insightly (**five** states: Open/Suspended/Abandoned/Lost/Won), Dynamics (statecode/statuscode + close-reason machinery), Nutshell (won/lost/**cancelled** + outcomes), noCRM (To-Do/Standby/Won/Lost/**Cancelled**).
- **Typed/flagged stages**: HubSpot (stages flagged Won/Lost with probability), Salesforce (IsClosed/IsWon derive from StageName), Zoho (stage type Open/Closed Won/Closed Lost + forecast_type), Bigin (closed stages, up to 5), Freshsales (Won/Lost stages in every pipeline, renamable), Close (status_type active/won/lost — undeletable), Bitrix24 (stage semantics process/success/failure), Sugar, Capsule (complete milestones, probability must be 0 or 100), Pipeline CRM (0% = Lost, 100% = Won — welded to probability).
- **Hybrid/dual**: Keap Pro/Max (Won/Lost board columns AND a Status dropdown), GHL (status field AND auto-created Won/Lost stages).

**nrtur is in the typed-stages camp (like HubSpot/Zoho) with `dealTerminalKind()` + an `outcome` object.** The status-camp's one real advantage — closing from any stage while remembering where the deal died — nrtur already gets via `stageHistory` (the pre-close stage is preserved).

---

## Part 2 — Capability comparison tables

### 2.1 Multi-pipeline mechanics

| CRM | Multi-pipeline | Limit (plan-gated) | One deal, many pipelines | Cross-pipeline automation |
|---|---|---|---|---|
| nrtur | ✅ | unlimited (prototype) | ❌ today — but D3 `stagePlacements[]` array is already the Attio-entry shape | ❌ (roadmap) |
| Pipedrive | ✅ | no documented cap | ❌ | ❌ |
| HubSpot | ✅ | **1/2/15/100 by tier** (legal catalog, VERIFIED) | ❌ | workflows |
| Salesforce | ✅ (record type + sales process) | record-type caps by edition | ❌ | flows |
| Dynamics 365 | ✅ (BPFs) | **10 active BPFs/table, 30 stages each** | ✅ **up to 10 concurrent instances** | yes |
| Zoho CRM | ✅ | 0/5/10/20/50 by edition | ❌ | CommandCenter |
| Bigin | ✅ | 1/3/5/15 (+$5 add-on) | ❌ | **Connected Pipelines (auto-move)** |
| Freshsales | ✅ | 1/10/25 | ❌ | workflows |
| ActiveCampaign | ✅ | **unlimited** | ❌ | automations |
| Close | ✅ | all plans, no cap | ❌ | ❌ |
| Copper | ✅ | no cap documented | ❌ (duplicate-on-Won offer) | won-handoff duplicate |
| Bitrix24 | ✅ | plan-gated (numbers unpublished) | ❌ (tunnel Copy = 2nd record) | **Tunnels (visual, Move/Copy, delays/conditions)** |
| GoHighLevel | ✅ | no cap documented | ❌ (duplicates, setting-gated) | workflow triggers |
| Nutshell | ✅ | **5/10/unlimited** | ❌ (cloning) | auto-close, distribution rules |
| Capsule | ✅ (Growth+) | **max 30** | ❌ | ❌ |
| Insightly | ✅ | no cap documented | ❌ (explicit one-pipeline rule) | Activity Sets |
| monday CRM | boards | plan column/dashboard caps | ❌ (mirrors read-only) | automations |
| Attio | lists | no cap | ✅ **entries: many lists, even 2× same list** | workflows |
| Streak | ✅ | no cap | ❌ | ❌ |
| noCRM / Pipeline CRM | ✅ | 1/unlimited · **1/2/5** | ❌ (explicit / Copy) | ❌ |
| aNinja | workflows only | undocumented | undocumented | step-change sequences |

### 2.2 Stage configuration & gates

| CRM | Per-stage probability | Rotting/idle | Blocking required fields on stage entry | Extra governance |
|---|---|---|---|---|
| nrtur | ✅ | ✅ per-stage rotDays | ✅ all move paths, inline fill, bulk skip-and-report | gates chain into outcome modal |
| Pipedrive | ✅ | ✅ per pipeline | ✅ Professional+ — **bypassable via API/import/automations** | Important-fields nudge |
| HubSpot | ✅ | inactivity greying | ✅ conditional stage properties | **pipeline rules: no-skip, no-backwards, stage-scoped editing, non-bypassable approvals (Ent)** |
| Salesforce | ✅ (DefaultProbability) | ❌ (activity alerts) | validation rules (not a named feature) | Path guidance (non-blocking) |
| Dynamics | ❌ | ❌ (AI scoring instead) | ✅ **"stage-gating"** — named, blocking | multi-table BPFs |
| Zoho CRM | ✅ (shared per stage name!) | ❌ | ✅ **Blueprint** (fields+checklists+attachments, Pro+) | strongest gate engine |
| Bigin | ❌ | ❌ | ✅ Stage Transition Rules (Premier+) | **closure restrictions** (can't close from early stages) |
| Freshsales | ✅ (not retroactive) | ✅ red cards + filter | ❌ (field dependency on forms only) | — |
| Close | ❌ (per-deal confidence) | ❌ | ❌ | — |
| Copper | ✅ | ✅ "slipping" (not in new board) | ❌ | per-pipeline field layouts |
| Bitrix24 | ❓ (deal field only) | activity counters | ✅ **per stage AND per pipeline** | per-stage move permissions |
| GHL | ❌ | ✅ stale trigger (automation) | ❌ | — |
| Nutshell | ❌ (per-lead confidence) | ✅ isOverdue in data model | goals auto-advance (not blocking) | stage goals (9 evidence types) |
| Capsule | ✅ required per milestone | ✅ daysUntilStale per stage | ❌ | probability-ordered columns |
| monday | column, not stage | ❌ | ✅ conditional status changes (→ being replaced) | — |
| Attio | ❌ | ✅ target_time_in_status (red counter) | ❌ (feature request) | — |
| ActiveCampaign | ❌ — **ML win probability** (100+ factors, weekly retrain) | ❌ | ❌ | — |
| Pipeline CRM | ✅ (0/100 = closed) | ✅ Slipping Away + daily email | ❓ | health-status axis |
| noCRM | ✅ per step (history-suggested) | ✅ **structural** (Standby requires a reminder) | ❌ (anti-form philosophy) | — |
| Streak / Folk / Insightly / Keap Pro / Sugar / aNinja | ❌/❌/❌/❌ (Classic ✅)/✅ enforced/status-level | magic columns/❌/❌/❌/report-only/❌ | ❌ all | — |

### 2.3 Close semantics

| CRM | Won/Lost mechanism | Lost reasons | Win reasons | Reopen |
|---|---|---|---|---|
| nrtur | typed stages + outcome object | ✅ configurable, prompted every path | ✅ configurable, prompted | ✅ clears stale outcome on every path |
| Pipedrive | **separate status** | ✅ freeform or predefined (≤100) | ❌ | API-writable; semantics undocumented |
| HubSpot | flagged stages | ✅ **default property** + report | ✅ **default property** | undocumented |
| Salesforce | stage-derived flags | ❌ (custom field) | ❌ | edit stage back |
| Dynamics | **separate status** + Opportunity Close activity | ✅ configurable status reasons | ✅ **configurable + custom fields** | ✅ **"Reopen Opportunity" command** |
| Zoho | stage types | ❌ (Blueprint DIY) | ❌ | undocumented; forecast locked |
| Freshsales | Won/Lost stages | ✅ **first-class field wired to Lost** | ❌ | undocumented |
| Close | status_type on stage | ❌ (custom field) | ❌ (custom field) | set active status |
| Copper | **status incl. Abandoned** | ✅ prompted dropdown + report | ❌ | undocumented |
| GHL | **status incl. abandoned** (+dual stages) | ✅ configurable, optional | ❌ | freely editable |
| Nutshell | **status won/lost/cancelled** | ✅ Outcomes + **competitor capture** | ❌ (product pricing prompt) | ✅ **POST /reopen endpoint** |
| Capsule | complete milestones | ✅ + **includedForConversion flag** | ❌ | ✅ **restores prior milestone** |
| Insightly | **5-state** field | ✅ state reasons | ✅ (state reasons on Won) | via Suspended |
| Keap Max Classic | Win/Loss stages | ✅ **optionally REQUIRED** | ✅ **optionally REQUIRED** | undocumented |
| Pipeline CRM | probability-welded | ✅ + optional mandatory prompt | ✅ same feature | undocumented |
| Bitrix24 | stage semantics | multiple failure stages (no field) | ❌ | terminal stages exitable |
| monday/Attio/Streak/Folk/AC/aNinja | labels/status option/name convention/field value/status field/opp status | ❌ native (all DIY) | ❌ | unmodeled |

### 2.4 Safety: deleting a pipeline that still has deals (full verified spectrum)

| Behavior | CRMs |
|---|---|
| **Blocked until empty** | HubSpot, Bitrix24 (even recycle-bin deals count), Capsule, Insightly, Close (statuses must go first), Copper (must delete every opp — worst) |
| **Prompt: transfer or delete** | Zoho (stage remap prompt; closed deals preserved), **Keap (delete-or-move prompt — cleanest UX)** |
| **Forced auto-reassign** | Pipeline CRM (active → another pipeline+stage), Freshsales (silent → default pipeline's first stage), **nrtur (auto-reassign to next pipeline's first stage + history stamp)** |
| **Destructive** | Bigin (**records permanently deleted**), ActiveCampaign (**API cascade-deletes stages AND deals**), Pipedrive (stage delete kills its deals; 30-day restore) |

---

## Part 3 — Verdict for nrtur

### Where nrtur is already at or above market (verified against this research)
1. **Stage gates on every move path with inline fill + bulk skip-and-report** — only HubSpot/Zoho/Bitrix24/Bigin/Dynamics have blocking gates at all; Pipedrive's is bypassable; nobody documents inline fill that chains into the close-reason modal.
2. **Win reasons + loss reasons, both configurable and prompted** — only Keap Max Classic and Pipeline CRM have symmetric requireable reasons; HubSpot has the properties but no forced prompt.
3. **Reopen hygiene** — clearing stale outcome on reopen matches Dynamics/Nutshell first-class reopen; most of the market leaves it undocumented.
4. **Stage history + stageEnteredAt on the record** — matches Salesforce OpportunityHistory / HubSpot date-entered timestamps; ahead of Folk/monday (no history at all).
5. **Delete-never-orphans** — mid-spectrum, deliberate; better than 6 products including two that destroy data.
6. **D3 stagePlacements[] storage** — the Attio-entry shape is already on every deal; no classic competitor has a path to multi-residency at all.

### Where nrtur is verifiably behind
1. **No funnel/stage-conversion report and no time-in-stage report** — Pipedrive, HubSpot, Close, Nutshell, Attio, Capsule, Streak, Sugar Premier all have stage-duration or conversion analytics. We capture the data (stageHistory) but don't chart it. **Highest-value gap.**
2. **Pipeline reference is a name string, not an id** — market stores pipeline_id; our rename-cascade works but it's the known name-link root-cause pattern.
3. **Creation is ungated** (gates only on transitions) — same as HubSpot, but their conditional properties also fire on create-in-stage.
4. **No per-pipeline permissions** — Bigin/Bitrix24/Streak/Attio/AC/HubSpot(team) all scope pipeline access.
5. **No forecast view by close date** (P2 roadmap) — Pipedrive forecast kanban, HubSpot forecast tool, Freshsales commit workflow.

### Steal-list (prioritized, each verified above)
1. **Funnel + time-in-stage reports from stageHistory** (we already have the data — pure win) — P2 promote.
2. **Capsule's reopen-to-prior-stage** (stageHistory makes this one line) + **includedForConversion** on lost reasons (excludes junk losses from win-rate).
3. **Bigin Connected Pipelines / Bitrix24 tunnels** — auto-move a deal to another pipeline on Won (our automation engine + multi-pipeline are both live; this is the market's answer to multi-residency and it's cheap for us).
4. **Pipedrive board drop-zones** (Won/Lost/Move-to-pipeline/Delete at the bottom while dragging).
5. **Freshsales per-user preferred pipeline** (defaults for new deals + board landing).
6. **Copper "Abandoned"/Insightly "Suspended"** — a non-lost parking state; we'd model it as a stage type or outcome variant.
7. Later/architectural: **Attio-style multi-placement** activation of stagePlacements (phase 2 of D2), which no classic competitor can follow.

---

# APPENDIX — Per-CRM verified findings (source + tag on every claim)

# Pipedrive

## A. Core data model
1. Deal record carries **`pipeline_id`** (integer), **`stage_id`** (integer), and **`status`** (string, `open`/`won`/`lost`) as three separate fields; also `probability`, `lost_reason` ("Can only be set if deal status is lost"), `won_time`/`lost_time` ("Can only be set if deal status is won/lost"). [SOURCE: https://developers.pipedrive.com/docs/api/v1/Deals] VERIFIED
2. No multi-pipeline membership — one `pipeline_id` + one `stage_id`, structural in the API. [SOURCE: same] PARTIAL (implied by data model)
3. Moving pipelines: three UI methods, all require picking BOTH destination pipeline and stage: (a) board drag to "Move to" option; (b) list-view bulk edit; (c) detail view pipeline/stage click. No auto stage-mapping. History caveat: "Moving a deal to another pipeline affects reporting in Insights. Deal progress reports only reflect movements within the current pipeline," plus advisory "If you often move deals between pipelines, review your pipeline structure." [SOURCE: https://support.pipedrive.com/en/article/how-can-i-move-a-deal-to-another-pipeline] VERIFIED
4. **CONFIRMED: Won/Lost is a separate `status` field (`open`/`won`/`lost`), independent of `stage_id`** — deal keeps its stage while status changes. [SOURCE: API Deals] VERIFIED. Won/lost deals removed from Pipeline View. PARTIAL (snippet)

## B. Multi-pipeline management
5. No pipeline cap documented; usage-limits page lists only leads+deals caps (Lite 2,500×seats … Ultimate 20,000×seats, 300k company max). [SOURCE: https://support.pipedrive.com/en/article/usage-limits-in-pipedrive] VERIFIED. "Only users with deal admin permissions can set up and edit pipelines." [SOURCE: https://support.pipedrive.com/en/article/how-can-i-have-multiple-pipelines] VERIFIED. Pricing page 403'd — plan wording UNVERIFIED.
6. **Destructive: "Deleting a stage will also delete the deals in that stage"** — move deals first; deleted deals recoverable 30 days via Restore data. [SOURCE: https://support.pipedrive.com/en/article/how-can-i-customize-my-pipeline-stages] VERIFIED
7. Per-pipeline visibility/permissions and default-pipeline concept: UNVERIFIED — not documented (deal-duration report references "[your default pipeline]" filter, implying one exists — PARTIAL).

## C. Stage configuration
8. **Stage probability** (defaults 100%; "The deal probability is always prioritized over the stage probability"; weighted value = value × probability/100) [SOURCE: https://support.pipedrive.com/en/article/probability-in-pipedrive] VERIFIED. **Deal rotting**: per-pipeline days setting, notification when deals idle past it. [SOURCE: customize-pipeline-stages article] VERIFIED (plan gating UNVERIFIED).
9. **Two-tier: Required fields (blocking, Professional+)** — per pipeline AND per stage ("select which pipelines and stages your field will be required for"); users "prompted to add the required information" on stage move. **Known bypass: import, bulk-edit, API, automations, integrations don't enforce.** [SOURCE: https://support.pipedrive.com/en/article/required-fields] VERIFIED. **Important fields** (nudge, non-blocking) flag missing data per stage/pipeline. PARTIAL (snippet).

## D. Close semantics
10. Lost reasons: **default freeform**; admins can switch to predefined lists (Company settings > Lost reasons), optionally allowing freeform alongside; cap 100 reasons; saved "as a note in the deal's detail view"; reportable in list column + Insights. [SOURCE: https://support.pipedrive.com/en/article/lost-reasons] VERIFIED. Mandatory-ness: UNVERIFIED.
11. Win reasons: no feature in KB or API (only `lost_reason` exists). UNVERIFIED — not documented.
12. `status` writable back to `open` via API; `won_time`/`lost_time` "can only be set if" deal holds that status. VERIFIED. What happens to close data on reopen: UNVERIFIED. "The progress bar won't be updated once the deal is won." [SOURCE: deal-detail-view article] VERIFIED

## E. Board UX
- Drag-drop with bottom drop zones: **Won, Lost, Move to (another pipeline), Delete**; rotting deals highlighted; default card sort "by next activity." [SOURCE: https://support.pipedrive.com/en/article/pipeline-view] VERIFIED
- Totals: board-top total value + total weighted value; hover stage name for stage totals. [probability article] VERIFIED
- **Forecast view (Professional+)**: kanban by expected-close-date columns; weighted values shown; won deals use won date. [SOURCE: https://support.pipedrive.com/en/article/the-forecast-view-revenue-projection] VERIFIED

## F. Reporting
- **Deal conversion report**: stage funnel (pipeline filter "can't be removed") + win/loss by owner. [SOURCE: insights-reports-deal-conversion] VERIFIED
- **Deal duration report**: avg per-stage days; skipped stages still counted. [SOURCE: insights-reports-deal-duration] VERIFIED
- Lost-reason reporting via deal performance reports. VERIFIED

## G. Extras
- Duplicate merge covers **deals** + people + orgs; can't be un-merged. [SOURCE: https://support.pipedrive.com/en/article/merge-duplicates] VERIFIED
- No per-contact deal restriction documented. PARTIAL
- Deleted deals restorable 30 days, "will reopen to the same stage it was at when it was deleted." PARTIAL (snippet)

**Standouts/gaps:** Cleanest tri-field model (pipeline_id + stage_id + independent status) — rumor CONFIRMED in API. Richest stage config (probability + rotting + required/important fields). Board UX benchmark (drop zones, weighted totals, forecast kanban). Gaps: destructive stage deletes; cross-pipeline moves break progress reporting; no win reasons; no documented reopen semantics; required-fields bypassable via API/import/automations.

---

# Close

## A. Core data model
1. **The opportunity's stage IS its status**: `status_id`, `status_label`, `status_type`, plus denormalized `pipeline_id`/`pipeline_name`; also `confidence` (per-deal), `value`, `expected_value`, `annualized_value`, `date_won`, `date_lost`. [SOURCE: https://developer.close.com/api/resources/opportunities/create.md] VERIFIED
2. One opportunity = one `status_id`; each status belongs to one pipeline ("Pipelines are named and ordered groups of Opportunity Statuses"). [SOURCE: https://developer.close.com/api/resources/pipelines.md] PARTIAL (implied)
3. Moving pipelines = changing to a status in the other pipeline; no mapping prompt concept (status IS stage). On create, "the organization's default (first) status will be used (or the first status of the `pipeline_id` if provided)." VERIFIED. Admins can "drag and drop Statuses across Pipelines" (moving the status itself, with its opportunities!). [SOURCE: https://help.close.com/docs/opportunity-statuses] VERIFIED
4. **Hybrid**: every status carries `status_type` of `active`/`won`/`lost` — "Won" is itself a pipeline status. "Both Won and Lost statuses cannot be removed." Won-type status auto-sets `date_won` "if not already set." [SOURCES: opportunity-statuses API + create API] VERIFIED

## B. Multi-pipeline management
5. **Multi-pipeline on ALL plans** (even Solo): "All Close plans… include a default 'Sales' Pipeline and support creating additional Pipelines"; "Up to 300 [opportunities] per lead." [SOURCES: help + https://close.com/pricing] VERIFIED
6. Guard-railed delete: "Deletion is only allowed if the Pipeline doesn't contain any Opportunity Statuses"; status delete: "You should make sure no opportunities are assigned this status, first." [SOURCES: pipelines/delete + opportunity-statuses/delete API] VERIFIED
7. Default = built-in "Sales" pipeline; per-pipeline permissions: UNVERIFIED — not documented.

## C. Stage configuration
8. **No per-stage probability** — `confidence` is per-opportunity; weighted = Value × Confidence. VERIFIED. Rotting/idle: UNVERIFIED — no feature documented.
9. Required-fields-on-stage-entry: UNVERIFIED — no such feature documented.

## D. Close semantics
10. No built-in lost-reason list — official guidance is a custom field ("track specific reasons a deal was won or lost"). [SOURCE: https://www.close.com/blog/custom-fields-on-opportunities/] VERIFIED
11. Win reasons: same custom-field route (quote covers "won or lost"). VERIFIED
12. Reopen = set status back to active-type; `date_won` auto-set only "if not already set" (implying persistence); clearing on reopen UNVERIFIED.

## E. Board UX
- Pipeline View kanban: drag between statuses; drag "to the bottom… to mark them as Won or Lost"; column totals auto-recalculate; values switchable actual/expected (× confidence) and one-time/monthly/annual; can show Won/Lost columns; "Multiple Pipelines and Pipeline filtering are available on all Close plans." [SOURCES: help pipeline-view + blog] VERIFIED

## F. Reporting
- **Opportunity Funnels report**: per-stage Count/Value/Weighted Value; "In between each stage, you'll see the Conversion Rate" (direct-advance only — skipped stages NOT counted); velocity via "Avg Time to Advance"; date filters Was Active/Won/Lost vs Was Created. [SOURCE: https://help.close.com/docs/opportunity-funnels-report] VERIFIED
- Win/loss reason reports: custom-field reporting only. PARTIAL

## G. Extras
- No opportunity merge; lead-level merge only, can't be unmerged. [SOURCE: https://help.close.com/docs/edit-merge-delete-leads] VERIFIED
- "Up to 300 [opportunities] per lead." VERIFIED
- Oddity: statuses are global objects grouped by pipeline; admins drag a whole status (with deals) across pipelines. VERIFIED

**Standouts/gaps:** Simplest coherent model — status IS the stage, typed active/won/lost, won/lost undeletable. Multi-pipeline on every plan. Funnel methodology unusually honest (direct conversions + avg-time-to-advance). Gaps: no native reasons, no required fields, no rotting, no per-stage probability, no opportunity merge, reopen semantics undocumented.

---

# Copper

## A. Core data model
1. Opportunity carries **`pipeline_id`**, **`pipeline_stage_id`**, separate **`status`** ("Open," "Won," "Lost," **"Abandoned"**), `win_probability` (0–100), `loss_reason_id`, `monetary_value`, `close_date`, `priority`, `pipeline_type` ('opportunity'/'project'/'item'), `pipeline_is_revenue`. [SOURCE: https://developer.copper.com/opportunities/overview.html] VERIFIED
2. Single pipeline per opportunity. **Workaround = duplication: "When you change the status to 'Won'… you will be given the option to duplicate this Opportunity into another Pipeline."** [SOURCE: https://support.copper.com/en/articles/10438954-chapter-4-building-and-managing-processes] VERIFIED
3. Moving pipelines re-skins instantly: "the layout of the opportunity is updated immediately to reflect the new pipeline's layout." [SOURCE: https://support.copper.com/en/articles/8823263-customize-opportunity-fields-by-pipeline] VERIFIED. Landing stage + history preservation: UNVERIFIED.
4. **Four-valued status separate from stage**: Open/Won/Lost/**Abandoned** ("limbo state… hold or delay the timeline"). [SOURCES: API + working-with-opportunities] VERIFIED

## B. Multi-pipeline management
5. Multiple pipelines supported, no numeric cap documented. Plan gating murky: help says "Basic (without Sales Tracking), Professional, Business"; pricing shows "Customizable sales pipelines" on all plans, "Revenue tracking" Pro+. [SOURCES: help + https://www.copper.com/pricing] VERIFIED (both statements)
6. **Hard block, worst surveyed: "You can't delete a Pipeline without first deleting all the Opportunities inside it, including any that were marked as Won, Lost or Abandoned"** — and deleted opportunities "are gone forever." [SOURCE: community forum] PARTIAL — weak source
7. Per-pipeline **field layouts** exist but "This is not a data security tool." VERIFIED. True per-pipeline permissions: UNVERIFIED.

## C. Stage configuration
8. **Per-stage win_probability** (API: stages nest win_probability; auto-updates deal's Win Probability on stage entry, overridable per deal; requires Sales Tracking). [SOURCES: list-pipelines API + processes chapter] VERIFIED. **Slipping opportunities**: configurable inactive-days notification — but "not yet available in New Board View." [SOURCE: working-with-new-pipelines] VERIFIED
9. Required fields on stage entry: UNVERIFIED — not documented (layouts control visibility only).

## D. Close semantics
10. **Loss Reasons = default dropdown field** with presets Competitor/Features/Price; fully customizable; **prompted on loss: "When you drag an opportunity into the 'Lost' box, you'll be prompted to fill it out"**; mandatory-ness not stated. [SOURCE: https://support.copper.com/en/articles/8823335-understand-and-customize-loss-reasons-field] VERIFIED
11. Win reasons: UNVERIFIED — not documented (only loss_reason_id in API).
12. Status writable back to Open via API; loss_reason clearing on reopen: UNVERIFIED.

## E. Board UX
- Board with drag-drop; "the total value of opportunities is summarized by stage" (Sales Tracking); Won/Lost drop boxes (loss-reason prompt on Lost drop). VERIFIED
- Weighted forecast on board: UNVERIFIED — weighting lives in reports.

## F. Reporting
- **Pipeline Projection Weighted** report (stage value × stage win probability, unweighted vs weighted side by side). [SOURCE: legacy-reports-pipeline-projection] VERIFIED
- **Sales by Loss Reasons** report + **Sales by Owner** with win rate formula; multi-pipeline filterable. [SOURCE: pipeline-reports article] VERIFIED
- Stage conversion funnel / stage-duration reports: UNVERIFIED — not found.

## G. Extras
- Merge covers People/Companies/Leads only — **opportunities NOT mergeable**; merge final. [SOURCE: managing-duplicates] VERIFIED
- **Typed pipelines** (`opportunity`/`project`/`item`, `is_revenue` flag) — same engine powers non-sales processes. VERIFIED
- **Won-handoff pattern**: duplicate-into-pipeline offer on Won. VERIFIED

**Standouts/gaps:** Only one of the trio with native "on hold" close state (Abandoned). Per-pipeline field layouts re-render on switch; typed revenue/non-revenue pipelines. Loss reasons prompted + dedicated report. Gaps: brutal pipeline deletion; no funnel/duration reports; no opportunity merge; several behaviors (landing stage on move, reopen, caps, required fields) undocumented; slipping flags missing from new board.

---

# HubSpot

## A. Core data model
1. Pipeline membership + stage = two deal properties: `pipeline` and `dealstage` (e.g. `"pipeline": "default"`, `"dealstage": "contractsent"`); core properties dealname/dealstage/pipeline/amount/closedate/hubspot_owner_id. [SOURCE: https://developers.hubspot.com/blog/a-developers-guide-to-hubspot-crm-objects-deals-object] VERIFIED. "If a pipeline isn't specified, the default pipeline will be used"; internal stage IDs required, not labels. [SOURCE: https://developers.hubspot.com/docs/api-reference/crm-deals-v3/guide] PARTIAL (auth-walled; search index). KB: Pipeline = "The pipeline a deal is in, which determines the deal stages the deal will move through." [SOURCE: https://knowledge.hubspot.com/properties/hubspots-default-deal-properties] VERIFIED
2. One pipeline at a time; `pipeline` single-valued; "moving" = editing it. [SOURCE: https://knowledge.hubspot.com/records/move-a-record-from-one-pipeline-to-another] VERIFIED. Duplicate-deal workaround not officially documented. UNVERIFIED
3. Moving opens a dialog — user must "click the dropdown menus and select the pipeline and stage" (forced stage pick, single + bulk). Nothing about remap/clearing history. VERIFIED. Stage history retained as auto "Date entered [stage]" timestamps per stage (power funnel reports). [SOURCE: https://knowledge.hubspot.com/reports/create-new-custom-funnel-reports] VERIFIED
4. **Won/Lost are STAGES, flagged per stage**: "you must include stages for both Won and Lost under Deal probability"; each stage carries probability ("Closed won (100%, Won)"). Derived read-only properties: "Is closed lost", "Is Closed Won". Close date auto-set on entering a closed stage (automation can be disabled). [SOURCES: https://knowledge.hubspot.com/object-settings/set-up-and-customize-pipelines + default-deal-properties] VERIFIED

## B. Multi-pipeline management
5. **Pipeline limits by tier (from HubSpot's legal Product & Services Catalog): Free = 1, Starter = 2, Professional = 15, Enterprise = 100.** Starter+ to create; Professional+ to clone. [SOURCE: https://legal.hubspot.com/hubspot-product-and-services-catalog] VERIFIED
6. **Deletion blocked while populated:** "You can't delete a pipeline if it contains records or is used in other HubSpot tools" — move/delete records first. VERIFIED
7. Per-pipeline access: "Manage access" per pipeline; "A Professional or Enterprise subscription is required to restrict a pipeline by team." Default Sales Pipeline with seven stages. VERIFIED

## C. Stage configuration
8. Every stage has win probability (0–100%); record's "Deal probability" auto-updates on stage change unless overridden; "Weighted amount = Amount × Deal probability." Idle deals: board toggle for "card inactivity" with configurable timing (e.g. 14 days) — visual greying, not a data flag. VERIFIED
9. **"Conditional stage properties"**: show properties when a record is created in / moved to a stage, with Required checkbox — "users cannot create or update the record until they set a value" (BLOCKING). VERIFIED (mechanism) / PARTIAL (Starter+ gating). **Pipeline rules (Pro/Ent):** "Set stages where new records can be created", "Restrict skipping stages", "Restrict moving records backwards", "Limit who can edit records in certain stages", deal approvals (Enterprise, "cannot be bypassed"); other rules bypassable by Super Admins, workflows, user-less API calls. [SOURCE: https://knowledge.hubspot.com/object-settings/set-up-pipeline-rules] VERIFIED

## D. Close semantics
10. **Default property "Closed lost reason"** out of the box; can be made required at closed-lost stage via conditional stage properties; dedicated "Deal Loss Reasons" sales analytics report. VERIFIED (composition PARTIAL)
11. **Default property "Closed won reason"** — yes, win reasons native. VERIFIED
12. Close date auto-set on closed-stage entry; reopen side-effects (clearing reason/date) NOT documented. UNVERIFIED

## E. Board UX
- Per-stage column totals: Total amount + optional Weighted/Average amount; rounding + "Show formatted amounts" toggle. VERIFIED/PARTIAL
- View-level insights bar (Starter+): total amount, weighted amount ("excluding closed lost"), open/closed/new amounts, average deal age, real-time. [SOURCE: https://knowledge.hubspot.com/records/review-data-insights-on-deal-views] VERIFIED
- Board: drag-drop, hide/show stages, group-by, filters, customizable card sections, inactivity greying. VERIFIED

## F. Reporting
- Sales analytics suite (Starter+): **Deal Velocity**, **Deal Push Rate** ("deals whose close date changed"), **Time Spent in Deal Stage**, **Deal Funnel** (counts + conversion + duration), **Deal Pipeline Waterfall**, **Forecast Category**, **Deals Won & Lost**, **Deal Loss Reasons**. [SOURCE: https://knowledge.hubspot.com/reports/create-sales-reports-in-the-sales-analytics-suite] VERIFIED
- Custom funnel reports on "Date entered [stage]" timestamps; skipped deals excluded from that stage's conversion (Pro+). VERIFIED
- Forecast tool (Pro/Ent): weighted pipeline by stage probability OR forecast categories; manual submissions; per-pipeline goals. VERIFIED

## G. Extras
- **Deal merge** native; "It's not possible to unmerge records." VERIFIED
- **Deal splits** (Enterprise): percentages to 100%, owner always included, flow into forecast + reports. VERIFIED
- **Line items/products on ALL plans**: product library, unit discounts, tax rates, auto TCV/ACV/ARR/MRR. VERIFIED
- Standout: non-bypassable deal approval processes (Enterprise pipeline rule). VERIFIED

**Strengths/gaps:** Deepest close semantics (per-stage won/lost flags + probability, DEFAULT won AND lost reason properties, auto close date). Governance unmatched (conditional required stage properties, no-skip/no-backwards rules, stage-scoped edit rights, non-bypassable approvals, team-restricted pipelines). Reporting breadth mostly Pro+. Hard tier gates (1/2/15/100 pipelines). Reopen behavior undocumented; deletion requires manual evacuation.

---

# ActiveCampaign

## A. Core data model
1. Deal carries `group` ("Pipeline ID"), `stage` (stage ID), `status` (integer), `value`, `currency`, `percent`, `winProbability`, `owner`, `contact`, `organization`, `nextdate`… Create requires contact, stage, title. [SOURCES: https://developers.activecampaign.com/reference/create-a-deal-new + retrieve-a-deal] VERIFIED
2. One `group` + one `stage` per deal; "Deals can be moved between pipelines and stages" — no multi-membership. [SOURCE: https://developers.activecampaign.com/reference/deal] VERIFIED (model) / UNVERIFIED (workarounds)
3. Move = update `group`/`stage` (record edit, bulk, API). UI prompt details undocumented. VERIFIED/UNVERIFIED
4. **Won/Lost = separate STATUS field: 0 Open, 1 Won, 2 Lost.** Help center explicit: "updating the status of a deal is different from updating the stage… when you update the stage… the deal's status will remain Open." Drag to top-left of pipeline page = Won, top-right = Lost. "Only by changing the status of that deal does the software recognize that a deal is closed." [SOURCES: API deal + https://help.activecampaign.com/hc/en-us/articles/360000240450] VERIFIED

## B. Multi-pipeline management
5. **"You can create an unlimited number of pipelines"; "There is no limit to the number of stages."** [SOURCE: https://help.activecampaign.com/hc/en-us/articles/206797510] VERIFIED. CRM now ships as "Enhanced CRM Add-on" (Pipeline management, Deal records, Win probability…) across tiers. [SOURCE: https://www.activecampaign.com/pricing] VERIFIED
6. **Deletion cascades hard:** "If trying to delete a pipeline that still has existing deals and stages associated with it, the DELETE request will remove all stages and deals associated with it." [SOURCE: https://developers.activecampaign.com/reference/delete-a-pipeline] VERIFIED
7. Per-pipeline access native (user groups selected at creation); per-pipeline default currency; three default stages. [SOURCE: https://help.activecampaign.com/hc/en-us/articles/360000030899] VERIFIED. Default-pipeline concept: UNVERIFIED.

## C. Stage configuration
8. **No manual per-stage probability. Win Probability is MACHINE-LEARNED per deal**: "calculated from factors that correlate with deals marked as Won in a pipeline… specific and unique to each pipeline" (100+ factors, top 20 shown, weekly Saturday retrain); needs 100–150 Won deals else "Not yet calculated"; per-pipeline settings. [SOURCE: https://help.activecampaign.com/hc/en-us/articles/115001911324] VERIFIED. No idle/rot flags; stages can sort by "Deal Age", "Win Probability", "Deal Score". VERIFIED
9. Required properties on stage entry: UNVERIFIED — no such feature documented anywhere.

## D. Close semantics
10. No native lost reasons — official marketplace recipe: "you'll need to build a Lost Reason custom deal field." PARTIAL
11. Win reasons: UNVERIFIED (absent). 12. Status can be set back to Open via dropdown; side-effects undocumented. PARTIAL

## E. Board UX
- Kanban; drag to page corners to close Won/Lost; per-stage header color, width, deal sorting; cards show up to 4 chosen items. VERIFIED
- Stage-column value totals on board: UNVERIFIED (value-by-stage lives in Sales Performance report).

## F. Reporting
- **Deal Overview**: created/Won/Lost, win ratios by count and value, avg time to Won per owner; filter by pipeline/status. VERIFIED
- **Deal Forecast** (Plus+): daily/weekly/monthly, based on owner-entered Forecasted Close Date, with historical forecast-accuracy trending. NOT probability-weighted. VERIFIED
- **Sales Performance**: totals, "Total Deal Value (by Stage)" per owner. VERIFIED
- Funnel/stage-conversion + time-in-stage reports: UNVERIFIED (none found).

## G. Extras
- Deal merge / splits / line items: all UNVERIFIED (absent — single `value`+`currency`, custom fields only). VERIFIED (model)
- Standout: deep automation coupling + ML Win Probability; secondary contacts on deals. VERIFIED

**Strengths/gaps:** Cleanest status model (0/1/2 decoupled from stage — close from any stage without fake closed columns). ML Win Probability genuinely differentiated. Unlimited pipelines/stages + user-group access + per-pipeline currency. Gaps: no required-fields-per-stage, no native reasons, no merge/splits/line items, forecast not weighted. API pipeline delete cascades to deals. CRM = paid add-on now.

---

# Keap (Infusionsoft)

*Two products: modern Keap Pro/Max ("Pipeline"+"Deals") and legacy Max Classic (Infusionsoft "Opportunities"). Post-Thryv-acquisition, help lives at learn.thryv.com; legacy help URLs redirect/404.*

## A. Core data model
1. **Pro/Max**: deal has contact (required), name, value, notes, pipeline stage, Status; "a deal can be attached to multiple contact records." **The deals/pipeline object is NOT in the public API** ("Deals/Pipeline/Opportunities in Pro/Max are not covered by the current API" — unresolved since 2018). Max Classic Opportunity is a separate API model. [SOURCES: https://learn.thryv.com/hc/en-us/articles/36466879031437 VERIFIED + https://integration.keap.com/t/can-we-access-the-deal-pipeline-opportunity-info-in-pro-or-max-via-api/90596 VERIFIED (official forum)]
2. Multiple pipelines; deal in one at a time; transferable via Stage selector (pick pipeline + stage). PARTIAL (search index of official article)
3. Move = pick target pipeline + stage; bulk via List view "Move stage". No remap prompt documented. PARTIAL
4. **Pro/Max hybrid**: drag card into **Won or Lost stage column** OR "select the desired outcome from the Status dropdown." [SOURCE: https://learn.thryv.com/hc/en-us/articles/36649550037261] VERIFIED. **Max Classic**: designate a stage as "Win Stage" / "Loss Stage" in settings — outcome stage-based with reason capture. PARTIAL

## B. Multi-pipeline management
5. No documented pipeline cap; single-plan pricing ($299/mo) with "Sales pipeline" included. [SOURCE: https://keap.com/pricing] VERIFIED / UNVERIFIED (cap)
6. **Best deletion UX surveyed: "When a pipeline is deleted, a prompt appears asking whether existing deals in the pipeline should be permanently deleted or moved to another pipeline."** One at a time only. [SOURCE: https://learn.thryv.com/hc/en-us/articles/36861288240141] VERIFIED
7. Per-pipeline access control: UNVERIFIED. Creation from templates or custom. VERIFIED

## C. Stage configuration
8. Pro/Max: no per-stage probability or rotting documented. UNVERIFIED. **Max Classic: per-stage probability core** — "used to calculate the weighted revenue in the opportunity revenue forecast sales report." PARTIAL
9. Required properties on stage entry: UNVERIFIED for Pro/Max.

## D. Close semantics
10. **Max Classic: "select your Loss Stage… enter a list of known Loss Reasons, and optionally REQUIRE a loss reason"** when moving to that stage. PARTIAL. Pro/Max: UNVERIFIED.
11. **Max Classic: symmetric WIN reasons, also optionally requireable.** One of the few CRMs with requireable win reasons. PARTIAL. Pro/Max: UNVERIFIED.
12. Reopen: UNVERIFIED for both.

## E. Board UX
- Drag-drop kanban incl. Won/Lost columns; deal details panel (notes, emails, contacts, team members). VERIFIED
- **Stage-level Easy Automations: "Deal enters stage", "Deal exits stage", "Deal is closed" triggers** with email/text/tag actions. [SOURCE: https://learn.thryv.com/hc/en-us/articles/37890316705805] VERIFIED
- Multi-pipeline task indicator dot per tab. PARTIAL. Column totals: UNVERIFIED.

## F. Reporting
- Pro/Max Pipeline Reporting Dashboard: trend lines, rep performance, "pipeline value by stage"; updates every 15 min; **only covers deals created after Aug 10, 2021**. PARTIAL
- Max Classic: weighted revenue forecast (revenue × stage probability) + win/loss reporting on reasons. PARTIAL

## G. Extras
- Merge/splits/line items (Pro/Max): UNVERIFIED (absent). Multiple contacts per deal + team members native. VERIFIED
- **Biggest quirk: flagship Pro/Max pipeline has NO public API** — integrations use tag-based workarounds. VERIFIED (forum)

**Strengths/gaps:** Best pipeline-deletion UX researched (delete-or-migrate prompt). Max Classic's symmetric requireable Win AND Loss Reasons = strongest close-reason discipline surveyed. Stage-level automations make the board the automation surface. Severe gap: no public API for Pro/Max deals; thin data model (no probability/weighted forecast/gates/merge/splits/line items documented); docs fragmented mid-Thryv-migration.

---

## Cross-CRM notes (HubSpot/AC/Keap)
- **Won/Lost mechanism differs across all three**: HubSpot = flagged stages (+probability, is_closed props); ActiveCampaign = separate status field (0/1/2) fully independent of stage; Keap Pro/Max = hybrid (Won/Lost columns AND a Status dropdown); Max Classic = designated Win/Loss stages with reason capture. Any claim that "everyone does won/lost as stages" or "as a status" is FALSE either way.
- **Pipeline deletion**: HubSpot blocks; ActiveCampaign cascade-deletes deals; Keap prompts delete-or-move — three distinct patterns.
- **Only HubSpot documents**: forced pipeline+stage pick dialog, required properties on stage entry, deal splits, merges, line items.

---

# Salesforce (Sales Cloud) — Opportunity / Pipeline Module

## A. Core data model

1. **There is no "pipeline" object.** A pipeline is composed from three pieces: (a) the global `OpportunityStage` picklist object whose records define every stage org-wide with `MasterLabel`, `DefaultProbability`, `ForecastCategory`/`ForecastCategoryName`, `IsClosed`, `IsWon`, `IsActive`, `SortOrder` [SOURCE: https://developer.salesforce.com/docs/atlas.en-us.object_reference.meta/object_reference/sforce_api_objects_opportunitystage.htm] PARTIAL (page rendered only partially; field list implied); (b) a **Sales Process** = "a filtered list of opportunity stages" [SOURCE: https://trailhead.salesforce.com/content/learn/projects/create-an-opportunity-record-type-for-npsp/create-and-manage-stages-and-sales-processes] VERIFIED; (c) a **record type** on the opportunity that binds the process: in the Metadata API this is the `BusinessProcess` type — "A sales, support, lead, or solution process is assigned to a record type. The record type determines the user profiles that are associated with the business process," with `fullName` like `Opportunity.Bulk Orders` and `values` = the subset of StageName picklist values [SOURCE: https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_businessprocess.htm] VERIFIED. Stage on the record itself is the `StageName` picklist plus `RecordTypeId` [SOURCE: https://developer.salesforce.com/docs/atlas.en-us.object_reference.meta/object_reference/sforce_api_objects_opportunity.htm] VERIFIED.
2. **One opportunity = exactly one record type = one sales process at a time.** The record type determines which stage values appear; there is no mechanism for concurrent membership in two processes [SOURCE: https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_businessprocess.htm] PARTIAL (implied by the record-type→process model).
3. **Switching pipelines = changing record type.** Only the new process's stages become selectable; an existing stage not in the new process is not auto-remapped — open opportunities left in a "dropped" stage must be manually moved to an active stage. No remap wizard exists for record-type switches [SOURCE: https://help.salesforce.com/s/articleView?id=000384827&language=en_US&type=1] PARTIAL (the mapping prompt exists only when *deleting* a stage value). When an admin **deletes** a stage value, Salesforce prompts: "Select the appropriate stage from the drop down that all opportunities with the current stage will be replaced with"; historical Stage values in history tables are never rewritten [SOURCE: same] VERIFIED.
4. **Won/Lost is a property of the stage, not a separate field.** Each stage is typed Open / Closed-Won / Closed-Lost with a default Probability and a Forecast Category ("Probability: 30, Forecast Category: Pipeline") [SOURCE: Trailhead, above] VERIFIED. On the record, `IsClosed`/`IsWon` are read-only booleans that "automatically update based on StageName configuration," and changing StageName triggers updates to Probability and ForecastCategory [SOURCE: Opportunity object reference] VERIFIED.

## B. Multi-pipeline management

5. No documented hard cap on sales processes; practical gate = record types per object, edition-gated — Professional ≈ 3 record types/object, Enterprise+ effectively unlimited [SOURCE: https://www.salesforceben.com/what-is-salesforce-professional-edition/] UNVERIFIED (weak/blog).
6. Deleting a stage forces a remap of existing records; choosing no replacement makes the stage inactive rather than deleted [SOURCE: help KB 000384827] VERIFIED. Deactivating a sales process/record type with open records: UNVERIFIED.
7. **Per-pipeline visibility via profiles:** "The record type determines the user profiles that are associated with the business process" — but Salesforce explicitly warns "Don't use business processes as an access control mechanism" [SOURCE: BusinessProcess metadata doc] VERIFIED.

## C. Stage configuration

8. **Per-stage default probability is native** (`DefaultProbability` on OpportunityStage) [Trailhead] VERIFIED. Idle/rotting: Kanban cards "display alerts for overdue tasks and activity gaps" — no native per-stage rotting timer [SOURCE: https://help.salesforce.com/s/articleView?id=sf.kanban_considerations.htm] VERIFIED.
9. **Path** highlights key fields + guidance per stage (up to 5 key fields, 1,000-char guidance, confetti) — guidance-only, no field enforcement documented [SOURCE: https://help.salesforce.com/s/articleView?id=sf.path_overview.htm] VERIFIED. Blocking requirements = validation rules, not a named per-stage feature. UNVERIFIED.

## D. Close semantics

10. **No standard loss-reason field** on Opportunity — orgs add a custom picklist [SOURCE: Opportunity object reference] PARTIAL (absence inferred).
11. Win reasons: not tracked natively [same] PARTIAL.
12. **Reopening = editing StageName back to an Open-type stage**; IsClosed/IsWon derive from stage, no separate reopen action [same] PARTIAL.

## E. Board UX

- Kanban is list-view based, drag-drop updates records [SOURCE: https://help.salesforce.com/s/articleView?id=sf.kanban.htm] VERIFIED. Limits: **max 200 cards**; no drag without edit access; no mass actions; **"You can't group opportunities by the Forecast Category field"**; **"Closed Lost opportunities are hidden in kanban views"** (still count against the 200); no record-type change from details panel [SOURCE: kanban_considerations] VERIFIED. Column count/sum summaries: UNVERIFIED (weak).

## F. Reporting

- **Stage history first-class:** Opportunity History report exposes From Stage / To Stage / **Stage Duration**; re-entering a stage counts as a separate interval [SOURCE: https://help.salesforce.com/s/articleView?id=000392663] VERIFIED. Backing store = OpportunityHistory object PARTIAL. Forecast categories per stage feed pipeline/forecast reports [Trailhead] VERIFIED.

## G. Extras

- **Opportunity Splits**: revenue + overlay types, up to 8 split types (6 custom), requires Opportunity Teams; Enterprise+ [SOURCE: teamselling_guidelines] PARTIAL.
- **Merge:** native merge covers accounts/contacts/leads/cases; **opportunities cannot be merged natively** [SOURCE: account_merge_lex] PARTIAL.

**Strengths/gaps:**
Deepest stage semantics: stage type drives IsClosed/IsWon/Probability/ForecastCategory in one chain; OpportunityHistory gives native stage-duration analytics.
Multi-pipeline real (record type + sales process) with profile-based visibility, but admin-heavy — three setup artifacts per pipeline.
Switching pipelines is the weak spot: no remap wizard on record-type change; orphaned stages need manual cleanup.
Close semantics thin: no standard loss/win reason, no reopen ritual.
Kanban constrained (200 cards, Closed Lost hidden, no forecast-category grouping); splits + per-stage probability standout.

---

# Microsoft Dynamics 365 Sales — Opportunity / Pipeline Module

## A. Core data model

1. **Pipeline = Business Process Flow (BPF), a separate process entity layered over the opportunity.** Each BPF definition gets its own Dataverse table whose instance rows can power grids/charts/dashboards [SOURCE: https://learn.microsoft.com/en-us/power-automate/business-process-flows-overview] VERIFIED. On the opportunity row: `statecode` (0 Open / 1 Won / 2 Lost), `statuscode` (1 In Progress, 2 On Hold, 3 Won, 4 Canceled, 5 Out-Sold), `salesstage` picklist, `stepname` ("Pipeline Phase"), `processid`, `stageid` (**deprecated**) [SOURCE: https://learn.microsoft.com/en-us/dynamics365/developer/reference/entities/opportunity] VERIFIED. With multiple BPFs, "the Pipeline Phase field stores the last stage change… through any business process flow… exercise your discretion" [SOURCE: https://learn.microsoft.com/en-us/dynamics365/sales/move-opportunity-stages] VERIFIED.
2. **Yes — one record can carry multiple concurrent process instances.** "Each row can have multiple process instances associated (each for a different business process flow definition, up to a total of 10)"; default applied = first active BPF the user's security role can see [SOURCE: BPF overview] VERIFIED. **Unique: per-process stage state stored per instance — same opportunity at different stages in different processes.**
3. **Switching keeps history, no remap:** "Whenever processes are switched, the one currently rendered goes to the background… but it maintains its state and can be switched back." A user's switch persists only for that user unless pinned via client API [SOURCE: BPF overview] VERIFIED.
4. **Won/Lost is status, decoupled from stage.** statecode/statuscode govern closure independently of BPF stage; finishing a BPF "doesn't result in a stage transition"; on close "the forecast category… automatically updated to Won or Lost" [SOURCES: opportunity entity + close-opportunity docs] VERIFIED.

## B. Multi-pipeline management

5. "No more than **10 activated business process flows per table**," ≤30 stages each, ≤5 tables per multi-table flow (opportunity→quote→order→invoice) [BPF overview] VERIFIED. License gating: UNVERIFIED.
6. Deactivating a BPF with in-flight records: instances remain visible with a banner; new records don't get the flow [SOURCE: itaintboring.com blog] UNVERIFIED (weak).
7. **Per-pipeline permissions native:** "You can associate business process flows with security roles," plus ordered defaults per role [BPF overview] VERIFIED.

## C. Stage configuration

8. **No per-stage default probability.** `closeprobability` is a plain field; pipeline-view bubble chart falls back to it only when AI score absent [SOURCE: use-opportunity-pipeline-view] VERIFIED/PARTIAL. No native idle/rotting flag — UNVERIFIED.
9. **Stage-gating is a named, blocking feature:** "You can make a step *required* so that people must enter data… before they can proceed to the next stage. This is commonly called 'stage-gating.'" Disabled-but-empty required fields still block; Yes/No steps must be Yes [BPF overview] VERIFIED.

## D. Close semantics

10. **Loss reasons are configurable status reasons.** Close-as-Lost dialog captures status reason, competitor, close date, description; Lost ships with Canceled/Out-Sold; "you can add multiple status reasons corresponding to the Won and Lost statuses" (Open/Won/Lost statuses themselves "aren't customizable"). Custom reasons must be added to BOTH `Opportunity.statuscode` and `OpportunityStatusCode` on Opportunity Close "manually, and vice versa" [SOURCES: close-opportunity-won-lost-sales + customize-opportunity-close-experience] VERIFIED.
11. **Win reasons: yes, same mechanism** — custom Won status reasons + custom fields on the Opportunity Close entity, with field mappings [customize-opportunity-close-experience] VERIFIED.
12. **Closing creates an "Opportunity Close" activity record, and reopening is a first-class command**: "Select the opportunity… select Reopen Opportunity" [close-opportunity-won-lost-sales] VERIFIED.

## E. Board UX

- Kanban opt-in control, **two board types**: status-based (Open/Won/Lost lanes) and BPF-stage-based — the latter "only available for the **Sales Process** BPF" (custom BPFs get no board). Lane headers show total estimated revenue + card count; 10 cards/lane initial render; >50,000/lane breaks aggregation; not on mobile. Status-board drags open the close dialog; dragging Won/Lost→Open reopens; BPF-board drags only to adjacent lanes; closed cards show a lock icon [SOURCE: https://learn.microsoft.com/en-us/dynamics365/sales/opportunity-kanban-view] VERIFIED.
- **Pipeline view** (ex-deal manager): KPI metrics, bubble + funnel charts, editable grid with group-by/totals, side panel; close/reopen from row menu; funnel caps at 50,000 [use-opportunity-pipeline-view] VERIFIED.

## F. Reporting

- Funnel chart of estimated revenue by pipeline phase; multi-table BPF charts only reflect opportunity-bound stages [pipeline view] VERIFIED. BPF instance tables queryable — "advanced finds, views, charts, and dashboards sourced from business process flow data" [BPF overview] VERIFIED. Won/Lost analysis rides on Opportunity Close records + actual revenue [opportunity entity] VERIFIED.

## G. Extras

- **Products/line items:** catalog/write-in, price-list lookup, bundles, cross-sell suggestions, `Revenue = System Calculated` vs `User Provided` [add-products-opportunity] VERIFIED.
- Multi-table processes (opportunity→quote→order→invoice) — standout. Native opportunity merge: UNVERIFIED.

**Strengths/gaps:**
Richest process architecture: up to 10 concurrent BPF instances per record with independent, resumable stage state — the only true "one deal, many pipelines" model.
Stage-gating native and blocking; BPF instance tables make stage analytics queryable.
Close semantics best-in-class: separate status field, configurable win AND loss reasons, Opportunity Close activity, real Reopen command.
Cost = fragmentation: stage truth smeared across statecode/salesstage/stepname/instance tables; probability has no stage linkage.
Board UX lags: kanban only for stock Sales Process BPF, 10 cards/lane initial; pipeline view compensates.

---

# SugarCRM (Sugar Sell / Enterprise) — Opportunity / Pipeline Module

## A. Core data model

1. **Pipeline = one global `sales_stage_dom` dropdown; no pipeline object, no processes/record types.** Ten default stages Prospecting (10%) → Closed Won (100%) / Closed Lost (0%) [SOURCE: https://support.sugarai.com/Knowledge_Base/Opportunities_Forecasts/Understanding_Sugar_Sales_Stages/] VERIFIED. Org-wide mode decides where stage lives: **RLI mode** = Sales Stage/Probability on each Revenue Line Item, opportunity stage/status *computed* from line items; **Opportunities-only mode** = on the opportunity [SOURCES: RLI docs + admin opportunities docs] VERIFIED.
2. **Multiple pipelines don't exist.** Closest: role-based dropdown lists restrict which stage options a user's role sees [SOURCE: role-based dropdown KB] PARTIAL.
3. **The org-level mode switch is destructive:** switching back from RLI mode **deletes all RLI records** ("All Revenue Line Item records will be deleted"), values preserved only in a note; "All existing forecast data will be lost" [admin opportunities doc] VERIFIED.
4. **Won/Lost = stage classification** ("Open"/"Closed Won"/"Closed Lost" via sales_stage_dom) [Understanding Sales Stages] VERIFIED. In RLI mode opportunity Status = Closed Won only when ALL line items Closed Won, etc. [RLI docs] VERIFIED.

## B. Multi-pipeline management

5. One stage list org-wide; stages editable via Dropdown Editor with paired probabilities (`sales_probability_dom`) VERIFIED. RLI mode unavailable to Sugar Serve licenses VERIFIED.
6. No process to deactivate; destructive mode-switch only analogue VERIFIED.
7. Only role-based dropdown filtering + general team/role security — no per-process visibility PARTIAL.

## C. Stage configuration

8. **Stage→probability mapping native and enforced:** probability auto-populates from stage and "cannot be edited" [Sell opportunities guide] VERIFIED. Idle detection only as analytics: "Idle Opportunities Trend Monthly" stock report, same stage >30 days (Sell Premier) [enhanced_forecasting_reports] VERIFIED.
9. **No native required-fields-per-stage.** Enforcement requires SugarBPM or dependent fields [module docs] PARTIAL (absence).

## D. Close semantics

10. **No standard loss-reason field** PARTIAL (absence inferred). 11. Win reasons: not native PARTIAL. 12. **Reopen = edit stage back**; closed records protected from deletion ("closed revenue line items may not be deleted") VERIFIED.

## E. Board UX

- **Tile View kanban:** admins pick any dropdown field as column axis; per-column load counts; since Sugar 14 available on all modules [tile_view_settings] VERIFIED. Cascade: "Moving an opportunity from one sales stage to another in tile view will update all open revenue line items… to the new sales stage"; month-column drags rewrite all open RLIs' expected close dates [RLI docs] VERIFIED. No lane revenue-sum documented PARTIAL (absence).

## F. Reporting

- **Forecasts**: Include/Exclude/Upside commit categories, quotas, time-period worksheets [forecasts guide] VERIFIED.
- **Sell Premier stock analytics:** "Funnel Velocity & Conversion" (cohort analysis), Funnel Flow Analysis, "Win Rate Trend," Pipeline Creation Trend, Forecast Accuracy, Sales Cycle Trend, Idle Opportunities Trend [enhanced_forecasting_reports] VERIFIED. Won/lost-by-last-stage = manual report on Last Stage field PARTIAL.

## G. Extras

- **Revenue Line Items are the differentiator:** per-revenue-stream stage/probability/close date, opportunity aggregates ("most advanced stage among open items") [RLI docs] VERIFIED. support.sugarcrm.com now redirects to support.sugarai.com.

**Strengths/gaps:**
Simplest, most opinionated model: one global stage list with hard-linked non-editable probabilities — great forecast hygiene, zero multi-pipeline.
RLI mode distinctive: per-revenue-stream stages with computed opportunity status.
Org-wide mode switch is the sharpest edge surveyed — flipping back deletes every RLI + forecast data.
Close semantics minimal but closed-record deletion protection stricter than Salesforce.
Reporting stronger than the model suggests — stock cohort funnels, win-rate trends, idle reports (Sell Premier).

---

# Zoho CRM — Deals / Pipelines Module

## A. Core Data Model

1. **Pipeline mechanism = a real "Pipeline" field scoped by Layout, driving the Stage picklist.** Pipelines are configured per layout ("Pipelines are layout specific and you can create multiple pipelines for each layout"), and the Deals record carries three cooperating fields checked in the order "Layout > Pipeline > Stage". [SOURCE: https://help.zoho.com/portal/en/kb/crm/customize-crm-account/pipelines/articles/multiple-sales-pipeline] VERIFIED
2. **API confirms the model:** on insert, Deals require `Deal_Name`, `Stage` (picklist), and `Pipeline` — "this key is mandatory when a pipeline is enabled for the Deals module". Stage values are constrained per pipeline: "You can only add a stage that is available in this list to a deal for that pipeline." `Layout` is passed as `{id}`. [SOURCE: https://www.zoho.com/crm/developer/docs/api/v8/insert-records.html] VERIFIED
3. **Pipelines are child resources of layouts:** `GET /crm/v8/settings/pipeline?layout_id={id}` (layout_id mandatory); each pipeline object has `default` flag and a `maps` array of stages, each stage carrying `forecast_category` (Pipeline/Closed/Omitted) and `forecast_type` (Open / Closed Won / Closed Lost). [SOURCE: https://www.zoho.com/crm/developer/docs/api/v8/get-pipelines.html] VERIFIED
4. **One deal = exactly one pipeline at a time.** Pipeline is a single mandatory scalar field on the record; docs speak only of *moving* records between pipelines, never of co-existence. Not stated as an explicit prohibition. [SOURCE: https://www.zoho.com/crm/developer/docs/api/v8/insert-records.html] PARTIAL
5. **Switching pipelines:** "Yes, you can manually move the deals from one pipeline to another… within the same layout." Cross-layout moves require changing the deal's layout first. Mass Update works batch-wise. [SOURCE: https://help.zoho.com/portal/en/kb/crm/faqs/multiple-sales-pipeline/articles/faq-sales-pipeline] VERIFIED — a stage from the target pipeline must then be chosen since stages are constrained per pipeline (API `maps` constraint). [SOURCE: https://www.zoho.com/crm/developer/docs/api/v8/get-pipelines.html] PARTIAL
6. **Won/Lost is a stage *type*, not a separate status.** Stage-probability mapping has four factors: stage, probability (0–100), deal category (Open = "still in the sales cycle", Closed Won, Closed Lost) and forecast category; the deal category → forecast category mapping (Open→Pipeline, Closed Won→Closed, Closed Lost→Omitted) is automatic. [SOURCE: https://help.zoho.com/portal/en/kb/crm/sales-force-automation/deal-management/articles/create-deals] VERIFIED

## B. Multi-Pipeline Management

7. **Pipeline caps per edition (Deals module only):** Free = default pipeline only, Standard = 5, Professional = 10, Enterprise = 20, Ultimate = 50. [SOURCE: https://www.zoho.com/crm/complete-feature-list.html] VERIFIED
8. **Deleting a pipeline prompts a transfer with stage remap:** "Open deals must be transferred to another pipeline from the same layout. You will be prompted to transfer them when you delete a pipeline," mapping old stages to new ones; "Deals that are already closed will be kept in the deleted pipeline and will not be transferred." [SOURCE: https://help.zoho.com/portal/en/kb/crm/faqs/multiple-sales-pipeline/articles/faq-sales-pipeline] VERIFIED
9. **Per-pipeline visibility rides on layout permissions:** "Having layouts also allows you to set permission access for each layout so that only the users who need to can access it"; pipeline admin needs the Module Customization permission. [SOURCE: https://www.zoho.com/crm/tutorials/multiple-sales-pipeline/overview.html] VERIFIED

## C. Stage Configuration

10. **Per-stage probability, shared across pipelines:** each stage gets 0–100 probability feeding Expected Revenue (= Amount × Probability); caveat: "If you are using the same stage in different pipelines, the same value will be used." [SOURCE: https://help.zoho.com/portal/en/kb/crm/customize-crm-account/pipelines/articles/multiple-sales-pipeline] VERIFIED
11. **Stale/rotting deal flag:** no native rotting/idle-age feature found in any official pipeline, stage, or deal doc reviewed. UNVERIFIED (absent from official docs)
12. **Required fields on stage entry = Blueprint (blocking).** Blueprints are built on the Stage picklist; the "During" transition can mandate fields (with validation), checklists, notes/attachments/tasks, tags — "By default, these actions are mandatory" — and records cannot advance until completed. Plan gating: Professional 3 blueprints, Enterprise 50, Ultimate 100; validation rules 5/layout from Professional; Kiosk Studio from Standard (2). [SOURCE: https://help.zoho.com/portal/en/kb/crm/process-management/blueprint/articles/design-a-blueprint] VERIFIED; [SOURCE: https://www.zoho.com/crm/complete-feature-list.html] VERIFIED

## D. Close Semantics

13. **Loss reasons:** no standard/built-in loss-reason field found in official Deals docs; achievable via custom field + Blueprint During-transition capture. UNVERIFIED (no official page found claiming a native field)
14. **Win reasons:** nothing found. UNVERIFIED
15. **Reopen:** no documented reopen flow; closed deals are excluded from pipeline transfer and merge ("will only consider open deals"), and "Once the deals move to the closed (won or lost) stages, the forecast category is locked." [SOURCE: https://help.zoho.com/portal/en/kb/crm/sales-force-automation/forecasts/articles/creating-and-working-with-forecasts] PARTIAL (lock verified; reopen mechanics undocumented)

## E. Board UX

16. **Kanban = generic view with per-column aggregates:** categorize-by + aggregate-by (currency/integer/formula/rollup) shows a summed value per column; drag-drop updates the record and "the aggregated value of the respective column will get updated"; and "pipeline dropdown will be available only in the Deals module when the Kanban View is categorized by stage" — i.e. the board shows one pipeline at a time. [SOURCE: https://help.zoho.com/portal/en/kb/crm/customize-crm-account/managing-module-views/articles/kanban-views] VERIFIED

## F. Reporting

17. **Stage duration:** a "Sales Stage History" related list on the deal tracks stage-change history. [SOURCE: https://help.zoho.com/portal/en/kb/crm/sales-force-automation/deal-management/articles/create-deals] VERIFIED. Community/partner sources note duration is only captured when a deal *exits* a stage (current-stage age needs scripting). [SOURCE: https://www.theworkflowacademy.com/deal-stage-duration-updater-in-zoho-crm/] PARTIAL (weak, third-party)
18. **Forecasting is deep:** five system forecast categories (Pipeline, Best case, Committed, Closed, Omitted; first three renamable, not deletable) + 2 custom categories; targets by role, territory, or reporting hierarchy, top-down or bottom-up; forecasts from Professional edition (Standard 5 / Pro 10 / Ent 15 / Ultimate 20 forecasts). [SOURCE: https://help.zoho.com/portal/en/kb/crm/sales-force-automation/forecasts/articles/creating-and-working-with-forecasts] VERIFIED

## G. Extras

19. **Deal merge exists (rare among competitors):** Deals are a supported dedupe module; "will only consider open deals," max 3 records at a time; on merge "you can select the pipeline from one of the records but not the stage. The stage field will be populated with the value present in the record whose pipeline is chosen"; stage history of duplicates is not transferred. [SOURCE: https://help.zoho.com/portal/en/kb/crm/manage-crm-data/duplication-management/articles/merge-duplicate-record] VERIFIED
20. **CommandCenter journeys** orchestrate records (incl. deals) across modules via states/transitions/signals with a visual Journey Builder + PathFinder discovery. [SOURCE: https://www.zoho.com/crm/commandcenter/] PARTIAL (official pages surfaced via search, not deep-fetched)

**Summary — Zoho CRM**
- Strength: cleanest true data model of the three — layout → pipeline → stage hierarchy exposed end-to-end in the API, with stage types (Open/Closed Won/Closed Lost) and forecast categories as first-class metadata.
- Strength: deletion safety (forced transfer prompt + stage remap, closed deals preserved) and open-deal merge are best-in-class details.
- Strength: Blueprint is the strongest stage-gating engine surveyed (blocking fields, checklists, attachments, approvals).
- Gap: no native deal rotting/stale flag, no native loss/win reason field, shared probability per stage name across pipelines is a modeling wart.
- Gap: pipelines gated behind layouts adds admin complexity; boards show one pipeline at a time.

---

# Zoho Bigin — Pipelines Module (pipeline-first)

## A. Core Data Model

1. **The deal module IS "Pipelines"; a record carries `Pipeline` (team pipeline, object with name+id), `Sub_Pipeline` (string, required) and `Stage` (string, required).** System-mandatory fields: "Deal_Name, Sub_Pipeline, Stage"; team-pipeline ID comes "from the Get layouts metadata API" (team pipelines are layouts under the hood, like Zoho CRM). [SOURCE: https://www.bigin.com/developer/docs/apis/v2/insert-records.html] VERIFIED
2. **API v2 renamed the field: "Pipeline is modified to Sub_Pipeline"** — the record's working lane is the sub-pipeline; the Team Pipeline is the container with its own fields, record types, stages and permissions. [SOURCE: https://www.bigin.com/developer/docs/apis/v2/api-changelog.html] PARTIAL (from search snippet of official changelog); [SOURCE: https://help.zoho.com/portal/en/kb/bigin/team-pipelines/articles/team-pipelines] VERIFIED
3. **One record lives in one pipeline/sub-pipeline at a time** — "Team Pipelines" is marketing for multiple *segregated* pipelines, not multi-residency: bulk actions let you "select multiple records from any pipeline and move them to a different stage, sub-pipeline, or team pipeline" (move, not mirror). [SOURCE: https://help.zoho.com/portal/en/kb/bigin/team-pipelines/articles/team-pipelines] PARTIAL (implied by move semantics; no explicit statement)
4. **Switching pipelines:** single or bulk "Change Pipeline/Stage" moves records across stage/sub-pipeline/team pipeline; behavior for fields that don't exist in the target pipeline (each sub-pipeline has its own ≤25 custom fields) is not documented. [SOURCE: https://help.zoho.com/portal/en/kb/bigin/team-pipelines/articles/team-pipelines] VERIFIED (move) / UNVERIFIED (field-remap outcome)
5. **Won/Lost = closed stages + drop targets.** Pipelines have open and closed stages: "There must be at least two open stages" and "There can be up to five closed stages"; dragging a card raises a bottom toolbar with "Delete, Pipeline Record Lost and Pipeline Record Won." [SOURCE: https://help.zoho.com/portal/en/kb/bigin/team-pipelines/articles/team-pipelines] VERIFIED; [SOURCE: https://help.zoho.com/portal/en/kb/bigin/modules/pipelines/articles/pipeline-records] VERIFIED

## B. Multi-Pipeline Management

6. **Plan limits:** Free = "Single Pipeline"; Express = 3 Team Pipelines; Premier = 5; Bigin 360 = 15; sub-pipelines = 5 × team-pipeline count (distributable); "Additional Team Pipelines can be purchased as an add-on for 5 USD/Team Pipeline." [SOURCE: https://www.bigin.com/pricing.html] VERIFIED; [SOURCE: https://help.zoho.com/portal/en/kb/bigin/team-pipelines/articles/team-pipelines] VERIFIED
7. **Deleting a pipeline is destructive — records are deleted, not transferred:** deletion permanently removes "Records in this pipeline, Workflows, Email Templates, Tags, Email-In aliases…, Stage transition rules and closure restrictions"; the doc's only mitigation is to "export the records in the pipeline before deleting it." Sharp contrast with Zoho CRM and Freshsales. [SOURCE: https://help.zoho.com/portal/en/kb/bigin/team-pipelines/articles/team-pipelines] VERIFIED
8. **Per-pipeline permissions are native:** "Pipeline Permissions: Select the profiles that can access this pipeline" (e.g. Service team sees only the Service pipeline). Only admins create Team Pipelines. [SOURCE: https://help.zoho.com/portal/en/kb/bigin/team-pipelines/articles/team-pipelines] VERIFIED

## C. Stage Configuration

9. **Stage limits:** max 25 stages per (sub-)pipeline incl. defaults; stage descriptions up to 255 chars; min 2 open + up to 5 closed stages. [SOURCE: https://help.zoho.com/portal/en/kb/bigin/team-pipelines/articles/team-pipelines] VERIFIED. Per-stage probability / weighted values: not found anywhere in official Bigin docs. UNVERIFIED (appears absent)
10. **Stage Transition Rules (blocking stage gates):** can mandate fields, notes, files, and checklists "that users must complete when moving a record from one stage to another"; configured per pipeline+sub-pipeline with from-stage (or "Any Stage") → to-stage; limits: 30 rules/pipeline, 23 fields/rule (20 custom), checklist 1–10 items; **Premier and Bigin 360 only**. [SOURCE: https://help.zoho.com/portal/en/kb/bigin/automation/articles/stage-transition-rules] VERIFIED
11. **Closure restrictions:** admins can "restrict pipeline records from being closed during specific stages" — blocks premature Won/Lost from early stages. [SOURCE: https://help.zoho.com/portal/en/kb/bigin/faqs/trouble-shooting-faqs/articles/pipelines-sub-pipelines-stages-and-stage-transition-rules] VERIFIED

## D. Close Semantics

12. Loss/win reasons: no native reason field documented; closed stages are just custom closed stages (up to 5, so multiple lost variants possible). UNVERIFIED (absent from official docs)
13. Reopen behavior for Won/Lost records: not documented in fetched help pages. UNVERIFIED

## E. Board UX

14. **The pipeline (kanban) view is the product's centerpiece:** drag-and-drop cards between stages, "Add new stages right from your pipeline," "Collapse stages," "Resize stages," "Switch between multiple pipelines effortlessly," and a clickable "stage summary" strip that jumps to a stage; stage transition rules and closure restrictions surface directly in this view. [SOURCE: https://www.bigin.com/features/pipeline-view.html] VERIFIED (official feature page). Per-stage value totals implied by "clear stage summary of your deals" but not explicitly documented. PARTIAL

## F. Reporting

15. **Dashboards, not a report builder:** 9 chart types (column, donut, line, pie, bar, table, funnel, area, heat map), 5 KPI styles, 4 Target Meter types (Dial Gauge, Traffic Light, Single/Multiple Bar — "available only in Premier, Bigin 360 and Zoho One"), with drilldown from any data point to record list. Custom dashboards: Express 10 / Premier 20 / 360 50. No stage-duration or velocity metric documented. [SOURCE: https://help.zoho.com/portal/en/kb/bigin/modules/dashboards/articles/dashboards] VERIFIED

## G. Extras

16. **Connected Pipelines/Records — worth stealing:** records move automatically between Team Pipelines based on configured logic (e.g. Sales handoff → Onboarding pipeline), which is Bigin's answer to cross-team processes without one record living in two pipelines. [SOURCE: https://help.zoho.com/portal/en/kb/bigin/team-pipelines/articles/team-pipelines] VERIFIED (mentioned as "Connected Records"); [SOURCE: https://www.bigin.com/features/connected-pipelines.html] PARTIAL (feature page not deep-fetched)
17. Bigin supports find-and-merge of duplicate records (module coverage for pipeline records not confirmed). [SOURCE: https://help.zoho.com/portal/en/kb/bigin/data-administration/articles/find-and-merge-duplicate-records] PARTIAL (surfaced via search, not fetched)

**Summary — Bigin**
- Strength: purest pipeline-first UX — the deal module literally *is* "Pipelines," with named-pipeline switching, in-board stage editing, and Won/Lost drag targets; closest analogue to nrtur's chosen model.
- Strength: per-pipeline profile permissions and pipeline-scoped everything (fields, workflows, email-in, transition rules) — each Team Pipeline is a mini-module.
- Strength: Stage Transition Rules + closure restrictions give SMB-priced blocking stage gates (Premier+).
- Gap: destructive pipeline deletion (records permanently deleted, export-first warning) — the worst deletion story of the three.
- Gap: no stage probability/weighted pipeline, no forecasting module, no documented reopen or loss-reason model; sub-pipeline is a bare string in the API.

---

# Freshsales (Freshworks CRM) — Deals / Pipelines

## A. Core Data Model

1. **Flat FK model:** the deal object carries `deal_pipeline_id` ("ID of the deal pipeline that it belongs to") and `deal_stage_id` ("ID of the deal stage that the deal belongs to"), plus `probability` (0–100), `stage_updated_time`, `expected_close`, `closed_date`, and `deal_reason_id` ("Reason for losing the deal. Can be set only if the deal is in 'Lost' stage"). Selector endpoints `api/selector/deal_pipelines` and `api/selector/deal_stages` enumerate options. No layout indirection — pipelines are a first-class org-level list. [SOURCE: https://developers.freshworks.com/crm/api/] VERIFIED
2. **One deal = one pipeline** (single scalar FK; all docs describe moving deals between pipelines, never dual placement). [SOURCE: https://developers.freshworks.com/crm/api/] PARTIAL (implied)
3. **Switching pipelines:** deals can be reassigned via bulk update "to move them to different pipelines and stages"; on pipeline deletion deals are force-moved (see B). [SOURCE: https://crmsupport.freshworks.com/support/solutions/articles/50000002984-what-happens-to-deals-when-you-delete-a-pipeline-or-downgrade-plans-] VERIFIED
4. **Won/Lost are stages, present in every pipeline:** "New, Won and Lost are default stages for every newly added pipeline. However, they can be renamed"; "At least a minimum of 3 stages is mandatory (inclusive of Won & Lost)," no upper stage cap. [SOURCE: https://crmsupport.freshworks.com/support/solutions/articles/50000002392-how-to-customize-deal-stages-] VERIFIED

## B. Multi-Pipeline Management

5. **Plan limits:** Growth = 1 pipeline, Pro = 10, Enterprise = 25; "Custom pipeline is available from the Pro plan." [SOURCE: https://crmsupport.freshworks.com/support/solutions/articles/50000002957-how-to-configure-multiple-deal-pipelines-] VERIFIED
6. **Deleting a pipeline: silent auto-move, no prompt:** "the deals of the deleted pipeline are moved to the first stage of the admin default pipeline." On downgrade, "Only the pipeline that was marked as the admin default pipeline is retained… All other pipelines are dissolved, and the deals are moved to the first stage of the default pipeline." No data loss, but stage context is destroyed. [SOURCE: https://crmsupport.freshworks.com/support/solutions/articles/50000002984-what-happens-to-deals-when-you-delete-a-pipeline-or-downgrade-plans-] VERIFIED
7. **No per-pipeline permissions found.** Access control is role/scope-based on the Deals module as a whole (Global / Restricted / Territory scopes, per-action granularity) — no official doc restricts visibility of a specific pipeline. [SOURCE: https://crmsupport.freshworks.com/support/solutions/articles/50000002412-how-to-configure-roles-and-manage-user-permissions-] PARTIAL (scope model from official article snippets; per-pipeline absence inferred)

## C. Stage Configuration

8. **Per-stage probability + weighted pipeline:** probability "is a percentage operator and operates on the total deal value"; weighted/expected value = probability × deal value shown per stage; **notable trap: "When deal stage probability is edited, the new percentage will only be reflected on new deals. The percentage of existing deals will not change."** Available on all plans. [SOURCE: https://crmsupport.freshworks.com/support/solutions/articles/50000002959-how-to-set-up-and-use-weighted-pipelines-] VERIFIED
9. **Native deal rotting:** staling age set per pipeline ("Deals go stale after" N days); "The deal card for such deals turns red," days-staling shown on the deal, plus a "Show only rotten Deals" filter; available on all plans incl. Free. Default 30 days per third-party sources. [SOURCE: https://crmsupport.freshworks.com/support/solutions/articles/50000002157-what-are-stale-deals-how-do-they-work-] VERIFIED (default value PARTIAL)
10. **No blocking stage-entry gates.** No Blueprint/transition-rule equivalent exists; the closest mechanism is Field Dependency: dependent fields shown by a controlling field's value can be marked mandatory — "the mandatory check will be made only when the dependent field is shown on the form" — 100 dependencies/entity, 10 nesting levels, "not available for the Free and Growth plans." This gates *form saves*, not kanban drags. [SOURCE: https://crmsupport.freshworks.com/support/solutions/articles/50000002573-how-to-configure-field-dependency-] VERIFIED

## D. Close Semantics

11. **Lost reasons are first-class:** `deal_reason_id` settable only in Lost stage (API), and "Lost Reason is set as a dependent field for the Lost Deal Stage" as a default, non-disableable dependency; choices editable under Admin Settings > Deals & Pipelines > Deals. [SOURCE: https://developers.freshworks.com/crm/api/] VERIFIED; [SOURCE: https://support.freshsales.io/support/solutions/articles/233374-how-to-configure-field-dependency-on-freshsales-] PARTIAL
12. **Win reasons:** no native win-reason field found. UNVERIFIED
13. **Reopen:** no documented reopen flow; stages are drag-movable so a closed deal presumably drags back to an open stage, but no official statement found. UNVERIFIED

## E. Board UX

14. **Kanban with configurable stage summaries:** "the cumulative value of the selected field is displayed under the name of each deal stage" with options "Forecasted revenue, Total deal value, and Number of deals"; deal cards customizable up to 6 fields, compact/expanded modes. [SOURCE: https://crmsupport.freshworks.com/support/solutions/articles/50000003021-how-to-customise-information-displayed-for-deals-in-kanban-view-] VERIFIED
15. **Per-user "preferred pipeline" — a UX idea worth noting:** each user picks their own default pipeline; "The new deals created get added to the user-preferred pipeline," kanban and filters default to it, and "Users can change their preferred pipeline" even when admin-assigned. All plans. [SOURCE: https://crmsupport.freshworks.com/support/solutions/articles/50000002155-how-can-users-set-their-preferred-pipeline-] VERIFIED

## F. Reporting

16. **Stage movement analytics:** "Deal stage movement" metric visualizes progression and conversion between stages with drilldown; caveats: "Deal stage movement analysis is best used one pipeline at a time," and skipped stages don't register as moved-through. [SOURCE: https://crmsupport.freshworks.com/support/solutions/articles/50000010067-how-to-analyze-deal-stage-movement-with-analytics-in-freshsales-] VERIFIED. A separate "Deal Duration Metrics" analytics article exists. [SOURCE: https://crmsupport.freshworks.com/support/solutions/articles/50000011364-understanding-deal-duration-metrics-in-freshsales-analytics] PARTIAL (located, not fetched)
17. **Forecasting with commit workflow:** categories = Committed ("cannot be edited/deleted"), Best-case (renamable), + up to 3 custom categories; quota view (won vs committed vs best-case vs quota), rep-level "Commit" button, manager override ("override the committed deal value"), hierarchy roll-up, Freddy AI deal insights in drilldown; month/quarter periods. [SOURCE: https://crmsupport.freshworks.com/support/solutions/articles/50000002881-how-to-predict-revenue-from-your-team-] VERIFIED

## G. Extras

18. **No deal merge:** merge is documented only for contacts/leads/accounts (deals of merged contacts/accounts roll up to the primary); no deal-merge article exists. [SOURCE: https://crmsupport.freshworks.com/support/solutions/articles/50000002374-how-to-merge-contacts-] PARTIAL (absence inferred from official article set)
19. Admin default pipeline (system fallback for imports/deletions) is distinct from per-user preferred pipeline — a clean two-level defaulting model. [SOURCE: https://crmsupport.freshworks.com/support/solutions/articles/50000002958-how-do-i-mark-a-pipeline-as-default-for-admin-activities-] PARTIAL (located via search; role confirmed by deletion article)

**Summary — Freshsales**
- Strength: simplest, most legible data model (org-level pipeline list + numeric FKs, no layout indirection) — closest to what a prototype should copy for CRUD simplicity.
- Strength: best day-to-day hygiene features — native deal rotting with red cards, weighted stage totals, per-user preferred pipeline, rep-commit forecasting with manager override.
- Strength: lost reasons are a first-class, API-visible field wired to the Lost stage by a default dependency.
- Gap: no blocking stage-entry gates (no Blueprint/transition-rules equivalent), no per-pipeline permissions, and probability edits don't retro-apply to existing deals.
- Gap: pipeline deletion silently dumps deals into the default pipeline's first stage with no transfer prompt — data kept, context lost.

---

## Cross-cutting takeaways for nrtur (1 paragraph)

All three model **one deal ↔ one pipeline** (a single pipeline field/FK per record) — nobody supports multi-pipeline residency; Bigin solves cross-team flows with *Connected Pipelines* (auto-move logic) instead. Won/Lost is always a **stage with a closed type/category**, never a separate status field — Zoho formalizes it best (`forecast_type`: Open/Closed Won/Closed Lost per stage, driving forecast category). The three deletion behaviors form a spectrum worth copying deliberately: Zoho (prompted transfer + stage remap, closed deals preserved) > Freshsales (silent move to default pipeline's first stage) > Bigin (permanent record deletion). Blocking stage gates are a paid differentiator everywhere (Zoho Blueprint from Professional; Bigin Stage Transition Rules from Premier; Freshsales has none).

---

# Attio — Deals / Lists / Pipeline Model

## A. Core data model
1. **Pipeline container — TWO mechanisms.** (a) **Lists**: "When you add a record to a list, Attio creates a list entry. A list entry is an instance of that record within the list, and it's where list-specific attribute values are stored." Stage lives on the **entry**, not the record: "Object attribute values live on the record… List attribute values live on the list entry." [SOURCE: https://attio.com/help/reference/attio-101/attios-data-model/understanding-lists] VERIFIED. (b) **Deals standard object**: disabled by default, admin-activated; has a required **"Deal Stage" status attribute living directly on the deal record**, plus Deal Owner (required), Deal Value, Associated People/Company. [SOURCE: https://docs.attio.com/docs/standard-objects/standard-objects-deals] VERIFIED. Status attributes were "originally designed for use in Lists" but "can also be used with objects directly"; the sole predefined object-level status attribute is deal `stage`. [SOURCE: https://docs.attio.com/rest-api/attribute-types/attribute-types-status] VERIFIED.
2. **One record in multiple pipelines: YES — the defining feature.** Same record can be in many lists with independent stage values per entry, and can even appear **more than once in the same list**: "if the same person applies for two different roles, they can have two separate entries in a Recruiting list, one entry per application." Underlying record "remains untouched, serving as a consistent single source of truth." [SOURCE: understanding-lists] VERIFIED. (A deal *record's* own Deal Stage is singular — record-level stage has no multi-pipeline equivalent. VERIFIED)
3. **Moving between pipelines = remove/add entries.** No documented "move entry between lists" primitive — you add a new entry to the target list. [SOURCE: https://attio.com/help/reference/managing-your-data/lists/manage-lists] VERIFIED (add/remove); "move" primitive UNVERIFIED.
4. **Won/Lost = statuses inside the stage attribute.** Default deal stages: "Lead", "In Progress", "Won 🎉", "Lost". [SOURCE: standard-objects-deals] VERIFIED. Statuses carry `celebration_enabled` and `target_time_in_status` properties and full value history (`active_from`/`active_until`). [SOURCE: attribute-types-status] VERIFIED. Win rate via funnel report with "Included stages: All records, Won". [SOURCE: build-a-sales-reporting-dashboard] VERIFIED.

## B. Multi-pipeline management
5. Plan limits: records 50k (Free) / 250k (Plus) / 1M (Pro) / custom (Enterprise); reports 3 / 15 / 100 / 100+; "Private lists" from Plus; **no published cap on number of lists**. [SOURCE: https://attio.com/pricing] VERIFIED.
6. Deleting a list: "Admins or members with Full access… can permanently delete the list at any time"; list + all its attribute data permanently removed, records survive. [SOURCE: manage-lists] VERIFIED.
7. **Per-list permissions**: four tiers — Full access / Read and write / Read only / No access. Default: "The workspace has No access. The creator has Full access." Most-permissive-wins; granular member/team controls on Pro/Enterprise. [SOURCE: https://attio.com/help/reference/managing-your-data/lists/lists-access] VERIFIED.

## C. Stage config
8. **No per-stage probability** — no weighted/probability forecasting documented at all. VERIFIED (absence). **Idle flags: yes** — kanban "Track time in stage" with target time; when expired "the counter in the bottom right corner of the card will turn red"; API exposes `target_time_in_status` per status. [SOURCES: create-and-manage-kanban-views + attribute-types-status] VERIFIED.
9. **Required-field gates on stage change: NO.** "Custom required attributes can only be created on custom objects. They aren't supported on lists or the standard Companies, People, Deals… objects," and enforced only "when a new record is created." [SOURCE: create-manage-attributes] VERIFIED. Stage-conditional required fields = open community feature request. PARTIAL.

## D. Close semantics
10. Lost reasons: no native field. Workflow *templates* ("Lost deal reason reminder", "Lost deal summary") imply a user-added attribute. PARTIAL.
11. Win reasons: not documented anywhere official. UNVERIFIED.
12. Reopen: no documented behavior, but full status history retained (`active_from`/`active_until`) so stage flip-backs are auditable. VERIFIED (history) / UNVERIFIED (reopen semantics).

## E. Board UX
- Kanban columns driven by a status attribute; multi-select cards and bulk-drag; per-stage record count plus "Add calculation" on numeric values; time-in-stage red counter; kanban on all plans, lists and objects. [SOURCE: create-and-manage-kanban-views] VERIFIED. No weighted-forecast column totals. VERIFIED (absence).

## F. Reporting
- **Funnel report** (Plus+): conversion = "records that reached or surpassed current stage ÷ records that reached or surpassed previous stage"; skipped stages count as passed. [SOURCE: set-up-a-funnel-report] VERIFIED. **Stage changed report** (Pro+): volume/value entering each stage over time. VERIFIED. **Time in stage report** (Pro+): Max/Average/Min per stage with breakdowns. VERIFIED. Sales dashboard guide: deals-in-stage, funnel, avg time to close, stage movement, win rate. VERIFIED.

## G. Extras & sharpest limitation
- **Standout**: entry-based model is the purest "one record, many pipelines, many stages" design — including duplicate entries in one list — with first-class status history.
- **Sharpest limitation**: no per-stage probability/weighted forecast, no stage gates or required fields on standard objects, no built-in lost-reason field, best reports Pro+.

---

# monday CRM — Deals Board / Pipeline Model

## A. Core data model
1. **Pipeline container = a board; stage = a Status column value on the item.** API: labels defined in column settings; "Each status column can contain up to 40 labels"; labels support `is_done` flag. [SOURCE: https://developer.monday.com/api-reference/reference/status.md] VERIFIED. Help: "Your pipeline stages live in a Status column in your Deals board… Each item in your board is an opportunity." [SOURCE: https://support.monday.com/hc/en-us/articles/360013348719] PARTIAL (support center 403s; search snippet of official article).
2. **One item in multiple boards: NO.** Item's `board` field = "The board that contains the item" — singular. [SOURCE: https://developer.monday.com/api-reference/reference/items.md] VERIFIED. Mirror columns are display-only: "Mirror column values cannot be updated or cleared directly." [SOURCE: mirror.md] VERIFIED.
3. **Moving between pipelines = `move_item_to_board` mutation (true move).** "If you do not provide column mapping, the system will try to map the item according to the column name and type." [SOURCE: move_item_to_board changelog] VERIFIED.
4. **Won/Lost = status labels + group conventions.** Any label can be `is_done`. VERIFIED. Built-in automations move deals into groups (e.g., Closed Won); Funnel Chart "calculates the transitions between status labels." PARTIAL (403 snippets).

## B. Multi-pipeline management
5. Plan limits (monday CRM): Basic $12 — 1,000 contacts+deals, 1 dashboard, 5 columns/board, 1 workspace; Standard $17 — 10,000 / 5 / 15 / 3; Pro $28 — 100,000 / 50 / 75 / 15; Ultimate unlimited. [SOURCE: https://monday.com/crm/pricing] VERIFIED. Board-count limits not stated. VERIFIED (absence).
6. Deleted boards/items in Trash 30 days, restorable; archive = non-destructive alternative. PARTIAL (403 snippets).
7. Board-level permissions; "Multi-level permissions" Ultimate-tier. VERIFIED (pricing) / PARTIAL (details).

## C. Stage config
8. **Probability: YES** — Deals board ships Close Probability column; "The Forecast Value column… multiplies the Deal Value column by the Close Probability column"; Forecasting view tracks forecast vs target. PARTIAL (403 snippets). Probability is a COLUMN on the item, not stage metadata.
9. **Stage gates: YES — the only one of the four with a blocking gate.** "Conditional status changes let you require specific fields before someone can change a Status Column to a specific label" — being deprecated ~end June 2026 in favor of "Required columns" + data validation rules. PARTIAL (403 snippets; re-confirm timing).

## D. Close semantics
10. Lost reasons: no native field; built as dropdown + conditional status changes per third-party guides. UNVERIFIED (official).
11. Win reasons: not documented. UNVERIFIED. 12. Reopen: not documented — labels freely editable, no close-lock. UNVERIFIED.

## E–F. Board UX & Reporting
- Kanban drag cards between stages, in-card editing. PARTIAL. Deal Stages widget (hover = time in stage), Leaderboard widget (per-rep stage-transition %, totals), Deal Insights, Funnel Chart (label transitions New→Won), Forecasting view; dashboards capped 1/5/50/unlimited per plan. PARTIAL/VERIFIED (pricing).

## G. Extras & sharpest limitation
- **Standout**: probability-weighted Forecast Value + Forecasting view, formula columns, automation recipes, and the only native required-fields-on-stage-change gate among the four modern tools.
- **Sharpest limitation**: item lives on exactly one board — no shared deal across pipelines (mirrors read-only); stage set is a bare 40-label status column with no stage metadata.
- NOTE: monday API-layer claims VERIFIED from developer.monday.com; CRM/help-layer claims PARTIAL (support.monday.com serves HTTP 403 to fetchers).

---

# Streak — Pipelines / Boxes Model

## A. Core data model
1. **Pipeline = container; box = record; stage lives as `stageKey` ON the box.** "The list of valid stages a box can be in are defined in the pipeline it belongs to… To set what stage a given box is in, update the `stageKey` property." [SOURCE: https://streak.readme.io/reference/list-all-stages-in-pipeline] VERIFIED. "A pipeline contains Boxes which contains Emails, Files, Tasks, etc." [SOURCE: basic-object-model] VERIFIED.
2. **One box in multiple pipelines: NO.** Single stageKey/pipeline; only a move operation exists. PARTIAL (implied by model).
3. **Moving = move with NAME-MATCHING risk.** "This action will move the box and any emails, comments, files, reminders, and newsfeed items"; if stage/column names aren't identical "you're at risk of losing data and/or moving the boxes to an incorrect stage." [SOURCE: https://support.streak.com/en/articles/3519103-how-to-move-a-box-to-a-new-pipeline] VERIFIED. Batch move API exists. VERIFIED.
4. **Won/Lost = stage-name convention, consumed by reports.** "Boxes Won — shows the number of boxes moved to the 'Won' stage"; "Close Rate calculates the percentage of Boxes won out of all the Boxes." No separate status field. [SOURCE: pipeline-reports] VERIFIED.

## B. Multi-pipeline management
5. Plans: Pro $49 / Pro+ $69 / Enterprise $129 per user/mo; records "Unlimited" on paid plans; no pipeline-count caps published. [SOURCE: https://www.streak.com/pricing] VERIFIED.
6. Only Admin role can "delete the entire pipeline." Box fate on deletion: UNVERIFIED.
7. **Per-pipeline sharing — unusually granular.** Six roles: Admin, Editor, Creator ("create new boxes, edit only those boxes they are assigned to"), Assignee, Viewer, Observer ("only view boxes they are assigned to"). Share per-pipeline via Team Access or named individuals; Enterprise adds custom permissions. [SOURCE: https://support.streak.com/en/articles/2648798-pipeline-access-roles] VERIFIED.

## C. Stage config
8. No per-stage probability — customization covers add/rename/reorder/recolor only. VERIFIED (absence). **Idle via Magic Columns**: auto "last stage change, days in stage, freshness" columns, filter/sort/group-able. [SOURCE: magic-columns] VERIFIED.
9. Required fields on stage change: not supported / not documented. UNVERIFIED.

## D. Close semantics
10–12. No native lost reasons (custom column), no win reasons, no reopen concept — moving a box out of "Won" simply changes stageKey. UNVERIFIED/PARTIAL.

## E–F. Board UX & Reporting
- Primary UX = "a spreadsheet-style view inside Gmail." VERIFIED. Reports per pipeline: "Boxes by Stage", "Time in Stage" (average per stage), "Stage Entrances and Exits", "Stage Flow", "Total Value in Pipeline", "Boxes Won", Close Rate, "Projected Close Value" (Expected Close Date column). [SOURCE: pipeline-reports] VERIFIED. Funnel reports show stage-to-stage dropoff; custom data sources Pro+. VERIFIED.

## G. Extras & sharpest limitation
- **Standout**: entire CRM inside Gmail; six-role per-pipeline permission model is the most granular pipeline sharing surveyed.
- **Sharpest limitation**: cross-pipeline moves match stages/columns **by name string** with documented data-loss risk; won/lost is a naming convention; no probability, no gates.

---

# Folk — Groups / Pipeline-View Model

## A. Core data model
1. **Pipeline = a kanban view on a group; stage = a group-scoped single-select custom field value.** If no field exists, Folk auto-creates "a column named 'No status' in a 'single select' field named 'Status'." Custom fields "belong to a single group and are not shared with other groups." [SOURCES: create-custom-pipeline-views + folk-data-model + track-deals] VERIFIED. Deals are records distinct from contacts: "A deal can be linked to both people & companies, and the same deal can be linked to multiple people and/or companies," premade fields "Status, Deal value, Deal owner, Closed at." VERIFIED.
2. **Multiple pipelines: yes for records via groups.** "There's no limit to how many records a group can contain, or how many groups a record can belong to" — group-scoped fields mean the same person/company carries an independent status per group. [SOURCE: folk-data-model] VERIFIED. One *deal* in multiple groups: UNVERIFIED.
3. Moving between pipelines: manual add to group B; stage values don't travel (group-scoped fields). PARTIAL.
4. **Won/Lost = just options in the Status field + a "Closed at" date field.** Dashboards suggest "Leads by status, industry, lost reason" as ordinary field values. VERIFIED (fields) / PARTIAL (convention, not system state).

## B. Multi-pipeline management
5. Plans: Standard $24 — "Pipeline management" but NO Deals/custom objects/Dashboards; Premium $48 — "Custom objects & Deals" + Dashboards; Enterprise from $80. No group-count caps. [SOURCE: https://www.folk.app/pricing] VERIFIED.
6. Deleting a group: records survive, group's custom fields + values deleted. PARTIAL (weak — re-verify).
7. Per-pipeline sharing = group permissions (private vs shared); dashboard access follows group access. VERIFIED.

## C. Stage config
8. No per-stage probability, no idle flags; per-column counter switchable to calculations (e.g., sum of value field). VERIFIED (calc) / UNVERIFIED (absences).
9. Required fields on stage change: not supported/documented. UNVERIFIED.

## D. Close semantics
10–12. Lost reasons = recommended custom field only (official blog prescribes it as practice); win reasons undocumented; no close/reopen state exists. PARTIAL/UNVERIFIED.

## E–F. Board UX & Reporting
- Kanban grouped by any single-select; create/reorder columns by drag; per-column counter + calculations; show/hide card fields. VERIFIED.
- Dashboards (Premium+): Bar/Grouped/Stacked/Pie/Metrics, Count/Sum/Average/Ratio. **No funnel-conversion, no time-in-stage, no stage-history reporting; "All charts display all-time data"; no export.** [SOURCE: dashboards article] VERIFIED (including absences).

## G. Extras & sharpest limitation
- **Standout**: radical simplicity — a pipeline is a saved kanban view over a single-select field; group-scoped fields give an Attio-lite "same record, different data per context."
- **Sharpest limitation**: no stage-change history at all — no funnel conversion, no time-in-stage, no duration analytics; won/lost/reopen unmodeled; deals + dashboards Premium-gated.

---

## Cross-cutting (modern tools)
- **Attio is the only one of the four where one record genuinely holds multiple simultaneous stages** (list entries); Folk approximates via group-scoped fields; monday and Streak are strictly one-container-per-item with move-not-share semantics.
- **Only monday** has a documented blocking stage-gate (Conditional status changes → Required columns + validation); none of the four has native per-stage probability ON the stage itself.

---

# GoHighLevel (HighLevel) — Opportunities & Pipelines

## A. Core data model
1. Opportunities API (official OpenAPI spec) defines `pipelineId` (required on create), `pipelineStageId`, `status` (enum: "open", "won", "lost", "abandoned"), `monetaryValue`, `assignedTo`, `contactId` (required), `name` (required), `lostReasonId`. [SOURCE: https://raw.githubusercontent.com/GoHighLevel/highlevel-api-docs/main/apps/opportunities.json] VERIFIED
2. One pipeline per record (single-valued fields). Multi-pipeline presence = multiple opportunities per contact, gated by "Allow duplicate opportunities" setting. [SOURCES: OpenAPI + https://help.gohighlevel.com/support/solutions/articles/155000002000-opportunities-faqs] VERIFIED
3. Switching pipelines supported via API (`pipelineId` updatable in UpdateOpportunityDto). VERIFIED. UI flow/prompt for cross-pipeline moves: UNVERIFIED.
4. **Won/Lost = separate status field, confirmed**: "'Open,' 'Won,' 'Lost' and 'Abandoned'… present by default"; "Opportunity status type and names cannot be changed"; dedicated `PUT /opportunities/{id}/status` endpoint (status + optional lostReasonId). VERIFIED. **Oddity: pipelines ALSO auto-create Won/Lost stages** ("created automatically and do not need to be added manually") — dual representation. [SOURCE: https://help.gohighlevel.com/support/solutions/articles/155000001985-step-by-step-guide-creating-pipelines] VERIFIED

## B. Multi-pipeline management
5. No numeric pipeline limit documented; names unique per sub-account. UNVERIFIED (cap)
6. Stage-level deletion safety: "you can now move all existing opportunities to another stage instead of losing them." VERIFIED. Whole-pipeline deletion with open deals: UNVERIFIED.
7. Module-level permissions only + "Only Assigned Data" restriction. No per-pipeline permissions. VERIFIED/PARTIAL

## C. Stage configuration
8. No per-stage probability anywhere. PARTIAL (absence). **Rotting as automation: "Stale Opportunities" workflow trigger** — fires after configurable duration-in-stage, by pipeline + stage; can notify/reassign/move. [SOURCE: https://help.gohighlevel.com/support/solutions/articles/155000002492-workflow-trigger-stale-opportunities] VERIFIED
9. No stage-entry gates/required fields. Per-stage config = name, color, order, reporting-visibility toggles. VERIFIED (what exists)

## D. Close semantics
10. Lost reasons configurable (add/rename/delete in Opportunity Custom Fields Settings); shown when marking lost; export column. Optional, no required flag. VERIFIED
11. Win reasons: UNVERIFIED (absent). 12. No dedicated reopen; status freely editable via dropdown, drag between status columns, or workflows. PARTIAL

## E. Board UX
- Kanban; drag between status columns changes status. VERIFIED. Cards: up to 7 fields, 3 layouts, per-user + per-pipeline; columns collapsible/resizable. VERIFIED. Column totals: UNVERIFIED.

## F. Reporting
- Dashboard widgets: Opportunities count, Conversion Rate (WON ÷ all), Funnel chart (cumulative stage progression — **official caveat it "assumes every stage is one step closer to sale"**, misrepresents branch stages), Stages Distribution. VERIFIED
- Lost Reason as widget filter/group-by. PARTIAL. Per-stage chart visibility via funnel/pie toggles. VERIFIED

## G. Extras & limitation
- Standout: rich pipeline workflow triggers — Pipeline Stage Changed, Opportunity Status Changed, Stale Opportunities. VERIFIED
- Sharpest limitation: no probability/weighted forecasting, no gates, no win reasons, no per-pipeline permissions; funnel officially linear-only; dual Won/Lost representation (stages AND status) is a modeling wrinkle competitors avoid.

---

# Nutshell — Leads & Pipelines (stagesets/stages)

## A. Core data model
1. Deals are "Leads"; pipelines are "stagesets". Lead: `status` ("open"), `confidence` (%, per-lead), `value`, `priority`, `closedTime`, `dueTime`, `isOverdue` ("Whether the lead is overdue to have a final outcome set"), `overdueTime`, `lastContactedTime`. Stage: `name`, `description`, `position`, `numSteps`, `canAdvanceStage`, links.stageset. Stageset: `name`, `default`, `canAccess`, `status` ('1' active, '2' draft, '3' retired). [SOURCE: https://developers.nutshell.com/reference/… (3 API pages)] VERIFIED
2. One pipeline per lead: `POST /leads/{id}/stageset` sets a single id; multi-process advice = "follow-through tasks or lead cloning." [SOURCES: API + https://support.nutshell.com/en/articles/8429056-pipelines-working-with-multiple-pipelines] VERIFIED/PARTIAL
3. Dedicated endpoint `POST /leads/{id}/stageset`; stage-mapping behavior on switch UNVERIFIED.
4. **Won/Lost = lead status, separate from stage**: close as **won, lost, or cancelled** via `POST /leads/{id}/status` taking an `outcomeId`, `competitorMaps`, `productMaps`; won value "transfers to the Sales section and is excluded from pipeline calculations." VERIFIED

## B. Multi-pipeline management
5. Plans: Pro = 5 pipelines, Business = 10, Enterprise = unlimited; multiple ACTIVE pipelines need Pro+; drafts on all plans. [SOURCES: https://www.nutshell.com/pricing + help] VERIFIED
6. Deletion with open deals: undocumented; API stageset status '3 retired' implies retirement over delete. PARTIAL/UNVERIFIED
7. Per-pipeline permissions: none documented ('canAccess' = plan gating). PARTIAL

## C. Stage configuration
8. Probability per-lead (`confidence`), not per-stage. VERIFIED. **Overdue/rotting modeled in data**: `isOverdue`/`overdueTime` + stage `overdueAvatarUrl`. VERIFIED
9. **"Stage goals"**: "the purpose of each stage. When met, your leads will automatically advance to the next stage" — nine goal types (contact info, value thresholds, activities, email engagement, custom fields populated); on auto-advance "all tasks will be marked as 'skipped'". Growth plan+. VERIFIED. Whether goals hard-block manual moves: PARTIAL.

## D. Close semantics
10. **Lost reasons = "Outcomes", prompted**: "Whenever you lose or cancel a lead, Nutshell will present a drop-down menu to select the reason"; separate Lost and Cancelled lists; also prompts "which competitors snagged the lead." Mandatory-ness unstated. VERIFIED/UNVERIFIED
11. Win reasons: none — winning prompts product pricing confirmation instead. VERIFIED
12. **Reopen: first-class API endpoint** — `POST /leads/{id}/reopen`: "Reopen a lead that was previously closed." VERIFIED

## E. Board UX
- Lead Board: per-column count + total value; drag-drop; **win/lose/cancel without leaving the board**; per-pipeline card customization (Pro+); sorting; quick filters. VERIFIED

## F. Reporting
- **Funnel report (Pro+)**: per-stage conversion (flowing through / advancing / won-lost-cancelled in stage / Already / Remain); #/$/% toggle; **CSV includes "timestamps showing when each lead entered and exited each stage"** — real stage-duration data. VERIFIED
- **Losses report (Pro+)**: lost value by outcome, segmentable by competitor. VERIFIED
- Forecast: by expected close, 27 views, "Forecast pipeline by confidence" weighting. PARTIAL

## G. Extras & limitation
- Standouts: stage goals with auto-advance; auto-close automation (close leads with specific outcomes after timeframes); lead distribution rules routing new leads to pipelines; explicit isOverdue outcome-deadline concept. VERIFIED
- Sharpest limitation: plan-gated pipeline counts; multi-process = clone the lead.

---

# Capsule CRM — Opportunities & Milestones

## A. Core data model
1. **No status and no direct pipeline field on the opportunity** — position encoded entirely by `milestone` (required nested object). Fields: `probability`, `value`, `expectedCloseOn`, `closedOn`, `lostReason` (optional), `owner`, `team`, read-only `lastStageChangedAt`, `lastOpenMilestone`. Pipeline reached through milestone: Milestone has `pipeline`, `probability` (REQUIRED default % per milestone), `complete` ("opportunities belonging to this milestone are closed"), `daysUntilStale`. [SOURCES: https://developer.capsulecrm.com/v2/models/opportunity + /models/milestone] VERIFIED
2. One pipeline per opportunity; milestones pipeline-specific. VERIFIED
3. Switching = edit/dropdown/kanban-drag + pick a milestone in the destination pipeline (no auto-mapping). [SOURCE: https://capsulecrm.com/support/sales/multiple-sales-pipelines/] VERIFIED
4. **Won/Lost = closing actions materialized as complete milestones, not a status**: "Probability must be exactly 0 or 100 if complete is true." VERIFIED

## B. Multi-pipeline management
5. Multiple pipelines on Growth/Advanced/Ultimate, **max 30 active pipelines**; duplication copies milestones/settings not opportunities. VERIFIED
6. **Delete/archive blocked with active opportunities** — move or delete them first. VERIFIED
7. Per-pipeline permissions: UNVERIFIED (team field exists; no pipeline ACL).

## C. Stage configuration
8. **Per-milestone probability required + per-milestone `daysUntilStale`** (null = disabled); stale deals get "an orange band." VERIFIED
9. No stage-entry gates/required fields documented. UNVERIFIED (absent)

## D. Close semantics
10. **Lost reasons: configurable with `includedForConversion`** — "whether the lost reason counts toward conversion calculations" (exclude junk losses from stats!); deleted reasons retained for historical reporting; bulk-close prompts reason; optional. VERIFIED
11. Win reasons: UNVERIFIED (absent). 12. **Reopen explicit and stateful**: "Re-Open Opportunity" button restores "to the milestone it had before it was closed." VERIFIED

## E. Board UX
- Kanban columns **ordered by win probability (1%–99%)**; drag-drop; stale orange band; preview panel; **board caps at 500 opportunities** (then filter/List view). VERIFIED. Column totals: UNVERIFIED.

## F. Reporting
- Pipeline dashboard: conversion rate over 30/90/365 days; Pipeline by Milestone (clog detection); won/lost by reason/owner/team; weighted Pipeline Value; month-by-month Forecast; **Average Time to Win incl. per-stage duration with mean/median by user**. Growth+ for advanced. [SOURCE: https://capsulecrm.com/support/business-insights/reporting-on-your-sales/] VERIFIED

## G. Extras & limitation
- Standouts: includedForConversion on lost reasons (unique); probability-ordered kanban; stale threshold as data-model field.
- Sharpest limitation: no status dimension at all (no abandoned/on-hold), 500-card board cap, pipelines paywalled + capped at 30.

---

# Insightly — Opportunities & Pipelines

## A. Core data model
1. Opportunity carries pipeline + stage, manual "Probability of winning", "Forecast Close Date", and an Opportunity State. [SOURCE: https://support.insight.ly/en-us/Knowledge/article/1373/What_are_Opportunities] VERIFIED. API names `PIPELINE_ID`, `STAGE_ID`, `OPPORTUNITY_STATE` ('Open','Abandoned','Lost','Suspended','Won') — corroborated via third-party connector docs only (official API reference JS-walled). PARTIAL
2. **One pipeline per record — explicit: "Only one Pipeline may be applied to each record."** [SOURCE: https://support.insight.ly/en-us/Knowledge/article/1408/What_are_Pipelines] VERIFIED
3. Stage change via record edit or "Change Pipeline Stage" link; pipeline change via edit. VERIFIED/PARTIAL
4. **Won/Lost = separate state field with FIVE values: Open, Suspended, Abandoned, Lost, Won** — "Open and Suspended are considered 'open' states, and the others 'closed' states." Orthogonal to stage. VERIFIED

## B. Multi-pipeline management
5. No pipeline-count limits documented. UNVERIFIED
6. **Deletion blocked while in use**: "If the Pipeline is in use, you will be unable to delete it" (check records + recycle bin). Same for stages. VERIFIED
7. Per-pipeline permissions: not documented (page layouts only). PARTIAL

## C. Stage configuration
8. No per-stage probability (manual per-opportunity). VERIFIED. No rotting; kanban warning icons on cards lacking upcoming tasks. VERIFIED
9. **No blocking gates — stage-triggered Activity Sets instead**: reaching a stage "will automatically create tasks or events linked to the current project or opportunity." VERIFIED

## D. Close semantics
10. **State reasons — configurable per state**: "When changing the state of an opportunity, you have the option of including State Reasons"; configured per state at System Settings. Constraint: "You can only assign an opportunity state reason when you change a state." VERIFIED
11. Win reasons: effectively supported (state reasons attach to any configured state incl. Won). PARTIAL
12. Reopen: not documented; Suspended recommended as intermediary. PARTIAL

## E. Board UX
- Generic kanban (Projects/Opportunities/Leads), "up to 200 records in movable cards below each stage"; drag triggers activity sets; warning icons. VERIFIED. Stage totals: PARTIAL.

## F. Reporting
- Funnel Stage Report (snapshot of open opps by stage). PARTIAL. Official guidance to number-prefix stage names so reports sort correctly (reporting doesn't understand stage order!). PARTIAL. No stage-duration, win/loss-reason, or weighted-forecast reports found. UNVERIFIED (absent)

## G. Extras & limitation
- Standouts: pipelines shared by Opportunities AND Projects; Activity Sets (stage-entry automation bundles); the **Suspended** state (open-but-on-hold) is unusual and useful.
- Sharpest limitation: pipeline/stage config API is read-only; state reasons only settable during a state change; thin pipeline reporting.

---

# Bitrix24

## A. Core data model
1. Pipeline = "a set of stages in the Kanban view"; one non-deletable "Default" pipeline; new pipelines ship with 8 default stages incl. Deal won, Deal lost, Analyze failure. [SOURCE: https://helpdesk.bitrix24.com/open/20739996/] VERIFIED. In the API pipelines are **categories/funnels**: `crm.category.*` (deals = entityTypeId 2; id/name/sort/isDefault). [SOURCE: https://apidocs.bitrix24.com/api-reference/crm/universal/category/crm-category-list.html] VERIFIED
2. Deal carries `CATEGORY_ID` ("Funnel identifier") + `STAGE_ID` (valid values depend on the funnel, via crm.status.list); `PROBABILITY` is a deal-level integer. [SOURCE: https://apidocs.bitrix24.com/api-reference/crm/deals/crm-deal-add.html] VERIFIED. Stage dictionaries per-funnel: DEAL_STAGE / DEAL_STAGE_xx. VERIFIED
3. One record, one pipeline; presence in two = tunnel **Copy** ("creates a new deal in another pipeline and keeps the original deal"). [SOURCE: https://helpdesk.bitrix24.com/open/20986600/] VERIFIED
4. Switching: (a) bulk "Move to pipeline" group action VERIFIED; (b) automated tunnels VERIFIED; (c) API: **"crm.deal.update can only change the stage of a deal within the current funnel. If you pass a STAGE_ID that does not belong to the current funnel, nothing will change"** — cross-funnel needs crm.item.update with categoryId+stageId. [SOURCE: https://apidocs.bitrix24.com/api-reference/crm/deals/] VERIFIED. Stage mapping on UI bulk move: UNVERIFIED.
5. **Won/Lost = stage SEMANTICS**: every stage carries "process / success / failure" semantic; "You can create several unsuccessful stages to track why deals were lost." [SOURCES: stages-with-semantics tutorial + helpdesk 21922640] VERIFIED

## B. Multi-pipeline management
6. Pipeline count "depends on your Bitrix24 plan" VERIFIED; exact numbers not on official pages (third-party: Free=1, Standard=10, Professional=20). UNVERIFIED (weak)
7. **Deletion blocked**: "Pipelines cannot be deleted if they contain deals, have deleted deals in the recycle bin, are linked to recurring templates, or are the default pipeline." VERIFIED
8. **Per-pipeline AND per-stage permissions (confirmed)**: role permissions "for each deal pipeline separately"; actions incl. **"Move to stage: Allow moving items to any or selected stages"**; access can differ by stage; admins can hide **"Amount on kanban stages"** totals per role; highest-access wins. [SOURCE: https://helpdesk.bitrix24.com/open/24127550/] VERIFIED

## C. Stage configuration
9. `PROBABILITY` field exists (API) VERIFIED; per-stage probability config not found UNVERIFIED. No rotting feature; kanban card "activity counter" (color = status of planned activities) is the staleness signal. PARTIAL
10. **Required fields per stage (confirmed exactly)**: fields required "for all stages or specific ones" — e.g. can't move to In progress without Source; **"Required fields in deals and smart processes must be configured separately for each pipeline"**; "not available on all plans." [SOURCE: https://helpdesk.bitrix24.com/open/25815511/] VERIFIED

## D. Close semantics
11. Lost reasons: no dedicated field; mechanism = multiple failure stages. VERIFIED (mechanism)
12. Win reasons: ABSENT FROM ALL FETCHED DOCS. UNVERIFIED
13. Reopen: funnel-report doc implies terminal stages are exitable ("If a deal moves from a successful stage to a failed one, it appears in the report"). PARTIAL

## E. Board UX
14. Kanban drag between stage columns; per-stage count + total value; bulk stage change; activity counters; stage totals hideable per role. VERIFIED

## F. Reporting
15. Two funnel types: **classic** ("only the stages that leads and deals actually passed through") vs **conversion** ("all stages, even if a lead or deal skipped some"). [SOURCE: https://helpdesk.bitrix24.com/open/23390810/] VERIFIED. Stage-duration reporting: UNVERIFIED.

## G. Extras
16. **Sales tunnels (confirmed)**: "use a tunnel to automatically transfer or copy a deal from one pipeline to another"; configured by DRAGGING A LINE between stages of two pipelines; delay/schedule/conditions/target stage/responsible person; Copy vs Move modes. [SOURCE: https://helpdesk.bitrix24.com/open/20986600/] VERIFIED
17. Sharpest limitation: plan-gating opacity (limits exist, numbers unpublished) + the crm.deal.update cross-funnel silent-ignore API quirk. VERIFIED

**Summary:** Deepest governance of its cluster: per-pipeline AND per-stage permissions, stage-gated required fields per pipeline, success/failure stage semantics, and visual tunnels automating cross-pipeline moves — all officially verified. Gaps: no reason fields (failure-stage workaround), no verified stage-duration reports, per-stage probability unconfirmed, opaque plan limits.

---

# noCRM.io

## A. Core data model
1. **Lead-first, two orthogonal axes.** Axis 1 = customizable **sales steps**; Axis 2 = fixed **status machine**: "2 alive statuses: 'To Do' and 'Standby'" + "3 closed statuses: 'Won', 'Cancelled', 'Lost'" — Lost = lost to competition; Cancelled = dropped for other reasons. "The sales process is variable from one company to another, whereas statuses stay unchanged." [SOURCES: https://www.nocrm.io/academy/status + https://www.nocrm.io/help/setting-reminders] VERIFIED
2. Steps per pipeline; "each step has to be unique inside each pipeline but you can use the same step in different pipelines." [SOURCE: https://www.nocrm.io/help/multiple-pipelines] VERIFIED
3. **"A lead can only be placed in one pipeline, it can't be in two different pipelines at the same time."** VERIFIED
4. Switching: default-pipeline landing then manual change; from prospecting lists lead lands at "the 1st step of the chosen pipeline"; later-switch step mapping undocumented. PARTIAL
5. Won/Lost = status: "When a lead is 'won', its probability is automatically set at 100 and at 0 when the lead is 'lost'." In stats, "Won leads are considered to have gone through all the steps"; lost/cancelled shown in the step where closed. [SOURCES: amount-and-probability + pipeline-performance] VERIFIED

## B. Multi-pipeline management
6. Starter: 1 pipeline, 500 leads/pipeline; Expert: "Unlimited leads & pipelines"; Dream adds "Pipeline Centric Setup" (pipelines linked to users/teams/categories/scripts). [SOURCES: https://www.nocrm.io/pricing + help] VERIFIED
7. Pipeline deletion with leads: UNVERIFIED. **Step deletion safe: "all the leads related to that step will go back to the previous step."** VERIFIED
8. Per-pipeline ACLs: only Dream-edition pipeline-user linking. PARTIAL

## C. Stage configuration
9. **Per-step default probability** ("You can easily define a default probability for each step!" — system suggests %s from history) + per-lead override. VERIFIED
10. **Anti-rotting is structural**: "A lead on 'Standby' always has a reminder for a next action"; overdue To-Do leads accumulate a visible counter reset by any action. [SOURCE: setting-reminders] VERIFIED
11. Required fields on step change: ABSENT FROM ALL FETCHED DOCS (consistent with anti-form philosophy). UNVERIFIED

## D. Close semantics
12. **Lost reasons = "Tags on closing"**: admin creates tag category linked "at least to 'Lost' and 'Cancelled'"; suggested when closing; analyzed in Statistics; Dream can scope per pipeline. [SOURCE: https://www.nocrm.io/help/tags-on-closing] VERIFIED
13. Win-linked closing tags: UNVERIFIED. 
14. **Reopen = duplication pattern**: "If you've lost a lead… simply duplicate the lead!" Direct un-closing undocumented. VERIFIED (pattern)

## E. Board UX
15. Pipeline view with compact/extended modes. VERIFIED. Drag-drop + column totals: PARTIAL. Weighted totals exist conceptually. PARTIAL

## F. Reporting
16. **Pipeline Performance**: conversion per step in period — moved-on / stalling / lost per step / won. VERIFIED
17. **Sales Forecast**: weighted by lead probabilities, by estimated close date; filter by user/category/tag/pipeline. VERIFIED. Time-in-step: UNVERIFIED.

**Summary:** Cleanest conceptual model surveyed: immutable 5-value status machine orthogonal to custom steps; Lost≠Cancelled distinction unique; structural anti-rotting (Standby requires a reminder). Gaps: zero stage governance, reopen = duplicate, pipeline deletion undocumented.

---

# Pipeline CRM (ex-PipelineDeals)

## A. Core data model
1. "Every deal must be in a pipeline"; auto-assign to default pipeline. [SOURCE: https://help.pipelinecrm.com/article/213-multiple-pipelines] VERIFIED
2. **Stages carry probability, and won/lost ARE probabilities: "0% = Lost deal, 100% = Won deal, 1–99% = open"; "Each pipeline can have only one stage per probability value"; stage names "must be unique across all pipelines."** [SOURCE: https://help.pipelinecrm.com/article/171-deal-stages] VERIFIED
3. One pipeline per deal; second pipeline = **Copy** ("creates a new record while keeping the original for reporting purposes"). VERIFIED
4. Explicit **Move vs Copy** semantics; bulk "Set pipeline/stage". VERIFIED
5. **"Deal Status" here = deal HEALTH, a separate axis**: Green on-track / Yellow slowing / Red blocked / Unset + custom color statuses — independent from stage. [SOURCE: https://help.pipelinecrm.com/article/205-deal-status] VERIFIED

## B. Multi-pipeline management
6. **Plans: Start = 1, Develop = 2, Grow = 5 pipelines.** [SOURCES: help + https://pipelinecrm.com/solutions/sales-pipeline-management/] VERIFIED
7. **Deletion forces reassignment**: system moves "active deals to another pipeline and stage, while closed deals are reassigned accordingly." VERIFIED
8. Per-pipeline permissions: ABSENT FROM ALL FETCHED DOCS. UNVERIFIED

## C. Stage configuration
9. Per-stage 0–100% probability; "Weighted Forecast… automatically calculates expected revenue based on deal values and stage probabilities." VERIFIED
10. **"Deals Slipping Away"** orange indicator (no recent follow-up) + "Morning Coffee Report" daily email of overdue tasks/at-risk deals. VERIFIED (marketing page)
11. Required fields exist on forms + conditional rules, but stage-gated enforcement: UNVERIFIED.

## D. Close semantics
12. **"Won or Loss Reasons"** at Account Settings > Deal: toggling display, **"Enabling a dialog prompt when marking deals won/lost, Making reason entry mandatory before saving"**, drag-drop reorder. VERIFIED
13. **Win reasons: YES — same feature covers Won** (a genuine differentiator). VERIFIED
14. Reopen: UNVERIFIED (presumably drag back to 1–99% stage).

## E. Board UX
15. Kanban drag-drop; one pipeline visible at a time; filters incl. imported List View filters; card fields; bulk; stage collapse. VERIFIED. List totals: "All Active Deals" (probability not 0/100, archived excluded) + Filtered Total. VERIFIED. Per-column kanban totals: UNVERIFIED.

## F. Reporting
16. Default reports: Deals Won, Win Ratio, Won Deals by Source, **Lost Deals by Loss Reason**, Deals by Stage, Deals by Owners; group/filter by Owner/Source/Status/Stage/Pipeline/Loss Reason/Revenue type + date fields; "Forecast: Projects results based on past data." VERIFIED
17. **Hindsight**: "compare today's pipeline to any point in the last six months" — historical snapshots. VERIFIED

**Summary:** Tidy mid-market model: probability-bearing stages with 0/100 = Lost/Won, plus a unique color-coded HEALTH status axis. Clearest deletion story (forced reassignment) and symmetric won+loss reasons with optional mandatory prompt. Gaps: 1/2/5 pipeline caps, no per-pipeline permissions, unique-stage-names-across-pipelines constraint, reopen undocumented.

---

# aNinja

*(Docs thin; KB Cloudflare-gated, fetched via render proxy. Gaps = "undocumented," not definitively "unbuilt.")*

## A. Core data model
1. **Two loosely-coupled structures, no deal-pipeline object.** (a) Lead workflow statuses ("Changing the Lead's status in the workflow represents the lead's position in the Sales/Marketing pipeline"); (b) **Opportunities** = flat value records on a lead: Value $, Period, User, Status (Active/Won/Lost), Created/Close Date, Confidence, Note. The two structures are not documented as linked. [SOURCES: help.aninja.com KB articles] VERIFIED / UNVERIFIED (linkage)
2. One record in multiple pipelines: not addressed anywhere. UNVERIFIED
3. Moving a lead between workflows: ABSENT FROM ALL FETCHED DOCS.
4. Won/Lost = opportunity status (customizable at Settings > Opportunity Statuses); **unusual: the confidence rate (probability analog) attaches to the STATUS itself**, entered when creating each status. VERIFIED

## B–C. Management & stage config
5. Pipeline/workflow limits, plan gating: ABSENT. 6. Deletion behavior: ABSENT. 7. Permissions: only report visibility (admins see all users' opportunities). PARTIAL
8. Probability via status+opportunity confidence. VERIFIED. Idle/rotting: ABSENT. 9. Required fields: ABSENT.

## D. Close semantics
10. Lost reasons: none — free-text Note field is the only documented place. PARTIAL (workaround)
11. Win reasons: ABSENT. 12. Reopen: statuses editable over time ("date Status Update" tracked); explicit flow UNVERIFIED.

## E. Board UX
13. **No kanban/pipeline board exists in any fetched doc** — substitute = "creating smartlists for each workflow step to display on dashboards" / widgets per step. VERIFIED (substitute)

## F. Reporting
14. Workflow Summary ASR ("All Steps Reached") / LSR ("Last Steps Reached"); Opportunity Status Report (totals per status, confidence interval, CSV). VERIFIED. **Funnel conversion, win/loss ratio, stage duration, forecasting: ABSENT.**

**Summary:** No real pipeline module: linear workflow status + flat opportunity list, unconnected; no board, no multi-pipeline management, no close reasons, no gates, no forecast. Its one interesting idea: confidence % attached to customizable opportunity statuses.
