# Handoff: Permissions & Permission Matrix redesign (nrtur CRM)

## Overview

Redesign of two existing settings screens in the nrtur CRM prototype to make them understandable for non-technical admins:

1. **Settings → Permissions** (`SettingsPermissionsPage`) — the role editor. The 8-object × 4-action toggle grid (32 raw toggles + per-row scope dropdowns) is replaced by a plain-language editor built around **access levels** (None / View / Edit / Full) with one master control for all record types.
2. **Settings → Permission Matrix** (`PermissionMatrixPage`) — the read-only comparison grid. Cryptic V/C/E/D pips and ◑/eye/dash symbols are replaced by **word badges** (Full / Limited / View only / No access), and model-vs-enforcement divergences become a friendly callout.

## About the design file

`Permissions Redesign.dc.html` in this folder is a **design reference created in HTML** — a self-contained prototype showing intended look and behavior. Do NOT copy it into the codebase. **Recreate it inside the existing app in `index.html`**, using that file's established patterns: React (in-file Babel), Tailwind CDN utility classes, the `I.*` icon set, `SettingsShell`, `Toggle`, `useConfirm`, `AnchoredMenu`, and the existing permission constants. The reference file uses inline styles and its own theme variables — translate these to the codebase's Tailwind classes so the existing `[data-theme="light"]` override stylesheet handles light mode automatically.

## Fidelity

**High-fidelity.** Recreate layout, hierarchy, copy, and color semantics faithfully — but express them with the codebase's own utilities (e.g. `bg-white/[0.02]`, `border-white/[0.06]`, `rounded-2xl`, `text-[13px]`) rather than the reference's inline styles, so both themes keep working.

## Where things live in `index.html` (branch as of this handoff)

- Permission constants: `PERM_OBJECTS`, `PERM_ACTIONS`, `PERM_SCOPES`, `PERM_REPORT_ACTIONS`, `PERM_FEATURE_SINGLE`, `PERM_SENSITIVE_VISIBLE`, `permObjAll`, `rolePerms`, `PERM_ROLE_SEED`, `permClone`, `permObjCount`, `permSummary` — around **line 15060–15095**.
- Components to replace/rework: `PermScopeSelect`, `PermToggle`, `PermRoleModal`, `SettingsPermissionsPage` (~**15124**), `PermissionMatrixPage` (~**15308**).
- Routing: `page==='settings-permissions'` and `page==='settings-permission-matrix'` (~**23346**). Keep both routes.
- Reused as-is: `SettingsShell`, `Toggle`, `useConfirm`, `NavConfigContext` "Default navigation" card (keep it at the top of the Permissions page unchanged), `CrmDataContext.customObjects`, `CURRENT_USER_ROLE`, `roleColorOf`, Team members list in `SettingsTeamPage` (source for people counts).
- Theme: **do not add any dark/light toggle to these pages.** The app's existing theme system (`[data-theme="light"]` overrides + Appearance settings) is the only theme selector.

## Core model mapping (levels ↔ existing CRUD booleans)

Keep the stored model exactly as it is (`perms.objects[obj] = {view,create,edit,delete,scope}`). The UI works in levels:

- Derive level from CRUD: `delete→'Full'` else `edit||create→'Edit'` else `view→'View'` else `'None'`.
- Writing a level sets CRUD: None=`{v:0,c:0,e:0,d:0}` · View=`{v:1,c:0,e:0,d:0}` · Edit=`{v:1,c:1,e:1,d:0}` · Full=`{v:1,c:1,e:1,d:1}`.
- Scope stays `Own | Team | All`, displayed as "Only their own / Their team's / Everyone's".

## Screen 1 — Settings → Permissions (role editor)

Wrapped in `SettingsShell active="settings-permissions"`, subtitle: "Decide what each type of teammate can see and do — in plain terms."

