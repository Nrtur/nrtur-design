# Team invite-accept flow (2026-07-08)

_The missing other half of team invites: the page a teammate lands on when they click the invite link in their email._

## The gap
Settings › Team could **send** invites (`teamInvites` in `CrmDataContext`, with resend/revoke) and onboarding could invite teammates — but there was **no accept side**. Clicking an invite link had nowhere to go, and there was no way to see the four states a real invite link can be in (valid / expired / revoked / already-a-member). Separately, the Team page's `members` list was **local component state**, so even if an accept page existed it couldn't add the new teammate anywhere the rest of the app could see.

## What shipped
- **`AcceptInvitePage`** — a public (pre-auth) page in the same visual family as SignUp / ResetExpired (GlowBg, the rounded card, `NrturMark`). The invite link's token arrives via `nav` `{email, role, ws, inviter, exp}`. State resolves **against the live workspace**, the way a real server validates an invite — not from the token alone:
  - `invalid` — no email in the link (broken link).
  - `member` — the email is already in `members` → "You're already on this team."
  - `expired` — `exp` is in the past → "This invitation has expired" (invites carry a 7-day expiry).
  - `valid` — a matching pending invite exists in `teamInvites` → a branded "Join {workspace}" card with the email + role, **Accept** / Decline.
  - `revoked` — none of the above (the invite was revoked or already used).
  - **Accept** consumes the invite: adds the teammate to `members` (Active) and removes them from `teamInvites`, toasts a welcome, and lands on the dashboard.
- **Members context bridge** — `members`/`setMembers` moved from `SettingsTeamPage` local state into `CrmDataContext`, so the accept page and the Team page share one list. Accepting an invite now shows up on the Team page immediately (verified: accept → the new member appears Active, and the "N active · M pending" counts update).
- **Route** — `accept-invite` added to the page switch and to `MARKETING_PAGES` (renders without the app shell, since you're not signed in yet).
- **Demo entries** on Settings › Team so the flow is reachable without a real email:
  - a header **"Preview invite page"** button that seeds a real pending invite then opens its (valid) link;
  - a per-pending-row **"Open invite link"** action that opens the accept page for that actual invite;
  - a prototype-only **preview-states footer** on the accept page itself to jump between all four states.

## Honest about the prototype
- Accepting doesn't switch the logged-in identity (the prototype's `CURRENT_USER` stays Alex Morgan) — it adds the teammate to the workspace and lands on the dashboard. In a real build, accepting would authenticate you *as* the invited user; that needs the (to-be-built) auth backend.
- "Expired" has no natural trigger in a demo (seeded invites are fresh), so it is shown via a token with a past `exp`. "Valid", "revoked", and "already-a-member" are all reachable from real data (send/open, revoke-then-open, or open a member's link).
- The preview-states footer and "Preview invite page" button are clearly labeled prototype aids, not shipping product UI.

## Review found & fixed (2 real issues)
A 3-lens adversarial review (integration/regression · page correctness · design/theme) + verify pass surfaced two confirmed defects, both fixed and re-verified:
1. **Stale-memo regression (high).** `members` was lifted into the `crm` context — which is a `React.useMemo` — but was missing from that memo's dependency array. `setRole`/`removeMember` mutate *only* `members`, so they returned the stale cached context and **silently no-op'd** on the Team page (role reverts, removed rows stay). The happy-path test missed it because `accept()` also calls `setTeamInvites` (a listed dep), which incidentally forced a recompute. Fix: add `members` to the deps array. Re-verified: removing a member now actually removes the row.
2. **Short-viewport clip (medium).** The valid card is the tallest in the auth family; its outer container was `h-full flex items-center justify-center` with no scroll, so on a short viewport (landscape phone / high zoom) the Accept button clipped off-screen. Fix: `overflow-y-auto scroll-area … py-10` (the SignUp/Onboarding pattern). Re-verified reachable at 420×470.

## Verified (headless CDP)
Boots clean, zero runtime errors. All four states render. Full loop: "Preview invite page" → valid branded card (email + role + Accept) → Accept → dashboard → `jordan@northwind.co` appears as an **Active** member on the Team page (proves the shared-context bridge). Both review fixes re-verified headless (member removal propagates; Accept button reachable on a short viewport).
