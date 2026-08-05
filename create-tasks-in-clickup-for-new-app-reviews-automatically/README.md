# App Reviews to ClickUp Tasks

Every morning, pulls the newest reviews for your app from both Google Play and the App Store, keeps only the ones written since the last run, and opens one ClickUp task per store holding the digest.

## How it works

1. **Daily** — an Inject trigger repeating every 86,400 seconds.
2. **Submit Google Play Task** → **Read Google Task Id** → **Wait For Google** → **Get Google Reviews** → **Is Google Ready** → **Poll Google Again** — app reviews have no live endpoint, so the call submits a task and polls until DataForSEO reports status 20000.
3. **Build Google Digest** → **Open Google Reviews Task**.
4. The same submit-and-poll shape against the Apple endpoint → **Open App Store Reviews Task**.

A task rather than a message, because reviews usually need a reply or a bug filed — putting them in the tracker means they get triaged instead of scrolled past.

A store with no new reviews creates no task.

## Setup

- **DataForSEO credential** — API login and password from <https://app.dataforseo.com/api-access>.
- **ClickUp credential** — an API key, plus the list ID that receives the tasks.
- The Google Play package name and App Store numeric id in *Set Parameters*.

## Package note

The App Data **reviews** endpoints have no dedicated node in `Robomotion.DataForSEO` 1.0.0, so both calls go through **Raw Request**, including the polling.

## Ported from

This flow covers both DataForSEO template pages for the same automation.

- [App Reviews to ClickUp Tasks](https://dataforseo.com/templates/create-tasks-in-clickup-for-new-app-reviews-automatically-with-dataforseo-make/) — DataForSEO template
- [App Reviews to ClickUp Tasks](https://dataforseo.com/templates/create-tasks-in-clickup-for-new-app-reviews-automatically-with-dataforseo-n8n/) — DataForSEO template
