# Module 14 — Funnels

_Funnels list: `FunnelsPage` (line 20032) · Builder: `FunnelBuilderPage` (line 20184)_
_Route: `funnels` · Builder route: `funnel-builder`_

---

## 14.1 Funnels List Page (`FunnelsPage`)

### Surface inventory

| Element | What it is |
|---|---|
| App sidebar | Standard `AppSidebar` with `active="funnels"` |
| Page topbar | "Funnels" title + count subtitle ("3 funnels · 2 live") + New funnel button |
| Stats strip | 4 metric cards: Funnels total · Live · Total views · Total submissions |
| Funnel card grid | 1–3 columns (responsive); one card per funnel |
| Funnel card header | Template icon (colored) · name · status badge (Live / Draft) · step count · ⋯ menu |
| Status badge | `live` = emerald pill + pulsing dot · `draft` = gray pill |
| Metric row | Views · Submits · Conversion % — derived from first/last step stats |
| Share URL row | `go.nrtur.com/{slug}` — click to copy; persistent even in draft |
| Card footer | Preview button → opens builder on Preview tab · Edit/Open button → builder |
| ⋯ menu options | Preview · Edit · Duplicate · Copy link · Delete |
| Delete confirm modal | Separate modal; warns "Contacts it already captured stay in your CRM" |
| Empty state | `FeatureEmpty` with create-funnel CTA |
| New funnel button | Opens `FunnelTemplatePicker` modal |
| `FunnelTemplatePicker` | 6 template cards + funnel name input + Create funnel button |
| `AppFooter` | Note: "Funnels capture leads and wire them natively into your CRM" |

### `FUNNELS_SEED` — 3 seed funnels

| Name | Status | Template | Step 1 Views | Submission |
|---|---|---|---|---|
| 2026 Growth Playbook | live | lead-capture | 4,820 | 1,612 (33%) |
| Free Strategy Call | live | booking | 2,240 | 503 (22%) |
| Scaling Outbound — Live Workshop | draft | webinar | 0 | 0 |

`FUNNELS_SEED` is an IIFE that calls `makeFunnel()` for each and then overwrites step stats.

### Funnel store — `useFunnels()` hook

Funnels use a self-contained `localStorage`-backed store independent of `CrmDataContext`. `_funnelStore` holds the in-memory array and a `Set` of subscriber callbacks. `useFunnels()` subscribes via `useEffect` and forces a re-render when any mutation fires. Methods:

| Method | Effect |
|---|---|
| `funnels` | Current array from store |
| `setFunnels(updater)` | Replace the full array |
| `updateFunnel(id, patch)` | Merge patch into one funnel |
| `addFunnel(f)` | Prepend to array |
| `removeFunnel(id)` | Filter out by ID |

On first access `funnelsLoad()` tries `localStorage.getItem('nrtur-funnels')`; falls back to `FUNNELS_SEED.map(deepClone)` if missing or invalid.

### `FUNNEL_TEMPLATES` — 6 starting points

| Key | Name | Accent | Tag applied | Use case |
|---|---|---|---|---|
| `lead-capture` | Lead capture | `#6366f1` | `funnel-lead` | Lead magnet opt-in → thank-you with download |
| `booking` | Booking | `#0ea5e9` | `call-requested` | Qualify → book a call |
| `vsl` | VSL / Webinar | `#8b5cf6` | `vsl-viewer` | Video sales letter above opt-in |
| `webinar` | Webinar reg | `#ec4899` | `webinar-registrant` | Registration → confirmation |
| `quote` | Quote request | `#10b981` | `quote-requested` | Multi-field request → follow-up page |
| `blank` | Blank | `#6366f1` | `funnel-lead` | Empty opt-in + thank-you |

Each template pre-builds 2 steps with real blocks (headings, text, feature columns, countdown, forms, testimonials, buttons) via `funnelTemplateSteps(key)`.

### `funnelConv(views, submits)` helper

Computes conversion rate: `Math.round((submits/views)*1000)/10` → returns one decimal percentage. Guards division by zero (`if(!views) return 0`). Used on cards, analytics, and step bars.

