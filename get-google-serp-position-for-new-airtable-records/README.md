# SERP Position for Airtable Records

Watches an Airtable table for keyword/domain pairs that have not been checked yet, looks up where the domain ranks for that keyword on Google, and writes the position back onto the record.

## How it works

1. **Every 15 Minutes** — an Inject trigger repeating every 900 seconds.
2. **List Unchecked Records** — `filterByFormula=NOT({Processed})`, ten at a time.
3. **For Each Record** → **Build SERP Request** → **Get SERP Position**.
4. **Build Record Update** → **Write Position Back** — sets `Position`, `URL`, `Checked` and `Processed`.

The lookup passes `target` through Extra Parameters, so DataForSEO filters the SERP to that domain server-side and the first item *is* the position — which is why the depth can stay at 1.

## Setup

- **DataForSEO credential** — API login and password from <https://app.dataforseo.com/api-access>.
- **Airtable credential** — a personal access token with access to the base.
- A table with `Keyword`, `Target`, optional `Location` and `Language`, plus `Position`, `URL`, `Checked` and `Processed` (checkbox).

## Ported from

- [Get Google SERP position for new Airtable records with DataForSEO](https://dataforseo.com/templates/get-google-serp-position-for-new-airtable-records-with-dataforseo-make/) — DataForSEO template
