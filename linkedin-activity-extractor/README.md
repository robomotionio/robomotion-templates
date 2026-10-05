# LinkedIn Activity Extractor

Exports a LinkedIn member's recent activity (each post's text, author and links) into a CSV, scrolling for more.

## What it extracts

- **Link**
- **Image**
- **Link Text**
- **Link 2**
- **Link 3**
- **expandable-text-box**
- **Link 4**
- **expandable-text-button**
- **Text 1**
- **Text 2**

## How it works

1. Log in to LinkedIn once in Chrome, in the profile you will use for the robot.
2. In **Setup Vars**, set `profile_dir` to that Chrome profile folder. Chrome cannot open a profile another Chrome window has open: close Chrome before the run, or use a profile of its own.
3. Run the flow and enter the list URL (for example `https://www.linkedin.com/in/williamhgates/recent-activity/all/`) when prompted.
4. The flow opens the page with your login, scrolls the list until it has read every row (up to 500), and saves the result as `linkedin-activity-extractor.csv` in your home folder.

The selectors were made with Robomotion's Web Inspector and tested on pages they were not made on. They name sections by their headings and fields by their labels, never by the values they read.
