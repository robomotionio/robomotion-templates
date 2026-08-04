# Bulk Domain Spam Score Checker

Reads a column of domains from a Google Sheet, scores all of them in one DataForSEO Bulk Spam Score call, and writes each 0-100 score back next to its domain with the date it was measured.

## How it works

1. **Run** — an Inject trigger; the source scenario was on-demand.
2. **Get Targets** — reads the whole sheet with headers on.
3. **Collect Targets** — flattens the `Target` column into one array of up to 1000 entries.
4. **Get Spam Scores** — `DataForSEO.Backlinks.BulkSpamScore`, a first-class node in the package.
5. **Merge Scores Into Rows** — indexes the response by target and rewrites the table in place.
6. **Write Scores Back** — one `SetRange` from A1.

Run it over a prospect list before you buy links, or over your own referring domains to spot a toxic neighbourhood early.

## Setup

- **DataForSEO credential** — API login and password from <https://app.dataforseo.com/api-access>.
- **Google credential** — Service Account or OAuth2 with access to the spreadsheet.
- A sheet with a `Target` column; `Date` and `Spam Score` are filled in by the flow.

## Ported from

- [Check bulk domain spam scores and save results to Google Sheets with DataForSEO + Make](https://dataforseo.com/templates/check-bulk-domain-spam-scores-and-save-results-to-google-sheets-with-dataforseo-make/) — original make template
