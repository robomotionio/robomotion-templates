# Download File From Web

Download File From Web fetches any file from a URL and saves it directly to your local machine. Powered by Robomotion's HTTP nodes, it turns a manual download into an automated step that can be embedded into larger workflows.

Whether you need to grab a daily report, pull a dataset from a remote server, or download assets as part of a bigger pipeline, this template handles the request and file save in one clean step.

## What Download File From Web can do

- Download any file accessible via a public URL
- Save the file to a specific local path on your machine
- Confirm the download with a dialog showing the saved location
- Serve as a reusable building block inside larger automation flows

## Behind the scenes

The flow sends an HTTP request to the URL you configure, receives the file content in the response, and writes it to the local path you specify. Once the download completes, a confirmation dialog displays the saved file location so you know exactly where to find it.

## Configuration

Open the **Config** node and set:

| Variable | Description | Example |
|---|---|---|
| `msg.file_url` | URL of the file to download | `"https://example.com/report.pdf"` |
| `msg.download_path` | Local path to save the file | `"/home/user/Downloads/report.pdf"` |
