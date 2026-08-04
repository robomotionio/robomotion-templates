# Featured Snippet Wins by Email

Each week, finds the keywords where your domains now hold Google's featured snippet and emails the new ones with position, search volume and the ranking URL.

## How it works

The n8n edition of the featured-snippet tracker.

1. **Weekly** — Inject trigger.
2. **Index Previous Keywords** → **Clear Keywords Sheet** — the diff baseline.
3. **For Each Target** → **Get Ranked Keywords**, filtered server-side to `serp_item.type = featured_snippet` → **Accumulate Page** → **Go To Next Page**.
4. **Find New Keywords** → **Append Current Snapshot** → **Email The Wins**.

Featured snippets change hands week to week, which is exactly why a weekly diff beats a dashboard you have to remember to open.

## Setup

- **DataForSEO credential** — API login and password from <https://app.dataforseo.com/api-access>.
- **Google credential** — Service Account or OAuth2 with access to the spreadsheet.
- **Gmail credential** — OAuth2 for the sending account.
- Two sheets: `Targets` and `Keywords`.

## Ported from

- [Track new Featured Snippet keyword wins via email with DataForSEO + n8n](https://dataforseo.com/templates/track-new-featured-snippet-keyword-wins-via-email-with-dataforseo-n8n/) — original n8n template
