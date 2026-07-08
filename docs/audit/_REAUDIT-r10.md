# R10 re-audit — the comms/ad-leads delta (2026-07-07)

Correctness re-audit over everything landed since R9 (comms phases 0–3, ad-leads rebuild + ROAS, convert-carry, hero pills). Method: 5 parallel finders over the delta areas → **39 findings**, each put through adversarial refute-first verification (default REFUTED). **All 39 CONFIRMED** (0 refuted — the finders were tightly scoped to new code). Fixed in this pass; verified headless (app boots, zero runtime errors, behavioral spot-checks green).

## High (5 → all fixed)
- **#1/#27 execCallDecision permission bypass** — post-call decisions mutated a Deal (`nextAction`) and created Tasks behind only a `Contacts:edit` gate. Now gated on `effCanObject('Deals','edit')` + `effCanObject('Tasks','create')`, degrading to a toast when blocked.
- **#7 createLeadFromSender wrong identity** — resolved the sender from `thread[0]`, which after any reply is our OWN outbound (`alex@bloom.co`) → leads minted with the wrong address. Now prefers an explicit `senderAddr`/first non-self thread message.
- **#23 Create-lead chip** — bypassed `Leads:create`. Gated.
- **#24 EmailSuggestBar task chips** — created tasks with no `Tasks:create` gate; Reply chip ignored `effCanCreateAny()`. Both gated; bar hides when no chip is permitted.
- **#25 Inbox Calls tab** — logged call activities + fired automations ungated. `_persistCallActivity` now requires `Contacts:edit`.

## Medium (fixed)
- **#2/#18 terminal-stage detection** — `dealsForPerson` and the AdSpendTable revenue join used the literal `stageKey==='won'`, disagreeing with the board's name-aware `dealTerminalKind`; deals closed in a custom/renamed 'Won' stage kept receiving auto-associated comms / were excluded from ROAS. New shared `dealClosedKind()`/`dealIsOpen()` (outcome + key + stage-name) used by both.
- **#3 DealDetailPage wrong-record fallback** — a stale/deleted deal id silently substituted `_deals[0]`. Now detects the miss and redirects to the pipeline with a toast.
- **#4 stale dealId disabled the Link picker** — a comm whose deal was deleted showed no pill and no picker. Now falls through to the picker.
- **#8/#26/#32 more gates** — per-message Reply/Forward, ActDealLinkChip (`updateActivity`) now gated.
- **#9/#29 Simulate-inbound menu** — gated on `Contacts:edit`.
- **#10 replyUnenroll too broad** — removed ALL of a contact's enrollments on any reply. Now scoped to the replying channel (email vs SMS).
- **#11 empty-email leads** — unknown-sender create on a no-thread seed minted a lead with `email:''`. Now derives a fallback address.
- **#12 SMS sim force-switch** — jumped the user off the thread they were composing in (wrong-person send risk). Now only updates the selection if already viewing that thread.
- **#13 outbound persistence bridge** — email reply / SMS send now write an outbound activity to the linked contact + bump `lastActivity` (was inbound-only, contradicting the product promise).
- **#16 converted-then-deleted ad lead** flipped to "Lost" — `adLeadLiveStatus` now tests `converted` before `deleted`.
- **#17 voicemail rich card** — "Left voicemail" (and other no-conversation outcomes) no longer fabricate a two-way transcript; summary-only.
- **#28 inbox-calls decision theater** — the workspace path (no record context) now uses honest "noted" copy instead of "Deal marked won ✓".
- **#30 toasts unreadable in light theme** — `GlobalToastHost` mounts outside `.app-shell`; toasts now carry a solid dark base so the tint reads on any theme.
- **#34 SMS unread never cleared** — selecting a thread now clears its unread flag (mirrors MMS); sim only marks unread when not viewing.
- **#35 NBA/execCallDecision selector mismatch** — the next-action card now prefers the same id-linked `dealsForPerson` set the post-call action writes to, so the two can't point at different deals.

## Low (fixed)
- **#5/#37** timeline now sorts by absolute recency (`at` for logged rows, derived from `ts` for seeds) — stable across `ts:0` ties.
- **#6** post-call 'Task created' row no longer carries an inert `dealId`.
- **#14** reply-unenroll resolves the real sequence name instead of logging "Unenrolled from 'sequence'".
- **#15** (folded into #34).
- **#20** Sarah Chen's seed `deal` string corrected ($24k → $39.4k, matching her two id-linked deals).
- **#33** action (undo) toasts are never evicted by the `slice(-3)` cap — only plain toasts are capped.
- **#38** EmailSuggestBar dismissal/consumption tracked per-email in a Set — no resurrection, no duplicate tasks on email switch.
- **#39** the email 'More' button now genuinely marks-unread (was a toast with no state change).

## Accepted / deferred (Low, cosmetic — dark theme canonical)
- **#19** reopening a campaign's only won deal leaves the contact's Customer count (feed customers vs won-deal revenue can briefly diverge) — edge case, no data loss.
- **#21** deal 1 reuses Brandon Tucker's demo `fbclid` — cosmetic seed collision.
- **#22** ad-captured leads show generic seeded demo history (`actLeadOwn` lacks the lean ad-branch `actContactOwn` has) — cosmetic demo feed.
- **#31** a few new banner tint opacities (violet/amber/emerald `[0.05]`) lack `[data-theme=light]` overrides — Low; dark theme is canonical and these are legible.

## Verification
Headless CDP: boots clean (all ~35 edits parse + render), zero runtime errors. `dealClosedKind` closes an outcome-won custom-stage deal; `adLeadLiveStatus` returns converted for a converted+deleted lead; voicemail payload has no transcript (connected does); undo toast survives a 5-toast burst; deal-detail 987654 → pipeline redirect + toast; SMS sim keeps the viewed thread (James Rivera) and marks Sarah's thread unread; unknown-sender create yields `nadia@brightloop.io` (real address); NBA card renders. Uncommitted.
