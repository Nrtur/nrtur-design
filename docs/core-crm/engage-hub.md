# Module 9 — Engage Hub

_Route: `engage` · Component: `EngageHub` (line 21085)_

---

## 9.1 Engage Hub Shell

### Surface inventory

| Element | What it is |
|---|---|
| Sidebar | Standard `AppSidebar` with `active="engage"` |
| Tab rail | Horizontal pill-style tab group in `AppTopbar` |
| 7 tabs | Sequences / Automations / Funnels / Forms / Templates / Ad leads / Delivery rules |
| `EngageEmbedContext.Provider` | Wraps all child pages; tells them they are rendered inside Engage, not as standalone pages |
| Active body | One child page mounted at a time; swapped on tab click |
| `nav.tab` + `nav.sub` | URL-style deep-link params; EngageHub reads them on mount to pre-select a tab and sub-tab |

### Tab → child page map

| Tab key | Label | Child component |
|---|---|---|
| `sequences` | Sequences | `SettingsSequencesPage` |
| `automations` | Automations | `SettingsAutomationsPage` |
| `funnels` | Funnels | `FunnelsPage` |
| `forms` | Forms | `SettingsFormsPage` |
| `templates` | Templates | `EngageTemplates` (wraps Email + SMS sub-tabs) |
| `adleads` | Ad leads | `SettingsAdLeadsPage` |
| `delivery` | Delivery rules | `EngageDelivery` (wraps Frequency cap / Re-engagement / Suppression / Notification defaults sub-tabs) |

### `EngageEmbedContext` — what it does

`EngageEmbedContext.Provider value={true}` is placed around every child. The children can call `React.useContext(EngageEmbedContext)` to know they are embedded inside Engage. This lets them suppress their own sidebar, because Engage already provides one, and adjust header spacing. Without this, each page would render a double sidebar.

### Deep-link navigation

```
goTo('engage', { tab: 'automations' })
goTo('engage', { tab: 'templates', sub: 'sms' })
goTo('engage', { tab: 'delivery', sub: 'frequency' })
```

`useEffect` on `nav` updates `tab`, `tplSub`, and `delSub` after mount so a back-navigation lands on the same sub-tab the user left.

---

### Design decisions

| Decision | Alternative | Why this | Tradeoff |
|---|---|---|---|
| One hub, 7 tabs | Separate sidebar items for every tool | Keeps "outbound" tools grouped; less sidebar clutter; the user thinks "I'm doing marketing stuff" not "am I in automations or sequences?" | Heavy tab rail; 7 choices is at the upper limit before it feels busy |
| `EngageEmbedContext` to suppress child sidebars | Child pages always render their own sidebar | Each child is reusable standalone (e.g. `SettingsAutomationsPage` can be reached from the Settings sidebar too) without duplicating the component tree | Any page that doesn't check the context will double-render a sidebar; it's a bug trap for new child pages |
| `nav.tab` + `nav.sub` deep-link props | URL hash / query-string routing | Stays compatible with the single-file no-router prototype | Real production needs real routes; this is a prototype shortcut |
| Delivery rules grouped under Engage, not Settings | Delivery rules live in Settings only | Frequency caps and suppression lists are things a marketer adjusts when building a campaign — they belong near the send tools | Admin-level controls (suppression, frequency) mixed with self-service tabs; permissions model needs to gate these per role |

---

### Frontend — what needs to be built

- Tab rail component (`cal-tab-group` pill group) with active-brand highlight and overflow scroll on narrow viewports
- `EngageEmbedContext` context + all child pages checking it to hide their own sidebar
- Deep-link routing: `nav` prop → `useState` init → `useEffect` update pattern
- Sub-tab state for `templates` (email vs SMS) and `delivery` (4 sub-tabs); independent of the parent tab state
- Tab persistence across navigations (currently state resets on unmount; consider `sessionStorage` or lifting state)

### Backend — what needs to be provided

