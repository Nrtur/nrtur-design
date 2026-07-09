# Communications routing & AI-suggested next actions — core design doc

_Research + design decision record, 2026-07-07. Sources: 3 read-only code audits of `index.html`, 5 web-verified competitor research passes (official docs), 1 adversarial design review. This document answers two product questions and is intended as core documentation._

**Q1 (routing):** when an email / SMS / call / MMS arrives, which record does it attach to — lead? deal? which deal if the person has several? Outbound from nrtur is easy (we chose the context); inbound with a new subject line — or no subject line at all — is the hard case.
**Q2 (suggestions):** when a communication arrives, how do we suggest the next action (reply / create task / etc.), with one-click accept or dismiss — and for calls, transcript + AI summary feeding that suggestion?

---

## 1. How the industry routes inbound communications (web-verified)

The single most important finding: **nobody routes by subject line.** Every CRM routes by **identity** — the sender's email address or phone number — and the subject line is irrelevant even for email (a new subject just starts a new thread; the thread still lands by address match). That dissolves the "new subject line" worry: it was never the routing key.

| CRM | Identity resolution | Record shape | Multiple open deals → ? |
|---|---|---|---|
| **Salesforce** | Email address (EAC matches From/To/CC → Contact/Lead); phone number for calls (screen-pop; multi-match → agent picks) | **Two pointers**: `WhoId` (person: lead/contact) + `WhatId` (one business object). Lead WhoId ⇒ WhatId must be empty. EAC then *rolls up* the email onto matched accounts/opportunities' timelines | Auto-associates to related **open** opportunities via contact roles (roll-up, not a pick); reps repair manually; admins can rewrite the matching Flow |
| **HubSpot** | Email address (logging rules; unknown sender optionally creates contact); phone number for calls/SMS/WhatsApp threads | One engagement, **many associations** (contact + primary company + deals) | Silently fans out to the **5 most recent open deals** (admin-configurable: none/1/5/all). Closed deals never auto-receive comms |
| **Pipedrive** | Email address (Smart BCC auto-creates missing Person); Android-only inbound call matching by default phone field | Person + **at most one open item** (lead/deal/project) per thread; deal-specific BCC = deterministic bypass | **1 open deal → auto-link. More than one → refuses to guess**; email sits on the person until manually linked |
| **Zoho** | Email address → Lead/Contact emails list; phone-number screen-pop for calls | Email → person + **one predicted deal** (primary contact only) | Silent recency: links to the **last-modified open deal**; manual Link/Change/Unlink to repair |
| **GoHighLevel** | Phone/email dedupe keys → ONE contact, ONE unified conversation across all channels | Single pointer (contact). Opportunities never hold comms | Never arises — comms live on the contact; workflows use "Find Opportunity" (earliest/latest) when they must pick |
| **Close** (contrast) | Email + phone → lead timeline; unknown callers = "Potential Contacts", retroactively attached when a matching lead is created | Communication-centric single feed per lead | N/A (no contact-vs-deal split) |

**Convergent principles:**
1. **Identity-first, always.** Email → address match; call/SMS/MMS → normalized phone match. Subject lines never route.
2. **Person is the anchor; deal is a second, optional pointer.** Comms attach to the person (contact, else lead) and *surface* on deals via association — never duplicated, never deal-only.
3. **Leads never point at deals.** Salesforce enforces it structurally (lead WhoId ⇒ empty WhatId); a lead pre-conversion has no deal.
4. **Multi-deal handling is where they differ** — silent guess (Zoho), fan-out (HubSpot), refuse-and-ask (Pipedrive). Pipedrive's conservatism is the only one that never mis-attributes.
5. **Unknown sender → create a lead** (HubSpot optional-create, GHL auto-create, Pipedrive auto-create Person, Close potential-contacts). Dead-ends are avoided.

## 2. The nrtur routing model (decision)

nrtur already has the right primitives: a single `addActivity` choke point with `subjectType/subjectId`, an email+phone identity matcher (built for ad-lead dedupe: lowercase email OR last-10-digit phone), and id-linked deals (`primaryContactId` / `additionalContactIds`). The model maps on cleanly:

