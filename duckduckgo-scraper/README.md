# DuckDuckGo Scraper

DuckDuckGo Scraper automates web searches and exports the results directly to an Excel file. Powered by Robomotion's browser automation and Excel nodes, it performs a real search on DuckDuckGo, extracts every result title and link, and organizes them into a spreadsheet ready for analysis.

Instead of manually copying search results one by one, you enter your query once and the flow handles the rest, from opening the browser to saving the final spreadsheet.

## What DuckDuckGo Scraper can do

- Prompt you for any search query at runtime
- Open a browser and perform the search on DuckDuckGo automatically
- Extract all result titles and links from the search results page
- Save the collected data to an Excel file with Title and Link columns

## Behind the scenes

The flow opens an input dialog for your search query, launches Chrome, and navigates to DuckDuckGo. It types the query into the search box, clicks search, and waits for results to load. An in-page JavaScript snippet then scrapes every result entry, collecting the title and link for each. The scraped data is written to `~/results.xlsx` with two columns, and the browser closes automatically once the export is complete.
