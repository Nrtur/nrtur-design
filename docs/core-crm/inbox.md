# Module 16 — Inbox

_Component: `InboxPage` (line 9782) · Route: `inbox`_

---

## 16.1 Inbox Thread List (Left Panel)

### Surface inventory

| Element | What it is |
|---|---|
| App sidebar | Standard `AppSidebar` with `active="inbox"` |
| Channel tab rail | `InboxChannelTabs`: All / Email / SMS / Calls inline; MMS / Push / In-app in "More" dropdown |
| Email folder sidebar | Inbox / Starred / Drafts / Sent / Archived / Trash — `MAIL_FOLDERS` |
| Email labels sidebar | Color-coded labels: Active Deals / Cold Leads / Customers / Follow-up — `MAIL_LABELS` |
| Compose button | Opens `EmailComposeModal` (Module 12.5) |
| Email filter chips | All / Unread / With deals / Needs reply |
| AI sort indicator | "AI sort" badge — placeholder stub; no logic |
| Unread count | "{N} unread" beside folder name |
| Thread row (`EmailListItem`) | Avatar · sender · subject · preview · time · unread dot · star · attachment icon · deal chip |
| Empty state | "No emails in this view." |
| Inbox-zero nudge | "Inbox zero by Friday — keep going." at list bottom |
| SMS conversation list | Left-panel list of SMS threads; contact avatar + name + preview + time + unread indicator |
| MMS conversation list | Left-panel list of MMS threads; last media thumbnail + contact + preview |
| Calls list | Incoming/outgoing call log entries |

### Channel tab constants

| Tab key | Label | Channel |
|---|---|---|
| `all` | All | Unified feed (email + SMS + MMS + push + in-app) |
| `email` | Email | Email threads only |
| `sms` | SMS | SMS text conversations |
| `mms` | MMS | Media message conversations |
| `push` | Push | Push notification history |
| `inapp` | In-app | In-app notification history |
| `calls` | Calls | Call log |

Primary (always visible in rail): `all`, `email`, `sms`, `calls`. Secondary (in "More" dropdown): `mms`, `push`, `inapp`.

### `MAIL_FOLDERS` — 6 email folders

| Key | Label | Count |
|---|---|---|
| `inbox` | Inbox | 24 |
| `starred` | Starred | 8 |
| `drafts` | Drafts | 2 |
| `sent` | Sent | — |
| `archived` | Archived | — |
| `trash` | Trash | — |

### `MAIL_LABELS` — 4 user labels

| Key | Label | Color |
|---|---|---|
| `active` | Active Deals | `#34d399` |
| `cold` | Cold Leads | `#94a3b8` |
| `customers` | Customers | `#818cf8` |
| `follow-up` | Follow-up | `#fbbf24` |

### Email object shape

```
{
  id: number,
  unread: boolean,
  starred: boolean,
  attach: boolean,
  folder: string,           // 'inbox' (default)
  from: string,             // display name
  fromShort: string,        // abbreviated name
  avatar: string,           // initials
  color: string,            // hex avatar bg
  subject: string,
  preview: string,          // first-line snippet
  time: string,             // relative time
  date: string,
  labelKey?: string,        // label key from MAIL_LABELS
  linkedDeal?: {            // CRM deal link
    name, value, stage, stageColor
  },
  contact?: {               // CRM contact context card
    name, title, avatar, color
  },
  thread: [{                // message history
    from, addr, avatar, color, date,
    body: string[],         // paragraphs
    attachments?: [{ name, size }]
  }]
}
```

### Filter chip logic

- **All** — all emails in current folder
- **Unread** — `e.unread === true`
- **With deals** — `!!e.linkedDeal`
- **Needs reply** — `e.unread && !e.automation` (unread, not auto-handled)

---

### Design decisions

