# LinkedIn Post Commenters Export

Exports the people who commented on a LinkedIn post (name, profile link, headline, comment) into a CSV, scrolling for more.

## What it extracts

- **Link**
- **Image**
- **Link 2**
- **expandable-text-box**
- **Link 3**
- **Text 1**
- **Text 2**

## How it works

1. Log in to LinkedIn once in Chrome, in the profile you will use for the robot.
2. In **Setup Vars**, set `profile_dir` to that Chrome profile folder. Chrome cannot open a profile another Chrome window has open: close Chrome before the run, or use a profile of its own.
3. Run the flow and enter the list URL (for example `https://www.linkedin.com/feed/update/urn:li:activity:7508263424536080384/`) when prompted.
4. The flow opens the page with your login, scrolls the list until it has read every row (up to 500), and saves the result as `linkedin-post-commenters-export.csv` in your home folder.

The selectors were made with Robomotion's Web Inspector and tested on pages they were not made on. They name sections by their headings and fields by their labels, never by the values they read.
