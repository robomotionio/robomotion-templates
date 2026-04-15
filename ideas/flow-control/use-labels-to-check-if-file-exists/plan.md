# Use Labels to Check if File Exists

**Level:** Advanced

## Description
Although flows run sequentially by default, transferring the running point is essential for many automation scenarios. Labels act like anchors and allow users to jump to them from anywhere in the flow.

## Objective
Implement a retry loop that waits for a file to appear within a timeout window. If the file exists → jump to a `PROCESS` label. If not → jump to a `RETRY` label, delay, and try again. After N failed retries → jump to `FAIL`.

## Prerequisites
- Robomotion Files package
- Target file `./inbox/drop.csv` (to be deposited externally during the flow run)

## Steps
1. Declare `vTarget`, `vMaxTries = 10`, `vDelaySec = 3`, `vAttempt = 0` (Flow).
2. **Label** `CHECK`.
3. **File Exists** `vTarget` → `vFound`.
4. **If** `vFound == true` → **Go To Label** `PROCESS`.
5. `vAttempt = vAttempt + 1`.
6. **If** `vAttempt >= vMaxTries` → **Go To Label** `FAIL`.
7. **Log Message** — `Attempt {vAttempt}/{vMaxTries} — not yet, sleeping {vDelaySec}s`.
8. **Delay** `vDelaySec`.
9. **Go To Label** `CHECK`.
10. **Label** `PROCESS`.
11. **Read File** `vTarget` → `vContent`. **Log Message** — `Processing {vContent.length} bytes`. **Go To Label** `DONE`.
12. **Label** `FAIL`.
13. **Throw Error** — `File never appeared after {vMaxTries} attempts`.
14. **Label** `DONE`.
15. **Log Message** — flow finished.

## Expected Outcome
If the file appears within `vMaxTries * vDelaySec` seconds the flow processes it; otherwise the flow fails cleanly with a diagnostic error.

## Variables
| Name | Scope | Purpose |
|------|-------|---------|
| `vTarget` | Flow | File to watch |
| `vMaxTries` / `vDelaySec` / `vAttempt` | Flow | Retry state |
| `vFound` / `vContent` | Message | Per-iteration scratch |

## Notes
- Labels + goto are powerful but easy to abuse — point learners at **While** or **For Each** for linear iteration, and save goto for genuine control-flow anchors like retry loops and early aborts.
- Modern alternative: a `Retry` node with max-attempts and delay params. Show this as the "you'd normally use this" variant and explain that labels are the underlying mechanism.
- The capstone for the Flow Control track — ties together conditionals, subflows, and jump semantics.
