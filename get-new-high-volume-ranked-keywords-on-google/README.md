# New High-Volume Ranked Keywords

Each week, finds the keywords above your search-volume bar that your domains have started ranking for, opens one Asana task holding the list, and posts a summary to Slack.

## How it works

1. **Weekly** — Inject trigger.
2. **Index Previous Keywords** → **Clear Keywords Sheet** — the diff baseline.
3. **For Each Target** → **Get Ranked Keywords**, filtered server-side on `keyword_info.search_volume > 1000` → **Accumulate Page** → **Go To Next Page**.
4. **Find New Keywords** → **Append Current Snapshot** → **Open Asana Task** → **Post To Slack**.

The volume filter is the point. A domain gains dozens of long-tail keywords a week and almost none of them matter; filtering server-side means the alert only fires for the ones worth a content or link decision. Change `msg.min_search_volume` in **Set Parameters** to move the bar.

## Setup

- **DataForSEO credential** — API login and password from <https://app.dataforseo.com/api-access>.
- **Google credential** — Service Account or OAuth2 with access to the spreadsheet.
- **Slack credential** — a bot token with `chat:write`.
- **Asana credential** — a Personal Access Token, plus a project GID (or workspace GID).
- Two sheets: `Targets` and `Keywords`.

## Ported from

- [Get New High-Volume Ranked Keywords on Google with DataForSEO + Make](https://dataforseo.com/templates/get-new-high-volume-ranked-keywords-on-google-with-dataforseo-make/) — original make template
