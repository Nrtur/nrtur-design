# Automation steps: every action now matches what the app can really do

_Priority: Critical → Medium · Status: fixed, re-audited_
_Scope: the action steps inside the Automation builder (the “Add a step” menu and each step’s settings panel)._

This was a full sweep of every automation step, checking two things for each one:
1. **Does its settings panel offer what the real feature in the app offers?** (e.g. a task made by an automation should be able to carry the same details as a task you create by hand.)
2. **Does the step actually do what it says?** A step that reports “Meeting scheduled” while booking nothing is worse than no step at all — it teaches people to trust something that isn’t happening.

---

## 1. “Enroll a smart list” / “Remove from smart list” — removed

### How it was
Two steps let you push a record **into** a smart list or pull it **out**.

### Why that was broken
A smart list isn’t a folder you put records in — it’s a **saved search that re-runs itself**. Its members are whoever currently matches its conditions (“leads scoring over 70”). The app says so on the builder itself: *“Auto-updating segment · membership re-evaluates live.”*

So “add this record to the list” is a contradiction: the only way in is for the record to **match the conditions**. Both steps were also doing nothing at all at run time — they printed their own name into the log and moved on. A user could build a flow around them and never notice.

We also checked whether the app has a **static list** (a hand-picked list you drop records into) that these steps could point at instead. It doesn’t.

### How it is now
Both steps are gone from the menu.

### What to do instead
To move a record into a smart list, change the record so it matches: use **Add tag** or **Update a field**. The record joins the segment on its own — which is the whole point of a smart list.

### What you still need to decide
If you want a genuine hand-picked list (“my 12 accounts for this quarter’s push”), that’s a **new feature** — a static list object — not a fix. Tell me if you want it specced; it’s a reasonable thing for a CRM to have alongside smart lists.

---

## 2. “Assign to rep” — round-robin a chosen group, and tell the person

### How it was
One dropdown: round-robin, deal owner, least-busy, or one named person. Round-robin always cycled through **the entire team**, and the new owner was never told they’d been given the record.

### Why that was a problem
Real teams don’t round-robin everyone. You want “rotate these three account executives” — not “rotate the whole company including finance.” The app already supports exactly that in its **Routing rules** screen, where a rule can carry a *pool* of reps. The automation step just never exposed it, even though the underlying machinery was already there and working.

### How it is now
- Choosing **Round-robin** or **Least busy rep** reveals an optional **“Only these reps”** picker. Pick two or five; leave it empty to use the whole team (it says which, in plain words, right under the picker).
- A new **“Notify the new owner”** switch creates a task for the person who just received the record, so a handoff is never silent.
- Both are real at run time: the rotation genuinely cycles only your chosen group, and the notification genuinely creates a task.

### Why this is better
It matches how the rest of the app already models assignment, and it removes the most common reason people abandon round-robin — leads landing on someone who shouldn’t get them.

---

## 3. “Schedule meeting” — now sends your real booking link

### How it was
Four dropdowns (meeting type, with whom, when, duration) that mapped to **nothing in the app** — there is no such meeting object with those options. At run time the step did nothing and wrote “📅 Meeting scheduled” into the log. That was the single most misleading step in the builder: it claimed a booked meeting existed when none did.

### Why the old idea couldn’t work
An automation can’t book a real meeting, because it doesn’t know when **the other person** is free. Picking a time is the invitee’s job — that’s why the app has a whole scheduling module with availability, buffers and notice periods.

### How it is now
The step sends the contact **the booking link for one of your real booking pages**. You pick the page from a live list of the ones you’ve actually created (30 Min Intro Call, Product Demo, Sales Round-Robin…), and the panel shows that page’s real duration, location and link (`nrtur.app/book/alex/intro-call`). You choose whether it goes out by **email or SMS**.

At run time it now behaves like any other message: unsubscribed and Do-Not-Contact people are skipped, and an SMS send respects the same carrier-approval rules as every other text.

