# Nrtur CRM — Product & Engineering Requirements

> **Purpose of this document.** The single-file prototype (`index.html`) is a clickable, front-end-only demo that defines the **target UI, interactions, and feature set** of Nrtur. This document translates that prototype into build-ready requirements so **frontend** and **backend** engineers can implement the real product. Every screen in the prototype maps to a feature section below; each section states what the user sees (UI), what the client does (Frontend), what the server must provide (Backend / API), and the rules that govern it (Business logic).

**Status:** Prototype reference v1 · **Date:** 2026-06-02
**Prototype file:** `index.html` (single self-contained React + Babel + Tailwind CDN page, ~509 KB)

---

## 1. Product overview

Nrtur is a **CRM for small sales/agency teams** combining contact management, a deal pipeline, multi-channel communication (email, SMS, calls), and lightweight marketing automation (workflows + drip sequences). It is positioned as an all-in-one "close the deal" tool: capture leads → work them through a pipeline → communicate across channels → automate follow-up → measure results.

### Primary personas / roles
| Role | Capabilities |
|------|--------------|
| **Owner / Admin** | Full access incl. billing, team, integrations, workspace settings |
| **Manager** | Team views, all contacts/deals, reports, automations |
| **Rep** | Own contacts/deals, inbox, sequences; no billing/team admin (Team widgets greyed out) |

### Top-level information architecture (production)
The prototype settled on **5 primary nav items** + Settings + profile avatar:

```
Sidebar
 ├─ Dashboard      (customizable widgets)
 ├─ Contacts       (smart views, import, detail)
 ├─ Pipeline       (kanban deals)
 ├─ Inbox          (unified Email / SMS / Calls tabs)
 ├─ Reports        (revenue, pipeline, activity, calls)
 ├─ [Quick-add "+"]  New contact / deal / call
 └─ Settings ▾
      ├─ Workspace:  General · Pipeline · Billing · Team
      ├─ Communication: Automations · Sequences · Notifications · Unsubscribes · Integrations
      └─ Account:    Profile · Privacy
```

---

## 2. Technology

### 2.1 Prototype stack (as-built, demo only)
- React 18.3.1 + ReactDOM + Babel Standalone 7.29.0 (in-browser JSX), Tailwind CDN v3, Google Inter font — all via CDN.
- Single `<script type="text/babel">` block; client-side routing via a `page` state string in `App()`; no real data, no network.
- **This stack is for demonstration only and must not ship to production** (no build step, no code-splitting, in-browser transpile).

### 2.2 Recommended production stack
| Layer | Recommendation | Notes |
|-------|---------------|-------|
| Frontend | React 18 + TypeScript, Vite build, React Router, TanStack Query, Tailwind | Port prototype components 1:1; replace `page` state with real routes |
| State/data | TanStack Query for server state; Zustand/Context for UI state | Prototype uses local `useState` + Context (`BillingContext`) |
| Backend | REST or GraphQL API (this doc specifies REST); Node/NestJS, Django, or Rails | Stateless, JWT/session auth |
| Database | PostgreSQL | Relational model in §13 |
| Async/jobs | Queue + scheduler (e.g. BullMQ/Sidekiq/Celery) | Required for sequences, automations, email sync, sending |
| Realtime | WebSocket / SSE | Inbox updates, notifications, sync status |
| File/object storage | S3-compatible | Attachments, CSV imports, avatars |
| Search | Postgres FTS or OpenSearch | Global search, contact filtering |

### 2.3 Third-party integrations (already represented in UI)
- **Telephony / SMS:** Twilio and Vonage (setup modals exist) — send/receive SMS, MMS, place/log calls, voicemail.
- **Email:** Gmail/IMAP two-way sync ("Gmail live-sync" pill in Inbox).
- **Notifications:** Slack (automation action "Notify Slack").
- **Billing:** Stripe (cards, invoices, plans, seats, spending caps).
- Roadmap connectors shown but not required for MVP: Calendly, Zendesk, Google Calendar, SSO.

---

## 3. Design system (shared UI contract)

These are global rules every screen inherits; implement once as shared components/tokens.

