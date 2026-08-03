# Testing an automation step by step, and naming your steps

_Priority: High · Status: built & verified in the running app_
_Scope: the Automation builder — the Test experience, and the step settings panel._

---

## 1. Testing now runs on the canvas, one step at a time

### How it was
Pressing **Test** opened a panel on the right, you picked a record, pressed **Run simulation**, and the whole flow
resolved **instantly** into a flat list of results.

Two problems with that:
- **You had to read your flow twice** — once as a diagram on the canvas, then again as a list in a panel — and
  mentally match one to the other. On a branched flow that's genuinely hard: the list is indented, the canvas is
  not, and nothing visually connects a line in the list to the box it came from.
- **It told you the destination, not the journey.** Everything appeared at once, so you never saw *where* the flow
  turned, or which steps it skipped entirely.

### How it is now
Pressing **Test** opens a **test bar above the flow**, and the run happens **on the canvas itself**:

- Pick a real record of the trigger's own type, press **Run**.
- The flow executes **one step at a time**, about half a second apart. The step currently executing **pulses green
  and says "Running"**.
- As each step finishes, it keeps **its own result chip** on the tile — numbered in execution order, and colour-coded:
  **Done · Yes · No · Routed · Waits · Skipped · Exit**.
- **Steps the run never reached fade out.** If a condition takes the No path, the whole Yes branch visibly dims —
  you see the road not taken.
- A progress bar and a **"step 3 / 7"** counter track the run.

You can drive it yourself: **Play / Pause** to watch it, or **Step** to advance one node at a time and inspect as
you go. **Restart** replays from the top.

**Click any step to see exactly what it did.** Its settings panel opens with a **"Last test · step N"** block at the
top showing that step's own outcome and which record it ran against — so you can inspect a single step without
losing your place in the flow.

### Why this is better
This is the model Make.com uses ("Run once"), and n8n and Zapier do the same thing: **the diagram is the debugger**.
You watch your automation actually happen instead of reading a report about it, and a wrong turn is obvious because
you can see the branch it took light up while the other one greys out.

The old panel is still used by the **Sequence builder**, which is a flat list of messages with no canvas to run on.

### Honesty note
The run uses **the same rule evaluator the live automation uses** — the preview and a real run can't disagree.
It is still a *simulation*: it doesn't send real emails or texts. Steps that would be blocked in reality still
report it (a suppressed contact, an unconnected Slack, a text held for carrier approval).

---

## 2. You can now rename a step

### How it was
Every step was stuck with its preset name. A flow with three emails in it showed **“Send email”, “Send email”,
“Send email”** — on the canvas, in the test trace, and in the run log. The only way to tell them apart was to open
each one and read its settings.

### How it is now
The step name in the settings panel is **editable** — click it and type. The new name shows on the canvas tile
immediately, and flows through to the test run and the logs.

> “Send email” → **“Welcome email to new leads”**
> “Assign to rep” → **“Route hot leads to an AE”**

If you've renamed a step, a small **“Send email · reset name”** link appears underneath to put the original name
back, so you can't lose track of what kind of step it actually is.

### Why this is better
A named flow is self-documenting. Every serious automation builder allows this for the same reason: the person
reading the flow in six months is usually not the person who built it. It also makes the test run far easier to
follow, because each step reports under a name that means something.

---

## What you still need to decide

Nothing on these two — they're built and working. Two optional extensions if you want them later:

1. **Run speed control** — the step delay is currently fixed at ~0.6s. A slow/fast toggle would be easy to add.
2. **Showing the record's data at each step** (Make.com shows the input/output payload per module). Ours shows the
   *outcome* of each step. Showing the record's changing field values step by step would be the natural next level,
   and is worth doing once the backend actually executes these steps.
