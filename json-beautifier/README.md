# JSON Beautifier

JSON Beautifier takes a compact or messy JSON string and reformats it into a clean, indented version saved to a file. Powered by Robomotion's programming nodes, it handles parsing, formatting, and file output in one automated step.

Whether you are preparing configuration files, formatting API responses for documentation, or just need readable JSON, this template does the work instantly and catches invalid input with a clear error message.

## What JSON Beautifier can do

- Parse any valid JSON string
- Reformat the JSON with configurable indentation
- Save the beautified output to a file on disk
- Detect and report invalid JSON with an error dialog

## Behind the scenes

The flow takes the JSON string you provide in the config, parses it to validate the structure, and re-serializes it with the indentation string you choose. The formatted output is written to the file path you specify. If the input JSON is malformed, the flow catches the parse error and displays a dialog explaining the issue instead of failing silently.

## Configuration

Open the **Config** node and set:

| Variable | Description | Example |
|---|---|---|
| `msg.json` | JSON string to beautify | `'{"name":"test","age":25}'` |
| `msg.export_to` | Output file path | `"/home/user/out.json"` |
| `msg.indent` | Indentation string | `"  "` (2 spaces) |
