# Module 15 — Ad Leads

_Ad leads page: `SettingsAdLeadsPage` (line 17380) · Connect modal: `AdSourceConnectModal` (line 17254) · Spend table: `AdSpendTable` (line 17329) · Live status: `adLeadLiveStatus` (line 10108) · Attribution card: `AdAttributionCard` (line 10134)_
_Route: `settings-ad-leads` · Also reachable via Engage Hub "Ad leads" tab_

> **2026-07-07 rebuild.** The page was restructured into a numbered funnel with a live stat strip, honest routing, live intake status, closed-loop ROAS reporting, and shared attribution cards. See **§15.5** below and [`docs/audit/changes/ad-leads-redesign.md`](../audit/changes/ad-leads-redesign.md). Sections 15.1–15.4 remain the base reference; 15.5 documents the rebuild deltas — where they conflict, 15.5 wins.

---

## 15.1 Ad Lead Sources Page (`SettingsAdLeadsPage`)

### Surface inventory

| Element | What it is |
|---|---|
| `SettingsShell` wrapper | Standard settings chrome with `active="settings-ad-leads"` |
| Info banner | "Connect Meta & Google once for the whole workspace…" — prototype disclaimer included |
| Source cards (2) | One card per platform: Meta Lead Ads · Google Ads Lead Forms |
| Disconnected card | Platform logo · network label · one-line description · Connect button |
| Connected card | Platform logo · Connected badge · account name · asset chips · lead forms count · Disconnect link |
| Lead form mapping section | Shown only when ≥1 source is connected; per-source groups of `AdFormCard` |
| `AdFormCard` | Per-form field mapping + routing (pipeline / stage / tag) |
| Add lead form button | Dashed-border button per connected source; `addForm(sourceKey)` with auto-mapped defaults |
| Speed-to-lead recipe panel | Amber highlight card; "Use recipe" button → automation builder with `recipe:'speed-to-lead'` |
| Incoming ad leads table | Up to 12 most-recent leads; platform icon + name + email + campaign label + status badge + relative time; row click → `lead-detail` (or `contact-detail` if the row deduped into a known contact) |
| Simulate new lead button | Calls `ingestAdLead({})` to generate a fake lead from `AD_SIM_POOL`; only enabled when ≥1 source connected |
| Lead sources report | `DashAdLeadSources` widget; toggle: By source / By campaign |

### Supported ad platforms — `AD_SOURCE_DEFS`

| Platform | Key | Network | Click ID | Asset noun |
|---|---|---|---|---|
| Meta Lead Ads | `meta-ads` | Facebook & Instagram | `fbclid` | Page |
| Google Ads Lead Forms | `google-ads` | Search & YouTube | `gclid` | Campaign |

LinkedIn Lead Gen is listed in `INTG_DEFS` (Integrations page) but is **not** in `AD_SOURCE_DEFS` — it has no form mapping UI, no `adSourceByKey()` entry, and no `ingestAdLead` path. It is a future placeholder only.

### `AdsContext` — shared ad state

`AdsContext` is a React context providing:

| Property / Method | Description |
|---|---|
| `sources` | `AD_SOURCE_DEFS` array |
| `adState` | `{ [sourceKey]: { connected, accounts, assets } }` — connection state per platform |
| `forms` | Current array of `AdLeadForm` objects (starts from `AD_LEAD_FORMS_SEED`) |
| `leads` | Current array of `AdLead` objects (starts from `AD_LEADS_SEED`) |
| `isConnected(key)` | Returns `!!adState[key]?.connected` |
| `connectSource(key, payload)` | Sets `adState[key] = { connected: true, ...payload }` |
| `disconnectSource(key)` | Removes `adState[key]` |
| `setForms(updater)` | Replaces the forms array |
| `ingestAdLead(opts)` | Creates a new **Lead** (status `New`) with full attribution, or updates a known contact if the email already exists; adds an AdLead entry (see 15.3) |

`AdsContext` wraps the app at the root level — it is separate from `CrmDataContext` and does not re-render the entire CRM on mutations.

### Ad lead form object shape

