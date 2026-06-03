# Settings · Integrations (`settings-integrations`)

## Purpose
Connect third-party tools (email, Slack, Zapier, Stripe, HubSpot), SMS providers (Twilio/Vonage), and manage the API key. Component: `SettingsIntegrationsPage` (in `SettingsShell`).

## Entry points
- Settings → Integrations; Inbox rail "Connect account"; SMS tab "Configure SMS"; onboarding step 3.

## Components & state
- `SettingsIntegrationsPage` — `connected` (slack/zapier/stripe/hubspot toggles), `MailAccountsContext` (for the email/Gmail card), `gmailModal`/`twilioModal`/`vonageModal`, API key reveal/copy/rotate.
- `INTEGRATIONS` cards; the **Gmail card** is special-cased: "Connect account" → `GmailConnectModal`, lists connected mailboxes with **Remove**.
- SMS providers (`SMS_PROVIDERS`): Twilio/Vonage "Connect" → `TwilioSetupModal`/`VonageSetupModal` (3-step credential setup).
- API Keys panel: masked key, reveal eye, copy, rotate, metadata.

## Use cases
- Connect/disconnect a mailbox (currently Gmail); toggle other app integrations; set up SMS provider credentials; reveal/copy/rotate the API key.

## Step-by-step flows
**Email:** Gmail card "Connect account" → `GmailConnectModal` → connected mailboxes appear (shared with Inbox via `MailAccountsContext`); Remove disconnects.
**SMS:** Twilio/Vonage "Connect" → setup modal (credentials, phone numbers) → connected.
**API key:** reveal → copy → rotate (red).

## Limitations
- Only **Gmail** is modeled for email; other integration toggles are cosmetic; SMS setup and API key are mocked.

## Suggestions
1. **Multiple mailbox providers** (Gmail, Microsoft 365/Outlook, IMAP/SMTP business email, Yahoo/iCloud) — see [email-providers.md](email-providers.md); rename the card to "Email accounts".
2. Real OAuth/credential flows + connection health + reconnect on token expiry.
3. Per-integration settings pages; webhooks; scoped API keys + usage logs.
4. Calendar provider connect here too (shared OAuth).

## Related
[email-providers.md](email-providers.md) · [inbox.md](inbox.md) · [calendar.md](calendar.md)