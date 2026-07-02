# Re-audit R7 — four defects found by the regression completion sweep (post R6)

_Priority: 1 High · 2 Medium · 1 Low · Status: fixed & render-verified · 2026-07-02_

After R6, the two regression hunts (and the data-model completeness critic — which came back **clean**) were re-run against the fixed code. The model critic found nothing new; the regression hunts surfaced **four** more real defects — two in the same "unlinked / mis-linked record" class we've been closing.

## 1 · High — booking-created deal filed the invitee's **person name as the company** and set no id-links
**Problem.** `SchedulingBookingWidget.confirm()` captures a booker as a Contact/Lead and can also open a Deal. That deal was built with `company: nm` (the **person's** name) and neither `primaryContactId`, `fromLeadId`, nor `companyId` — even though `recordKind`/`contactId`/`leadId` were already computed in the same handler. So the deal detail header showed a person as the company, and the deal could never join back to the lead/contact (it bypassed the id model that convert/funnel/quick-add all honor).

**Fix.** Mirror the R6 funnel-deal linkage:
```js
company:(existing&&existing.co)||'',                       // a real company (known contact) or blank — never the person name
companyId:(existing&&existing.companyId!=null)?existing.companyId:null,
primaryContactId:recordKind==='contact'?contactId:null,    // link to the Contact…
fromLeadId:recordKind==='lead'?leadId:null,                // …or trace to the Lead
```
Verified: a new-invitee booking → deal `fromLeadId=<lead>`, `company:''`; a known-contact booking → `primaryContactId=<contact>`, `company/companyId` from that contact.

## 2 · Medium — `ingestAdLead` dedupe was **contacts-only** while it now creates Leads (R4 asymmetry)
**Problem.** R4 made the sim-pool filter leads-aware, but the dedupe **guard** still only checked `contacts`. Once the 6-person pool drained, the next simulate re-picked an already-captured person; because that person was now a **Lead**, the guard missed and a **duplicate Lead** was created — breaking R4's claimed 3-way dedupe on the ad path.

**Fix.** Add an `existingLead` check (non-converted, by email — mirroring the funnel path) and an `else if` branch that **updates the lead in place** instead of creating a second one. Verified: an incoming person matching an existing lead now takes the `lead-dedupe` branch.

## 3 · Medium — deleting a contact made its deals show an **unrelated coworker** as primary
**Problem.** Soft-delete only flips `deleted:true`; dependents keep their id links. The deal-detail resolver, on failing the `id===primaryContactId && !deleted` and name lookups, fell through to `contactsForCompany(company)[0]` — i.e. it substituted an **arbitrary sibling** at the same company as the deal's "primary contact", with no indication the real one was removed.

**Fix.** When a deal is **id-linked** (`primaryContactId!=null`), resolve strictly to that contact (or `null` if removed) and never fall through to a company sibling. Legacy deals with no `primaryContactId` keep the name→company fallback. Verified: OLD resolver returned the sibling; NEW returns `null`.

## 4 · Low — contact rename cascaded to `primaryContact` but not `additionalContacts[]`
**Problem.** `updateContact` rewrote `deal.primaryContact` on rename but left `deal.additionalContacts[].contact` (the name+role array shown on the deal) stale.

**Fix.** Capture the old name from the live-contacts mirror and also map matching `additionalContacts` entries to the new name. Verified: renaming an additional contact updates its entry and leaves others untouched.

## Verified (headless, precompiled)
- Babel parse clean; app reloads with **zero console errors**.
- All four fixes' logic reconstructed against representative data — **ALL_PASS**.

## Related
Found by `crm-reaudit-r6-regression` (the rate-limit re-run of the regression + model passes). Fixes 1–2 extend the id-linking discipline of Wave 3 / R4 / R6; the model completeness critic returned **clean** (no new data-model defects).
