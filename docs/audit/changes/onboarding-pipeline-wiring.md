# Onboarding pipeline selection is now real (was cosmetic)

_Status: fixed & render-verified · 2026-07-02_

## How it was
The onboarding wizard (`OnboardingPage`) kept every input in local `useState` and **discarded it on Continue** — it never touched app state. Step 2's pipeline template pick (B2B Sales / Agency-Services / Start from scratch) did nothing; the app always used its pre-seeded pipelines.

## How it is now
- A module-level `_onbPipeChoice` records the template the user picks on step 2 (set in the option's `onClick`).
- `onbExtraPipeline()` maps that choice to a real pipeline definition:
  - **Agency / Services** → a "Client Delivery" pipeline (Lead → Scoping → Proposal → Active → Delivered).
  - **Start from scratch** → a "My Pipeline" (Stage 1 → Stage 2 → Won).
  - **B2B Sales / none** → nothing extra (the default Sales Pipeline already covers it).
- `PipelinePage` reads it on first mount: the chosen pipeline is **appended** to the boards and becomes the **active** one (`activeId`), so the user lands on the pipeline they picked.

**Why append (not replace):** the prototype pre-seeds demo deals on the Sales Pipeline. Replacing the primary pipeline would orphan those seeded deals, so the onboarding choice is added alongside — the demo data stays intact and the chosen board shows up empty and ready.

## Also fixed
- **`ARLookup` duplicate React key** — the shared lookup keyed options by name, so duplicate contact/company names (e.g. two "Sarah Chen") collided. Now keyed by `name+'#'+index` (unique). This was surfaced by adding `ARLookup` to the edit drawer and also hardens the Add drawer.

## Verified (headless render, precompiled)
- Babel parse clean; app mounts with zero console errors (incl. the lookup dropdown open — the dup-key warning is gone).
- **Default** (no onboarding choice): Pipeline board = "Sales Pipeline" (16 seeded deals, Prospecting column intact).
- Pick **"Agency / Services"** in onboarding step 2 → Pipeline board lands on **"Client Delivery"** with Lead/Scoping/Proposal/Active/Delivered stages (fresh, 0 deals).
- (Login/signup pass-through — committed separately — lets the whole signup→verify→onboarding→dashboard flow run.)
