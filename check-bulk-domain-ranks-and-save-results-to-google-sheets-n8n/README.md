# Bulk Domain Rank Checker (n8n variant)

Reads a column of target domains from a Google Sheet, scores all of them in one DataForSEO Bulk Ranks call, and writes each rank back next to its domain with the date it was measured. Port of the n8n edition of the bulk rank checker.

## How it works

Identical in shape to the Make edition — the two source templates differ only in which platform they were authored on.

1. **Run** — an Inject trigger; the n8n original used a manual trigger.
2. **Get Targets** — reads the whole sheet with headers on.
3. **Collect Targets** — flattens the `Target` column into one array of up to 1000 entries.
4. **Get Bulk Ranks** — `DataForSEO.Account.RawRequest` posts to `/backlinks/bulk_ranks/live`.
5. **Merge Results Into Rows** — indexes by target and rewrites the table in place.
6. **Write Results Back** — one `SetRange` from A1.

## Setup

- **DataForSEO credential** — API login and password from <https://app.dataforseo.com/api-access>.
- **Google credential** — Service Account or OAuth2 with access to the spreadsheet.
- A sheet with a `Target` column; `Date` and `Rank` are filled in by the flow.

## Package note

Bulk Ranks has no dedicated node in `Robomotion.DataForSEO` 1.0.0, so the call goes through **Raw Request**.

## Ported from

- [Check bulk domain ranks and save results to Google Sheets with DataForSEO + n8n](https://dataforseo.com/templates/check-bulk-domain-ranks-and-save-results-to-google-sheets-with-dataforseo-n8n/) — original n8n template
