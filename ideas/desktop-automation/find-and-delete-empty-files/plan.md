# Find and Delete Empty Files

**Level:** Beginner

## Description
Managing large amounts of files is a time-consuming task, and it can be considered one of the best candidates for automation. Robomotion allows you to fully automate file-related tasks, such as deleting empty files from your desktop.

## Objective
Recursively scan a folder, identify zero-byte files, log them, and delete them.

## Prerequisites
- Target folder (`./workspace/`) containing a mix of empty and non-empty files — seed some `.txt` files with `size 0` for the demo
- Robomotion Files package

## Steps
1. **List Files in Folder** — recursive = `true`, store in `vFiles`.
2. Initialize `vEmpty = []` (Flow scope).
3. **For Each** file in `vFiles`:
   1. **Get File Info** → `vInfo`.
   2. **If** `vInfo.size == 0`:
      - Append `vInfo.path` to `vEmpty`.
4. **Log Message** — print `vEmpty.length` and the list.
5. **For Each** path in `vEmpty`:
   - **Delete File**.
6. **Log Message** — "Deleted N empty files."

## Expected Outcome
All zero-byte files under `./workspace/` (including nested subfolders) are removed. Non-empty files are untouched.

## Variables
| Name | Scope | Purpose |
|------|-------|---------|
| `vFiles` | Message | Recursive file list |
| `vEmpty` | Flow | Paths queued for deletion |
| `vInfo` | Message | Metadata for the current file |

## Notes
Two-pass design (collect, then delete) is deliberate — makes the flow safer to dry-run by commenting out the delete step during development.