```
{
  id: string,           // 'lf_meta_1'
  sourceKey: string,    // 'meta-ads' | 'google-ads'
  name: string,         // 'Spring Promo — Demo Request'
  campaign: string,     // campaign this form belongs to
  asset: string,        // page or campaign name
  pipeline: string,     // destination pipeline name
  stage: string,        // destination stage ('New')
  tag: string,          // auto-applied tag ('meta-lead')
  owner: string,        // 'Round-robin' | team member name
  map: [{               // field mapping array
    ad: string,         // ad platform field ('full_name', 'email', …)
    crm: string,        // CRM field key ('name', 'email', 'co', '__ignore')
  }]
}
```

### Ad lead object shape

```
{
  id: string,           // 'al1'
  ts: number,           // relative hours ago
  sourceKey: string,
  formId: string,
  campaign: string,
  adset: string,        // ad set / targeting ("Lookalike 1% — US")
  name, email, phone, company, loc: string,
  status: 'new' | 'working' | 'qualified' | 'converted' | 'lost',
  contactId: number | null,  // set when the row deduped into an existing contact
  leadId: number | null,     // set when the row created a new Lead
  utm: { source, medium, campaign, term?, content? },
  clickId: 'fbclid' | 'gclid',
  clickVal: string,
}
```

### `AD_LEAD_FORMS_SEED` — 3 pre-configured forms

| Name | Source | Pipeline | Stage | Tag |
|---|---|---|---|---|
| Spring Promo — Demo Request | Meta | Sales Pipeline | New | meta-lead |
| Real Estate — Buyer Intake | Meta | Sales Pipeline | New | real-estate-lead |
| Search — Free Consultation | Google | Sales Pipeline | New | google-lead |

---

### Design decisions

| Decision | Alternative | Why this | Tradeoff |
|---|---|---|---|
| Routing is per-form (pipeline / stage / tag per `AdLeadForm`) — not per platform | One routing rule per platform | Different ad campaigns have different intent: a "Spring Promo" Meta form should go to Sales Pipeline–New; a "Retargeting" campaign might go to a Qualified stage; per-form routing lets the user reflect this | More config surface: a user with 10 ad forms must set up routing 10 times; if they want to change "all Meta leads go to stage X" they must update every Meta form individually |
| Deduplication by email in `ingestAdLead` | Always create a new lead | A prospect already in the CRM as a contact should be updated in place (attribution + tags merged) rather than spawning a duplicate; only genuinely new people become a fresh Lead | Deduplication by email only: if the same person submits with two different email addresses (work vs personal), they create two records; phone-based deduplication is not implemented |
| Attribution stored as flat fields on the record (`adPlatform`, `adCampaign`, `utmSource`, etc.) | Separate attribution table linked to the record | Simplest in a single-object model; all attribution is visible on the lead/contact card without a join | A record can only hold the attribution from the MOST RECENT ad lead — if a known contact submits two different ad forms, the second `ingestAdLead` overwrites the first attribution; production needs a separate `attributions` table |
| `speedy = true` hardcoded (Speed-to-lead always fires) | User-configurable Speed-to-lead toggle | Shows the full "Speed-to-lead fired ⚡" flow in every simulation; demonstrates the key value prop (instant SMS + sequence enrol) | A new user who hasn't set up the Speed-to-lead automation will see ⚡ badges on all leads, implying the automation ran when it actually didn't; `speedy` should read from whether the automation is actually active |
| "Simulate new lead" button for demo purposes | Real-only data | Lets the user/developer experience the full ingest flow without real ad accounts; draws from `AD_SIM_POOL` of fake people and skips already-used emails | Prototype state is easy to pollute; clicking Simulate 50 times creates 50 fake leads in the CRM; production should delete or gate this button behind an explicit "demo mode" flag |
| LinkedIn in INTG_DEFS but absent from AD_SOURCE_DEFS | LinkedIn fully implemented or fully absent | Shows LinkedIn as a future integration without building form mapping UI; sets user expectation that it's coming | User who clicks "Connect LinkedIn" in Integrations gets a generic OAuth modal, not the full 4-step form-mapping flow; they then go to Ad Leads and find no LinkedIn section — confusing |

---

### Frontend — what needs to be built

- `AdsContext.Provider` at app root with `adState`, `forms`, `leads`, and all methods
- Source connection cards: platform logo + color + connected/disconnected states
- `AdFormCard` (see 15.2): editable form name, campaign, field mapping rows, pipeline/stage/tag selects
- `addForm(sourceKey)`: creates a new form with auto-default field mapping (full_name→name, email→email, phone→phone, company→co, job_title→title, city/postal→loc, others→__ignore)
- Incoming ad leads table: status badge with `ST_C` color map; `actRel(ts)` relative time; click → `lead-detail` (or `contact-detail` when the row deduped into a known contact)
- `DashAdLeadSources` report widget: grouped bar chart by source or campaign with conversion %
- Speed-to-lead panel: amber highlight, "Use recipe" button → `goTo('automation-builder', { recipe: 'speed-to-lead' })`
- Admin gate: `effCanCreateAny()` controls connect/disconnect/add-form visibility

