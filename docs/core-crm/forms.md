# Module 13 — Forms

_Forms list: `SettingsFormsPage` (line 17221) · Builder: `FormBuilderPage` (line 16985)_
_Route: `settings-forms` · Builder route: `form-builder`_

---

## 13.1 Forms List Page (`SettingsFormsPage`)

### Surface inventory

| Element | What it is |
|---|---|
| Page header | "Forms" with "New form" button |
| Forms list | Table-style rows per form |
| Form row | Status badge · name · submission count · conversion % · sparkline chart · created date · actions |
| Status badge | `active` (green) · `paused` (yellow) · `draft` (gray) — reuses `FORM_ST` = `AUTO_ST` constants |
| Sparkline | 14-point miniature line chart showing submission trend; per-form `spark: number[]` array |
| Submission count | Total submissions (integer) |
| Conversion % | Percentage of visitors who submitted (e.g. 42%) |
| Active/Pause toggle | In-row toggle switches status between `active` ↔ `paused` |
| Share icon | Copies the embed/share link |
| Edit button | Opens `FormBuilderPage` for this form (sets `_formSeed`) |
| Row menu (⋯) | Duplicate · Delete |
| Template gallery | Shown at bottom (or in empty state) — 6 `FORM_TEMPLATES` with icon + name + description |
| Template card | Pick-to-start; sets `_formSeed` from the selected template's design |
| New form button | Opens a "start from scratch" path via the template gallery |

### `FORMS_DATA` — 5 seed forms

| Name | Status | Submissions | Conversion |
|---|---|---|---|
| Request a Demo | active | 184 | 42% |
| Contact Us | active | 97 | 100% |
| Newsletter Signup | active | 512 | 88% |
| Pricing Inquiry | paused | 63 | 55% |
| Event Registration | draft | 0 | 0% |

### `onSubmitChips()` helper

Converts the `onSubmit` config of each form into human-readable action chips shown on the form row (or builder right panel). Output examples: `Create / update contact` · `Tag: demo-requested` · `Create deal` · `2 automations` · `Thank-you message`.

### Status lifecycle

`active` → published, accepting submissions · `paused` → embed still loads but shows "Form paused" · `draft` → builder-only, not embeddable. The toggle in the list row switches between `active` and `paused` only; `draft` transitions to `active` via the builder's Publish button.

---

### Design decisions

| Decision | Alternative | Why this | Tradeoff |
|---|---|---|---|
| Sparkline in the form row | No chart, just totals | A single submissions number doesn't show momentum; a Newsletter form with 512 submissions but flat past 2 weeks needs attention vs a Demo form with 184 but climbing — sparkline makes this obvious at a glance | Sparklines are tiny (14 data points) and lose detail; exact values require a click into submissions modal; the sparkline data is a static array in the prototype — it needs a real time-series API |
| Conversion % on the row | Conversion % only in a detail report | Conversion rate is the primary health metric for a form — 42% for "Request a Demo" is great, 5% means the form needs redesign — showing it on the row avoids a click just to see if something's broken | Conversion = `submissions / views`, and "views" is not tracked in the prototype seed data — the percentage shown is hardcoded; real conversion requires a page-view tracking event on form load |
| 3-state status (active / paused / draft) | 2-state (published / draft) | `paused` covers the case where a form is live and collecting real data but the team temporarily needs to stop intake (e.g. campaign ended, over capacity) without losing embed code or historical data | Three states add UI complexity; most users will be confused why "paused" is different from "draft"; onboarding needs to explain the distinction |
| Template gallery on the list page | New form always starts blank | 6 starter templates (Demo, Contact Us, Newsletter, Event, Job, Feedback) cover 80% of use cases; selecting a template pre-fills blocks, fields, and the on-submit config — dramatically reducing time-to-first-form | Template designs are opinionated; if a user's brand doesn't match the template palette they must restyle everything from scratch anyway |

---

### Frontend — what needs to be built

- Form row: status badge + sparkline (`<SVG polyline>`) + submission count + conversion % + toggle + actions
- `onSubmitChips(form.onSubmit)` → render chips on each row
- Template gallery cards: `FORM_TEMPLATES.map(...)` with icon bg + name + desc
- `setFormSeed(template)` → `goTo('form-builder')` flow
- Admin gate on create/delete/edit (non-admins: read-only with "Contact your admin" state)
- `FormSubmissionsModal` (see 13.3) wired to view button per row

