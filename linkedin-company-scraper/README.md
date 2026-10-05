# LinkedIn Company Scraper

Reads a LinkedIn company page: the name, industry, size, headquarters, website, specialties and overview, into a CSV.

## What it extracts

- **name**
- **industry**
- **companySize**
- **headquarters**
- **website**
- **specialties**
- **overview**

## How it works

1. Log in to LinkedIn once in Chrome, in the profile you will use for the robot.
2. In **Setup Vars**, set `profile_dir` to that Chrome profile folder. Chrome cannot open a profile another Chrome window has open: close Chrome before the run, or use a profile of its own.
3. Run the flow and enter the page URL (for example `https://www.linkedin.com/company/microsoft/about/`) when prompted.
4. The flow opens the page with your login, reads each field, and saves the result as `linkedin-company-scraper.csv` in your home folder.

The selectors were made with Robomotion's Web Inspector and tested on pages they were not made on. They name sections by their headings and fields by their labels, never by the values they read.
