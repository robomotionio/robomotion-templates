# Top-10 Keywords to Airtable with Slack Alerts

Each week, finds the keywords where your domains have broken into Google's first page, logs them to Airtable, and alerts Slack.

## How it works

The n8n edition of the top-10 keyword logger.

1. **Weekly** — Inject trigger.
2. **Index Previous Keywords** → **Clear Keywords Sheet** — the diff baseline.
3. **For Each Target** → **Get Ranked Keywords**, filtered on `rank_group <= 10` → **Accumulate Page** → **Go To Next Page**.
4. **Find New Keywords** → **Append Current Snapshot** → **For Each Batch** → **Create Airtable Records** → **Post To Slack**.

This is deliberately the narrowest of the ranked-keyword alerts in this set: it only fires when something reaches a position that actually earns clicks.

## Setup

- **DataForSEO credential** — API login and password from <https://app.dataforseo.com/api-access>.
- **Google credential** — Service Account or OAuth2 with access to the spreadsheet.
- **Airtable credential** — a personal access token, plus the base ID and table name.
- **Slack credential** — a bot token with `chat:write`.
- Two sheets: `Targets` and `Keywords`.

## Ported from

- [Log new top-10 Google keywords to Airtable with Slack alerts [DataForSEO + n8n]](https://dataforseo.com/templates/log-new-google-top-10-keywords-to-airtable-with-dataforseo-and-slack-alerts-n8n/) — original n8n template
