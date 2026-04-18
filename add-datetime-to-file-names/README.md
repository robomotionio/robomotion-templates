# Add Datetime to File Names

Managing locally saved files can be time-consuming for most home and business desktop users. Automate any file-system-related task, such as renaming files, using Robomotion's files and folders nodes.

## What Add Datetime to File Names can do

- Build default folder (`Core.Programming.Function`) → `msg.default_folder = $Home$/templates/.../fixtures`.
- Input Dialog (`Core.Dialog.InputBox`) titled `Add datetime to file names`, default `msg.default_folder` → `msg.selected_folder`.
- Branch on cancel (`Core.Programming.Function`, `outputs: 2`) — empty input short-circuits to `Core.Flow.Stop`.
- List folder (`Core.FileSystem.List`, `optAbsolutePath: true`, `optSize: true`, `optIsDir: true`, `optCreateTime: true`, `optTop: 0`) → `msg.files_to_rename`, then `Core.Flow.GoTo` into `Loop Start`.
- Iterate (`Core.Programming.ForEach`) over `msg.files_to_rename` → `msg.current_file`.
- Skip dirs and stamped (`Core.Programming.Function`, `outputs: 2`) — directories and names already matching `-YYYYMMDD.` are routed to `Loop Back Skip`; otherwise sets `msg.source_path = current_file.Name` and `msg.create_time = current_file.CreateTime`.
- Format stamp (`Robomotion.DateTime.Format`, custom out layout `20060102`) from `msg.create_time` → `msg.stamp`.
- Build new path (`Core.Programming.Function`) — splits on the last `/` or `\\` and last `.` to produce `msg.target_path = <dir>\\<stem>-<stamp><ext>`.
- Check collision (`Core.FileSystem.PathExists`) on `msg.target_path` → `msg.target_exists`; if true, a Function routes to `Loop Back Skip`, otherwise `Core.FileSystem.Move` (`continueOnError: true`) renames source to target and `Core.Flow.GoTo` re-enters the loop.
- When the iterator exits, flow reaches `Core.Flow.Stop`.

## Behind the scenes

- `Core.FileSystem.List` with `optCreateTime: true` provides `CreateTime` per entry, which is what drives the stamp — modification time and wall-clock `Now` are intentionally not used so the name reflects the file's own origin.
- The stamp is placed **before the extension** (`name-YYYYMMDD.ext`), which requires splitting on the last `.`; files with no extension just get `name-YYYYMMDD`.
- Name collisions are handled silently: `Core.FileSystem.PathExists` plus a branch send already-taken targets to the skip label, so the original file is left untouched with no error.
- The `-YYYYMMDD.` regex guard prevents repeat runs from re-stamping already-processed files.
