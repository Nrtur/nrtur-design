# Contacts
_Module 6 · Verified 2026-06-30 · `ContactDetailPage` now at line 7914_

> **2026-07-08 update.** (1) The hero **status pill is now inline-editable** (a `ContactStatusDropdown`, not a read-only mirror) with an **Undo** toast, matching Lead/Company; every change audit-logs a "Status updated" activity. (2) The activity timeline participates in **communications routing** — a logged call/email/SMS auto-associates to the contact's single open deal, or shows a **"Link to deal" chip** when several, and rolls up onto the deal's timeline (see [`docs/comms-routing-and-suggestions.md`](../comms-routing-and-suggestions.md)). (3) **Post-call decisions execute for real** (create tasks, set `deal.nextAction`, route Won/Lost to the deal) instead of toasting; the **Recommended-next-action card** prefers the same id-linked deal that action writes to. (4) Emailing from the contact page **logs to the timeline** (`onSent`), and an **`AdAttributionCard`** shows ad origin for ad-sourced contacts. All new mutation surfaces are permission-gated (R10).

Contacts are the primary people object. They are separate from Leads. A Contact is a qualified person — someone you have an actual relationship with or are actively selling to. Contacts are linked to Companies and Deals, and have a full activity timeline including email, SMS, calls, notes, meetings, and task history.

---

## (a) Complete surface inventory

### 6.1 Contacts List Page

**Object tab bar** (shared with Companies and Leads)
- Three tabs: Contacts · Companies · Leads — clicking switches pages without losing context within this session

**Left rail — View navigator (OmViewRail)**
- System views (read-only): All Contacts, My Contacts, Uncontacted, Needs Follow-up, Hot Prospects, New This Week, Customers, No Owner
- Smart lists (auto-updating filter segments)
- Private views (visible only to current user)
- Shared views (visible to whole team)
- View folders: Team views, Sales, Marketing (seeded)
- Favourites (star toggle per view, persists per user)
- Dirty indicator: unsaved-changes dot when the current filter/sort/columns differ from the saved view definition
- "Save changes" button in the rail when dirty
- Bottom fixed item: Archived

**Topbar right slot**
- Import/Export button cluster (permission-gated): Import CSV · Export CSV
- New Contact split button:
  - Primary click: "New Contact" → opens Add Contact (single mode)
  - Dropdown chevron: "Add single contact" · "Add multiple contacts" · "Bulk import" (CSV upload)

**Toolbar row**
- Search input (searches name, company, email)
- Filters button → OmFiltersButton → opens filter builder (AND/OR conditions per field, full Om filter engine)
- Columns control → toggle which columns show + drag-to-reorder
- Tools menu (⋯): "Duplicates" shortcut

**Active filter chips row** (shown when filters, search, or sort are active)
- One chip per: active view (non-All), filter group count, sort field+direction, search query
- Each chip has an X to dismiss just that condition
- "Clear all" button to reset everything

**Sticky list header**
- Select-all checkbox
- Sortable column headers (click cycles: none → asc → desc)

**List rows** (default on-columns):
- Checkbox (hover-reveal, only for users with edit or delete permission)
- Avatar (colour circle, initials) + Name + Email; DNC badge shown on name line if applicable
- Company
- Status pill (inline dropdown)
- Last activity (coloured health dot + time label)
- Owner avatar (inline dropdown for reassignment)
- Deal value

**Optional columns (off by default)**
- Email (as a clickable mailto)
- Phone
- Job title
- Source

**Custom property columns** — any workspace custom field with `col=true` is appended after built-in columns

**Bulk action bar** (sticky at top when rows are selected)
- "N selected" label
- Assign owner (team member dropdown)
- Add tag (searchable + create new)
- Remove tag (shows only tags currently on selected records)
- Set company (searchable + create new company inline)
- Change status (all defined status values)
- Archive
- Delete (requireText = "DELETE" in caps, case-sensitive)
- Clear selection X

**Duplicates tab** (replaces the list when "Duplicates" view is selected)
- Shows DuplicatesView component for contacts — see 6.5 below

**Archived section** (shown when "Archived" view is selected)
- Same columns as main list; no Convert/Archive buttons
- Restore button per row

**Empty states**
- "No contacts yet" (All Contacts view, no filters active, no records): shows Import CSV + Add contact CTAs
- "No contacts match this view" (custom view with zero results): shows "View all contacts" CTA
- "No contacts match" (search or filters active): shows "Try adjusting your search or filters." + "Clear filters"

