# Settings · Notifications (`settings-notifications`)

## Purpose
Choose which events notify you and on which channels. Component: `SettingsNotificationsPage` (in `SettingsShell`).

## Entry points
- Settings → Notifications.

## Components & state
- `SettingsNotificationsPage` — `CHANNELS` (event types: SMS received, Email opened, Deal stage changed, Deal won, …) with per-event toggles, likely across delivery channels (in-app/email/Slack).

## Use cases
- Turn notifications on/off per event; pick delivery channel per event.

## Step-by-step flow
1. Toggle events on/off (and channel where present) → Save (toast).

## Limitations
- Preferences are static toggles; no notifications are actually delivered; no real-time events.

## Suggestions
1. Real notification pipeline (in-app bell feed, email, Slack, push) driven by app events.
2. Per-channel matrix (event × channel) + digest vs immediate; quiet hours.
3. Mute per-record (this deal/contact); team-wide defaults vs personal overrides.
4. Wire the sidebar bell dropdown to the same event store.

## Related
[settings-team.md](settings-team.md) · [00-system-overview.md](00-system-overview.md)