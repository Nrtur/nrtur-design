# Sequences: scheduling, cancel and trace

Reference for the nrtur sequence engine: how the next message is scheduled, which number/email it goes to and from, how an individual enrollment or a whole batch is cancelled, and how a contact's journey is traced. Market research covers Kit (ConvertKit), HubSpot, Outreach, Salesloft, Close, Apollo, lemlist, Instantly, GoHighLevel, ActiveCampaign, Customer.io, Klaviyo, Pipedrive and Zoho. nrtur claims are verified against `index.html` (line refs are to the 2026-09-21 working copy).

Date: 2026-09-21. Owner question, verbatim: "deep research on sequences schedule and cancel and track: next message or email will be sent to a specific number — research from ConvertKit and other CRMs so this is clear and our design follows best practices; check deeply how an enrolled batch will be cancelled or an individual sequence will be cancelled, and how a sequence will be traced."

---

## 1. TL;DR

- **Best practice is an enrollment record with a state machine, not a flag.** Current step, a small named status set and the sender are near-universal (HubSpot, Outreach, Salesloft, Close, Apollo, Customer.io, GHL). A visible *next-send timestamp* and a *per-contact exit reason* are the exception, not the rule: next-send is surfaced only by HubSpot (Scheduled tab, next email only), Outreach (CRM-sync "Current Sequence Task Due Date") and Klaviyo ("Scheduled At"); per-contact exit reason only by GHL, Customer.io and Apollo (Finish requires a reason). Close, Apollo, Customer.io, GHL and Salesloft all document "not documented" for an explicit next-send-at per contact, and Salesloft/Close/HubSpot do not document a per-contact removal reason. That gap is exactly where nrtur can beat the market. Outreach's 10-state model and Close's Active/Paused/Goal Met/Error/Completed are the two cleanest status references.
- **Next-send is computed as `previous actual send + step delay`, then snapped into a send window in the contact's timezone with a fallback.** Close, Outreach, Apollo and Customer.io all do this; business-day counting and holiday skipping are near-universal; jitter inside the window is common (Close, Instantly).
- **Identity is resolved once per enrollment and pinned.** Sender (mailbox/number) is chosen at enrollment and sticky (Apollo, lemlist, Outreach "Sequencer", Instantly "Sticky Sending Accounts"). Recipient is the contact's *primary* address/number at GHL and Outreach; Close uses the *first non-unsubscribed* email and the primary phone — nobody picks per-step, except Zoho, which binds an explicit email *field* at design time.
- **Cancel has three tiers everywhere: per-enrollment (Pause/Resume/Remove or Finish), bulk-select in the enrolled list, and sequence-level (Pause vs Stop/Archive) with a confirm that names the consequence.** Outreach and Apollo distinguish *Finish* (keep history) from *Remove* (mistake, sever history).
- **Trace = enrolled list with status buckets + per-contact timeline events with reason + actor.** HubSpot's Enrollments tab (Scheduled/In progress/Paused/Finished/Error + Latest step + Details) and Customer.io's plain-English exit reason are the models. Kit is the *weakest* here (no next-send, no actor, pause = uncheck all days) — do not copy Kit for this part.
- **nrtur today: enrollment is a real store, but nothing runs.** Records carry no next-send time, no step pointer, no to/from identity; no scheduler advances steps; the only exit is reply/STOP hard-delete; there is no manual or batch unenroll; the "Remove from sequence" automation node is a no-op reported as success; the Enrolled modal mixes live rows with seed and fabricated names; all card counters are seed literals.
- **Decisions needed (section 7):** snapshot vs re-resolve destination; sender = enroller vs owner; Finish/Remove split; whether sequence Pause is global or per-sender; concurrency policy; what a STOP/unsubscribe does to non-email steps.

---

## 2. How the market does it

### Comparison table

| Vendor | Enrollment unit | Next-step scheduling | Identity (to / from) | Individual cancel | Batch cancel | Auto-exits | Per-contact trace |
|---|---|---|---|---|---|---|---|
| **Kit (ConvertKit)** | Subscriber (= one email) | Delay N h/d from join or previous send; sequence-level send days + time + tz (sender tz); per-email "On days" wins | To: the subscriber address. From: per-sequence "Send emails as" | Profile > Email Sequences tab > trash icon. No per-subscriber pause | Bulk Actions > Remove from Email Sequence; pause sequence = uncheck all send days | Unsubscribe, bounce/complaint, completion (only via Visual Automation), configured Events (purchase, tag) | Sequences tab (in/completed/removed), Email History icons; **no next-send shown, no actor/reason** |
| **HubSpot** | Contact (one sequence at a time) | Business-day delay per step (default on); send window picks best time from past opens; enroller picks tz or contact tz via workflow; pause preserves remaining delay | To: primary email (not stated for sequences). From: enroller's own connected inbox; workflow can use contact owner | Record banner Pause/Resume/Unenroll; Enrollments tab Actions; logged as "manually unenrolled by a user" | Checkbox bulk Pause/Resume/Unenroll; sequence Pause is **per-sender**; delete sequence unenrolls all | Reply (incl. alias/colleague scope), meeting booked, unsubscribe, bounce, last step, workflow | Enrollments tab buckets Scheduled/In progress/Paused/Finished/Error + Latest step + Details; global Scheduled tab shows *next email only*; contact properties |
| **Outreach** | Prospect, with a "Sequencer" (user+mailbox) | Prev actual send + interval (calendar or schedule days), snapped to named Schedule time blocks; prospect tz > sender tz > default; layered throttles visible in Outbox | To: first/primary email, no fail-over. SMS: existing thread > mobile > manual pick. From: sequencer mailbox, "Assign Mailbox" mid-flight | Pause / Resume / Mark Finished / Mark Replied / Move To Step / Remove; Finish keeps history, Remove severs it | Bulk Pause/Retry/Finish/Remove; Deactivate deletes all scheduled mailings (confirm names it) | Reply, no-reply finish, opt-out, bounce, OOTO pause + auto-resume, meeting booked (ruleset), send failure | 10 named states; Paused Reason / Failure Reason filters; add/pause/resume/finish/remove are activity-feed events (a full per-enrollment transition timeline with reasons is *not documented*); CRM-synced step number + task due date |
| **Salesloft** | Person, with an Assignee | Steps on Day N (business days); automated emails "At a specific time" in person's/your tz or "N min after entering step"; scheduled instantly at add | To: person's email. From: assignee's mailbox; phone from rep's number | Remove from Cadence (5 places); no per-person pause — use Change Due Date / Mark OOO | People tab bulk Remove; per-user Pause All Cadences (date range, shifts business days); Archive vs Delete | Reply, bounce, meeting via Salesloft link, DNC, last step; automation rules | Step + Due columns; step tiles Scheduled/In Progress/Due; feed logs Added/Removed with performing user; removal-reason chart per step |
| **Close** | Run on Lead/Contact, one Recipient contact | Delay (calendar, 1 min–365 d) + Communication Window with random time in block, contact tz (manual > phone-estimated > fallback); blackout dates | To: first non-unsubscribed email; primary phone. From: per-step Send-from (enroller / specific / custom-field user); country-matched SMS number | Run Actions: Resume/Pause/Retry/Delete; Mark as Responded from a call | List-level Manage Workflows pause/resume; Archive = emergency stop, resume fast-forwards | Goals: incoming email/SMS/call, meeting booked, lead status, outcome; unsubscribe skips email steps only | Runs tab with per-step status + errors + timestamps; Goal Met vs Paused distinct; no actor/reason field |
| **Apollo** | Contact, sender chosen at enrollment | Reusable Schedule (tz + time blocks), contact-local option, US holidays; calendar wait then next window; queue if mailbox capped | To: primary email. From: mailbox picked at enrollment, sticky, reassignable per contact | Pause (auto-resume date) / Resume / Mark as Finished (reason required) / Remove (deletes pending, for mistakes) | Same actions bulk; sequence toggle off; Archive removes scheduled emails | Reply, OOO pause, meeting, unsubscribe, call connected, bounce, stage exclusions | Status per row incl. Paused reason on hover, blocked-task badge; Not-sent reasons; sequence Activity log |
| **lemlist** | Lead scoped to campaign | Sending days not calendar days; follow-ups keep first clock time; per-lead tz; global daily limit | To: lead email. From: sender assigned at step 1, sticky; per-step override | Pause campaign for lead (delay countdown freezes) / Resume / Not interested | Contacts > Manage campaigns > Pause all / End all (count shown); campaign switch | Reply, meeting, click (each with "also pause same company"), bounce, unsubscribe | Lead status column; activity types paused/resumed/skipped/snoozed; workspace user-activity log |
| **Instantly** | Lead (= email) | Start/end date, tz per campaign, window, min gap + jitter, daily limit, slow ramp | To: lead email. From: rotating accounts, "Sticky Sending Accounts" | Any status ≠ Lead stops; revert to Lead resumes from interruption | Campaign Pause (an already-queued email may still send — *unverified*: docs summary only, page not fetched); bulk Delete leads (irreversible) | Reply, auto-reply, company reply, bounce auto-pause >5% | Activities tab: sending account, step number, timestamp per event |
| **GoHighLevel** | Contact (one per opportunity if enabled) | Wait actions with Advance Window (days + hours); workflow Time Window; Account vs Contact tz; Drip batches | To: Primary email/phone (explicit Primary flag). From: workflow From Name/Email/Number | Remove From Workflow action (4 scopes); **no per-contact pause** (open request) | Contacts bulk action (remove side confirmed by third-party guides only; official page documents the add side); Draft mode = pause everyone in place; delete = soft, in-flight dropped | Stop on Response (all channels), Goal Event, external workflow | Enrollment History with "Workflow Completed / Removed by Workflow Action / Removed by External Workflow Action"; Execution Logs; Highlight Contact Path |
| **ActiveCampaign** | Contact (entry record) | Wait: period / until day-time (contact or account tz) / until date field / until conditions; SMS "Send On" days+hours; timers keep running while paused | To: single email; SMS default phone field only. From: per-campaign; 1:1 email from connected mailbox or deal owner | Contact record > Automations > End (cannot undo; status Completed) | Bulk Editor "Remove from an automation"; Inactive toggle freezes everyone | Unsubscribe, tracked conversion; everything else via Jump To / End another automation | Path on canvas (green check + timestamp, red X + skip reason); per-action Activity Log Success/Failure/Waiting |
| **Customer.io** | Person journey | Time Delay / Time Window (user tz + required fallback) / Wait Until; later messages pushed back | To: single `email`/`phone` attribute. From: per-action verified address; workspace SMS number | "End this journey" → Exited early, reason "manually removed" | Stop now / Schedule stop: Finish their journey vs Exit immediately; Archive | Exit conditions (attribute/event/segment); unsubscribe does *not* exit | Journeys tab with entry/exit time, duration, exit reason; message statuses |
| **Klaviyo** | Profile (one step at a time) | Time delay + time-of-day + weekday, recipient local tz; Smart Sending skips; SMS quiet hours delay | To: single email/phone; SMS number auto per country | Recipient activity > Cancel Send (removes from rest of flow) | Message status Draft/Manual/Live; Needs Review Send All / Cancel All | Profile filters skip, not exit; suppression | Profile Messages inbox: Scheduled (Scheduled At) / Sent / Skipped (reason) |
| **Pipedrive** | Deal or Lead | Not documented for Sequences; Automations: Wait N + end time, skip weekends | From: user's synced inbox with consent toggle; To: not documented | Mark as completed (irreversible) or Remove | Overview tab bulk Remove; whole-sequence pause *not documented* | None documented (KB); consent revoke → Failed | Overview In Progress/Completed/Failed; Automations History with Cancelled |
| **Zoho CRM** | Record (Leads/Contacts/Deals/…) | First follow-up immediate or after duration; business days/hours honour org hours | To: **admin picks the email field** per step. From: per-step sender | Un-enroll from record; re-enroll Resume or Restart (cap 3) | List Actions > Cadences; deactivate halts scheduled; republish stops+unenrolls affected | Custom-view drop-out, bounce/unsub/call outcomes, record criteria, reply, date | Cadences related list (Start Date, Enrolled By, Status); un-enrollment log with why/when; funnel report |

