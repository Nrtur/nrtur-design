# Settings · Unsubscribes (`settings-unsubscribes`)

## Purpose
Suppression list — emails that must not receive outbound mail (bounces, manual opt-outs, complaints, GDPR). Component: `SettingsUnsubscribesPage` (in `SettingsShell`).

## Entry points
- Settings → Unsubscribes.

## Components & state
- `SettingsUnsubscribesPage` — `useConfirm`, `searchQ` filter; `unsubs` (`{email,reason,date,type}` where type ∈ bounce/manual/complaint/gdpr) with colored type chips; table (`COL` grid) + export.

## Use cases
- Review/search suppressed addresses; understand why each is suppressed; export; remove an entry (confirm).

## Step-by-step flow
1. Search → filtered list.
2. Inspect type/reason/date; export CSV; remove an entry (confirm).

## Limitations
- Static sample list; suppression is **not enforced** on actual sends in Inbox/Sequences/Automations.

## Suggestions
1. **Enforce** this list everywhere outbound (Inbox compose/reply, Sequences, Automations, Contact-detail send) — block + log the attempt.
2. Auto-populate from real bounces/complaints (provider webhooks) and one-click unsubscribe links.
3. Per-channel suppression (email vs SMS STOP list) + global DNC flag on the contact (tie to [contact-detail.md](contact-detail.md)).
4. Re-subscribe with audit trail; GDPR erasure workflow link.

## Related
[contact-detail.md](contact-detail.md) · [inbox.md](inbox.md) · [settings-sequences.md](settings-sequences.md) · [settings-privacy.md](settings-privacy.md)