### 3.1 Visual language — dark glassmorphism
| Token | Value |
|-------|-------|
| App background | `#07070f` / `#09091a` |
| Glass surface | `bg-white/[0.03]` with `border-white/[0.06]`, `backdrop-blur` |
| Brand (primary) | `brand-500 = #6366f1` (indigo family) |
| Radius | cards `rounded-2xl`, controls `rounded-xl/lg` |
| Shadow | `shadow-brand` / `shadow-brand-lg` |
| Font | Inter |
| Motion | keyframes `fadeUp`, `glowPulse`; skeleton loaders on page load |

### 3.2 Mandatory control patterns (learned from prototype bugs — keep them)
- **Native `<select>` on dark bg** must set `style={{colorScheme:'dark', background:'#0d0d1a'}}` or option text is invisible.
- **Custom dropdown panels:** bg `#0d0d1a`, border `rgba(255,255,255,0.10)`, radius 12, shadow `0 16px 48px rgba(0,0,0,0.6)`; items `rgba(255,255,255,0.80)`, hover `rgba(99,102,241,0.10)` + white text.
- **No scroll-jacking:** focus actions use `focus({preventScroll:true})`; scroll only the local `.scroll-area`, never `scrollIntoView` that moves ancestors.

### 3.3 Shared layout components (reuse on every app page)
| Component | Responsibility |
|-----------|----------------|
| `AppSidebar` | 5 nav items + Quick-add "+" dropdown + Settings/Profile footer; highlights active page. Hosts the quick-add modal forms (see §3.6) |
| `AppTopbar` | Page title/subtitle, notifications, **app-wide billing banner** when payment failed. Search is a **compact icon button** (not a wide input) that opens `GlobalSearchOverlay`; tooltip shows the ⌘K shortcut |
| `AppFooter` | Sync/status bar |
| `SettingsShell` + `SettingsSubNav` | 230px vertical settings rail (grouped Workspace/Communication/Account) beside scrollable content |
| `GlobalSearchOverlay` / `CommandPalette` | Cross-entity search (contacts, deals, pages) |
| `NotifDropdown` | Notification feed |
| `ToastContainer` | Transient success/error toasts |
| `ConfirmModal` | Destructive-action confirmation |
| `GlowBg` | Decorative blurred orbs background |

### 3.4 Quick-add ("+") — global create actions (modals, not navigation)
The sidebar "+" opens a dropdown; **every item opens a modal form over the current page — it does NOT navigate to a separate page.** This lets a user create from anywhere without losing context. Items and the modal each reuses:

| Quick-add item | Modal | Reuses |
|----------------|-------|--------|
| New contact | `QuickContactModal` — first/last, company, title, email, phone, status | → `POST /contacts` (§6) |
| New deal | `QuickDealModal` — name, company, value, close date, stage | → `POST /deals` (§7) |
| Compose email | `EmailComposeModal` (shared with Inbox) | → `POST /emails` (§8) |
| Log a call | `LogCallModal` (shared with Contact Detail) | → `POST /calls` (§8) |
| Import contacts | `CsvImportModal` (4-step wizard) | → `POST /contacts/import` (§6.2) |

Each modal closes on **Esc**/Cancel, validates required fields (create button disabled until valid), and shows a success toast on save. **Frontend:** these modals submit to the same endpoints the full-page create flows use; on success, invalidate the relevant list query so the new record appears. The standalone `add-contact` / `add-deal` full pages still exist as routes for deep links, but the "+" uses the modals.

### 3.5 Branding
`NrturMark` renders the violet butterfly logo (embedded). Production: serve as SVG/PNG asset; use in sidebar, auth pages, onboarding, browser tab favicon/title.

### 3.6 Cross-cutting non-functional requirements
- **Loading:** every page shows a skeleton until data resolves (prototype `useSkeleton`); replace with real query loading states.
- **Empty states:** every list/widget has a designed empty state — implement them, don't show blank panels.
- **Permissions:** server enforces role; client hides/greys what the role can't use (e.g. Team widgets greyed for Rep).
- **Optimistic UI:** status changes, drag reorder, toggles update immediately then reconcile with server.
- **Accessibility:** keyboard shortcuts exist (R/E in inbox, command palette); maintain focus management and ARIA.

