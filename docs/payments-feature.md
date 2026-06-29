# Payments & Invoicing — Plain-English Guide, Audit & Research

*What the Payments feature is, what works, what's broken or missing, and how it compares to real tools. Written for the team. Grounded in the actual prototype; competitor notes are from current vendor docs (linked).*

---

## What the feature is (in one breath)

**Payments** is where you get paid. It's one screen (`PaymentsPage`) with **five tabs**:

| Tab | What it's for |
|---|---|
| **Overview** | Money dashboard — Collected / Outstanding / Overdue / recurring (MRR), recent invoices, quick actions, Stripe connection status. |
| **Invoices** | Bill a customer: line items → send → get paid. |
| **Products** | Your catalog of things you sell (one-off or recurring plans). |
| **Subscriptions** | Recurring billing (seats × plan, monthly/annual). |
| **Payment links** | A shareable link for a quick one-off charge. |

It's **"Stripe-first" and simulated** — there's no real money movement yet (no backend); the UI is the spec for what the team will build.

---

## What already works well ✅ (keep these)

- **The money numbers are real.** The Overview KPIs (Collected / Outstanding / Overdue / MRR) are computed live from your invoices and subscriptions — they move with the data, they're not fake. *(Nice contrast with the old dashboard.)*
- **Paying an invoice works** (seller side): "Simulate payment" flips it to paid and logs a receipt note.
- **It lives inside the CRM** — invoices link to a contact and a deal, and post to their timeline. This is the right "CRM-native payments" idea (the same thing HubSpot Commerce Hub sells).
- **Dunning is handled as automation, not fake billing magic** — there are real triggers + recipes ("Payment failed → send a new link, wait 3 days, notify owner"). This is the honest, small-team way to do it.
- Clean 5-tab structure, sensible empty states, Stripe-only scope (a good boundary).

---

## What's broken or missing (the audit)

