# Print Current Week's Calendar

Desktop users usually have daily routines, such as printing their weekly calendar, that helps them keep themselves productive and organized. Create desktop flows that automate these repetitive tasks and make your workweek easier.

## What Print Current Week's Calendar can do

- Build Paths (`Core.Programming.Function`) — sets `msg.desktop_folder` to `<$Home$>\Desktop` and `msg.image_path` to `<desktop>\calendar.jpg`.
- Launch Outlook (`Core.Process.StartProcess`, `optBackground: true`) — launches `OUTLOOK.EXE` from `C:\Program Files\Microsoft Office\root\Office16` → `msg.outlook_pid`.
- Wait For Outlook (`Robomotion.WindowsAutomation.WaitWindow`) — selector `//Window[contains(@Name,"Outlook")]`, `optCondition: appear`, `optTimeout: 60`.
- Switch To Calendar (`Robomotion.WindowsAutomation.SendKey`) — sends `{Ctrl}+2` to the Outlook window.
- Switch To Work Week View (`Robomotion.WindowsAutomation.SendKey`, `continueOnError: true`) — sends `{Ctrl}+{Alt}+2`.
- Wait For Repaint (`Core.Programming.Sleep`, `optDuration: 2`).
- Capture Window (`Robomotion.WindowsAutomation.Screenshot`, `optFullScreen: false`) — saves the Outlook window to `msg.image_path`.
- Build Print Args (`Core.Programming.Function`) — sets `msg.print_args` to `['-NoProfile', '-Command', 'Start-Process -FilePath "<image>" -Verb Print']`.
- Send To Printer (`Core.Process.StartProcess`, `optBackground: true`, `continueOnError: true`) — `inFilePath: powershell`, `inArguments: msg.print_args`.
- Wait Print Spool (`Core.Programming.Sleep`, `optDuration: 4`), then Delete Screenshot (`Core.FileSystem.Delete`, `continueOnError: true`).
- Build Kill Args + Close Outlook (`Core.Process.StartProcess` → `taskkill /F /IM outlook.exe`, `continueOnError: true`), then `Core.Flow.Stop`.

## Behind the scenes

- The "Switch To Work Week View" step uses `continueOnError: true` so the flow still proceeds on Outlook builds where `Ctrl+Alt+2` is absent or unbound.
- The flow intentionally prints an image of the current Outlook window (via a screenshot sent through the shell `Print` verb), not a vector export of the calendar.
- A 2-second sleep after the view switch gives Outlook time to repaint before `Screenshot` runs; a 4-second sleep after print keeps the image on disk long enough for the spooler to read it before `Delete` removes it.
- Outlook is closed via `taskkill /F`, so unsaved items in other Outlook windows would be lost — the flow assumes Outlook was launched solely for this run.
