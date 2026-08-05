# New AI Overview Keywords by Email

Each week, finds the keywords where your domains are now cited inside Google's AI Overview and emails the new ones.

## How it works

Same delta-detection shape as the other ranked-keyword templates, filtered server-side to `ranked_serp_element.serp_item.type = ai_overview`.

1. **Weekly** — Inject trigger.
2. **Index Previous Keywords** → **Clear Keywords Sheet** — the diff baseline.
3. **For Each Target** → **Get Ranked Keywords** (filtered) → **Accumulate Page** → **Go To Next Page**.
4. **Find New Keywords** → **Append Current Snapshot** → **Email The Wins**.

An AI Overview citation is becoming the position-zero of the AI era: it is what the answer is built from, whether or not the user clicks through. Tracking it weekly tells you which of your pages Google trusts as a source.

## Setup

- **DataForSEO credential** — API login and password from <https://app.dataforseo.com/api-access>.
- **Google credential** — Service Account or OAuth2 with access to the spreadsheet.
- **Gmail credential** — OAuth2 for the sending account.
- Two sheets: `Targets` and `Keywords`.

## Ported from

- [Get New Ranked Keywords in Google AIO with DataForSEO](https://dataforseo.com/templates/get-new-ranked-keywords-in-google-aio-with-dataforseo-make/) — DataForSEO template
