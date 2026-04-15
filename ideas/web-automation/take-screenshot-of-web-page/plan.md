# Take Screenshot of a Web Page

**Level:** Beginner

## Description
Taking screenshots is a valuable ability in web flows, as users can store and share the current state of a web page. A typical scenario where screenshots are needed is logging. Robomotion provides a dedicated node to take screenshots of whole web pages or specific web elements.

## Objective
Navigate to a web page and capture three artifacts: a full-page screenshot, a viewport screenshot, and a screenshot of a single element.

## Prerequisites
- Robomotion Browser package + browser extension
- Output folder for screenshot files (`./screenshots/`)
- Target URL with a visible element to capture (e.g. the hero section of `https://www.robomotion.io`)

## Steps
1. **Open Browser** → `vBrowser`.
2. **Navigate** to the target URL; wait for page load.
3. **Screenshot Page** — full-page mode, save as `screenshots/full-page.png`.
4. **Screenshot Page** — viewport-only mode, save as `screenshots/viewport.png`.
5. **Screenshot Element** — use a CSS selector (e.g. `header .hero`) to capture just that element → `screenshots/hero.png`.
6. **Log Message** — report the three file paths.
7. **Close Browser**.

## Expected Outcome
Three PNG files exist in `./screenshots/`, each showing the expected content (full page vs viewport vs single element).

## Variables
| Name | Scope | Purpose |
|------|-------|---------|
| `vBrowser` | Message | Browser session |
| `vSelector` | Flow | CSS selector for the element screenshot |

## Notes
Emphasize that this pattern is how users add evidence to audit logs in real production flows — not just a demo trick.
