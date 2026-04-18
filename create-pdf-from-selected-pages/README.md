# Create PDF from Selected Pages

PDF files may have tens or hundreds of pages depending on the nature of their content. An effective way to handle specific information from these files is to gather it in a separate file. Robomotion's PDF nodes enable users to extract any possible combination of pages and save them in different files for further manipulation.

## What Create PDF from Selected Pages can do

- Build defaults (`Core.Programming.Function`) — seeds `msg.default_pdf` (`fixtures/sample.pdf`) and `msg.default_dest` (`fixtures/output`) from `$Home$`.
- Input Dialog (`Core.Dialog.InputBox`) titled `Create new PDF from selected PDF pages`, prompt `Select the PDF to extract pages from:`, default `msg.default_pdf` → `msg.pdf_path`.
- Input Dialog with prompt `Page number(s) e.g. 1,3,5-7:`, default `1,3,5-7` → `msg.pages_text`.
- Input Dialog with prompt `Select a folder to save the new PDF file...`, default `msg.default_dest` → `msg.destination_folder`.
- Validate and parse (`Core.Programming.Function`, `outputs: 2`) — checks that `msg.pdf_path` ends in `.pdf`, expands `msg.pages_text` (singles + `a-b` ranges) into a deduped, sorted `msg.selected_pages` array, and seeds `msg.pages_dir`, `msg.candidate_path`, `msg.suffix_idx = 0`; invalid input short-circuits to `Core.Flow.Stop`.
- Prepare dirs (`Core.FileSystem.Create` on `msg.destination_folder`, then `Core.FileSystem.Delete` + `Core.FileSystem.Create` on `msg.pages_dir`, all `continueOnError`).
- Split per page (`Robomotion.PDFBox.Split`, `optPerPage: 1`, prefix `p`) — writes one PDF per source page into `msg.pages_dir`.
- List pages (`Core.FileSystem.List`, ascending) → `msg.page_files`, then pick selected paths (`Core.Programming.Function`, `outputs: 2`) — maps `msg.selected_pages` to the ascending file list into `msg.picked_paths`; empty selection goes to `Core.Flow.Stop`.
- Suffix loop (`Core.Flow.Label` + `Core.FileSystem.PathExists` on `msg.candidate_path` + `Core.Programming.Function`, `outputs: 2`) — if the candidate exists, bump `msg.suffix_idx` and retry (`NewPDFfile_2.pdf`, `_3`, ...); otherwise commit to `msg.output_path`.
- Merge selected (`Robomotion.PDFBox.Merge`) — joins `msg.picked_paths` into `msg.output_path`, then `Core.FileSystem.Delete` the pages scratch dir.
- Build done text (`Core.Programming.Function`) sets `msg.dialog_text = 'The new file has been saved in: ' + msg.output_path`, then a Message Dialog (`Core.Dialog.MessageBox`, `optType: info`) titled `Done!` shows it and the flow stops.

## Behind the scenes

- The page-selection grammar (`1,3,5-7` — mixed singles and ranges) is expanded inside the Function node: comma split, `\d+-\d+` regex, dedupe, sort ascending. Pages outside the document range are silently dropped when mapping into `msg.picked_paths`.
- Suffix handling is explicit: the loop tests `Core.FileSystem.PathExists` on `NewPDFfile.pdf`, then `NewPDFfile_2.pdf`, `NewPDFfile_3.pdf`, ... so an existing output is never overwritten.
- Split-then-merge (one PDF per page, then merge the chosen subset) is used instead of a single range-extract call so arbitrary non-contiguous selections (`1,3,5-7`) work uniformly.
- Scratch pages under `msg.pages_dir` are cleared both before the split (stale run) and after the merge (cleanup).
