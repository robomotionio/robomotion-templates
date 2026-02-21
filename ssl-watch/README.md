# SSL Watch

SSL Watch keeps your domains and SSL certificates under control without manual checks. Powered by Robomotion's Monitoring package and the Google Sheets integration, it retrieves live SSL data for each domain, calculates how many days remain before expiration, and verifies whether the certificate is valid, all automatically.

Instead of logging into each domain provider or running manual certificate checks, you maintain a single Google Sheet with your domains and let the robot update the status for you on every run.

## What SSL Watch can do

- Read a list of domains from a Google Sheets spreadsheet
- Check SSL certificate expiration dates and validity for each domain
- Calculate the number of days remaining before each certificate expires
- Update the spreadsheet with Domain, Expires In, and Valid columns automatically

## Behind the scenes

The flow reads the Domains column from your Google Sheet and iterates through each entry. For every domain, it uses the SSL node from the Monitoring package to fetch live certificate data, including the expiration date and validity status. A Function node calculates how many days remain until expiration. The results are written back to the spreadsheet, keeping your monitoring sheet always up to date. The entire process runs end to end without manual intervention.

## Integrating with Google Services

This template also demonstrates how to:

- Create a Google Service Account
- Store credentials securely using Vault
- Inject secrets safely into the robot
- Create and update a Google Sheets file with the Google Sheets package

## Watch the video

https://www.youtube.com/watch?v=G2Cp1nW5Plc
