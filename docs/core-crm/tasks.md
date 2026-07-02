# Module 18 — Tasks

_Components: `TasksPage` (line 18817) · `TaskFormModal` (line 17571) · `RecordTasks` (line 7103) · Route: `tasks`_

---

## 18.1 Tasks List Page (`TasksPage`)

### Surface inventory

| Element | What it is |
|---|---|
| App sidebar | Standard `AppSidebar` with `active="tasks"` |
| View toggle | List view / Board view (board groups by priority) |
| Filter preset bar | 5 chips: Today / Upcoming / Overdue / Done / All |
| Assignee filter | `asgFilter`: Me / All / per-team-member — dropdown |
| Object-type filter | `typeFilter`: Contact / Lead / Company / Deal / (none) — dropdown |
| Quick-add bar | Single-line text input + priority picker + due date + "Add" — creates task without opening modal |
| Task row (list view) | Checkbox · title · contact/deal chip · priority badge · due date · assignee avatar · subtask count · action menu |
| Board columns (board view) | 3 columns: Low / Medium / High priority — task cards draggable between columns |
| Board card | Checkbox · title · record chip · due date · assignee avatar |
| Bulk select | Checkbox in header row — selects all visible; bulk action bar appears |
| Bulk action bar | Complete / Reassign / Reschedule / Delete |
| Saved task views | Named views (same Om-style views used across other modules) |
| Empty state | Per-preset message: "Nothing due today." / "No overdue tasks — nice." etc. |

### Filter presets

| Preset | Filter logic |
|---|---|
| Today | `isToday(task.date)` |
| Upcoming | `task.date > today && !task.done` |
| Overdue | `task.date < today && !task.done` |
| Done | `task.done === true` |
| All | No date filter |

### Priority constants

| Value | Label | Color |
|---|---|---|
| `Low` | Low | `#64748b` (slate) |
| `Medium` | Medium | `#60a5fa` (blue) |
| `High` | High | `#f87171` (red) |

Defined in `CAL_TASK_PRIORITY` (array) and `CAL_PRIORITY_C` (color map). Tasks share `CalendarContext.items` — tasks are events with `type: 'task'`.

---

### Design decisions

| Decision | Alternative | Why this | Tradeoff |
|---|---|---|---|
| Tasks stored in `CalendarContext.items` as events with `type: 'task'` | Separate tasks context / separate backend table | One context = one `addItem` / `updateItem` path; tasks show on the calendar as blocked time automatically | A single items array mixes calendar events + tasks + meetings; sorting and filtering tasks requires `items.filter(i => i.type === 'task')` on every render; a large calendar + task set makes `CalendarContext` a performance bottleneck |
| Board view groups by priority (Low/Medium/High columns) | Board grouped by due date, assignee, or linked object | Priority is the most common "what should I work on next?" grouping for tasks; rep needs to see their High pile | Can't see at a glance which tasks are due today vs next week in the board view — need to flip to list + "Today" filter for that context |
| Quick-add bar (single-line inline add) | Always open full modal for task creation | 80% of tasks are created from a title + priority + date — typing inline and pressing Enter is 5× faster than a modal | Quick-add bar skips subtasks, reminders, and record linking — those require reopening the task in the full `TaskFormModal`; reps often skip linking tasks to records when using quick-add, creating orphan tasks |
| Object-type filter shows Contact / Lead / Company / Deal | Single "All records" dropdown with search | Reps work by object type — "show me all tasks linked to a Contact" is a daily workflow; filtering by type narrows the list without needing to remember record names | Filter is type-only, not record-name search; a rep with 200 contacts can't filter to tasks for "Acme Corp" without navigating to the Acme Company detail page and using `RecordTasks` there |

---

### Frontend — what needs to be built

- `TasksPage` state: `view` (list/board), `preset` (today/upcoming/overdue/done/all), `asgFilter`, `typeFilter`, `selected` (Set of ids for bulk), `bulkOpen`
- `taskFilter(items, preset, asgFilter, typeFilter)` — pure function; composes all filters; input = `CalendarContext.items.filter(i => i.type === 'task')`
- `TaskRow({ task, onCheck, onEdit, onDelete })` — list-view row
- `TaskBoardColumn({ priority, tasks })` — board column; drag-and-drop via `react-dnd` or `dnd-kit`
- Quick-add bar: `newTitle`, `newPriority`, `newDate` state; `onAdd` calls `CalendarContext.addItem` with `type: 'task'`
- Bulk actions: `BULK_ACTIONS = ['Complete', 'Reassign', 'Reschedule', 'Delete']`; each maps to a `CalendarContext` mutation
- Saved views: `useSavedViews('tasks')` hook — same pattern as contacts/deals; save current filter set by name + scope

