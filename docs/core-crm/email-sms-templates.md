# Module 12 — Email & SMS Templates + Compose

_Email templates list: `EmailTemplatesPage` (line 10580) · Builder: `EmailBuilderPage` (line 10183)_
_SMS templates list: `SMSTemplatesPage` (line 11633) · Edit modal: `SMSTemplateEditModal` (line 11604)_

---

## 12.1 Email Templates List Page

### Surface inventory

| Element | What it is |
|---|---|
| Page header | "Email Templates" with New Template button (admin-only) |
| Read-only banner | Non-admins see "Email templates are shared workspace assets." |
| Search input | Filters templates by name |
| Category filter chips | All / Follow-up / Intro / Proposal / Onboarding / Re-engage |
| Favorites toggle | Shows only starred templates |
| Grid/List view toggle | Card grid (with visual preview) vs compact list |
| Template card | Visual email preview (scaled down) + name + category badge + stats |
| Template stats | Open rate · Reply rate · Used N× · Updated N ago |
| Favorite star | Click to toggle; favorites sort to top |
| Card actions (hover) | Edit (→ builder) · Duplicate · Delete · Use in sequence |
| Folder organization | `FolderedCards` drag-drop grouping (same pattern as Sequences) |
| Template preview modal | Click card thumbnail → fullscreen email preview |
| `EmailTemplateEditModal` | Quick inline edit (name/subject/body) without opening the full builder |

### `EMAIL_TEMPLATES` seed data

5 built-in templates: Follow-up · Welcome/onboarding · Re-engagement (60d) · Introduction · Proposal. Each carries: `id, name, category, favorite, uses, openRate, replyRate, updated, subject, body`.

### Template categories (`EMAIL_TEMPLATE_CATS`)

| Key | Color |
|---|---|
| `follow-up` | Brand purple `#818cf8` |
| `intro` | Green `#34d399` |
| `proposal` | Violet `#a78bfa` |
| `onboarding` | Amber `#fbbf24` |
| `re-engage` | Cyan `#22d3ee` |

---

### Design decisions

| Decision | Alternative | Why this | Tradeoff |
|---|---|---|---|
| Visual scaled-down email preview on the card | Text-only card (name + subject) | Shows the actual design at a glance; helps identify the right template without opening it | Preview renders live via `EmailBlockView` at 42% scale — adds DOM cost for large grids; consider generating a static image thumbnail in production |
| Stats (open rate, reply rate) on the template card | Stats only in an analytics view | Lets users immediately see which templates perform — a "Follow-up" with 12% reply rate vs 22% reply rate is an easy choice | Stats are averages across ALL sends; a template used on a hot lead list will show inflated stats vs one used on cold lists |
| `EmailTemplateEditModal` for quick edits alongside the full builder | One path to editing (always open builder) | Quick body/subject edits don't warrant loading the full block builder; modal saves 3–4 clicks for minor changes | Two editing surfaces for the same object; changes in the quick modal bypass the block model — body is saved as plain text, not as blocks |

---

### Frontend — what needs to be built

- Template card grid with scaled preview (`EmailBlockView` at `scale(0.42)`)
- Category chip filter + search + favorites toggle + grid/list toggle
- Folder drag-drop via `useFolders('email-templates', ...)`
- Template preview modal (full-size `EmailBlockView` render)
- `EmailTemplateEditModal` quick edit (see 12.3)
- Admin gate on create/edit/delete

### Backend — what needs to be provided

- `GET /email-templates?category=&search=&favorites=` — list
- `POST /email-templates` / `PUT /email-templates/:id` / `DELETE /email-templates/:id`
- `GET /email-templates/:id/stats` — `{ openRate, replyRate, uses, lastUsed }` (aggregate, updated async)
- Folder API: same pattern as sequences (see 11.1)

---

## 12.2 Email Builder (`EmailBuilderPage`)

_Route: `email-builder` · Component: `EmailBuilderPage` (line 10183)_

### Surface inventory

