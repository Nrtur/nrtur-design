# Customization Screens — Research in Plain English

*A short, jargon-free summary of what we found and what to do. For the team.*

---

## What this is about

nrtur has **six customization screens**: Branding, White-label, Theme & display, Record layouts, List views, and Custom fields. We asked one question:

> **Is six separate customization screens the right shape for a small-team CRM — and which of them actually earn their place?**

We checked how six other CRMs handle this (using their real, current help docs — not memory), then took a position for nrtur.

---

## First, what do these screens try to do? (in one breath)

- **Custom fields** — invent your own fields (e.g. "T-shirt size") on contacts, companies, leads, deals.
- **Record layouts** — choose which fields show on a record's page, and in what order.
- **List views** — choose which columns show in a list, the sort, and saved views.
- **Branding** — your logo and colors on the pages *your customers* see (booking pages, emails).
- **White-label** — rebrand the *whole platform* for agencies who resell it to their own clients.
- **Theme & display** — light/dark mode, density, date formats for the app itself.

---

## What we learned from other CRMs

Two clear camps, split by company size:

**Small-team CRMs put this stuff where you actually use it — not in a settings menu.**
- **Pipedrive** — you change list columns from a gear icon *on the list*, and edit a record's fields from a "···" menu *on the record*. No separate "Record layouts" or "List views" settings screen exists. It's all in-context.
- **Attio** — same idea: you configure a record's page from a "⋮ → Configure page" button *on the record*, and pick columns *on the table*. Admin-only, but in-context.
- **Less Annoying CRM** — refuses almost all of it on purpose. Custom fields, and that's about it. Four tabs, total. Simplicity is the product.

**Only the big enterprise CRMs split it into separate admin screens.**
- **HubSpot** — has one admin "customize record layout" area per object, locked behind a "Super Admin / customize layout" permission.
- **Salesforce** — the heaviest: a separate **Page Layouts** screen, **List Views** screen, and **Fields** screen, *per object*. This is exactly the three-screen split nrtur copied — and Salesforce is the most complex admin tool in the market, the opposite of "small team."

**On branding:** "white-label" is a real, separate thing — but it's a **premium agency feature**, not a baseline. GoHighLevel charges **$497/month** for it (your own login domain, your own mobile app, clients billed under your name, the vendor invisible). Plain "branding" (your logo on customer-facing pages) is the baseline everyone has.

**On theming:** essentially **no major CRM lets you recolor the app itself.** HubSpot, Pipedrive, Attio, and Salesforce all ship a fixed-brand interface. Light/dark mode and density are as far as it goes.

---

## What's wrong with nrtur's version right now

1. **Two of the three field screens don't actually do anything.** Record layouts and List views are fully clickable — you can drag fields, toggle columns, hit Save, and get a "Saved!" message — but the real record pages and lists are built from hardcoded lists in the code and never read what these screens set. So the user configures, sees success, and *nothing changes anywhere.* That's worse than an honest "coming soon" — it looks finished.
2. **We built the Salesforce layout for a Less-Annoying audience.** Three separate screens (Custom fields / Record layouts / List views) is the heaviest customization design in the market — and small-team CRMs deliberately avoid it, putting these controls right where you work instead.
3. **Branding is collected twice.** White-label asks for your logo and colors again, even though Branding already has them.
4. **Theme lets you go off-brand.** It offers a free color picker for the app's accent and sidebar — something no peer CRM does, and something that fights nrtur's own "locked brand palette" rule.

In one line: **the most complex customization design in the market, with two of the screens not wired up, on the simplest kind of product.**

---

## The recommendation: consolidate, wire, and move things in-context

### 1. Field / Record layouts / List views — **High priority**
Follow Pipedrive and Attio, not Salesforce:
- Keep **one** source-of-truth **Custom fields** screen (every competitor has exactly this) — and **wire it so it actually drives the real pages and lists.**
- Move **column choices onto the list** (a gear menu) — nrtur already built this exact control on every list, so reuse it. Shrink the List views *settings* screen down to just "the default view everyone starts with," or remove it.
- Move **record layout onto the record** (a "···→ Configure page" button, like Pipedrive/Attio) — or, as the cheap version, just wire the existing screen so it really changes the record page.

*Why:* it's where small teams expect to find it, it kills two dead screens, and it turns three half-built things into one that works. Most of the UI already exists — the work is connecting it, not building new screens.

### 2. Branding + White-label — **Medium priority**
Keep both — the split is legit (white-label is a real premium/agency feature). But make **White-label reuse the Branding logo and colors** instead of asking again. Keep it admin-only and "coming soon" where the infrastructure isn't ready (already done correctly).

### 3. Theme & display — **Low–Medium priority**
Keep the parts that match the market and already work: **light/dark, density, date/time formats.** Drop (or tightly limit) the free accent/sidebar color picker — peers don't offer it, and it breaks the locked palette.

---

## Bottom line

| | Score (0–10) |
|---|---|
| The six screens **as they are today** | **~5** — two don't work, one duplicates another, one goes off-brand |
| **After consolidating + wiring** (the plan above) | **~8.5** — fewer screens, all of them real, aligned with how small-team CRMs work |

**Verdict: Consolidate toward the in-context model.** The single most valuable move is the one the audit also flagged — **wire the field settings to the real pages and lists.** That one change turns three half-built screens into one working system.

---

*Companion docs: `docs/crm-system.md` (data-model audit + corrected model), `docs/custom-objects-research.md` (the custom-objects keep-but-bound study). Full code lives in `index.html`; the six screens sit roughly between lines 12070 and 14150.*