### Backend — what needs to be provided

- `GET /tasks?assignee=&type=&status=&due_before=&due_after=&page=` → paginated task list
- `POST /tasks { title, priority, dueDate, hasTime, reminder, emailReminder, assigneeId, relType, relRecordId, dealId, notes, subtasks }` → create task
- `PATCH /tasks/:id { done, priority, dueDate, assigneeId, ... }` → update task
- `DELETE /tasks/:id` → soft-delete
- `POST /tasks/bulk { ids, action, payload }` → bulk complete / reassign / reschedule / delete
- Tasks should index on `(assigneeId, dueDate, done)` — the most common filter combination
- Overdue count: `GET /tasks/counts` → `{ today: 5, upcoming: 12, overdue: 3 }` for sidebar badge

---

## 18.2 Task Form Modal (`TaskFormModal`)

_Lines 17571–17810 — opened from task row action menu, quick-add "expand," or `RecordTasks`_

### Surface inventory

| Field | Type | Notes |
|---|---|---|
| Title | Text | Required |
| Priority | Segmented control | Low / Medium / High; default from workspace settings |
| Due date | Date picker | |
| Has time | Toggle | Reveals time picker when on |
| Reminder | Dropdown | 5 min / 15 min / 30 min / 1 hr / 1 day / none — `CAL_REMIND` |
| Email reminder | Toggle | Sends email N minutes before `dueDate` |
| Assignee | User dropdown | Team member picker; default = logged-in user |
| Related record type | Dropdown | Contact / Lead / Company / Deal / (none) |
| Related record | Search dropdown | Populated from `CrmDataContext` once type selected |
| Deal | Dropdown | Optional deal link (separate from related record) |
| Notes | Textarea | Plain text |
| Done | Checkbox | Mark complete from within form |
| Subtasks | List | Add / edit title / check off / delete each subtask inline |

### Subtask model

```
subtask: {
  id: number,
  title: string,
  done: boolean
}
```

Subtasks are stored as a `subtasks[]` array inside the parent task. They don't have their own due dates, assignees, or reminders — they are simple title + done only.

### `CAL_REMIND` — reminder options

`[5, 15, 30, 60, 1440]` (minutes). Rendered as: "5 min before", "15 min before", "30 min before", "1 hr before", "1 day before."

---

### Design decisions

| Decision | Alternative | Why this | Tradeoff |
|---|---|---|---|
| Subtasks as flat array inside the parent task | Subtasks as independent task records linked by `parentId` | Simple: no additional API calls to create/delete subtasks; they save atomically with the parent | Subtasks can't have their own due dates, priorities, or assignees; they can't appear in the main task list or be assigned to someone else; for complex projects the flat model breaks down |
| Separate "Related record" + "Deal" fields | Single "Link to CRM record" picker (contacts, deals, companies all in one) | A task is almost always linked to both a contact AND a deal simultaneously; keeping them as separate fields avoids a "pick one" constraint | Two separate link fields mean a task can be linked to a contact + a deal, but not to a company independently of a contact; company-linked tasks require workarounds |
| Reminder stored as a number (minutes before) | Absolute datetime reminder | Relative reminders survive due-date changes automatically — change the due date and the reminder fires N minutes before the new date | User can't say "remind me at 9:00 AM regardless of when the task is due" — there's no absolute-time reminder option |

---

### Frontend — what needs to be built

- `TaskFormModal({ task?, defaults?, onSave, close })` — create OR edit depending on whether `task` is passed
- `useTaskForm(task, defaults)` — manages all field state; initializes from `task` or `defaults`
- `SubtaskList({ subtasks, onChange })` — inline add/edit/delete; each subtask has its own input that commits on blur/enter
- Record search: `relType` selection triggers filtered dropdown: `contacts.filter(...)` / `leads.filter(...)` etc. from `CrmDataContext`
- `defaults` from `SettingsTasksPage`: reminder default, emailReminder default, priority default, assignee default, due date offset

