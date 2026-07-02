# Module 17 — Calendar

_Component: `CalendarPage` (line 18003) · Route: `calendar`_

---

## 17.1 Calendar View

### Surface inventory

| Element | What it is |
|---|---|
| App sidebar | Standard `AppSidebar` with `active="calendar"` |
| Tab rail | 4 tabs: Calendar · Meetings · Bookings · Availability |
| View toggle | Schedule / Week / Month (inside Calendar tab) |
| Type filter chips | Per-event-type toggle: Meeting / Call / Follow-up / Demo / Proposal / Task |
| Team member filter | Avatars (AM / SC / JK); toggle to show/hide each person's events |
| Mini calendar | Sidebar month picker; days with events show dots; click to jump to date |
| Upcoming panel | Open tasks with subtask counts + next 7 days' events, grouped by date |
| Monthly grid | 5–6 row month grid; each day cell shows event chips (colored by type) |
| Week / day time grid | Columnar time grid; events shown as positioned blocks at their time |
| Event chip | Colored pill: type color · title · time |
| `CalEventDetailModal` | Click event → detail modal: title, type, date/time, related contact/company/deal, reminder, notes, edit/delete/complete |
| Add event button | Opens event editor; pre-fills with clicked date |
| Event editor | Title · type selector · date/time · end time · all-day toggle · related record · reminder · repeat · notes |
| Recycle bin indicator | Deleted events appear with `deleted:true`; recycle-bin view shows them |

### `EVENT_TYPES` — 6 event types

| Type | Color | Use case |
|---|---|---|
| `meeting` | `#6366f1` (brand purple) | General meetings |
| `call` | `#10b981` (emerald) | Phone or video calls |
| `followup` | `#f59e0b` (amber) | Follow-up reminders |
| `demo` | `#8b5cf6` (violet) | Product demos |
| `proposal` | `#3b82f6` (blue) | Proposal review sessions |
| `task` | `#64748b` (slate) | Action items with due dates |

### Calendar event object shape

```
{
  id: string,
  title: string,
  type: 'meeting' | 'call' | 'followup' | 'demo' | 'proposal' | 'task',
  date: Date,                   // start datetime
  end: Date | null,             // end datetime (null = point in time)
  allDay: boolean,
  contact: string | null,       // contact name
  linkType: 'contact' | 'lead' | null,
  company: string | null,
  deal: string | null,
  reminder: string,             // minutes before ('30', '60', '')
  repeat: 'Never' | 'Daily' | 'Weekly' | 'Monthly' | 'Custom',
  notes: string,
  done: boolean,                // task completion
  priority: 'Low' | 'Medium' | 'High',
  assignee: string,             // team member avatar initials
  subtasks: string[],           // checklist items (tasks only)
  deleted: boolean,
  deletedAt: number | null,
  deletedBy: string | null,
}
```

### `CalendarContext`

`CalendarContext` (line 2987) provides `{ items, addItem, updateItem, deleteItem, toggleDone }`. The full event list starts from `calSeedEvents()` — a function that generates events relative to today's date (using `new Date()` on page load). Used by `CalendarPage`, `CalUpcoming`, and the `ActivityTimeline` when scheduling a follow-up.

### `CalUpcoming` — upcoming events sidebar

Shows two sections:
1. **Open tasks** — incomplete task events with subtask counts ("3 / 5 done")
2. **Next 7 days** — timed events grouped by date label (Today / Tomorrow / weekday name)

Tasks are drag-reorderable within their date group. Events link to their related contact/deal detail page.

---

### Design decisions

| Decision | Alternative | Why this | Tradeoff |
|---|---|---|---|
| Events seeded relative to today via `calSeedEvents()` | Static hardcoded future dates | Demo always shows relevant "today / tomorrow" events regardless of when the prototype is opened; avoids the stale-data problem of hardcoded dates from 2023 | Seeding via `new Date()` means the exact event layout changes every day; a specific demo scenario (e.g. "show me the 2pm demo") requires knowing today's date to predict which seed event appears where |
| `task` as a calendar event type (not a separate tasks model) | Tasks and calendar events in separate data models | A follow-up call and a "send proposal" task both live on the calendar; the user doesn't need to context-switch between "Calendar" and "Tasks" when planning their day | Tasks and calendar events are merged in `CalendarContext.items`, which means filtering "all tasks" requires scanning the full events array for `type === 'task'`; the standalone `TasksPage` (Module 18) must also read from this context |
| Type filter chips + team member filter combined | Single unified filter | Lets the user answer "show me only MY demos" (type=demo + team=me) without building a complex query filter | Two independent filter dimensions with no "clear all" button; a user who filtered to just demos and just themselves must remember to reset both before viewing the full calendar |

