# API Health Check

Checks whether an API endpoint is reachable by sending an HTTP GET request and inspecting the response status code.

## How It Works

The flow sends a GET request to the configured URL with a `Content-Type: application/json` header. It then checks the response status code: a `200` shows a success dialog, a `500` shows an error dialog. You can extend the Switch node to handle additional status codes like `401` or `404`.

## Configuration

Open the **Config** node and set:

| Variable | Description | Example |
|---|---|---|
| `msg.endpoint` | URL to check | `"https://api.robomotion.io/version"` |
