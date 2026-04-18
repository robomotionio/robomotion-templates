# Display Python Output

Python is a high-level programming language known for its scripting capabilities. Robomotion enables users to run Python scripts and automate complex scenarios that require a custom approach.

## What Display Python Output can do

- Run Python script (`Core.Process.StartProcess`) — runs `python` with `-c 'variableName = "Hello World!"\nprint(variableName)'`, captures stdout into `msg.python_output`.
- Trim output (`Core.Programming.Function`) — strips trailing CR/LF from `msg.python_output`.
- Message Dialog (`Core.Dialog.MessageBox`, `optType: info`) titled `Output from Python script:` shows `msg.python_output`, then `Core.Flow.Stop`.

## Behind the scenes

- The inline script uses the Python 3 `print(variableName)` call syntax, matching the `python` interpreter most systems ship today. If you need Python 2 fidelity, point `inFilePath` at a Python 2 binary and change the call back to the `print` statement form.
- Trimming trailing newlines before the dialog keeps the message box compact — `print` always appends a `\n` on stdout.
