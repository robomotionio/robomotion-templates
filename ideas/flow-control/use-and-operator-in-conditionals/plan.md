# Use the AND Operator in Conditionals

**Level:** Intermediate

## Description
Logical operators enable users to create complex logical expressions and implement advanced logic in their flows. For example, they can use the "AND" logical operator to create expressions that are true when all the provided conditions are valid.

## Objective
Process a file only when **all** of these are true: the file exists, its size is under 10 MB, and its extension is in an allow-list. Otherwise, skip it with a reason.

## Prerequisites
- Robomotion Files package
- Input folder `./uploads/` with mixed file types and sizes

## Steps
1. **List Files in Folder** `./uploads/` → `vFiles`.
2. **For Each** file in `vFiles`:
   1. **File Exists** → `vExists`.
   2. **Get File Info** → `vInfo`.
   3. `vSmallEnough = vInfo.size < 10 * 1024 * 1024`.
   4. `vAllowedExt = vInfo.extension in [".pdf", ".docx", ".xlsx"]`.
   5. **If** `vExists && vSmallEnough && vAllowedExt`:
      - **Copy File** → `./processed/{file.name}`.
      - **Log Message** — `OK: {file.name}`.
   6. **Else**:
      - **Log Message** — `SKIP: {file.name} (exists={vExists}, size_ok={vSmallEnough}, ext_ok={vAllowedExt})`.

## Expected Outcome
Only files that satisfy **all three** conditions land in `./processed/`. The log clearly shows which predicate failed for each skipped file.

## Variables
| Name | Scope | Purpose |
|------|-------|---------|
| `vFiles` | Message | All candidates |
| `vInfo` | Message | Per-file metadata |
| `vExists` / `vSmallEnough` / `vAllowedExt` | Message | Individual predicates |

## Notes
- Short-circuit evaluation is the point — Robomotion's `&&` stops at the first false predicate.
- Logging *which* predicate failed (not just "skipped") is the difference between a debuggable flow and a mystery.
