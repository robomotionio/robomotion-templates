# Display Python Script Output

**Level:** Intermediate

## Description
Python is a high-level programming language known for its scripting capabilities. Robomotion enables users to run Python scripts and automate complex scenarios that require a custom approach.

## Objective
Execute a Python script from a flow, pass in a variable, and read a structured return value back into the flow.

## Prerequisites
- Python 3.9+ available on PATH
- Robomotion Scripting / Code package

## Steps
1. Declare `vInput = [1, 1, 2, 3, 5, 8]` (Flow).
2. **Run Python Script**:
   ```python
   import json, statistics, sys
   data = json.loads(sys.stdin.read())
   print(json.dumps({
       "mean":    statistics.mean(data),
       "median":  statistics.median(data),
       "stdev":   statistics.stdev(data) if len(data) > 1 else 0.0,
   }))
   ```
   - Feed `vInput` via stdin as JSON.
   - Capture stdout → `vRaw`.
3. **Parse JSON** → `vStats`.
4. **Log Message** — `Mean={vStats.mean} Median={vStats.median} Stdev={vStats.stdev}`.

### Variants
- Pass arguments via CLI instead of stdin for short inputs.
- Use a `.py` file on disk rather than inline code for longer scripts.

## Expected Outcome
Correct statistics for the input list printed to the log (`Mean=3.33…`, `Median=2.5`, `Stdev=2.73…`).

## Variables
| Name | Scope | Purpose |
|------|-------|---------|
| `vInput` | Flow | Numeric list |
| `vRaw` | Message | Script stdout |
| `vStats` | Message | Parsed stats |

## Notes
- Use JSON on stdin/stdout as the interop format — it survives quoting and Unicode without drama.
- Mention virtual-env pitfalls: the flow should point to the specific Python executable, not rely on `python` being whatever Windows happened to install.
