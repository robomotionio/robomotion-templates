# Print Documents

Printing is an integral part of most workplaces, as hard copies of documents, receipts, and reports are often required. Robomotion enables you to disengage yourself from repetitive printing and focus on more creative and productive tasks.

## What Print Documents can do

- Seed Fixtures Dir (`Core.Programming.Function`) — sets `msg.fixtures_dir` to `$Home$/templates/desktop-automation/print-documents/fixtures`.
- Intro Dialog (`Core.Dialog.MessageBox`, `info`) titled `Print documents` explaining the flow.
- Seed File List (`Core.Programming.Function`) — sets `msg.files_to_print` to `[<fixtures_dir>/hello.txt]`.
- Loop via `Core.Flow.Label` + `Core.Programming.ForEach` over `msg.files_to_print` → `msg.file_to_print`:
  - Build Print Command (`Core.Programming.Function`) — sets `msg.print_args` to `['-NoProfile', '-Command', 'Start-Process -FilePath "<file>" -Verb Print']`.
  - Send To Printer (`Core.Process.StartProcess`, `optBackground: true`, `continueOnError: true`) — `inFilePath: powershell`, `inArguments: msg.print_args`.
  - `Core.Flow.GoTo` back to the loop label.
- After the loop exits: `Core.Flow.Stop`.

## Behind the scenes

- Printing is delegated to Windows' shell `Print` verb via `Start-Process -Verb Print`, so each file is opened by its registered handler and sent to the system default printer.
- The flow is intentionally fire-and-forget — `optBackground: true` and `continueOnError: true` mean one failing print won't block subsequent files, and there's no per-file confirmation or progress dialog.
- `msg.files_to_print` is hard-seeded to the bundled `hello.txt`; swap in a file-picker or directory listing upstream to drive real batches.
