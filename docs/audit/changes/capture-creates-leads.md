# Capture Channels Create Leads (re-audit R4)
_Priority: High · Status: fixed & render-verified · 2026-07-01_

Inbound strangers captured from ads, forms, and funnels now enter as **Leads** (status "New"), so they flow through the lead lifecycle Wave 2 built — instead of being dropped straight in as Contacts.

## How it was (the problem)
- **Ad platforms** (`ingestAdLead`) created a **Contact** for every captured ad lead.
- **Forms & funnels** (`runFunnelSubmit`, the single live capture executor) created a **Contact**, and **ignored the form's own `recordType` toggle** (which already modelled "lead vs contact") — even a form explicitly set to "create a lead" made a Contact. The default was `recordType: 'contact'`.
- Only **booking** correctly created Leads (fixed in Wave 2).
- Net effect: the lead funnel/conversion dashboards only ever saw manually-added leads; real inbound bypassed qualification.

## How it is now (the fix)
Every capture channel now routes a **new stranger to a Lead** (status "New"), with a **three-way dedupe** mirroring the booking reference implementation — *a known Contact is updated in place (never downgraded), a known non-converted Lead is updated, otherwise a new Lead is created*:
- **Ad leads** — `ingestAdLead` creates a Lead (status New, `source` = the ad platform, carrying the full ad/UTM attribution). The intake-feed row now stores `leadId` and routes to `lead-detail`; the sim pool also dedupes against leads. An existing contact match still updates the contact.
- **Forms & funnels** — `runFunnelSubmit` creates a Lead by default (`source: 'Funnel'`), and now **honours `os.recordType`** — a form explicitly set to "contact" still makes a Contact. Toast + preview copy updated ("Lead created/updated"). `OS_DEFAULTS.recordType` flipped from `'contact'` → `'lead'` (the D4 default), so the existing (previously ignored) "Create / update lead | contact" builder toggle finally drives real behaviour.
- **Booking** — unchanged (already creates Leads).

## Why this is better
- One honest top-of-funnel: every inbound person becomes a Lead to be qualified, then converted (into Contact + Company + Deal) via the existing convert flow — the model Wave 2/3 built.
- Lead-based reporting (conversion funnel, lead sources) now reflects real inbound.
- No stranger is silently promoted past qualification.

## What you still need to decide
- Nothing blocks this. Open choices: whether any specific seed form should stay `recordType: 'contact'` (e.g. an internal survey); optionally add `'Funnel'`/`'Ad'` to `LEAD_SOURCES` for first-class source filters (they render fine as free-text source groups today); and per-form a Source dropdown could be added to the after-submit config.

## Verified (headless render, precompiled)
- Babel parse clean; app mounts with **zero console errors**.
- **Ad lead capture** (`ingestAdLead`): leads **13 → 14**, **contacts unchanged (19 → 19)**; the new record is a **Lead** ("Priscilla Adeyemi", `status:'New'`, `source:'Meta Ads'`, `adPlatform:'meta'`, `converted:false`) and **appears in the Leads list** ("All Leads 11").
- Funnel/forms path (`runFunnelSubmit`) uses the identical create-a-Lead + three-way-dedupe pattern and parses clean (the funnel preview UI couldn't be driven in the headless harness, but the logic mirrors the verified ad-lead and booking paths).

## Related
Re-audit finding R4 in [../_REAUDIT-post-wave3.md](../_REAUDIT-post-wave3.md); architecture decision D4 (capture → Lead) in [../_ARCHITECTURE.md](../_ARCHITECTURE.md).
