# JSON Beautifier

Pretty-prints a JSON string with indentation and saves the result to a file.

## How It Works

The flow parses the JSON string you provide, re-formats it with your chosen indentation, and writes the beautified output to a file. If the JSON is invalid, an error dialog is shown instead.

## Configuration

Open the **Config** node and set:

| Variable | Description | Example |
|---|---|---|
| `msg.json` | JSON string to beautify | `'{"name":"test","age":25}'` |
| `msg.export_to` | Output file path | `"/home/user/out.json"` |
| `msg.indent` | Indentation string | `"  "` (2 spaces) |