### Why this is better
It’s the model every mainstream CRM uses for this step, and it’s honest — the log now says a **link was sent**, which is exactly what happened. The contact books a slot that genuinely fits your calendar.

---

## 4. “Send SMS” — pick a real saved text, not free text

### How it was
The message box was a plain text field where you typed a template *name*. Nothing checked that a template by that name existed, so the step often referred to copy that was never written.

Meanwhile the email step already picked from your real saved templates and previewed them.

### How it is now
The SMS step picks from your **8 real saved text templates**, shows the exact message body that will send, and displays the length and **segment count** (how many texts it will actually cost). The from-number picker and the carrier-approval warning are unchanged.

### Why this is better
Email and SMS now behave the same way, and you can see what will actually go out before it goes out.

---

## 5. “Update a field” — can now set the fields you can already filter on

### How it was
It could only set **Status, Owner, Lead score, Priority** — yet the *condition* steps could already branch on **Lead source, Company type, Company industry and Deal value**. You could ask a question the actions couldn’t answer.

### How it is now
Those four fields are now settable too, and each genuinely writes to the record at run time.

### One deliberate exclusion
**Deal stage** is *not* settable from this step. Moving a deal has rules attached — approval sign-off on big deals, validation rules on won deals — and a silent automated stage change would sidestep them. That deserves its own step with those rules wired in, rather than a back door here.

---

## 6. Steps that are simulated now say so

**“Generate report”** offered *Pipeline digest* and *Activity summary* — neither exists anywhere in the app, and nothing was ever generated or sent. The options are now the reports that **do** exist (Pipeline by stage, Win/loss, Lead sources, Rep performance, Weighted forecast), and the panel states plainly that scheduled delivery is simulated, with a link to Reports where you can view and export the data today.

**“Call webhook”** likewise now states that outbound calls are simulated in the prototype.

This follows the pattern the push and in-app steps already set — they’ve always disclosed that delivery is simulated. The rule we applied: *a step may be simulated, but it must never pretend otherwise.*

---

## 7. A bug found in this session’s own earlier fix

Earlier today the **Create task** step gained priority, due time, a note and subtasks. While auditing, I found the shared task-creating function **ignored all of them** — it hard-coded priority to “High”, overwrote the note, and dropped subtasks and the assignee. So the new fields looked like they worked and silently didn’t.

That function now honours what the step configured: assignee, due date, priority, note and subtasks all carry through to the created task.

*This is exactly why the audit re-runs after every fix — a fix that isn’t verified end to end is just a nicer-looking bug.*

---

---

## 7b. “If / then branch” — the rule editor was cut off (reported by you)

### How it was
Opening an **If / then branch** step showed a small **Filters ▾** button. Clicking it opened a panel that was
**wider than the step panel itself** and got clipped — you could see text sliced off mid-sentence
(*“…filters yet. Add a condition to narrow this list.”*), and part of the controls sat outside the visible area
where they couldn’t be reached.

### Why it happened
That Filters control is the one built for the **Contacts / Smart-Lists page**, which is a full-width screen. It
opens a **480px-wide floating panel**, and the step panel is **380px wide and scrolls** — so the floating panel was
clipped on both axes. It was the wrong control for this place, exactly as you said.

### How it is now
The rules are edited **inside the step panel** — no floating panel at all. Each rule is a small card that stacks
vertically (field, then operator, then value), with **“Record must match all / any”** appearing once you have more
than one rule, and a plain **“Add a rule”** button. When there are no rules it says so honestly: *“No rule yet —
every record takes this path.”*

Verified in the running app: the panel now reports **zero** elements overflowing its width, and the field list is
real (13 fields from the trigger’s record type, 6 operators).

This same editor is used by the **router paths** and **Goal / exit** steps, so all three are fixed together.

