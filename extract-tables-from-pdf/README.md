# Extract Tables from PDF

Although PDF format is typical for sharing content, directly manipulating tables inside it can be overwhelming. Robomotion enables users to extract tables from PDF files and store them in other file types, such as Excel worksheets, for easier editing.

## What Extract Tables from PDF can do

- `Core.Flow.SubFlow` downloads fixtures; a Function builds `msg.sample_pdf` (`.../fixtures/tables.pdf`).
- Input Dialog titled `Extract PDF tables to Excel`, message `Select the PDF to extract table(s) from:`, default `msg.sample_pdf` → `msg.pdf_path`.
- Validate (`Core.Programming.Function`, `outputs: 2`) — require a `.pdf` path; derive `msg.xlsx_path` (`<stem>_tables.xlsx`), timestamped `msg.tables_json_path` and `msg.ps_script_path` next to the source.
- `Robomotion.Pandas.PdfToDataTable` (`optPages: 'all'`, `optTableSettings: 'lines'`) → `msg.table_list`.
- Function serialises `msg.table_list` to `msg.tables_json` and embeds the PowerShell script as `msg.ps_script`.
- Two `Core.FileSystem.WriteFile` nodes (`optMode: 'truncate'`) write `msg.tables_json_path` and `msg.ps_script_path`; a Function builds `msg.ps_args = ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', msg.ps_script_path, '-JsonPath', msg.tables_json_path, '-XlsxPath', msg.xlsx_path]`.
- `Core.Process.StartProcess` runs `powershell` with `msg.ps_args` in the foreground; the script adds one sheet per table (named `Table_1`, `Table_2`, …) and saves with Excel format code `51` (`.xlsx`).
- Two `Core.FileSystem.Delete` nodes clean up the JSON and PS1 temp files; a Function builds `msg.dialog_text = 'Extracted tables saved in: ' + msg.xlsx_path`; `Core.Dialog.MessageBox` titled `Done!` (type `info`) displays it.

## Behind the scenes

- The flow uses a JSON-plus-PowerShell bridge rather than driving Excel with UI automation: `Robomotion.Pandas.PdfToDataTable` produces structured rows, `ConvertFrom-Json` rehydrates them, and the COM object writes each sheet deterministically. This avoids UI timing issues and keeps Excel invisible (`$excel.Visible = $false`, `$excel.DisplayAlerts = $false`).
- The workbook is saved to `msg.xlsx_path` and Excel is cleanly closed (`$wb.Close($false)`, `$excel.Quit()`, `ReleaseComObject`) so there is no orphan `EXCEL.EXE` and no "do you want to save?" prompt on a later run.
- Temp file names are timestamped (`Date.now()`) so two concurrent runs against the same PDF do not collide; the cleanup deletes use `continueOnError: true` so an AV-locked file does not abort the flow after the main work is done.
- `optTableSettings: 'lines'` extracts tables defined by visible rules; switch to `'text'` for borderless tables that rely on whitespace alignment.
- Format code `51` corresponds to `xlOpenXMLWorkbook` (the modern `.xlsx` container); change to `56` if a legacy `.xls` is required.