**View switcher (replaces nothing — new):** a segmented control with two options, "Set up a role" (pencil icon) and "Compare all roles" (grid icon), rendered via `SettingsShell`'s `actions` prop on BOTH pages. Active pill: `bg-white/[0.05] ring-1 ring-white/[0.10] text-white`; inactive: `text-white/55`. Switching calls `goTo('settings-permissions')` / `goTo('settings-permission-matrix')`.

**"How it works" strip** (top of content): one row card (`rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-3`) with three numbered items (19px brand-tinted numbered circles): "1 Everyone on your team has one role · 2 The role decides what they can see and do · 3 Not sure? Compare all roles side by side" — item 3's "Compare all roles" is a link-button to the matrix page.

**Layout:** left rail 262px + flexible detail column, `gap-5`.

### Left rail — role list
- Card (`rounded-2xl p-1.5`) listing all roles: 11px color dot (glow `0 0 9px <color>99` when selected), name (13px semibold), plain tagline (11px, `text-white/40`), right-aligned count chip.
- Taglines: Owner "Owns the workspace" · Admin "Runs the workspace" · Sales Manager "Leads the whole team" · Team Lead "Leads one team" · Sales Rep "Works their own deals" · Read Only "Look, don't touch".
- Count chip: computed from the Team page members array (`role` field): Owner shows "You" (from `CURRENT_USER_ROLE`), others "N people"; hide when 0. Custom roles show "Custom".
- Below the list: dashed-border button **"Duplicate "{selected}" as a new role"** (copy icon, brand text). Wire it to the existing `PermRoleModal` in duplicate mode (keeps the naming step). Caption below (11px `text-white/38`): "Custom roles never get billing or admin access, whatever you switch on."

### Summary banner (top of detail column)
- Role chip (colored pill) + "Custom" mini-badge for custom roles + muted stat line `"{n} of 8 record types · {m} of 11 abilities"`.
- **Live plain-English sentence** (15px semibold), rebuilt on every change:
  - Uniform: `{Prefix} {levelPhrase}{scopePhrase}.` Prefixes: "The Owner / Admins / Sales Managers / Team Leads / Sales Reps / Read Only members / People with this role". Level phrases: None "can't access records at all" · View "can look at records, but not change anything" · Edit "can view, add and edit records" · Full "can do everything with records, including delete". Scope phrases: Own " — but only the ones they own" · Team " — for their whole team" · All " across the whole workspace".
  - Mixed levels: `{Prefix} have custom access for each record type — see the list below.`
  - Owner appends: " They also manage billing and the plan."
- Caption: "This summary updates live as you change the settings below."
- Actions right: **Discard** (ghost, only when dirty — restores the snapshot taken at load/save) + **Save changes** (brand button, disabled → "All saved" when clean, existing toast on save).
- For custom roles: bottom row with red text-button "Delete this role" → first click becomes "Really delete this role? Click again to confirm", second click deletes (or reuse `useConfirm`).

### Owner lock
When Owner is selected: an info card under the banner — lock icon + "The Owner always has full access, so these settings are locked. To change who owns the workspace, transfer ownership from **Settings → Team**." All level buttons, scope selects, and feature toggles render disabled (`opacity-50 cursor-not-allowed`, handlers no-op).

### Card: "What records can they work with?"
Sub: "Pick one level for everything — most teams need nothing more. You can fine-tune per record type below." Inline legend: `None` no access · `View` read only · `Edit` add & change · `Full` + delete (9px color squares: slate/grey, slate-blue, amber, emerald).

