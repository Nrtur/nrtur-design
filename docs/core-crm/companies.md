# Module 7 — Companies

> **Routes:** `companies` · `company-detail` · `add-company`
> **Components:** `CompaniesPage` · `CompanyDetailPage` · `AddCompanyPage`
> **Source lines (index.html):** 8097–8433

Companies is a first-class object — not a field on a Contact record, but its own entity with its own list, detail page, and type system. The four types (Customer / Prospect / Partner / Vendor) are relationship categories, not lifecycle stages; they carry no sequence and trigger no automatic transitions.

---

## 7.1 Companies List

**Route:** `companies` · **Component:** `CompaniesPage`

### Surface inventory

| Element | Detail |
|---|---|
| Skeleton | 900 ms; square-avatar shimmer (rounded-xl, not circle), text shimmer, pill shimmer |
| Object tab bar | Contacts / Companies / Leads tabs (shared `ObjectTabs`); Companies is the active tab |
| View context badge | Icon + active view label + record count pill |
| Search bar | Searches `name`, `domain`, `industry`; placeholder "Search companies…" |
| OmViewRail | System views + favourites + private/shared views + smart lists + view folders + Archived (bottom) |
| Filter row + chip strip | OmFiltersButton (condition builder), ColumnsControl (show/hide columns), ObjectToolsMenu (Duplicates shortcut), active-filter chips row |
| Column header row | Checkbox (select-all), sortable column headers, ellipsis overflow |
| `CompanyRow` | One row per company; all 6 default columns visible |
| Inline type chip | `CompanyTypeDropdown` directly in the Type column |
| Inline owner | `ContactOwnerDropdown` in the Owner column |
| `BulkBar` | Appears above rows when ≥1 row selected |
| Import button | "Import" — opens `BulkImportWizard` (right panel) |
| Export button | "Export" — simulates CSV export, shows toast |
| New Company button | Brand-coloured; permission-gated |
| 3 empty states | "No companies yet" (CTA), "No companies match this view", "No companies match" (search/filter active) |
| `AppFooter` | Shows active view label + count |
| Toast | 2 500 ms dismissing confirmation message |

### System views (OmViewRail)

| Key | Label | Icon | Predicate | Dot |
|---|---|---|---|---|
| `all` | All Companies | Building | — | — |
| `keyaccts` | Key Accounts | Star | `type === 'Customer'` | — |
| `active` | Recently Active | Sparkles | `days < 7` | — |
| `atrisk` | Going Cold | Clock | `days > 30` | red |
| `noowner` | No Owner | Ban | `!owner` | red |
| _(bottom)_ | Archived | Archive | `archived === true` | — |

Red dots on "Going Cold" and "No Owner" signal records that need attention — the same signal language as Contacts (where "Uncontacted" and "No Owner" also carry red dots).

Seed favourites: `sh_key` (Key Accounts) is pinned by default. View folders seed: "Team views" (blue) with `sh_key`, "Key accounts" (brand/indigo), "Marketing" (green).

### COMPANY_COLS

| Key | Width | Default | Content |
|---|---|---|---|
| `name` | 1.7fr | ✅ | `rounded-2xl` square avatar (initials) + company name + domain as sub-text |
| `type` | 120px | ✅ | `CompanyTypeDropdown` inline chip (Customer / Prospect / Partner / Vendor) |
| `industry` | 1.4fr | ✅ | Industry text |
| `contacts` | 90px | ✅ | `contactsForCompany(co.name).length` + Users icon |
| `deals` | 120px | ✅ | `fmtK(openValue)` + "N open" sub-text |
| `owner` | 120px | ✅ | `ContactOwnerDropdown` inline |
| `revenue` | 130px | ❌ | `annualRevenue` formatted as currency |
| `size` | 100px | ❌ | Employee count (number) |
| `loc` | 1.2fr | ❌ | Location text |
| `website` | 150px | ❌ | Clickable brand-300 link |
| `tags` | 1.2fr | ❌ | Tag chips, up to 3 shown |

The `contacts` and `deals` columns are computed cross-object aggregates, not stored fields. They call `contactsForCompany(co)` and `dealsForCompany(co)` at render time on the in-memory data arrays. The join is now id-first: it matches contacts/deals whose `companyId === co.id`, falling back to the display-name string only when an id is missing. A one-time `migrateLinks()` at app start auto-creates any previously-missing companies and backfills the `companyId` / `primaryContactId` / `additionalContactIds` links, so the counts read live, id-linked state.

### Type system

```
COMPANY_TYPES = ['Customer', 'Prospect', 'Partner', 'Vendor']

COMPANY_TYPE_CHIP = {
  Customer: emerald (green)
  Prospect: brand (indigo)
  Partner:  blue
  Vendor:   grey (white/06)
}
```

