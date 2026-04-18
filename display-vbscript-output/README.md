# Display VBScript Output

Microsoft VBScript is a general-purpose, active scripting language designed for various environments. Robomotion users can run VBScript scripts through their flows and unlock unlimited automation capabilities.

## What Display VBScript Output can do

- Run VBScript — body:
- Show Message (`Core.Dialog.MessageBox`, icon `None`) titled `Output from VBScript:` with body `vVBScriptOutput` → `vButtonPressed`.

## Behind the scenes

- `WScript.Echo` writes to stdout under `cscript.exe`; under `wscript.exe` it opens a modal popup. The PA runner uses `cscript.exe` so the value arrives via stdout.
- VBScript is deprecated in Windows 11 24H2 — for new work prefer PowerShell.
