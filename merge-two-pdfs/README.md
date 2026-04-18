# Merge Two PDFs

PDF manipulation is an ideal candidate for automation, as many scenarios, such as merging reports, require strictly standardized steps. Robomotion provides a series of PDF nodes to automate these tasks and handle PDF files efficiently.

## What Merge Two PDFs can do

- `Download Fixtures` subflow then `Build Defaults` (`Core.Programming.Function`) sets `msg.default_first`, `msg.default_second`, `msg.default_dest` under `$Home$/templates/pdf-automation/merge-two-pdfs/fixtures`.
- Three `Core.Dialog.InputBox` prompts titled ` Merge two PDFs into one.` collect `msg.first_doc`, `msg.second_doc`, and `msg.destination_folder` using the defaults above.
- `Validate Inputs` (`Core.Programming.Function`, `outputs: 2`) — short-circuits to `Core.Flow.Stop` if any path is empty; otherwise builds `msg.pdf_paths = [msg.second_doc, msg.first_doc]` and seeds `msg.candidate_path` as `<dest>\MergedFile.pdf`.
- `Core.FileSystem.Create` ensures the destination directory exists, then a `Core.Flow.Label`/`Core.FileSystem.PathExists` loop increments `msg.suffix_idx` until `msg.candidate_path` is free and stores it as `msg.merged_path`.
- `Robomotion.PDFProcessor.Core.Merge` writes `msg.pdf_paths` to `msg.merged_path`, then `Core.Dialog.MessageBox` titled `Done!` shows the final path via `msg.dialog_text`.

## Behind the scenes

- The merge node receives a real array (`msg.pdf_paths`), not a delimited string — `Robomotion.PDFProcessor.Core.Merge` expects an array of paths.
- Note the **order swap**: `msg.pdf_paths` lists the second document first, then the first. This preserves the reversed-list convention from the original tutorial.
- The suffix loop guarantees we never overwrite an existing `MergedFile.pdf`; subsequent runs land on `MergedFile_2.pdf`, `MergedFile_3.pdf`, etc.
- The success dialog surfaces the full merged-file path (`msg.merged_path`), so the user can locate the exact output even when the suffix loop renamed it.
