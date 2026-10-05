# LinkedIn Job Scraper

Reads a LinkedIn job: its title, company, location and the About the job text, into a CSV.

## What it extracts

- **jobTitle**
- **company**
- **jobLocation**
- **jobDescription**

## How it works

1. Log in to LinkedIn once in Chrome, in the profile you will use for the robot.
2. In **Setup Vars**, set `profile_dir` to that Chrome profile folder. Chrome cannot open a profile another Chrome window has open: close Chrome before the run, or use a profile of its own.
3. Run the flow and enter the page URL (for example `https://www.linkedin.com/jobs/view/4473604100/`) when prompted.
4. The flow opens the page with your login, reads each field, and saves the result as `linkedin-job-scraper.csv` in your home folder.

The selectors were made with Robomotion's Web Inspector and tested on pages they were not made on. They name sections by their headings and fields by their labels, never by the values they read.
