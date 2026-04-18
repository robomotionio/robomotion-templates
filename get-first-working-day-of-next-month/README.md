# Get First Working Day of the Next Month

Performing calculations with dates is an essential part of many business processes, as most reports and invoices contain time-related data. Robomotion enables you to add various time units to date values and get precise results for further processing.

## What Get First Working Day of the Next Month can do

- Get Now (`Robomotion.DateTime.Now`, mode `DateAndTime`) → `vNow`.
- Add Time (`Robomotion.DateTime.Add`, unit `Months`, amount `1`) → `vNowPlus1`.
- Build First-Day-Of-Next-Month — in a `Core.Programming.Function` node, construct `vFirstDayOfNextMonth` from the month+year components of…
- Split Date (`Robomotion.DateTime.Split`) on `vFirstDayOfNextMonth` to obtain `vDayOfWeek`.
- Conditional (`Core.Programming.Function` with `outputs: 2`) — port 0 when `vDayOfWeek` starts with `S` (case-insensitive), port 1 otherwise:

## Behind the scenes

- The PA flow checks `StartsWith(..., "S", True)` — matches both Saturday and Sunday. Implement the same test in the Function node (`msg.vDayOfWeek.charAt(0).toUpperCase() === 'S'`).
- December → January rollover is handled implicitly by `DateTime.Add` with unit `Months`; no manual year bump is needed.
- The branch does NOT actually advance to Monday's date — it simply displays the word "Monday". If the real Monday date is required, add a follow-up step to add days until `vDayOfWeek` is `Monday`.