**Loading state**
- 900ms skeleton: left rail shows 8 placeholder rows; list shows 8 rows with avatar circle shimmer, text shimmer, status pill shimmer, health dot shimmer

**Toast notifications**
- "Status updated to [status]" after inline status change
- "Reassigned to [name]" after inline owner change
- "[name] archived" / "[name] restored"
- "Exported N contacts to CSV"
- "View '[name]' saved" / "View updated"
- "N contacts added" after multi-mode entry
- "[name] moved to Recycle Bin" after delete

---

### 6.2 Contact Detail Page

**Header**
- Breadcrumb: Contacts → [Contact name]
- Record Switcher (prev/next through the current filtered list)
- Schedule button (opens calendar event form)
- More menu (⋯): Star contact · Edit contact · Create invoice · Delete contact

**DNC banner** (shown if contact.dnc = true)
- Full-width amber bar: "This contact is marked Do Not Contact. Email, SMS, and call actions are disabled."
- Suppression state is per-channel; individual suppression badges appear on the profile card

**Two-column layout** (35% left sticky / 65% right scrolling)

**Left panel — Profile card**
- Avatar (64px circle, colour-coded initials) + online indicator (green dot)
- Name (large) + job title + company (as subtitle)
- DNC per-channel badges: "Do not email" · "Do not SMS" · "Do not call" (shown only when applicable)
- Action buttons (4 grid — disabled if DNC or channel suppressed):
  - Send Email (brand accent, opens Email Compose Modal)
  - Make call (opens Contact Dialer Popover — a floating phone widget)
  - Add Note (scrolls to and focuses the note input in the timeline)
  - Send SMS (navigates to Inbox with this contact's SMS thread pre-selected)
- "Log manually" text link (opens Log Call Modal — for logging calls without the dialer)

**Left panel — Record Properties (About)**
- Primary fields (inline editable): First name, Last name, Primary email (with mailto link), Phone (with tel link), Job title, Company (lookup — searchable; create new company inline), Owner, Status (pill selector), Tags, Score (read-only chip)
- "Show all properties" collapsible section: Source, Salutation, Additional emails (list), Additional phones (list), Mailing address (multi-field block), LinkedIn URL, Last activity (read-only datetime), Last contacted (read-only datetime)

**Left panel — Do Not Contact toggle**
- Toggle: "Blocks all email, SMS, and calls."
- Only editable by users with Contacts edit permission

**Left panel — Contact Frequency Indicator**
- Shows how frequently this contact has been contacted relative to workspace settings
- Warns if contact is being over-contacted or approaching frequency cap

**Left panel — Lead Attribution card** (only for contacts that came from a paid ad platform)
- Platform badge (Meta / Google / TikTok / LinkedIn — coloured)
- Campaign, Ad set, Lead form name
- FBCLID / GCLID (raw click ID, monospace font)
- UTM parameters (utm_source, utm_medium, utm_campaign, utm_term, utm_content) — shown as code chips

**Left panel — Deals panel**
- "Deals · N" label + "New deal" quick-add link — the quick-add pre-links the new deal to this contact and its company (passes `contactId`/`companyId` plus the display names)
- Shows this contact's real deals — matched by id (deals where the contact is Primary or an additional contact, or that share the contact's company) with a name fallback
- Each deal shown as a clickable mini card: deal name, value, stage pill (coloured), stage progress bar

**Right panel — AI Recommended Action card**
- Amber border, sparkle icon
- "Recommended next action" label
- Specific suggestion text (e.g. "Follow up on the Q3 proposal — Sarah opened it twice but hasn't replied in 3 days")
- Action buttons: Send follow-up · Schedule call · Dismiss
- Buttons are disabled when contact is DNC

**Right panel — Tasks** (RecordTasks)
- Tasks linked to this contact
- "New task" button (permission-gated)
- Completing a task logs it into the activity timeline

**Right panel — Activity Timeline**
- Channel filter tabs: All · Emails · Calls · Notes · Tasks · Deals · Changes
- Activity types: email, sms, mms, smsclick, call, note, task, meeting, deal, stage, field, dnc, tag, sequence, score, form, invoice, payment, created
- Each item: type chip (coloured) + title + body + actor avatar + relative timestamp
- Email items: expandable to show full thread (sender/recipient, timestamps, snippets)
- Call items: expandable to show call outcome, direction, talk-time ratio bar, AI-generated summary bullets, full transcript with timestamps
- Meeting items: expandable to show agenda, guest list with RSVP statuses (Accepted/Tentative/Declined), location, Google Meet join link
- "Add note" input (text area, auto-focus when "Add Note" action button is clicked)
- "Log a call" button
- "Send email" button
- "Schedule" button
- All write actions are permission-gated and DNC-aware

