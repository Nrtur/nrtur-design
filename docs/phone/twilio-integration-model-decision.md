# Twilio integration model — decision memo (managed vs BYOA vs Connect)

_Decision record · 2026-07-10 · **Status: DECIDED — managed/subaccount is the default; validated against 13 CRMs + Twilio's own docs.** Research: multi-agent web study with an adversarial verification pass (sources at the bottom; competitor claims are doc-cited but worth re-confirming before public use)._

---

## TL;DR (the decision)

**nrtur uses the managed/subaccount ("white-label ISV") model as the default — Option 1.** This is already what the prototype implements (owner-confirmed 2026-07-06, see [`PHONE_NUMBERS_A2P.md`](PHONE_NUMBERS_A2P.md)) and it matches what **every SMB-focused CRM in the market does.** The research validated the direction unanimously.

Two things to correct in how we talk about it:
1. The "if one client spams, only their subaccount is blocked and nrtur stays safe" claim is **false as stated** — the master account and our platform-wide A2P standing carry real risk. Subaccounts *minimize* contagion; they don't firewall it.
2. The "mark up SMS for revenue" upside is **thin** — telephony's value to us is a sticky bundled feature that drives retention, not a per-message profit center.

**BYOA (Option 2) stays as an opt-in "advanced / agency" tier, never the default** — because a non-technical small-business user cannot realistically complete Twilio + A2P setup themselves. For that tier, prefer **Twilio Connect (OAuth)** over storing pasted credentials.

---

## The two options as posed

- **Option 1 — Managed subaccount (white-label ISV):** nrtur owns one master Twilio account; each client gets a subaccount provisioned automatically. Numbers are bought in-app, billed to the workspace, A2P registration is guided in-app. *This is what we built.*
- **Option 2 — BYOA (bring your own account):** the client creates their own Twilio account, buys their own numbers, and pastes their Account SID + Auth Token into nrtur.

The research surfaced **two more options** the framing missed:
- **Option 3 — Twilio Connect (OAuth):** the client authorizes nrtur via a Connect button; **Twilio bills the client directly.** Essentially "BYOA with OAuth" — removes our billing burden but keeps BYOA's onboarding friction.
- **Option 4 — Integrate a managed partner:** don't own a carrier at all; embed a managed SMS partner (the Less Annoying CRM model). We've already invested in owning telephony, so this is noted, not chosen.

---

## What the market actually does

13 platforms classified. **A = managed/resold · B = BYOA · C = Connect · D = own carrier.** (all high-confidence, doc-cited)

| Platform | Model | Notes |
|---|---|---|
| GoHighLevel | **A** | "LC Phone" Twilio-backed; in-app number buy + self-serve A2P; **no markup on passthrough fees** |
| HubSpot | **A** | Twilio backend, "a Twilio account is not required"; number + 10DLC entirely in-app; sold as credits |
| Close | **A** | Numbers "powered by Twilio"; Close submits A2P to Twilio on your behalf |
| Salesmsg | **A** | Provisions numbers in-app; A2P self-serve; passthrough fees, no markup |
| Salesloft | **A** | Numbers "supplied from Salesloft's third-party provider, Twilio" |
| Kixie / Podium / JustCall / Textline | **A** | Managed provisioning + self-serve A2P (Textline acts as CSP, submits 10DLC for you) |
| Aircall | **D** | Owns its cloud telephony |
| Pipedrive | **B** | No first-party carrier; SMS via marketplace app on your own Twilio |
| Kommo | **B** | Paste your own SID + Auth Token |
| Zoho | **A+B** | Voice is Twilio-backed (managed); PhoneBridge also allows BYO-Twilio |

**Verdict:** Model A dominates **every** SMB-focused CRM and comms-first tool, and even enterprise sales engagement (Salesloft). Model B is the pattern only for CRMs where **communication isn't a core feature** and they punt to connectors. The adversarial search could not find **a single** SMB CRM thriving on BYOA-only — even Less Annoying CRM (the most non-technical-obsessed CRM) refuses BYOA and punts to a managed partner.

---

## Side-by-side scorecard

Head-to-head on the dimensions that decide it (Connect = the OAuth "advanced" variant of BYOA):

