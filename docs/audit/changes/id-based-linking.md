# ID-Based Linking (Wave 3)
_Priority: Critical · Status: fixed & render-verified · 2026-07-01_

This is the root-cause wave. Records now link to each other by a stable hidden **id** instead of by a copied **name**, with the Company as the hub. It closes the largest cluster of the audit's Critical gaps.

## How it was (the problems)
- **Every link was a copied name string.** A contact's employer was `contact.co = "Meridian Agency"` (text), a deal's company/contact were `deal.company` / `deal.primaryContact` (text). No ids.
- **Renaming a company silently orphaned all its children** — contacts, deals and invoices matched by exact name, so a rename or a typo detached them.
- **8 deals and several contacts named companies that don't exist** in the data (Pivot Studio, Barrett Digital, Northpeak Co, Helix Partners…), so their Company link fell through to the *first* company in the list.
- **A deal's "Primary contact" opened the wrong person** — the code grabbed `contactsForCompany(deal.company)[0]` (the *first* contact at the company), ignoring the deal's actual named contact. Meridian has two contacts, so its deal mislabeled who it was for.
- **`contactsForCompany` read a frozen seed constant**, never live React state, so newly added/edited contacts never appeared under their company.
- **The Contact "Deals" panel was hardcoded** — every contact showed the same two fake deals ("Q3 Engagement", "Annual Retainer"), clicking led nowhere.

## How it is now (the fix)
- **New id links, added alongside the display names (never replacing them):** `contact.companyId`, `deal.companyId`, `deal.primaryContactId`, `deal.additionalContactIds[]`.
- **A one-time migration (`migrateLinks`) runs at app start:** it resolves each contact's/deal's company name to a real company id, **auto-creates the 14 missing companies** (with deterministic ids so nothing collides or drifts), and resolves each deal's primary/additional contacts to ids. Result: **zero orphaned deals, zero orphaned contacts.**
- **All joins are now id-first with a name fallback** (`contactsForCompany`, `dealsForCompany`, the deal-detail company/contact resolution, the activity timeline, the company detail lists). The name fallback keeps any un-migrated record working, so nothing breaks.
- **`contactsForCompany` now reads live state** (a new `_liveContacts` mirror, matching the existing `_liveDeals` one), so added/edited contacts show under their company immediately.
- **A deal's Primary contact now resolves the real named person** (by `primaryContactId`), not "the first contact at the company".
- **The Contact "Deals" panel is real** — it queries the contact's actual deals (by `primaryContactId`, `additionalContactIds`, or shared `companyId`) and links each to the right deal.
- **`updateCompany` is rename-safe** — renaming a company cascades the new name to its id-linked children's display fields (and back-fills ids on any legacy name-linked child), so a rename can never orphan children again. `updateContact` similarly refreshes a renamed contact on its deals.
- **Converted leads are born id-linked** — `buildConvertRecords` mints the Contact/Company/Deal with `companyId`/`primaryContactId` cross-links (and correctly leaves `companyId` null when no company is created).

## Why this is better
- Renaming a company, or a typo, can no longer detach its contacts, deals or the records that point at it — ids never change.
- "All deals for this company" and "all contacts for this company" are finally trustworthy (verified: Meridian shows its 2 contacts + 1 open deal by id).
- A deal opens the *actual* person it's for.
- Contacts show their real deals; new records link correctly from birth.
- Reporting that depends on these joins (top accounts, conversion, company rollups) is now correct.

## What you still need to decide
- Nothing blocks this wave. **Deliberately out of scope** (recorded as the next migration targets, unchanged for now): Leads' pre-conversion company link, Tasks/Meetings linked by name, Payments invoices' company/contact (invoices already link to a deal by `dealId`), and the calendar option lists. The name-based `ARLookup` picker is intentionally kept — name→id resolution belongs at the commit sites in a later pass.

## Verified (headless render, precompiled)
- Babel parse clean; app mounts with **zero console errors**.
- `migrateLinks`: **14 companies auto-created** (ids 121–134, no collision), **0 deals orphaned** (was 8), **0 contacts orphaned**, all 17 deals carry a `companyId`.
- Deal #1 resolves **Sarah Chen** (the real primary contact), not the first contact at the company.
- Contact (Sarah) "Deals" panel shows her **two real deals** (Meridian — Managed CRM, Summit — Renewal), no fake data.
- Previously-orphaned deal (Pivot Studio) now resolves its company.
- Company detail (Meridian) shows **2 contacts + 1 open deal** by id-join.
- Deal `Qualified` stage and lead `Sales-Ready` (Waves 1–2) still intact; **no cross-contamination**.
- Diff: 72 insertions / 31 deletions in `index.html`; new fields: `companyId` ×46, `primaryContactId` ×13, `additionalContactIds` ×6.

## Related decisions
See [../_ARCHITECTURE.md](../_ARCHITECTURE.md) → key decision #2 ("every link stores an ID; the name is only for display") and the inferred relationships (now confirmed): Contact→Deal 1:many, Deal→Contact = the actual person, one Company by id.
