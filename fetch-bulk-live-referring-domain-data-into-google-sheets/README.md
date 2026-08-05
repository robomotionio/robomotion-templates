# Bulk Referring Domain Data

Reads a column of domains from a Google Sheet and pulls the live referring-domain counts for all of them in one DataForSEO call, writing the follow and nofollow breakdown back next to each domain.

## How it works

1. **Run** — an Inject trigger; the source scenario was on-demand.
2. **Get Targets** / **Collect Targets** — the `Target` column becomes one array of up to 1000 entries.
3. **Get Referring Domain Counts** — `Account.RawRequest` posts to `/backlinks/bulk_referring_domains/live`.
4. **Merge Results Into Rows** — writes `Referring domains`, `Nofollow referring domains`, `Referring main domains` and `Nofollow main referring domains` onto the matching row.
5. **Write Results Back** — one `SetRange` from A1.

## Setup

- **DataForSEO credential** — API login and password from <https://app.dataforseo.com/api-access>.
- **Google credential** — Service Account or OAuth2 with access to the spreadsheet.
- A sheet with a `Target` column; the rest are filled in by the flow.

## Package note

Bulk Referring Domains has no dedicated node in `Robomotion.DataForSEO` 1.0.0, so the call goes through **Raw Request**.

## Ported from

- [Fetch bulk live referring domain data into Google Sheets with DataForSEO + Make](https://dataforseo.com/templates/fetch-bulk-live-referring-domain-data-into-google-sheets-with-dataforseo-make/) — original make template