**Meta footer** (quiet line at bottom)
- "Created by [user name] · Created at [datetime]"

**Modals/drawers launched from this page**
- RecordEditDrawer ("Edit contact") — see 6.7
- Log Call Modal — direction, outcome, reason, duration, notes
- Email Compose Modal — to, subject, body, attachments
- Calendar Event Form Modal (Schedule)
- Contact Dialer Popover — floating widget showing phone number, dialing state, call duration timer, outcome capture on hang-up

---

### 6.3 Add Contact Page

**Two modes** — the page renders ONE at a time, chosen by the nav prop that opens it

**Single mode** (default path from New Contact button)
- Breadcrumb: Contacts → New contact; X button to close
- Icon header: "Add a contact" / "Add one person to your CRM."
- Fields (ContactCreator, single): First name, Last name, Email, Phone, Company, Job title, Status (dropdown, defaults to "Prospect")
- Validation: First name is required + email must match pattern — "Create contact" button stays disabled until met
- Keyboard shortcut: Cmd/Ctrl+Enter to submit
- Cancel → back to Contacts list
- Create contact: checks email against known contacts → if duplicate email detected, opens Duplicate Detection Modal

**Multiple mode** (path from dropdown "Add multiple contacts")
- Breadcrumb: Contacts → New contact; X to close
- Icon header: "Add multiple contacts" / "Spreadsheet-style entry — add many people in one save."
- Body: RecordSheet component (spreadsheet-style grid)
  - Rows: one per contact to add; new rows auto-append as user types in the last row
  - Columns: First name, Last name, Email, Phone, Company, Job title, Status
  - Tab / Enter to move between cells
  - Paste a CSV block to fill multiple rows at once
  - "Add N contacts" button (shows count of valid rows) — shows success toast + navigates back to Contacts list

**New Contact split button menu** (accessed from the Contacts list header, not the Add page)
- "Add single contact" → Add Contact in single mode
- "Add multiple contacts" → Add Contact in multiple mode
- "Bulk import" → opens CSV Import Wizard

---

### 6.4 CSV Import Wizard (BulkImportWizard)

**Trigger**: Import button in Contacts list header or "Bulk import" from New Contact dropdown

**Layout**: full-height right-side panel, 620px wide, slide-in from right

**Step 1 — Upload**
- Drag-and-drop target (large dashed box)
- Click to browse for file
- On file selected/dropped: transitions to success state showing filename + detected row count ("423 rows detected · 6 columns")
- Constraint: max 50MB, UTF-8, first row = headers
- "Download a sample CSV template" link

**Step 2 — Map columns**
- Header row: "CSV column" | arrow | "nrtur field"
- One row per CSV column detected: shows column header (code font) + sample value from first data row → nrtur field dropdown
- Default field mapping pre-filled based on column name matching
- User can reassign each CSV column to any nrtur field

**Step 3 — Preview**
- "Showing the first 5 of N rows as they'll import."
- Preview table: Name · Email · Company · Title (4 columns, first 5 rows)
- Duplicate warning: "N rows have a duplicate email and will be skipped."

**Step 4 — Result**
- Success icon
- "Import complete"
- Three stat tiles: Imported (green) · Skipped (amber) · Errors (red)
- "Download error log (N rows)" link

**Navigation**
- Step progress bar (4 segments, fill left to right)
- "Step N of 4 · [Step name]" subtitle
- Back button (goes to previous step) — becomes "Cancel" on step 1 and "Done" appears on step 4
- Continue / Import button (primary, green) — disabled on step 1 until file is selected; button label = "Import N contacts" on step 3

---

### 6.5 Duplicate Detection View (DuplicatesView)

**Two display modes** (Cards / List toggle — persists to sessionStorage)

**Cards mode** (default)
- One card per duplicate group (2+ records sharing a matched field)
- Group header: confidence badge ("Likely duplicate" amber / "Possible duplicate" grey) + "Matched on [field name]" + record count
- Record cards in a responsive grid (up to 3 per row): avatar + name + company, then Email, Phone, Website/Company, Created date, Activity count
- "Set as primary" radio button per record — clicking sets which record survives a merge
- Group footer actions: Merge · Review · Not a duplicate

**List mode**
- Table: Record A · Record B · Matched on · Confidence · Actions
- Actions column: Merge button (brand) · Review eye button · X dismiss button
- Overflow when a group has 3+ records: "+N more" chip next to Record B

