# LinkedIn Company URL Finder

Finds the LinkedIn company pages for a company name with LinkedIn's own company search: each result's page URL, name, industry and location, into a CSV.

## What it extracts



## How it works

1. Log in to LinkedIn once in Chrome, in the profile you will use for the robot.
2. In **Setup Vars**, set `profile_dir` to that Chrome profile folder. Chrome cannot open a profile another Chrome window has open: close Chrome before the run, or use a profile of its own.
3. Run the flow and enter what to search for (for example `Robomotion`) when prompted.
4. The flow opens the page with your login, reads each field, and saves the result as `linkedin-company-url-finder.csv` in your home folder.

The selectors were made with Robomotion's Web Inspector and tested on pages they were not made on. They name sections by their headings and fields by their labels, never by the values they read.
