# Count Lines of a Text File

Apart from reading text from documents, many tasks require users to inspect various characteristics of the retrieved data. Therefore, Robomotion provides properties that describe each variable's content, such as the number of lines a text file has.

## What Count Lines of a Text File can do

- Build default path (`Core.Programming.Function`) — sets `msg.fixture_path` to the bundled `sample.txt` under `$Home$/templates/.../fixtures`.
- Intro Dialog (`Core.Dialog.MessageBox`, `info`) titled `Description` explaining that the flow prompts for a text file and reports its line count.
- Input Dialog (`Core.Dialog.InputBox`) titled `Please select a text file...`, default `msg.fixture_path` → `msg.selected_text_file`.
- Branch (`Core.Programming.Function`, `outputs: 2`) — continue when the path is non-empty and ends in `.txt`; otherwise skip straight to the completion dialog.
- Read file (`Core.FileSystem.ReadFile`, `optBase64: false`) from `msg.selected_text_file` → `msg.file_contents`.
- Count lines (`Core.Programming.Function`) — splits `msg.file_contents` on `\n`, drops a trailing empty element, stores `msg.line_count` and builds `msg.dialog_text` = `The file has N lines!`.
- Results Dialog (`Core.Dialog.MessageBox`, `info`) titled `Results...` showing `msg.dialog_text`, then a final `Example completed!` dialog before `Core.Flow.Stop`.

## Behind the scenes

- `Core.FileSystem.ReadFile` returns the whole file as a string, so the Function node does the line splitting itself and trims a trailing blank line so files that end with a newline don't over-count.
- The completion dialog runs on both branches (valid read and skipped selection) so the user always gets a clear end-of-flow acknowledgement.
