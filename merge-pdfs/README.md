# Merge PDFs

Robomotion enables users to implement advanced logic in PDF-handling flows to facilitate complex scenarios. For example, PDF nodes, loops, and conditionals can be deployed to create a flow that merges as many PDF files as the user desires.

## What Merge PDFs can do

- `Download Fixtures` subflow then `Seed PDF List` (`Core.Programming.Function`) initialises `msg.pdf_list` with four sample PDFs under `$Home$/templates/pdf-automation/merge-pdfs/fixtures` and sets `msg.default_dest`.
- `Core.Dialog.InputBox` titled ` Merge multiple PDFs into one` prompts for the output folder → `msg.destination_folder`.
- `Reverse And Plan` (`Core.Programming.Function`, `outputs: 2`) — stops when the folder is empty; otherwise reverses `msg.pdf_list`, and seeds `msg.candidate_path` as `<dest>\MergedFile.pdf`.
- `Core.FileSystem.Create` ensures the folder exists, then a `Core.Flow.Label`/`Core.FileSystem.PathExists` loop increments `msg.suffix_idx` until `msg.candidate_path` is free and stores it as `msg.merged_path`.
- `Robomotion.PDFProcessor.Core.Merge` writes `msg.pdf_list` to `msg.merged_path`, then `Core.Dialog.MessageBox` titled `Done!` shows `msg.dialog_text` with the final path.

## Behind the scenes

- The **reverse** step is deliberate — users expect the last-picked document to appear first in the merged output. Preserve it when adapting the flow.
- `Robomotion.PDFProcessor.Core.Merge` accepts a per-file password list via its `PasswordDelimiter` parameter; the flow leaves it unused but the field remains available for password-protected inputs.
- The suffix loop preserves the sequential-suffix behaviour — `MergedFile.pdf`, `MergedFile_2.pdf`, etc. — so repeated runs never overwrite a previous output.
