# Sub-spec: Sending & Deliverability

_Detailed request/response schemas for the Sending & Deliverability system — email, SMS, push, and in-app messaging; sender identities and domain auth; server-authoritative suppression; the sequence enrollment lifecycle; rate/batch rails; and provider webhooks. Companion to [BACKEND_SPEC.md](../../BACKEND_SPEC.md) §6 (the biggest net-new system), with ties to §2.6 (Activity), §2.8 (Sequence & Enrollment), §4 (stage-bulk operation), §5.4 (suppression/masking), §7 (automation send steps), and §10 (webhooks, rate limits). Grounded in the prototype's `SEQ_DATA`/`EMAIL_SEQ_DATA`/`PUSH_SEQ_DATA`/`INAPP_SEQ_DATA`, `seqEnrollments`, `customSeqs`, `SEQ_TEMPLATES`, `stageBulkAudience`, `contactEmailSuppressed`, and the Settings suppression list (`main`, current `index.html`)._

Conventions: JSON over HTTPS; `Authorization: Bearer <token>`; every request is workspace-scoped from the token; all timestamps ISO-8601 UTC; money is integer **minor units**; IDs are server UUIDv7 strings; `4xx` bodies use `{ "error": { "code", "message", "details" } }`.

> **The core truth this sub-spec exists to fix.** In the prototype, *every send is simulated*. `EmailComposeModal.handleSend` is `setTimeout(…, 900)` then `close()` — no wire (`index.html` ~11668). `LogCallModal` only records a manual call. The stage-bulk "Send"/"Enroll" (`StageBulkModal.confirm`, ~8149) and the win-back/sequence flows write **Activity timeline entries** via `mkAct('email'|'sms'|'sequence', …)` and push rows into `seqEnrollments`/`customSeqs` React state — nothing leaves the browser. `PushInAppFields` even says so inline: "Real push delivery needs the device-token SDK — sending is simulated." The stat fields on `EMAIL_SEQ_DATA` (`sent/delivered/opened/clicked/replied/bounced/unsub/atStep`) are **hardcoded seed numbers**, not measured. The backend must (a) actually transmit through real providers, (b) enforce suppression at the moment of send so a client can never bypass it, (c) drive the enrollment state machine on a durable scheduler, and (d) populate those exact stat fields from real provider webhooks.

---

## 1. Persistence schema (Postgres-flavoured)

