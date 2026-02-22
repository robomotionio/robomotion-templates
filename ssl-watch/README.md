# SSL Watch

Monitors SSL certificates for a list of domains stored in Google Sheets and writes expiration data back to the same spreadsheet.

## How It Works

The flow opens a Google Sheets document containing domain names in column A (starting at row 2), iterates over each domain, checks its SSL certificate using the Monitoring package, and writes the days until expiration (column B) and validity status (column C) back into the spreadsheet.

## Prerequisites

- Install **Robomotion.Monitoring** and **Robomotion.GoogleSheets** packages
- Configure a Google Sheets credential in the **Open Spreadsheet** node
- Create a Google Sheet with domain names in column A starting at row 2
- Update the spreadsheet URL in the **Open Spreadsheet** node

## Video Tutorial

[Watch on YouTube](https://www.youtube.com/watch?v=G2Cp1nW5Plc)
