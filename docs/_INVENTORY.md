# nrtur CRM — Master Feature Inventory
_Built from `index.html` (21,481 lines), verified 2026-06-30_

**Status key:** ☐ not started · ◐ in progress · ☑ documented

---

## MODULE 1 — Marketing / Pre-auth Pages
_⏭ Skipped by owner — clear without docs_

---

## MODULE 2 — Onboarding (steps 1–6)
_⏭ Skipped by owner — clear without docs_

---

## MODULE 3 — Dashboard
Configurable widget grid; every widget is independently sized, configured, and removable.

| # | Feature / Screen | Status |
|---|---|---|
| 3.1 | Widget grid (layout, drag-to-resize stubs, save layout) | ☑ |
| 3.2 | Widget Library Panel (browse & add widgets) | ☑ |
| 3.3 | Widget Config Drawer (per-widget settings — date range, object, metric) | ☑ |
| 3.4 | Layout Templates Modal (preset dashboard layouts) | ☑ |

---

## MODULE 4 — Explore
Single page surfacing every feature in the product; acts as a permanent "what can I do?" map.

| # | Feature / Screen | Status |
|---|---|---|
| 4.1 | Explore page (full feature directory) | ☐ |

---

## MODULE 5 — Leads
First-class object (separate from Contacts). Lifecycle: New → Contacted → Nurturing → Qualified → Unqualified → Convert.

| # | Feature / Screen | Status |
|---|---|---|
| 5.1 | Leads list (Board/List toggle, Om filter/sort engine, Save Views) | ☑ |
| 5.2 | Lead Detail (activity timeline, properties panel, tasks, convert flow) | ☑ |
| 5.3 | Add Lead page (single-entry form) | ☑ |
| 5.4 | Convert Lead Modal → creates Contact + Company + optional Deal | ☑ |

---

## MODULE 6 — Contacts
Primary people object. Separate from Leads.

| # | Feature / Screen | Status |
|---|---|---|
| 6.1 | Contacts list (Board/List toggle, Om filter/sort engine, Save Views, bulk actions) | ☑ |
| 6.2 | Contact Detail (activity timeline, properties, linked company, tasks, email thread, SMS) | ☑ |
| 6.3 | Add Contact page (single mode + multi/spreadsheet mode) | ☑ |
| 6.4 | CSV Import Modal | ☑ |
| 6.5 | Duplicate Detection Modal (keep both / merge) | ☑ |
| 6.6 | Merge Drawer (field-by-field conflict resolution) | ☑ |
| 6.7 | Record Edit Drawer (shared inline editing panel, used across all objects) | ☑ |

---

## MODULE 7 — Companies
First-class object (not just a field on a contact). Types: Customer / Prospect / Partner / Vendor.

| # | Feature / Screen | Status |
|---|---|---|
| 7.1 | Companies list (Board/List toggle, Om filter/sort engine, Save Views) | ☑ |
| 7.2 | Company Detail (activity timeline, related contacts list, properties, tasks) | ☑ |
| 7.3 | Add Company page | ☑ |

---

## MODULE 8 — Pipeline (Deals)
Pipeline-first model: users pick a named pipeline (deals or custom-object), not an object type.

| # | Feature / Screen | Status |
|---|---|---|
| 8.1 | Pipeline page — Board view (Kanban, grouped by Stage only) | ☑ |
| 8.2 | Pipeline page — List view | ☑ |
| 8.3 | Pipeline filters & search (incl. Forecast view, OmViewMenu, CardFields) | ☑ |
| 8.4 | Edit Stages mode (inline stage rename/add/delete on the board) | ☑ |
| 8.5 | New Pipeline Modal (name + object type selector) | ☑ |
| 8.6 | Deal Detail page (activity timeline, properties, linked contacts/company) | ☑ |
| 8.7 | Add Deal page | ☑ |
| 8.8 | Deal Outcome Modal (Won / Lost confirmation + reason) | ☑ |
| 8.9 | Custom-object pipelines (object boards that re-use the same pipeline UI) | ☑ |

