# Sort Lines of a Text File

Although manipulating text files is an uncomplicated operation, editing files with numerous entries can require a considerable amount of time. Automating processes such as sorting text entries can disengage desktop users from time-demanding monotonous tasks.

## What Sort Lines of a Text File can do

- Intro Dialog (`Core.Dialog.MessageBox`, icon `Information`) titled `Description` with body *"This flow prompts you to select a text file.…
- Select File Dialog (single, must-exist, filter `*.txt`) titled `Please select a text file to sort...` → `vSelectedTextFile`, `vButtonPres…
- Conditional (`Core.Programming.Function`, `outputs: 2`) — branch when `vButtonPressed == "Open"`; otherwise fall through to the final dia…
- Read File as List — `vSelectedTextFile`, default encoding → `vFileContents` (array of lines).
- Sort List — ascending, default comparator → `vFileContents` (in place).

## Behind the scenes

- `Variables.SortList` in PA uses a default string comparator (case-insensitive on most locales). Match by sorting via `Array.prototype.sort()` in a Function node — note that JS `sort()` defaults to *case-sensitive* string comparison; add a `localeCompare`-based comparator to match PA behaviour.
- The double backslash (`\\`) in the PA template is just PA's string escape; the actual output path has a single backslash. Keep this in mind when writing the Function node.
- `Unicode` encoding on write means UTF-16 LE (with BOM) — downstream tools expecting UTF-8 will choke. Flag it.
