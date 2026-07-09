# Onboarding (`onboarding-1` … `onboarding-5`)

## Purpose
First-run setup wizard after signup. One component, `OnboardingPage`, rendered with a `step` prop (1–5). Shows a progress bar (`pct`), a left interactive form per step, and a right "being set up" preview. Dark (outside `.app-shell`).

## Entry points
- `signup` submit → `onboarding-1`. Each step's Next/Back navigates `onboarding-{n±1}`; step 5 → `dashboard`.

## Components & state
- `OnboardingPage({step,goTo})`; `ONB_STEPS` (step metadata), `OnboardingDropdown` helper.
- State: `company`, `industry`, `teamSize`, `pipeline` (`PIPES`: B2B Sales / Agency / Custom), `integ` (`INTEGS`: Gmail/Twilio/Slack/Calendar toggles), `invites` (emails).

## Steps
1. **Workspace** — company name, industry, team size.
2. **Pipeline** — pick a template (`PIPES`) or start blank.
3. **Integrations** — toggle providers to connect (`INTEGS`).
4. **Invite team** — add teammate emails + roles.
5. **Finish** — summary → enter `dashboard`.

## Step-by-step flow
1. Fill the step's fields (state persists across steps while mounted).
2. Next → `goTo('onboarding-'+(step+1))`; Back → previous; progress bar reflects `step/5`.
3. Step 5 → `goTo('dashboard')`.

## Limitations
- Selections aren't persisted or applied (e.g., chosen pipeline template doesn't seed Settings → Pipeline; integrations don't actually connect; invites aren't sent). Navigating away loses state.

## Suggestions
1. Persist answers and **apply** them: seed pipeline stages from the template, open the real provider-connect flow ([email-providers.md](email-providers.md)), send real invites (Team page).
2. Allow skip/resume; show a checklist on the dashboard for incomplete steps.
3. Validate invite emails; pick roles per invite.
4. Pre-fill company/industry from the signup email domain.

## Related
[settings-pipeline.md](settings-pipeline.md) · [settings-integrations.md](settings-integrations.md) · [settings-team.md](settings-team.md) · [dashboard.md](dashboard.md)