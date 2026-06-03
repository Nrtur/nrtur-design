# Settings · General (`settings-general`)

## Purpose
Workspace-level settings: name, industry, timezone, currency, language, plus workspace preferences/danger actions. Component: `SettingsGeneralPage` (in `SettingsShell`).

## Entry points
- Settings → General (default settings landing).

## Components & state
- `SettingsGeneralPage` — `useConfirm`. Fields: Workspace name, Industry, Timezone, Currency, Language (select). Preference toggles and workspace danger zone.

## Use cases
- Rename the workspace; set locale/currency/timezone/language; configure workspace defaults.

## Step-by-step flow
1. Edit fields/toggles → Save (toast).
2. Dangerous workspace actions → confirm dialog.

## Limitations
- Values are static defaults (Bloom Creative, USD, LA timezone); not persisted or applied (currency/timezone don't reformat the app).

## Suggestions
1. Persist + **apply** locale/currency/timezone across all money/date rendering (Pipeline, Reports, Billing, Calendar).
2. Workspace logo/branding (used in white-label reports add-on).
3. Default owner/assignment rules, business hours (used by sequences/automations), fiscal year.
4. Per-user vs workspace setting separation.

## Related
[profile.md](profile.md) · [settings-pipeline.md](settings-pipeline.md) · [reports.md](reports.md)