---

## 4. Authentication & Onboarding

**Screens:** `landing`, `signup`, `signin`, `forgot-password`, `onboarding-1..5`.

### UI
- Landing: marketing page (features, pricing tiers, testimonials).
- Sign up: two-column — left testimonials/stats, right form.
- Sign in, forgot-password: standard forms.
- **Onboarding wizard (5 steps)** with progress dots + live "being set up" dashboard preview on the right:
  1. **Workspace** — company name, industry (dropdown), team-size pills.
  2. **Pipeline** — choose a pipeline template (template cards).
  3. **Integrations** — connect email/SMS providers (toggle cards).
  4. **Invite team** — email + role rows.
  5. **Contacts** — import or add initial contacts.

### Frontend
- Validate inputs client-side; persist wizard progress between steps; allow back/skip.
- After final step → redirect to Dashboard.

### Backend / API
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/auth/signup` | Create user + workspace (tenant) |
| POST | `/auth/login` | Issue session/JWT |
| POST | `/auth/logout` | |
| POST | `/auth/forgot-password` / `/auth/reset-password` | Email reset token |
| GET/PATCH | `/onboarding` | Read/update onboarding state (resumable) |
| POST | `/workspaces` | Company name, industry, team size |
| POST | `/pipelines` (from template) | Seed default stages |
| POST | `/invites` | Bulk invite with roles |

### Business logic
- Multi-tenant: every record scoped to a `workspace_id`. New signup creates workspace + Owner user + starts a **14-day trial** (drives billing states, §11).
- Onboarding is resumable; completion flag gates first dashboard.
- Invites send email with role-scoped accept link.

---

## 5. Dashboard (customizable widgets)

**Screen:** `dashboard`. Most complex client feature.

### UI
- Grid of widgets (3-col, widgets span 1× or 2×). Default layout = 8 widgets.
- **Customize / Done** edit mode: each widget shows drag handle, gear (config), × (remove); dashed borders; HTML5 drag-reorder.
- **Widget Library panel** (320px): 6 sections, search, add widgets; Team widgets greyed for Rep role.
- **Widget config popover:** name, date range, filter, chart type, goal target → Apply.
- **Layout Templates modal:** 4 role-based templates → confirm → apply. "Reset to default."
- 25 widget definitions (`WIDGET_DEFS`): types `stat, count, bars, donut, line, activity, contacts, leaderboard, goal, actions, empty`.

### Frontend
- Persist per-user layout (widget id, position, span, config). Edit mode is local until saved.
- Each widget fetches its own data based on its config (date range/filter); reuse a `renderWidgetBody` switch by type.

### Backend / API
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET/PUT | `/dashboard/layout` | Per-user widget layout + configs |
| GET | `/dashboard/widgets/:type/data?range=&filter=` | Data for one widget |
| GET | `/dashboard/templates` | Role layout templates |

### Business logic
- Widget data respects role scoping (Rep sees own data; Manager/Owner see team).
- Goal widgets compare actual vs target; activity/leaderboard aggregate team events.

---

## 6. Contacts

**Screens:** `contacts`, `contact-detail`, `add-contact`, `edit-contact`.

### 6.1 Contacts list + Smart Views
**UI**
- **Smart Views sidebar (220px):** Default views, My views, Team views, Archived, "+ New view".
- **View Builder panel (380px slide-out):** name, color dot, visibility (Just me / Whole team), rule builder with **ALL/ANY** logic + nested groups, **live preview count**.
- Rule fields: Status, Owner, Tag, Last contacted, **Health score**, Has deal, Deal value.
- Table rows: avatar, name/company, email/phone, **status badge dropdown** (inline change), **owner dropdown** (reassign), **health dot**, last contacted, deal, tags, DNC badge.
- Toolbar: search, filters, **Export CSV**, **Import (CSV)**, add contact.
- Active-view chips above table; per-view empty states.

**Contact entity fields** (from `CONTACTS_DATA`): `id, name, company, email, phone, avatar, color, status (lead/active/hot…), owner, last_contacted, deal_value, tags[], location, lifecycle_status (cstatus: Prospect/Customer…), health_score, dnc (bool), archived (bool)`.

**Frontend**
- Rule engine (`evalRule`/`evalRules`/`matchView`) runs client-side on loaded set for preview, but **production filtering must be server-side** for large datasets (send rules as query).
- Inline status/owner changes = optimistic PATCH.

**Backend / API**
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/contacts?view=&filters=&search=&page=` | Paginated, server-side filtered/sorted |
| POST/GET/PATCH/DELETE | `/contacts[/:id]` | CRUD |
| PATCH | `/contacts/:id` | status, owner, dnc, archived, health |
| GET/POST/PATCH/DELETE | `/contact-views[/:id]` | Smart views (rules JSON, visibility, color, owner) |
| POST | `/contacts/export` | CSV export (async → download URL) |
| GET | `/contacts/count?filters=` | Live preview count for view builder |

