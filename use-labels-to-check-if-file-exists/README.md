# Use Labels to Check if File Exists

Although flows run sequentially by default, transferring the running point is essential for many automation scenarios. Labels act like anchors and allow users to jump to them from anywhere in the flow.

## What Use Labels to Check if File Exists can do

- Input Dialog — message `Please populate a file name to check if it exists in your desktop folder.`, default `FileName`, single-line → `vU…
- Conditional (`Core.Programming.Function`, `outputs: 2`) — branch when `vButtonPressed == "OK"`; otherwise `Core.Flow.Stop`.
- Resolve Desktop path — `vDesktopFolderPath = global.get('$Home$') + '/Desktop'`.
- Path Exists (`Core.FileSystem.PathExists`) on `%vDesktopFolderPath%/%vUserInput%` → `vExists`.
- Conditional on `vExists` — port 0 (true): `Core.Flow.GoTo` label `File_Exists`. Port 1 (false): `Core.Flow.GoTo` label `File_Does_Not_Exi…

## Behind the scenes

- This is functionally identical to `use-conditionals-to-check-if-file-exists`; the PA flow teaches **label + GOTO** as an alternative to `IF/ELSE`. Keep the label nodes prominent — they are the teaching point, not incidental.
- `EXIT Code: 0` in PA maps to `Core.Flow.Stop` in Robomotion; there is no exit-code primitive.
- Because `GoTo` is terminal, the Designer layout is two parallel label-rooted chains; the main chain up to the GoTo is one sub-graph, and each label + Show Message + Stop is its own disconnected chain that the GoTo jumps into.
