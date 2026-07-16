# Three decisions, built: path routing, a leaner field-type list, and a real SMS audit trail

_Decided 2026-07-15 after benchmarking against mainstream CRMs. All three are implemented in `index.html`._

---

## 1. "Split into paths" now **routes** — each record takes one path

### How it was
The automation builder had two logic blocks: an **If / then branch** (a yes/no test) and a **Split into paths** node with 2–4 named paths. But "Split into paths" had no rules on its paths, and under the hood it only ever ran the *first* path — anything you put in Path B or C silently never happened. The R11 audit caught that and made it run *every* path as an interim fix.

Running every path was still the wrong answer: stacking three steps in a row already runs all three, so a node that "does everything at once" adds nothing.

### How it is now
Each path carries its own **rule**, and a record flows down the **first path whose rule matches**. A trailing **"Everyone else"** path catches anyone who matched nothing, so no record is ever silently dropped. You edit the rules in the step's config panel; the canvas shows each path's rule summary underneath its name.

> New Lead → **Enterprise** (company size > 200) gets an AE + a Slack ping · **SMB** gets the nurture sequence · **Everyone else** goes to the default owner.

That's the automation small teams actually reach for, and it previously took three nested if/then blocks to express.

### Why this is better
This is how every mainstream builder works — HubSpot's if/then branches (with a built-in "None met"), Salesforce Flow's Decision element, ActiveCampaign and GoHighLevel's If/Else. A record following exactly one path is the mental model users already have, and "split" implies dividing an audience, not doing everything at once. It also reuses the same rule editor the If/then block uses, so there's nothing new to learn.

### The Test button now tells the truth too
Building the router exposed a real problem in the **Test** panel: it only ever simulated a flow against a sample **contact**, but most automations are triggered on **deals**. So a rule like "Amount is over $50k" couldn't be evaluated at all, and the Test trace would confidently report a path the live automation would never take.

Fixed as part of this: **Test now runs against a real record of the flow's own trigger type** — a deal-triggered flow is tested against your actual deals, a lead flow against leads, and so on — and it uses the **same rule evaluator the live automation uses**, so the preview and the real run can't disagree.

_Verified with the failing case: a deal of $100 against a rule "Amount > $50,000" now correctly reports **"routed to Everyone else"** — and the live runtime does the same. Previously the preview claimed the big-deal path._

### What you still decide
Nothing — it's built. If you later want a path to run on a *percentage* split (A/B testing) rather than a rule, that's a separate, additive feature.

---

## 2. Three field types removed from custom objects

### How it was
The custom-object field builder offered **Date range**, **Lookup**, and **Autocomplete**, but none of them actually worked as named: a Date range rendered one date box, and Lookup/Autocomplete became plain text boxes. You could pick them, but you'd get something else.

### How it is now
All three are gone from the **custom-object** field picker. Nothing changed for Contacts, Companies, Deals or Leads — this is scoped to custom objects only.

Each has a better home you already have:
- **A date span** → add two Date fields (Start, End).
- **Linking to another record** → the **Relationships** section, right next to Add field.
- **Type-ahead picking** → a **Single select** (the list is searchable when it's long).

### Why this is better
Removing them is *less* work than building them, and it avoids the worse outcome: two different ways to link a record (a "Lookup" field *and* Relationships), which is exactly the kind of duplicate path that causes the data messes this audit keeps cleaning up. It also matches convention — HubSpot, Salesforce, Airtable and Attio have no single "date range" type either; they all model a span as two date fields, which is far easier to filter and report on ("show me everything that starts this quarter").

### What you still decide
Nothing required. If a real two-date range control ever becomes a common ask, it can be added properly later — the removal doesn't block that.

---

## 3. Texts now record which number sent them

### How it was
The message composer let you pick which of your numbers to send from ("Sending as +1 …"), and the picker was real and remembered your choice — but the number was **thrown away on send**. Nothing recorded which number a text actually went out on.

### How it is now
The sending number is saved onto the message and onto the contact's (or lead's) timeline entry, and shows on the sent bubble as "· via +1 …".

### Why this is better
Every texting CRM built on Twilio records the From number on every message — it's fundamental to how texting works, and once a workspace has more than one number it's needed for A2P compliance and for spotting which number has a deliverability problem. It also closed a small honesty gap: the picker implied the choice mattered, while the data said it didn't. That's the same "the screen says it did something it didn't" pattern this audit has been eliminating everywhere else.

### What you still decide
Nothing. When the real backend lands, this field is what a per-number deliverability report would read.
