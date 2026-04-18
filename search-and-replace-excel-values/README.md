# Search and Replace Excel Values

Finding and replacing values while working with big Excel spreadsheets can be a time-consuming and tiring task. Simplify Excel handling and decrease searching time using Robomotion's Excel nodes.

## What Search and Replace Excel Values can do

- Custom Form Dialog with the header *"This desktop flow searches and replaces the provided values from the selected worksheet. Note that t…
- Conditional (`Core.Programming.Function`, `outputs: 2`) — branch when `vButtonPressed != "Cancel"`; otherwise `Core.Flow.Stop`.
- Launch And Open Under Existing Process — `vCustomFormData.File input`, visible, read-write → `vExcelInstance`.
- Conditional ladder on `vCustomFormData.RenameFunction`:
- Close Excel And Save — `vExcelInstance`.

## Behind the scenes

- `LaunchAndOpenUnderExistingProcess` reuses an already-running Excel process if one exists — faster than spawning a new instance; preserve this choice.
- `MatchCase: False`, `MatchEntireCellContents: False` — the replace is a case-insensitive substring match. Don't tighten these silently.
- `SearchBy: Rows` defines the scan order; it only matters for `FindAndReplaceSingle` which stops at the first hit.
