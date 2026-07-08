# Permissions & Permission Matrix redesign

_Implemented 2026-07-07 from `File review request/design_handoff_permissions_redesign/` (README + `Permissions Redesign.dc.html` reference)._

## How it was
- **Settings → Permissions** (`SettingsPermissionsPage`): an 8-object × 4-action grid = 32 raw `view/create/edit/delete` toggles + a per-row scope dropdown. Powerful but opaque for non-technical admins; the "Read Only edit" heads-up was a transient toast.
- **Settings → Permission Matrix** (`PermissionMatrixPage`): a dense read-only grid of `V C E D` pips + `◑ / eye / —` symbols and per-cell divergence triangles.

## How it is now
Both screens rebuilt with the codebase's own React + Tailwind patterns (no HTML from the reference copied in), same routes, same `SettingsShell`, same **persisted** `PERM_ROLE_SEED`/`rolePerms` model (R9-L3), same `PermRoleModal`, same custom-object rows, same `[data-theme="light"]` theme system (no theme toggle added).

**Editor** — a **segmented view switcher** ("Set up a role" / "Compare all roles") lives in the shell topbar on both pages. Access is expressed as **levels** (None / View / Edit / Full) derived from the stored CRUD booleans (`permLevelOf` / `permLevelWrite`), with `Own | Team | All` scope shown as "Only their own / Their team's / Everyone's". A **master "All record types"** row sets all 8 objects **and** custom objects at once; setting them unevenly flips to "Mixed", forces the per-type list open ("Shown while access varies by type"), and the scope cell reads "Varies by type". A **live plain-English sentence** rebuilds on every change (per-role prefixes/phrases; Owner appends billing). **Owner is fully locked** with an explainer (all controls disabled). **Read Only + edit** shows the amber warning inline. Report toggles enforce the **coherence rule** (View off → clears Create/Edit/Share; any of those on → View on). **Manage sequences/automations, tags & statuses, and phone numbers** show the amber gate note for non-Owner/Admin roles when enabled. Billing is a status row (Always on / Owner only). A sensitive-field preview shows `$8,400,000` vs `•••••• hidden` for the selected role. Discard restores the load/save snapshot; Save persists to the shared store + toast.

**Matrix** — role summary cards, an amber "heads-up" callout (the 3 real divergences), a **word-badge** legend (Full / Limited / View only / No access), and a search box. The table has a sticky header + **opaque** sticky first column (`var(--s925)`); cells are word-badge pills with 10px scope subtext ("All records / Team's records / Own records"), and an amber dot marks the model-vs-enforcement divergences (Sales-Manager manage grants, Admin billing). One **collapsed** "All record types" records row; Personal-settings row is Full for everyone.

## Verification (headless CDP, root-scoped)
Node-level: level round-trip `None/View/Edit/Full`; all six role sentences + mixed + custom sentence; people chips (You / 1 person / 4 people / Custom); Owner=12 abilities, Rep=1; sensitive fallback. DOM-level: switcher, how-it-works, rail, banner, master segment (4) + scope selects, abilities, billing, sensitive-hidden, custom-objects footer; expander opens per-type list (incl. custom "Projects"); Contacts→None flips master to Mixed + Varies + forces open + mixed sentence + hides that row's scope; Discard restores; report coherence 9→5→7 on Sales Manager; gate note present; Owner lock (40 disabled segments, Always on, revenue visible); Read Only edit-warning; duplicate→custom role (billing note, Custom chip)→delete returns to 6 roles; Save persists + toast; matrix heads-up (3 bullets), legend, records row, scope subtext, phone row, Admin "Can open" billing, 3 amber dots, opaque sticky column, search filter ("export") + empty state; light theme renders. Boots with zero runtime errors.

## What you still decide
- The reference file is **not shipped** (recreated in-app per the handoff).
- Nothing committed — lives in your working `index.html`.
