# Delete Files of Specific Size Range

Managing considerable amounts of files can be inefficient when performed by manual labor. Robomotion enables you to filter and handle files and manage your machine's storage automatically.

## What Delete Files of Specific Size Range can do

- Custom Form Dialog — show a two-input form asking *"What is the minimum size of the files you want to delete? (in KB)"* and *"What is the…
- Select Folder Dialog with description `Please select the folder to delete files from....` → `vSelectedFolder`, `vButtonPressed2`.
- Conditional (`Core.Programming.Function`, `outputs: 2`) — branch when `vButtonPressed2 == "OK"`; otherwise go to `Core.Flow.Stop`.
- List Directory (`Core.FileSystem.List`) on `vSelectedFolder`, filter `*`, non-recursive, fail-on-access-denied → `vAllFilesInFolder`.
- Loop (`Core.Flow.Label` → `Core.Programming.ForEach(vAllFilesInFolder) → vCurrentFile` → body → `Core.Flow.GoTo`):

## Behind the scenes

- PA's arithmetic `CurrentFile.Size / 1024` uses bytes → KB; the boundary comparisons are inclusive on both sides. Match that exactly.
- The flow does **not** re-check `vButtonPressed` (from the custom form) because the `Cancel` button on an AdaptiveCard short-circuits by design; only the folder dialog's button is re-checked. Preserve that flow shape.
- Deletion is unconditional (no recycle bin, no confirmation) — add a dry-run wrapper only if the user asks.
