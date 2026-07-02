# Onboarding steps 3–5 now write real app state

_Status: fixed & render-verified · 2026-07-02_

Following the coherent pipeline wiring (steps 1–2), the "impactful" remaining steps now persist into the real app instead of being discarded.

## Step 3 — Integrations connect for real
Onboarding's integration cards used a local fake-connect. `OnboardingPage` now consumes `IntegrationsContext`, and `connectInteg` maps the onboarding key to the real workspace integration and calls `connect(realKey)`. Wired keys that the Settings → Integrations page actually reads from the shared `conns` store: **Slack** and **Twilio** (`REAL_INTEG_KEY={twilio,slack}`).
- Verified: connecting Slack + Twilio in onboarding sets `conns.slack=true` / `conns.twilio=true` — the exact state Settings reads (`!!conns[key]`).
- Left onboarding-local (different stores, out of scope): **Gmail** (MailAccountsContext) and **Google Calendar** (user-scope personal-integrations page), which don't map to `conns`.

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
