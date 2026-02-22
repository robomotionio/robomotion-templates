# Download File From Web

Downloads a file from a URL and saves it to a local path on your computer.

## How It Works

The flow sends an HTTP request to download the file at the given URL, saves it to the path you specify, and shows a confirmation dialog with the saved file location.

## Configuration

Open the **Config** node and set:

| Variable | Description | Example |
|---|---|---|
| `msg.file_url` | URL of the file to download | `"https://example.com/report.pdf"` |
| `msg.download_path` | Local path to save the file | `"/home/user/Downloads/report.pdf"` |
