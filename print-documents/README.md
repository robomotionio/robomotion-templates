# Print Documents

Printing is an integral part of most workplaces, as hard copies of documents, receipts, and reports are often required. Robomotion enables you to disengage yourself from repetitive printing and focus on more creative and productive tasks.

## What Print Documents can do

- Intro Dialog (`Core.Dialog.MessageBox`, icon `None`) titled `Print documents` with body *"This desktop flow prompts you to select files t…
- Select File Dialog (multi-select, must-exist) titled `Please select the files you want to print...` → `vSelectedFiles`, `vButtonPressed`.
- Conditional (`Core.Programming.Function`, `outputs: 2`) — branch when `vButtonPressed == "Open"`; otherwise `Core.Flow.Stop`.
- Loop over `vSelectedFiles` (`Core.Flow.Label` → `Core.Programming.ForEach → vFileToPrint` → body → `Core.Flow.GoTo`):
- Print Document — send `vFileToPrint` to the default printer.

## Behind the scenes

- The flow is intentionally fire-and-forget — no confirmation dialog per file and no progress report; match that behaviour.
