# A2P registration — unified guided wizard (2026-07-08)

_Reworking the A2P 10DLC registration from three separate modals into one guided wizard, driven by a web-verified study of how Twilio and GoHighLevel present "real registration."_

## The ask & the research
The A2P *model* was already one of the most faithful things in the prototype (profile → brand → campaign chain, enforced gating, `smsComplianceState()` as the real send gate, sole-prop caps, fees, simulated carrier review). But the *experience* was three separate modals launched from a checklist that **dead-ended at every gate** — submit profile → *Simulate +1 day* → register brand → *Simulate again* → register campaign. You couldn't flow through it in one sitting.

Research verdict: a unified wizard is the convergent best-practice. Twilio renders A2P as a guided per-stage stepper; **GoHighLevel** — nrtur's closest managed-SMB analog — wraps profile → brand → campaign → consent in **one gated wizard**. The one hard tension (a true single-sitting wizard vs genuinely async approval — brand can't register until the profile is approved) is resolved exactly as GHL does: **collect everything in one pass, submit as a bundle, and auto-cascade** each downstream stage as the upstream clears.

## What shipped — `TrustRegistrationWizard`
One guided flow, launched by a single "Start / Continue / Review registration" CTA at the top of the Trust center:
- **Step 0 · Eligibility** — "Do you have a Tax ID?" forks Registered business vs Sole proprietor up front (promotes the brand-type choice to the front, per Twilio/GHL).
- **Step 1 · Business profile** — entity, legal name, EIN, address, website, authorized rep.
- **Step 2 · A2P brand** — *inherits* the profile's legal name / EIN / address / website as read-only chips ("edit in profile"); only the genuinely new fields (industry vertical, sole-prop mobile) are asked. Derive-don't-retype.
- **Step 3 · Campaign** — use case (flags "needs closer review + two samples" for marketing/mixed), sample messages.
- **Step 4 · Consent & policies** — *the real compliance gap, now closed*: **Privacy Policy URL + Terms URL (required, https-validated)**, opt-in method + description, a prefilled opt-in **confirmation** message, and editable **STOP / HELP** replies. These are now hard-required by TCR/carriers and were the top real-world rejection cause.
- **Step 5 · Review & submit** — a read-only summary of every stage with one-click jump-to-edit, plus the $15 fee at the point of commitment.

**Gating is visible, not toast-based** — the Continue button disables and forward stepper jumps lock until the current step is valid.

**Submit = one bundle + cascade.** Submitting writes profile (pending), brand (queued), campaign (queued) at once and debits $15. Then `_autoAdvance` **cascades**: when the profile approves it auto-promotes the queued brand to pending; when the brand verifies it auto-promotes the queued campaign — no re-opening a modal between carrier approvals. (If the profile is already approved, the brand starts pending directly.)

**The three Trust-center cards remain** as the post-submission **status dashboard** (with a new "queued" chip) and keep their per-stage **edit-and-resubmit** modals for the rejection path.

## Verified (headless CDP)
Boots clean, zero errors. Full 6-step navigation; Review is reachable only after the required Privacy/Terms URLs are filled (gating works); submit writes the bundle. The cascade was traced day-by-day: submit → brand pending / campaign queued → **+1** brand verified → **+2** campaign auto-promoted to pending → **+5** campaign approved → `smsComplianceState()` ok (**messaging live**). A 3-lens adversarial review (cascade/state · regression · validation) + verify pass.
