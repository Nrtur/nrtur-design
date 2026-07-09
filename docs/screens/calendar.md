# Calendar (`calendar`)

## Purpose
Schedule and view meetings, calls, follow-ups, and tasks. Month / Week / Day views with a mini-calendar, type filters, and an upcoming panel. Component: `CalendarPage`. Fully theme-aware (light + dark) and **stateful in-app** (create/edit/delete/complete).

## Entry points
- Sidebar Calendar; "New Event"; clicking an empty day/slot; command palette.

## Components & state
- `CalendarPage` — `view` (`month`/`week`/`day`), `current` (displayed date), `events` (`calSeedEvents()`), `typeFilter`, `team`, `eventModal`, `detail`; `useConfirm` + `useToast`.
- Sub-components: `CalMiniCalendar`, `CalMonthView`, `CalTimeGrid` (Week 48px/hr + Day 60px/hr; all-day row; red now-line; abs-positioned blocks), `CalUpcoming` (next 7 days grouped), `CalEventDetailModal`, `CalEventFormModal`, `CalEventPill`.
- Data/helpers: `EVENT_TYPES` (Meeting/Call/Follow-up/Demo/Proposal/Task — fixed colors), `calMonthGrid`, `calSameDay`, `calStartOfWeek`, `calFmtTime`, `CAL_CONTACTS`, `CAL_DEALS`, `CAL_REMIND`, `CAL_REPEAT`. Pill text uses the `--cal-pill` theme var so it reads on pale tints in light mode.

## Use cases
- Browse a month/week/day; jump via mini-calendar / Today / prev-next.
- Filter by event type; (visually) filter by team member.
- Create an event (empty slot or New Event), view details, edit, delete (confirm), mark a task complete.

## Step-by-step flows
**Create:** click empty day/slot or New Event → `CalEventFormModal` (title, type pills, date, all-day, start/end, contact, deal, reminder, repeat, notes, attendees) → Save → added to `events` + toast.
**View/edit/delete:** click a pill/block → `CalEventDetailModal` (date/time, contact→`contact-detail`, deal→`deal-detail`, reminder, notes) → Edit (reopens form) / Delete (`useConfirm`) / Mark complete (tasks).
**Navigate:** view tabs switch Month/Week/Day; ←/→ shift by month/week/day; Today resets.

## Limitations
- Events are in-memory (reset on reload). Team filter is visual (events have no owner). No real Google/Outlook calendar sync; reminders/repeat aren't enforced. No drag-to-move/resize of events.

## Suggestions
1. Two-way **calendar sync** (Google/Microsoft) — reuse the mailbox OAuth pattern ([email-providers.md](email-providers.md)); the footer already hints at it.
2. Drag-to-move and resize events; drag to reschedule across days.
3. Make the team filter real (event owner/attendees) + availability overlay.
4. Auto-create events from deals ("next step") and reminders that fire as notifications.
5. Invites/RSVP, video-link generation, time-zone handling, recurring-event expansion.

## Related
[inbox.md](inbox.md) · [contact-detail.md](contact-detail.md) · [deal-detail.md](deal-detail.md) · [email-providers.md](email-providers.md)