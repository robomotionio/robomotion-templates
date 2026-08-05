# Top-10 Rank Drop Alert via Gmail

Every day, pulls the keywords each target domain currently holds a top-10 position for, compares against yesterday's snapshot, and emails a digest of everything that slipped.

## How it works

The Make edition of the top-10 rank drop alert — the largest scenario in the source collection at 47 modules, reduced here to one snapshot-and-diff loop.

1. **Daily** — Inject trigger.
2. **Get Yesterday Positions** → **Index Yesterday Positions** → **Clear Keywords Sheet**.
3. **For Each Target** → **Get Top 10 Keywords** → **Accumulate Page** → **Go To Next Page**, filtered server-side to `rank_group <= 10`.
4. **Find Rank Drops** — both a worse position on page one and a fall out of page one entirely.
5. **Append Today Positions** → **Should We Email** → **Email The Drops**.

## Setup

- **DataForSEO credential** — API login and password from <https://app.dataforseo.com/api-access>.
- **Google credential** — Service Account or OAuth2 with access to the spreadsheet.
- **Gmail credential** — OAuth2 for the sending account.
- Two sheets: `Targets` and `Keywords`.

## Ported from

- [Get Keyword’s Top-10 Rank Drop Alert via Gmail with DataForSEO + Make](https://dataforseo.com/templates/get-keywords-top-10-rank-drop-alert-via-gmail-with-dataforseo-make/) — original make template
