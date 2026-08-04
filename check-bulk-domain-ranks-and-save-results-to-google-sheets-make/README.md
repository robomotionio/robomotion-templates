# Bulk Domain Rank Checker

Reads a column of target domains from a Google Sheet, scores all of them in one DataForSEO Bulk Ranks call, and writes each rank back next to its domain with the date it was measured.

## How it works

1. **Run** — an Inject trigger; the source scenario was on-demand.
2. **Get Targets** — reads the whole sheet with headers on, so each row is an object keyed by column name.
3. **Collect Targets** — flattens the `Target` column into one array. Bulk Ranks accepts up to 1000 targets per call, which is what makes this cheap: 500 domains cost the same as one.
4. **Get Bulk Ranks** — `DataForSEO.Account.RawRequest` posts to `/backlinks/bulk_ranks/live` with `rank_scale: one_thousand`.
5. **Merge Results Into Rows** — indexes the response by target and rewrites the table in place, so every row keeps its position in the sheet.
6. **Write Results Back** — one `SetRange` from A1 rather than a per-row update.

## Setup

- **DataForSEO credential** — API login and password from <https://app.dataforseo.com/api-access>.
- **Google credential** — Service Account or OAuth2 with access to the spreadsheet.
- A sheet with a `Target` column; `Date` and `Rank` are filled in by the flow.

## Package note

Bulk Ranks has no dedicated node in `Robomotion.DataForSEO` 1.0.0, so the call goes through **Raw Request**, which reaches any DataForSEO v3 endpoint by path and unwraps the response for you.

## Ported from

- [Check Bulk Domain Ranks and Save Results to Google Sheets with DataForSEO](https://dataforseo.com/templates/check-bulk-domain-ranks-and-save-results-to-google-sheets-with-dataforseo/) — original make template
