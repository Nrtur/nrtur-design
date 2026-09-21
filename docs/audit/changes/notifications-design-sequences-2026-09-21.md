# Change guide — 21 Sep 2026: notifications, buttons & onboarding, sequences

_One guide for the four commits landed on 2026-09-21. For each change: what you'll see, why it was done, where it lives in `index.html`, and how to check it yourself. Written so a developer, designer, or QA can trace any change back to a reason without reading the commits._

| Commit | Scope | One line |
|---|---|---|
| `918e733` | Notifications | One notification model: severity tokens, global strip, page notices, announcements, sidebar dots, live popups, a states page |
| `edde61c` | Design + onboarding + sidebar | Black/white buttons like nrtur.io, no green gradients, 4-step onboarding, hover-intent More/Quick add |
| `e1b8408` | Sequences | Real enrollment engine: scheduling, three-tier cancel, trace, plus the research doc |
| `9d1752c` | Sequences | Sequence-sent emails/SMS on the timeline with a chip that opens the exact message |

Everything below is in the single-file prototype (`index.html`). Nothing sends a real email or SMS; where something is simulated it says so.

---

## 1. Notifications (`918e733`)

### Why
The app had four unrelated ways of telling you something: bottom toasts, a bell drawer full of seeded rows, a few hand-rolled red/amber banners on individual pages (each with its own colours), and Billing's own status blocks. The owner asked for one consistent set of "use cases" — global dismissible notices, persistent "needs fix" notices, announcements, page-wise notices, red/amber/green severity, bottom toasts — designed first, then built.

### What changed, and the rule behind each piece

**Severity tokens** — `SEVERITY` / `sevStyle(kind)` (just after `RolePreviewBanner`).
- One mapping from `critical · warning · success · info` to the theme's semantic colour variables, so every banner reads correctly in dark and light without per-class CSS.
- Rule: any new red/amber/green surface uses `sevStyle`, not raw Tailwind `red-500`/`amber-500` classes. `AuthErrBanner`, `WorkspaceReadOnlyBanner` and the Billing usage bars were moved onto it.

**Global strip** — `GlobalBannerHost`, mounted under the role-preview banner inside `.app-shell`.
- Always **one slim row**, never a stack (the first version stacked three rows and the owner rejected it: "it makes the site shorter"). The most severe notice is the row; others sit behind a `+N more` dropdown.
- Two kinds: *dismissible* (× hides it for this user, persisted in `localStorage nrtur.bannersDismissed`) and *persistent* (no ×; derived from live state; disappears only when the condition clears).
- **Scope rule (owner-approved):** the strip is only for conditions that affect the *whole workspace* — payment failed, trial ended, plan cancelled, SMS registration rejected, maintenance, trial countdown, a finished export. One feature's problem (a failing automation, an A2P registration merely *pending* review) is **never** a strip. Product news is never a strip. So the default state is *no strip at all*; when one appears it means something.
- A persistent notice hides on the page that owns the fix (`owner` may be a list) so the same alarm never shows twice on one screen.
- Billing notices are role-aware: non-Owners get "Ask your workspace owner…" and no button that would land on "Billing is restricted".
- The old hard-coded payment-failed strip in `AppTopbar` was removed — it duplicated this.

**Page-wise notices** — `PageNotice` / `PageNotices({page, goTo, derive, className})`.
- Card-style notices that live *inside* a page under its header. Sources: the page derives them from its own state, or a job pushes one (`window.__nrturPageNotice(page, …)`).
- Wired: Contacts/Companies/Leads (import result from the real import wizard), Automation canvas (opened automation is failing), Settings › Automations (failing summary), Settings › Integrations (SMS paused — replaced an old ad-hoc amber note).

**Announcements** — `ANNOUNCEMENTS`, bell drawer tab **What's new**, `AnnouncementSpotlight`.
- Product news lives in the bell as its own tab, never in the strip. Opening the tab counts as reading it (auto-marked after ~1 s). Only a genuine launch (tag *New*) gets a one-time spotlight card bottom-right, never on a builder page, never chaining through older items.

**Sidebar badge dots** — `navBadgeMap`, `NavDot`.
- A dot on a rail item only while something on that destination needs doing (red blocks work, amber degrades it). Unpinned Settings conditions roll up onto the Settings button; Engage-hub pages roll up onto Engage or More. The bell's dot is now *earned* (unseen updates, tasks due today, new arrivals) — it used to be painted on permanently.

