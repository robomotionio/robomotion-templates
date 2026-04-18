# Use Subflows to Check if File Exists

Automating complex scenarios may lead to large flows with recurrent nodes. Subflows are reusable groups of nodes that split flows, making them more manageable and easier to maintain.

## What Use Subflows to Check if File Exists can do

- Input Dialog titled `Check if file exists`, message `Please populate a file name to check if it exists in your desktop folder.`, default `FileName` -> `msg.user_input`.
- Branch on cancel (`Core.Programming.Function`, `outputs: 2`) — empty input short-circuits to `Core.Flow.Stop`.
- Build path (`Core.Programming.Function`) — `msg.candidate_path = global.get('$Home$') + '\Desktop\' + msg.user_input`.
- `Core.FileSystem.PathExists` on `msg.candidate_path` -> `msg.exists`.
- Branch on existence (`Core.Programming.Function`, `outputs: 2`) — routes to `Core.Flow.SubFlow` `Call File_Exists` or `Call File_Does_Not_Exist`.

## Behind the scenes

- The teaching point is **subflow routing**: instead of an `IF/ELSE` with inline nodes, route to two differently-named subflows. Keep each subflow minimal — they show the difference from the label and IF-based versions of this tutorial.
- `msg.*` fields (`user_input`, `candidate_path`, `exists`) ride the message across the `Core.Flow.SubFlow` call, so the child flows can read them without any extra wiring.