---

### Frontend — what needs to be built

- `CalendarContext.Provider`: `useState(calSeedEvents())` with `addItem`, `updateItem`, `deleteItem`, `toggleDone`
- `calSeedEvents()`: generates events relative to current date on app load
- `CalMonthView`: 5–6 row grid; each day cell gets events for that date; click cell → add event
- `CalTimeGrid` (week/day): columnar grid with `position: absolute` event blocks; overlap handling
- `CalMiniCalendar`: month navigator; day dots for days with ≥1 event; click selects `current` date
- `CalUpcoming`: two-section sidebar; task list with subtask counts; 7-day event feed
- `CalEventDetailModal`: read-only detail + edit / delete / mark-done actions
- Event editor form: type selector, all-day toggle, related record picker (contact/deal/lead), repeat options
- Type filter: `typeFilter` object `{ meeting: true, call: false, … }` → filter `items` before render
- Team filter: `team` object `{ AM: true, SC: false, … }` → filter by `event.assignee`

### Backend — what needs to be provided

- `GET /calendar/events?from=&to=&userId=` → events in date range
- `POST /calendar/events` / `PUT /calendar/events/:id` / `DELETE /calendar/events/:id`
- `PATCH /calendar/events/:id { done: true }` — mark task complete
- Reminders: background job fires notification `reminder` minutes before `event.date`
- Recurrence expansion: `repeat` rule → server expands into individual event instances (or returns rule + client expands)
- Contact/deal links: `POST /calendar/events` accepts `contactId`, `dealId`, `leadId` as foreign keys; activity timeline logs "Event scheduled"

---

## 17.2 Meetings Tab

### Surface inventory

| Element | What it is |
|---|---|
| Meetings list | Cards for upcoming booked meetings (from `SchedulingContext.meetings`) |
| Meeting card | Event type name · contact name · date/time · duration · location · contact email |
| Status tabs | Upcoming / Past |
| Empty state | "No meetings booked yet" + link to booking page |
| Join link | For video meetings (Google Meet / Zoom) — opens in new tab |
| Cancel button | Removes meeting + (simulated) sends cancellation notification |

`SchedulingContext.meetings` starts from `SCHED_DEFAULT_MEETINGS` seed data. New bookings from the public booking page (`SchedBookingPageTab`) call `addMeeting()` to append.

---

### Design decisions

| Decision | Alternative | Why this | Tradeoff |
|---|---|---|---|
| Meetings are a separate list from calendar events | Bookings write to `CalendarContext` only | Keeps scheduled bookings (initiated by a contact) distinct from manually-added events (initiated by the rep); easier to build booking-specific features (reschedule, join link, guest list) without touching the generic event model | Two sources of truth: `CalendarContext.items` (manual events) and `SchedulingContext.meetings` (bookings); the month view must merge both to show all events on the calendar |

---

### Frontend — what needs to be built

- `SchedulingContext.Provider`: `useState(SCHED_DEFAULT_MEETINGS)` with `addMeeting`, `setMeetings`
- Meetings list: filter `meetings` by `date >= now` (Upcoming) or `date < now` (Past)
- Join link: render only when `location === 'Google Meet' || 'Zoom'`; generate meet link from `eventType.slug + meetingId`
- Cancel: `setMeetings(ms => ms.filter(m => m.id !== id))` + toast + (production: send cancellation email)

### Backend — what needs to be provided

- `GET /bookings?status=upcoming|past&userId=` → paginated meetings
- `DELETE /bookings/:id` → cancel; send cancellation email to guest; remove from host calendar

---

## 17.3 Bookings Tab (`SchedBookingsTab`)

### Surface inventory

| Element | What it is |
|---|---|
| Booking page URL | `cal.nrtur.com/{workspace-slug}` — copy button; shows all event types |
| Event type cards | One per `SchedulingContext.eventTypes`; shows name, duration, location, color, slug URL |
| Card actions | Edit (→ `EventTypeDrawer`) · Preview (→ `SchedBookingPageTab`) · Copy link · Delete |
| Add event type button | Opens `EventTypeDrawer` in create mode |
| `EventTypeDrawer` | Right-side slide-in editor for creating/editing an event type (see 17.4) |
| `SchedBookingPageTab` | Full public booking simulation (see 17.5) |

