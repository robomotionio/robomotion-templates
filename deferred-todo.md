# Deferred Templates — Categorized by Reason

121 templates were deferred during the scraping campaign. Roughly 80% are blocked by anti-bot infrastructure that browser automation alone cannot bypass; the remaining 20% are interaction-required SPAs or genuine site/spec changes.

## 1. Anti-bot blocks — 95 templates

Cloudflare / DataDome / Akamai / generic 403 / 503. Resolution typically requires residential proxies, real session cookies, or a paid scraping API.

| Site | Count | Templates |
|------|------:|-----------|
| Google (News, Search, Maps, Scholar, Translate, Trends, Hotels, Workspace, Play) | 14 | news (3), search (3), maps (2), scholar, translate, trends, hotels, workspace, play |
| Medium | 6 | publication-archive, tagged, profile, following, more-topic, search |
| Fiverr | 4 | pros, gigs, reviews, sellers |
| Reddit | 4 | posts, homepage, comments, users |
| Monster.com (DataDome) | 3 | postings, details, salaries |
| Upwork | 3 | jobs, details, talent |
| Indeed | 3 | jobs, details, search |
| Booking.com | 3 | hotels, reviews, listings |
| ProductHunt (Cloudflare) | 3 | products, search, coming-soon |
| Capterra | 3 | software list, search, reviews |
| Trustpilot | 3 | company, reviews, category |
| Investing.com | 3 | indices, search, single-index |
| Expedia | 3 | hotels, flights, cars |
| Amazon | 3 | search, US, CA |
| TikTok | 3 | account, hashtag, video |
| Envato Elements / ThemeForest | 3 | stock-video, audio, themeforest |
| Yell.com / YellowPages | 3 | business details, search, services |
| Tripadvisor | 2 | hotels, reviews |
| Yelp | 2 | services, details |
| Etsy (DataDome) | 2 | products, reviews |
| FlexJobs (Akamai) | 2 | postings, details |
| Bing | 2 | search, related-searches |
| ZoomInfo | 2 | company info, top-ten |
| Clutch | 2 | company info, detail page |
| Remotive (Cloudflare) | 2 | jobs, details |
| remote.com (Cloudflare) | 2 | jobs, details |
| Audible | 1 | titles |
| BizBuySell | 1 | businesses |
| Make.com | 1 | integrations |
| Workato | 1 | integrations |
| Hotels.com | 1 | reviews |
| LoopNet | 1 | properties |
| Compass | 1 | properties / details |

## 2. Login walls — 9 templates

Site refuses anonymous access; needs real auth cookies.

- LinkedIn (5): `scrape-job-details-linkedin`, `extract-job-list-information-linkedin`, `extract-jobs-list-linkedin-search-url`, `monitor-linkedin-company`, `scrape-linkedin-company`
- Glassdoor (2): `scrape-job-posting-details-glassdoor`, `scrape-job-postings-list-glassdoor`
- Pinterest (2): `extract-pin-list-pinterest`, `scrape-pinterest-profile-info`

## 3. Geo-blocks — 2 templates

- Best Buy (2): geo-blocks non-US IPs (robot is in Turkey) — `scrape-product-list-best-buy`, `extract-product-details-info-bestbuy`

## 4. Complex SPAs / POST forms / interaction required — 9 templates

Need form interaction or JS-driven flows that don't fit the standard fetch-and-parse pattern.

- USPTO Patents Public Search (SPA): `extract-patents-uspto-public-search-basic`
- USPTO Trademark Search (SPA): `extract-trademarks-uspto-search`
- Canadian Patents (POST form): `extract-canadian-patents-database`
- Canadian Trademarks (complex form): `extract-canadian-trademarks-database`
- Bark category / reviews: require customer flow input — `extract-popular-providers-bark-category`, `extract-provider-reviews-bark`
- Redfin agents / agent details: JS-only search interaction — `extract-real-estate-agents-redfin`, `extract-real-estate-agent-details-redfin`
- WTTJ jobs: cookie consent + empty spec — `extract-jobs-welcome-to-the-jungle-search`
- Meetup groups: URL pattern doesn't expose group cards — `extract-groups-keyword-search-meetup`
- eBay seller reviews: feedback loaded via Ajax post-render — `extract-reviews-ebay-seller`

## 5. Site outages / spec mismatches — 6 templates

Site no longer matches the spec or is unreachable.

- Substack topic leaderboard: layout no longer exposes article-level data — `extract-posts-leaderboard-substack-topic`
- Similarweb `/trending/`: 404, page removed — `extract-trending-websites-similarweb`
- gptsapp.io list + details: 502 outage — `extract-gpts-list-gptsapp-search`, `extract-gpts-details-gptsapp`
- SEEK courses + businesses-for-sale: browser SIGBUS crash — `extract-courses-seek-business`, `extract-businesses-sale-from-seek-business`

## Totals

| Category | Count |
|----------|------:|
| Anti-bot (Cloudflare/DataDome/Akamai/403/503) | 95 |
| Login walls (LinkedIn/Glassdoor/Pinterest) | 9 |
| Geo-blocks (Best Buy) | 2 |
| Complex SPAs / POST forms / interaction needed | 9 |
| Site outages / spec mismatches | 6 |
| **Total** | **121** |

## Headline

~86% (104/121) are pure anti-bot or auth/geo blocks — solvable only with residential proxies, real auth cookies, or paid scraping APIs. The remaining ~14% (17 templates) are interaction-required SPAs (USPTO/Canadian gov, Redfin), forms (Bark, Canadian Patents/Trademarks), or genuine site changes (Substack/Similarweb spec drift, gptsapp outage, SEEK browser crash).
