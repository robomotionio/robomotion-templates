# Sort Lines of a Text File

Although manipulating text files is an uncomplicated operation, editing files with numerous entries can require a considerable amount of time. Automating processes such as sorting text entries can disengage desktop users from time-demanding monotonous tasks.

## What Sort Lines of a Text File can do

- Build Default Path (`Core.Programming.Function`) — sets `msg.fixture_path` to `$Home$/templates/text-manipulation/sort-lines-of-text-file/fixtures/unsorted.txt`.
- Intro Dialog (`Core.Dialog.MessageBox`, `info`) titled `Description` explaining the flow.
- Input Dialog titled `Please select a text file to sort...`, default `msg.fixture_path` → `msg.selected_text_file`.
- Branch On Selection (`Core.Programming.Function`, `outputs: 2`) — requires a non-empty path ending in `.txt`, otherwise skips to the completion dialog.
- Read File (`Core.FileSystem.ReadFile`, `optBase64: false`) → `msg.file_contents_raw`.
- Sort Lines (`Core.Programming.Function`) — splits on `\n`, drops a trailing empty line, sorts with `localeCompare`, rejoins with a trailing newline → `msg.sorted_text`.
- Build Sorted Path (`Core.Programming.Function`) — derives `msg.sorted_file_path` as `<dir>\<stem>_Sorted<ext>` next to the input.
- Write Sorted File (`Core.FileSystem.WriteFile`, `optMode: truncate`, `optBase64: false`) at `msg.sorted_file_path`.
- Results Dialog (`Core.Dialog.MessageBox`, `info`, title `Flow completed!`) showing both paths, followed by a final `Example completed!` dialog and `Core.Flow.Stop`.

## Behind the scenes

- Sorting uses `localeCompare` so ordering is locale-aware rather than naive code-point order.
- `Sort Lines` pops a single trailing empty line before sorting and re-adds one `\n` at the end — this preserves the common POSIX convention without injecting a blank line into the sorted output.
- `Build Sorted Path` always joins with a backslash, matching Windows-style output even when the input path uses forward slashes.
- Files are read and written with `optBase64: false`, so the content round-trips as UTF-8 text.
