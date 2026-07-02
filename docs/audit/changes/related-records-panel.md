# Related records on Contact & Company + freelancer handling + volume caps

_Status: fixed & render-verified · 2026-07-02_

## 1 · Attachments: custom-object records now show on Contact & Company detail
Custom records (Projects, Contracts…) linked **to** a contact/company were only visible from the record's own page (`CoLinksPanel`) — the contact/company never showed what was attached to it. Added the reverse direction:
- **`coReverseLinks(crm, targetType, targetRec)`** — enumerates every custom-object record linking to a given contact/company (works for lead/deal/custom targets too). Matches link values by **id OR name** (mirroring `coResolveLink`) because stored values are mixed: drawer-saved links hold ids, seeded records hold names. Respects `coCanView` and skips deleted/archived records.
- **`RelatedRecordsPanel`** — one section per object type ("Projects · 3"), object icon/color, record rows with the first two primary fields as a sub-line, click-through to the record detail. **Capped at 3 per group with "Show all N" / "Show less"** (reset when navigating records). Renders nothing when no records link here.
- Mounted on **ContactDetailPage** (left column, under Deals) and **CompanyDetailPage** (right column, above Tasks). Because `targetType` is a parameter it can later drop onto Lead/Deal/Custom-record pages unchanged.

## 2 · Freelancers / company-less contacts
The data model already handles them: deals, tasks, activities, and custom-object links all attach by **contactId** — nothing depends on a company (all joins double-guard nulls; clearing a company keeps `companyId` in sync as null). The one broken surface was the hero subtitle, which rendered a dangling `"CEO - "` (and hardcoded CEO). Now: `title · company`, falling back to **"Independent"** when the contact has neither — so a freelancer's page reads correctly.

## 3 · Volume handling (a company with many deals/contacts/records)
Only the ActivityTimeline capped rendering before (6 + expander); every other panel rendered everything. Now, reusing that same pattern:
- Contact **Deals** panel: shows 5 + "Show all N deals".
- Company **People** panel: shows 6 + "Show all N contacts".
- Company **Deals** panel: shows 6 + "Show all N deals".
- **Related records**: 3 per object type + "Show all N".
All headers already carry counts; expanders reset on record change.

## Adjacent fixes folded in
- Company page deal cards titled every card with the **company name** (useless on a company page — every card said the same thing); now `deal.name` like the contact page.
- Company **Tasks** join was name-only (`t.company===co.name`, rename-fragile); now **id-first** (`t.companyId===co.id`) with name fallback — matching the contact/lead pattern.

## Verified (headless render, precompiled)
Zero console errors. Sarah Chen's contact page shows **Related records → Projects · 1 → "Meridian website rebuild"**, and clicking it opens the project record. Summit Digital's company page shows **Projects · 1 → "Summit onboarding rollout"**. Clearing a contact's company+title renders the hero as **"Independent"**.

## Known follow-ups (flagged, not done)
- 4 consumers still read `r_company` raw (global search, list page, pipeline link, task prefill) — an id-keyed record shows a raw id there; route through `coResolveLink` like `coOmFields` does.
- `buildActivityFeed`'s contact-branch deal join lacks the `additionalContactIds` clause the page-level join has.
- Company header metric buttons navigate to global pages (lose company context).
