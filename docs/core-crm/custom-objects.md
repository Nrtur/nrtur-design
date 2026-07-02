# Module 21 — Custom Objects

_Builder: `SettingsCustomObjectsPage`/`CustomObjectEditor` (line 20495) · List: `CustomObjectListPage` (line 20658), route `custom-object` · Detail: `CustomRecordDetailPage` (line 20762), route `custom-record`_

This doc goes deeper than the standard three-layer format for one reason: the user asked specifically for a full gap audit, a relationships deep-dive, and a competitive best-practices comparison. Those live in their own dedicated sections below, after the standard per-feature breakdown.

### Data model

| Concept | Where it lives | Shape |
|---|---|---|
| Object type definitions | `customObjects` array in `CrmDataContext`, seeded by `coSeedObjects()` (line 20444) | `{id, singular, plural, icon, color, primaryLabel, visibility:'everyone'\|'admins', fields:[{id,key,label,type,options,detail,col,required}], relationships:[{id,key,label,target,many}], records:[...]}` |
| Record instances | **Nested inside their parent object definition** — `records[]`, not a flat top-level array with a type discriminator | `{id, name, owner, ownerColor, tags[], createdBy, createdAt, agoMin, archived, deleted, deletedAt, deletedBy, acts[], <field.key>: value, <rel.key>: id\|id[]}` |

Every field's value and every relationship's value are flat dynamic keys directly on the record — there's no nested `fields: {}` sub-object. A module-level mirror, `_liveCustomObjects` (line 1475), lets non-React helpers (nav, search) read live data outside the context tree.

---

## 21.1 Custom Object Builder

### Surface inventory

| Element | What it is |
|---|---|
| Identity fields | Singular name, Plural name (auto-suggests singular+'s'), Primary field label, Icon (24 fixed options), Color (10 fixed swatches), Visibility (`everyone`/`admins`) |
| Name-collision guard | Blocks a singular/plural that matches a reserved built-in name or another custom object's name, case-insensitively |
| Field list | Reuses `NewPropertyDrawer` verbatim — same 14 field types as standard-object properties: Text, Long text, Number, Currency, Single select, Multi select, Date, Date range, Boolean, Email, Phone, URL, Lookup, Autocomplete |
| Relationship list | `CoRelForm` — label, target object, "Allow many" toggle (see the Relationships section below) |
| Hardcoded caps | `CO_MAX_OBJECTS=5`, `CO_MAX_FIELDS=25`, `CO_MAX_RELS=5` — "New object"/"Add field"/"Add relationship" buttons disable at these ceilings |
| Delete object | Permanent, immediate — no Recycle Bin step (only records get one) |

### Design decisions

