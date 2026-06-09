# Contacts (`contacts`)

## Purpose
The people/companies database with a **Smart Views** system for saved, rule-based segments. Component: `ContactsPage`.

## Entry points
- Sidebar Contacts; sidebar **+** → New contact; dashboard drilldowns; command palette.

## Components & state
- `ContactsPage` — `viewKey`, `health` filter, `search`, `appliedFilters`, `selected` (bulk), `myViews`, builder state.
- `SmartViewsSidebar` (220px): Default views + My views + Team views + Archived + "New view"; `countFor` per view.
- `ViewBuilderPanel` (380px slide-out): name, color, scope (Just me / Whole team), ALL/ANY nested rule builder, live preview count.
- Rule engine: `evalRule`/`evalRules`/`matchView` over fields (Status, Owner, Tag, Last contacted, Health, Has deal, Deal value).
- Rows use `ContactStatusDropdown`, `ContactOwnerDropdown`, a health dot. `CsvImportModal` (4-step import). Data: `CONTACTS_DATA`, `CONTACT_STATUSES`, `TEAM_MEMBERS`.

## Use cases
- Browse/search/filter contacts; sort by health (cold/warm/etc.).
- Create & save **Smart Views** (rule-based segments), shared or personal.
- Inline-edit status/owner; bulk-select; import CSV; open a contact.

## Step-by-step flows
**Filter:** pick a smart view → table filters via `matchView`; add health filter / search / applied filters → chips show; "Clear all" resets.
**New view:** "New view" → `ViewBuilderPanel` → add rules (ALL/ANY, nested) → live count → Save → appears under My/Team views.
**Import:** **+** → Import → `CsvImportModal` 4 steps (upload → map → preview → done) → toast.
**Open:** click a row → `contact-detail`.

## Limitations
- All contacts come from `CONTACTS_DATA[0..]`; clicking any row opens the same `contact-detail` record. Views/edits aren't persisted.

## Suggestions
1. Real pagination/virtualized list + server-side filtering for scale.
2. Bulk actions toolbar (assign owner, add tag, enroll in sequence, export, delete) on `selected`.
3. Saved-view sharing/permissions + pinning; column customization.
4. Dedup/merge tooling; CSV import field-mapping presets.
5. Make each row open its own record (id-based routing).

## Related
[contact-detail.md](contact-detail.md) · [add-contact.md](add-contact.md) · [settings-pipeline.md](settings-pipeline.md)