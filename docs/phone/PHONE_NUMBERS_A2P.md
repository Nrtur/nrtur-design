# Phone numbers & A2P 10DLC — managed telephony (Phases 1–2)
_Shipped 2026-07-06 · decisions: **Managed model (GHL-style)** · **US + Canada v1** · researched against Twilio docs + GoHighLevel Trust Center + Close (sources at bottom; † = external claim, verify before quoting)._

## Decisions (owner-confirmed)
- **Managed telephony**: numbers are bought **inside nrtur** on nrtur's carrier account (Twilio ISV pattern) and billed to the workspace. BYO-Twilio (the older `TwilioSetupModal` credentials flow) remains as a legacy integration card but is no longer the primary path. Wallet/credits UI = **Phase 4, not built**; purchase copy says "billed to your workspace".
- **US + Canada first**: compliance = A2P 10DLC (local) + Toll-Free Verification. International regulatory bundles deferred.
- **Sole-proprietor path included** (SMB market): no-EIN brands with OTP-to-mobile, capped at 1 campaign + 1 number†.

## The compliance model (why SMS can be "paused")
US carriers block application SMS from unregistered numbers†. Real flow, mirrored in the prototype:
1. **Brand** (who you are: legal name, EIN/BN, address, vertical) → verifies in minutes–24h†.
2. **Campaign** (what you send: use case, sample messages, opt-in description, opt-out) → **manual carrier vetting, $15 one-time fee, up to ~2 weeks†**. Only an **approved campaign** unlocks SMS on local numbers.
3. **Toll-free** numbers use a separate Toll-Free Verification (blocked entirely until verified†; EIN required for new verifications from early 2026†).
4. Numbers added after approval auto-attach to the campaign (no re-registration)†.

## What shipped in index.html
**Stores** (CrmDataContext + `_live*` mirrors): `phoneNumbers[]` (id, number, label, country, type local|tollfree, caps, assignedTo:`u_*`|null, isDefault, monthly, status, tfStatus?), `smsBrand` (type standard|soleProp, legalName, ein, address, vertical, website, status), `smsCampaigns[]` (useCase, samples[], optInMethod/Desc, optOut, status, submittedDaysAgo, fee).
**Seed story**: 1 local number (+1 415 555-0100, the number the UI already referenced), brand **verified**, campaign **pending** — the honest default state; approving it is the demo arc.

**The gate** — `smsComplianceState()` / `canSendSms(recipient)` (module fns, mirror-read): active SMS number → (local) verified brand + approved campaign, or (toll-free) verified TFV → then per-recipient `dnc`. Enforced in:
- **Inbox SMS**: amber banner above the composer + Send blocked with the reason (was an unconditional "Message sent" toast). Footer now shows the real default number.
- **Automations `sms` executor**: unregistered/DNC sends log `SMS skipped — <reason>` instead of "sent".
- **SMS sequence builder**: banner reflects real compliance (was hardcoded `useState(true)`); From-number picker lists **real workspace numbers** (demo `TWILIO_NUMBERS` only as fallback).

**Settings → Phone numbers** (`settings-phone-numbers`, Integrations group, admin-gated, read-only banner for non-admins):
- **Numbers tab**: inventory (number, type, caps, per-rep assignment via `TEAM_MEMBERS` ids, default toggle, $/mo, status chip), release with danger-confirm, **Buy number** modal (US/CA → Local/Toll-free → area-code search → simulated candidates with $/mo → purchase note states the A2P/TFV consequence). Sole-prop 1-number limit enforced.
- **Trust center tab**: brand card + registration wizard (Registered business vs Sole proprietor branch — OTP mobile field, 3-brands-per-mobile note†), campaign list + registration wizard (use case, 2 samples, opt-in method + description, auto-append STOP toggle, $15 fee note), toll-free verification per TF number, and **"Simulate +1 day"** button.
- **Simulated carrier review** rides the existing automation clock (`_autoAdvance`): brand pending→verified ≥1 day; campaign pending→approved when submitted-age + advanced days ≥ 3; TFV pending→verified ≥1 day.