| Element | What it is |
|---|---|
| Breadcrumb header | "← Templates › {template name}" — name is an inline editable input |
| Desktop / Mobile toggle | Switches canvas width: desktop = template `meta.width` (default 600px); mobile = min(width, 360px) |
| Cancel / Save template buttons | Admin-only; cancel navigates back to `email-templates` or the return route |
| Read-only banner | Non-admins see the read-only banner |
| Subject line bar | Below header; subject saved on the template; "inherited by sequences" note |
| Block palette (left sidebar) | 9 block types: Heading / Text / Image / Button / Columns / Divider / Spacer / Social / HTML |
| Email canvas (center) | Live preview at actual pixel dimensions; blocks rendered by `EmailBlockView`; click to select |
| Selected block overlay | 2px brand-purple outline; top-right action buttons (move up/down, duplicate, delete) |
| Locked footer indicator | Unsubscribe footer shows "Required" chip; no move/delete buttons |
| Block properties panel (right sidebar) | Shows block-specific form when a block is selected; shows global email styles when nothing is selected |
| Email styles panel | Page background · Content background · Accent color · Body text color · Content width · Font family |
| Width indicator | "600px · variables preview with sample data" below canvas |
| Toast | Bottom-center confirmation on save |

### Block types

| Block | Description |
|---|---|
| `heading` | H1/H2/H3 with font size, color, alignment, padding |
| `text` | Paragraph text with rich formatting |
| `image` | URL-sourced image with alt text, width, link URL, border-radius |
| `button` | CTA button with label, URL, bg color (defaults to `meta.accent`), border-radius, alignment |
| `columns` | 2-column layout; each column contains a nested block |
| `divider` | Horizontal rule with color and height |
| `spacer` | Empty vertical space with adjustable height |
| `social` | Social icon links (Twitter/LinkedIn/Instagram/Facebook) with icon size + color |
| `html` | Raw HTML block for custom markup; escape hatch for anything the block editor can't express |

### Locked unsubscribe footer

`ebEnsureUnsub(blocks)` guarantees a `{ type: 'text', locked: true }` unsubscribe footer is always at the bottom. Attempting to delete it shows a toast: "The unsubscribe footer is required by law (CAN-SPAM / GDPR) and can't be removed." Moving it is also blocked. The footer cannot be duplicated.

### Block insertion logic

New blocks are inserted BELOW the currently selected block, or at the bottom if nothing is selected — but always ABOVE the locked footer. `add(type)` finds `fi` (index of first locked block) and clamps the insertion index to `max = fi`.

### Save behaviour

`save()` does several things:
1. Extracts `plain` text from all `text` blocks (for the `body` field used in quick edits and SMS fallback)
2. Falls back to the first `heading` block's text as the subject if the subject bar is empty
3. Updates `EMAIL_TEMPLATES` in-place if the template already has an `id`, otherwise prepends a new entry
4. Navigates back to `_emailTplReturn` (set by `NewEmailModal` or direct navigation)

### `_emailTplSeed` global

