# Launch Excel

Excel spreadsheets are used to store and analyze large amounts of structured data. Robomotion offers a dedicated group of nodes to automate basic tasks in Excel spreadsheets, such as launching them.

## What Launch Excel can do

- Select File Dialog (single, must-exist, filter `*.xl*`) titled `Select the excel file...` → `vSelectedFile`, `vButtonPressed`.
- Conditional (`Core.Programming.Function`, `outputs: 2`) — branch when `vButtonPressed != "Cancel"`; otherwise `Core.Flow.Stop`.
- Launch And Open Excel — path `vSelectedFile`, visible `true`, read-only `false`, load add-ins/macros `false` → `vExcelInstance`. Wrap in …

## Behind the scenes

- The PA flow intentionally leaves Excel open after the launch — there is no paired close/save. This is a pure "open" demo; preserve that.
- The `*.xl*` filter matches `.xls`, `.xlsx`, `.xlsm`, `.xlsb` etc. Replicate the glob in whichever dialog replacement is used.
