# Extract Text from Word Document

Scripting enables Robomotion users to develop more efficient procedures and create less complex flows. For example, they can extract the multi-page content of Word documents using VBScript code instead of manually launching the application and interacting with its interface.

## What Extract Text from Word Document can do

- Custom Form Dialog with header *"This flow extracts text from Word documents."*, one required file input labelled `Select the Word docume…
- Conditional (`Core.Programming.Function`, `outputs: 2`) — branch when `vButtonPressed != "Cancel"`; otherwise `Core.Flow.Stop`.
- Run VBScript — body (`%vCustomFormData['WordDocPath']%` is interpolated):
- Trim (both ends) `vVBScriptOutput` → `vTrimmedText`.
- Show Message (`Core.Dialog.MessageBox`, icon `None`) titled `Extracted text:` with body `vTrimmedText` → `vButtonPressed2`.

## Behind the scenes

- The variable name `NumberOfWords` is misleading — it holds the **sentence** count, not the word count. Preserve the PA name for fidelity but note the misnomer.
- The script calls `WordDoc.Save` even though it only reads. This may trigger Word's "do you want to save changes?" prompt on macro-flagged files; consider switching to `WordDoc.Close False` for robot-safe operation.
- Interpolating `vCustomFormData['WordDocPath']` directly into the VBScript source is vulnerable to quote-injection attacks — preserve for fidelity, note the risk.
