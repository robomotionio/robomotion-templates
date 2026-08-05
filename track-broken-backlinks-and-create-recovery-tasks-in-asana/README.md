# Broken Backlink Recovery Tasks

Pulls every backlink pointing at a URL on your domain that now returns an error, logs them to a dated Google Sheet, and opens one Asana task pointing at that sheet.

## How it works

1. **Daily** — an Inject trigger repeating every 86,400 seconds.
2. **Set Parameters** — target domain plus the Asana project, workspace and assignee IDs.
3. **Get Broken Backlinks** → **Accumulate Page** → **Go To Next Page** — a `Label` / `GoTo` loop walking `optOffset` 1000 at a time, with `is_broken = true` applied server-side.
4. **Build Report Table** — twelve columns per broken link, including the status code the URL now returns.
5. **Create Spreadsheet** → **Write Broken Links** → **Create Recovery Task**.

Broken backlinks are the cheapest link building there is: the other site already decided to link to you, so recovering the link is a redirect or a corrected URL rather than an outreach campaign.

A run that finds nothing broken takes the third branch out of *Accumulate Page* and creates no sheet and no task.

## Setup

- **DataForSEO credential** — API login and password from <https://app.dataforseo.com/api-access>.
- **Google credential** — Service Account or OAuth2 able to create spreadsheets.
- **Asana credential** — a Personal Access Token, plus a project GID (or a workspace GID if you are not filing into a project).

## Ported from

- [Track broken backlinks and create recovery tasks in Asana with DataForSEO + n8n](https://dataforseo.com/templates/track-broken-backlinks-and-create-recovery-tasks-in-asana-with-dataforseo-n8n/) — original n8n template
