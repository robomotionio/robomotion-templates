# Days of Your Life

Handling datetime values can be challenging, as time-related data require absolute accuracy. Robomotion allows you to perform reliable calculations with datetime values and display results in various units.

## What Days of Your Life can do

- Show Info Dialog (`Core.Dialog.MessageBox`, icon `Information`) titled `Description` with body *"This flow prompts you to enter your birt…
- Select Date Dialog — present a `DateOnly` calendar picker titled `Please select your birthday...` with message `Select your birth date...…
- Get Now (`Robomotion.DateTime.Now`, mode `DateOnly`) → `vCurrentDate`.
- Subtract Dates (`Robomotion.DateTime.Span` with unit `Days`) — compute `vCurrentDate - vBirthDate` → `vDaysAlive`.
- Show Warning Dialog (`Core.Dialog.MessageBox`, icon `Warning`) titled `Attention!` with body `Today is day #%vDaysAlive%\n\nEach day is u…

## Behind the scenes

- The PA flow ignores `vButtonPressed` — there is no explicit cancel branch. Port this behaviour as-is rather than guarding with an `If`.
- Use `Robomotion.DateTime.Span` (or `Robomotion.DateTime.Split`) to get the day-count; do not attempt string math.
