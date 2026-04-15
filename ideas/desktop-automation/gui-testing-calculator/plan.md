# GUI Testing – Calculator

**Level:** Advanced

## Description
Manual GUI testing can be a challenging task for applications with complicated interfaces. Use Robomotion as a testing tool and create desktop flows that replicate testing steps every time they are needed.

## Objective
Drive the Windows Calculator through a suite of arithmetic test cases, assert the displayed result against the expected value, and produce a pass/fail report.

## Prerequisites
- Windows 10/11 with Calculator app
- Robomotion Desktop package + UI Automation
- A data source of test cases (`./tests/calculator-cases.csv` with columns: `expression`, `expected`)

## Test cases (sample)
| Expression | Expected |
|------------|----------|
| `2 + 3` | `5` |
| `7 * 6` | `42` |
| `100 / 4` | `25` |
| `9 - 12` | `-3` |
| `1/0` | `Cannot divide by zero` |

## Steps
1. **Read CSV** → `vCases`.
2. Initialize `vReport = []` (Flow).
3. **For Each** case in `vCases`:
   1. **Run Application** — `calc.exe` → `vApp`.
   2. **Wait For Window** — Calculator window → `vWindow`.
   3. **Send Keys** — clear with `Esc`.
   4. For each character in `case.expression`, **Click** the matching calculator button using UI Automation selectors (by automationId: `num0Button`, `plusButton`, `equalButton`, etc.).
   5. **Get Text** — read the display element (automationId `CalculatorResults`).
   6. **If** display equals `case.expected` → push `{case, result: 'PASS'}` to `vReport`; else push `{case, result: 'FAIL', actual: display}`.
   7. **Close Window**.
4. **Write To File** — save `vReport` as `./tests/report-{timestamp}.json`.
5. **If** any `FAIL` in report → **Throw Error** so CI picks it up as a failed run.

## Expected Outcome
Every test case runs end-to-end, the Calculator is exercised visibly, and the JSON report clearly lists pass/fail per case. The flow exits non-zero if any assertion fails.

## Variables
| Name | Scope | Purpose |
|------|-------|---------|
| `vCases` | Flow | Test suite |
| `vReport` | Flow | Accumulated results |
| `vApp` / `vWindow` | Message | Per-iteration handles |

## Notes
- Use UI Automation (AutomationID) selectors — image-based clicks are brittle against Calc's light/dark-mode theme swap.
- Good flow to schedule in CI as a smoke test for Robomotion Robot upgrades.
- This tutorial doubles as a Robomotion demo for QA teams.
