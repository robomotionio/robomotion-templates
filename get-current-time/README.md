# Get Current Time

Creating and handling datetime values are vital for time-related operations, such as generating logs. Robomotion provides various nodes to create, convert and manipulate datetime values.

## What Get Current Time can do

- Get Now (`Robomotion.DateTime.Now`, mode `DateAndTime`) → `vCurrentDateTime`.
- Format Time (`Robomotion.DateTime.Format`) — convert `vCurrentDateTime` to the "Long Time" layout (`HH:mm:ss` / `h:mm:ss tt` depending on…
- Show Information Dialog (`Core.Dialog.MessageBox`, icon `Information`) titled `Time right now` with body `It is %vLongTime% currently.`.

## Behind the scenes

- The PA action uses the `LongTime` standard format, which is locale-dependent (`HH:mm:ss` on most systems). Document the literal pattern in the Format node rather than relying on an enum so the flow is deterministic across machines.