```sql
-- ── Sender identities & transport config (per workspace) ──
-- Maps to INTG_DEFS 'sending-domain' (DKIM/SPF), 'twilio', 'push-notifications',
-- 'inapp-messaging', 'stripe' — see §15639+ of the prototype.
sender_domain (
  id            uuid pk,
  workspace_id  uuid not null,
  domain        text not null,              -- 'mail.yourcompany.com' (INTG field 'domain')
  from_address  text,                        -- default 'hello@yourcompany.com' (INTG field 'from')
  spf_status    text not null default 'pending',   -- pending|verified|failed
  dkim_status   text not null default 'pending',
  dmarc_status  text not null default 'pending',
  dkim_selector text, dkim_public_key text,
  dedicated_ip  inet null,                    -- null = shared pool
  warmup_stage  smallint null,                -- null = not warming; 1..N ramp step
  warmup_daily_cap int null,                  -- today's send ceiling during warmup
  verified_at   timestamptz null,
  created_at timestamptz, updated_at timestamptz,
  unique(workspace_id, domain)
);
-- A "from" a user/team sends as (email or SMS number). Email identities inherit a sender_domain.
sender_identity (
  id uuid pk, workspace_id uuid not null,
  channel       text not null,               -- email|sms|push|inapp
  display_name  text,                          -- 'Alex Morgan'
  address       text not null,                 -- email addr | E.164 number | push app id
  sender_domain_id uuid null references sender_domain,  -- email only
  provider      text,                          -- 'sendgrid'|'twilio'|'apns_fcm'|'builtin'
  provider_ref  text,                          -- provider-side id (messaging service SID, etc.)
  owner_code    text null,                     -- personal inbox seam (Gmail OAuth), else workspace-shared
  status        text not null default 'active',-- active|disconnected|unverified
  created_at timestamptz
);

-- ── Suppression (the compliance heart — server-authoritative) ──
-- Unifies the prototype's three sources: contact.dnc (all channels),
-- contactEmailSuppressed() list+domains, and the Settings suppression list (emails/domains/phones/per-contact-channels).
suppression (
  id uuid pk, workspace_id uuid not null,
  scope    text not null,                      -- 'email' | 'domain' | 'phone' | 'contact_channel'
  value    text not null,                      -- lower(email) | domain | E.164 | contact_id
  channel  text null,                          -- for phone/contact_channel: email|sms|calls|push|inapp; null=all
  reason   text not null,                      -- Unsubscribed|Bounced|Complaint|Manual|DNC|Blocked domain
  reason_excludes text[] null,                 -- for 'domain' scope: allowed-exception addresses
  source   text,                               -- 'Manual'|'Provider webhook'|'Unsub link'|'Import'
  added_by text null, added_at timestamptz not null,
  -- unsubscribe & bounce are NON-disableable (BACKEND_SPEC §6); flag them so no admin op can lift them silently
  permanent bool not null default false,
  unique(workspace_id, scope, value, channel)
);
create index on suppression (workspace_id, scope, value);
create index on suppression (workspace_id, channel);

-- ── Sequences (a template instantiated ONCE, then reused — customSeqs / SEQ_TEMPLATES) ──
sequence (
  id uuid pk, workspace_id uuid not null,
  name text not null,
  channel text not null,                       -- email|sms|push|inapp
  from_template_key text null,                 -- SEQ_TEMPLATES.key; UNIQUE per ws → create-once
  active bool not null default true,
  step_count int not null,
  created_by text, created_at timestamptz,
  unique(workspace_id, from_template_key)      -- enforces useTemplate()'s "reuse, never duplicate"
);
-- One row per authored step. Email/SMS/push/inapp carry different fields (seqBlankFields()).
sequence_step (
  id uuid pk, sequence_id uuid references sequence,
  position int not null,                       -- 0-based; even = message, historically
  kind text not null,                          -- message | wait
  wait_n int null, wait_unit text null,        -- for kind=wait: {n, unit:'days'|'hours'}
  -- message payload (channel-shaped):
  subject text null,                           -- email
  body text null,                              -- all channels
  push_title text null, push_url text null, push_icon text null,   -- push (seqBlankFields push)
  inapp_title text null, inapp_cta text null, inapp_style text null -- inapp
);

-- ── Enrollment (REAL membership — the prototype's seqEnrollments) ──
enrollment (
  id uuid pk, workspace_id uuid not null,
  sequence_id  uuid not null references sequence,
  contact_id   uuid not null references contact,
  deal_id      uuid null references deal,      -- context that triggered enrollment
  state        text not null default 'active', -- see §5 state machine
  stage        text null,                      -- e.g. 'Proposal' — the pipeline stage it came from
  pipeline     text null,                      -- denorm pipeline name (stage-bulk provenance)
  cur_step     int not null default 0,
  next_send_at timestamptz null,               -- scheduler wakes on this
  enrolled_by  text, enrolled_at timestamptz not null,
  exit_reason  text null,                      -- replied|meeting_booked|unsubscribed|bounced|completed|manual
  exited_at    timestamptz null,
  unique(workspace_id, sequence_id, contact_id) partial where state != 'exited'  -- "already in this sequence"
);
create index on enrollment (workspace_id, next_send_at) where state='active';
create index on enrollment (workspace_id, sequence_id, state);

-- ── Message (one physical send attempt; the unit webhooks aggregate onto stats) ──
message (
  id uuid pk, workspace_id uuid not null,
  channel text not null,
  sender_identity_id uuid references sender_identity,
  contact_id uuid null, deal_id uuid null,
  enrollment_id uuid null references enrollment, -- null for one-off sends (compose modal, stage-bulk email)
  sequence_id uuid null, step_position int null,
  to_address text not null,                      -- redacted in logs after send
  subject text null, body_hash text,             -- store rendered hash, not full PII body, past retention
  provider text, provider_message_id text,
  status text not null default 'queued',         -- queued|sent|delivered|bounced|failed|suppressed
  scheduled_for timestamptz null,                -- compose "Schedule send"; sequence step time
  sent_at timestamptz null, delivered_at timestamptz null,
  bounce_type text null,                         -- hard|soft|block
  created_at timestamptz
);
create index on message (workspace_id, sequence_id, step_position);
create index on message (provider, provider_message_id);   -- webhook lookup

-- ── Message events (raw provider callbacks; source of the sequence stats) ──
message_event (
  id uuid pk, workspace_id uuid not null,
  message_id uuid references message,
  type text not null,                            -- delivered|open|click|reply|bounce|unsub|complaint|failed
  at timestamptz not null,
  meta jsonb null,                               -- {url} for click, {bounce_type} for bounce, etc.
  provider_event_id text                         -- dedupe key (idempotent webhook)
);
create unique index on message_event (workspace_id, provider_event_id);

-- ── Send throttle / frequency (WORKSPACE_FREQ_CAP + provider rate rails) ──
send_budget (
  workspace_id uuid, channel text, window_start date,
  primary key(workspace_id, channel, window_start),
  count int not null default 0                   -- per-day rollup for tiered caps / warmup
);
```
**Migration note:** the prototype has **no message/event/suppression tables** — suppression is three hardcoded string arrays (`contactEmailSuppressed`, the per-channel `suppressed` object in `ContactDetailPage`, and React state in the Settings page). All three collapse into the one `suppression` table above.

