# JSON Minifier

Compacts a JSON object into a single-line string with no whitespace and outputs it to the Debug panel.

## How It Works

The flow takes the JSON object you provide, stringifies it with `JSON.stringify()` (no indentation), and sends the minified result to the Output Panel via a Debug node. If the JSON is invalid, an error dialog is shown instead.

## Configuration

Open the **Config** node and set:

| Variable | Description | Example |
|---|---|---|
| `msg.json` | JSON object to minify | `{ "name": "test", "value": 42 }` |
