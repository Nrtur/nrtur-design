# Edit contact (`edit-contact`)

## Purpose
Edit an existing contact's fields. Component: `EditContactPage` (mirrors the add-contact form, pre-filled).

## Entry points
- Edit action from `contact-detail`.

## Components & state
- `EditContactPage({goTo})` — form pre-populated from the current contact; Save returns to `contact-detail`.

## Step-by-step flow
1. Open with fields pre-filled → change values → Save → `goTo('contact-detail')` (+ toast).
2. Cancel → back to detail.

## Limitations
- Edits aren't persisted to a store; returns to the same static record.

## Suggestions
1. Persist edits to the real record; optimistic update + rollback on error.
2. Field-level change tracking (audit log) and "unsaved changes" guard.
3. Inline editing on `contact-detail` could replace a separate page for most fields.

## Related
[contact-detail.md](contact-detail.md) · [add-contact.md](add-contact.md)