### Backend — what needs to be provided

- `GET /ad-lead-sources` → list of `{ key, connected, accounts, assets }` per workspace
- `POST /ad-lead-sources/:key/connect { accountId, assetIds }` → trigger OAuth and return connected state
- `DELETE /ad-lead-sources/:key` → disconnect
- `GET /ad-lead-forms?sourceKey=` → list of `AdLeadForm` objects
- `POST /ad-lead-forms` / `PUT /ad-lead-forms/:id` / `DELETE /ad-lead-forms/:id`
- Webhook receiver: `POST /webhooks/meta-ads` / `POST /webhooks/google-ads` — platform pushes lead events here; server calls `ingestAdLead` equivalent
- `GET /ad-leads?page=&limit=&sourceKey=&status=` → paginated ad leads list
- `GET /ad-leads/report?groupBy=source|campaign` → aggregated counts + conversion rates for the report widget

---

## 15.2 Ad Source Connect Modal (`AdSourceConnectModal`)

_Component line 14913 — right-panel slide-in drawer, 480px wide_

### Surface inventory

| Element | What it is |
|---|---|
| Drawer header | Platform initial avatar (colored) · "Connect {platform name}" · "Step N of 4 · {network}" · ✕ close |
| Progress bar | 4-segment bar; segments fill in platform color as steps advance |
| Simulation banner | Amber notice: "Simulated connection — no real {platform} API call is made" |
| Step 1 — OAuth info | OAuth explanation text + permission scope checklist + "Authorize with {platform}" button |
| Step 2 — Account picker | Radio group: one option per `src.accounts` (account name + account ID in monospace) |
| Step 3 — Asset picker | Checkbox group: one per `src.assets` (Pages for Meta, Campaigns for Google); count label |
| Step 4 — Success | Centered success circle + "Connected!" message + account name + asset count |
| Footer | Cancel (all steps) · Back (steps 2–3) · Next / Connect (steps 2–3) · Done (step 4) |

### 4-step flow

1. **Authorize** — explains OAuth scopes; user clicks "Authorize with {platform}" → `setStep(2)` (simulated; no redirect)
2. **Select account** — radio picks from `src.accounts`; single-select
3. **Select pages/campaigns** — checkbox picks from `src.assets`; must pick ≥1 to enable Next; "Connect" button on this step
4. **Success** — `finish()` fires on mount via `ref={()=>finish()}`; calls `onConnected({ accounts: [acctName], assets: pickedAssets.map(a=>a.name) })`

`onConnected` in the parent calls `ads.connectSource(key, payload)` which sets `adState[key] = { connected: true, ...payload }`.

### Step 3 bug — `finish()` fires immediately

`finish()` is called via `ref={()=>{finish();}}` on the success icon div — this fires on every render of step 4, not just once. In the prototype this is harmless (calling `onConnected` multiple times is idempotent). Production must call `finish()` inside a `useEffect([],()=>finish())` once on mount, not via a render callback.

---

### Design decisions

| Decision | Alternative | Why this | Tradeoff |
|---|---|---|---|
| 4-step wizard (OAuth → account → assets → success) | Single-screen connect with all options at once | Mirrors the real OAuth + account-selection UX of Meta and Google's actual connection flows; familiar to anyone who has connected a social account before | 4 steps adds friction; a user connecting for the first time with only one account and one page could do it in one click — wizard is over-engineered for the common case |
| Simulated OAuth (no redirect, no real API) | Real OAuth redirect | Prototype constraint — can't embed a real OAuth flow in a static HTML file; amber disclaimer makes the simulation explicit | Users evaluating the prototype will not experience the real account-linking friction (browser security prompts, ad account access approval, app review) |
| Asset selection at connect time (step 3) | Asset selection per lead form | Allows the user to declare upfront which Pages/Campaigns feed into the CRM; forms are then scoped to those assets | If the user connects 2 of their 5 Pages and later wants to add a 3rd, they must disconnect and reconnect the entire integration — there's no "add more pages" flow |

