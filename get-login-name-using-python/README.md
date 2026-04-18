# Get Login Name Using Python

Besides the Python built-in functions, Robomotion enables users to extend scripting capabilities using external modules. External modules facilitate code reuse and prevent users from redeveloping the same functionality.

## What Get Login Name Using Python can do

- Run Python — body:
- Show Message (`Core.Dialog.MessageBox`, icon `None`) titled `Python script result` with body `Machine login name: %vPythonScriptOutput%` …

## Behind the scenes

- Same Python 2/3 note as `display-python-output`: `print user` is Python 2 statement syntax. On Python 3 this must be `print(user)`. The `C:\Python27\Lib` path in the original flow confirms the PA design targets Python 2.
- `ModuleFolderPaths` prepends paths to `sys.path`. Robomotion runners typically don't expose an equivalent — if the flow needs extra libs, either vend them next to the script or manipulate `sys.path` inside the script itself.
- `getpass.getuser()` returns `USERNAME`/`USER` env var on Windows/Unix respectively; useful but not guaranteed to match the truly interactive user on shared-session hosts.
