# Add deal (`add-deal`)

## Purpose
Create a new deal. Full-page form (a lighter `QuickDealModal` also exists via sidebar **+**).

## Entry points
- Pipeline "New Deal" / column "Add deal"; sidebar **+** → New deal.

## Components & state
- `AddDealPage({goTo})` — fields: deal name, company, value, close date, stage (`DEAL_STAGE_ORDER`). Create → `deal-detail`; Cancel → `pipeline`.

## Step-by-step flow
1. Enter name/company/value/close date, pick stage → Create deal → `goTo('deal-detail')`.
2. Cancel → `goTo('pipeline')`.

## Limitations
- Not persisted to `STAGES_DATA`; routes to the same static deal. Company isn't linked to a real contact/account.

## Suggestions
1. Persist and drop the card into the chosen stage column; route to the new record.
2. Company/contact autocomplete + create-on-the-fly; currency field (per workspace currency).
3. Default stage/owner from context (which column "Add deal" was clicked); validation.
4. "Save & add another"; templates for common deal types.

## Related
[pipeline.md](pipeline.md) · [deal-detail.md](deal-detail.md)