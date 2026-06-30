# Module 11 — Sequences

_List: `SettingsSequencesPage` (line 17328) · Builder: `SequenceBuilderPage` (line 15726, shared by all 4 channels)_

---

## 11.1 Sequences List

### Surface inventory

| Element | What it is |
|---|---|
| Page header | "Sequences · Automated SMS & email drip campaigns" |
| Channel tab bar | SMS / Email / Push / In-app — top-right of header; resets sub-view to list on change |
| New sequence button | Opens `NewSequenceModal` for the active channel; admin-only |
| Read-only banner | "Sequences are shared workspace assets." — shown to non-admins |
| Tip callout | "Trigger a sequence from a workflow using Enroll in sequence" — links to Automations |
| 3-stat cards | SMS: Active sequences · Messages sent · Reply rate. Email: Active sequences · Emails sent · Open rate |
| Sequence row card | Name + status badge · step count · channel · last run · per-channel stats · active/paused toggle · Move to folder · Edit · Enrolled · Engagement |
| In-flight progress bar | Step-by-step enrollment bar: each segment's opacity scales with how many contacts are at that step |
| Enrolled button | Opens `EnrolledContactsModal` (same component as Module 10.5) |
| Engagement button | Opens `EngagementModal` (same component as Module 10.6) |
| FolderedCards (SMS + Email) | Drag-and-drop folder grouping; pre-seeded folders: Onboarding · Re-engagement · Sales follow-up |
| PushInAppSeqList (Push + In-app) | Same row renderer, no folder support |
| SMS templates sub-view | List/Templates toggle for SMS; shows `SMS_TEMPLATES` with Edit + Use actions |
| Email templates sub-view | Toggle to `EmailTemplatesPanel` |

### Per-channel stats shown in row card

| Channel | Stats columns |
|---|---|
| SMS | Sent · Replied |
| Email | Sent · Opened · Replied |
| Push | Sent · Opened · Clicked |
| In-app | Sent · Opened · Clicked |

### In-flight step bar

The `atStep[]` array on each sequence record holds the count of contacts currently at each step. The bar renders one segment per step; segment opacity = `0.3 + (count/maxStep) * 0.6`, capped at `0.95`. An empty step goes nearly transparent; a fully-loaded step glows at full brand purple. The "active in flight" number is the sum of `atStep`.

### Folder system (`FolderedCards` + `useFolders`)

SMS and Email sequences support drag-and-drop folder organization. `useFolders('seq-sms', config)` manages folder state (create/rename/delete/reorder folders; assign items). Items can be dragged onto folder headers. `MoveToFolderButton` on each row opens a dropdown folder picker. Push and In-app have no folder support — they use the simpler `PushInAppSeqList`.

---

### Design decisions

| Decision | Alternative | Why this | Tradeoff |
|---|---|---|---|
| Channel tabs at the top, not channel icons on each row | One flat list with channel filter | Each channel has meaningfully different stats (SMS has reply rate; email has open rate); separate tabs give each channel its own stat card context | Switching channel loses the current scroll position; users with mixed SMS + email need to jump tabs to compare |
| Folder support for SMS + Email only, not Push/In-app | Folders for all channels | SMS and Email tend to have many more sequences; Push and In-app are simpler use cases with fewer | Inconsistent UI — Push/In-app users can't organize once they have many sequences |
| In-flight step bar as opacity gradient | Numeric table of enrollments per step | Visual heat map is faster to read — you see which step contacts are clustering at without parsing numbers | Does not show absolute counts without hovering; users must open Enrolled modal for exact numbers |
| Enrolled and Engagement as separate modals, not a combined view | Unified view with tabs | Clean separation of concerns: Enrolled = who is where now (operational); Engagement = how the messages performed (analytical) | Two button clicks to see both; harder to correlate "who is at step 3" with "step 3 open rate" in one view |

---

### Frontend — what needs to be built

- Channel tab group in `AppTopbar rightSlot` with per-channel icon + label
- `useFolders(surface, config)` hook: folder CRUD + item membership + drag-drop state
- `FolderedCards` component: renders folder accordions + item list; handles drag-start/end per surface key
- `MoveToFolderButton`: small dropdown to assign item to a folder
- `seqRow` renderer: shared by all 4 channels; conditionally shows Opened/Clicked based on channel
- In-flight step bar: `atStep[]` → flex segments with opacity scale
- Channel-aware stat cards: SMS (sent/reply), Email (sent/open), Push/In-app (sent/open/click)
- Sub-view toggle (list vs templates) — SMS and Email only

