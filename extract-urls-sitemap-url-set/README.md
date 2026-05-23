# Sitemap URL Set

XML sitemaps are the structural backbone of how websites communicate their page inventory to search engines. Every sitemap URL set contains a list of page URLs along with last modification timestamps. For SEO professionals, these sitemaps are goldmines of structural intelligence: they reveal how many pages a site has and which sections get updated most frequently.

## What it extracts

- **Position** — The numeric position of the URL within the sitemap, reflecting the order entries appear in the XML file.
- **loc** — The full page URL listed in the sitemap. This is the canonical address the site wants search engines to index.
- **lastmod** — The last modified timestamp for the page in ISO 8601 format, showing when the content was last updated.

## What you can do with it

- Complete content inventory: Extract every URL in a sitemap with its position and last modified date. Build a definitive page list without manually crawling the entire site.
- Update frequency analysis: Last modification dates reveal content freshness patterns. Extract to identify which pages are actively maintained and which have gone stale.
- Content ordering insight: Position values show how URLs are sequenced within the sitemap, reflecting the site's structural organization of content.
- Index coverage verification: Compare extracted sitemap URLs against what Google actually indexes. Identify pages that should be indexed but aren't, or pages that shouldn't be in the sitemap.

## How it works

Enter the requested input when prompted. The flow opens the target page, extracts the fields listed above, and saves them as a CSV in your home folder.

## Frequently asked questions

**What if a site has a sitemap index with multiple sitemaps?**

This robot is designed for sitemap URL sets (the actual page lists). For sitemap index files that reference multiple sub-sitemaps, use the sitemap index extractor robot.

**Do all websites have sitemaps?**

Most established websites do, but it's not universal. Check /sitemap.xml or the site's robots.txt file for the sitemap location.

**Are the lastmod dates always accurate?**

Not always. Some CMS platforms update the lastmod timestamp even for trivial changes, while others don't update it reliably. Treat it as a signal, not a guarantee.
