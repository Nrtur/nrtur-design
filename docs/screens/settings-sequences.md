# Settings · Sequences (`settings-sequences`)

## Purpose
Manage **drip sequences** and reusable **templates**, split by channel. Component: `SettingsSequencesPage` in `SettingsShell` with SMS / Email channel tabs and a Sequences / Templates sub-toggle.

## Entry points
- Settings → Sequences (settings sub-nav, Communication group).

## Components & state
- `SettingsSequencesPage` — `chan` (sms/email), `subView` (list/templates). Stats cards (active sequences, messages sent, reply/open rate). Sequence rows (`SEQ_DATA`/`EMAIL_SEQ_DATA`) and template cards (`SMS_TEMPLATES`/`EMAIL_TEMPLATES`, categories `SMS_TEMPLATE_CATS`).
- "New SMS/Email sequence" → `SequenceBuilderPage`; "Use in sequence →" on a template opens the builder.

## Use cases
- Browse active sequences + performance per channel.
- Manage reusable templates (with variables/categories); start a sequence from one.

## Step-by-step flows
**Sequences:** channel tab → list → row stats; New sequence → `sms/email-sequence-builder`.
**Templates:** Templates sub-toggle → cards → "Use in sequence" → builder.

## Limitations
- Static stats/templates; nothing actually enrolls or sends.

## Suggestions
1. Real enrollment counts + per-sequence/per-step analytics from live sends.
2. Template editor with variable validation, preview, and test send.
3. Channel-aware compliance (SMS opt-in/STOP handling, email unsubscribe).
4. Clone/share templates across team; folders/search.

## Related
[sequence-builder.md](sequence-builder.md) · [settings-automations.md](settings-automations.md) · [inbox.md](inbox.md)