# AI Mode References to Sheets

Tracks which websites Google's AI Mode cites when it answers a question. Every 7 days it queries
the AI Mode SERP for a keyword, flattens the references of every answer block, de-duplicates them
by URL and appends them to a Google Sheet.

## How it works

1. **Every 7 Days** — an Inject trigger set to repeat weekly.
2. **Set Parameters** — the keyword, location, language and target spreadsheet.
3. **Get AI Mode SERP** — `DataForSEO.Account.RawRequest` posts to `/serp/google/ai_mode/live/advanced`.
   AI Mode has no dedicated node in the DataForSEO package yet; Raw Request reaches any v3 endpoint by
   path and unwraps `tasks[0].result[0].items` into `msg.items` for you.
4. **Collect References** — flattens the `references` array of every answer block, de-duplicating by URL.
5. **Append References** — writes one row per source to the sheet.

## Setup

- **DataForSEO credential** — API login and password from <https://app.dataforseo.com/api-access>.
- **Google credential** — Service Account or OAuth2 with access to the spreadsheet.
- A sheet with the columns `Source`, `Domain`, `URL`, `Title`, `Text`.

## Note on the source templates

Two DataForSEO template pages describe the same automation, so this one flow covers both.

## Ported from

- [Pull references from Google AI mode to Google Sheets with DataForSEO](https://dataforseo.com/templates/pull-references-from-google-ai-mode-to-google-sheets/) — DataForSEO template
- [Pull references from Google AI mode to Google Sheets with DataForSEO](https://dataforseo.com/templates/pull-references-from-google-ai-mode-to-google-sheets-with-dataforseo-n8n/) — DataForSEO template