### 6.2 CSV Import (4-step modal)
**UI:** Upload → map columns to Nrtur fields (`NRTUR_FIELDS`) → preview/validate → import summary.
**Frontend:** parse headers client-side for mapping UI; show preview rows.
**Backend:** `POST /contacts/import` (file upload) → async job: validate, dedupe, insert; return job id; `GET /imports/:id` for progress/result. Detect duplicates (see 6.3).

### 6.3 Duplicate detection
**UI:** `DuplicateDetectionModal` surfaces likely duplicates (by email/phone/name) with merge/keep options.
**Backend:** `GET /contacts/duplicates`, `POST /contacts/merge`.

### 6.4 Contact Detail
**UI**
- Header with avatar, status, owner; action buttons: **Send Email, Send SMS, Call (click-to-call), Log Call, Edit**.
- **Activity timeline** (`timeline` state) — emails, SMS, calls, notes, status changes, automation events; newest first; new logged calls/notes prepend immediately.
- **Next-action card** (suggested follow-up), **Enrich card** (data enrichment CTA), **DNC toggle + banner**.
- Linked deals, tags, custom fields.

**Backend / API**
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/contacts/:id/timeline` | Unified activity feed (paginated) |
| POST | `/contacts/:id/notes` | Add note |
| POST | `/contacts/:id/calls` | Log a call (outcome, duration, notes) |
| POST | `/contacts/:id/enrich` | Trigger enrichment |
| PATCH | `/contacts/:id` `{dnc:true}` | Sets DNC; **must block outbound SMS/calls/email** |

**Business logic**
- **DNC (Do Not Contact)** is a hard compliance gate: when set, all outbound channels are blocked server-side and contact is excluded from sequences/automations. DNC + Archived also filter list views.
- **Health score** is a computed metric (engagement recency/frequency, deal activity) — backend job recalculates; filterable.

---

## 7. Pipeline (Deals)

**Screens:** `pipeline`, `deal-detail`, `add-deal`.

### UI
- Kanban board, columns = stages (`STAGES_DATA`): Prospecting → Qualified → Proposal → Negotiation → Won (configurable in Settings → Pipeline).
- Each stage header: count + total value. Deal cards: company, value, owner avatar, tag/label, age, **score (cold/warm/hot/won)**.
- Top metrics bar (pipeline value, deltas).
- Deal detail: value, stage, owner, contact, activity, notes.

**Deal entity** (`STAGES_DATA[].deals[]`): `id, company, contact_id, value, owner, stage, tag/label, age (created_at), score`.

### Frontend
- **Drag-to-move between stages** (roadmap item in prototype — required for production); optimistic stage update.
- Stage totals recompute on move.

### Backend / API
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/deals?pipeline=&stage=` | Board data grouped by stage |
| POST/GET/PATCH/DELETE | `/deals[/:id]` | CRUD |
| PATCH | `/deals/:id` `{stage}` | Move stage (records timeline event) |
| GET/PATCH | `/pipelines/:id/stages` | Configure stages |

**Business logic**
- Moving to **Won/Lost** finalizes deal; feeds revenue reports. Stage moves can **trigger automations** (e.g. "Deal moved to Proposal").
- Deal value/currency feeds dashboard + reports aggregates.

