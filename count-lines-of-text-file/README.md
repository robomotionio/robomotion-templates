# Count Lines of a Text File

Apart from reading text from documents, many tasks require users to inspect various characteristics of the retrieved data. Therefore, Robomotion provides properties that describe each variable's content, such as the number of lines a text file has.

## What Count Lines of a Text File can do

- Intro Dialog (`Core.Dialog.MessageBox`, icon `Information`) titled `Description` with body *"This flow prompts you to select a text file …
- Select File Dialog (single, must-exist, filter `*.txt`) titled `Please select a text file...` → `vSelectedTextFile`, `vButtonPressed`.
- Conditional (`Core.Programming.Function`, `outputs: 2`) — branch when `vButtonPressed == "Open"`; else fall through to the final dialog.
- Read File as List — read `vSelectedTextFile` with default encoding, splitting on newlines → `vFileContents` (array).
- Results Dialog (`Core.Dialog.MessageBox`, icon `Information`) titled `Results...` with body `The file has %vFileContents.Count% lines!`.

## Behind the scenes

- `ReadTextAsList` returns one array element per line. `FileContents.Count` is the array length. When porting to `Core.FileSystem.ReadFile`, split on newline in a Function node (`msg.vLineCount = msg.vContent.split(/\r?\n/).length`).
- The completion dialog runs whether or not the user cancelled — preserve the layout.
