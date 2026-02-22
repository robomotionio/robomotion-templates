# Web Element to PDF

Converts a specific element on a web page into a downloadable PDF — useful for saving articles, tables, or page sections.

## How It Works

The flow opens a browser, navigates to the target URL, and waits for the specified element to appear. It then injects the [html2pdf.js](https://github.com/eKoopmans/html2pdf.js) library into the page and calls it on the element matched by your XPath selector. The PDF downloads through the browser automatically. Built-in delays (5s for library load, 10s for download) ensure everything completes before the flow stops.

## Configuration

Open the **Config** node and set:

| Variable | Description | Example |
|---|---|---|
| `msg.url` | Page URL | `"https://en.wikipedia.org/wiki/Robotic_process_automation"` |
| `msg.xpath` | XPath of the element to convert | `'//*[@id="content"]'` |
