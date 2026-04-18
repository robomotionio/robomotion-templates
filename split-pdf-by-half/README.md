# Split PDF by Half

Apart from dividing PDF files using a user-defined splitting point, Robomotion enables the implementation of fully automatic logic that doesn't require user input, like always splitting PDF files in half.

## What Split PDF by Half can do

- Build default path (`Core.Programming.Function`) — sets `msg.default_pdf` to the bundled `sample.pdf` under `$Home$/templates/pdf-automation/split-pdf-by-half/fixtures`.
- Input Dialog titled `Split a PDF by half`, message `Select a PDF file to split:`, default `msg.default_pdf` → `msg.pdf_path`.
- Branch On Cancel (`Core.Programming.Function`, `outputs: 2`) — routes to `Core.Flow.Stop` unless `msg.pdf_path` ends with `.pdf`.
- Derive Paths (`Core.Programming.Function`) — splits the file path into `msg.directory` and builds `msg.split_output_dir` as `<directory>\split_halves_<timestamp>`.
- Get Page Count / Compute Half (`Core.Flow.SubFlow`) — populate `msg.page_count` and `msg.half`.
- Plan Split (`Core.Programming.Function`, `outputs: 2`) — stops when `page_count < 2`; otherwise sets `msg.custom_pages = [msg.half + 1]`.
- Ensure Split Dir (`Core.FileSystem.Create`, `optType: directory`, `continueOnError: true`) for `msg.split_output_dir`.
- Split At Midpoint (`Robomotion.PDFProcessor.Core.Split`) — `inPDFPath: msg.pdf_path`, `inDir: msg.split_output_dir`, `optCustomPages: msg.custom_pages`.
- Build Done Text + `Core.Dialog.MessageBox` (`info`, title `Flow has been completed!`) showing the output directory.

## Behind the scenes

- For odd `msg.page_count`, `msg.half = (count - 1) / 2`, so the second half gets the extra page. Flip the subflow if you prefer the opposite convention.
- `page_count < 2` short-circuits to `Core.Flow.Stop` in `Plan Split` — there's no separate handling for `0` or `1`-page PDFs.
- `Ensure Split Dir` runs with `continueOnError: true` so re-running the flow against an existing timestamped directory doesn't fail.
