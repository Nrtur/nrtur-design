# Email providers — multi-provider mailbox connect (plan)

> **Status: design/plan, not yet built.** Today only **Gmail** is modeled. This doc specifies expanding mailbox connection to **business email, Microsoft 365 / Outlook, IMAP/SMTP, Yahoo/iCloud, and other** providers.

## Current state (in code)
- `GmailConnectModal` — 4-step simulated Google OAuth (pick account → consent/scopes → syncing → done).
- `MailAccountsContext` (`App`) — shared `{accounts, connect, disconnect}`; accounts are `{addr, initials, color}`.
- Consumed by `EmailFolderRail` ("Connected accounts" + "Connect account") and `SettingsIntegrationsPage` (Gmail card with Connect / per-account Remove).
- Inbox shows a hardcoded **"Gmail · live sync"** pill.

## Gap
Only Google. Real customers use Microsoft 365/Outlook, custom-domain business email (IMAP/SMTP), and consumer providers. The connect UI, account model, and "live sync" pill are Gmail-specific.

## Proposed model
Extend the account object with a **provider**:
```
{ addr, initials, color, provider }   // provider: 'gmail'|'microsoft365'|'outlook'|'imap'|'yahoo'|'icloud'|'other'
```
Add a `PROVIDERS` registry: `{key,label,icon,color,auth:'oauth'|'imap'}` so the UI is data-driven (badges, pill text, connect path).

## Generalize the modal: `MailboxConnectModal`
Rename/extend `GmailConnectModal` with a **first step = "Choose provider"**:
- Cards: **Google / Gmail**, **Microsoft 365 / Outlook**, **Business email (IMAP/SMTP)**, **Yahoo**, **iCloud**, **Other (IMAP)**.
- Then branch by `auth`:
  - **OAuth providers** (Gmail, Microsoft 365/Outlook, Yahoo, iCloud where supported) → reuse the existing pick → consent → syncing → done stepper, branded per provider (icon/color/scope copy).
  - **IMAP/SMTP** (business / other) → a credentials form instead of consent.

## Per-provider connect steps

### Gmail (OAuth) — exists
Pick Google account → consent (Read/send/manage email, Read contacts) → syncing → connected.

### Microsoft 365 / Outlook.com (OAuth)
Same stepper, Microsoft-branded. **Production:** Microsoft Graph OAuth, scopes `Mail.ReadWrite`, `Mail.Send`, `offline_access` (+ `Calendars.ReadWrite` if calendar sync); store refresh token.

### Business / custom-domain email (IMAP/SMTP)
Manual form: Email address · Display name · IMAP host · IMAP port · SSL/TLS · SMTP host · SMTP port · Username · Password / app-password → **Test connection** (spinner → ✓/✗) → connected. **Production:** validate by opening real IMAP/SMTP sessions; store encrypted credentials.

### Yahoo / iCloud
App-specific password (or OAuth for Yahoo). Short form: email + app password → Test → connected.

### Other / generic
IMAP/SMTP fallback (same form as Business email).

## Where it plugs in
- **Inbox rail** "Connect account" and **Integrations** "Email" card both open `MailboxConnectModal`.
- Connected-accounts lists show a **provider badge** (icon/color) per mailbox.
- Inbox status pill becomes provider-aware: "Outlook · live sync", "IMAP · synced", etc. (derive from the selected/primary account's `provider`).
- Onboarding step 3 integrations should open the same picker.

## Production architecture (all providers)
1. **Connect:** OAuth (Google/Microsoft/Yahoo) or stored IMAP/SMTP creds (business/other).
2. **Backfill:** fetch recent messages via provider API (Gmail API / Graph) or IMAP; **normalize** to the existing `MAIL_EMAILS`/`thread` shape; auto-link to contacts by address.
3. **Live sync:** push (Gmail `watch`→Pub/Sub, Graph subscriptions/webhooks) or IMAP IDLE/poll → upsert via history/delta.
4. **Send:** Gmail `messages.send` / Graph `sendMail` / SMTP, building RFC-822 MIME with `In-Reply-To`/`References` so replies thread.
5. **Mirror state:** read/archive/label/star ↔ provider labels/folders; token refresh + rate limits; new-message/sync push to client (WS/SSE).
6. **Compliance:** every outbound checks DNC + Unsubscribes ([settings-unsubscribes.md](settings-unsubscribes.md)) — block + log.

## Suggested build order (prototype)
1. Add `provider` to accounts + a `PROVIDERS` registry; render provider badges + make the pill provider-aware.
2. Add the "Choose provider" step to a renamed `MailboxConnectModal`; branch OAuth vs IMAP.
3. Build the IMAP/SMTP credentials form with a simulated "Test connection".
4. Update Integrations card copy from "Gmail" → "Email accounts" listing all connected mailboxes.

## Related
[inbox.md](inbox.md) · [settings-integrations.md](settings-integrations.md) · [calendar.md](calendar.md) · [settings-unsubscribes.md](settings-unsubscribes.md)