The `ChipSelect` component renders these as coloured pill chips with a coloured dot. Unlike Contact `cstatus`, COMPANY_TYPES have no inherent order and no automatic transitions.

### Health scoring

`companyHealth(d)` is aliased directly to `contactHealth(d)` — the same `days` field, same 0/7/30 day thresholds:

| `days` | Health dot | Meaning |
|---|---|---|
| `< 7` | green | Active |
| `7–30` | amber | Cooling |
| `> 30` | red | Going cold |

The "Going Cold" system view (`days > 30`) surfaces the red-dot records automatically.

### BulkBar for companies (`object="company"`)

| Action | Available when | Notes |
|---|---|---|
| Assign owner | `canEdit` | Dropdown of `TEAM_MEMBERS` |
| Add tag | `canEdit` | Tag picker, creates tag if new |
| Remove tag | `canEdit` | Shows tags currently on selected records |
| **Change type** | `canEdit` | Label is "Change type" (not "Change status"), options from `COMPANY_TYPES` |
| Archive | `canEdit` | Bulk confirm dialog |
| Delete | `canDel` | Confirm-gated, requires `effCanBulkDelete()` |

**Absent from companies BulkBar:**
- "Set company" — contact-only (contacts belong to a company; companies do not)
- "Move stage" — deal-only
- "Convert" — lead-only

### Search scope

