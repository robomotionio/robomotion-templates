# Competitor Keyword Gaps to Notion

Pulls every keyword your site ranks for, pulls every keyword a competitor ranks for, and writes the difference - the keywords they own and you do not - into a Notion database with search volume, their position, their URL and the keyword competition score.

## How it works

1. **Run** — an Inject trigger; the n8n original used a manual trigger.
2. **Read Notion Token** → **Build Notion Headers** — `Core.Vault.GetItem` supplies the integration token.
3. **Get My Ranked Keywords** → **Index My Keywords** — reduced to a lookup set of phrases.
4. **Get Competitor Keywords** → **Find The Gaps** — everything the competitor ranks for that is not in that set.
5. **For Each Gap** → **Build Notion Page** → **Create Notion Page**.

Both lookups use the same location and language, so the comparison is like for like.

## Why HTTP rather than the Notion node

The database needs typed **number** and **url** properties, which `Robomotion.Notion.Pages.Create` does not expose — it takes a title and content blocks only. The page is therefore created over the Notion REST API with `Core.Net.HttpRequest`.

## Setup

- **DataForSEO credential** — API login and password from <https://app.dataforseo.com/api-access>.
- **Notion credential** — a vault item holding an internal integration token, with the target database shared to that integration.
- **`notion_props`** in *Set Parameters* must match your database's column names exactly.

## Cost

Two Ranked Keywords calls per run. Raise `msg.limit` on both to widen the comparison — the gap is only as complete as the two lists behind it.

## Ported from

- [Find competitor keyword gaps and log opportunities to Notion with DataForSEO + n8n](https://dataforseo.com/templates/find-competitor-keyword-gaps-and-log-opportunities-to-notion-with-dataforseo-n8n/) — original n8n template
