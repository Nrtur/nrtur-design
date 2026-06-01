# App UI Kit · nrtur in-product

A high-fidelity recreation of the nrtur CRM web app — sidebar nav + topbar + swappable view. Click the sidebar icons in `index.html` to jump between views.

## Files

| File | Component(s) | Notes |
|---|---|---|
| `index.html` | Click-thru demo. Sidebar drives `view` state. | Boots into the Pipeline view. |
| `data.jsx` | Fixtures: `APP_USER`, `APP_PIPELINE`, `APP_CONTACTS`, `APP_EMAILS`, `APP_WORKFLOWS`, `APP_METRICS`, `APP_ACTIVITY`. | Plain JS data. Edit here to change every view at once. |
| `Shell.jsx` | `<AppSidebar />`, `<AppTopbar />` | The persistent chrome. Sidebar is icon-only 56px rail; topbar holds title + subtitle + search + bell + primary CTA. |
| `DashboardView.jsx` | `<DashboardView />` | Overview tiles + pipeline glimpse + activity feed. |
| `PipelineView.jsx` | `<PipelineView />`, `<PipelineDealCard />` | The kanban — 4 stages, ⋯ menu reveals on hover. |
| `ContactsView.jsx` | `<ContactsView />` | Filterable table. |
| `InboxAutomationsAnalytics.jsx` | `<InboxView />`, `<AutomationsView />`, `<AnalyticsView />` | Three smaller views grouped — open the file to extract individual ones. |

## Composition

```
┌─────────────────────────────────────────────────────────┐
│ AppSidebar │            <Active View>                   │
│  (rail)    │  ┌──────────────────────────────────────┐  │
│            │  │ AppTopbar (title, subtitle, search)  │  │
│            │  ├──────────────────────────────────────┤  │
│            │  │ View body (kanban / table / list…)   │  │
│            │  └──────────────────────────────────────┘  │
│            │ Status bar — pulse dot + team online      │
└─────────────────────────────────────────────────────────┘
```

## Conventions

- All views render the same `<AppTopbar>` with their own `title` / `subtitle` / `primaryLabel`. Keep the API stable when adding new views.
- Glass cards (`.glass-card`) are the workhorse surface inside views.
- The status bar at the bottom is rendered once in `index.html` and shared across views.

## Known gaps vs. source repo

- The source's `Showcase.tsx` has only partial implementations of Contacts / Email / Automations / Analytics — the views here are fleshed out from those snippets and the design language. The kanban Pipeline is the most-complete recreation in the source.
- Settings view is omitted (no canonical reference in the source repo). The cog icon in the sidebar is non-interactive.
- The search command palette (⌘K) is shown as a static affordance — no dropdown is implemented.