### Patterns that are near-universal (treat as best practice)

**1. The enrollment is a first-class record with a small named status set.** Outreach (Pending/Active/Paused/Paused OOTO/Disabled/Failed/Bounced/Finished-Replied/Finished-No-Reply/Opted-Out), HubSpot (Scheduled/In progress/Paused/Finished/Error), Close (Active/Paused/Goal Met/Error/Completed), Salesloft (staged/active/scheduled/pending/completed/removed/removed_no_action/reassigned/archived). Every one is filterable and bulk-actionable. Kit and Instantly, which lack this, are the ones whose docs are full of workarounds. What the record *shows* is thinner than what it stores: an explicit next-send timestamp per contact is surfaced only by HubSpot (Scheduled tab, next email only), Outreach (CRM-sync task due date) and Klaviyo (Scheduled At) — Close ("an explicit next send at <datetime> field per run is NOT documented"), Apollo, Customer.io, GHL and Salesloft (only via the Emails page filtered to Scheduled) all leave it undocumented. Per-contact exit reason is stored by GHL, Customer.io and Apollo; Salesloft has only an aggregate removal-reason chart, Close has "no actor/reason field", and HubSpot's Details wording is not in the KB. So "current step + named status + sender" is the floor; next-send + exit reason is where nrtur differentiates.

**2. Next-send = last actual send + delay, then snap forward into a window; never "catch up".** Outreach ("later steps re-base from the delayed actual send"), Close (worked 9:32 + 1h → between 10:32 and 11:00), Apollo ("automatic emails wait for the next allowed sending window"), Customer.io ("later messages are pushed back"). Business-day delays are the default at HubSpot and Salesloft; lemlist counts *sending* days; Zoho offers business-day / business-hour units that honour org hours alongside plain units (an option, not the rule); Close counts calendar days but snaps to the window.

**3. Contact timezone first, with an explicit fallback ladder.** Close (manual > phone-estimated > workflow fallback), Outreach (prospect > sender > default), Customer.io (requires a fallback when you pick user tz), GHL (contact tz falls back to account). Kit (sender/account tz) and Instantly (campaign tz; docs recommend splitting international lists — no per-lead timezone) are the two outliers; Pipedrive and Zoho do not document which timezone applies.