### Backend — what needs to be provided

- `GET /forms` → list with `{ id, name, status, submissions, conversion, created, sparkData }`
- `PATCH /forms/:id { status }` → toggle active/paused
- `POST /forms` / `PUT /forms/:id` / `DELETE /forms/:id`
- `GET /forms/:id/stats` → `{ submissions, conversion, trend: [{date, count}] }` (for sparkline)
- `POST /forms/:id/duplicate` → clone with all fields + onSubmit config

---

## 13.2 Form Builder (`FormBuilderPage`)

_Route: `form-builder` · Component lines 16985–17220_

### Surface inventory

| Element | What it is |
|---|---|
| Header | Form name (inline editable) + Cancel / Save + Publish toggle |
| Publish status | Pill badge: Draft / Live — clicking transitions; shows embed code on go-live |
| Canvas (center) | Header block · form blocks (drag-reorderable) · Submit button — live-rendered form |
| Block inserters | `+` buttons between blocks; click opens `FormAddMenu` |
| `FormAddMenu` | Field type palette + layout blocks palette + search + `FORM_SUGGESTED_FIELDS` quick-add row |
| Field block (canvas) | Shows the rendered input; Edit button → opens block editor drawer |
| Block editor drawer | Appears below or beside block on click; edits label, required, options, map, width, placeholder |
| Right panel — Preview | Toggles between Form and Thank-you state using `FormPreview` |
| Right panel — After submit | `after: 'thankyou'` → heading/message/button; `after: 'redirect'` → URL input |
| Right panel — Automations | `ConnectedAutomations` panel: automation names + statuses wired to this form |
| Right panel — Embed | Code snippet with `<script>` embed tag; copy button; domain restriction field |
| Theme panel (slide-out) | Color palette presets + custom accent/bg/title/text colors + field size + border radius + header image + header layout |
| Submit button panel | Button label + color + hover color |
| Form header block | Image/cover options via `DRIVE_IMAGES` presets or custom; layout: `none` / `cover` / `beside`; form title + description |

### Block model vs legacy fields

Forms older than the builder redesign carry a `fields[]` array (flat field list). The builder uses a richer `blocks[]` model (mixed fields + layout elements). `toBlocks(form)` migrates a `fields[]` form to `blocks[]` on builder open. After the first save from the builder, the form always stores `blocks`.

### Block types

**Field blocks** (`kind: 'field'`):

| Type | Use case |
|---|---|
| `text` | Short text (name, job title) |
| `email` | Email address — validated by browser type |
| `phone` | Phone number |
| `company` | Company name |
| `number` | Numeric input |
| `url` | Website URL |
| `textarea` | Long text / message |
| `dropdown` | Single-select from options list |
| `multiselect` | Multi-select checkboxes |
| `radio` | Radio button group |
| `checkbox` | Single checkbox (yes/no) |
| `date` | Date picker |
| `file` | File upload |
| `consent` | Pre-labeled GDPR/marketing consent checkbox; defaults `map: 'Consent (opt-in)'`, `required: true` |
| `hidden` | Not shown to visitor; captures UTM params or other server-side values via `capture` key |

**Layout blocks** (`kind: 'heading'/'paragraph'/'section'/'divider'/'image'`):

| Type | Use case |
|---|---|
| `heading` | Section header (sm/md/lg/xl size) |
| `paragraph` | Descriptive text between fields |
| `section` | Named section divider |
| `divider` | Visual horizontal rule |
| `image` | Decorative image block from `DRIVE_IMAGES` presets |

### Field properties

| Property | Description |
|---|---|
| `label` | Field label shown to the visitor |
| `map` | CRM field to write to (from `CONTACT_MAP_FIELDS`); `'Do not map'` = discard |
| `required` | Boolean; renders asterisk + validation |
| `placeholder` | Input hint text |
| `width` | `'full'` (100%) · `'half'` (50%) · `'third'` (33%) — controls layout in 3-column grid |
| `options` | For dropdown/multiselect/radio: editable string array |
| `capture` | For hidden fields: the URL param to capture (e.g. `utm_source`) |

### On-submit wiring (`onSubmit`)

