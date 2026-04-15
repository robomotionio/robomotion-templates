# Concatenate Text Files

**Level:** Intermediate

## Description
Reading data from multiple sources and consolidating it in a single file is standard in most document-related operations. Robomotion lets you automate these tasks and effortlessly transfer information across numerous documents.

## Objective
Read every `.txt` file from a folder, concatenate their contents (in a controlled order) into one output file, separated by a configurable delimiter.

## Prerequisites
- Robomotion Files + Text packages
- Input folder `./logs/daily/` with multiple `.txt` files
- Output path `./logs/combined.txt`

## Steps
1. **List Files in Folder** `*.txt` → `vFiles`.
2. Sort `vFiles` by name (or modified time) so order is deterministic.
3. Initialize `vCombined = ""` (Flow).
4. **For Each** file in `vFiles`:
   1. **Read File** → `vContent`.
   2. Append a banner header: `vCombined += "\n\n===== {file.name} =====\n\n" + vContent`.
5. **Write File** — `./logs/combined.txt` with `vCombined`.
6. **Log Message** — `Combined {vFiles.length} files into combined.txt ({size} bytes)`.

### Variants
- Skip the banner for a clean concatenation.
- Use UTF-8 explicitly to avoid BOM duplication issues when input files have different encodings.

## Expected Outcome
A single UTF-8 text file containing every input file's content in the expected order, with clear separators between sections.

## Variables
| Name | Scope | Purpose |
|------|-------|---------|
| `vFiles` | Message | Input files |
| `vCombined` | Flow | Accumulator |
| `vContent` | Message | Per-file body |

## Notes
- Beware of very large files: building `vCombined` in memory can blow RAM for multi-GB inputs; show streaming append as an alternative.
- Encoding mismatches (CP1252 vs UTF-8) are the classic trap — normalize on read.
