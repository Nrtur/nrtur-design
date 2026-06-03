# Sign in (`signin`)

## Purpose
Authenticate an existing user. Component: `SignInPage` — centered card ("Welcome back"). Dark.

## Entry points
- Landing "Sign in".
- "Sign in" link on `signup`; "Back to sign in" on `forgot-password`.

## Components & data
- `SignInPage({goTo})`, `GlowBg`. Email + password fields, social sign-in buttons, "Forgot password?" link.

## Use cases
- Sign in and enter the app.
- Recover a forgotten password.
- Create a new account instead.

## Step-by-step flow
1. Enter email/password (or social) → submit → `goTo('dashboard')`.
2. "Forgot password?" → `goTo('forgot-password')`.
3. "Create account" → `goTo('signup')`.

## Limitations
- No real authentication; submit navigates straight to the dashboard.

## Suggestions
1. Real auth + session, error states (wrong password, locked account).
2. 2FA challenge (Profile already has a 2FA toggle — wire them together).
3. "Remember me" + magic-link / passwordless option.
4. Rate limiting / lockout messaging.

## Related
[signup.md](signup.md) · [forgot-password.md](forgot-password.md) · [profile.md](profile.md)