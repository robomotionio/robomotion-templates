# Get Images from PDF

Apart from text content, PDF files can contain important information in the form of images. Robomotion offers a PDF node that extracts images from PDF files and enables users to access and process these images independently of the original file.

## What Get Images from PDF can do

- Custom Form Dialog titled `Extract images from PDF` with one required file input labelled `Select the PDF to extract image(s) from:` (err…
- Conditional (`Core.Programming.Function`, `outputs: 2`) — branch when `vButtonPressed != "Cancel"`; otherwise `Core.Flow.Stop`.
- Select Folder Dialog with description `Select to folder to save the extracted images to...` → `vDestinationFolder`, `vButtonPressed2`.
- Extract PDF Images — source `vCustomFormData.PDF`, images folder `vDestinationFolder`, filename base `PDF Image`.

## Behind the scenes

- PA writes files named `PDF Image 1.png`, `PDF Image 2.jpg`, … — the extractor handles the numeric suffix and file extension. Match that naming scheme in the Robomotion variant.
- The flow does **not** check that the destination folder dialog returned `OK` before extracting; a cancelled folder dialog returns an empty path and the extractor fails. Replicate the looseness or add a guard — note the deviation.
