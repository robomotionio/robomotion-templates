# Display PowerShell Output

PowerShell is a cross-platform shell and scripting language that allows users to interact with the operating system. Flows support the implementation of PowerShell scripts to retrieve system information and automate administrative operations.

## What Display PowerShell Output can do

- Run PowerShell script (`Core.Process.StartProcess`) — runs `powershell` with `-NoProfile -Command '$variableName = "Hello World!"; Write-Output $variableName'`, captures stdout into `msg.powershell_output`.
- Trim output (`Core.Programming.Function`) — strips trailing CR/LF from `msg.powershell_output`.
- Message Dialog (`Core.Dialog.MessageBox`, `optType: info`) titled `Output from PowerShell script:` shows `msg.powershell_output`, then `Core.Flow.Stop`.

## Behind the scenes

- `Write-Output` sends the value on the success stream; `Core.Process.StartProcess` captures it as stdout. A bare `$variableName` line would behave identically — the explicit form is kept for clarity.
- `-NoProfile` skips the user's PowerShell profile so the script starts faster and stays deterministic across machines.
- The captured text typically has a trailing CR/LF, which the Function node trims before the dialog.
