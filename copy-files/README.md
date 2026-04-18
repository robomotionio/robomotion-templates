# Copy Files

Creating copies of files and folders is a fundamental ability of the Windows file system. Using the available file and folder nodes, you can automatically copy files and folders and effortlessly perform tasks such as taking backups.

## What Copy Files can do

- Resolve Desktop path — in a `Core.Programming.Function` node, compute the Desktop folder path (`global.get('$Home$') + '/Desktop'` on Lin…
- Select File Dialog (multi-select, must-exist) titled `Please select the file(s) to copy` → `vFilesToCopy`, `vButtonPressedInFileDialog`.
- Conditional (`Core.Programming.Function`, `outputs: 2`) — branch when `vButtonPressedInFileDialog == "Open"`; otherwise route to `Core.Fl…
- Select Folder Dialog with description `Select the folder to copy the file to..`, `initialDirectory = vDesktopFolderPath` → `vDestinationF…
- Conditional — branch when `vButtonPressedInFolderDialog == "OK"`; otherwise route to `Core.Flow.Stop`.

## Behind the scenes

- `IfFileExists: DoNothing` in the PA flow means existing destination files are left alone silently. Use `Core.FileSystem.Copy` in skip-on-exists mode (or pre-check with `PathExists`) to match.
- Both dialogs must succeed; either cancellation short-circuits the flow without error.
