# Bulk Domain Backlink Profiles (n8n variant)

Reads a column of domains from a Google Sheet and pulls the full backlink profile for all of them in one DataForSEO call. Port of the n8n edition of the bulk backlink profile puller.

## How it works

Identical in shape to the Make edition — the two source templates differ only in which platform they were authored on, and both call `/backlinks/bulk_pages_summary/live` with the same twenty-two output columns.

1. **Run** — an Inject trigger; the n8n original used a manual trigger.
2. **Get Targets** / **Collect Targets** — the `Target` column becomes one array of up to 1000 entries.
3. **Get Backlink Profiles** — `Account.RawRequest` posts to `/backlinks/bulk_pages_summary/live`.
4. **Merge Results Into Rows** — matched on the response's `url` field.
5. **Write Results Back** — one `SetRange` from A1.

## Setup

- **DataForSEO credential** — API login and password from <https://app.dataforseo.com/api-access>.
- **Google credential** — Service Account or OAuth2 with access to the spreadsheet.
- A sheet with a `Target` column; the twenty-two metric columns are filled in by the flow.

## Package note

Bulk Pages Summary has no dedicated node in `Robomotion.DataForSEO` 1.0.0, so the call goes through **Raw Request**.

## Ported from

- [Pull bulk domain backlink profiles to Google Sheets with DataForSEO + n8n](https://dataforseo.com/templates/pull-bulk-domain-backlink-profiles-to-google-sheets-with-dataforseo-n8n/) — original n8n template
