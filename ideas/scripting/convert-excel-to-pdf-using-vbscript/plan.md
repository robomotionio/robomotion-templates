# Convert Excel to PDF Using VBScript

**Level:** Advanced

## Description
Although UI automation nodes can replicate any manual task, scripting can be a more time-effective solution for some scenarios. For example, Robomotion users can efficiently convert Excel files to PDF using VBScript code instead of interacting with multiple Excel UI components.

## Objective
Convert one or many `.xlsx` workbooks to PDFs via Excel's COM automation, driven by a single VBScript invoked from a flow — no UI, no clicks.

## Prerequisites
- Windows with Microsoft Excel installed
- Robomotion Scripting + Files packages
- Input folder `./workbooks/`
- Output folder `./pdfs/`

## Steps
1. **List Files in Folder** `*.xlsx` → `vFiles`.
2. **For Each** file in `vFiles`:
   1. Compute output path `vOut = ./pdfs/{name}.pdf`.
   2. **Run VBScript** — pass `{in: file.path, out: vOut}` via `WScript.Arguments`:
      ```vbscript
      Dim inPath, outPath
      inPath  = WScript.Arguments(0)
      outPath = WScript.Arguments(1)

      Dim xl : Set xl = CreateObject("Excel.Application")
      xl.Visible = False
      xl.DisplayAlerts = False

      Dim wb : Set wb = xl.Workbooks.Open(inPath)
      ' 0 = xlTypePDF
      wb.ExportAsFixedFormat 0, outPath
      wb.Close False
      xl.Quit
      Set wb = Nothing
      Set xl = Nothing
      ```
   3. **File Exists** — assert `vOut` was created.
3. **Log Message** — `Converted {vFiles.length} workbooks`.

### Cleanup
Kill any `EXCEL.EXE` processes left over from failed conversions.

## Expected Outcome
Every workbook in `./workbooks/` produces a matching PDF in `./pdfs/`. No visible Excel windows flash on screen.

## Variables
| Name | Scope | Purpose |
|------|-------|---------|
| `vFiles` | Message | Source workbooks |
| `vOut` | Message | Current PDF path |

## Notes
- Always set `DisplayAlerts = False` before opening, or macro-enabled files will prompt and hang the script.
- On an unattended robot, the Excel COM server needs a user session — document the "run as interactive user" requirement.
- If this runs alongside the Excel-package tutorials, warn that concurrent Excel instances can race.