- **Master row "All record types"** (highlighted `bg-white/[0.045]`): brand-tinted grid icon, subtitle showing current state ("Can view, add & edit" or "Mixed — different per record type"), a 4-option segmented control (None/View/Edit/Full), and the scope select. Segment active state is color-coded by meaning: None `#64748b` on `rgba(255,255,255,0.03)` · View `#94a3b8` on `rgba(148,163,184,0.14)` · Edit `#fbbf24` on `rgba(245,158,11,0.14)` · Full `#34d399` on `rgba(16,185,129,0.14)` (light theme: `#94a3b8/#f8fafc`, `#475569/#f1f5f9`, `#b45309/#fffbeb`, `#047857/#ecfdf5`). Master click applies to all 8 objects. When mixed, no segment is active and scope cell shows "Varies by type".
- **Read Only guard:** if role is Read Only and any level is Edit/Full, amber strip under the master row: "Unusual setup: **Read Only** normally can't change anything, but you've allowed editing here. Double-check that's intended." (Replaces the old toast.)
- **Expander:** "Fine-tune by record type" / "Hide record types" (chevron rotates). Forced open with label "Shown while access varies by type" when mixed. Inside: one row per object in `PERM_OBJECTS` — 2-letter initial tile, object name, current-level subtitle ("Can view, add & edit"), same segmented control + scope select. Keep the existing **custom objects** rows appended here (from `CrmDataContext.customObjects`, `coPermKey`) with the same controls.
- Footer strip: info icon + "Your custom objects follow the same rules as **Contacts**." (This surfaces the `effCanCustom→Contacts` proxy.)

### Card: "What else can they do?"
Sub: "Abilities that apply across the whole workspace, not just one record type." Three uppercase group headers with `Toggle` rows (13px label + 11.5px description):

- **Reports & dashboards:** View / Create / Edit / Share reports. **Coherence rule:** switching View off also switches Create/Edit/Share off; switching any of those on switches View on.
- **Team & workspace:** Invite & manage people · Change workspace settings · Manage sequences & automations · Manage tags & statuses. For the last two, when enabled on a role that is not Owner/Admin, show an amber inline note under the description: "Today only Owner and Admin can actually manage this — for every other role the page opens read-only." (matches the `settingsIsAdmin` gate divergence).
- **Data:** Export to a spreadsheet · Delete in bulk · See sensitive fields.

### Card: Billing
Single row: card icon, "Manage billing & plan" + small lock icon. Owner: note "The Owner is the only role that can manage billing — this can't be turned off." + emerald "Always on" pill. Others: "Only the Owner can manage billing. Transfer ownership to change who." (custom roles: "Custom roles can never manage billing.") + muted "Owner only" pill. No functional toggle.

### Card: "Can they see private numbers?"
Preview row: "ANNUAL REVENUE" label with lock icon; shows **$8,400,000** (13px bold) when the selected role has sensitive access, else monospace muted "•••••• hidden". Caption: "This is what a **{Role}** would see on a record." Drives off the selected role's `sensitive` flag (replaces the separate "Preview as" dropdown).

## Screen 2 — Settings → Permission Matrix

Wrapped in `SettingsShell active="settings-permission-matrix"`, same view-switcher in `actions`. Built-in roles only.

1. **Role summary cards:** 3-column grid; each card = role pill + one-line plain summary (same sentences as rail: "Can do everything — including billing and deleting the workspace." etc.).
2. **Heads-up callout** (amber card, warning triangle): title "A few things still work differently than the settings suggest", bullets:
   - "Sales Managers can be granted "manage sequences, automations, tags & statuses" in the role settings, but those pages currently open read-only for them."
   - "Billing is meant for the Owner only, yet an Admin can still open the billing page today."
   - "Report permissions (view / create / edit / share) are shown per role but aren't all enforced yet — only CSV export is fully wired."
