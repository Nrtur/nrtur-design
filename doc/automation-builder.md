# Automation builder (`automation-builder`)

## Purpose
Visual if-this-then-that **workflow** editor: a trigger plus an ordered list of action steps with a test runner. Component: `AutomationBuilderPage`.

## Entry points
- Settings → Automations → "New Automation" / Edit a workflow; some templates "Use" buttons.

## Components & state
- `AutomationBuilderPage` — `steps` (seeded from `STEP_PRESETS_A`: assign / welcome email / create task / proposal / slack / reminder / re-engage / flag …), `availableSteps`, a test-contact picker, run/preview.
- Step cards show an icon tile (type color `bg`/`fg`) + label + meta; arrows between steps.

## Use cases
- Define a trigger ("When …"), append/remove/reorder action steps, configure each, test against a sample contact, save & activate.
- Enroll contacts into a **sequence** from a workflow (the `enrollSms`/`enrollEmail` step presets link to Sequences).

## Step-by-step flow
1. Choose trigger → add steps from `availableSteps` → configure each → reorder.
2. Pick a test contact → Run/preview to see the simulated path.
3. Save / Activate → returns to Settings → Automations.

## Limitations
- Steps don't actually execute; test run is simulated. Triggers/conditions are limited. No branching.

## Suggestions
1. Real execution engine (event triggers, delays, conditions/branches, exit criteria) — production backend.
2. Conditional branches (if/else), wait-until, goal/conversion tracking.
3. More triggers (deal stage change, form submit, inbound email/SMS, date-based).
4. Versioning + per-run logs (the Logs tab already exists in Settings → Automations).
5. Guardrails: frequency caps, DNC/unsubscribe respect, quiet hours.

## Related
[settings-automations.md](settings-automations.md) · [sequence-builder.md](sequence-builder.md) · [settings-sequences.md](settings-sequences.md)