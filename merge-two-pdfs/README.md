# Merge Two PDFs

PDF manipulation is an ideal candidate for automation, as many scenarios, such as merging reports, require strictly standardized steps. Robomotion provides a series of PDF nodes to automate these tasks and handle PDF files efficiently.

## What Merge Two PDFs can do

- Custom Form Dialog titled ` Merge two PDFs into one.`. Body:
- Conditional (`Core.Programming.Function`, `outputs: 2`) — branch when `vButtonPressed != "Cancel"`; otherwise `Core.Flow.Stop`.
- Select Folder Dialog with description `Select a folder to save the merged PDF file...` → `vDestinationFolder`, `vButtonPressed3`.
- Merge PDF Files — inputs (in PA order) `[vCustomFormData.SecondDoc, vCustomFormData.FirstDoc]`, output `%vDestinationFolder%/MergedFile.p…
- Show Message (`Core.Dialog.MessageBox`, icon `None`) titled `Done!` with body `The merged file has been saved in: %vDestinationFolder%` →…

## Behind the scenes

- The PA flow concatenates the file paths into a CSV string (`"SecondDoc","FirstDoc"`) — this matches `Pdf.MergeFiles`'s delimited-path input. For Robomotion, construct a real array (not a CSV string) and pass it to the merge node.
- Note the **order swap**: the second file goes first, then the first. This matches PA's main `merge-pdfs` tutorial which reverses the list before merging. Preserve this for consistency.
- Success dialog shows the **folder** path, not the merged-file path — replicate exactly.
