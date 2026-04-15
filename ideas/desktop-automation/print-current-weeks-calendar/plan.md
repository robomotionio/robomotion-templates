# Print Current Week's Calendar

**Level:** Intermediate

## Description
Desktop users usually have daily routines, such as printing their weekly calendar, that helps them keep themselves productive and organized. Create desktop flows that automate these repetitive tasks and make your workweek easier.

## Objective
Launch Outlook (or a configured calendar app), navigate to the current week view, and print it to a PDF named `week-YYYY-WW.pdf`.

## Prerequisites
- Windows with Microsoft Outlook (classic) installed and a mail profile configured
- Robomotion Desktop package + UI Automation
- "Microsoft Print to PDF" printer available
- Output folder `./calendars/`

## Steps
1. **Get Current Date** → `vNow`.
2. **Format Date** — compute ISO week number into `vWeekLabel` (e.g. `2026-16`).
3. **Run Application** — launch `outlook.exe` → `vApp`.
4. **Wait For Window** — "Inbox - … - Outlook".
5. **Send Keys** `Ctrl+2` to jump to the Calendar module.
6. **Send Keys** `Ctrl+Alt+3` (Work Week view) or use UI click to activate Week view.
7. **Send Keys** `Ctrl+P` to open Print.
8. **Click** printer dropdown → select "Microsoft Print to PDF".
9. **Click** "Print Options" → choose the "Weekly" style if not default.
10. **Click** Print.
11. **Wait For Window** — Save-As dialog.
12. **Set Text** file name → `./calendars/week-{vWeekLabel}.pdf`.
13. **Click** Save.
14. Wait for the file to appear on disk, then **Close Window**.

## Expected Outcome
A PDF named `week-YYYY-WW.pdf` is produced in `./calendars/` containing the current week's calendar.

## Variables
| Name | Scope | Purpose |
|------|-------|---------|
| `vNow` | Message | Today |
| `vWeekLabel` | Flow | ISO week label |
| `vApp` | Message | Outlook process |

## Notes
- Outlook UI changes between builds — the tutorial should show how to capture selectors with the Robomotion recorder, not hard-code fragile ones.
- Recommend scheduling this flow with a Cron trigger every Monday 08:00.