---

## MODULE 9 — Engage Hub
Tabbed hub (`engage` route) grouping all outbound marketing and automation tools in one place.

| # | Feature / Screen | Status |
|---|---|---|
| 9.1 | Engage Hub shell (tab nav: Sequences / Automations / Funnels / Forms / Templates / Ad Leads / Delivery rules) | ☑ |

_Sub-features are documented in Modules 10–14 below._

---

## MODULE 10 — Automations
Trigger-based, node-graph automations with a visual builder.

| # | Feature / Screen | Status |
|---|---|---|
| 10.1 | Automations list (SettingsAutomationsPage) + template browser panel | ☑ |
| 10.2 | Automation Builder (node-based canvas — triggers, actions, branches, delays) | ☑ |
| 10.3 | Automation Test Modal (dry-run simulation) | ☑ |
| 10.4 | Automation Log Modal (execution history per automation) | ☑ |
| 10.5 | Enrolled Contacts Modal (who is in this automation right now) | ☑ |
| 10.6 | Engagement Modal (open/click stats per automation) | ☑ |
| 10.7 | AI lead qualification rules (QUAL_ACTIONS: qualify / disqualify / route) | ☑ |

---

## MODULE 11 — Sequences
Time-based drip sequences. Four channels: SMS, Email, Push, In-app. Shared builder, channel-specific steps.

| # | Feature / Screen | Status |
|---|---|---|
| 11.1 | Sequences list (SettingsSequencesPage, channel sub-tabs: SMS / Email / Push / In-app) | ☑ |
| 11.2 | SMS Sequence Builder | ☑ |
| 11.3 | Email Sequence Builder | ☑ |
| 11.4 | Push Sequence Builder | ☑ |
| 11.5 | In-app Sequence Builder | ☑ |
| 11.6 | A/B step panel (SeqABPanel — split-test step variants within a sequence) | ☑ |
| 11.7 | A/B Results Modal | ☑ |

---

## MODULE 12 — Email & SMS Templates + Compose
Reusable content assets for sequences, automations, and one-off sends.

| # | Feature / Screen | Status |
|---|---|---|
| 12.1 | Email Templates list page | ☑ |
| 12.2 | Email Builder (visual drag-drop block editor, `email-builder` route) | ☑ |
| 12.3 | Email Template Edit Modal (quick name/subject/body edit) | ☑ |
| 12.4 | New Email Modal | ☑ |
| 12.5 | Email Compose Modal (one-off send from inbox or contact) | ☑ |
| 12.6 | SMS Templates list page | ☑ |
| 12.7 | SMS Template Edit Modal | ☑ |

---

## MODULE 13 — Forms
Lead-capture and data-collection forms, embeddable on external pages.

| # | Feature / Screen | Status |
|---|---|---|
| 13.1 | Forms list (SettingsFormsPage) | ☐ |
| 13.2 | Form Builder (FormBuilderPage — field canvas + embed code) | ☐ |

---

## MODULE 14 — Funnels
Landing-page / funnel builder. Separate from forms.

| # | Feature / Screen | Status |
|---|---|---|
| 14.1 | Funnels list (FunnelsPage) | ☐ |
| 14.2 | Funnel Builder (FunnelBuilderPage — page canvas) | ☐ |

---

## MODULE 15 — Ad Leads
Connect paid ad platforms (Meta, Google, TikTok, LinkedIn) to route inbound leads directly into the CRM.

| # | Feature / Screen | Status |
|---|---|---|
| 15.1 | Ad Lead Sources page (SettingsAdLeadsPage — list of connected ad accounts + routing rules) | ☐ |
| 15.2 | Ad Source Connect Modal (OAuth connect flow per platform) | ☐ |

---

## MODULE 16 — Inbox
Unified messaging inbox: email threads + SMS/MMS threads side by side.

