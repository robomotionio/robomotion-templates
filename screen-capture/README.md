# Screen Capture

Takes a screenshot of a web page and saves it to a file.

## How It Works

The flow opens a browser, navigates to the configured URL, captures a screenshot of the rendered page, and saves it to the specified file path.

## Configuration

Open the **Config** node and set:

| Variable | Description | Example |
|---|---|---|
| `msg.url` | Page URL to capture | `"https://www.robomotion.io/"` |
| `msg.downloadPath` | Where to save the screenshot | `"/home/user/screenshot.png"` |