| Dimension | **Managed** (Opt 1) | **BYOA** (Opt 2) | **Twilio Connect** (Opt 3) |
|---|---|---|---|
| Non-technical onboarding | ✅ In-app + guided; never sees Twilio | ❌ 2–8 wk Twilio console + A2P gauntlet | ❌ Same console friction (OAuth only saves billing) |
| Who buys the number | nrtur, in-app | Client, in Twilio | Client, in their Twilio |
| Who registers A2P 10DLC | **nrtur, on the client's behalf** (ISV) | Client, alone | Client, in their account |
| Who Twilio bills | **nrtur (master)** → we rebill the client | Client, directly | Client, directly |
| Billing infra nrtur must build | 🔴 Heavy (metering, wallet, Stripe, tax) | 🟢 None | 🟢 None |
| Markup / revenue | ⚠️ Thin on SMS; margin lives in the subscription bundle | None | None |
| Fraud / abuse exposure | 🔴 Rolls up to **our** master (toll fraud + A2P trust score) | 🟢 Client's problem | 🟢 Client's problem |
| Credential / security liability | 🟢 We hold none of the client's keys | 🔴 We store a full-account Auth Token (our breach = their whole account) | 🟡 Scoped OAuth token — safer than BYOA |
| Support / who owns the logs | 🟢 We own the logs — full control | 🔴 Split; we punt failures to Twilio | 🔴 Split; client owns the account |
| Regulatory burden on nrtur | 🔴 Reseller obligations (needs legal review) | 🟢 None | 🟢 Minimal |
| Time to first text | 🟢 Minutes–days once approved | 🔴 Weeks | 🔴 Weeks |
| **Best for** | **Non-technical SMBs (our ICP)** | Agencies / devs with existing Twilio | Agencies / devs who want us out of their billing |
| Used by | GoHighLevel, HubSpot, Close, Salesmsg, Podium… | Pipedrive, Kommo | ~nobody as a primary flow |

**Read of the scorecard:** Managed wins the only row that matters for our ICP — non-technical onboarding — and trades that win for the billing/fraud/regulatory burden in the red cells. BYOA/Connect flip those reds to greens *for us* but only by dumping the friction on a user who can't absorb it. That's the whole decision in one grid.

## Fact-checking Option 1's stated pros

| Claim | Verdict | Why |
|---|---|---|
| "Complete control of the experience" | ✅ **True** | The real reason to do it — the user never touches Twilio. |
| "If one client spams, only their subaccount is blocked; nrtur stays safe" | ❌ **False as stated** | Twilio's own ISV doc: subaccounts *"minimize"* contagion, not eliminate; Twilio *"may need to suspend the primary [master] Account."* **Toll fraud rolls up to the master balance** (documented: $4,600 overnight; $25k on a normally-<$10/mo account). Bad client A2P traffic hurts **our** platform-wide trust score/throughput. |
| "We mark up SMS for revenue" | ⚠️ **Thin** | Twilio messaging runs its **lowest** gross margin (~31%, compressing); GoHighLevel marks up **nothing** on carrier fees. Margin lives in **subscription/seat bundling**, not SMS resale. |

---

## The true cost of Option 1 (what "managed" commits us to)

Choosing managed = **becoming a telecom reseller.** The real line items (currently *simulated* in the prototype, not built for real):

