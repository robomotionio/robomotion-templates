# Convert Text to Datetime

**Level:** Beginner

## Description
Although flows can extract data from documents, the retrieved values are usually stored as text. If a text represents a date or time value, Robomotion enables users to convert it to a datetime variable and use this variable for further date and time calculations.

## Objective
Parse a date string in a known format into a real datetime variable and perform one arithmetic operation on it (e.g. add 7 days) to prove the conversion worked.

## Prerequisites
- Robomotion DateTime package

## Steps
1. Declare `vText = "15/04/2026 13:05"` (Flow).
2. **Parse Date** — input `vText`, format `dd/MM/yyyy HH:mm` → `vDate`.
3. **Add To Date** — add 7 days → `vPlus7`.
4. **Format Date** → `vDisplay` in ISO format.
5. **Log Message** — print `vDisplay` (should be `2026-04-22T13:05:00Z`).

### Variant — ambiguous inputs
Show how `03/04/2026` is ambiguous and how supplying the wrong format pattern produces silently wrong results. Contrast `dd/MM/yyyy` vs `MM/dd/yyyy` parsing.

## Expected Outcome
A real datetime variable is produced, arithmetic on it works, and the learner understands why format strings matter.

## Variables
| Name | Scope | Purpose |
|------|-------|---------|
| `vText` | Flow | Source string |
| `vDate` | Message | Parsed datetime |
| `vPlus7` | Message | +7-day result |

## Notes
Pair this with the "Convert Datetime to Text" tutorial — together they form the round-trip story.