| Setting | Options | Effect |
|---|---|---|
| `recordType` | `'contact'` / `'lead'` | Which CRM object a submission targets — **defaults to `'lead'`** (status New). Dedupe by email is three-way: a matching Contact is updated in place (never downgraded), a matching non-converted Lead is updated, otherwise a new Lead (or Contact, if `recordType='contact'`) is created |
| `applyTag` | Tag name or `'none'` | Applies a tag from `FORM_TAGS` to the new record |
| `createDeal` | Boolean | Creates a new deal in the specified pipeline + stage |
| `dealPipeline` | Pipeline name from `FORM_DEAL_STAGES` source | Which pipeline to create the deal in |
| `dealStage` | Stage name | Which stage to place the deal |
| `dealName` | String template | Deal name (e.g. `{{first_name}} Demo Request`) |
| `createTask` | Boolean | Creates a task assigned to `taskAssignee` with `taskTitle` |
| `automations` | Array of automation/sequence names from `ALL_SEQ_NAMES` | Triggers these automations on the new record immediately |
| `after` | `'thankyou'` / `'redirect'` | Post-submit UX |
| `thankHeading`, `thankyou` | Strings | Thank-you message shown in place of the form |
| `thankBtn`, `thankBtnUrl` | Label + URL | Optional CTA button on the thank-you state |
| `redirect` | URL | If `after='redirect'`, visitor is sent here |

### Theme system

| Property | Options |
|---|---|
| Palette preset | 5 `FORM_PALETTES` (Indigo / Emerald / Sky / Rose / Light) — one click sets all colors |
| `accent` | CTA color (button bg, focus ring) — from `FORM_ACCENTS` or custom hex |
| `bgColor` | Form background — from `FORM_BG_PRESETS` or custom |
| `titleColor` | Form heading color |
| `fieldSize` | `'sm'` / `'md'` / `'lg'` — maps to `FORM_FIELD_SIZE` padding/text classes |
| `radius` | `'sm'` / `'md'` / `'lg'` / `'pill'` — input border radius from `FORM_RADIUS` |
| `headerImg` | Image from `DRIVE_IMAGES` presets (5 gradient images) |
| `headerLayout` | `'none'` / `'cover'` (image spans full width) / `'beside'` (image left, form right) |

### `FormPreview` component

`FormPreview` (line 16725) renders the form exactly as a visitor would see it — respecting all theme vars, block types, and layout. Has two states: `form` (input mode) and `thankyou` (post-submit state with the configured heading/message/button). Used in the builder's right panel Preview tab and in `FormSubmissionsModal`.

### `FormAddMenu` component

`FormAddMenu` (line 16824): floating popup that opens when the user clicks a `+` inserter. Structure:
1. Search input — filters both field types and layout blocks
2. `FORM_SUGGESTED_FIELDS` quick-add row (5 common fields: Full name, Work email, Phone, Company, Message)
3. Field types section — all 15 `FORM_FIELD_TYPES` in a grid
4. Layout blocks section — all 5 `FORM_LAYOUT_BLOCKS`

Clicking an item calls `addBlock(key, isLayout)` which calls `makeBlock(key, isLayout)` and splices the new block into `blocks` state at the current insertion index.

### `ConnectedAutomations` component

`ConnectedAutomations` (line 16662): reads `formAutoNames(onSub)` to get the list of automation names, then looks them up in `AUTOMATIONS_DATA` to show their status (active/paused/draft). Provides:
- Per-automation row with name + status badge + edit link
- "Add automation" quick-add dropdown (all existing automations)
- "New automation" button → navigates to automation builder pre-configured with a `form-submitted` trigger for this form

---

### Design decisions

