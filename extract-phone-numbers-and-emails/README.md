# Extract Phone Numbers and Emails

Extracting specific data from documents can be challenging, as the targeted information may appear multiple times and in different formats throughout the text. Robomotion enables users to easily extract various text entities in natural language, such as emails, phone numbers, dates, currencies and measurement units.

## What Extract Phone Numbers and Emails can do

- Input Form Dialog titled `Recognize & extract all phone numbers and emails from text` with one multi-line text field labelled `Please pro…
- Conditional (`Core.Programming.Function`, `outputs: 2`) — branch when `vButtonPressed != "Cancel"`; otherwise `Core.Flow.Stop`.
- Recognize Entities (phone) — input `vCustomFormData['Text input']`, mode `PhoneNumber`, language `English` → `vRecognizedPhoneNumbers` (D…
- Recognize Entities (email) — same input, mode `Email`, language `English` → `vRecognizedEmails`.
- Pluck `Value` column (`Variables.RetrieveDataTableColumnIntoList`) from each DataTable → `vRecognizedPhoneNumbersList`, `vRecognizedEmail…

## Behind the scenes

- Preserve the typo `succesfully` in the second dialog's title — it's in the source and matches user expectations if they re-open the PA flow.
- `Text.RecognizeEntitiesInText` uses Microsoft's Recognizers-Text library, which handles many phone/email formats out of the box. A plain regex replacement will miss international formats and false-positive on URLs — document the trade-off.
- The result DataTables have columns `Value` (normalised) and `OriginalValue` (raw match); the PA flow plucks `Value`. Preserve that choice.
