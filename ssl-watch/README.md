# SSL Watch

SSL Watch is a powerful automation designed to keep your domains and SSL certificates under control without manual checks. Using Robomotion's Monitoring package and its built in SSL node, the automation retrieves live SSL data for each domain, calculates how many days remain before expiration, and verifies whether the certificate is valid.

## Watch the video

👉 https://www.youtube.com/watch?v=G2Cp1nW5Plc

## What the automation does

- Reads a list of domains from Google Sheets
- Uses the SSL node to check expiration dates and validity
- Calculates remaining days automatically
- Updates the spreadsheet with columns for: Domain | Expires In | Valid
- Runs end to end without manual intervention

## Integrating with Google Services

The video also demonstrates how to:

- Create a Google Service Account
- Store credentials securely using Vault
- Inject secrets safely into the robot
- Create and update a Google Sheets file with the Google Sheets package

By treating the Domains column as a list, the robot iterates through each domain, fetches its SSL information, and keeps your monitoring sheet always up to date.
