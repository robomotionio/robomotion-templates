# Convert Datetime to Text

Handling datetime data can be challenging, as numerous formats have been adopted across the globe. Robomotion enables the conversion of datetime variables to predefined and custom formats so that flows can handle data independently of the originating region.

## What Convert Datetime to Text can do

- Get Now (`Robomotion.DateTime.Now`) → `vCurrentDateTime` (local date + time).
- Format — Short Date (`Robomotion.DateTime.Format`, format `M/d/yyyy`) → `vFormattedDateTime`; show via `Core.Dialog.MessageBox` titled `R…
- Format — Short Time (`Robomotion.DateTime.Format`, format `h:mm tt`) → `vFormattedDateTime`; show dialog `Current time in 'short time' te…
- Format — Custom `MMMM dd, yyyy` → show dialog `Current date in 'MMMM dd, yyyy' text format:\n%vFormattedDateTime%`.
- Format — Custom `'Today is' dd'th day of' MMMM 'of Year' yyyy` → show dialog with only the formatted value as body.

## Behind the scenes

- `vCurrentDateTime` is captured **once** at the top; every subsequent format step reads the same value.
- The PA "ShortDate"/"ShortTime" standard formats map to `.NET` culture-dependent patterns (`M/d/yyyy` and `h:mm tt` in en-US). In Robomotion the equivalent is a literal Go-style layout in the `Format` node; document the pattern explicitly rather than relying on a locale enum.
