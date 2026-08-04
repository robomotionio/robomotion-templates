# Scrape AI Mode References

Watches, in near real time, which sites Google's AI Mode pulls from when it answers questions about
your brand. Polls the AI Mode SERP every 15 minutes and appends every cited source to a Google Sheet.

## How it works

1. **Every 15 Minutes** — an Inject trigger repeating on the source scenario's 900-second interval.
2. **Set Parameters** — the brand keyword to watch and the destination spreadsheet.
3. **Get AI Mode SERP** — `DataForSEO.Account.RawRequest` posts to `/serp/google/ai_mode/live/advanced`.
4. **Collect References** — one row per cited source, de-duplicated by URL.
5. **Append References** — writes the rows to the sheet.

## Setup

- **DataForSEO credential** — API login and password from <https://app.dataforseo.com/api-access>.
- **Google credential** — Service Account or OAuth2 with access to the spreadsheet.
- A sheet with the columns `Source`, `Domain`, `URL`, `Title`, `Text`.

## Cost

A 15-minute poll is roughly 2,900 AI Mode calls a month. Lengthen the Repeat interval on the trigger
if you only need a daily picture.

## Ported from

- [Scrape references from Google AI Mode with DataForSEO + Make](https://dataforseo.com/templates/scrape-references-from-google-ai-mode-with-dataforseo-make/) — original make template
