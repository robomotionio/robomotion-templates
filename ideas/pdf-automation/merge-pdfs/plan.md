# Merge PDFs

**Level:** Intermediate

## Description
Robomotion enables users to implement advanced logic in PDF-handling flows to facilitate complex scenarios. For example, PDF nodes, loops, and conditionals can be deployed to create a flow that merges as many PDF files as the user desires.

## Objective
Merge an arbitrary number of PDFs from a folder into a single output PDF, preserving a user-controlled order (alphabetical, by modified time, or by an explicit sort file).

## Prerequisites
- Robomotion PDF + Files packages
- Folder of PDFs (`./chapters/`) with predictable naming (`01-intro.pdf`, `02-background.pdf`, …)

## Steps
1. Declare `vSortMode` (Flow) — one of `"name"`, `"mtime"`, `"manifest"`.
2. **List Files in Folder** → `vFiles`.
3. **If** `vSortMode == "name"` → sort `vFiles` alphabetically.
4. **If** `vSortMode == "mtime"` → for each file, **Get File Info**, sort by `modifiedAt`.
5. **If** `vSortMode == "manifest"` → **Read File** `./chapters/order.txt`, build `vFiles` in the listed order.
6. **For Each** file → append `file.path` to `vPathList`.
7. **Merge PDF Files** — input list `vPathList`, output `./chapters/combined.pdf`.
8. **Get Number of Pages in PDF** — sanity-check total.
9. **Log Message** — `Combined {vFiles.length} files into combined.pdf ({pages} pages)`.

## Expected Outcome
`combined.pdf` contains every PDF from `./chapters/` in the requested order, with the expected total page count.

## Variables
| Name | Scope | Purpose |
|------|-------|---------|
| `vSortMode` | Flow | Ordering strategy |
| `vFiles` | Message | Input file list |
| `vPathList` | Flow | Ordered paths passed to merge |

## Notes
- Ordering bugs are the #1 support issue for merge flows — the three-mode design makes the chosen order explicit instead of implicit.
- Consider adding a dry-run log that prints the final order before invoking the merge.
