# App Review Alerts to Slack (Make variant)

Every morning, pulls the newest reviews for your app from both Google Play and the App Store and posts a digest per store to Slack. Port of the Make edition.

## How it works

Identical in shape to the n8n edition — the two source templates differ only in which platform they were authored on.

1. **Daily** — Inject trigger.
2. **Submit Google Play Task** → poll `task_get` until ready → **Build Google Digest** → **Post Google Reviews**.
3. The same submit-and-poll shape against the Apple endpoint → **Post App Store Reviews**.

## Setup

- **DataForSEO credential** — API login and password from <https://app.dataforseo.com/api-access>.
- **Slack credential** — a bot token with `chat:write`.
- The Google Play package name and App Store numeric id in *Set Parameters*.

## Package note

The App Data **reviews** endpoints have no dedicated node in `Robomotion.DataForSEO` 1.0.0, so both calls go through **Raw Request**, including the polling.

## Ported from

- [Send Slack alerts for new app reviews from Google Play and App Store with DataForSEO + Make](https://dataforseo.com/templates/send-slack-alerts-for-new-app-reviews-from-google-play-and-app-store-with-dataforseo-make/) — original make template
