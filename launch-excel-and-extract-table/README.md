# Launch Excel and Extract Table

The most common way to store structured data into Excel is using tables. Robomotion enables you to retrieve data from whole tables or select specific rows and columns.

## What Launch Excel and Extract Table can do

- `Download Fixtures` subflow then `Build Default Path` (`Core.Programming.Function`) sets `msg.default_excel_path = $Home$/templates/excel-automation/launch-excel-and-extract-table/fixtures/sample.xlsx` and initialises `msg.retry_count = 0`.
- `Core.Dialog.InputBox` titled `Launch Excel and extract table` prompts `Select the excel file to extract table from...` → `msg.selected_file`.
- `Validate` (`Core.Programming.Function`, `outputs: 2`) — requires `msg.selected_file` to match `/\.xl\w*$/i`; otherwise falls through to `Core.Flow.Stop`.
- `Robomotion.MicrosoftExcel.OpenExcel` opens the file with `optVisible: true` → `msg.excel_app_id`, then `Robomotion.MicrosoftExcel.GetRange` with `optRange: 'All-Range'` and `optHeaders: false` reads the used range → `msg.excel_table`, followed by `Robomotion.MicrosoftExcel.CloseExcel`.
- `Stringify Table` (`Core.Programming.Function`) joins each row with `\t` and rows with `\n` into `msg.excel_text`, then `Core.Dialog.MessageBox` titled `Excel table values extracted:` shows the result.
- `Core.Trigger.Catch` around `Open Excel` — increments `msg.retry_count`, sleeps 2s, `Core.Flow.GoTo` back to the `Retry Point` label; after one retry it stops with `failed`.

## Behind the scenes

- `optRange: 'All-Range'` asks the Excel node for the entire used range in one call, so there is no need to compute free row/column bounds manually.
- `Stringify Table` normalises both array-of-arrays and array-of-objects shapes before rendering, so the dialog copes with either header or no-header extractions.
- The single-retry pattern (`Core.Trigger.Catch` + `Core.Flow.Label` + `Core.Flow.GoTo`) handles transient Excel COM startup failures while still bounding the retry cost.
- `Close Excel` runs before the dialog, so the dialog never blocks the Excel process during display.
