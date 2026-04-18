# Convert Text to Datetime

Although flows can extract data from documents, the retrieved values are usually stored as text. If a text represents a date or time value, Robomotion enables users to convert it to a datetime variable and use this variable for further date and time calculations.

## What Convert Text to Datetime can do

- Parse `20220101` with custom format `yyyyMMdd` → `vTextAsDateTime` (use `Robomotion.DateTime`'s text-to-datetime capability, or a `Core.P…
- Show Message (`Core.Dialog.MessageBox`) titled `Result` with body `The text '20220101' has been converted to the following datetime varia…
- Parse `23:45:00` with custom format `HH:mm:ss` → `vTextAsDateTime`.
- Show Message `The text '23:45:00' has been converted to the following datetime variable: %vTextAsDateTime%`.
- Parse `January 01, 2022 23:45:00` with custom format `MMMM dd, yyyy HH:mm:ss` → `vTextAsDateTime`.

## Behind the scenes

- Power Automate's "ToDateTimeCustomFormat" uses .NET format tokens (`yyyy`, `MM`, `dd`, `HH`, etc.). When translating to Robomotion, express the same layout in the format string of whichever datetime-parse node the package provides, or convert on the fly in a Function node — just remember the Function sandbox is ES5 only (no `Date.parse` with arbitrary formats; write an explicit tokenizer or use a standard ISO string).
- `vTextAsDateTime` is intentionally reused across all three parses — each dialog shows the *current* value after the latest conversion.
