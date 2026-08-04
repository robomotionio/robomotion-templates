# AI Overview Citations to Sheets

Tracks which websites Google's AI Overview cites for a keyword. Every 7 days it pulls the
Google SERP with the AI Overview block loaded, collects every source the answer references,
de-duplicates them by URL and appends them to a Google Sheet.

## How it works

1. **Every 7 Days** — an Inject trigger set to repeat weekly.
2. **Set Parameters** — the keyword, location, language and target spreadsheet. `load_async_ai_overview`
   is passed through Extra Parameters so DataForSEO fetches the AI Overview block, which Google renders
   asynchronously and would otherwise be missing from the SERP.
3. **Get AI Overview SERP** — `DataForSEO.Serp.GoogleOrganic` returns the SERP elements in rank order.
4. **Collect References** — finds the `ai_overview` element and walks both its top-level `references`
   array and the per-block `references` of expanded answers, de-duplicating by URL.
5. **Append References** — writes one row per source to the sheet.

## Setup

- **DataForSEO credential** — API login and password from <https://app.dataforseo.com/api-access>.
- **Google credential** — Service Account or OAuth2 with access to the spreadsheet.
- A sheet with the columns `Source`, `Domain`, `URL`, `Title`, `Text`.

## Cost

One live Google Organic SERP call per run.

## Ported from

- [Extract citation sources from Google AI overview to Google Sheets with DataForSEO + n8n](https://dataforseo.com/templates/extract-citation-sources-from-google-ai-overview-to-google-sheets-with-dataforseo-n8n/) — original n8n template