A module-level variable (`let _emailTplSeed = null`) acts as a seed passed from `NewEmailModal` to `EmailBuilderPage`. When set: `EmailBuilderPage` reads it as the starting template (using `bodyToDesign(seed)` to convert plain-text body to a block design, or using `seed.design` directly if it's a starter template). After use, `_emailTplReturn` determines the back-navigation target.

---

### Design decisions

| Decision | Alternative | Why this | Tradeoff |
|---|---|---|---|
| Drag-free block editor (click to select, move up/down arrows) | Drag-and-drop block reordering | Simpler to implement in a single-file prototype; no drag library needed; up/down arrows are universally understood | Reordering a block from position 1 to position 8 requires 7 arrow clicks; drag-and-drop is strongly expected by users of modern email builders |
| Single canvas column (no sidebar sections visible in canvas) | Split preview + editing panels side-by-side | More vertical space for the canvas; full-width rendering of each block | Editor and preview are in different panels — user edits in the right panel, sees result in the center; context-switching between edit and preview |
| `meta.accent` auto-applied to new buttons | Fixed default button color | Brand consistency: the accent color is set at the template level; buttons inherit it so the CTA always matches the template's color scheme | If the designer changes `meta.accent` AFTER adding buttons, existing buttons don't update — they retain the color set at creation time |
| Subject line as a top bar, not inside the canvas | Subject line as a special block at the top | Subject never appears in the visual email body; it's email metadata — keeping it outside the canvas avoids confusion about whether it's a heading block or the actual subject | Subject saved on the template but shown separately from the block design — two places to look when the "welcome email" subject needs updating |
| Locked unsubscribe footer via `ebEnsureUnsub` | Optional footer the user can add/remove | CAN-SPAM and GDPR mandate an unsubscribe mechanism in commercial emails; making it mandatory removes a category of compliance errors | Users building internal / transactional (non-marketing) templates are forced to include a marketing-style footer they don't need |

---

### Frontend — what needs to be built

- `ebNew(type)` — factory for each block type with sensible defaults
- `ebid()` — unique block ID generator
- `EmailBlockView(b, meta)` — renders a block to its final visual output (used in canvas AND in `NewEmailModal` starter previews)
- `EmailBlockProps(b, update)` — per-block properties form in the right sidebar
- `EBColor` — color picker component
- `EBField` — label + input wrapper
- `defaultEmailDesign()` — generates the blank-canvas starting state
- `bodyToDesign(seed)` — converts a plain `{ subject, body }` template to a block design (single text block)
- `ebEnsureUnsub(blocks)` — append/guarantee the locked footer
- `EMAIL_STARTERS` — pre-built designer starter templates (used in `NewEmailModal`)
- `EMAIL_WIDTHS`, `EMAIL_FONTS` — selectable values for the global styles panel
- Desktop/mobile toggle updates `cw = device === 'mobile' ? min(meta.width, 360) : meta.width`

### Backend — what needs to be provided

- `PUT /email-templates/:id` — save `{ name, category, subject, body (plain), design (JSON) }`
- `design` is the full block model: `{ meta: {...}, blocks: [{id, type, ...blockProps}] }`
- The `body` plain-text field is needed for SMS fallback sends and quick edits that don't load the full builder
- Subject stored on the template definition, not on the block model

---

## 12.3 Email Template Edit Modal (`EmailTemplateEditModal`)

_Quick in-place edit without opening the full builder_

### Surface inventory

| Element | What it is |
|---|---|
| Two-pane layout | Left: edit form · Right: live email preview |
| Template name input | Editable name |
| Subject line input | Editable subject |
| Category selector | Colored button group |
| Body editor | Textarea with markdown-ish formatting toolbar: Bold / Italic / Link / Bullet list |
| Merge tag insertion | Buttons for `{{first_name}}` `{{company}}` `{{deal_name}}` `{{calendar_link}}` `{{my_name}}` |
| Character stats | Word count · Estimated read time |
| Email preview (right pane) | Mocked inbox view: From name + avatar · subject line · body rendered · timestamp |
| Desktop/Mobile toggle | Switches preview width |
| Email sender identity | `EMAIL_SENDER` / `EMAIL_SAMPLE` constants |
| Save / Cancel buttons | Save updates `EMAIL_TEMPLATES` in-place; Cancel closes without saving |

### Key behaviour

The modal edits `body` as markdown-like plain text. It does NOT edit the block model. If the template was created in the builder with a complex block layout, the quick edit shows the text extraction of that layout (from `plain` in `save()`), and saving from the quick edit overwrites only the `body` field — the `design` (block model) may become out of sync with the new body.

---

### Design decisions

| Decision | Alternative | Why this | Tradeoff |
|---|---|---|---|
| Plain text body editor in the quick edit modal | Always open the full block builder | 90% of email template edits are minor text changes (update a name, change a CTA phrase); a modal is faster than loading the full builder | `body` and `design.blocks` can diverge — the block builder shows the old design; the quick edit reflects only text; the next send uses whichever the API returns for `body` |
| Live preview with `EMAIL_SENDER` mock identity | No preview in quick edit | Seeing the email in inbox context (from/avatar/subject/body) helps the user judge if the tone and layout are right | Mock sender identity is static; users must imagine how their real name and photo look |

---

### Frontend — what needs to be built

- Formatting toolbar: Bold (`**word**`), Italic (`_word_`), Link (`[label](url)`), Bullet (`- item`)
- Merge tag insertion: insert `{{var}}` at cursor position in the textarea
- Live email preview component: mock inbox frame with From, Subject, body text
- Desktop/mobile preview width toggle
- Word count + read time calculation (words / 200 wpm for read time)

### Backend — what needs to be provided

- `PUT /email-templates/:id { name, subject, category, body }` — partial update; `design` not modified by this endpoint

---

## 12.4 New Email Modal (`NewEmailModal`)

_Side-panel for creating a new email template: blank canvas / HTML paste / starter template_

### Surface inventory

| Element | What it is |
|---|---|
| Slide-in panel header | "Create an email template" |
| Blank canvas button | Opens builder with `defaultEmailDesign()` |
| Paste HTML button / form | Toggle to HTML textarea; submits HTML as a single `html` block in the builder |
| Designer templates gallery | Grid of `EMAIL_STARTERS` with scaled visual previews + name + category + description |
| Template preview | Rendered via `EmailBlockView` at 42% scale inside a 188px-tall container |

### Flow

1. User picks Blank / Paste HTML / Starter template
2. `setEmailTplSeed(seed)` writes seed to the module-level global
3. `setEmailTplReturn('email-templates')` sets where the builder navigates on Save
4. Modal closes, `goTo('email-builder')` navigates to the builder
5. Builder reads `_emailTplSeed` and initialises its state

---

### Design decisions

| Decision | Alternative | Why this | Tradeoff |
|---|---|---|---|
| Module-level globals (`_emailTplSeed`, `_emailTplReturn`) to pass state to the builder | URL params / query string / context | Simplest in a single-file prototype with no router | Globals are mutable and fragile; if two tabs open the builder simultaneously they'd clobber each other's seed. Production must use URL params or route state |
| Scaled-preview (`scale(0.42)`) of starter templates at creation time | Static screenshot images | Always up-to-date with real block rendering; no asset pipeline | 6 starter previews × N blocks each = significant DOM at gallery open time; consider `content-visibility: auto` on thumbnails |

---

### Frontend — what needs to be built

- `EMAIL_STARTERS` — pre-built design objects with `{ key, name, desc, category, design: {meta, blocks} }`
- Starter gallery: 2×3 grid; each card renders `EmailBlockView` blocks at `scale(0.42)` inside fixed-height container
- HTML paste mode: textarea + "Open in builder" button that wraps raw HTML in a single `html` block
- `setEmailTplSeed` / `setEmailTplReturn` global setters

### Backend — what needs to be provided

- No backend call at creation; the seed is held in memory until the builder saves

---

## 12.5 Email Compose Modal (`EmailComposeModal`)

_One-off email from contact detail or inbox — not a template edit_

### Surface inventory

| Element | What it is |
|---|---|
| Floating panel (bottom-right) | Fixed position, 540px wide, above page content |
| To field | Pre-filled from `defaultTo` prop (e.g. contact's email); editable |
| Cc/Bcc toggle | Shows Cc and Bcc rows when toggled |
| Subject field | Pre-filled from `seedSubject` prop; editable |
| Body textarea | 9 rows; pre-filled from `seedBody` prop |
| Attachment chips | Simulated attachment add (appends "document-N.pdf"); removable |
| Schedule indicator | Shows "Scheduled to send {option}" when set; removable |
| Toolbar | Attach · Templates · AI draft (Sparkles icon) |
| Templates picker | Dropdown of `EMAIL_TEMPLATES`; selecting one fills subject + body |
| Schedule send picker | Dropdown: "In 1 hour" · "Tomorrow 9:00 AM" · "Tomorrow 1:00 PM" · "Monday 8:00 AM" |
| Send / Schedule / Discard buttons | Send disabled until To + Subject are non-empty; label changes to "Schedule" when scheduled |
| Sending state | `sending` state (900ms fake delay) before `onSent()` callback + close |

### Props

- `defaultTo` — pre-filled recipient (e.g. contact email)
- `onSent({ to, subject, body, scheduled })` — callback to log activity in the timeline
- `seedSubject`, `seedBody` — pre-filled from deal name or previous thread

---

### Design decisions

| Decision | Alternative | Why this | Tradeoff |
|---|---|---|---|
| Floating bottom-right panel (not a modal overlay) | Full-screen compose modal | User can read the contact's timeline while composing; the compose window stays on screen without blocking context | Fixed position means it doesn't scroll with the page on short viewports; the textarea may be hidden behind the panel on mobile |
| Templates inline picker (not a separate modal) | Separate template browser modal | One click to apply a template; keeps the compose flow uninterrupted | Dropdown is narrow (56px wide, shows only name); no preview of template content before applying |
| Simulated "AI draft" button (no action) | Full AI compose feature | Placeholder for a future feature; shows intent without blocking shipping | Users who click Sparkles and get no response will be confused |
| `seedSubject` / `seedBody` props | Always start blank | Compose opened from a deal ("Create quote") or inbox thread can pre-fill context without requiring the user to copy/paste | If the seed body is wrong or stale, the user must clear and re-type — no undo |

---

### Frontend — what needs to be built

- Floating panel anchored bottom-right with `pointer-events-none` wrapper (allows clicks through to page)
- `To` / `Cc` / `Bcc` row fields; Cc/Bcc hidden by default
- `scheduleOpen` dropdown with 4 preset times; selected time shown as a chip in the compose area
- `tplOpen` templates dropdown: reads `EMAIL_TEMPLATES`; `applyTpl(t)` fills `subject` + `body`
- Attachment chip list: add (simulated file picker) + `×` remove per attachment
- Send button disabled state: `!to.trim() || !subject.trim() || sending`
- `onSent` callback integration with `ActivityTimeline` for the "email sent" event

### Backend — what needs to be provided

- `POST /emails/send { to, cc, bcc, subject, body, contactId?, dealId?, scheduledFor? }` — send immediately or enqueue for scheduled time
- `POST /activities { kind: 'email', contactId, payload: { to, subject, preview } }` — log to timeline
- Schedule queue: jobs triggered at `scheduledFor` timestamp; cancellable before send
- AI draft: `POST /ai/draft-email { contactId, context }` → returns suggested subject + body

---

## 12.6 SMS Templates List Page (`SMSTemplatesPage`)

### Surface inventory

| Element | What it is |
|---|---|
| Page header | "SMS Templates" with New Template button (admin-only) |
| Search input | Filters by template name or body text |
| Category filter chips | All + 6 categories (Follow-up / Intro / Meeting / Pricing / Renewal / Win-back) |
| Favorites toggle | Stars filter to top |
| Template grid | 2-column card grid |
| Template card | Category badge (colored pill) · favorite star · name · body preview (3 lines clamped) · character count + SMS segment count · Usage stat · Edit + Use buttons |
| `SMSTemplateEditModal` | Slide-in edit panel (see 12.7) |
| Folder organization | Same `useFolders` + `FolderedCards` drag-drop pattern |

### `SMS_TEMPLATES` seed data

8 templates across 6 categories. Each: `id, name, category, favorite, uses, body`. Key ones: Proposal follow-up day 2 / New lead intro / Meeting confirmation / Discount expires Friday / Renewal 30 days out / Quiet pipeline nudge / Call recap / Demo no-show.

### SMS segment counter

`SmsSegments(body)` calculates how many SMS segments a message uses: standard GSM-7 = 160 chars per segment; Unicode characters reduce to 70 chars/segment. A 165-char GSM message = 2 segments. Shown as "165 chars · 2 SMS" on the card.

---

### Design decisions

| Decision | Alternative | Why this | Tradeoff |
|---|---|---|---|
| Segment counter on the card | Show only character count | SMS pricing is per-segment, not per-character; a template that crosses the 160/70-char boundary doubles cost — users need to see this at a glance | Segment counting depends on character set; Unicode detection requires scanning the body string — must match the sending provider's exact encoding logic |
| Body preview clamped to 3 lines | Show full message | Most SMS templates are short; 3 lines shows enough context to identify the template without making the grid oversized | Long templates (150+ chars) are truncated mid-word; user must open the edit modal to see the full text |
| Same category color system as email templates | Separate color system for SMS | Consistent visual language; a "Follow-up" template is always purple regardless of channel | SMS and email categories are different (`pricing` and `renewal` are SMS-only; `proposal` and `re-engage` are email-only) — the color system is shared but the category sets don't overlap |

---

### Frontend — what needs to be built

- `SMS_TEMPLATE_CATS` color map for badge rendering
- `SmsSegments(body)` utility: GSM-7 char detection + segment math
- Template card: 3-line body clamp (`-webkit-line-clamp: 3`), character count, SMS segment count
- Category chip filter + search + favorites toggle
- `useFolders('sms-templates', ...)` for drag-drop grouping
- Admin gate on create/edit/delete

### Backend — what needs to be provided

- `GET /sms-templates?category=&search=&favorites=`
- `POST /sms-templates` / `PUT /sms-templates/:id` / `DELETE /sms-templates/:id`
- Segment count should be validated server-side at send time (provider may count differently)

---

## 12.7 SMS Template Edit Modal (`SMSTemplateEditModal`)

_Right-side slide-in drawer for quick SMS template editing_

### Surface inventory

| Element | What it is |
|---|---|
| Drawer header | "Edit template" or "New template" + close button |
| Template name input | Editable name |
| Category selector | Colored button group (6 categories) |
| Body textarea | 4 rows; the full message body |
| Character counter | Live `body.length` count + SMS segment count |
| Merge tag buttons | `{{first_name}}` `{{company}}` `{{deal_name}}` `{{meeting_link}}` `{{my_name}}` |
| Save / Cancel | Save updates `SMS_TEMPLATES` in-place |

### Key behaviour

- Merge tag buttons insert at the current cursor position using `selectionStart` / `selectionEnd` on the textarea
- Character counter re-computes on every keystroke
- "New template" mode (passed with `template={null}`) creates a new entry in `SMS_TEMPLATES`

---

### Design decisions

| Decision | Alternative | Why this | Tradeoff |
|---|---|---|---|
| Drawer (right slide-in) not a center modal | Center modal | Right drawer keeps the templates list visible behind it; the user can glance at other templates while editing | On narrow screens the drawer covers the full width — there's nothing to see behind it anyway |
| Cursor-position merge tag insertion | Append to end | The user may be mid-sentence when clicking a variable; inserting at cursor is the correct behaviour | Requires reading `selectionStart` from the textarea ref and re-setting focus after insertion — slightly complex but necessary |

---

### Frontend — what needs to be built

- `selectionStart` / `selectionEnd` textarea ref for merge tag insertion
- Live character counter + `SmsSegments` re-computation on body change
- "New vs Edit" mode: `template.id` determines whether to update existing or push new entry
- Category selector matching `SMS_TEMPLATE_CATS`

### Backend — what needs to be provided

- `POST /sms-templates` / `PUT /sms-templates/:id { name, category, body }` — no design model; SMS is plain text only

---

## Developer Q&A

**Q: `EmailBuilderPage` reads `_emailTplSeed` — a module-level global. What breaks if two users open the builder simultaneously?**
A: In the prototype (single-page, single user) this is fine. In production with multiple users in the same session (or if the user opens two tabs), the global would be clobbered — the second `NewEmailModal` open would overwrite the first user's seed. Fix: pass the seed as route state via URL params (`goTo('email-builder', { seed: {...} })`) and read `nav.seed` in the builder's `useState` init.

**Q: When the user saves from `EmailTemplateEditModal` (quick edit), the `design` block model is not updated. What breaks?**
A: The block builder still shows the old design the next time the template is opened in the builder. The `body` plain-text field and the `design.blocks` field become out of sync. If the email is sent via the sequence (which uses the `design` for rendering), the recipient sees the OLD design, not the text the user edited in the quick modal. Production must either: (a) re-generate the text block in the design from the new body on quick-edit save, or (b) always open the full builder for edits.

**Q: Can a user paste arbitrary HTML via `NewEmailModal`? What's the XSS risk?**
A: Yes — the HTML textarea accepts any markup and places it verbatim in an `html` block, which `EmailBlockView` renders via `dangerouslySetInnerHTML`. This is intentional (the feature explicitly says "paste your own HTML") but carries XSS risk if the rendered preview is shown to other users (e.g. a template shared workspace-wide). Mitigations: (a) sanitize with DOMPurify before render; (b) sandbox the `html` block preview in an `<iframe sandbox>`; (c) restrict HTML block type to admin-only.

**Q: The `EmailComposeModal` fires `onSent` after a 900ms fake delay. In production, what if the actual send fails?**
A: The prototype always succeeds after 900ms. Production must handle: (1) network errors → keep compose window open + show error toast; (2) provider rejection (e.g. invalid email, rate limit) → actionable error with retry; (3) scheduled send enqueued successfully → show "Scheduled for {time}" in the timeline, not "Sent". The `onSent` callback currently receives `{ to, subject, body, scheduled }` — production needs to add `{ messageId, status }` so the timeline can link to the actual send record.

**Q: The SMS segment counter on template cards — how accurate is it vs the sending provider (Twilio)?**
A: It depends on whether `SmsSegments` uses the same encoding logic as Twilio. GSM-7 encoding is 160 chars/segment for pure ASCII; any Unicode character (including curly quotes, em-dashes, emoji) drops to 70 chars/segment. Merge variables like `{{first_name}}` expand at send time — a 12-char variable name could expand to 3 chars ("Ali") or 15 chars ("Aleksandrina"), changing the segment count at runtime. The template-level counter is an estimate; production should re-count at send time with the actual expanded body.

**Q: Templates use `uses` as a counter. How is this incremented?**
A: In the prototype, `uses` is hardcoded in `EMAIL_TEMPLATES` / `SMS_TEMPLATES` seed data and never actually incremented — clicking "Use" or applying a template in Compose doesn't update the count. Production must: (a) `POST /email-templates/:id/use` each time a template is applied to a send or sequence step; (b) update the `uses` counter as a background aggregate (not blocking the send).

**Q: The Email Builder has no undo/redo. What happens if a user accidentally deletes the wrong block?**
A: It's gone with no recovery path. The "Delete" button on a selected block immediately calls `del(id)` which removes it from `blocks[]` state. No history stack exists. For a production email builder, undo/redo is table stakes — implement `useReducer` with an action history array (`blocks[][]`) and Ctrl+Z/Y handlers.