# GUI Testing Calculator

Manual GUI testing can be a challenging task for applications with complicated interfaces. Use Robomotion as a testing tool and create desktop flows that replicate testing steps every time they are needed.

## What GUI Testing Calculator can do

- Pre-test — Set Variables (subflow): seed the core identifiers and compute the CSV report file paths.
- Pre-test — Block Input: globally disable mouse+keyboard input for the duration of the run; wrap in a `Core.Trigger.Catch` so a failure to…
- Pre-test — Start Test Report (subflow): write the CSV header row to the temporary report file.
- Test setup — Launch App (subflow): start Calculator, wait up to 5 s for its window, capture its `ProductVersion`, then call `Resize And P…
- Test pass — Navigation Menu (subflow): exercise the hamburger / navigation menu by switching between `Graphing Calculator` and `Standard …

## Behind the scenes

- All nine blocks map cleanly to Robomotion `Core.Flow.SubFlow` nodes; keep subflow names matching the PA names (in lower_snake form).
- The on-error path in each test subflow writes a `Fail` row; the on-success tail writes a `Pass` row — mirror this two-outcome shape per subflow.
- `vProductVersion.Trimmed.Trimmed.Trimmed` appears three times in PA because PowerShell output comes back with trailing whitespace/newlines; in Robomotion a single `trim()` inside a `Core.Programming.Function` is sufficient.
- CSV writes inside the catch branch should use `continueOnError: true` so logging a failure cannot itself abort the flow.