---

### Frontend — what needs to be built

- 4-step state machine: `useState(1)` → footer buttons `setStep(s=>s+1)` / `setStep(s=>s-1)`
- Step progress bar: `steps.map(s => s <= step ? platform.color : white/8)`
- Step 2: `acct` state initialized from `src.accounts[0].id`; radio renders `src.accounts`
- Step 3: `assets` state initialized to all `src.assets.map(a=>a.id)`; checkbox toggles; Next disabled when `pickedAssets.length === 0`
- Step 4: `useEffect(()=>finish(), [])` — do NOT use ref callback
- `onConnected(payload)` prop receives `{ accounts: string[], assets: string[] }` and updates parent state

### Backend — what needs to be provided

- Real OAuth: redirect to Meta/Google OAuth with `client_id`, `redirect_uri`, `scope`, `state` (CSRF token)
- OAuth callback: exchange `code` for access token; store token encrypted per workspace
- Account enumeration: `GET /integrations/meta-ads/accounts` using stored access token → return `{ id, name }[]`
- Asset enumeration: `GET /integrations/meta-ads/pages?accountId=` → return `{ id, name }[]`
- Webhook registration: after account + assets selected, register Meta/Google webhook subscriptions for those assets
- Token refresh: ad platform tokens expire; background job must refresh before expiry

---

## 15.3 `ingestAdLead()` — Core Ingestion Function

_Lines 21172–21196 — inside the `AdsContext.Provider` body_

### What it does — step by step

1. Resolves `sourceKey` (from opts or first connected source)
2. Resolves `form` — the matching `AdLeadForm` (by `opts.formId`, or first form for that source, or a fallback default)
3. Picks a `person` from `AD_SIM_POOL` (filters out already-used emails to avoid duplicates in simulation)
4. Builds `attr` — the full attribution object: UTM params, click ID, campaign, adset, form name, platform identifiers
5. Builds `tags` array: `[form.tag, 'ad-lead', adSlug(campaign)]`
6. **Deduplication**: checks existing contacts for matching email
   - Found → update the **contact** in place (attribution fields + merged tags)
   - Not found → create a new **Lead** (status `New`) with all fields including attribution — capture channels land as leads, not contacts
7. Appends new `AdLead` entry to `adLeads` state (carrying `contactId` or `leadId`, whichever was touched)
8. Shows toast: "New Meta lead · Spring Promo: Brandon Tucker · Speed-to-lead fired ⚡" (adds "(updated existing)" when it deduped)

### Attribution properties written to the record (new Lead, or updated contact)

| Property | Example value |
|---|---|
| `source` | `'Meta Ads'` |
| `adPlatform` | `'meta'` |
| `adSourceKey` | `'meta-ads'` |
| `adSourceLabel` | `'Meta Lead Ad — Spring Promo 2026'` |
| `adCampaign` | `'Spring Promo 2026'` |
| `adAdset` | `'Lookalike 1% — US'` |
| `adFormName` | `'Spring Promo — Demo Request'` |
| `utmSource` | `'fb'` |
| `utmMedium` | `'paid_social'` |
| `utmCampaign` | `'spring-promo-2026'` |
| `fbclid` | `'IwAR2_...'` |
| `adSms` | `true` (Speed-to-lead SMS flag) |
| `adEnrolled` | `true` (Speed-to-lead sequence flag) |

### Lead attribution card on contact detail

When a contact has `c.adPlatform`, the contact detail page renders an attribution card showing: platform icon + `adSourceLabel` + `adCampaign` + UTM params. This is the only place in the UI with a dedicated attribution *card* — it appears on a **contact** (i.e. a capture that deduped into a known contact). New ad captures land as **Leads** instead, and their attribution surfaces as an "AD LEAD" entry in the record's activity timeline (`buildActivityFeed` reads `adPlatform` for both leads and contacts) rather than in this card.

---

### Design decisions

| Decision | Alternative | Why this | Tradeoff |
|---|---|---|---|
| `AD_SIM_POOL` avoids re-using emails | Allow any random fake person | Prevents the "Simulate new lead" button from creating a second entry for the same email, which would trigger the dedup path and update instead of create — hiding the create flow from the demo | `AD_SIM_POOL` is a fixed list; after clicking Simulate enough times, the pool is exhausted and `ingestAdLead` falls back to a random person from the full pool (ignoring used-email guard), potentially creating duplicates |
| `speedy = true` always sets `adSms` and `adEnrolled` | Only set when Speed-to-lead automation is confirmed active | Every simulated lead shows the full "Speed-to-lead fired" UX to demonstrate the value prop | In production, `speedy` should check whether the Speed-to-lead automation exists and is `status === 'active'` for this workspace; hardcoding to `true` makes the prototype misleading for non-demo use |

