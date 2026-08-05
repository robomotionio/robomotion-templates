# Ranked Keywords for New Airtable Records

Watches an Airtable table for target domains that have not been looked up yet, pulls the keywords each one ranks for, writes them into a second table, and ticks the source record off so it is never processed twice.

## How it works

1. **Every 15 Minutes** — an Inject trigger repeating every 900 seconds.
2. **List Unprocessed Targets** — `filterByFormula=NOT({Processed})`, ten at a time.
3. **For Each Target** → **Get Ranked Keywords** → **Build Airtable Batches** — rows chunked into tens, the bulk-create limit.
4. **For Each Batch** → **Create Keyword Records**.
5. **Mark Target Processed** — sets `Processed`, `Keywords Found` and `Last Run` on the source row.

The `Processed` checkbox is what turns a poll into a trigger: without it a 15-minute schedule would re-run every row on every pass.

## Setup

- **DataForSEO credential** — API login and password from <https://app.dataforseo.com/api-access>.
- **Airtable credential** — a personal access token with access to the base.
- A `Targets` table with `Target`, optional `Location` and `Language`, plus `Processed` (checkbox), `Keywords Found` (number) and `Last Run` (date).
- A `Keywords` table with `Target`, `Keyword`, `Date`, `Position`, `Search Volume`, `URL`.

## Ported from

- [Get Ranked Keywords for new Airtable records with DataForSEO](https://dataforseo.com/templates/get-ranked-keywords-for-new-airtable-records-with-dataforseo-make/) — DataForSEO template