`name`, `domain`, `industry` — three string fields, all case-insensitive substring match. No email or phone search (companies don't have those primary-identity fields in the list).

### Dirty view detection

Identical to Contacts: when the active view is a private or shared (editable) view and the current filter / sort / columns differ from the saved state, an "Unsaved changes" indicator appears with "Save changes" and "Discard" options. System views are never editable; only user-created views trigger this state.

### Permission gates

| Gate | Controls |
|---|---|
| `effCanObject('Companies','create')` | Import button, New Company button, Add contact link on detail page |
| `effCanObject('Companies','edit')` | Inline type change, inline owner change, BulkBar edit actions |
| `effCanObject('Companies','delete')` | BulkBar delete |
| `effCanExport()` | Export button |
| `effScopeRows('Companies', ...)` | Filters list to Own / Team / All rows based on role scope |

---

### Design decisions

**Why square avatars, not circular?**
The prototype uses `rounded-2xl` (square with rounded corners) for companies and `rounded-full` (circle) for contacts and leads. The convention distinguishes entities: circles are for people, squares are for organisations. This is consistent with how Apple Contacts, Notion, and Linear represent teams vs people.

**Why six default columns, not fewer?**
The `contacts` and `deals` columns make Companies immediately useful without opening a detail page — you can triage key accounts, spot companies with no contacts, and see pipeline at a glance from the list. Removing them would force navigating into every record just to get basic relationship context.

**Why is "Change type" the BulkBar label (not "Change status")?**
The `statusField` lookup in `BulkBar` branches on `object`: `'company'` → field=`type`, label=`'Type'`. The button text renders as `{object==='company'?'Change type':'Change status'}`. This is intentional — Type is a classification, not a workflow status.

**Why does the search not include email or phone?**
Companies don't have email or phone as primary-identity fields in the list data. The three search fields (`name`, `domain`, `industry`) are the natural identifiers a sales rep would use when looking up a company account.

---

### Three lenses

**Frontend**
- `CompaniesPage` is structurally identical to `ContactsPage`; the same Om filter engine, view rail, and bulk bar are reused. The only structural differences are: `COMPANY_COLS` vs `CONTACT_COLS`, `coSeedViews` vs `ctSeedViews`, `object="company"` on `BulkBar` and `DuplicatesView`.
- `contactsForCompany(co)` and `dealsForCompany(co)` run on every render for every visible row to populate the `contacts` and `deals` columns. They join id-first (`companyId === co.id`) with a name-string fallback. At 50–100 rows these are fast linear scans over in-memory arrays, but they are O(n × m) across the whole dataset.
- The `useDashNavFilter` hook lets the Dashboard navigate to Companies with a pre-applied filter (e.g., the "Key Accounts" widget links directly to the keyaccts view).
- Custom property columns from `PropertiesContext` are merged via `customColsFor(_propsCtx,'company')`.

**Backend**
- `/companies` endpoint must return: `id`, `name`, `domain`, `industry`, `type`, `owner`, `ownerColor`, `avatar`, `color`, `days` (last activity age), `archived`, `deleted`, `tags`, `annualRevenue`, `size`, `loc`, `website`.
- Cross-object counts (`contacts`, `deals`) in the list can be served as pre-computed summary fields on the company record (e.g., `contactCount`, `openDealCount`, `openDealValue`) OR fetched per-page via a batch endpoint. Full join at render time does not scale.
- `effScopeRows('Companies', ...)` requires that the backend can filter by `owner` to support Own / Team / All scope tiers.
- The duplicate detection call `detectDuplicates('company', nonArch)` is O(n²) client-side; production needs a backend dedup job.

**Design**
- The square avatar + rounded-2xl corners are the visual signal for organisations throughout the app. Keep this consistent anywhere a company is represented (search results, linked panels, pipeline cards).
- Red dots on the OmViewRail for "Going Cold" and "No Owner" create immediate urgency without opening a record. These should follow the same colour semantics as the Contact health dot system.
- The chip colour map (emerald for Customer, brand for Prospect, blue for Partner, grey for Vendor) needs to survive dark mode and be accessible at 11px font-size; check contrast ratios on all four variants.

---

### Competitive position

Most CRMs (HubSpot, Salesforce, Pipedrive) treat companies/accounts as a separate object — nrtur matches this pattern. Distinctive aspects of this design:

- **Cross-object aggregate columns in the list** (contacts count, open deals value): HubSpot shows similar on their Companies board, but Pipedrive's Organisation list does not aggregate this by default. Having these default in the list removes a common "why do I need to click in?" frustration.
- **Type-not-status design**: HubSpot calls it "Lifecycle stage" (Lead → Customer) with automatic transitions. nrtur's Type is manual and non-sequential, which is simpler but loses the pipeline funnel visibility of type changes over time. Salesforce uses "Account Type" the same non-sequential way.
- **Square avatars**: Attio uses a similar convention (squares for records, circles for people). Pipedrive uses circles for everything, which makes it harder to visually distinguish person vs organisation.
- **Health dot from `days`**: HubSpot tracks "Last activity" and can surface stale contacts. nrtur surfaces this directly in the view rail (Going Cold view) without requiring custom reports.

---

### Developer Q&A

**Q: `contactsForCompany` matches by company. What if two companies have the same name?**
A: The join is now id-first. `contactsForCompany(co)` and `dealsForCompany(co)` match records whose `companyId === co.id`, so two companies sharing a name no longer share contacts and deals — each resolves to its own id-linked records. The display-name string (`c.co` / `d.company`) is only used as a fallback when a record has no `companyId`, and `migrateLinks()` backfills those ids at app start (auto-creating any missing companies). Company IS the hub in this model: contacts carry `companyId`, deals carry `companyId`, and both keep the display name alongside the id.

**Q: The `contacts` and `deals` columns scan all contacts and all deals on every render for every visible row. At what scale does this break?**
A: At 100 visible rows × 10 000 contacts, that's 1 000 000 comparisons per render. Fine in a prototype, not fine in production. The backend should return `contactCount`, `openDealCount`, and `openDealValue` as pre-computed fields on the company summary object. Alternatively, compute these on scroll (virtualise) and cache per company ID in a memoisation map.

**Q: The Archived view is at the bottom of the OmViewRail. What's the restore path for archived companies?**
A: `doRestore(co)` sets `archived: false` on the company record. In the list, the Archived view shows `rows.filter(c => c.archived && !c.deleted)`. The hover row in that view needs a "Restore" button. The prototype shows Archive via `doArchive` but the restore UI in the Archived view itself is implicit — verify `onRestore` is wired to `CompanyRow` for the archived context.

**Q: The `active` system view uses `days < 7`. Where is `days` set?**
A: `days` is a pre-computed field on the company seed data. In production, it must be `Math.floor((now - lastActivityAt) / 86400000)` maintained server-side or computed at request time. There is no real-time update in the prototype.

**Q: The deals column shows `fmtK(openValue)` — "N open" deal count + value. What counts as "open"?**
A: `dealsForCompany(name)` defines open as `stageKey !== 'won'`. Lost deals are not explicitly excluded (only Won). Production should clarify whether Lost deals count as open in this column — typically they should not. The filter should be `stageKey !== 'won' && stageKey !== 'lost'`.

---

## 7.2 Company Detail

**Route:** `company-detail` (param: company `id`) · **Component:** `CompanyDetailPage`

### Surface inventory

| Section | Element | Detail |
|---|---|---|
| **Header** | Breadcrumb | "Companies > [name]", breadcrumb button navigates back |
| | RecordSwitcher | Arrow buttons cycle through the companies list |
| | New deal button | Permission-gated (`effCanObject('Deals','create')`); navigates to add-deal or triggers quick-add |
| | Schedule button | Permission-gated (`effCanObject('Companies','edit')`); opens `CalEventFormModal` |
| | More menu (⋯) | 3 items: Edit company / Create invoice / Delete company |
| **Left panel** | Profile card | 64px `rounded-2xl` square avatar + company name + domain (external link) + `CompanyTypeDropdown` |
| | Stats grid | 3 buttons: Contacts count / Open deals count / Pipeline value (`fmtK`) |
| | `RecordProperties` | Primary fields (above fold), secondary fields ("Show all properties" expand) |
| **Right panel** | People at [company] | Contact rows list; "Add contact" quick-add link |
| | Deals panel | 2-col card grid; "New deal" link |
| | `RecordTasks` | Tasks matched `t.company === co.name` |
| | `ActivityTimeline` | `kind="company"` — note + schedule only (no email compose, no dialer) |
| **Footer** | `RecordMetaFooter` | Created by / Created at |
| **Drawers** | `RecordEditDrawer` | 2 groups: Basic info + Details & address |
| | `CalEventFormModal` | Opens on Schedule button click |
| **Confirm** | Delete dialog | `requireText: co.name` (not "DELETE") |

### Header actions

**More menu** items and their permission gates:

| Item | Gate | Action |
|---|---|---|
| Edit company | `effCanObject('Companies','edit')` | Opens `RecordEditDrawer` |
| Create invoice | `effCanPay('create')` | Navigates to `payments` with `tab:'invoices'` and pre-filled `company` + first contact's name |
| Delete company | `effCanObject('Companies','delete')` | Opens confirm dialog → sets `deleted:true`, shows toast, navigates to `companies` |

### Profile card

- **Avatar**: `w-16 h-16 rounded-2xl` (64px square, rounded corners) — NOT a circle. Background colour from `co.color`. Initials from `co.avatar`.
- **Name**: `co.name`, 20px bold
- **Domain**: Rendered as an external link (`target="_blank"`). Normalised to HTTPS: `((co.domain||'').startsWith('http') ? '' : 'https://') + co.domain`. Clicking opens the company website in a new tab.
- **CompanyTypeDropdown**: Inline type chip immediately below domain; changes `co.type` directly on click.
- **Background**: Radial gradient `rgba(99,102,241,0.10)` (brand indigo) from top — same decorative gradient as Contact and Lead detail profile cards.

### Stats grid (3 buttons)

| Button | Value | Navigation |
|---|---|---|
| Contacts | `people.length` (from `contactsForCompany(co)`) | `goTo('contacts')` |
| Open deals | `dl.open` (from `dealsForCompany(co).open`) | `goTo('pipeline')` |
| Pipeline | `fmtK(dl.openValue)` | `goTo('pipeline')` |

Both "Open deals" and "Pipeline" navigate to the pipeline page without filters applied — the prototype does not deep-link to a filtered pipeline view. These buttons are also informational triggers: seeing 0 contacts alongside pipeline value tells you contacts haven't been linked yet.

### Record fields (primary — shown by default)

Defined in `coPrimary` (line 8318):

| Key | Label | Type | Required | Notes |
|---|---|---|---|---|
| `name` | Name | text | ✅ | Company's display name |
| `domain` | Website | text | ✅ | Canonical domain (e.g. "hubspot.com"); shown as link in profile card |
| `industry` | Industry | select | — | Options: Software / Finance / Healthcare / Retail / Manufacturing / Education / Real Estate / Other _(see note below)_ |
| `owner` | Owner | owner | — | User picker |
| `size` | Employees size | number | — | Headcount |
| `annualRevenue` | Annual revenue | currency | — | **SENSITIVE** — masked for roles below Team Lead |
| `loc` | Location / HQ | text | — | Free-text location |
| `tags` | Tags | tags | — | Tag chips |

⚠️ **Prototype inconsistency:** The `coPrimary` industry options (`Software, Finance, Healthcare, Retail, Manufacturing, Education, Real Estate, Other`) differ from the global `INDUSTRIES` constant (`Marketing & Advertising, Software / SaaS, Design / Creative, Consulting, Media, E-commerce, Finance, Healthcare`) which is used on the Add Company form and in list filters. These must be unified before production.

### Record fields (secondary — "Show all properties" expand)

Defined in `coSecondary` (line 8319):

| Key | Label | Type | Notes |
|---|---|---|---|
| `type` | Company type | select | Options in prototype: Prospect / Customer / Partner / Competitor / Other _(see note below)_ |
| `website` | Website | url | Full URL (distinct from `domain`); external link |
| `parent` | Parent company | lookup | Navigates to `company-detail` for org hierarchy |
| `linkedin` | LinkedIn | url | External link |
| `desc` | Description | text | Free text |
| `billing` | Billing address | address | |
| `shipping` | Shipping address | address | |
| `lastActivity` | Last activity | datetime | Read-only |

⚠️ **Prototype inconsistency:** The `coSecondary` type field uses `['Prospect','Customer','Partner','Competitor','Other']` while `COMPANY_TYPES` = `['Customer','Prospect','Partner','Vendor']`. "Competitor" and "Other" are in the edit drawer but not in `COMPANY_TYPES`; "Vendor" is in `COMPANY_TYPES` but not in the drawer. Must be unified.

⚠️ **Label collision:** Both `domain` (primary, key="domain") and `website` (secondary, key="website") are labeled "Website" in the UI. `domain` is the canonical identifier (required) and renders as a browser link; `website` is an optional full URL. These should have distinct labels (e.g., "Domain" and "Website URL") to avoid confusion in the edit drawer.

### Meta fields

| Key | Label | Type |
|---|---|---|
| `createdBy` | Created by | user (read-only) |
| `createdAt` | Created at | datetime (read-only) |

### "People at [company]" panel

- Header: company name + contact count sub-text; "Add contact" quick-add link (gated by `effCanObject('Contacts','create')`)
- Rows: one per contact from `contactsForCompany(co)` — avatar (circle, not square) + name + email + status chip (`CSTATUS_CHIP[p.cstatus]`) + right arrow
- Click: `goTo('contact-detail', p.id)`
- Empty state: "No contacts linked to this company yet."
- **Matching logic**: `contactsForCompany(co)` resolves by id (`c.companyId === co.id`) against live contacts, with the name string (`c.co === co.name`) only as a fallback. This panel now reads the company's real linked contacts, not a name-string scan.

### Deals panel

- Header: "Deals" + "N total · X open" sub-text; "New deal" link (gated by `effCanObject('Deals','create')`)
- Body: `grid-cols-1 sm:grid-cols-2` card grid
- Each deal card: company name + value (top row) + stage colour dot + stage name (bottom row). **No progress bar.**
- Click: `goTo('deal-detail', d.id)`
- Empty state: "No deals for this company yet."
- All deals shown (both open and won/lost) — `dl.list` comes from `dealsForCompany(co)`, which filters `allDeals()` id-first (`d.companyId === co.id`, name string as fallback). This is the company's real deal list, read from live state.

### RecordTasks

Filtered: `t.company === co.name`. Pre-fill on new task: `{ company: co.name }`. Can add notes to the activity timeline from task completion via `onLog`.

### ActivityTimeline

`kind="company"`, supports: `onAddNote` (gated by edit permission), `onSchedule` (opens CalEventFormModal). Note placeholder: "Add a note about [company name]…"

Notes and scheduled activities now **persist across navigation**. They are written to a shared `CrmDataContext.activities` store via `crm.addActivity('company', co.id, …)` and read back with `crm.activities.filter(a => a.subjectType === 'company' && a.subjectId === co.id)`, keyed to the record. A note logged here survives leaving and returning to the company (it was component-local and lost on nav before).

**Absent from Company ActivityTimeline** (present on Contact timeline):
- Email compose button (companies don't send email directly)
- Dialer (no phone-call initiation from a company record)
- DNC toggle (no do-not-contact concept at company level in this prototype)

### RecordEditDrawer groups

```
Group 1: "Basic info"    → coPrimary fields
Group 2: "Details & address" → coSecondary fields
```

460px desktop / 90vh bottom sheet mobile. Dirty detection and "Discard changes" guard are shared component behaviour (documented in Module 6.7).

### Delete flow

1. "Delete company" in More menu → `openConfirm`
2. Dialog: "Delete [name]?" · "This moves [name] to the Recycle Bin. You can restore it within 30 days." · confirm label "Delete company" · `requireText: co.name`
3. User types the company name (not the word "DELETE") to confirm
4. On confirm: `setCompanies(a => a.map(x => x.id === co.id ? {...x, deleted:true, deletedAt:Date.now(), deletedBy:'Alex Morgan'} : x))`
5. Toast: "[name] moved to Recycle Bin" · navigate to `companies`

**Key difference from Contact delete:** contacts require typing `"DELETE"`, companies require typing the company name. This mirrors the Lead detail delete pattern and makes destruction feel purposeful — you must name the thing you're deleting.

### What's absent vs Contact Detail

| Feature | Contact Detail | Company Detail |
|---|---|---|
| Email compose button | ✅ | ❌ |
| Dialer / call button | ✅ | ❌ |
| SMS button | ✅ | ❌ |
| DNC toggle | ✅ | ❌ |
| Per-channel suppression | ✅ | ❌ |
| AI Recommended Action card | ✅ | ❌ |
| Lead Attribution card | ✅ | ❌ |
| Contact health dot | ✅ | ❌ (health is at company level via `days`) |
| Score radial | Leads only | ❌ |

---

### Design decisions

**Why are stats grid buttons (Contacts / Open deals / Pipeline) navigating to unfiltered pages?**
The prototype's `goTo('contacts')` and `goTo('pipeline')` don't pass a filter. The design intent is to signal that related records exist, with the number as motivation to click. In production this should deep-link: Contacts button → contacts list filtered to this company; Pipeline buttons → pipeline filtered to this company's deals. This is a stub in the prototype.

**Why does `requireText` use the company name instead of "DELETE"?**
Typing the company name forces deliberate intent while confirming which entity you're about to destroy. It's more meaningful than typing a generic word. The tradeoff: for companies with long or complex names, the confirmation UX is annoying. Contact delete uses "DELETE" to avoid this — the pattern is inconsistent across objects in the prototype.

**Why is `annualRevenue` marked `sensitive: true`?**
Revenue is commercially sensitive — a sales rep shouldn't see a customer's ARR when negotiating with them. Masking for roles below Team Lead is a common CRM design decision (Salesforce does this with field-level security). The field renders as `****` or hidden for Read Only and Sales Rep roles.

**Why is there a `parent` company lookup?**
Parent company lookup enables hierarchical account structures — common when selling to enterprises where a subsidiary and its parent both need to be tracked separately (e.g., "Meridian Agency UK" rolls up to "Meridian Agency Global"). HubSpot and Salesforce support parent–child company relationships; Pipedrive does not.

---

### Three lenses

**Frontend**
- `CompanyDetailPage` is the same 35/65 two-column layout as Contact and Lead detail — `lg:grid-cols-[minmax(0,35fr)_minmax(0,65fr)]`. The left column is sticky (`lg:sticky lg:top-6`).
- `omLayoutSplit(coPrimary, coSecondary, 'Companies', _propsCtx)` merges base fields with any custom properties from `PropertiesContext`, then splits into primary/secondary for `RecordProperties`.
- `actCtx` passed to `ActivityTimeline` includes `contacts`, `companies`, `deals`, `leads`, and `invoices` — the timeline can reference cross-object records in event display.
- The "New deal" button uses `window.__nrturQuickAdd('deal','single',{company:co.name})` if available, which opens an in-page quick-add rather than navigating. Falls back to `goTo('add-deal')` if the quick-add global isn't mounted.
- `CalEventFormModal` pre-fills `{type:'meeting', company:co.name}` — the scheduled meeting is pre-associated.

**Backend**
- `/companies/:id` must return the full company record plus related summaries: `contactCount` / `openDealCount` / `openDealValue` (or the frontend fetches `/contacts?companyId=X` and `/deals?companyId=X` separately).
- The "People at [company]" panel already joins id-first (`contact.companyId === company.id`), so `/contacts?companyId={id}` maps directly; the display-name match remains only as a fallback for un-migrated rows.
- `annualRevenue` with `sensitive:true` requires field-level visibility enforcement on the API response — either omit the field entirely for roles below Team Lead, or return it null-masked.
- `parent` (company lookup) introduces a self-referential FK. The backend must guard against circular parent chains (A → B → A).
- Delete is a soft delete (`deleted:true`, `deletedAt`, `deletedBy`). The backend needs a Recycle Bin endpoint to restore it within 30 days.
- `lastActivity` is a derived field (latest activity timestamp from the company's `ActivityTimeline`). The backend must keep this current via triggers or denormalised writes.

**Design**
- The profile card's `rounded-2xl` square avatar is the clearest visual signal that this is an organisation, not a person. Any place where a company is represented in a panel (People panel, global search, deal cards) should use square avatars consistently.
- The stats grid buttons (Contacts / Open deals / Pipeline) are one of the most useful elements on the page for a sales manager. Marking the pipeline button with a dollar sign (`I.Dollar`) and using `fmtK` formatting makes the value immediately readable. Consider adding trend indicators (up/down vs last month) here.
- The "People at [company]" panel shows contact status chips — the same `CSTATUS_CHIP` from the Contacts module. This reinforces that contacts belong to the same status vocabulary regardless of where they're displayed.

---

### Competitive position

- **HubSpot Companies**: Has a similar overview with associated contacts, deals, and activities. HubSpot shows a "Last activity" date prominently; nrtur buries it in secondary fields. HubSpot's "Create task" from the company page opens a full task drawer — nrtur uses `RecordTasks` inline which is more compact.
- **Salesforce Account**: Has the parent account concept (matching nrtur's `parent` lookup) plus a full related-list sidebar showing open activities, activity history, and contacts. nrtur's right panel covers the same ground but in a tighter card layout.
- **Pipedrive Organisation**: Pipedrive does not have a "parent organisation" concept. Activity is tracked through "notes" which is less structured than nrtur's typed `ActivityTimeline`.
- **Attio**: Uses a "company profile" view that auto-enriches domain → logo, description, headcount from Clearbit/similar. nrtur's profile is manual; domain → external link is the only auto-enrichment.

---

### Developer Q&A

**Q: `contactsForCompany` and `dealsForCompany` resolve a company's records. What happens when a company is renamed?**
A: Renaming is rename-safe now. `updateCompany(id, patch)` cascades: when `patch.name` changes, it rewrites the display name (`co` on contacts, `company` on deals) for every child that resolves to that company — and stamps `companyId` on any that were still name-linked — so children are never orphaned. Because the panels join id-first (`c.companyId === co.id` / `d.companyId === co.id`), the People and Deals panels keep resolving the same records across the rename; the display-name cascade only keeps the shown labels in sync. The join stays stable on the id even if a name-string were momentarily stale.

**Q: The `annualRevenue` field has `sensitive:true`. Where is this enforced?**
A: In `RecordProperties`, the renderer checks `field.sensitive && !effCanSeeField('annualRevenue')` (or a similar permission check) to either mask or omit the value. The prototype marks the field but the masking logic must be verified: at what role threshold does it show/hide? The summary says "below Team Lead" — confirm whether Sales Rep sees it masked or omitted entirely.

**Q: "Create invoice" from the More menu pre-fills `company: co.name` and `contact: people[0].name`. What if there are no contacts linked to the company?**
A: `(people[0] && people[0].name) || ''` — the contact field defaults to empty string, not an error. The invoice will be created with no contact name. This is acceptable for company-level invoices (e.g., billing a company directly), but the invoice UI should visually indicate when the contact field is empty so the user can fill it in.

**Q: The `parent` company field is a lookup that navigates to `company-detail`. Can you create a circular parent chain (A is parent of B, B is parent of A)?**
A: The prototype has no guard. The company picker in the `parent` field lookup would allow selecting the current company or any company already in the parent chain. Production must validate: when saving a `parent` field, walk the chain up to the root and reject if the target company already appears anywhere in it.

**Q: The ActivityTimeline for companies doesn't expose `onEmailCompose` or `onCallDial`. Is there any way to log a call or email manually from a company record?**
A: Via `onAddNote` — the Note field accepts free text. The timeline also renders past `email`, `call`, `sms` events from `actCtx` if they were logged at the contact level and the company matches. The company timeline is an aggregated view of company-level activity (meetings scheduled via `onSchedule`, notes added via `onAddNote`) plus inferred cross-object events from contacts and deals. A "Log manually" link (like Contact detail) is absent from Company detail — this is a missing touch.

**Q: Delete uses `requireText: co.name` (type the company name). What if the company name has special characters or is very long?**
A: The confirm input is a plain text field with no normalisation — case must match exactly (the confirm logic does `inputValue === requireText`). A company named "Meridian Agency (formerly PQR Ltd.)" would require typing all of that. Production should either normalise (trim, lowercase) the comparison or switch to a simpler confirmation pattern (checkbox + "I understand" button) for long names.

---

## 7.3 Add Company

**Route:** `add-company` · **Component:** `AddCompanyPage`

### Surface inventory

| Element | Detail |
|---|---|
| Header | Breadcrumb "Companies > New company"; X close button (navigates back to companies) |
| Icon + title block | `Building` icon in brand-coloured square + "Add a company" + "Create an account to group its contacts and deals in one place." |
| Form card | `rounded-2xl` card with 2-col grid + full-width field |
| Cancel button | Navigates to `companies` |
| Create company button | Brand-coloured; navigates to `company-detail` (stub — uses no form data) |

### Fields

2-column grid:

| Field | Type | Placeholder |
|---|---|---|
| Company name | text | "e.g. Meridian Agency" |
| Website | text | "company.com" |
| Industry | select | `INDUSTRIES` constant |
| Type | select | `COMPANY_TYPES` |
| Employees | number | "50" |
| Phone | tel | "+1 555 000 0000" |

Full-width (below grid):

| Field | Type | Placeholder |
|---|---|---|
| Headquarters | text | "City, State" |

**Absent from the Add Company form:**
- Tags (added after creation via the detail page)
- Owner (assigned after creation, or defaults to current user)
- Annual revenue (sensitive — not surfaced on creation)
- Description, LinkedIn, billing address, shipping address (secondary fields, added via edit drawer)

### Validation

None in the prototype. "Company name" has the placeholder "e.g. Meridian Agency" suggesting it's required, but there is no `required` attribute and no client-side guard. "Create company" navigates immediately.

### Post-create navigation

`goTo('company-detail')` — navigates to the first company in the list (prototype stub; no ID is passed). Production must pass the newly created company's ID: `goTo('company-detail', newCompany.id)`.

---

### Design decisions

**Why is the form a 2-column grid, not a single column?**
Six fields across two columns keeps the form short enough to fit on one screen without scrolling on most viewports. The single full-width Headquarters field below the grid signals that it spans both columns by choice. This is the same layout as Add Lead and Add Contact (single-entry mode).

**Why is Phone on the Add Company form but not a primary field on the detail page?**
Phone appears on Add Company as a quick-capture field (companies often have a main switchboard number). But on the detail page, phone is not in `coPrimary` or `coSecondary`. This is a prototype gap — Phone captured at creation is orphaned. Production should add a `phone` field to the company properties schema.

**Why no "Add another" option like the Contacts multi-entry mode?**
Companies are entered one at a time by design. Bulk import is handled by `BulkImportWizard` (accessible via the Import button on the Companies list). Unlike Contacts, there is no `RecordSheet` spreadsheet-entry mode for companies.

---

### Three lenses

**Frontend**
- `AddCompanyPage` is the simplest component in Module 7 — a static form with no state beyond input values. The current prototype doesn't capture field values at all; in production this needs `useState` per field or a form library.
- The `INDUSTRIES` select uses the global `INDUSTRIES` constant (8 options). The `COMPANY_TYPES` select uses the global `COMPANY_TYPES` (4 options). These must match the options used in the Companies list filter and the Company Detail edit drawer.
- The "Create company" button calls `goTo('company-detail')` with no new record. Production must: (1) POST to `/companies`, (2) receive the new company ID, (3) navigate to `company-detail/:id`.

**Backend**
- `POST /companies` payload: `{ name, website/domain, industry, type, size (employees), phone, loc (headquarters) }`. Return the full company record with the generated `id`, `avatar`, `color`, `days:0`, `createdAt`, `createdBy`.
- Required: only `name` should be validated as non-empty. All other fields optional at creation.
- Duplicate check: before creating, check if a company with the same `domain` already exists and warn the user (the prototype has no dedup on creation, only in DuplicatesView after the fact).

**Design**
- The "company.com" website placeholder and the "City, State" HQ placeholder give users clear format guidance without validation messages. Maintain these for production.
- The 7-field form (including Headquarters) covers the most commonly known facts about a company at first contact. Secondary details (billing address, LinkedIn, description) are added later via the edit drawer — a deliberate progressive disclosure pattern.
- No owner field on the form means the owner defaults silently. This is a common shortcut; HubSpot does the same (defaults to the creating user). Consider adding a small "Assign owner" selector for managers who create company records on behalf of their reps.

---

### Competitive position

- **HubSpot New Company**: HubSpot's create form has Company name + Domain name only. All other fields are added after creation. nrtur captures more on first entry (7 fields) — useful when importing data from memory or a spreadsheet, but more friction for quick adds.
- **Pipedrive New Organisation**: Pipedrive captures Name + Owner only on creation. Far simpler, but forces a second edit step for every other field.
- **Salesforce New Account**: Salesforce's "New Account" modal defaults to showing ~12 fields including Rating, Account Source, and Industry. nrtur's 7-field form is a good middle ground.

---

### Developer Q&A

**Q: Phone is captured on the Add Company form but isn't in `coPrimary` or `coSecondary` on the detail page. What happens to it?**
A: In the prototype, the field value isn't stored anywhere — the form has no state. In production, the submitted `phone` would be saved to the company record and should appear in the detail edit drawer. Add `phone` to `coSecondary` (or `coPrimary` if it's prominent enough) so it can be viewed and edited after creation.

**Q: If two users simultaneously create a company with the same domain, how is the duplicate prevented?**
A: The prototype has no creation-time dedup. Production should: (1) add a unique constraint on `domain` in the database, (2) have `POST /companies` return a 409 Conflict with the existing company ID if domain already exists, (3) have the frontend show a "A company with this domain already exists — view it or merge?" option.

**Q: The INDUSTRIES on the Add Company form (`INDUSTRIES` constant) differ from the options in the Company Detail edit drawer (`coPrimary`). Which one should production use?**
A: They must be the same. The canonical list should live in the backend as a lookup table (or a single shared constant on the frontend), not two different hardcoded arrays. The `INDUSTRIES` constant (`Marketing & Advertising`, `Software / SaaS`, etc.) is written for a marketing-agency user base; the `coPrimary` options (`Software`, `Finance`, `Healthcare`, etc.) are traditional business categories. Choose one set and use it everywhere — or make the list configurable per workspace in Settings.
