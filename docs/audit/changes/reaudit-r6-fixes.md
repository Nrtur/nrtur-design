# Re-audit R6 — five defects found by the full re-audit (post R1–R5)

_Priority: 1 Critical · 2 High · 2 Medium · Status: fixed & render-verified · 2026-07-02_

The full re-audit of the current state (Waves 1–3 + R1–R5) confirmed **22 fixes still hold and 0 use cases broken**, but surfaced **five new defects** — mostly *interactions* the earlier per-wave checks couldn't see. All five are fixed here.

## 1 · Critical — deals could render on **no** Kanban board (pipeline-name divergence)
**Problem.** R2 scoped the board by pipeline **name** (`dealInActivePipe`). But the pickers/config offer the string **"Onboarding Pipeline"** while the only non-sales board is named **"Customer Onboarding"** (and its stages are demo-only). A deal created/converted/imported/funnelled with `pipeline:'Onboarding Pipeline'` matched **neither** board → it rendered on no Kanban and was effectively invisible/lost.

**Fix (`dealInActivePipe`).** A deal whose pipeline name matches **no real-stage board** now falls back to the **default (first) pipeline**, so it is always visible:
```js
const _realPipeNames = pipelines.filter(p=>(p.stages||[]).some(s=>s.real)).map(p=>p.name);
const dealInActivePipe = (d) => { const dp = d.pipeline||_defPipe;
  return dp===active.name || (!_realPipeNames.includes(dp) && active.id===(pipelines[0]||{}).id); };
```
Verified: `realPipeNames=['Sales Pipeline']`; an `Onboarding Pipeline` deal now shows on Sales, a Sales deal stays scoped to Sales, and neither leaks onto the demo Onboarding board.

## 2 · High — new deals defaulted to **"Qualified"**, not "Prospecting"
**Problem.** The Add-Record drawer's `d_stage` options (two sites) omitted Prospecting, so `arBuildInitial` pre-selected `options[0]` = **Qualified**; the Wave-1 `||'Prospecting'` fallback never fired because the form always supplied a value. Manual creates landed in `stageKey:'qualified'`.

**Fix.** Prepend `'Prospecting'` to both create-schema option lists → `['Prospecting','Qualified','Proposal','Negotiation','Won','Lost']` (now equal to the canonical `DEAL_STAGES_ALL`). Verified: create-drawer default stage = **Prospecting**.

## 3 · High — **Lost** deals were counted as "open pipeline"
**Problem.** Two "open" predicates used only `stageKey!=='won'`, which includes `'lost'`. Since Wave 1 made Lost first-class (seeded, id-linked lost deals), a company's **open pipeline** value/count and the **Stale/At-Risk** dashboard over-counted closed-lost deals.

**Fix.** Both now require `stageKey!=='won' && stageKey!=='lost'` (`dealsForCompany` @ open calc, `DashStaleDeals`). Verified against seeded data: Cedar Systems' lone lost deal → `open:0` (was `1`).

## 4 · Medium — ad-lead intake rows collided on React key `al_null`
**Problem.** R4 added `leadId` to the intake row but left `id:'al_'+contactId`; for a **new** lead `contactId` is null → every captured lead keyed `'al_null'` → duplicate-key warnings / possible row mis-reconciliation.

**Fix.** `id:'al_'+(contactId||leadId)` — unique per captured person.

## 5 · Medium — funnel-created deal was unlinked
**Problem.** A funnel wired to also create a Deal produced one with **no** `companyId`/`primaryContactId`, pointing `primaryContact` at a Lead by name only.

**Fix.** Hoisted a `personId` for every branch (existing/new contact, existing/new lead) and attached it to the deal by kind: `primaryContactId` when the person is a Contact, `fromLeadId` when it's a Lead — so the deal is traceable to the record that created it. (Visibility is additionally guaranteed by fix #1.)

## Verified (headless, precompiled)
- Babel parse clean; app mounts with **zero console errors**.
- Fix 1 & Fix 3 pass against **live seeded data**; Fix 2 default confirmed = Prospecting; Fixes 4–5 confirmed in source + compiled bundle.

## Related
Found by the full re-audit workflow `crm-full-reaudit-current`. Builds on R2 (board scoping), R4 (capture→lead), Wave 1 (canonical stages / first-class Lost).
