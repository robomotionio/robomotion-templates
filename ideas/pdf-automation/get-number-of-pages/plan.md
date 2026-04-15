# Get Number of Pages in a PDF

**Level:** Intermediate

## Description
While handling PDF files, users may encounter scenarios that require them to extract specific information regarding the files. The available PDF nodes enable users to retrieve various details from PDF files, such as the total number of their pages.

## Objective
Walk a folder of PDFs, read the page count for each one, and produce a CSV report listing filename + page count + total-pages aggregate.

## Prerequisites
- Robomotion PDF package + Files package
- Folder of PDFs (`./reports/`)

## Steps
1. **List Files in Folder** — `./reports/*.pdf` → `vFiles`.
2. Initialize `vReport = []` (Flow) and `vTotal = 0` (Flow).
3. **For Each** file in `vFiles`:
   1. **Get Number of Pages in PDF** → `vPages`.
   2. Append `{name: file.name, pages: vPages}` to `vReport`.
   3. `vTotal = vTotal + vPages`.
4. **Log Message** — `Scanned {vFiles.length} files, {vTotal} pages total`.
5. **Write CSV** — save `vReport` to `./reports/page-counts.csv`.

## Expected Outcome
`page-counts.csv` contains one row per PDF with its page count, and the log reports the grand total.

## Variables
| Name | Scope | Purpose |
|------|-------|---------|
| `vFiles` | Message | PDFs in the folder |
| `vReport` | Flow | Accumulated rows |
| `vTotal` | Flow | Running sum |

## Notes
Useful real-world utility for sizing print jobs or estimating OCR runtime.