| Decision | Alternative | Why this | Tradeoff |
|---|---|---|---|
| Block model (fields + layout elements mixed) | Fields-only list (no layout blocks) | Lets the user build a real-looking form page — section headings, descriptions, images between fields — not just a raw input list; competes with Typeform/Jotform | Two block kinds (`kind: 'field'` vs `kind: 'heading'` etc.) means the render + editor code must branch on `kind` for every operation; adds complexity to block addition, reordering, and submission processing (layout blocks must be skipped when extracting field values) |
| `toBlocks()` migration shim | Require rebuilding old forms in the new builder | Prevents data loss on upgrade — old forms remain editable in the new builder | The shim converts flat `fields[]` to `blocks[]` on every builder open (no permanent migration); if a form is saved in the old format and the shim is removed, the builder breaks for that form |
| `hidden` field type capturing UTM params | Server-side UTM capture from HTTP referrer | Frontend hidden fields are set client-side and can be spoofed; they need the same UTM params the page loads with; capturing them in the form avoids a separate analytics integration | UTM capture depends on the embed page correctly passing UTMs; the form's `capture: 'utm_source'` must be wired to `window.location.search` parsing in the embed script — not shown in the prototype |
| `DRIVE_IMAGES` presets for header images | Free image URL input | Avoids broken-image states from expired CDN links; gives a consistent set of professionally-designed gradient covers that match the color palette system | 5 presets is a very limited library; users wanting their own logo or brand photography must use a `url` input mode that isn't in the prototype |
| On-submit: create lead (default) OR contact | Always create contact | New form submissions are inbound intake, so the default is a **Lead** (status New) — a stranger shouldn't land straight in Contacts. The `recordType` toggle lets a form that captures known people (e.g. an existing-customer survey) target Contacts instead | A visitor who submits a lead-form and a contact-form under the same email lands in two objects; the built-in three-way email dedupe keeps each object clean but doesn't merge a Lead into a matching Contact automatically — a lead→contact merge is deferred to the convert flow |
| Palette presets + custom color override | Only custom hex pickers | One-click palette (Indigo / Emerald / Sky / Rose / Light) gets users to a coherent design immediately; custom overrides are available for brand precision | Palette presets apply Dark-first themes (4/5 are dark-bg); the "Light" preset is the only option for white-background forms — insufficient for brands that aren't dark-mode native |

---

### Frontend — what needs to be built

- `FormBuilderPage`: canvas state machine (`blocks`, `onSub`, theme props, drag state, selection state)
- `makeBlock(key, isLayout)` — factory for all 20 block types
- `toBlocks(form)` — migration shim for legacy `fields[]` forms
- `FormPreview(blocks, meta, state, onStateChange)` — live preview component, form + thank-you state
- `FormAddMenu(onAdd, insertIdx)` — popup with search, suggested, field types, layout blocks
- `ConnectedAutomations(onSubmit, onChange)` — automation wiring panel
- Block editor inline form per `kind` (field props, heading text, paragraph text, image picker)
- `newBlockId()` — deterministic ID generator (must be stable across saves; current implementation uses `Math.random()` which resets per session — use UUID in production)
- Theme panel: `FORM_PALETTES` one-click + `EBColor`-equivalent per color slot + `FORM_FIELD_SIZE` + `FORM_RADIUS` + `headerLayout` selector
- Submit button panel: label + bg color + hover color
- Embed panel: generate `<script src="..." data-form-id="..." />` snippet + copy to clipboard
- Drag-to-reorder: `blocks` array splice on drag-end; target: mouse-based drag (no library in prototype)
- Width control (full / half / third) on field blocks — `blocks.filter(b=>b.kind==='field').map` grid layout

### Backend — what needs to be provided

- `PUT /forms/:id { name, status, blocks, accent, titleColor, bgColor, textColor, fieldSize, radius, headerImg, headerLayout, btn, onSubmit }` — full form save
- `POST /forms/:id/submit { fields: { fieldId: value } }` — visitor submission endpoint
  - Server must: validate required fields · resolve the person via three-way email dedupe (update matching Contact → update matching non-converted Lead → else create a new Lead by default, or Contact when `recordType='contact'`) · map fields to the resolved record · apply tag · create deal + task (if configured) · trigger automations · return `{ success, redirect? }`
- `GET /forms/:id/submissions` → paginated list for `FormSubmissionsModal`
- UTM capture: embed script must read `window.location.search` and inject UTM values into hidden field inputs before `POST /submit`
- `POST /forms/:id/publish` → transition `draft` → `active`, return embed URL
- Embed delivery: the `<script>` snippet must load the form asynchronously and inject it into a `<div data-nrtur-form>` container on the host page without polluting global styles

---

## 13.3 Form Submissions Modal (`FormSubmissionsModal`)

_Component line 16703 — opened from the form list row_

### Surface inventory

| Element | What it is |
|---|---|
| Modal header | Form name + "Submissions" subtitle |
| Stats row | Total submissions · Conversion rate · Last submission date |
| Submissions table | Date · Visitor data (email, name) · Field values · Source (UTM) |
| Empty state | "No submissions yet" with a form preview |
| `FormPreview` embed | Shows how the form looks in the same modal |

The modal exists but shows limited data in the prototype (seed data only, no real submission records).

---

### Design decisions

| Decision | Alternative | Why this | Tradeoff |
|---|---|---|---|
| Submissions modal on the list page | Separate submissions analytics page | Allows quick review without navigating away from the forms list; most users just want to see "who submitted?" not a full analytics page | Modal is space-constrained; for forms with 500+ submissions, a paginated modal is awkward — real analytics requires a dedicated page with filtering + CSV export |

