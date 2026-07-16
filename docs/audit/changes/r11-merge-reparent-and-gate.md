# Record merge — re-parent every child, and lock it to admins (R11)

_Areas: Contacts / Companies / Leads "Duplicates" merge, and the Pipeline deal merge._

## How it was

Wave 4 rebuilt merge so it no longer *orphans* records — when you merge two duplicates, the "loser" is moved to the recycle bin (restorable) and its children are re-pointed to the survivor. That was done correctly for **contacts**, but three siblings leaked:

- **Company merge** re-parented the company's contacts, deals and activities — but **not** its tasks or calendar events. Those still pointed at the deleted company, so they vanished from the survivor and dangled on a record you can't open.
- **Lead merge** re-parented only the central activity feed — it had **no lead branch at all**, so lead-linked tasks and booked meetings orphaned.
- **Deal merge** filled the survivor's fields and binned the losers, but **never moved the losers' timeline** (notes, calls, emails, texts). The whole logged history of the merged-away deal simply disappeared from the survivor.
- **No merge** re-pointed **sequence enrollments**, so a merged contact's enrollment stranded on the dead record — and the "already enrolled" guard could then enroll the survivor a second time.

On top of that, the merge action itself had **no permission check**. The permission matrix promises "Merge duplicates" is admin-only, and the *deal* merge honored that — but the contact/company/lead Duplicates tabs let **anyone who could view the page** merge (soft-delete + rewrite) records. A view-only teammate could quietly collapse your records.

## How it is now

- **Company merge** now re-parents company-linked tasks and calendar events (by company id).
- **Lead merge** now has its own branch that re-parents lead-linked tasks and booked meetings (by lead id).
- **Deal merge** now moves the losers' entire timeline onto the survivor (both the deal's own notes/calls and any emails/texts linked to it).
- **Sequence enrollments** are re-pointed to the survivor and de-duplicated, so the survivor stays "enrolled once."
- **Merging is now admin-only**, matching what the permission matrix already promised. Non-admins can still *open* the Duplicates view and browse it read-only — they just see a "View only — merging is admin-only" note instead of the Merge buttons, and the merge itself is blocked even if a button were reached.

## Why this is better

Merge is a destructive, one-way-ish action (undo means restoring from the recycle bin and re-splitting). If it silently drops a deal's history or a lead's tasks, you lose real work and don't find out until later. Making **every** child class follow the same re-parent rule the contact merge already used means "merge" means the same safe thing everywhere. Locking it to admins stops an accidental or unauthorized merge from a teammate who was only meant to look.

## What you (owner) still need to decide

- **Who counts as "admin" for merge?** It's currently `Owner`/`Admin` (the same set the matrix already uses for "Merge duplicates"). If you'd rather tie it to per-object *edit* permission instead (so, e.g., a sales manager with full Contacts access can merge contacts but not companies), say so and it's a one-line change.
- Nothing else — this is a correctness fix, not a design change.
