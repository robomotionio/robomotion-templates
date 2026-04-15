# Search and Replace Excel Values

**Level:** Beginner

## Description
Finding and replacing values while working with big Excel spreadsheets can be a time-consuming and tiring task. Simplify Excel handling and decrease searching time using Robomotion's Excel nodes.

## Objective
Scan an Excel worksheet for a target string and replace every occurrence with a new value, then save the workbook.

## Prerequisites
- Sample workbook with repeated occurrences of a target string (e.g. a legacy product code `"SKU-OLD"`)
- Robomotion Excel package

## Steps
1. **Open Excel** — open the workbook, store session in `vExcelSession`.
2. **Read From Excel Worksheet** — read the sheet range into `vTable` (include headers).
3. **For Each** row in `vTable`:
   1. **For Each** key/value in the row.
   2. **If** the cell value equals `"SKU-OLD"`:
      - **Write To Excel Worksheet** — write `"SKU-NEW"` back to the same row/column.
4. **Save Excel** — persist changes.
5. **Close Excel**.

### Alternative approach
If the Excel package exposes a `Find and Replace` node, show it as the one-step variant and contrast it with the loop-based approach.

## Expected Outcome
After the flow runs, the workbook no longer contains any instances of the search term — confirmed by reopening it manually or by a second read + assertion step.

## Variables
| Name | Scope | Purpose |
|------|-------|---------|
| `vExcelSession` | Message | Excel session |
| `vTable` | Message | Worksheet contents |
| `vSearchTerm` | Flow | Value to replace |
| `vReplacement` | Flow | New value |

## Notes
Make the search term and replacement Flow variables so the tutorial doubles as a parameterized utility.
