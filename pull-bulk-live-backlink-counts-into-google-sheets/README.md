# Bulk Live Backlink Counts

Reads a column of domains from a Google Sheet and pulls the live backlink count for all of them in one DataForSEO call, stamping each count with the date it was measured.

## How it works

1. **Run** — an Inject trigger; the source scenario was on-demand.
2. **Get Targets** / **Collect Targets** — the `Target` column becomes one array of up to 1000 entries.
3. **Get Backlink Counts** — `Account.RawRequest` posts to `/backlinks/bulk_backlinks/live`.
4. **Merge Results Into Rows** — writes `Date` and `Backlinks` onto the matching row.
5. **Write Results Back** — one `SetRange` from A1.

Set the trigger to repeat and the sheet becomes a link-growth log you can chart.

## Setup

- **DataForSEO credential** — API login and password from <https://app.dataforseo.com/api-access>.
- **Google credential** — Service Account or OAuth2 with access to the spreadsheet.
- A sheet with a `Target` column; `Date` and `Backlinks` are filled in by the flow.

## Package note

Bulk Backlinks has no dedicated node in `Robomotion.DataForSEO` 1.0.0, so the call goes through **Raw Request**.

## Ported from

- [Pull Bulk Live Backlink Counts into Google Sheets with DataForSEO + Make](https://dataforseo.com/templates/pull-bulk-live-backlink-counts-into-google-sheets-with-dataforseo-make/) — original make template
