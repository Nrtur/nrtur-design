# Inbox (`inbox`) — Email · SMS · Calls

## Purpose
Unified communications hub with four tabs: **All**, **Email**, **SMS**, **Calls**. Component: `InboxPage`. Email is **stateful in-app** (read/archive/delete/folders, reply/forward append to thread + Sent, compose creates Sent).

## Entry points
- Sidebar Inbox; "Compose"; contact/deal "Send email/SMS"; command palette.

## Components & state
- `InboxPage` — `tab`, `folder`, `emails` (from `MAIL_EMAILS`, each given a `folder`), `selectedId`, `composeOpen`, local `showToast`; SMS state (`smsSel`, `draft`, `mms`); `logModal` for calls.
- Email handlers: mark-read on open (effect), `onStar`, `onTag`, `moveSelected` (archive→archived / delete→trash), `onSendReply` (prepend to thread + Sent copy), `onSentNew` (compose → Sent/Scheduled).
- Email components: `EmailFolderRail` (mailboxes + labels + **Connected accounts** from `MailAccountsContext` + Connect/Disconnect via `GmailConnectModal`), `EmailListPane` (folder + chip filters, derived counts), `EmailListItem`, `EmailDetailPane`, `EmailMessage`, `EmailReplyComposer` (docked), `EmailComposeModal`.
- Reply targeting (see the email spec): `mkEmailTarget(mode,msg,subject)` builds an explicit target; toolbar Reply/Forward = latest thread message; per-message Reply/Forward on each `EmailMessage`; composer carries To/Subject/quoted original.
- Data: `MAIL_FOLDERS`, `MAIL_LABELS`, `MAIL_EMAILS` (+ `thread[]`), `EMAIL_TEMPLATES`, `SMS_CONVOS`, `SMS_VARS`, `CALL_ROWS`.

## Use cases
- Triage all channels in one place (All tab) or per channel.
- Email: read threads, star/label/archive/delete, switch folders, **reply/forward** (whole-thread or a specific message), **compose** new mail, save draft, schedule send.
- SMS: pick a conversation, insert variables, send SMS/MMS.
- Calls: see missed/voicemail rows, call back, add note, add unknown numbers as contacts.

## Step-by-step flows
**Read email:** Email tab → folder rail → list (filter chips) → click → `EmailDetailPane` (marks read; CRM context strip; thread).
**Reply/Forward:** toolbar arrows (near Tag) target the latest message; or hover a message → its own Reply/Forward → docked `EmailReplyComposer` (recipient/subject/quoted) → Send → new message prepended to thread + copy in **Sent**.
**Compose:** Compose → `EmailComposeModal` (To/Cc/Bcc, subject, body, templates, attachments, schedule, AI draft) → Send → lands in **Sent** (or Scheduled).
**Connect mailbox:** rail "Connect account" or Integrations → `GmailConnectModal` (pick → consent → sync → done) → account added (shared via `MailAccountsContext`).

## Limitations
- No real mail/SMS/calls — all mocked; only **Gmail** is modeled for connect (see below). SMS/Calls tabs aren't stateful like Email. DNC/unsubscribe not enforced on send.

## Suggestions
1. **Multiple mailbox providers** (Gmail, Outlook/Microsoft 365, business IMAP/SMTP, Yahoo/iCloud) — see [email-providers.md](email-providers.md). Make the "Gmail · live sync" pill provider-aware.
2. Make SMS & Calls stateful too (send appends; log persists) and unify the All tab from real per-channel stores.
3. Enforce DNC + Unsubscribes on every outbound (block + log).
4. Threading correctness on send (In-Reply-To/References), real attachments, signatures, read receipts/open tracking.
5. Bulk actions, snooze that actually returns the item, search within mail, labels CRUD.

## Related
[email-providers.md](email-providers.md) · [settings-integrations.md](settings-integrations.md) · [settings-unsubscribes.md](settings-unsubscribes.md) · [sequence-builder.md](sequence-builder.md) · [contact-detail.md](contact-detail.md)