---

### Design decisions

| Decision | Alternative | Why this | Tradeoff |
|---|---|---|---|
| Self-contained `localStorage` store (not `CrmDataContext`) | Add funnels to the shared CRM context | Funnels are a standalone marketing tool; isolating their store prevents cross-contamination with CRM mutations; the builder can auto-save on every keypress without triggering CRM re-renders | `localStorage` is per-browser, per-device; funnels created on laptop A don't appear on laptop B; team-sharing is impossible without a real backend; data is lost on `localStorage.clear()` |
| Stats at step level (each step has `{ views, submits }`) | Funnel-level aggregate only | Drop-off analysis requires per-step data: "3,000 visitors entered step 1, only 900 reached step 2" is only actionable if you know WHICH step lost them | Step-level stats require a separate tracking event fired at each step navigation — the prototype seeds these as static numbers; real tracking needs a `POST /funnels/:id/steps/:stepId/view` event on every page render |
| Template picker with 6 starting points (not blank-first) | Always start blank | Power-of-default: "Lead capture" pre-builds a complete funnel with feature grid, form, testimonial, and thank-you — a new user goes live faster; blank is available as an option | Template steps reference `FORMS_DATA[0]` (the first form in the system); if the user hasn't created a "Request a Demo"-style form, the embedded form block shows the wrong form by default |
| Conversion % derived from first step views vs last step submits | Conversion from each individual step | Overall funnel conversion (entry → final submit) is the KPI most marketers report to leadership; step-by-step conversion lives in the Analytics tab | Step 1 views vs Step N submits can be misleading if steps 2+ are optional (e.g. an upsell the user can skip) — the "conversion" then understates success |

---

### Frontend — what needs to be built

