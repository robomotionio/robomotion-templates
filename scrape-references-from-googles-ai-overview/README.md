# Scrape AI Overview References

Polls the Google SERP for a keyword every 15 minutes with the AI Overview block loaded and appends
every source the overview cites to a Google Sheet.

## How it works

1. **Every 15 Minutes** — an Inject trigger repeating every 900 seconds.
2. **Set Parameters** — keyword, location, language and the extra SERP parameters
   (`load_async_ai_overview`, `group_organic_results`) that the AI Overview block needs in order to resolve.
3. **Get SERP With AI Overview** — `DataForSEO.Serp.GoogleOrganic`, 100 results deep, desktop device.
4. **Collect References** — walks every SERP element and its nested blocks, collecting each
   `references` entry and de-duplicating by URL.
5. **Append References** — writes one row per source to the sheet.

## Setup

- **DataForSEO credential** — API login and password from <https://app.dataforseo.com/api-access>.
- **Google credential** — Service Account or OAuth2 with access to the spreadsheet.
- A sheet with the columns `Source`, `Domain`, `URL`, `Title`, `Text`.

## Cost

Depth 100 counts as one paid SERP page per call.

## Ported from

- [Scrape references from Google’s AI Overview with DataForSEO](https://dataforseo.com/templates/scrape-references-from-googles-ai-overview-with-dataforseo-make/) — DataForSEO template
