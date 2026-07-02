# Convert reuses an existing Company instead of minting a duplicate

_Priority: High · Status: fixed & render-verified · 2026-07-02_

Converting a lead (single or bulk) whose company already exists in the CRM now **links to that company** rather than creating a second copy.

## How it was (the problem)
`buildConvertRecords` always minted a **new** Company whenever the convert payload carried one — even if a company with the same name already existed. Converting three leads from "Acme Corp" produced **three separate "Acme Corp" companies**, each with its own id, splitting that account's contacts and deals across duplicates. Bulk Convert (R5) made this worse at scale.

## How it is now (the fix)
- Added a module-level `_liveCompanies` mirror (parallel to `_liveContacts`/`_liveDeals`), kept in sync on each App render.
- `buildConvertRecords` now resolves the target company **first**, deduping by name against `_liveCompanies`:
  - **Match found** → reuse `match.id`; **no** new company record is created.
  - **No match** → mint a new company as before.
- The resolved id (`effCompanyId`) is written to the new `contact.companyId` **and** `deal.companyId`, and returned as `companyId` so the lead's `convertedToCompanyId` back-link points at the reused-or-created company.
- All three call sites updated: single convert (Leads list + Lead detail) and bulk convert (`BulkBar`) use the returned `companyId` and only insert a company record when one was actually created.

## Why this is better
- One company = one record. Converting into an existing account **joins** it (its contacts/deals stay together) instead of fragmenting it.
- Matches how convert already treats contacts/deals (id-linked, Wave 3) — consistent with the Company-as-hub model.
- Bulk convert of several leads from the same company now yields **one** company, not N.

## What you still need to decide
- Dedupe is by **exact (case-insensitive, trimmed) name**. Fuzzy matching (domain match, "Acme" vs "Acme Inc.") is a later enhancement; for now a slightly different spelling still creates a new company.

## Verified (headless render, precompiled)
- Babel parse clean; app mounts with **zero console errors**.
- Converting into the existing **"Meridian Agency"** (id 1) → **no new company** created; `contact.companyId`, `deal.companyId` and the returned `companyId` all resolve to **id 1**.
- Converting into a brand-new name → a company **is** created and everything links to its new id.

## Related
Original backlog gap (convert company-dedupe, High). Builds on Wave 3 id-linking and R5 bulk convert; both now dedupe.
