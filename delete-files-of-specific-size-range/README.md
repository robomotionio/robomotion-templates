# Delete Files of Specific Size Range

Managing considerable amounts of files can be inefficient when performed by manual labor. Robomotion enables you to filter and handle files and manage your machine's storage automatically.

## What Delete Files of Specific Size Range can do

- Seed fixtures (`Core.Programming.Function` + three `Core.FileSystem.WriteFile`) — drops `small.txt` (200 B), `medium.txt` (3 KB) and `large.txt` (20 KB) under `msg.fixtures_dir` so the template is runnable out of the box.
- Input Dialog (`Core.Dialog.InputBox`) titled `Delete files by size range`, prompt `What is the minimum size of the files you want to delete? (in KB)`, default `1` → `msg.min_size_text`.
- Input Dialog (`Core.Dialog.InputBox`) with prompt `What is the maximum size of the files you want to delete? (in KB)`, default `10` → `msg.max_size_text`.
- Input Dialog (`Core.Dialog.InputBox`) with prompt `Please select the folder to delete files from....`, default `msg.fixtures_dir` → `msg.selected_folder`.
- Parse inputs (`Core.Programming.Function`, `outputs: 2`) — coerces to `msg.minimum_size` / `msg.maximum_size`; missing folder or NaN short-circuits to `Core.Flow.Stop`.
- List directory (`Core.FileSystem.List`, `optAbsolutePath: true`, `optSize: true`, `optIsDir: true`) on `msg.selected_folder` → `msg.all_files_in_folder`.
- Loop (`Core.Flow.Label` + `Core.Programming.ForEach` over `msg.all_files_in_folder` → `msg.current_file`):
  - Size range check (`Core.Programming.Function`, `outputs: 2`) — skips directories; keeps entries where `Size / 1024` is within `[minimum_size, maximum_size]`.
  - In-range files: set `msg.file_to_delete = msg.current_file.Name`, then `Core.FileSystem.Delete` (`continueOnError: true`), then `Core.Flow.GoTo` the loop label.
  - Out-of-range files: `Core.Flow.GoTo` the loop label directly.
- When the ForEach exhausts the list it falls through to `Core.Flow.Stop`.

## Behind the scenes

- Size comparisons convert bytes to KB (`Size / 1024`) and are inclusive on both bounds — a 1024 B file with `minimum_size = 1` passes.
- Directory entries are filtered out before the size check so nested folders aren't considered for deletion.
- Deletion is unconditional (no recycle bin, no confirmation) and uses `continueOnError` so one locked file doesn't abort the loop.