| Decision | Alternative | Why this | Tradeoff |
|---|---|---|---|
| Unified inbox with channel tabs (email + SMS + calls on one page) | Separate pages per channel | Reps don't switch tools mid-conversation; a contact might send an SMS reply after an email — the unified view shows both in context | 7 channels in one component means the left panel must render completely different list types (email threads, SMS conversations, call logs) depending on tab — high complexity, slow to maintain |
| Primary channels inline, secondary in "More" dropdown | All channels always visible | Most reps use Email + SMS + Calls; MMS, Push, and In-app are lower-frequency; hiding them reduces cognitive load without removing them | A rep who primarily works in MMS (e.g. media sharing) must click "More" every time — the "More" dropdown doesn't persist the last selection across sessions in the prototype |
| Filter chips (All / Unread / With deals / Needs reply) | Full-filter panel | 4 chips cover 90% of inbox triage use cases quickly; no drawer or modal needed | "Needs reply" is defined as `unread && !e.automation` — this misidentifies emails where the automation handled it but a human follow-up is still needed; the definition is imprecise |

---

### Frontend — what needs to be built

- `InboxPage` state: `tab`, `folder`, `emails`, `selectedId`, `composeOpen`
- `InboxChannelTabs`: primary tabs inline; secondary in `AnchoredMenu` dropdown
- `EmailListPane`: filter chips (`chip` state) + unread count + sort/mark-all header + `EmailListItem` list
- `EmailListItem`: avatar, sender, subject, preview, time, unread dot, star toggle, attachment icon, deal pill
- `emailInFolder(e, folder)`: determines if email matches current folder (`starred` → `e.starred`; `trash` → `e.deleted`; `archived` → `e.archived`; `inbox` → all others)
- SMS conversation list: `SMS_CONVOS` with contact avatar + last message preview + unread indicator
- MMS conversation list: `MMS_CONVOS` with last media thumbnail

### Backend — what needs to be provided

- `GET /inbox/emails?folder=&filter=&search=&page=` → paginated email threads
- `GET /inbox/sms?search=&page=` → paginated SMS conversations
- `PATCH /inbox/emails/:id { starred, folder, unread }` — move/star/mark read
- `DELETE /inbox/emails/:id` → move to trash
- Gmail/Outlook webhook: push new emails to `POST /inbox/ingest` (or pull via polling every 30s)
- Twilio webhook: `POST /inbox/sms/ingest` for incoming SMS
- Unread counts: `GET /inbox/counts` → `{ inbox: 24, starred: 8, ... }` for sidebar badges

---

## 16.2 Thread View (Right Panel)

### Surface inventory

| Element | What it is |
|---|---|
| Thread header | Subject · folder breadcrumb · contact context card link |
| Contact/deal context card | Contact avatar + name + title + deal name/stage/value; links to contact detail |
| Action bar | Reply · Forward · Archive · Delete · Snooze · Star · Label picker |
| Thread body | Chronological messages; each message: sender avatar + name + email address + date + body paragraphs + attachment chips |
| Last message expanded | Full body visible; earlier messages collapsed |
| `EmailReplyComposer` | Bottom-docked reply bar: To/Cc field + body + send + template + schedule |
| Forward mode | `replyTarget === 'forward'` — To field required |
| Attachment chips | File name + size; download stub |
| SMS thread view | Bubble chat layout; me=right, contact=left; timestamp per message group |
| MMS thread view | Same as SMS but with media thumbnails; image tap opens `MmsGalleryModal` |
| `MmsGalleryModal` | 3–4 column image grid + files list; esc to close |

### `MmsGalleryModal` — shared media viewer

`MmsGalleryModal` (line 9747) shows all media shared in an MMS conversation. Two sections:
- **Images/video grid**: `media.filter(m => m.type !== 'file')` — 3–4 column `aspect-square` thumbnails via `MmsThumb`
- **Files list**: `media.filter(m => m.type === 'file')` — icon + name + size rows

---

### Design decisions

| Decision | Alternative | Why this | Tradeoff |
|---|---|---|---|
| Contact/deal context card in the thread header | Context only in the CRM sidebar | The rep can see who they're talking to (job title, deal stage, value) without leaving the email — context-switching is the #1 inbox productivity killer | The context card is read-only; the rep can't edit contact info from the inbox without navigating to the contact detail page |
| `EmailReplyComposer` bottom-docked (not a floating modal) | Floating compose modal (like Gmail) | Docked keeps the thread visible while typing; the rep can scroll up to re-read the conversation while composing | Docked composer takes vertical space on short screens; on mobile it can obscure the last message |
| MMS gallery shows ALL media in the conversation | Gallery shows only the selected message's attachments | Users frequently say "where's that image you sent me last week?" — a gallery of all shared media answers this without scrolling through the full conversation history | Gallery is flat (no date grouping); if the conversation has 200 shared images, the gallery is unwieldy; production needs virtual scrolling + date sections |

