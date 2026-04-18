# Send Text to Notepad

All applications contain interface elements that allow you to provide data and run specific functions on them. Robomotion delivers various UI automation nodes that enable you to interact with these elements and perform tasks like populating text fields.

## What Send Text to Notepad can do

- Launch Notepad (`Core.Process.StartProcess`) — `inFilePath: notepad.exe`, `optBackground: true` → `msg.notepad_pid`.
- Wait For Notepad (`Robomotion.WindowsAutomation.WaitWindow`) — selector `//Window[contains(@Name,"Notepad")]`, `optCondition: appear`, `optTimeout: 30`.
- Maximize Notepad (`Robomotion.WindowsAutomation.SendKey`, `continueOnError: true`) — sends `{Win}+{Up}` to the window.
- Seed Text (`Core.Programming.Function`) — sets `msg.notepad_text` to a three-line greeting.
- Populate Editor (`Robomotion.WindowsAutomation.SetText`) — selector `//Window[contains(@Name,"Notepad")]//Edit`, `inText: msg.notepad_text`, `optClearFirst: true`, `optEmulateTyping: false`, `optWaitTimeout: 30`, then `Core.Flow.Stop`.

## Behind the scenes

- The flow does not save the file or close Notepad — the goal is purely to demonstrate UI automation text population.
- `Maximize Notepad` runs with `continueOnError: true` so the flow still proceeds on window managers where `Win+Up` is remapped.
- `SetText` runs with `optEmulateTyping: false` and `optClearFirst: true`, so the existing buffer is replaced via the UIA value pattern rather than simulated keystrokes.
- The selectors use contains-matching on the window name so both classic Notepad and Windows 11 Notepad (`Untitled - Notepad`, `*Untitled - Notepad`) are caught.
