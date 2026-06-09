# Nrtur CRM — Documentation

Per-page documentation for the Nrtur CRM prototype (`index.html`). One file per page: what it's for, how it works (step-by-step), what's mocked, and how to make it better.

> The whole app is a single static file (React + Babel via CDN, no backend). All data is hardcoded; "saving"/"sending" mutates in-memory React state only. Read **[00-system-overview.md](00-system-overview.md)** first — it covers the shared shell, routing, theming, and cross-cutting suggestions referenced by every page.

## Index

| # | Page | `page` key | Doc |
|---|------|-----------|-----|
| — | System overview | — | [00-system-overview.md](00-system-overview.md) |
| 1 | Landing | `landing` | [landing.md](landing.md) |
| 2 | Sign up | `signup` | [signup.md](signup.md) |
| 3 | Sign in | `signin` | [signin.md](signin.md) |
| 4 | Forgot password | `forgot-password` | [forgot-password.md](forgot-password.md) |
| 5 | Onboarding (5 steps) | `onboarding-1..5` | [onboarding.md](onboarding.md) |
| 6 | Dashboard | `dashboard` | [dashboard.md](dashboard.md) |
| 7 | Contacts | `contacts` | [contacts.md](contacts.md) |
| 8 | Contact detail | `contact-detail` | [contact-detail.md](contact-detail.md) |
| 9 | Add contact | `add-contact` | [add-contact.md](add-contact.md) |
| 10 | Edit contact | `edit-contact` | [edit-contact.md](edit-contact.md) |
| 11 | Pipeline | `pipeline` | [pipeline.md](pipeline.md) |
| 12 | Deal detail | `deal-detail` | [deal-detail.md](deal-detail.md) |
| 13 | Add deal | `add-deal` | [add-deal.md](add-deal.md) |
| 14 | Calendar | `calendar` | [calendar.md](calendar.md) |
| 15 | Inbox (Email/SMS/Calls) | `inbox` | [inbox.md](inbox.md) |
| 16 | Email providers (plan) | — | [email-providers.md](email-providers.md) |
| 17 | Automation builder | `automation-builder` | [automation-builder.md](automation-builder.md) |
| 18 | Sequence builder | `sms/email-sequence-builder` | [sequence-builder.md](sequence-builder.md) |
| 19 | Reports | `reports` | [reports.md](reports.md) |
| 20 | Settings · Automations | `settings-automations` | [settings-automations.md](settings-automations.md) |
| 21 | Settings · Sequences | `settings-sequences` | [settings-sequences.md](settings-sequences.md) |
| 22 | Settings · Billing | `settings-billing` | [settings-billing.md](settings-billing.md) |
| 23 | Settings · Team | `settings-team` | [settings-team.md](settings-team.md) |
| 24 | Settings · General | `settings-general` | [settings-general.md](settings-general.md) |
| 25 | Settings · Integrations | `settings-integrations` | [settings-integrations.md](settings-integrations.md) |
| 26 | Settings · Pipeline | `settings-pipeline` | [settings-pipeline.md](settings-pipeline.md) |
| 27 | Settings · Notifications | `settings-notifications` | [settings-notifications.md](settings-notifications.md) |
| 28 | Settings · Unsubscribes | `settings-unsubscribes` | [settings-unsubscribes.md](settings-unsubscribes.md) |
| 29 | Settings · Privacy | `settings-privacy` | [settings-privacy.md](settings-privacy.md) |
| 30 | Profile | `profile` | [profile.md](profile.md) |

## Legend
- **Prototype** = behaves in-memory only; resets on reload.
- **Production note** = what a real backend/integration would do.