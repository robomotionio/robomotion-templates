# SSL Watch

Monitors domain SSL certificates using Robomotion's Monitoring package. Checks each domain, calculates days until expiration, and updates a Google Sheets file automatically.

## How It Works

1. **Start** — The flow is triggered manually via the Inject node.
2. **Open Spreadsheet** — Opens a Google Sheets document containing a list of domains.
3. **Get Range** — Reads the domain list from the spreadsheet with headers.
4. **For Each** — Iterates over each row (domain) in the spreadsheet.
5. **SSL Check** — Uses the Monitoring package to check the SSL certificate for each domain.
6. **Set Cell Coord** — Calculates the target cell coordinates for writing results.
7. **Set Expires In Value** — Writes the number of days until certificate expiration.
8. **Set Valid Value** — Writes whether the certificate is currently valid.
9. **Loop** — Goes back to process the next domain until all are checked.

## Dependencies

| Package | Version |
|---|---|
| Robomotion.Monitoring | 0.4.1 |
| Robomotion.GoogleSheets | 1.3.0 |

## Setup

1. Import the template into your Robomotion workspace.
2. Create a Google Sheets document with a column of domains (column A, starting at row 2).
3. Configure the Google Sheets credential in the Open Spreadsheet node.
4. Update the spreadsheet URL in the Open Spreadsheet node.
5. Run the flow.

## Video Tutorial

[Watch on YouTube](https://www.youtube.com/watch?v=G2Cp1nW5Plc)
