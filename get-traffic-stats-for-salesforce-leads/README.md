# Salesforce Lead Traffic Stats

Every 15 minutes, takes the leads Salesforce has touched most recently, turns each website into a bare domain, estimates how much organic search traffic that domain gets, and writes the numbers back onto the Salesforce record.

## How it works

1. **Every 15 Minutes** — an Inject trigger on the source scenario's 900-second interval. **Set Parameters** holds
   all the configuration: the location and language for the lookup, and `field_map`, which says where each
   enrichment value lands on the Salesforce side.
3. **List Recent Contacts** — reads the ten most recently touched records via a SOQL query over `Contact`, ordered by `LastModifiedDate`.
   **Collect Leads** reduces whatever came back to a flat list of `{ id, website }` and drops records with no
   website.
4. **Estimate Organic Traffic** — `DataForSEO.Account.RawRequest` posts to `/dataforseo_labs/google/bulk_traffic_estimation/live` for the single domain.
   Before the call, **Normalise Domain** strips the scheme, any `www.` prefix and everything from the first slash
   on, because DataForSEO matches on a bare domain: `https://www.acme.com/pricing` becomes `acme.com`.
5. **Map Enrichment** — a two-output Function. Port 0 has something to write; port 1 means nothing was found for
   that domain, so the update is skipped and the loop moves on rather than overwriting good data with blanks.
6. **Update Contact** — writes back through the `Records.Update` node with a fields object.

The DataForSEO node runs with `continueOnError`, so one unresolvable domain cannot stop the batch.

## Setup

- **DataForSEO credential** — API login and password from <https://app.dataforseo.com/api-access>.
- **Salesforce credential** — attached to the Salesforce node.
- **`field_map`** — the values shipped here are the field names the original template used. Replace them with your
  own: the enrichment keys are `etv`, `organic_keywords`, `organic_traffic_cost`, `paid_etv`.

## Cost

One Bulk Traffic Estimation call per lead. The endpoint takes up to 1000 targets at once, so if you are working through a large backlog it is cheaper to batch the domains than to loop — the bulk backlink templates in this set show that shape.

## Ported from

- [Get Traffic Stats for Salesforce leads with DataForSEO + Make](https://dataforseo.com/templates/get-traffic-stats-for-salesforce-leads-with-dataforseo-make/) — original make template
