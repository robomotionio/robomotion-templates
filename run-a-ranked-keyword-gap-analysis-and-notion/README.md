# Ranked Keyword Gap Analysis to Notion

Runs a ranked keyword gap analysis between your domain and a competitor's, and logs every keyword they rank for and you do not into a Notion database.

## How it works

The Make edition of the keyword gap analysis — same two-call comparison, same Notion output.

1. **Run** — an Inject trigger; the source scenario was on-demand.
2. **Read Notion Token** → **Build Notion Headers**.
3. **Get My Ranked Keywords** → **Index My Keywords**.
4. **Get Competitor Keywords** → **Find The Gaps**.
5. **For Each Gap** → **Build Notion Page** → **Create Notion Page**.

## Why HTTP rather than the Notion node

The database needs typed **number** and **url** properties, which `Robomotion.Notion.Pages.Create` does not expose. The page is created over the Notion REST API with `Core.Net.HttpRequest`.

## Setup

- **DataForSEO credential** — API login and password from <https://app.dataforseo.com/api-access>.
- **Notion credential** — a vault item holding an internal integration token, with the database shared to it.
- **`notion_props`** in *Set Parameters* must match your database's column names exactly.

## Ported from

- [Run a Ranked Keyword Gap Analysis Using DataForSEO and Notion + Make](https://dataforseo.com/templates/run-a-ranked-keyword-gap-analysis-using-dataforseo-and-notion-make/) — original make template
