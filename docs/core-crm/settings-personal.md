# Module 23 — Settings (Personal / Per-User)

_Not gated by admin role — every user edits their own copy of these pages._

Six sub-features, one already fully documented elsewhere: **23.5 Notification Preferences** is `SettingsNotificationsPage`, covered in depth in [Module 22 §22.10](settings-workspace.md#2210-notification-defaults) as the personal half of that module's three-tier inheritance pattern (workspace default → per-user override → built-in). Not repeated here.

The other five turned up the same bug shape found repeatedly in Module 22: **a feature gets built twice, independently, and the two copies silently disagree.** It shows up twice more in this module alone (duplicate delete-account flows, duplicate calendar-connect surfaces), so this doc calls it out as one pattern rather than documenting each instance as if it were a surprise.

---

## 23.1 Profile & Account

`ProfilePage` — renders its own layout directly (not wrapped in `SettingsShell`, since it's reached via the avatar/profile menu rather than the Settings sub-nav).

| Card | What's there | Wired to anything real? |
|---|---|---|
| Identity fields | Avatar (hardcoded initials, edit-pencil button has no click handler), First/Last name, Work email, Phone, Job title, Timezone, a 3-option Language selector | No — every field is an uncontrolled input with a `defaultValue`; "Save changes" only shows a 3-second toast |
| Change password | Current/New/Confirm password fields | No — fields don't even have `value`/`onChange`, no match validation, no current-password check; "Update password" fires the same cosmetic toast |
| Two-factor authentication | Toggle, fake QR placeholder, 6-digit code input, "Verify" button | No — toggle is local state only; "Verify" has no click handler at all |
| GDPR data export | "Request data export" button, cites GDPR Article 20, promises delivery within 72 hours | No — no click handler whatsoever, not even a toast |
| Sign out | "Sign out of all devices" | **Yes** — the only genuinely wired action on the page; navigates to the landing page |
| Delete account | Danger card, single line of consequence copy | No — see 23.6, this is the weaker of two duplicate flows |

### Design decisions

| Decision | Alternative | Why this | Tradeoff |
|---|---|---|---|
| Every field on this page except Sign-out is cosmetic (no real persistence, several buttons have no handler at all) | Wire at least Save/password-change to real state, even without a backend | Fastest path to a visually complete profile page for a prototype demo | A reviewer clicking "Update password" or "Request data export" gets no feedback distinguishing "this worked" from "this button does nothing" — those two look identical from the outside, which is worse than an honest disabled state |

### Frontend / Backend

- **Frontend**: Wire Save/password-change/2FA-verify to at least local state so the page's own "Changes saved" toast means something; add a real click handler (even a stub) to the GDPR export button so it's distinguishable from a genuinely broken button
- **Backend**: `PATCH /me/profile`, `POST /me/password` (with real current-password verification), `POST /me/2fa/enable` + TOTP verification, `POST /me/data-export` (real GDPR export job)

---

## 23.2 My Calendar Connection

`SettingsCalendarPersonalPage` — the code's own comment states its scope precisely: *"Each teammate connects their OWN Google/Outlook/Apple calendar — state is local to this page and is never shared with the workspace IntegrationsContext."* 3 provider cards (Google, Outlook, Apple), each with fully independent local state — connecting is a `setTimeout`-simulated 1.1s "connecting…" delay, no API call, no context write. A "2-way sync" toggle per connected provider is local-only. Below the cards, a link to the real Calendar module's availability/event-types settings (`goTo('calendar',{tab:'eventtypes'})`) — this is the **only** real bridge to `SchedulingContext`, and it's a navigation link, not a data connection.

**Confirmed: connecting a calendar here has zero effect on `SchedulingContext`.** Availability and event types remain entirely configured within the Calendar module itself (Module 17), untouched by anything on this page.

**A second, independent copy of the same 3 providers exists** inside My Integrations (23.3) — see the pattern note below.

### Design decisions

| Decision | Alternative | Why this | Tradeoff |
|---|---|---|---|
| Calendar connection is purely cosmetic, with no link to real availability data | Have connecting a calendar actually pull busy/free time into `SchedulingContext` for real conflict-checking | No backend exists to make a real OAuth calendar sync in a static prototype | This is the single feature in the whole app where the cosmetic-connect pattern is most consequential — a "connect your calendar so we know when you're busy" feature that doesn't actually check your calendar undermines the entire pitch of the Scheduling module's availability logic |

### Frontend / Backend

- **Frontend**: If real sync is built, connecting here should populate a busy/free overlay inside `SchedAvailabilityTab` (Module 17), not just toggle a status pill on this page
- **Backend**: Real Google/Outlook/Apple Calendar OAuth + free/busy API polling, feeding into the Scheduling module's slot-generation logic

---

## 23.3 My Integrations

`SettingsMyIntegrationsPage` — a category browser (same `IntegBrowser` component the admin Integrations page uses) over 7 user-scope catalog entries plus one bespoke "My inbox sync" card.

| Integration | Connect modal | Persisted? |
|---|---|---|
| My inbox sync (email) | `MailboxConnectModal` — a real 5-step wizard (provider → OAuth pick or IMAP form → consent → simulated sync progress → done) | **Yes** — writes to `MailAccountsContext`, a genuinely shared, reactive, multi-account store also read live by the Inbox module (Module 16) |
| Google Calendar, Outlook Calendar, Apple Calendar | `GenericConnectModal` | No — local `myConns` state, resets on reload |
| Zoom, Google Meet, Microsoft Teams, Slack (personal DM) | `GenericConnectModal` | No — same local `myConns` state |

**"My inbox sync" is the one genuinely real thing on this page.** Every other connection is component-local state (`myConns`) that evaporates on page reload — a materially weaker persistence guarantee than the mailbox connections sitting right next to them in the same list, with no visual distinction between the two.

### Design decisions

| Decision | Alternative | Why this | Tradeoff |
|---|---|---|---|
| Mailbox connections use a real shared context; every other personal integration uses local component state | Give all 8 the same persistence guarantee | Email needed to be real because the Inbox module (Module 16) actually reads it; the other 7 have no downstream consumer yet, so there was nothing forcing them to be real | The page presents all 8 as equivalent "connect" cards with no visual cue that 7 of them silently forget you connected the moment you navigate away — a demo walkthrough that reconnects Zoom after refreshing looks like a bug even though it's the intended (if unfinished) behavior |

### Frontend / Backend

- **Frontend**: At minimum, persist `myConns` to localStorage so reconnecting-after-reload isn't required for every demo
- **Backend**: Real OAuth for Zoom/Meet/Teams/Slack; each should eventually feed something real (e.g. Zoom/Meet connection auto-adding a video link to booked meetings, which today is decorative)

---

## 23.4 My Preferences

`SettingsPreferencesPage` — 3 cards, 7 fields total. **Only one field, Theme, is wired to anything real.**

| Field | Wired? |
|---|---|
| Theme (Dark/Light) | **Yes** — reads and writes the real `data-theme` DOM attribute + localStorage, the same mechanism the sidebar's quick-toggle uses. The code's own comment confirms this is deliberate: *"the one preference wired to a real app mechanism."* |
| Density (Comfortable/Compact) | No — local state, no CSS effect |
| Default landing page | No — nothing reads this to redirect after sign-in |
| Date format | No — every date shown elsewhere in the app uses its own hardcoded format, independent of this setting |
| Time format (12/24-hour) | No |
| Language | No — see below |

**No three-tier inheritance here, unlike Notifications/Navigation/Dashboard.** Every non-theme field initializes to a fixed literal default; the page never reads any workspace-level "default preference" the way Notifications reads `notifWsDefault()`. This page doesn't have (and doesn't need) an admin-facing counterpart — but it also means an admin has no way to set sensible workspace-wide starting defaults for density, landing page, or date/time format the way they can for navigation, dashboards, and notifications.

**Language is a confirmed dead end.** The selector here (6 options: English US/UK, Español, Français, Deutsch, Português BR) is a second, independent copy of the 3-option language field already on `ProfilePage` (23.1) — the two don't sync, and neither does anything. There is **no i18n mechanism anywhere in the application** — no translation library, no string table, no `t()`-style function calls. Every piece of UI copy across all ~21,000 lines is an inline English string literal. Changing either language selector has zero effect on anything.

### Design decisions

| Decision | Alternative | Why this | Tradeoff |
|---|---|---|---|
| Theme is the only field with a real effect; the rest are placeholders | Build the full preference set with real effect from the start | Theme already existed as a working mechanism elsewhere (the sidebar toggle) — reusing it here was nearly free; the other 6 fields would each need new plumbing (i18n, a date-formatting utility used consistently everywhere, a real post-login redirect) | The page reads as uniformly functional — nothing visually distinguishes the one real toggle from the six decorative ones — so a user has no way to know which of their choices actually matter |
| Two independent language selectors exist (Profile's 3-option, Preferences' 6-option) with no i18n behind either | Have one language selector, or none until i18n is real | Reads as organic duplication — likely built at different times without either author checking for the other | Confusing on its own terms even before considering that neither works: two settings claiming to control the same thing, in two different places, with two different option lists |

### Frontend / Backend

- **Frontend**: Either wire Density/Date format/Time format/Landing page to real effects, or visually mark them "Coming soon" so the one working toggle (Theme) doesn't get lost among six that look identical but do nothing; consolidate the two language selectors into one
- **Backend**: Real i18n (string tables, a locale-aware date formatter used consistently) is a prerequisite for the Language field to mean anything at all — this is a much larger lift than any other item in this module

---

## 23.6 Close My Account

Two separate implementations exist for "delete my account" — the same duplicate-flow bug found in Module 22 for "delete workspace," now confirmed to recur as a pattern rather than a one-off.

| | `ProfilePage`'s "Delete account" card (23.1) | `SettingsCloseAccountPage` (dedicated page) |
|---|---|---|
| Consequences shown | One line | Four detailed bullets, including "records you own stay with the workspace, they are not deleted" |
| Owner protection | **None** — no check for whether the user is the workspace Owner | **Yes** — an Owner is fully blocked from closing their account until they transfer ownership first, with a dedicated redirect card |
| Confirmation gate | Plain Cancel/Delete, no typed confirmation | Must type the user's own email address exactly to enable the confirm button |
| On confirm | **Nothing** — no `onConfirm` callback is even passed; the dialog just closes | Fires a toast: "Account closed" (still no real state change, but at least visible feedback) |
| Button label | "Delete my account" | "Close my account" |

No reassignment-of-owned-records flow exists in either version — consistent with the stated behavior that a departing user's contacts/deals/notes simply stay attached to their name with the workspace.

### Design decisions

| Decision | Alternative | Why this | Tradeoff |
|---|---|---|---|
| Two independently-built account-closure flows exist, and the more casually-reached one (Profile page) is also the one with zero safeguards | One shared handler invoked from both entry points | Likely organic — Profile's card reads like an early placeholder that was never removed once the dedicated Close Account page was built out with the real owner-guard and typed-confirmation logic | This is a genuine risk pattern, not just an inconsistency: the *weaker* of the two flows — no owner check, no typed confirmation — is the one a user is more likely to stumble into first, since Profile is reached via the everyday avatar menu while Close Account requires navigating into Settings specifically |

### Frontend / Backend

- **Frontend**: Remove `ProfilePage`'s independent delete-account card and point its button at `SettingsCloseAccountPage`'s flow (or at minimum give it the same owner-guard and typed-confirmation gate)
- **Backend**: A real account-closure pipeline — session invalidation everywhere, ownership-transfer enforcement, and a defined policy for what "records stay with the workspace" means for reassignment/audit purposes long-term

---

## The Recurring Pattern: Duplicate, Unsynced Flows

This module alone contributes three more instances of a pattern first identified in Module 22 (two "Delete Workspace" UIs, one of them dead):

| Feature | Copy A | Copy B | Do they sync? |
|---|---|---|---|
| Delete my account | `ProfilePage` danger card (no safeguards, no-op on confirm) | `SettingsCloseAccountPage` (owner-guard, typed confirmation, toast on confirm) | No — entirely independent state and logic |
| Personal calendar connect | `SettingsCalendarPersonalPage`'s 3 provider cards | `SettingsMyIntegrationsPage`'s Calendar-category catalog cards (same 3 providers) | No — connecting via one doesn't reflect in the other's status |
| Language preference | `ProfilePage`'s 3-option selector | `SettingsPreferencesPage`'s 6-option selector | No — and neither does anything regardless |

Across both modules, five total instances of this shape have now surfaced. It's worth treating as a systemic finding rather than five unrelated bugs: **whenever this codebase needed the same user-facing capability reachable from two different navigation paths, it was built twice instead of once and shared.** Any further settings audit should specifically check for this shape before assuming a lone instance is isolated.

---

## Developer Q&A

**Q: Given the duplicate-flow pattern shows up five times now (two in Module 22, three here), what's the actual fix — more code review, or something structural?**
A: Structural. Code review would catch each instance individually, but the reason it keeps happening is that there's no single shared component for "destructive account-level action requiring confirmation" — `ConfirmModal`'s `requireText`/`onConfirm` API exists and is used well in some places (Recycle Bin, Delete Workspace's dedicated page), but nothing forces every entry point to a conceptually-same action to route through one call site. A `useDestructiveAction('delete-account')`-style hook, called from both `ProfilePage` and `SettingsCloseAccountPage`, would make it structurally impossible for the two to drift apart again.

**Q: Is it worth fixing the Language selectors before i18n actually exists, or should that wait?**
A: Wait, but consolidate to one selector now regardless. Two dead selectors are strictly worse than one dead selector — a user who changes Profile's language field, sees no effect, then finds a second, different language field in Preferences reasonably concludes the whole feature is broken rather than "not built yet." One selector, clearly labeled or placed near a "Coming soon" note, sets more accurate expectations at zero engineering cost.

**Q: My Calendar Connection doesn't feed into Scheduling's real availability logic. How big a gap is that compared to everything else in this module?**
A: The biggest one, functionally. Everything else here (password change, 2FA, GDPR export, most of My Preferences) is either low-stakes cosmetic polish or blocked on infrastructure this prototype doesn't have yet (i18n, a real backend). Calendar sync is different: the entire pitch of "connect your calendar" is conflict avoidance — if nrtur shows someone as available for a 2pm meeting because it never actually checked their real Google Calendar, that's a trust-breaking failure the moment a customer relies on it, not just an unfinished feature.

**Q: Two-factor auth has a toggle and a code input, but "Verify" does nothing. Should this be removed until it's real, or left as a visual placeholder?**
A: Depends on who sees this page. If it's still purely an internal/investor-facing prototype, leaving it as a placeholder that demonstrates the intended UX is fine. If real users can reach this page, a 2FA toggle that appears to turn on but never verifies anything is a security-adjacent claim the product isn't actually making good on — that's a higher bar than most of the cosmetic gaps in this module and worth prioritizing before any real customer-facing rollout.
