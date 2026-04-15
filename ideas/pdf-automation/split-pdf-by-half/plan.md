# Split PDF by Half

**Level:** Advanced

## Description
Apart from dividing PDF files using a user-defined splitting point, Robomotion enables the implementation of fully automatic logic that doesn't require user input, like always splitting PDF files in half.

## Objective
Given any source PDF, produce two outputs of equal (or nearly equal, for odd page counts) length, without any parameter other than the input path.

## Prerequisites
- Robomotion PDF package
- Source PDF (`./docs/manual.pdf`)

## Steps
1. Declare `vSource = "./docs/manual.pdf"`.
2. **Get Number of Pages in PDF** → `vTotal`.
3. Compute `vHalf = ceil(vTotal / 2)` (so odd-count PDFs put the extra page in the first half).
4. **Extract PDF Pages To New PDF** — pages `1..vHalf` → `{name}-part1.pdf`.
5. **Extract PDF Pages To New PDF** — pages `(vHalf+1)..vTotal` → `{name}-part2.pdf`.
6. **Log Message** — `Split {vTotal} pages into {vHalf} + {vTotal - vHalf}`.

### Edge cases
| Source pages | Part 1 | Part 2 |
|---|---|---|
| 0 | error | error |
| 1 | page 1 | (empty — skip creation) |
| 2 | page 1 | page 2 |
| 5 | pages 1–3 | pages 4–5 |
| 100 | pages 1–50 | pages 51–100 |

## Expected Outcome
Two PDFs whose combined content reproduces the source exactly, sized as shown in the edge-case table.

## Variables
| Name | Scope | Purpose |
|------|-------|---------|
| `vSource` | Flow | Input |
| `vTotal` | Message | Total pages |
| `vHalf` | Message | Midpoint |

## Notes
- `ceil` vs `floor` decides which half gets the extra page on odd counts — pick one and document it consistently.
- Worth showing as a named Subflow that wraps Split-by-specified-page with `vSplit = ceil(total/2)`.
