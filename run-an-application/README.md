# Run an Application

Before automating any tasks on your desktop, you have to launch the appropriate application that will perform them. Robomotion allows you to launch virtually any application or file using the "Run Application" action.

## What Run an Application can do

- Build Desktop Path (`Core.Programming.Function`) — sets `msg.desktop_folder_path` to `<$Home$>\Desktop`.
- Input Dialog titled `Run an application`, message `Select the app you would like to run..`, default `notepad.exe` → `msg.selected_file`.
- Run App (`Core.Process.StartProcess`, `optBackground: true`, `continueOnError: true`) — `inFilePath: msg.selected_file` → `msg.app_process_id`, then `Core.Flow.Stop`.

## Behind the scenes

- There's no cancel guard — if the dialog returns an empty path, `Core.Process.StartProcess` will fail, but `continueOnError: true` lets the flow still reach `Core.Flow.Stop` cleanly.
- `optBackground: true` detaches the launched process, so closing Robomotion doesn't kill the application; `msg.app_process_id` is captured for any downstream automation that wants to attach to it.
- `msg.desktop_folder_path` is computed but unused by the launch itself — it's a convenience value that can be surfaced in future variants (e.g. as the dialog's starting folder).
