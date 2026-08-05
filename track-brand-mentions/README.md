# Track Brand Mentions

Every evening, searches the web for pages that mentioned your brand in the last 24 hours, classifies each mention as positive, negative or neutral, writes them into a dated Google Doc, and posts a Slack summary with the sentiment split and a link to the doc.

## How it works

1. **Daily** — an Inject trigger repeating every 86,400 seconds.
2. **Set Parameters** — the keyword is wrapped in quotes so Content Analysis matches the exact phrase; without them a two-word brand matches pages containing either word. A `fetch_time` filter keeps the result set to the last day.
3. **Find Mentions** — `DataForSEO.ContentAnalysis.Search`, up to 1000 results, newest first.
4. **Classify Mentions** — whichever connotation (positive / negative / neutral) scores highest wins the mention. A quiet day takes the second output and stops here.
5. **Create Mentions Doc** → **Write Heading** → **Write Mentions** → **Compose Slack Summary** → **Post Summary**.

The sentiment counts in the Slack message are the point: three positive mentions is a good day, three negative ones is something to look at tonight. The doc is there for when the number surprises you.

## Setup

- **DataForSEO credential** — API login and password from <https://app.dataforseo.com/api-access>.
- **Google credential** — Service Account or OAuth2 able to create documents.
- **Slack credential** — a bot token with `chat:write`.
- The brand keyword in *Set Parameters*.

## Ported from

- [Track Brand Mentions with DataForSEO + Make](https://dataforseo.com/templates/track-brand-mentions-with-dataforseo-make/) — original make template
