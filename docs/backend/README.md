# nrtur — Backend documentation

This folder is the **handoff from working prototype to buildable product**. nrtur's domain is already fully implemented and render-verified in the single-file React prototype (`../../index.html`); the in-memory `CrmDataContext` **is** the data model. These documents specify what a real backend must add — persistence, authorization at the API boundary, and three async systems (scale queries, automations, sending) — and nothing else invented.

Every spec is **grounded**: claims are verified against the real prototype code, and each one marks the boundary between what's genuinely wired and what the prototype only simulates, so you always know what exists versus what you're building.

## Start here

1. **[`../../BACKEND_SPEC.md`](../../BACKEND_SPEC.md)** — read this first. The whole-system blueprint: tenancy/id/soft-delete conventions, the full entity model, the integrity rules (id-first linking, multi-pipeline enrollment, cascade/delete-never-orphans, stage gates), the API surface, auth, sending, the scale contract, migration, and the recommended build order.
2. Then read the sub-spec for whatever module you're building (below). Each is self-contained with DDL, JSON request/response schemas, enforcement rules, and an error-code table.

## The sub-specs

| Doc | Details `BACKEND_SPEC.md` § | What it gives you |
|---|---|---|
| [`deals-pipeline-api.md`](deals-pipeline-api.md) | §2.4–2.5, §3.2–3.4, §4, **§8** | Deal/pipeline schema, the deal API shape, the **board scale endpoints** (paged columns + server aggregates — the biggest gap), and the guarded operations (move/close/reopen/enroll/merge/bulk). |
| [`auth-permissions.md`](auth-permissions.md) | §1, **§5** | Identity/session/tenancy, the 6 roles seeded verbatim, Own/Team/All as SQL predicates, pipeline/stage authz, sensitive-field redaction, "View as" safety. |
| [`sending-deliverability.md`](sending-deliverability.md) | **§6** | Transport + domain auth, server-authoritative suppression, the sequence enrollment state machine, rate/drip rails, provider webhooks. The biggest net-new system. |
| [`automations-engine.md`](automations-engine.md) | §2.7, **§7** | Trigger event bus, the durable queue worker, the condition AST, flow-tree execution, cross-pipeline handoffs, cron triggers. |

## Build order (from `BACKEND_SPEC.md` §Build order)

1. **Data model + CRUD + auth/RBAC + row-scope** → makes the prototype real & multi-user. *(deals-pipeline §1–2, 4 · auth-permissions in full)*
2. **Board scale endpoints** → closes the biggest competitive gap. *(deals-pipeline §3)*
3. **Automations worker** → the event core already exists; make it durable. *(automations-engine)*
4. **Sending & deliverability** → largest net-new + heaviest compliance surface; do last, behind a flag. *(sending-deliverability)*

## The one rule

The prototype spent its life removing fake/dead data. **Do not reintroduce any.** Every value the API returns is real or explicitly `null`.

---

_Context: [`../../BACKEND_SPEC.md`](../../BACKEND_SPEC.md) is the blueprint; the competitive scorecard (where nrtur stands vs the field) lives as a published artifact. The prototype on `main` is the source of truth for domain behavior — when a spec and the code disagree, read the code and fix the spec._