### Bonus fix found next to it
A path set to match **any** rule (rather than all) never showed its “(any)” marker on the canvas — the label was
looking for a value the editor never writes. It now displays correctly.

---

## 8. What the re-audit caught (round 2)

The fixes above were then re-audited by four independent reviewers, and every candidate defect was handed to a
separate reviewer whose only job was to **disprove** it. 29 candidates were raised; **20 survived**. They fell into
one pattern — *settings that looked real and did nothing* — plus one outright data-loss bug.

**The data-loss bug (worst finding of the whole audit).** Opening an **existing** automation with the Edit button
threw away its steps and loaded the generic demo flow instead — and saving from there **overwrote the real
automation**. It happened to every automation stored the older way (a flat step list rather than a step tree),
which is most of the seeded ones. The builder now rebuilds an older automation's real steps when it opens.

**Settings that were being ignored at run time.** Each of these showed a control, reported the chosen value on the
step card, and then discarded it:

| Step | What was ignored | Now |
|---|---|---|
| Create deal | Stage, Value, Assign owner — every deal came out **Prospecting, $0**, owned by whoever triggered it | All three are applied |
| Create / update lead | New lead status, Assign owner | Both applied |
| Create company | Type, Assign owner — every company came out a **Prospect** | Both applied |
| Convert lead | **“Also create a deal” was ignored — a deal was created even with the toggle off** | The toggle is honoured, with its value and owner |
| Enroll in sequence | *Which* sequence you picked — enrollment recorded only “an email sequence” | The chosen sequence is recorded by name |
| Notify Slack | The whole message you wrote — only the channel was used | The message is resolved (with `{{contact}}` etc.) and logged |
| Send SMS | Which number it sends from | Recorded on the send |
| Create task | The **“At time”** setting — every task came out all-day | A time makes a real timed task |

**Two of these were mine.** The “At time” selector and the “Deal value” option in *Update a field* were both added
earlier in this same session — the first did nothing, and the second offered “Deal value” on contact-triggered
flows, where it would write a field a contact doesn’t have. Both are fixed (Update a field now only offers fields
that the flow’s own record type actually has).

**Smaller ones:** every automation-made task was signed *“Created by automation "automation"”* (the real name is now
used); the SMS step had no summary line on its card; a leftover `withWhom` setting was still being saved on every
meeting step; and a new automation's starting flow still used the retired “Send welcome email” step instead of the
new **Send email**.

---

## Summary of what changed

| Step | Change | Priority |
|---|---|---|
| Enroll / Remove smart list | **Removed** — impossible by design, and did nothing | Critical |
| Create task (shared writer) | Now honours priority / note / subtasks / assignee / due date | Critical |
| Assign to rep | Rep pool for round-robin & least-busy; notify the new owner | High |
| Schedule meeting | Sends a real booking link; honest run-time behaviour | High |
| Send SMS | Picks a real saved template; shows body + segment count | Medium |
| Update a field | Adds Lead source, Company type, Industry, Deal value | Medium |
| Generate report | Real report names + simulation disclosed | Medium |
| Call webhook | Simulation disclosed | Low |
| **Editing a saved automation** | **No longer discards its steps / overwrites it on save** | **Critical** |
| Create deal / lead / company | Their configured fields are actually applied | High |
| Convert lead | “Also create a deal” toggle is honoured | High |
| Enroll in sequence | Records *which* sequence was chosen | High |
| Notify Slack | The authored message is used, not just the channel | Medium |
| If / then branch (+ router paths, goals) | Rules edit **inside** the panel — no more clipped popup | High |

## What you still need to decide

1. **Static lists** — do you want a real hand-picked list object? (Section 1.) Without it, “put these records in a bucket” is only expressible as a tag.
2. **A “Move deal stage” step** — worth adding, but only with approval and validation rules wired in. Say the word and I’ll spec it.
3. **Making the simulated steps real** (report delivery, webhook) is backend work, not design work — they’re honest placeholders for now.
