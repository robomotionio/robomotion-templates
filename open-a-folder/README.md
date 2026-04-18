# Open a Folder

Interacting with the file system is essential in most home and business automation scenarios. Using Robomotion, you can automatically open specific folders in File Explorer and directly interact with their content.

## What Open a Folder can do

- Resolve Documents path — in a `Core.Programming.Function`, compute the Documents folder via `global.get('$Home$') + '/Documents'` (Window…
- Select Folder Dialog with description `Select the folder to open...`, initial directory `vDocumentsFolderPath`, top-most → `vSelectedFold…
- Conditional (`Core.Programming.Function`, `outputs: 2`) — branch when `vButtonPressed != "Cancel"`; route the other branch to `Core.Flow.…
- Run Application — launch `explorer` with `vSelectedFolder` as the command-line argument, window style `Normal`; capture `vAppProcessId`.
- Stop (`Core.Flow.Stop`).

## Behind the scenes

- `explorer <path>` (no `.exe`) is what the PA flow uses — preserve that. It resolves to File Explorer on Windows. On Linux/macOS, substitute `xdg-open` / `open` and drop the PID capture.