`SCHED_DEFAULT_EVENT_TYPES` seeds 5 event types:

| Name | Duration | Type | Key feature |
|---|---|---|---|
| 30 Min Intro Call | 30m | individual | Standard 1:1 |
| Product Demo | 45m | individual | Qualification form attached (`qualFormId:1`) |
| Onboarding Session | 60m | individual | Phone call location |
| Sales Round-Robin | 30m | roundrobin | 3 hosts; assigns to next available |
| Group Onboarding Webinar | 60m | class | Capacity 20; payment required ($149/seat) |

---

### Design decisions

| Decision | Alternative | Why this | Tradeoff |
|---|---|---|---|
| `cal.nrtur.com/{slug}` URL for the booking page | `nrtur.com/book/{slug}` | Dedicated subdomain signals a purpose-built scheduling product; shorter URL for business cards and email signatures | Requires DNS + subdomain management per workspace; production must provision `{workspace-slug}.cal.nrtur.com` for each workspace |

---

### Frontend — what needs to be built

- Event type card grid: color dot + name + duration badge + location icon + slug URL
- `EventTypeDrawer` (see 17.4)
- Copy link: `navigator.clipboard.writeText('https://cal.nrtur.com/' + workspace.slug + '/' + et.slug)`
- Booking page preview: renders `SchedBookingPageTab` in a modal or navigates to the tab

### Backend — what needs to be provided

- `GET /event-types?userId=` → list
- `POST /event-types` / `PUT /event-types/:id` / `DELETE /event-types/:id`
- Public booking page: `GET /cal/:workspaceSlug` → workspace info + event types list (unauthenticated)
- `GET /cal/:workspaceSlug/:eventTypeSlug/slots?date=` → available time slots (unauthenticated)

---

## 17.4 Event Type Editor (`EventTypeDrawer`)

_Lines 18068–18240_

### Surface inventory

| Element | What it is |
|---|---|
| Drawer header | "New event type" / "Edit: {name}" + close |
| Name input | Event type name |
| Duration selector | Buttons: 15 / 30 / 45 / 60 / 90 min |
| Location selector | Google Meet / Zoom / Phone call / In person / Custom |
| Calendar type | 4 options: Individual / Round-robin / Collective / Class |
| Hosts picker | Multi-select team members (for roundrobin / collective / class) |
| Distribution method | Availability / Equal rotation / Priority (for roundrobin) |
| Capacity | Integer input (for class) |
| Payment toggle | Collect payment for class bookings; `seatPrice` input |
| Description textarea | Shown to invitees on the booking page |
| Buffer before / after | Dropdowns: None / 5min / 10min / 15min / 30min |
| Min notice | Minimum advance notice before booking (1 hour / 4 hours / 1 day) |
| Qualification form | Attach a `qualFormId` from `FORMS_DATA`; `qualRequired` toggle |
| Qualification rules | `QUAL_ACTIONS`: qualify / disqualify / route to rep; multiple rules; evaluated by `qualEvaluate()` |
| Color picker | 6 preset `SCHED_COLORS` |
| Slug input | URL-safe slug for the booking link |
| Save / Cancel | Save updates `SchedulingContext.eventTypes` |

### 4 calendar / booking types

| Type | Meaning |
|---|---|
| `individual` | Standard 1:1: one host, one guest |
| `roundrobin` | One host assigned from the pool; assignment logic: availability / equal / priority |
| `collective` | All hosts must be available simultaneously (panel interview, multi-stakeholder call) |
| `class` | Group booking with a capacity limit; multiple guests book the same slot; optional payment |

### Qualification rules on booking links

When `qualFormId` is set, the booking page shows the qualification form before the calendar. `qualEvaluate(rules, ansByLabel)` (from Module 10.7) runs the rules against the guest's answers:
- `qualify` → allow booking (optionally route to specific rep)
- `disqualify` → block booking; show "not a fit" message
- `route` → allow booking but assign to a specific team member

---

### Design decisions

