# New Top-10 Keywords to Airtable

Each week, finds the keywords where your domains have broken into Google's first page, writes them to an Airtable base, and posts a summary to Slack.

## How it works

1. **Weekly** — Inject trigger.
2. **Index Previous Keywords** → **Clear Keywords Sheet** — the diff baseline.
3. **For Each Target** → **Get Ranked Keywords**, filtered server-side on `rank_group <= 10` → **Accumulate Page** → **Go To Next Page**.
4. **Find New Keywords** → **Append Current Snapshot** → **For Each Batch** → **Create Airtable Records** → **Post To Slack**.

The Airtable write loops in batches of ten because that is the hard limit of the bulk-create endpoint.

Page one is where the traffic is — a keyword moving from 14 to 9 is worth more than ten new keywords ranking at 60, and this is the alert that catches it.

## Setup

- **DataForSEO credential** — API login and password from <https://app.dataforseo.com/api-access>.
- **Google credential** — Service Account or OAuth2 with access to the spreadsheet.
- **Airtable credential** — a personal access token, plus the base ID and table name.
- **Slack credential** — a bot token with `chat:write`.
- Two sheets: `Targets` and `Keywords`.

## Ported from

- [Log New Ranked Keywords in Top 10 Google Results in Airtable with DataForSEO](https://dataforseo.com/templates/log-new-ranked-keywords-in-top-10-google-results-in-airtable-with-dataforseo-make/) — DataForSEO template
