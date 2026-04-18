# Get Images from PDF

Apart from text content, PDF files can contain important information in the form of images. Robomotion offers a PDF node that extracts images from PDF files and enables users to access and process these images independently of the original file.

## What Get Images from PDF can do

- `Core.Flow.SubFlow` downloads fixtures; a Function builds `msg.source_pdf` (`.../fixtures/with_images.pdf`) and `msg.images_dir` (`.../fixtures/images`).
- Input Dialog titled `Extract images from PDF`, message `Select the PDF to extract image(s) from:`, default `msg.source_pdf` → `msg.pdf_path`.
- Input Dialog titled `Extract images from PDF`, message `Select to folder to save the extracted images to...`, default `msg.images_dir` → `msg.destination_folder`.
- Validate (`Core.Programming.Function`, `outputs: 2`) — proceed when `msg.pdf_path` ends in `.pdf` and `msg.destination_folder` is set; otherwise `Core.Flow.Stop`.
- `Core.FileSystem.Create` with `optType: 'directory'` ensures `msg.destination_folder` exists, then `Robomotion.PDFBox.ExtractImages` writes PNGs prefixed `PDF Image` to that folder.
- `Core.Dialog.MessageBox` titled `Done!` (type `info`) confirms with `Images extracted successfully.`.

## Behind the scenes

- `Robomotion.PDFBox.ExtractImages` names outputs `PDF Image 1.png`, `PDF Image 2.png`, … — the node owns the numeric suffix and extension, so `optPrefix` only controls the human-readable stem.
- `optExportType: 'png'` normalises output regardless of the source image format inside the PDF, which makes downstream OCR and thumbnailing easier than dealing with a mix of JPEG, TIFF and DCT streams.
- `Core.FileSystem.Create` with `continueOnError: true` acts as an `mkdir -p` — harmless when the folder already exists and avoids a pre-check branch.
- The validator rejects empty `msg.destination_folder` before extraction, so an empty dialog response short-circuits to `Core.Flow.Stop` instead of failing inside the PDF node.