| # | Feature / Screen | Status |
|---|---|---|
| 16.1 | Inbox thread list (left panel — email + SMS unified, filter tabs) | ☐ |
| 16.2 | Thread view (right panel — message history, reply, templates) | ☐ |
| 16.3 | Mailbox Connect Modal (Gmail / Outlook OAuth) | ☐ |
| 16.4 | MMS Gallery Modal (media attachments viewer) | ☐ |
| 16.5 | Email Compose Modal (also in Module 12 — same component) | ☐ |

---

## MODULE 17 — Calendar
Scheduling hub: personal calendar view + booking links + event type setup.

| # | Feature / Screen | Status |
|---|---|---|
| 17.1 | Calendar view (Schedule / Week / Month tab group) | ☐ |
| 17.2 | Bookings tab (upcoming booked meetings) | ☐ |
| 17.3 | Event types & availability tab (define booking link types + hours) | ☐ |

---

## MODULE 18 — Tasks
Standalone task manager; tasks also surface on contact/deal/lead detail pages.

| # | Feature / Screen | Status |
|---|---|---|
| 18.1 | Tasks list page (filters: due date, assignee, object, priority) | ☐ |

---

## MODULE 19 — Reports
Built-in analytics + custom report builder. No external BI tool needed.

| # | Feature / Screen | Status |
|---|---|---|
| 19.1 | Reports page (preset charts: revenue over time, win rate, activity, team) | ☐ |
| 19.2 | Custom report builder (choose object + metric + grouping) | ☐ |

---

## MODULE 20 — Payments & Invoicing
Stripe-first invoicing and subscription management. Simulated in the prototype.

| # | Feature / Screen | Status |
|---|---|---|
| 20.1 | Overview tab (revenue metrics, recent transactions) | ☐ |
| 20.2 | Invoices tab (list, create, send, pay) | ☐ |
| 20.3 | Products tab (product/service catalog) | ☐ |
| 20.4 | Payment Links tab | ☐ |
| 20.5 | Subscriptions tab | ☐ |

---

## MODULE 21 — Custom Objects
User-defined record types. Builder at settings; generic list + detail pages for any object.

| # | Feature / Screen | Status |
|---|---|---|
| 21.1 | Custom Object List page (CustomObjectListPage — reuses Om filter/sort engine) | ☐ |
| 21.2 | Custom Record Detail page (CustomRecordDetailPage — CoProperties + CoLinksPanel + ActivityTimeline + RecordTasks) | ☐ |
| 21.3 | Custom Object Editor (SettingsCustomObjectsPage — field builder via NewPropertyDrawer + relationship editor via CoRelForm) | ☐ |
| 21.4 | Custom objects in global search + More-drawer nav + pipelines | ☐ |

---

## MODULE 22 — Settings (Workspace / Admin-gated)
Shown to all roles but editable only by admins. Non-admins see a read-only view.

| # | Feature / Screen | Status |
|---|---|---|
| 22.1 | General (workspace name, timezone, date format, logo) | ☐ |
| 22.2 | Custom fields / Properties (per-object field definitions) | ☐ |
| 22.3 | Team (invite / remove team members, roles) | ☐ |
| 22.4 | Permissions (role definitions — which objects + actions each role can do) | ☐ |
| 22.5 | Permission Matrix (grid: all roles × all object-actions, sticky headers) | ☐ |
| 22.6 | Billing (plan, seats, payment method, invoices) | ☐ |
| 22.7 | Tags (global tag list, usage counts, merge tags) | ☐ |
| 22.8 | Statuses (custom statuses per object) | ☐ |
| 22.9 | Duplicates (duplicate detection rules + merge UI) | ☐ |
| 22.10 | Notification defaults (workspace-level defaults per notification type) | ☐ |
| 22.11 | Tasks & reminders (default due times, reminder behavior) | ☐ |
| 22.12 | Suppression list / Unsubscribes (email send suppression) | ☐ |
| 22.13 | Frequency cap (max sends per contact per time window) | ☐ |
| 22.14 | Re-engagement (automatic win-back sequences for dormant contacts) | ☐ |
| 22.15 | Integrations (workspace-wide: Stripe OAuth, Twilio, Vonage, etc.) | ☐ |
| 22.16 | Privacy & data retention (GDPR-adjacent field + retention policies) | ☐ |
| 22.17 | Navigation customization (reorder/hide sidebar nav items) | ☐ |
| 22.18 | Dashboard customization (default widget templates for the workspace) | ☐ |
| 22.19 | Record Layouts (configure which fields show on detail pages) | ☐ |
| 22.20 | List Views (default columns per object list) | ☐ |
| 22.21 | Branding (custom colors, logo for workspace) | ☐ |
| 22.22 | White-label (custom domain, remove nrtur branding) | ☐ |
| 22.23 | Themes & display (global theme presets) | ☐ |
| 22.24 | Custom Objects builder (create/edit/delete custom object types) | ☐ |
| 22.25 | Import data (CSV upload + field mapping) | ☐ |
| 22.26 | Export data (per-object CSV export) | ☐ |
| 22.27 | Recycle bin (restore soft-deleted records) | ☐ |
| 22.28 | Delete workspace (hard delete with confirmation text gate) | ☐ |

