# Robomotion Templates — Cases Scraping Campaign

## Goal

Build a Robomotion flow for every spec under `cases/`. Each `cases/<slug>.md` defines a target site, the column list of the CSV, and a sample row table (the spec). We are **done** with a case when our flow produces a CSV whose columns and structure match the spec.

## Build

For each case:

1. Read `cases/<slug>.md`. Pull the column list out of the markdown table and the target URL (or query template) out of the prose.
2. Open the target page with the `robomotion-browser-mcp` server. Use `browser_eval` and `browser_snapshot` to find selectors for every cell of the spec table. Confirm the page actually serves the data without login or geo wall — if it doesn't, mark the case `[!]` and move on.
3. Create `workdir/<slug>/main.ts` with the @robomotion/sdk builder. Standard shape:
   ```
   Inject
   → (optional InputBox for query/keyword)
   → Function (build msg.search_url, msg.csv_path = $Home$/<slug>.csv)
   → Browser.Open (chrome, maximized)
   → OpenLink
   → WaitElement (target list selector)
   → RunScript (returns JSON.stringify({columns, rows}))
   → Function (msg.table = JSON.parse(msg.table_json))
   → CSV.WriteCSV (utf8, comma, headers)
   → Browser.Close
   → Stop
   ```
4. `robomotion validate workdir/<slug>` until it reports clean.

Helpers:
- `robomotion describe node <type>` for property names — never guess.
- `Core.Browser.RunScript`'s `func` is ES5-only inside the sandbox: `var`, no template literals, no arrows, no `=>`, no destructuring. Escape backslashes (`\\.`) and `\\u` sequences in the func string.
- For sites that need a user-supplied query, the test run swaps the `Core.Dialog.InputBox` for a hardcoded `msg.query = '...'` so the run is autonomous, then restores the InputBox before promotion.

## Test

1. `robomotion run workdir/<slug> --robot bba7b30b-b96d-43f9-aaf5-8c01fdc8d0ca` (Extremis, online).
2. Inspect `~/<slug>.csv`:
   - Header row matches the spec's column list.
   - Body has at least the expected number of rows (compare against the spec sample table — 5 rows means at least 5).
   - No obviously corrupted cells (broken encoding, missing fields, JSON leakage).
3. If the flow uses an InputBox, the run was performed with a hardcoded query — restore the InputBox after verifying.

## Done criteria

A case is **Done** when:

- `robomotion validate` exits 0
- `robomotion run` ends with `flow_end status=success` and `~/<slug>.csv` exists with the spec's columns and reasonable data
- Folder has been moved from `workdir/<slug>` to repo root `<slug>/`
- Folder has been added, committed, and pushed in its own one-template commit

## Promotion workflow (per template)

After a green run on a case `<slug>`:

```
git mv workdir/<slug> <slug>
git add <slug>/
git commit -m "Add <slug> template"
git push
```

One commit per template. Do not batch. Update the checkbox in this file (`[~]` → `[x]`) in the same commit, or in a subsequent housekeeping commit.

## Status legend

- `[ ]` not started
- `[~]` built, validated, runs locally — pending promotion to root
- `[x]` Done: in repo root, committed, pushed
- `[!]` deferred: anti-bot, geo-block, login wall, paywall, captcha, or otherwise unreliable — revisit later, possibly via reverse-engineered API instead of browser automation

## Counts

- Total cases: 222
- Done (`[x]`): 36
- In workdir (`[~]`): 0
- Deferred (`[!]`): 90
- Backlog (`[ ]`): 96

## Cases

### News, aggregators, blogs

