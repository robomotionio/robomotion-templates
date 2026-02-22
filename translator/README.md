# Translator

Translates text between languages using Google Translate via headless browser automation — no API key needed.

## How It Works

The flow takes text either directly from the config or from a file on disk. It opens a headless Chrome browser, navigates to Google Translate with the configured source and target languages, waits for the translated text to appear, and extracts it. The result is either shown in a dialog or saved to a file depending on whether `msg.export_to` is set.

## Configuration

Open the **Config** node and set:

| Variable | Description | Example |
|---|---|---|
| `msg.translate_from` | Source language (ISO 639-1 code or `auto`) | `"en"` |
| `msg.translate_to` | Target language (ISO 639-1 code) | `"tr"` |
| `msg.text` | Text to translate (use this **or** `import_from`) | `"Hello world"` |
| `msg.import_from` | Read text from this file instead | `"/home/user/input.txt"` |
| `msg.export_to` | Save translation to file (empty = show dialog) | `"/home/user/output.txt"` |