---

## 2. Sender identity & transport config

Real transport is the first net-new piece. The prototype models the *config UI* only (INTG_DEFS cards) and treats connections as booleans.

### `GET /v1/senders`
```jsonc
// 200
{
  "domains": [
    { "id":"0191…", "domain":"mail.yourcompany.com", "fromAddress":"hello@yourcompany.com",
      "spfStatus":"verified", "dkimStatus":"verified", "dmarcStatus":"pending",
      "dedicatedIp":null, "warmupStage":null,               // null = fully warmed / shared pool
      "dnsRecords":[ { "type":"TXT","host":"…_domainkey","value":"v=DKIM1; k=rsa; p=…" } ] }
  ],
  "identities": [
    { "id":"0192…","channel":"email","displayName":"Alex Morgan","address":"alex@mail.yourcompany.com",
      "senderDomainId":"0191…","owner":"AM","status":"active" },   // personal inbox (Gmail OAuth seam)
    { "id":"0193…","channel":"sms","address":"+14155550100","provider":"twilio","status":"active" }
  ]
}
```
- **`POST /v1/senders/domains`** `{ "domain":"mail.yourcompany.com", "fromAddress":"hello@…" }` — mirrors the `sending-domain` INTG fields. Returns the DKIM/SPF DNS records to publish; status stays `pending` until verified.
- **`POST /v1/senders/domains/{id}/verify`** — server re-checks DNS; flips `spfStatus`/`dkimStatus`/`dmarcStatus`. **A domain with `dkimStatus != 'verified'` cannot be used to send** (`409 DOMAIN_UNVERIFIED`).
- **IP warmup (net-new, no prototype analog):** new dedicated IPs / domains start with `warmupStage` set and a `warmupDailyCap`. The send worker (§6) enforces the cap; exceeding it queues to the next window rather than sending. Warmup ramps automatically on delivery-rate health.
- **SMS:** `sender_identity(channel='sms')` is created by the Twilio OAuth connect (`TwilioSetupModal`). Until it exists, the prototype already blocks: "Twilio not connected — build your sequence but you can't send." The API returns `409 CHANNEL_NOT_CONNECTED` on send.
- **Push/in-app:** require the `push-notifications` / `inapp-messaging` connections + a device-token SDK. The prototype is explicit these are *"Coming soon"* / simulated; the backend gates the same way (`409 CHANNEL_NOT_CONNECTED`).

---

## 3. Suppression — the server-authoritative gate

This is the single most important guarantee: **suppression is checked at send time inside the server, never trusted from the client.** The prototype's checks are advisory UI; the backend owns them.

### 3.1 The rules, transcribed from the prototype

| Source in prototype | Rule | Backend representation |
|---|---|---|
| `contact.dnc` (`ContactDetailPage`, `stageBulkAudience`) | **DNC blocks ALL channels** — "Blocks all email, SMS, and calls" | `suppression(scope='contact_channel', value=contactId, channel=null, reason='DNC')` |
| `contactEmailSuppressed(email)` (~8097): exact addresses `unsub@acme.com`, `bounce@example.com`, … | address on the suppression list → block email | `scope='email'` rows |
| `contactEmailSuppressed` domain list `competitor.com`, `acme.com` | whole domain suppressed, with **allowed exceptions** (Settings → Domains tab) | `scope='domain'`, `reason_excludes[]` |
| Per-channel `suppressed` object (~7439): `email/sms/calls`, phone lists | phone number blocked for a channel | `scope='phone'`, `channel` set |
| Settings → Channels-by-contact (`CH_DEFS` toggles) | per-contact per-channel opt-out | `scope='contact_channel'`, `channel` set |

