# Convert Datetime to Text

Handling datetime data can be challenging, as numerous formats have been adopted across the globe. Robomotion enables the conversion of datetime variables to predefined and custom formats so that flows can handle data independently of the originating region.

## What Convert Datetime to Text can do

- Get now (`Robomotion.DateTime.Now`, `optLayout: RFC3339`, `optTimezoneOffset: Local`) → `msg.current_date_time`.
- Short date (`Robomotion.DateTime.Format`, custom out layout `1/2/2006`) → `msg.formatted_date_time`; Function builds `msg.dialog_text = "Current date in 'short date' text format:\n" + msg.formatted_date_time`, then `Core.Dialog.MessageBox` titled `Result` (`info`).
- Short time (custom out layout `3:04 PM`) → dialog `Current time in 'short time' text format:\n...`.
- Long date (custom out layout `January 02, 2006`) → dialog `Current date in 'MMMM dd, yyyy' text format:\n...`.
- Today sentence (custom out layout `Today is 02th day of January of Year 2006`) → dialog showing `msg.formatted_date_time` directly.
- 12-hour time (custom out layout `03:04:05 PM`) → dialog `Current time in 'hh:mm:ss tt' text format:\n...`.
- Time sentence (custom out layout `It is currently 03 hours 04 minutes and 05 seconds.`) → dialog showing `msg.formatted_date_time` directly.
- Full datetime (custom out layout `Monday, 02 January, 2006 | 03:04:05 PM`) → dialog `Today's date and time is ...`, then `Core.Flow.Stop`.

## Behind the scenes

- `msg.current_date_time` is captured **once** at the top as RFC3339; every subsequent `Robomotion.DateTime.Format` step reads the same value and only changes `optCustomOutLayout`.
- `Robomotion.DateTime.Format` uses Go-style reference-time layouts — `1/2/2006`, `3:04 PM`, `January 02, 2006`, etc. — where the specific reference numbers (year `2006`, month `01`, day `02`, hour `15`/`03`, minute `04`, second `05`) mark which field goes where. Literal words like `Today is` or `of Year` pass through verbatim.
- `msg.formatted_date_time` is reused across every format step, so each dialog always reflects the most recent conversion.
