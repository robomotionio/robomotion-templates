# Keyword Position Dynamics by URL

Every two weeks, checks where each tracked URL ranks for its keyword and appends a dated row carrying the new position, the delta and a status - up, down, same, new or lost.

## How it works

1. **Every Two Weeks** — an Inject trigger repeating every 1,209,600 seconds.
2. **Get Keywords And URLs** / **Collect Active Rows** — only rows whose `Active` column is truthy are checked.
3. **For Each Keyword** → **Sheet Name For URL** → **Add Tab For URL** (continue on error, so an existing tab is reused).
4. **Read Position History** → **Find Last Position** — the most recent row for that keyword in that tab is the baseline.
5. **Get SERP** → **Calculate Delta And Status** → **Append Position Row**.

Because every run appends rather than overwrites, the sheet becomes a position history you can chart. The delta column is what makes it readable at a glance: you are looking for runs of negative numbers, not absolute values. Lower positions are better, so a **positive** delta means the page moved up.

## Setup

- **DataForSEO credential** — API login and password from <https://app.dataforseo.com/api-access>.
- **Google credential** — Service Account or OAuth2 able to create tabs in the output spreadsheet.
- An input sheet with `Keyword`, `Target`, `Active`, optional `Location` and `Language`.

## Ported from

- [Track keyword position dynamics by URL in Google Sheets with DataForSEO + n8n](https://dataforseo.com/templates/track-keyword-position-dynamics-by-url-in-google-sheets-with-dataforseo-n8n/) — original n8n template
