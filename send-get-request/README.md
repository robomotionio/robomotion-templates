# Send GET Request

Send GET Request fires an HTTP GET request to any URL and displays the response in a message box. Powered by Robomotion's HTTP nodes, it provides the simplest way to fetch data from a web service and inspect the result. By default it calls `https://ifconfig.me` to show your public IP address.

This template is a practical starting point for any automation that needs to consume REST APIs, check service responses, or retrieve data from the web.

## What Send GET Request can do

- Send an HTTP GET request to any URL
- Display the response body in a dialog box
- Work with any endpoint that returns text or JSON
- Serve as a building block for API consuming workflows

## Behind the scenes

The flow sends a GET request to the URL you configure and reads the response body. The response content is passed to a message box for display. You can point it at any public or internal endpoint that returns text or JSON data.

## Configuration

Open the **Config** node and set:

| Variable | Description | Example |
|---|---|---|
| `msg.service_address` | URL to send the GET request to | `"https://ifconfig.me"` |
