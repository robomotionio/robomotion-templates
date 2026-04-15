# Consolidate Excel Reports

**Level:** Intermediate

## Description
Large-scale reporting is a typical process across many businesses and organizations. Robomotion makes gathering data and creating reports a fast and fully automated task.

## Objective
Read many per-region/per-month Excel files from a folder, merge their rows into a single consolidated workbook, and add a summary row with totals.

## Prerequisites
- Input folder with multiple `.xlsx` files sharing the same column schema (e.g. `sales_jan.xlsx`, `sales_feb.xlsx`, …)
- Output folder for the consolidated report
- Robomotion Excel package and Files package

## Steps
1. **List Files in Folder** — glob `*.xlsx` in the input folder, store in `vFiles`.
2. Initialize `vAllRows = []` (Flow-scoped).
3. **For Each** file in `vFiles`:
   1. **Open Excel** with the current file path.
   2. **Read From Excel Worksheet** into `vRows`.
   3. **For Each** row in `vRows`: append to `vAllRows` (optionally tagging with the source filename).
   4. **Close Excel** (do not save).
4. **Open Excel** — new blank workbook for the report.
5. **Write To Excel Worksheet** — write `vAllRows` starting at `A1`.
6. **Write To Excel Worksheet** — write a totals row using an Excel formula (`=SUM(...)`) or pre-computed sums.
7. **Save Excel As** — save to `reports/consolidated.xlsx`.
8. **Close Excel**.

## Expected Outcome
A single workbook at `reports/consolidated.xlsx` containing every row from every input file plus a totals row.

## Variables
| Name | Scope | Purpose |
|------|-------|---------|
| `vFiles` | Flow | Input file list |
| `vAllRows` | Flow | Accumulated rows |
| `vRows` | Message | Rows from the current file |

## Notes
Good place to demonstrate Flow vs Message scope — `vAllRows` must be Flow so it survives loop iterations.
