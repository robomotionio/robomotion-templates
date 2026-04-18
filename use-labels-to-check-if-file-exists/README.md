# Use Labels to Check if File Exists

Although flows run sequentially by default, transferring the running point is essential for many automation scenarios. Labels act like anchors and allow users to jump to them from anywhere in the flow.

## What Use Labels to Check if File Exists can do

- Input Dialog titled `Check if file exists`, message `Please populate a file name to check if it exists in your desktop folder.`, default `FileName` -> `msg.user_input`.
- Branch on cancel (`Core.Programming.Function`, `outputs: 2`) — empty input short-circuits to `Core.Flow.Stop`.
- Build path (`Core.Programming.Function`) — `msg.candidate_path = global.get('$Home$') + '\Desktop\' + msg.user_input`.
- `Core.FileSystem.PathExists` on `msg.candidate_path` -> `msg.exists`.
- Branch on existence (`Core.Programming.Function`, `outputs: 2`) — true goes to `Core.Flow.GoTo` `File_Exists`, false to `Core.Flow.GoTo` `File_Does_Not_Exist`.
- `File_Exists` label -> build `msg.dialog_text = "Filename: '<name>' exists in your desktop folder."` -> `Core.Dialog.MessageBox` titled `File found!` -> `Core.Flow.Stop`.
- `File_Does_Not_Exist` label -> build `msg.dialog_text = "Filename: '<name>' doesn't exist in your desktop folder."` -> `Core.Dialog.MessageBox` titled `File not found!` -> `Core.Flow.Stop`.

## Behind the scenes

- This is functionally identical to `use-conditionals-to-check-if-file-exists`; the flow teaches **Label + GoTo** as an alternative to inline `IF/ELSE`. Keep the label nodes prominent — they are the teaching point, not incidental.
- Because `Core.Flow.GoTo` is terminal, the Designer layout is two parallel label-rooted chains; the main chain up to the GoTo is one sub-graph, and each label + MessageBox + Stop is its own disconnected chain that the GoTo jumps into.
