# Get Previous Working Date

Apart from performing simple calculations with dates, some scenarios may require more complex logic to get the desired results. Using datetime and conditional nodes, you can make calculations based on specific conditions, such as calculating the previous working day.

## What Get Previous Working Date can do

- `Robomotion.DateTime.Now` with `optLayout: 'RFC3339'` and `optTimezoneOffset: 'Local'` → `msg.today`.
- `Robomotion.DateTime.Split` on `msg.today` → `msg.today_parts` (exposes `.weekday`).
- `Compute Day Offset` (`Core.Programming.Function`) — sets `msg.day_offset` to `-2` on Sunday, `-3` on Monday, otherwise `-1`.
- `Robomotion.DateTime.Add` with `optDurationUnit: 'Days'` and `inDuration: msg.day_offset` → `msg.previous_working_day`.
- `Robomotion.DateTime.Split` on `msg.previous_working_day` → `msg.previous_parts`; `Robomotion.DateTime.Format` with `optCustomOutLayout: 'January'` → `msg.month_name`.
- `Build Dialog Text` (`Core.Programming.Function`) assembles `msg.dialog_text` as `Day / Month / Year`, then `Core.Dialog.MessageBox` shows the result before `Core.Flow.Stop`.

## Behind the scenes

- The weekday branches collapse into a single Function node (`Compute Day Offset`) that returns the numeric offset, so one `Robomotion.DateTime.Add` handles all three cases instead of three parallel branches.
- `Robomotion.DateTime.Split` exposes `.day`, `.year`, and `.weekday` as structured fields, avoiding any string parsing of the RFC3339 value.
- The custom format layout `January` (Go-style reference date) yields the full month name, matching the `MMMM` pattern from the source tutorial.
