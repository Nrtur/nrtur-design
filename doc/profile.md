# Profile (`profile`)

## Purpose
Personal account settings for the signed-in user: identity, password, and 2FA. Component: `ProfilePage` (full app shell; not a `settings-*` sub-page).

## Entry points
- Sidebar profile avatar (bottom of the rail).

## Components & state
- `ProfilePage({goTo})` — `saved` (save confirmation flash), `tfa` (two-factor toggle), `handleSave`. Profile fields (name, email, avatar), password change, **2FA** card.

## Use cases
- Update personal details/avatar; change password; enable/disable 2FA.

## Step-by-step flow
1. Edit fields → Save → `saved` flag flashes (toast/confirmation).
2. Toggle 2FA on/off.

## Limitations
- Not persisted; password change and 2FA are visual only (no real auth backend). Avatar upload is mocked.

## Suggestions
1. Real auth: password change with current-password check, session management, device/login history.
2. **Functional 2FA** (TOTP/app, SMS, backup codes) wired to sign-in (see [signin.md](signin.md)).
3. Personal preferences (default landing page, theme already global, notification overrides, signature for email).
4. Avatar upload + crop; connected accounts (the user's own mailbox) shortcut.

## Related
[signin.md](signin.md) · [settings-team.md](settings-team.md) · [settings-notifications.md](settings-notifications.md)