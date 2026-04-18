# Robomotion Templates

Ready-to-use flow templates for the [Robomotion](https://robomotion.io) RPA platform.

Every template declares a `level` (Beginner / Intermediate / Advanced) so you can pick an entry point that matches your experience. See [docs/level-field.md](docs/level-field.md).

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
| [DuckDuckGo Scraper](duckduckgo-scraper) | Intermediate | Searches DuckDuckGo and saves result titles and links to an Excel file |
| [Screen Capture](screen-capture) | Beginner | Takes a screenshot of a web page and saves it to a file |

### Web Automation

| Template | Level | Description |
|----------|-------|-------------|
| [Get Metadata of a Web Page](get-metadata-of-web-page) | Intermediate | Navigates to a URL, reads its title and meta tags, and returns them as structured data. |
| [Open a Web Page](open-a-web-page) | Beginner | Launches a browser and navigates to a provided URL — the minimum viable browser-automation template. |
| [Take Screenshot of a Web Page](take-screenshot-of-web-page) | Beginner | Opens a URL in a browser and saves a screenshot of the rendered page to disk. |

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
| [Use Conditionals to Check if File Exists](use-conditionals-to-check-if-file-exists) | Beginner | Checks whether a given file is present on disk and routes the flow accordingly. |
| [Use Labels to Check if File Exists](use-labels-to-check-if-file-exists) | Advanced | Uses Label and GoTo to structure a loop that rechecks file existence — a non-sequential flow pattern useful for polling. |
| [Use Subflows to Check if File Exists](use-subflows-to-check-if-file-exists) | Intermediate | Encapsulates a "does this file exist? |
| [Use the AND Operator in Conditionals](use-and-operator-in-conditionals) | Intermediate | Shows how to branch a flow only when two conditions are both true using a Switch node with a combined predicate. |
| [Use the OR Operator in Conditionals](use-or-operator-in-conditionals) | Intermediate | Combines two conditions with a logical OR and branches the flow based on the result. |

### Concurrency

| Template | Level | Description |
|----------|-------|-------------|
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

### Other

| Template | Level | Description |
|----------|-------|-------------|
| [BMI Calculator](bmi-calculator) | Beginner | Calculates Body Mass Index from weight and height inputs — a beginner-friendly demo of input dialogs and basic math |

### IT Operations

| Template | Level | Description |
|----------|-------|-------------|
| [Password Generator](password-generator) | Beginner | Generates a random alphanumeric password of configurable length and copies it to the clipboard |