**4. Sender is chosen at enrollment and pinned.** Apollo ("assigned mailbox stays the same unless you manually change it"), lemlist (step-1 sender sticks), Outreach (Sequencer + "Assign Mailbox" with "update existing undelivered emails" checkbox), Instantly (Sticky Sending Accounts), HubSpot (must be the enroller's own inbox; re-enroll needs the original inbox). Recipient is the primary address; two vendors handle multi-address explicitly: Close ("first non-unsubscribed email"), Zoho (field chosen at design time).

**5. Three tiers of cancel, each logged.** Per-enrollment actions live *everywhere the contact is visible* (HubSpot record banner, Salesloft's five surfaces, Outreach profile tab). Bulk = checkbox in the enrolled list (HubSpot, Outreach, Apollo, Salesloft). Sequence-level = Pause (hold in place) vs Stop/Archive (exit everyone), and the good ones name the consequence in the confirm (Outreach "deletes all of its drafted and scheduled mailings"; Klaviyo "cancel … and the rest of the flow"; Customer.io "Finish their journey" vs "Exit immediately").

**6. Finish and Remove are different verbs.** Outreach and Apollo both: *Finish* ends outreach and keeps history/reporting (Apollo requires a reason); *Remove* deletes pending sends and is reserved for mistakes. Only Outreach and Apollo encode this keep-history vs sever-history split. Salesloft's `removed` vs `removed_no_action` distinguishes whether any action ran before removal, and GHL's "Removed by Workflow Action" vs "Removed by External Workflow Action" distinguishes *who* removed — both are useful vocabulary, but neither is a Finish/Remove split.

**7. Reply and meeting-booked are the standard automatic exits; they are switches on the sequence.** HubSpot's Automate tab (two switches with contact/company scope), Salesloft's three checkboxes, lemlist's rules with "also pause same company", Apollo rulesets (editable defaults vs non-editable protection triggers: unsubscribe, call connected, bounce). Among the marketing tools, ActiveCampaign *does* detect replies but offers reply only as a trigger ("Replies to an email" starting a second automation that runs "End another automation"), not as a built-in exit switch; Customer.io and Klaviyo have no reply detection at all — nrtur is a sales CRM, so follow the sales tools.

**8. Trace lives in two places: the enrolled list and the contact timeline, and exits carry a reason.** GHL ("Removed by Workflow Action"), Customer.io ("The person was manually removed from the campaign."), Salesloft (Added/Removed with performing user; removal-reason chart), Outreach (Paused/Failure Reason filters), HubSpot ("manually unenrolled by a user"). Actor attribution on manual removal is documented at Salesloft (feed shows the performing user), HubSpot ("manually unenrolled by a user") and lemlist (pause/resume logged as lead activities; workspace Settings > Logs > User activities records who did what and when); Apollo's sequence Activity log records who archived, but at sequence level, not per contact. Nobody documents an editable free-text reason.

### Where vendors diverge (owner picks)

- **Per-enrollment pause**: HubSpot, Outreach, Apollo, lemlist, Close have it; Instantly has it in disguise (any status other than "Lead" stops the lead, reverting to "Lead" resumes from the interrupted step); Salesloft, GHL, ActiveCampaign, Kit, Customer.io do not (workarounds: change due date, mark OOO, remove + re-add); Klaviyo offers only Cancel Send (no pause); Zoho per-record pause is not documented (un-enroll, then re-enroll with Resume). Two pause semantics exist: freeze the countdown (lemlist, HubSpot "remaining delay honored") vs let timers run (ActiveCampaign, Close "fast forward on resume").
- **Concurrency**: HubSpot = one sequence at a time; Outreach = per-sequence exclusivity setting; Salesloft = admin enrollment limits; Apollo = warn-and-proceed; Kit/GHL = unlimited.
- **Sequence-level pause scope**: HubSpot pauses only *your* enrollments; Salesloft "Pause All" is per user; everyone else is global.
- **Edits to a live sequence**: snapshot-at-enrollment (HubSpot, Salesloft: "breaks the thread, copy + archive") vs live-apply to future steps (Close, lemlist append-only, Customer.io with elapsed-time credit, Zoho stops + unenrolls affected).

---

## 3. Where nrtur is today (verified)

**Plain English.** nrtur has a real in-memory enrollment store (`seqEnrollments`, `index.html:30401`, mirrored to `_liveSeqEnrollments`) written by three UI/runtime paths: the pipeline stage bulk-enroll sheet (10854–10872), the 4-step SequenceEnrollModal (11507–11534) and the automation `enrollEmail/enrollSms` node (24752). A record captures enrollment-time facts only — sequence, contact/lead, deal, `startStep`, a human-readable `scheduledFor` string, `status` ('scheduled' | 'active'), `at`, `by`. **There is no scheduler.** Nothing advances a step, sends step N+1, computes a next-send time, resolves a destination or a sender, or transitions status; the only simulated clock (`_autoAdvance`, 24915–24938) serves automation wait nodes and A2P review. The **only exit** is `replyUnenroll` (15464), which hard-deletes rows on a simulated inbound reply or SMS STOP. There is no manual unenroll, no bulk unenroll, no pause of in-flight enrollments, and sequences cannot be deleted or archived. Every counter on the Sequences page is a seed literal; the Enrolled modal blends live rows with hardcoded and fabricated ones. Push/in-app sequence pages carry a "Simulated." banner; email/SMS pages do not, and their footer claims "Sequences run on your connected SMS & email accounts" (26213).

### Confirmed findings

| ID | Finding | Evidence (index.html) | Severity |
|---|---|---|---|
| N1 | No next-send timestamp, no current-step pointer, no per-step progress; `at` is the only timestamp, `scheduledFor` is a display string; no writer ever changes `status` or `startStep` after creation | 10854–10871, 11507–11532, 24752, formatEnrollmentSchedule 10939–10963; writers 8084, 8115, 10872, 11534, 15464, 24752 | High |
| N2 | Per-enrollment schedule choices (date/time, tz, delay N/unit, business days) are not persisted as data; `respectQuietHours` / `weekdaysOnly` toggles are UI-only and never written. Sequence *definition* does persist `entryTimer`/`whenRuns`/`quietHours` (23909) but nothing reads them at runtime | 11418–11419 vs 11507–11532; 12141/12148; 23909 | High |
| N3 | Destination email/phone is never stored on the record and never resolved later; `r.email`/`r.phone` are read for eligibility only | 11336–11337, 11507–11532, 24752 | High |
| N4 | Sender identity is a hardcoded literal: `'Alex Morgan <alex@nrtur.com>'` / `'Twilio Line +1 (555) 019-2834'` with an unconditional "Verified & Connected" badge; matches neither connected mailboxes (30538: sarah@bloom.co, alex@bloom.co) nor any owned number (6803). Builder's SMS From-number picker is dropped by `save()` | 11262–11266, 11776–11780, 23840, 23909 | High |
| N5 | No scheduler: nothing sends step N+1; builder comment "Waits are noted+skipped (no scheduler yet)"; `_autoAdvance` never reads `seqEnrollments` (it can only *insert* one via a resumed automation enroll node) | 24686, 24915–24938, 24752 | High |
| N6 | Only exit path is `replyUnenroll`: hard-deletes rows (no 'exited' status), scoped to the replying channel, fixed body "Replied — auto-removed from the sequence." even on STOP, actor literal `'nrtur'`, writes contact timeline only (enrollment also wrote deal timeline at 10880/11547) | 15464; callers 15476, 15573, 15574 | High |
| N7 | No per-contact "Remove from sequence" button, no bulk unenroll, no per-enrollment pause/resume; Enrolled modal rows are read-only | 25102–25109; 10138, 14341 (only "Enroll") | High |
| N8 | Automation action "Remove from sequence" (`unenrollSequence`) has config UI promising exits are "permanently recorded as Removed by automation" but no runtime branch; `autoStepGate` returns ok, run log records the step as **succeeded**, nothing changes | 16458, 17696–17708, 17914–17946, 24710, 24792 | High |
| N9 | Wizard's four "Automatic Unenroll Triggers" (reply / meeting / deal won / opt-out) are persisted per row and never read; reply/STOP unenroll fires regardless; meeting-booked and deal-won exits do not exist anywhere; email unsubscribe never unenrolls. Builder's `stopRules` are saved and never read (and not rehydrated on edit) | 11523–11528 (sole hit), 15464, 23006, 23889–23909 | High |
| N10 | *Unconverted* lead enrollments (contactId null, leadId set) can never be exited: `replyUnenroll` keys on contactId only; lead STOP branch (15495–15524) never calls it; the leads-page / lead-detail entry points (14278, 14417) omit `convertedToContactId`, so contactId is always null there. Exception: a lead enrolled from the modal's own pool after conversion inherits `contactId = convertedToContactId` (11302 spreads the lead) and *is* exited via the contact reply path | 11512–11513, 15464, 14278, 14417, 11302 | Medium |
| N11 | Two incompatible seqId schemes across three writers (`'email_1'` wizard vs `'email1'` stage-bulk and automation); automation rows also carry no `status`, so the wizard's "Already actively enrolled" guard never sees them → same contact can be enrolled twice | 11262–11263, 10816, 24751–24752, 11371–11376 | High |
| N12 | Duplicate check matches `e.contactId===r.id \|\| e.leadId===r.id` with no type check; contacts and leads share the 1..N id space, so contact #2 blocks lead #2 and vice versa | 11373; CONTACTS_DATA 6771ff, LEADS_DATA 13726ff | Medium |
| N13 | SMS enrollment never consults the A2P/10DLC gate (`smsComplianceState`/`canSendSms`) on any of the three write paths; only the direct automation `sms` node is gated (17927). Builder banner "sending starts once messaging is approved" has no code behind it | 11341–11364, 10816–10872, 17929–17933, 24076–24081, 22501 | Medium |
| N14 | Stage-bulk eligibility is email-only regardless of channel: blocks "No email address" and email suppression for SMS sequences, never checks phone/SMS suppression | 10776–10795, 10816, 10819 | Medium |
| N15 | Sequence Pause toggle is component-local state (`seqMap`), lost on navigation, duplicated in two pages, read by nothing: neither blocks enrollment nor holds in-flight rows. Sequences cannot be deleted or archived (`setCustomSeqs` only creates/updates) | 26170, 26179, 25211; 10841, 23910, 23911 | High |
| N16 | Enrolled modal fabricates: live rows show `enteredAt:'Just now'` (real `at` discarded), step frozen at `startStep`, `delivered = status==='active'`; live rows merged with hardcoded ENROLLEES seed by *name*; when both empty, rows are synthesized from seed `atStep` with LOG_SAMPLE_NAMES. Every "Completed/Exited/Unsubscribed" row a user sees is seed | 25050–25080, 25107 | High |
| N17 | Card counters ("N active in flight", Sent/Opened/Replied) and KPI strips ("Active sequences 3", "Messages sent 774", "Emails sent 1,088", "42%") are seed fields / string literals; never move on enroll/unenroll. Email KPI literals do not even match their seeds (732 sent, 57% open). Editing a seed sequence supersedes it with a zeroed copy | 26177–26183, 26206–26207, 18648–18653, 23909–23911 | Medium |
| N18 | Clicking "Enroll" on any SMS/push/in-app card preselects the *email* sequence with the same numeric id (rawId match on an email-first list); trace records the wrong sequence unless the user re-picks | 26185, 26217, 11261–11271 | Medium |
| N19 | Contact detail never reads `seqEnrollments`: no "in sequence" chip, no next-message card; next-best-action ignores enrollment; the only record-level trace is a payload-less 'sequence' activity written at enrollment | 10117–10127, 10054, 11538–11552, 9737 | High |
| N20 | Contact merge dedupes the *whole* store by `seqId\|contactId`, silently dropping rows and collapsing every lead-only enrollment (contactId null) of a sequence into one on any merge; no activity written for drops | 8084, 8115 | Medium |
| N21 | Step content in the wizard is hardcoded template copy (`getDefaultStepContent`, `getStepPreview`), not the selected sequence's `stepData`; Step 4 overrides are stored and never used | 11434–11464, 11000–11013, 11529 | Low |
| N22 | A/B "winner" is a constant table (`AB_SEED`) indexed by variant position; nothing in any send path reads `step.ab` | 23729–23730, 23798–23805 | Low |
| N23 | Schedule label is computed from the *first* recipient's timezone and copied onto every record in a mixed-tz batch (only when Scheduled + contact-tz) | 10832–10835, 11468–11471, 10867, 11521 | Low |
| N24 | Ad-captured contacts show "Enrolled in sequence · Speed-to-lead · 1 of 3" from a boolean flag with no enrollment row; "Speed-to-lead" is not a sequence at all | 9452, 13971, 24539 | Low |
| N25 | `replyUnenroll` guesses the channel with `_seqChannel`, a regex over `seqId`/`seqName` (`/sms/` on the id, `/sms\|text/` on the name), ignoring the row's stored `channel` field (11511, 10858); a builder-created SMS sequence (id `cs_<ts>`, 23911) whose name lacks "sms"/"text" is classified as email and *survives an SMS STOP*. STOP detection itself is a hardcoded regex (`STOP\|STOPALL\|UNSUBSCRIBE\|CANCEL\|END\|QUIT\|OPTOUT`), not the sequence's configured keywords. Automation rows (24752) carry no `channel`, so a fallback is still needed for that shape | 15463, 15501, 15536, 11511, 10858, 23911 | Medium |
| N26 | Automation enrollments write a sparse row (`{seqId,seqName,contactId,dealId,stage,at,by}` — no contactName/status/startStep/scheduledFor), so in the Enrolled modal they render with a blank name, avatar "C", "Step 1", "Scheduled". The "⚡ Automation … ran" activity is written on the *triggering* record (`ctx.ent`), so for deal-triggered enrollments the contact's own timeline gets nothing; unconverted leads resolve `_cid` to null and get **no enrollment row at all** | 24752, 24805, 24691, 25066–25071 | Medium |
| N27 | Builder's Test button hands `AutomationTestModal` label-only nodes with no `key`, so `autoStepGate` short-circuits and every step reports ok with no wait/delay simulated. `save()` drops `bounceSuppress`/`linkTracking`/`freqCap` and persists `quietHours` only as the derived boolean `whenRuns.mode!=='always'`, not the toggle | 24520, 18013, 17915, 23909, 23895–23899 | Medium |

*Contested (state carefully):* enrollment counts disagree across surfaces — the stage bulk picker shows seed `enrolled` + live rows in *its own* id scheme (10906, 10817), the Sequences card headline shows seed only while its own "Enrolled" drawer includes live rows (26177 vs 25062), and the Automations page `seqRow` that renders `seq.enrolled` (25235) is dead code that is never called. There is no shared "enrolled count" selector.

---

## 4. Gap analysis

### Scheduling
- **Next-send computation**: none exists (N1, N5). Best practice: `nextAt = lastSentAt (or enrolledAt) + step.delay`, snapped into the window. nrtur has `entryTimer`, per-step `delay`, `whenRuns`, `quietHours` on the sequence definition but no reader.
- **Send windows / business days / quiet hours**: authored, persisted on the sequence, never applied (N2). Per-enrollment overrides are lost entirely; `bounceSuppress`/`linkTracking`/`freqCap` are dropped on save and the quiet-hours toggle survives only as a derived boolean (N27). The builder's Test cannot reveal any of this because it simulates no waits (N27).
- **Timezone**: wizard toggles contact-tz but only for a label, and uses the first recipient's tz for the whole batch (N23). Market ladder: contact.timezone > inferred from phone > workspace default.
- **Throttling / caps**: nothing. Market minimum: per-mailbox/number daily cap with a *visible* "held: limit reached" state (Outreach Outbox, Close red bars), not a silent stall.

### Identity
- **TO**: never stored (N3). Contacts have one email/phone each today; the market default is "primary at send time" with Close's refinement "first non-suppressed". Decision needed on snapshot vs re-resolve (section 7).
- **FROM**: hardcoded literal (N4). Market: pinned at enrollment to the enroller's connected mailbox / an owned SMS number, stored on the enrollment, reassignable with an "update undelivered" option (Outreach).
- **Two phones**: no data model support today; if added, follow GHL (explicit Primary flag) or Outreach (existing-thread number first).
- **Gates**: A2P not enforced on enrollment (N13); stage-bulk is email-only (N14). Market: Apollo hard-skips unsubscribed/bounced/DNC and *warns* on "already active elsewhere".

### Cancel — individual
- No button, no pause, no reason, no actor (N6, N7). Auto-exit misattributes STOP as "Replied" and uses actor `'nrtur'`. Leads can never exit (N10). In-flight send semantics undefined because nothing is in flight.
- Market: Pause/Resume (countdown frozen), Remove with reason, Finish that keeps history, all logged with actor; available from the record banner, the enrolled list and the inbox.

### Cancel — batch
- No bulk selection, no sequence-level Pause that holds enrollments, no Stop, no Archive/Delete (N7, N15). The automation node that should do this is a silent success (N8).
- Market: checkbox bulk in the enrolled view; sequence Pause (everyone holds, `nextAt` preserved) vs Stop (everyone exits with reason) vs Archive (only when 0 active, or forced exit with a consequence-naming confirm); "Used in" check before delete (Kit).

### Exit criteria
- Configured in two places (wizard `unenrollTriggers`, builder `stopRules`), read in zero (N9). Reply exit is unconditional; meeting-booked, deal-won, email-unsubscribe exits do not exist; STOP handled for contacts only, and only for sequences whose id/name happens to match a regex — the row's `channel` field is ignored, so a custom SMS sequence can survive a STOP, and the STOP keyword list is hardcoded rather than the sequence's (N25).
- Market: sequence-level switches — reply (contact/company scope), meeting booked, bounce, unsubscribe/STOP, deal won/lost — plus channel-scoped suppression that skips steps without exiting (Zoho, Close, Salesloft Contact Restrictions).

### Trace
- No step position, no next send, no history, no delivery events, no errors (N1, N16, N19). Enrolled modal is one-third seed, one-third fabricated. Contact detail is blind to enrollment. Counters are literals (N17). Automation-driven enrollments are the worst-traced of all: blank name and "Scheduled" in the Enrolled modal, the run activity lands on the triggering deal rather than the contact, and unconverted leads leave no row (N26).
- Market: enrolled list with status buckets + step x/N + next send + to + status + last event; contact timeline events for every transition with reason and actor; per-step funnel; error bucket with reason.

---

## 5. Recommended target model for nrtur

**Direct answers to the owner's questions (details follow in 5.1–5.6):**

- **When does the next message go out, and to/from which number or address?** `nextAt = (last actual send, or enrolledAt) + step.delay`, snapped into the sequence's send window in the contact's timezone (contact.timezone → phone-inferred → workspace tz), business days and quiet hours honoured, small jitter inside the window (5.2). The destination is snapshotted on the enrollment as `to.email`/`to.phone` at enrollment and re-resolved at each tick (skip + log if the address vanished, fall back to the first non-suppressed address if it is suppressed); the sender is pinned once as `from.mailboxId`/`from.numberId` (5.1). Both are shown on the enrolled row and the contact banner, so the "next SMS to +1 415… on Tue 9:00 AM from +1 415 555-0100" question is answered from one record.
- **How is an individual vs a batch cancelled?** Three tiers (5.3): per-enrollment Pause/Resume (countdown frozen), Remove with a reason picker, Move to step — from the enrolled list, the contact banner and the inbox; batch = checkbox-select in the enrolled view or a contact list/stage sheet, same actions with `removed_bulk` and a count in the confirm; sequence-level Pause (holds everyone, `nextAt` preserved, no new enrollments) vs Stop (everyone exits, confirm names the count) vs Archive/Delete (blocked while rows are live). Every tier writes `exit.reason` + `by` + `at`.
- **How is a contact traced?** Three surfaces (5.6): the per-sequence Enrolled view (status chips, Step x/N, Next send, To, From, Last event with reason); the contact/lead/deal banner ("In *X* · step 2 of 4 · next … ") with Pause/Remove; and timeline entries for every `history` event ("Step 2 sent to +1…", "Paused by Sarah", "Exited — replied", "Removed by automation *Speed-to-lead*"), written to the contact **and** the linked deal.

### 5.1 Enrollment record (replaces the three divergent shapes)

```
Enrollment {
  id, seqId (canonical, channel-qualified — see seqIdOf below), seqName,
  contactId | leadId (exactly one), dealId?,
  channel: 'email' | 'sms',
  to:   { email? , phone? , snapshotAt, policy: 'snapshot' | 'resolve' },
  from: { mailboxId? , numberId? , label },        // pinned at enrollment
  stepIdx: 0..N-1,                                 // step about to run
  status: 'scheduled' | 'active' | 'paused' | 'held' | 'finished' | 'exited' | 'error',
  nextAt: epoch | null,                            // null when paused/terminal
  pausedAt?, remainingMs?,                         // freeze countdown
  held?: { reason: 'cap_reached' | 'a2p_pending' | 'suppressed' | 'missing_identity' | 'sequence_paused', since },
  exit?: { reason, detail?, by, at },              // reason enum below; detail = picker sub-reason
  error?: { code, message, at },
  enrolledAt, enrolledBy, enrolledVia: 'manual'|'bulk'|'stage'|'automation',
  settings: { businessDaysOnly, useContactTz, quietHours, sendWindow }, // snapshot of seq settings
  history: [ { at, type, stepIdx?, by?, reason?, detail? } ]
}
```

**Canonical `seqId`.** Seed sequences reuse ids 1..4 across every channel (SEQ_DATA 18522, EMAIL_SEQ_DATA 18649, push 30143, in-app 30148), which is the root of the wrong-sequence preselect (N18) and the split id schemes (N11). A channel-less id would make SMS #1 and email #1 the same enrollment key, so the canonical id must carry the channel:

```
seqIdOf = (seq) => String(seq.id).startsWith('cs_') ? String(seq.id)          // builder ids are already unique
                                                     : `${seq.channel}:${seq.id}`; // seeds: 'sms:1', 'email:1', 'push:1'
```

Every writer, every guard and the card's `initialSeqId` use `seqIdOf(seq)`; alternatively re-key the seeds at load so no two sequences share an id. Either way the migration (section 6) must re-key existing rows.

`exit.reason` enum: `replied | meeting_booked | deal_won | deal_lost | opted_out | unsubscribed | bounced | removed_manual | removed_bulk | removed_automation | sequence_stopped | sequence_deleted | contact_merged | completed`. `exit.detail` (only with `removed_manual`/`removed_bulk`): `replied_elsewhere | not_interested | wrong_contact | other` — this is where the 5.3 reason picker lands. **Status vs reason:** a row that sends its last step gets `status:'finished'` and `exit:{reason:'completed'}`; `finished` is the status name, `completed` the reason name, and finished rows always carry it. `history.type` enum: `enrolled | scheduled | sent | delivered | opened | clicked | replied | skipped | held | paused | resumed | step_moved | exited | error`.

**Caps.** Per-sender daily caps live on the sending identity, not the sequence: `mailAccounts[i].caps.perDay` (default 200, Close's regular-account default) and `phoneNumbers[i].caps.perDay` (default 500), editable on Settings › Email accounts / Phone numbers; an optional workspace-level `sequenceCaps.perSenderDaily` overrides both. When `gate()` hits a cap the row goes `held` with `reason:'cap_reached'` and is retried at the next window (Outreach/Close pattern: visible, not silent).

**Same-sequence duplicates (prototype default, pending Q5).** `activeEnrollmentFor(contactId|leadId, seqId)` blocks a second non-terminal row in the *same* sequence at every writer (manual, stage-bulk, automation) with the message "Already active in this sequence"; a different sequence is warn-and-allow (Apollo). Both checks are typed (`contactId` vs `leadId`), fixing N12.

**`to` re-resolution rule (proposed default):** snapshot the address at enrollment for display; at each tick, re-resolve from the contact and *skip the step with `history.skipped:'address_changed'`* if the snapshot no longer exists on the record; use the current primary if the snapshot is suppressed and another non-suppressed address exists (Close rule); otherwise `held` with reason. This satisfies the owner's "next message goes to a specific number" (the record shows the number) without sending to a dead address.

### 5.2 Scheduler rule

- **On enroll:** `stepIdx = startStep-1`; `nextAt = snap(enrolledAt + entryTimer.delay)` for 'sequence' timing, the chosen datetime for 'scheduled', now for 'immediate'.
- **`snap(t)`:** convert to contact tz (contact.timezone → suggestTzFromPhone → workspace tz); if `businessDaysOnly` and t falls on Sat/Sun or a holiday, move to the next business day at the window start; if outside `sendWindow`/`quietHours`, move to the next window start; add jitter 0–15 min inside the window. **Holiday source:** the workspace Business Hours settings gain a `holidays: [date]` list (empty by default; Zoho's model — org business hours + holidays), and `snap()` reads it. A hardcoded US list (Apollo) is *not* recommended for a workspace that already models business hours; if the owner prefers zero configuration, mark holidays out of scope for the prototype and skip weekends only.
- **Tick** (drive from `_autoAdvance` so the existing sim clock advances sequences too): for each enrollment with `status in (scheduled, active) and nextAt <= now`, run `gate()`; on pass, write `history.sent` (simulated), set `stepIdx+1`; if `stepIdx == N` → `finished`; else `nextAt = snap(now + step.delay)`. Note Kit's rule: delays chain from the *actual* previous send.
- **`gate()` blocks a send** (→ `held` with reason, retried next tick; permanent ones → `exited`): DNC / suppression on the channel (`supEmailBlocked`, `supPhoneBlocked`, `supChannelOff`), A2P gate for SMS (`canSendSms` — reuse the same function the automation `sms` node uses, 17927), missing identity (no `to` or `from`), bounced address, sequence paused, per-sender daily cap (`held.reason='cap_reached'`, counted against `from.mailboxId`/`from.numberId` — see Caps in 5.1). Channel is read from the row's `channel` field, never inferred from the name (N25).
- **Pause:** `remainingMs = nextAt - now; nextAt = null; status = paused`. **Resume:** `nextAt = snap(now + remainingMs)`. (lemlist/HubSpot semantics — freeze the countdown.)

### 5.3 Cancel semantics

| Scope | Action | Effect | Logged as |
|---|---|---|---|
| Individual | **Pause / Resume** | freeze/restore countdown; nothing sent while paused | `paused` / `resumed` with `by` |
| Individual | **Remove** (with reason picker: replied elsewhere, not interested, wrong contact, other) | `status=exited`, `exit={reason:'removed_manual', detail:'replied_elsewhere'\|'not_interested'\|'wrong_contact'\|'other', by, at}`, `nextAt=null`; history kept | `exited` on contact *and* linked deal timeline |
| Individual | **Move to step** | set `stepIdx`, recompute `nextAt` | `step_moved` |
| Batch | Checkbox select in Enrolled view → Pause / Resume / Remove (reason applies to all); count shown in confirm | same as individual, `exit.reason='removed_bulk'` | one event per row |
| Batch | Contact list / stage sheet → "Remove from sequence(s)" | same | same |
| Sequence | **Pause sequence** | every active/scheduled row → `paused` with a `seqPaused` flag; `nextAt` preserved; no new enrollments accepted; Resume restores rows that were paused *by the sequence* only | `paused` reason `sequence_paused` |
| Sequence | **Stop sequence** | every non-terminal row → `exited` reason `sequence_stopped`; confirm names the count and "pending messages will not be sent" | `exited` |
| Sequence | **Archive** | allowed only when 0 non-terminal rows, or with "Stop and archive" (forced exit); archived sequences hidden from enroll pickers, kept for reporting | — |
| Sequence | **Delete** | blocked while any row is non-terminal; shows "Used in" (automations referencing it) — Kit pattern; otherwise `exited` reason `sequence_deleted` on historic rows | `exited` |
| Automation | `unenrollSequence` node | real runtime branch: `exit={reason:'removed_automation', by:automationName}` | `exited` |

Sequence-level Pause should be **global** (one small team, not HubSpot's per-sender scoping) — see decision Q4.

### 5.4 Automatic exits (sequence-level switches, replacing wizard toggles + builder stopRules)

`onReply` (scope: this contact | anyone at company), `onMeetingBooked`, `onDealWon`, `onDealLost`, `onUnsubscribe/STOP` (non-editable: always exits that channel; other-channel steps continue only if `crossChannelContinue` is on), `onBounce` (non-editable), `stopKeywords` (SMS; the inbox STOP detector reads this list instead of its hardcoded regex, N25). The runtime reads these off the sequence; the wizard shows them read-only with "edit on sequence". Inbound reply → `exit.reason='replied'`; STOP → `opted_out` (fix the current "Replied" misattribution); lead branch must call the same exit function keyed by `leadId`.

### 5.5 State diagram

```
                 enroll
                   │
          ┌────────▼────────┐  pause   ┌────────┐
          │ scheduled/active│─────────▶│ paused │
          │  (nextAt set)   │◀─────────│        │
          └───┬──────┬──────┘  resume  └───┬────┘
   gate fails │      │ last step sent      │ remove / stop
              ▼      ▼                     ▼
          ┌──────┐ ┌──────────┐        ┌────────────────┐
          │ held │ │ finished │        │ exited(reason) │
          └──┬───┘ └──────────┘        └────────────────┘
             │ gate passes → back to active; permanent block → exited(bounced|opted_out|…)
             ▼
          ┌───────┐
          │ error │  (missing identity, send failure) → Retry → active
          └───────┘
```

### 5.6 Trace UI

- **Enrolled view (per sequence)**: status chips Scheduled · Active · Paused · Held · Finished · Exited · Error; columns **Contact · Step x/N · Next send (absolute + relative, in contact tz) · To (email/number) · From · Status · Last event (type + reason + when)**; row actions Pause/Resume/Remove/Move to step; checkbox bulk bar pinned at top (HubSpot pattern). No seed rows, no synthesized names — empty state is "No one is enrolled yet".
- **Contact / lead detail**: banner "In *Sequence name* · step 2 of 4 · next SMS to +1 415… on Tue 9:00 AM (PT) from +1 415 555-0100" with Pause / Remove buttons (HubSpot banner pattern); next-best-action reads enrollment first.
- **Timeline entries** (from `history`): "Enrolled in X by Alex", "Step 2 sent to +1…", "Held — messaging not yet approved", "Paused by Sarah", "Exited — replied", "Removed by automation *Speed-to-lead*". Written to contact **and** linked deal.
- **Per-step funnel** on the sequence card: per step enrolled → sent → delivered → replied, plus an exit-reason breakdown per step (Salesloft "People Removed" chart), all derived from `history`. Card counters and KPI strips derived from the store; "Simulated" badge on email/SMS pages until a real send exists.
- **Inbox**: when a reply arrives from an enrolled contact, show "Exited *Sequence* (replied)" inline (already partly there as a toast).

---

## 6. Implementation notes for the prototype

**Components to change (names only):**
- `CrmDataContext` — canonical `seqEnrollments` shape (5.1); helpers `enrollContact()`, `exitEnrollment(id, reason, by)`, `pauseEnrollment/resumeEnrollment`, `enrolledCount(seqId)`, `activeEnrollmentFor(contactId|leadId, seqId)`; single channel-qualified `seqIdOf(seq)` (5.1) to kill the two id schemes and the cross-channel id collision (N11, N18). Remember the context is a `useMemo` — add new state to its deps.
- `SequenceEnrollModal`, `StageBulkModal`, automation `enrollEmail/enrollSms` — all call `enrollContact()`; typed duplicate check; channel-aware eligibility in stage-bulk; A2P gate via `canSendSms`; sender picker (connected mailbox / owned number) replacing the literal; pass channel-prefixed id from the card.
- `formatEnrollmentSchedule` → `computeNextAt()` returning a timestamp; keep the label as a formatter over it.
- `_autoAdvance` — add the sequence tick (5.2). Waits use the existing sim clock.
- `replyUnenroll` → `exitEnrollment(..., 'replied' | 'opted_out')`, keyed by contactId **or** leadId, reading the sequence's exit switches; lead inbound branch calls it.
- `autoRunNodes` — real `unenrollSequence` branch; `autoStepGate` case for it.
- `EnrolledContactsModal` → `SequenceEnrolledView` (5.6); delete `ENROLLEES`, `ENGAGEMENT_EVENTS` seed fallbacks and the `atStep` synthesizer.
- `SettingsSequencesPage` / `seqRow` — Pause/Stop/Archive/Delete actions backed by the store; counters from `enrolledCount`/history; "Used in" check.
- `ContactDetailPage`, `LeadDetailPage`, `DealDetailPage` — enrollment banner + timeline from `history`; NBA reads enrollment.
- `SequenceBuilderPage` — persist `fromNumber`, exit switches, `bounceSuppress`/`linkTracking`/`freqCap` and the `quietHours` toggle itself (N27); rehydrate `stopRules` on edit; Test button passes keyed nodes plus `kind:'wait'` nodes built from each step's delay so `simulateFlow` actually simulates the waits (N27); remove the wizard's four toggles (or make them read-only mirrors).
- `autoRunNodes` enroll branch — write the full record via `enrollContact()` (name/status/channel/stepIdx), log the enrollment on the *contact's* timeline as well as the triggering record, and enroll by `leadId` when the lead is unconverted instead of dropping it (N26).
- Merge (`applyMerge`/`bulkMerge`) — reparent by contactId, dedupe only within the merged contact, log `contact_merged` exits.

**Data migration from the current shape:** `seqId` → re-key to `seqIdOf(seq)`: `'email_1'`, `'email1'` and bare `1` on an email row all become `'email:1'` (resolve the sequence by the row's `seqName` when the old id is ambiguous — the same name fallback `enrolleesFor` already uses); `cs_…` ids are kept; `startStep` → `stepIdx = startStep-1` (rows without `startStep`, i.e. automation rows, → 0); `status 'scheduled'|'active'` → same, and rows without `status` (automation rows) → `'active'` since the automation enrolled them immediately; `scheduledFor` string → drop, recompute `nextAt`; `at/by` → `enrolledAt/enrolledBy`; `unenrollTriggers`/`overrides` → drop (move to sequence); `channel` → keep, and for automation rows fill `channel`, `contactName`-derived display and `status` from the sequence (N26); `contactName` → drop (resolve from store); **rows carrying both `contactId` and `leadId`** (converted leads enrolled from the wizard pool, 11512) → keep `contactId`, drop `leadId`, and write `history.enrolled.detail='via lead <leadId>'` so the lead origin is not lost.

**Stays simulated:** no real email/SMS is sent — the tick writes `history.sent` and a timeline activity; delivery/open/click events come only from the existing inbox simulators (reply, STOP) and an optional "Simulate delivery" dev button; A/B winner stays seeded but flagged "Simulated"; email/SMS pages get the same "Simulated." banner push/in-app already have.

---

## 7. Open decisions for the owner

1. **Destination identity:** snapshot the email/number at enrollment and send only there (Outreach), or re-resolve the primary at each send with "first non-suppressed" fallback (Close)? *Recommendation: snapshot for display, re-resolve with skip-on-change (5.1).*
2. **Sender:** the enroller's own mailbox/number (HubSpot/Salesloft), or the record owner's (Close "assigned user", HubSpot via workflow)? Can a manager enroll "on behalf of" (Outreach "Sequenced By")?
3. **Finish vs Remove:** one "Remove" verb with a reason, or the Outreach/Apollo split where *Finish* keeps reporting and *Remove* is for mistakes?
4. **Sequence Pause scope:** global (holds everyone) or per-sender like HubSpot?
5. **Concurrency:** one active sequence per contact (HubSpot), warn-and-allow (Apollo), or per-sequence exclusivity flag (Outreach)?
6. **STOP / unsubscribe on a multi-channel sequence:** exit the whole enrollment, or suppress that channel and let other-channel steps continue (Zoho/Close)?
7. **Pause semantics:** freeze the countdown (lemlist/HubSpot) or let timers run and fast-forward on resume (ActiveCampaign/Close)? *Recommendation: freeze.*
8. **Editing a live sequence:** snapshot at enrollment (HubSpot: edits apply to new enrollments only) or live-apply to future steps with elapsed-time credit (Customer.io)?

---

## 8. References

All URLs were fetched unless marked *(snippet only)*. Cells that rest on weaker evidence are flagged inline in the section 2 table: Instantly's "queued email may still send" (docs summary, page not fetched), GHL's bulk remove (third-party guides), and Pipedrive's whole-sequence pause ("not documented"). No training-recall-only facts are asserted.

**Kit (ConvertKit)**
- https://help.kit.com/en/articles/6211448-how-to-manually-add-or-remove-subscribers-from-a-kit-email-sequence — Manually add or remove subscribers
- https://help.kit.com/en/articles/2502629-creating-and-sending-an-email-sequence-in-kit — Creating and sending an Email Sequence
- https://help.kit.com/en/articles/2502542-restrict-email-sequence-emails-to-certain-days-of-the-week — Restrict emails to certain days
- https://help.kit.com/en/articles/2502651-the-subscriber-profile-page-and-status — Subscriber profile page and status
- https://help.kit.com/en/articles/3714889-email-sequence-analytics-explained — Email Sequence analytics
- https://help.kit.com/en/articles/2502568-troubleshooting-why-isn-t-my-email-sequence-sending — Troubleshooting sending
- https://help.kit.com/en/articles/5022528-restart-an-email-sequence — Restart an Email Sequence
- https://help.kit.com/en/articles/5192801-how-to-hold-subscribers-in-evergreen-email-sequences — Evergreen sequences
- https://help.kit.com/en/articles/13974216-how-to-edit-a-visual-automation — Edit a Visual Automation
- https://help.kit.com/en/articles/2502630-troubleshooting-subscribers-waiting-in-a-visual-automation — Subscribers waiting
- https://help.kit.com/en/articles/5026948-how-to-re-add-subscribers-to-a-visual-automation-where-they-d-left-off — Re-add where they left off
- https://help.kit.com/en/articles/5395862-how-to-remove-purchasers-from-a-sales-email-sequence-once-they-buy — Remove purchasers
- https://help.kit.com/en/articles/5342829-how-to-change-time-zones-in-your-account — Time zones
- https://help.kit.com/en/articles/16859676-see-where-an-email-sequence-is-used — Used in
- https://help.kit.com/en/articles/6611507-how-to-create-and-manage-automation-rules-in-kit — Automation Rules
- https://help.kit.com/en/articles/2502666-how-to-use-kit-visual-automations — Visual Automations
- https://help.kit.com/en/articles/2502589-subscriber-email-icons — Email icons
- https://help.kit.com/en/articles/2502654-how-to-remove-subscribers-from-your-email-list — Remove subscribers
- https://help.kit.com/en/articles/2502537-visual-automations-actions — Actions
- https://developers.kit.com/llms.txt — API v4 sequences
- https://help.kit.com/en/articles/8711248-how-to-add-a-new-sending-email-address — Sending address *(snippet only)*

**HubSpot**
- https://knowledge.hubspot.com/sequences/enroll-contacts-in-a-sequence — Enroll contacts in a sequence
- https://knowledge.hubspot.com/sequences/unenroll-from-sequence — Unenroll from a sequence
- https://knowledge.hubspot.com/sequences/pause-or-resume-your-sequences — Pause or resume sequences
- https://knowledge.hubspot.com/sequences/monitor-the-contacts-enrolled-in-your-sequence — Monitor enrolled contacts
- https://knowledge.hubspot.com/sequences/edit-an-active-sequence — Edit an active sequence
- https://knowledge.hubspot.com/sequences/create-and-edit-sequences — Create and edit sequences
- https://knowledge.hubspot.com/sequences/enroll-and-unenroll-contacts-in-sequences-using-workflows — Workflows enroll/unenroll
- https://knowledge.hubspot.com/sequences/sequences-error-contact-cant-be-enrolled-in-this-sequence — Enrollment error codes
- https://knowledge.hubspot.com/sequences/analyze-sequence-enrollment-and-performance-data — Analyze enrollment and performance
- https://knowledge.hubspot.com/sequences/review-and-manage-your-scheduled-sequence-emails — Scheduled tab
- https://knowledge.hubspot.com/connected-email/sales-email-send-limits — Send limits
- https://knowledge.hubspot.com/properties/hubspots-default-contact-properties — Default contact properties
- https://knowledge.hubspot.com/records/add-multiple-email-addresses-to-a-contact — Multiple email addresses

**Outreach**
- https://support.outreach.io/support/solutions/articles/159000426253-outreach-sequence-states-overview — Sequence states
- https://support.outreach.io/support/solutions/articles/159000425290-bulk-remove-prospects-from-a-sequence — Bulk remove
- https://support.outreach.io/hc/en-us/articles/27531179409563-What-is-the-difference-between-finishing-and-removing-prospects-from-sequences — Finishing vs removing
- https://support.outreach.io/hc/en-us/articles/205689787-Sequence-Schedule-Overview — Sequence Schedule
- https://support.outreach.io/support/solutions/articles/159000425886-how-outreach-schedules-email-deliveries — How deliveries are scheduled
- https://support.outreach.io/support/solutions/articles/159000425524-outreach-sequence-overview — Sequence overview
- https://support.outreach.io/support/solutions/articles/159000426339-outreach-sequence-rulesets-overview — Rulesets
- https://support.outreach.io/support/solutions/articles/159000426438-how-to-manually-update-prospect-sequence-actions — Manual prospect actions
- https://support.outreach.io/support/solutions/articles/159000426184-mark-prospects-finished-when-a-meeting-is-booked — Meeting booked finish
- https://support.outreach.io/support/solutions/articles/159000426008-how-to-deactivate-a-sequence — Deactivate a sequence
- https://support.outreach.io/hc/en-us/articles/19252263770139-What-happens-when-I-message-a-prospect-that-has-two-emails-and-the-first-one-bounces — Two emails and bounce
- https://support.outreach.io/support/solutions/articles/159000425228-can-i-update-a-sequence-once-it-s-already-started- — Update a started sequence
- https://support.outreach.io/support/solutions/articles/159000425980-sms-tasks — SMS tasks
- https://support.outreach.io/support/solutions/articles/159000425810-how-to-sequence-prospects-on-behalf-of-another-outreach-user — Sequence on behalf
- https://support.outreach.io/support/solutions/articles/159000425674-if-you-have-a-prospect-in-two-sequences-will-they-receive-emails-from-both-sequences- — Two sequences
- https://support.outreach.io/hc/en-us/articles/360001587093-Sequence-Exclusivity-Settings — Exclusivity
- https://support.outreach.io/support/solutions/articles/159000434078-cleaning-up-sequence-states — Cleaning up states
- https://support.outreach.io/support/solutions/articles/159000425890 — Activity feed events
- https://support.outreach.io/support/solutions/articles/159000426024 — CRM-sync sequence fields

**Salesloft**
- https://help.salesloft.com/s/article/Remove-from-Cadence — Remove from Cadence
- https://help.salesloft.com/s/article/Pause-Cadences — Pause Cadences
- https://help.salesloft.com/s/article/Create-a-Cadence — Create a Cadence
- https://help.salesloft.com/s/article/Add-an-Email-Step — Add an Email Step
- https://help.salesloft.com/s/article/Add-People-to-a-Cadence — Add People to a Cadence
- https://help.salesloft.com/s/article/Manage-Cadence-Enrollment-Rules — Enrollment Rules
- https://help.salesloft.com/s/article/Inside-a-Cadence-UI — Inside a Cadence UI
- https://help.salesloft.com/s/article/Person-Profile-Page — Person Profile
- https://help.salesloft.com/s/article/Logged-Activities-in-Activity-Feeds — Logged activities
- https://help.salesloft.com/s/article/Out-Of-Office-Detection — OOO detection
- https://help.salesloft.com/s/article/Add-and-Manage-Contact-Restrictions — Contact Restrictions
- https://help.salesloft.com/s/article/Email-thread-broken — Email thread broken (editing live)
- https://developers.salesloft.com/docs/api/1.0/person-cadence-memberships/ — Cadence membership API
- https://community.salesloft.com/fid-8/tid-337 — People Removed from a Cadence chart

**Close**
- https://help.close.com/docs/email-sequences — Workflows guide
- https://help.close.com/feature-guide/workflows.md — Workflows (markdown)
- https://help.close.com/docs/workflow-steps — Workflow Steps
- https://help.close.com/feature-guide/workflows/workflow-steps.md — Workflow Steps (markdown)
- https://help.close.com/docs/pause-a-sequence-using-various-triggers — Pausing runs
- https://help.close.com/docs/managing-unsubscribe-requests — Unsubscribe handling
- https://help.close.com/feature-guide/workflows/workflow-reporting.md — Workflow reporting
- https://help.close.com/technical-support/email-deliverability/email-sending-limits.md — Sending limits
- https://help.close.com/feature-guide/sms-and-mms.md — SMS and MMS

**Apollo**
- https://knowledge.apollo.io/hc/en-us/articles/46681725112589-Manage-Contacts-in-a-Sequence — Manage contacts in a sequence
- https://knowledge.apollo.io/hc/en-us/articles/4409477927309-Configure-a-Sequence-Sending-Schedule — Sending schedule
- https://knowledge.apollo.io/hc/en-us/articles/4409396858509-Manage-Sequence-Rulesets — Rulesets
- https://knowledge.apollo.io/hc/en-us/articles/4409396985741-Add-Contacts-to-a-Sequence — Add contacts
- https://knowledge.apollo.io/hc/en-us/articles/4411178322573-Edit-the-Sending-Mailbox-on-Contacts-in-a-Sequence — Edit sending mailbox
- https://knowledge.apollo.io/hc/en-us/articles/4412852701197-Archive-a-Sequence — Archive
- https://knowledge.apollo.io/hc/en-us/articles/5403737512589-Troubleshoot-Sending-Emails — Troubleshoot sending
- https://knowledge.apollo.io/hc/en-us/articles/4409237165837-Sequences-Overview — Sequences overview

**lemlist**
- https://help.lemlist.com/en/articles/4452757-how-to-pause-and-resume-a-lead-in-a-campaign — Pause and resume a lead
- https://help.lemlist.com/en/articles/4452799-pause-a-campaign — Pause a campaign
- https://help.lemlist.com/en/articles/12875247-understand-campaign-sequencing-in-lemlist — Campaign sequencing
- https://help.lemlist.com/en/articles/8000399-understanding-lead-statuses-a-comprehensive-guide — Lead statuses
- https://help.lemlist.com/en/articles/4522667-set-a-sending-schedule — Sending schedule
- https://help.lemlist.com/en/articles/8263428-use-inbox-rotation-for-campaigns — Inbox rotation
- https://help.lemlist.com/en/articles/13338246-pause-a-campaign-when-one-lead-from-a-company-engages — Company-level pause
- https://help.lemlist.com/en/articles/7219785-editing-an-active-campaign — Editing an active campaign
- https://help.lemlist.com/en/articles/4452778-delete-or-skip-steps-from-a-sequence — Delete or skip steps
- http://help.lemlist.com/en/articles/14299935-how-to-use-activity-logs-in-lemlist — Activity logs
- http://help.lemlist.com/en/articles/9423940-use-the-api-to-list-activity-types — Activity types

**Instantly**
- https://help.instantly.ai/en/articles/7913412-how-to-stop-a-campaign-for-a-specific-lead — Stop campaign for a lead
- https://help.instantly.ai/en/articles/6222396-campaign-options — Campaign options
- https://help.instantly.ai/en/articles/7902292-lead-activity — Lead activity
- https://help.instantly.ai/en/articles/6762327-update-lead-data-and-lead-status — Lead status
- https://help.instantly.ai/en/articles/6996491-how-to-delete-leads — Delete leads
- https://help.instantly.ai/en/articles/5975337-campaign-not-sending-complete-troubleshooting-guide — Not sending
- https://help.instantly.ai/en/articles/11864294-preferences-settings-overview — Preferences (Sticky Sending, Bounce Auto-Pause)

**GoHighLevel**
- https://help.gohighlevel.com/support/solutions/articles/155000003992-workflows-improved-execution-logs-enrollment-history — Execution Logs and Enrollment History
- https://help.gohighlevel.com/support/solutions/articles/48001239875-workflow-settings-overview — Workflow settings
- https://help.gohighlevel.com/support/solutions/articles/155000002470-workflow-action-wait — Wait action
- https://help.gohighlevel.com/support/solutions/articles/48001167703-upgraded-bulk-actions-interface-for-contacts-smartlists — Bulk actions
- https://help.gohighlevel.com/support/solutions/articles/155000007595-how-to-add-contacts-in-bulk-to-a-workflow — Bulk add to workflow
- https://help.gohighlevel.com/support/solutions/articles/155000003360-workflow-action-drip — Drip action
- https://help.gohighlevel.com/support/solutions/articles/155000002553-workflow-action-remove-from-workflow — Remove From Workflow
- https://help.gohighlevel.com/support/solutions/articles/155000003328-workflow-action-goal-event — Goal Event
- https://help.gohighlevel.com/support/solutions/articles/155000002639-how-to-restore-deleted-workflow — Restore deleted workflow
- https://help.gohighlevel.com/support/solutions/articles/155000001254-workflow-builder-walkthrough — Builder walkthrough (Draft/Publish)
- https://help.gohighlevel.com/support/solutions/articles/48001237029-how-to-manage-multiple-email-addresses-for-a-contact — Multiple emails
- https://help.gohighlevel.com/support/solutions/articles/155000000448-adding-multiple-phone-numbers-for-a-contact — Multiple phone numbers
- https://help.gohighlevel.com/support/solutions/articles/155000003721-select-sms-to-and-from-numbers — SMS To/From numbers
- https://ideas.gohighlevel.com/contacts/p/ability-to-have-a-pause-resume-button-in-an-active-workflow-in-the-contact-detai — Per-contact pause (feature request)

**ActiveCampaign**
- https://help.activecampaign.com/hc/en-us/articles/221298807-How-do-I-manually-add-or-remove-a-contact-s-from-an-automation — Add or remove a contact
- https://help.activecampaign.com/hc/en-us/articles/18125306552220-Configure-the-Wait-automation-action — Wait action
- https://help.activecampaign.com/hc/en-us/articles/218788817-How-do-I-see-which-automations-a-contact-has-been-in — Contact's automations
- https://help.activecampaign.com/hc/en-us/articles/115000383144-How-do-I-see-a-contact-in-an-automation — Contact path
- https://help.activecampaign.com/hc/en-us/articles/360000374270-How-to-set-automations-to-Active-or-Inactive-in-ActiveCampaign — Active/Inactive
- https://help.activecampaign.com/hc/en-us/articles/218788827-What-happens-to-contacts-in-an-automation-if-I-pause-it — Pause behaviour
- https://help.activecampaign.com/hc/en-us/articles/28075226424732-Use-Activity-Logs-to-troubleshoot-automations — Activity Logs
- https://help.activecampaign.com/hc/en-us/articles/360021830839-Modifying-Wait-action-while-contacts-are-queued-on-it — Modify Wait in flight
- https://help.activecampaign.com/hc/en-us/articles/18819387236508-About-Automation-Settings — Automation Settings
- https://help.activecampaign.com/hc/en-us/articles/4416094276252-How-to-send-1-1-sales-emails-with-automation — 1:1 sales email
- https://help.activecampaign.com/hc/en-us/articles/115000103510-Send-SMS-messages-with-automation — Send SMS
- https://help.activecampaign.com/hc/en-us/articles/218252958-Automation-Overview-report — Overview report

**Customer.io**
- https://docs.customer.io/messaging/send/automations/statuses/ — Automation statuses (stop, archive, restart)
- https://docs.customer.io/messaging/send/campaigns/journeys/ — Journeys (End this journey, exit reason)
- https://docs.customer.io/messaging/send/automations/exit-conditions/ — Exit conditions
- https://docs.customer.io/messaging/send/workflows/delays/delivery-window/ — Time Window
- https://docs.customer.io/messaging/send/workflows/delays/wait-until/ — Wait Until
- https://docs.customer.io/messaging/send/automations/edit-live/workflow-changes/ — Editing live workflows
- https://docs.customer.io/messaging/send/automations/triggers/ — Triggers and frequency
- https://docs.customer.io/messaging/channels/message-statuses/ — Message statuses

**Klaviyo**
- https://help.klaviyo.com/hc/en-us/articles/115002775072 — Cancel a scheduled flow email for a recipient
- https://help.klaviyo.com/hc/en-us/articles/115002779271 — Manage messages within a flow
- https://help.klaviyo.com/hc/en-us/articles/1260805003210 — Flow skip reasons
- https://help.klaviyo.com/hc/en-us/articles/115002779311 — Smart Sending
- https://help.klaviyo.com/hc/en-us/articles/115003885212 — Time delay
- https://help.klaviyo.com/hc/en-us/articles/4408737146651 — SMS quiet hours
- https://help.klaviyo.com/hc/en-us/articles/360017706091 — How contacts move through a flow
- https://help.klaviyo.com/hc/en-us/articles/115005247088 — Profile Messages inbox

**Pipedrive**
- https://support.pipedrive.com/en/article/sequences — Sequences
- https://support.pipedrive.com/en/article/sequences-automatic-enrollment-using-automations — Automatic enrollment
- https://support.pipedrive.com/en/article/automations-emails — Send email action
- https://support.pipedrive.com/en/article/workflow-automations-delay-feature — Delay feature
- https://support.pipedrive.com/en/article/workflow-automation-history — Automation history
- https://support.pipedrive.com/en/article/workflow-automation-frequency-limits — Frequency limits
- https://www.pipedrive.com/en/products/sales/sales-sequences — Marketing page (not KB)

**Zoho CRM**
- https://help.zoho.com/portal/en/kb/crm/automate-business-processes/cadences/articles/cadences — Cadences
- https://help.zoho.com/portal/en/kb/crm/faqs/automation/cadences/articles/faqs-cadences — Cadences FAQ
- https://help.zoho.com/portal/en/community/topic/new-in-cadences-option-to-resume-or-restart-follow-ups-when-re-enrolling-records-into-a-cadence-and-specify-custom-un-enrollment-criteria — Resume/Restart and un-enrollment criteria
- https://www.zoho.com/crm/developer/docs/api/v8/cadences/unenroll.html — Un-enroll API
- https://www.zoho.com/crm/developer/docs/api/v8/cadences/enroll.html — Enroll API
