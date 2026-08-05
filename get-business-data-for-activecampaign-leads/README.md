# ActiveCampaign Lead Business Data

Every 15 minutes, takes the leads ActiveCampaign has touched most recently, turns each website into a bare domain, looks the company up in the Google Business listings database, and writes the name, description, categories, address, rating and price level back onto the ActiveCampaign record.

## How it works

1. **Every 15 Minutes** — an Inject trigger on the source scenario's 900-second interval. **Set Parameters** holds
   all the configuration: the location and language for the lookup, and `field_map`, which says where each
   enrichment value lands on the ActiveCampaign side.
2. **Read API Token** — `Core.Vault.GetItem` pulls the API token, and **Build Request Headers** turns it into the header object the HTTP nodes send.
3. **List Recent Contacts** — reads the ten most recently touched records via a GET against `/api/3/contacts` on the ActiveCampaign v3 API.
   **Collect Leads** reduces whatever came back to a flat list of `{ id, website }` and drops records with no
   website.
4. **Find Business Listing** — `DataForSEO.BusinessData.ListingsSearch`, filtered on `domain = <lead domain>` and limited to the single best match.
   Before the call, **Normalise Domain** strips the scheme, any `www.` prefix and everything from the first slash
   on, because DataForSEO matches on a bare domain: `https://www.acme.com/pricing` becomes `acme.com`.
5. **Map Enrichment** — a two-output Function. Port 0 has something to write; port 1 means nothing was found for
   that domain, so the update is skipped and the loop moves on rather than overwriting good data with blanks.
6. **Update Contact** — writes back through an HTTP PUT to `/api/3/contacts/{id}` with a `fieldValues` array.

The DataForSEO node runs with `continueOnError`, so one unresolvable domain cannot stop the batch.

## Setup

- **DataForSEO credential** — API login and password from <https://app.dataforseo.com/api-access>.
- **ActiveCampaign credential** — a vault item holding the API token.
- **`field_map`** — the values shipped here are the field names the original template used. Replace them with your
  own: the enrichment keys are `title`, `description`, `category`, `additional_categories`, `address`, `rating`, `price_level`.

## Cost

One Business Listings call per lead with a website.

## Ported from

- [Get Business Data for ActiveCampaign leads with DataForSEO + Make](https://dataforseo.com/templates/get-business-data-for-activecampaign-leads-with-dataforseo-make/) — original make template
