# Add Datetime to File Names

**Level:** Beginner

## Description
Managing locally saved files can be time-consuming for most home and business desktop users. Automate any file-system-related task, such as renaming files, using Robomotion's files and folders nodes.

## Objective
Rename every file in a folder by prefixing (or suffixing) the current date/time, e.g. `report.pdf` → `2026-04-15_report.pdf`.

## Prerequisites
- Source folder with a handful of files to rename (`./inbox/`)
- Robomotion Files package

## Steps
1. **List Files in Folder** — read `./inbox/` into `vFiles`.
2. **Get Current Date** — store `vNow`.
3. **Format Date** — produce `vStamp` as `YYYY-MM-DD_HHmmss`.
4. **For Each** file in `vFiles`:
   1. **Get File Info** — split into `name`, `extension`, `directory`.
   2. Build new path: `{directory}/{vStamp}_{name}.{extension}`.
   3. **Rename File** from old path to new path.
5. **Log Message** — report how many files were renamed.

## Expected Outcome
Every file in `./inbox/` now has a datetime prefix and the folder listing sorts chronologically by default.

## Variables
| Name | Scope | Purpose |
|------|-------|---------|
| `vFiles` | Message | File list |
| `vNow` | Message | Current timestamp |
| `vStamp` | Message | Formatted date prefix |

## Notes
Mention idempotency: running the flow twice should not add the prefix twice — either detect existing prefixes or move processed files to a separate folder.