### Backend — what needs to be provided

- `GET /sequences?channel=sms|email|push|inapp` — list with stats, atStep[], status, lastRun
- `PATCH /sequences/:id/status` — activate / pause
- `GET /sequences/:id/enrollments` → `EnrolledContactsModal` (see 10.5)
- `GET /sequences/:id/engagement` → `EngagementModal` (see 10.6)
- Folder API: `POST /folders`, `PATCH /folders/:id`, `DELETE /folders/:id`, `PATCH /sequences/:id/folder`
- Real-time `atStep[]` updates: contacts move through steps as delays expire — requires a background job per enrolled contact

---

## 11.2 SMS Sequence Builder

_Route: `sms-sequence-builder` · Component: `SequenceBuilderPage` channel="sms" (line 15726)_

### Surface inventory

| Element | What it is |
|---|---|
| Breadcrumb | "← Sequences › SMS Sequences › {name}" |
| Inline name edit | Editable input in breadcrumb |
| Active toggle | admin-only; in header |
| Performance / Test / Cancel / Save as draft / Save | Header action buttons |
| Twilio connection banner | Amber warning if SMS provider not connected; links to Integrations |
| From number picker | Select box for Twilio number; only shown for SMS |
| Channel badge | "SMS drip sequence · N messages" |
| Suppression callout | Reminds user that suppressed contacts are automatically skipped |
| Trigger tile | `NodeTile` eyebrow="Trigger"; click opens trigger drawer |
| SeqSpineAdd (+) | Small "+" button between nodes; inserts a step at that position |
| Wait tile | `NodeTile` accent amber/clock; between every pair of steps; click opens wait drawer |
| Step tile (SMS message N) | `NodeTile` accent green/#34d399; shows message body preview; click opens step drawer; delete button if >1 step; "· A/B" appended if test is on |
| Trigger drawer | Side panel: trigger type selector (8 types) + type-specific config + re-enroll toggle + limit toggle + audience conditions |
| Wait drawer | Side panel: `DelayPicker` (n + unit) + send-time selector |
| SMS step drawer | Side panel: merge-tag bar ({{first_name}} etc.) + textarea + character counter + SMS preview + `SeqABPanel` |
| Exit conditions section | Grouped into Automatic exits (reply/keyword/unsub/books) and Custom exits; add/edit inline; keyword chip editor |
| Settings panel (SMS sidebar) | Quiet hours toggle · Bounce suppression toggle · Link tracking toggle · Frequency cap input |

### Trigger types

| Key | Label |
|---|---|
| `contact-added` | Contact added |
| `deal-stage` | Deal stage changes (from → to stage) |
| `tag-applied` | Tag applied (tag picker) |
| `smart-list` | Smart list membership (enters/exits + list picker) |
| `form-submitted` | Form submitted (form picker) |
| `lead-created` | Lead created |
| `manual` | Manually enrolled |
| `date-based` | Date-based (date field + offset: before/after) |

### Exit conditions (SMS)

| Condition | Automatic |
|---|---|
| Contact replies | Yes |
| Replies with a keyword (STOP/UNSUBSCRIBE etc.) | Yes |
| Contact clicks the SMS link | No |
| Contact books a meeting | Yes |
| Contact unsubscribes | Yes |
| Becomes a customer | No |
| Enters another sequence | No |
| Deal stage changes | No |
| A field changes | No |
| Goal met | No |
| Manually removed | No |
| Bounced / undeliverable | No |

**Compliance keywords** — STOP and UNSUBSCRIBE cannot be removed from the keyword list. Other keywords can be added/removed.

### Exit actions (on any exit condition)

Mark sequence complete · Move to another sequence · Change status · Notify owner/rep · Add tag · Add to suppression list · Create task · Remove from all sequences

Multiple actions can be selected per exit condition. They are rendered as chips with a sentence summary: "contact replies → mark complete + add to suppression".

### Settings sidebar (SMS-only layout)

