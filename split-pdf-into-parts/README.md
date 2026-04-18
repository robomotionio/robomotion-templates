# Split PDF into Parts

As PDF files are a widespread way to share information, a common requirement is splitting them into parts for further processing. Robomotion allows users to split PDF files by a set number of pages without struggle.

## What Split PDF into Parts can do

- `Core.Flow.SubFlow` `Download Fixtures` preps sample data, then `Core.Programming.Function` builds `msg.default_pdf = global.get('$Home$') + '/templates/pdf-automation/split-pdf-into-parts/fixtures/sample.pdf'`.
- Input Dialog titled `Split a PDF file`, message `Select a PDF file to split:`, default `msg.default_pdf` -> `msg.pdf_path`.
- Input Dialog titled `Split a PDF file`, message `Specify the number of pages to split by:`, default `3` -> `msg.n_text`.
- Validate (`Core.Programming.Function`, `outputs: 2`) — requires a `.pdf` path and integer `n >= 1`; sets `msg.pages_per_part`, `msg.directory`, `msg.pages_dir = <dir>/_pages_<stamp>`, `msg.split_output_dir = <dir>/parts_<stamp>`; failure goes to `Core.Flow.Stop`.
- `Core.FileSystem.Create` (directory, `continueOnError`) on `msg.pages_dir`, then `Robomotion.PDFBox.Split` (`optPerPage: 1`, prefix `p`) bursts the source into `msg.pages_dir`.
- `Core.FileSystem.List` (`optAbsolutePath: true`, `optSort: 'ascend'`) -> `msg.page_files`; a Function filters out dirs, sorts by name and packs paths into `msg.chunks` of size `msg.pages_per_part`.
- `Core.FileSystem.Create` on `msg.split_output_dir`, then `Core.Flow.GoTo` into the `Loop Start` label that runs `Core.Programming.ForEach` over `msg.chunks` -> `msg.current_chunk` / `msg.current_index`.
- Each iteration calls `Core.Flow.SubFlow` `Merge Chunk` then `Core.Flow.GoTo` back to `Loop Start`; when exhausted, `Core.FileSystem.Delete` cleans `msg.pages_dir`, builds `msg.dialog_text` and shows `Core.Dialog.MessageBox` titled `Flow ran successfully!`.

## Behind the scenes

- The timestamped `_pages_<stamp>` and `parts_<stamp>` directories are siblings of the source PDF, so repeated runs never clobber each other and the per-page staging area is easy to clean up after merging.
- Splitting is done in two passes: burst to one file per page with `Robomotion.PDFBox.Split`, then merge slices of `msg.pages_per_part` pages via the `Merge Chunk` subflow. This keeps the loop body trivial and lets `Core.FileSystem.List` drive the chunking order.
- The final message points the user at `msg.split_output_dir` rather than individual file names because the merge subflow is responsible for its own naming scheme.