---

## 8. Inbox (unified Email / SMS / Calls)

**Screen:** `inbox` with tabs **All / Email / SMS / Calls**.

### 8.1 Email (3-pane mailbox)
**UI**
- `EmailFolderRail` — mailboxes (Inbox/Sent/Drafts/Archive), labels, connected accounts.
- `EmailListPane` (380px) — smart chips (All/Unread/With deals/Needs reply), AI-sort, rows with deal/label/attachment chips, unread/star.
- `EmailDetailPane` — toolbar (archive/delete/snooze/star/tag/reply/forward), **CRM context strip** (linked contact + deal, "View contact"), collapsible thread (`EmailMessage`) with attachments, **reply composer**.
- Header: Gmail live-sync pill, search→global search, **Compose** (`EmailComposeModal`: To/CC/BCC, subject, body, **template picker, schedule-send, attachments**). Footer sync bar with R/E keyboard hints.

**Email entity** (`MAIL_EMAILS`): `id, unread, starred, attach, from, avatar, subject, preview, time, date, label, linked_deal, contact, thread[]`.

### 8.2 SMS
**UI:** conversation list + thread (`SMS_CONVOS`); composer with **variable tokens, segment/char counter (`SmsSegments`), MMS image attach**.

### 8.3 Calls
**UI:** call rows (`CALL_ROWS`): contact, number, time, duration, voicemail flag; actions Call back / Add note / play voicemail.

