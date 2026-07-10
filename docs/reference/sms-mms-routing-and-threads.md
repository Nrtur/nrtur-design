# SMS & MMS — Routing & Threading (model · audit · decision)

_Companion to [`comms-routing-and-suggestions.md`](comms-routing-and-suggestions.md), which decided the **email/inbound identity** model. This doc does the same for **SMS/MMS**: the canonical model (verified against 5 platforms' docs), an honest audit of what nrtur actually does today (cited by function + line), the gaps, and the recommended model to lock in._

**Scope:** managed telephony, one/few workspace numbers, UI prototype as the working spec. Researched against **GoHighLevel, HubSpot, Salesforce (Digital Engagement), Twilio Conversations (the reference architecture), and Close** — all web-verified against official docs.

---

## TL;DR

- **What's real in nrtur:** the **send-side compliance gate** (`canSendSms` → A2P/10DLC via `smsComplianceState` + DNC + suppression) is solid and applied on *every* send path. SMS threads carry a durable `contactId`, and a persistence *bridge* writes an SMS activity onto the contact/deal timeline that survives navigation.
- **What's simulated / missing:** there is **no phone-number layer at all** — inbound SMS ignores the sender's number and always appends to the first seed thread; the "Send from" number is discarded (no sticky sender); inbox threads are ephemeral `useState` that re-seed on navigation; the persisted SMS row is **lossy** (`payload:{dir}` only), so the pretty threaded bubbles on a record timeline are a **synthetic demo** (`seedMsgThread`), not the user's real messages; **MMS never persists** and is a separate name-string silo from SMS for the same person; there's **no inbound STOP/HELP** processing; and the "Unified inbox" is tab-siloed with a hardcoded "All" feed.
- **The one fix that cascades:** make threads **durable and lossless** (persist the real message into `payload.thread`). That single change makes durable-threading (D5), thread-key (D4) and the unified inbox (D8) real at once.

---

## 1. The canonical model (D1–D8)

Twilio Conversations is the reference spine; the CRMs are how that spine is applied for a business with a contact database.

| # | Dimension | Convergent best-practice |
|---|---|---|
| **D1** | **Inbound match** | **Normalize the sender to E.164 first, then match** the number against a stored contact phone. On an **unknown number**, either auto-create a contact (GHL always; Salesforce auto-creates a bare `MessagingEndUser`) or park it as an explicit "unknown" (HubSpot) / retro-link on contact creation (Close). On a **shared number** *nobody* has a true multi-match resolver — it's a deterministic dedup rule. **Rule: normalize → match → on miss create-or-park explicitly; never guess on a shared number.** |
| **D2** | **Sticky sender** | **Reply from the exact number that last talked to the contact** (Twilio Sticky Sender; GHL "last-used"; Close "reply from the number that received it"), with a workspace-default fallback. The heavyweight **number-pool / Messaging Service abstraction is Twilio-only — the CRMs deliberately don't expose it.** |
| **D3** | **Anchoring** | A durable **record id, never a name/number string**, and the anchor is the **person, not the deal.** The deal hangs off the contact (Salesforce `MessagingEndUser`→Contact with optional Case; Close SMS activity carries `contact_id`+`lead_id`, **no** deal FK; GHL `contactId`). |
| **D4** | **Thread key** | One active thread, keyed by the **(workspace-number ↔ contact-number) pair.** Two schools: *continuous* (GHL, Close — one rolling per-contact thread) vs *windowed session* (HubSpot 24h; Salesforce inactivity auto-close). **Group MMS keys on the full participant set — Twilio only; the CRMs are 1:1.** |
| **D5** | **Durable records** | Threads + messages are **first-class stored entities with stable ids, queryable and reportable** (Twilio `CHxxx`, GHL `conversationId`, HubSpot `threadId`, Salesforce `MessagingSession`, Close persisted SMS activity) — **not** re-rendered from a raw log. |
| **D6** | **MMS media** | Attaching media auto-upgrades SMS→MMS (drops the 160-char cap). Caps converge tight: **total message < ~5 MB, ≤ ~10 attachments**, MIME validated. Media stored as a message sub-resource, rendered inline (final look is device-controlled — iPhone splits the bubble). **Real group MMS is Twilio-only.** |
| **D7** | **STOP / suppression / A2P** | Two layers: **(1) A2P 10DLC registration is mandatory to send** (unregistered A2P blocked since Feb 2025); **(2) inbound STOP/UNSUBSCRIBE is auto-processed → flips a consent flag → blocks every outbound path at one send chokepoint**, while the thread stays visible and inbound still appends. HubSpot's insight: **bind suppression to the phone number, not the contact row**, so it survives delete/merge/recreate. HELP auto-replies; START re-opts-in. |
| **D8** | **Unified inbox** | SMS is **not a silo** — messaging channels (SMS/MMS/WhatsApp/social/chat) merge into **one per-contact conversation** (GHL, HubSpot). Voice + email share the record timeline while keeping separate thread objects. **At minimum SMS+MMS = one thread; roll every channel onto one contact-anchored timeline.** |

_Representative sources (full set in the research record): GHL Conversations API + "Select SMS To/From Numbers" + LC-Phone messaging policy; Twilio Conversations + Messaging Services (Sticky Sender, error 11751 for >5 MB); HubSpot Conversations inbox; Salesforce Messaging Session / MessagingEndUser; Close SMS activity model._

---

## 2. nrtur today — real vs simulated (cited by function, line)

nrtur models one logical conversation in **three incompatible shapes with no shared key**: inbox `SMS_CONVOS` (line 12811), a separate inbox `MMS_CONVOS` (11712), and per-record synthetic `seedMsgThread` activity payloads (7439).

| # | nrtur today | Status |
|---|---|---|
| **D1** | `simInboundSms` (11887) hardcodes `smsConvosRef.current[0]` (always the first seed thread) and resolves the person by `contactId` else a name string. **The sender's number never enters the match**; `SMS_CONVOS` carry no phone (12811). Email has a real known/unknown + Create-lead split (11866/11881); **SMS has none.** | 🔴 missing |
| **D2** | The "Send from" `<select>` (`smsFrom`, 11915) is **discarded** by the send handler (12011) — it only feeds the footer "Sending as" label (12093). Inbound never records which number it landed on. No sticky sender, no pool. MMS has no from-picker. | 🔴 cosmetic |
| **D3** | SMS threads carry a durable `contactId` + id-resolved "View contact" (12003/12812) — correct. **MMS threads have no `contactId`** (11712); `sendMms` gates by `c.name===mmsSel.contact` (11934), no View-contact link. No deal FK (deal is re-derived via the single-open-deal heuristic). | 🟠 split |
| **D4** | A "thread" is keyed by a synthetic integer id (1–4); a nav-opened thread gets `'new-'+ct.id` (11908). No number-pair key; 1:1 only. | 🔴 no real key |
| **D5** | **THE HEADLINE.** Inbox convo lists are component `useState` seeded from module constants (11848/11920) — **appended messages vanish on nav re-seed.** The bridge that *does* survive (`_addAct` into `crm.activities`, 11898/12011) writes a row whose **payload is only `{dir}` — no `thread`** — so `ActMsgExpanded` renders it with `msgs=[]` (7718). The threaded bubbles on a record timeline are the **synthetic `seedMsgThread` demo** (7470/7492), not real messages. **`sendMms` (11932) never persists anything.** | 🔴 ephemeral + lossy |
| **D6** | Two incompatible media shapes: inbox `{type,grad,name,size,dur}` (11740) via `MmsThumb/Lightbox/Gallery` vs timeline `{c,c2}` (7723) — a photo can't round-trip. `attachMms` picks a random sample (11930). Footer claims "5 MB" (12093) but seed assets reach 14.2 MB and nothing validates. No group MMS. | 🟠 stub |
| **D7** | `canSendSms` (5373) = `smsComplianceState` A2P/10DLC (5354) + `dnc` + `supPhoneBlocked` (9773) + `supChannelOff` (9775), gating **every** send surface (inbox 12006, MMS 11934, automations 19247, sequences 18651, reminders 21279, speed-to-lead 24661) — **genuinely solid.** But there's **no inbound STOP/HELP processor** (`simInboundSms` hardcodes a friendly body, 11890; "STOP" only appears in an A2P sample + a comment + sequence-exit config). Suppression is populated only manually or via convert-carry. A suppressed contact still gets an open composer (banner is workspace-level only). | 🟢 gate / 🔴 inbound |
| **D8** | Independent tab sources (`emails` 11806, `smsConvos` 11848, `mmsConvos` 11920, Calls, Push/InApp). The "All" tab is a **hardcoded static `ALL_ITEMS` list** (11951) whose rows just switch tabs; footer bills it "Unified inbox" (12094). Sarah Chen is SMS id1 (with `contactId`) *and* MMS id1 (no `contactId`), unlinked. Real cross-channel interleaving exists only on the record timeline (`buildActivityFeed` 7530 + `COMM_ACT_TYPES` 9824) — and even there MMS never lands and SMS lands bubble-less. | 🔴 silo |

**Biggest gaps, in order:** **D5** (no durable threaded persistence — the lossy `{dir}` bridge is the root) → **D1** (no phone match) → **D8** (fake unified inbox) → **D7** (no inbound STOP) → **D2** (sticky sender discarded). D3/D4/D6 mostly fall out of fixing D5/D1.

---

## 2.5 · The three deep questions — decided (follow-up research)

A second, focused study (workflow `wf_32e35016-ebd`, Twilio + GHL/HubSpot/Salesforce/Close/Pipedrive, doc-verified) settled the three questions that gate the build:

**Q1 — Should SMS + MMS be ONE thread? → YES, decisively.** MMS is not a separate channel; it's *"a text that carries media"* — at Twilio the **same** Message resource (`NumMedia=0` = SMS; attach a `MediaUrl` → `NumMedia>0` = MMS). Close ("SMS with file attachments"), GHL ("sent as MMS when media is attached"), and Salesforce (images *within* the SMS channel) all mirror this. Only HubSpot *native* is text-only — a capability gap, not a design choice. **Rule: one thread; media is an `attachments[]` property; attaching media auto-upgrades SMS→MMS in place.** _(nrtur today does the opposite — separate `SMS_CONVOS`/`MMS_CONVOS` stores that duplicate the same people.)_

**Q2 — How a text routes to deal / lead / contact. → Person-first, deal is derived; keep it Pipedrive-conservative.** Universal law across all 4 CRMs: **the text belongs to the PERSON (matched by phone); the deal is a secondary *associated* view, never the owner.** Pre-convert = lead, post-convert = contact, continuous either way. The *"which deal"* spectrum: **GHL** never (contact only) · **Pipedrive** the one open deal, else none · **Salesforce** exactly one you pick · **HubSpot** fans out to 5 open deals. **Our stated rule ("one open deal → auto-attach, else chip, never guess") = exactly Pipedrive — validated as the right fit.** We already half-implement it (`dealsForPerson`, index.html:12011); the gap is the **"else chip"** (multiple open deals currently drop the deal *silently*). And **"only the conversion deal shows lead history"** = correct (mirrors Salesforce convert-copy; avoids HubSpot fan-out).

**Q3 — Is a thread trackable FROM Twilio? → No on plain Messaging; you build it. Use Programmable Messaging.** **Programmable Messaging** gives a message only its own `MessageSid` + `From`/`To`/`Body`/`NumMedia` — **no thread id**; you thread by the **`(From, To)` number pair, scoped to the specific workspace number** (collision gotcha: a contact texting two of your numbers). **Conversations API** gives a Twilio-owned `ConversationSid` (`CH…`) thread with participants + multichannel, but costs **per-MAU (~$0.05) + media storage on top** of normal fees. **Decision: Programmable Messaging + our own number-pair thread record now; Conversations deferred until multichannel / group texting / Flex handoff is a real need.**

**The spine that unlocks all three:** a **first-class Conversation entity keyed by `(workspaceNumberId, contactPhoneE164)`**, stored in `CrmDataContext` (like activities/suppression), holding channel-agnostic messages with optional `media[]` and a nullable `participantContactId` (→ lead). Build order: **Conversation spine → merge the stores → fix the MMS "black hole" (`sendMms` persists nothing, 11932) → give leads a text path (they're a routing dead-zone today) → add the multi-deal chip.** Explicitly do NOT build: Conversations API, WhatsApp/multichannel, or group texting until forced.

---

## 2.6 · Timeline display — sessionize, don't blob (decided)

A follow-up study (workflow `wf_5adb1a86-4e4`: GHL/Close/Intercom/Front doc-verified; Salesforce sessions from `wf_911798c2-341`) settled **how a text conversation should appear on a record's activity timeline** so a multi-year history reads as digestible entries, not one wall.

**The technical crux (why SMS ≠ email here):** **SMS cannot be reply-linked like email.** Email carries `Message-ID`/`In-Reply-To`/`References` headers, so replies chain into a thread (content-addressed). Plain SMS/MMS carries **no subject, no message id, no reply pointer** — carriers route purely by the number pair + timestamp (verified: Twilio + SMS-threading patent US8046014; only WhatsApp/RCS has a single one-level reply pointer). **So there are exactly two ways to slice a text conversation: (a) time-gap sessions, or (b) explicit close/reopen — never a header-based reply-chain.**

**Three real patterns in the wild:** (1) **sessionized records** — Salesforce Messaging Sessions auto-close on inactivity → each is a discrete timeline entry; Intercom/Front close+auto-close (default 3 days, up to 14). (2) **one continuous pane + date separators** — GHL/Intercom/Front chat. (3) **one row per message** — Close, tamed by filter tabs.

**nrtur today (audited):** the worst of both — one **synthetic** "Text thread with X · N messages" summary card (`seedMsgThread`, line 7439/7492), *not* sessioned and *not* per-message, **plus** separate real per-send `{dir}` rows that conflict with it. No time-gap slicing.

**Decision — store continuous, slice on display:** keep ONE continuous `Conversation` (the spine) as the source of truth, and render the record timeline as **session cards per inactivity-gap burst**: *"Texts with Sarah · 6 messages · Jan 12–13"* → expandable to bubbles (in-thread date separators when it spans days) → deep-links to the full conversation. This is Salesforce's Messaging-Session model applied at *display* time. On a **deal**, show only the sessions containing messages tagged to that deal. Retire the synthetic `seedMsgThread` duplication. _(This **revises** the earlier "skip session-windowing for v1" note — sessioned **display** is the right call; storage stays continuous.)_

**Owner decisions:** (1) session-gap value — **rec ~24h / calendar-day** (a burst = one card; next day = new card); (2) deal card scope when a session mixes deals — **rec show the whole session with tagged messages highlighted**, not a half-conversation.

---

## 2.7 · Sessions explained in simple words (Q&A)

_Plain-English version of everything above about the timeline, so anyone can follow the decision._

**Q: What is a "session"?**
A session is just **one round of texting**. You text a customer back and forth for a bit — that's one session. A few days later you text again — that's a new session. Think of it like separate phone calls: each time you pick up the conversation after a quiet break, it's a new "chat."

**Q: Why not just show every text in one place on the record?**
Because a customer you've been texting for two years could have **thousands of messages**. Dumping all of that into one giant activity is unreadable — nobody scrolls two years of bubbles to find one thing. We want the timeline to read as tidy, dated chunks: *"texted them in January about the proposal," "texted again in March about renewal."*

**Q: Can we thread texts like email — "reply connected to reply"?**
**No — and this is the important part.** Email quietly carries a hidden tag on every message that says *"this is a reply to that message,"* so the computer can chain a whole back-and-forth into one neat thread. **Text messages do not carry that tag.** The phone network only knows *"these two numbers are talking to each other"* — it has no idea which text is a reply to which. (Only WhatsApp has a small version of this.) So we literally **can't** thread texts the email way.

**Q: Then how do we decide where one session ends and the next begins?**
Since there's no "reply" tag to follow, there's only **one honest signal: time.** If there's a long quiet gap between two texts, we treat the next text as a **new session**. That's it.

**Q: How do the big platforms do this? (simple table)**

| Platform | What they do | In plain words |
|---|---|---|
| **Salesforce** | Auto-closes a text "session" after a quiet period → each becomes its own entry | Chops the history into separate dated chunks (closest to what we want) |
| **Intercom / Front** | A conversation "closes"; the next message starts a fresh one (or an inactivity timer of a few days closes it) | Same chunking idea, but built for support tickets |
| **GoHighLevel** | Shows the whole history as **one long chat** with "Jan 5"-style **date lines** inside | One scroll, tidied up with date dividers |
| **Close** | Shows **every single text as its own line** on the timeline, with filter buttons | Very granular; can get noisy |

**Q: What's the catch with each?**
- One long chat (GHL) → still a wall to scroll on a busy record.
- Every text as a line (Close) → the timeline gets flooded with tiny rows.
- Separate sessions (Salesforce) → the **sweet spot**: not a wall, not a flood — a few readable, dated cards.

**Q: What do we *store* vs what do we *show*? (this is the trick that keeps it simple)**
We **store the whole conversation forever**, as one continuous record — nothing is ever lost. But we **show** it on the timeline **chopped into session cards.** Storing everything, displaying it nicely. Best of both.

**Q: What does one session card look like?**
> **Texts with Sarah · 6 messages · Jan 12–13**  → click to open the actual bubbles.

Small, dated, tells you what it is at a glance, and expands only when you want the detail.

**Q: How big a quiet gap makes a "new session"?**
Our pick: **about one day.** Text back-and-forth today = one card. They reply tomorrow = a fresh card. It reads naturally ("today's chat" vs "yesterday's chat"), and it's a setting we can adjust later.

**Q: What shows on the contact vs. the deal?**
The **contact** shows **all** the session cards (the full relationship). A **deal** shows **only the sessions about that deal** (the ones whose messages you tagged to it). Same conversation underneath, filtered per record.

**Q: Can we make this even better by combining the best of everyone?**
Yes — that's exactly the plan. We take the best idea from each:
- **From Salesforce:** slice the history into **session cards** (so no wall).
- **From GoHighLevel:** put **date dividers inside** a card when it spans more than one day (so it stays scannable when opened).
- **From Close:** keep a **search + channel filter** ("show only texts") so you can still hunt a specific message.
- **Plus our own rule:** store one continuous conversation and slice only at display — so we never lose history and can re-slice however we want later.

That combination is *better* than any single one of them alone, and it's exactly what our data model already supports.

**Q: So what is our final decision?**
**Store one continuous text conversation per person; on the timeline, show it as session cards split by a ~1-day quiet gap; each card expands to the messages with date dividers; deals show only their own sessions; keep search/filter.** We do **not** try to reply-thread texts (impossible) and we do **not** dump everything in one place (unreadable).

**Q: What's still left for the owner to pick?**
Just two small dials: (1) the exact quiet-gap length (we recommend ~1 day), and (2) when a session mixes two deals, whether the deal card shows the **whole session** (recommended, so you don't read half a conversation) or **only its tagged messages.**

---

## 2.8 · Wider CRM survey + use-case catalog

_Adds Zoho, Freshsales, Zendesk Sell, Keap, ActiveCampaign, Kommo, Monday to the prior 8 (workflow `wf_e1c2f1df-eb2`, doc-verified). Answers "what do other CRMs do with SMS on the timeline + deal, and what are all the use cases."_

### How the 7 new CRMs handle SMS-in-timeline + deal-linking

| CRM | SMS in the timeline | Deal link |
|---|---|---|
| **Zoho CRM** | Separate "Zoho SMS" related-list conversation (not the main feed) | **Origin-determined** — logs on whichever record you sent from; no "which open deal" resolver |
| **Freshsales** | Folded into the one unified chronological timeline; one row per send | **Contact-anchored**; "deal texting" = a workflow that texts the deal's contacts/owner |
| **Zendesk Sell** | First-class MESSAGE entry, expand to thread view | Person-anchored; **shown on the deal card by association** (visibility only); hard-attach needs a 3rd-party app |
| **Keap** | One running thread in the contact feed | **No text-to-deal link** — every deal on the contact shares the one thread |
| **ActiveCampaign** | Per-message events in the contact activity stream | **Contact-only** |
| **Kommo** | Chat thread inside the lead card | **Deal-native** — but only because a Kommo "lead" *is* the opportunity (a schema we rejected) |
| **Monday CRM** | No native SMS; Twilio history board + chat panel | Syncs to the **contact item**; deal link only if you build a recipe |
| **→ nrtur (decided)** | **One fused SMS+MMS thread, session-sliced** | **Person anchor + optional deal tag**; 1 open deal → auto, several → **never-guess chip** |

**Verdict — reinforces our model, decisively.** (1) **6 of 7 anchor to the person** — matching us. (2) The one deal-native example (Kommo) only works because it collapses *lead = opportunity* — the object-first schema nrtur deliberately rejected — so it confirms that when people and deals are separate objects, person-anchoring is correct. (3) **Nobody resolves "which of several open deals"** — all 7 punt (contact-only, origin-based, or fan-out visibility), so **our never-guess chip is ahead of the field, not a gap.** (4) The field splits into a *one-thread-pane* camp (Zoho/Keap/Kommo/Monday) and a *one-row-per-message* camp (Freshsales/AC/Zendesk); our **session-sliced** display is the deliberate hybrid of both.

**One build-order signal (not a design change):** every CRM here can **send** a text bound to a deal/stage via automation, even when the stored message stays contact-scoped. So **send-time deal binding is universal and safe to build; storage-time deal attachment (our explicit tag) is the rare, differentiating part.** Zendesk's **fan-out visibility** (a contact's thread shows on the deal card by association) is a cheap default we can layer *under* the optional deal-tag.

### Use-case catalog (32 use cases · why we're building it this way)

Legend: **✅** decided model covers it (needs the thread spine built) · **🔧** needs a specific named feature. **Record** = where the text lives.

**1 · Sales execution** — Speed-to-lead first text (Lead ✅+🔧auto) · Post-call/no-answer follow-up (Contact ✅) · Two-way texting inside the record (Contact/Deal ✅ *core*) · Quote/proposal follow-up (Deal ✅) · Nudge a stalled deal (Deal ✅+🔧SLA) · Appt/demo reminder & confirm (Deal ✅+🔧auto) · **MMS send/receive images/PDFs** (Contact/Deal 🔧*MMS persistence*).

**2 · Deal management & context** — Deal-stage context at a glance (Deal ✅) · Multi-rep visibility "who already texted" (Deal/Contact ✅) · "Why didn't this deal close" post-mortem (lost Deal ✅) · Buying-signal capture (Deal ✅) · Pipeline-review/1:1 prep (Deal ✅) · **Link the text to the RIGHT deal** (Deal 🔧*multi-deal chip — the flagship*).

**3 · Handoffs** — SDR→AE (Deal/Contact ✅ *verify convert-carry includes the SMS thread*) · AE→CS at close (won Deal→Account ✅) · PTO/territory coverage (Contact/Deal ✅) · Shared-number/team-inbox continuity (Contact/Deal 🔧*number + inbound routing*).

**4 · Reporting** *(model produces the raw data; each rollup is a new surface)* — Texts per deal/rep/pipeline 🔧 · Response rate & time-to-first-response 🔧 · SMS-to-revenue attribution 🔧 · Deal-velocity correlation 🔧 · Opt-out/deliverability health 🔧 *(partial home = Deliverability tab)* · Sequence/template performance 🔧.

**5 · Automation** — Auto-log every send/receive (✅ *core*) · Deal-stage-triggered SMS (Deal 🔧) · **Inbound-text trigger tied to stage** (🔧 *flagship*) · Reply-detected sequence exit + human takeover (🔧) · Speed-to-lead auto-text on form/missed-call (Lead 🔧) · Round-robin assignment on inbound (Lead/Contact 🔧).

**6 · Compliance & audit** — Consent/opt-in capture (Contact ✅ *A2P wizard*) · Immutable who-said-what record (Contact/Deal ✅) · A2P/10DLC sender-identity trail (✅+🔧*sticky sender-of-record*) · **Opt-out (STOP) trail + enforcement** (Contact ✅enforce +🔧*inbound STOP capture*) · Quiet-hours log (Contact 🔧).

**7 · Service / post-sale** — Onboarding/kickoff (Contact/Account ✅) · Renewal reminders & upsell (renewal Deal ✅+🔧auto) · Support over text incl. MMS (Contact/Account ✅+🔧MMS) · Payment/invoice reminders (Contact/Deal ✅+🔧auto) · Feedback/NPS/referral requests (Contact ✅+🔧auto).

### What the 🔧 items cluster into (the build list)
1. **The fused-thread spine** (person-anchored, session-sliced, auto-logged) — prerequisite that makes every ✅ real.
2. **Multi-deal disambiguation chip** — the never-guess "right deal" link (our differentiator).
3. **MMS persistence** (media + contactId on the thread).
4. **Inbound phone-number + routing layer** — shared-number continuity, STOP capture, round-robin.
5. **Inbound-text automation trigger** (+ deal-stage send, reply-exit, speed-to-lead).
6. **SMS reporting rollups** — texts-per-deal, response rate, attribution, deliverability.
7. **Compliance hardening** — inbound STOP→suppress, sticky sender-of-record, quiet-hours.

Items 2–7 are exactly what the survey shows **no competitor delivers end-to-end** — a defensible, differentiated position.

---

## 3. Recommended model for nrtur (lock this in)

Framed to mirror the email comms-routing decision (identity-first waterfall, person anchor + optional deal, durable ids, never guess).

1. **Identity-first, person-anchored — same waterfall as email, plus one normalize step.** Every message carries a durable `contactId` (+ optional `dealId`), never a name/phone string. Inbound resolves: **normalize sender to E.164 → match `contact.phone` → single hit routes; miss → unknown/Create-lead chip (mirror `simInboundEmail`) with retroactive back-link on convert; multi-hit (shared number) → never guess, park as unknown for manual attach.** Deal linkage keeps the existing rule: one open deal → auto-attach, else a chip, never guess.
2. **One durable conversation per (contact, workspace-number) pair — SMS + MMS fused.** Lift threads into `CrmDataContext` as first-class records; kill the `useState` re-seed. **Media is just a message with attachments** (one shape, inbox and timeline). With a single workspace number the pair collapses to per-contact; the number field future-proofs multi-number **without** a pool.
3. **Sticky sender.** Stamp `fromNumber` on the thread at first send/inbound, reuse it for every reply, persist it into the activity, default to the workspace default SMS number. Stop discarding `smsFrom`.
4. **Lossless timeline bridge (the headline fix).** Persist the real message into `payload.thread` (not `{dir}`), route `sendMms` through the same `_addAct` bridge, and render timeline bubbles from the real thread. This makes **D4, D5 and D8 real at once** and retires `seedMsgThread` for actual conversations.
5. **STOP/suppression at the one chokepoint.** Keep `canSendSms` as the sole gate. Add a runtime inbound processor: **STOP → suppress the number (channel `sms`, last-10 match so it survives convert/merge) + lock the composer with a per-recipient banner; HELP → auto-reply; START → un-suppress.**
6. **Unified per-contact conversation, resolved by any channel.** Build "All" from live state grouped by `contactId` across email/SMS/MMS/calls; `buildActivityFeed` is the cross-channel source of truth; a call or reply clears an inbound-SMS notification (Close pattern).

---

## 4. Decisions the owner must make

| # | Decision | Recommendation |
|---|---|---|
| 1 | **Phone-number layer in scope?** D1/D2/D4 all trace to its absence, but "deep dives are UI/UX-only, no backend." | Model the number as a **UI-level field + a normalize helper** (reuse `_supNormPhone`) so routing + sticky-sender are *representable* — a data-shape decision, not carrier plumbing. Or keep D1/D2 explicitly deferred. |
| 2 | **SMS + MMS: one conversation or two?** *(load-bearing — gates #2/#4 above)* | **One** (media = a message with attachments). |
| 3 | **Durable threads in `CrmDataContext`, or keep the lossy bridge?** | **Durable** — the only way real bubbles reach the timeline. |
| 4 | **Session windowing (HubSpot 24h / Salesforce inactivity)?** | **Not for v1** — one continuous per-contact thread. Over-build for a small team. |
| 5 | **Suppression scope: workspace-global or per-number?** | **Workspace-global** for a single/few-number managed setup (matches GHL/HubSpot/Salesforce; simpler). |
| 6 | **Inbound STOP/HELP runtime in the MVP, or defer?** | **Minimal runtime STOP → suppress + lock** now (cheap, closes a real compliance gap); HELP/START can be stubs. |

---

## 5. Bottom line

The **compliance gate and the persistence *concept* are already right.** The work is: **(a)** make threads durable and lossless, **(b)** give them a number so routing + sticky sender become real, **(c)** fuse SMS/MMS into one contact-anchored conversation. **Fix D5 first — it cascades into D4 and D8 for free.**

None of this is a rewrite; it's the same identity-first, id-anchored, never-guess model already decided for email — extended to phone with one normalize step and a durable thread.

_Research: workflow `wf_911798c2-341` (5 platforms web-verified + 2 code audits). Audit line refs are current as of this commit._
