# Suppression page — research, audit & foundation rebuild (2026-07-08)

_Web-verified research across ESPs, CRMs, deliverability platforms and compliance law; an audit of nrtur's Suppression page; then the highest-ROI fix: make it real._

## Research verdict (how the field does suppression)
A multi-agent, web-verified study (Mailchimp/Klaviyo/ActiveCampaign · Salesforce/HubSpot/Zoho/Pipedrive/GoHighLevel · SendGrid/Braze/Iterable/Customer.io · CAN-SPAM/GDPR/TCPA/Twilio-STOP/RFC 8058). Convergent table-stakes:
1. **A voluntary opt-out status** distinct from delivery failure (unsubscribe ≠ bounce ≠ complaint).
2. **Auto-suppression from negative signals** — hard bounce / spam complaint / SMS STOP.
3. **Send-time enforcement** — suppressed contacts are skipped by every campaign & automation; this is *the* core behavior.
4. **Opt-out bound to a durable identity** (email/phone) so it survives delete/recreate and **carries through lead→contact conversion** (Salesforce copies the opt-out on convert).
5. **One-click unsubscribe** that actually writes suppression (CAN-SPAM + Gmail/Yahoo bulk-sender RFC 8058).
6. **Opt-outs aren't silently reversible** — a manual unsuppress differs from re-subscribing a true opt-out (needs fresh consent).
Differentiators: named per-reason suppression (Klaviyo), domain-level blocking with allow-list exceptions, global-vs-list scope.

## Audit of ours — the honest picture
nrtur's page has the **broadest surface of the whole peer set** — email + **domain-with-allow-list-exceptions** (a genuine differentiator even Klaviyo/SFMC don't expose this cleanly) + phone/SMS channel granularity + per-contact per-channel consent + a modeled reason taxonomy + a surfaced global-rules card. **But it was a facade.**

The decisive finding (an adversarial critic corrected the first-pass research here): enforcement **did** exist, but it read **three frozen, hardcoded copies of the same seed** —
- `contactEmailSuppressed()` (used by the bulk-send audience `stageBulkAudience`),
- the contact detail page's `suppressed` object (which disables the Send buttons),
- and `SettingsSuppressionPage`'s local `useState` (the UI you manage).

All three identical, all disconnected. So **anything you blocked or unblocked in the UI had zero effect on real sends** — block a new address and it still sends; unblock a seeded one and it stays blocked. The problem was never "add enforcement"; it was "unify the stores."

## What shipped — the foundation (make it real)
- **One shared `suppression` store** ({emails, domains, phones, channels, compliance}) lives in `CrmDataContext`, seeded by `SUPPRESSION_SEED()`. A module mirror `_liveSuppression` is synced each render (the same `_liveDeals` pattern) so the **non-React send paths** read it.
- **One set of helpers** — `supEmailBlocked` (email + domain + allow-list exceptions), `supPhoneBlocked` (E.164 last-10-digit normalization so format variants can't evade the block), `supChannelOff` (per-contact channel consent).
- **All three consumers now read the one store:** `contactEmailSuppressed` → `supEmailBlocked` (bulk send); the contact page `suppressed` object → the helpers (Send buttons); `SettingsSuppressionPage` → `crm.suppression`/`setSuppression`. Blocking in the UI now genuinely enforces everywhere.
- **Channels-by-contact is now the real consent record** — rendered from `crm.contacts` (keyed by id, not 4 demo name-strings), stored in `suppression.channels`, and every toggle **logs to that contact's timeline** via `addActivity`.
- **Opt-out carries through convert** — `buildConvertRecords` now copies `dnc` onto the converted contact (email/phone-list suppression already carries by identity), closing the leak where a suppressed lead became mailable again.
- **Real dates** on new rows (`supNewDate()`, was a hardcoded 'Jun 11, 2026' — a wrong opt-out date is a compliance liability) + **dedupe on add** (block the same address/number twice → warned, not duplicated).

## Review caught 5 more send paths (all fixed)
An adversarial review confirmed the store unification itself was clean (no 4th *data* copy, wiring/init/deps all correct) but hunted down the send paths that still bypassed it — the real test of "make it real." All fixed and re-verified:
1. **`canSendSms`** checked only `dnc` — now also honors `supPhoneBlocked` + per-contact SMS opt-out. One fix that gates **every** SMS path at once (automation SMS, the MMS composer, the inbox), so a STOP'd number is now un-textable everywhere, not just on the disabled contact-page button.
2. **Automation email actions** (welcome/proposal/reengage) sent with no check — now skip DNC/suppressed/marketing-off contacts, making the page's "auto-skipped in every sequence & automation" promise true.
3. **Automation sequence enrollment** — `enrollEmail` had no check and `enrollSms` was DNC-only; both are now channel-aware against the store.
4. **Stage bulk sends** (`stageBulkAudience`) now also skip contacts whose Marketing channel is toggled off (per-contact channel opt-outs were enforced only on the contact page before).
5. **`supEmailBlocked` is now scope-aware** — the "Marketing only" vs "All emails" choice was dead; a marketing-scope opt-out now correctly blocks marketing sends but **not** a transactional/1:1 send (only an "all"-scope row does). Verified: `old@company.net` (marketing) blocks a marketing send, allows a transactional one.

## Follow-on UX (built on the unified store)
- **Channels-by-contact is now a real opt-out list, not a wall of cards.** It rendered *every* contact as a 6-toggle card (with a silent `slice(0,8)` that hid everyone past the 8th). Now it shows **only contacts with a channel turned off** as compact rows of toggle-pills; **searching finds any contact to adjust**; a "channel opt-outs" stat was added. Scales past thousands.
- **Per-channel Communication preferences on the contact record.** The contact page previously had only a blunt all-or-nothing "Do not contact" toggle; granular per-channel control was buried in Settings. Now the contact record has a **Communication preferences** panel — "Do not contact" as the master switch plus the 6 per-channel toggles — reading/writing the *same* `suppression.channels[contactId]` store, logging each change to the contact's timeline. This matches best practice (Klaviyo/GHL put per-channel consent on the record) and stays in sync with the Settings page and the send-path enforcement.

## Deferred (the "Full plan" extras, not this pass)
Guarded reversal (confirm-on-unblock + opt-in checkbox for Unsubscribed/Spam rows), real CSV export via Blob + bulk import, rendering the unsubscribe footer + one-click List-Unsubscribe in the email preview, and a Simulate (hard bounce / spam / STOP) demo wired to the existing "Auto-suppress on hard bounce" toggle (distinguishing hard vs soft bounce). These build cleanly on the foundation.

Also left (low, flagged by the review, honest gaps): the **inbox** manual email reply/compose doesn't consult suppression (a rep can still manually email a suppressed contact — arguably an intentional override, but worth a warning later); the **transactional / push / in-app** per-contact channel toggles are stored but have no send path to enforce yet (only email/SMS/calls do); and the **compliance toggles** (global opt-out / GDPR / unsubscribe-link) are persisted but not yet read by a send path (they pair with the deferred unsubscribe-footer + auto-suppression work).

## Verified (headless CDP)
Boots clean, zero errors. `contactEmailSuppressed` and the contact page now read the live store (`supEmailBlocked` correct for seed/domain/exception/random; phone normalization matches format variants; sms-only rows don't block calls). Suppression page renders after the refactor; Channels-by-contact renders real contacts; a DNC contact shows its banner. Adversarial review (missed-consumers · wiring · enforcement-edges) + verify pass.