The SMS builder uses a 2-column layout: sequence spine on the left, settings panel on the right. The settings panel has 4 controls:
- **Quiet hours** — don't send between 9pm and 8am (toggle)
- **Bounce suppression** — auto-add undeliverable numbers to suppression list (toggle)
- **Link tracking** — wrap all links for per-click attribution (toggle)
- **Frequency cap** — max messages to a contact per day (number input)

---

### Design decisions

| Decision | Alternative | Why this | Tradeoff |
|---|---|---|---|
| Side drawer for step editing (not inline on the card) | Inline textarea on each card | Keeps the spine clean and scannable; editing one step at a time avoids accidental edits to adjacent steps; drawer has space for merge tags, preview, A/B panel | Requires an extra click to edit; advanced users who want to scan all messages at once must open/close each drawer |
| `SeqSpineAdd` (+) between every node | "Add step" button only at the bottom | Insert at any position is common for editing mid-sequence ("add a follow-up between step 2 and 3"); bottom-only forces drag-to-reorder | Small target (24px circle) is easy to miss on mobile |
| Two drawer types: step drawer and wait drawer | Single unified drawer | Trigger/step/wait have very different forms; combining them would require complex conditional rendering and a confusing UI | Two separate drawer types means different UX for wait vs step — users need to learn both |
| Re-enroll toggle on trigger (not buried in settings) | Re-enroll in a separate Settings page | Re-enrollment policy is trigger-dependent: a "tag applied" sequence may need re-enroll when tag is re-applied; it belongs next to the trigger config | Users may not find it if they don't open the trigger drawer |
| Compliance keywords (STOP/UNSUBSCRIBE) are locked | Allow removal | Regulatory requirement: carriers mandate these opt-out keywords; removing them would create legal liability | Locked keywords in a chip list look inconsistent with removable ones — needs a visual explanation |

---

### Frontend — what needs to be built

- `NodeTile` component (shared with Automation Builder)
- `SeqSpineAdd` — positioned between nodes in the flex column
- Trigger drawer with 8 conditional sub-forms (deal-stage = from/to pickers; date-based = field + offset; smart-list = list + enters/exits; etc.)
- Wait drawer: `DelayPicker` + send-time `<select>` from `SEQ_TIMES`
- SMS step drawer: merge-tag insert buttons + textarea + character/segment counter + SMS phone preview + `SeqABPanel`
- Keyword chip editor: `kwDraft` input + Enter to add + × to remove (locked chips for compliance keywords)
- Exit conditions: grouped by auto/custom; add/edit opens `stopEdit` drawer; save validates at least one action selected
- Settings sidebar column: 4 toggles/inputs; only rendered when `isSms`
- From number picker: `TWILIO_NUMBERS` select; only rendered when `isSms`
- Twilio banner: reads `isConnected` state; links to Integrations

### Backend — what needs to be provided

- `POST /sequences` + `PUT /sequences/:id` — full sequence save (trigger, steps, stopRules, settings)
- Steps: ordered array with `{ body, delay: {n, unit}, sendTime, ab? }`
- Trigger config: `{ type, tag?, form?, fromStage?, toStage?, smartList?, slEvent?, dateField?, offset?, reenroll, limitOn, limit, conds[] }`
- Exit rules: `{ cond, keywords?, stage?, field?, value?, goal?, actions[], moveSeq?, status?, tag? }`
- Sending: SMS runner reads steps in order, waits `delay` + respects `sendTime` + `quietHours`; exits on any matching `stopRule`
- Twilio integration: `GET /integrations/twilio/numbers` for number picker; webhook receiver for STOP keyword handling
- Link wrapping: wrap every URL in the body before send; `GET /r/:token` → redirect + record click on contact

---

## 11.3 Email Sequence Builder

_Route: `email-sequence-builder` · Component: `SequenceBuilderPage` channel="email"_

### Differences from SMS builder

| Element | Email-specific behaviour |
|---|---|
| Channel accent color | Brand purple `#818cf8` (vs green for SMS) |
| Step tile label | "Email N" |
| Step drawer | Subject line input + rich text / textarea body + `SeqABPanel` (test variable: subject / content / both) |
| Wait tile | `DelayPicker` + send-time selector (both shown; email send time matters more than SMS) |
| Settings sidebar | No 2-column layout; settings are in a collapsible section below exit conditions |
| Link tracking | Same toggle; email links are wrapped for open-pixel + click tracking |
| Exit condition: "Contact clicks a link" | Available (email links are trackable) |
| Exit condition: "Replies with keyword" | NOT available (email replies are full-text; no keyword extraction) |
| A/B test variables | Subject line / Content / Subject + Content (3 options; SMS only has "Message text") |
| A/B winner metric | Opens / Clicks / Replies (email); SMS only has Clicks / Replies |
| Bounce suppression | Same toggle; adds hard-bounce addresses to suppression list |
| Quiet hours | Same toggle |

