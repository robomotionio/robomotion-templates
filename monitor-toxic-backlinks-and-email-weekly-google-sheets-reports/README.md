# Weekly Toxic Backlink Report

Every week, pulls every backlink first seen in the last seven days whose spam score is above the threshold, drops them into a fresh Google Sheet named after the domain and the date, and emails you the link.

## How it works

1. **Weekly** — an Inject trigger repeating every 604,800 seconds.
2. **Set Parameters** — target, notification address, spam threshold, and a `first_seen` cutoff computed as *today minus seven days*.
3. **Get Spam Backlinks** → **Accumulate Page** → **Go To Next Page** — a `Label` / `GoTo` loop walking `optOffset` 1000 at a time.
4. **Build Report Table** — eleven columns per link.
5. **Create Spreadsheet** → **Write Report** → **Send Report**.

The `first_seen` filter is what makes this a *weekly* report rather than a full audit: you only ever see links that appeared since the last run, so the report stays short enough to actually read.

A week with no new toxic links takes the third branch out of *Accumulate Page* and logs a line instead of sending an empty report.

## Setup

- **DataForSEO credential** — API login and password from <https://app.dataforseo.com/api-access>.
- **Google credential** — Service Account or OAuth2 able to create spreadsheets.
- **Gmail credential** — OAuth2 for the account that sends the report.

## Ported from

- [Monitor toxic backlinks and email weekly Google Sheets reports with DataForSEO](https://dataforseo.com/templates/monitor-toxic-backlinks-and-email-weekly-google-sheets-reports-with-dataforseo-n8n/) — DataForSEO template