---

### Frontend — what needs to be built

- `EmailDetailPane(email, goTo, onArchive, onDelete, onStar, onTag, onToast, onSendReply)` — full thread rendering
- `EmailMessage({ message, isLast })` — single message in thread; last message expanded, others collapsed
- `EmailReplyComposer` — docked reply bar; template picker; schedule send; CC/BCC toggle
- SMS thread: bubble layout; `sms.messages.map(m => m.me ? rightBubble : leftBubble)`
- MMS thread: same as SMS but `m.media` renders thumbnails; click → `MmsGalleryModal`
- `MmsGalleryModal({ contact, media, onOpen, close })` — grid gallery + files list
- Archive → `setEmails(es => es.map(e => e.id === id ? {...e, folder:'archived'} : e))`
- Star → `setEmails(...)` toggle `starred`
- Label → picker from `MAIL_LABELS`

### Backend — what needs to be provided

- `POST /inbox/emails/:threadId/reply { body, cc, attachments }` — send reply via connected mailbox
- `POST /inbox/emails/:threadId/forward { to, body }` — forward
- `PATCH /inbox/emails/:threadId/archive` / `/star` / `/label`
- `GET /inbox/sms/:contactId/messages` → message history
- `POST /inbox/sms/:contactId/send { body }` → send SMS via Twilio
- `POST /inbox/sms/:contactId/media { file }` → send MMS via Twilio MMS API
- `GET /inbox/sms/:contactId/media` → all media in conversation (for gallery)

---

## 16.3 Mailbox Connect Modal (`MailboxConnectModal`)

_Lines 9023–9096 — opens from the Inbox header or Settings > Personal > My calendar connection_

### Surface inventory

| Step | What the user sees |
|---|---|
| 1. Provider picker | 6 provider cards: Gmail · Microsoft 365 · Business IMAP · Yahoo · iCloud · Other |
| 2. Account picker | Select saved account or enter custom email address |
| 3. Consent | OAuth scopes: Read/send/manage email · Read contacts · Keep in sync |
| 4. IMAP config | (non-OAuth providers) IMAP host/port + SMTP host/port + username + password + SSL toggle + "Test connection" |
| 5. Sync progress | Progress bar; "Syncing last 30 days…" — simulated with 5 increments |
| 6. Done | "Connected! {email}" success state |

### `PROVIDERS` — 6 email providers

| Key | Label | Auth |
|---|---|---|
| `gmail` | Google / Gmail | OAuth |
| `microsoft365` | Microsoft 365 / Outlook | OAuth |
| `imap` | Business email (IMAP/SMTP) | IMAP |
| `yahoo` | Yahoo Mail | OAuth |
| `icloud` | iCloud Mail | IMAP |
| `other` | Other (IMAP/SMTP) | IMAP |

### OAuth scopes requested

1. Read, send, and manage email
2. Read your contacts (for CRM matching)
3. Keep in sync (stream new mail)

---

### Design decisions

| Decision | Alternative | Why this | Tradeoff |
|---|---|---|---|
| IMAP/SMTP as a fallback for non-OAuth providers | OAuth only | Enterprise customers with custom mail servers (Exchange on-prem, custom SMTP) can't use OAuth; IMAP is the universal fallback | IMAP credentials (password stored on backend) are a security liability; password-based auth is deprecated by Google/Microsoft for consumer accounts; must use app-specific passwords for modern providers |
| "Sync last 30 days" on initial connect | Full inbox sync | 30 days covers the active deals and conversations a rep cares about now; full sync could be 10s of GB and take hours | 30-day cutoff means deals started 60 days ago have no email history in the CRM; the user may need to manually attach older threads |

---

### Frontend — what needs to be built

- 6-step state machine: `step` state: `'provider'|'pick'|'consent'|'imap'|'sync'|'done'`
- Provider cards: `PROVIDERS` + `PROVIDER_ORDER` → render cards in defined order
- IMAP form: `im` state `{ email, name, imapHost, imapPort, ssl, smtpHost, smtpPort, user, pass }`; "Test connection" button → simulated with `tested` state
- Sync progress: `useInterval` that increments `pct` from 0 to 100 in steps; auto-advances to `done`
- `onConnected(email)` callback → updates parent state to show connected mailbox in sidebar

