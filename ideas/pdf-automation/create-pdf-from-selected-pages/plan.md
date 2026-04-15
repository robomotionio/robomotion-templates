# Create PDF from Selected PDF Page(s)

**Level:** Beginner

## Description
PDF files may have tens or hundreds of pages depending on the nature of their content. An effective way to handle specific information from these files is to gather it in a separate file. Robomotion's PDF nodes enable users to extract any possible combination of pages and save them in different files for further manipulation.

## Objective
Given a source PDF, extract a specific page range (e.g. pages 3–5) into a new, smaller PDF.

## Prerequisites
- Robomotion PDF package
- Source PDF (`./docs/source.pdf`) with at least 10 pages

## Steps
1. Declare `vSource = "./docs/source.pdf"`, `vOutput = "./docs/pages-3-5.pdf"`, `vFirst = 3`, `vLast = 5` (Flow).
2. **Extract PDF Pages To New PDF** — input `vSource`, page range `vFirst`–`vLast`, output `vOutput`.
3. **File Exists** — verify `vOutput` was written.
4. **Log Message** — `Extracted pages {vFirst}-{vLast} to {vOutput}`.

### Variants
- Non-contiguous pages: `[1, 3, 7]` using a list input.
- Every other page (odds only): combine with a loop + `If page % 2 == 1`.

## Expected Outcome
`pages-3-5.pdf` exists, opens cleanly in a PDF viewer, and contains exactly the three requested pages.

## Variables
| Name | Scope | Purpose |
|------|-------|---------|
| `vSource` / `vOutput` | Flow | File paths |
| `vFirst` / `vLast` | Flow | Page range |

## Notes
The Beginner-level version uses a contiguous range; the variants raise complexity without changing the nodes involved.
