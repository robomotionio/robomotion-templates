# Find and Delete Empty Files

Managing large amounts of files is a time-consuming task, and it can be considered one of the best candidates for automation. Robomotion allows you to fully automate file-related tasks, such as deleting empty files from your desktop.

## What Find and Delete Empty Files can do

- `Core.Flow.SubFlow` downloads fixtures; a Function builds `msg.fixtures_dir`, `msg.empty_one_path` and `msg.empty_two_path`.
- Two `Core.FileSystem.Create` nodes (`optType: 'file'`, `continueOnError: true`) seed `empty_one.txt` and `empty_two.txt` so the demo has something to find.
- Input Dialog titled `Delete empty files`, message `Please select the folder to delete files from....`, default `msg.fixtures_dir` → `msg.selected_folder`.
- Branch (`Core.Programming.Function`, `outputs: 2`) — proceed when `msg.selected_folder` is non-empty; otherwise `Core.Flow.Stop`.
- `Core.FileSystem.List` with `optAbsolutePath: true`, `optSize: true`, `optIsDir: true`, `optTop: 0` → `msg.all_files_in_folder`.
- `Core.Flow.Label` + `Core.Programming.ForEach` over `msg.all_files_in_folder` → `msg.current_file`; a zero-size check (`outputs: 2`) routes `IsDir: false && Size === 0` to the delete branch and everything else to a skip branch.
- Delete branch: Function assigns `msg.file_to_delete = msg.current_file.Name`, `Core.FileSystem.Delete` (`continueOnError: true`), then `Core.Flow.GoTo` back to the loop label; the ForEach exit edge goes to `Core.Flow.Stop`.

## Behind the scenes

- The listing is non-recursive — only the selected folder itself is inspected, so nested folders are left untouched.
- `optAbsolutePath: true` combined with the Function copying `current_file.Name` gives the delete node a fully qualified path; relative paths would resolve against the robot's working directory and delete the wrong files.
- `optSize: true` on the List node pre-populates the size field so the loop does not need a per-file `Stat` round-trip.
- Deletion is immediate — there is no confirmation dialog or audit log; wire a logger or a dry-run guard if the flow is used against real user data.
- `continueOnError: true` on both the seed creates and the delete makes the flow tolerant of pre-existing or locked files, so a single stubborn entry does not abort the whole cleanup.
