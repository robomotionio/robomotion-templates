# Sort Lines of a Text File

**Level:** Intermediate

## Description
Although manipulating text files is an uncomplicated operation, editing files with numerous entries can require a considerable amount of time. Automating processes such as sorting text entries can disengage desktop users from time-demanding monotonous tasks.

## Objective
Sort the lines of a text file alphabetically (case-insensitive by default) and write the sorted content to a new file. Offer a variant that sorts numerically and a variant that removes duplicates.

## Prerequisites
- Robomotion Files + Text packages
- Input file `./data/names.txt`

## Steps
1. **Read File** → `vText`.
2. **Split Text** on newline → `vLines`.
3. **Trim** each line; drop empty lines.
4. **Sort Array** — case-insensitive, ascending → `vSorted`.
5. (Variant) **Remove Duplicates** on `vSorted` → `vUnique`.
6. **Join Array** with `\n` → `vOutput`.
7. **Write File** — `./data/names.sorted.txt` with `vOutput`.
8. **Log Message** — `Sorted {vLines.length} lines (unique: {vUnique.length})`.

### Variants
- Descending order: reverse after sort.
- Numeric sort: parse each line to number, sort, emit. Falls back to string for non-numeric lines.
- Natural sort (`item2` before `item10`): use a natural-compare utility.

## Expected Outcome
The output file contains the same lines (or a subset if deduplicated) in the requested order, preserving encoding and line-ending style of the source.

## Variables
| Name | Scope | Purpose |
|------|-------|---------|
| `vText` / `vLines` | Message | Input |
| `vSorted` / `vUnique` | Flow | Sorted/deduped result |
| `vOutput` | Message | Joined output |

## Notes
- Windows files often use CRLF — preserve the original line-ending when writing output to avoid diff churn in version-controlled data files.
- Mention locale-aware sorting (e.g. German Umlauts) where relevant.
