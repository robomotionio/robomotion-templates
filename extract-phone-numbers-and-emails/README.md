# Extract Phone Numbers and Emails

Extracting specific data from documents can be challenging, as the targeted information may appear multiple times and in different formats throughout the text. Robomotion enables users to easily extract various text entities in natural language, such as emails, phone numbers, dates, currencies and measurement units.

## What Extract Phone Numbers and Emails can do

- Input Dialog (`Core.Dialog.InputBox`) titled `Recognize & extract all phone numbers and emails from text`, message `Please provide a text:`, default sample with an inline email and phone → `msg.input_text`.
- Branch on cancel (`Core.Programming.Function`, `outputs: 2`) — empty/cancelled input short-circuits to `Core.Flow.Stop`; otherwise continues.
- Extract entities (`Core.Programming.Function`) — runs an email regex and a phone regex against `msg.input_text`, writing matches (or a `No ... found` placeholder) to `msg.recognized_emails` and `msg.recognized_phone_numbers`.
- Build results text (`Core.Programming.Function`) — joins the two arrays into a single `msg.dialog_text` string.
- Message Dialog (`Core.Dialog.MessageBox`, `optType: info`) titled `Flow ran succesfully...` displays `msg.dialog_text`, then `Core.Flow.Stop`.

## Behind the scenes

- Preserve the typo `succesfully` in the final dialog's title — it matches the original source.
- Regex-based extraction is lightweight but will miss some international phone formats and can false-positive on URL-like strings; swap in a dedicated entity recognizer if that trade-off matters.
- When no matches are found, the Function node substitutes a human-readable placeholder string so the results dialog is never blank.
