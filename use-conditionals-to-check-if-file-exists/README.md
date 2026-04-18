# Use Conditionals to Check if File Exists

Implementing different logic paths based on specific conditions is essential to most automation scenarios. Conditionals enable users to check values and run different blocks of code depending on the result.

## What Use Conditionals to Check if File Exists can do

- Input Dialog — message `Please populate a file name to check if it exists in your desktop folder.`, default value `FileName`, single-line…
- Conditional (`Core.Programming.Function`, `outputs: 2`) — branch when `vButtonPressed == "OK"`; otherwise `Core.Flow.Stop`.
- Resolve Desktop path — Function node sets `vDesktopFolderPath = global.get('$Home$') + '/Desktop'`.
- Path Exists (`Core.FileSystem.PathExists`) on `%vDesktopFolderPath%/%vUserInput%` → `vExists` (boolean).
- Conditional on `vExists` (Function node with `outputs: 2`):

## Behind the scenes

- `vUserInput` is **just a filename**, not a full path — the PA flow prepends the Desktop directory before the existence check. Preserve the path join exactly.
- Cancelling the input dialog short-circuits everything; no "cancelled" dialog is shown.
