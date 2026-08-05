# Keyword Cluster by URL

Every two weeks, takes a list of URLs from an input sheet and, for each one, pulls the full set of keywords that URL ranks for into its own tab of an output spreadsheet - keyword, position, volume, difficulty, CPC, competition, intent, SERP feature type and estimated traffic.

## How it works

1. **Every Two Weeks** — an Inject trigger repeating every 1,209,600 seconds.
2. **Get URLs** → **Collect Active URLs** — rows whose `Active` column is falsy (blank, FALSE, 0, no) are parked without being deleted.
3. **For Each URL** → **Sheet Name For URL** — the URL is flattened into a legal tab name (Sheets forbids `: \ / ? * [ ]` and caps at 100 characters).
4. **Add Tab For URL** — set to continue on error, so a tab left over from a previous run is reused rather than failing the run.
5. **Get Ranked Keywords** → **Build Cluster Table** → **Write Cluster**.

The set of keywords one URL ranks for *is* the cluster. Reading it back tells you what Google thinks the page is about, which is usually more useful than what you intended it to be about.

## Setup

- **DataForSEO credential** — API login and password from <https://app.dataforseo.com/api-access>.
- **Google credential** — Service Account or OAuth2 able to create sheet tabs in the output spreadsheet.
- An input sheet with `Target` and `Active` columns.

## Ported from

- [Collect keyword cluster by URL in Google Sheets with DataForSEO](https://dataforseo.com/templates/collect-keyword-cluster-by-url-in-google-sheets-with-dataforseo-n8n/) — DataForSEO template
