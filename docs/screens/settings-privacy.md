# Settings · Privacy & Data (`settings-privacy`)

## Purpose
Data governance: export workspace data, set retention, and delete the account/workspace. Component: `SettingsPrivacyPage` (in `SettingsShell`).

## Entry points
- Settings → Privacy.

## Components & state
- `SettingsPrivacyPage` — `useConfirm`; `retention` select (`RETENTIONS`: 6 months … Forever); export card; account-deletion danger zone.

## Use cases
- Export all workspace data; choose a data-retention period; delete the workspace (confirm).

## Step-by-step flow
1. Export workspace data → (stub) toast/download.
2. Pick retention period → Save.
3. Danger zone: delete account → confirm dialog.

## Limitations
- Export is a stub; retention isn't enforced; deletion is mocked.

## Suggestions
1. Real export (async job → downloadable archive) and per-record GDPR data-subject export/erasure.
2. Enforce retention (auto-purge old activity) with audit + legal-hold exceptions.
3. Deletion flow with grace period, confirmation email, and irreversible final step.
4. Consent records + data-processing log; region/residency settings.

## Related
[settings-unsubscribes.md](settings-unsubscribes.md) · [settings-general.md](settings-general.md)