# New Ranked Keywords to Slack

Each week, pulls every keyword your target domains rank for, compares it against last week's snapshot, and posts whatever is new to Slack.

## How it works

1. **Weekly** — an Inject trigger repeating every 604,800 seconds.
2. **Get Previous Keywords** → **Index Previous Keywords** → **Clear Keywords Sheet** — the previous snapshot is read and indexed by `target|keyword`, then wiped. That index is the diff baseline.
3. **Get Targets** / **Collect Targets** — one entry per row of the Targets sheet: domain, location, language.
4. **For Each Target** → **Get Ranked Keywords** → **Accumulate Page** → **Go To Next Page** — a nested `Label`/`GoTo` loop pages 1000 keywords at a time until `total_count` is exhausted.
5. **Find New Keywords** — builds the full current snapshot and, separately, the rows whose key was absent from the previous one.
6. **Append Current Snapshot** → **Post To Slack**.

The sheet always holds the present; Slack always holds the change.

## Setup

- **DataForSEO credential** — API login and password from <https://app.dataforseo.com/api-access>.
- **Google credential** — Service Account or OAuth2 with access to the spreadsheet.
- **Slack credential** — a bot token with `chat:write` on the target channel.
- Two sheets: `Targets` (`Target`, `Location`, `Language`) and `Keywords` (`Target`, `Keyword`, `Date`, `Rank`, `Search Volume`, `URL`, `SERP Item Types`).

## First run

With an empty Keywords sheet every keyword counts as new, so the first Slack message is the whole list. That is the baseline; subsequent runs are the interesting ones.

## Ported from

- [Get New Ranked Keywords from Google with DataForSEO](https://dataforseo.com/templates/get-new-ranked-keywords-from-google-with-dataforseo-make/) — DataForSEO template
