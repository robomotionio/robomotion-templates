# Robomotion Templates

Ready-to-use flow templates for the [Robomotion](https://robomotion.io) RPA platform.

Every template declares a `level` (Beginner / Intermediate / Advanced) so you can pick an entry point that matches your experience. See [docs/level-field.md](docs/level-field.md).

## Robomotion Academy

[`academy.yaml`](academy.yaml) mirrors the [Robomotion Academy YouTube playlist](https://www.youtube.com/playlist?list=PLie2idTJ_1wvlEgLuDUDt_bbAs-29xtmL). The Flow Designer's Home page renders its Academy section from this file, because a browser cannot read the playlist directly: neither the playlist page nor its RSS feed sends CORS headers.

After adding a video to the playlist, regenerate the file and commit it:

```bash
python3 tools/build-academy-yaml.py
```

The script reads titles, order, runtimes and publish dates from the playlist itself. Per-video `level` and `topic` are hand-curated in the `CURATION` map inside the script (not in the YAML, so regenerating cannot drop them); a new video with no entry there still lands in the file and the script prints a warning naming it.

## Templates

### Monitoring

| Template | Level | Description |
|----------|-------|-------------|
| [API Health Check](api-health-check) | Beginner | Checks whether an API endpoint is reachable by sending an HTTP GET request and inspecting the response status code |
| [Content Checker](content-checker) | Intermediate | Monitors a webpage element for changes — useful for tracking price drops, stock availability, or any text on a page |

### System Administration

| Template | Level | Description |
|----------|-------|-------------|
| [Domain Inspector](domain-inspector) | Advanced | An AI chat agent that checks live SSL certificates and DNS records for any domain |
| [SSL Watch](ssl-watch) | Advanced | Monitors SSL certificates for domains listed in Google Sheets and writes expiration data back to the spreadsheet |

### Web Scraping

| Template | Level | Description |
|----------|-------|-------------|
| [Airbnb Property Details](extract-property-details-airbnb) | Intermediate | Airbnb scraper extracting ratings, reviews, pricing, amenities, and guest feedback. |
| [Airbnb Search Results](extract-list-places-search-result-airbnb) | Intermediate | Airbnb data scraper that extracts listing titles, prices, ratings, and locations from search results. |
| [AppSumo Deals](scrape-products-list-appsumo) | Intermediate | AppSumo deals scraper extracting product listings, prices, descriptions, and reviews. |
| [AppSumo Product Questions](extract-questions-appsumo-product) | Intermediate | AppSumo scraper that extracts product questions, users, and links. |
| [AppSumo Product Reviews](scrape-products-reviews-appsumo) | Intermediate | AppSumo reviews scraper extracts star ratings, review text, reviewer names, and dates. |
| [Binance Coin List](extract-coins-list-info-binance) | Intermediate | Binance scraper extracts coin data, prices, volume, and trading links. |
| [Binance Crypto Market Data](extract-crypto-data-binance) | Intermediate | Binance scraper extracts crypto prices, volumes, market caps, and rankings. |
| [Built In Jobs](extract-jobs-built-in) | Intermediate | Built In jobs scraper extracting tech job titles, salaries, locations, and company data from Built In listings. |
| [Built In Top Companies](extract-top-companies-built-in) | Intermediate | Built In best places to work scraper. |
| [Chrome Web Store Extension Info](scrape-extension-info-chrome-web-store) | Intermediate | Chrome extension scraper extracting names, ratings, users, and categories from Web Store listings. |
| [Chrome Web Store Extension Reviews](scrape-extension-review-chrome-web-store) | Intermediate | Chrome extension reviews scraper that extracts ratings, text, and user feedback from Web Store extensions. |
| [CoinMarketCap Category Coins](extract-coin-details-category-coinmarketcap) | Intermediate | CoinMarketCap scraper extracts coin prices, market caps, volumes, rankings, and price changes. |
| [CoinMarketCap Coin Details](extract-single-crypto-coin-details-coinmarketcap) | Intermediate | CoinMarketCap scraper extracts crypto prices, market cap, volume, supply, and token data. |
| [CoinMarketCap Coin Prices](extract-coinmarketcap-coins-list-prices) | Intermediate | Crypto scraper extracts CoinMarketCap rankings - prices, market caps, volume, icons and links. |
| [Craigslist Search Results](extract-craigslist-search-results-page) | Intermediate | Craigslist scraper extracts listing titles, locations, dates, bedrooms, and images from search results. |
| [DeBank Wallet Portfolio](extract-profile-data-debank) | Intermediate | DeBank portfolio tracker that extracts DeFi wallet data and token holdings from profiles. |
| [Dribbble Job Board](extract-jobs-dribbble) | Intermediate | Dribbble job board scraper that extracts design job titles, companies, and locations. |
| [Dribbble Job Details](extract-job-details-dribbble) | Intermediate | Dribbble jobs scraper extracts design job titles, companies, locations, and job details. |
| [DuckDuckGo Related Searches](extract-related-search-results-duckduckgo) | Intermediate | DuckDuckGo scraper extracts related search suggestions for SEO and content research. |
| [DuckDuckGo Scraper](duckduckgo-scraper) | Intermediate | Searches DuckDuckGo and saves result titles and links to an Excel file |
| [DuckDuckGo Search Results](scrape-duckduckgo-search-results) | Intermediate | DuckDuckGo scraper extracts search results, ads, titles, descriptions, and positions. |
| [eBay Product Listings](scrape-product-list-from-ebay) | Intermediate | eBay scraper that extracts item titles, prices, images, and links from eBay search results. |
| [Envato Elements Video Templates](extract-envato-elements-video-template-search-results) | Intermediate | Extract Envato Elements video templates from search results with titles, creators, and direct links. |
| [ESPN Top Headlines](extract-top-headlines-espn) | Intermediate | ESPN top headlines scraper that extracts headline positions and links from ESPN's homepage. |
| [Eventbrite Event Details](extract-online-event-details-eventbrite) | Intermediate | Eventbrite scraper extracts event names, dates, times, locations, prices, and descriptions. |
| [Eventbrite Online Events](scrape-eventbrite-online-events) | Intermediate | Eventbrite scraper extracts event titles, images, and links from search results. |
| [Framer Template Details](extract-framer-template-details) | Intermediate | Extract Framer templates data - names, prices, creators, publish dates, features. |
| [Framer Templates by Category](extract-templates-framer-category) | Intermediate | Framer templates scraper extracting listings, pricing, creators, and images from category pages. |
| [Freelancer.com Project Details](extract-project-details-from-freelancer-com) | Intermediate | Freelancer. |
| [Freelancer.com Projects](extract-freelance-projects-from-freelancer-com) | Intermediate | Freelancer. |
| [Future Tools Keyword Search](extract-tools-keyword-future-tools) | Intermediate | Future Tools AI directory scraper extracting tool listings, categories, and upvotes from keyword searches. |
| [Future Tools Tool Details](extract-tool-details-future-tools) | Intermediate | Extract AI tool details, pricing, upvotes & more from Future Tools. |
| [Futurepedia AI Tool Details](extract-ai-tool-details-futurepedia) | Intermediate | Futurepedia scraper extracts AI tool details - name, pricing, ratings, pros, cons, and 19+ data fields. |
| [Futurepedia AI Tools by Category](extract-ai-tools-futurepedia-categories) | Intermediate | AI tools directory scraper for Futurepedia. |
| [Futurepedia Trending AI Tools](extract-trending-ai-tools-futurepedia) | Intermediate | Futurepedia AI tools scraper extracts trending tool listings with ratings, categories, and pricing. |
| [Ghost Experts Directory](extract-experts-ghost) | Intermediate | Ghost experts directory scraper extracts names, images, and profile links from Ghost's official listings. |
| [Ghost Explore Creator Search](extract-creators-search-ghost-explore-page) | Intermediate | Ghost scraper extracting creator listings from Ghost Explore. |
| [Ghost Explore Creators by Topic](extract-creators-topic-ghost-explore-page) | Intermediate | Ghost Explore scraper extracts creators, descriptions, websites, MRR and member data from topic pages. |
| [Ghost Integrations](extract-integrations-ghost) | Intermediate | Ghost integrations scraper extracts tool names, positions, and links from Ghost's directory. |
| [Ghost Theme Marketplace](extract-themes-ghost-marketplace) | Intermediate | Ghost themes marketplace scraper extracting listings, pricing, and preview images. |
| [Hacker News Front Page](extract-news-items-hacker-news) | Intermediate | Extract hacker news posts from the front page into structured data. |
| [Hacker News Keyword Search](extract-news-items-by-keyword-hacker-news) | Intermediate | Hacker News scraper extracting keyword-filtered posts and discussions. |
| [IFTTT Services](extract-services-list-ifttt) | Intermediate | IFTTT integrations scraper extracts services, positions, URLs, and images. |
| [IMDb Box Office](extract-top-box-office-movies-imdb) | Intermediate | IMDb box office scraper extracting movie rankings, ratings, and earnings data. |
| [IMDb Popular Movies by Genre](extract-popular-movies-genre-imdb) | Intermediate | IMDb scraper that extracts popular movies, ratings, and detailed data from genre pages. |
| [IMDb Upcoming Releases](extract-upcoming-movie-releases-imdb) | Intermediate | IMDb upcoming movies scraper extracting titles, cast info, genres, and posters. |
| [Indie Hackers Group Posts](extract-group-posts-indie-hackers) | Intermediate | Indie Hackers groups scraper extracts post titles, authors, upvotes, and dates. |
| [Indie Hackers Posts](scrape-posts-indie-hackers) | Intermediate | Indie Hackers scraper that extracts post titles, authors, upvotes, and comments from the startup community. |
| [JustRemote Job Details](extract-job-details-justremote) | Intermediate | JustRemote job scraper extracts remote job titles, companies, types, locations, and salaries. |
| [JustRemote Jobs](extract-jobs-justremote) | Intermediate | JustRemote jobs scraper extracts verified remote job titles, companies, and dates. |
| [Lever Careers Page Jobs](extract-jobs-company-lever-page) | Intermediate | Lever careers page scraper that extracts job titles, employment types, and locations. |
| [Lever Job Details](extract-details-single-job-lever) | Intermediate | Lever job scraper extracts titles, descriptions, requirements, and locations from Lever career pages. |
| [Meetup Events Near Location](scrape-meetup-events-near-location) | Intermediate | Meetup scraper extracts event names, groups, dates, attendee counts, and spots left from Meetup search results. |
| [n8n Integrations](extract-integrations-list-n8n) | Intermediate | N8n integrations scraper extracting app names, links, and logos from N8n's directory. |
| [Pipedream Integrations](extract-integrations-pipedream) | Intermediate | Pipedream integrations scraper that extracts app names, descriptions, and logos. |
| [ProBlogger Job Board](extract-jobs-problogger) | Intermediate | ProBlogger job board scraper extracting writing job titles, locations, and listings. |
| [ProBlogger Job Details](extract-job-details-problogger) | Intermediate | ProBlogger jobs scraper extracts writing job titles, locations, and employer details. |
| [PubMed Medical Citations](extract-medical-citations-pubmed) | Intermediate | PubMed scraper that extracts medical citations, authors, and abstracts. |
| [Reddit Homepage & Subreddit Post Scraper](scrape-reddit-post-homepage-subreddit) | Intermediate | Reddit post scraper extracts titles, authors, upvotes, comments, and position from homepage or subreddits. |
| [Redfin Property Details](scrape-property-details-redfin) | Intermediate | Redfin property details scraper that extracts address, price, beds, baths, sqft, year built, and home facts from listings. |
| [Redfin Property Listings](scrape-list-properties-redfin) | Intermediate | Redfin scraper that extracts property listings, prices, beds, baths, square footage, images and links from search results. |
| [RemoteOK Job Details](scrape-job-posting-details-remoteok) | Intermediate | RemoteOK job scraper extracting titles, salaries, tags, locations, and company links from remote job listings. |
| [RemoteOK Job Listings](scrape-job-postings-list-remoteok) | Intermediate | RemoteOK job listings scraper extracts job titles, companies, salaries, tags, and logos. |
| [Rightmove Estate Agents](extract-real-estate-agents-rightmove) | Intermediate | Rightmove agent scraper extracts estate agent names, phone numbers, service types, and logos. |
| [Screen Capture](screen-capture) | Beginner | Takes a screenshot of a web page and saves it to a file |
| [SEEK Business Courses](extract-courses-seek-business) | Intermediate | SEEK job scraper extracts business listings - titles, salaries, employers. |
| [SEEK Businesses for Sale](extract-businesses-sale-from-seek-business) | Intermediate | SEEK Business scraper extracts listings with prices, locations, and descriptions. |
| [SEEK Job Details](scrape-job-posting-details-seek) | Intermediate | Seek. |
| [SEEK Job Listings](extract-job-postings-list-seek) | Intermediate | SEEK jobs scraper extracts job titles, salaries, and company details from Australia's largest job board. |
| [Similarweb Top Websites](extract-top-ranking-websites-similarweb) | Intermediate | Similarweb top websites scraper extracting rankings, visit metrics, and category data. |
| [Similarweb Trending Websites](extract-trending-websites-similarweb) | Intermediate | Scrape Similarweb trending websites for rising domains and traffic growth data. |
| [Sitemap Index Links](extract-sitemap-links-sitemap-index) | Beginner | Sitemap extractor that pulls positions, URLs, and last modified dates from XML sitemaps and sitemap index files. |
| [Sitemap URL Set](extract-urls-sitemap-url-set) | Beginner | Sitemap URL extractor that pulls every page URL position, loc, and lastmod from XML sitemaps. |
| [Substack Archive Posts](extract-stories-substack-publication-archive) | Intermediate | Substack scraper extracts posts, dates, engagement data, and images from archives. |
| [Substack Post Search](extract-posts-search-substack) | Intermediate | Substack search scraper extracts posts, writers, and publication data. |
| [Substack Top Posts](extract-top-posts-substack-publication) | Intermediate | Substack top posts scraper extracts highest-performing newsletter content with engagement metrics. |
| [Trendyol Product Details](extract-product-detail-page-trendyol) | Intermediate | Trendyol scraper extracts product details, prices, ratings, reviews, and materials. |
| [Trendyol Product Listings](extract-product-listings-trendyol) | Intermediate | Scrape Trendyol products from search and category pages. |
| [Udemy Course Details](extract-course-details-udemy) | Intermediate | Udemy scraper extracts course titles, ratings, reviews, prices, and more. |
| [Udemy Course Reviews](extract-course-reviews-udemy) | Intermediate | Udemy review scraper extracts student feedback - course names, ratings, text, and dates. |
| [Udemy Courses by Topic](extract-courses-topic-udemy) | Intermediate | Scrape Udemy courses by topic - get titles, descriptions, ratings, enrollments, prices & more from category pages. |
| [We Work Remotely Job Details](extract-job-details-we-work-remotely) | Intermediate | We Work Remotely scraper extracts remote job listings with titles, companies, types, locations, and links. |
| [We Work Remotely Jobs](extract-jobs-we-work-remotely) | Intermediate | We Work Remotely jobs scraper that extracts remote job listings with titles, companies, and types in bulk from search results. |
| [Webpage Headings & Paragraphs](extract-headings-paragraphs-from-webpage) | Beginner | Extract headings, paragraphs, and images from any webpage. |
| [Webpage HTML & Screenshot](extract-html-screenshot-from-webpage) | Beginner | HTML scraper that extracts source code from any webpage instantly. |
| [Webpage Text & Full-Page Screenshot](extract-full-text-screenshot-from-webpage) | Beginner | Extract text from any website and capture a full-page screenshot. |
| [WordPress Theme Search](extract-wordpress-themes-search-results) | Intermediate | WordPress themes directory scraper extracting theme names, links, and images from search results. |
| [WordPress.org Plugin Search](extract-search-results-plugins-wordpress-org) | Intermediate | WordPress. |
| [Workable Job Details](extract-job-post-details-workable) | Intermediate | Workable jobs scraper extracting job titles, descriptions, requirements, and company details. |
| [Workable Job Search](extract-search-results-workable) | Intermediate | Workable job scraper extracts job listings, links, and hiring data from search results. |
| [Working Nomads Job Details](extract-job-details-working-nomads) | Intermediate | Working Nomads scraper extracts job titles, companies, locations, and details from the digital nomad job board. |
| [Working Nomads Jobs](extract-jobs-working-nomads) | Intermediate | Working Nomads job board scraper extracts location-independent job listings in bulk. |
| [Y Combinator Company Details](extract-company-details-y-combinator) | Intermediate | Y Combinator scraper that extracts startup profiles - names, batch years, team sizes, and details. |
| [Y Combinator Jobs](extract-job-postings-y-combinator) | Intermediate | Y Combinator jobs scraper extracting startup job titles, companies, locations, and employment types. |
| [Y Combinator Startup Directory](extract-companies-yc-startup-directory) | Intermediate | Y Combinator startup directory scraper that extracts company names, descriptions, locations, and batch data. |
| [YouTube Channel Info](extract-channel-info-youtube) | Intermediate | YouTube channel scraper extracts subscribers, views, videos, IDs, logos & descriptions. |
| [YouTube Channel Live Streams](extract-channel-lives-youtube) | Intermediate | YouTube live stream scraper that extracts stream titles, dates, viewer counts, and durations from any channel. |
| [YouTube Channel Playlists](extract-channel-playlists-youtube) | Intermediate | YouTube playlist scraper that extracts titles, video counts, and images from any channel. |
| [YouTube Channel Search](extract-channels-search-page-youtube) | Intermediate | Scrape YouTube search results for channels - names, subscribers, and descriptions. |
| [YouTube Channel Shorts](extract-channel-shorts-youtube) | Intermediate | YouTube Shorts scraper that extracts positions, titles, and views from any channel. |
| [YouTube Channel Videos](extract-videos-youtube-channel) | Intermediate | YouTube channel scraper extracts video titles, views, dates, and links from any channel. |
| [YouTube Video Comments](extract-comments-video-from-youtube) | Intermediate | YouTube comments scraper that extracts comment text, likes, authors, and timestamps from any video. |
| [YouTube Video Info](scrape-youtube-video-info) | Intermediate | YouTube video scraper extracting titles, views, likes, channel info, descriptions, tags, and metadata. |
| [YouTube Video Search](scrape-video-search-result-youtube) | Intermediate | YouTube search scraper extracts video titles, channels, views, dates, descriptions & more. |
| [YouTube Video Transcript](extract-video-transcript-from-youtube) | Intermediate | YouTube transcript extractor that pulls full video text and timestamps from any video. |
| [Zapier App Details](scrape-app-details-zapier) | Intermediate | Zapier app directory scraper extracting integration details, triggers, actions, and workflow data. |
| [Zapier Apps Directory](scrape-apps-list-zapier) | Intermediate | Zapier apps list scraper extracting app names, positions, logos, and links. |

### Web Automation

| Template | Level | Description |
|----------|-------|-------------|
| [Bank Reconciliation](bank-reconciliation) | Advanced | Takes the payments and receipts the ERP could not reconcile and confirms each one against the real bank statement. |
| [CRM Duplicate Cleanup](crm-duplicate-cleanup) | Intermediate | Cleans up a CRM by merging duplicate contacts - the same person entered twice under name variants like Bob and Robert. |
| [E-Invoice Portal Harvest](einvoice-portal-harvest) | Advanced | Downloads every e-invoice for a tax period from a government portal and builds an index spreadsheet of what was collected. |
| [Friday Payment Run](friday-payment-run) | Intermediate | Prepares a weekly vendor payment run in the ERP. |
| [Get Metadata of a Web Page](get-metadata-of-web-page) | Intermediate | Navigates to a URL, reads its title and meta tags, and returns them as structured data. |
| [Invoice Inbox to Ledger](invoice-inbox-to-ledger) | Advanced | Reads vendor-invoice e-mails out of the mailbox and posts each one as a bill in the ERP. |
| [Logistics Exception Center](logistics-exception-center) | Advanced | Builds one worklist of every active delivery exception from the carrier, then dedupes it against the systems that may already be handling it - the mailbox that was notified, and the help desk where a ticket may already exist. |
| [Monday Morning Briefing](monday-morning-briefing) | Intermediate | One robot, every system, the whole week's work on a single page. |
| [Open a Web Page](open-a-web-page) | Beginner | Launches a browser and navigates to a provided URL — the minimum viable browser-automation template. |
| [Payment Run with Hold Report](payment-run-hold-report) | Intermediate | Runs the weekly vendor payment run in a SAP-style ERP and then accounts for every bill it refused to pay. |
| [Payroll Validation Gate](payroll-validation-gate) | Intermediate | Checks a month's payroll before it is posted. |
| [Quote-to-Cash Gap Audit](quote-to-cash-gap-audit) | Beginner | Finds revenue the business won but never billed: deals marked Won in the CRM that were never turned into an invoice. |
| [Refund Request Triage](refund-request-triage) | Advanced | Verifies customer refund requests against the bank before approving them. |
| [Shipment Status Report](shipment-status-report) | Intermediate | Signs in to a carrier portal and sweeps every page of the shipments list into one report, then narrows that sweep to the shipments that need a person. |
| [Take Screenshot of a Web Page](take-screenshot-of-web-page) | Beginner | Opens a URL in a browser and saves a screenshot of the rendered page to disk. |
| [Tax Portal ERP Reconciliation](portal-erp-reconciliation) | Advanced | Reconciles the e-invoices a government tax portal received against the vendor bills booked in the ERP, and reports the three ways the two can disagree: an amount that drifted, an e-invoice with no matching bill (arrived in the portal, never booked), and a bill with no e-invoice (booked, never filed). |
| [Tax Portal Morning Board](tax-portal-morning-board) | Advanced | Checks every client mandate on a government tax portal and builds one status board. |
| [Vendor Onboarding](vendor-onboarding) | Intermediate | Turns a procurement onboarding request into a vendor master record across two systems. |

### File Operations

| Template | Level | Description |
|----------|-------|-------------|
| [Download File From Web](download-file-from-web) | Beginner | Downloads a file from a URL and saves it to a local path |
| [Duplicate File Remover](duplicate-file-remover) | Intermediate | Finds and deletes duplicate files in a directory by comparing SHA-256 content hashes |
| [Read Text File](read-text-file) | Beginner | Reads a text file from disk and displays its content in a message box |

### Data Processing

| Template | Level | Description |
|----------|-------|-------------|
| [JSON Beautifier](json-beautifier) | Intermediate | Pretty-prints a JSON string with custom indentation and saves the result to a file |
| [JSON Minifier](json-minifier) | Beginner | Compacts a JSON object into a single-line string with no whitespace |
| [Merge CSV](merge-csv) | Intermediate | Combines all `.csv` files from a directory into a single CSV file with a configurable delimiter |

### Networking

| Template | Level | Description |
|----------|-------|-------------|
| [REST API](rest-api) | Intermediate | Creates a local HTTP server with GET and POST endpoints as a starting point for HTTP-triggered robots |
| [Send GET Request](send-get-request) | Beginner | Sends an HTTP GET request and displays the response body in a message box |

### Databases

| Template | Level | Description |
|----------|-------|-------------|
| [SQLite Quick Start](sqlite-quick-start) | Intermediate | Demonstrates core SQLite operations: create a database, insert rows, batch-insert, and run a SELECT query |

### Productivity

| Template | Level | Description |
|----------|-------|-------------|
| [Convert Excel Document to CSV File](convert-excel-document-to-csv-file) | Intermediate | Converts an Excel file (.xls/.xlsx) into a CSV file with a configurable delimiter |
| [Translator](translator) | Intermediate | Translates text between languages using Google Translate via headless browser automation |
| [Web Element To PDF](web-element-to-pdf) | Intermediate | Converts a specific element on a web page into a downloadable PDF |

### System Utilities

| Template | Level | Description |
|----------|-------|-------------|
| [Read From Clipboard](read-from-clipboard) | Beginner | Reads the current text from the system clipboard and displays it in a message box |
| [Write To Clipboard](write-to-clipboard) | Beginner | Prompts for text input via a dialog and copies it to the system clipboard |

### Date & Time

| Template | Level | Description |
|----------|-------|-------------|
| [Convert Datetime to Text](convert-datetime-to-text) | Beginner | Converts a datetime value into a formatted text string using the Robomotion DateTime package. |
| [Convert Text to Datetime](convert-text-to-datetime) | Beginner | Parses a text string like "2025-05-01 09:30:00" into a true datetime value the flow can work with. |
| [Days of Your Life](days-of-your-life) | Intermediate | Calculates how many days you have been alive by subtracting your birthday from today. |
| [Get Current Time](get-current-time) | Beginner | Reads the local date and time and formats it as a long time string (HH:mm:ss). |
| [Get First Working Day of the Next Month](get-first-working-day-of-next-month) | Intermediate | Computes the first business day of next month, skipping weekends. |
| [Get Previous Working Date](get-previous-working-date) | Advanced | Walks backwards from today to find the previous working day, handling weekends through conditional logic. |

### Desktop Automation

| Template | Level | Description |
|----------|-------|-------------|
| [Add Datetime to File Names](add-datetime-to-file-names) | Beginner | Renames every file in a directory by appending the current date to its name. |
| [Copy Files](copy-files) | Beginner | Copies every file from a source directory into a destination, with optional overwrite. |
| [Delete Files of Specific Size Range](delete-files-of-specific-size-range) | Intermediate | Scans a directory and deletes files whose size falls inside a min/max range. |
| [Find and Delete Empty Files](find-and-delete-empty-files) | Beginner | Walks a directory, locates zero-byte files, and deletes them in a single pass. |
| [GUI Testing Calculator](gui-testing-calculator) | Advanced | Drives the Windows Calculator through native UI automation to validate arithmetic. |
| [Open a Folder](open-a-folder) | Beginner | Launches the system file explorer pointed at a given path. |
| [Print Current Week's Calendar](print-current-weeks-calendar) | Intermediate | Generates an HTML page for the current week and sends it to the default printer. |
| [Print Documents](print-documents) | Beginner | Iterates a folder of documents and sends each one to the default printer. |
| [Run an Application](run-an-application) | Beginner | Starts a desktop application by executable path — the simplest form of process orchestration in Robomotion. |
| [Send Text to Notepad](send-text-to-notepad) | Beginner | Opens Notepad and types a provided string into its editor window. |
| [Share PowerPoint File as PDF](share-powerpoint-file-as-pdf) | Advanced | Opens a . |

### Excel Automation

| Template | Level | Description |
|----------|-------|-------------|
| [Consolidate Excel Reports](consolidate-excel-reports) | Intermediate | Combines rows from multiple Excel workbooks in a folder into one consolidated sheet. |
| [Launch Excel](launch-excel) | Beginner | Opens Microsoft Excel and creates a new empty workbook. |
| [Launch Excel and Extract Table](launch-excel-and-extract-table) | Beginner | Opens an Excel workbook and reads its first table into a structured message variable. |
| [Manipulate Excel Data Using SQL](manipulate-excel-data-using-sql) | Advanced | Loads Excel data into an in-memory SQL engine and runs a SELECT / UPDATE statement against it. |
| [Search and Replace Excel Values](search-and-replace-excel-values) | Beginner | Performs a find-and-replace across an Excel worksheet and saves the result. |

### PDF

| Template | Level | Description |
|----------|-------|-------------|
| [Create PDF from Selected Pages](create-pdf-from-selected-pages) | Beginner | Pulls a chosen range of pages from a source PDF and writes them to a new document. |
| [Extract Tables from PDF](extract-tables-from-pdf) | Intermediate | Locates tables inside a PDF and extracts their rows into structured data. |
| [Get Images from PDF](get-images-from-pdf) | Beginner | Extracts every embedded image from a PDF file into a target directory. |
| [Get Number of Pages in a PDF](get-number-of-pages) | Intermediate | Reports the page count of a PDF file as a single number. |
| [Merge PDFs](merge-pdfs) | Intermediate | Combines every PDF in a folder into one consolidated document using a reusable merge subflow. |
| [Merge Two PDFs](merge-two-pdfs) | Beginner | Joins two PDF files into a single output document — the minimal merge recipe. |
| [Split PDF by Half](split-pdf-by-half) | Advanced | Calculates a midpoint and splits a PDF into two evenly-sized halves. |
| [Split PDF by Specified Page](split-pdf-by-specified-page) | Intermediate | Splits a PDF into two files at a user-specified page number. |
| [Split PDF into Parts](split-pdf-into-parts) | Advanced | Divides a PDF into N equal-sized slices and writes each part out as its own file. |

### Scripting

| Template | Level | Description |
|----------|-------|-------------|
| [Convert Excel to PDF Using VBScript](convert-excel-to-pdf-using-vbscript) | Advanced | Runs an inline VBScript that drives Excel COM to export a workbook as PDF. |
| [Display JavaScript Output](display-javascript-output) | Intermediate | Executes an inline JavaScript snippet and surfaces its return value in a dialog. |
| [Display PowerShell Output](display-powershell-output) | Intermediate | Runs a PowerShell script and displays the captured standard output in a dialog. |
| [Display Python Output](display-python-output) | Intermediate | Runs an inline Python script and shows its output in a dialog. |
| [Display VBScript Output](display-vbscript-output) | Intermediate | Executes a VBScript snippet and displays its output. |
| [Extract Text from Word Document](extract-text-from-word-document) | Advanced | Uses a VBScript bridge to pull raw text out of a . |
| [Get Login Name Using Python](get-login-name-using-python) | Advanced | Retrieves the current Windows login user via an inline Python script. |

### Text Manipulation

| Template | Level | Description |
|----------|-------|-------------|
| [Concatenate Text Files](concatenate-text-files) | Intermediate | Reads every . |
| [Count Lines of a Text File](count-lines-of-text-file) | Intermediate | Opens a text file and reports the number of lines it contains. |
| [Extract Phone Numbers and Emails](extract-phone-numbers-and-emails) | Intermediate | Scans free-form text with regular expressions and pulls out every phone number and email address. |
| [Get Position of Subtext](get-position-of-subtext) | Beginner | Finds the character index of a substring inside a larger string. |
| [Sort Lines of a Text File](sort-lines-of-text-file) | Intermediate | Reads a text file, sorts its lines alphabetically, and writes the result back out. |

### Flow Control

| Template | Level | Description |
|----------|-------|-------------|
| [Denial Worklist Triage](denial-worklist-triage) | Advanced | Works a clinic's denied insurance claims, choosing a different action for each denial code: fix and resubmit the ones missing a field the chart already has, write off what the payer will never cover, void duplicates of already-paid claims, and escalate the ones that need a human to call the payer. |
| [Leave Request Policing](leave-request-policing) | Intermediate | Processes the pending leave requests in an HR system by policy: approves the ones that are clean and denies the ones that break a rule - an insufficient balance, an overlap with a teammate already off, or a request inside the month-end blackout - writing the reason into the required comment box. |
| [Use Conditionals to Check if File Exists](use-conditionals-to-check-if-file-exists) | Beginner | Checks whether a given file is present on disk and routes the flow accordingly. |
| [Use Labels to Check if File Exists](use-labels-to-check-if-file-exists) | Advanced | Uses Label and GoTo to structure a loop that rechecks file existence — a non-sequential flow pattern useful for polling. |
| [Use Subflows to Check if File Exists](use-subflows-to-check-if-file-exists) | Intermediate | Encapsulates a "does this file exist? |
| [Use the AND Operator in Conditionals](use-and-operator-in-conditionals) | Intermediate | Shows how to branch a flow only when two conditions are both true using a Switch node with a combined predicate. |
| [Use the OR Operator in Conditionals](use-or-operator-in-conditionals) | Intermediate | Combines two conditions with a logical OR and branches the flow based on the result. |

### Concurrency

| Template | Level | Description |
|----------|-------|-------------|
| [Bulk Shipment Tracking Sweep](bulk-shipment-tracking-sweep) | Advanced | Checks 200 shipment tracking numbers on a public carrier tracker using eight parallel workers pulling from a shared in-memory queue. |
| [Clinic Eligibility Morning Run](clinic-eligibility-morning-run) | Advanced | Verifies insurance for every appointment on a clinic's eligibility worklist, running the payer checks on nine parallel browsers instead of one at a time. |
| [Fork Branch With Memory Queue](fork-branch-with-memory-queue) | Advanced | Demonstrates parallel browser automation — 6 browser instances process a shared queue of URLs concurrently |

### Error Handling

| Template | Level | Description |
|----------|-------|-------------|
| [Handle Errors](handle-errors) | Beginner | Demonstrates the throw/catch error handling pattern with input validation and a retry loop |

### AI

| Template | Level | Description |
|----------|-------|-------------|
| [Calorie Coach Agent](calorie-coach-agent) | Advanced | A chat-based nutrition tracker that logs meals into SQLite and coaches the user toward calorie and macro goals |
| [Generic Chat Assistant](generic-chat-assistant) | Advanced | Minimal Chat Assistant + LLM Agent starter for building custom conversational robots |
| [Self-Learning Invoice Agent](self-learning-invoice-agent) | Advanced | An invoice-processing DeepSeek Agent that teaches itself vendors. |

### Other

| Template | Level | Description |
|----------|-------|-------------|
| [BMI Calculator](bmi-calculator) | Beginner | Calculates Body Mass Index from weight and height inputs — a beginner-friendly demo of input dialogs and basic math |

### IT Operations

| Template | Level | Description |
|----------|-------|-------------|
| [Password Generator](password-generator) | Beginner | Generates a random alphanumeric password of configurable length and copies it to the clipboard |

### SEO

| Template | Level | Description |
|----------|-------|-------------|
| [ActiveCampaign Lead Business Data](get-business-data-for-activecampaign-leads) | Intermediate | Every 15 minutes, takes the leads ActiveCampaign has touched most recently, turns each website into a bare domain, looks the company up in the Google Business listings database, and writes the name, description, categories, address, rating and price level back onto the ActiveCampaign record. |
| [ActiveCampaign Lead Traffic Stats](get-traffic-stats-for-activecampaign-leads) | Intermediate | Every 15 minutes, takes the leads ActiveCampaign has touched most recently, turns each website into a bare domain, estimates how much organic search traffic that domain gets, and writes the numbers back onto the ActiveCampaign record. |
| [Add Backlinks to Google Sheets](add-backlinks-to-google-sheets) | Beginner | Pulls the live backlinks pointing at a domain every 15 minutes and appends them to a Google Sheet, one row per link, with the source page, anchor text, follow status, ranks and first/last seen dates. |
| [AI Mode References to Sheets](pull-references-from-google-ai-mode-to-google-sheets) | Beginner | Tracks which websites Google's AI Mode cites when it answers a question. |
| [AI Overview Citations to Sheets](extract-citation-sources-from-google-ai-overview-to-google-sheets) | Beginner | Tracks which websites Google's AI Overview cites for a keyword. |
| [AI Overview Keyword Wins by Email](get-new-ranked-google-ai-overview-keywords-via-email) | Intermediate | Each week, finds the keywords where your domains are newly cited inside Google's AI Overview, saves the full picture to Google Sheets, and emails the new placements. |
| [App Review Alerts to Slack](send-slack-alerts-for-new-app-reviews-from-google-play-and-app-store) | Advanced | Every morning, pulls the newest reviews for your app from both Google Play and the App Store, keeps only the ones written since the last run, and posts a digest per store to Slack. |
| [App Reviews to ClickUp Tasks](create-tasks-in-clickup-for-new-app-reviews-automatically) | Advanced | Every morning, pulls the newest reviews for your app from both Google Play and the App Store, keeps only the ones written since the last run, and opens one ClickUp task per store holding the digest. |
| [Broken Backlink Recovery Tasks](track-broken-backlinks-and-create-recovery-tasks-in-asana) | Intermediate | Pulls every backlink pointing at a URL on your domain that now returns an error, logs them to a dated Google Sheet, and opens one Asana task pointing at that sheet. |
| [Bulk Domain Backlink Profiles](pull-bulk-domain-backlink-profiles-to-google-sheets) | Intermediate | Reads a column of domains from a Google Sheet and pulls the full backlink profile for all of them in one DataForSEO call - rank, spam score, broken links, referring domains, IPs, subnets and the TLD, type, attribute, platform, location and country breakdowns. |
| [Bulk Domain Rank Checker](check-bulk-domain-ranks-and-save-results-to-google-sheets) | Beginner | Reads a column of target domains from a Google Sheet, scores all of them in one DataForSEO Bulk Ranks call, and writes each rank back next to its domain with the date it was measured. |
| [Bulk Domain Spam Score Checker](check-bulk-domain-spam-scores-and-save-results-to-google-sheets) | Beginner | Reads a column of domains from a Google Sheet, scores all of them in one DataForSEO Bulk Spam Score call, and writes each 0-100 score back next to its domain with the date it was measured. |
| [Bulk Live Backlink Counts](pull-bulk-live-backlink-counts-into-google-sheets) | Beginner | Reads a column of domains from a Google Sheet and pulls the live backlink count for all of them in one DataForSEO call, stamping each count with the date it was measured. |
| [Bulk Referring Domain Data](fetch-bulk-live-referring-domain-data-into-google-sheets) | Beginner | Reads a column of domains from a Google Sheet and pulls the live referring-domain counts for all of them in one DataForSEO call, writing the follow and nofollow breakdown back next to each domain. |
| [Competitor Keyword Gaps to Notion](find-competitor-keyword-gaps-and-log-opportunities-to-notion) | Intermediate | Pulls every keyword your site ranks for, pulls every keyword a competitor ranks for, and writes the difference - the keywords they own and you do not - into a Notion database with search volume, their position, their URL and the keyword competition score. |
| [Featured Snippet Wins by Email](track-new-featured-snippet-keyword-wins-via-email) | Intermediate | Each week, finds the keywords where your domains now hold Google's featured snippet and emails the new ones with position, search volume and the ranking URL. |
| [GoHighLevel Lead Business Data](get-business-data-for-gohighlevel-leads) | Intermediate | Every 15 minutes, takes the leads GoHighLevel has touched most recently, turns each website into a bare domain, looks the company up in the Google Business listings database, and writes the name, description, categories, address, rating and price level back onto the GoHighLevel record. |
| [GoHighLevel Lead Traffic Stats](get-traffic-stats-for-gohighlevel-leads) | Intermediate | Every 15 minutes, takes the leads GoHighLevel has touched most recently, turns each website into a bare domain, estimates how much organic search traffic that domain gets, and writes the numbers back onto the GoHighLevel record. |
| [Google Ads Metrics to Sheets](pull-google-ads-metrics-api-to-google-sheets) | Beginner | Reads a column of keywords from a Google Sheet and fills in the Google Ads planner numbers for all of them in one call: monthly search volume, competition and cost per click. |
| [High-Volume Keywords to Asana Tasks](turn-new-high-volume-ranked-keywords-into-asana-tasks) | Intermediate | Each week, finds the keywords above your search-volume bar that your domains have started ranking for and turns them into an Asana task, so the opportunity lands in someone's queue instead of a spreadsheet nobody opens. |
| [Hubspot Lead Business Data](get-business-data-for-hubspot-leads) | Intermediate | Every 15 minutes, takes the leads HubSpot has touched most recently, turns each website into a bare domain, looks the company up in the Google Business listings database, and writes the name, description, categories, address, rating and price level back onto the HubSpot record. |
| [Hubspot Lead Traffic Stats](get-traffic-stats-for-hubspot-leads) | Intermediate | Every 15 minutes, takes the leads HubSpot has touched most recently, turns each website into a bare domain, estimates how much organic search traffic that domain gets, and writes the numbers back onto the HubSpot record. |
| [Keyword Cluster by URL](collect-keyword-cluster-by-url-in-google-sheets) | Intermediate | Every two weeks, takes a list of URLs from an input sheet and, for each one, pulls the full set of keywords that URL ranks for into its own tab of an output spreadsheet - keyword, position, volume, difficulty, CPC, competition, intent, SERP feature type and estimated traffic. |
| [Keyword Position Dynamics by URL](track-keyword-position-dynamics-by-url-in-google-sheets) | Advanced | Every two weeks, checks where each tracked URL ranks for its keyword and appends a dated row carrying the new position, the delta and a status - up, down, same, new or lost. |
| [Low-Competition Keyword Finder](find-low-competition-keyword-opportunities) | Intermediate | For each seed domain in an input sheet, pulls every keyword the domain is relevant for, scores all of them for ranking difficulty in one bulk call, and writes the combined picture - volume, trend, difficulty, intent and average backlinks - to an opportunities sheet. |
| [Monday CRM Lead Business Data](get-business-data-for-monday-crm-leads) | Intermediate | Every 15 minutes, takes the leads monday has touched most recently, turns each website into a bare domain, looks the company up in the Google Business listings database, and writes the name, description, categories, address, rating and price level back onto the monday record. |
| [Monday CRM Lead Traffic Stats](get-traffic-stats-for-monday-crm-leads) | Intermediate | Every 15 minutes, takes the leads monday has touched most recently, turns each website into a bare domain, estimates how much organic search traffic that domain gets, and writes the numbers back onto the monday record. |
| [New AI Overview Keywords by Email](get-new-ranked-keywords-in-google-aio) | Intermediate | Each week, finds the keywords where your domains are now cited inside Google's AI Overview and emails the new ones. |
| [New Featured Snippet Keywords by Email](get-new-ranked-keywords-in-featured-snippet) | Intermediate | Each week, finds the keywords where your domains now hold Google's featured snippet - position zero, above the first organic result - and emails the ones that are new since last week. |
| [New High-Volume Ranked Keywords](get-new-high-volume-ranked-keywords-on-google) | Intermediate | Each week, finds the keywords above your search-volume bar that your domains have started ranking for, opens one Asana task holding the list, and posts a summary to Slack. |
| [New Ranked Keywords to Slack](get-new-ranked-keywords-from-google) | Intermediate | Each week, pulls every keyword your target domains rank for, compares it against last week's snapshot, and posts whatever is new to Slack. |
| [New Top-10 Keywords to Airtable](log-new-ranked-keywords-in-top-10-google-results-in-airtable) | Intermediate | Each week, finds the keywords where your domains have broken into Google's first page, writes them to an Airtable base, and posts a summary to Slack. |
| [Pipedrive Lead Business Data](get-business-data-for-pipedrive-leads) | Intermediate | Every 15 minutes, takes the leads Pipedrive has touched most recently, turns each website into a bare domain, looks the company up in the Google Business listings database, and writes the name, description, categories, address, rating and price level back onto the Pipedrive record. |
| [Pipedrive Lead Traffic Stats](get-traffic-stats-for-pipedrive-leads) | Intermediate | Every 15 minutes, takes the leads Pipedrive has touched most recently, turns each website into a bare domain, estimates how much organic search traffic that domain gets, and writes the numbers back onto the Pipedrive record. |
| [Ranked Keyword Gap Analysis to Notion](run-a-ranked-keyword-gap-analysis-and-notion) | Intermediate | Runs a ranked keyword gap analysis between your domain and a competitor's, and logs every keyword they rank for and you do not into a Notion database. |
| [Ranked Keywords for New Airtable Records](get-ranked-keywords-for-new-airtable-records) | Intermediate | Watches an Airtable table for target domains that have not been looked up yet, pulls the keywords each one ranks for, writes them into a second table, and ticks the source record off so it is never processed twice. |
| [Salesforce Lead Business Data](get-business-data-for-salesforce-leads) | Intermediate | Every 15 minutes, takes the leads Salesforce has touched most recently, turns each website into a bare domain, looks the company up in the Google Business listings database, and writes the name, description, categories, address, rating and price level back onto the Salesforce record. |
| [Salesforce Lead Traffic Stats](get-traffic-stats-for-salesforce-leads) | Intermediate | Every 15 minutes, takes the leads Salesforce has touched most recently, turns each website into a bare domain, estimates how much organic search traffic that domain gets, and writes the numbers back onto the Salesforce record. |
| [Scrape AI Mode References](scrape-references-from-google-ai-mode) | Beginner | Watches, in near real time, which sites Google's AI Mode pulls from when it answers questions about your brand. |
| [Scrape AI Overview References](scrape-references-from-googles-ai-overview) | Beginner | Polls the Google SERP for a keyword every 15 minutes with the AI Overview block loaded and appends every source the overview cites to a Google Sheet. |
| [SERP Position for Airtable Records](get-google-serp-position-for-new-airtable-records) | Beginner | Watches an Airtable table for keyword/domain pairs that have not been checked yet, looks up where the domain ranks for that keyword on Google, and writes the position back onto the record. |
| [Slack Alert on Keyword Rank Drop](send-a-slack-message-when-keyword-rank-drops) | Intermediate | Every morning, checks where each tracked URL ranks for its keyword, compares against the position recorded on the last run, and posts to Slack only when a keyword has moved down. |
| [Top-10 Keywords to Airtable with Slack Alerts](log-new-google-top-10-keywords-to-airtable-and-slack-alerts) | Intermediate | Each week, finds the keywords where your domains have broken into Google's first page, logs them to Airtable, and alerts Slack. |
| [Top-10 Rank Drop Alert via Gmail](get-keywords-top-10-rank-drop-alert-via-gmail) | Advanced | Every day, pulls the keywords each target domain currently holds a top-10 position for, compares against yesterday's snapshot, and emails a digest of everything that slipped. |
| [Top-10 Rank Drop Alerts by Email](get-gmail-alerts-for-dropped-top-10-keyword-rankings) | Advanced | Every day, pulls the keywords each target domain currently holds a top-10 position for, compares against yesterday's snapshot, and emails a digest of everything that slipped. |
| [Toxic Backlink Disavow File](detect-toxic-backlinks-and-build-a-disavow-file-google-drive-and-gmail) | Advanced | Pages through every backlink pointing at your domain with a spam score above the threshold, writes the source URLs into a Google-compliant disavow. |
| [Track Brand Mentions](track-brand-mentions) | Intermediate | Every evening, searches the web for pages that mentioned your brand in the last 24 hours, classifies each mention as positive, negative or neutral, writes them into a dated Google Doc, and posts a Slack summary with the sentiment split and a link to the doc. |
| [Track New and Lost Backlinks](track-new-and-lost-backlinks-in-bulk-and-google-sheets) | Beginner | Reads a column of domains from a Google Sheet and pulls, in one DataForSEO call, how many backlinks each of them gained and lost, stamped with the date. |
| [Track New and Lost Referring Domains](track-new-and-lost-referring-domains-in-bulk-and-google-sheets) | Beginner | Reads a column of domains from a Google Sheet and pulls, in one DataForSEO call, how many referring domains each of them gained and lost - counted both per domain and per main domain - stamped with the date. |
| [Track New Ranked Keywords with Slack Alerts](track-new-ranked-keywords-in-google-sheets-and-slack-alerts) | Intermediate | Once a week, fetches every keyword your domains rank for on Google, saves the current picture to Google Sheets, and sends a Slack summary of what is newly ranking. |
| [Weekly Toxic Backlink Report](monitor-toxic-backlinks-and-email-weekly-google-sheets-reports) | Intermediate | Every week, pulls every backlink first seen in the last seven days whose spam score is above the threshold, drops them into a fresh Google Sheet named after the domain and the date, and emails you the link. |
| [Zoho CRM Lead Business Data](get-business-data-for-zoho-crm-leads) | Intermediate | Every 15 minutes, takes the leads Zoho CRM has touched most recently, turns each website into a bare domain, looks the company up in the Google Business listings database, and writes the name, description, categories, address, rating and price level back onto the Zoho CRM record. |
| [Zoho CRM Lead Traffic Stats](get-traffic-stats-for-zoho-crm-leads) | Intermediate | Every 15 minutes, takes the leads Zoho CRM has touched most recently, turns each website into a bare domain, estimates how much organic search traffic that domain gets, and writes the numbers back onto the Zoho CRM record. |
