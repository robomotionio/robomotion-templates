# Launch Excel and Extract Table

The most common way to store structured data into Excel is using tables. Robomotion enables you to retrieve data from whole tables or select specific rows and columns.

## What Launch Excel and Extract Table can do

- Select File Dialog (single, must-exist, filter `*.xls*`) titled `Select the excel file to extract table from...` → `vSelectedFile`, `vBut…
- Conditional (`Core.Programming.Function`, `outputs: 2`) — branch when `vButtonPressed != "Cancel"`; otherwise `Core.Flow.Stop`.
- Launch And Open Excel — path `vSelectedFile`, visible `true`, read-only `false`, load add-ins/macros `false` → `vExcelInstance`. Catch wi…
- Get First Free Column/Row — `vExcelInstance` → `vFirstFreeColumn`, `vFirstFreeRow`.
- Read Cells — `vExcelInstance`, range `A1` → `(vFirstFreeColumn - 1, vFirstFreeRow - 1)`, no header row, format `PlainText` → `vExcelData`.

## Behind the scenes

- The PA flow subtracts `1` from the free column/row to turn an *exclusive* bound into the last used cell — preserve this arithmetic.
- `GetCellContentsMode: PlainText` means numeric cells come back as plain numbers without locale formatting. Use the equivalent enum on the Robomotion Excel package.
- `Message: ExcelData` in the message dialog renders a 2-D range as Excel's default stringification (tab-separated rows). Confirm the chosen dialog node accepts a range directly, or pre-stringify in a Function node.
