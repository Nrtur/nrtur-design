# System Overview

## What this is
Nrtur is a CRM **prototype** delivered as a single self-contained file, `index.html` — React 18 + Babel Standalone + Tailwind, all via CDN. There is **no backend, no network, no router library**. Every "page" is a React component chosen by a `page` string in `App()`. All data is hardcoded constants; actions mutate React state and reset on reload.

## Routing
- `App()` holds `const [page,setPage]=useState('landing')` and `goTo(p)` (sets page + scrolls top). Every page receives `{goTo}`.
- Pages are rendered by a flat list of `{page==='x' && <XPage .../>}` lines.
- `ALL_PAGES` (array) backs **`DevNav`** — a floating bottom-left page switcher for previewing any page.
- `MARKETING_PAGES` (landing/signup/signin/forgot/onboarding) render outside the themed `.app-shell` wrapper; all other pages render inside it.

## Shared shell
- **`AppSidebar`** — left icon rail: logo, quick-add (+) menu, **Search**, nav (Dashboard, Contacts, Pipeline, Calendar, Inbox, Reports), and at the bottom Notifications bell, **light/dark toggle**, Settings, profile avatar. `active` prop highlights the current item.
- **`AppTopbar`** — title/subtitle + optional `rightSlot` actions. (Search/notifications/profile were moved into the sidebar.)
- **`AppFooter`** — status strip.
- **`SettingsShell`** — wraps all `settings-*` pages with a vertical settings sub-nav beside the content.

## Theming (light/dark)
- Toggle in the sidebar sets `data-theme` on `<html>` (persisted to `localStorage['nrtur-theme']`; a head bootstrap applies it pre-paint).
- Dark is the default and unchanged. Light is a `[data-theme="light"] .app-shell`-scoped stylesheet that remaps `text-white/*`, `bg-white/*`, `border-white/*`, status tints, etc., plus **CSS surface variables** (`--s950…--s800`, `--pop`, `--hdr*`, `--panel*`, `--field*`, `--cal-pill`). Inline surface backgrounds use `var(--sXXX)` so they flip automatically. Marketing pages stay dark (outside `.app-shell`).
- **When adding UI:** prefer the `white/*` utilities and `var(--sXXX)` surfaces over raw hex so both themes work for free.

## Shared state & utilities
- **`BillingContext`** — `{billingState,setBillingState}`; drives the billing page states and an app-wide payment-failed banner.
- **`MailAccountsContext`** — `{accounts,connect,disconnect}`; connected mailboxes shared by the Inbox rail and Settings → Integrations.
- **`useConfirm()`** → `{confirmNode,openConfirm}` — standard destructive-action confirm modal (`ConfirmModal`).
- **`useToast()`** → `{toasts,addToast}` + `ToastContainer` — transient success/info toasts. (Some pages use a local `showToast` instead.)
- **`Toggle`**, **`GlowBg`**, icon set **`I`**, **`NrturMark`** (logo), **`Skel`** (skeleton loaders), **`useSkeleton`** (fake load delay).
- **Global Search** (`GlobalSearchOverlay`) and **Command Palette** (`CommandPalette`, ⌘K) overlays opened from the sidebar/keyboard.

## Global flows
1. **Acquisition:** `landing` → `signup`/`signin`.
2. **Setup:** `signup` → `onboarding-1…5` → `dashboard`.
3. **Daily use:** sidebar navigation across Dashboard/Contacts/Pipeline/Calendar/Inbox/Reports; Settings for configuration.
4. **Capture:** sidebar **+** quick-add opens in-place modals (new contact/deal/email/call/import) from anywhere.

## Cross-cutting suggestions (apply to most pages)
1. **Real persistence** — back state with an API + DB so data survives reload; optimistic UI with rollback.
2. **Auth & RBAC** — real sign-in, roles (Admin/Member), per-feature permissions (Team page already names roles).
3. **Empty / loading / error states** — every list/detail should have all three (skeletons exist; errors don't).
4. **Search everywhere + keyboard shortcuts** — extend the command palette to deep-link records and actions.
5. **Audit log & activity** — record who changed what (Team page hints at this).
6. **Accessibility** — focus traps in modals, ARIA roles, keyboard nav for grids/kanban/calendar.
7. **Responsive/mobile** — the shell is desktop-first; define mobile layouts for sidebar, kanban, calendar, inbox panes.
8. **Undo** — toasts should offer Undo for destructive/stateful actions (delete, archive, move stage).

These are referenced (not repeated) by each page doc.