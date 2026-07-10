# Drawer / IA consistency — new surfaces open as drawers, connect is single-homed (2026-07-08 → 2026-07-10)

_From the owner's IA audit: "why do new features open as pop-ups when my app opens drawers? and why are Meta/Google connecting from the Ad Leads page when that belongs on Integrations?" This documents the drawer-convention and integrations-placement fixes. (Commits `b1f32e0` batch 1, `efa001c` batch 2. The email-compliance and ad-leads-discovery parts of `b1f32e0` have their own change docs.)_

## How it was (the drift)

nrtur has a clear house convention: **any create / edit / connect / wizard surface slides in as a right-side drawer** (~40 of them — every connect flow, both record editors, the import wizard). But several newer, form-heavy screens had drifted to **centered pop-up modals**, so the app felt inconsistent — a new feature would pop in the middle while everything else slid in from the right.

The worst offenders:
- **The whole A2P / Trust family** — the trust-registration wizard, business-profile, A2P brand, A2P campaign, and the buy-number / port-number forms — used a bespoke centered-panel structure all their own.
- **The ad-form discovery picker** popped centered, even though its own sibling (the ad-source connect flow) was already a drawer.
- **The Payments creators** — new product, payment link, and subscription — popped centered, while invoice and quote creation (same module, same kind of action) slid in as drawers.

Separately, an **integrations-placement** problem: connecting Meta/Google ad accounts was duplicated as a full connect surface on the **Ad Leads** page, even though the same connection already lives on the **Integrations** page (the way Stripe works — connect in one place, use it everywhere). And the **personal-calendar** connect card kept its connection in local component state, so connecting a calendar there didn't persist and disagreed with the Integrations catalog.

## How it is now (the fix)

**One drawer shell for every create/edit surface.** All the drifted screens were converted to the app's responsive shell — a **bottom sheet on mobile, a right-side drawer on desktop** (`flex items-end sm:justify-end` overlay + a `flex-col` panel with `rounded-t-2xl sm:rounded-none` and the `sheetUp → arIn` animation), keeping the dimmed backdrop and click-outside-to-close.

- **Batch 1 (`b1f32e0`, 2026-07-08):** the six A2P/Trust modals (`TrustRegistrationWizard`, `TrustProfileModal`, `A2pBrandModal`, `A2pCampaignModal`, `BuyNumberModal`, `PortNumberModal`) + `AdFormDiscoveryModal` → drawers.
- **Batch 2 (`efa001c`, 2026-07-10):** the three Payments creators (`PayProductModal`, `PayLinkModal`, `PaySubModal`) → drawers, so the Payments "create" experience now matches its own invoice/quote drawers.

**Deliberately left centered** (a judgment call, not a miss):
- **`EmailTemplateEditModal`** — it's a wide, 1060px **two-pane editor with a live email preview**, not a single-column form. A wide preview-editor belongs centered (same as the email builder); a narrow drawer would break it.
- **Tiny confirm/rename dialogs and the suppression sheet** — small single-purpose pop-ups are correctly centered; the drawer convention is for form-heavy create/edit/connect surfaces.

**Connect is now single-homed on Integrations.** Ad Leads Step 1 became a **status strip** ("Ad account connections · Manage on Integrations") that deep-links to the Integrations page; the duplicate connect surface on Ad Leads was removed. Connecting happens in one place, and the ad-field mapping still lives on Ad Leads where it belongs.

**Calendar connections now persist.** The personal-calendar card was rewired from local state to the shared connection store, so connecting a calendar there sticks and agrees with the Integrations catalog. (This was the owner's "duplicate calendar entries.")

**A2P buy-number honesty.** Buying a second number shows a toast that explains *why* it's instantly active — "inherits your approved A2P campaign — ready to send" — since A2P approval is workspace-level and numbers inherit it.

## Why this is better

- **Consistency the owner will feel** — every "make/edit/connect something" surface now moves the same way, so the app stops feeling like separately-built features.
- **No duplicate connect surfaces** — one place to connect an integration means no "which one do I use?" and no drift between two connect UIs.
- **Mobile-friendly by default** — the same surfaces now come up as bottom sheets on a phone.

## Verified
Headless (CDP): the trust wizard opens as a drawer; the new-product creator opens as a **440px right-drawer** pinned to the right edge (overlay right-aligned, panel at the viewport's right); the Ad Leads status strip deep-links to Integrations; connecting a personal calendar persists across navigation; boots clean, zero console errors.

## What the owner still decides / remaining (cosmetic only)
- **Rename debt:** ~14 functions are named `*Modal` but actually render drawers — pure renaming, no user impact. Skip unless it bothers you.
- **Calendar list tidy-up:** the personal-calendar provider list could be folded into the shared integrations definitions. The user-facing bug (connections not persisting) is already fixed; this is code tidiness, not behaviour.
