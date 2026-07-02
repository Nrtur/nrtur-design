# Module 22 — Settings (Workspace / Admin-Gated)

This is the largest module in the product — 28 sub-features spanning workspace identity, permissions, billing, tag/status management, communication defaults, integrations, branding, layout customization, and data management. Every page here shares one gating mechanism and, as the research surfaced, one recurring architectural pattern worth understanding before the individual features: **several of these settings pages describe real enforcement in their copy that no code anywhere actually performs.** That pattern gets its own section below, since it matters more than any single feature's field list.

_22.24 (Custom Objects builder) is fully documented in [Module 21](custom-objects.md) — `SettingsCustomObjectsPage`/`CustomObjectEditor` — and isn't repeated here._

### Shared infrastructure

| Mechanism | What it does |
|---|---|
| `SettingsShell` | Wraps every settings page. Computes `readOnly = WORKSPACE_SETTINGS_PAGES.has(active) && !settingsIsAdmin()`; if true, wraps all children in a disabled `<fieldset>` and shows an amber "Managed by your admin" banner |
| `settingsIsAdmin()` | `NAV_ADMIN_ROLES.indexOf(effectiveRole()) >= 0`, where `NAV_ADMIN_ROLES = ['Owner','Admin']` |
| `WORKSPACE_SETTINGS_PAGES` | A `Set` of ~30 page keys — almost every settings route in the app, all gated by the mechanism above |
| Three-tier inheritance pattern | Built-in default → workspace admin default → per-user override. Used consistently by Navigation, Dashboard/Reports, and Notifications — each has a matching pair of pages (one admin-facing "sets the default," one personal "my preferences") |
| Exceptions to the generic gate | Billing (`effCanManageBilling()`, Owner-only, stricter than Owner-**or**-Admin) and White-label (bespoke restricted-access screen) both implement their own gate instead of relying on `SettingsShell`'s fieldset-disable |

---

## The Pattern: Settings That Assert Enforcement But Don't

Four separate settings pages describe themselves as actively controlling send behavior or data lifecycle. None of them are wired to anything that could actually do so — because the prototype has no live sequence/automation execution engine at all (everything is static/seeded), there was never a runtime for these settings to plug into. This is worth reading as one finding, not four:

