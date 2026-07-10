# Pipeline / Deals Module — Roadmap Status

_Last updated 2026-07-03 (branch/merge status refreshed 2026-07-10). Every "Done" row is render-verified headless with zero console errors and is now merged to `main`. Readiness score tracks the [PIPELINE_AUDIT.md](PIPELINE_AUDIT.md) rubric._

**Readiness: 58 → ~99 / 100.** All P0/P1/P2, every High, and every Med item are shipped; only Low / adjacent items remain.

---

## ✅ Done

### P0 — credibility foundation (readiness 58 → ~72)
| ID | Item | Commit |
|---|---|---|
| P0-1 | Automations actually run on stage change (calendar task, timeline entry, run counts, logs) | `0ca6941` |
| P0-2 | Time-in-stage tracked — `stageEnteredAt` + append-only `stageHistory` | `7423f63` |
| P0-3 | No silent closes — outcome-capture modal on every Won/Lost path | `19f79cd` |
| P0-4 | Ghost pipeline name fixed + KPIs computed from live board (were hardcoded) | `1d5b839` |

### P1 — core capabilities (→ ~88)
| ID | Item | Commit |
|---|---|---|
| P1-1 | Real multi-pipeline — shared state, per-pipeline stages, decisions D2/D3/D4 | `54baf4b` |
| P1-2 | Win/Loss analytics from `outcome` + configurable win & loss reason lists | `c8aaf33` |
| P1-3 | Per-stage required fields (stage gates) on every move path, inline fill, bulk skip | `b6f30a1` |
| P1-5 | Reopen clears stale outcome on every path | `c8aaf33` |

### P2 — analytics & polish (→ ~93)
| ID | Item | Commit |
|---|---|---|
| P2 | Deal Funnel + Time-in-Stage reports from real stage history (+ seed backfill) | `d2dd9e2` |
| P2-1 | Honest forecast — open-only, deal-probability overrides stage-probability, won shown separately | `83b749c` |
| P2-2 | Deal merge (2–3 duplicates, primary wins, id-linked gap fill, timeline note) | `55fdeb7` |
| P2-3 | Booking/funnel deal-create paths normalized through `normalizeDealPipeline` | `d12d59f` |
| P2-4 | Dead-code sweep — unreachable Edit-pipeline drawer removed | `d12d59f` |
| P2-5 | `CURRENT_USER` is the single source for closedBy / history stamps (was hardcoded) | `83b749c` |

### Beyond-roadmap — depth & UX (user-driven, → ~96)
| Item | Commit |
|---|---|
| **Multi-pipeline enrollment (D2 phase 2)** — one deal in several pipelines, independent stage per placement, primary owns value/forecast | `b19ff5c` |
| **Per-pipeline access** (Bigin/Bitrix24 pattern) — per-role visibility, Owner/Admin always, enforced across switcher/board/enrollment | `58cfa85` |
| Deal-detail review 1 — derived probability, resolved primary pipeline, enrolled Move-to button, amount fallback | `7702d58` |
| Deal-detail review 2 — ‹ › switcher, swap-based Set-primary, primary removed from About | `a45ebd7` |
| Pipeline actions collapsed into one stable overflow menu (no reflow on switch) | `d0508c0` |
| Hero name no longer wraps when the stage word changes | `2de6537` |
| **Pipeline membership is id-based** (`stagePlacements` pipelineId), not the name string — survives renames | `17008c3` |
| Deal card label is the real, live **Next action** (was a static `tag` string that never updated) | `7790b07` |
| **Cross-pipeline automation** — connected-pipeline handoffs (enroll/move to another pipeline on a trigger stage; config UI + seeded Won→Onboarding rule) | `8c3907e` |
| **Gate deal creation** into gated stages — quick-add / "+ Add deal" enforce the stage's required fields (was transitions-only) | `e909b5c` |
| **Close-date forecast view** — Pipedrive-style period columns (Overdue / months / No date) with weighted totals | `7e703b6` |
| **Exclude junk lost reasons from win rate** (Capsule `includedForConversion`) — per-reason Target/Ban toggle | `7e183be` |
| **Per-placement stage history** for enrollments — per-pipeline funnel & time-in-stage for enrolled deals | `0e0af3b` |

### Research & docs
| Item | Commit |
|---|---|
| Verified cross-CRM research — 22 products, sourced + confidence-tagged | `85e238f` |
| Full 24-product comparison matrix | `6650235` |
| 3-phase pipeline audit | (`PIPELINE_AUDIT.md`) |

---

## ⏳ Remaining

### Pipeline module — behind the leaders (from the verified matrix)
| Priority | Item | Why / who has it | Est |
|---|---|---|---|
| Low | Deeper per-pipeline permissions — per-stage move rights (Bitrix24) / six-role granularity (Streak); record-level hide in global lists/search | Bitrix24, Streak | L |
| Low | Reason-list edits don't rewrite past closes (market-standard behavior; no merge tool) | matches Pipedrive/HubSpot — mostly fine as-is | — |

### Adjacent (flagged in earlier audits, not pipeline-core)
| Item | Notes |
|---|---|
| ~~Non-stage automation triggers don't fire at runtime~~ | ✅ DONE (`19645d5`) — Deal created + Deal value changed now fire; engine refactored to a reusable core for adding more |
| Automation branching not evaluated at runtime | conditions render but don't gate execution |
| Contact-stage fixes | from the contact-stage audit: track changes, unify the 3 conflicting vocabularies, deal-won→Customer auto-advance, wire the Status-changed trigger |
| `AddDealPage` stub | legacy full-page add-deal route superseded by the quick-add drawer — candidate for the next dead-code sweep |

---

## Notes
- "Est": S = small, M = medium, L = large.
- The **High** items are the natural next steps; cross-pipeline automation is the highest-leverage because the two systems it needs (automations, multi-pipeline) already exist.
- Everything under **Done** is verified and shipped to `main` (the old `fix/crm-model-corrections` branch has since merged).