### Backend — what needs to be provided

- `POST /integrations/gmail/connect` → start OAuth flow (redirect to Google); callback stores access + refresh tokens
- `POST /integrations/imap/connect { host, port, ssl, user, pass }` → test connection; encrypt and store credentials
- `POST /integrations/mailbox/:id/sync { from: ISODate }` → kick off historical sync job
- Sync job: fetch emails in batches; match sender email against CRM contacts by email; link to contact records
- Token refresh: background job refreshes OAuth tokens before expiry

---

## Developer Q&A

**Q: `InboxPage` manages 7 channel types in one component. How is the left panel rendered per channel?**
A: `InboxPage` uses a large conditional block — `tab === 'email'` renders `EmailListPane`; `tab === 'sms'` renders an SMS conversation list; `tab === 'mms'` renders MMS thumbnails; `tab === 'calls'` renders a calls log. Each branch is a separate sub-component. The unified "All" tab is the hardest — it must interleave emails, SMS messages, and calls sorted by timestamp into a single feed. The prototype doesn't implement a true unified feed for the "All" tab; it shows email by default.

**Q: Emails use a local `useState` array (`MAIL_EMAILS`). What happens when a new email arrives while the user is viewing the inbox?**
A: Nothing — `useState(MAIL_EMAILS)` initializes once and never updates from an external source. Real-time new emails require either: (a) WebSocket push from the backend that calls `setEmails(es => [newEmail, ...es])` on the client; (b) polling `GET /inbox/emails?since={lastFetchTimestamp}` every 30s. Production must wire `EmailComposeModal`'s `onSent` callback to append the sent email to the `sent` folder state as well.

**Q: The "Needs reply" filter is `e.unread && !e.automation`. What does `e.automation` mean?**
A: `e.automation` is a boolean flag set to `true` on seed emails that were handled by an automation (e.g. an auto-reply sequence sent a response). The intent: "don't mark as needing reply if the automation already handled it." In practice, `e.automation` is hardcoded on seed data — it doesn't dynamically update when a sequence sends a reply. Production needs: (a) an `automationRepliedAt` timestamp on the email record; (b) "Needs reply" = `unread && !automationReplied && lastMessageFrom === 'contact'`.

**Q: `MailboxConnectModal` has an IMAP step with `im.pass` stored in state. Is the password safe?**
A: In the prototype, `im.pass` lives in component state (no encryption, no masking beyond `type="password"` on the input). On the simulated connect, it's never actually sent anywhere. Production must: (a) NEVER store plaintext passwords in component state longer than the form submission; (b) send credentials over HTTPS only; (c) encrypt the stored IMAP password with AES-256-GCM using a workspace-specific key; (d) recommend app-specific passwords for Gmail/Yahoo/iCloud rather than account passwords.

**Q: The MMS gallery modal shows all media in a conversation flat. What happens with 500+ images?**
A: The prototype renders all `media` items in a single `.map()` — 500 images = 500 DOM nodes loading simultaneously. This will freeze the browser. Production needs: (a) virtual scrolling (`react-virtual` or similar); (b) lazy image loading (`loading="lazy"` on `<img>`); (c) server-side pagination `GET /inbox/sms/:contactId/media?page=&limit=30`; (d) date-grouped sections to help the user find "the image from last Tuesday."

**Q: The Inbox has email labels (`MAIL_LABELS`) but also uses folder archiving. What's the intended model — labels like Gmail or folders like Outlook?**
A: Hybrid — folders for system states (inbox, archived, trash, sent, drafts) and labels for user-defined categories (Active Deals, Follow-up). A label doesn't move an email out of the inbox; it adds a colored chip. An email can have one label AND be in the inbox simultaneously. This is the Gmail model. Production must decide: (a) one label per email (simpler) or many (more powerful); (b) whether labels sync back to Gmail as Gmail labels; (c) whether nrtur-only labels (like "Active Deals") exist only in nrtur's DB and are invisible in Gmail.
