# App Review Alerts to Slack

Every morning, pulls the newest reviews for your app from both Google Play and the App Store, keeps only the ones written since the last run, and posts a digest per store to Slack.

## How it works

1. **Daily** — an Inject trigger repeating every 86,400 seconds.
2. **Submit Google Play Task** → **Read Google Task Id** → **Wait For Google** → **Get Google Reviews** → **Is Google Ready** → **Poll Google Again** — app reviews have no live endpoint, so the call submits a task and polls `task_get` every 15 seconds until DataForSEO reports status 20000 or the attempt budget runs out.
3. **Build Google Digest** — keeps reviews newer than the cutoff and formats them.
4. **Post Google Reviews** → the same submit-and-poll shape against the Apple endpoint → **Post App Store Reviews**.

Reviews are the fastest signal you have that a release broke something. A digest at 9am beats a dashboard nobody opens.

A store with no new reviews is skipped rather than posting an empty message.

## Setup

- **DataForSEO credential** — API login and password from <https://app.dataforseo.com/api-access>.
- **Slack credential** — a bot token with `chat:write`.
- The Google Play package name (e.g. `com.duolingo`) and the App Store numeric id in *Set Parameters*.

## Tuning the cutoff

`msg.since` defaults to 24 hours back. Keep it in step with the trigger interval so nothing is reported twice and nothing is missed.

## Package note

The App Data **reviews** endpoints have no dedicated node in `Robomotion.DataForSEO` 1.0.0 — the package covers Play/App Store *search* and *app info* — so both calls go through **Raw Request**, including the polling.

## Ported from

This flow covers both DataForSEO template pages for the same automation.

- [App Review Alerts to Slack](https://dataforseo.com/templates/send-slack-alerts-for-new-app-reviews-from-google-play-and-app-store-with-dataforseo-make/) — DataForSEO template
- [App Review Alerts to Slack](https://dataforseo.com/templates/send-slack-alerts-for-new-app-reviews-from-google-play-and-app-store-with-dataforseo-n8n/) — DataForSEO template
