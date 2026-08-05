# New Featured Snippet Keywords by Email

Each week, finds the keywords where your domains now hold Google's featured snippet - position zero, above the first organic result - and emails the ones that are new since last week.

## How it works

Same delta-detection shape as the other ranked-keyword templates in this set, with one difference that matters: the filter `ranked_serp_element.serp_item.type = featured_snippet` runs **server-side**, so you are not paying to download and discard every other keyword the domain ranks for.

1. **Weekly** — Inject trigger.
2. **Index Previous Keywords** → **Clear Keywords Sheet** — the diff baseline.
3. **For Each Target** → **Get Ranked Keywords** (filtered) → **Accumulate Page** → **Go To Next Page**.
4. **Find New Keywords** → **Append Current Snapshot** → **Email The Wins** — an HTML list with position, volume and ranking URL.

## Setup

- **DataForSEO credential** — API login and password from <https://app.dataforseo.com/api-access>.
- **Google credential** — Service Account or OAuth2 with access to the spreadsheet.
- **Gmail credential** — OAuth2 for the sending account.
- Two sheets: `Targets` and `Keywords`.

## Ported from

- [Get New Ranked Keywords in Featured Snippet with DataForSEO](https://dataforseo.com/templates/get-new-ranked-keywords-in-featured-snippet-with-dataforseo-make/) — DataForSEO template
