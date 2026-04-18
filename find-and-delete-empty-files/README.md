# Find and Delete Empty Files

Managing large amounts of files is a time-consuming task, and it can be considered one of the best candidates for automation. Robomotion allows you to fully automate file-related tasks, such as deleting empty files from your desktop.

## What Find and Delete Empty Files can do

- Select Folder Dialog with description `Please select the folder to delete files from....` → `vSelectedFolder`, `vButtonPressed2`.
- Conditional (`Core.Programming.Function`, `outputs: 2`) — branch when `vButtonPressed2 == "OK"`; otherwise `Core.Flow.Stop`.
- List Directory (`Core.FileSystem.List`) on `vSelectedFolder`, filter `*`, non-recursive, fail-on-access-denied → `vAllFilesInFolder`.
- Loop (`Core.Flow.Label` → `Core.Programming.ForEach(vAllFilesInFolder) → vCurrentFile` → body → `Core.Flow.GoTo`):
- File Stat (`Core.FileSystem.Stat`) on `vCurrentFile` → `vStat`.

## Behind the scenes

- The PA flow only inspects the selected folder itself (not subfolders) — pass `recursive = false` to `Core.FileSystem.List`.
- Delete is immediate; there is no confirmation dialog or audit log in the PA flow.
