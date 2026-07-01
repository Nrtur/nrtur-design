# Module 24 — Global UI / Shared Components

_Not standalone pages — cross-cutting infrastructure used across the entire app. This is the final module in the master inventory; several items here were already touched on in passing during earlier modules (Nav Customize Drawer in [Module 22 §22.17](settings-workspace.md#2217-navigation-customization), Activity Timeline hooks in every detail-page doc, the Om filter engine in Contacts/Leads/Companies/Custom Objects) — those are cross-referenced rather than re-derived._

---

## Core Chrome

### 24.1 App Sidebar

`AppSidebar` — one component for the entire app shell: brand mark (→ Dashboard), quick-add "+", search icon, pinned nav items (read from `NavConfigContext`'s resolved 3-tier config — built-in → workspace admin default → per-user override), "More" overflow entry, notification bell, theme toggle, settings gear, profile avatar. Always icon-only on desktop (56px rail) — there's no user-facing collapse/expand control. Self-suppresses only when embedded in the Engage hub (`EngageEmbedContext`); never rendered at all on marketing/auth/checkout pages, since those don't mount the app shell in the first place.

**The notification bell's badge is a static presence dot, not a real unread count** — worth knowing since "unread count" is exactly what a bell badge implies. The actual count only becomes visible after opening the drawer (see 24.5).

### 24.2 Mobile Nav

Confirmed **≤768px** breakpoint. This is the same `AppSidebar` component, transformed entirely by CSS — not a separate component tree. At mobile width, the vertical rail becomes a fixed bottom tab bar showing the pinned nav items (reading the exact same `NavConfigContext` data as desktop, not a hardcoded mobile subset), while the surrounding chrome (logo, search, bell, theme toggle, profile, More button) is CSS-hidden. Quick-add becomes a floating action button. A hamburger button (also always React-rendered, CSS-hidden until mobile width) opens `MobileNavDrawer` — a full-screen slide-in panel showing **both** Pinned and More sections together (unlike the bottom tab bar, which only shows pinned items), plus quick actions and a "Customize navigation" entry.

### 24.13 Nav More Drawer

Distinct from the already-documented Nav *Customize* Drawer. `NavMoreDrawer` is a portaled flyout, own search box, delegating its actual content to the shared `DestinationGrid` component — the same data source used by the full-page Explore screen (Module 4), explicitly per a code comment: *"One data source... never forked."* Shows pinned AND unpinned destinations together, grouped into sections (Overview, Daily work, Records & sales, Marketing & insight, Revenue, Workspace, **Saved views**, Custom objects, Links, More) — saved views genuinely appear here as nav-able destinations with a "View" badge, alongside every viewable custom object.

### 24.14 NrturMark

One reusable component (not copy-pasted markup) — worth correcting a prior assumption: it renders a **base64 PNG data-URI, not an SVG**. Two modes: a dark-gradient rounded tile (default) or bare image. No light/dark theme variants — same hardcoded dark tile regardless of `data-theme`, consistent with avatar colors elsewhere also being theme-invariant by design. Used in 11 places (favicon, sidebar, mobile drawer, landing page, sign-up, sign-in, the booking-page preview mockup, the public checkout page) — genuinely one component reused, not duplicated.

### 24.8 Light / Dark Theme

Confirms the user's own prior note precisely: **dark is the original, default design; light mode was added later as a retrofit, not built in from the start.** Mechanism: a bootstrap script sets `data-theme` on `<html>` from localStorage before React even mounts (avoiding a flash of wrong theme); `AppSidebar`'s toggle reads/writes the same attribute + localStorage key. A `:root` block defines ~38 CSS custom properties for dark mode, redefined under `[data-theme="light"] .app-shell` for light — genuinely var-driven for those properties. **But** a second, much larger stylesheet (`847` occurrences of `[data-theme="light"]` across the file) exists specifically to `!important`-override hundreds of literal hardcoded Tailwind opacity classes (`text-white/50`, `bg-white/[0.04]`, etc.) that components were written with directly instead of using the CSS vars — this is the "patch layer" retrofitting light-mode support after the fact. The `<body>` element itself and `NrturMark` stay hardcoded dark regardless of theme; marketing pages (outside `.app-shell`) aren't part of the theme system at all.

### Design decisions — Core Chrome

| Decision | Alternative | Why this | Tradeoff |
|---|---|---|---|
| Mobile nav is a CSS-only transformation of the same component, not a separate mobile tree | Build a dedicated mobile nav component | Guarantees mobile and desktop navigation data can never drift apart — one `NavConfigContext` read, always | The CSS override layer needed to pull this off is large and `!important`-heavy; any new sidebar button has to be remembered and explicitly added to the mobile-hide selector list, or it'll clutter the bottom tab bar unexpectedly |
| Light mode is a large override stylesheet layered on top of a dark-first codebase, rather than the app being built theme-agnostic from the start | Refactor every component to use only the CSS-var system, eliminating the override stylesheet | Retrofitting is far cheaper than a full refactor once hundreds of components already exist with hardcoded dark-mode classes | Light-mode coverage will likely degrade over time by default — every new component risks shipping with hardcoded dark opacity classes unless a lint rule or design-system convention actively prevents it; nothing in the current architecture stops this from getting worse |
| `NrturMark` has no light-mode variant | Give the brand mark a light-appropriate tile background | The mark is meant to read as a fixed brand-identity element regardless of surrounding theme | On light-themed surfaces, the mark's dark tile can look visually disconnected from its surroundings — worth a design pass once light mode is a fully supported, not just retrofitted, experience |

### Frontend / Backend — Core Chrome

- **Frontend**: Audit and reduce the light-mode override stylesheet's size over time by migrating hardcoded dark classes to the CSS-var system directly; consider a light-appropriate `NrturMark` variant
- **Backend**: None — this cluster is entirely client-side presentation

---

## Overlays & Quick Actions

### 24.3 Global Search Overlay

Searches Contacts, Leads, Companies, Deals, Custom records (all confirmed), plus two hardcoded destination lists — 23 general pages and 35 settings pages. No saved-views or help-article search. **No keyboard navigation at all** — no arrow keys, no Enter-to-select; every result is click-only. No debounce (filters on every keystroke, fine at prototype data volumes). "Recent:" search chips are static hardcoded strings, not real search history. **The sidebar's own tooltip for the search icon reads "(Cmd+K)" — but Cmd+K actually opens the Command Palette, not this overlay.** This is a real, shippable inconsistency: a user following the tooltip's own instructions lands on the wrong tool.

### 24.4 Command Palette

Full `CMD_ITEMS`: 8 Navigate entries (Dashboard, Leads, Contacts, Companies, Tasks, Pipeline, Reports, Settings), 5 Create entries (New Lead/Contact/Company/Deal/Automation), 3 static "Recent" entries (also fake, same pattern as Search's fake recents). Genuinely fuzzy-adjacent (plain case-insensitive substring match on label), permission-filtered (Create entries hide if the previewed role can't create that object — a real gate, via `effCanObject`). Full keyboard navigation: arrows + Enter + Escape, unified with mouse hover. Visually distinct enough from Search (different width, different backdrop opacity, different placeholder copy, live-highlighted selection) that outright confusion is unlikely — though both are full-screen dark overlays opened from similar-looking search-icon affordances, a minor consistency risk on its own.

### 24.5 Notifications Drawer

7 notification types (`mention`, `assignment`, `deal`, `task`, `lead`, `meeting`, `system`) — a separate, unrelated concept from Module 22's `NOTIF_CHANNELS` (delivery channels vs. notification categories; no cross-reference between the two exists in code). Feed is a genuine hybrid: meeting reminders and task due/overdue notifications are computed live from `CalendarContext`; everything else (mentions, assignments, deal-stage-changes, new-lead-assigned) is static seed data. Click-to-navigate routes to a **page**, not the specific record (a deal-moved notification opens the Pipeline page generically, not that exact deal). Mark-all-read works, but **the drawer's read/unread state is local component state that resets every time the drawer closes and reopens** — re-opening re-seeds from the same source, silently undoing any prior "mark as read."

### 24.6 Quick Add Menu

7 single-add options (Lead, Contact, Company, Deal, Task, Email, Call) + 4 spreadsheet-style multi-add options (Contacts, Leads, Companies, Deals) — confirmed no custom-object entry in either list, consistent with Module 21's finding. **Contact/Lead/Company/Deal route through `window.__nrturQuickAdd`, which opens the lightweight `AddRecordDrawer` (24.7) — not the full Add pages documented in Modules 5–8.** Task/Email/Call open a separate modal system entirely.

### 24.7 Add Record Drawer

The lightweight drawer Quick Add actually opens for Contact/Company/Deal/Lead. Single-step (not a wizard), with a primary/secondary field split (secondary fields behind "Show more fields") pulling from the same Properties-driven "Show in create form" configuration used elsewhere. Two modes toggle within the same drawer: single-record form, or an embedded spreadsheet-style multi-record grid (`RecordSheet`, shared with the Quick Add multi-add flow). Real validation (required fields, email format) plus soft "Recommended" nudges for important-but-optional fields. Supports inline stub-record creation from a Lookup field (e.g. spawning a minimal Company record while filling out a Contact).

**The Command Palette's "New Contact" (etc.) entries navigate to the full Add page instead of opening this drawer** — two entry points with identical labels land on genuinely different UI surfaces.

### 24.9 Role Preview Banner

Covered in its own cluster below (see Permission & Billing Banners).

### Design decisions — Overlays & Quick Actions

| Decision | Alternative | Why this | Tradeoff |
|---|---|---|---|
| Quick Add opens a lightweight drawer for record creation; the Command Palette navigates to a full page for the identically-labeled action | Make both entry points open the same UI | Likely built for genuinely different contexts — quick capture from anywhere in the app vs. deliberate, full-form entry — rather than as an oversight | Nothing tells the user these differ; someone who's learned "New Contact" behaves one way from the sidebar will get a different experience from the Palette, with no visual cue explaining why |
| Notification bell shows a static dot instead of a live unread count | Wire a real count badge | Cheaper to build; avoids needing a persisted read/unread store | This undersells the feature's entire purpose — a notification badge exists so someone can gauge urgency at a glance without opening anything, and a dot can't do that |
| `NotifDrawer`'s mark-as-read state resets on every close/reopen | Persist read/unread state (even just in a parent-level context, without a backend) | The drawer was built as a self-contained, unmount-on-close component | "Mark all read" actively contradicts itself in practice — a user who marks everything read, closes the drawer, and reopens it sees the same "unread" notifications again, which reads as more broken than not having the feature at all |
| Global Search has no keyboard navigation while the Command Palette does | Give both the same arrow-key/Enter interaction model | Likely built at different times, or Search was considered "good enough" with click-only interaction since it's secondary to the Palette | Keyboard-first users (a meaningful segment of any CRM's power-user base) get an inconsistent experience switching between the two most similar-looking overlays in the app |

### Frontend / Backend — Overlays & Quick Actions

- **Frontend**: Fix the search-icon tooltip to say the correct shortcut (or add a real shortcut for Search); add arrow-key navigation to Global Search; wire a real unread count to the bell badge; persist notification read-state at least at the `NotifDrawer`'s parent level so it survives close/reopen
- **Backend**: Real-time notification delivery (websocket or polling) to replace the static seed data; a real per-record deep-link target for notification clicks instead of generic page routing

---

## Permission & Billing Banners

### 24.9 Role Preview Banner

**Confirmed genuinely functional, not cosmetic** — this is one of the best-built pieces of infrastructure surfaced in this whole documentation effort. `effectiveRole()` (built-in role, or the active preview role if one is set) is read by every permission helper in the app, and `effCanObject()` alone is called **113 times** across the codebase — gating buttons, swapping entire routed pages for a `CreateBlocked` placeholder (blocking direct-URL/deep-link attempts too, not just hiding a button), and filtering record lists via `effScopeRows` so a previewed lower-privilege role genuinely sees fewer/different records, not just fewer buttons. An admin triggers preview via a "View as role" switcher (desktop icon, mobile drawer row, and a floating pill, all in sync); a persistent amber banner renders above every internal page while previewing, with an "Exit preview" button reachable three different ways. As expected for a client-only prototype, this is enforced entirely in the render layer with no backend to independently re-verify — appropriate today, but a reminder that the same logic needs re-enforcement server-side before this becomes a real security boundary rather than a UI convenience.

### 24.15 Billing State Banner

Two related but distinct banners. The **app-wide one** lives inside `AppTopbar` (used at 35 call sites across virtually every page) and fires only for `billingState==='payment-failed'` — no equivalent app-wide banner exists for `trial`, `trial-expired`, or `cancelled`, which are handled entirely within the Billing settings page itself (Module 22 §22.6). The payment-failed banner has **no dismiss mechanism** — it's a pure function of `billingState` and reappears on every page load until the underlying state actually changes (or, in the prototype, until the dev-only state switcher flips it back to `active`).

### Design decisions — Permission & Billing Banners

| Decision | Alternative | Why this | Tradeoff |
|---|---|---|---|
| Role Preview is a real, comprehensive client-side permission gate rather than a cosmetic label | Build a lighter-weight preview that just shows different copy without actually restricting anything | An admin validating "what can a Sales Rep actually do" needs the preview to be trustworthy — a cosmetic-only version would defeat the entire point of the feature | None, really — this is close to the right call for a prototype. The only real gap is the expected one: no backend re-verification, which matters once this becomes a production system handling real data |
| Only "payment failed" gets an app-wide, undismissable banner; every other billing state is settings-page-only | Give every non-active billing state the same app-wide urgency | Payment failure is the one state requiring truly immediate action regardless of what else the user is doing; trial/cancelled states are important but not equally urgent | An admin who's already aware of the payment failure and is mid-task elsewhere has no way to temporarily dismiss the banner — it resurfaces on every single page load until resolved |

### Frontend / Backend — Permission & Billing Banners

- **Frontend**: Consider a session-scoped (not permanent) dismiss for the payment-failed banner, so acknowledging it doesn't require immediately fixing billing to get it out of the way
- **Backend**: Server-side re-enforcement of every permission check currently only running client-side, before this app handles real customer data

---

## Shared Engines

### 24.10 Activity Timeline

`ACT_META` defines 17 activity types across 6 filter categories (Emails, Calls, Notes, Tasks, Deals, Changes). `buildActivityFeed(kind, rec, ctx)` shares scaffolding (error-swallowing try/catch so a dangling reference never crashes the timeline, and a final chronological sort) across all 5 kinds, but **cross-linking depth is sharply inconsistent by object type**:

| Kind | Cross-linked data pulled in |
|---|---|
| Contact | Deals, company, originating lead (capped 3), invoices — the richest view |
| Company | Related contacts (capped 4) and their own feeds, deals |
| Deal | Primary/related contact (capped 4), company (capped 2), invoices |
| Lead | **None** — only its own events |
| Custom | **None** — relationships are shown separately via `CoLinksPanel` instead |

No day-grouping ("Today"/"Yesterday" headers) exists anywhere — every row shows its own relative timestamp inline. No pagination or virtualization — the full feed is always computed in memory; a collapse-to-6 UI toggle only hides rows visually.

**`TimelineComposer`'s Email/Call/Task tabs are gated by whether the parent page passes `onEmail`/`onLogCall`/`onSchedule` handler props** — Note is the only tab that's always present. Only **Contact** gets all four (Note, Email, Call, Task); Deal/Company/Lead get Note+Task only; Custom Object records get Note only (confirming the finding from Module 21 precisely, and now showing it's part of a broader, consistent pattern rather than a custom-objects-specific gap).

**Logged activities now persist across navigation.** Notes, calls, meetings, and tasks logged through the composer are written to a shared `CrmDataContext.activities` store (via `crm.addActivity(kind, recId, act)`, keyed by `subjectType` + `subjectId`); each detail page reads back its own rows and feeds them into the timeline as the `extra` prop. Leaving a record and returning to it now keeps everything you logged — these were previously component-local and silently lost on navigation.

### 24.11 Object Manager (Om) Filter/Sort Engine

The shared filtering/sorting engine behind Contacts, Leads, Companies, Deals' built-in pipeline, and Custom Objects — 33 `Om`-prefixed functions/components in total. Operators are type-aware (`OM_OPS`): text gets contains/is/is-empty; number/currency get comparison operators plus between; date gets relative-range operators (today, last 7 days, this quarter, etc.) alongside absolute before/after; select/multiselect/owner get is-any-of/has-all-of style set operators.

**AND/OR grouping is flat and single-level** — one toggle applies to every condition in a view; there's no way to nest groups (e.g., no way to express "(A AND B) OR (C AND D)" in one saved view).

**Performance**: filtering and sorting recompute over the full in-memory array on every render — `omApplyFilter`/`omSortRows` are plain function calls, not wrapped in `useMemo`. Only the field *schema* (the list of filterable fields itself) is memoized. Fine at prototype scale; this becomes a real bottleneck the moment record counts reach the thousands, since every keystroke in a filter condition re-filters and re-sorts everything from scratch.

**The Deals pipeline is split into two different components depending on which pipeline is selected**: the built-in Deal pipeline renders through `PipelinePage`, which owns the full saved-views layer; any other pipeline — now only a Custom Object's pipeline, since Leads/Contacts/Companies were removed from the "New pipeline" object picker (`NewPipelineModal` offers Deals + custom objects only) — renders through the more generic `ObjectBoard`, which has **only local, unsaved filter state** — no saved views at all. This directly explains Module 21's earlier finding that custom-object pipelines aren't persisted: it's not an isolated gap, it's a consequence of which board component non-Deal pipelines render through.

Note that the Leads page's own List/Board toggle is **not** a pipeline: `leadView` ('list' | 'board') switches the Leads list between the Om-driven table and a `KanbanBoard` grouped by `LEAD_STATUSES` — a lead-status board *view*, not an `ObjectBoard` pipeline, and it carries no saved-views layer of its own.

The Duplicates detection engine (Module 22 §22.9) is **not** built on the Om engine despite living conceptually nearby — it has its own independent matching logic.

### 24.12 Save Views Modal

**The most consequential finding in this entire documentation project: saved views are not persisted anywhere.** `OmSaveViewModal` collects exactly one real field (the view name) plus a scope toggle delegated to a shared `VisibilityField` component — "Just me" / "Whole team" / "Custom" (the last of which, despite exposing a full access-level and people-picker UI, silently collapses to "shared" at save time — the specific people/access selections are captured in local state and then simply discarded, never part of the saved view's actual stored shape).

Every list page (Contacts, Companies, Leads, Deals' built-in pipeline, Tasks) seeds its `views` array via plain `React.useState` from a hardcoded seed function. **There is no localStorage key, no `CrmDataContext` entry, no persistence layer of any kind for saved views** — confirmed by an exhaustive search across the file. A view you save exists only in that page component's in-memory state; navigating away and back remounts the component and resets `views` to its original seed list. Editing an existing view does work correctly while you're on the page (proper create-vs-update branching, a "Save changes" affordance for updating the active view in place) — it's just that none of it survives a page reload or navigation.

**"Whole team" sharing is a cosmetic label, not tested functionality** — the entire prototype simulates exactly one user (`CURRENT_USER_CODE='AM'`); there's no second account anywhere to verify a "shared" view is actually visible to anyone else. The Om engine groups views into System/Shared/Private/Favorites sections purely for display categorization, with no actual per-user access-control check behind the "Shared" grouping.

Custom Objects (Module 21) are confirmed, once more, to be the one object type excluded from this system entirely — filter and sort exist via the same Om primitives, but no saved-views layer at all.

### Design decisions — Shared Engines

| Decision | Alternative | Why this | Tradeoff |
|---|---|---|---|
| Saved views live in plain component state with no persistence | Persist to localStorage at minimum, even without a backend (matching how Navigation, Themes, and Branding all persist) | Unclear from the code — no comment explains the omission; likely simply not gotten to yet, given every other customization surface in the app does persist | This is a real, serious gap masquerading as a working feature — "Save view" is presented identically to every other persisted setting in the app, with no indicator that it won't survive a page reload. A user demoing or relying on this will discover the loss the hard way |
| "Whole team" scope exists as an option with no actual multi-user simulation behind it | Either build real multi-user simulation, or remove/relabel the option until it's real | The option costs little to add to the UI even without a backend, and previews the intended eventual behavior | Anyone reading the UI has no way to know "Whole team" is unverified rather than working — it looks identical to "Just me," which does behave exactly as labeled (if only for the current session) |
| Cross-linking depth in the Activity Timeline varies sharply by object kind, with Lead and Custom getting none | Build consistent cross-linking depth for every kind | Contact was likely the original, most fully-built-out object; Lead and Custom Object support came later without matching investment | A rep viewing a Lead's timeline sees meaningfully less context than they would on a Contact's page for what is often the exact same underlying data (a lead often becomes a contact) — an inconsistent experience tied to which object type they happen to be looking at, not a deliberate scope decision |
| Filtering/sorting isn't memoized, only the field schema is | Wrap `omApplyFilter`/`omSortRows` results in `useMemo` keyed on the relevant inputs | Simplicity at prototype scale, where the cost is invisible | This is a real, predictable performance cliff — not a hypothetical one — the moment any object's record count grows past prototype scale; it should be treated as a known, scheduled fix rather than a maybe |
| Non-Deal pipelines (Lead/Contact/Company aux pipelines, Custom Object pipelines) render through a different component (`ObjectBoard`) than the built-in Deal pipeline, and only the latter gets saved views | Give `ObjectBoard` the same `useSmartListMgr`/saved-views wiring `PipelinePage` has | `PipelinePage` was likely built first, for the one pipeline every workspace has by default; `ObjectBoard` was added later as a lighter-weight generic board | This is the actual root cause behind Module 21's "custom-object pipelines aren't persisted" finding — it's not an isolated custom-objects gap, it's structural: no non-Deal pipeline of any kind gets persistence today, regardless of object type |

### Frontend / Backend — Shared Engines

- **Frontend**: Persist saved views (localStorage at minimum, matching the pattern used elsewhere); memoize `omApplyFilter`/`omSortRows` outputs; extend `ObjectBoard` to share `PipelinePage`'s saved-views layer so every pipeline type benefits, not just Deals; extend Custom Objects to the same saved-views system once `ObjectBoard` supports it
- **Backend**: `GET/POST/PATCH/DELETE /views` — a real saved-views table keyed by `(workspace_id, object_type, user_id | 'shared')`, replacing every page's local seed-state pattern; server-side filter/sort execution once record volumes make client-side filtering impractical

---

## Full Gap Audit

Consolidated, most consequential first — many are elaborated above; this list is for at-a-glance reference.

| # | Gap | Severity |
|---|---|---|
| 1 | Saved Views aren't persisted anywhere — reset on every navigation away and back | Critical |
| 2 | Non-Deal pipelines (`ObjectBoard`) have no saved-views layer at all, root-causing the custom-object-pipeline persistence gap found in Module 21 | High |
| 3 | Search icon's tooltip claims "(Cmd+K)" but that shortcut opens the Command Palette instead | Medium — actively misleading |
| 4 | Quick Add and Command Palette open different UI surfaces (drawer vs. full page) for identically-labeled "New Contact/Lead/Company/Deal" actions | Medium |
| 5 | Notification bell shows a static dot, not a real unread count | Medium |
| 6 | `NotifDrawer`'s read/unread state resets on every close/reopen, undermining "Mark all read" | Medium |
| 7 | Global Search has no keyboard navigation (click-only), unlike the Command Palette | Low–Medium |
| 8 | "Whole team" saved-view sharing is an untested cosmetic label — no second user exists anywhere to verify it works | Low (expected for a single-user prototype, but should be labeled as such) |
| 9 | Activity Timeline cross-linking is inconsistent by object kind — Lead and Custom Object records get none, Contact gets the most | Medium |
| 10 | `TimelineComposer`'s Email/Call tabs only appear for Contact — Deal/Company/Lead/Custom can't log a call or email directly against the record | Medium |
| 11 | Om engine's filter/sort isn't memoized — a predictable performance cliff at real data volumes | Medium (not urgent at current scale, but should be scheduled) |
| 12 | AND/OR filter grouping is flat, no nested groups possible | Low |
| 13 | Billing's payment-failed banner has no dismiss/snooze mechanism | Low |
| 14 | `NrturMark` has no light-mode variant | Low (cosmetic) |

---

## Developer Q&A

**Q: Of everything in this module, what's the single highest-priority fix?**
A: Saved Views not persisting. Every other gap here is either invisible during normal single-session use (the Om engine's memoization, the flat AND/OR grouping) or a minor rough edge (the Cmd+K tooltip, the fake unread dot). This one is different: it's a core, expected CRM capability — "save this filtered view so I don't have to rebuild it" — that looks completely normal and functional right up until a page reload silently erases it. A user has no way to know this in advance.

**Q: The custom-object-pipeline persistence gap was flagged in Module 21 as an isolated issue. Is it actually isolated?**
A: No — this module's research traced it to its actual root cause: `ObjectBoard` (the generic board component every non-Deal pipeline renders through) simply never got the saved-views wiring that `PipelinePage` has. Custom Object pipelines are the only non-Deal pipelines that still exist (Leads/Contacts/Companies were removed from the "New pipeline" picker), so the gap now surfaces on any custom-object pipeline — it's not specific to any one custom object, it's specific to "any pipeline that isn't the built-in Deal pipeline." Worth knowing before scoping a fix, since fixing `ObjectBoard` once fixes it for every affected pipeline type at once.

**Q: Role Preview is called out here as one of the better-built features in the app. Why does that matter for documentation purposes?**
A: Because it's useful to have at least one clear positive reference point when auditing a codebase this thoroughly — not everything here is a gap. Role Preview demonstrates the team understood the difference between a cosmetic feature and a functionally real one, and built the harder, real version (113 call sites, route-level blocking, scope-aware list filtering) rather than the easier cosmetic one. That's the same bar the Saved Views feature and the Suppression/Frequency-Cap settings from Module 22 should have been held to, and weren't.

**Q: Given the Activity Timeline's inconsistent cross-linking and composer tabs, what would "done" look like for this feature?**
A: Every object kind getting the same treatment Contact already has: cross-linked data pulled from every meaningfully-related record type (not just some), and all four composer tabs (Note/Email/Call/Task) available wherever the underlying record type could plausibly receive an email, call, or scheduled meeting. Custom Objects are the one legitimate exception worth deciding deliberately — a "Project" custom object being emailable doesn't obviously make sense, so a per-object-type declaration of which composer tabs apply (rather than the current implicit "only if Contact" pattern) is probably the right long-term shape.

**Q: This completes the full 24-module inventory. Is there anything left undocumented in the codebase?**
A: Not per the original inventory's scope — every module and sub-item is now marked documented. What this module's research did surface, though, is a set of *cross-cutting* patterns that don't map cleanly onto any single inventory item: the "settings that claim enforcement but have none" pattern (Module 22), the "two independently-built copies of the same flow" pattern (Modules 22/23), and now the "saved views don't persist" and "non-Deal pipelines lack persistence" findings here. A short synthesis pass across all 24 modules — pulling every cross-cutting pattern into one place — would be a natural next step if a single prioritized punch list is useful, separate from the per-module docs themselves.
