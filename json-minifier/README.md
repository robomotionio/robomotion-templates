# JSON Minifier

JSON Minifier compacts a JSON object into a single line string with no extra whitespace. Powered by Robomotion's programming nodes, it strips all formatting and outputs the minified result to the Debug panel for quick inspection.

This template is useful when you need to prepare compact JSON payloads for API requests, reduce file sizes, or generate single line configuration values.

## What JSON Minifier can do

- Accept any valid JSON object as input
- Strip all whitespace and indentation to produce a single line string
- Output the minified result to the Debug panel
- Detect and report invalid JSON with an error dialog

## Behind the scenes

The flow takes the JSON object from your config, stringifies it with `JSON.stringify()` using no indentation, and sends the minified string to the Output Panel via a Debug node. If the input is not valid JSON, the flow catches the error and displays a dialog explaining what went wrong.

## Configuration

Open the **Config** node and set:

| Variable | Description | Example |
|---|---|---|
| `msg.json` | JSON object to minify | `{ "name": "test", "value": 42 }` |
