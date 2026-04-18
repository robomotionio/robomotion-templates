# Launch Excel

Excel spreadsheets are used to store and analyze large amounts of structured data. Robomotion offers a dedicated group of nodes to automate basic tasks in Excel spreadsheets, such as launching them.

## What Launch Excel can do

- `Download Fixtures` subflow then `Build Default Path` (`Core.Programming.Function`) sets `msg.default_excel_path = $Home$/templates/excel-automation/launch-excel/fixtures/sample.xlsx` and initialises `msg.retry_count = 0`.
- `Core.Dialog.InputBox` titled `Launch Excel` prompts `Select the excel file...` with that default → `msg.selected_file`.
- `Validate` (`Core.Programming.Function`, `outputs: 2`) — requires `msg.selected_file` to match `/\.xl\w*$/i` (covers `.xls`, `.xlsx`, `.xlsm`, `.xlsb`); otherwise falls through to `Core.Flow.Stop`.
- `Robomotion.MicrosoftExcel.OpenExcel` opens `msg.selected_file` with `optVisible: true` and returns `msg.excel_app_id`.
- `Core.Trigger.Catch` around the open — on failure it increments `msg.retry_count`, sleeps 2s via `Core.Programming.Sleep`, and `Core.Flow.GoTo` jumps back to the `Retry Point` label; after one retry it stops with `failed` and reason `Excel open failed after 1 retry`.

## Behind the scenes

- The flow intentionally leaves Excel open after launch — there is no paired close/save. This is a pure "open" demo template meant to be extended.
- The extension check uses a regex (`\.xl\w*$`) rather than a file-picker filter, so it matches the full Excel family (`.xls`, `.xlsx`, `.xlsm`, `.xlsb`) while still rejecting unrelated paths.
- The single-retry pattern (`Core.Trigger.Catch` + `Core.Flow.Label` + `Core.Flow.GoTo`) is reusable boilerplate for any "try once, retry once, then fail" open/launch node.