---

## MODULE 23 — Settings (Personal / Per-user)
Each user's own preferences; not gated by admin role.

| # | Feature / Screen | Status |
|---|---|---|
| 23.1 | Profile & Account page (name, email, avatar, password change) | ☐ |
| 23.2 | My calendar connection (personal Google/Outlook calendar OAuth) | ☐ |
| 23.3 | My integrations (personal integration connections) | ☐ |
| 23.4 | My preferences (language, date format, density) | ☐ |
| 23.5 | Notification preferences (per-channel: email / push / in-app) | ☐ |
| 23.6 | Close my account (self-service offboarding) | ☐ |

---

## MODULE 24 — Global UI / Shared Components
These are not standalone pages but cross-cutting components used everywhere.

| # | Component | Status |
|---|---|---|
| 24.1 | App Sidebar (nav logo, quick-add +, pinned nav items, More drawer, bell, theme toggle, settings, profile avatar) | ☐ |
| 24.2 | Mobile nav (bottom tab bar on ≤768px, hamburger + full-screen drawer) | ☐ |
| 24.3 | Global Search Overlay (search icon or Cmd+F — contacts, leads, companies, deals, custom records, pages, settings) | ☐ |
| 24.4 | Command Palette (Cmd+K — jump-to-page + quick actions) | ☐ |
| 24.5 | Notifications Drawer (bell icon — unread count, per-notification routing) | ☐ |
| 24.6 | Quick Add Menu (+ button — add contact / lead / company / deal / task) | ☐ |
| 24.7 | Add Record Drawer (inline add from the + menu without navigating away) | ☐ |
| 24.8 | Light / Dark theme (data-theme toggle, CSS var system, dark unchanged currently) | ☐ |
| 24.9 | Role Preview banner (admin can impersonate any role to test permissions) | ☐ |
| 24.10 | Activity Timeline (shared across Contact / Lead / Company / Deal / Custom Record detail pages) | ☐ |
| 24.11 | Object Manager filter/sort engine (Om*) — shared by Contacts, Leads, Companies, Custom Objects | ☐ |
| 24.12 | Save Views Modal (name + scope: personal vs team) | ☐ |
| 24.13 | Nav More Drawer + Nav Customize Drawer (overflow nav items + drag-to-reorder) | ☐ |
| 24.14 | NrturMark (brand logo component — SVG mark used in sidebar + sign-up left panel) | ☐ |
| 24.15 | Billing state banner (payment-failed warning bar shown across the app) | ☐ |

---

## Totals
- **Modules:** 24
- **Features / Screens:** ~120
- **☐ not started:** ~78
- **◐ in progress:** 0
- **☑ documented:** 49 (Module 3: 4 · Module 5: 4 · Module 6: 7 · Module 7: 3 · Module 8: 9 · Module 9: 1 · Module 10: 7 · Module 11: 7 · Module 12: 7)

_Note: `doc/` folder contains older per-feature docs (pre-Leads/Payments/Custom Objects). They are not counted here — they need to be audited against current code before being trusted._
