# Facebook Profile Scraper

Reads a Facebook profile: the name, where the person lives and is from, their work and education, into a CSV.

## What it extracts

- **fullName**
- **livesIn**
- **from**
- **work**
- **education**

## How it works

1. Log in to Facebook once in Chrome, in the profile you will use for the robot.
2. In **Setup Vars**, set `profile_dir` to that Chrome profile folder. Chrome cannot open a profile another Chrome window has open: close Chrome before the run, or use a profile of its own.
3. Run the flow and enter the page URL when prompted (for example `https://www.facebook.com/OrderBiryani/`).
4. The flow opens the page with your login, reads each field, and saves the result as `facebook-profile-scraper.csv` in your home folder.

The selectors were made with Robomotion's Web Inspector and tested on pages they were not made on. They name sections by their headings and fields by their labels, never by the values they read.
