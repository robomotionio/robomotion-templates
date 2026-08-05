# Google Ads Metrics to Sheets

Reads a column of keywords from a Google Sheet and fills in the Google Ads planner numbers for all of them in one call: monthly search volume, competition and cost per click.

## How it works

1. **Every 15 Minutes** — an Inject trigger on the source scenario's 900-second interval.
2. **Get Keywords** / **Collect Keywords** — the `Keyword` column becomes one array of up to 1000 entries; the market comes from the first row that names a `Location` or `Language`.
3. **Get Ads Metrics** — `DataForSEO.KeywordData.SearchVolume`, a first-class node in the package.
4. **Merge Metrics Into Rows** — indexes the response by keyword and rewrites the table in place so every row keeps its position.
5. **Write Metrics Back** — one `SetRange` from A1.

One call covers up to 1000 keywords, so a full keyword list costs the same as a single lookup.

## Setup

- **DataForSEO credential** — API login and password from <https://app.dataforseo.com/api-access>.
- **Google credential** — Service Account or OAuth2 with access to the spreadsheet.
- A sheet with a `Keyword` column; `Location`, `Language`, `Search Volume`, `Competition` and `CPC` are filled in by the flow.

## Ported from

- [Pull Google Ads metrics from DataForSEO API to Google Sheets with DataForSEO + Make](https://dataforseo.com/templates/pull-google-ads-metrics-from-dataforseo-api-to-google-sheets-with-dataforseo-make/) — original make template