---

### Frontend — what needs to be built

- `ingestAdLead(opts)` inside `AdsContext.Provider` with access to `contacts`, `setContacts`, `leads`, `setLeads`, `adLeads`, `setAdLeads` (dedupe → update contact; else → create Lead)
- `adFakeClickId(platform)` — generates fake fbclid/gclid for simulation
- `adSlug(str)` — URL-safe version of campaign name (same as `funnelSlugify`)
- `adInitials(name)` — 2-letter avatar initials
- `adPick(name)` — deterministic color picker from name string
- `AD_SIM_POOL` — array of fake people `{ name, email, phone, company, loc }`
- Lead attribution card on contact detail: read `c.adPlatform` to show/hide; render UTM table (new captures land as Leads, whose attribution shows in the activity timeline instead)

### Backend — what needs to be provided

- `POST /contacts` (upsert by email): `{ ...contactFields, attribution: { source, platform, campaign, utm, clickId, clickVal } }`
- `POST /ad-leads` → create AdLead record linked to `contactId`
- `POST /contacts/:id/tags` → bulk-add tags without removing existing
- Speed-to-lead trigger: after `POST /ad-leads`, publish `ad_lead.created` event; Speed-to-lead automation subscribes; sends SMS + creates task + enrolls in sequence asynchronously (not blocking the ingest response)
- Attribution storage: `contact_attributions` table with `{ contactId, sourceKey, campaign, utm, clickId, createdAt }` — one row per submission, not overwriting

---

## Developer Q&A

**Q: LinkedIn is listed in INTG_DEFS but not in AD_SOURCE_DEFS. What does a user experience if they connect it?**
A: The Integrations page shows a LinkedIn Lead Gen card with a generic OAuth modal (from the standard `IntegrationConnectModal`). After connecting, `adState['linkedin-leads']` is set. But `AD_SOURCE_DEFS` doesn't include LinkedIn, so `SettingsAdLeadsPage` never renders a LinkedIn card or form mapping section. The user is left with a "connected" integration that does nothing visible. Production must: (a) add LinkedIn to `AD_SOURCE_DEFS` with its field schema; (b) implement the webhook receiver for LinkedIn Lead Gen Form responses; (c) handle LinkedIn's different OAuth scope model (they require "r_liteprofile" + "r_emailaddress" + "rw_leadgen").

**Q: `ingestAdLead` dedupes by email. What if the user submits with different capitalisation (`User@example.com` vs `user@example.com`)?**
A: Both `c.email.toLowerCase()` and `person.email.toLowerCase()` are used in the comparison — capitalisation differences are handled. The dedup-to-update branch matches against **contacts only** (`contacts.find(...)`); a match updates that contact in place, a miss creates a new **Lead**. Existing leads' emails are folded into the simulation's used-email guard so "Simulate new lead" won't re-pick them, but a real re-submit by someone who is currently only a Lead still mints a second Lead (there is no lead-to-lead merge). What's also NOT handled: alias emails (`user+meta@example.com` matching `user@example.com`), corporate vs personal email same person, or phone-number deduplication. The only dedup signal is the lowercase email string.

**Q: Attribution is stored as flat fields on the contact. What happens when the same contact submits two different ad forms?**
A: The second `ingestAdLead` call hits the dedup branch and calls `setContacts(a => a.map(c => c.id === existing.id ? { ...c, ...attr, ... } : c))` — the spread overwrites all attribution fields. The contact loses its first attribution completely. Production needs: (a) a separate `contact_attributions[]` array (multi-touch attribution); (b) a "first touch" policy that preserves the original source; (c) a "last touch" policy for the most recent source; (d) a UI on the contact detail that shows the full attribution history, not just the latest.

