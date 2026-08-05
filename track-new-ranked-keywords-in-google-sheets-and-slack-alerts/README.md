# Track New Ranked Keywords with Slack Alerts

Once a week, fetches every keyword your domains rank for on Google, saves the current picture to Google Sheets, and sends a Slack summary of what is newly ranking.

## How it works

The n8n edition of the new-ranked-keywords tracker, same shape as the Make one.

1. **Every Monday** — an Inject trigger repeating weekly.
2. **Get Previous Keywords** → **Index Previous Keywords** → **Clear Keywords Sheet** — the diff baseline, indexed by `target|keyword`.
3. **Get Targets** / **Collect Targets** — domain, location and language per row.
4. **For Each Target** → **Get Ranked Keywords** → **Accumulate Page** → **Go To Next Page** — pages 1000 keywords at a time.
5. **Find New Keywords** → **Append Current Snapshot** → **Post To Slack**.

## Setup

- **DataForSEO credential** — API login and password from <https://app.dataforseo.com/api-access>.
- **Google credential** — Service Account or OAuth2 with access to the spreadsheet.
- **Slack credential** — a bot token with `chat:write` on the target channel.
- Two sheets: `Targets` and `Keywords`, columns as in the source template.

## Ported from

- [Track new ranked keywords in Google Sheets with DataForSEO and Slack alerts + n8n](https://dataforseo.com/templates/track-new-ranked-keywords-in-google-sheets-with-dataforseo-and-slack-alerts-n8n/) — original n8n template
