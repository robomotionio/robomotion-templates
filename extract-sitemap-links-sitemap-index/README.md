# Sitemap Index Links

XML sitemaps are the definitive map of a website's content. Every well-maintained site publishes a sitemap.xml (or a sitemap index that references multiple sub-sitemaps) listing every URL the site wants search engines to index. Sitemap index files take this further - they list multiple sitemaps, each potentially containing thousands of URLs, organized by content type or section.

## What it extracts

- **Position** — The numeric position of the URL within the sitemap file, reflecting the order entries appear in the XML.
- **loc** — The full URL listed in the sitemap. For sitemap index files, this is the URL of each sub-sitemap; for regular sitemaps, it is the page URL.
- **lastmod** — The last modified timestamp for the entry, showing when the URL or sub-sitemap was last updated (ISO 8601 format).

## What you can do with it

- Complete URL inventory: A sitemap lists every page a site wants indexed. Extract every URL with its position and last modified date - no crawling required.
- Content structure revelation: URL patterns in sitemaps reveal site architecture. Extract URLs and analyze path patterns to understand how a site organizes its content.
- Freshness assessment: Last modified dates show which pages are actively maintained and which are stale. Extract dates to identify outdated content needing attention.
- Indexation coverage analysis: Compare sitemap URLs against what's actually indexed in search engines. Gaps indicate pages that aren't being crawled or indexed properly.

## How it works

Enter the requested input when prompted. The flow opens the target page, extracts the fields listed above, and saves them as a CSV in your home folder.

## Frequently asked questions

**Where do I find a site's sitemap?**

Most sites use /sitemap.xml. If that doesn't work, check the site's robots.txt file - it typically contains a Sitemap: directive with the exact URL.

**What's a sitemap index vs. a regular sitemap?**

A sitemap index file lists multiple sub-sitemaps. The robot handles both - extracting the position, loc (URL), and lastmod for each entry.

**Do all websites have sitemaps?**

Most well-maintained websites publish XML sitemaps. Some smaller or older sites may not. If no sitemap exists, you'll need a crawler to discover pages.

**Can I use this for large sitemaps with thousands of URLs?**

Yes. Sitemaps can contain up to 50,000 URLs each. The robot extracts the position, URL, and last modified date for all listed entries regardless of sitemap size.

**Is this sitemap extractor free?**

Browse AI's free plan includes credits to run this robot. No credit card required.