- `useFunnels()` custom hook with localStorage pub-sub store
- `funnelSlugify(s)` — URL slug normalizer
- `funnelShareUrl(f)` — generates `go.nrtur.com/{slug}`
- `funnelConv(views, submits)` — conversion %
- `FunnelTemplatePicker` modal: 6 template cards + name input + Create button
- Funnel card: icon from template, status badge, 3-metric row, share URL row, Preview/Edit buttons
- Stats strip aggregated from `useFunnels()` (reduce over all funnels' step[0].stats.views + last step stats.submits)
- `duplicate(f)`: deep clone, new IDs on funnel + all steps + all blocks, reset stats, status='draft'
- Delete confirm modal
- Admin gate: `effCanCreateAny()` controls New / Edit / Duplicate / Delete visibility

### Backend — what needs to be provided

- `GET /funnels` → list with steps array (or shallow list + `/funnels/:id` for detail)
- `POST /funnels` / `PUT /funnels/:id` / `DELETE /funnels/:id`
- `POST /funnels/:id/duplicate`
- Step tracking: `POST /funnels/:id/steps/:stepId/view` — fired by the funnel page embed on render
- Slug uniqueness: `GET /funnels/slug-check?slug=growth-playbook` before save
- Custom domain: DNS CNAME verification for `domain` field

---

## 14.2 Funnel Builder (`FunnelBuilderPage`)

_Route: `funnel-builder` · Component lines 20184–20369_

### Surface inventory

| Element | What it is |
|---|---|
| Builder shell | Full-screen dark builder (no AppSidebar) |
| Top header | ← back to Funnels · Funnel name (inline editable) · tabs: Build / Preview / Analytics / Settings · status pill (Draft / Live) · Publish toggle |
| Left panel — step list | Numbered step cards; click to switch active step; Add step (+) button; drag-to-reorder handle |
| Center canvas — Build tab | Funnel page preview at selected step; block overlays with select/edit; block inserters between blocks |
| Block inserter | `+` button between blocks; click opens `FUNNEL_BLOCK_PALETTE` picker (11 block types) |
| Right inspector | Tabs: Block (when a block is selected) / Step (when no block is selected) |
| Block inspector | `FunnelBlockProps` for funnel-only blocks; `EmailBlockProps` for shared blocks |
| Step inspector | `FunnelStepSettings`: name, URL slug, SEO title, step type, page background, A/B toggle |
| Build tab canvas | `FunnelRender` with `live={false}` (form disabled) |
| Preview tab | `FunnelRender` with `live={true}` + step switcher + device toggle (Desktop/Mobile) |
| Preview submit handler | `runFunnelSubmit` → creates/updates a Lead (or Contact), increments step stats, shows toast, advances to next step (simulated) |
| Analytics tab | `FunnelAnalytics`: 3 KPI cards + step-by-step bar chart + A/B results card (if test running) |
| Settings tab | Funnel name · URL slug · UTM source · Tag applied · `FunnelWiringSummary` · share link · custom domain · Publish/Unpublish |

### Block types (`FUNNEL_BLOCK_PALETTE`)

11 blocks, split into funnel-specific and email-shared:

**Funnel-specific (handled by `FunnelBlockView` / `FunnelBlockProps`)**:

| Type | Description |
|---|---|
| `form` | Embeds a CRM form by `formId`; renders full live form with validation + submit; button label overridable per block |
| `video` | YouTube or Vimeo embed via `funnelVideoEmbed(url)` — converts watch URL to embed URL; 16:9 aspect ratio box; shows placeholder when no URL or in build mode |
| `countdown` | Live countdown timer: `minutes` → HH:MM:SS display; resets on each page load; `headline` label + `color` for cell backgrounds |
| `testimonial` | Quote + author + role + star rating (1–5); avatar is a colored initial circle |

**Shared with Email Builder (delegated to `EmailBlockView` / `EmailBlockProps`)**:

| Type | Purpose |
|---|---|
| `heading` | Headline / section heading |
| `text` | Body paragraph |
| `button` | CTA button (single; not form-submit) |
| `image` | Full-width or inset image |
| `columns` | Feature grid (2–3 columns, each with title + text) |
| `divider` | Horizontal rule |
| `spacer` | Vertical whitespace |

### Step types

| Type | Meaning |
|---|---|
| `optin` | Collects lead info (has a form block) |
| `thankyou` | Post-submit confirmation page |
| `upsell` | Upgrade offer after opt-in |
| `order` | Order/checkout step |
| `webinar` | Webinar join/replay page |
| `booking` | Calendar booking embed page |

Step type is metadata only in the prototype — it doesn't change rendering behavior. Production should use it to enforce which block types are valid (e.g. `order` requires a payment block) and to set the correct tracking event type.

### `FunnelRender` — page renderer

`FunnelRender(funnel, step, device, live, onSubmit, submitting)`:
- Sets `meta = { font, accent, width }` — width is 380 (mobile) or 720 (desktop)
- Applies A/B variant: if `step.ab.on`, first `heading` block's `text` is replaced with `ab.variant.headline`; first `form` block's `btn` is replaced with `ab.variant.btn`
- Renders all blocks via `FunnelBlockView`; shows "This step is empty" placeholder when `blocks.length === 0`

### A/B testing at step level (`FunnelStepSettings`)

Each step has an `ab` object. When `ab.on = true`:
- Traffic is split 50/50 between variant A (original) and variant B (overrides)
- Only two elements can be A/B tested: the **first heading** and the **form button label**
- Variant B fields are set in the step inspector: alternate headline + alternate button label
- `FunnelRender` applies variant B overrides by mutating the block in-render (not in state)
- Stats (`ab.stats.A` / `ab.stats.B`) track views and submits per variant
- Winner declared in the `FunnelAnalytics` A/B results card with a `I.Trophy` icon

### `FunnelWiringSummary` — submission chain display

`FunnelWiringSummary(funnel, form, goTo)` reads from the **embedded form's `onSubmit` config** and the funnel's own `tag` field and renders a vertical chain of icons showing exactly what happens on submit:

1. Contact created / updated (always — deduped by email)
2. Attribution captured (UTM source / medium / campaign / click ID)
3. Tag applied (form tag + funnel tag, if any)
4. Deal created (if `onSubmit.createDeal`)
5. Task created (if `onSubmit.createTask`)
6. Automations run (from `formAutoNames(onSubmit)`)
7. Logged to timeline
8. Redirect or thank-you step

If no form block exists yet, shows a prompt to add one. "Edit form" link navigates to `form-builder` for that form.

### `runFunnelSubmit` — submission handler

`runFunnelSubmit({crm, cal, funnel, step, form, vals, utm})` (lines ~19858+):
1. `funnelMapRecord(form, vals)` extracts mapped field values → record property object
2. Creates or updates the captured person. By default a stranger becomes a **Lead** (`status: 'New'`, `source: 'Funnel'`) — a funnel is a top-of-funnel capture channel. If the form's `onSubmit.recordType === 'contact'` it creates a Contact instead. A **three-way email dedupe** decides the target: a known **Contact** is updated in place (never downgraded to a lead), a known non-converted **Lead** is updated, otherwise a new Lead (or Contact) is created.
3. Applies form's `applyTag` + funnel's `tag` to the record
4. Creates deal if `onSubmit.createDeal`
5. Creates task if `onSubmit.createTask`
6. Fires automations in `onSubmit.automations`
7. Logs "Funnel submitted: {funnel.name}" to the record's timeline
8. In preview mode: increments `step.stats.submits` via `updateFunnel`
9. Returns `{personKind, created, tags, dealMade, taskMade, autos}` so the caller can build the toast

The preview submit handler in `FunnelBuilderPage` also increments `step.stats.views`, advances to the next step (or shows the done state on the last step), and shows a toast that reads "Lead created" / "Lead updated" (or "Contact created" / "Contact updated" when the form targets a Contact) based on the returned `personKind`.

### `FunnelAnalytics` component

Shows for each funnel:
- 3 KPI cards: Visitors (step 0 views) · Submissions (last step submits) · Conversion %
- "No traffic yet" notice when entry = 0 (indicating prototype seed data)
- Step-by-step flow: each step → `FunnelMiniBar` for views + submits with drop-off % between steps
- A/B results card (if any step has `ab.on === true` and `ab.stats`): variant A vs B, winner with trophy icon

### Settings tab

| Setting | Description |
|---|---|
| Funnel name | Editable; updates `funnel.name` + re-slugifies |
| URL slug | Editable; `funnelSlugify()` enforced; forms `go.nrtur.com/{slug}` |
| UTM source | Default `'facebook'`; applied to all submissions as `utm_source` in `funnelSimUtm()` |
| Tag applied | Auto-applied to every contact who submits; from `funnel.tag` |
| `FunnelWiringSummary` | Read-only chain showing what happens on submit |
| Share link | `go.nrtur.com/{slug}` with copy button |
| Custom domain | Input for a CNAME-pointed custom domain; `domainVerified` flag |
| Publish / Unpublish | Toggles `status` between `'live'` and `'draft'` |

---

### Design decisions

| Decision | Alternative | Why this | Tradeoff |
|---|---|---|---|
| Form block references a CRM form by `formId` — the form (not the funnel) owns fields, mapping, and on-submit wiring | Funnels have their own field builder embedded | Single source of truth: the "Request a Demo" form's fields are defined once in the Forms module and reused by any funnel; changing the field mapping in Forms updates all funnels that use it automatically | A funnel cannot add a one-off field without creating a whole new form first; if a form is deleted, all funnel `form` blocks referencing it silently break |
| A/B testing limited to headline and button label | Full page A/B (two complete step layouts) | Layout A/B requires rendering two full step trees and random-sampling at serve time; text variant A/B is implementable client-side with a simple `ab.variant` object; ships faster with high value (headline is often the highest-impact variable) | If the user wants to test a completely different CTA section (different image + different form heading + different button), they need to create a second funnel entirely |
| `funnelVideoEmbed(url)` converts YouTube/Vimeo watch URLs to embed URLs at render time | Store the embed URL directly | Users paste what they copy from YouTube's address bar (`youtu.be/xxx`), not an embed URL; the conversion function handles both watch and shortened formats invisibly | Only YouTube and Vimeo are supported; Loom, Wistia, Brightcove, and self-hosted `<video>` URLs are not handled — `funnelVideoEmbed` returns `''` and the block shows a placeholder |
| Countdown timer resets on every page render (counts down from `minutes` on mount) | Server-synced deadline (fixed timestamp) | No backend needed for a client-side timer; keeps the builder self-contained; the timer is "urgency decoration" for most use cases | A visitor who refreshes the page resets the timer to full — a determined buyer sees infinite time; for real scarcity (limited seats, sale ending) the deadline must come from the server |
| `FunnelBuilderPage` has 4 tabs (Build / Preview / Analytics / Settings) all in one component | Separate routes for builder + analytics + settings | One URL (`funnel-builder?id=xxx`) for all builder work; navigating between build and preview doesn't lose unsaved block state; Analytics is read-only and low-cost to colocate | Component is ~185 lines of layout logic + 4 tab bodies; adding a 5th tab (e.g. A/B results, integrations) makes it harder to maintain — split into sub-components per tab in production |
| Stats increment locally in preview submit (`updateFunnel` to `localStorage`) | Stats read-only in builder, only real traffic counts | Lets the builder user simulate the full funnel flow and see stats update live — "submission 1 came in" experience during QA | Preview submissions pollute analytics; a builder who tests the funnel 20 times shows 20 fake submissions; production must tag preview submissions with `source: 'preview'` and exclude them from real analytics |

---

### Frontend — what needs to be built

- `FunnelBuilderPage`: 4-tab shell; step list in left panel; canvas + block inserters in center; right inspector switching between `FunnelBlockProps` and `FunnelStepSettings`
- `funnelNewBlock(type)` — factory for all 11 block types; delegates to `ebNew(type)` for shared types
- `FunnelRender(funnel, step, device, live, onSubmit, submitting)` — page renderer with A/B variant application
- `FunnelBlockView(b, meta, live, onSubmit, submitting)` — dispatches to `FunnelFormBlock`, `FunnelCountdown`, `FunnelBlockView` specialty renderers, or `EmailBlockView`
- `FunnelFormBlock` — live CRM form renderer with validation, required-field check, consent check, submit handler
- `FunnelCountdown` — `setInterval` countdown from `minutes`; clears on unmount
- `FunnelBlockProps` — inspector forms for 4 funnel-specific block types; delegates to `EmailBlockProps` for shared types
- `FunnelStepSettings` — step name/slug/SEO title/type/bg + A/B toggle + variant B fields
- `FunnelAnalytics` — KPI cards + `FunnelMiniBar` bars + A/B results card
- `FunnelWiringSummary` — vertical chain from form's onSubmit config
- `FunnelDeviceToggle` — desktop (720px) / mobile (380px) canvas width toggle
- `funnelVideoEmbed(url)` — YouTube + Vimeo URL converter
- `funnelSlugify(s)` — URL-safe slug (lowercase, alphanumeric + hyphens, max 48 chars)
- `funnelSimUtm(funnel)` — UTM object for attribution in preview submits
- `funnelPrimaryForm(funnel)` — finds the first `form` block in any step and returns the referenced form

### Backend — what needs to be provided

- `GET /funnels/:id` → full funnel object with steps + blocks + stats
- `PUT /funnels/:id` → save full funnel (name, slug, accent, tag, utmSource, domain, steps with blocks)
- `PUT /funnels/:id/status { status: 'live' | 'draft' }` — publish / unpublish
- Page rendering: funnel pages must be rendered server-side at `go.nrtur.com/{slug}/{stepSlug}` — Next.js or a dedicated landing-page renderer; NOT served from the CRM SPA
- Step tracking:
  - `POST /funnels/:id/steps/:stepId/view` — fire on every page render
  - `POST /funnels/:id/steps/:stepId/submit { variant: 'A'|'B', contactId }` — fire on form submit
- A/B traffic splitting: 50/50 must happen server-side (cookie-based) so a returning visitor always sees the same variant — client-side random is not stable across refreshes
- Slug reservation: `go.nrtur.com/{slug}` namespace must be unique across all funnels; slug change requires redirect from old URL
- Custom domain: CNAME → verify DNS ownership; TLS cert provisioning

---

## Developer Q&A

**Q: Funnels use `localStorage`, everything else uses `CrmDataContext`. Why the split, and what breaks when they interact?**
A: Funnels were built as an isolated feature — their store (`_funnelStore`) has no dependency on the main context. This was likely to avoid touching the large CrmDataContext while prototyping. The interaction gap: when `runFunnelSubmit` captures a submission it writes directly to `CrmDataContext` — a new **Lead** into `crm.leads` by default (or a Contact into `crm.contacts` when the form targets one) — but if `CrmDataContext` is not in scope (e.g. if the funnel builder is opened in a tab that didn't bootstrap the context), the write silently fails. Production must unify all objects under a single data layer.

**Q: The `form` block references `formId`. What if the form is deleted from the Forms module?**
A: `qualFormById(b.formId)` falls back to `FORMS_DATA[0]` if no match is found: `const form = qualFormById(b.formId) || FORMS_DATA[0]`. In the prototype this silently swaps in the first form. In production, deleted forms should: (a) show a "Form not found" error block in the builder; (b) block publishing the funnel; (c) notify the funnel owner. The fallback to a random first form is a data integrity bug.

**Q: The countdown timer counts down from `minutes` on mount and resets on refresh. How do you make it real?**
A: Replace `b.minutes` (duration) with `b.endsAt` (absolute ISO timestamp). The component then computes `left = Math.max(0, endsAt - Date.now()) / 1000`. Set `endsAt` when the funnel is published (not when the builder opens). The embed script reads `endsAt` from the page's data attribute and renders the real countdown. `b.minutes` is still useful as a "default duration" picker in the builder, converted to an absolute timestamp on publish.

**Q: A/B testing only varies the headline and button label. What does the analytics actually prove?**
A: It proves which headline + button combination drives more form submits on a 50/50 traffic split. What it can NOT prove: whether a different page layout, image, or offer copy would perform better. More importantly, the prototype has no statistical significance check — the "Winner" badge is declared by whoever has the higher `submits` count, even if the difference is 3 submits vs 2 submits on 10 total views. Production must implement a significance threshold (e.g. minimum 100 views per variant, p < 0.05) before declaring a winner.

**Q: `funnelVideoEmbed` supports YouTube and Vimeo. What about Loom, Wistia, or `<video>` files?**
A: They return `''` and the block shows a placeholder ("Paste a YouTube or Vimeo URL"). Loom, Wistia, and Brightcove all have their own embed URL formats. Self-hosted video would require a `<video src="...">` tag, not an iframe. Production should either: (a) extend `funnelVideoEmbed` with additional provider patterns (Loom: `loom.com/embed/`, Wistia: `fast.wistia.com/embed/`); or (b) add a provider-detection UI that shows the appropriate embed code field per provider.

**Q: Preview submits increment `step.stats.submits` in `localStorage`. How do you separate real traffic from preview submissions in production analytics?**
A: Tag every preview submit with `{ source: 'preview', userId: currentUser.id }` in the submit payload. In analytics queries: `WHERE source != 'preview'` for real stats. The builder's preview tab should show a separate "preview submissions" counter distinct from the real analytics. The prototype doesn't distinguish — every preview submit inflates the numbers the user sees in Analytics tab.

**Q: A funnel's `slug` is editable. What happens to existing share links when the slug changes?**
A: They break. `funnelShareUrl(f)` computes the URL from the current slug. If the user changes the slug from `growth-playbook` to `2026-playbook`, all links pointing to `go.nrtur.com/growth-playbook` (shared on social, in email campaigns, in ad creative) 404. Production must: (a) warn the user "Changing the slug will break existing links — do you want to set up a redirect?" ; (b) store `previousSlugs[]` on the funnel; (c) serve a 301 redirect from each old slug to the current one.
