# Leads
_Module 5 · Verified from `index.html` lines 8571–8970 · 2026-06-30_

Leads are a first-class object in nrtur — separate from Contacts. A Lead is an unqualified person of interest. Once qualified, it converts into a Contact (+ optionally a Company + optionally a Deal). After conversion the lead record stays but becomes read-only.

---

## (a) Complete surface inventory

### 5.1 Leads List Page

**Topbar**
- Object tabs: Leads / Contacts / Companies (shared tab bar for CRM objects)
- Active view label + icon + record count badge
- Import CSV button (permission-gated)
- Export CSV button (permission-gated)
- New Lead button (permission-gated)

**Left rail — View navigator (OmViewRail)**
- System views: All Leads, New, Contacted, Nurturing, Qualified, Unqualified
- User-created views (private / shared / smart lists)
- View folders: Team views, Sales, Marketing (views can be grouped into folders)
- Favourites (star toggle per view)
- Dirty indicator: "unsaved changes" dot when current filter/sort/columns differ from the saved view
- "Save changes" button when dirty
- Bottom fixed items: Converted, Archived, Duplicates

**Toolbar row** (below topbar)
- Search input (searches name, company, email)
- Filters button → opens filter builder panel (AND/OR conditions per field)
- Columns control → toggle which columns show
- Tools menu → includes Duplicates view shortcut

**Active filter chips row** (shown only when filters/search/sort are active)
- One dismissible chip per active view / filter group / sort / search term
- "Clear all" button

**List header** (sticky, blur-backdrop)
- Select-all checkbox
- Sortable column headers (click to cycle: none → asc → desc)

**List rows** (one per lead, default columns):
- Checkbox (hover-reveal, shows for users with edit or delete permission)
- Avatar (colour-coded initials) + Name + Email
- Company + Job title
- Source
- Status pill (inline dropdown — change without leaving the list)
- Score badge (colour-coded 0–100)
- Owner avatar (inline reassign dropdown)
- Estimated value
- Convert button (hover-reveal, green) — opens Convert Lead Modal
- Archive button (hover-reveal) — on active leads
- Restore button — on archived leads (replaces convert/archive)

**Bulk action bar** (floating above footer, appears when rows are selected)
- Count badge + "selected" label
- Reassign (dropdown: team members)
- Archive
- Delete
- Clear selection (X)

**Converted tab** (special, read-only)
- Different header: Lead / Became / Access columns
- Each row: avatar + name + "Converted" green badge + converted-at date + chip links to the Contact / Company / Deal it became + "Read-only" lock badge

**Archived tab** (special)
- Same columns as main list
- "Read-only — archived leads" label in toolbar
- Restore button per row

**Duplicates view** (special, replaces list when selected)
- Renders DuplicatesView component

**Empty states**
- "No leads yet" (when All Leads view is empty, no filters active): shows Import CSV + Add Lead CTAs
- "No leads match this view" (custom view with no results): shows "View all leads" CTA
- "No leads match" (search or filters active): shows "Clear filters" CTA

**Loading state**
- 900ms skeleton: left rail shows 8 placeholder rows; list shows 8 placeholder rows with avatar shimmer, name shimmer, status pill shimmer

**Toast notifications**
- "Status updated to Contacted" after inline status change
- "Reassigned to [name]" after inline owner change
- "[name] archived" / "[name] restored"
- "Lead converted — Contact, Company (and Deal) created."
- "View '[name]' saved"
- "Exported N leads to CSV"

---

### 5.2 Lead Detail Page

**Header**
- Breadcrumb: Leads → [Lead name]
- Record Switcher (prev/next arrows to navigate to adjacent leads in the current list without going back)
- Convert lead button (green, prominent) — only shown if not yet converted
- "Converted" badge (replaces button after conversion — green, with checkmark)
- Schedule button (opens calendar event form)
- More menu (⋯): Edit lead, Delete lead

