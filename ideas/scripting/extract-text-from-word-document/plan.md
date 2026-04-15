# Extract Text from Word Document Using VBScript

**Level:** Advanced

## Description
Scripting enables Robomotion users to develop more efficient procedures and create less complex flows. For example, they can extract the multi-page content of Word documents using VBScript code instead of manually launching the application and interacting with its interface.

## Objective
Extract the full plain-text content of a `.docx` via Word's COM automation and bring it back into the flow as a string variable for downstream text processing.

## Prerequisites
- Windows with Microsoft Word installed
- Robomotion Scripting + Files packages
- Input document `./docs/contract.docx`
- Output text file `./docs/contract.txt`

## Steps
1. **Run VBScript** — pass input and output paths via `WScript.Arguments`:
   ```vbscript
   Dim inPath, outPath
   inPath  = WScript.Arguments(0)
   outPath = WScript.Arguments(1)

   Dim word : Set word = CreateObject("Word.Application")
   word.Visible = False

   Dim doc : Set doc = word.Documents.Open(inPath, False, True) ' ReadOnly
   ' 2 = wdFormatText
   doc.SaveAs2 outPath, 2
   doc.Close False
   word.Quit
   Set doc  = Nothing
   Set word = Nothing
   ```
2. **Read File** — `outPath` → `vText`.
3. **Log Message** — `Extracted {vText.length} characters from Word document`.
4. (Downstream) pipe `vText` into a later text-manipulation flow (e.g. entity extraction).

## Expected Outcome
A UTF-8 `.txt` file containing the body text of the Word document, available to the flow as a string variable.

## Variables
| Name | Scope | Purpose |
|------|-------|---------|
| `vText` | Flow | Extracted body text |

## Notes
- `wdFormatText` strips formatting — if you need paragraph/table structure, use `wdFormatRTF` (6) or `wdFormatXMLDocument` (12) instead.
- Kill orphan `WINWORD.EXE` processes in a `Finally`-style cleanup block.
- Encoding: Word saves plain text in the system codepage by default — pass `Encoding:=65001` to get UTF-8 reliably.