### Backend / API
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/inbox?channel=all\|email\|sms\|calls&filter=` | Unified feed |
| GET | `/emails`, `/emails/:id/thread` | Email list + thread |
| POST | `/emails` (send), `/emails/:id/reply`, `/forward` | Send; supports schedule-send, attachments, cc/bcc |
| PATCH | `/emails/:id` | read/star/archive/snooze/label |
| GET/POST | `/sms/conversations[/:id/messages]` | List / send SMS/MMS via Twilio/Vonage |
| GET/POST | `/calls` | List / log; click-to-call initiates via provider |
| POST | `/integrations/email/sync` (or webhook) | Two-way Gmail/IMAP sync |

**Business logic**
- Inbound email/SMS/call webhooks from providers create timeline + inbox items, auto-link to contact by email/phone.
- **Schedule-send** queues email for future delivery.
- All outbound respects **DNC** and **Unsubscribes** (§12) — block + log.
- Segment counter mirrors carrier billing (160/153 GSM); MMS separate.
- Realtime push of new messages/sync status via WS/SSE.

---

## 9. Automations (Workflows)

**Screens:** `settings-automations` (list, sub-tabs **Workflows / Logs**), `automation-builder`.

### UI
- **Workflows list:** cards with name, **trigger**, status badge (active / paused / error / draft), runs, success %, last run, mini sparkline; ··· menu (Duplicate / Delete-confirm); empty state; **Template picker panel** (`AUTO_TEMPLATES`).
- Stats subtitle: "N active · M paused · runs this month."
- **Builder:** trigger selector + ordered **action steps** (`STEP_PRESETS_A`): assign to rep, send email, create task, notify Slack, set reminder, flag, generate report, and **Enroll in SMS sequence / Enroll in email sequence** (these show a sequence-picker dropdown + "Manage →" link). Activate toggle, **Test** (`AutomationTestModal`), Save / Save-as-draft, Cancel (discard-confirm if dirty).
- **Logs tab:** table Automation | Contact | Status | Steps | Timestamp + filters + Export.

**Automation entity** (`AUTO_INIT`): `id, name, trigger, status, runs, success_rate, last_run, steps[] (action presets)`.

### Backend / API
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET/POST/PATCH/DELETE | `/automations[/:id]` | CRUD; status active/paused/draft |
| POST | `/automations/:id/test` | Dry-run against sample contact |
| POST | `/automations/:id/duplicate` | |
| GET | `/automation-runs?automation=&status=` | Logs (paginated, exportable) |
| GET | `/automation-templates` | Prebuilt workflows |

**Business logic**
- **Trigger model:** event-driven (contact created, deal stage changed, deal inactive N days, tag added, etc.). Backend event bus enqueues matching automations.
- Each step executes via job queue; failures set automation status `error` and log the failing step (logs show warnings).
- **Enroll-in-sequence** action is the bridge to §10: it enrolls the contact into the chosen drip sequence.
- Respect DNC/unsubscribe at send steps.

---

## 10. Sequences (SMS & Email drips) — *separate from Automations*

**Screens:** `settings-sequences` (channel tabs **SMS / Email**, sub-toggle **Sequences / Templates**), `sms-sequence-builder`, `email-sequence-builder`.

> **Conceptual distinction (enforce in product):**
> **Automation** = *who/when* (event trigger + branching logic). **Sequence** = *the multi-step timed messaging* (send → wait N days → send) on a single channel. Automations **enroll** contacts into sequences.

### UI
- Sequences list per channel: name, steps, enrolled count, sent, replied (email also: opened), active toggle, last run; "+ New sequence".
- **Templates** sub-tab per channel: reusable snippet library (`SMS_TEMPLATES` w/ categories + variables; `EMAIL_TEMPLATES`); **"Use in sequence →"** opens builder pre-loaded.
- **Sequence Builder:** enroll trigger select; ordered **message steps** each with a **Wait delay**; SMS steps show char/segment counter + variable chips (`SMS_VARS`); email steps show subject + body; **exit-on-reply** toggle; Test / Save / Activate. Breadcrumb + Save/Cancel return to Sequences.
- Tip banner cross-linking to Automations (enroll action).

**Sequence entity** (`SEQ_DATA` / `EMAIL_SEQ_DATA`): `id, name, channel, steps, enrolled, active, last_run, sent, replied, opened(email)`. Step: `{type:message, content/subject/body, wait_delay, variables}`.

### Backend / API
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET/POST/PATCH/DELETE | `/sequences[/:id]?channel=sms\|email` | CRUD; active toggle |
| GET/POST/PATCH | `/sequences/:id/steps` | Ordered steps + delays |
| POST | `/sequences/:id/enroll` `{contact_id}` | Enroll (also called by automations) |
| POST | `/sequences/:id/test` | |
| GET/POST/PATCH/DELETE | `/templates?channel=sms\|email` | Snippet library |

**Business logic**
- **Scheduler** advances each enrollment: send step → schedule next after `wait_delay`. **Exit-on-reply** removes the contact from the sequence when they respond.
- Variable interpolation (`{{first_name}}`, etc.) at send time.
- Enrollment de-dup (don't double-enroll). Respect DNC/unsubscribe; stop on unsubscribe.
- Metrics (sent/opened/replied) tracked per step + sequence.

---

## 11. Reports

**Screen:** `reports`.

### UI
- Date-range selector. KPI cards. Sections: **Revenue** (trend), **Pipeline** (stage breakdown), **Team** (leaderboard), **Top deals**, and **Calls** (made / received / missed / avg duration + per-day bars).

### Backend / API
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/reports/revenue?range=` | |
| GET | `/reports/pipeline?range=` | Stage values/counts |
| GET | `/reports/team?range=` | Per-rep performance |
| GET | `/reports/calls?range=` | Call volume + outcomes |
| GET | `/reports/deals/top?range=` | |

**Business logic:** all aggregates role-scoped and date-filtered; computed from deals, calls, activity events. Consider materialized views/rollups for performance.

---

## 12. Settings

`SettingsShell` + vertical `SettingsSubNav`, grouped: **Workspace** (General, Pipeline, Billing, Team) · **Communication** (Automations §9, Sequences §10, Notifications, Unsubscribes, Integrations) · **Account** (Profile, Privacy).

### 11/12.1 Billing — 5 states (`settings-billing`)
**UI:** state-driven via app-wide `BillingContext`. States: **trial, trial-expired, cancelled, payment-failed, active** (dev switcher pill in prototype; remove in prod).
- **Active** view adds: billing-cycle toggle (monthly/annual), plan cards, **seats** management, **cost breakdown**, **spending controls/caps**, usage **alerts**, **invoice history**, **danger zone** (cancel).
- **payment-failed** shows a **red banner app-wide in `AppTopbar`** (not just billing page) with "Fix now."

