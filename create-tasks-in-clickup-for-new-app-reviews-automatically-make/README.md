# App Reviews to ClickUp Tasks (Make variant)

Every morning, pulls the newest reviews for your app from both Google Play and the App Store and opens one ClickUp task per store holding the digest. Port of the Make edition.

## How it works

Identical in shape to the n8n edition — the two source templates differ only in which platform they were authored on.

1. **Daily** — Inject trigger.
2. **Submit Google Play Task** → poll `task_get` until ready → **Build Google Digest** → **Open Google Reviews Task**.
3. The same submit-and-poll shape against the Apple endpoint → **Open App Store Reviews Task**.

## Setup

- **DataForSEO credential** — API login and password from <https://app.dataforseo.com/api-access>.
- **ClickUp credential** — an API key, plus the list ID that receives the tasks.
- The Google Play package name and App Store numeric id in *Set Parameters*.

## Package note

The App Data **reviews** endpoints have no dedicated node in `Robomotion.DataForSEO` 1.0.0, so both calls go through **Raw Request**, including the polling.

## Ported from

- [Create Tasks in ClickUp for New App Reviews Automatically with DataForSEO + Make](https://dataforseo.com/templates/create-tasks-in-clickup-for-new-app-reviews-automatically-with-dataforseo-make/) — original make template
