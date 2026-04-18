# Share PowerPoint File as PDF

Handling Windows and desktop applications is an essential part of most automation scenarios. UI automation nodes and recording enable you to launch applications like Microsoft PowerPoint, navigate through their environment, and automate repetitive tasks on them.

## What Share PowerPoint File as PDF can do

- Opens a .pptx file, exports it to PDF, and saves it next to the original. Automates a common office pipeline end to end.

## Behind the scenes

- `ON ERROR REPEAT N TIMES WAIT S` is PA's in-line retry decorator. In Robomotion wire a `Core.Trigger.Catch` that counts attempts via a Flow variable and short-circuits after N retries with `Core.Programming.Sleep` of S seconds between tries.
- The last two steps are deliberately **disabled** in the PA flow so the user can inspect the PDF and the Outlook session before cleanup. Preserve that as "commented / disabled" rather than deleting them.
- The Save-As dialog's filename field gets the PDF path **without** the `.pdf` extension — PowerPoint appends it because the file-type selector is already `PDF`. Do not hard-code `.pdf` in the populated text.