**Two-column layout** (35% left sticky / 65% right scrolling)

**Left panel — Profile card**
- Avatar (large, 64px, colour-coded)
- Name + Qualification badge (if lead has a qualification)
- Job title · Company (subtitle)
- Status dropdown (inline change)
- Lead Score card:
  - Coloured radial gradient background (colour matches score bucket)
  - "Lead score" label
  - Colour-coded label: e.g. "Strong · likely to convert"
  - Progress bar (width = score %)
  - Score number (large, bold, colour-coded)
- Record Properties (inline editable fields from the primary field list)
- Qualification Card (if lead submitted a form — shows form name, qualified/disqualified status, Q&A answers, booked event, rep assigned)

**Left panel — Primary fields shown inline:**
Name, Company name, Job title, Company domain, Primary email (clickable mailto), Phone (clickable tel), Source, Status, Estimated value, Owner, Tags

**Left panel — Secondary fields (collapsed by default):**
Industry, Employees size, Additional emails, Additional phones, Converted to (links — shown only after conversion)

**Right panel**
- AI Recommended Action card (green border, sparkle icon):
  - Pre-conversion: "[Name] scores X/100 and engaged twice this week. Convert to a contact and open the $X opportunity before it cools." → buttons: Convert now / Email lead / Dismiss
  - Post-conversion: "[Name] is now a Contact [, Company] [and Deal]. Jump to the new records below." → chip links to each created record
- Tasks panel (linked tasks for this lead)
- Activity Timeline (notes, calls, emails, meetings, tasks — chronological)
  - Add note input (permission-gated)
  - Schedule button shortcut

**Meta footer**
- Created by (user avatar + name)
- Created at (date)

**Modals/drawers opened from this page**
- Edit lead drawer (RecordEditDrawer) — full field list, grouped: Basic info / Additional details
- Convert Lead Modal (see 5.4)
- Calendar Event Form Modal (when Schedule is clicked)
- Delete confirmation dialog (requires typing lead name to confirm)

**Delete flow**
- Confirm dialog: "Delete [name]?" + "This moves [name] to the Recycle Bin. You can restore it within 30 days."
- Requires typing the lead's exact name before "Delete lead" button activates
- On confirm: marks lead deleted, shows global toast, navigates back to Leads list

---

### 5.3 Add Lead Page

**Layout**
- Centered card, max-width 672px
- Breadcrumb header: Leads → New lead; X button closes back to Leads

**Form fields (2-column grid)**
- Full name (text)
- Company (text)
- Email (email input)
- Phone (tel input)
- Source (dropdown: Website / Referral / LinkedIn / Cold outreach / Event / Other)
- Status (dropdown: New / Contacted / Nurturing / Qualified / Unqualified)
- Estimated value (currency input)
- Owner (dropdown: team members)

**Actions**
- Cancel → back to Leads list
- Create lead → goes to Lead Detail (in production: saves then navigates)

---

### 5.4 Convert Lead Modal

**Trigger**
- "Convert lead" button in list row (hover-reveal) OR detail page header button OR "Convert now" in the AI card

**Layout**
- Full-height right-side panel, 580px wide
- Backdrop blur overlay; click outside to close; ESC to close

**Header**
- Green arrow icon
- "Convert [name]"
- Description: "Review what will be created. The Contact [, Company] [and Deal] carry over this lead's details — expand any card to edit before converting."

**Three accordion cards**

1. **New Contact** (always present)
   - Collapsed: shows "New Contact" label + "[First Last] · [email]" + green checkmark + chevron
   - Expanded: First name, Last name, Primary email, Job title (all pre-filled from lead)
   - "Also carried:" row shows: Source, Owner, tags count, phone count — these fields auto-carry without manual entry

