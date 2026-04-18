# Display PowerShell Output

PowerShell is a cross-platform shell and scripting language that allows users to interact with the operating system. Flows support the implementation of PowerShell scripts to retrieve system information and automate administrative operations.

## What Display PowerShell Output can do

- Run PowerShell — body:
- Show Message (`Core.Dialog.MessageBox`, icon `None`) titled `Output from PowerShell script:` with body `vPowershellOutput` → `vButtonPres…

## Behind the scenes

- `Write-Output` returns the value on the success stream; the runner captures it as stdout. A bare `$variableName` line would work the same way — PA writes it explicitly for clarity.
- The captured text typically has a trailing newline. Trim in a Function node if feeding into a path or command.
