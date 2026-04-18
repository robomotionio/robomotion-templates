# Split PDF by Specified Page

Splitting PDF files into two uneven parts is a typical request, as they often contain two different types of information, such as an order summary and a receipt. Robomotion can automate these scenarios, allowing users to create flows that split PDF files at any possible point.

## What Split PDF by Specified Page can do

- Splits a PDF into two files at a user-specified page number. Ideal when you know exactly where a document should be divided.

## Behind the scenes

- Note the **gap in coverage**: if `vN + 1 > vCount` (user picks a page at or past the end) the PA flow silently produces nothing — no output, no error. Replicate this behaviour unless the user asks for validation.
- As in the by-half tutorial, the success dialog references `_1.pdf` / `_2.pdf` but the actual files are named `-1.pdf` / `-2.pdf`. Preserve the discrepancy.
