# Global email compliance — mandatory footer + real unsubscribe (2026-07-08)

_A CAN-SPAM/GDPR compliance pass on outbound email, from a full audit of the email paths. The owner's ask: "every email should have global compliance rules like an unsubscribe link." The audit found the code made a legal promise it didn't keep._

## What was wrong (audit findings)
There was **no global, centrally-enforced** email compliance. The pieces existed but weren't connected:
1. **The unsubscribe link was a dead anchor** — `<a href="#" onClick={preventDefault}>Unsubscribe</a>` — despite code comments claiming it "suppresses the contact at send time." It did nothing.
2. **The footer address was per-template and hardcoded** — `ebUnsub()` baked in `'nrtur, Inc. · 100 Market St…'`, editable per template, so it could be wrong, blank, or inconsistent. It even **disagreed with the verified A2P/Trust business address** (`2261 Market St`).
3. **The global "include unsubscribe" toggle was decorative** — `compliance.unsubLink` was never read by any send path.
4. **1:1 Compose had no suppression check at all** — `handleSend` sent to anyone, even a suppressed address (unlike SMS's `canSendSms`).

## What shipped

**One source of truth for sender identity.** New `_senderIdentity()` reads the workspace's legal name + postal address from the verified **Business/Trust profile** (`_liveTrustProfile`) — the same identity already used for A2P. The footer renders these globally; `ebUnsub()` no longer stores a per-template address, and the builder's per-template address input is replaced by a **read-only display of the global value** ("pulled from your Business profile so it's identical on every email"). No more drift, no more `100 Market St` vs `2261 Market St`.

**The footer is mandatory, not a toggle.** On Settings › Deliverability, the "Unsubscribe link + postal address" rule now shows a locked **Required** pill instead of an on/off switch — it's the law, so it's always on. The section also gained a **Sender identity card** (with a "complete your address" warning if the profile is blank) and a **live footer preview**.

**The unsubscribe link is real.** The footer preview's Unsubscribe button (`testUnsub`) writes a real opt-out into the **suppression store** — the same store every marketing/bulk send already honors via `supEmailBlocked` — and jumps to the Email list so you can see it land. This closes the loop the old comments only claimed.

**1:1 Compose now respects suppression, correctly.** `handleSend` uses the store's scope-awareness, checked across **every recipient — To + Cc + Bcc**:
- a **hard suppression** (bounce, complaint, do-not-contact-all, domain block → `supEmailBlocked(r,'transactional')`) **blocks** the send, disables the Send button, and shows a red banner naming the offending address;
- a **marketing-only opt-out** (`supEmailBlocked(r,'marketing')`) shows an amber warning but **allows** the send — a human 1:1 reply to someone who unsubscribed from newsletters is legitimate and shouldn't be blocked.

_(The adversarial review caught that the first cut checked only `To`, so a hard-suppressed address hidden in Cc/Bcc slipped through — now fixed to scan all recipients.)_

**Starter templates cleaned up.** Four built-in starters shipped dead plain-text "Unsubscribe" lines (some with no address); they're replaced with the real global `ebUnsub()` footer block, so every starter is compliant on every path (and `ebEnsureUnsub` still guarantees exactly one footer in the builder).

## Verified (headless CDP)
Boots clean, zero runtime errors. Settings shows the Required pill, the sender-identity card (`Northlight Digital LLC · 2261 Market St`), and the footer preview; the old hardcoded `100 Market St` is gone. Clicking the preview's Unsubscribe writes `preview.unsubscribe@example.com` into the suppression Email list. The scope logic that drives Compose is confirmed: `supEmailBlocked(…,'marketing')`=blocked, `(…,'transactional')`=allowed. The email builder footer renders the global address. Two-lens adversarial review + verify pass.

## What the owner still decides / remaining paths
- **Deferred (acknowledged):** the **reply composer** (inbox) and **sequence/automation send steps** don't yet route through a single send-time footer/suppression chokepoint — the audit's "one `withComplianceFooter()` injector" is the larger follow-up. Sequence *enrollment* already checks suppression; per-message re-check + footer injection is the next slice. The template footer (which sequences use) is now global and compliant.
- Marketing-vs-transactional exemption list (which mail is exempt from the unsubscribe requirement) — the `sendScope` plumbing exists; policy is the owner's call.