**Q: The `finish()` callback fires via `ref={()=>{finish();}}` on step 4's success icon. Why is this a problem?**
A: A ref callback runs every time the element is mounted OR re-mounted (e.g. if the parent causes a re-render on step 4). Each call invokes `onConnected()` again, which calls `ads.connectSource()` multiple times. In the prototype this is idempotent (same payload overwrites same state key). In production if `onConnected` triggers an API call (`POST /integrations/connect`), it would fire multiple requests. Fix: `useEffect(() => { finish(); }, [])` inside step 4's render branch, which fires exactly once.

**Q: The "Simulate new lead" button is enabled for anyone when a source is connected. Is there an admin gate?**
A: No. `anyConnected` is the only guard. Any user (even read-only roles) can click "Simulate new lead" and create a fake lead in the CRM. Production must: (a) gate behind `effCanCreateAny()` or an explicit `canSimulate` admin flag; (b) tag simulated leads with `{ isSimulated: true }` so they can be filtered out of real reports; (c) ideally remove the button entirely from production (replace with a read-only "Test via API" developer tool).

---

## 15.5 Rebuild deltas (2026-07-07)

Full record: [`docs/audit/changes/ad-leads-redesign.md`](../audit/changes/ad-leads-redesign.md).

### Page = a numbered funnel + live stat strip
`SettingsAdLeadsPage` was restructured from a flat stack into: a "How it works" banner → a live 4-tile **stat strip** (captured / new this week / converted % / top source) → **1 Connect → 2 Route each form → 3 Watch leads arrive → 4 Measure & optimize**. The intake feed gained source filter chips with counts, a Show-all cap at 8, chevrons on linked rows, and inert (non-clickable) unlinked rows.

### Intake status is DERIVED, not stored (`adLeadLiveStatus`, line 10108)
A feed row's status now derives from its **linked CRM record** (id-first): lead lifecycle → new/working/qualified/converted/lost; linked contact → Customer=converted, Lost=lost. `converted` is tested **before** `deleted` (a converted lead may be soft-deleted post-conversion and is still a customer). The stored `al.status` is only a fallback. The feed chips, stat strip, and Lead-sources report all read this — so they track reality instead of the capture-time snapshot.

### Routing is honest (supersedes 15.1's "pipeline / stage / tag")
`AdFormCard` no longer has a dead **Pipeline** select (ad leads become Leads, not deals). The former "Stage" is now **Lead status** (and is actually applied on ingest — was hardcoded `'New'`), and an **Owner** select was added (Round-robin honours assignment rules). Options aligned to the canonical `LEAD_STATUSES`/team.

### Attribution card is shared (`AdAttributionCard`, line 10134)
The "Lead attribution" card (campaign / ad set / lead form / click-ID / UTM chips) now renders on **contact, lead AND deal** detail — was inline contact-only. Attribution also travels through the lead→contact→deal **convert** flow (`buildConvertRecords`, `_adAttr`/`_adHist`): the new contact and deal inherit it; a reused contact backfills only if it has none (first-touch preserved). This partly answers the 15.4 Q&A "second submit overwrites attribution" — convert is a migration that backfills, while a live re-ingest still last-touch-overwrites.

### Spend / CPL / ROAS (`AdSpendTable`, line 17329)
Step 4 opens with a **Campaign performance** table: Spend (30d) · Leads · CPL · Customers · CPA · Won revenue · ROAS + totals, grouped by source or campaign. Spend is a simulated seed (`AD_SPEND_SEED`, labelled as simulated); leads/customers come from live feed rows; **revenue joins REAL won deals** carrying ad attribution (`dealClosedKind(d)==='won' && d.adSourceKey` — terminal by outcome/stage-name, so custom pipelines count). Three converted ad contacts (Dana/Tariq/Sandra) were given real won deals so ROAS is bottom-up.

### Known correctness notes (R10)
The Simulate button remains ungated (15.4 Q&A still stands — an accepted prototype affordance). Reopening a campaign's only won deal can briefly diverge the Customers vs revenue columns (Low, logged).

**Q: The Speed-to-lead recipe panel says "Responding in the first 5 minutes can lift conversion roughly 8×". Is this figure accurate?**
A: The "8×" figure is marketing copy — it circulates in sales literature but the actual multiplier varies widely by industry, lead source, and whether the lead was actively searching (Google) vs passive (Meta scroll). The most-cited source is a 2007 study by MIT and InsideSales.com; the methodology is debated. For the product, the point is sound (faster response = higher conversion), but the specific "8×" should be replaced with a more defensible claim or cited to a current source. This is a copywriting decision for the product owner, not an engineering concern.