The prototype's own enforcement note is the contract: *"Suppressed contacts are auto-skipped in every sequence & automation and can't be re-enrolled. On a contact's record the blocked channel's send button is disabled."*

### 3.2 The check (single authoritative function)

Every send path (§6, §7 stage-bulk, §8 automation send steps) calls this before dispatch. Resolution mirrors `stageBulkAudience`'s block precedence exactly:

```
suppressionBlock(contact, channel, email, phone):
  1. contact.dnc                                    → 'DNC' (all channels)
  2. contact_channel row (contactId, channel|null)  → its reason
  3. channel==email:
       email empty                                  → 'No email address'
       scope='email' row on lower(email)            → 'Suppressed (email)'
       scope='domain' row on domain(email)
          AND email NOT in that row's reason_excludes → 'Blocked domain'
  4. channel in (sms,calls): scope='phone' row on E.164(phone), matching channel → its reason
  → else null (allowed)
```
Returns the **reason string** the UI already renders in the stage-bulk skip sheet ("Do Not Contact", "Suppressed (email)", "No email address", "Blocked domain", "Already in this sequence").

### 3.3 Suppression management endpoints

- **`GET /v1/suppression?scope=email|domain|phone|contact_channel&q=…`** → paged rows (the four Settings tabs).
- **`POST /v1/suppression`** `{ "scope":"email", "value":"x@y.com", "reason":"Manual" }` — the block sheets (`EmailBlockSheet`/`DomainBlockSheet`/`PhoneBlockSheet`). Domain rows accept `reasonExcludes[]`.
- **`DELETE /v1/suppression/{id}`** — the "Unblock" action. **Rejects with `422 PERMANENT_SUPPRESSION` if `permanent=true`** (unsubscribe/bounce rows). This is the non-disableable guarantee: an admin can lift a Manual block but never an unsubscribe or hard bounce.
- **`POST /v1/contacts/{id}/dnc`** `{ "dnc": true }` — the contact-page toggle. Emits the `dnc`-type Activity (`mkAct('dnc', …)`, "Marketing emails turned OFF") server-side.
- **`GET /v1/contacts/{id}/channels`** → `{ "email":true,"sms":false,"calls":true,"push":false,"inapp":true }` — the per-contact channel matrix; `POST` toggles one (`CH_DEFS`).

### 3.4 Compliance preferences (workspace)
`GET/PATCH /v1/settings/compliance` — the three prototype toggles (`SuppressionPage`, ~16275), all default **on**:
```jsonc
{ "globalOptOutSuppression": true,   // any unsubscribe suppresses across all sequences
  "honorGdprDeletion": true,         // erasure requests anonymised within 30 days
  "includeUnsubscribeLink": true }   // one-click unsub footer appended to ALL outbound email — see §9
```
`includeUnsubscribeLink` is **enforced server-side**, not a preference the sender can skip per-message for marketing email.

---

## 4. Sequences & templates

### 4.1 Sequence resource
```jsonc
{
  "id":"0191…", "name":"Proposal Follow-Up", "channel":"email",
  "fromTemplateKey":"proposal",          // null unless created from a SEQ_TEMPLATES key
  "active":true, "stepCount":3,
  "steps":[
    { "position":0, "kind":"message", "subject":"Proposal recap", "body":"Hi {{first_name}}…" },
    { "position":1, "kind":"wait", "waitN":2, "waitUnit":"days" },
    { "position":2, "kind":"message", "subject":"Final call", "body":"…" }
  ],
  "stats": { /* see §10 */ }
}
```

### 4.2 Create sequence from a template — create-once
`POST /v1/sequences/from-template` `{ "templateKey":"proposal" }`

Implements `useTemplate()` (~8143): if a `sequence` with this `from_template_key` already exists in the workspace, **return it (200, existing)** — never mint a duplicate. Otherwise create it from the `SEQ_TEMPLATES` step labels (`stepLabels[]`) and return `201`. The `unique(workspace_id, from_template_key)` constraint is the hard backstop.

```jsonc
// 200 (reused) or 201 (created)
{ "sequence": { "id":"cs_proposal", "name":"Proposal Follow-Up Emails", "fromTemplateKey":"proposal", … },
  "created": false }
```

