# Add Backlinks to Google Sheets

Pulls the live backlinks pointing at a domain every 15 minutes and appends them to a Google Sheet, one row per link, with the source page, anchor text, follow status, ranks and first/last seen dates.

## How it works

1. **Every 15 Minutes** — an Inject trigger on the source scenario's 900-second interval.
2. **Set Parameters** — the target domain, the destination sheet, and the two flags that widen the result set: `include_subdomains` counts links to `blog.example.com`, `include_indirect_links` surfaces links that reach you through a redirect or canonical.
3. **Get Backlinks** — `DataForSEO.Backlinks.Backlinks`, live status, mode `as_is`, 100 links per call.
4. **Build Rows** — sixteen columns in the source spreadsheet's order. `indirect_link_path` is an array of hops, so it is JSON-stringified into its cell.
5. **Append Backlinks** — appends to the sheet.

## Setup

- **DataForSEO credential** — API login and password from <https://app.dataforseo.com/api-access>.
- **Google credential** — Service Account or OAuth2 with access to the spreadsheet.
- A sheet whose header row matches the sixteen `url_from … indirect_link_path` columns.

## Scaling past 100 links

Raise `optLimit` (up to 1000), or wrap the call in a `Core.Flow.Label` / `Core.Flow.GoTo` pair that walks `optOffset` — the toxic-backlink templates in this set show that pattern.

## Ported from

- [Add backlinks to Google Sheets from DataForSEO + Make](https://dataforseo.com/templates/add-backlinks-to-google-sheets-from-dataforseo-make/) — original make template
