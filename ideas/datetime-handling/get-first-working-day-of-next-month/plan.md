# Get First Working Day of the Next Month

**Level:** Intermediate

## Description
Performing calculations with dates is an essential part of many business processes, as most reports and invoices contain time-related data. Robomotion enables you to add various time units to date values and get precise results for further processing.

## Objective
Compute the first working day (Mon–Fri) of the month following today's date. Useful for scheduling invoice runs, report deliveries, or billing cycles.

## Prerequisites
- Robomotion DateTime package

## Steps
1. **Get Current Date** → `vNow`.
2. **Get Date Part** — extract `Year` and `Month` from `vNow`.
3. Compute next month/year:
   - If `Month == 12` → `NextMonth = 1`, `NextYear = Year + 1`.
   - Else → `NextMonth = Month + 1`, `NextYear = Year`.
4. **Build Date** — construct `vCandidate` as `NextYear-NextMonth-01 00:00:00`.
5. **While** `vCandidate.DayOfWeek` is Saturday or Sunday:
   - **Add To Date** — add 1 day to `vCandidate`.
6. **Format Date** — produce `vDisplay` as `dddd, d MMMM yyyy`.
7. **Log Message** — `First working day of next month: {vDisplay}`.

### Extension — holidays
Show how to load a CSV of bank holidays and extend the While condition to also skip those dates.

## Expected Outcome
`vCandidate` is a Monday-through-Friday date that falls on or after the 1st of the next calendar month.

## Variables
| Name | Scope | Purpose |
|------|-------|---------|
| `vNow` | Message | Today |
| `vCandidate` | Message | Cursor being advanced |
| `vDisplay` | Message | Formatted result |

## Notes
- Month arithmetic is a classic edge case — the December → January rollover is the one learners miss.
- Pair with a Cron trigger that runs on the last day of each month to publish "next cycle start" reminders.
