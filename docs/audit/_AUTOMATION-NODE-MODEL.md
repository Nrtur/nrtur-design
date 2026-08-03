# Automation action nodes — corrected model (as-built)

_Audited + fixed 2026-08-03 via the crm-gap-audit loop. Scope: the action/logic steps in `AutomationBuilderPage`._
_This file is the architecture output of the audit — keep it updated when a node changes._

---

## The rule this model is built on

> **A step may be simulated, but it must never pretend otherwise.**
> Every step's settings must map to something the app really has, and its run-time effect must match what its
> settings claim. Where a real effect isn't possible yet, the step says so on screen.

Two failure modes this audit was hunting:
- **Impossible steps** — a step configuring something the data model can't express (the smart-list steps).
- **Inert steps** — a setting the user can change that the runtime never reads (the task fields; the meeting options).

---

## Where each piece lives (`index.html`)

| Piece | What it does |
|---|---|
| `STEP_PRESETS_A` | The action catalogue (icon, label, colour, `kind:'action'`) |
| `LOGIC_PRESETS_A` | condition · branch(router) · mapFields · wait · waitUntil · goal |
| `AUTO_PALETTE_HIDDEN` | Variant presets kept for old saved flows but hidden from the "Add a step" menu |
| `ACTION_DEFAULTS` | Each action's starting config, so a new step is ready to edit |
| `makeNode(preset)` | Builds a node; gives per-node arrays (e.g. `subtasks`) their own copy |
| `ActionConfig` + `Action*Config` | The settings panel per action |
| `FlowNodeConfigBody` | The drawer body — routes `node.seq` steps to the sequence picker, everything else to `ActionConfig` |
| `actionSummary(node)` | The one-line plain-English summary under each step tile |
| `autoRunNodes(...)` | The runtime that actually executes a flow |
| `_autoRt` | The bridge the runtime uses to write to real stores (tasks, leads, deals, companies, enrollments) |

---

## The action catalogue, and how honest each step is

**Fully real** — changes live data:
`assign` (owner, with pool rotation) · `task`/`flag` (creates a real task with its configured
priority/assignee/due/note/subtasks) · `addTag` / `removeTag` · `updateField` · `createLead` ·
`createCompany` · `createDeal` · `convertLead` · `enrollEmail` / `enrollSms` (writes a real sequence enrollment).

**Real gate, simulated delivery** — the decision is real, the send isn't wired to a provider yet:
`email` (honours unsubscribe / Do-Not-Contact) · `sms` (honours carrier A2P approval **and** meters the send onto
the bill) · `scheduleMeeting` (resolves a real booking page + link, honours the same suppression rules) ·
`slack` (honours whether Slack is actually connected).

**Simulated, and says so on screen:** `report` · `webhook` · `sendPush` · `sendInApp`.

**Deliberately absent:** enrolling/removing a smart list (impossible — membership is computed), and setting a
**deal stage** from `updateField` (must not bypass approval + validation rules; needs its own step).

---

## Decisions worth remembering

**One step per job, template chosen inside it.** "Send welcome email", "Send proposal" and "Re-engagement email"
were three menu items that differed only by which template they defaulted to. They're now one **Send email** step
where you pick the template. Same reasoning collapsed "Notify team" into **Notify Slack**, and "Set reminder" into
**Create task** (they created identical records). The old keys still exist so previously-saved flows render.

**Assignment mirrors the Routing-rules screen.** Strategy (specific rep / round-robin / least-busy) plus an
optional **pool** of reps — the same shape the rule table already used, so there's one assignment concept in the
product, not two.

**A meeting step sends a booking link; it does not book.** Booking a real slot needs the invitee's availability,
which an automation can't know. Picking the time stays with the invitee — this is how mainstream CRMs model it.

**Conditions and actions cover the same fields.** If a flow can *branch* on a field, it should be able to *set* it.
That's why Lead source / Company type / Industry / Deal value became settable.

---

## Open choices for the owner

1. **Static lists** — no hand-curated list object exists. Worth adding if "put these specific records in a bucket"
   is a real need; today the answer is a tag.
2. **A "Move deal stage" step** — genuinely useful, but only with approval + validation rules honoured.
3. **Making the simulated steps real** (report delivery, outbound webhook) is backend work.
