# Open a Folder

Interacting with the file system is essential in most home and business automation scenarios. Using Robomotion, you can automatically open specific folders in File Explorer and directly interact with their content.

## What Open a Folder can do

- Build Documents Path (`Core.Programming.Function`) — sets `msg.documents_folder_path` to `<$Home$>\Documents`.
- Input Dialog titled `Open a folder`, message `Select the folder to open...`, default `msg.documents_folder_path` → `msg.selected_folder`.
- Branch On Cancel (`Core.Programming.Function`, `outputs: 2`) — routes to `Core.Flow.Stop` when `msg.selected_folder` is empty/whitespace.
- Build Args (`Core.Programming.Function`) — sets `msg.explorer_args = [msg.selected_folder]`.
- Launch Explorer (`Core.Process.StartProcess`, `optBackground: true`, `continueOnError: true`) — `inFilePath: explorer.exe`, `inArguments: msg.explorer_args` → `msg.app_process_id`, then `Core.Flow.Stop`.

## Behind the scenes

- `explorer.exe` is launched with the folder path as its sole argument, so Windows opens a new File Explorer window rooted at that folder.
- `continueOnError: true` keeps the flow from aborting if the path is invalid or explorer is unavailable; the flow simply falls through to `Core.Flow.Stop`.
- To port to Linux/macOS, swap `explorer.exe` for `xdg-open` / `open` and drop `msg.app_process_id` — those shells typically exit immediately after dispatching to the desktop environment.