| Decision | Alternative | Why this | Tradeoff |
|---|---|---|---|
| Reuse `NewPropertyDrawer`/`PROP_TYPES` verbatim instead of a custom-object-specific field type list | Build a dedicated, possibly leaner type list for custom objects | One type registry to maintain, automatic parity with standard-object fields | Inherited dead weight comes along for free — "Lookup" and "Autocomplete" are decorative even for standard objects (render as plain text, see Gap Audit #23), so every custom object's field picker offers two non-functional options with no warning |
| Hardcoded low caps (5 objects / 25 fields / 5 relationships) | No cap, or a much higher one | Keeps the prototype's UI predictable — fixed-width pickers, no pagination needed anywhere in the builder | Far below every competitor surveyed (see Best Practices below) — a real customer modeling 2–3 meaningfully different record types (Projects, Assets, Vendors) could hit the 5-object ceiling almost immediately |
| Object deletion is instant and permanent | Soft-delete through Recycle Bin, matching every other delete flow in the app | Simpler — deleting a schema is conceptually different from deleting a record | This is the **only unrecoverable delete action in the entire application** — a misclick permanently destroys the object's field definitions, every one of its records, and orphans any other object's relationship pointing at it (Gap Audit #2–3) |

### Frontend — what needs to be built

- `CustomObjectEditor`: identity form, field list (reusing `NewPropertyDrawer`), relationship list (`CoRelForm`), cap enforcement
- Fix the `NewPropertyDrawer` delete-button wiring (Gap Audit #24) before relying on the in-drawer delete path

### Backend — what needs to be provided

- `POST/PATCH/DELETE /custom-objects` — object definition CRUD; DELETE should cascade-check for other objects' relationships pointing at it (currently unchecked, see Gap Audit #2) and should soft-delete, not hard-delete
- Schema migration handling: what happens server-side when a field is removed from an object that has thousands of existing records referencing it in a pipeline board (see 21.5)

---

## 21.2 Custom Object List Page

### Surface inventory

Confirmed to reuse the Om filter/sort engine (`omApplyFilter`, `omSortRows`, `OmSortHeader`, `OmFiltersButton`) — same underlying engine as Contacts/Deals/Leads/Companies. Supports Table/Board toggle (Board only appears if the object has a Single-select field), search, archive/active toggle, row-level archive/restore, and bulk actions (set owner/add tag/remove tag/archive/delete).

### What's missing vs. built-in object lists

| Capability | Contacts/Deals/Leads/Companies | Custom Objects |
|---|---|---|
| Saved/shared/private views | Yes (`useSmartListMgr`, `OmViewMenu`) | No — only ephemeral session filter/sort state |
| Column customization + persistence | Yes (`ColumnsControl`, `colsMap`, `freezeFirst`) | No — fixed derived column list |
| CSV import | Yes (`IMPORT_OBJ`) | No — not in the hardcoded 4-key map |
| CSV export | Yes (`ieObjMeta`) | No — same hardcoded 4-key map |
| Merge/dedupe | Yes for Contacts/Leads/Companies (`DUP_FIELDS`) | No |

### Design decisions

| Decision | Alternative | Why this | Tradeoff |
|---|---|---|---|
| Reuse the Om filter/sort engine but not the full saved-views/column-customization layer | Build full parity with built-in object lists | Filter/sort/board/table already delivers most of the day-to-day value for a fraction of the engineering effort | The moment a user tries to save a filtered view or reorder columns on a custom object, the experience visibly downgrades — jarring for a feature pitched as making custom objects "first-class" |
| No CSV import/export for custom objects | Generalize the existing import/export machinery to any dynamic schema | `IMPORT_OBJ`/`ieObjMeta` were written against 4 known, fixed schemas; a fully dynamic custom-object schema needs a schema-introspecting importer | The most common reason someone creates a custom object — migrating an existing spreadsheet tracker — has no bulk path in or out, undermining the exact use case custom objects exist to serve |

### Frontend — what needs to be built

- Generalize `useSmartListMgr`/`OmViewMenu`/`ColumnsControl` to accept a dynamic field schema instead of a fixed per-object column set
- Extend `BulkImportWizard`'s object-type branch and `ieObjMeta` to accept any `customObjects` entry

### Backend — what needs to be provided

- `GET/POST /custom-objects/:id/records` with the same filter/sort/pagination contract as built-in object list endpoints
- CSV import/export endpoints that read the object's `fields[]` schema dynamically rather than assuming a fixed shape

---

## 21.3 Custom Record Detail Page

### Surface inventory

Confirmed present: `CoProperties` (field display), `ActivityTimeline kind="custom"`, `CoLinksPanel` (relationships), `RecordTasks`.

### What's shallow vs. built-in object detail pages

| Capability | Contact/Company/Deal | Custom Record |
|---|---|---|
| Activity timeline depth | Cross-pulls activity from linked deals/companies/contacts/invoices | `actCustomOwn`: a "Record created" event + whatever's manually pre-seeded in `rec.acts[]`, plus notes/tasks logged in-session (now persisted in the shared `CrmDataContext.activities` store, so they survive leaving and returning to the record) — but still **no live field-change logging on edit** |
| Communication tabs | Email, Call, Schedule tabs on the timeline composer | **Notes only** — `onEmail`/`onLogCall`/`onSchedule` props are never passed, so those tabs never render |

### Design decisions

| Decision | Alternative | Why this | Tradeoff |
|---|---|---|---|
| `actCustomOwn` is a minimal stub (created-event + manual `acts[]` + persisted in-session notes/tasks; no per-kind cross-pulling) | Retrofit the richer per-kind activity logic that Contact/Company/Deal already have | The richer logic predates custom objects and wasn't generalized when custom objects shipped | Manually logged notes/tasks now persist, but *editing a field* on a custom record still leaves **no trace** in its own timeline — a real problem if a workspace relies on a custom object for anything that needs a field-level audit trail (e.g. "who changed this Project's Stage and when") |
| Custom records get a Notes tab only, no Email/Call/Schedule | Wire the same `onEmail`/`onLogCall`/`onSchedule` handlers used elsewhere | Email/SMS threading logic assumes a contact-shaped record with an email/phone field, which a custom object may not have | A custom object modeling something contactable (a "Vendor" or "Partner" object) can't log a call or email against it directly — communication history splits awkwardly between the custom record and a linked Contact |

### Frontend — what needs to be built

- Live field-diff logging on `CustomRecordDrawer.save` — append an activity event when a tracked field changes
- Conditionally wire `onEmail`/`onLogCall`/`onSchedule` for custom objects that have an email/phone-type field

### Backend — what needs to be provided

- `POST /custom-records/:id/activity` — server-side field-diffing on update, generating timeline events automatically rather than relying on manual seeding

---

## 21.4 Permissions & Scoping

`effCanCustom(act)` is a **literal, one-line proxy**: `return effCanObject('Contacts',act);` — every custom object in the workspace is governed by whatever CRUD permissions a role has on Contacts. Scoping (Own/Team/All) is real and correctly applied (`effScopeRows('Contacts', ...)`), but it's also always Contacts' scope setting.

A separate, coarser mechanism exists alongside this: `coCanView(def)` — a per-object (not per-role) binary visibility lock set in the builder ("Who can see this: everyone / admins only"). This is independent of the CRUD/scope proxy and only gates raw visibility.

### Design decisions

| Decision | Alternative | Why this | Tradeoff |
|---|---|---|---|
| All custom objects proxy to the Contacts permission object | A first-class "Custom Objects" row (or per-object rows) in the Permission Matrix | Avoids building a dynamic permission UI that has to grow/shrink as objects are added/removed at runtime | An admin configuring roles has **zero visibility** that adjusting Contacts access also silently governs every custom object — `PERM_OBJECTS` (the Permission Matrix's row list) doesn't even mention custom objects, so this dependency is undiscoverable from the settings UI itself |
| One visibility toggle (`everyone`/`admins`) per object, layered on top of the Contacts proxy | Per-role, per-object CRUD (matching how built-in objects work) | Cheap to build, covers the common "hide this from non-admins" case | Can't express "Sales Reps can view Projects but not edit them" or "Team Leads get All-scope on Projects but only Own-scope on Contacts" — any nuance beyond a binary visibility lock is unsupported |

### Frontend — what needs to be built

- If per-object permissions are adopted: a dynamic Permission Matrix row generator that reads `customObjects` and renders one row per object

### Backend — what needs to be provided

- Server-side enforcement of whatever permission model is chosen — today `effCanCustom`/`coCanView` are both client-side only

---

## 21.5 Pipeline Integration

Every custom object can get a pipeline — `NewPipelineModal` lists all custom objects unconditionally, no gating on field types. But there's no dedicated "stage" field type: the pipeline's board columns come from **any** Single-select field on the object (`ObjectBoard`'s `desc.groups`). If the object has zero Single-select fields, the board falls back to grouping by Owner only.

**Fragility**: if the Single-select field currently used for grouping is later removed via the builder, the board's `fieldDef` resolves to `undefined` and `stageOpts` becomes empty — the pipeline silently degrades to a single uncategorized column, with no re-prompt to pick a new grouping field.

**Persistence gap**: custom-object pipelines added via "New pipeline" live in `PipelinePage`'s local `auxPipelines` state — not localStorage, not `CrmDataContext`. Reloading the page or navigating away drops any custom-object pipeline the user added.

### Design decisions

| Decision | Alternative | Why this | Tradeoff |
|---|---|---|---|
| Any Single-select field can back a pipeline, no dedicated "Stage" field type | A distinct "Stage" field type, structurally different from a generic Single-select | Reuses the field type system as-is, no new type to build | The board can silently break if the backing field is deleted, with no self-correction or warning — a real risk since nothing in the builder warns "this field is used by a pipeline" before you delete it |
| Custom-object pipelines aren't persisted anywhere | Persist to `CrmDataContext` or localStorage, matching how the field/relationship definitions themselves persist | Simplest possible implementation for a prototype | A user who builds a custom pipeline, closes the tab, and comes back finds it gone — inconsistent with literally every other piece of state in the Pipeline module |

### Frontend — what needs to be built

- Persist `auxPipelines` to `CrmDataContext`
- Warn before deleting a field that's currently used as a pipeline's grouping field; auto-prompt to pick a replacement

### Backend — what needs to be provided

- `POST/PATCH /custom-objects/:id/pipelines` — persisted pipeline configuration per custom object

---

## 21.6 Discovery — Global Search, Nav, Command Palette, Quick Add

| Surface | Status |
|---|---|
| Global search | Works — custom records surface under a "Custom records" section (scoped, respects `coCanView`); the builder page itself is searchable as a settings destination |
| More-drawer nav | Works — every viewable custom object appears as its own nav entry, correctly routes to `custom-object` |
| Command Palette (Cmd/Ctrl+K) | **Gap** — `CMD_ITEMS` is a fully static array; never reads `customObjects`. No custom object appears under Navigate, no "New {object}" appears under Create, regardless of how many exist |
| Quick Add (+ button) | **Gap** — both the single-add and multi-add lists are hardcoded to Lead/Contact/Company/Deal/Task/Email/Call; no custom-object case anywhere, including the underlying `window.__nrturQuickAdd` map |

### Design decisions

| Decision | Alternative | Why this | Tradeoff |
|---|---|---|---|
| Global search and More-drawer nav were built dynamically (read `customObjects` at render time), but Command Palette and Quick Add were left static | Build all four discovery surfaces dynamically from day one | The two dynamic surfaces were likely built after custom objects existed; Cmd+K and Quick Add predate custom objects and were never revisited | A workspace that leans on custom objects has **no fast-path creation** for them anywhere except the object's own list page — a meaningfully worse creation experience than every built-in object gets |

### Frontend — what needs to be built

- `CMD_ITEMS` needs a dynamic tail generated from `navAllDestinations()`/`customObjects` for both Navigate and Create groups
- `QuickAddMenu`'s `SINGLE`/`MULTI` arrays and `window.__nrturQuickAdd` need the same dynamic generation

---

## 21.7 Seed Demo Data — "Projects"

The only seeded custom object (`coSeedObjects`, line 20444): 5 fields (Stage, Budget, Due date, Priority, Notes), 2 relationships (Company — single, Team contacts — multi), 4 demo records. One demo record ("Internal CRM cleanup") deliberately has no Company/Contact link, demonstrating the relationship fields are optional.

---

## Relationships — Deep Dive, Gaps, and Competitive Best Practices

### How it works today

`CoRelForm` configures exactly three things: a free-text **label**, a **target** (any of the 4 built-in objects — Contact/Company/Lead/Deal — or any other custom object), and an **"Allow many"** boolean. That's the entire relationship model — there is no reverse/inverse label field anywhere (confirmed absent app-wide).

**Target combinations** — checked individually, not assumed symmetric:

| From → To | Supported? |
|---|---|
| Custom object → another custom object | Yes |
| Custom object → Contact | Yes |
| Custom object → Company | Yes |
| Custom object → Deal | Yes |
| Custom object → Lead | Yes |
| **Contact/Company/Deal/Lead → custom object** (the reverse direction) | **Not possible** — built-in objects have no relationship-field mechanism of their own; this is exclusively a custom-object-side feature |

**Storage**: a relationship instance is a plain field value on the owning record — a scalar id (single) or an array of ids (multi). It is a foreign-key-style reference, not a join/junction record — there is nowhere to attach data *about the link itself* (e.g., "this contact's role on this project," "the date this pairing started").

**Cardinality enforcement is cosmetic.** "Allow many" only decides whether the field renders a single-value picker or a multi-chip picker **on the record being edited**. Nothing prevents the target side from being linked many times over — e.g. a `many:false` Project→Company relationship doesn't stop five different Projects from all pointing at the same Company. It governs UI shape, not relational integrity.

**Bidirectionality: confirmed absent.** `CoLinksPanel` — the component that renders relationship chips — is invoked from exactly one place in the entire codebase: `CustomRecordDetailPage`. Contact, Company, Lead, and Deal detail pages contain zero references to `customObjects`, `coResolveLink`, or `CoLinksPanel`. A Contact linked to three Projects has no way of knowing it from its own detail page — the relationship is genuinely one-directional as a code path, not just a configuration choice.

### The cascade-delete bug

This is worth walking through concretely because it's a correctness bug, not a design tradeoff. When a Contact/Company/Lead/Deal is soft-deleted, nothing in the codebase touches `customObjects` to clean up references to it. `coTargetOptions` filters every target picker list by `!deleted && !archived`, so a stale reference simply fails to resolve when looked up — `coResolveLink` falls through to `return {name: String(val), nav: null}`.

The rendering consequence: `CoLinksPanel` computes `can = false` (correctly disables navigation) but displays `_r.name || String(val)` as the chip's label — which is **the raw stored id or string, not a "deleted record" placeholder**. There's no caching of the record's last-known name and no "(deleted)" annotation anywhere in the markup. In practice, a disabled chip on a Project's detail page can read as a literal internal identifier string where a person's name used to be — this looks like data corruption to anyone who sees it, not a graceful empty state.

(Recycle Bin's copy claims "restoring a record re-links its relationships" — true only by accident, since soft-delete never mutates the stored id in the first place; nothing was actually designed to restore anything.)

### Competitive comparison

| Dimension | nrtur (today) | Salesforce | HubSpot | Airtable | Zoho CRM | monday.com |
|---|---|---|---|---|---|---|
| Bidirectional by default? | No — forward-only, no reverse code path at all | No — Lookup is one-way by default; related lists auto-surface on the parent side | Yes at the data level — an association always carries two label slots | Yes — fully automatic; linking A→B auto-creates the reverse field on B | Related lists surface both directions once a lookup/related-list is configured | No — requires explicitly checking "2-way connection" at setup; easy to skip, and community reports suggest this has regressed before |
| Forward/reverse labels | None — single free-text label, no reverse concept | Implicit via field naming only (e.g. "Parent Account") | Yes — explicit paired labels (e.g. "Manager"/"Employee"), first-class UI concept | N/A — the link field's name serves both directions | Related-list label configurable, though not a formal "pair" object | Column name only, no semantic pairing |
| Cardinality enforcement | Cosmetic only (picker UI shape, no actual constraint) | Real, structural: Lookup (optional, no cascade) vs. Master-Detail (required, cascades) are different field types | 1-to-many by default; admin can cap total or per-label associations up to 10,000 | No formal cardinality; link fields are inherently many-capable | Lookup = many-to-one; dedicated Multi-select lookup = explicit many-to-many (capped at 2 per module) | No cardinality concept beyond a 750-item-per-cell hard limit |
| Relationship-specific metadata | Not possible — a link is just an id/id[], nothing can be attached to the pairing itself | Yes — a junction object (2 master-detail relationships) can carry its own fields; this is Salesforce's canonical many-to-many pattern | No dedicated junction-record concept found in this research pass | No — pure references, no attached metadata | Yes — "Linking Module," auto-generated specifically to hold per-pair data (e.g. a negotiated price unique to one pairing) | No — Connect Boards is a pure reference, Mirror is read-only passthrough |
| Cascade-delete behavior | **Broken** — orphaned reference displays as a fake record name on a disabled chip, no "deleted" state, no warning | Two explicit, well-defined choices: Lookup = orphan-safe (clear or block), Master-Detail = mandatory cascade | Not verified this session | Deleting a linked record appears to clean up the link automatically (inferred from the bidirectional live-sync model; not independently stress-tested) | Not verified this session | **Confirmed broken in the same direction as nrtur** — community forum has long-running threads asking monday.com to add cleanup on delete; it doesn't happen today |
| Custom ↔ standard object symmetry | One-way only — standard objects have no relationship mechanism of their own | Fully symmetric — any object can relate to any object | Fully symmetric | N/A — no standard/custom distinction | Fully symmetric | N/A — no standard/custom distinction |

_Note on confidence: the specific numeric limits cited above (HubSpot's 10,000, Zoho's cap of 2 multi-select lookups per module, etc.) come from live documentation checked this session and are reasonably current as of mid-2026, but vendors change these frequently — treat exact figures as directional, not contractual. Cascade-delete behavior for HubSpot and Zoho specifically wasn't verified this session and is marked as such above, rather than guessed._

### Recommendations, in priority order

1. **Fix the broken-link display first — this is a bug, not a design choice.** When `coResolveLink` can't resolve a target, render "Deleted record" (grayed out, non-clickable) instead of the raw stored id/string. This is a single-function fix in `coResolveLink`'s fallback branch and removes an actual data-corruption-looking symptom before anything else on this list.

2. **Adopt Airtable's auto-bidirectional model as the default**, not HubSpot's label-pair model — Airtable's approach requires zero extra configuration from the user, which fits a product built for non-technical owners better than a system requiring them to author label pairs upfront. Concretely: when a relationship targets Contact/Company/Lead/Deal, `CoLinksPanel` (or an equivalent) needs to actually render on those detail pages — today the reverse view isn't a config gap, it's a missing code path.

3. **Add real cardinality enforcement**, modeled on Salesforce's Lookup/Master-Detail split — at minimum, when "Allow many" is off, prevent a target record from being linked from more than one source record. Right now the toggle only changes which picker widget renders.

4. **Raise the hardcoded limits.** Even matching Zoho's Standard tier (10 objects, 10 fields each) would remove the most likely near-term ceiling; nrtur's current 5/25/5 is low against every competitor surveyed, including the most conservative one.

5. **Introduce an explicit cascade-delete policy per relationship**, once the immediate display bug (item 1) is fixed — offer "restrict" (block deleting a record still referenced) as the safe default, matching the general pattern every vendor surveyed treats as the conservative choice, with "cascade" reserved for relationships that represent true ownership.

6. **Relationship-specific metadata (Zoho/Salesforce junction-style) is reasonable as a v2**, not urgent now — only worth building once a real use case needs data attached to the pairing itself (e.g., "this contact's role on this specific project"), rather than data on either endpoint.

---

## Full Gap Audit

Organized by category, most consequential first. Items already covered in depth above (relationship bidirectionality, cardinality, cascade-delete) are cross-referenced rather than repeated.

### Data integrity / correctness

| # | Gap | Where |
|---|---|---|
| 1 | Deleted-record links render as a fake name instead of a "deleted" state | `coResolveLink`, line 20430 — see Relationships section above |
| 2 | Deleting a custom object definition doesn't clean up other objects' relationships pointing at it — permanently orphaned | `delObj`, line 20824 |
| 3 | Custom object definition delete is instant and permanent — the only unrecoverable delete action in the app | `delObj`, line 20824 |
| 4 | "Required" field flag is cosmetic only — doesn't block save | `CustomRecordDrawer.valid`, line 20597 (checks only the Name field) |
| 5 | Cardinality ("Allow many") only restricts the UI picker, not actual relational integrity | See Relationships section above |

### Relationship model limitations

| # | Gap |
|---|---|
| 6 | Relationships are forward-only — no reverse view anywhere on Contact/Company/Lead/Deal detail pages |
| 7 | No forward/reverse label pairing |
| 8 | No relationship-specific metadata (can't attach data to the link itself) |
| 9 | No per-relationship required/optional flag |

### Feature parity vs. built-in objects

| # | Gap |
|---|---|
| 10 | No saved/shared views or smart lists for custom object lists |
| 11 | No column customization or persistence |
| 12 | No CSV import |
| 13 | No CSV export |
| 14 | No merge/dedupe |
| 15 | Activity timeline is shallow — no cross-record activity pulling, no live field-change logging |
| 16 | No Email/SMS/Call logging tabs — Notes only |

### Permission granularity

| # | Gap |
|---|---|
| 17 | `effCanCustom` blanket-proxies to Contacts permissions — no per-custom-object-type row in the Permission Matrix at all |
| 18 | Scoping (Own/Team/All) always follows Contacts' setting, can't differ per custom object |

### Scale / limits

| # | Gap |
|---|---|
| 19 | Hardcoded caps — 5 objects / 25 fields per object / 5 relationships per object — low against every competitor surveyed (see Best Practices) |

### Discovery

| # | Gap |
|---|---|
| 20 | Command Palette (Cmd/Ctrl+K) doesn't know about custom objects — fully static item list |
| 21 | Quick Add (+ button) doesn't support creating a custom record — fully hardcoded object list |

### Field-level polish

| # | Gap |
|---|---|
| 22 | Field-level "Sensitive" masking works for standard objects but is inert for custom objects — a field marked sensitive is never actually masked when displayed |
| 23 | "Lookup" and "Autocomplete" field types are decorative — render as plain text inputs (whole-app gap, but directly relevant since custom objects expose these in the field-type picker) |
| 24 | `NewPropertyDrawer`'s built-in delete button is a dead code path when reached via `CustomObjectEditor`'s edit-then-delete flow — passes a delete sentinel that `upsertField` doesn't handle. (The correctly-wired delete button lives elsewhere in the same editor, so this is a latent trap, not a total loss of functionality) |

### Pipeline fragility

| # | Gap |
|---|---|
| 25 | No dedicated "Stage" field type — pipelines key off any Single-select field; deleting that field silently breaks the board with no warning or self-correction |
| 26 | Custom-object pipelines aren't persisted anywhere — lost on reload or navigation |

### Whole-app gaps worth flagging (not custom-object-specific, but relevant to production-readiness of this module)

| # | Gap |
|---|---|
| 27 | No API/webhook exposure anywhere in the application |
| 28 | No audit log anywhere in the application |

---

## Developer Q&A

**Q: What's the single most urgent fix in this entire module?**
A: The broken-link display (Gap #1). It's the only item on this list that reads as active data corruption rather than a missing feature or a reasonable v1 tradeoff — a disabled chip showing a raw internal id where a deleted contact's name used to be will alarm any user who encounters it, and it's a small, contained fix (one function's fallback branch).

**Q: Is the one-directional relationship model a bug or a design choice?**
A: A design choice that wasn't taken to its logical conclusion. Building `CoLinksPanel` and wiring it only into `CustomRecordDetailPage` was a reasonable v1 scope cut, but the consequence — a Contact with three linked Projects has no way to know it from the Contact's own page — undercuts the pitch that custom objects are "first-class." Every competitor surveyed either does this automatically (Airtable) or makes it easy to configure explicitly (HubSpot's paired labels, Zoho's related lists). This is the highest-value gap to close after the display bug.

**Q: The permission model proxies custom objects to Contacts. Is that a reasonable shortcut for now?**
A: As a v1 simplification, yes — it's explicitly reasonable and Salesforce's model (full first-class parity) is likely over-engineering for this product's current stage. What's not reasonable is that the Permission Matrix UI gives zero indication this proxy exists — an admin adjusting Contacts permissions has no way to know they're also touching every custom object in the workspace. At minimum, the settings UI should say so.

**Q: Should nrtur build a Salesforce-style Lookup/Master-Detail distinction, or is that overkill?**
A: Overkill for now, but the underlying idea — some relationships should cascade-delete and some should not — is worth adopting in simplified form. A single boolean per relationship ("if the target is deleted, should this link block the deletion, or just clear itself?") captures 80% of Salesforce's value without building two structurally distinct field types.

**Q: The hardcoded caps (5 objects, 25 fields, 5 relationships) — where did these numbers likely come from, and are they defensible?**
A: They read as prototype-scale conveniences (keeps demo data and UI layouts predictable) rather than numbers derived from any capacity planning. Every vendor surveyed sets meaningfully higher floors — even Zoho's cheapest tier that supports custom modules allows 10 objects and 10 fields each. If these caps ship as-is to real customers, expect the 5-object ceiling to be the first one hit by any workspace that adopts custom objects seriously (e.g., Projects + Vendors + Assets is already 3; a fourth or fifth object idea and they're blocked).

**Q: Is there a case for keeping relationships as simple id references rather than adding junction-style metadata (Zoho/Salesforce pattern)?**
A: Yes, for now. Junction-style relationship metadata solves a specific problem — "I need to store data about the pairing itself, not about either endpoint" — that most workspaces won't hit immediately. Simple FK-style references are easier to reason about, easier to render, and cover the common case (Project links to one Company, Project links to many Contacts). This is a reasonable feature to defer until a real customer asks for it specifically.

**Q: Custom objects can get their own pipeline, but the pipeline isn't persisted. How urgent is that fix relative to everything else?**
A: More urgent than it looks, because the failure mode is silent — a user builds a pipeline, believes it's saved (nothing in the UI suggests otherwise), and loses it on the next reload with no warning. Compare this to the relationship gaps, which are at least discoverable through normal use (a user will eventually notice a Contact doesn't show its Projects). This one actively misleads the user into thinking they have something they don't.
