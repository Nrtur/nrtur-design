# REDESIGN-RECOMMENDATIONS

## Summary
Audited 14 page groups (Inbox, Reports, Leads list+detail, Tasks, Engage, Explore, Payments, onboarding 1–6, automation/email-sequence/form builders) against a strict criterion: only (a) data-model misdirection or (b) verified dead-end interactions count; aesthetics excluded. **4 recommendations** (1 confirmed + 3 new), a short fix-in-place list, and a v1 scope line. Every claim cites code.

## Recommendation 1 — Inbox "All" tab is a channel-switcher disguised as a message list *(CRITICAL, criterion b + a)*
**Page:** Inbox (`InboxPage`). **Evidence (re-verified):** `ALL_ITEMS` (L12150–12158) is a **hardcoded static array of 7 fake items** — not even a merge of the three real stores (`emails`, `smsConvos`, calls). Click handler L12223: `onClick={()=>setTab(it.tab)}` — switches the channel tab, never opens the item. Footer L12231 promises "Unified inbox · Email · Messages · Calls".
**Why it misdirects:** devs copy three siloed stores + a cosmetic merge; a cross-channel conversation view becomes a v2 rewrite. Counter-evidence that the unified model already exists **on the record**: `_logOutbound` (L11939) writes outbound email with `contactId`+`dealId` to the timeline, and the SMS send path (L12216) does the same via `_addAct(...mkAct('sms'...))` with deal resolution.
**Target direction:** three-zone split — mixed-channel list (~380px) | native viewer for the selected item | context rail (contact, company, active deal, next task). Minimum bar: clicking an item opens THAT item. **Backend flag:** one `interaction` entity (channel, contact_id, deal_id, direction, ts, payload) all channels write into. **Effort:** M. **Decision:** approve direction, or accept minimum bar only.

## Recommendation 2 — Tasks link to records by name-string, not id *(CRITICAL, criterion a)*
**Page:** Tasks (`TasksPage`). **Evidence:** the task→deal chip renders a free-text composite ("Company · $value") with **no dealId** and navigates to the generic pipeline board, not the deal (L22664); contact/company chips ignore persisted `contactId`/`leadId` and re-resolve by display-name against **static seed arrays** — a runtime-created contact's chip dumps the user on the list page (L22664 vs the id-correct pattern in `CalEventDetailModal` L21223–21225). The Owner filter reads `r.owner` while every write path sets `r.assignee` — provably returns zero rows (L6089).
**Why it misdirects:** devs ship tasks with varchar record links (the exact "name-string links not ids" root cause the 105-gap audit traced) plus a split-brain owner/assignee model contradicted by its own UI.
**Target direction:** persist `dealId` on the task; resolve chips via ids against live mirrors with name fallback; unify owner/assignee. No layout change needed. **Effort:** M. **Decision:** schema fix now vs. document as known-wrong.

## Recommendation 3 — Payments: financial records keyed by mutable name-strings *(CRITICAL, criterion a)*
**Page:** Payments (`PayInvoiceDrawer`/`PayInvoiceDetail`/`PaySubModal`). **Evidence:** invoices/quotes join to contacts by **name equality** (plus a company-name OR-clause) while the *same form* links deals by id via `matchDeal` (L23142 vs L23154, L23206); the subscription Customer is a bare free-text input stored into `customer` *and* `contact`, and `paySubInvoice` copies it into the renewal invoice's `company` field (L23106). Also verified dead-end: "Send receipt" is toast-only success theater (L23213).
**Why it misdirects:** billing history orphans on contact rename; same-name contacts swap invoices; MRR is unattributable. The id-pattern sitting beside the string-pattern reads as an intentional schema.
**Target direction:** mirror the `dealId` pattern — resolve `ARLookup` picks to `contactId` at build time, keep name as display snapshot; same lookup for subscriptions; make Send-receipt log a timeline event or remove it. **Effort:** S. **Decision:** approve the id-linkage sweep.

