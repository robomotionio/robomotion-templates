# Top-10 Rank Drop Alerts by Email

Every day, pulls the keywords each target domain currently holds a top-10 position for, compares against yesterday's snapshot, and emails a digest of everything that slipped.

## How it works

1. **Daily** — an Inject trigger repeating every 86,400 seconds.
2. **Get Yesterday Positions** → **Index Yesterday Positions** → **Clear Keywords Sheet** — the index maps `target|keyword` to yesterday's position.
3. **For Each Target** → **Get Top 10 Keywords** → **Accumulate Page** → **Go To Next Page** — a nested `Label`/`GoTo` loop, filtered server-side to `rank_group <= 10`.
4. **Find Rank Drops** — reports two kinds of loss: a keyword still on page one but at a worse position, and a keyword that was on page one yesterday and is absent from today's set entirely.
5. **Append Today Positions** → **Should We Email** → **Email The Drops**.

Losing page one is the most expensive ranking event there is, and it is usually silent. This is the alert that makes it loud.

The snapshot is written for every target; only targets with drops get mail. The first run establishes the baseline and alerts on nothing.

## Setup

- **DataForSEO credential** — API login and password from <https://app.dataforseo.com/api-access>.
- **Google credential** — Service Account or OAuth2 with access to the spreadsheet.
- **Gmail credential** — OAuth2 for the sending account.
- Two sheets: `Targets` (`Target`, `Location`, `Language`) and `Keywords` (`Target`, `Keyword`, `Date`, `Rank`, `Search Volume`, `URL`).

## Ported from

- [Get Gmail alerts for dropped top 10 keyword rankings with DataForSEO + n8n](https://dataforseo.com/templates/get-gmail-alerts-for-dropped-top-10-keyword-rankings-with-dataforseo-n8n/) — original n8n template
