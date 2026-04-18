# Create PDF from Selected Pages

PDF files may have tens or hundreds of pages depending on the nature of their content. An effective way to handle specific information from these files is to gather it in a separate file. Robomotion's PDF nodes enable users to extract any possible combination of pages and save them in different files for further manipulation.

## What Create PDF from Selected Pages can do

- Custom Form Dialog titled `Create new PDF from selected PDF pages`. Fields:
- Conditional (`Core.Programming.Function`, `outputs: 2`) — branch when `vButtonPressed != "Cancel"`; otherwise `Core.Flow.Stop`.
- Select Folder Dialog with description `Select a folder to save the new PDF file...` → `vDestinationFolder`, `vButtonPressed3`.
- Extract Pages — source `vCustomFormData.PDF`, page selection `vCustomFormData.PageNo`, destination `%vDestinationFolder%/NewPDFfile.pdf`,…
- Show Message (`Core.Dialog.MessageBox`, icon `None`) titled `Done!` with body `The new file has been saved in: %vDestinationFolder%\NewPD…

## Behind the scenes

- PA's `AddSequentialSuffix` appends `_1`, `_2`, … when the destination already exists. Whichever Robomotion split node is used, implement this manually in a `Core.Programming.Function` that tests `PathExists` and bumps the suffix.
- The page-selection syntax (`1,3,17-24` — mixed single pages and ranges) is PA-specific. `Robomotion.PDFProcessor.Core.Split` accepts `optCustomPages` as an integer array; parse the string (`split(',')` → expand ranges) inside a Function node before calling the node.
