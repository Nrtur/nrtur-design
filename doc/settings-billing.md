# Settings · Billing (`settings-billing`)

## Purpose
Subscription, seats, usage, payment method, spending controls, add-ons, invoices — across **5 account states**. Component: `SettingsBillingPage` (in `SettingsShell`), driven by app-wide `BillingContext`.

## Entry points
- Settings → Billing; "Fix now" on the app-wide payment-failed banner; landing/onboarding plan selection (conceptually).

## Components & state
- `BillingContext` `{billingState,setBillingState}` (in `App`) + a dev switcher pill to flip states: **active / trial / trial-expired / cancelled / payment-failed**.
- `SettingsBillingPage` — cycle toggle (`BillingCycleToggle`), seats (`BILLING_SEATS`), cost breakdown, usage meters, spending caps (`spendCap`, `autoRecharge`), billing alerts, add-ons, danger zone (cancel via `useConfirm`).
- Helpers: `BillingPlanCards`, `BillingCardVisual`, `BillingInvoiceHistory`, `StripePayNotice`, `BILLING_PLANS`, `BILLING_INVOICES`, `BILLING_CARD`/`BILLING_EYE` styles.

## States (what each shows)
- **active** — current plan, cycle toggle, seats, cost breakdown, usage, payment method, spending controls, alerts, add-ons, invoices, danger zone.
- **trial** — days-left banner + plan picker.
- **trial-expired** — read-only banner + data-preservation card + "pick a plan" + Stripe pay notice.
- **cancelled** — access-ends banner + reactivate.
- **payment-failed** — red alert + fix card; also app-wide topbar banner.

## Step-by-step flows
**Change plan/cycle:** toggle monthly/annual; Manage plan; add/remove seats; add-ons toggle.
**Restore/cancel:** trial-expired → Restore access; danger zone → Cancel (confirm) → state → `cancelled`.
**Payment:** Stripe hand-off notice (no card entered in-app).

## Limitations
- No real Stripe/billing; states are switched manually via the dev pill; numbers are static.

## Suggestions
1. Real billing provider (Stripe) — checkout, webhooks drive `billingState`, proration on seat/plan changes.
2. Usage metering from real counts; enforce caps/auto-recharge.
3. Dunning emails + in-app reminders for payment-failed; grace periods.
4. Invoice PDFs, tax/VAT, multiple payment methods.

## Related
[landing.md](landing.md) · [settings-team.md](settings-team.md) · [00-system-overview.md](00-system-overview.md)