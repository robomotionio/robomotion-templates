# Display JavaScript Output

JavaScript is a web programming language used both on the client-side and server-side. Flows allow users to implement custom web automation behavior and handle web components through JavaScript code.

## What Display JavaScript Output can do

- Run Node script (`Core.Process.StartProcess`) — runs `node` with `-e 'var variableName = "Hello World!"; console.log(variableName);'`, captures stdout into `msg.javascript_output`.
- Trim output (`Core.Programming.Function`) — strips trailing CR/LF from `msg.javascript_output`.
- Message Dialog (`Core.Dialog.MessageBox`, `optType: info`) titled `Output from JavaScript:` shows `msg.javascript_output`, then `Core.Flow.Stop`.

## Behind the scenes

- `console.log` writes to the Node.js process stdout, which `Core.Process.StartProcess` captures into `msg.javascript_output` — the dialog shows stdout, not a return value.
- The inline snippet intentionally avoids any Node-specific APIs so it runs anywhere a `node` binary is on PATH.