- [x] extract-news-items-hacker-news — HN front page, 4 cols, runs in 6s
- [x] extract-news-items-by-keyword-hacker-news — HN Algolia search, 6 cols, runs in 3s
- [x] extract-top-headlines-espn — ESPN homepage, 3 cols, runs in 4s
- [x] extract-top-posts-substack-publication — Substack /archive?sort=top, 10 cols, 24 rows, 3.6s
- [x] extract-stories-substack-publication-archive — Substack /archive?sort=new, 8 cols, 24 rows, 4.2s
- [!] extract-posts-leaderboard-substack-topic — Substack topic leaderboard layout no longer exposes article-level data (publication-only); spec mismatch
- [x] extract-posts-search-substack — Substack /search?searching=focused_post, 5 cols, 15 rows, 4.2s
- [!] extract-stories-medium-publication-archive — Medium 403 anti-bot, defer
- [!] extract-stories-tagged-medium-publication — Medium 403 anti-bot, defer
- [!] extract-stories-medium-user-profile — Medium 403 anti-bot, defer
- [!] extract-following-medium-user-profile — Medium 403 anti-bot, defer
- [!] extract-stories-more-medium-topic — Medium 403 anti-bot, defer
- [!] extract-posts-search-results-medium — Medium 403 anti-bot, defer
- [x] extract-creators-search-ghost-explore-page — Ghost Explore /?q=, 8 cols, 138 rows, 2.4s
- [x] extract-creators-topic-ghost-explore-page — Ghost Explore /top, 7 cols, 50 rows, 4.0s
- [x] extract-experts-ghost — Ghost experts directory, 4 cols, 56 rows, 3.4s
- [x] extract-themes-ghost-marketplace — Ghost theme marketplace, 7 cols, 32 rows, 2.4s
- [x] extract-integrations-ghost — Ghost integrations directory, 3 cols, 106 rows, 3.4s
- [x] extract-group-posts-indie-hackers — IH /group/main, 7 cols, 57 rows, 4.6s
- [x] scrape-posts-indie-hackers — IH /newest feed, 5 cols, 20 rows, 24s
- [!] extract-articles-keyword-google-news — Google anti-bot
- [!] extract-articles-topic-google-news — Google anti-bot
- [!] extract-top-stories-google-news-homepage — Google anti-bot
- [!] scrape-posts-reddit-search — Reddit blocks anonymous
- [!] scrape-reddit-post-homepage-subreddit — Reddit blocks anonymous
- [!] extract-comments-from-reddit-search-results — Reddit blocks anonymous
- [!] extract-users-reddit-search-results — Reddit blocks anonymous

### Search engines

- [x] extract-related-search-results-duckduckgo — 3 cols, runs in 3.6s
- [x] scrape-duckduckgo-search-results — DDG search results, 7 cols (4 + 3 ad placeholders), 10 rows, 3.2s
- [!] extract-related-search-results-bing — Bing rarely shows related-searches block on automation, defer
- [!] scrape-bing-us-search-results — Bing serves stripped layout to automation; titles blank, defer
- [!] scrape-google-search-results — Google anti-bot
- [!] scrape-google-search-results-country — Google anti-bot
- [!] extract-related-searches-google-search — Google anti-bot
- [!] scrape-google-maps-search-results — Google anti-bot
- [!] scrape-google-scholar-results — Google anti-bot
- [!] extract-details-info-place-google-maps — Google anti-bot

### Crypto / financial

- [x] extract-coinmarketcap-coins-list-prices — CMC homepage table, 13 cols, runs in 5s
- [ ] extract-coin-details-category-coinmarketcap
- [ ] extract-single-crypto-coin-details-coinmarketcap
- [ ] extract-coins-list-info-binance
- [ ] extract-crypto-data-binance
- [ ] extract-profile-data-debank
- [!] extract-market-indices-investing-com — Investing.com 403 anti-bot, defer
- [!] extract-search-results-investing-com — Investing.com 403 anti-bot, defer
- [!] extract-single-index-details-investing-com — Investing.com 403 anti-bot, defer

### Companies, reviews, directories