2. **New Company** (only if lead has a company name)
   - Collapsed: shows "New Company" label + "[Company name] · [domain]" + green checkmark + chevron
   - Expanded: Company name, Domain, Employees size, Industry dropdown (Software / Finance / Healthcare / Retail / Manufacturing / Education / Real Estate / Other)
   - "Also carried:" row shows: Owner, tags count
   - If lead has NO company name: replaced with a dashed placeholder card — "No company name on this lead — skipped." Cannot be edited or toggled on.

3. **New Deal** (optional — user controls via toggle)
   - Toggle OFF by default when lead has no estimated value; toggle ON by default when it does
   - Collapsed (off): "Optional — turn on to open an opportunity"
   - Collapsed (on): "[Deal name] · $[value]"
   - Expanded: Deal name (pre-filled: "[Company] — [Lead name]"), Value ($), Expected close date, Pipeline dropdown (Sales Pipeline / Onboarding Pipeline)
   - "Also carried:" row shows: Source, Owner, tags count, "Placed in first stage"

**Footer**
- Cancel button
- "Convert lead" button (green, full-width on right)

**What happens on Convert:**
1. A new Contact record is created from the Contact card fields + carried fields
2. A new Company record is created (only if company card is present and not skipped)
3. A new Deal record is created (only if Deal toggle is on), placed in the first stage of the selected pipeline
4. The lead record is marked `converted = true` with a timestamp
5. The lead stores links back to the new records: `convertedToContactId`, `convertedToCompanyId`, `convertedToDealId`
6. The lead also stores display names: `convContact`, `convCompany`, `convDeal`
7. A success toast appears: "Lead converted — Contact, Company (and Deal) created."
8. From the detail page: 1.1-second delay then auto-navigates to the new Contact's detail page
9. From the list page: modal closes, lead stays in the list but now shows as converted

---

## (b) Rules & states — what developers need to know

### Lead lifecycle states
A lead can be in exactly one of these states at a time:

| State | Condition | Where it shows |
|---|---|---|
| Active | not archived, not converted, not deleted | Main list |
| Archived | `archived: true`, not converted, not deleted | Archived tab; hidden from main list |
| Converted | `converted: true`, not deleted | Converted tab; read-only everywhere |
| Deleted | `deleted: true` | Recycle Bin only; invisible in Leads module |

Rules:
- You cannot archive a converted lead (conversion takes precedence)
- You cannot un-convert a lead (conversion is permanent — the design has no "undo convert")
- Archived leads can be restored back to Active
- Deleted leads can be restored from the Recycle Bin within 30 days

### Inline status and owner changes
- Status and owner can be changed directly from the list row without opening the detail page
- Status change: click the pill → dropdown opens → select → pill updates immediately + toast
- Owner change: click the avatar → dropdown opens → select team member → avatar updates + toast
- These are the only two fields editable directly in the list row

### Convert field carry rules
| Field | Contact | Company | Deal |
|---|---|---|---|
| Name (split first/last) | ✓ | — | — |
| Email | ✓ | — | — |
| Job title | ✓ | — | — |
| Company name | — | ✓ (as name) | — |
| Domain | — | ✓ | — |
| Industry | — | ✓ | — |
| Employees | — | ✓ | — |
| Source | ✓ | — | ✓ |
| Owner | ✓ | ✓ | ✓ |
| Tags | ✓ | ✓ | ✓ |
| Phone(s) | ✓ | — | — |
| Estimated value | — | — | ✓ (as deal value) |
| Deal placed in | — | — | First stage of selected pipeline |

### Score colour buckets
The detail page background gradient and score label colour change based on score range:
- 0–39: red — low likelihood
- 40–69: amber — moderate
- 70–89: green — strong
- 90–100: brand purple — very high

### View types
- **System views** (built-in): All, New, Contacted, Nurturing, Qualified, Unqualified — read-only, cannot be edited or deleted
- **Private views**: created by the current user, visible only to them
- **Shared views**: created by a user, visible to the whole team
- **Smart lists**: filter-based views that auto-update; have a "smart" badge; can be private or shared

