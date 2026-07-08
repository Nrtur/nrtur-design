# Deliverability tab — audit & cleanup (2026-07-08)

_Audit of the Engage hub's "Delivery rules" tab and its sub-tabs. Confirmed scope + direction with the product owner before changing anything (no assumptions)._

## What was there (all four sub-tabs, read from code)
- **Frequency cap** — one workspace-wide send ceiling per channel + transactional-exempt + "who's at cap" strip. **Solid, best-practice.**
- **Re-engagement** — cold-contact finder (no open/click/reply in N days) → win-back or sunset, auto-rule, cohort chart. **Solid.**
- **Suppression list** — blocked emails / domains / numbers + per-contact channel prefs + compliance toggles, with 4 tabs nested inside. **Worked, but the densest.**
- **Notification defaults** — org defaults for how the **team** is alerted (SMS received, deal moved…). **Miscategorized.**

## The core finding
Three of the four are the same idea — **protecting outbound deliverability and honoring opt-outs**. **Notification defaults is about internal team alerts**, a different concern, which made "Delivery rules" mean two things and read as an incoherent group. It was also *duplicated*: it already exists in the Settings command list but — importantly — **was not in the settings nav rail at all**, so it was only truly reachable from this tab.

The individual pages were genuinely well-built; the real work was **information architecture + light decluttering**, not rebuilds.

## What changed (owner-confirmed: move it out + rename; real issues + light polish)
1. **Moved Notification defaults out** of the Deliverability sub-tabs (removed the sub-tab, its body branch, and the `settings-notification-defaults` engage-redirect) **and gave it a real home** — added it to the **Settings › Workspace** group (it was previously orphaned from the settings rail). It now renders as its own standalone settings page.
2. **Renamed the tab** "Delivery rules" → **"Deliverability."** The remaining three tabs (Frequency cap · Re-engagement · Suppression list) now tell one clear story. (`k:'delivery'` key kept, so all routes/redirects stay valid.)
3. **Decluttered the Suppression page:**
   - **Surfaced the global compliance rules** (global opt-out suppression, honor GDPR erasure, unsubscribe-link footer) from the very bottom of the page up to a compact card at the **top** — and **wired the toggles to live state** (they were dead `onChange={()=>{}}` switches before).
   - **Flattened the perceived nesting** — added a clear **"Blocked contacts"** section heading above the Email/Domains/Phone/Channels switcher so it reads as a within-page *filter*, not a third identical tab bar competing with the Engage rail + Deliverability sub-bar.

Frequency cap and Re-engagement were left as-is — they're already strong; changing them for the sake of it wasn't warranted.

## Verified (headless CDP)
Boots clean, zero runtime errors. `ENGAGE_TABS` delivery label = "Deliverability"; Deliverability shows exactly 3 sub-tabs (no Notification defaults); the engage-redirect for notif-defaults is gone; `settings-notification-defaults` is in the Workspace settings group and renders as its own page (not the engage hub). Suppression page: "Global compliance rules" + "Blocked contacts" headings present, all three compliance toggles present and live, all four type filters (Email / Domains / Phone / Channels) working.
