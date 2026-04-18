# Convert Excel to PDF Using VBScript

Although UI automation nodes can replicate any manual task, scripting can be a more time-effective solution for some scenarios. For example, Robomotion users can efficiently convert Excel files to PDF using VBScript code instead of interacting with multiple Excel UI components.

## What Convert Excel to PDF Using VBScript can do

- Custom Form Dialog with header *"This flow converts an Excel file to PDF."* and one required file input labelled `Select the Excel file y…
- Conditional (`Core.Programming.Function`, `outputs: 2`) — branch when `vButtonPressed != "Cancel"`; otherwise `Core.Flow.Stop`.
- Select Folder Dialog with description `Select a folder to save the new PDF file...` → `vDestinationFolder`, `vButtonPressed2`.
- Run VBScript — body (with PA-style `%vCustomFormData['ExcelFile']%` and `%vDestinationFolder%` interpolation):
- Show Message (`Core.Dialog.MessageBox`, icon `None`) titled `The flow ran successfully.` with body `The generated PDF file is stored at: …

## Behind the scenes

- `ExportAsFixedFormat 0, ...` is Excel COM's `xlTypePDF`. The trailing `,0, 1, 0,,,0` sets quality (standard), include doc properties, ignore print areas — preserve the argument list verbatim because the positional semantics matter.
- PA uses string interpolation (`"%vCustomFormData['ExcelFile']%"`) directly into the VBScript source — this is vulnerable to path-based quote injection. Note the risk in production but preserve for fidelity.
- The VBScript only exports **the active sheet**, not every sheet. Real multi-sheet export is a different, longer script.
