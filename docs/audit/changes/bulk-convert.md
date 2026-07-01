# Real Bulk Convert (re-audit R5 / gap G5)
_Priority: High · Status: fixed & render-verified · 2026-07-01_

The Leads bulk "Convert" action now actually converts the selected leads, instead of just showing a toast.

## How it was (the problem)
Selecting several leads and clicking **Convert** in the bulk bar only flashed a message like "3 leads queued for conversion" — it **created no Contact, Company, or Deal, and left the leads unconverted**. A salesperson who bulk-converted got nothing (this was Critical gap G5 in the original audit, re-surfaced as R5).

## How it is now (the fix)
The bulk **Convert** button (`BulkBar`, leads only) now:
1. Filters the selection to convertible leads (not already converted/deleted), and opens a confirm dialog.
2. On confirm, runs **each** lead through the existing `buildConvertRecords(lead, payload)` with a sensible default payload derived from the lead (contact name/email/title; a Company when the lead has one; a Deal defaulting to the lead's estimated value, entering at Prospecting).
3. Persists all new records in batch (`setContacts` / `setCompanies` / `setDeals`) and marks each lead **converted** with the `convertedTo*Id` back-links — identical to the single-lead `doConvert`.
4. Toasts a real summary (e.g. "3 leads converted → 3 contacts, 3 companies & 3 deals created").

Because it reuses `buildConvertRecords`, every created record is **born id-linked** (contact.companyId, deal.companyId, deal.primaryContactId, fromLeadId) — consistent with Wave 3.

## Why this is better
- Bulk conversion is now a real, safe action (behind a confirm), not a no-op that silently loses work.
- Converted leads become proper id-linked Contacts/Companies/Deals and drop out of the active leads list into "Converted" (read-only), same as single convert.

## What you still need to decide
- Nothing blocks this. It uses defaults (Contact + Company-if-present + Deal at Prospecting). If you'd prefer bulk convert to open a batch review modal (edit each before converting) or to skip creating Deals by default, that's a UX choice we can add later.

## Verified (headless render, precompiled)
- Babel parse clean; app mounts with **zero console errors**.
- Batch-converting 2 leads (Olivia Bennett, Daniel Okonkwo): **contacts 19 → 21, companies 28 → 30, deals 17 → 19**, both leads marked **converted**, and a created deal is fully **id-linked** (`primaryContactId`, `companyId`, `fromLeadId:1`) entering at **Prospecting**. (The handler was exercised directly via the same `buildConvertRecords` loop it runs; the button→confirm→handler wiring parses clean.)

## Related
Re-audit finding R5 / original Critical gap G5. Reuses `buildConvertRecords` (Wave 3) and mirrors the single-lead `doConvert`.
