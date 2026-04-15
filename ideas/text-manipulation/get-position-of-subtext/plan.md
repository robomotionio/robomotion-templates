# Get Position of Subtext

**Level:** Beginner

## Description
Searching for keywords is usually expected after text extraction, especially when specific values must be handled independently. Robomotion provides "Parse Text" nodes to make parsing text and searching subtexts feasible in flows.

## Objective
Given a body of text and a target keyword, find every occurrence and record each position (index). Demonstrate both case-sensitive and case-insensitive searches.

## Prerequisites
- Robomotion Text package

## Steps
1. Declare `vText` (Flow) — a paragraph of prose that contains the target word multiple times.
2. Declare `vNeedle = "Robomotion"` (Flow).
3. Initialize `vPositions = []` (Flow).
4. `vCursor = 0`.
5. Loop:
   - **Parse Text** (Find Position) — search `vText` starting from `vCursor` for `vNeedle`, case-insensitive → `vIndex`.
   - **If** `vIndex == -1` → break.
   - Append `vIndex` to `vPositions`.
   - `vCursor = vIndex + vNeedle.length`.
6. **Log Message** — print `vPositions` (e.g. `[0, 47, 128]`).
7. (Variant) Re-run with `case-sensitive = true` to show the count changes.

## Expected Outcome
An array of zero-based indices showing where each occurrence starts. Case-sensitive and -insensitive variants produce different counts where capitalization differs.

## Variables
| Name | Scope | Purpose |
|------|-------|---------|
| `vText` / `vNeedle` | Flow | Inputs |
| `vPositions` | Flow | Result indices |
| `vCursor` / `vIndex` | Message | Search state |

## Notes
- Teach the classic "advance cursor past the last hit" pattern — learners often write infinite loops here.
- Good precursor to regex-based searches covered later.