### 4.3 Plain sequence CRUD
`GET/POST/PATCH /v1/sequences`, `PATCH /v1/sequences/{id}` (toggle `active` = the `seqRow` Active/Paused toggle). Pausing a sequence stops the scheduler from advancing its enrollments but does not exit them.

---

## 5. Enrollment lifecycle & the send worker

`seqEnrollments` in the prototype is *real state* but *inert* — nothing schedules or sends. The backend turns it into a durable state machine driven by a scheduler.

### 5.1 State machine

```
              enroll (eligibility passes)
   (none) ─────────────────────────────▶ active
                                          │  scheduler fires next_send_at
                                          ▼
                            ┌──────── send step (suppression re-checked!) ────────┐
                            │                                                      │
                     suppressed now                                          delivered/queued
                            │                                                      │
                            ▼                                            advance cur_step, set
                         exited                                          next_send_at from wait
                    (exit_reason=                                               │
                     unsubscribed/bounced)                              last step done
                                                                               ▼
                                                                          completed → exited
   active ──▶ exited on any AUTO-UNENROLL event:
             reply · meeting_booked · unsubscribe · bounce
             (unsubscribe & bounce are NON-disableable exits)
```

- **Enroll** writes an `enrollment` (state `active`, `cur_step=0`, `next_send_at=now`). The partial-unique index rejects a second active enrollment in the same sequence → the `Already in this sequence` skip reason.
- **Each step send** re-runs `suppressionBlock` (§3.2) at dispatch time. A contact who unsubscribed *between* enrollment and this step is exited before the send — closing the client-can't-bypass gap that a pre-computed audience would leave open.
- **Auto-unenroll triggers** (BACKEND_SPEC §6): `reply` (inbound webhook), `meeting_booked` (scheduling module event), `unsubscribe`, `bounce`. **Unsubscribe and bounce exits are non-disableable**; reply/meeting-booked are configurable per sequence but default on. This matches the stage-bulk copy: *"Replies and unsubscribes auto-unenroll."*

### 5.2 Enrollment endpoints
- **`POST /v1/sequences/{id}/enroll`** `{ "contactIds":[…], "dealId":"…" }` — runs the §7 eligibility check per contact, enrolls the eligible, returns `{ "enrolled":[…], "skipped":[{contactId,reason}] }`. Emits `mkAct('sequence', "Enrolled in \"<name>\"")` per contact.
- **`POST /v1/enrollments/{id}/unenroll`** `{ "reason":"manual" }` — manual exit.
- **`GET /v1/sequences/{id}/enrollments?state=active`** — powers the "Enrolled" drawer; `atStep[]` (per-step counts) is derived by `GROUP BY cur_step`.

### 5.3 The send worker (durable, async)
A queue worker, not request-path. For each due `enrollment` (`state='active' AND next_send_at <= now`), it: (1) loads contact + resolves channel address, (2) checks `suppressionBlock`, exits if blocked, (3) checks frequency cap + quiet hours + warmup budget (§6), deferring `next_send_at` if capped, (4) renders merge tags (`{{first_name}}` etc. — `SMS_VARS`/`pushFill`), (5) dispatches to the provider, writes a `message` row, (6) advances `cur_step`/`next_send_at` from the following `wait` step. Idempotent per `(enrollment_id, step_position)`.

---

## 6. Rate & batch rails

### 6.1 Frequency cap (anti-fatigue) — `WORKSPACE_FREQ_CAP`
Transcribed from the prototype (~16286): per-channel caps shared by **every** sequence, automation, and campaign.
```jsonc
// GET/PATCH /v1/settings/frequency-cap
{ "email":{"on":true,"max":3,"per":"week"},
  "sms":{"on":true,"max":2,"per":"week"},
  "push":{"on":false,"max":5,"per":"week"},
  "inapp":{"on":false,"max":10,"per":"week"},
  "transactionalExempt":true }              // transactional (invoice/receipt) sends skip the cap
```
Enforced at send time: if the contact has hit `max` for the channel in the rolling window, the send **defers** (sequence) or **skips** (bulk). `transactionalExempt` lets Stripe invoice/receipt emails through regardless (§11).

### 6.2 Quiet hours
`GET/PATCH /v1/settings/quiet-hours` — the prototype's toggle (~17017): *"Only send 8am–7pm in the contact's timezone. No 2am pings."* When on, the worker clamps `next_send_at` to the next in-window slot in the contact's timezone. Applies to email/SMS/push; in-app is exempt.