### Dirty state on views
When a user modifies the filter, sort, or columns on a saved view (private or shared), the view rail shows an unsaved indicator and a "Save changes" button. If they switch to another view without saving, changes are lost.

### Permission gates in Leads
| Action | Permission |
|---|---|
| See the Leads module | Leads — view |
| Create a lead / Import | Leads — create |
| Change status, owner, fields inline | Leads — edit |
| Archive a lead | Leads — edit |
| Delete a lead | Leads — delete |
| Export to CSV | separate export permission |
| Convert a lead | Leads — edit |

### Record scope (Own / Team / All)
The effective role's record scope filters the list:
- **Own**: user only sees leads where `owner === current user`
- **Team**: user sees leads owned by anyone on their team
- **All**: user sees every lead in the workspace

This scope also affects the Converted and Archived tabs — scoping is applied before tab filtering.

---

## (c) Design decisions — why this, not that

| Decision | Alternative | Why this | Tradeoff |
|---|---|---|---|
| Leads as a separate object from Contacts | A "Lead" status on the Contact object (like HubSpot) | Keeps unqualified interest separate from confirmed relationships. Prevents cluttering the Contact list with prospects who may never convert | Adds a separate module to navigate; users must know to use Leads, not Contacts, for new prospects |
| Convert creates new records (Contact + Company + Deal) | Promote the lead record itself into a Contact | Clean separation — a Lead and a Contact are genuinely different things. Avoids corrupting Contact data with unqualified fields | Two records now exist (Lead + Contact); the link between them must be maintained |
| Convert modal as a right-side panel | A separate page or modal dialog | Stays in context. User can see the lead's data behind the panel while reviewing what will be created | 580px takes up most of a laptop screen; feels cramped on <768px |
| Deal toggle off by default when no estimated value | Always create a deal | Avoids cluttering the pipeline with worthless or unvalued deals automatically | If reps forget to turn it on, opportunities slip through without a deal |
| Pre-fill all Convert fields from the lead | Start with empty fields | Saves 90% of the typing. The review step exists specifically to catch anything wrong | If lead data was entered sloppily (e.g. full name in the "company" field), the pre-fill will be wrong and must be corrected |
| Converted leads become read-only | Keep them editable | Preserves a clean historical record of what the lead was at the point of conversion. The active record is now the Contact | If a rep needs to correct something on the old lead, they can't — they must edit the Contact |
| Deleting requires typing the lead name | Simple confirm button | Prevents accidental deletion of records, especially named people | Slightly more friction — adds ~3 seconds to an intentional delete |
| AI Recommended Action card always visible on detail | Show only when a suggestion is available | Keeps the rep's next step front-and-centre on every visit | Uses prime real estate; after conversion it's just a link hub, less useful |
| Inline status change from the list | Status only editable in detail page | Lets reps batch-update statuses down the list without clicking into each record | Easy to misclick and change a status unintentionally while scrolling |

---

## (d) Frontend — what the UI requires

### State the Leads List manages
```
search           — text input value
activeKey        — which view is selected (e.g. 'all', 'pv_hot', 'converted')
views            — array of all view objects (system + user-created)
favs             — array of favourited view keys
workFilter       — current filter model {match, conds[]}
workSort         — current sort {key, dir}
cols             — current column keys array
selected         — array of selected lead IDs
convertLead      — which lead's Convert Modal is open (null = closed)
importModal      — CSV import modal open/closed
saveOpen         — Save View modal open/closed
editView         — which view is being renamed (null = new view)
toast            — current toast message (auto-clears after 2500ms)
```

### State the Lead Detail manages
```
status           — current status (local copy, synced to global on change)
extra            — locally added activity items (notes, logged meetings)
convertOpen      — Convert Modal open/closed
schedOpen        — Schedule modal open/closed
editOpen         — Edit drawer open/closed
moreOpen         — More menu open/closed
convToast        — conversion success toast message
```