| Page | What the copy claims | What the code actually does |
|---|---|---|
| **Suppression List** (22.12) | "Suppressed contacts are auto-skipped in every sequence & automation and can't be re-enrolled." (shown on this page AND inside the Automations builder) | No function named anything like `isSuppressed` exists anywhere. `enrolleesFor()` (the function that computes who's enrolled in a sequence) never reads the suppression state. Manual add/unblock genuinely mutates this page's own local list — that part works — it just doesn't connect to anything downstream |
| **Frequency Cap** (22.13) | "Extra sends are held until the window resets... Contacts at their frequency cap are skipped to prevent over-messaging." | `contactFreqCounts(c)` — the function that decides if a contact is "at cap" — is a fabricated function using `c.id % 5` / `% 4` / `% 3` math, not a count of real sent messages. `WORKSPACE_FREQ_CAP` has exactly two consumers in the whole file: this settings page and one display widget. Nothing in Sequences/Automations/Compose reads it |
| **Re-engagement** (22.14) | "Automatic sunsetting rule... runs daily... Evaluated daily against all contacts." | No scheduler, cron, or daily-evaluation logic exists anywhere. Clicking "Enroll in win-back" updates this page's own local counters only — it never touches the real sequence-enrollment data structure. The rule's "Save" button fires a toast and nothing else |
| **Privacy & Data Retention** (22.16) | Data retention period selector implies records get purged after the chosen window | Saving the retention period fires a generic toast; there's no deletion job, no persistence, no wiring to any record's lifecycle anywhere. The page's own Export CSV/JSON buttons have no click handler at all |

**Why this matters for documentation purposes**: an admin configuring any of these four pages today is doing something that has zero effect on what actually happens in the product. If a customer relies on Frequency Cap to protect deliverability, or on Suppression to honor an unsubscribe, neither is actually happening — the risk isn't "this is unpolished," it's "this could create real compliance exposure once the app has a real send engine, if these gaps aren't closed before launch." Recycle Bin's 30-day auto-purge claim has the same shape (see 22.27) — a fifth instance of the same pattern.

---

## 22.1 General Settings

`SettingsGeneralPage` — Workspace name, Industry, Timezone, Currency — four plain uncontrolled text inputs, no validation. Notably: **no date-format field, no logo field** here despite the inventory description — logo/branding lives entirely in the separate Branding page (22.21). "Save changes" only fires a toast; nothing persists. Also contains its own "Danger zone → Delete workspace" block — see 22.28 for why this is a problem (it's a second, broken copy of that feature).

## 22.2 Custom Fields / Properties

`SettingsPropertiesPage` + `NewPropertyDrawer` — the field-builder reused by Custom Objects (Module 21). Custom fields exist for exactly **4 objects: Contacts, Companies, Deals, Leads** — Tasks has no custom-field support despite being a permission-configurable object elsewhere. 14 field types (Text, Long text, Number, Currency, Single/Multi select, Date, Date range, Boolean, Email, Phone, URL, Lookup, Autocomplete — the last two are decorative everywhere, see Module 21's gap audit). All 11 expected field-config options are genuinely implemented (Required, Default, Unique, Help text, Sensitive, Important, Show-in-create-form, Default-list-column, Detail placement, Group, Conditional visibility) plus two more (Visible in pipelines/stages). Fields and sections are drag-reorderable. System/primary fields are permanently locked (can't edit or delete). **Deleting a field only removes the schema entry — it never touches existing record data**, so old values become orphaned/invisible rather than being cleaned up.

## 22.3 Team

`SettingsTeamPage` — member list (avatar/email/role/status), role assignment via `RoleSelect` (genuinely works, live in local state), invite flow (fully simulated — no email sent, no member actually added), remove-member flow (**confirm dialog shows, but its `onConfirm` is never wired — clicking "Remove" does nothing**). Includes an "Activity audit log" card with a hardcoded 6-row feed and an Export CSV button with no click handler at all. The subtitle reads "5 of 5 seats used - Pro plan" — a hardcoded string, not computed from actual member count, and not connected to Billing's own separate seat list (see below).

## 22.4 Permissions

`SettingsPermissionsPage` — genuinely sophisticated. 6 built-in roles (Owner/Admin/Sales Manager/Team Lead/Sales Rep/Read Only) each with object CRUD × scope (Own/Team/All) across 8 objects, feature toggles (Reports actions, Settings access, User management, Export, Bulk delete, Manage tags/statuses, Manage sequences), a Billing toggle hard-locked to Owner-only, and a sensitive-field-visibility list with a live "Preview as" role switcher. **Custom roles can genuinely be created** — "Duplicate role" or "Create custom role" clones a template's full permission object; custom roles are always non-billing and always treated as non-admin for workspace-settings gating (`NAV_ADMIN_ROLES` never grows beyond `['Owner','Admin']`, so a custom role can never unlock admin-gated pages no matter what its permissions say). "Transfer ownership" is a pure stub (toast only). Nothing here persists past a page reload — it's all in-memory React state.

## 22.5 Permission Matrix

`PermissionMatrixPage` — a read-only reference grid (roles × object-actions/features/settings-pages), explicitly self-described in its own code comment as documenting the model **and** flagging where the declared model and the actually-enforced gate disagree. This self-awareness is a genuinely unusual, high-quality piece of design: it flags, for example, that the permission model treats Sequences/Automations management as a toggleable Sales-Manager feature, while the actual settings page gating gives Sales Manager only read access in practice — and it flags the exact same kind of gap for Billing (model says Owner-only; the generic settings gate would let Admin in too, if Billing didn't have its own stricter check). No bulk-edit capability exists here or on the Permissions page — every toggle is edited one role at a time.

## 22.6 Billing

`SettingsBillingPage` — gated **Owner-only** (`effCanManageBilling()`), the one page in this module that diverges from the standard Owner-or-Admin gate (self-flagged by the Permission Matrix, see 22.5). 3 plan tiers (Starter/Pro/Business) with a **separate, inconsistent set of numbers** from the marketing landing page's pricing table — worth reconciling if either is customer-facing. Payment method UI is simulated text inputs styled like a card form, not real Stripe Elements. Invoice history and seat management (`BillingSeatsDrawer`) are local-state simulations with toast-only proration. A dev-only "billing state simulator" widget lets you flip between trial/active/cancelled/payment-failed states to preview each layout. **Billing's seat list (`BILLING_SEATS`) and Team's member list (`members`) are two entirely separate, unsynced arrays** — inviting or removing a person in one has no effect on the other, despite both claiming to represent the same team.

### Design decisions — Identity, Access & Billing

| Decision | Alternative | Why this | Tradeoff |
|---|---|---|---|
| Team members and Billing seats are modeled as two separate arrays | One shared roster, with Billing computing seat count from actual team size | Simpler to seed independently for demo purposes | The subtitle claims tie them together ("5 of 5 seats used") in a way the data doesn't back up — a real implementation would need one source of truth so adding a member actually consumes a seat |
| Custom roles clone a template but can never become admin-equivalent | Let a custom role be flagged as admin-equivalent if its permissions match Owner/Admin | Keeps the hardcoded `NAV_ADMIN_ROLES` gate simple and predictable — no risk of a misconfigured custom role accidentally unlocking billing/workspace-deletion | An admin could build a custom role with every permission toggle on and still find it can't access Billing or Delete Workspace — a confusing dead end that isn't explained anywhere in the Permissions UI |
| The Permission Matrix self-documents model/enforcement divergences rather than silently having them | Make the model and the enforcement agree everywhere (remove the divergences) | Documenting known gaps honestly is more useful in a fast-moving prototype than pretending they don't exist | This is a documentation choice, not a fix — the divergences (Billing, Sequences management, Tags/Statuses management) still behave inconsistently with what the Permissions page implies an admin has configured |

### Frontend / Backend — Identity, Access & Billing

- **Frontend**: Unify Team's member roster and Billing's seat list into one data source; wire the "Remove member" confirm's `onConfirm`; wire "Change plan" and audit-log "Export CSV" buttons
- **Backend**: `POST /team/invite` (real email delivery), `PATCH /team/:id/role`, `DELETE /team/:id`; `GET/PATCH /permissions/roles` with real persistence (today: page-local React state only); real Stripe Billing integration (subscriptions, seats, invoices) replacing the simulated card form and toast-only proration

---

## 22.7 Tags

`SettingsTagsPage` — genuinely well-built. Reads from a registry (`tagDefs`) but also surfaces "unregistered" tags found on actual records (nothing is hidden even if never formally created here). Create/rename/delete/merge all **actually propagate to every record** carrying the tag (`nrturApplyTagOp`), not just to the registry — this is real, working infrastructure, not a cosmetic form.

## 22.8 Statuses

`SettingsStatusesPage` — custom statuses exist for exactly **Leads and Contacts only**. Companies use a fixed, non-editable `COMPANY_TYPES` list instead. **Deal stages are explicitly NOT part of this mechanism** — the page shows a static card redirecting to the Pipeline board, confirming stages are a per-pipeline concept (Module 8), not a workspace-wide status list. Rename/delete genuinely migrate affected records (deleting a status reassigns its records to the first remaining status, never leaving them null). A floor-of-one rule prevents deleting the last status in a list.

## 22.9 Duplicates

`SettingsDuplicatesPage` — this is the exact same shared engine as Module 6's Duplicate Detection Modal (`DuplicatesView`, `detectDuplicates`, `MergeDrawer`), not a separate reimplementation. Matching rules (email/phone exact match, name+company fuzzy match, etc.) are **entirely hardcoded** — there is no admin UI anywhere to adjust which fields trigger a match or tune confidence thresholds, despite this being a "Settings" page that implies configurability. "Bulk merge high-confidence" is a real, working action.

## 22.10 Notification Defaults

`SettingsNotificationDefaultsPage` (admin) + `SettingsNotificationsPage` (personal) — a clean three-tier inheritance implementation: org defaults → per-user override → built-in fallback, with a genuine "Inherited"/"Custom" badge per row showing whether the current user's setting matches the workspace default. Exactly 7 notification event types, each with Email/In-app toggles only (no SMS/push channel for CRM-internal notifications). Admin changes to the workspace default do **not** retroactively update users who've already customized their own — each page reads its own independent localStorage key, by design.

## 22.11 Tasks & Reminders

`SettingsTasksPage` — confirmed to exactly match what Module 18 already documented (default reminder, email reminders toggle, default priority, default assignee, default due date). Nothing additional found in this pass.

## 22.12 Suppression List / Unsubscribes

`SettingsSuppressionPage` — 4 tabs (Email, Domains, Phone/SMS, Channels-by-contact), each rich and independently well-built as a UI. See the pattern callout above for why none of it actually blocks a send. Also worth noting: a separate, simpler per-contact `dnc` (Do Not Contact) boolean flag exists on contact records — it's unrelated to and disconnected from this page's four suppression lists, a second, parallel "don't contact this person" mechanism. The page's "Compliance preferences" toggles (Global opt-out, Honor GDPR deletion, Include unsubscribe link) all have `onChange={()=>{}}` — permanently on, non-interactive despite rendering as toggles.

## 22.13 Frequency Cap

`SettingsFrequencyPage` — 4 channels (Email/SMS/Push/In-app), each with on/off, max count, and day/week period. See the pattern callout — this is display-only. Worth noting the implementation detail: the config object (`WORKSPACE_FREQ_CAP`) is a **mutated module-level constant**, not React state passed through context — an unusual pattern chosen specifically so a separate per-contact widget can read the latest value without prop-drilling, but it means this configuration lives outside the normal state-management pattern used everywhere else in the app.

## 22.14 Re-engagement

`SettingsReengagementPage` — dormancy is purely time-based (days since last engagement), with a selectable window (30/60/90/120/180 days). See the pattern callout for the "automatic sunsetting rule" gap. One genuine point of connection to real data: the win-back sequence dropdown does read actual sequence names from the Sequences module — but clicking "Enroll" doesn't actually enroll anyone in that sequence, it only updates this page's own counters.

### Design decisions — Data Configuration & Communication Defaults

| Decision | Alternative | Why this | Tradeoff |
|---|---|---|---|
| Suppression, Frequency Cap, and Re-engagement were built as full settings UIs before any real send/scheduling engine existed | Build the enforcement engine first, then the settings UI to configure it | Lets stakeholders see and validate the intended UX immediately, without waiting on backend infrastructure | The three pages actively claim behavior they don't have — this is the single highest-risk documentation gap in this module, because it's not obviously "unfinished" the way an empty page would be; it looks complete and asserts things in its own copy that are simply false today |
| Duplicate-matching rules are hardcoded rather than admin-configurable | Expose a field-picker/threshold UI for tuning what counts as a duplicate | Avoids a whole secondary configuration surface (and the risk of an admin misconfiguring matching into false positives/negatives) for a first version | A workspace with unusual data (e.g., shared company emails, or a market where phone numbers aren't unique per person) has no way to tune the matching logic to their reality |
| Custom statuses cover Leads/Contacts but not Companies (fixed types) or Deals (per-pipeline stages) | One unified status/stage system across all four objects | Reflects that these three concepts are genuinely different in shape — Company "type" is closer to a category, Deal "stage" is inherently pipeline-scoped, Lead/Contact "status" is closer to a simple lifecycle flag | Three different mental models for what looks like the same underlying concept ("what state is this record in?") — a new admin has to learn Company types are separate from Statuses are separate from Pipeline stages, discoverable only by opening each settings page individually |

### Frontend / Backend — Data Configuration & Communication Defaults

- **Frontend**: Wire the "Compliance preferences" toggles to real state; if duplicate-matching becomes configurable, a field-weight/threshold editor UI
- **Backend**: This cluster is where the biggest backend lift in the whole module lives — **a real send/scheduling engine** that actually reads `WORKSPACE_FREQ_CAP`, the suppression lists, and the re-engagement rule before every send. Until that exists, all three settings pages are configuring nothing. Also needed: a real cron/job scheduler for the "runs daily" re-engagement rule, and a real duplicate-detection service if matching needs to scale beyond in-memory comparison of the full record set

---

## 22.15 Integrations

`SettingsIntegrationsPage` — a catalog of 21 workspace-scope integrations (`INTG_DEFS`) across 8 categories (Communication, Calendar, Video, Ads & Leads, Payments, Automation, Data, Notifications), plus 7 more user-scope integrations on a separate personal page. 17 of the 21 catalog entries share one `GenericConnectModal` (2-step OAuth/key simulation); the other 4 (Meta/Google ads, Twilio, Vonage, personal mailbox) have bespoke, more detailed connect flows. `IntegrationsContext`'s connected-state map (`conns`) is **plain in-memory state — not persisted to localStorage**, unlike almost every other piece of settings state in this module, so all connections reset on page reload. A static "Live secret key" API-key card exists but isn't tied to any real backend.

## 22.16 Privacy & Data Retention

`SettingsPrivacyPage` — see the pattern callout above. Beyond the non-functional retention selector, there's no cookie-consent configuration anywhere in the app, and no genuine "erase this person's data everywhere" action — the closest thing is a `'GDPR erasure'` reason code on the Suppression list, which only suppresses future emails, not a real data-deletion pipeline. Per-person data export (an admin exporting one specific customer's data) doesn't exist; the only "download your data" action is self-service, on the Profile page, for your own account, and even that button has no click handler.

## 22.17 Navigation Customization

Genuinely well-built, real three-tier inheritance: `NAV_BUILTIN_DEFAULT` → workspace admin default (`SettingsNavCustomizePage`) → per-user override (`NavCustomizeDrawer`), resolved via `userNav || adminNav || NAV_BUILTIN_DEFAULT`. Both layers share the same drag-and-drop reorder/hide/add-custom-link mechanism. A floor of 1 pinned item and a ceiling of 12 are enforced. This is one of the more solid, fully-wired features in the entire Settings module.

## 22.18 Dashboard Customization

`SettingsDashCustomizePage` — confirmed to be the same page documented in Module 19, covering both Dashboard archetype defaults (3 archetypes: rep/manager/exec) and Report role presets (6 actual CRM roles) via a surface toggle. Same inheritance pattern as Navigation.

## 22.19 Record Layouts

`SettingsRecordLayoutsPage` — covers Contacts/Companies/Leads/Deals only (not Custom Objects). Field placement (Highlight/Details/Hidden) and field order **genuinely write through to `PropertiesContext`** — the same context that drives the real detail pages — so this is not a stub; changing it here actually changes what a rep sees on a Contact's detail page. The one exception: **section order (tab order) is local-only and doesn't persist** — it looks identically editable to field placement but silently reverts on navigation away, a real trap for an admin who assumes reordering the sections "saved" like everything else on the page did.

## 22.20 List Views

`SettingsListViewsPage` — confirmed to be a genuinely separate workspace-admin page from per-user, per-list column customization (the subtitle says so explicitly: "Sorting and saved views live on the list itself"). Sets the default column set per object, reading/writing the same `PropertiesContext.props[obj].fields[].col` flag used elsewhere.

## 22.21 Branding

`SettingsBrandingPage` — company name, logo upload (stored as base64 in localStorage), primary/accent color pickers. Explicitly and correctly scoped to **customer-facing surfaces only** (booking pages, emails, forms) — an amber banner states directly that it does not restyle the app's own theme, and the page includes live preview mockups (not the real app) to make that boundary clear.

## 22.22 White-label

**Two unrelated features share this name** — worth flagging directly since it's a real source of confusion:
1. `SettingsWhiteLabelPage` — the actual platform-level feature: custom domain + DNS verification (simulated), branded mobile app status, a full agency/reseller sub-account management panel (stats, sub-accounts table, "new sub-account" — all toast-only), gated Owner/Admin via its own bespoke restricted screen (not a billing-tier gate). It correctly reuses Branding's logo/colors as read-only synced values rather than collecting a second copy.
2. `WhiteLabelConfigDrawer` — a completely separate, much narrower feature reachable only from the **Billing** page, as a $15/mo add-on scoped solely to exported/shared report branding (company name, one accent color, footer text, "Powered by nrtur" badge toggle). Its "Export sample PDF" button is toast-only, no real file.

These don't share state or code beyond both existing under the umbrella term "white-label" — an admin could reasonably look for report-branding controls on the platform white-label page and not find them, since they live on Billing instead.

## 22.23 Themes & Display

`SettingsThemesPage` — genuinely broader than (and complementary to) the simple light/dark toggle documented in Module 24. This page **actually live-applies** every change to the real DOM as you edit it (theme, density, brand-safe accent presets, nav-bar color presets, UI font, default landing page, date/time format) — unlike Branding, which only affects preview mockups. This is the one page in the Branding/Customization cluster confirmed to have zero gap between "what the settings claim" and "what the app does."

### Design decisions — Integrations, Branding & Customization

| Decision | Alternative | Why this | Tradeoff |
|---|---|---|---|
| Two features are both called "white-label" with no shared code | Consolidate into one page, or clearly rename one (e.g. "Report branding" for the Billing add-on) | They arose from genuinely different product needs (agency reselling vs. one billing add-on) and were built independently | An admin searching Settings for "how do I remove nrtur branding from my reports" has to already know it's a Billing add-on, not the White-label settings page — a discoverability trap |
| `IntegrationsContext`'s connected state isn't persisted to localStorage, unlike nearly every other settings mechanism in this module | Persist `conns` the same way Navigation/Themes/Branding do | Likely an oversight rather than a deliberate choice — no comment in the code explains why this one context skips persistence | Every integration connection is lost on page reload in the prototype, which undercuts demos that involve reconnecting Stripe/Slack/etc. to show a "connected" state persisting |
| Record Layouts' field placement/order writes through live, but its section order doesn't | Persist section order the same way, since it's visually presented identically | Section order was likely added later as a lighter-weight visual affordance without the same wiring effort | A real trap: the page gives no visual signal that one draggable list "saves" and the adjacent one doesn't — an admin has no way to know without reloading the page and noticing their section order was silently reverted |

### Frontend / Backend — Integrations, Branding & Customization

- **Frontend**: Persist `IntegrationsContext.conns`; wire Record Layouts' section-order state into `PropertiesContext` (or a new persisted field) instead of local-only state; consider renaming/consolidating the two white-label surfaces
- **Backend**: Real OAuth flows for every `INTG_DEFS` entry (today: all simulated); real DNS verification for custom domains; real reseller/sub-account provisioning if the agency use case is pursued

---

## 22.25 Import Data

`SettingsImportPage` (dedicated settings entry point) shares its core logic with `BulkImportWizard` (invoked contextually from each object's own list page) — genuinely one engine, two entry points, not a duplicate implementation. A third, older component (`CsvImportModal`) still has one live call site but appears to be vestigial/dead scaffolding from an earlier iteration (contacts-only, canned/hardcoded results, no real CRM data wiring). The real flow is thorough: file upload (CSV/TSV/JSON, hand-rolled RFC4180 parser) → column mapping (including custom properties) → duplicate-handling mode (skip/update/create, keyed by object-specific unique field — Deals have no unique key, so every row always creates new) → row validation with downloadable error CSV → import history with a genuine **undo** (typed-confirmation removal of every record tagged with that batch's auto-generated tag). This is one of the more complete, well-thought-through features in the whole module.

## 22.26 Export Data

`SettingsExportPage` — the sole, centralized export UI (no per-object-list export buttons exist elsewhere, unlike Import which is duplicated across list pages). Object choice → saved-view/filter choice (the "matched record count" for anything but "All" is a **simulated approximation** — `Math.round(count*0.55)` — not a real filter evaluation) → configurable field/column subset (base schema fields only, custom properties are not exportable, unlike Import which does support them) → CSV download + export history with re-download. No scheduled/recurring export exists on this page (a "Data export & warehouse" integration card exists in the Integrations catalog instead, entirely separate).

## 22.27 Recycle Bin

`SettingsRecycleBinPage` — unifies 6 record types: Contacts, Companies, Leads, Deals, Tasks, and **custom object records** (confirming Module 21's finding precisely: custom *records* soft-delete and land here; custom *object definitions* do not and are hard-deleted with no recovery path at all). A 30-day retention window is displayed and described in copy ("Items are automatically removed after 30 days") — **but nothing in the code actually purges anything after 30 days; there is no timer, cron, or effect that does this.** This is the same "claims enforcement, has none" pattern as the communication-defaults cluster, applied to data lifecycle instead of sending. Restore is simple and correct (soft-deleted records were never actually removed from their array, so "restoring" just clears flags — relationships were never broken in the first place). Permanent delete requires typing the literal word "DELETE." Bulk restore/delete both work. The empty-state copy lists 5 record types but omits custom object records, a minor copy inconsistency versus what the code actually includes.

## 22.28 Delete Workspace

**Two separate UIs exist, and one of them is completely dead** — the most consequential single finding in this entire module:

1. **`SettingsDeleteWorkspacePage`** (dedicated page) — properly gated (`effCanManageBilling()`, Owner-only), full warning copy (contacts/pipelines/automations/billing all listed as permanently lost), and a real typed-confirmation gate requiring the exact workspace name. On confirm: `custToast('Workspace deletion scheduled')` — a stub, but at least a functioning one that shows the user something happened.
2. **The "Danger zone" block inside `SettingsGeneralPage`** — a second, independently-coded delete-workspace control. It opens a confirm dialog with **no typed-confirmation gate at all** (a plain two-button Cancel/Delete dialog) and **no `onConfirm` callback wired** — clicking "Delete" in this version does absolutely nothing. No toast, no state change, nothing.

Anyone who reaches the General settings page first (a very likely path — it's the first item in Settings) will find a "Delete workspace" button that silently does nothing when confirmed, while the actually-functional version lives on a separate, less-obvious page.

### Design decisions — Data Management

| Decision | Alternative | Why this | Tradeoff |
|---|---|---|---|
| Recycle Bin's 30-day purge is described but not implemented | Build the actual purge job, even as a simple scheduled cleanup | Consistent with the rest of the app having no backend/scheduler at all | Same risk as the communication-defaults enforcement gaps — an admin (or a compliance reviewer) reading "removed after 30 days" has no reason to doubt it without reading the code |
| Custom object records soft-delete through Recycle Bin, but custom object type definitions hard-delete instantly | Make object-definition deletion consistent with every other delete in the app (soft-delete, recoverable) | Deleting a schema was treated as categorically different from deleting a record when this was built | This is the one truly unrecoverable action in the whole data model (confirmed independently in Module 21) — and it sits right next to five other delete flows that are all safely recoverable, which makes it an easy trap for an admin who's learned "everything here is safe to delete, I can always undo it" |
| Two independent Delete Workspace implementations exist, one broken | One shared component/handler used from both entry points | The General-settings version reads like an earlier, simpler placeholder that was never removed once the dedicated page was built | The broken version is reachable from a more prominent, more likely-to-be-found location than the working one — this is worse than having only one broken implementation, because a user has no way to know a working version exists elsewhere |

### Frontend / Backend — Data Management

- **Frontend**: Remove or fix the dead `SettingsGeneralPage` danger-zone block (point it at the same handler as the dedicated page, or delete it entirely); fix the empty-state copy on Recycle Bin to mention custom records
- **Backend**: A real purge job for the Recycle Bin's 30-day window; real CSV import/export at scale (today's client-side parsing won't hold up past a few thousand rows); a real workspace-deletion pipeline (cascading delete or anonymization across every object type, billing cancellation, session invalidation for all members) behind whichever Delete Workspace UI is kept

---

## Full Gap Audit

Consolidated from every cluster above, most consequential first.

### Enforcement gaps (settings that claim to do something and don't)

| # | Gap |
|---|---|
| 1 | Suppression list doesn't block any actual send — no code path checks it |
| 2 | Frequency cap isn't enforced anywhere; the "current count" it displays is fabricated from `id % N` math, not real send history |
| 3 | Re-engagement's "automatic sunsetting rule" has no scheduler — "runs daily" is just copy |
| 4 | Privacy & Retention's data retention period doesn't trigger any deletion |
| 5 | Recycle Bin's 30-day auto-purge doesn't happen — nothing purges automatically, ever |
| 6 | Privacy page's Export CSV/JSON buttons, and Profile's "Request data export" button, have no click handler |
| 7 | "Compliance preferences" toggles on the Suppression page are permanently on and non-interactive (`onChange={()=>{}}`) |

### Broken/dead UI (renders, does nothing on interaction)

| # | Gap |
|---|---|
| 8 | `SettingsGeneralPage`'s "Delete workspace" confirm has no typed-confirmation gate and no `onConfirm` — completely non-functional, and more discoverable than the working version |
| 9 | Team page's "Remove member" confirm dialog shows but never actually removes the member |
| 10 | Team page's audit-log "Export CSV" button has no click handler |
| 11 | Billing page's "Change plan" button has no click handler |

### Disconnected/unsynced parallel systems

| # | Gap |
|---|---|
| 12 | `CRM_ROLES` (5 roles, no Owner — used by Team/Billing invite flows) vs. `PERM_ROLE_SEED` (6 roles, includes Owner — used by Permissions/Permission Matrix) are two separate role-list constants |
| 13 | Team's member roster and Billing's seat list are separate, unsynced arrays despite both representing "who's on this team" |
| 14 | The per-contact `dnc` flag and the Suppression List's four tabs are two unrelated "don't contact this person" mechanisms |
| 15 | Two features are both called "white-label" (platform page vs. Billing report-branding add-on) with no shared code or cross-linking |
| 16 | Two independent "Delete workspace" implementations exist (see #8) |
| 17 | Custom-object records soft-delete via Recycle Bin; custom object *definitions* hard-delete instantly with no recovery — an inconsistency documented independently in Module 21 |

### Feature-completeness gaps

| # | Gap |
|---|---|
| 18 | Duplicate-matching rules are entirely hardcoded — no admin control over which fields trigger a match |
| 19 | Custom fields exist for only 4 of the objects that have permission rows (Contacts/Companies/Deals/Leads) — Tasks and other permission-configurable objects have none |
| 20 | Export only pulls base schema fields, not custom properties (Import does support custom properties — an inconsistency between the two) |
| 21 | Export's "matched record count" for any saved view besides "All" is a simulated approximation, not a real filter evaluation |
| 22 | `IntegrationsContext`'s connected state isn't persisted — every integration "disconnects" on page reload, unlike almost everything else in this module |
| 23 | Record Layouts' section (tab) order looks identically editable to field placement/order but is local-only and silently reverts — no persistence, no warning |
| 24 | No cookie-consent configuration anywhere in the app |
| 25 | No genuine per-person "erase this contact's data everywhere" action — the closest thing (a GDPR-erasure suppression reason) only stops future emails |

---

## Developer Q&A

**Q: Of everything in this audit, what's the single highest-priority fix?**
A: The dead "Delete workspace" button in General Settings (#8). It's not just non-functional — it's the *more discoverable* of two implementations, so a real admin trying to delete their workspace will very plausibly hit the broken one first, conclude the feature doesn't work, and potentially contact support or worse, assume the deletion happened when it didn't. Every other gap in this audit is either invisible during normal use (the enforcement gaps) or a minor inconvenience (unsynced role lists). This one actively misleads a user mid-action.

**Q: The enforcement-gap pattern (Suppression, Frequency Cap, Re-engagement, Retention) shows up four times. Is this actually four separate problems, or one?**
A: One problem with four symptoms: none of these features had a real send/scheduling engine to plug into when they were built, because the whole prototype is static/seeded data with no live backend. The settings UIs were built to spec — they look and behave exactly like a finished feature would — but there was never a runtime for them to actually control. This isn't a case of sloppy implementation; it's a structural gap that will need a real backend (queue, scheduler, send pipeline) before any of these four pages can do what their own copy already claims they do.

**Q: Is it a problem that Duplicate-matching rules are hardcoded rather than admin-configurable, given the page is literally called "Duplicates" in Settings?**
A: It's a reasonable v1 scope cut as long as the hardcoded rules are good defaults (email/phone exact match, name+company fuzzy match) — which they are. The gap is more about expectation-setting: a page living under admin Settings implies admin control, and there's currently zero control surface for the actual matching logic, only for reviewing/merging what the hardcoded rules already found. This is lower priority than the dead-button and enforcement gaps, but worth flagging if a customer specifically asks "can I tune what counts as a duplicate."

**Q: Two things are called "white-label." Should these be merged?**
A: Not necessarily merged, but they should at minimum cross-link and probably should be renamed to disambiguate — e.g. "White-label (platform)" vs. "Report branding (add-on)." They solve genuinely different problems (agency reselling vs. one export-branding add-on) and merging them into one page could make each harder to use. The fix here is naming and discoverability, not consolidation.

**Q: The Permission Matrix explicitly documents where its own model disagrees with actual enforcement. Is that a gap, or good practice?**
A: Good practice, and worth calling out as a pattern to keep, not fix. Most products hide these divergences (a permission toggle exists in the UI but doesn't map to a real gate) until a customer discovers the gap the hard way. This page proactively documents its own known gaps (Billing's Owner-only enforcement despite a model that implies broader access; Sequences/Automations management being read-only for Sales Manager despite a toggleable "manage" permission) — which is exactly the right instinct. The actual fix needed isn't to the Matrix page itself, but to close the underlying divergences it's flagging.

**Q: Given the scale of this module, what would you tackle first if you could only fix three things?**
A: (1) The dead Delete Workspace button — highest risk of directly misleading a user mid-critical-action. (2) Unify Team's member roster and Billing's seat list into one source of truth — this is a small data-modeling fix that removes a whole category of "why don't these numbers match" confusion. (3) Either wire the Suppression List into a real send-gate or change its copy to stop claiming it already works — whichever ships first, a real backend or an honest label, closes the single largest gap between what an admin believes they've configured and what the product actually does.
