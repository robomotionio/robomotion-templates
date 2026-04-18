# Convert Excel to PDF Using VBScript

Although UI automation nodes can replicate any manual task, scripting can be a more time-effective solution for some scenarios. For example, Robomotion users can efficiently convert Excel files to PDF using VBScript code instead of interacting with multiple Excel UI components.

## What Convert Excel to PDF Using VBScript can do

- Build paths (`Core.Programming.Function`) — sets `msg.fixtures_dir`, `msg.sample_xlsx` (bundled `sample.xlsx`) and `msg.output_dir` under `$Home$/templates/.../fixtures`.
- Input Dialog (`Core.Dialog.InputBox`) titled `Convert Excel to PDF`, default `msg.sample_xlsx` → `msg.excel_path`; then a second dialog with default `msg.output_dir` → `msg.destination_folder`.
- Validate (`Core.Programming.Function`, `outputs: 2`) — requires an `.xls`/`.xlsx` path and a destination; computes `msg.pdf_path = destination_folder\\ConvertedPDFfile.pdf` and `msg.script_path = destination_folder\\_convert.vbs`. Invalid input routes to `Core.Flow.Stop`.
- Ensure destination (`Core.FileSystem.Create`, `optType: directory`, `continueOnError: true`) against `msg.destination_folder`.
- Build script (`Core.Programming.Function`) — substitutes `${EXCEL_PATH}` and `${PDF_PATH}` in the VBScript template (quoting backslashes and double quotes) → `msg.vbs_body`.
- Write VBS (`Core.FileSystem.WriteFile`, `optMode: truncate`, `optBase64: false`) to `msg.script_path`, then build `msg.vbs_args = ['//Nologo', msg.script_path]`.
- Run script (`Core.Process.StartProcess`, `inFilePath: cscript`, `optBackground: false`) → `msg.vbs_output`, then `Core.FileSystem.Delete` on `msg.script_path` (`continueOnError: true`).
- Show done (`Core.Dialog.MessageBox`, `info`) titled `The flow ran successfully.` with `msg.dialog_text = 'The generated PDF file is stored at: ' + msg.pdf_path`, then `Core.Flow.Stop`.

## Behind the scenes

- `ExportAsFixedFormat 0, ...` is Excel COM's `xlTypePDF`. The trailing `0, 1, 0, , , 0` sets quality (standard), include doc properties, ignore print areas — the positional semantics matter, so preserve the argument list verbatim.
- Path values are interpolated by escaping `\\` and `"` in the Function node before being written into the VBScript literal, which avoids quote-injection when the source or destination contains awkward characters.
- The script exports **the active sheet only**, not every sheet in the workbook. Multi-sheet export requires a different, longer script that loops through `Worksheets`.
- `_convert.vbs` is written next to the PDF and deleted after `cscript` exits so no script artifact is left behind.
