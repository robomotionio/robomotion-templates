# Get Login Name Using Python

Besides the Python built-in functions, Robomotion enables users to extend scripting capabilities using external modules. External modules facilitate code reuse and prevent users from redeveloping the same functionality.

## What Get Login Name Using Python can do

- `Core.Process.StartProcess` runs `powershell` with `-NoProfile -Command $env:USERNAME` in the foreground and captures stdout into `msg.login_name_raw`.
- `Core.Programming.Function` trims trailing CR/LF from `msg.login_name_raw` and composes `msg.dialog_text = 'Machine login name: ' + user`.
- `Core.Dialog.MessageBox` titled `Login name` (type `info`) displays `msg.dialog_text`, then `Core.Flow.Stop`.

## Behind the scenes

- The flow shells out to PowerShell rather than Python because `$env:USERNAME` is available on every stock Windows host, while a Python interpreter is not guaranteed. The template name is retained from the original; swap the process call for `python -c "import getpass; print(getpass.getuser())"` if a Python runtime is required for parity.
- `-NoProfile` skips user profile scripts so login shells with slow or interactive profiles do not stall the flow.
- The trim loop guards against both `\r\n` (Windows) and `\n`-only (WSL/PowerShell Core) output so the dialog never shows a trailing blank line.
- `getpass.getuser()` (or `$env:USERNAME`) returns the environment user; on shared-session hosts this may differ from the interactive desktop user — use a Win32 API call if that distinction matters.
