# Onboarding steps 3–5 now write real app state

_Status: fixed & render-verified · 2026-07-02_

Following the coherent pipeline wiring (steps 1–2), the "impactful" remaining steps now persist into the real app instead of being discarded.

## Step 3 — Integrations connect for real
Onboarding's integration cards used a local fake-connect. `OnboardingPage` now consumes `IntegrationsContext` + `MailAccountsContext`, and `connectInteg` routes each onboarding key to its **real** store:
- **Slack / Twilio** (workspace) → `connect(realKey)` on the shared `conns` store that Settings → Integrations reads (`!!conns[key]`). Verified: `conns.slack=true` / `conns.twilio=true`.
- **Google Calendar** (personal) → sets `personalConns['google-calendar']=true`. To make this real, the personal-integrations page's connection map was **lifted from local `myConns` to a shared `personalConns` on `CrmDataContext`** (which also fixes that page's own connections not surviving navigation). Verified: connecting Calendar in onboarding shows it **Connected** on Settings → My integrations.
- **Gmail** (personal inbox) → `MailAccountsContext.connect(...)`. The inbox is already connected via the seeded mail accounts, so this reinforces rather than changes it; verified the inbox shows **Connected**.

## Step 4 — Contacts persist
`RecordSheet` never wrote to the CRM itself — it delegates to an `onCreateRows` prop, which the onboarding call site didn't pass, so added contacts were silently dropped. Now the call site passes `onCreateRows={rows => crm.setContacts([...rows.map(r=>arBuildFromSheet('contact',r)), ...])}` (same normalizer every create path uses), with `crm` read from `CrmDataContext`.
- Verified: a contact added in onboarding step 4 appears on the **Contacts page**.

## Step 5 — Invites become pending teammates
Added a shared `teamInvites` array to `CrmDataContext` (App state + context value/deps). Onboarding flushes its `sentInvites` into `crm.setTeamInvites` on the step-5 Continue; `SettingsTeamPage` concatenates those as `status:'Pending'` rows (deduped against existing members) into its member list — the page's row renderer already styles a Pending chip.
- Verified: inviting `newperson@acme.com` in onboarding shows it as **Pending** on Settings → Team.

## Not done (by decision)
The **workspace name** (step 1) is a hardcoded `const NRTUR_WORKSPACE_NAME='Bloom Creative'` referenced across the app; making it dynamic everywhere is a large, high-risk cross-cutting change and was intentionally left out (the name is still used to *name the onboarding pipeline* — see onboarding-pipeline-wiring / the coherent-naming commit).

## Verified (headless render, precompiled)
Babel parse clean; app mounts with **zero console errors**. All three steps confirmed end-to-end in the preview (Slack/Twilio → `conns`; contact → Contacts page; invite → Settings Team Pending).
