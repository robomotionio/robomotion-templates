# Low-Competition Keyword Finder

For each seed domain in an input sheet, pulls every keyword the domain is relevant for, scores all of them for ranking difficulty in one bulk call, and writes the combined picture - volume, trend, difficulty, intent and average backlinks - to an opportunities sheet.

## How it works

1. **Monthly** — an Inject trigger repeating monthly.
2. **Read Seeds** / **Collect Seeds** — one row per domain: `seed`, `location_name`, `language_name`, `limit`. The last three fall back to defaults when blank.
3. **For Each Seed** → **Get Keywords For Site** — `/dataforseo_labs/google/keywords_for_site/live`.
4. **Build Difficulty Request** → **Get Keyword Difficulty** — `/dataforseo_labs/google/bulk_keyword_difficulty/live` scores up to 1000 keywords in a single request, which is far cheaper than asking per keyword. A seed that returned nothing takes the second output and skips straight to the next seed.
5. **Combine Keywords And Difficulty** → **Append Opportunities**.

The point is the join. Search volume alone tells you what people want; difficulty alone tells you what is hard. Only together do they identify a keyword worth writing for, which is why this flow always fetches both rather than filtering on either one. Sort the output sheet by difficulty ascending and volume descending and the opportunities are at the top.

## Setup

- **DataForSEO credential** — API login and password from <https://app.dataforseo.com/api-access>.
- **Google credential** — Service Account or OAuth2 with access to the spreadsheet.
- An input sheet with `seed`, `location_name`, `language_name`, `limit`, and an output sheet named `keywords_opportunities`.

## Package note

Neither endpoint has a dedicated node in `Robomotion.DataForSEO` 1.0.0, so both go through **Raw Request**. Note that the Labs `keywords_for_site` used here is a different endpoint from the existing `KeywordData.KeywordsForSite` node, which calls the Google Ads variant.

## Ported from

- [Find low-competition keyword opportunities with DataForSEO](https://dataforseo.com/templates/find-low-competition-keyword-opportunities-with-dataforseo/) — DataForSEO template
