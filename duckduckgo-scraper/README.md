# DuckDuckGo Scraper

Searches DuckDuckGo and saves the result titles and links to an Excel file.

## How It Works

The flow prompts you to enter a search query, opens Chrome, navigates to DuckDuckGo, types the query, and clicks search. Once results load, an in-page JavaScript snippet scrapes every result's title and link. The data is written to `~/results.xlsx` with **Title** and **Link** columns, then the browser closes.

No configuration needed — just run the flow and enter your search query when prompted.