### Key UI behaviours for the frontend dev
- **Inline status change**: clicking the status pill opens an anchored dropdown. On selection, the pill immediately updates in the list row (optimistic update) and a toast appears. The change must also update the lead score or category if those are derived from status.
- **Inline owner change**: clicking the owner avatar opens an anchored dropdown of team members. On selection, the avatar updates immediately.
- **Hover-reveal actions**: the Convert button and Archive button on each list row are `opacity-0` by default and `opacity-100` on `group-hover`. This means they appear only when the mouse is over that row.
- **Select-all checkbox**: checked when all visible rows are selected; unchecked otherwise. Selecting all then deselecting one should uncheck the header checkbox.
- **Dirty view indicator**: compare current `workFilter + workSort + cols` against the saved view's stored values. If any differ, show the dirty state. "Save changes" writes the current values back into the view definition.
- **Record Switcher**: the prev/next arrows in the detail page header navigate within the current filtered list — not the full dataset. The list context must be passed to the detail page or derived from the same filter state.
- **Convert modal accordions**: each of the three cards can be independently expanded/collapsed. They start collapsed (showing the summary line). Expanding reveals the edit form.
- **Convert → navigate**: after a successful convert from the detail page, wait 1100ms then navigate to the new Contact's detail page. The toast appears immediately; the navigation is delayed so the user can read it.
- **Delete confirmation**: the "Delete lead" button stays disabled until the user has typed the exact lead name into the text input. Case-sensitive match.
- **Score radial gradient**: the background of the lead profile card is `radial-gradient(circle at top, [scoreColor]1a, transparent 70%)` — the colour is derived from the score bucket at render time.

### Columns system
The list uses a dynamic CSS Grid layout. The column template string is built as:
```
"32px [col1.w] [col2.w] ... 92px"
```
Where `32px` is the checkbox, each middle column has a fixed or fractional width (e.g. `1.7fr`, `130px`), and `92px` is the action column. When columns are toggled, the grid re-calculates. Frontend must handle the case where a custom property column has been added — those get appended after the built-in columns.

---

## (e) Backend — what the backend must provide

