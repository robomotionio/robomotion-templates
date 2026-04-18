# Get Position of Subtext

Searching for keywords is usually expected after text extraction, especially when specific values must be handled independently. Robomotion provides "Parse Text" nodes to make parsing text and searching subtexts feasible in flows.

## What Get Position of Subtext can do

- Custom Form Dialog titled `Get position of a subtext`. Fields:
- Conditional (`Core.Programming.Function`, `outputs: 2`) — branch when `vButtonPressed != "Cancel"`; otherwise `Core.Flow.Stop`.
- Capture variables — `vTextVar = vCustomFormData.Text`, `vSubtextVar = vCustomFormData.Subtext`.
- Find First Occurrence — search `vTextVar` for `vSubtextVar`, starting position `0`, case-sensitive → `vPosition` (integer; `-1` if not fo…
- Conditional on `vPosition >= 0` (`Core.Programming.Function`, `outputs: 2`):

## Behind the scenes

- PA returns `-1` when not found; the conditional is `>= 0`. Preserve this convention.
- `IgnoreCase: False` — case-sensitive. The default is surprising for most users (e.g. `Power` ≠ `power`); call it out.
- The success message has a **double space** before `%vPosition%` in the PA source — preserve for fidelity.
