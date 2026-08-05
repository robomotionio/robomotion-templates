# Bulk Domain Backlink Profiles

Reads a column of domains from a Google Sheet and pulls the full backlink profile for all of them in one DataForSEO call - rank, spam score, broken links, referring domains, IPs, subnets and the TLD, type, attribute, platform, location and country breakdowns.

## How it works

1. **Run** — an Inject trigger; run it on demand, or give it a repeat interval.
2. **Get Targets** / **Collect Targets** — the `Target` column becomes one array of up to 1000 entries.
3. **Get Backlink Profiles** — `Account.RawRequest` posts to `/backlinks/bulk_pages_summary/live` with `rank_scale: one_thousand` and `include_subdomains: true`.
4. **Merge Results Into Rows** — twenty-two metric columns per domain. The distribution fields (`Referring links TLD`, `types`, `attributes`, `platform types`, `semantic locations`, `countries`) are objects, so they are JSON-stringified into their cell rather than dropped.
5. **Write Results Back** — one `SetRange` from A1.

Note the response is keyed on `url`, not `target`, for this endpoint — the merge step matches on that.

## Setup

- **DataForSEO credential** — API login and password from <https://app.dataforseo.com/api-access>.
- **Google credential** — Service Account or OAuth2 with access to the spreadsheet.
- A sheet with a `Target` column; the twenty-two metric columns are filled in by the flow.

## Package note

Bulk Pages Summary has no dedicated node in `Robomotion.DataForSEO` 1.0.0, so the call goes through **Raw Request**.

## Ported from

This flow covers both DataForSEO template pages for the same automation.

- [Bulk Domain Backlink Profiles](https://dataforseo.com/templates/pull-bulk-domain-backlink-profiles-to-google-sheets-with-dataforseo-make/) — DataForSEO template
- [Bulk Domain Backlink Profiles](https://dataforseo.com/templates/pull-bulk-domain-backlink-profiles-to-google-sheets-with-dataforseo-n8n/) — DataForSEO template
