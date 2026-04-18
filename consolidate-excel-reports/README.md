# Consolidate Excel Reports

Large-scale reporting is a typical process across many businesses and organizations. Robomotion makes gathering data and creating reports a fast and fully automated task.

## What Consolidate Excel Reports can do

- Download Fixtures subflow, then Init Combined builds `msg.fixtures_dir`, `msg.combined_table = null`, and `msg.output_path = <fixtures>/Consolidated Report.csv`.
- Get Excel Files Details subflow populates `msg.file_list` and `msg.recipient_email`; Validate List (`Core.Programming.Function`, `outputs: 2`) short-circuits to `Core.Flow.Stop` when either is missing.
- `Core.Flow.Label` + `Core.Flow.GoTo` drive a loop around a `Core.Programming.ForEach` over `msg.file_list` (`msg.current_file`); the Read and Append subflow merges each workbook's rows into `msg.combined_table`.
- Serialize Combined CSV (Function) flattens `msg.combined_table` into `msg.consolidated_csv`; `Core.FileSystem.WriteFile` writes it to `msg.output_path`; Build Attachments sets `msg.attachments = [msg.output_path]` and `msg.retry_count = 0`.
- `Robomotion.MicrosoftOutlook.SendMail` sends the CSV to `msg.recipient_email`; a `Core.Trigger.Catch` retries once after a 5s `Core.Programming.Sleep`, then stops `failed`. Success ends with a Message Box showing the save path and recipient.

## Behind the scenes

- `Robomotion.MicrosoftOutlook.SendMail` is flaky on the first call if Outlook hasn't finished initialising — the single retry with a 5s sleep absorbs that cold-start window.
- Outlook is intentionally left running after the send so the user can inspect the Sent folder; no explicit close node.
