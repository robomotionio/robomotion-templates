# Print Current Week's Calendar

Desktop users usually have daily routines, such as printing their weekly calendar, that helps them keep themselves productive and organized. Create desktop flows that automate these repetitive tasks and make your workweek easier.

## What Print Current Week's Calendar can do

- Resolve Desktop path — in a `Core.Programming.Function`, compute `vDesktopFolderPath = global.get('$Home$') + '/Desktop'` (Windows equiva…
- Outlook Launch — start Outlook, capture `vOutlookInstance`.
- Maximise Outlook Window (`SetWindowState` → `Maximized`) against `Window 'Outlook'`.
- Click `Button 'Calendar'` inside the Outlook window.
- Click `Button 'Work Week View. Change calendar view mode'`. Wrap in a `Core.Trigger.Catch` with empty handler (matches the PA `ON ERROR .…

## Behind the scenes

- The two UI clicks that change the calendar view are each wrapped in an *empty* PA `ON ERROR END` block. Preserve this: in Robomotion add a `Core.Trigger.Catch` whose handler goes nowhere so errors are swallowed silently.
- The flow intentionally prints an **image of the current window**, not a vector copy of the calendar — replicating this means screenshot + printer, not an Outlook-native export.