### 🔴 Fix first (high impact)
1. **Anyone can do anything.** Unlike the rest of the app, Payments has **no permission checks and no owner-scoping at all** — every role can see all revenue, mark any invoice paid, and cancel any subscription. *(Verified: zero permission calls in the Payments code.)* → Gate it like Deals, and scope lists to the owner.
   **✅ Fixed (this branch):** Payments now proxies to Deals permissions via `effCanPay(act){return effCanObject('Deals',act)}` (same pattern as `effCanCustom`). The page shows a no-access state for roles without view, the invoice list is owner-scoped with `effScopeRows('Deals', …)`, and all 9 mutations + the "New …" button are gated. Net effect: **Read Only can no longer mark-paid / cancel, and a Sales Rep sees only their own invoices** (Team Lead sees their team's). No new `PERM_OBJECTS` key was added, so the Permissions matrix `/32` count is unchanged.
2. **You can't actually pay end-to-end.** The "payment link" is a **dead URL string** — there's no customer-facing checkout page anywhere. The only way an invoice becomes "paid" is the *seller* clicking a button. → Add a simulated hosted checkout page the link/invoice opens to.
3. **Can't invoice from a contact/deal.** There's **no "Create invoice" button on a contact, company, or deal** — you must leave, go to Payments, and re-type the customer's name. That's the most common real entry point, and it's missing.
   **✅ Fixed (this branch):** a **Create invoice** item now sits in the More menu of every contact, deal, and company (gated by `effCanPay('create')`). It deep-links to **Payments → Invoices** and **auto-opens the invoice drawer pre-filled** — contact name + auto-derived company (and the linked deal, for deals). Wired via `goTo('payments',{tab:'invoices',newInvoice:{…}})`; the drawer gained an optional `prefill` prop, and the auto-open is one-shot so it won't reopen on a later revisit.
4. **The timeline goes stale.** Paying or creating an invoice doesn't refresh an already-open contact/deal timeline until you navigate away and back. *(Verified: a memo is missing `invoices` in its dependency list — a one-line fix.)*
   **✅ Fixed (this branch):** `ctx.invoices` added to the `ActivityTimeline` memo dependency array (~line 7073). Since all 5 detail pages funnel through that one memo, an open contact/deal timeline now refreshes the moment an invoice is paid or created.
5. **Invoices are immutable.** No edit, void, delete, duplicate, resend, or download-PDF — a draft with a typo can only be sent, never fixed. (Products and subscriptions have full menus; invoices, the most important object, have the least.)
   **◑ Partly fixed (this branch):** **Void** (with confirm) now exists for any unpaid invoice — see finding #10. *(Edit / duplicate / download-PDF are still open.)*
6. **Subscriptions never create invoices.** In real Stripe, each billing cycle *is* an invoice — here Subscriptions and Invoices are two unrelated lists, so MRR and invoice revenue can never reconcile.
7. **"Send invoice" sends nothing.** There's no customer email on an invoice and no delivery step — "Send" just flips the status while claiming a link was generated and emailed.

### 🟠 Worth fixing (medium)
8. **"Collected this period" is actually all-time** — the label says "this period" but there's no date window, so an invoice paid 30 days ago counts the same as today's.
   **✅ Fixed (this branch):** "Collected" is now a real **rolling 30-day window** (computed from `paidAgoMin`), relabelled **"Collected · 30 days"** with a "{n} paid · last 30 days" sub; the revenue-by-status chart pill now reads "Collected = last 30 days". Outstanding/Overdue stay as current balances (they're snapshots, not flows).
9. **No tax, discount, or currency** anywhere — the invoice total is a bare sum of qty × price, and "$"/USD is hardcoded. Tax-on-invoice is table-stakes for billing real customers.
   **✅ Mostly fixed (this branch):** the invoice drawer now has **Discount ($)** and **Tax (%)** fields with a live **Subtotal → Discount → Tax → Total** breakdown; the parts (`subtotal`, `discount`, `taxRate`, `tax`) are stored on the invoice and the breakdown also shows in the invoice detail. *(Currency is still USD-only — a multi-currency selector is the remaining piece.)*
10. **Paid = dead-end.** Once paid, there's no refund, no "view/send receipt" — the only button left is Close.
    **✅ Fixed (this branch):** a paid invoice now has **Refund** (full refund, with confirm → "Refunded" status + amber banner; the live "Collected" KPI drops accordingly and a refund entry posts to the linked contact/deal timeline) and **Send receipt**. Unpaid invoices get **Void** (confirm → "Void" status, drops out of outstanding). Both route through the permission-checked `updateInvoice`.
11. **Payment-link "Paid" status is broken** — nothing in the UI can set it, and the menu's "Disable" can overwrite it into a stuck state. (Links are reusable; "paid" doesn't belong as a status.)
12. **Pay-at-booking charges nothing.** A paid event seat ("Pay $149 & confirm") runs a fake delay and confirms — it never creates a payment or shows up in revenue.
13. **"Connect Stripe" is decorative** — invoices can be marked paid whether Stripe is "connected" or not, and the account number is hardcoded.
14. **Free-typed "Bill to"** lets you type a name that isn't a real contact, which silently drops the company and the timeline link (while the toast still claims it logged to the timeline).

### 🟡 Minor (low)
- Seat price is stored as a *string* while every other amount is a number (latent math bug).
- Changing a subscription's status doesn't update its "next bill" date (an active sub can show a past date).
- "New subscription" dead-ends if you have no recurring products (no path to go make one).
- Past-due subscriptions are dropped from MRR (undercounts; conflicts with the dunning story — past-due isn't churned yet).

---

## How real tools do it (research)

The market splits into **payment processors** (Stripe) and **CRM/accounting tools that wrap them** (HubSpot, QuickBooks, Xero, GoHighLevel). What they all ship that nrtur doesn't:

| Capability | What the pros do | nrtur today | Worth adding? |
|---|---|---|---|
| **Hosted checkout / "Pay now" page** | Stripe gives every invoice a hosted page with a Pay button (Apple/Google Pay, 40+ methods) + PDF. | Dead link string | **Yes — highest-credibility add** (a simulated pay page). |
| **Tax** | Stripe Tax auto-adds sales tax/VAT at finalize; everyone has at least a manual tax line. | None | **Yes — a simple manual "Tax %" line.** Table-stakes. |
| **Quotes / estimates → invoice** | HubSpot, Xero, QuickBooks, GoHighLevel: build a quote, customer accepts, one-click convert to invoice. | None | **Yes — most strategic add for a deal CRM** (reuse the invoice drawer). |
| **Edit / void / refund / receipt** | Full invoice state machine + credit notes + refunds from the dashboard. | Mark-paid / send only | **Yes — at least Void + Refund + receipt.** |
| **Discounts / coupons** | Per-line or invoice-level discounts everywhere. | None | Yes — a simple invoice discount line. |
| **Reminders / dunning** | Stripe Smart Retries (≈8 tries / 2 weeks); QuickBooks/Xero send up to 3–5 scheduled reminders. | Automation *recipes* (no real schedule) | Make it **visible** — a reminder/retry timeline on overdue items. |
| **Subscriptions** | Auto-generate invoices each cycle, proration on seat changes, trials, pause/resume. | Manual status flips, no invoices | Add **seat-change proration note** + a **trial badge**; don't build a real scheduler. |
| **Send by SMS (Text2Pay)** | GoHighLevel texts a secure pay link. | "Send" is abstract | Nice, cheap (you already have SMS in automations). |
| **Products & Prices** | One product → many prices (monthly + annual, currencies, tiers). | One price per product | Let a product hold **monthly + annual**; skip tiers/metered (enterprise bloat). |

**Deliberately skip (overkill for a small-team prototype):** tiered/usage/metered pricing, a real tax engine with nexus tracking, card-on-file/autopay (implies storing payment methods), multi-gateway (PayPal/Authorize.net), a full customer portal, reusable coupon catalogs.

*Sources: Stripe Invoicing / Payment Links / Billing / Tax docs, HubSpot Commerce Hub, QuickBooks & Xero invoicing help, GoHighLevel payments docs (linked in the audit data).*

---

## Suggested order of work

**Quick, high-value:** ① ✅ gate Payments by permission + owner scope · ② ✅ fix the stale-timeline memo · ③ ✅ "Create invoice" button on contact/deal · ④ ✅ honest "Collected" 30-day window — *all done (this branch)*.

**Medium:** ⑤ simulated hosted checkout page (unlocks real end-to-end pay) · ⑥ ◑ invoice **Void / Refund + receipt** *(done — this branch; Edit / duplicate / PDF still open)* · ⑦ ✅ tax + discount lines *(done — this branch; currency still USD-only)* · ⑧ make pay-at-booking create a paid invoice.

**Strategic:** ⑨ Quote/Estimate → convert to invoice · ⑩ subscriptions generate invoices.

---

## Bottom line

| | Score (0–10) |
|---|---|
| Payments **today** | **~6.5** — real live numbers + CRM-native + good dunning framing, but ungated, no real checkout, and missing tax/edit/refund/quotes |
| Payments **after the "fix first" + tax + checkout** | **~9** — a believable, complete small-team billing spec |

**Verdict: a strong, mostly-honest foundation with a few real gaps.** The biggest wins are **gating it** (security/consistency), a **simulated checkout page** (so payment is real end-to-end), and a **tax line** + **quote-to-invoice** (table-stakes the team will expect).

---

*Companion docs: `docs/appearance-settings.md`, `docs/customization-research.md`, `docs/custom-objects-research.md`, `docs/crm-system.md`. Code: `PaymentsPage` ~index.html:19167; data in `CrmDataContext` (`payInvoices`/`payProducts`/`paySubs`/`payLinks`).*