### 6.3 Provider throttle & warmup budget
Net-new (no prototype analog beyond the "3/min" research note in BACKEND_SPEC §6). The worker respects: a per-minute provider send rate, a per-day `send_budget` tier, and — for warming domains/IPs — `sender_domain.warmup_daily_cap`. Large audiences drip-batch across windows rather than bursting.

### 6.4 Bulk-enroll eligibility check — the `stageBulkAudience` contract
`POST /v1/pipelines/{id}/stages/{key}/bulk` `{ "action":"email"|"enrollSequence", "sequenceId?":"…", "templateKey?":"…" }`

This is the **exact review payload** the prototype's `StageBulkModal` renders. Server-side it: resolves the stage's deals → **unique contacts** (dedupe by contact id, one contact many deals), then runs `suppressionBlock` + already-enrolled per contact.

```jsonc
// 200 — review (dry run; no send)
{
  "sequenceId":"cs_nudge",           // created-once from templateKey if given (§4.2)
  "recipients":[
    { "contactId":"0191…","name":"James Rivera","dealCount":2 }   // deduped
  ],
  "skipped":[
    { "name":"Ravi Lee","reason":"Do Not Contact" },
    { "name":"Pivot Studio","reason":"No contact linked to the deal" },
    { "name":"old@company.net","reason":"Suppressed (email)" },
    { "name":"Sam Wu","reason":"Already in this sequence" }
  ]
}
```
The reason strings are **verbatim** from `stageBulkAudience` (~8105–8113). A second call `POST …?confirm=true` performs the send/enroll and, for a contact with several deals, **sends one email / enrolls once** (the dedupe guarantee) while writing an Activity to each linked deal (matching `confirm()`, ~8152–8161).

---

## 7. One-off sends (compose / SMS / call)

These replace the simulated modals. Each still emits the same Activity type the prototype logs.

### 7.1 Send email — `POST /v1/messages/email`
Replaces `EmailComposeModal.handleSend` (the 900ms fake). Body: `{ "to","cc","bcc","subject","body","senderIdentityId?","scheduledFor?","contactId?","dealId?","attachments[]?" }`.
Enforcement: `suppressionBlock(contact,'email',…)` → `409 SUPPRESSED` (with the reason); `sender_domain` must be DKIM-verified; unsubscribe footer appended if marketing (§9). `scheduledFor` (the "Schedule send" options) sets `message.scheduled_for`. On accept, writes `message` + `mkAct('email')` to the contact and any linked deal.
```jsonc
// 202 Accepted
{ "messageId":"0191…","status":"queued","scheduledFor":null }
// 409 if suppressed
{ "error":{ "code":"SUPPRESSED","message":"Recipient is on the suppression list",
            "details":{ "reason":"Blocked domain","channel":"email" } } }
```

### 7.2 Send SMS — `POST /v1/messages/sms`
`{ "to","body","contactId?","dealId?" }`. Requires a connected `sender_identity(channel='sms')` else `409 CHANNEL_NOT_CONNECTED`. `suppressionBlock(…, 'sms', …)`; segments computed server-side (`SmsSegments`). Emits `mkAct('sms')`. Inbound replies arrive via webhook (§10) and (a) log to the timeline, (b) auto-unenroll any active sequence for that contact.

