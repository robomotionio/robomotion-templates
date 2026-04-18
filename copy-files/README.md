# Copy Files

Creating copies of files and folders is a fundamental ability of the Windows file system. Using the available file and folder nodes, you can automatically copy files and folders and effortlessly perform tasks such as taking backups.

## What Copy Files can do

- Seed sources (`Core.Programming.Function`) — resolves `msg.fixtures_dir` under `$Home$/templates/.../fixtures`, sets `msg.files_to_copy` to `[source_a.txt, source_b.txt]` and `msg.default_dest` to `fixtures/dest`.
- Input Dialog (`Core.Dialog.InputBox`) titled `Copy files`, message `Select the folder to copy the file to..`, default `msg.default_dest` → `msg.destination_folder`.
- Branch on cancel (`Core.Programming.Function`, `outputs: 2`) — if `msg.destination_folder` is empty, short-circuit to `Core.Flow.Stop`; otherwise proceed.
- Create destination (`Core.FileSystem.Create`, `optType: directory`, `continueOnError: true`) against `msg.destination_folder`, then `Core.Flow.GoTo` into `Loop Start`.
- Iterate (`Core.Programming.ForEach`) over `msg.files_to_copy` → `msg.current_file`, `msg.current_index`.
- Build destination (`Core.Programming.Function`) — extracts the basename of `msg.current_file` and sets `msg.dest_path = msg.destination_folder + '\\' + basename`.
- Copy (`Core.FileSystem.Copy`, `continueOnError: true`) from `msg.current_file` to `msg.dest_path`, then `Core.Flow.GoTo` back to `Loop Start` until the iterator exits and hits `Core.Flow.Stop`.

## Behind the scenes

- `continueOnError: true` on `Core.FileSystem.Create` lets the flow proceed when the destination directory already exists, and on `Core.FileSystem.Copy` it keeps the loop running if a single file fails to copy.
- The loop is driven by a `Core.Flow.Label` + `Core.Flow.GoTo` pair wrapped around `Core.Programming.ForEach` so the per-file copy steps live on a separate wire and re-enter the iterator cleanly.
- Destination path is built by scanning for the last `/` or `\\` so the flow works with fixtures written using either separator.
