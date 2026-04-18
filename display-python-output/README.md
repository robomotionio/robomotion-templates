# Display Python Output

Python is a high-level programming language known for its scripting capabilities. Robomotion enables users to run Python scripts and automate complex scenarios that require a custom approach.

## What Display Python Output can do

- Run Python — body:
- Show Message (`Core.Dialog.MessageBox`, icon `None`) titled `Output from Python script:` with body `vPythonScriptOutput` → `vButtonPressed`.

## Behind the scenes

- **Python version gotcha**: `print variableName` (statement form) is Python 2. PA's `Scripting.RunPythonScript` shipped bundled Python 2 historically. Modern Robomotion Python runners target Python 3, where the same line must be `print(variableName)`. When porting, update the script to the parenthesised form and document the syntax change, or point the runner explicitly at a Python 2 interpreter for fidelity.
