# Extract Table(s) from PDF

**Level:** Intermediate

## Description
Although PDF format is typical for sharing content, directly manipulating tables inside it can be overwhelming. Robomotion enables users to extract tables from PDF files and store them in other file types, such as Excel worksheets, for easier editing.

## Objective
Detect every table in a PDF, extract them into structured data, and write each table to a separate worksheet in a single Excel workbook.

## Prerequisites
- Robomotion PDF package + Excel package
- Source PDF with one or more tables (`./reports/financials.pdf`)

## Steps
1. **Extract PDF Tables** — input `./reports/financials.pdf` → `vTables` (array of table objects).
2. **If** `vTables.length == 0` — **Throw Error** "No tables detected; review OCR/text-layer."
3. **Open Excel** — new blank workbook → `vBook`.
4. **For Each** (index, table) in `vTables`:
   1. **Add Worksheet** — name it `Table-{index+1}`.
   2. **Write To Excel Worksheet** — write `table.rows` starting at `A1`, including headers.
5. **Save Excel As** — `./reports/financials-tables.xlsx`.
6. **Close Excel**.

## Expected Outcome
A workbook with one sheet per detected table, each sheet populated with headers in row 1 and data rows beneath.

## Variables
| Name | Scope | Purpose |
|------|-------|---------|
| `vTables` | Message | Detected tables |
| `vBook` | Message | Excel session |

## Notes
- Table detection quality depends on the PDF's text layer; scanned PDFs need OCR first.
- Flag when merged cells or multi-row headers confuse detection — recommend post-processing in Excel.