**Live arrivals + popups** — `nrturNotify(...)`, `NotifPopupHost`.
- Owner: "it should show popup notifications too — things only appear in the bell". Nothing ever *arrived* before; now there is one arrival path: the item lands in the bell (unread) and a card pops top-right for ~7 s (hover holds; Open deep-links). Respects each event's In-app toggle and a new **Popup cards** master switch in Settings › Notifications. Quiet on the page you're already looking at (a reply while on the Inbox).
- Wired to real events: inbound email/SMS reply (Inbox simulator), ad lead routed to you, new booking, failed automation run (off by default in preferences, as before).

**States page** — Settings › My account › Notifications → **Preview every state** (route `settings-notification-states`).
- A 11-step slider walks the *real* app through every use case (quiet, one notice, needs-fix, teammate view, many, owner page, one feature's problem, product news, something arrives, toasts, dots). Manual bars at the bottom force any strip state; buttons push demo popups/notices. Leaving the page restores what it touched.

### How to check
Settings › Notifications → Preview every state → **Start**, then → / ← keys.

---

## 2. Buttons, gradients, onboarding, sidebar (`edde61c`)

### Why
The owner wanted the app's buttons to match the marketing site (nrtur.io) — black/white, no green fills — and all green gradients/glows gone. Measured on nrtur.io: primary = cream `#F2F0EA` on dark / near-black on light, dark text, weight 600, 12 px radius, flat `0 1px 2px rgba(0,0,0,.4)` shadow; secondary = dark surface + hairline border; selected pills = quiet surface chip.

### What changed
- **`<style id="nrtur-mono-cta">`** (appended after `#nrtur-contrast`): primary buttons (`bg-brand-500`) → inverted ink; soft-green secondary buttons (`bg-brand-500/…`, e.g. Customize, Enroll) → dark surface + hairline border + ink text; selected segmented pills → surface chip; `shadow-brand` → flat 1 px shadow. Bars, dots and toggles keep the accent (toggle loses its glow).
  - Implementation note: selectors are `:root[data-theme][data-theme][data-theme] …` on purpose — that specificity beats `#nrtur-contrast` and the runtime-injected `#tw-accent` sheet, which re-asserts green on `.bg-brand-500` after every static block. Keep writing buttons with the normal `bg-brand-500 text-white` classes; the block remaps them.
- **Gradients removed** wherever they were decoration: the sheen on brand fills, glowing progress bars and tab underlines, wash cards (billing, booking, automations), the Billing card visual, the dashboard grid, and the blurred green blobs behind sign-in/sign-up/onboarding (`GlowBg` is neutral now). Mock image thumbnails in the email builder were left alone — they represent photos, not UI.
- **Onboarding** cut to four steps — Workspace → Pipeline → Contacts → Done. Integrations and Invite-team steps removed (owner: they live in Settings); only the **B2B Sales** pipeline is offered. Implemented via `ONB_ORDER=[1,2,4,6]` mapping wizard step → content block so nothing else had to be renumbered; routes `onboarding-5/6` are gone.
- **Sidebar**: More needs a ~320 ms hover hold before opening (a brush past the icon no longer throws a 560 px panel over the page; click still opens instantly and pins); Quick add ~260 ms. Both dock against the expanded 216 px rail instead of overlapping it; Escape closes Quick add.

### How to check
Any page: primary buttons are cream (dark) / black (light). Sign in page: no green glow. Sign up → onboarding: 4 steps. Hover More briefly → nothing; hold → opens.

---

## 3. Sequences engine (`e1b8408`)

### Why
The owner asked for deep research on how the market schedules, cancels and traces sequences, then a build to best practice. The research (10 vendors, official docs; 259 sources fetched) and a 59-claim verified audit of our old model are in **`docs/reference/sequences-scheduling-cancel-trace.md`**. The audit was blunt: enrollment was a flag — no step pointer, no next-send time, no to/from identity, nothing ever advanced, reply-delete was the only exit, no manual or bulk unenroll, the Enrolled list mixed live rows with seeded and invented names.

### Decisions taken (owner: "go with your recommendations")
Snapshot the destination at enrollment but re-resolve at send (logged as *address changed*) · sender = the enroller's own connected mailbox / workspace default SMS number, pinned · one **Remove** verb with a reason picker · sequence Pause is global and freezes countdowns · one active enrollment per contact per sequence, other sequences allowed · STOP exits the enrollment · edits apply to new enrollments only.

### What changed
Engine block sits right before `SequenceEnrollModal`.
- **One record** — `seqEnrollRecord(o)`: channel-qualified `seqId` (`'email:1'`, `'sms:1'`, builder `cs_…`), `to`/`from` snapshots, `stepIdx`, `status` (`scheduled · active · paused · held · finished · exited · error`), `nextAt`, settings snapshot, `history[]`. All three writers (wizard, pipeline-stage bulk, automation *Enroll* node) use it; duplicates per contact per sequence are blocked.
- **Scheduler** — `seqTick(now)`: next = last send + step delay, snapped into the send window in the contact's/workspace timezone, weekends to Monday, small jitter. Runs every 30 s on the real clock and inside `_autoAdvance` (the **+1 day** button, now also on Settings › Sequences). Gate per send: DNC/suppression → exit; A2P/spend cap → *held* (retried hourly); missing email/phone → *error* with Retry.
- **Cancel, three tiers** — per enrollment: Pause (countdown frozen) / Resume / Remove with reason / Move to step / Retry; bulk: checkboxes in the Enrolled view → Pause / Resume / Remove; sequence: the card toggle really pauses everyone (and blocks new enrollments), **Stop** exits everyone after a confirm that names the count. Automatic exits on reply, STOP (contacts *and* leads), meeting booked, deal won — honouring the wizard's switches. The "Remove from sequence" automation node is real.
- **Trace** — `EnrolledContactsModal` is live-only: Contact · Step x/N · Next send · To · From · Status · Last event. Contact and lead pages get a **Sequences** card (`SequenceEnrollmentBanner`): one compact row per enrollment, a single "next up" message preview (accordion, `+N more`), Pause/Remove per row. Every event (enrolled, step sent, held, paused, exited + reason + actor) is written to the record's and the linked deal's timeline.
- **Recommended next action** reads sequence state first so it can never say "send a follow-up" while a sequence is about to: *Follow-up is already scheduled* / *Waiting on the workspace* / *A sequence can't reach X* / *Sequence paused*. It sits above the Sequences card.

### Still simulated
No real send. Card-header Sent/Opened/Replied numbers remain seed figures; the "N in flight · N sent live · N replied" line beneath them is live.

### How to check
Settings › Sequences → **Enroll Contacts** → pick people → Launch. **Enrolled** on the card shows them; **+1 day** advances the clock and sends due steps; try Pause, Remove (reason), the checkboxes, the card toggle and Stop. Open an enrolled contact for the card and the timeline.

---

## 4. Sequence messages on the timeline (`9d1752c`)

### Why
Owner: a sequence-sent email should look like an email in the timeline, be labelled as coming from a sequence, and click through to the exact message.

### What changed
- A sent step is logged as a real `email`/`sms` activity (subject + body) with `payload.sequence` (sequence, step, enrollment, to/from, sent time, message).
- `ActivityRow` / `ActivityCompactRow` show a **Sequence · name · step/total** chip (`SeqActChip`); clicking opens `SeqMessageModalHost` with the message as sent and **Open sequence step** into the builder.

### Also answered
The **Outside hours (5:38 AM)** chip on a record's hero is the *contact's* local time (`getContactLocalTime`, timezone or phone-area-code guess) flagged when it's before 8 AM or after 7 PM — a "don't call/text now" hint, the same window the scheduler respects.

---

## Rules to keep (for anyone touching these areas)
1. New red/amber/green surfaces use `sevStyle`; new "needs fix" conditions go in `GlobalBannerHost`'s `fixes` with an `owner` page — and only if they affect the whole workspace.
2. New primary buttons keep the normal `bg-brand-500 text-white` classes; `#nrtur-mono-cta` remaps them. Don't hand-roll ink colours.
3. Never `sed -i` `index.html` from Git Bash — it silently converts the whole file to LF. Edit with Python that preserves CRLF, and assert lone-CR = 0 before committing.
4. `seqNow()` follows the simulated clock once **+1 day** has been used; timestamps then look identical across events — expected, not a bug.
