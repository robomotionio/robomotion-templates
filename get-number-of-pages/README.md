# Get Number of Pages in a PDF

While handling PDF files, users may encounter scenarios that require them to extract specific information regarding the files. The available PDF nodes enable users to retrieve various details from PDF files, such as the total number of their pages.

## What Get Number of Pages in a PDF can do

- `Core.Flow.SubFlow` downloads fixtures, then a Function builds `msg.default_pdf` pointing at `$Home$/templates/pdf-automation/get-number-of-pages/fixtures/sample.pdf`.
- Input Dialog titled `Find the number of pages in PDF`, message `Select a PDF file:`, default `msg.default_pdf` → `msg.pdf_path`.
- Branch (`Core.Programming.Function`, `outputs: 2`) — proceed only when `msg.pdf_path` ends in `.pdf`; otherwise `Core.Flow.Stop`.
- Function derives `msg.count_dir` as `<pdf dir>\_page_count`, then `Core.FileSystem.Delete` + `Core.FileSystem.Create` reset the directory.
- `Robomotion.PDFBox.Split` with `optPerPage: 1` and prefix `p` writes one file per page into `msg.count_dir`.
- `Core.FileSystem.List` populates `msg.page_files`; a Function counts non-directory entries into `msg.page_count` and builds `msg.dialog_text`.
- `Core.FileSystem.Delete` removes the temp dir, then `Core.Dialog.MessageBox` titled `Flow finished running...` shows `msg.dialog_text`.

## Behind the scenes

- Splitting the PDF into single-page files and listing the output directory is a robust way to count pages without relying on metadata that some PDFs omit or misreport.
- The temp directory sits next to the source PDF so the user never has to grant write access to an unfamiliar path; it is cleared before and after the run so repeated executions do not accumulate artefacts.
- `continueOnError: true` on the delete/create pair makes the reset idempotent — a missing directory on the first run, or a locked file from a previous aborted run, does not abort the flow.
- `Robomotion.PDFBox` exposes page metadata directly on some nodes; if performance matters, swap the split/list pair for a metadata read and keep the dialog wiring intact.
