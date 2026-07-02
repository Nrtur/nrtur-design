# Deal header, linked edit-drawer pickers, auth pass-through, stage export

_Status: fixed & render-verified · 2026-07-02_

A UI/consistency pass driven by user review of the deal detail + edit drawer.

## 1 · Deal detail header shows the **deal name**, not the company
The big header `<h2>` rendered `d.company`. It now shows `d.name` (the deal) with the company as a small subtitle beneath it — so "Meridian — Managed CRM" is the title, "Meridian Agency" the subtitle. (`DealDetailPage` header.)

## 2 · Edit drawers: linked Contact/Company pickers + auto-fill + id-linking (was plain text)
`DrawerField` (the `RecordEditDrawer` field renderer) had **no `lookup` case**, so a deal's Primary contact / Company (and a contact's Company) rendered as raw free-text inputs — and `onEditSave` wrote only the name string, silently **de-linking** the id. Fixes:
- Added `lookup` / `companylookup` / `contactlookup` cases to `DrawerField` → render the shared **`ARLookup`** searchable picker (contacts or companies).
- Styled the `select`/`pill` fields with a chevron and swapped the plain owner `<select>` for the **`AROwner`** avatar picker — so the drawer matches the Add-record drawer.
- Added contact→company **auto-fill** to `RecordEditDrawer` (mirrors `AddRecordDrawer._coAuto`): picking a Contact fills the Company (unless the user set Company manually).
- **Deal** `onEditSave` now resolves the picked Contact/Company names → `primaryContactId` / `companyId` (mirrors the create path). **Contact** `onEditSave` resolves `co` → `companyId`.

Verified end-to-end: opened a deal's edit drawer → Contact & Company render as lookups (5 styled selects, owner avatar picker, only Name/Next-action are text); cleared Company, picked "Priya Nair" → Company auto-filled "Atlas Consult"; Save wrote `primaryContactId`+`companyId` (id-linked, not just strings).

## 3 · Login / signup pass-through (demo prototype)
There is **no auth gate** (page is client state); the only friction was hard-coded checks. Loosened for a frictionless demo: **sign-in accepts any password** (was `=== 'demo'`), and **email-verify accepts any 6-digit code** (was: any except `000000`) → both flow through to `dashboard` / `onboarding-1`.

## 4 · Non-terminal stage moves persist `dStage` (CSV export was stale)
Board drag (`applyMove`), the detail stage-ladder non-terminal commit, and list/bulk stage moves updated only `stageKey`, leaving `dStage` stale — so **CSV export** wrote the old stage. Both now set `dStage` alongside `stageKey`, matching every create/convert/import path. (Found by the final convergence re-audit.)

## Consistency note
Task/Calendar "Related to" pickers already id-resolve at save via `calLinkIds` (R8); `RecordSheet` bulk-add and the contact→company auto-fill on Task/Calendar remain name-only (lower-priority follow-ups). Inbound flows (booking/funnel/ad) are name-string-by-design; the custom-object drawer is already id-linked.

## Verified (headless render, precompiled)
Babel parse clean; app mounts with zero console errors; deal edit drawer flow verified end-to-end (pickers, auto-fill, id-resolution on save); deal header confirmed showing the deal name.
