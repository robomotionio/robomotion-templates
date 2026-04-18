# Get Current Time

Creating and handling datetime values are vital for time-related operations, such as generating logs. Robomotion provides various nodes to create, convert and manipulate datetime values.

## What Get Current Time can do

- `Robomotion.DateTime.Now` (`optLayout: 'RFC3339'`, `optTimezoneOffset: 'Local'`) → `msg.current_date_time`.
- `Robomotion.DateTime.Format` converts `msg.current_date_time` using `optCustomOutLayout: '15:04:05'` → `msg.long_time`.
- `Core.Programming.Function` composes `msg.dialog_text = 'It is ' + msg.long_time + ' currently.'`.
- `Core.Dialog.MessageBox` titled `Time right now` (type `info`) displays `msg.dialog_text`, then `Core.Flow.Stop`.

## Behind the scenes

- The Format node uses an explicit Go-style layout `15:04:05` rather than a named enum, so the output is deterministic across machines and locales instead of varying with the host's regional settings.
- `optTimezoneOffset: 'Local'` anchors the timestamp to the robot's clock, matching user expectations when the dialog is displayed interactively; switch to `'UTC'` for logs and audit trails.
