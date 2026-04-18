# Display JavaScript Output

JavaScript is a web programming language used both on the client-side and server-side. Flows allow users to implement custom web automation behavior and handle web components through JavaScript code.

## What Display JavaScript Output can do

- Run JavaScript — body:
- Show Message (`Core.Dialog.MessageBox`, icon `None`) titled `Output from JavaScript:` with body `vJavascriptOutput` → `vButtonPressed`.

## Behind the scenes

- `WScript.Echo(...)` is the JScript idiom — it writes to the Windows Script Host's stdout. A Node.js-based runner would use `console.log(...)` instead.
- The script returns nothing; the dialog shows whatever the runner captures as stdout. Preserve this model (stdout-based, not return-value-based).
