# LinkedIn Search Export

Exports LinkedIn people search results (name, headline, location, photo) into a CSV, page after page with the Next button.

## What it extracts

- **Link**
- **Image**
- **Text 1**
- **Text 2**
- **Text 3**

## How it works

1. Log in to LinkedIn once in Chrome, in the profile you will use for the robot.
2. In **Setup Vars**, set `profile_dir` to that Chrome profile folder. Chrome cannot open a profile another Chrome window has open: close Chrome before the run, or use a profile of its own.
3. Run the flow and enter the list URL (for example `https://www.linkedin.com/search/results/people/?keywords=rpa%20developer`) when prompted.
4. The flow opens the page with your login, scrolls the list until it has read every row (up to 500), and saves the result as `linkedin-search-export.csv` in your home folder.

The selectors were made with Robomotion's Web Inspector and tested on pages they were not made on. They name sections by their headings and fields by their labels, never by the values they read.
