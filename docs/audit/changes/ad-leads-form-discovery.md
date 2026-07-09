# Ad Leads — form discovery & field-accurate mapping (2026-07-08)

_The second half of the ad-leads research turn (the first half — the A2P registration wizard — shipped separately). Reworks the "add a lead form + map its fields" flow, which the owner flagged as "too bad… all things look odd."_

## The problem
Clicking **"Add Meta lead form"** minted a **blank** "New lead form" with a fixed, generic 6-field template. Nothing was discovered from Meta/Google — you retyped the form name, typed the campaign, and mapped against a hardcoded field list (`full_name/email/phone_number/…`) that had **no relationship to the form's actual questions**. A real Meta/Google lead form has a name, lives on a specific Page/Campaign, and asks its own questions — including custom ones ("What's your budget?", "Bedrooms needed?"). None of that surfaced. The mapping editor looked like a form builder, not a connector.

Research (GoHighLevel, Salesforce, HubSpot, Zapier's find-or-create pattern) is unanimous: you **pick from the forms you already published**, and the CRM maps **their** fields. You never hand-build a form that already exists on the ad platform.

## What shipped

**1 · Form discovery picker (`AdFormDiscoveryModal`).** "Add form" now opens a chooser of the lead forms *published* on your connected assets (`AD_PUBLISHED_FORMS`, seeded per Page/Campaign with real names + real question sets). Forms are grouped by asset; each row previews its questions (standard fields in grey, **custom questions in violet**); forms you've already added are shown disabled + "Added" (deduped by `publishedId`, falling back to name). A "Not listed? Add a blank form" escape hatch preserves the old behavior for anything not discovered.

**2 · Field-accurate mapping (`AdFormCard` / `AdMappingRow`).** The mapping rows are the form's **real questions** — derived by `adFormToMapping()`. Standard fields auto-map (`AD_AUTOMAP`); custom questions carry a **"Custom"** badge and default to **"Store as a note."** Required questions are flagged **REQ**, and a required question set to "Don't import" turns the row red — you can't silently drop a name/email/phone. The form's bound asset shows as a read-only chip (form → Page/Campaign is now visible).

**3 · Reachability warning.** If neither Email nor Phone is mapped, the card shows a red "you won't be able to contact these leads" banner; if one is missing, a softer amber note. An ad lead you can't reach is worthless — the UI now says so before you trust the form.

**4 · Custom questions → the lead's notes (honest end-to-end).** The chosen default (owner's call) is **Store as a note**: unmapped custom answers ride onto the created lead as `formAnswers` and surface on its timeline as the "Submitted … form" activity (e.g. *"Target price range? $400k–$550k · Bedrooms needed? 3+"*). Nothing is lost, zero field setup. Any question can still be mapped to a real field, and a **"Create a field instead →"** link routes to Properties for the ones you want structured.

**5 · Per-form "Send test lead."** A **Test** button on each form card runs a lead through *that* form end to end (via `ingestAdLead({formId})`) so you can verify routing before trusting it.

## Why this is better
The page stops pretending to be a form builder and becomes what it is: a **connector**. You recognize your own forms by name, their real questions map themselves, required contact fields are enforced, quirky one-off questions have a safe home, and you can prove a form works before it goes live. It matches how every mature ad-lead integration actually behaves.

## What the owner still decides
- **Custom-question default = Store as a note** (chosen). If a specific question becomes important, promote it to a real CRM field via the "Create a field instead" link. Revisit if teams routinely need those answers as filterable/reportable fields rather than notes.
- Published-forms catalog (`AD_PUBLISHED_FORMS`) is seeded demo data standing in for a live Meta/Google Graph API sync (simulated, like the rest of the ad-platform connection).

## Verified (headless CDP)
Boots clean, zero runtime errors. Discovery modal opens, lists real forms grouped by asset, marks already-added forms "Added", and **selecting a form enables "Add N forms"**; adding produces a field-accurate card (Custom badges, REQ markers, note line, real questions); the reachability warning fires when email is unmapped; the per-form **Test** ingests a real lead (feed 12→13). Store-as-note proven deterministically: `adFormToMapping` yields the custom `__note` rows, the ingest filter yields the answers, and `actLeadOwn` renders them on the timeline — with a graceful fallback for non-ad leads. Two-lens adversarial review + verify pass.
