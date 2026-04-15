# Send Text to Notepad

**Level:** Beginner

## Description
All applications contain interface elements that allow you to provide data and run specific functions on them. Robomotion delivers various UI automation nodes that enable you to interact with these elements and perform tasks like populating text fields.

## Objective
Open Notepad, type a multi-line message into the editor, save the file to a known path, and close Notepad.

## Prerequisites
- Robomotion Desktop package + UI Automation
- Windows with Notepad available

## Steps
1. **Run Application** — launch `notepad.exe` → `vApp`.
2. **Wait For Window** — title matches `*Notepad*` → `vWindow`.
3. **Focus Window** — bring Notepad to the foreground.
4. **Send Keys** — type a multi-line string (e.g. `"Hello from Robomotion!\nLine two.\nLine three."`). Use explicit `{ENTER}` for newlines.
5. **Send Keys** `Ctrl+S` to open Save dialog.
6. **Wait For Window** — "Save As" dialog.
7. **Set Text** on the File name field → `./output/hello.txt`.
8. **Click** the "Save" button.
9. **Close Window** on the main Notepad window.

## Expected Outcome
`./output/hello.txt` exists on disk with the expected multi-line content, and Notepad has closed cleanly.

## Variables
| Name | Scope | Purpose |
|------|-------|---------|
| `vApp` | Message | Notepad process |
| `vWindow` | Message | Main Notepad window |
| `vMessage` | Flow | The text to type (parameterized) |

## Notes
- Demonstrate both **Send Keys** (keystroke-by-keystroke) and **Set Text** (direct UI element write) and explain when each is appropriate.
- Windows 11's new Notepad has tabs and may require a slightly different selector — note this.