### Exit conditions — email vs SMS

Email lacks the `replyKeyword` condition (SMS-only compliance requirement). It gains no unique conditions over SMS; the full list otherwise matches.

---

### Design decisions

| Decision | Alternative | Why this | Tradeoff |
|---|---|---|---|
| Subject line + body in the step drawer | Full visual email builder inline | The sequence builder is a flow editor, not a design tool; simple subject + body is enough for drip sequences; the Email Builder (Module 12.2) handles designed emails | Users who want branded HTML emails in their sequence must use a template from the Email Builder — two separate tools for one use case |
| A/B test variable "both" (subject + content) | Separate A/B tests per variant | Testing both at once gives a stronger signal on the full message variant, not just one element | Conflating subject and content changes makes it impossible to know which change drove the result |
| Send-time picker on wait tile (email only) | Fixed-time scheduling at the sequence level | Email open rates vary by time of day; per-step send time lets you send a "re-engage" email at 9am Tuesday and a "case study" email at 2pm Thursday | Per-step send times are confusing: the contact receives "Email 3" at 9am even if they enrolled at midnight and the delay expired at 2am — the next send-time is the next eligible window, not exactly delay + send-time |

---

### Frontend — what needs to be built

All the same as SMS, plus:
- Subject line input in step drawer (conditionally hidden for SMS)
- `A/B variable` dropdown in `SeqABPanel` with `[['subject', 'Subject line'], ['content', 'Content'], ['both', 'Subject + Content']]` (email only)
- Winner metric adds `opens` option (email + push; not SMS)

### Backend — what needs to be provided

- Same as SMS; `steps[]` items include `subject` field for email
- Email provider integration (Mailgun/SendGrid/SES) for actual send
- Open tracking: inject 1×1 pixel per recipient
- Click tracking: wrap links with unique per-recipient URLs

---

## 11.4 Push Sequence Builder

_Route: `push-sequence-builder` · Component: `SequenceBuilderPage` channel="push"_

### Differences from SMS/Email builders

| Element | Push-specific behaviour |
|---|---|
| Channel accent color | Pink `#f472b6` |
| Step tile label | "Push N" |
| Step drawer | Title input + Short body textarea + Action URL input + optional image URL |
| A/B test variable | Content only (no subject line concept) |
| A/B winner metric | Opens / Clicks / Replies |
| From number picker | Not shown (no phone number concept) |
| Twilio banner | Not shown |
| Layout | Single-column (no settings sidebar column) |
| Seed steps | Generated by `seqSeedSteps('push')` |

Push notifications have a title + short body + action URL (where the tap goes). There's no "from" identity — they come from the app/workspace.

---

### Design decisions

| Decision | Alternative | Why this | Tradeoff |
|---|---|---|---|
| Same builder component as SMS/Email | Separate PushBuilderPage | Code reuse; the core flow (trigger → steps → exits) is identical; only the step form differs | Channel-specific concepts (title, action URL, image) are crammed into a generic step drawer; the drawer doesn't look push-native |
| Action URL per step | Single CTA URL at the sequence level | Each push notification in a sequence might link to a different screen (step 1 → onboarding, step 3 → upgrade page) | Users can accidentally leave the action URL blank; blank URL causes a push that taps to nowhere |

---

### Frontend — what needs to be built

- Push step drawer: Title input + Body textarea + Action URL input + Image URL input
- `seqSeedSteps('push')` for default starting steps
- Accent color `#f472b6` applied to step node tiles

### Backend — what needs to be provided

- Push provider integration (FCM for Android, APNs for iOS, or a service like OneSignal)
- Device token management: `GET /contacts/:id/push-tokens`
- Send API: `POST /push/send { token, title, body, url, imageUrl }`

---

## 11.5 In-app Sequence Builder

_Route: `inapp-sequence-builder` · Component: `SequenceBuilderPage` channel="inapp"_

### Differences from Push builder

