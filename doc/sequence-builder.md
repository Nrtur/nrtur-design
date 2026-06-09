# Sequence builder (`sms-sequence-builder`, `email-sequence-builder`)

## Purpose
Build a timed **drip sequence** of messages (SMS or Email) with delays and exit rules. One component, `SequenceBuilderPage`, with a `channel` prop (`'sms'` | `'email'`).

## Entry points
- Settings → Sequences → "New SMS/Email sequence"; a template's "Use in sequence →".

## Components & state
- `SequenceBuilderPage({channel,goTo})` — enroll trigger, ordered **message steps + delays**, exit-on-reply toggle, Test / Save / Activate. Renders SMS vs Email affordances based on `channel`.
- Data: `SEQ_DATA` (SMS), `EMAIL_SEQ_DATA`, `SMS_TEMPLATES`, `EMAIL_TEMPLATES`, `SMS_VARS`.

## Use cases
- Create a multi-step drip (e.g., Day 0 intro → Day 2 follow-up → Day 5 break-up), insert variables/templates, stop on reply, test, activate.

## Step-by-step flow
1. Set the enroll trigger → add message steps, each with a delay → choose/insert a template + variables.
2. Toggle "exit on reply" / other exit rules.
3. Test (preview) → Save → Activate → back to Settings → Sequences.

## Limitations
- Doesn't actually send/schedule; templates and steps are static samples. No analytics wired to real sends.

## Suggestions
1. Real scheduler that sends via the connected mailbox/SMS provider, respecting delays, business hours, and time zones.
2. A/B steps, branch on open/click/reply, goal completion → auto-exit.
3. Per-step analytics (delivered/open/click/reply) feeding the Sequences list.
4. Enforce DNC/unsubscribe + frequency caps before each send.
5. Shared template library with variables validated against contact fields.

## Related
[settings-sequences.md](settings-sequences.md) · [automation-builder.md](automation-builder.md) · [inbox.md](inbox.md)