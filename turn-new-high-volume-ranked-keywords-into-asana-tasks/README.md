# High-Volume Keywords to Asana Tasks

Each week, finds the keywords above your search-volume bar that your domains have started ranking for and turns them into an Asana task, so the opportunity lands in someone's queue instead of a spreadsheet nobody opens.

## How it works

The n8n edition of the high-volume keyword tracker.

1. **Weekly** — Inject trigger.
2. **Index Previous Keywords** → **Clear Keywords Sheet** — the diff baseline.
3. **For Each Target** → **Get Ranked Keywords**, filtered on search volume → **Accumulate Page** → **Go To Next Page**.
4. **Find New Keywords** → **Append Current Snapshot** → **Open Asana Task** → **Post To Slack**.

The task body lists each keyword with its position, monthly volume and ranking URL.

## Setup

- **DataForSEO credential** — API login and password from <https://app.dataforseo.com/api-access>.
- **Google credential** — Service Account or OAuth2 with access to the spreadsheet.
- **Slack credential** — a bot token with `chat:write`.
- **Asana credential** — a Personal Access Token, plus a project GID (or workspace GID).
- Two sheets: `Targets` and `Keywords`.

## Ported from

- [Turn new high-volume ranked keywords into Asana tasks with DataForSEO + n8n](https://dataforseo.com/templates/turn-new-high-volume-ranked-keywords-into-asana-tasks-with-dataforseo-n8n/) — original n8n template
