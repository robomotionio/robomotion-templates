# Days of Your Life

**Level:** Intermediate

## Description
Handling datetime values can be challenging, as time-related data require absolute accuracy. Robomotion allows you to perform reliable calculations with datetime values and display results in various units.

## Objective
Given a user's birthday, compute how long they've been alive in years, months, weeks, days, hours, minutes, and seconds, and display all units in one report.

## Prerequisites
- Robomotion DateTime package
- A birthday input (Flow variable `vBirthday`, e.g. `1995-06-12`)

## Steps
1. Set `vBirthday` as a Flow variable.
2. **Parse Date** — convert `vBirthday` string to datetime `vStart`.
3. **Get Current Date** → `vNow`.
4. **Subtract Dates** — compute `vSpan` (duration from `vStart` to `vNow`).
5. From `vSpan`, derive:
   - `vYears` — whole years via a dedicated "years between" node or via `vSpan.TotalDays / 365.2425` rounded down.
   - `vMonths` — whole months across the full span.
   - `vWeeks` = `floor(TotalDays / 7)`.
   - `vDays` = `floor(TotalDays)`.
   - `vHours` = `floor(TotalHours)`.
   - `vMinutes` = `floor(TotalMinutes)`.
   - `vSeconds` = `floor(TotalSeconds)`.
6. **Log Message** — format and print each unit on its own line.
7. (Optional) **Message Box** — show the result to the user in a friendly popup.

## Expected Outcome
The console (and optional message box) shows the seven unit values consistent with the given birthday and today's date.

## Variables
| Name | Scope | Purpose |
|------|-------|---------|
| `vBirthday` | Flow | Input birthday |
| `vStart` / `vNow` / `vSpan` | Message | Datetime pipeline |
| `vYears` … `vSeconds` | Message | Derived unit values |

## Notes
- Precision trap: `TotalDays / 365.25` gives approximate years; use a real calendar-aware calculation when exact birthdays matter (e.g. leap-day births).
- Good place to introduce TimeSpan vs DateTime distinction.
