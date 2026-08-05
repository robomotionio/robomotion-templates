# AI Overview Keyword Wins by Email

Each week, finds the keywords where your domains are newly cited inside Google's AI Overview, saves the full picture to Google Sheets, and emails the new placements.

## How it works

1. **Weekly** — Inject trigger.
2. **Index Previous Keywords** → **Clear Keywords Sheet** — the diff baseline.
3. **For Each Target** → **Get Ranked Keywords**, filtered server-side to `serp_item.type = ai_overview` → **Accumulate Page** → **Go To Next Page**.
4. **Find New Keywords** → **Append Current Snapshot** → **Email The Wins** — position, search volume and ranking URL per placement.

## Setup

- **DataForSEO credential** — API login and password from <https://app.dataforseo.com/api-access>.
- **Google credential** — Service Account or OAuth2 with access to the spreadsheet.
- **Gmail credential** — OAuth2 for the sending account.
- Two sheets: `Targets` and `Keywords`.

## Ported from

- [Get new ranked Google AI Overview keywords via email with DataForSEO](https://dataforseo.com/templates/get-new-ranked-google-ai-overview-keywords-via-email-with-dataforseo-n8n/) — DataForSEO template
