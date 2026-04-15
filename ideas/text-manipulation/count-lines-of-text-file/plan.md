# Count Lines of a Text File

**Level:** Intermediate

## Description
Apart from reading text from documents, many tasks require users to inspect various characteristics of the retrieved data. Therefore, Robomotion provides properties that describe each variable's content, such as the number of lines a text file has.

## Objective
Report accurate line counts for every text file in a folder: total lines, non-empty lines, and lines-matching-a-pattern. Compare counts to standard tools (`wc -l`) so learners understand the edge cases.

## Prerequisites
- Robomotion Files + Text packages
- Folder with text files (`./logs/`)

## Steps
1. **List Files in Folder** `*.txt;*.log` → `vFiles`.
2. Initialize `vReport = []` (Flow).
3. **For Each** file in `vFiles`:
   1. **Read File** → `vContent`.
   2. **Split Text** on newline → `vLines` (array).
   3. `vTotal = vLines.length`.
   4. `vNonEmpty = count where trim(line) != ""`.
   5. `vErrors = count where line contains "ERROR"` (demo pattern).
   6. Append `{name, total: vTotal, nonEmpty: vNonEmpty, errors: vErrors}` to `vReport`.
4. **Write CSV** — `./logs/line-counts.csv`.
5. **Log Message** — top-N summary.

### Edge cases
- File ending without trailing newline: the last "line" still counts.
- CRLF vs LF: split on both `\r\n` and `\n` to get consistent counts cross-platform.
- Huge file: read streaming line-by-line instead of loading into memory.

## Expected Outcome
A CSV report listing every file with accurate total / non-empty / error-line counts, matching a hand-verified reference.

## Variables
| Name | Scope | Purpose |
|------|-------|---------|
| `vFiles` | Message | Input files |
| `vReport` | Flow | Per-file stats |
| `vContent` / `vLines` | Message | Scratch |

## Notes
The non-trivial part is consistency with `wc -l`, which counts `\n` characters rather than "lines" — clarify the convention your team uses.
