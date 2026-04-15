# Use Conditionals to Check if File Exists

**Level:** Beginner

## Description
Implementing different logic paths based on specific conditions is essential to most automation scenarios. Conditionals enable users to check values and run different blocks of code depending on the result.

## Objective
Use an **If / Else** conditional to branch based on whether a specific file exists on disk: if it exists, log a success message; if not, create it with default content.

## Prerequisites
- Robomotion Files package
- Target path `./data/config.json`

## Steps
1. Declare `vPath = "./data/config.json"` (Flow).
2. **File Exists** — input `vPath` → boolean `vFound`.
3. **If** `vFound == true`:
   - **Log Message** — `Config already exists at {vPath}`.
   - **Read File** → `vContent`; log first 100 chars.
4. **Else**:
   - **Log Message** — `Config not found — creating with defaults`.
   - **Write File** — `vPath` with `{"theme":"light","lang":"en"}`.
5. **Log Message** — flow done.

## Expected Outcome
First run: the file doesn't exist → it gets created. Second run: the file exists → it's read and logged. Running the flow repeatedly is safe (idempotent).

## Variables
| Name | Scope | Purpose |
|------|-------|---------|
| `vPath` | Flow | Target file |
| `vFound` | Message | Existence flag |
| `vContent` | Message | File contents on the hit branch |

## Notes
Cleanest introduction to **If / Else** in Robomotion — every later tutorial in this track assumes learners have this pattern down.
