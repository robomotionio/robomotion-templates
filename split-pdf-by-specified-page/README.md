# Split PDF by Specified Page

Splitting PDF files into two uneven parts is a typical request, as they often contain two different types of information, such as an order summary and a receipt. Robomotion can automate these scenarios, allowing users to create flows that split PDF files at any possible point.

## What Split PDF by Specified Page can do

- `Core.Flow.SubFlow` `Download Fixtures` preps sample data, then `Core.Programming.Function` builds `msg.default_pdf = global.get('$Home$') + '/templates/pdf-automation/split-pdf-by-specified-page/fixtures/sample.pdf'`.
- Input Dialog titled `Split a PDF into two parts`, message `Select a PDF file to split:`, default `msg.default_pdf` -> `msg.pdf_path`.
- Input Dialog titled `Split a PDF into two parts`, message `Split at page number:`, default `3` -> `msg.split_at_text`.
- Validate (`Core.Programming.Function`, `outputs: 2`) — requires a `.pdf` path and integer `n >= 1`; extracts `msg.directory`, `msg.stem`, `msg.split_at_page`, and derives `msg.pages_dir = <dir>/_pages_<stamp>` and `msg.split_output_dir = <dir>/split_parts_<stamp>`; failure goes to `Core.Flow.Stop`.
- `Core.FileSystem.Create` (directory, `continueOnError`) on `msg.pages_dir`, then `Robomotion.PDFBox.Split` (`optPerPage: 1`, prefix `p`) bursts the source into `msg.pages_dir`.
- `Core.FileSystem.List` (`optAbsolutePath: true`, `optSort: 'ascend'`) -> `msg.page_files`; plan halves (`Core.Programming.Function`, `outputs: 2`) requires `>=2` pages and `1 <= n < count`, slices into `msg.first_paths` / `msg.second_paths`, and computes `msg.first_out = <split_dir>\<stem>-1.pdf` and `msg.second_out = <split_dir>\<stem>-2.pdf`.
- `Core.FileSystem.Create` on `msg.split_output_dir`, then two `Robomotion.PDFBox.Merge` calls write `msg.first_out` and `msg.second_out`.
- `Core.FileSystem.Delete` cleans `msg.pages_dir`, then a Function builds `msg.dialog_text` and `Core.Dialog.MessageBox` titled `Flow has been completed!` shows the output directory.

## Behind the scenes

- Splitting is done in two passes: burst to one file per page with `Robomotion.PDFBox.Split`, then merge the two halves with `Robomotion.PDFBox.Merge`. This keeps the split point a simple `list.slice(0, n)` / `list.slice(n)` decision driven by sorted filenames.
- Output filenames are `<stem>-1.pdf` / `<stem>-2.pdf` (with a hyphen, not an underscore) placed alongside the source in the timestamped `split_parts_<stamp>` directory so repeated runs never overwrite earlier output.
- If the chosen split page is at or past the last page, the `Plan Halves` validator routes to `Core.Flow.Stop` rather than producing an empty second half.
