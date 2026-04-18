# Send Text to Notepad

All applications contain interface elements that allow you to provide data and run specific functions on them. Robomotion delivers various UI automation nodes that enable you to interact with these elements and perform tasks like populating text fields.

## What Send Text to Notepad can do

- Run Application and Wait to Load — launch `notepad.exe` with window style `Maximized` and timeout `0` (wait indefinitely). Capture `vAppP…
- Populate Text Field — target the edit control `Window 'Untitled - Notepad' → Document 'RichEdit Control'`, mode `Replace`, click type `Si…

## Behind the scenes

- The PA flow does **not** save the file, close Notepad, or capture any output — the goal is purely to demonstrate UIAutomation text population. Don't invent extra steps.
- The selector `appmask['Window 'Untitled - Notepad'']['Document 'RichEdit Control'']` is a UIA-3 path. On Windows 11's new Notepad the window title becomes `Untitled - Notepad` only after save; the edit control class also changes. If porting, re-record the selector in the Robomotion designer against the installed Notepad version.
