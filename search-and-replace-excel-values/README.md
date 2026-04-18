# Search and Replace Excel Values

Finding and replacing values while working with big Excel spreadsheets can be a time-consuming and tiring task. Simplify Excel handling and decrease searching time using Robomotion's Excel nodes.

## What Search and Replace Excel Values can do

- Build Default Path (`Core.Programming.Function`) — sets `msg.fixtures_dir` and `msg.sample_xlsx` (`…/fixtures/sample.xlsx`).
- Four Input Dialogs (`Core.Dialog.InputBox`, all titled `Search and replace Excel values`):
  - `Text to find:` (default `Istanbul`) → `msg.text_to_find`.
  - `Text to replace with:` (default `Izmir`) → `msg.new_text`.
  - File path (default `msg.sample_xlsx`) → `msg.selected_file`.
  - Mode `all` / `first` (default `all`) → `msg.rename_function`.
- Validate (`Core.Programming.Function`, `outputs: 2`) — requires a non-empty `msg.text_to_find` and an `.xls*`/`.csv` file; normalises `msg.rename_function` to `first` or `all`; otherwise `Core.Flow.Stop`.
- Open Excel (`Robomotion.MicrosoftExcel.OpenExcel`, `optVisible: true`) → `msg.excel_app_id`.
- Search (`Robomotion.MicrosoftExcel.SearchSheet`, `sheetSelection: Active-Sheet`, `searchTerm: msg.text_to_find`) → `msg.found_cells`.
- Pick Cells To Replace (`Core.Programming.Function`) — `msg.cells_to_replace` is the full array or just the first match based on `msg.rename_function`.
- Loop via `Core.Flow.Label` + `Core.Programming.ForEach` over `msg.cells_to_replace` → `msg.current_cell`:
  - Extract Cell Address (`Core.Programming.Function`) normalises the item (string, `.address`, `.Cell`, or `{column,row}`) into `msg.cell_address`.
  - Replace Value (`Robomotion.MicrosoftExcel.SetCellValue`, `mod1: string`, `continueOnError: true`) writes `msg.new_text` at `msg.cell_address`.
  - `Core.Flow.GoTo` back to the loop label.
- On loop exit: Save (`Robomotion.MicrosoftExcel.SaveExcel`), Close (`Robomotion.MicrosoftExcel.CloseExcel`), then a `Done!` info dialog and `Core.Flow.Stop`.

## Behind the scenes

- `SearchSheet` runs with `sheetSelection: Active-Sheet`, so the search is limited to whichever sheet is active when Excel opens the file.
- `Replace Value` uses `continueOnError: true` so a single protected/locked cell doesn't abort the whole loop.
- `Extract Cell Address` handles multiple shapes of `SearchSheet` output because the package has returned different formats across versions; normalising to a plain `A1`-style string keeps `SetCellValue` happy.
- Replacement writes the whole `msg.new_text` as a string (`mod1: string`) — partial, case-sensitive matching is not performed; each hit cell is fully overwritten.