## Recommendation 4 — Reports: the page-level controls only govern half the page *(MODERATE, criterion b + a)*
**Page:** Reports (`ReportsPage`). **Evidence:** the date-range picker is honored by generic-engine widgets (`dashObjRows` L4400) but ignored by the entire custom family — win-loss L4751, funnel, time-in-stage, sequence-perf L4707, call-stats L4720, goal-progress L4894 read `allDeals()`/static seeds — adjacent cards show contradictory numbers, and the funnel can exceed 100% (Won all-time vs range-scoped leads, L4847–4848). "Export CSV" downloads nothing — the handler flips a toast that claims "CSV downloaded" (L14198–14200). Activity drill-downs (`View all →`) call `goTo('reports')` **from Reports** — a verified circular no-op — because `activity` has no store (`dashObjRows` returns `[]` for it) and no destination page (L4679, L4309–4311). Settings defines report view/create/edit/share permissions (L16053) that nothing on the page consumes; a hardcoded role-name allowlist gates instead (L14191, L4158).
**Why it misdirects:** devs ship a "global" filter that silently skips half the widget library, wire circular links as spec, assume an activity entity exists, and build permissions twice.
**Target direction:** route every widget through the scoped rows; real CSV or no button; give activity a store + destination (or strip the affordances); one `effCanReport()` source of truth. Skeleton/preset architecture is sound — this is plumbing, not layout. **Effort:** M. **Decision:** wire now vs. annotate as demo-only.

## Fix-in-place (verified, below the redesign bar)
- Engage: "Start from a template" cards are byte-identical to "Start from scratch" — starter steps never reach the builder (L20998, 20965–20969); seeded-sequence "Edit" opens defaults and Save **appends a new sequence** (L21029). Effort S.
- Leads: list dropdown + board drag write `status='Disqualified'` bypassing the reason-capture modal the detail page requires (L10743 vs L10495). Effort S.
- Tasks: Completed tab × Board view renders three structurally-empty columns (L22803); ungated single-row mutations vs gated bulk bar (L22753). Effort S.
- Engage/Automations: unreachable legacy branches incl. an undefined `setEditTpl` latent crash (L20138). Delete. Effort S.
- Explore: pinned nav entries bypass permission predicates applied to fresh catalog entries (L2870). Effort S.

## Cleared pages
- **Dashboard** — `DEFAULT_LAYOUT` + `dashStartFor` role starts + workspace→user override hierarchy verified; sound.
- **Contact/Company/Deal detail** — 35fr/65fr two-pane, breadcrumb + RecordSwitcher, id-resolved; strongest pages.
- **Pipeline board** — solid; amber-wash/signal-budget are logged product decisions, not layout flaws.
- **Calendar** — standard 3-panel; agenda rail is a "next 7 days" lens, not duplication.
- **Onboarding 1–6** — collected data is real: `_onb` feeds an actual pipeline factory (L3950–3960), prefills A2P registration (L17087); invites → `crm.setTeamInvites` (L4056); contacts/CSV write real stores (L4040); skip/back everywhere.
- **Explore** — single-source `DestinationGrid` shared with the nav flyout ("never forked", L2866); all 15 destinations resolve.
- **Automation builder** — save persists a runnable automation and updates in place (L13848–13853). **Form builder** — save/duplicate/toggle persist to the forms store (L20737, L20914–20916).

## V1 scope risk
The registry counts **86 pages** (40 `settings-*`, 8 builders, 6 onboarding, auth/public, core). A dev team will read page count as v1 scope. Recommend an explicit v1 line (owner decides): **v1 = core 10 pages + automation-builder + email-sequence-builder + ~12 essential settings pages**; defer push/in-app sequence builders, funnel-builder, form-builder, and the remaining settings. Everything deferred still serves as design intent, not build scope.

## What works well
- **Report preset precedence** — user override → workspace default → role preset → built-in, explicit in code (L14119–14127) with per-user persistence.
- **Lead convert flow** — `buildConvertRecords` (L10541–10574) births contact/company/deal **id-linked**, dedupes by email/name+company; the exact lifecycle separation devs should copy.
- **Task completion is real** — one shared store (`calToggleDone` L25365) updates Tasks, Calendar, dashboard widgets, and record panels simultaneously.
- **Engage legacy-route remap** — every old route centrally rewritten via `ENGAGE_REDIRECT` (L25029–25042) in one `goTo` chokepoint; no stale entry points.
- **Payments derived status + currency honesty** — overdue/expired computed, never stored (L22990); the revenue widget elects a base currency and excludes others with an on-screen note instead of mis-summing (L23002).
