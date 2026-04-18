# Convert Text to Datetime

Although flows can extract data from documents, the retrieved values are usually stored as text. If a text represents a date or time value, Robomotion enables users to convert it to a datetime variable and use this variable for further date and time calculations.

## What Convert Text to Datetime can do

- Parse date (`Robomotion.DateTime.Format`) — `inTime: 20220101`, custom input layout `20060102`, output `RFC3339` → `msg.text_as_date_time`.
- Build text (`Core.Programming.Function`) → `msg.dialog_text = "The text '20220101' has been converted to the following datetime variable: " + msg.text_as_date_time`, then `Core.Dialog.MessageBox` titled `Result` (`info`).
- Parse time (`Robomotion.DateTime.Format`) — `inTime: 23:45:00`, custom input layout `15:04:05`, output `RFC3339` → `msg.text_as_date_time`, followed by the same build-text + `Result` dialog pattern.
- Parse datetime (`Robomotion.DateTime.Format`) — `inTime: January 01, 2022 23:45:00`, custom input layout `January 02, 2006 15:04:05`, output `RFC3339` → `msg.text_as_date_time`, followed by the final `Result` dialog before `Core.Flow.Stop`.

## Behind the scenes

- `Robomotion.DateTime.Format` uses Go-style reference-time layouts (`2006`, `01`, `02`, `15`, `04`, `05`) rather than `yyyy/MM/dd` tokens — the literal sample values in the input layout are what define each field.
- `msg.text_as_date_time` is deliberately reused across all three conversions — each dialog shows the value produced by the most recent `Parse` step.
