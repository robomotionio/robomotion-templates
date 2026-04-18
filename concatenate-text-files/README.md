# Concatenate Text Files

Reading data from multiple sources and consolidating it in a single file is standard in most document-related operations. Robomotion lets you automate these tasks and effortlessly transfer information across numerous documents.

## What Concatenate Text Files can do

- Intro Dialog (`Core.Dialog.MessageBox`, icon `Information`) titled `Description` with body *"This flow prompts you to select multiple tex…
- Select File Dialog (multi-select, must-exist, filter `*.txt`) titled `Please select the files that will be concatenated...` → `vFilesToCo…
- Conditional (`Core.Programming.Function`, `outputs: 2`) — branch when `vButtonPressed == "Open"`; otherwise fall through to the final dia…
- Loop over `vFilesToConcatenate` (`Core.Flow.Label` → `Core.Programming.ForEach → vCurrentFile` → body → `Core.Flow.GoTo`):
- Read File (`Core.FileSystem.ReadFile`) — `vCurrentFile`, default encoding → `vCurrentFileContents`.

## Behind the scenes

- The output file lives in the **directory of each source file** — if the user picks files from multiple directories, each directory gets its own `ConcatenatedFiles.txt`. Preserve this; it's a PA quirk, not a bug.
- Encoding is `Unicode` on write and `DefaultEncoding` on read — this will garble non-ASCII content if sources are UTF-8. Flag as a known limitation.
- The completion dialog runs **unconditionally** (outside the `IF`) — it fires even when the user cancels. Preserve the structure.
