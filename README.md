# Robomotion Templates

Ready-to-use flow templates for the [Robomotion](https://robomotion.io) RPA platform.

## Templates

### Monitoring

| Template | Description |
|----------|-------------|
| [API Health Check](api-health-check) | Checks whether an API endpoint is reachable by sending an HTTP GET request and inspecting the response status code |
| [Content Checker](content-checker) | Monitors a webpage element for changes — useful for tracking price drops, stock availability, or any text on a page |

### System Administration

| Template | Description |
|----------|-------------|
| [Domain Inspector](domain-inspector) | An AI chat agent that checks live SSL certificates and DNS records for any domain |
| [SSL Watch](ssl-watch) | Monitors SSL certificates for domains listed in Google Sheets and writes expiration data back to the spreadsheet |

### Web Scraping

| Template | Description |
|----------|-------------|
| [DuckDuckGo Scraper](duckduckgo-scraper) | Searches DuckDuckGo and saves result titles and links to an Excel file |
| [Screen Capture](screen-capture) | Takes a screenshot of a web page and saves it to a file |

### File Operations

| Template | Description |
|----------|-------------|
| [Download File From Web](download-file-from-web) | Downloads a file from a URL and saves it to a local path |
| [Duplicate File Remover](duplicate-file-remover) | Finds and deletes duplicate files in a directory by comparing SHA-256 content hashes |
| [Read Text File](read-text-file) | Reads a text file from disk and displays its content in a message box |

### Data Processing

| Template | Description |
|----------|-------------|
| [Convert Excel Document to CSV File](convert-excel-document-to-csv-file) | Converts an Excel file (.xls/.xlsx) into a CSV file with a configurable delimiter |
| [JSON Beautifier](json-beautifier) | Pretty-prints a JSON string with custom indentation and saves the result to a file |
| [JSON Minifier](json-minifier) | Compacts a JSON object into a single-line string with no whitespace |
| [Merge CSV](merge-csv) | Combines all `.csv` files from a directory into a single CSV file with a configurable delimiter |

### Networking

| Template | Description |
|----------|-------------|
| [REST API](rest-api) | Creates a local HTTP server with GET and POST endpoints as a starting point for HTTP-triggered robots |
| [Send GET Request](send-get-request) | Sends an HTTP GET request and displays the response body in a message box |

### Databases

| Template | Description |
|----------|-------------|
| [SQLite Quick Start](sqlite-quick-start) | Demonstrates core SQLite operations: create a database, insert rows, batch-insert, and run a SELECT query |

### Productivity

| Template | Description |
|----------|-------------|
| [Translator](translator) | Translates text between languages using Google Translate via headless browser automation |
| [Web Element To PDF](web-element-to-pdf) | Converts a specific element on a web page into a downloadable PDF |

### System Utilities

| Template | Description |
|----------|-------------|
| [Read From Clipboard](read-from-clipboard) | Reads the current text from the system clipboard and displays it in a message box |
| [Write To Clipboard](write-to-clipboard) | Prompts for text input via a dialog and copies it to the system clipboard |
| [Password Generator](password-generator) | Generates a random alphanumeric password of configurable length and copies it to the clipboard |

### Concurrency

| Template | Description |
|----------|-------------|
| [Fork Branch With Memory Queue](fork-branch-with-memory-queue) | Demonstrates parallel browser automation — 6 browser instances process a shared queue of URLs concurrently |

### Error Handling

| Template | Description |
|----------|-------------|
| [Handle Errors](handle-errors) | Demonstrates the throw/catch error handling pattern with input validation and a retry loop |

### Other

| Template | Description |
|----------|-------------|
| [BMI Calculator](bmi-calculator) | Calculates Body Mass Index from weight and height inputs — a beginner-friendly demo of input dialogs and basic math |
