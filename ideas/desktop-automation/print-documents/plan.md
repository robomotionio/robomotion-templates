# Print Document(s)

**Level:** Beginner

## Description
Printing is an integral part of most workplaces, as hard copies of documents, receipts, and reports are often required. Robomotion enables you to disengage yourself from repetitive printing and focus on more creative and productive tasks.

## Objective
Iterate over a folder of `.pdf` / `.docx` files and send each to the default printer without user interaction.

## Prerequisites
- Windows machine with a configured default printer (can be a "Microsoft Print to PDF" virtual printer for safe tutorial runs)
- Robomotion Files package and System/Shell package
- Source folder `./to-print/` with sample documents

## Steps
1. **List Files in Folder** — `./to-print/` filtered to `*.pdf;*.docx` → `vDocs`.
2. **For Each** doc in `vDocs`:
   1. **Print Document** node (or **Run Command** with `rundll32 shell32.dll,ShellExec_RunDLL /print /f "{path}"` as a fallback).
   2. **Delay** a couple of seconds to let the spool accept the job before the next one.
3. **Log Message** — "Sent N documents to printer."

### Demo-safe variant
Set the default printer to `Microsoft Print to PDF` and configure an output folder so the tutorial produces files instead of paper.

## Expected Outcome
Every document in `./to-print/` is sent to the default printer. When using "Print to PDF" the output folder fills with one PDF per source file.

## Variables
| Name | Scope | Purpose |
|------|-------|---------|
| `vDocs` | Message | Files queued for printing |

## Notes
- Warn learners not to run the flow against a physical printer with `./to-print/` full of real documents by accident.
- Note printer queue timing: spraying jobs too fast can cause the spooler to drop them on some drivers.