**R1 — Identity waterfall (all channels).** Inbound comm → match sender by email address / normalized phone → **existing Contact** first, else **open Lead**, else **create a Lead** (same terminal branch as ad-lead capture — never a dead end). This is one shared resolver, reused from the ad-lead matcher.

**R2 — Two-pointer activities (Salesforce shape, zero migration).** Keep `subjectType/subjectId` as the person pointer (WhoId). Add **one optional `dealId`** (WhatId) to communication-type activities only (email/sms/mms/call/meeting). Existing rows are already valid (`dealId == null`). Invoices already model exactly this join in the codebase — precedent, not invention.

**R3 — Roll-up rendering, strictly id-based.** A deal's timeline shows: its own activities + the person-comms where `dealId === deal.id`, joined via `primaryContactId`/`additionalContactIds` **only** (never the company-sibling or name-string fallbacks — those fan a comm out to every contact at a company). A comm appearing on both the contact and its deal is the *intended* Salesforce-style behavior, not double-counting.

**R4 — Multi-deal disambiguation (Pipedrive-conservative).**
- Person has **exactly one open deal** → auto-associate the comm to it.
- **More than one** → attach to the person only and show a one-click **"Link to deal"** chip listing their open deals. *We never guess.* (Zoho's recency guess silently mis-files; HubSpot's 5-deal fan-out pollutes timelines at SMB scale.)
- **Zero open deals** → person only.
- **Outbound sent from a deal page** → stamps that `dealId` explicitly (the user already chose the context — this is the boss's "outbound is easy" case, made structural).
- **Leads:** comms attach to the lead only; on conversion the timeline follows via the existing converted-lead stitch. No lead-deal linking (structurally meaningless pre-conversion).

**R5 — No-subject channels (call/SMS/MMS).** Same waterfall via phone number (normalize to last 10 digits — the matcher exists). Threads key on person+number, not display name. Unknown number → create Lead + "Unknown caller" affordance.

## 3. What nrtur has today vs. what's missing (audited, line-referenced)

**Real assets we build on:** unified inbox UI (email/SMS/MMS/calls — MMS is surprisingly deep), A2P/DNC gating on every send, a call **transcript + 5-bullet summary + talk-ratio renderer that already exists** (`ActTranscript`/`ActCallExpanded`, seeded demo payloads), Recommended-next-action cards on contact & lead detail, the deal `nextAction` picklist, a single `addActivity` choke point, the email+phone matcher, and an automation engine that genuinely fires record-CRUD/deal-stage events.

**Gap list (what's missing):**
| # | Gap | Evidence |
|---|---|---|
| G1 | **No identity resolution for comms.** Inbox emails/SMS/calls link to people by display-name strings; no address/phone matcher is wired to any channel | MAIL_EMAILS :10602 (no ids), SMS name-match :11446, calls name-match :11193 |
| G2 | **No persistence bridge.** No inbound or outbound inbox comm ever writes to the activity store; SMS send doesn't even append to its own thread; contact-page compose isn't logged (lead-page is) | :11419–11441, :11540, :8018 vs :10542 |
| G3 | **Single-pointer activities.** A logged comm can appear on exactly one record — never contact *and* deal. Cross-record "visibility" is an illusion from seeded demo generators | :23979, :7417–7450 |
| G4 | **Multi-deal routing is unanswerable** today because nothing routes at all (G1+G3 upstream) | — |
| G5 | **Post-call decisions are theater.** All 7 decisions ("Create task", "Mark deal won"…) and the "Update contact status" select only fire success toasts — zero execution | :10950, :10956, :11174 |
| G6 | **Inbound automation triggers are decorative.** 'Email received', 'SMS reply received', 'Call logged' etc. have no emit sites (~23 of ~66 catalog triggers actually fire) | :12488–12501 vs :18574+ |
| G7 | **Wrong-record bugs:** "View contact" in email & SMS panes navigates with no id → always opens the first contact | :10886, :11532 |
| G8 | **Sequences' reply-handling copy is fiction** — "replies auto-unenroll" is claimed in UI text; enrollments are add-only | :8605, :23886 |
| G9 | **No AI suggestion surface.** "AI sort" and "AI draft" are dead decorations; live-logged calls get no transcript/summary payload (renderer exists, payload missing); no suggested replies / task-from-email anywhere | :10775, :12314, :7899 vs :7309 |
| G10 | **Deal timeline can't receive comms** (no call/email composer) and `lastActivity` is never stamped by comm logging | :9407, :23979 |

Honest framing for stakeholders: the inbox is a visually complete but **record-disconnected** surface today — its connect-mailbox copy promises "every message auto-logs to the right contact and deal," which is exactly the feature this doc specifies. The demo *looks* routed because seed data hand-writes the associations.

## 4. Suggested next actions — design (Q1 of the boss's messages)

**Industry pattern (verified):** suggestions attach to the *specific communication*, are **draft-only until a human accepts**, and execute in one click or dismiss. HubSpot Breeze: call summaries with a "next steps" section → per-item **Create a task** / all-at-once; reply recommendations with send / edit / dismiss. Salesforce: Einstein Conversation Insights Action-Items tab; Email Insights intent pins with one-tap task creation. Zoho Zia: Activity Extraction renders **Capture Meeting / Schedule Call / Schedule Task** buttons pre-populated from the email body. GHL: suggestive mode drafts the reply *before the agent opens the conversation*. Pipedrive: email summary = Summary / Sentiment / Buy-readiness / Action items.

**nrtur design — suggestion chips on the communication row:**
- **Inbound email** → chips: `Reply` (opens composer), `Create task` (pre-filled from email), `Link to deal <X>` (when R4 left it unlinked). Optional AI-summary line above the chips.
- **Call logged** → the *existing* outcome/decision capture stops toasting and starts executing: "Create task" creates the task; "Send proposal" creates the task *and* sets the deal's `nextAction:'Send proposal'`; "Mark deal won/lost" opens the real outcome modal; "Schedule follow-up" opens the scheduler. The seeded transcript/summary/talk-ratio card becomes the standard payload for live-logged calls too (simulated content, labeled as AI).
- **SMS/MMS** → `Reply`, `Create task`.
- Every chip = one-click execute or **dismiss**; dismissals are UI state per record (precedent: the contact NBA card), never timeline rows.
- **Coexistence rule (critical):** chips are *per-communication*; the existing Recommended-next-action card stays the *record-level* roll-up. Chips execute through existing handlers and write `deal.nextAction` — which the NBA card already reads live. So chips **feed** the NBA card instead of competing with it; three surfaces can never disagree because there is one underlying field.

## 4b. Linking semantics (one row, two views — decided & implemented)

Three rules govern what happens when a communication is attached to a deal:

1. **Attaching never creates a new activity.** There is exactly one activity row per communication; "attach to deal" sets `dealId` on that existing row. The deal timeline *renders* it via the roll-up filter. Duplicating instead would mean stale copies on edit, ghost rows on delete, and double-counted reports — the failure family the two-pointer design exists to prevent (Salesforce WhoId/WhatId associations and HubSpot engagement associations behave identically).
2. **Time = when the communication happened, never when it was linked.** An email received at 2:00 PM and linked to a deal at 5:00 PM appears on the deal timeline **at 2:00 PM**, slotting retroactively into chronological position (below any stage moves that happened after it). Link-time stamping would falsify the deal's story ("she replied, then we advanced" vs the reverse). Unlinking removes the deal's *view*; the contact history is untouched.
3. **The link action itself is silent.** No "X linked this email" timeline row — association changes are administrative, not sales history (Salesforce/HubSpot keep them silent too). If audit is ever needed, it's metadata on the activity (`linkedBy`/`linkedAt`), never a new row.

Prototype note: activity `ts` is a frozen relative label, so `addActivity` now also stamps an absolute `at` (wall-clock) — the stable sort key that keeps link-later rendering honest.

## 5. Delivery plan

**Phase 0 — honesty fixes ✅ SHIPPED 2026-07-07:** email seeds id-linked (`contactId`/`dealId`; chips aligned to real records — "James Whitfield"→James Rivera, deal chips point at real deals; the Marcus Rodriguez email deliberately left person-unlinked as the unknown-sender demo); both "View contact" buttons resolve id-first with an honest "Sender isn't a contact yet" toast when unresolvable (G7); the email banner's deal chip is clickable when `dealId` exists; SMS threads moved to state, sends append the bubble + update the list preview (A2P-gated, correctly blocked while the campaign is pending); SMS seeds carry `contactId`; contact-page composer now logs "Email sent — {subject}" to the timeline via `onSent` (G2-lite). Verified headless: email→Sarah Chen nav, unknown-sender toast, deal-chip→Pivot deal, SMS View-contact, gated + approved send paths (sim-clock +3 days → campaign approved → bubble+preview append), compose→timeline log; zero runtime errors.

**Phase 1 — the routing spine (items 1–4 ✅ SHIPPED 2026-07-07):**
1. ✅ `dealsForPerson(personId)` — canonical open-deal membership, strictly id-based (`primaryContactId`/`additionalContactIds`; company-sibling and name-string joins explicitly excluded from routing). Seed backfill: deals 1 & 6 gained real contact ids (Sarah Chen now legitimately has two open deals — the multi-deal demo case).
2. ✅ Optional `dealId` on comm-type activities (`COMM_ACT_TYPES`) + absolute `at` stamp in `addActivity`; `updateActivity(id,patch)` added to the CRM context for link-later.
3. ✅ Deal-page roll-up: deal timeline = own rows + person comms where `dealId === deal.id` (strict — an unlinked comm from a multi-deal person appears on NO deal, per R4's never-guess rule; the critique's `dealId==null` membership clause was rejected as fan-out).
4. ✅ Contact-page choke points (call log, dialer, compose) auto-associate when exactly one open deal; comm rows render `ActDealLinkChip` — a navigable deal pill when linked, a "Link to deal" picker when unlinked with open deals.
5. ✅ **Suggestion chips + real execution (SHIPPED 2026-07-07).** (a) `EmailSuggestBar` on the inbox email detail: "Suggested next steps · simulated AI" — heuristic chips per email (question detected → Reply; meeting words → *Create task — schedule the call*; document words → *Create task — send the document*; else follow-up). One click executes through existing handlers (reply composer, calendar task store with `contactId` link) or ✕ dismisses (per-email UI state, no timeline row). (b) Post-call decisions on the contact dialer now **execute** (were `decisionToast` theater): *Schedule follow-up*/*Send proposal* really create tasks + log to the timeline (deal-associated via `_commDeal`); *Send proposal* also sets `deal.nextAction` — which the Recommended-next-action card reads live, so chip and card can never disagree; *Send email*/*Create task* open the composer/scheduler; **Mark deal won/lost deliberately routes to the deal page** — outcome governance (reason modal, blueprint, approvals) is never bypassed from a call log. Verified headless end-to-end: chips per heuristic, one-click task lands on the contact's Tasks panel, dismiss works, Reply opens the thread composer; full dialer flow (dial → connected → end → enrichment → decision "Send proposal" → Save log) produced the real task, the timeline row, and deal 206's next action; zero runtime errors.

**Demonstrated headless (both boss questions):** Sofia (1 open deal) → email auto-linked, visible on the Craftly deal timeline immediately. Sarah (2 open deals) → email logged person-only + chip listing exactly her two open deals → linked to Summit — Renewal *after the fact* → the deal timeline shows the **same single row** (count 1 on both pages — no copy) at its **original "Just now" time**, the contact timeline unchanged, and the *other* deal (Meridian) shows nothing. Zero runtime errors.

**Phase 2 — inbound simulation + automations ✅ SHIPPED 2026-07-07:**
- **"Simulate inbound ▾"** in the Inbox header (Email from a known contact / from an unknown sender / SMS reply) runs the R1 waterfall live. Known sender → email lands linked (contact banner, R4 deal chip when exactly one open deal), a real timeline activity is written (the persistence bridge, G2), `lastActivity`/`days` stamped like ad-lead dedupe does.
- **Inbound automation triggers now fire** (G6): `'Email received'`, `'SMS reply received'`, and `'Call logged'` are emitted with exact trigger strings through `fireEntityAutomationEvents` — Call logged wired at all four call seams (contact log-modal + dialer, lead log-modal, Calls-workspace persist). Runs are observable in autoLogs, run counters, timeline "⚡ ran" rows, and toasts.
- **Unknown sender** → amber "Unknown sender — not in your CRM yet" banner with a **Create lead** chip: dedupes by address against contacts→leads first (links instead of duplicating), else creates a Lead (`source:'Email'`), logs the inbound email on it, fires 'Email received' (ent lead), and the banner flips to "Lead — captured from this email → View lead".
- **Sequence reply-unenroll is real** (G8): any simulated inbound email/SMS from an enrolled contact removes their enrollments (matched on `contactId` — the only key reliable across the rich stage-bulk and sparse automation row shapes), logs "Unenrolled from —" on their timeline, and toasts. The enrollment copy's "Replies auto-unenroll" promise is no longer fiction.
- Verified headless end-to-end (all green, zero errors): known-email sim → banner + 3 toasts + enrollments emptied + autoLog success + 3 timeline rows on Maria; unknown-email sim → banner → Create lead → Nadia lead page with the inbound activity; SMS sim → bubble + 'Inbound SMS alert' fired + timeline row on Sarah; dialer call → 'Call logged alert' fired.

**Phase 3 — the AI layer ✅ SHIPPED 2026-07-07:**
- **Live-logged calls get the full rich card** (was seeds-only): `liveCallPayload()` fabricates a simulated AI summary (outcome/reason/notes/decision-aware bullets — e.g. "Agreed next step: Send proposal."), talk ratio, recording bar, and a searchable transcript, in the exact payload shape the existing renderer consumes; wired at all four call creators (contact modal + dialer, lead modal, Calls-workspace persist). Missed calls (No answer/Busy/Wrong number) get an honest summary-only payload — no fabricated transcript for a call that never happened. Cards carry an **"AI summary · simulated"** label (`payload.ai`); a real transcription+LLM service swaps in behind the same payload in production.
- **Suggested replies**: the reply composer's AI-draft is now **context-aware** (budget/meeting/document/question lenses over the message being replied to — same heuristics as the suggestion chips, so the surfaces agree); the compose modal's dead Sparkles button now drafts a personalized follow-up (recipient name from the address, subject auto-filled).
- Verified headless: dialer call with decision "Send proposal" → rich card on the contact timeline with AI label, decision bullet, talk ratio, expandable transcript ("lock it in — I'll take 'Send proposal'"); reply to Sarah's email → "Happy to jump on a call — Thursday at 2pm PT…" (meeting lens); compose to maria@bloom.co → "Hi Maria" + subject autofill. Zero runtime errors.

**All four phases of this document are now implemented.** Remaining honest gaps vs production: `lastActivity` stamping is done at the inbound choke points but not yet derived globally; chip-dismissal telemetry is UI state only; live email/SMS ingestion is simulated (the "Simulate inbound" button stands in for real Gmail/Twilio webhooks).

**Production notes (out of prototype scope, flagged):** real implementations swap the simulated pieces for a transcription service, an LLM suggestion service, E.164 phone normalization, and a real mail-sync pipeline (Gmail/Outlook connectors, logging rules à la HubSpot, excluded-address lists). The routing *model* above is unchanged by that swap — which is the point of deciding it now.

## 6. Decision summary (one paragraph)

Route every inbound communication by **identity** (email address / phone number — never subject line) to a **person** (contact, else lead, else create a lead); carry an **optional single deal pointer** set automatically only when the person has exactly one open deal, set explicitly when the user sends from a deal page, and otherwise offered as a one-click "Link to deal" chip — never guessed. Render comms on deal timelines by **id-based roll-up**, not duplication. Attach **suggestion chips to each communication** (reply / create task / link-to-deal / call-outcome actions) that execute through existing handlers in one click or dismiss, feeding the record-level next-action card rather than competing with it.
