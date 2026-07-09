# Settings · Automations (`settings-automations`)

## Purpose
Manage **workflows** (if/then automations) and view run **logs**. Component: `SettingsAutomationsPage` inside `SettingsShell`, with a stats bar and sub-tabs.

## Entry points
- Sidebar Settings → Automations (settings sub-nav).

## Components & state
- `SettingsAutomationsPage` — stats bar (active / available / runs), sub-tabs **Workflows** and **Logs**.
- Workflow rows (`AUTOS`-style data: name, trigger, active toggle, runs, success%, last run, step chips, sparkline) with Edit → `automation-builder`, active `Toggle`, and a "⋯" menu (Duplicate / Delete via `useConfirm`).
- Logs tab: filterable run log (automation, contact, status, steps, timestamp).

## Use cases
- See all workflows + health; toggle active/paused; edit; duplicate; delete.
- Audit recent runs and outcomes in Logs; export logs.

## Step-by-step flows
**Manage:** Workflows tab → toggle/Edit/⋯ a row; "New Automation" → `automation-builder`.
**Audit:** Logs tab → filter by status → review rows → Export logs (toast).

## Limitations
- Workflows/logs are sample data; toggles/edits don't persist or execute.

## Suggestions
1. Tie to a real engine (see [automation-builder.md](automation-builder.md)); live run metrics + alerting on failures.
2. Folders/tags + search for many workflows; templates gallery.
3. Per-workflow detail page with run history, errors, and retry.
4. Role-based edit permissions; change history.

## Related
[automation-builder.md](automation-builder.md) · [settings-sequences.md](settings-sequences.md)