- No direct backend surface; Engage Hub is pure routing and layout
- Each child tab has its own data requirements (automations list, sequences list, form list, etc.) — see their respective modules
- Route guard: `engage` route should check the user's plan/permission before rendering; some tabs (Ad Leads, Delivery rules) may be gated to higher tiers

---

### Performance

The entire Engage shell is stateless routing. Cost is zero — it only mounts one child at a time. The children carry the real data weight (see their modules). No lazy-loading is implemented in the prototype; in production each tab's child should be code-split so the bundle for `FunnelsPage` isn't paid until the user clicks Funnels.

---

### Competitive position

HubSpot groups marketing tools in a top-level "Marketing" hub with sub-nav. GHL uses a sidebar with individual items for every tool. nrtur's approach (one `engage` sidebar item → tab rail inside) is closer to HubSpot but lighter — fewer sidebar items, one cognitive destination for anything outbound.

---

## Developer Q&A

**Q: What does `EngageEmbedContext` actually do — is it just a boolean?**
A: Yes, it's a `React.createContext` defaulting to `false`, set to `true` by `EngageHub`'s `Provider`. Children call `useContext(EngageEmbedContext)` and, when true, suppress their own `AppSidebar` render (since `EngageHub` already renders one) and adjust header spacing. Without this check, every child page would paint a second sidebar, breaking the layout. Any new child page added to Engage MUST check this context or it will double-render.

**Q: If I do `goTo('engage', { tab: 'automations' })`, what exactly happens on render?**
A: `EngageHub` initialises `tab` from `(nav && nav.tab) || 'sequences'` in `useState`. A `useEffect([nav])` runs `setTab(nav.tab)` after mount, handling subsequent navigations to the same route with a new tab. Sub-tab state (`tplSub` for templates, `delSub` for delivery) is initialised and re-applied the same way. Deep-linking to `{ tab: 'templates', sub: 'sms' }` pre-selects both the tab and the SMS sub-tab.

**Q: Does the tab rail scroll on small screens or does it wrap?**
A: It scrolls horizontally — the container has `overflow-x-auto max-w-full` and each button has `whitespace-nowrap`. There's no scroll-indicator or fade-gradient to signal more tabs exist off-screen. On narrow viewports, the last few tabs (Ad leads, Delivery rules) may be invisible until the user discovers the scroll.

**Q: If I add a new tab to Engage, what exactly needs to be wired up?**
A: Three things: (1) add `{k:'newtab', label:'...', Icon:I.Something}` to the `ENGAGE_TABS` array; (2) add a branch in the `EngageHub` body switcher — `else if(tab === 'newtab') body = <NewPage goTo={goTo}/>`; (3) the child page must call `useContext(EngageEmbedContext)` and suppress its own sidebar when the value is `true`. Skip step 3 and the new tab breaks the layout.

**Q: Are all 7 tabs visible to all roles, or are some gated?**
A: `EngageHub` has no `settingsIsAdmin()` check — all 7 tabs render for every role. Role-gating happens inside child pages (e.g. `SettingsAutomationsPage` shows a read-only banner for non-admins; `SettingsFormsPage` may do the same). This is intentional: tabs are discoverable by everyone, but editing is gated. The risk: tabs that should be admin-only (e.g. Delivery rules) are visible to all users, which can create confusion or accidental access if a future child page doesn't implement its own gate.

**Q: Why is `sequences` the default tab, not `automations`?**
A: `ENGAGE_TABS[0].k === 'sequences'` and the `useState` init is `(nav && nav.tab) || 'sequences'`. It's a code-order default. The reasoning: drip sequences are the first thing a marketing team sets up; automations come later once sequences are running. This can be changed by reordering `ENGAGE_TABS` — nothing else needs to change.

**Q: Tab state is in `React.useState`. What happens when the user navigates away and comes back?**
A: State resets — `EngageHub` unmounts when the user goes to another page, so `tab` returns to its default (`sequences`). If the user was on the Automations tab, left to view a contact, and came back, they land on Sequences. Production should persist the last-selected tab in `localStorage` or `sessionStorage` and read it in the `useState` initialiser.
