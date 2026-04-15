# Copy File(s)

**Level:** Beginner

## Description
Creating copies of files and folders is a fundamental ability of the Windows file system. Using the available file and folder nodes, you can automatically copy files and folders and effortlessly perform tasks such as taking backups.

## Objective
Copy a single file to a backup folder, then copy every `.xlsx` file from a source folder to the same backup folder.

## Prerequisites
- Source folder with mixed file types (`./documents/`)
- Backup folder (`./backup/` — create it if missing)
- Robomotion Files package

## Steps
1. **Folder Exists** / **Create Folder** — ensure `./backup/` exists.
2. **Copy File** — copy `./documents/important.pdf` → `./backup/important.pdf`. Set `Overwrite` = `true`.
3. **List Files in Folder** — read `./documents/*.xlsx` into `vSpreadsheets`.
4. **For Each** file in `vSpreadsheets`:
   1. Derive destination path using the filename only (strip the source directory).
   2. **Copy File** — source → `./backup/{filename}`.
5. **Log Message** — "Copied N spreadsheets."

## Expected Outcome
`./backup/` contains `important.pdf` plus every `.xlsx` from `./documents/`. Running the flow twice is safe (overwrites in place).

## Variables
| Name | Scope | Purpose |
|------|-------|---------|
| `vSpreadsheets` | Message | Filtered file list |
| `vFile` | Message | Current file in loop |

## Notes
Show both the single-file and bulk (looped) patterns — real users hit both shapes regularly.