- [!] extract-company-details-trustpilot — Trustpilot 403 anti-bot, defer
- [!] extract-company-reviews-trustpilot — Trustpilot 403 anti-bot, defer
- [!] extract-companies-category-trustpilot — Trustpilot 403 anti-bot, defer
- [!] extract-companies-info-from-clutch — Clutch 403 anti-bot, defer
- [!] extract-company-detail-page-clutch — Clutch 403 anti-bot, defer
- [x] extract-companies-yc-startup-directory — YC company directory, 4 cols, 40 rows, 3.4s
- [ ] extract-company-details-y-combinator
- [!] extract-trending-websites-similarweb — Similarweb /trending/ returns 404; trending-websites page no longer exists
- [x] extract-top-ranking-websites-similarweb — Similarweb /top-websites/, 7 cols, 50 rows, 5.2s
- [!] extract-businesses-biz-buy-sell — BizBuySell 403 anti-bot, defer
- [!] extract-business-details-yell-com — Yell.com 403 anti-bot, defer
- [!] extract-business-search-yell-com — Yell.com 403 anti-bot, defer
- [ ] extract-top-companies-built-in
- [!] extract-service-list-yellow-pages — YellowPages 403 anti-bot, defer
- [!] extract-popular-providers-bark-category — Bark category page is empty without a location/customer flow; provider list isn't directly indexable
- [!] extract-provider-reviews-bark — same, requires customer flow input
- [!] extract-fiverr-pros-keyword-search — Fiverr 403 anti-bot, defer
- [!] extract-fiverr-gigs-category — Fiverr 403 anti-bot, defer
- [!] extract-fiverr-gig-reviews — Fiverr 403 anti-bot, defer
- [!] extract-sellers-services-fiverr-search-results — Fiverr 403 anti-bot, defer
- [!] scrape-company-information-from-zoominfo — ZoomInfo blocks
- [!] extract-top-ten-companies-zoominfo — ZoomInfo blocks
- [!] scrape-list-services-yelp — Yelp anti-bot
- [!] scrape-service-details-yelp — Yelp anti-bot

### Jobs

- [x] extract-job-postings-y-combinator — YC jobs page, 5 cols, 20 rows, 10s
- [x] extract-jobs-company-lever-page — Lever-hosted job board, 6 cols, 390 rows, 3.0s
- [x] extract-details-single-job-lever — Lever single job page, 5 cols, 1 row, 4.6s
- [ ] extract-search-results-workable
- [ ] extract-job-post-details-workable
- [ ] extract-jobs-built-in
- [ ] extract-jobs-welcome-to-the-jungle-search
- [x] extract-jobs-justremote — JustRemote /remote-jobs, 5 cols, 16 rows, 4.0s
- [x] extract-job-details-justremote — JustRemote single job page, 5 cols, 1 row, 3.4s
- [x] extract-jobs-we-work-remotely — WWR homepage, 7 cols, 230 rows, 6.0s
- [ ] extract-job-details-we-work-remotely
- [x] extract-jobs-working-nomads — Working Nomads /jobs, 12 cols, 100 rows, 3.6s
- [ ] extract-job-details-working-nomads
- [ ] extract-jobs-remote
- [ ] extract-job-details-remote
- [ ] extract-jobs-remotive
- [ ] extract-job-details-remotive
- [x] extract-jobs-problogger — ProBlogger /jobs/, 5 cols, 7 rows, 2.6s
- [ ] extract-job-details-problogger
- [x] extract-jobs-dribbble — Dribbble /jobs, 7 cols, 49 rows, 3.4s
- [ ] extract-job-details-dribbble
- [ ] extract-job-postings-list-seek
- [ ] scrape-job-posting-details-seek
- [ ] extract-courses-seek-business
- [ ] extract-businesses-sale-from-seek-business
- [ ] extract-freelance-projects-from-freelancer-com
- [ ] extract-project-details-from-freelancer-com
- [ ] extract-job-posting-details-monster-com
- [ ] scrape-job-postings-list-monster-com
- [ ] extract-salaries-based-job-title-monster
- [ ] scrape-job-posting-details-flexjobs
- [ ] scrape-job-postings-list-flexjobs
- [ ] scrape-job-posting-details-remoteok
- [x] scrape-job-postings-list-remoteok — RemoteOK homepage, 9 cols, 49 rows, 3.0s
- [!] extract-job-postings-list-upwork — Upwork anti-bot
- [!] extract-job-postings-details-upwork — Upwork anti-bot
- [!] extract-talent-keyword-search-upwork — Upwork anti-bot
- [!] scrape-job-details-linkedin — LinkedIn login wall
- [!] extract-job-list-information-linkedin — LinkedIn login wall
- [!] extract-jobs-list-linkedin-search-url — LinkedIn login wall
- [!] monitor-linkedin-company — LinkedIn login wall
- [!] scrape-linkedin-company — LinkedIn login wall
- [!] scrape-job-details-indeed — Indeed anti-bot
- [!] scrape-jobs-indeed — Indeed anti-bot
- [!] scrape-jobs-info-indeed-search-url — Indeed anti-bot
- [!] scrape-job-posting-details-glassdoor — Glassdoor login wall
- [!] scrape-job-postings-list-glassdoor — Glassdoor login wall

