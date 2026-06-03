# Deal detail (`deal-detail`)

## Purpose
One deal's full view: stage progress, value/close info, linked contact, activity. Component: `DealDetailPage`.

## Entry points
- Click a deal card in Pipeline; "deal" links from Inbox/Calendar/Contact detail; after creating a deal.

## Components & state
- `DealDetailPage({goTo})` — `stage` state; `stageIdx`/`nextStage` from `DEAL_STAGE_ORDER`; `color` from `DEAL_STAGE_COLOR`. Custom header with breadcrumb back to Pipeline.
- Stage stepper (progress dots), "advance to next stage" action, deal meta, linked contact, activity panel.

## Use cases
- Review a deal; move it through stages; see linked contact + history; act (email/call/note).

## Step-by-step flows
**Advance stage:** click next stage / "Move to {nextStage}" → `setStage` updates the stepper + color.
**Navigate:** breadcrumb → `pipeline`; contact link → `contact-detail`.

## Limitations
- Single hardcoded deal; stage change is local only (doesn't reflect back to the Pipeline board). Value/close/notes are static.

## Suggestions
1. id-based deal records; stage changes write back to the board + forecast + activity log.
2. Editable value/close date/owner/probability; won/lost flow with reason capture.
3. Linked emails/calls/tasks/files; next-step reminder → Calendar event.
4. "Mark Won/Lost" celebration + downstream automation trigger.

## Related
[pipeline.md](pipeline.md) · [add-deal.md](add-deal.md) · [contact-detail.md](contact-detail.md)