| Decision | Alternative | Why this | Tradeoff |
|---|---|---|---|
| Qualification rules reused from Automations module (`qualEvaluate`) | Separate qualification engine for booking links | Same logic (disqualify-wins evaluation, op: contains/equals) reused without duplication; a `disqualify` rule built in automations is the same shape as one in booking links | The operator set (`contains`, `equals`) is limited to what `qualEvaluate` supports; complex rules (score > 80, company size > 200 AND budget > $50k) require extending the shared engine |
| Collective booking requires ALL hosts to be available | Any-host-available (first available from pool) | Collective is specifically for "interview panel" or "multi-stakeholder call" — all people MUST be present; if you want "any one of them", that's round-robin | Collective availability is the intersection of all hosts' free slots; with 3 hosts, available slots can become very sparse; the booking page may show very few times |

---

### Frontend — what needs to be built

- `EventTypeDrawer`: controlled state for all fields; `calType` toggles visibility of hosts/distribution/capacity/payment fields
- Host picker: multi-select from `TEAM_MEMBERS`; renders selected avatars
- Qualification rules editor: same `QUAL_ACTIONS` + `ADD_RULE` / `REMOVE_RULE` pattern as AutomationBuilderPage
- `qualEvaluate` imported from shared module (not duplicated)
- Slug auto-generation: `slugify(name)` on name change unless user has manually edited slug

### Backend — what needs to be provided

- `PUT /event-types/:id` — full update
- Round-robin assignment: server tracks `lastAssigned` per event type + host pool; assigns cyclically or by current workload
- Collective availability: server-side intersection of all hosts' calendars for the requested date range
- Class booking: `POST /bookings/:eventTypeId { guestName, guestEmail, slot }` → check `currentBookings < capacity` before confirming

---

## 17.5 Public Booking Page (`SchedBookingPageTab`)

_Lines 18283–18644_

### Surface inventory (5-step flow)

| Step | What the guest sees |
|---|---|
| 1. Event type picker | List of available event types for the workspace |
| 2. Month picker | Month nav + calendar grid; only days with available slots are clickable |
| 3. Time slot picker | Available slots for the selected date based on `availability` config and event type duration |
| 4. Guest details form | Name · Email · optional custom questions; qualification form (if `qualFormId` set) |
| 5. Confirmation | Meeting summary: date, time, location, join link; add-to-calendar buttons |

### Availability computation

Slots are derived from `SCHED_DEFAULT_AVAIL`:
- `workDays[0-6]` (Mon–Sun booleans) determines which days have slots
- `dayStart` / `dayEnd` define the daily window
- Slot interval = event type `duration` minutes
- `buffer` padding added between adjacent bookings
- `blocked[]` removes specific dates/ranges

In the prototype this is computed client-side with hardcoded helpers. Production requires server-side slot generation that reads the host's actual calendar (Google/Outlook sync) to exclude already-booked times.

### `addMeeting()` on submit

When a guest submits the booking form, `addMeeting(meetingObj)` is called on `SchedulingContext`. The new meeting appears in the Meetings tab. The prototype simulates:
- Adding a calendar event to `CalendarContext`
- Sending a confirmation email (toast only, no real email)
- Capturing the booker into `CrmDataContext` via a three-way dedupe by email: a **known contact** is updated in place, a **known lead** is updated, and a **brand-new invitee is created as a Lead** (`status: 'New'`, `source: 'Booking'`) — not a contact. Qualification can promote a new/known lead to `Sales-Ready` or flag it `Disqualified`. The meeting is id-linked to that record via `recordKind` + `recordId` (`contactId` / `leadId`).
- Triggering the booking automation (if configured)

---

### Design decisions

| Decision | Alternative | Why this | Tradeoff |
|---|---|---|---|
| Availability computed client-side in the prototype | Server-computed slots via API | No backend needed for the demo; the slot picker shows a plausible set of times based on the configured work hours | Client-side slot generation cannot read the host's real Google/Outlook calendar; double-bookings are possible; the "available" slots shown in the prototype do not reflect real busy/free status |
| Collect payment for `class` event type (Stripe simulated) | No payment on booking | Group webinars/workshops have real monetary value; `collectPayment: true` + `seatPrice: '149'` enables a Stripe Checkout step before confirming the booking | Payment adds a step to the booking flow; if Stripe checkout fails, the seat is not reserved; atomic "reserve seat + collect payment" requires a backend transaction |

---

### Frontend — what needs to be built