### Data the Leads List needs
- All leads for the workspace (scoped by role's record access — Own/Team/All)
- Team members list (for owner dropdown and owner filter)
- Custom properties defined for Leads (to add extra columns and filter conditions)
- Duplicate detection results (for the Duplicates view)

### Data the Lead Detail needs
- The single lead record by ID
- All contacts, companies, deals (for the activity timeline cross-references)
- Team members (for Schedule modal and owner field)
- Calendar context (for Schedule)
- Tasks linked to this lead

### Write operations
| User action | What must be written |
|---|---|
| Create lead | New lead record |
| Inline status change | `lead.status` |
| Inline owner change | `lead.owner` |
| Edit lead (drawer) | Any changed fields on the lead |
| Archive | `lead.archived = true` |
| Restore | `lead.archived = false` |
| Delete | `lead.deleted = true`, `lead.deletedAt`, `lead.deletedBy` |
| Convert | New Contact record; optionally new Company record; optionally new Deal record; `lead.converted = true`, `lead.convertedAt`, links to new record IDs and display names |
| Save view | View definition (filter + sort + columns + name + scope) |
| Import CSV | Batch create lead records |
| Export CSV | Read all visible leads + format as CSV download |

### Convert operation — must be atomic
The Convert writes 2 or 3 new records simultaneously (Contact + optionally Company + optionally Deal) AND updates the lead record. If any part fails, none of it should be saved — you get all of it or none. This is the most important backend constraint on the entire Leads module. In a database this should be wrapped in a transaction.

### Duplicate detection
The Duplicates view runs `detectDuplicates('lead', nonArchivedLeads)` in the prototype. The backend needs a duplicate detection query that groups leads by matching email address or matching name+company combination and returns the groups to the frontend.

---

## (f) Competitive position

_Compared to HubSpot, Salesforce, Pipedrive, GoHighLevel, Less Annoying CRM:_

**What nrtur does better than most:**
- **Convert modal with review step**: HubSpot's convert is one click with no review. Salesforce shows a form but it's cluttered and confusing. Nrtur's accordion review — collapsed by default, expand only what you need to fix — is cleaner than both.
- **Leads as a distinct object**: GoHighLevel and most lightweight CRMs collapse leads into contacts with a status field. Having a separate Leads module gives clearer lifecycle management.
- **AI recommended action card**: None of the major CRMs show a persistent, contextual "what to do next" card on the record page. This is a real differentiator if it becomes genuinely intelligent (right now it's static based on score).
- **Inline status + owner change in list**: Pipedrive does this well; HubSpot requires opening the record. Nrtur matches Pipedrive's standard here.
- **Score visible in the list**: Pipedrive and HubSpot both show lead scores in the detail page, not prominently in the list. Nrtur surfaces it as a column in the list, which helps reps prioritise without clicking in.

**Where competitors do it better:**
- **Salesforce** has a richer convert modal — you can match to an existing Contact or Company rather than always creating new ones. Nrtur always creates new records, so if the company already exists in Companies, you'll create a duplicate.
- **HubSpot** shows engagement data (email opens, page views) on the lead record automatically. Nrtur's activity timeline only shows what was manually logged or activity from its own inbox — no external engagement tracking.
- **Pipedrive** has a Board view for leads (kanban by status). Nrtur's Leads module is list-only by default — no kanban for leads specifically (though the Pipeline board handles Deals).

---

## (g) Questions your team will ask — with answers

**"When a user converts a lead and a Contact already exists with the same email — what happens?"**
The current design always creates a new Contact. There is no duplicate check at convert time. If a contact with that email already exists, you will have two contacts. You must decide: should convert check for an existing contact and offer to link to it instead of creating a new one? This is a product decision — the design currently doesn't handle it.

**"Can a converted lead be edited?"**
No. Once converted, the lead record is read-only. If details need changing, they must be edited on the new Contact/Company/Deal records that were created from it.

**"What happens to the lead's tags after conversion?"**
Tags are carried to all three new records (Contact, Company, Deal) at the moment of conversion. After that point, changing tags on the Contact does not affect the original lead's tags — they are separate copies.

**"Can a rep convert a lead without creating a deal?"**
Yes. The Deal card in the Convert modal has a toggle. Turning it off skips deal creation entirely. The toggle is off by default when the lead has no estimated value, on by default when it does.

**"What does 'Placed in first stage' mean for the deal?"**
The new deal is automatically placed in the first stage of whichever pipeline the rep selects (Sales Pipeline or Onboarding Pipeline). The rep cannot choose the stage during conversion — they'd need to move it manually after.

**"If I archive a lead, does the Archive action appear on the converted tab too?"**
No. The Converted tab is read-only — no actions appear there except chip links to the records the lead became and the "Read-only" lock badge.

**"What does the record switcher in the detail page navigate through?"**
It navigates through the same list the user came from — with whatever filters and sort were active at the time. If you were on a "Hot leads" view sorted by score, the switcher goes through those leads in that order. The list context is passed to the detail page.

**"Can we bulk-convert leads?"**
No. The current design does not include a bulk-convert action in the bulk bar. Bulk actions available are: Reassign, Archive, Delete. Convert is intentionally one-at-a-time because it requires a review step per lead.

**"Does deleting a lead also delete the Contact/Company/Deal it was converted into?"**
No. Deletion only marks the lead record itself as deleted. The Contact, Company, and Deal created from it are completely independent records and are not affected.

**"The AI card says 'engaged twice this week' — where does that data come from?"**
In the prototype this text is static/seeded — it's not calculated from real engagement data. In production you would need to count actual activity events (email opens, form submissions, calls) within the last 7 days to generate this text dynamically. This is a flag to your backend team: the AI card's copy implies engagement tracking exists.
