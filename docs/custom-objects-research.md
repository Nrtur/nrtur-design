# Custom Objects — Research in Plain English

*A short, jargon-free summary of what we found and what to do. For the team.*

---

## What this is about

nrtur has a feature called **Custom Objects**. We researched one question:

> **Should a CRM built for small teams even have this feature — and if so, how should it work?**

We looked at how 6 other CRMs handle it (using their real, current docs and pricing pages — not memory), then weighed the strongest case *for* keeping it against the strongest case *for* cutting it.

---

## First, what is a "custom object"? (in one breath)

Every CRM comes with a few built-in record types: **Contacts** (people), **Companies**, **Leads**, **Deals**. Think of them as ready-made cards.

A **custom object** lets you invent *your own* kind of card — for whatever your business runs on that isn't a person or a sale. For example:

- A design agency makes a **"Projects"** card.
- A real-estate agent makes a **"Properties"** card.
- A recruiter makes a **"Candidates"** card.

Each custom card can have its own fields, its own list, and links to your contacts and companies. It's the difference between *"an address book"* and *"a tool you can actually run your business in."*

---

## What we learned from other CRMs

The market splits into two clear camps:

**Camp 1 — the simple small-team CRMs say "no" on purpose.**
- **Less Annoying CRM** and **Pipedrive** don't let you create custom objects at all. You can only add extra *fields* to the cards they already give you. They do this deliberately — to stay simple and avoid bloat. It's a feature, not a gap.

**Camp 2 — the CRMs that do offer custom objects always wrap them in limits and locks.**
- **Attio** (the one CRM that offers them to small teams) caps you to **3–5** of them, only lets an **admin** create them, and charges more (~$69/user) for it.
- **HubSpot** and **Salesforce** (the big, expensive ones) offer them — but locked behind high prices *and* strict "who can see what" controls.

**The one rule everybody follows:** nobody gives small teams *unlimited, wide-open* custom objects. They always come with **(a) a limit on how many** and **(b) locks on who can see them.**

---

## What's wrong with nrtur's version right now

nrtur built the powerful feature — but left off the limits *and* the locks that everyone else ships with it. Two of these are real risks, not nitpicks:

1. **Privacy leak.** Anyone who can see your Contacts can automatically see **every** custom object — even one you built to hold sensitive info (pay, legal, health). There's no per-object "who can see this."
2. **Permanent data loss.** Deleting a custom record deletes it **forever** — no undo. That's different from everything else in nrtur, which goes to a Recycle Bin you can restore from for 30 days. People will assume delete is safe (because it is everywhere else) and lose real data.
3. **No guardrails.** You can make unlimited custom objects, even one named "Deals" that clashes with the real one. And links between records are matched by *name*, so renaming a company quietly breaks them.

In one line: **it's an enterprise-grade feature with none of the enterprise safety rails — under a small-team banner.**

---

## The recommendation: keep it, but tighten it

Both sides of the argument landed in the **same place**:

- **Don't remove it.** It's the one thing nrtur does that the simple CRMs (Less Annoying, Pipedrive) *refuse* to do. It's a genuine selling point, and it's already built.
- **Don't leave it as-is.** Right now it's a liability, not a feature.
- **Do put the limits and locks on it** — copy what Attio (the closest comparable) and Salesforce already do.

### The simple to-do list

1. **Cap it** — about **5** custom objects max, with sensible limits on fields and links. (Small numbers signal "for small teams.")
2. **Lock it** — each custom object gets its own "who can see / edit this," instead of borrowing the Contacts setting.
3. **Make delete undoable** — send deleted custom records to the same Recycle Bin everything else uses.
4. **Stop name clashes** — don't allow a custom object named the same as a built-in one.
5. **Link by ID, not name** — so renaming something doesn't silently break its links.

Most of these are small changes. The hardest (links by ID) is mostly a back-end concern and can come last.

---

## Bottom line

| | Score (0–10) |
|---|---|
| Custom objects **as they are today** (for real users) | **~3.5** — works, but it's a privacy leak + a data-loss trap |
| Custom objects **with the limits and locks added** | **~8** — and a real competitive edge |

**Verdict: Keep and tighten.** Make it a bounded, locked-down version of what Attio charges premium for — that's exactly the small-team product nrtur is trying to be.

---

*Companion docs: `docs/crm-system.md` (the data-model audit + corrected model). Full code lives in `index.html` (the Custom Objects block starts ~line 19890).*
