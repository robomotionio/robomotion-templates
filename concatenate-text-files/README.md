# Concatenate Text Files

Reading data from multiple sources and consolidating it in a single file is standard in most document-related operations. Robomotion lets you automate these tasks and effortlessly transfer information across numerous documents.

## What Concatenate Text Files can do

- Build paths (`Core.Programming.Function`) — sets `msg.fixtures_dir` under `$Home$/templates/.../fixtures` and `msg.output_file_path` to `fixtures/ConcatenatedFiles.txt`.
- Intro dialog (`Core.Dialog.MessageBox`, `info`) titled `Description` explaining that the flow stitches multiple text files into one.
- Seed list (`Core.Programming.Function`) → `msg.files_to_concatenate = [fixtures/part1.txt, fixtures/part2.txt]`.
- Clean previous output (`Core.FileSystem.Delete`, `continueOnError: true`) against `msg.output_file_path`, then `Core.Flow.GoTo` into `Loop Start`.
- Iterate (`Core.Programming.ForEach`) over `msg.files_to_concatenate` → `msg.current_file`, `msg.current_index`.
- Read (`Core.FileSystem.ReadFile`, `optBase64: false`) from `msg.current_file` → `msg.current_file_contents`.
- Build output (`Core.Programming.Function`) — derives `msg.output_path` as `<dirname of current_file>\\ConcatenatedFiles.txt` and sets `msg.line_to_write = msg.current_file_contents + '\n'`.
- Append (`Core.FileSystem.WriteFile`, `optMode: append`, `optBase64: false`) to `msg.output_path`, then `Core.Flow.GoTo` back to `Loop Start`.
- Completion dialog (`Core.Dialog.MessageBox`, `info`) titled `Example completed!` once the iterator exits, then `Core.Flow.Stop`.

## Behind the scenes

- The output file lives in the **directory of each source file** — if the selected files come from multiple directories, each directory gets its own `ConcatenatedFiles.txt`. This is intentional to match the ported behaviour.
- `Core.FileSystem.WriteFile` in `append` mode is called once per source file, so a pre-existing `ConcatenatedFiles.txt` is deleted up front to guarantee a clean start.
- Each file's contents are suffixed with `\n` before being appended so boundaries remain visible even when source files don't end with a newline.
- The completion dialog sits on the iterator's exit edge, so it runs once after every file has been processed.
