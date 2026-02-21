# Screen Capture

Screen Capture takes a screenshot of any web page and saves it to a file on your machine. Powered by Robomotion's browser automation nodes, it opens a browser, renders the page, and captures the result automatically without any manual interaction.

Whether you need to archive a webpage, generate visual reports, or capture page state as part of a larger monitoring workflow, this template handles the full process from navigation to file save.

## What Screen Capture can do

- Open a browser and navigate to any URL
- Render the page fully before capturing
- Take a screenshot of the rendered page
- Save the image to a specific file path on your machine

## Behind the scenes

The flow opens a browser instance, navigates to the URL you configure, waits for the page to render, captures a screenshot of the visible viewport, and saves it to the file path you specify. The browser closes automatically once the screenshot is saved.

## Configuration

Open the **Config** node and set:

| Variable | Description | Example |
|---|---|---|
| `msg.url` | Page URL to capture | `"https://www.robomotion.io/"` |
| `msg.downloadPath` | Where to save the screenshot | `"/home/user/screenshot.png"` |
