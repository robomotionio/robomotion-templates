# Merge Two PDFs

**Level:** Beginner

## Description
PDF manipulation is an ideal candidate for automation, as many scenarios, such as merging reports, require strictly standardized steps. Robomotion provides a series of PDF nodes to automate these tasks and handle PDF files efficiently.

## Objective
Combine two PDFs (`cover.pdf` + `body.pdf`) into a single output PDF in the correct order.

## Prerequisites
- Robomotion PDF package
- `./docs/cover.pdf` and `./docs/body.pdf`

## Steps
1. Declare `vA = "./docs/cover.pdf"`, `vB = "./docs/body.pdf"`, `vOut = "./docs/merged.pdf"` (Flow).
2. **Merge PDF Files** — input list `[vA, vB]`, output `vOut`.
3. **Get Number of Pages in PDF** — sanity check that `vOut.pages == vA.pages + vB.pages`.
4. **Log Message** — `Merged into {vOut} with {pages} pages`.

## Expected Outcome
`merged.pdf` opens as a single document whose pages appear in the order cover → body, with total page count matching the sum of inputs.

## Variables
| Name | Scope | Purpose |
|------|-------|---------|
| `vA` / `vB` / `vOut` | Flow | File paths |

## Notes
This is the gateway to the Intermediate "Merge PDFs" tutorial, which generalizes to N files via a loop.
