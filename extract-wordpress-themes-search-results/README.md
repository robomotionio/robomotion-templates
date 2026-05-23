# WordPress Theme Search

The WordPress.org theme directory is the largest free theme marketplace in the world, hosting thousands of themes that power millions of websites. When users search for themes, results display theme names, preview thumbnails, and direct links to each theme page. These data points are essential for anyone evaluating the WordPress theme ecosystem - whether you're a theme developer studying market saturation, a web agency choosing themes for client sites, or a market analyst tracking design trends.

## What it extracts

- **Position** — The ranking position of the theme in the search results.
- **Theme Name** — The published name of the theme.
- **Theme Link** — Direct URL to the theme's page on WordPress.org.
- **Theme Image** — Link to the theme preview screenshot.

## What you can do with it

- Market analysis: Extract theme listings with installation counts. Understand which design styles, categories, and features drive the most adoption in the WordPress ecosystem.
- Competitive research for developers: Building WordPress themes? Extract competitor listings to analyze their ratings, installation numbers, and update frequency to benchmark your offerings.
- Quality assessment at scale: Ratings and last-updated dates together indicate theme quality and maintenance. Extract both to filter for themes that are both popular and actively supported.
- Trend identification: Track which new themes gain traction. Schedule regular extractions to monitor the directory for emerging design trends and feature patterns.

## How it works

Enter the requested input when prompted. The flow opens the target page, extracts the fields listed above, and saves them as a CSV in your home folder.

## Frequently asked questions

**Does this include premium themes?**

The WordPress.org directory only lists free themes. Premium themes on marketplaces like ThemeForest require separate extraction.

**How accurate are the search positions?**

Positions reflect the exact order returned by WordPress.org's search results for your query. They update as the directory's ranking algorithm processes changes.

**Can I extract themes filtered by specific features?**

Yes. Use WordPress.org's feature filter to narrow results, then paste that filtered URL. The robot extracts whatever the page displays.
