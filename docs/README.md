# nrtur — Documentation

All project documentation lives here, under one `docs/` folder, grouped by purpose.
(The repo root keeps only `README.md`; the old top-level `doc/` folder was merged into `docs/screens/`.)

| Group | What's inside | Start here |
|---|---|---|
| [`core-crm/`](#core-crm--how-each-module-works) | Plain-English explainer per CRM module | [`core-crm/`](core-crm/) |
| [`screens/`](#screens--per-screen-ui-notes) | Per-screen UI notes (one file per screen) | [`screens/00-system-overview.md`](screens/00-system-overview.md) |
| [`reference/`](#reference--canonical-model--specs) | Canonical data model, requirements, routing, inventory | [`reference/crm-system.md`](reference/crm-system.md) |
| [`audit/`](#audit--correctness-audit--change-log) | Correctness audit, gap analysis, and the change log | [`audit/README.md`](audit/README.md) |
| [`research/`](#research--competitive--ux-research) | Competitive + UX research behind product decisions | [`research/crm-comparison-table.md`](research/crm-comparison-table.md) |
| [`backend/`](#backend--to-be-built-api-specs) | To-be-built backend/API specs | [`backend/README.md`](backend/README.md) |
| [`automations/`](#automations) | Automations engine audit + rules model | [`automations/AUTOMATIONS_AUDIT.md`](automations/AUTOMATIONS_AUDIT.md) |
| [`phone/`](#phone) | Phone numbers + A2P registration | [`phone/PHONE_NUMBERS_A2P.md`](phone/PHONE_NUMBERS_A2P.md) |

---

## `core-crm/` — how each module works
One explainer per module of the shipped prototype (UI/UX + in-memory data model). Kept current with the build.

Leads · Contacts · Companies · Pipeline · Tasks · Calendar · Inbox · Sequences · Automations · Forms · Funnels · Ad Leads · Payments · Reports · Dashboard · Custom Objects · Email/SMS Templates · Engage Hub · Global UI · Settings (personal & workspace).

## `screens/` — per-screen UI notes
The original per-screen notes (one file per screen: `add-contact`, `deal-detail`, `settings-*`, `signup`, `onboarding`, …). Merged here from the old root-level `doc/` folder. Start with [`screens/00-system-overview.md`](screens/00-system-overview.md).

## `reference/` — canonical model & specs
The single sources of truth and cross-cutting references:
- [`crm-system.md`](reference/crm-system.md) — **canonical data-model explainer + correctness audit + corrected target model** (read first for any data-model question)
- [`requirements.md`](reference/requirements.md) — product requirements
- [`comms-routing-and-suggestions.md`](reference/comms-routing-and-suggestions.md) — email/inbound communication routing model
- [`sms-mms-routing-and-threads.md`](reference/sms-mms-routing-and-threads.md) — SMS/MMS routing & threading model + honest code audit (5-platform study)
- [`system-inventory.md`](reference/system-inventory.md) — full screen/module/entity inventory
- [`appearance-settings.md`](reference/appearance-settings.md) · [`payments-feature.md`](reference/payments-feature.md) — feature references

## `audit/` — correctness audit & change log
The crm-gap-audit record: system inventory, as-is model, gaps, use-cases, corrected architecture, and re-audit rounds (`_REAUDIT-r9`, `_REAUDIT-r10`, …). Every shipped fix has a plain-English before/after in [`audit/changes/`](audit/changes/).

## `research/` — competitive & UX research
The research that informed product decisions:
- [`crm-comparison-table.md`](research/crm-comparison-table.md) — cross-CRM comparison
- Pipeline: [`pipeline-competitor-research.md`](research/pipeline-competitor-research.md) · [`pipeline-ux-research.md`](research/pipeline-ux-research.md) · [`pipeline-custom-objects-research.md`](research/pipeline-custom-objects-research.md) · [`pipeline-audit.md`](research/pipeline-audit.md) · [`pipeline-roadmap-status.md`](research/pipeline-roadmap-status.md)
- Customization: [`custom-objects-research.md`](research/custom-objects-research.md) · [`customization-research.md`](research/customization-research.md)

## `backend/` — to-be-built API specs
Specs for the backend that the prototype is the working spec for: [`backend-spec.md`](backend/backend-spec.md), auth/permissions, automations engine, deals/pipeline API, sending/deliverability.

## `automations/`
[`AUTOMATIONS_AUDIT.md`](automations/AUTOMATIONS_AUDIT.md) · [`RULES_BASED_AUTOMATION.md`](automations/RULES_BASED_AUTOMATION.md)

## `phone/`
- [`PHONE_NUMBERS_A2P.md`](phone/PHONE_NUMBERS_A2P.md) — managed telephony + A2P 10DLC registration (the build).
- [`twilio-integration-model-decision.md`](phone/twilio-integration-model-decision.md) — decision memo: managed/subaccount vs BYOA vs Twilio Connect, benchmarked against 13 CRMs (why we chose managed).

---

_The design system lives separately in [`../nrtur-design-system/`](../nrtur-design-system/) (locked). The prototype itself is the single-file [`../index.html`](../index.html)._