3. **Legend + search row:** word-badge legend (Full "can do everything" · Limited "scoped or partial" · View only "can look, not change" · No access "hidden or blocked") left; search input right, placeholder `Find an ability… try "export"`. Search filters rows by label+description; empty state: "Nothing matches "{q}"." / "Try another word — like "export", "billing", or "delete"."
4. **Table:** sticky header (role pills) and sticky first column ("Ability" — **must use an opaque background**, e.g. solid `#0c0c16` dark / `#ffffff` light, so cells don't ghost through on horizontal scroll). Cells are word-badge pills, with 10px scope subtext under record cells ("All records / Team's records / Own records"). Divergent cells get a 5px amber dot inside the pill.
   - **Records** (note: "Every record type — contacts, leads, companies, deals and tasks — currently shares one rule per role. Custom objects follow the Contacts rule.") — **one collapsed row** "All record types" (desc "Contacts, leads, companies, deals & tasks"). Cell logic: None→"No access" · View→"View only" · Full+All→"Full" (emerald) · anything else→"Limited" (amber).
   - **Tools & features:** Reports & dashboards (Full if all four report flags, Limited if partial, View only if view-only) · Sequences & automations (Owner/Admin "Can manage", others "View only" + amber dot where the model grants manage) · Email & SMS templates · Forms · Duplicates & suppression (all: Owner/Admin "Can manage", others "View only").
   - **Data:** Export to a spreadsheet ("Allowed"/"—") · Delete in bulk ("Allowed"/"—") · See sensitive fields ("Visible"/"Hidden"; visible for `PERM_SENSITIVE_VISIBLE` = Owner/Admin/Sales Manager/Team Lead).
   - **Administration:** Personal settings (everyone "Full") · Invite & manage people · Edit roles & permissions (Owner/Admin "Can edit", others "View only") · Workspace settings · Manage tags & statuses (+ amber dot for Sales Manager) · Billing & plan (Owner "Full", Admin "Can open" amber + dot, others "—").
5. Footnote: "Amber dot = works differently today (see the note above). Custom roles follow the same model, but never get admin access to workspace settings or billing."

## Interactions & state

- Local React state per page (match existing pattern): `roles` (cloned from `PERM_ROLE_SEED`), `selKey`, `dirty`, plus new: `baseline` snapshot map (for Discard), `showTypes` (expander), `confirmDel`, `q` (matrix search).
- All writes remain in-memory + save toast, exactly like today. Keep `NAV_ADMIN_ROLES` untouched; custom roles stay non-admin, `billing=false`.
- Badge/segment colors are data-driven — use inline `style` objects for those (the codebase already does this for role colors); everything structural uses Tailwind classes so light mode works.

## Design tokens (dark / light)

- Level & badge colors — Full: `#34d399` on `rgba(16,185,129,.14)` ring `.32` / `#047857` on `#ecfdf5`; Limited: `#fbbf24` on `rgba(245,158,11,.14)` / `#b45309` on `#fffbeb`; View: `#94a3b8` on `rgba(148,163,184,.14)` / `#475569` on `#f1f5f9`; None: `#64748b` on `rgba(255,255,255,.03)` / `#94a3b8` on `#f8fafc`.
- Warning: `#fbbf24` on `rgba(245,158,11,.10)` / `#b45309` on `#fffbeb`. Danger text `#f87171` / `#dc2626`.
- Everything else: existing tokens (brand `#6366f1`, cards `bg-white/[0.02]` + `border-white/[0.06]`, `rounded-2xl`, Inter).
- Pills: `rounded-full px-2.5 py-0.5 text-[11px] font-semibold` + inset 1px ring of the badge color.

## Acceptance checklist

- [ ] Both routes render inside `SettingsShell` with the segmented view switcher; old pages fully replaced.
- [ ] Levels round-trip correctly to `{view,create,edit,delete}`; scope select hidden when level is None.
- [ ] Master row sets all objects (including custom objects); mixed state forces the per-type list open.
- [ ] Live summary sentence correct for every built-in role and for mixed/custom states.
- [ ] Owner fully locked with explainer; Read Only edit-grant shows the amber warning.
- [ ] Report toggle coherence rule works both directions.
- [ ] Gate notes appear under "Manage sequences/automations" and "Manage tags & statuses" for non-Owner/Admin roles when enabled.
- [ ] Duplicate (via existing modal), delete custom role, Discard, Save all work; custom roles never get billing.
- [ ] Matrix: collapsed records row, word badges + scope subtext, amber dots on the three divergences, search with empty state, sticky first column with **opaque** background, personal-settings row all-Full.
- [ ] Light mode via existing `[data-theme="light"]` overrides — no theme toggle on these pages.
