# Sign up (`signup`)

## Purpose
Create a workspace/account. Component: `SignUpPage` — two-column: left testimonials/social-proof panel (`TESTI`), right the signup form. Dark (outside `.app-shell`).

## Entry points
- Landing CTAs ("Get started free" / "Start free trial").
- "Create account" link on `signin`.

## Components & data
- `SignUpPage({goTo})`, `GlowBg`, `TESTI` testimonials. Form fields (name, work email, password) + social sign-up buttons (Google etc., visual only).

## Use cases
- Sign up with email/password or a social provider.
- Jump to sign in if already a member.

## Step-by-step flow
1. Enter details (or click a social button).
2. Submit → `goTo('onboarding-1')` (begins setup).
3. "Sign in" link → `goTo('signin')`.

## Limitations
- No validation/auth; submit just navigates. Social buttons are decorative.

## Suggestions
1. Real validation (email format, password strength meter) + inline errors.
2. Actual auth (email verification, OAuth) — see [email-providers.md](email-providers.md) for the OAuth pattern.
3. Carry the plan chosen on landing into onboarding/billing.
4. Captcha / bot protection; T&C + privacy consent checkboxes.
5. SSO option for Business plan.

## Related
[landing.md](landing.md) · [signin.md](signin.md) · [onboarding.md](onboarding.md)