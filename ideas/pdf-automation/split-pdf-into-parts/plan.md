# Split PDF into Parts

**Level:** Advanced

## Description
As PDF files are a widespread way to share information, a common requirement is splitting them into parts for further processing. Robomotion allows users to split PDF files by a set number of pages without struggle.

## Objective
Given a source PDF and a page-per-part value `N`, produce a sequence of PDFs each containing up to `N` pages from the source (the last one may have fewer).

## Prerequisites
- Robomotion PDF package
- Source PDF (`./docs/manual.pdf`)
- `vPartSize` (Flow), e.g. `10`

## Steps
1. Declare `vSource`, `vPartSize`, `vOutDir = "./docs/parts/"` (Flow).
2. **Create Folder** — `vOutDir`.
3. **Get Number of Pages in PDF** → `vTotal`.
4. Compute `vParts = ceil(vTotal / vPartSize)`.
5. **For** `i` from `0` to `vParts - 1`:
   1. `vFirst = i * vPartSize + 1`.
   2. `vLast = min(vFirst + vPartSize - 1, vTotal)`.
   3. **Extract PDF Pages To New PDF** — `vFirst..vLast` → `{vOutDir}/part-{i+1}.pdf`.
6. **List Files in Folder** `vOutDir` → sanity check `count == vParts`.
7. **Log Message** — summary.

### Example
Source = 23 pages, `vPartSize = 10` →
- part-1.pdf (1–10)
- part-2.pdf (11–20)
- part-3.pdf (21–23)

## Expected Outcome
An ordered set of `part-N.pdf` files whose concatenation reproduces the source. The last file may be shorter than `vPartSize` pages.

## Variables
| Name | Scope | Purpose |
|------|-------|---------|
| `vSource` | Flow | Input |
| `vPartSize` | Flow | Pages per output |
| `vOutDir` | Flow | Output directory |
| `vTotal` / `vParts` / `vFirst` / `vLast` | Message | Loop arithmetic |

## Notes
- Zero-pad the part index (`part-001.pdf`) when many parts are produced, for stable sort order.
- Advanced because it combines a **For** counter loop, boundary math, and file system output — things the earlier PDF tutorials don't cover together.