---

### Frontend — what needs to be built

- Submissions table with pagination (page, limit)
- CSV export button (`a[href]` with data URI or backend `/export`)
- Per-submission row: timestamp + mapped field values + UTM source
- `FormPreview` embedded in empty state

### Backend — what needs to be provided

- `GET /forms/:id/submissions?page=&limit=&search=` → `{ total, items: [{ submittedAt, fields: {...} }] }`
- `GET /forms/:id/submissions/export.csv` → CSV stream

---

## Developer Q&A

**Q: The `newBlockId()` function uses `Math.random()` — what happens when the page reloads?**
A: `let _blkId = 1` resets to 1 on every page load, and `newBlockId()` returns `'b1_' + randomSuffix`. IDs like `b1_abc123` will collision across sessions — two different blocks in two different forms may get the same ID. The prototype doesn't persist blocks to a real database, so this is invisible. In production, use `crypto.randomUUID()` for block IDs, or let the backend assign stable IDs on save and return them.

**Q: `toBlocks()` migrates old `fields[]` to `blocks[]` on every builder open but never writes the result back unless the user saves. What's the risk?**
A: A form opened in the builder but closed without saving stays in `fields[]` format. The next open re-migrates from scratch. This is fine as long as `toBlocks()` is deterministic (it is — it just maps the array). Risk: if `toBlocks()` has a bug (e.g. drops `options`), every old form that hasn't been re-saved is silently corrupted on builder open. Write a migration job that converts all stored `fields[]` forms to `blocks[]` at deploy time to eliminate the shim.

**Q: The on-submit `automations` array stores automation names (strings), not IDs. What happens when an automation is renamed?**
A: The reference breaks silently — `ALL_SEQ_NAMES` includes the renamed sequence under its new name, but the form's `onSubmit.automations` still has the old name. The form will appear to have a connected automation that no longer resolves. Production must use automation IDs (UUIDs), not names, and display names are looked up at render time from the automation record.

**Q: A `hidden` field captures `utm_source` from the URL. How does the embed script actually read this?**
A: The prototype doesn't implement the embed script — it only generates the code snippet. In production, the embed script must: (1) parse `new URLSearchParams(window.location.search)` on the host page; (2) find all `<input type="hidden" data-capture="utm_source">` elements the form renders; (3) set their `value` to the corresponding URL param before the form submits. If the embed script doesn't do this, hidden fields always submit empty.

**Q: A visitor can submit a lead-form AND a contact-form under the same email. How does deduplication work?**
A: The submission handler (`runFunnelSubmit`, shared by forms and funnels) now dedupes by lowercased email **three ways** before creating anything: (1) a matching Contact is updated in place (tags merged, missing fields filled) and never downgraded to a Lead; (2) else a matching non-converted Lead is updated in place; (3) else a new record is minted — a Lead by default, or a Contact when the form's `recordType='contact'`. What's still deferred: cross-object merging. If a Lead and a Contact both exist for the same email, the handler updates whichever the form targets rather than merging the two — a lead→contact merge is handled by the convert flow (see Module 6.5, Duplicate Detection) rather than at submit time.

**Q: `FormPreview` renders the live form. Is it safe to embed in the modal and builder simultaneously without state conflicts?**
A: `FormPreview` has its own local `submitted` state. If you render it in both the builder right panel and the submissions modal at the same time, they are independent component instances — no shared state conflict. The risk is that clicking "Submit" in the builder preview triggers `onSubmit` in the preview, which could accidentally call a real submission handler. The prototype doesn't wire a real submit handler to the preview — it just toggles `submitted` to show the thank-you state. Production must explicitly pass `isPreview={true}` to `FormPreview` and skip the real submit when rendering in preview context.

**Q: The Theme panel has `FORM_PALETTES` — 4 dark-bg presets and 1 Light. What happens when a user embeds a dark-themed form on a white marketing site?**
A: The form renders with a dark background (`#141422` for Indigo palette) as a contained block inside a white page. If the embed `<div>` has no explicit height, the dark block floats inside the white page and looks correct (it's self-contained). The visual disconnect between the host page's white background and the form's dark skin is a design decision the user must make. The embed script should support a `data-bg="transparent"` attribute so the form adopts the host page background — this is not implemented in the prototype.