### 7.3 Log call — `POST /v1/calls`
`LogCallModal` is a manual log, not a send — but a *dial* through the built-in/Twilio dialer is a real action. `{ "contactId","direction","outcome?","duration?","notes?" }` writes `mkAct('call')`. Calls respect the `calls` channel suppression (a DNC contact's dial button is disabled in the prototype; the API returns `409 SUPPRESSED`).

### 7.4 Push / in-app — `POST /v1/messages/push` · `/v1/messages/inapp`
Gated on the `push-notifications` / `inapp-messaging` connections; `409 CHANNEL_NOT_CONNECTED` until wired (honestly simulated in the prototype). Payload fields per `seqBlankFields`: push `{title,body,url,icon}`, in-app `{title,body,cta,style}`.

---

## 8. Provider webhooks → Activity + sequence stats

The prototype's stat numbers are fake. Real ones come from provider callbacks. **All webhook receivers verify the provider signature, are idempotent on `provider_event_id`, and are workspace-resolved from the provider account.**

### `POST /v1/webhooks/email` (SendGrid/Postmark-style)
Event types map to `message_event.type`: `delivered · open · click · reply · bounce · unsub · complaint · dropped`.
Side effects per event:
- **delivered/open/click** → `message_event` row; bumps the sequence's `delivered/opened/clicked` aggregate; `click` logs `mkAct('smsclick'|'email')` if configured.
- **reply** → logs an email Activity **and auto-unenrolls** the contact's active enrollment (`exit_reason='replied'`).
- **bounce** (hard) → writes a **permanent** `suppression(scope='email', reason='Bounced')`, exits enrollment (`exit_reason='bounced'`), logs `mkAct('dnc'|'email')`.
- **unsub** → **permanent** `suppression(reason='Unsubscribed')`, exits enrollment (`exit_reason='unsubscribed'`), applies `globalOptOutSuppression` across sequences.
- **complaint** (spam report) → permanent suppression + deliverability alert.

### `POST /v1/webhooks/sms` (Twilio-style)
`delivered · failed · inbound(reply)`. Inbound reply auto-unenrolls (`exit_reason='replied'`) and logs `mkAct('sms')`. `STOP` keyword inbound → permanent phone suppression (`scope='phone', channel='sms', reason='Unsubscribed'`).

### `POST /v1/webhooks/push`
`delivered · open · unregister`. `unregister` (dead device token) suppresses the push channel for that contact.

---

## 9. Compliance (mandatory server behaviour)

- **Unsubscribe link (email):** when `includeUnsubscribeLink` is on (default), the server appends a one-click unsubscribe footer with a signed, per-recipient token to **every marketing email** (sequence steps, stage-bulk, campaigns). The token endpoint `POST /v1/unsubscribe/{token}` (unauthenticated) writes a permanent `suppression(reason='Unsubscribed')` and exits enrollments — no login required (CAN-SPAM / one-click list-unsubscribe). Transactional email (invoices, receipts) is exempt from the footer requirement.
- **Consent:** DNC (`contact.dnc`) and per-channel opt-outs are consent state; a send against a channel the contact opted out of is a `409 SUPPRESSED`, always.
- **Quiet hours** (§6.2): no marketing send outside the contact's local window.
- **GDPR erasure:** `honorGdprDeletion` anonymises a contact's PII within 30 days of an erasure request; suppression rows are retained (hashed) so a deleted contact is never re-emailed.
- **Frequency cap** (§6.1): anti-fatigue ceiling across all systems.

---

## 10. Sequence stats — what the UI renders

`seqRow` (~17485) renders **Enrolled / Sent / Replied** on the list, and the analytics widgets read the full stat set. These fields must be **computed from `message` + `message_event`**, not stored as seeds. The response reproduces the exact `EMAIL_SEQ_DATA` shape:

### `GET /v1/sequences/{id}/stats`
```jsonc
// 200 — same field names as EMAIL_SEQ_DATA / SEQ_DATA / PUSH_SEQ_DATA / INAPP_SEQ_DATA
{
  "id":"0191…","name":"Proposal Follow-Up","channel":"email",
  "steps":3, "active":true, "lastRun":"2026-07-03T14:12:00Z",
  "enrolled":41,                          // count(enrollment where state='active')
  "sent":128, "delivered":124,
  "opened":71, "clicked":33, "replied":18,   // opened/clicked null for sms; replied 0 for push/inapp
  "bounced":3, "unsub":2,
  "atStep":[8,6,4]                        // active enrollments grouped by cur_step (len = steps)
}
```
Channel-specific nulls follow the prototype: SMS has no `opened`; push/in-app track `opened`+`clicked` but `replied:0` (per the `PUSH_SEQ_DATA` comment "opens + clicks tracked, no bounces" for in-app). The `sequence-perf` dashboard widget's metrics (`reply`=Reply rate, `open`=Delivery rate, `enrolled`) derive from these.

---

## 11. Payments / invoice sends (tie-in)

Stripe (`INTG_DEFS 'stripe'`, OAuth) is the transactional-send exception. Invoice/receipt emails (`actInvoiceOwn`, `mkAct('payment'|'invoice')`) are **transactional**: `transactionalExempt` skips the frequency cap, and they are exempt from the marketing unsubscribe-footer mandate — but **hard-bounce suppression still applies** (a bounced invoice email surfaces a deliverability warning; you never keep blasting a dead address). Stripe payment webhooks post `mkAct('payment')` Activity via the §8 webhook machinery (`POST /v1/webhooks/stripe`), same idempotency rules.

---

## 12. Error codes (this module)

| HTTP | code | when |
|---|---|---|
| 403 | `FORBIDDEN` | object permission / row-scope denies the send (e.g. can't act on this contact) |
| 409 | `SUPPRESSED` | `suppressionBlock` returned a reason (`details.reason`, `details.channel`) — the client can never override |
| 409 | `CHANNEL_NOT_CONNECTED` | no connected `sender_identity` for the channel (Twilio/push/in-app not wired) |
| 409 | `DOMAIN_UNVERIFIED` | sending from a domain whose DKIM/SPF isn't verified |
| 409 | `ALREADY_ENROLLED` | active enrollment already exists for (sequence, contact) |
| 422 | `PERMANENT_SUPPRESSION` | attempt to delete an unsubscribe/bounce suppression row |
| 422 | `FREQUENCY_CAPPED` | one-off send would exceed the channel cap (bulk skips instead of erroring) |
| 422 | `QUIET_HOURS` | one-off immediate send blocked by quiet hours (offer schedule) |
| 429 | `RATE_LIMITED` | provider/warmup budget exhausted for the window — retry after |

---

## 13. What the client stops doing (migration mapping)

| Prototype function / state | Becomes | Note |
|---|---|---|
| `EmailComposeModal.handleSend` (`setTimeout` fake, ~11668) | `POST /v1/messages/email` | real transport + suppression + unsub footer |
| SMS send via inbox, `mkAct('sms')` | `POST /v1/messages/sms` | Twilio; inbound replies via webhook |
| `LogCallModal` / dialer | `POST /v1/calls` | manual log stays; live dial checks `calls` suppression |
| `contactEmailSuppressed(email)` + per-channel `suppressed` object (~7439) | `suppression` table + `suppressionBlock()` | three hardcoded arrays → one authoritative table, checked **server-side at send** |
| `contact.dnc` toggle | `POST /v1/contacts/{id}/dnc` | DNC = all-channel `contact_channel` row |
| Settings suppression list (`SuppressionPage`, React state) | `GET/POST/DELETE /v1/suppression` | domain exceptions preserved; unsub/bounce non-deletable |
| `stageBulkAudience(deals,contacts,opts)` (~8099) | `POST /pipelines/{id}/stages/{key}/bulk` (review) + `?confirm=true` | dedupe + skip-reason payload is the wire contract |
| `StageBulkModal.confirm` → `setSeqEnrollments` | server enrollment writes + Activity events | membership becomes durable, not React state |
| `useTemplate()` create-once (`customSeqs.find(fromTemplate)`) | `POST /v1/sequences/from-template` | `unique(workspace_id, from_template_key)` enforces reuse |
| `seqEnrollments` state | `enrollment` table + send worker | the inert state gains a scheduler + state machine |
| Hardcoded `EMAIL_SEQ_DATA` stat numbers | `GET /v1/sequences/{id}/stats` | computed from `message_event`, not seeds |
| `WORKSPACE_FREQ_CAP` / quiet-hours / compliance toggles | `/v1/settings/frequency-cap`, `/quiet-hours`, `/compliance` | enforced in the worker, not just displayed |
| INTG_DEFS `sending-domain`/`twilio`/`push`/`stripe` booleans | `sender_domain` / `sender_identity` + verify endpoints | real DKIM/SPF/DMARC + warmup |

The prototype proved the *shapes and the compliance rules*; this system supplies the four things a browser can't: real provider transport, an authoritative suppression gate at send time, a durable enrollment scheduler, and webhook-fed telemetry.

---

_Verified against `index.html`: `SEQ_DATA`/`EMAIL_SEQ_DATA`/`PUSH_SEQ_DATA`/`INAPP_SEQ_DATA` (stat fields), `seqEnrollments` shape (`{seqId,contactId,dealId,stage,at,by}`), `customSeqs`+`SEQ_TEMPLATES`+`useTemplate` (create-once), `stageBulkAudience` (dedupe + skip reasons), `contactEmailSuppressed` + `ContactDetailPage.suppressed` + `SuppressionPage` (DNC/email/domain/phone/channel), `WORKSPACE_FREQ_CAP`, quiet-hours toggle, `INTG_DEFS` (sending-domain DKIM/SPF, twilio, push/in-app, stripe), `mkAct`/`ACT_META`, `EmailComposeModal`/`LogCallModal` (both simulated). Where the prototype simulates (all sends, push/in-app delivery, seeded stats), this spec marks it and specifies the real backend behaviour. File written to `docs/backend/sending-deliverability-api.md` is not created by this agent — this message is the file content._
