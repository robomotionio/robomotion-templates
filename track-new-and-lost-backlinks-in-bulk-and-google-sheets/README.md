# Track New and Lost Backlinks

Reads a column of domains from a Google Sheet and pulls, in one DataForSEO call, how many backlinks each of them gained and lost, stamped with the date.

## How it works

1. **Run** — an Inject trigger; run it on demand, or give it a repeat interval.
2. **Get Targets** / **Collect Targets** — the `Target` column becomes one array of up to 1000 entries.
3. **Get New and Lost Backlinks** — `Account.RawRequest` posts to `/backlinks/bulk_new_lost_backlinks/live`.
4. **Merge Results Into Rows** — writes `Date`, `New backlinks` and `Lost backlinks` onto the matching row.
5. **Write Results Back** — one `SetRange` from A1.

Set the trigger to repeat weekly and the sheet becomes a link velocity log: a spike in lost backlinks on one domain is the earliest warning that a placement was pulled or a partner site went down.

## Setup

- **DataForSEO credential** — API login and password from <https://app.dataforseo.com/api-access>.
- **Google credential** — Service Account or OAuth2 with access to the spreadsheet.
- A sheet with a `Target` column; the count columns are filled in by the flow.

## Package note

Bulk New/Lost Backlinks has no dedicated node in `Robomotion.DataForSEO` 1.0.0, so the call goes through **Raw Request**.

## Ported from

- [Track New and Lost Backlinks in Bulk with DataForSEO and Google Sheets](https://dataforseo.com/templates/track-new-and-lost-backlinks-in-bulk-with-dataforseo-and-google-sheets-make/) — DataForSEO template
