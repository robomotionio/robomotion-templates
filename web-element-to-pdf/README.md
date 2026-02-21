# Web Element to PDF

Web Element to PDF converts a specific section of any web page into a downloadable PDF file. Powered by Robomotion's browser automation and the html2pdf.js library, it targets a single page element by XPath and renders it as a clean PDF, perfect for saving articles, tables, or page sections.

Instead of printing an entire page or using screenshot workarounds, this template isolates exactly the content you want and produces a proper PDF document automatically.

## What Web Element to PDF can do

- Navigate to any web page and wait for it to fully load
- Target a specific page element using an XPath selector
- Convert that element into a PDF using html2pdf.js
- Download the PDF automatically through the browser

## Behind the scenes

The flow opens a browser, navigates to the target URL, and waits for the specified element to appear. It then injects the [html2pdf.js](https://github.com/eKoopmans/html2pdf.js) library into the page and calls it on the element matched by your XPath selector. The library renders the element as a PDF and triggers a browser download. Built in delays ensure the library loads fully and the download completes before the flow stops.

## Configuration

Open the **Config** node and set:

| Variable | Description | Example |
|---|---|---|
| `msg.url` | Page URL | `"https://en.wikipedia.org/wiki/Robotic_process_automation"` |
| `msg.xpath` | XPath of the element to convert | `'//*[@id="content"]'` |
