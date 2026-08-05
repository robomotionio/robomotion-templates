# Track New and Lost Referring Domains

Reads a column of domains from a Google Sheet and pulls, in one DataForSEO call, how many referring domains each of them gained and lost - counted both per domain and per main domain - stamped with the date.

## How it works

1. **Run** — an Inject trigger; the source scenario was on-demand.
2. **Get Targets** / **Collect Targets** — the `Target` column becomes one array of up to 1000 entries.
3. **Get New and Lost Referring Domains** — `Account.RawRequest` posts to `/backlinks/bulk_new_lost_referring_domains/live`.
4. **Merge Results Into Rows** — writes the four count columns and `Date` onto the matching row.
5. **Write Results Back** — one `SetRange` from A1.

Referring domains move slower than raw backlink counts, which makes them the better signal that a link-building campaign is actually landing.

## Setup

- **DataForSEO credential** — API login and password from <https://app.dataforseo.com/api-access>.
- **Google credential** — Service Account or OAuth2 with access to the spreadsheet.
- A sheet with a `Target` column; the count columns are filled in by the flow.

## Package note

Bulk New/Lost Referring Domains has no dedicated node in `Robomotion.DataForSEO` 1.0.0, so the call goes through **Raw Request**.

## Ported from

- [Track New and Lost Referring Domains in Bulk with DataForSEO and Google Sheets + Make](https://dataforseo.com/templates/track-new-and-lost-referring-domains-in-bulk-with-dataforseo-and-google-sheets-make/) — original make template
