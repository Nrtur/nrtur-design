# Contact detail (`contact-detail`)

## Purpose
Full record for one contact: profile, linked deals, an activity **timeline**, and quick actions (call, email, SMS, note). Component: `ContactDetailPage`.

## Entry points
- Click a contact row in Contacts; "View contact" from Inbox/Calendar/global search.

## Components & state
- `ContactDetailPage` reads `c = CONTACTS_DATA[0]`.
- State: `tab` (timeline filter all/…), `noteText`, `callModal`, `composeOpen`, `dnc` (Do-Not-Contact), `enriched`, `timeline` (mutable activity list seeded from `TIMELINE`).
- Actions wire to `LogCallModal`, `EmailComposeModal`, SMS composer; next-action card; enrich card; DNC toggle + banner.

## Use cases
- Review who the contact is, their deals, and history.
- Log a call / send email / send SMS / add a note — each prepends to the timeline.
- Toggle DNC (Do Not Contact); "enrich" to fill firmographic data.

## Step-by-step flows
**Log call:** Log call → `LogCallModal` → save → prepends a `call` entry to `timeline` (shows immediately) + toast.
**Email:** Send email → `EmailComposeModal` (To prefilled) → send.
**Note:** type in note box → save → prepends `note` entry.
**DNC:** toggle → banner appears; outbound actions should be blocked (see Unsubscribes).

## Limitations
- Always the same hardcoded contact. Timeline changes are in-memory. DNC banner is visual (doesn't truly block sends). Enrich is mocked.

## Suggestions
1. id-based routing so each contact shows its own record + real linked deals/emails/calls.
2. Enforce DNC/unsubscribe across email/SMS actions (block + log) — tie to [settings-unsubscribes.md](settings-unsubscribes.md).
3. Real enrichment integration (Clearbit-style) with provenance.
4. Editable fields inline; custom fields; tags; merge duplicates.
5. Pull the timeline from real email/call/SMS/automation events.

## Related
[contacts.md](contacts.md) · [edit-contact.md](edit-contact.md) · [deal-detail.md](deal-detail.md) · [inbox.md](inbox.md)