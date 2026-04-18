# Share PowerPoint File as PDF

Handling Windows and desktop applications is an essential part of most automation scenarios. UI automation nodes and recording enable you to launch applications like Microsoft PowerPoint, navigate through their environment, and automate repetitive tasks on them.

## What Share PowerPoint File as PDF can do

- Download Fixtures subflow, then build `msg.fixtures_dir` and `msg.deck_pptx` (a sample deck under `$Home$/templates/desktop-automation/share-powerpoint-file-as-pdf/fixtures`).
- Three Input Dialogs collect the `.pptx` path (`msg.selected_powerpoint`), recipient email (`msg.recipient_email`) and sender email (`msg.sender_email`).
- Derive Paths (`Core.Programming.Function`, `outputs: 2`) — validates a `.pptx` extension; splits the path into `msg.directory`, `msg.file_name_no_ext`, and `msg.pdf_path`; invalid input short-circuits to `Core.Flow.Stop`.
- Build and run a PowerShell SaveAs script via `Core.Process.StartProcess` — opens the deck with PowerPoint COM, calls `SaveAs(pdf, 32, $false)` (ppSaveAsPDF), and captures stdout as `msg.export_output`.
- Send Email Via Outlook subflow dispatches the PDF, then a Message Box confirms `PowerPoint exported and email dispatched.`.

## Behind the scenes

- Retries around transient failures are wired with `Core.Trigger.Catch` + a counter in a Function node and a `Core.Programming.Sleep` between attempts, short-circuiting to `Core.Flow.Stop` after N retries.
- The PowerShell COM path (`PowerPoint.Application` → `SaveAs(…, 32, $false)`) avoids driving the Save-As dialog at all, so there is no filename field to populate — the `.pdf` extension lives in `msg.pdf_path` and is passed in directly.