**Toolbar** (when `showToolbar` prop is true — used in the Contacts page and the Settings → Duplicates page)
- "[N] possible duplicates in Contacts" label
- Cards/List toggle
- "Scan now" button (re-runs duplicate detection + shows toast with result count)
- "Bulk merge high-confidence" button (amber) — with confirmation dialog

**Empty state**
- Green check icon + "No duplicates found" + "Run a scan after importing new records."

**Duplicate detection logic** (`detectDuplicates('contact', records)`)
- Runs on the current contact array
- Groups records that share the same email address OR the same name+company combination
- Each group gets a confidence rating (high = email match, lower = name match)
- Dismissed groups persist in session state (resetable by Scan now)

---

### 6.6 Merge Drawer (MergeDrawer)

**Trigger**: Merge or Review button in DuplicatesView

**Layout**: full-height right-side panel, 480px wide, slide-in from right

**Header**: "Merge N records" + "Choose the surviving value for each field."

**Primary record selector**
- Radio buttons for each duplicate record
- Shows: avatar + name + "email/company · N activities"
- Selecting a record as primary auto-sets all field choices to that record's values (user can then override per-field)

**Resolve fields section**
- One card per field in the merge field set
- Conflict cards (amber border): fields where the two records have different values
- Each field card shows: field label + conflict badge (if applicable) + radio options per record (with the record's current value displayed)
- Selecting a value sets which record's value survives the merge

**Combine options (toggles)**
- "Combine activity timelines": merge all calls, emails, notes, and tasks from both records (shows total activity count)
- "Combine tags": union all tags from all merged records

**Footer actions**
- Cancel
- "Merge records" (brand button — writes merged record, removes duplicates, fires toast)

**What happens on merge**:
1. The primary record ID survives; all other record IDs are removed
2. Each field is set to whichever record's value the user chose
3. If "combine activities" is on: all activity items from all records are combined into one timeline
4. If "combine tags" is on: all tags are unioned (duplicates removed)
5. The deduplication happens in one write — no partial merges
6. The duplicate group disappears from DuplicatesView

---

### 6.7 Record Edit Drawer (RecordEditDrawer)

**Trigger**: "Edit contact" from the More (⋯) menu on Contact Detail

**Layout**:
- Desktop: full-height right-side panel, 460px wide, slide-in from right
- Mobile: bottom sheet, up to 90vh, rounded top corners, rises from bottom

**Header**: icon + "Edit [contact name]" + X close button

**Grouped fields**
- Group 1 — Basic info: First name, Last name, Primary email, Phone, Job title, Company (lookup), Owner, Status, Tags
- Group 2 — Additional details: Source, Salutation, Additional emails, Additional phones, Mailing address, LinkedIn URL

**Field behaviours in the drawer**
- Text, email, phone, URL: plain text inputs
- Select / status pill: `<select>` dropdown with all valid options
- Owner: `<select>` of team members by name
- Tags / list: comma-separated input (display: "tag1, tag2, tag3")
- Address: 2-column grid with Street (full-width), City, State, ZIP, Country sub-fields
- Number / currency / percent: `<input type="number">`
- Date: `<input type="date">` with dark colour-scheme
- Textarea: 3-row resizing textarea
- Read-only fields (system-managed): Score, Last activity, Last contacted, Created by, Created at — shown with a lock icon and greyed-out text

**Dirty tracking**
- "Save changes" button is always enabled (not disabled until save — dirty check is on change)
- If the user tries to close with unsaved changes: an overlay appears asking "Discard changes?" with Keep editing / Discard options
- Discard loses all changes; Keep editing dismisses the overlay

**On save**
- Builds a patch object with only changed fields
- If owner changed: also updates ownerColor from the team member lookup
- Calls `updateContact(id, patch)` (updates CrmDataContext)
- Fires global toast: "[name] updated"
- Closes the drawer

---

## (b) Rules & states — what developers need to know

### Contact fields — primary vs secondary
| Group | Fields |
|---|---|
| Primary | first, last, email, phone, title, company (co), owner, status (cstatus), tags, score |
| Secondary | source, salutation, additional emails (list), additional phones (list), address (object), linkedin, lastActivity, lastContacted |
| Meta (read-only) | createdBy, createdAt |

### Contact status values (CONTACT_STATUSES)
Subscriber, Lead, Marketing Qualified Lead, Sales Qualified Lead, Opportunity, Customer, Evangelist, Other, Prospect, Partner, Competitor

Admins can define custom status values in Settings → Statuses. The status pill colour is derived from `pillC(value)` — a hard-coded colour map keyed to status names.

### Health (last-activity) colour system
Contact rows in the list show a coloured dot reflecting how stale the contact is:
- Green (healthy): last activity < 7 days ago
- Amber (cooling): 7–30 days ago  
- Red (at risk): > 30 days ago

This drives the "Uncontacted" and "Needs Follow-up" system views.

### Score
`score` is a 0–100 number. Displayed as a coloured chip:
- ≥ 70: green
- ≥ 40: amber
- < 40: blue

Score is read-only on the detail page (cannot be edited inline or in the drawer). It is computed by the backend (or set by automations/AI qualification rules).

### DNC (Do Not Contact)
- `contact.dnc = true` blocks all send actions on the detail page
- Per-channel suppression (`suppressed.email`, `suppressed.sms`, `suppressed.calls`) can be true independently of DNC — driven by email/phone being on the workspace suppression list
- When any channel is suppressed, an amber badge appears next to the contact's name on the profile card
- The DNC toggle on the detail page controls `contact.dnc` — it blocks all channels at once

### Lead attribution fields (ad-platform contacts)
Contacts that came from a paid ad campaign carry extra fields:
- `adPlatform`, `adSourceKey`, `adSourceLabel`
- `adCampaign`, `adAdset`, `adFormName`
- `fbclid` or `gclid`
- `utmSource`, `utmMedium`, `utmCampaign`, `utmTerm`, `utmContent`

These are shown in the Lead Attribution card on the detail page. They come from the Ad Leads module (Module 15) and the CSV import when those columns are present.

### Record Edit Drawer — read-only field types
The following field types are always read-only in the drawer (shown with a lock icon):
- `datetime` — system-managed timestamps
- `user` — system-set user references
- `converted` — the "Converted to" field
- `score` — computed, not manual
- `relcontacts` — related contacts list (a Deal-specific field; not on Contact)

### Inline property editing (on detail page)
Fields on the detail page are edited by clicking on them — the cell transforms into an input in-place. This is distinct from the edit drawer, which is a bulk-edit experience. Changes made inline update immediately (no "Save" button needed for inline edits). The edit drawer is for editing many fields at once.

### Permission gates in Contacts
| Action | Permission |
|---|---|
| View contacts / list | Contacts — view |
| Create a contact / Import CSV | Contacts — create |
| Inline edit fields, change status, change owner, toggle DNC, add note | Contacts — edit |
| Archive a contact | Contacts — edit |
| Delete a contact | Contacts — delete |
| Export to CSV | export permission (separate gate) |
| Create invoice from contact | Payments — create |
| Create a task | Tasks — create |

### Record scope (Own / Team / All)
Same as Leads — `effScopeRows('Contacts', ...)` filters the list based on the effective role's record scope before any view filter or search is applied. Scoping is based on `contact.owner === current user` (Own), same team (Team), or no restriction (All).

---

## (c) Design decisions — why this, not that

| Decision | Alternative | Why this | Tradeoff |
|---|---|---|---|
| Contacts separate from Leads | One object with a status field (e.g. "Lead" status on Contact) | Cleaner lifecycle separation — a Contact is a confirmed relationship; a Lead is unqualified interest. Prevents the Contact list from being polluted with prospects who may never convert | Adds a separate Leads module users must know about; "Where do I put this person?" is now a judgment call |
| Health dot based on last-activity age, not last-contacted date | Only track explicit "contacted" events | Last activity is broader and more automatic — it catches email opens, form submissions, meetings, and notes, not just outbound sends. Gives a richer staleness signal | Doesn't answer "When did we last initiate contact?" — a user who opens emails every day but never replies looks green, which can mislead |
| 4-button quick-action grid on profile card | Action buttons in the header bar | Keeps send, call, note, and SMS at the top of the record, in the same visible panel as the contact's details. Fast access without scrolling | Smaller targets on mobile; the 4 buttons must all fit in ~320px, which gets tight |
| Per-channel suppression in addition to global DNC | Global DNC only | Allows nuanced blocking — you might want to stop emailing someone but still call them, or suppress SMS because their number is on the DNC list while still sending email | More complex UI — the profile card can now show 3 separate suppression badges plus the global DNC banner |
| Merge drawer with field-by-field choice | Auto-merge always keeping the primary record's values | Prevents data loss when the "winning" record is missing values the "losing" record has | More clicks per merge — each conflict field needs a manual selection |
| Duplicate detection runs client-side on the existing contact array | Server-side duplicate detection on save | Works in the prototype without a backend. In production this should move to the server — client-side is O(n²) and will be slow at scale | Must add a "Scan now" button because results can go stale; doesn't catch duplicates created by two concurrent sessions |
| ContactCreator has two modes (single form vs RecordSheet) on one page | Two separate pages | The "New Contact" button flows the user to one page; the mode is set by the nav prop. This avoids two separate routes for essentially the same intent | Makes the page component more complex internally |
| Email compose is a modal | A dedicated compose page | Keeps the user on the contact's record while composing — they can reference the contact's details while writing. Less navigational friction | Email modal is constrained in size; no multi-window compose; closing navigates back to the same record |
| "Do Not Contact" toggle on detail page | Only in settings | Makes DNC a one-click action visible in the contact's own record. Reps can mark DNC immediately after a call | If a rep accidentally toggles DNC on a high-value contact, there's no undo UX — they'd have to find and toggle it off again |

---

## (d) Frontend — what the UI requires

### State the Contacts List manages
```
search              — text input value
activeKey           — selected view key
views               — array of all view objects (system + user-created)
favs                — array of favourited view keys
viewFolders         — folder groupings for views (useFolders hook)
cols                — active column key array (from omDefaultCols)
workFilter          — current filter model {match, conds[]}
workSort            — current sort {key, dir}
selected            — array of selected contact IDs
importModal         — CSV import wizard open/closed
saveOpen            — Save View modal open/closed
editView            — which view is being renamed (null = new view)
toast               — current toast message
```

### State the Contact Detail manages
```
tab                 — active timeline filter tab ('all' | 'emails' | 'calls' | ...)
noteText            — current note input text
callModal           — Log Call modal open/closed
dialerOpen          — Dialer Popover visible/hidden
composeOpen         — Email Compose modal open/closed
schedOpen           — Calendar Event form open/closed
editOpen            — Edit drawer open/closed
moreOpen            — More menu open/closed
dnc                 — local DNC state (synced to contact on change)
enriched            — whether AI enrichment has been triggered
extra               — this contact's logged activity items (notes, calls, meetings), read from the shared CrmDataContext.activities store — persists across navigation
```

### Key UI behaviours for the frontend dev
- **New Contact split button**: primary click goes to add-contact (single). The dropdown chevron opens a 3-item menu. These are two separate `<button>` elements sharing the same container — the main button and the chevron button. Do not combine them into one.
- **Inline property editing**: each field on the detail page is editable by click. Clicking transforms the display value into an input. On blur (or Enter): commit the change immediately via `updateContact(id, {field: value})`. On Escape: revert to the original value. There is no "Save" button for inline edits.
- **Company field on detail page**: clicking opens an ARLookup component — a searchable dropdown of existing companies. Typing something not in the list offers "Create '[name]'" as an option. Selecting it calls `crm.setCompanies(a => [nrturNewCompany(name), ...a])` and sets the contact's company in one step. The link is by id — `contact.companyId` points at the Company record (the `co` display name is kept alongside it); the "go to company" link resolves the company by `companyId` first, falling back to the name.
- **DNC disabled state**: when `dnc=true` or a channel's specific suppression flag is true, the corresponding action button gets `disabled` attr, cursor:not-allowed, greyed opacity. The tooltip explains why. This must be calculated per-button, not globally.
- **Dialer Popover**: the floating dialer appears inline below the profile card (not as a modal). It shows the phone number, a dial button, and a timer once started. On hang-up it captures outcome, reason, notes; then calls `onPopoverCall(data, seconds)` which logs the call to the activity timeline.
- **RecordSheet (multiple-entry mode)**: this is a spreadsheet grid component. Tab key moves to the next cell in the row; at the last cell Tab creates a new row. Pressing Enter in a row also creates a new row below. Pasting a CSV block (Ctrl/Cmd+V on any cell) should parse the paste content and fill cells. Valid rows = rows with at least a name. The "Add N contacts" button count tracks valid rows in real time.
- **Health dot calculation**: `contactHealth(contact.days)` returns a colour key (green/amber/red) and label (Healthy/Cooling/At risk). `days` is the number of days since the contact's last recorded activity. This must be stored on the contact record and updated by the backend each time an activity is logged.
- **Column grid**: same CSS Grid approach as Leads. `COL = '32px ' + shownCols.map(c => c.w).join(' ') + ' 84px'` where 32px is checkbox, 84px is action column.

---

## (e) Backend — what the backend must provide

### Data the Contacts List needs
- All contacts (scoped by role's record access)
- Team members (for owner dropdown + owner filter + inline reassign)
- Companies list (for filters and the "Set company" bulk action)
- Custom property definitions for Contacts (to add extra columns and filter conditions)
- Tag definitions (for Add/Remove tag bulk actions)

### Data the Contact Detail needs
- The single contact record by ID
- All companies (for company lookup field)
- All deals (to show the deals panel + activity timeline cross-references)
- All invoices (for invoice activity items in the timeline)
- Team members (for schedule form and owner field)
- Calendar context (for Schedule event form)
- Tasks linked to this contact

### Write operations
| User action | What must be written |
|---|---|
| Create contact (single) | New contact record |
| Create contact (multi-entry RecordSheet) | N new contact records in one batch |
| CSV import | Batch create contact records; skip rows with duplicate email |
| Inline field edit | Specific field(s) on the contact |
| Edit drawer save | Patch object with changed fields |
| Inline status change | `contact.cstatus` |
| Inline owner change | `contact.owner`, `contact.ownerColor` |
| Toggle DNC | `contact.dnc` |
| Add note | New activity item (type=note) linked to contact |
| Log call (modal or dialer) | New activity item (type=call) + optional outcome/notes |
| Send email (compose) | New activity item (type=email) + email send |
| Schedule meeting | New calendar event + new activity item (type=meeting) |
| Archive | `contact.archived = true` |
| Restore | `contact.archived = false` |
| Delete | `contact.deleted = true`, `contact.deletedAt`, `contact.deletedBy` |
| Merge | Keep primary record (updated with chosen field values + combined activities/tags); delete removed records |

### Activity timeline — backend data model
Every activity item needs:
- `id`, `type`, `cat` (category), `title`, `body`, `ts` (minutes ago — relative), `actor` (user who performed it)
- Optional: `payload` (call transcript, meeting guests, email thread, etc.)
- Optional: `source` (for cross-object cross-links — e.g. a meeting that also shows on a deal)

In production, `ts` should be an absolute timestamp (ISO 8601), not a relative "minutes ago" number. The prototype uses relative minutes for demo simplicity.

### Duplicate detection — server-side required at scale
Client-side duplicate detection in the prototype is O(n²) — fine for hundreds of records but will break at tens of thousands. Move to server-side: the backend should expose a `GET /contacts/duplicates` endpoint that returns pre-computed groups. The "Scan now" button should call this endpoint and display fresh results. Results should be persisted server-side as a user-dismissable state (not re-appear on next scan after dismissal).

### CSV import — server-side processing
The prototype simulates the import entirely client-side. In production:
- Step 1 (Upload): `POST /contacts/import/upload` — returns an uploadId and detected columns
- Step 2 (Map): `POST /contacts/import/{uploadId}/mapping` — persists column mapping
- Step 3 (Preview): `GET /contacts/import/{uploadId}/preview` — returns first 5 mapped rows + duplicate count
- Step 4 (Confirm): `POST /contacts/import/{uploadId}/run` — enqueues the import job, returns jobId
- Result polling: `GET /contacts/import/{uploadId}/result` — returns {imported, skipped, errors, errorLogUrl}
- The error log download link goes to a pre-generated CSV of failed rows with reason codes

---

## (f) Competitive position

**What nrtur does better than most:**
- **DNC at record level with per-channel granularity**: HubSpot has a global "Marketing emails" opt-out at the contact level but no single unified DNC toggle that blocks calls and SMS too. nrtur's DNC toggle + per-channel suppression badges make compliance status immediately visible on the record.
- **Multi-mode contact entry (single/spreadsheet)**: most CRMs give you one form. nrtur's RecordSheet lets sales ops paste a list of contacts from a spreadsheet directly — far faster than form-by-form entry. Only Attio has a similar "paste from spreadsheet" concept natively.
- **Lead attribution card on contact detail**: surfacing the original ad campaign, ad set, form name, and click ID directly on the Contact is something none of the major SMB CRMs do by default. HubSpot shows UTM data but buries it in analytics, not on the record itself.
- **Activity timeline with call transcripts + talk-ratio**: Salesforce offers this with an add-on (Revenue Intelligence). Pipedrive and HubSpot show call recordings but not in-page transcripts with speaker-attributed lines. nrtur bakes this into the base product.

**Where competitors do it better:**
- **HubSpot** has a "Timeline" that shows external engagement too — email opens, page views, form submissions from the website — automatically. nrtur's timeline is CRM-logged activities only. There's no inbound engagement tracking shown here.
- **Salesforce** has "Activity Capture" which auto-logs emails from Gmail/Outlook without the rep manually logging each one. nrtur's timeline requires manual logging or sending via the built-in inbox.
- **Attio** lets you see a contact's LinkedIn-style profile enrichment automatically (job changes, employer, etc.) without any configuration. nrtur has an "Enrich" button on the detail page (the `enriched` state variable) but enrichment is not built out in the prototype.
- **Close CRM** treats calling as a first-class native feature — the dialer is always one click away in the sidebar, shows call recording, and auto-logs outcomes. nrtur's dialer is a per-contact popover that works but isn't as prominently surfaced.

---

## (g) Questions your team will ask — with answers

**"Can a contact exist without an email?"**
The single add form validates that email is present (`/\S+@\S+\.\S+/`). The multi-entry RecordSheet and CSV import do not enforce this — contacts can be created without an email. The backend must decide: is email required? If not, the duplicate detection that relies on email matching will miss emailless duplicates.

**"What happens to the contact if their company is deleted?"**
The contact links to its company by id — `contact.companyId` — with the `co` name kept alongside as the display value. Joins are id-first (name only as a fallback), so renaming a company is rename-safe: `updateCompany` cascades the new name onto every linked contact and deal, and never orphans them. Deleting a company record, however, does not clear `companyId`/`co` on the contact; the "go to company" link would then point at the deleted (Recycle Bin) record. The backend still needs to decide how to handle a contact whose linked company was deleted.

**"If a rep toggles DNC off, is there an audit trail?"**
Not in the current design. The DNC toggle changes `contact.dnc` but there is no activity log entry created automatically for DNC state changes in the prototype. In production you would want a `dnc` activity type entry ("Marketing emails turned OFF" or "ON") created in the activity timeline whenever the DNC state changes, with the actor and timestamp. The activity type already exists in `ACT_META.dnc` — you just need to create the event.

**"What's the difference between 'Last activity' and 'Last contacted'?"**
- Last activity: any activity associated with this contact — including ones they initiated (form submission, email open, etc.) or that were logged by the system (sequence enrolled, score changed)
- Last contacted: specifically when a rep sent an outbound message or made a call to this contact
Both are stored as separate datetime fields on the contact. The health dot uses `contact.days` which in the prototype is derived from "last activity" broadly.

**"Can two contacts share the same email?"**
The prototype's single-add form detects duplicate emails against a hardcoded list and shows the Duplicate Detection Modal. The multi-entry and CSV import flows do not block duplicate emails — they skip duplicates during import (as noted in the Step 3 warning). In production, you need server-side uniqueness enforcement: decide whether email is a unique index, and what to do when a CSV row has an email that already exists (skip, merge, or flag).

**"When a note is added on the detail page, does it save immediately?"**
In the prototype, notes added via the "Add note" input are written to the shared `CrmDataContext.activities` store (via `crm.addActivity('contact', id, …)`), keyed by the contact's id. They appear in the timeline immediately and now persist across navigation — leaving the record and coming back keeps the logged note (same for logged calls and scheduled meetings). In production, clicking "Add note" should POST that activity item to the backend and optimistically render it in the timeline.

**"What happens if the user sorts by 'Last activity' while viewing a filtered list?"**
The filter and sort are applied in sequence: filter first (`omApplyFilter`), then sort (`omSortRows`). The sort operates on the already-filtered list. The column header for "Last activity" sorts by `contact.days` (ascending = most recent = lowest `days` value first, which is counter-intuitive). You should verify that "asc" on a date field means "most recent first" vs "oldest first" and align the sort direction indicator accordingly.

**"Does the Merge operation move the merged contact's deal and task links to the surviving record?"**
In the prototype: when activities are combined, the timeline events from all records are merged into one array. But deal and task records that reference the deleted contact IDs by name (e.g. `task.contact = 'Sarah Chen'`) are not updated during a merge — they just continue referencing the same name string, which survives because the primary record keeps the same name. If merging contacts with different names, tasks and deals linked to the non-primary name would become orphaned. The backend merge operation must update all foreign references (tasks, deals, notes, activity items) to point to the surviving record's ID.

**"The 'Send follow-up' button in the AI recommendation card opens Email Compose. Is that always right?"**
Yes in the prototype — it always opens EmailComposeModal. The recommendation text is static. In production, the AI card's recommended action might be "Call them back" or "Reschedule the demo" depending on the signal — in those cases, clicking the action should open the dialer or calendar form instead. The action type needs to be part of the recommendation data model, not hard-coded to email.