### Real estate, travel, hospitality, events

- [!] extract-list-properties-loopnet — LoopNet 403 anti-bot, defer
- [!] extract-list-properties-compass — Compass 202 challenge, defer
- [!] extract-property-details-compass — Compass 410, defer
- [ ] scrape-list-properties-redfin
- [ ] scrape-property-details-redfin
- [ ] extract-real-estate-agents-redfin
- [ ] extract-real-estate-agent-details-redfin
- [ ] extract-real-estate-agents-rightmove
- [ ] extract-property-details-airbnb
- [ ] extract-list-places-search-result-airbnb
- [ ] extract-hotels-list-info-expedia
- [ ] extract-flights-list-info-expedia
- [ ] extract-cars-list-info-expedia
- [ ] scrape-eventbrite-online-events
- [ ] extract-online-event-details-eventbrite
- [ ] scrape-meetup-events-near-location
- [ ] extract-groups-keyword-search-meetup
- [!] extract-hotel-data-from-booking — Booking.com anti-bot
- [!] extract-hotel-reviews-from-booking — Booking.com anti-bot
- [!] scrape-booking-com-hotel-listings-reviews-prices — Booking.com anti-bot
- [!] extract-hotel-reviews-from-hotels — Hotels.com anti-bot
- [!] extract-hotels-list-info-tripadvisor — Tripadvisor anti-bot
- [!] extract-reviews-tripadvisor-listing — Tripadvisor anti-bot
- [!] extract-price-hotel-google-hotel — Google anti-bot

### E-commerce, marketplaces, app stores

- [ ] extract-list-products-etsy
- [ ] extract-details-reviews-product-etsy
- [ ] extract-product-detail-page-trendyol
- [ ] extract-product-listings-trendyol
- [ ] scrape-products-list-appsumo
- [ ] scrape-products-reviews-appsumo
- [ ] extract-questions-appsumo-product
- [!] extract-product-details-producthunt — ProductHunt Cloudflare anti-bot
- [!] scrape-producthunt-search-results — ProductHunt Cloudflare anti-bot
- [!] extract-product-hunts-coming-soon-page — ProductHunt Cloudflare anti-bot
- [ ] scrape-extension-info-chrome-web-store
- [ ] scrape-extension-review-chrome-web-store
- [ ] scrape-product-list-best-buy
- [ ] extract-product-details-info-bestbuy
- [ ] scrape-product-list-from-ebay
- [ ] extract-reviews-ebay-seller
- [ ] extract-craigslist-search-results-page
- [!] scrape-amazon-search-results-via-url — Amazon anti-bot
- [!] scrape-amazon-us-search-results — Amazon anti-bot
- [!] monitor-amazon-ca-search-results — Amazon anti-bot
- [!] scrape-apps-google-workspace-marketplace — Google anti-bot
- [!] extract-apps-games-list-from-google-play — Google anti-bot

### AI / SaaS / integrations

