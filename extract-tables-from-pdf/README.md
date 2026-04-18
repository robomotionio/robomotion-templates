# Extract Tables from PDF

Although PDF format is typical for sharing content, directly manipulating tables inside it can be overwhelming. Robomotion enables users to extract tables from PDF files and store them in other file types, such as Excel worksheets, for easier editing.

## What Extract Tables from PDF can do

- Custom Form Dialog titled `Extract PDF tables to Excel worksheets` with one required file field labelled `Select the PDF to extract table…
- Conditional (`Core.Programming.Function`, `outputs: 2`) — branch when `vButtonPressed != "Cancel"`; otherwise `Core.Flow.Stop`.
- Extract PDF Tables — source `vCustomFormData.PDF`, multi-page tables `true`, first row as header `true` → `vExtractedPDFTables` (array, e…
- Launch Excel Under Existing Process (visible) → `vExcelInstance`.
- Initialise counter — `msg.vI = 0` in a Function node.

## Behind the scenes

- PA's flow **does not save the workbook** and **does not close Excel** — leaves them both open so the user inspects the result manually. Preserve that.
- The rename happens before the loop; inside the loop, writes target the active sheet, then a new sheet is appended for the *next* table. The very last iteration appends an unused empty `Table N+1` sheet — this is a PA quirk, but mirror it for fidelity.
- `Excel.WriteToExcel.Write` with a `DataTable` value writes starting at the active cell (typically A1) and auto-expands.
