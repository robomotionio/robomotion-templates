# Use Subflows to Check if File Exists

**Level:** Intermediate

## Description
Automating complex scenarios may lead to large flows with recurrent nodes. Subflows are reusable groups of nodes that split flows, making them more manageable and easier to maintain.

## Objective
Wrap the "check / create-if-missing" logic from the Beginner tutorial inside a **Subflow** (`EnsureFile(path, defaultContent) -> exists`) and invoke it from a main flow that ensures three different files in sequence.

## Prerequisites
- Robomotion Files package
- Completed "Use conditionals to check if file exists" tutorial

## Steps
### Subflow: `EnsureFile(vPath, vDefault) -> vExisted`
1. **File Exists** → `vExisted`.
2. **If** `vExisted == false`:
   - **Write File** — `vPath` with `vDefault`.
3. Return `vExisted`.

### Main flow
1. **Invoke Subflow** `EnsureFile("./data/config.json", '{"theme":"light"}')` → `vA`.
2. **Invoke Subflow** `EnsureFile("./data/users.json", "[]")` → `vB`.
3. **Invoke Subflow** `EnsureFile("./logs/app.log", "")` → `vC`.
4. **Log Message** — `Existed: config={vA} users={vB} log={vC}`.

## Expected Outcome
On first run: all three files get created, subflow returns `false` three times. On second run: all three exist, subflow returns `true` three times. The main flow stays short and readable.

## Variables
| Name | Scope | Purpose |
|------|-------|---------|
| `vPath` / `vDefault` | Message (subflow input) | Subflow parameters |
| `vExisted` | Message (subflow output) | Return value |

## Notes
- Teaching point: compare line count of the Beginner flow × 3 vs the Subflow version. The subflow version is ~⅓ the size and has one place to fix bugs.
- Good habit: design subflows with explicit input/output contracts so they can be tested in isolation.
