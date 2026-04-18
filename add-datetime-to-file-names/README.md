# Add Datetime to File Names

Managing locally saved files can be time-consuming for most home and business desktop users. Automate any file-system-related task, such as renaming files, using Robomotion's files and folders nodes.

## What Add Datetime to File Names can do

- Select Folder Dialog — prompt the user with message *"Please, select the parent folder of the files you want to rename. Press Cancel to e…
- Conditional (`Core.Programming.Function`, `outputs: 2`): branch when `vButtonPressed == "OK"`; skip (route to `Core.Flow.Stop`) otherwise.
- List Directory (`Core.FileSystem.List`) on `vSelectedFolder`, filter `*`, non-recursive → `vFilesToRename`.
- Loop over `vFilesToRename` (`Core.Flow.Label` → `Core.Programming.ForEach` → body → `Core.Flow.GoTo`):
- File Stat (`Core.FileSystem.Stat`) → read each file's `CreationTime`.

## Behind the scenes

- The PA action `RenameAddDateOrTime` uses `CreationTime` (not `ModifiedTime` or `Now`) as the timestamp source — preserve this choice when implementing.
- `DateTimePosition: AfterName` places the stamp *before* the extension, not at the end of the filename. The string build in step 4.3 must split on the last `.` to get this right.
- `IfFileExists: DoNothing` means collisions silently skip — no error, no overwrite.
