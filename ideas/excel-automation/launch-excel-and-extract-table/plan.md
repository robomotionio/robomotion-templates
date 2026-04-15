# Launch Excel and Extract a Table

**Level:** Beginner

## Description
The most common way to store structured data into Excel is using tables. Robomotion enables you to retrieve data from whole tables or select specific rows and columns.

## Objective
Open an Excel workbook that contains a named table (or a contiguous range), extract it into a Robomotion variable, and iterate through the rows.

## Prerequisites
- Sample `.xlsx` file with a table of headers + several rows (e.g. `employees.xlsx`)
- Robomotion Excel package

## Steps
1. **Open Excel** — open the sample workbook, store session in `vExcelSession`.
2. **Get Active Worksheet** (or **Set Active Worksheet**) — pick the sheet containing the table.
3. **Get First Free Column/Row** — determine the used range bounds.
4. **Read From Excel Worksheet** — read the whole range into `vTable`. Enable "First line is header" so downstream nodes can reference columns by name.
5. **For Each** — loop over `vTable`, assign each row to `vRow`.
6. **Log Message** — print one column (e.g. `{{$json.vRow.Name}}`) to confirm extraction.
7. **Close Excel**.

## Expected Outcome
The robot logs every row of the table to the console, proving the data was extracted as a structured list of objects.

## Variables
| Name | Scope | Purpose |
|------|-------|---------|
| `vExcelSession` | Message | Excel session handle |
| `vTable` | Message | Array of row objects |
| `vRow` | Message | Current row inside the loop |

## Notes
Highlight the difference between reading a whole sheet vs a specific range vs a named table — all three approaches are worth showing as variants.
