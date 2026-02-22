# Send GET Request

Sends an HTTP GET request and displays the response. By default it calls `https://ifconfig.me` to show your public IP address.

## How It Works

The flow sends a GET request to the configured URL and shows the response body in a message box. You can point it at any URL that returns text or JSON.

## Configuration

Open the **Config** node and set:

| Variable | Description | Example |
|---|---|---|
| `msg.service_address` | URL to send the GET request to | `"https://ifconfig.me"` |
