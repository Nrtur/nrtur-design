# Settings · Team (`settings-team`)

## Purpose
Manage workspace members, roles, and invites; view an activity audit log. Component: `SettingsTeamPage` (in `SettingsShell`).

## Entry points
- Settings → Team; onboarding "Invite team" (conceptually).

## Components & state
- `SettingsTeamPage` — `inviteModal`, `useConfirm`. `members` list (`{name,email,role,avatar,color,status}`; roles Admin/Member). Activity audit log section.

## Use cases
- See members + roles + status; invite new members; change role; remove member (confirm); review who did what.

## Step-by-step flows
**Invite:** "Invite" → invite modal (email + role) → send (toast).
**Manage:** change a member's role; remove (confirm dialog).
**Audit:** scroll the activity log.

## Limitations
- Members are static; invites aren't sent; role changes/removals don't persist; audit log is sample data.

## Suggestions
1. Real invites (email + accept flow) and pending-invite states.
2. Enforce RBAC across the app from roles defined here (gate edit/delete/billing).
3. Seat sync with Billing (adding a member consumes/charges a seat).
4. SSO/SCIM provisioning for Business; per-member last-active + deactivate.
5. Real audit log fed by app events with filters/export.

## Related
[settings-billing.md](settings-billing.md) · [profile.md](profile.md) · [00-system-overview.md](00-system-overview.md)