| Element | In-app specific behaviour |
|---|---|
| Channel accent color | Amber `#fbbf24` |
| Step tile label | "In-app N" |
| Step drawer | Style picker (banner / modal / tooltip / slide-in) + Title + Body + CTA button label + CTA URL |
| A/B test | Same as Push |
| Recipient context | In-app messages show inside the product to logged-in users only — no need for device tokens |

In-app messages are shown inside the nrtur product UI itself (or embedded in the customer's app via SDK). They are different from push notifications which appear in the OS notification tray.

---

### Design decisions

| Decision | Alternative | Why this | Tradeoff |
|---|---|---|---|
| Style picker (banner/modal/tooltip/slide-in) in the step drawer | One fixed in-app message style | Different moments need different visual weight: onboarding = modal; feature announcement = banner; contextual tip = tooltip | The style preview in the drawer is limited; users must imagine what it looks like in the real product |
| In-app sequences separate from push | Combined "notification" channel | In-app messages require the user to be logged in; push reaches users outside the app. Mixing them conflates two different delivery mechanisms | Two separate builders and sequence lists for channels that are conceptually similar to the user |

---

### Frontend — what needs to be built

- In-app step drawer: style picker (4 options) + Title + Body + CTA label + CTA URL
- `seqSeedSteps('inapp')` for default steps
- Accent color `#fbbf24`

### Backend — what needs to be provided

- In-app delivery API or SDK integration (e.g. Intercom-style product messaging)
- `GET /contacts/:id/sessions` to check if contact is currently active (live delivery)
- Impression tracking: record shown/opened/clicked per in-app message per contact

---

## 11.6 A/B Step Panel (`SeqABPanel`)

_Component: `SeqABPanel` (line 15642) · Used in all 4 channel step drawers_

### Surface inventory

| Element | What it is |
|---|---|
| Section header | "A/B test · Split-test this message, auto-send the winner." + toggle |
| Toggle | Enables/disables A/B for this specific step |
| Test variable selector | Email: Subject line / Content / Subject + Content. SMS/Push/In-app: Content only |
| Variant tabs | A, B, C, D — up to 4 variants; color-coded (purple/green/amber/cyan) |
| Add variant button | Adds next variant (up to 4 max); disabled at 4 |
| Remove variant button (×) | Per-tab; disabled when only 2 variants remain (minimum) |
| Variant form | Subject input (if testing subject) + Body/Content textarea (if testing content) |
| Test audience slider | 10–100% in 10% steps; defaults to 50% |
| Per-variant % label | `testPct / n` rounded — shown dynamically |
| Hold-back explanation | "Test on N%, send winner to remaining M%" |
| Pick winner by | Email: Opens / Clicks / Replies. SMS/Push/In-app: Clicks / Replies |
| Test window | Number input (1-9) + hours/days selector |
| Winner description | "After N days, the variant with the most opens wins and is sent automatically" |
| View test results button | Opens `ABResultsModal` |

### How the A/B split works

If audience = 50% and variants = 2: 25% gets Variant A, 25% gets Variant B. After the test window, the winner is auto-sent to the remaining 50%. If audience = 100%, the full audience is split — there is no hold-back; all contacts receive a variant and the winning variant is labeled retroactively.

### State model

`ab` object lives on the step: `{ on, variable, variants: [{id, subject, body}], testPct, winnerBy, windowN, windowUnit }`. `blankAB(draft, isSms)` initialises with Variant A = draft body/subject, Variant B = empty, testPct=50, winnerBy='opens'/'clicks', windowN=2, windowUnit='days'.

---

### Design decisions

| Decision | Alternative | Why this | Tradeoff |
|---|---|---|---|
| A/B per step, not per sequence | One A/B test at the sequence level | A/B on a specific step (e.g. step 3 follow-up) is more actionable; you test the message, not the whole sequence | Users may enable A/B on every step, which makes sequence performance analysis extremely complex — many concurrent tests |
| Up to 4 variants | 2 only | Some teams test A/B/C/D; 4 gives room for meaningful variation | With 4 variants and 50% test audience, each variant gets only 12.5% — too small a sample for statistical significance at typical list sizes |
| Auto-send winner (no manual review) | Manual winner selection | Saves operational overhead; the whole point of A/B in drip is to auto-optimize without human intervention | If the system picks a winner based on early noise (24-hour window), a misleading result is automatically scaled up |
| Test window in hours/days only | Minutes or weeks | Hours/days covers the practical range for drip sequences; minutes is too short for opens (email takes time to be checked); weeks is longer than most sequences | A 5-step sequence with 3-day delays can't have a 7-day A/B window per step — it would exceed the inter-step delay |

---

### Frontend — what needs to be built

- Toggle gates the entire A/B panel visibility
- `blankAB(draft, isSms)` initializer — seeds Variant A from the current step content
- Variant tab system: color array `['#818cf8','#34d399','#fbbf24','#22d3ee']`; selected tab renders its form
- Add/remove variant logic with ID re-assignment (A, B, C, D re-labeled after removal)
- Range slider for `testPct` with real-time "N% per variant / M% hold-back" calculation
- `VAR_OPTS` and `WIN_OPTS` differ by `isSms` flag
- "View test results" button → `setAbResults({step, isSms})` → `ABResultsModal`

### Backend — what needs to be provided

- `ab` object stored on each step in the sequence definition
- A/B runner: split enrolled contacts into N groups by `testPct / n` per variant at enroll time
- Track opens/clicks/replies per variant during `windowN windowUnit`
- After window closes: identify winner by `winnerBy` metric; enqueue winner messages to hold-back audience
- `GET /sequences/:id/steps/:stepId/ab-results` — variant metrics for `ABResultsModal`

---

## 11.7 A/B Results Modal (`ABResultsModal`)

_Component: `ABResultsModal` (line 15696)_

### Surface inventory

| Element | What it is |
|---|---|
| Header | "A/B test results · N variants · winner by {metric}" |
| Info banner | "Simulated results. Variant X won on {metric} and was auto-sent to remaining audience." |
| Variant cards | One card per variant; winner card has amber border + amber "Winner" trophy badge |
| Variant label | Letter (A/B/C/D) colored chip + subject (email) or body preview (SMS) |
| Metric bars | Horizontal bars per metric; winning metric highlighted in metric color; others dimmer |
| Bar values | `pct%` + absolute count beside each bar |
| Recipients line | "N recipients in test group" per variant |

### `AB_SEED` mock data

`AB_SEED.sent[i]` and `AB_SEED[metric][i]` provide simulated percentage values for each variant. `abWinnerIndex(ab)` computes the winner by comparing the `ab.winnerBy` metric values.

### Metrics shown

Email: Opens + Clicks + Replies. SMS/Push/In-app: Clicks + Replies. The winning metric column uses the metric's accent color; others use a dimmer version.

---

### Design decisions

| Decision | Alternative | Why this | Tradeoff |
|---|---|---|---|
| All metrics shown even when winner-by is only one | Show only winner metric | Seeing all metrics reveals if the "winner" by opens actually had worse clicks — a more complete picture | Showing losing metrics may confuse users who expect only one number to matter |
| "Simulated results" banner | No disclaimer | Prototype uses `AB_SEED` fake data; the banner prevents a user from trusting the numbers as real | In production, the banner should be removed and replaced with live data from the backend |
| Bar width = `min(pct * 1.8, 100)%` (1.8× multiplier) | Raw percentage as bar width | Open rates of 30–40% would look tiny if bars used raw percentages; the multiplier exaggerates bars for visual clarity | A 60% open rate renders as a "full" bar at 108%, capped to 100% — bars are illustrative, not mathematically precise |

---

### Frontend — what needs to be built

- `abWinnerIndex(ab)` function: find the variant index with the highest value for `ab.winnerBy` metric from `AB_SEED`
- Winner detection: `i === winIdx` applies amber border + trophy badge
- Metric bar: `width: min(pct * 1.8, 100)%`; winning metric column gets metric accent color; others white
- `VC[]` color array for variant IDs (A=purple, B=green, C=amber, D=cyan)
- `ReactDOM.createPortal` to `document.body` so the modal renders above the step drawer

### Backend — what needs to be provided

- `GET /sequences/:id/steps/:stepId/ab-results` returning `{ variants: [{id, subject?, body, metrics: {opens, clicks, replies}, sent}], winnerIndex, winnerBy }`
- Results should only be available after `windowN windowUnit` has elapsed; before that, show "Test in progress" state

---

## Developer Q&A

**Q: Why is there one `SequenceBuilderPage` for all 4 channels instead of 4 separate builder components?**
A: The core structure is identical across all channels: trigger → ordered steps with delays between them → exit conditions. Only the step form changes (subject line for email; title + action URL for push; style picker for in-app). Using one component with `channel` prop means exit conditions, trigger options, A/B logic, and the `SeqSpineAdd` insert mechanism all get fixed in one place. The cost: the component is dense with `isSms`, `isPush`, `isInApp`, `isEmailCh`, `isMsgX` flags — 5 booleans derived from one prop. If push and in-app diverge substantially in the future, splitting into separate components becomes the right call.

**Q: What happens if a contact is enrolled in two sequences at the same time? Is there any conflict resolution?**
A: No global conflict resolution exists. The exit condition `entersSeq` ("Contact enters another sequence") is available as a custom exit, but it's opt-in per sequence — a designer must explicitly add it. Without it, the contact receives messages from both sequences concurrently. In practice, this means a contact could get a "welcome" SMS and a "re-engagement" email in the same hour from two separate sequences. Production needs a workspace-level "max simultaneous sequences per contact" setting.

**Q: How does re-enrollment work — can a contact go through a sequence twice?**
A: The trigger drawer has `trig.reenroll` (toggle) and `trig.limitOn / trig.limit` (cap on enrollment count). When `reenroll` is false, the backend should track completed enrollments and skip contacts who already finished the sequence. When true, re-enrollment fires on every trigger. The `limit` pair (e.g. max 1 per 30 days) is configured in the UI but the time-window input is not shown in the current prototype — only the count cap is. Production must add the time-window field.

**Q: STOP and UNSUBSCRIBE are "locked" in the keyword list. Is the lock actually enforced?**
A: Only in the UI. `isComplianceKw(k)` returns true for those two keywords and the `×` remove button is not rendered. But `removeKeyword(k)` has no guard — if called programmatically it would remove them. The lock is purely a visual affordance. Backend must independently re-inject STOP/UNSUBSCRIBE into every outbound SMS regardless of what's in the keyword list, as carrier compliance is required server-side.

**Q: The `SeqSpineAdd` (+) button inserts steps between existing ones. How exactly does position insertion work?**
A: `insertStepAt(i)` splices the new step into `steps` at index `i` using `[...steps.slice(0, i), newStep, ...steps.slice(i)]`. The new step gets `delay: null` if `i === 0` (first step sends immediately on trigger) or `delay: {n:2, unit:'days'}` for any other position. The wait tile between steps is derived from the NEXT step's `delay` — not a separate state object. So when you insert step B between A and C, B carries a 2-day delay and the wait tile between B and C is B's next step's delay (C's existing delay, unchanged).

