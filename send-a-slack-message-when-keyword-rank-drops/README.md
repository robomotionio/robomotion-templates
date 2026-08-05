# Slack Alert on Keyword Rank Drop

Every morning, checks where each tracked URL ranks for its keyword, compares against the position recorded on the last run, and posts to Slack only when a keyword has moved down.

## How it works

1. **Daily** — an Inject trigger repeating every 86,400 seconds.
2. **Get Tracked Keywords** / **Collect Tracked Rows** — each row keeps its index so the new position lands on the right line.
3. **For Each Keyword** → **Get SERP** — 100 results deep, desktop.
4. **Find Position And Compare** — a two-output Function. Port 0 fires when the rank got worse or the keyword fell out of the top 100 entirely; port 1 is everything else.
5. **Post Drop To Slack** (port 0 only) → **Build Row Update** → **Write Rank Back**.

The sheet is the memory: the previous rank sits in a column and is overwritten each run, so the flow needs no database. That also means the first run establishes the baseline and alerts on nothing.

A keyword that falls out of the top 100 is reported as *lost* rather than silently skipped — which is the drop you most want to hear about.

## Setup

- **DataForSEO credential** — API login and password from <https://app.dataforseo.com/api-access>.
- **Google credential** — Service Account or OAuth2 with access to the spreadsheet.
- **Slack credential** — a bot token with `chat:write`.
- A sheet with `Keyword`, `Target`, `Location`, `Language`, `Rank` and `Checked` columns.

## Cost

One live SERP call per tracked keyword per day. Depth 100 counts as one paid SERP page.

## Ported from

- [Send a Slack message when keyword rank drops with DataForSEO + Make](https://dataforseo.com/templates/send-a-slack-message-when-keyword-rank-drops-with-dataforseo-make/) — original make template
