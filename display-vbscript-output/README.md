# Display VBScript Output

Microsoft VBScript is a general-purpose, active scripting language designed for various environments. Robomotion users can run VBScript scripts through their flows and unlock unlimited automation capabilities.

## What Display VBScript Output can do

- Build script (`Core.Programming.Function`) — stores the inline VBScript body in `msg.vbs_script`, builds a temp path `msg.vbs_path` under `$TempDir$` (fallback `C:\Windows\Temp`), and prepares `msg.vbs_args = ['//Nologo', msg.vbs_path]`.
- Write temp VBS (`Core.FileSystem.WriteFile`, `optMode: truncate`) — writes `msg.vbs_script` to `msg.vbs_path`.
- Run VBScript (`Core.Process.StartProcess`) — runs `cscript` with `msg.vbs_args`, captures stdout into `msg.vbscript_output`.
- Delete temp VBS (`Core.FileSystem.Delete`, `continueOnError: true`) — cleans up the temp `.vbs` file.
- Trim output (`Core.Programming.Function`) — strips trailing CR/LF from `msg.vbscript_output`.
- Message Dialog (`Core.Dialog.MessageBox`, `optType: info`) titled `Output from VBScript:` shows `msg.vbscript_output`, then `Core.Flow.Stop`.

## Behind the scenes

- `WScript.Echo` writes to stdout under `cscript.exe`; under `wscript.exe` it would pop a modal. The flow uses `cscript` so the value arrives via stdout and can be captured.
- The temp file name includes `Date.now()` to avoid collisions across concurrent runs; deletion is best-effort (`continueOnError`).
- VBScript is deprecated in Windows 11 24H2 — for new work prefer PowerShell.