**Q: The step drawer edits a `draft` copy. What happens if the user opens a different step without saving?**
A: The draft is silently discarded. `openStep(s)` sets `draft = {...s}` and `activeNodeId = s.id`. If the user then clicks another step, `openStep` is called again, overwriting `draft` with the new step. No "unsaved changes" warning is shown. This is a UX gap: a user who edits step 1 and accidentally clicks step 2 loses all edits to step 1. The fix: check `dirty` on `openStep` and prompt to save or discard before switching.

**Q: How does `FolderedCards` know which sequence belongs to which folder? Where is that membership stored?**
A: `useFolders(surface, config)` manages a `members` map (`{ itemId: folderId }`). `config.members` seeds it (hardcoded in the prototype). `folderBeginItemDrag(surface, itemId)` tracks the drag source; dropping onto a folder header calls the folder API's `assignToFolder`. The `surface` key (`'seq-sms'`, `'seq-email'`) namespaces each folder set so SMS and email folders don't collide. In production, folder assignments and folder definitions must be persisted server-side per `surface`.

**Q: A/B testing on a step — what if the test window closes but the winning variant is only marginally better (noise vs signal)?**
A: `abWinnerIndex(ab)` picks the variant with the highest value on `ab.winnerBy` metric — no minimum sample size or statistical significance check. If Variant A has 31% opens and Variant B has 30% on 40 recipients each, Variant A "wins" and is sent to the remaining audience. This is a known weakness of all simple A/B winner-by-metric systems. Production should add a minimum sample size gate (e.g. reject winner declaration if per-variant recipients < 100) and ideally a p-value threshold.