1. **Billing infrastructure** — usage metering, wallet/top-ups, markup, Stripe, dunning/credit control (a non-paying client's usage still hits *our* Twilio bill), telecom tax.
2. **A2P shepherding, per client** — register as an "ISV Reseller/Partner," then for *every* client: Secondary Customer Profile → Brand (~$44) → Campaign(s) (~$15 each) via Twilio's TrustHub API, plus rejection/resubmission handling. The status-monitoring email must be **ours**, not the client's.
3. **Fraud controls** (because the safety claim is false) — spend caps, international-premium/geo blocking to stop toll fraud (IRSF), velocity limits, A2P-quality gating.
4. **Regulatory review** — reseller FCC obligations can't be contracted away to Twilio (USF, E911; penalties cited up to $240k/violation/day with real precedents). **Medium-high risk — get a telecom-lawyer review before launch.** Note: Twilio remains the underlying carrier of record, which mitigates but does not erase this.
5. **Tier-1 support** for every client's provisioning, deliverability, and fraud lockouts. Twilio supports *us*, not them.

---

## Why Option 2 (BYOA) fails as a default

1. **The non-technical wall.** A small-business user must, on their own, create + verify a Twilio account, buy a number, and complete A2P 10DLC **brand and campaign** registration — jargon-dense, the #1 rejection is *"no opt-in process,"* it needs a live website *with a privacy policy*, and each failed attempt costs $15 ("over $50 before sending a single text"). End-to-end runs **2–8 weeks** with rejection loops; general onboarding abandonment ceilings hit 70–90%. This collides head-on with the "it just works" SMB expectation.
2. **Credential-security liability.** Twilio's own docs call the Account SID + Auth Token *"risky in production"* — it's a single, account-wide, full-privilege secret. A CRM that stores it means **a breach of nrtur = the client's entire Twilio account compromised** (voice, SMS, billing). Twilio recommends restricted API Keys instead. BYOA pushes this liability onto us.
3. **Split support.** Delivery failures surface as Twilio error codes (30007 carrier-filtered, 30034 unregistered) whose logs we don't own — we end up punting the client to Twilio.

**Who genuinely prefers BYOA:** existing Twilio users, agencies, and developers who want their own console, advanced features, and no platform markup at volume. That's the audience for the advanced tier — not our default user.

---

## Twilio Connect (Option 3) — the overlooked middle

Connect flips billing entirely to the client (Twilio charges them directly), so it **removes our billing infrastructure and credit risk** — and it's safer than storing a pasted Auth Token. **But** the client still needs an upgraded Twilio account and still does A2P in their own console, so it carries the **same onboarding friction as BYOA**. It's a good fit for the **advanced/agency tier**, not a managed-UX savior for non-technical users. (No surveyed vendor uses it as their primary flow — consistent with this.)

---

## Recommendation

1. **Managed (Option 1) is the default.** Already built; matches the entire SMB market; the only model that works for non-technical users.
2. **Reframe the business case:** telephony is a sticky, retention-driving bundled feature — not an SMS-markup profit center.
3. **Keep BYOA as an explicit opt-in "advanced / agency" tier** (we already have the legacy card). If kept, take **restricted API Keys, never the raw Auth Token.**
4. **Prefer Twilio Connect over paste-credentials for that tier** — removes our billing + credential-storage liability.
5. **Fund the four real line items:** billing rails, ISV A2P automation, fraud controls, and a telecom-legal review.

---

## Reusable decision framework (how to choose, for future features)

- **Who is the user?** Non-technical SMB → managed. Developer / agency / enterprise-with-existing-Twilio → BYOA/Connect.
- **Is communication core to the product?** For nrtur it is (inbox, sequences, automations, speed-to-lead all depend on SMS) → we must own the experience → managed.
- **Can we absorb the reseller obligations?** This is the gating question: billing infra + A2P shepherding + fraud + regulatory. If yes → managed. We've designed all of it (simulated); the real build is the commitment.

---

## Sources
**CRM landscape:** GoHighLevel LC Phone (help.gohighlevel.com) · HubSpot SMS (knowledge.hubspot.com/sms) · Close A2P (help.close.com/docs/a2p-10dlc) · Salesmsg (help.salesmessage.com) · Salesloft Dialer/Messenger (help.salesloft.com) · Kixie 10DLC (support.kixie.com) · Pipedrive Twilio marketplace app · Kommo Twilio (kommo.com/support) · Zoho Telephony (zoho.com/voice) · Textline (textline.com) · Aircall (support.aircall.io) · Podium · JustCall.
**Twilio mechanics:** Subaccounts (twilio.com/docs/iam/api/subaccounts) · ISV A2P onboarding (twilio.com/docs/messaging/compliance/a2p-10dlc/onboarding-isv, /onboarding-isv-api) · Connect (twilio.com/docs/iam/connect) · ToS/AUP (twilio.com/en-us/legal/tos, /legal/aup) · API Keys & security (twilio.com/docs/iam/api-keys, /docs/usage/security) · Anti-fraud / toll fraud (twilio.com/docs/usage/anti-fraud-developer-guide) · suspend-subaccount (help.twilio.com/articles/223183768) · Error 30007 (twilio.com/docs/api/errors/30007).
**Economics / regulatory:** A2P fee update Aug 2025 (aloware.com) · reseller tax/regulatory (commlawgroup.com) · FCC enforcement (fcc.gov/enforcement) · VoIP reseller obligations (skyswitch.com) · Twilio margins (seekingalpha.com) · toll-fraud case study (billychasen.medium.com).
**Non-technical UX / A2P timelines:** twilsms.com · pitchprfct.com · gohighlevel.ai · centripe.ai · a2pfastpass.com · telphiconsulting.com · pingram.io · Genesys BYO-SMS.
