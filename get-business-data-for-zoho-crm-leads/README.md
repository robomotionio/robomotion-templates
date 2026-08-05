# Zoho CRM Lead Business Data

Every 15 minutes, takes the leads Zoho CRM has touched most recently, turns each website into a bare domain, looks the company up in the Google Business listings database, and writes the name, description, categories, address, rating and price level back onto the Zoho CRM record.

## How it works

1. **Every 15 Minutes** — an Inject trigger repeating every 900 seconds. **Set Parameters** holds
   all the configuration: the location and language for the lookup, and `field_map`, which says where each
   enrichment value lands on the Zoho CRM side.
3. **List Recent Contacts** — reads the ten most recently touched records via the `Records.List` node over the `Contacts` module, sorted by `Modified_Time`.
   **Collect Leads** reduces whatever came back to a flat list of `{ id, website }` and drops records with no
   website.
4. **Find Business Listing** — `DataForSEO.BusinessData.ListingsSearch`, filtered on `domain = <lead domain>` and limited to the single best match.
   Before the call, **Normalise Domain** strips the scheme, any `www.` prefix and everything from the first slash
   on, because DataForSEO matches on a bare domain: `https://www.acme.com/pricing` becomes `acme.com`.
5. **Map Enrichment** — a two-output Function. Port 0 has something to write; port 1 means nothing was found for
   that domain, so the update is skipped and the loop moves on rather than overwriting good data with blanks.
6. **Update Contact** — writes back through the `Records.Update` node with a data object.

The DataForSEO node runs with `continueOnError`, so one unresolvable domain cannot stop the batch.

## Setup

- **DataForSEO credential** — API login and password from <https://app.dataforseo.com/api-access>.
- **Zoho CRM credential** — attached to the Zoho CRM node.
- **`field_map`** — the values shipped here are the field names shipped as defaults. Replace them with your
  own: the enrichment keys are `title`, `description`, `category`, `additional_categories`, `address`, `rating`, `price_level`.

## Cost

One Business Listings call per lead with a website.

## Ported from

- [Get Business Data for Zoho CRM leads with DataForSEO](https://dataforseo.com/templates/get-business-data-for-zoho-crm-leads-with-dataforseo-make/) — DataForSEO template
