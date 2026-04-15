# Open a Folder

**Level:** Beginner

## Description
Interacting with the file system is essential in most home and business automation scenarios. Using Robomotion, you can automatically open specific folders in File Explorer and directly interact with their content.

## Objective
Open a specific folder in Windows File Explorer so the user can visually confirm its contents.

## Prerequisites
- Robomotion Desktop / System package
- A target folder on disk (`C:\Users\Public\Documents` or `~/Documents`)

## Steps
1. **Folder Exists** — guard: verify the target folder exists; if not, **Create Folder**.
2. **Run Application** — launch `explorer.exe` with the folder path as the argument (on Windows). On other OSes call `xdg-open` / `open`.
3. **Delay** — a few seconds so learners see Explorer render the folder.
4. (Optional) **Get Active Window** and **Log Message** with the window title, proving Explorer is focused on the right folder.

## Expected Outcome
File Explorer opens focused on the target folder.

## Variables
| Name | Scope | Purpose |
|------|-------|---------|
| `vFolder` | Flow | Target folder path (parameterize for reuse) |

## Notes
Call out that `explorer.exe path` is the reliable way — `Run Application` with a folder path alone sometimes opens a new default window instead of navigating.
