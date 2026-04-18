# Get First Working Day of the Next Month

Performing calculations with dates is an essential part of many business processes, as most reports and invoices contain time-related data. Robomotion enables you to add various time units to date values and get precise results for further processing.

## What Get First Working Day of the Next Month can do

- `Robomotion.DateTime.Now` (`optLayout: 'RFC3339'`, `optTimezoneOffset: 'Local'`) → `msg.now`.
- `Core.Programming.Function` builds `msg.first_day_of_next_month` as `new Date(year, month+1, 1, 0, 0, 1).toISOString()`.
- `Robomotion.DateTime.Split` on `msg.first_day_of_next_month` → `msg.first_parts` (exposes `weekday`).
- Branch (`Core.Programming.Function`, `outputs: 2`) — port 0 when `msg.day_of_week` starts with `S` (Saturday/Sunday), port 1 otherwise.
- Weekend branch: `Core.Dialog.MessageBox` titled `Working Day` shows `First working day of next month is Monday`.
- Weekday branch: Function composes `msg.dialog_text`; `Core.Dialog.MessageBox` titled `Working day info` shows it.

## Behind the scenes

- The `S`-prefix test catches Saturday and Sunday in a single comparison (`msg.day_of_week.charAt(0).toUpperCase() === 'S'`) and avoids locale-specific weekday strings when English locale is assumed.
- December-to-January rollover is handled implicitly by `new Date(year, month+1, 1)` — JavaScript's `Date` constructor normalises month overflow, so no manual year bump is needed.
- The weekend branch does not compute Monday's actual date — it just displays the word "Monday". If the real date is required, add a loop that increments the day until `weekday === 'Monday'` before the message box.
- The `0, 0, 1` seconds argument shifts the timestamp one second past midnight, which avoids edge cases where a subsequent `Split` rounds down into the previous day under some timezone conversions.
