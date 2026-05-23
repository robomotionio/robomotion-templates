# Rightmove Estate Agents

Rightmove is the UK's largest property portal, used by virtually every estate agent in England, Scotland, and Wales to list properties for sale and rent. Rightmove's agent search and directory pages display estate agencies with their names, telephone numbers, service types, agent descriptions, logos, and contact links. The UK property market operates through estate agents quite differently from the US model - agents typically represent the seller, and buyers engage with listing agents directly.

## What it extracts

- **Position** — Ranking position on the Rightmove search results page.
- **Agent Name** — Estate agency brand name.
- **Telephone Number** — Primary contact phone number for the agency.
- **Service Type** — Sales, lettings, or both.
- **Agent Description** — Agency description and key information.
- **Agent Logo** — Agency brand logo image.
- **Sales Microsite Link** — Link to the agency's sales property listings page.
- **Contact Email Link** — Email contact link for the agency.
- **Recently Sold Link** — Link to the agency's recently sold properties page.

## What you can do with it

- UK market coverage: Rightmove lists virtually every active estate agent in the UK. Extract agent data for any postcode to see who operates in that market.
- Listing volume as performance proxy: Agents with more active listings typically handle more business. Extract listing counts to identify market-leading agents.
- Customer review intelligence: Rightmove agent reviews come from actual clients. Extract ratings and review text to assess agent reputation at scale.
- Office network mapping: Multi-office agencies have different market penetration by area. Extract office locations to map which agencies cover which postcodes.

## How it works

Enter the requested input when prompted. The flow opens the target page, extracts the fields listed above, and saves them as a CSV in your home folder.

## Frequently asked questions

**Does it work for both sales and lettings agents?**

Yes. Rightmove lists both sales and lettings agents. The Service Type field indicates whether each agency handles sales, lettings, or both. Filter your search for the type you need before extracting.

**Can I extract agents for any UK location?**

Yes. The robot works with any Rightmove agent search results page. Search by town, city, county, or postcode.

**How does this compare to the Redfin agent scraper?**

Rightmove covers the UK property market; Redfin covers the US. Each scraper is optimized for its respective platform's data structure.

**Does it include online-only agents?**

If online agents like Purplebricks appear in Rightmove search results, the robot will extract them alongside traditional high-street agents.

**Is this Rightmove scraper free?**

Browse AI's free plan includes credits to run this robot. No credit card required.
