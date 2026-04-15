# Launch Excel

**Level:** Beginner

## Description
Excel spreadsheets are used to store and analyze large amounts of structured data. Robomotion offers a dedicated group of nodes to automate basic tasks in Excel spreadsheets, such as launching them.

## Objective
Build a flow that launches Microsoft Excel (either with a blank workbook or by opening an existing file) and keeps the application open for subsequent automation.

## Prerequisites
- Robomotion Desktop Robot installed on a Windows machine
- Microsoft Excel installed locally
- Robomotion Excel package enabled in the flow

## Steps
1. **Start** node — flow entry point.
2. **Open Excel** node — launches a new Excel instance. Configure:
   - `Visible`: `true` so the user can observe the demo.
   - `File Path`: leave empty for a blank workbook, or point to an existing `.xlsx`.
   - Output the session handle to a variable (e.g. `vExcelSession`).
3. **Delay** node (optional) — pause a few seconds so the window is visible in the tutorial.
4. **Close Excel** node — close the workbook using `vExcelSession`. Decide whether to save changes via the `Save Before Closing` input.
5. **Stop** node.

## Expected Outcome
Excel launches, remains visible for a moment, then closes cleanly with no orphan Excel processes left running.

## Variables
| Name | Scope | Purpose |
|------|-------|---------|
| `vExcelSession` | Message | Session handle returned by Open Excel |

## Notes
Keep the flow minimal — this is the "hello world" of the Excel tutorial track.
