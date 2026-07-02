# Module 20 — Payments & Invoicing

_Component: `PaymentsPage` (line 19525) · Route: `payments` · Public checkout: `PayCheckoutPage` (line 19401), route `pay-checkout`_

**Framing, straight from the code** (comment, line 19037): *"Payments & Invoicing (Stripe-first · simulated). Card handling is Stripe-hosted — card details never touch our servers. Processing here is simulated; the data model mirrors a real Stripe-backed invoices / links / subscriptions setup."*

**Inventory correction:** the prototype has **6 tabs, not 5** — a full **Quotes** tab sits between Invoices and Products, sharing almost all of its plumbing with Invoices. The sub-feature list below (20.1–20.7) reflects the actual 6 tabs plus the Stripe connection and pay-at-booking integration points.

---

## 20.1 Payments Page Shell

### Surface inventory

| Element | What it is |
|---|---|
| Sidebar entry | `NAV_CATALOG`: `{id:'payments', label:'Payments', icon:'CreditCard'}`, grouped under a "Revenue" section alongside `'billing'` (nrtur's own SaaS subscription page — a different, unrelated screen; easy to confuse the two by name) |
| Tab strip | `PAY_TABS`: Overview / Invoices / Quotes / Products / Payment links / Subscriptions — `SegTabs` horizontal scroll strip, deep-linkable via `goTo('payments',{tab:'invoices'})` |
| Header title | "Payments" / "Invoices, payment links, and subscriptions — powered by Stripe." |
| Primary header button | Label changes per tab: "New invoice" / "New quote" / "New product" / "New link" / "New subscription" — hidden unless `effCanPay('create')` |
| Footer | "Secured by Stripe · card details never touch our servers" |
| Locked-page state | Full-page block when `!effCanPay('view')`: lock icon, "Payments is restricted", "Your role doesn't have access to invoicing and payments." (+ role-preview note if impersonating) |

### Stripe gating — the page itself is NOT locked

Stripe is connected **by default** in the prototype (`conns.stripe = true`). Invoices, quotes, products, links, and subscriptions can all be created and viewed with zero Stripe connection — only the actual money-movement step (the pay button on the public `PayCheckoutPage`) is disabled without it. The Overview tab's `PayStripeStatus` widget states this directly: *"Invoices and links still work — money moves once Stripe is connected."*

### Permission model

Payments has no dedicated permission object — it proxies to Deals (comment, line 19522: *"mirrors effCanCustom → Contacts"*):

```js
function effCanPay(act){return effCanObject('Deals',act);}
```

- **Page-level**: `!effCanPay('view')` → locked page (above).
- **Per-action**: every mutation (create/edit/delete invoice, product, link, sub, quote) independently calls `effCanPay('create'|'edit'|'delete')` and shows a toast ("Your role can't create invoices.") on denial — buttons stay visible and clickable; the gate lives in the handler, not the render.
- **Row-level scope**: `effScopeRows('Deals', invoices, v=>v.owner)` and the same for quotes — filters to Own/Team/All based on the effective role. **Products, links, and subscriptions are NOT scope-filtered** — every user sees the full catalog/link/subscription list regardless of role scope.
- **No export permission**: `effCanExport()` exists globally but is never referenced anywhere in this module — there is no CSV export button on any Payments list.

---

### Design decisions

| Decision | Alternative | Why this | Tradeoff |
|---|---|---|---|
| Payments proxies to the Deals permission object instead of having its own | A first-class `Payments` permission object in the Permission Matrix | Invoices already carry a deal-style `owner` code; reusing Deals' view/create/edit/delete + Own/Team/All scope avoids building a parallel permission system | Admins can't grant "view invoices" without also implicitly reasoning about Deals permissions — the relationship isn't visible anywhere in the Permission Matrix UI itself, so an admin auditing roles has to already know this proxy exists |
| The whole page stays usable without Stripe connected; only the actual charge is blocked | Lock the entire Payments page until Stripe is connected | Lets a business build out invoices, products, and quotes ahead of finishing Stripe onboarding — reduces setup friction | A rep can spend real time drafting/sending invoices before discovering the customer literally cannot pay yet (the pay button on `PayCheckoutPage` is the only hard stop) — this is only surfaced via a banner, easy to miss |
| Products, links, and subscriptions have no Own/Team/All scoping (only invoices/quotes do) | Apply the same owner-based scoping everywhere for consistency | These three are typically workspace-shared catalogs (a product or a subscription plan isn't "owned" by one rep the way a deal is) | Inconsistent mental model — a Sales Rep restricted to "Own" deals can still see and edit every subscription and payment link in the workspace, which may not match the access-control intent |

---

### Frontend — what needs to be built

- `PaymentsPage`: tab state (deep-link aware via `nav.tab`), `effCanPay` gate checks on every mutation, primary-button label switch per tab
- Locked-page render branch for `!effCanPay('view')`
- `PayStripeNotice`/`PayStripeStatus` reusable banners (used across almost every tab and modal)

### Backend — what needs to be provided

- `GET /payments/summary` — permission check server-side (`effCanPay` is currently client-only and trivially bypassable)
- Server-side enforcement of Own/Team/All scoping for invoices/quotes — currently a client-side filter over a fully-loaded dataset
- A real Stripe Connect (or direct) OAuth flow — see 20.8

---

## 20.2 Overview Tab

### Surface inventory

| Element | What it is |
|---|---|
| `PayStripeStatus` | Connected: emerald card, "Stripe connected", fake account meta (`acct_1QkR2bLx · USD · payouts daily`), "Manage" → Settings/Integrations. Disconnected: amber card, "Connect Stripe to collect payments" CTA → Settings/Integrations |
| `PayRevenueWidget` | 4 KPI cards + a 3-bar "Invoice revenue by status" meter — **hand-built, not a reuse of the Reports/Dashboard widget engine** |
| Recent invoices | Latest 4 invoices: name, invoice number + due date, amount, status pill; "View all" jumps to the Invoices tab |
| Quick-action cards | "Send an invoice" / "Create a payment link" / "Add a product" — each jumps to the relevant tab and opens its create modal |

### KPI definitions

| KPI | Formula | Meaning |
|---|---|---|
| Collected · 30 days | Sum of `paid` invoices with `paidAgoMin ≤ 30×1440` | A **flow** — money received in the last 30 days, not a running total |
| Outstanding | Sum of `sent` invoices | A **balance** — currently awaiting payment |
| Overdue | Sum of `overdue` invoices | A **balance** — past due |
| Recurring / mo (MRR) | `Σ active subs: interval==='year' ? amount/12 : amount` | Normalized monthly recurring revenue |

---

### Design decisions

| Decision | Alternative | Why this | Tradeoff |
|---|---|---|---|
| Bespoke hand-built revenue widget instead of reusing the Reports/Dashboard widget engine (`DashChartViz`, `WIDGET_DEFS`) | Register Payments KPIs as Dashboard/Reports widgets, reusing that engine (as documented in Module 19) | The Payments-specific "Collected is a flow, Outstanding/Overdue are balances" distinction didn't map cleanly onto the generic count/sum/avg aggregation model | Third parallel chart implementation in the codebase (Dashboard/Reports engine, this bespoke widget, plus the Reports module's own bespoke sub-widgets) — a revenue metric shown on both Dashboard and Payments could silently drift out of sync since they're computed by entirely separate code paths |
| "Collected" is a 30-day rolling flow rather than a lifetime total | Show all-time collected revenue | Matches how a business actually monitors cash flow — "how much came in recently" is more actionable than a lifetime counter that only grows | No way to see lifetime revenue anywhere on this page; a business owner wanting an all-time total has to sum the Invoices list manually |

---

### Frontend — what needs to be built

- `PayRevenueWidget({invoices, subs})`: KPI computation + bar-meter rendering
- `PayStripeStatus`: connected/disconnected branches reading `IntegrationsContext.conns.stripe`

### Backend — what needs to be provided

- `GET /payments/kpis?window=30d` — server-computed Collected/Outstanding/Overdue/MRR (avoids shipping the full invoice/subscription dataset to the client just to sum it)

---

## 20.3 Invoices Tab

### Data shape (`payInvoice`)

| Field | Type | Notes |
|---|---|---|
| `id`, `number` | string | `number` sequential via `payNextInvoiceNo()`, e.g. `INV-1041` |
| `contact` | string | **Free-text name — not a foreign key.** Matched against `crm.contacts` by name only |
| `company`, `email` | string | Derived from the matched contact, or blank |
| `dealId` | number\|null | Optional FK to a deal |
| `subId` | string | Present only on subscription-renewal invoices |
| `items` | array | `[{desc, qty, price}]` |
| `subtotal`, `discount` (flat $), `taxRate` (%), `tax`, `amount` | number | `amount` = post discount/tax total |
| `status` | string | `draft \| sent \| paid \| overdue \| void \| refunded` — **6 statuses** |
| `currency` | string | Per-invoice, not workspace-wide: USD/EUR/GBP/CAD/AUD |
| `link` | string\|null | Checkout URL, `null` while draft |
| `issued`, `due`, `paidDate`, `refundedDate` | string | Formatted date labels |
| `agoMin`, `paidAgoMin`, `refundedAgoMin` | number | Minutes-ago timestamps driving the activity feed and the 30-day KPI window |
| `source` | string | `'Subscription'` or `'Booking'` on system-generated invoices; absent on manual ones — **write-only metadata, no UI currently filters or displays it** |
| `fromQuote` | string | Set when an invoice was converted from a quote |

### List view & flows

| Flow | Behavior |
|---|---|
| List | Flat, unfiltered — no search or status filter control on the Invoices list itself |
| Create/edit (`PayInvoiceDrawer`) | Bill-to (autocomplete, free text allowed with an amber "not a saved contact" warning), optional deal link, line items (from Products catalog or custom), due-date presets (`Due on receipt`/`Net 7`/`Net 14`/`Net 30`), currency, discount ($) + tax (%), notes, live totals |
| Send | One click — `sendInv` just flips `status→'sent'` and generates a link if missing. **No compose/preview-email step exists** |
| Pay (merchant-side) | "Simulate payment" button on `sent`/`overdue` invoices — flips to `paid` directly, bypassing any checkout |
| Pay (customer-side) | The invoice's `link` opens `PayCheckoutPage` — the only place a card form is actually rendered |
| Void / Refund | Confirm-dialog gated; refund appends `refundedDate`/`refundedAgoMin` and a second activity-feed entry |
| Download | `downloadPdf` builds an HTML string client-side and downloads it as `{number}.html` — **this is not a real PDF**, despite the "Download invoice" label and document icon |

### Activity timeline integration

`actInvoiceOwn(v)` converts an invoice into 1–3 timeline entries (invoice created/sent, payment received, refund issued) wired into `buildActivityFeed` at exactly two injection points: **Contact** timeline (matched by `contact===rec.name` or `company===rec.co`) and **Deal** timeline (matched by `dealId===rec.id`). **Company and Lead timelines do not show invoices at all** — confirmed no `ctx.invoices` reference in those branches.

---

### Design decisions

| Decision | Alternative | Why this | Tradeoff |
|---|---|---|---|
| "Bill to" is a free-text name field, not a required contact FK | Force selection from existing contacts only | Lets a business invoice someone who isn't in the CRM yet (a one-off customer) without creating a throwaway contact record first | Silent data-quality risk — a typo'd name creates an invoice that never appears on any contact's timeline and is invisible to `actInvoiceOwn`'s matching; the warning is shown but not blocking |
| "Send invoice" is a one-click status flip with no compose step | Open an email preview/compose modal (matching `EmailComposeModal`'s pattern elsewhere in the app) | Keeps the invoice flow fast — most businesses just want the invoice out the door with the default template | No way to customize the email subject/body per-send, no CC, no way to confirm the recipient email is correct before it "sends" (which, being simulated, means nothing is actually emailed at all yet) |
| PDF download is actually an HTML file wrapped in a Blob | Integrate a real PDF library (e.g. server-side Puppeteer/wkhtmltopdf, or client-side jsPDF) | Zero dependencies, works entirely client-side in a static prototype | Ships an `.html` file to a user expecting a `.pdf` — will look broken/unprofessional the moment a real customer receives it; needs real PDF generation before launch |
| Company and Lead detail pages don't show invoices in their activity timeline | Add the same `ctx.invoices` matching used for Contact/Deal | Simplicity — invoices are conceptually tied to a person (contact) and a deal, less obviously to a company or a lead | A company with 5 contacts and 10 invoices across them shows zero invoice history on the Company page itself — a natural "how much has this account paid us" question has no answer without visiting each contact individually |

---

### Frontend — what needs to be built

- `PayInvoiceDrawer`: bill-to autocomplete + not-a-contact warning, line-item editor (from-products dropdown + custom line), due-date presets, currency/discount/tax, live totals
- `PayInvoiceDetail`: status-conditional action buttons, linked contact/deal deep-links, payment-link row (open/copy)
- `actInvoiceOwn` + its two `buildActivityFeed` injection points
- Real PDF generation (replace the HTML-blob `downloadPdf`)
- Real send-email step if a compose/preview UI is desired

### Backend — what needs to be provided

- `POST /invoices`, `PATCH /invoices/:id` (status transitions: send/void/refund/mark-paid)
- Contact matching should happen server-side against a real contact ID once "Bill to" becomes a proper lookup, not a name string
- Real PDF rendering service (e.g. headless Chrome or a PDF template engine) behind the "Download invoice" action
- Real email delivery for "Send invoice" (reuse Module 12's email-sending infrastructure)
- Stripe webhook consumption (`invoice.paid`, `charge.refunded`, etc.) to replace the "Simulate payment" merchant-side shortcut with real payment confirmation

---

## 20.4 Quotes Tab

### Data shape (`payQuote`) & status

Mirrors invoices almost exactly, with `kind:'quote'`, `validUntil` instead of `paidDate`, ids prefixed `qot_`, numbers `QUO-####`. Status set (`PAY_QUOTE_ST`) is **its own 6 values, different from invoices**: `draft | sent | accepted | declined | expired | converted`.

### Flows

- **Create/edit** reuses `PayInvoiceDrawer` with a `kind="quote"` prop — same line-item/discount/tax UI, different field labels and status set.
- **Detail** is a separate component, `PayQuoteDetail` (not a variant of `PayInvoiceDetail`) — actions: Send / Mark accepted / Convert to invoice / Decline.
- **Convert to invoice** (`convertQuote`): creates a new invoice carrying `fromQuote: quote.id`; the quote's own status becomes `'converted'` with an `invoiceId` back-reference.

---

### Design decisions

| Decision | Alternative | Why this | Tradeoff |
|---|---|---|---|
| Quotes share the invoice drawer (`kind` prop) but get a fully separate detail component | Build Quotes as a fully independent feature end-to-end | Line items/discount/tax editing is identical between the two — reusing the drawer avoids duplicating that whole form | The detail view duplication (`PayQuoteDetail` vs `PayInvoiceDetail`) means quote-specific actions (accept/decline/convert) were hand-written separately rather than sharing a single status-action-button system — a bug fixed in one detail component won't automatically apply to the other |
| Converting a quote creates a brand-new invoice rather than mutating the quote in place | Change the quote's own `kind` to `'invoice'` on conversion | Keeps quotes and invoices as genuinely separate, auditable records — you can see the original quote AND the invoice it became | Two records for one sale (quote + invoice) with a cross-reference (`fromQuote`/`invoiceId`) that has to be kept consistent by hand in every code path that touches either one |

---

### Frontend — what needs to be built

- `PayQuoteDetail`: status-conditional actions (Send/Accept/Convert/Decline)
- `convertQuote`: build invoice from quote fields, cross-link both records

### Backend — what needs to be provided

- `POST /quotes`, `PATCH /quotes/:id`, `POST /quotes/:id/convert` (server creates the invoice + sets both cross-references atomically — client-side this is two separate state updates with no transaction guarantee)

---

## 20.5 Products Tab

### Data shape (`payProduct`)

| Field | Type | Notes |
|---|---|---|
| `id`, `name`, `desc` | string | |
| `price` | number | |
| `billing` | string | `'one-time'` \| `'recurring'` |
| `interval` | string | `'month'` \| `'year'` — only when recurring |
| `active` | boolean | `false` = archived, hidden from pickers but not deleted |

**No image field exists** — products are text-only (name, price, description). No product photo/thumbnail anywhere in this tab.

### Flows

- List: name+desc, price (with `/mo`/`/yr` suffix if recurring), billing badge, active/archived, overflow menu (Edit/Archive-Restore/Delete)
- Create/edit (`PayProductModal`): name, price, billing type, interval (if recurring), description. Footnote "Synced to your Stripe product catalog" is **cosmetic only — no real Stripe API call**
- Delete confirms with: *"This removes the product from your catalog. Existing invoices keep their line items."*
- Flows into: Invoices (line-item picker), Subscriptions (recurring products only, as the "Plan" dropdown). **Does NOT flow into Payment Links** — see 20.6

---

### Design decisions

| Decision | Alternative | Why this | Tradeoff |
|---|---|---|---|
| Deleting a product doesn't touch existing invoice line items | Cascade-delete or null out references on existing invoices | Historical invoices must remain accurate regardless of later catalog changes — an invoice is a snapshot, not a live reference | Confirmed further down (Subscriptions): this snapshot approach isn't applied consistently — subscriptions store the product name as a plain string with no reconciliation if the source product is renamed, which is a subtler version of the same problem without the same intentional design behind it |

---

### Frontend — what needs to be built

- `PayProductModal`: name/price/billing/interval/description form
- Archive vs delete distinction in the overflow menu

### Backend — what needs to be provided

- `POST/PATCH/DELETE /products` — real Stripe Product/Price API calls if genuinely syncing to Stripe's catalog (currently just a UI footnote with no backing call)

---

## 20.6 Payment Links Tab

### Data shape (`payLink`)

| Field | Type | Notes |
|---|---|---|
| `id`, `title`, `desc` | string | |
| `amount` | number | **Flat amount — no line items, no product reference** |
| `url` | string | `https://nrtur.app/pay/{token}` |
| `status` | string | `active` \| `disabled` |
| `clicks`, `paidCount` | number | Simple counters |

### Flows

- **Create (`PayLinkModal`) is custom-amount only** — Title + Amount ($) + optional description. There is **no mode to generate a link from an existing product** — confirmed: the modal has no product picker at all.
- **Share mechanism is copy-link only.** No QR code generation and no embed/iframe code snippet exist anywhere in the file for payment links.
- Disable/reactivate toggles `status`; a disabled link shows a "Link disabled" closed state on the public checkout page.

---

### Design decisions

| Decision | Alternative | Why this | Tradeoff |
|---|---|---|---|
| Payment links support only a custom flat amount, never a product reference | Let a link point at a catalog product (so price updates automatically propagate) | Simpler data model — a link is self-contained, no dependency on the products list | A business with a $149 "Workshop seat" product has to manually recreate a matching $149 link and keep both in sync by hand if the price ever changes; this is a real, disconnected duplication between two tabs of the same feature |
| No QR code or embed snippet, only a copy-able URL | Generate a QR code image and/or an `<iframe>`/button embed snippet (standard for Stripe Payment Links, GHL, etc.) | Smaller surface to build for the prototype | This is a meaningful competitive gap — payment links are frequently used in print materials or embedded on external landing pages/funnels (which this product already has — Module 14), and neither is supported today |

---

### Frontend — what needs to be built

- `PayLinkModal`: title/amount/description form
- QR code generation (e.g. a client-side QR library) if that gap is prioritized
- Embed-snippet generator (button or iframe HTML) for use inside the Funnel builder (Module 14) or external sites

### Backend — what needs to be provided

- `POST /payment-links`, `PATCH /payment-links/:id/status`
- Click/paid-count tracking should move server-side (currently just numbers on a client object with no actual click-tracking instrumentation found)

---

## 20.7 Subscriptions Tab

### Data shape (`paySub`)

| Field | Type | Notes |
|---|---|---|
| `id`, `customer` (company/account name), `contact` (person name) | string | |
| `plan` | string | **Denormalized** — copied from the product's `name` at creation time, no FK |
| `amount` | number | `price × seats` |
| `interval` | string | `'month'` \| `'year'` |
| `status` | string | `active` \| `'past-due'` \| `cancelled` — **only 3 states; there is no `trialing` status** |
| `nextBill` | string | Date label, or `'—'` when cancelled |
| `seats` | number | |

### Flows

- Create (`PaySubModal`): customer name (free text), Plan (dropdown of recurring products only, shown as "{name} — {price}/{yr|mo}"), Seats. **On save, immediately issues a paid invoice** for the first period via `paySubInvoice()` — comment in code: *"A subscription billing cycle IS an invoice (mirrors Stripe)."*
- "Bill this period" manually generates another renewal invoice and advances `nextBill` — this is the **manual stand-in for a real Stripe billing-cycle webhook**; nothing fires on its own over time.
- Cancel is a **direct one-click action, no confirm dialog** — unlike invoice void/refund, which do confirm.
- No pause state — only active/past-due/cancelled.

---

### Design decisions

| Decision | Alternative | Why this | Tradeoff |
|---|---|---|---|
| `plan` stored as a denormalized string copied from the product name | Store a `productId` FK and resolve the current name/price at render time | Avoids the subscription breaking if the product is deleted entirely | If the source product is later **renamed**, every existing subscription silently keeps showing the old name — there's no reconciliation step; a business owner renaming "Pro plan — monthly" to "Standard plan" won't see that reflected on any existing subscription row |
| No `trialing` status | Add a trial period with an auto-transition to active/cancelled at trial end | Keeps the state machine simple for the prototype | Free-trial subscription businesses (extremely common alongside recurring billing) have no way to model this at all today — a real gap if trials are part of the roadmap |
| Cancel has no confirmation dialog (unlike invoice void/refund, which do) | Match the confirm-dialog pattern used elsewhere in this same module | Unclear — likely an inconsistency rather than a deliberate choice, since Refund (also destructive/high-stakes) does confirm | A misclick cancels a customer's recurring revenue with zero confirmation step — worth fixing for consistency alone, separate from any UX debate about whether cancel *should* confirm |
| "Bill this period" is a manual button, not a scheduled job | Automatically generate renewal invoices when `nextBill` passes (a cron-style job) | No backend exists in the prototype to run scheduled jobs | In production this MUST become automatic — a real subscription business cannot rely on someone remembering to click "Bill this period" for every customer every month |

---

### Frontend — what needs to be built

- `PaySubModal`: customer/plan/seats form with live total preview
- Status-conditional overflow menu (Bill this period / Mark active / Mark past-due / Cancel)
- A confirm dialog on Cancel, for consistency with Void/Refund

### Backend — what needs to be provided

- `POST /subscriptions` — should store a real `productId` FK, resolving `plan` name/price at read time, not write time
- A scheduled billing job (the real replacement for "Bill this period") that generates renewal invoices automatically when `nextBill` passes, and flips `status` to `past-due` on a failed charge
- Stripe webhook consumption for `customer.subscription.updated/deleted`, `invoice.payment_failed`, etc.
- Trial-period support if needed: `trialEnd` field + a job that transitions `trialing → active` automatically

---

## 20.8 Stripe Connection

No bespoke connect modal exists for Stripe (unlike `AdSourceConnectModal` or `MailboxConnectModal`) — it goes through the shared, generic `GenericConnectModal` used by every OAuth-method integration:

| Step | What happens |
|---|---|
| 1. Authorize | "{Stripe} uses secure OAuth..." + a checklist of `scopes` from `INTG_DEFS`: *"Create & read payments, invoices & subscriptions" / "Generate shareable payment links" / "Receive webhook events"*. Single "Authorize with Stripe" button in Stripe's brand purple (`#635bff`) |
| 2. Success | Emerald checkmark, "Stripe connected!", "Done" → sets `conns.stripe = true` |

**No real OAuth redirect, no webhook listener, no sync job** — "Receive webhook events" is a scope bullet only, never backed by an actual endpoint or event log anywhere in the settings UI.

---

### Design decisions

| Decision | Alternative | Why this | Tradeoff |
|---|---|---|---|
| Stripe reuses the generic OAuth connect modal instead of a bespoke flow | Build a Stripe-specific connect modal (as was done for ad sources and mailboxes) | Stripe's OAuth shape (authorize → success) is genuinely generic — no extra account/asset-picker steps like Meta/Google ads need | Real Stripe Connect onboarding involves meaningfully more (business details, payout bank account, identity verification) — the generic 2-step modal undersells how much actual setup a real integration would require, which could surprise a developer estimating this work |

---

### Frontend — what needs to be built

- No new UI — `GenericConnectModal` already handles this if `INTG_DEFS.stripe` stays generic

### Backend — what needs to be provided

- Real Stripe Connect OAuth (`https://connect.stripe.com/oauth/authorize`), token exchange, and encrypted storage of the connected account ID
- A webhook endpoint (`POST /webhooks/stripe`) handling at minimum: `checkout.session.completed`, `invoice.paid`, `invoice.payment_failed`, `customer.subscription.updated/deleted`, `charge.refunded` — these should drive the invoice/subscription status transitions that are currently manual buttons

---

## 20.9 Pay-at-Booking Integration

The Scheduling module's event-type editor (Module 17) has a **"Collect payment to hold a seat"** toggle — but only when the booking type is `class` (group/class bookings; see `calType==='class'` gate). If enabled, a "Price per seat" field appears. The toggle reads live Stripe status and shows a green note if connected, or an amber warning + a link to Settings/Integrations if not — **but the toggle can be turned on regardless of connection state**; it's just inert until Stripe is connected.

**What actually happens at booking**: when a booker confirms a class booking with `collectPayment: true`, the code immediately creates a `payInvoice` **already marked `status: 'paid'`** — there is no card form rendered in the booking flow itself. This is fundamentally different from the public `PayCheckoutPage`, which does render a real (simulated) card form. The invoice is tagged `source: 'Booking'`, `notes: 'Paid at booking'`, and `dealId: null` (no link to any deal created from the same booking, even though a deal-creation step runs right alongside it).

---

### Design decisions

| Decision | Alternative | Why this | Tradeoff |
|---|---|---|---|
| Booking-flow payment is assumed/instant (auto-marked `paid`), unlike the public checkout page's real card form | Redirect the booker to `PayCheckoutPage` (or an embedded card form) as part of the booking confirmation step, requiring actual payment before the seat is held | Keeps the booking flow's confirm-button UX simple and fast in the prototype | This is the single biggest inconsistency in the whole Payments module — a "pay to hold a seat" feature that never actually requires payment undermines the entire point of the toggle; in production this MUST route through a real charge before the booking is confirmed, or the seat should be provisionally held pending payment rather than confirmed outright |
| Booking-created invoices never link to the deal created in the same booking flow (`dealId: null`) | Cross-reference the newly created deal's id on the invoice | The deal-creation and invoice-creation code blocks were written independently and don't share context | A rep looking at the deal from a paid class booking sees no invoice in its activity timeline (recall: invoice-timeline injection requires `dealId` to match) — the payment appears to have happened "nowhere" from the deal's perspective |

---

### Frontend — what needs to be built

- If fixing the instant-paid gap: route the booking confirm step through an actual card-entry form (reuse `PayCheckoutPage`'s card UI) before finalizing the booking
- Cross-link the booking's created deal id onto the generated invoice

### Backend — what needs to be provided

- A real charge attempt at booking time (Stripe PaymentIntent), with the booking only confirmed on success — replacing the current "assume success" write

---

## Cross-cutting: Payments in the Automation Catalog

`TRIGGER_CATS` includes a "Payments" category with 6 triggers (Payment received, Payment failed, Subscription past-due, Subscription cancelled, Invoice sent, Invoice overdue), and `AUTO_TEMPLATES` ships 3 prebuilt recipes (Payment received → Onboarding, Payment failed → Dunning, Subscription past-due recovery). **These are catalog entries for the automation builder's picker UI only** — confirmed no code path in the Payments module actually fires these triggers when an invoice or subscription's status changes. A user can build an automation around "Payment received," but nothing in the app currently enrolls anyone into it automatically. `Payment failed` in particular has no corresponding action anywhere in the Payments UI — there's no way to even simulate a failed charge to test such an automation.

---

## Developer Q&A

**Q: The "Bill to" field on an invoice is free text, not linked to a real contact. What happens if I typo a name?**
A: The invoice still saves — you get an amber warning ("Not a saved contact — this invoice won't link to a contact record") but nothing blocks you. The practical consequence: that invoice never appears in `actInvoiceOwn`'s contact-timeline injection (which matches by exact name or company), so it becomes invisible from the CRM side even though it exists in the Invoices list. Production should either require selecting an existing contact or auto-create one on a fresh name, with a confirm step either way.

**Q: "Download invoice" produces an `.html` file, not a PDF. Is that good enough to ship?**
A: No — this needs to be flagged as unfinished, not a design choice. `downloadPdf` builds an HTML string client-side and downloads it with a `.html` extension despite the UI calling it "Download invoice" with a document icon. A real implementation needs either a client-side PDF library (jsPDF, etc.) or a server-side rendering service (headless Chrome/Puppeteer) producing an actual `application/pdf`.

**Q: Payment links only support a custom flat amount — can they be generated from a product in the catalog instead?**
A: No — confirmed, `PayLinkModal` has no product picker at all, only Title + Amount + Description. If a product's price changes, any link built to match it has to be updated by hand; the two are entirely disconnected. Worth deciding whether to add a "from product" mode to the link creator, which would also make it possible to auto-update links when a price changes.

**Q: There's no QR code or embeddable snippet for payment links — is that a gap or intentionally out of scope?**
A: Confirmed absent — grep for `qrcode`/`QRCode`/embed anywhere in the module returns nothing. Given payment links are commonly shared in print material or embedded on external landing pages (and this product already has a Funnel builder, Module 14, which is exactly where an embed snippet would be used), this is a real competitive gap worth prioritizing rather than treating as done.

**Q: Subscriptions store the plan name as a copied string, not a link to the product. What happens if I rename that product later?**
A: Nothing updates — every existing subscription keeps showing the old name forever, silently. This is a real reconciliation gap. Production should store a `productId` and resolve the display name/price at read time (falling back to a snapshot only if the product is later deleted, which is the one case where denormalization is actually the right call).

**Q: The booking flow's "collect payment to hold a seat" toggle — does a booker actually have to enter a card to reserve a class seat?**
A: No — this is the most significant inconsistency in the module. The booking confirmation immediately writes an invoice marked `paid`, with no card form anywhere in that flow. Compare this to `PayCheckoutPage` (the link/invoice checkout), which does render a real simulated card form. Before this ships, the booking flow needs to actually route through a charge attempt (or provisionally hold the seat pending a completed payment) rather than assuming success.

**Q: The automation catalog lists "Payment received," "Payment failed," etc. as triggers. Do these actually fire when I mark an invoice paid?**
A: No — confirmed no code path connects an invoice/subscription status change to the automation engine. These exist purely as selectable options in the automation builder's trigger picker; a user can wire an automation to "Payment received" today, but nothing in the Payments module currently enrolls anyone into it. This needs an actual event-emission layer (e.g. invoice status transitions publish an event the automation engine subscribes to) before these triggers do anything.

**Q: Is there a way to export invoices or transactions to CSV, the way other list views in the app support export?**
A: No — confirmed `effCanExport()` (used elsewhere, e.g. Reports) is never referenced anywhere in the Payments module. There's no export button on Invoices, Quotes, or any other Payments list. Bookkeeping/accounting handoff (QuickBooks sync, CSV export for an accountant) is a common expectation for this feature area and isn't covered yet.