### Backend — what needs to be provided

- `POST /tasks` — create task with `subtasks[]` in body; backend stores subtasks inline (JSONB column or separate subtask rows)
- `PATCH /tasks/:id/subtasks/:sid` — toggle subtask done (if stored as rows)
- Task–record links: `relType` + `relRecordId` → store as polymorphic FK (`rel_type: 'contact'|'lead'|'company'`, `rel_record_id: uuid`)
- Reminder: schedule a reminder job at `dueDate - reminder minutes`; fire email (`emailReminder=true`) and/or push notification
- `GET /users` for assignee dropdown (team member list)

---

## 18.3 Record Tasks (`RecordTasks`)

_Lines 7103–7145 — embedded in Contact, Deal, Lead, Company, and Custom Object detail pages_

### Surface inventory

| Element | What it is |
|---|---|
| Task count badge | `{tasks.length}` tasks linked to this record |
| Task list | Task rows: checkbox + title + priority badge + due date + assignee avatar |
| "Add task" button | Opens `TaskFormModal` pre-linked to current record |
| Empty state | "No tasks yet — add one." |
| Done strikethrough | `task.done` → title gets `line-through` |
| Quick-complete | Checkbox toggle on each row completes without opening modal |

`RecordTasks` reads from `CalendarContext.items.filter(i => i.type === 'task' && i.relType === recordType && i.relRecordId === recordId)`.

Creating or completing a task here also logs an entry ("Task created" / "Task completed") to the record's activity timeline via an `onLog` callback. That callback routes into the shared `CrmDataContext` activity store (`crm.addActivity(recordType, recordId, …)`), so the logged entry is keyed to the record and **persists across navigation** — leave the record and come back and the task's timeline entry is still there.

---

### Design decisions

| Decision | Alternative | Why this | Tradeoff |
|---|---|---|---|
| `RecordTasks` reads from `CalendarContext` directly (no local state) | `RecordTasks` fetches tasks from a prop passed by the parent | Any task created from the `TasksPage` or another record immediately appears in `RecordTasks` — context is the single source of truth | `RecordTasks` re-renders whenever ANY item in `CalendarContext` changes (new meeting, new task for any record); in a large org with many concurrent updates this could be slow without `React.memo` or selector memoization |
| Pre-linking when opened from a record | User manually selects the linked record | Reduces friction — "Add task from deal page" means the task is obviously linked to that deal; no need to search for "Acme deal" | Record-pre-linked tasks can't easily be moved to a different record; the form doesn't clearly show which record it'll link to when opened from a detail page — the "Related record" fields should be pre-populated AND visibly locked |

---

### Frontend — what needs to be built

- `RecordTasks({ recordType, recordId })` — reads from `CalendarContext`; filtered view
- `recordTasks` = `useMemo(() => items.filter(i => i.type === 'task' && i.relType === recordType && i.relRecordId === recordId), [items, recordType, recordId])` — must be memoized
- Quick-complete: inline checkbox calls `updateItem(task.id, { done: !task.done })`
- Open `TaskFormModal` with `defaults={{ relType: recordType, relRecordId: recordId }}`

### Backend — what needs to be provided

- `GET /records/:type/:id/tasks` → tasks linked to a specific record (used for initial load in production; prototype reads from context)

---

## 18.4 Settings — Tasks Defaults (`SettingsTasksPage`)

_Lines 15364–15390_

### Surface inventory

| Setting | Type | Notes |
|---|---|---|
| Default reminder | Dropdown | Same `CAL_REMIND` options |
| Default email reminders | Toggle | On = always send email reminder by default |
| Default priority | Segmented control | Low / Medium / High |
| Default assignee | Dropdown | Me / any team member |
| Default due date | Dropdown | None / Today / Tomorrow / In 3 days / In 1 week |

These defaults populate `TaskFormModal` when creating a new task. A rep who always assigns tasks to themselves at Medium priority + 1-day due date never needs to touch those fields.

---

### Design decisions

