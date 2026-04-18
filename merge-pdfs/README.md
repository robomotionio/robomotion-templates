# Merge PDFs

Robomotion enables users to implement advanced logic in PDF-handling flows to facilitate complex scenarios. For example, PDF nodes, loops, and conditionals can be deployed to create a flow that merges as many PDF files as the user desires.

## What Merge PDFs can do

- Initialise `vPDFsList = []` (Flow-scoped).
- Custom Form Dialog titled ` Merge multiple PDFs into one`. Body:
- Conditional (`Core.Programming.Function`, `outputs: 2`) — branch when `vButtonPressed != "Cancel"`; otherwise `Core.Flow.Stop`.
- Select Folder Dialog with description `Select to folder to save the merged PDF file...` → `vDestinationFolder`, `vButtonPressed3`.
- Append `vCustomFormData.FirstDoc` and `vCustomFormData.SecondDoc` into `vPDFsList`.

## Behind the scenes

- The **reverse** step is deliberate — the PA tutorial documents it as matching the order users expect (last-picked becomes first). Preserve exactly; don't silently drop the reversal.
- `PasswordDelimiter: ","` hints that the merge node can accept one password per file as a comma-separated list. PA leaves that field unused here, but keep the parameter visible in the plan in case learners need it.
- `AddSequentialSuffix` behaviour must be preserved — `MergedFile.pdf`, `MergedFile_1.pdf`, etc.
