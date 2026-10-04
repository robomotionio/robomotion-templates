# Facebook Group Members Export

Exports the members of a Facebook group you belong to (name, profile link, photo, when they joined, their headline) into a CSV, scrolling until it has them all.

## What it extracts

- **Link**
- **Link Text**
- **Image**
- **Text 1**
- **Text 2**

## How it works

1. Log in to Facebook once in Chrome, in the profile you will use for the robot.
2. In **Setup Vars**, set `profile_dir` to that Chrome profile folder. Chrome cannot open a profile another Chrome window has open: close Chrome before the run, or use a profile of its own.
3. Run the flow and enter the list URL when prompted (for example `https://www.facebook.com/groups/2180474725586463/members`).
4. The flow opens the page with your login, scrolls the list until it has read every row (up to 500), and saves the result as `facebook-group-members-export.csv` in your home folder.

The selectors were made with Robomotion's Web Inspector and tested on pages they were not made on. They name sections by their headings and fields by their labels, never by the values they read.