> **Payments are delegated entirely to Stripe — Nrtur never collects or stores card data.** There is **no card-entry form anywhere in the app** (no card number / CVC / expiry inputs). Where a card is needed (trial, trial-expired, payment-failed), the UI shows a `StripePayNotice` hand-off block and the action button ("Start Pro", "Restore access", "Update card and pay") opens **Stripe Checkout** (hosted) / Stripe Customer Portal. Stored-card display (`BillingCardVisual`: brand + last-4 + expiry) is **read-only data returned by Stripe**, not a form. This keeps Nrtur out of PCI scope.

**Backend / API**
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/billing` | Current state, plan, seats, usage, caps, card-on-file (brand/last4/exp from Stripe) |
| POST | `/billing/checkout-session` | Create Stripe Checkout session → return redirect URL (start/upgrade/restore) |
| POST | `/billing/portal-session` | Create Stripe Customer Portal session → return URL (update card / manage) |
| POST | `/billing/cancel` | |
| PUT | `/billing/cycle` `{monthly\|annual}` | |
| PUT | `/billing/seats`, `/billing/caps`, `/billing/alerts` | |
| GET | `/billing/invoices` | History (from Stripe) |
| Webhook | Stripe events | Source of truth: `checkout.session.completed`, `invoice.payment_failed`, `customer.subscription.updated/deleted` → drive billing state |

**Business logic:** state machine driven by **Stripe webhooks** + trial clock — the app reflects Stripe state, it does not set it directly. Card collection/updates happen on Stripe-hosted pages (Checkout / Portal); we only ever receive a `customer`/`subscription`/`payment_method` id and display metadata. `payment-failed` → grace period then suspend. Seat count gates active users; usage caps limit SMS/email spend.

### 12.2 Team (`settings-team`)
Members list, roles, invites, **activity/audit log**. API: `GET/POST/PATCH/DELETE /team/members`, `/invites`, `GET /audit-log`.

### 12.3 General (`settings-general`)
Workspace name, timezone, **language**, defaults, branding. API: `GET/PATCH /workspace/settings`.

### 12.4 Pipeline settings (`settings-pipeline`)
Configure stages (add/rename/reorder/color). API: `GET/PATCH /pipelines/:id/stages`.

### 12.5 Integrations (`settings-integrations`)
- Connect cards for providers; **Twilio** and **Vonage** setup modals (credentials, phone numbers); **API Keys** panel (reveal/copy/rotate).
- API: `GET/POST/DELETE /integrations`, `POST /integrations/twilio|vonage` (verify creds), `GET/POST /api-keys`, `POST /api-keys/:id/rotate`.

### 12.6 Notifications (`settings-notifications`)
Per-channel notification preferences (email/SMS/in-app/Slack) by event type. API: `GET/PATCH /notification-settings`.

### 12.7 Unsubscribes (`settings-unsubscribes`)
List of unsubscribed/suppressed contacts per channel. **Compliance gate** like DNC — suppresses outbound. API: `GET /unsubscribes`, `POST/DELETE /unsubscribes`.

### 12.8 Privacy (`settings-privacy`)
Data retention settings, export my data, delete account/data (GDPR). API: `GET/PATCH /privacy`, `POST /privacy/export`, `POST /privacy/delete-request`.

### 12.9 Profile (`profile`)
Personal info, avatar, password, **2FA** card. API: `GET/PATCH /me`, `POST /me/password`, `POST /me/2fa/enable|verify|disable`.

---

## 13. Data model (entities & relationships)

All entities are scoped by `workspace_id` (multi-tenant). Suggested core tables:

```
workspaces (id, name, industry, team_size, plan, billing_state, trial_ends_at, settings_json)
users (id, workspace_id, name, email, role[owner|manager|rep], avatar, twofa_enabled)
invites (id, workspace_id, email, role, status, token)

contacts (id, workspace_id, name, company, email, phone, owner_id, status,
           lifecycle_status, health_score, location, dnc, archived, created_at, last_contacted_at)
