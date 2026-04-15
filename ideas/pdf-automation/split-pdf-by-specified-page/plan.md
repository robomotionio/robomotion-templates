# Split PDF by Specified Page

**Level:** Intermediate

## Description
Splitting PDF files into two uneven parts is a typical request, as they often contain two different types of information, such as an order summary and a receipt. Robomotion can automate these scenarios, allowing users to create flows that split PDF files at any possible point.

## Objective
Split a source PDF at a user-chosen page boundary into two separate PDFs: pages `1..N` and pages `N+1..end`.

## Prerequisites
- Robomotion PDF package
- Source PDF (`./invoices/order-42.pdf`)
- Split point (Flow variable `vSplit`, e.g. `3`)

## Steps
1. Declare `vSource`, `vSplit`, and output paths `vFirstPart`, `vSecondPart` (Flow).
2. **Get Number of Pages in PDF** → `vTotal`.
3. **If** `vSplit < 1 || vSplit >= vTotal` → **Throw Error** with a clear message.
4. **Extract PDF Pages To New PDF** — pages `1..vSplit` → `vFirstPart`.
5. **Extract PDF Pages To New PDF** — pages `(vSplit+1)..vTotal` → `vSecondPart`.
6. **Get Number of Pages in PDF** on both outputs — assert `firstPages + secondPages == vTotal`.
7. **Log Message** — report output paths and page counts.

## Expected Outcome
Two non-overlapping PDFs whose combined page counts equal the source and whose content matches the intended split.

## Variables
| Name | Scope | Purpose |
|------|-------|---------|
| `vSource` | Flow | Input PDF |
| `vSplit` | Flow | Boundary page |
| `vFirstPart` / `vSecondPart` | Flow | Output paths |
| `vTotal` | Message | Source page count |

## Notes
Validation on `vSplit` is important — splitting at page 0 or past the end is the most common caller bug.
