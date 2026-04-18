# Extract Text from Word Document

Scripting enables Robomotion users to develop more efficient procedures and create less complex flows. For example, they can extract the multi-page content of Word documents using VBScript code instead of manually launching the application and interacting with its interface.

## What Extract Text from Word Document can do

- `Core.Flow.SubFlow` downloads fixtures; a Function builds `msg.sample_docx` (`.../fixtures/sample.docx`).
- Input Dialog titled `Extract text from Word document`, message `Select the Word document to extract text from:`, default `msg.sample_docx` → `msg.word_doc_path`.
- Validate (`Core.Programming.Function`, `outputs: 2`) — reject paths that do not end in `.doc`/`.docx`; on success derive `msg.script_path` as `<doc dir>\_extract.vbs`.
- Build script (`Core.Programming.Function`) injects the escaped `msg.word_doc_path` into a VBScript template that opens the document with `Word.Application`, iterates `WordDoc.Sentences`, and `WScript.Echo`es each sentence → `msg.vbs_body`.
- `Core.FileSystem.WriteFile` (`optMode: 'truncate'`) writes the script to `msg.script_path`; a Function sets `msg.vbs_args = ['//Nologo', msg.script_path]`.
- `Core.Process.StartProcess` runs `cscript` with `msg.vbs_args` in the foreground → `msg.vbs_output`; `Core.FileSystem.Delete` removes the temp script.
- Function trims leading/trailing whitespace into `msg.trimmed_text`; `Core.Dialog.MessageBox` titled `Extracted text:` (type `info`) displays it, then `Core.Flow.Stop`.

## Behind the scenes

- `WordDoc.Sentences.Count` returns a sentence count, not a word count — the script walks `Sentences(i)` so each echoed line is a full sentence. The variable is named accordingly in the VBScript body.
- The script calls `WordDoc.Close False` and `Word.Quit`, explicitly discarding any incidental edits so Word does not raise a "save changes?" prompt on the next headless run.
- Quoting is the riskiest part of the bridge: the build step backslash-escapes and double-quotes the path before interpolation, which is safe for well-formed Windows paths but is not a general-purpose sanitiser — treat `msg.word_doc_path` as trusted input.
- The VBScript file is written next to the source document (rather than a system temp) so the user never has to grant write access to an unfamiliar location, and it is deleted after execution with `continueOnError: true` so a transient antivirus lock does not abort the flow.
- `cscript //Nologo` suppresses the banner so the captured stdout is only the script's `WScript.Echo` output; the trim node then strips the trailing CRLF that `cscript` always appends.