**Verified headless**: pending campaign blocks (`{ok:false,code:'campaign'}`) → `_autoAdvance(1d)` → `{ok:true}`; DNC recipient blocked by name; all components/routes registered; zero console errors.

## Phase 3 — SHIPPED 2026-07-06 (full toast & warning coverage sweep)
Every SMS/call-related toast and warning was enumerated and gated or truth-adjusted:
| Surface | Before | Now |
|---|---|---|
| Inbox SMS send | unconditional "Message sent" | gated (compliance + recipient dnc) + banner + **From-number selector** (real numbers; footer echoes it) |
| Inbox MMS send + "Send test" | unconditional "MMS sent"/"Test MMS sent" | both gated + same amber banner in the MMS composer |
| Automations `Send SMS` step | label-only, zero config UI | **ActionConfig branch**: template + From number (real numbers) + inline pending-warning; executor logs "SMS skipped — reason" |
| Automations `enrollSms` | enrolled DNC contacts | skips DNC with "Enrollment skipped — X is Do Not Contact" (makes the builder's "suppressed skipped" claim real) |
| Ad Speed-to-lead | hardcoded `speedy=true` (fake "fired ⚡" toast + fabricated timeline SMS row) | `speedy = smsComplianceState().ok` — toast, `adSms` timeline row, enrollment flag and lead status all truthful |
| Integrations page banner | "Connect Twilio or Vonage…" (stale under managed model, read by nothing) | live compliance reason + "Open Phone numbers" link |
| TwilioSetupModal (BYO legacy) | "ready to send and receive SMS" | copy now says A2P registration in the Trust center is still required |
| Sequence builder banner/picker | done in Phase 2 | (already live-compliance + real numbers) |
| Booking event editor | SMS reminder rows silent | amber warning under SMS reminders while messaging unapproved |
| Contact dialer popover | no identity | "Calling from +1 (415) 555-0100 · workspace line" (assigned number wins via `outboundNumberFor`) |
| Inbox dialer (CallsWorkspace) | provider picker only | Caller ID line (assigned → default) |
| Quick-add "Log call" | toast-only, nothing saved | persists to the matched contact's real timeline ("Call logged to <name>") |
| Inbox dialer call logs (post-call + Log-call modal) | inbox-local history only | ALSO persist to the contact's shared timeline when the contact matches |
| Contact dnc toggle | component-local (lost on nav) | persists via `updateContact` |
| Forms | email consent only | **SMS consent** palette field (+ `SMS consent (opt-in)` mapping) with carrier-compliant wording |
| Phone entry | free-form strings | `fmtPhone` normalizes US/CA to `+1 (AAA) BBB-CCCC` on create (contact/lead) + edit-drawer save; foreign formats untouched |
Checked and deliberately NOT gated: the email composer's "Message sent / Scheduled" (:email, not A2P) and voice calling itself (A2P governs SMS, not voice — the dialer gains identity display only).

## Phase 4 — SHIPPED 2026-07-06 (managed-model billing + growth surfaces)
- **Wallet & usage tab** (Settings › Phone numbers): balance card (+$25/+$50 top-ups), **auto-recharge** (top up $25 under $10 — fires automatically mid-debit with a toast), transactions list. Seed reconciles exactly: $50 top-up − $15 campaign fee − 4× $1.15 monthly renewals = **$30.40**.
- **Everything debits the wallet**: number purchases (first month at buy time), the $15 campaign verification fee, and **metered usage** — $0.01/SMS segment, $0.02/MMS, charged per real send from the inbox and the automation engine (counters: SMS/MMS/segments).
- **Number porting**: "Port in" flow (number, carrier, account, PIN) → `status:'porting'` chip → activates after ~2 simulated days. No downtime note mirrors real port behavior.
- **International regulatory bundles** (GB/AU in v1): buying a UK/AU number requires a per-country **bundle** (legal name, in-country address, ID doc) approved first — the Buy modal walks it inline, bundles list in the Trust center, approval ≈1 simulated day. International numbers sit outside A2P (compliance gate is now country-aware: US/CA local → A2P; toll-free → TFV; intl → bundle-vetted at purchase).
- **`managePhone` permission feature** row in the matrix (Owner/Admin on by default): buying, porting, releasing, wallet spend, and Trust-center submissions are read-only without it — layered on top of the existing admin gating, enforced through the persisted matrix.
- Sim-clock reviews now use **per-item submit timestamps** (a late submission no longer inherits earlier clock advances).
Verified headless: wallet math reconciles, Owner/Rep permission split correct, port modal registered, pending→advance→approved arc intact, zero console errors.

## Trust Hub restructure — 2026-07-07 (user-reported)
Two fixes after owner review:
1. **Missing side navigation**: the page returned bare content — every settings page must self-wrap in `SettingsShell` (sidebar + topbar + settings rail + admin gating). Now wrapped (`active="settings-phone-numbers"`), with the Numbers/Trust/Wallet tabs lifted into the shell topbar and a view-only note when an admin lacks the `managePhone` feature.
2. **Registration was brand+campaign only** — real Twilio subaccounts (and GHL's Trust Center) start with a **customer/business profile** and include number-level trust. The Trust center is now the full **stepped Trust Hub**:
   - **1 · Business profile** (`trustProfile` store, seeded approved): entity type, legal name, tax ID, address, website, **authorized representative** (name/title/email/phone) — the root registration; approval ≈1 simulated day.
   - **2 · A2P brand** — locked until the profile is approved (button gated with a "Step 1 first" toast); the brand form **prefills from the profile**.
   - **3 · A2P campaigns** — unchanged mechanics ($15 fee, ~3-day vetting).
   - **Voice trust** card: **CNAM caller-ID name** registration (≤15 chars, pending → active ≈1 day, `cnam` store) + **SHAKEN/STIR** full-attestation (A) status row.
   - Toll-free verification, regulatory bundles, and the sim-clock strip as before.
   - `smsComplianceState` is now profile-aware: with no brand, the blocking reason walks you to the profile step first. **Bug found & fixed during verification**: the pre-mount seed fallback (`_liveSmsBrand||SMS_BRAND_SEED`) masked a legitimately-null brand after mount — fallbacks now apply only before App mounts.
Verified: pending campaign → `campaign`; brand removed + profile pending → `profile` ("pending review"); profile removed → "Business profile not submitted"; boots clean.

## Not built (out of scope by design)
- Real payment rails for wallet top-ups (Stripe checkout etc.) — top-ups are simulated like all money movement in the prototype.
- Per-message sequence send simulation (enrollment is DNC-gated; a sequence "send engine" doesn't exist yet anywhere in the prototype).
- Countries beyond US/CA/GB/AU; number porting fees; CNAM/STIR-SHAKEN voice branding.

## Sources
- [Twilio — A2P 10DLC overview](https://www.twilio.com/docs/messaging/compliance/a2p-10dlc) · [registration quickstart](https://www.twilio.com/docs/messaging/compliance/a2p-10dlc/quickstart) · [campaign approval requirements](https://help.twilio.com/articles/11847054539547-A2P-10DLC-Campaign-Approval-Requirements) · [A2P pricing/fees](https://help.twilio.com/articles/1260803965530-What-pricing-and-fees-are-associated-with-the-A2P-10DLC-service-)
- [Twilio — Sole Proprietor registration](https://www.twilio.com/docs/messaging/compliance/a2p-10dlc/direct-sole-proprietor-registration-overview) · [Sole Proprietor FAQ](https://support.twilio.com/hc/en-us/articles/9550596959643-A2P-10DLC-Sole-Proprietor-Brands-FAQ)
- [Twilio — Toll-Free Verification onboarding](https://www.twilio.com/docs/messaging/compliance/toll-free/console-onboarding) · [Oct 2025 regulatory update (BRN/EIN)](https://www.twilio.com/en-us/blog/insights/2025-october-regulatory-updates)
- [GoHighLevel — revamped Trust Center / A2P experience](https://help.gohighlevel.com/support/solutions/articles/155000007070-revamped-trust-center-and-a2p-experience) · [campaign registration guide](https://help.gohighlevel.com/support/solutions/articles/155000004539-campaign-registration-step-by-step-guide-and-faqs)
- [Close — calling setup](https://help.close.com/docs/setting-up-calling) · [premium phone numbers](https://close.com/premium-phone-numbers)
