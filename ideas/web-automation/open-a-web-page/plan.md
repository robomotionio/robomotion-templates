# Open a Web Page

**Level:** Beginner

## Description
Before performing any other web tasks, you have to launch a browser window and load the appropriate web page. Robomotion allows you to launch instances of all popular browsers and load web pages on them.

## Objective
Launch a browser (Chrome/Edge/Firefox), navigate to a URL, wait for the page to finish loading, and cleanly close the browser.

## Prerequisites
- Robomotion Browser package and the matching browser extension installed
- Target URL (e.g. `https://www.robomotion.io`)

## Steps
1. **Open Browser** node — choose the browser (Chrome by default). Output session handle to `vBrowser`.
2. **Navigate** node — go to `https://www.robomotion.io`, wait for `load` event.
3. **Delay** (optional) — a few seconds so learners can observe the loaded page.
4. **Close Browser** — terminate the session using `vBrowser`.

## Expected Outcome
The chosen browser opens, loads the target URL, and closes automatically. No orphan browser or WebDriver processes remain.

## Variables
| Name | Scope | Purpose |
|------|-------|---------|
| `vBrowser` | Message | Browser session handle |

## Notes
This is the baseline every other Web Automation tutorial builds on — keep it minimal and reuse `vBrowser` across the track.
