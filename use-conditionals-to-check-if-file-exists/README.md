# Use Conditionals to Check if File Exists

Implementing different logic paths based on specific conditions is essential to most automation scenarios. Conditionals enable users to check values and run different blocks of code depending on the result.

## What Use Conditionals to Check if File Exists can do

- Input Dialog titled `Check if file exists`, message `Please populate a file name to check if it exists in your desktop folder.`, default `FileName` -> `msg.user_input`.
- Branch on cancel (`Core.Programming.Function`, `outputs: 2`) — empty input short-circuits to `Core.Flow.Stop`.
- Build path (`Core.Programming.Function`) — `msg.candidate_path = global.get('$Home$') + '\Desktop\' + msg.user_input`.
- `Core.FileSystem.PathExists` on `msg.candidate_path` -> `msg.exists` (boolean).
- Branch on existence (`Core.Programming.Function`, `outputs: 2`) — port 0 builds `msg.dialog_text = "Filename: '<name>' exists in your desktop folder."` and shows `Core.Dialog.MessageBox` titled `File found!`; port 1 builds the "doesn't exist" message and shows `File not found!`.

## Behind the scenes

- `msg.user_input` is **just a filename**, not a full path — the flow prepends the Desktop directory (`global.get('$Home$') + '\Desktop'`) before the existence check. Preserve the path join exactly.
- Cancelling the input dialog short-circuits everything; no "cancelled" dialog is shown.