- [ ] extract-tools-keyword-future-tools
- [ ] extract-tool-details-future-tools
- [ ] extract-trending-ai-tools-futurepedia
- [ ] extract-ai-tool-details-futurepedia
- [ ] extract-ai-tools-futurepedia-categories
- [!] extract-gpts-list-gptsapp-search — gptsapp.io 502 outage, defer
- [!] extract-gpts-details-gptsapp — gptsapp.io 502 outage, defer
- [ ] scrape-app-details-zapier
- [ ] scrape-apps-list-zapier
- [ ] extract-services-list-ifttt
- [ ] extract-integrations-list-n8n
- [!] extract-integrations-make — Make.com 403 anti-bot, defer
- [ ] extract-integrations-pipedream
- [ ] extract-integrations-list-workato
- [!] scrape-software-list-from-capterra — Capterra 403 anti-bot, defer
- [!] extract-software-list-capterra-com — Capterra 403 anti-bot, defer
- [!] extract-reviews-capterra-listing — Capterra 403 anti-bot, defer

### Templates / themes / plugins / media

- [!] extract-search-results-from-themeforest — ThemeForest 403 anti-bot, defer
- [ ] extract-templates-framer-category
- [ ] extract-framer-template-details
- [ ] extract-search-results-plugins-wordpress-org
- [ ] extract-wordpress-themes-search-results
- [!] extract-envato-elements-stock-video-search-results — Envato Elements 403 anti-bot, defer
- [ ] extract-envato-elements-video-template-search-results
- [!] extract-envato-elements-audio-search-results — Envato Elements 403 anti-bot, defer
- [x] extract-popular-movies-genre-imdb — IMDb /search/title/?genres=<g>, 10 cols, 50 rows, 6.6s
- [x] extract-top-box-office-movies-imdb — IMDb /chart/boxoffice/, 10 cols, 10 rows, 5.4s
- [x] extract-upcoming-movie-releases-imdb — IMDb /calendar/, 11 cols, 169 rows, 5.0s
- [!] extract-audible-titles-keyword-search — Audible 503 anti-bot, defer
- [ ] extract-courses-topic-udemy
- [ ] extract-course-details-udemy
- [ ] extract-course-reviews-udemy

### Patents, trademarks, scientific

- [ ] extract-canadian-patents-database
- [ ] extract-canadian-trademarks-database
- [ ] extract-patents-uspto-public-search-basic
- [ ] extract-trademarks-uspto-search
- [ ] extract-medical-citations-pubmed

### Web utility (any URL)

- [x] extract-html-screenshot-from-webpage — fetch HTML + screenshot, single-row CSV, 2.6s
- [x] extract-full-text-screenshot-from-webpage — page text + full-page PNG, single-row CSV (URL/Text/Screenshot/Timestamp/Title), 2.2s
- [x] extract-headings-paragraphs-from-webpage — any URL → IMG/H1/H3/P grid, 5 cols, 2s
- [x] extract-sitemap-links-sitemap-index — sitemap-index XML → CSV via HTTP+regex, runs in 0.6s
- [x] extract-urls-sitemap-url-set — XML urlset → CSV via HTTP+regex, runs in 0.6s
- [!] translate-text-google-translate — Google anti-bot
- [!] monitor-country-google-trends — Google anti-bot

### Video / social platforms

- [ ] extract-channel-info-youtube
- [ ] extract-channel-shorts-youtube
- [ ] extract-channel-lives-youtube
- [ ] extract-channel-playlists-youtube
- [ ] extract-channels-search-page-youtube
- [ ] extract-videos-youtube-channel
- [ ] extract-comments-video-from-youtube
- [ ] extract-video-transcript-from-youtube
- [ ] scrape-video-search-result-youtube
- [ ] scrape-youtube-video-info
- [!] scrape-account-info-videos-from-tiktok-account — TikTok anti-bot
- [!] scrape-videos-from-hashtag-tiktok — TikTok anti-bot
- [!] extract-data-from-tiktok-video — TikTok anti-bot
- [!] extract-pin-list-pinterest — Pinterest login wall
- [!] scrape-pinterest-profile-info — Pinterest login wall
