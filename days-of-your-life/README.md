# Days of Your Life

Handling datetime values can be challenging, as time-related data require absolute accuracy. Robomotion allows you to perform reliable calculations with datetime values and display results in various units.

## What Days of Your Life can do

- Message Dialog (`Core.Dialog.MessageBox`, `optType: info`) titled `Description` explains the flow to the user.
- Input Dialog (`Core.Dialog.InputBox`) titled `Please select your birthday...`, prompt `Select your birth date (YYYY-MM-DD):`, default `1990-01-01` → `msg.birth_date_text`.
- Parse birth date (`Robomotion.DateTime.Format`, custom in-layout `2006-01-02`, out-layout `RFC3339`) → `msg.birth_date`.
- Get current date (`Robomotion.DateTime.Now`, `RFC3339`, `Local`) → `msg.current_date`.
- Days since birth (`Robomotion.DateTime.Span`, `RFC3339`) from `msg.birth_date` to `msg.current_date` → `msg.span_ms`.
- Milliseconds to days (`Core.Programming.Function`) — `Math.floor(msg.span_ms / 86400000)` → `msg.days_alive`.
- Build dialog text (`Core.Programming.Function`) — composes `Today is day #<days_alive>` into `msg.dialog_text`.
- Message Dialog (`Core.Dialog.MessageBox`, `optType: info`) titled `Attention!` shows `msg.dialog_text`, then `Core.Flow.Stop`.

## Behind the scenes

- The flow has no explicit cancel branch — if the user cancels the input dialog, downstream nodes simply fail fast.
- Day counting is done by dividing the millisecond span (`Robomotion.DateTime.Span` returns ms) by `86400000` and flooring — this matches a whole-days-elapsed semantic and avoids DST / timezone drift.
- The birth-date string is normalised through `Robomotion.DateTime.Format` (custom `2006-01-02` layout to `RFC3339`) so `Span` gets a well-formed timestamp regardless of how the user typed it.