contact_tags (contact_id, tag)            -- many-to-one tags
contact_custom_fields (contact_id, key, value)
contact_views (id, workspace_id, owner_id|null, name, color, visibility, rules_json)

pipelines (id, workspace_id, name)
stages (id, pipeline_id, name, color, position)
deals (id, workspace_id, pipeline_id, stage_id, contact_id, owner_id, company,
        value, currency, score, created_at, closed_at, status)

activities (id, workspace_id, contact_id, deal_id|null, type[email|sms|call|note|status|automation],
             actor_id, payload_json, created_at)   -- powers timeline + reports

emails (id, workspace_id, thread_id, contact_id, deal_id, direction, from, to, cc, bcc,
         subject, body, status[draft|scheduled|sent|received], scheduled_at, labels, starred, read)
email_attachments (id, email_id, url, name, size)
sms_messages (id, workspace_id, conversation_id, contact_id, direction, body, segments, media_url, status)
calls (id, workspace_id, contact_id, direction, number, duration, outcome, voicemail_url, notes, created_at)

automations (id, workspace_id, name, trigger_json, status, created_by)
automation_steps (id, automation_id, position, action_type, config_json)
automation_runs (id, automation_id, contact_id, status, steps_json, started_at, finished_at, error)

sequences (id, workspace_id, channel[sms|email], name, enroll_trigger_json, exit_on_reply, active)
sequence_steps (id, sequence_id, position, subject, body, wait_delay)
sequence_enrollments (id, sequence_id, contact_id, current_step, status, enrolled_at, next_run_at)
templates (id, workspace_id, channel, category, name, subject, body, variables_json)

unsubscribes (id, workspace_id, contact_id, channel, reason, created_at)
notification_settings (user_id, event_type, channels_json)
api_keys (id, workspace_id, name, hashed_key, last_used_at)
integrations (id, workspace_id, provider, status, credentials_encrypted)
billing_invoices (id, workspace_id, amount, status, period, pdf_url)
audit_log (id, workspace_id, actor_id, action, target, created_at)
dashboard_layouts (user_id, widgets_json)
```

Key relationships: contact 1—* deals, 1—* activities, 1—* emails/sms/calls; pipeline 1—* stages 1—* deals; automation 1—* steps & runs; sequence 1—* steps & enrollments; workspace 1—* everything.

---

## 14. Cross-cutting business rules (must-enforce, server-side)

1. **Tenant isolation:** every query filtered by `workspace_id`; never trust client.
2. **Role authorization:** enforce per-endpoint (Rep limited to own records; billing/team/integrations = Owner/Admin).
3. **Compliance suppression:** a contact with **DNC** or a channel **unsubscribe** is blocked from all outbound on that channel — at send time, in sequences, and in automation steps. Log the suppression.
4. **Trial/billing state machine:** governs feature access; payment-failed → grace → suspend; banner shown app-wide.
5. **Event bus / jobs:** entity events (contact created, deal stage changed, message received, time elapsed) feed automations + sequence scheduler asynchronously; retries + dead-letter on failure.
6. **Timeline as source of truth:** all comms and changes write an `activity` row; detail timeline + reports read from it.
7. **Idempotency & dedup:** sequence enrollment, import, and webhook handlers must be idempotent.
8. **Audit:** privileged actions write to `audit_log`.

---

## 15. Out of scope / roadmap (noted in prototype)
Real-time collaborative editing, deal multi-currency beyond basic, multi-carrier failover, Calendly/Zendesk/Google Calendar connectors, SSO/SAML, custom report builder. Drag-to-move kanban and live data are prototype gaps that **are required** for production.

---

## 16. How to use this document
- **Frontend:** port each prototype component (names referenced per section) to TypeScript; replace mock `*_DATA` consts with TanStack Query hooks hitting the endpoints in each section; keep the design-system rules in §3 verbatim.
- **Backend:** implement the API tables in each feature section against the model in §13; enforce §14 globally; wire the job queue for §9/§10 and provider webhooks for §8/§11.
- **Source of truth for visuals/interactions:** open `index.html` — every behavior described here is demonstrated there.