- Multi-step state machine: `useState(1)` for step; each step's "Next" validates + advances
- Slot generator: `generateSlots(date, availability, eventType)` → `string[]` of "9:00 AM", "9:30 AM", …
- Guest details form: dynamic custom questions from `eventType.questions[]`
- Qualification form: if `qualFormId`, render `FormPreview` before slot selection; run `qualEvaluate` on submit
- Confirmation: generate Google Calendar / iCal links with event details
- Payment step: if `collectPayment`, render Stripe Checkout embed (or redirect) before confirming

### Backend — what needs to be provided

- `GET /cal/:workspaceSlug/:eventTypeSlug` → event type + host info (public, unauthenticated)
- `GET /cal/:workspaceSlug/:eventTypeSlug/slots?date=YYYY-MM-DD` → available slots after subtracting existing bookings + external calendar busy times
- `POST /cal/:workspaceSlug/:eventTypeSlug/book { guest, slot, answers }` → confirm booking, send emails, capture the booker (dedupe by email: update known contact/lead, else create a new lead), trigger automation, optionally initiate Stripe payment

---

## Developer Q&A

**Q: `calSeedEvents()` generates events relative to `new Date()`. What breaks if the timezone changes or the user opens the app at midnight?**
A: Events use `new Date(y, m, d, hh, mm)` where `y/m/d` come from the local system clock. At midnight local time, `d` changes — "today's" events shift to tomorrow. If the user is in UTC+0 and the server is in UTC-8, `new Date()` at the server level would be 8 hours behind; but since this is client-side only, the client's local timezone governs. Production events must be stored as UTC ISO timestamps and converted to the user's configured timezone from `SCHED_DEFAULT_AVAIL.tz` for display.

**Q: `CalendarContext` and `SchedulingContext` are separate. Does the calendar month view show booked meetings from the booking system?**
A: In the prototype, no — `CalendarPage`'s Calendar tab reads only from `CalendarContext.items`. Meetings booked via `SchedBookingPageTab` → `addMeeting()` are written to `SchedulingContext.meetings`, not `CalendarContext`. The month view therefore won't show a booked "Product Demo" at 2pm unless the booking code also calls `CalendarContext.addItem()`. Production must write to both (or merge them at read time via a combined query: `GET /calendar/events` that returns manual events + confirmed bookings from the same time range).

**Q: Round-robin booking assigns to "next available." How does availability actually work in the prototype?**
A: It doesn't — `distribution: 'availability'` on `SCHED_DEFAULT_EVENT_TYPES[3]` is just metadata. The prototype's `addMeeting()` doesn't implement any assignment logic; it stores the booking with whatever host state exists. Real round-robin requires: (a) checking each host's `SCHED_DEFAULT_AVAIL` for the requested slot; (b) among available hosts, applying the distribution rule (strict rotation, equal workload count, or priority order); (c) assigning the chosen host and recording the assignment to maintain rotation state.

**Q: What happens when a `class` event type is overbooked (more guests than `capacity`)?**
A: The prototype doesn't enforce capacity — `addMeeting()` appends without a count check. A "Group Onboarding Webinar" with `capacity: 20` could have 50 bookings with no error. Production must: (a) `GET /bookings/count?eventTypeId=&slot=` before confirming; (b) if `count >= capacity`, reject with "Fully booked" and suggest other dates; (c) optionally offer a waitlist.

**Q: Qualification rules on booking links use `qualEvaluate()` from Module 10. What if the user changes a form question's label after building the qualification rules?**
A: `qualEvaluate(rules, ansByLabel)` matches rules against answers by label string (`rules[i].q === questionLabel`). If a form question's label changes from "Company size" to "Team size", the rule `{q: 'Company size', op: 'contains', value: '200'}` will never match — all bookings pass qualification silently. Production must use question IDs (not labels) in rules, and surface a warning when a referenced question label changes: "Qualification rule 'Company size' references a question that no longer exists."

**Q: The booking page URL is `cal.nrtur.com/{workspace-slug}`. How is the workspace slug set, and what happens if two workspaces pick the same slug?**
A: In the prototype, the workspace slug is hardcoded (likely derived from the workspace name). There's no uniqueness enforcement shown. Production must: (a) generate a slug at workspace creation (`slugify(workspaceName)` + uniqueness check + numeric suffix if collision); (b) allow the admin to customize the slug with a uniqueness check on save; (c) serve a 404 with a "Book a time" page on unrecognized slugs rather than a generic error.