| Decision | Alternative | Why this | Tradeoff |
|---|---|---|---|
| Workspace-level task defaults | Per-user task defaults | All reps get a consistent starting point; admin can enforce "default assignee = me" for team accountability | Individual reps can't override the workspace default in the prototype — there's no per-user task preference layer; a rep who always uses Low priority can't change their personal default |

---

### Frontend — what needs to be built

- `SettingsTasksPage` — form with 5 settings; reads from and writes to workspace settings store
- Defaults passed into `TaskFormModal` via `defaults` prop at call site

### Backend — what needs to be provided

- `GET /settings/tasks` → current task defaults for workspace
- `PATCH /settings/tasks { defaultReminder, defaultEmailReminders, defaultPriority, defaultAssignee, defaultDueDateOffset }` → save

---

## Developer Q&A

**Q: Tasks are stored in `CalendarContext.items` as events with `type: 'task'`. What's the risk of mixing tasks and calendar events in one array?**
A: Two risks. First, performance: `CalendarContext` must be subscribed to by both `CalendarPage` (for calendar rendering) and `TasksPage` (for task list); every new meeting creates a `CalendarContext` update which re-runs the task filter unnecessarily. Fix: split into `CalendarContext` (events only) + `TaskContext` (tasks only). Second, schema mismatch: calendar events have `startTime`, `endTime`, `attendees`, `eventType`; tasks have `relType`, `relRecordId`, `subtasks`, `emailReminder`. A single items array must accommodate both schemas, creating a wide, sparse object shape. Production should store tasks in a separate table.

**Q: The board view groups tasks by priority. Can a rep drag a task from Medium to High to change its priority?**
A: The prototype renders board columns per priority but drag-and-drop is a stub — the board column cards are rendered, not wired to DnD. A drop event should call `CalendarContext.updateItem(task.id, { priority: targetColumn })`. Production needs: (a) a DnD library (`dnd-kit` is recommended for React); (b) optimistic UI — update the item in context immediately, then `PATCH /tasks/:id` in the background; (c) rollback on API failure.

**Q: The quick-add bar creates a task without a linked record. How are those tasks found later?**
A: They appear in `TasksPage` with all filters, but they won't appear in any `RecordTasks` panel since `relRecordId` is null. In the "All" preset they're listed as orphan tasks — title + priority + date but no record chip. The rep sees them in the task list but may not remember which contact or deal they're for. Fix: (a) encourage record linking in the quick-add bar by showing a "Link to..." field even inline; (b) add a "No record" filter option to specifically find orphan tasks.

**Q: `RecordTasks` filters `CalendarContext.items` with `relType === recordType && relRecordId === recordId`. What happens if a task is linked to both a contact and a deal?**
A: The current model stores one `relType` + `relRecordId` pair per task (plus an optional separate `dealId`). So a task linked to a contact shows up in `RecordTasks` on the Contact detail page; the deal link (`dealId`) is separate and currently NOT used to surface the task on the Deal detail page's `RecordTasks`. The Deal's `RecordTasks` would miss it unless the link checks `task.dealId === dealId` as an OR condition. Production must: either check both `relRecordId` and `dealId` in the filter, or normalize to a proper task_links junction table.

**Q: Task subtasks are stored inline (flat array) with no backend rows of their own. What's the migration path if subtasks need assignees or due dates later?**
A: Promote subtasks to first-class tasks with `parentId`. Migration: (a) read all tasks with `subtasks[]`; (b) for each subtask, `INSERT INTO tasks (title, done, parentId, workspaceId, ...)`; (c) drop the `subtasks` JSONB column. The UI changes: subtasks appear as indented child rows in the task list, not just inside the parent modal. This is a breaking schema change — plan for it early if complex project management is a roadmap item.

**Q: The task form has both "Related record" (any CRM record) and "Deal" (deal only) fields. Why two fields?**
A: The design intent: a task is usually about an activity with a person (the contact/lead) that moves a deal forward. "Call John Smith about renewal" — related record = John Smith (contact), deal = Q3 Renewal (deal). Both are independently navigable. The separation lets the rep navigate to the deal from the task AND to the contact from the task without one overriding the other. The tradeoff: it's confusing — why isn't "Deal" just a type in the "Related record" dropdown? The answer is that deals are considered a secondary link (most tasks are person-centric), so they get a dedicated slot rather than competing with contact/lead/company in a single picker.
