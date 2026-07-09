# Forgot password (`forgot-password`)

## Purpose
Request a password-reset link. Component: `ForgotPasswordPage` with a local `sent` state that swaps the form for a "check your email" confirmation.

## Entry points
- "Forgot password?" on `signin`.

## Components & data
- `ForgotPasswordPage({goTo})`, `GlowBg`, `sent` boolean. Single email field.

## Step-by-step flow
1. Enter email → submit → `setSent(true)`.
2. Confirmation view: "We've sent a reset link…" + resend option.
3. "Back to sign in" → `goTo('signin')`.

## Limitations
- No email is sent; `sent` just toggles the UI.

## Suggestions
1. Real reset-token email flow + a reset-password page (token in URL).
2. Resend cooldown + masked email display.
3. Generic success message regardless of whether the email exists (anti-enumeration).

## Related
[signin.md](signin.md)