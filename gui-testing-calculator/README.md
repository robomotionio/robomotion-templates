# GUI Testing Calculator

Manual GUI testing can be a challenging task for applications with complicated interfaces. Use Robomotion as a testing tool and create desktop flows that replicate testing steps every time they are needed.

## What GUI Testing Calculator can do

- Pre-test — `Set Variables` (`Core.Flow.SubFlow`): seeds the core identifiers and computes the CSV report file paths.
- Pre-test — `Start Test Report` (`Core.Flow.SubFlow`): writes the CSV header row to the temporary report file.
- Test setup — `Launch App` (`Core.Flow.SubFlow`): starts Calculator, waits for its window, captures its product version, then `Resize and Position App` normalises the window geometry.
- Test pass — `Navigation Menu` (`Core.Flow.SubFlow`): exercises the hamburger menu by switching between `Graphing Calculator` and `Standard Calculator` modes.
- Teardown — `Close App` (`Core.Flow.SubFlow`) then `Finish Test Report` (`Core.Flow.SubFlow`) writes the final report row and closes the target application before `Core.Flow.Stop`.
- `Core.Trigger.Catch` watches the `Launch App`, `Resize and Position App`, `Navigation Menu`, and `Close App` subflows — on any subflow error it invokes `Log Errors` (`Core.Flow.SubFlow`) and stops with `failed` and reason `A subflow raised an error`.

## Behind the scenes

- The flow is orchestrated entirely from `Core.Flow.SubFlow` nodes; each step is an isolated subflow that can be run or debugged independently.
- The central `Core.Trigger.Catch` funnels errors from every test subflow into a single `Log Errors` path, so per-subflow Fail rows remain consistent in the CSV report.
- The success path lets each subflow write its own `Pass` row at the tail; the error path writes the corresponding `Fail` row — mirror this two-outcome shape when adding new test subflows.
- CSV writes inside the `Log Errors` branch should use `continueOnError: true` so logging a failure cannot itself abort the flow.
