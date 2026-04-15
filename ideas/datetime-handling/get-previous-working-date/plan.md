# Get Previous Working Date

**Level:** Advanced

## Description
Apart from performing simple calculations with dates, some scenarios may require more complex logic to get the desired results. Using datetime and conditional nodes, you can make calculations based on specific conditions, such as calculating the previous working day.

## Objective
From any given reference date, compute the most recent prior working day, skipping weekends and a supplied holiday list. Package the logic as a reusable **Subflow** so other tutorials can call it.

## Prerequisites
- Robomotion DateTime package
- Holiday CSV (`./data/holidays.csv` — one ISO date per line)
- Robomotion Files package

## Steps
### Subflow: `PreviousWorkingDay(input: vRef) -> vPrev`
1. Initialize `vPrev = vRef`.
2. **Read CSV** — load `holidays.csv` → `vHolidays` (array of date strings).
3. Loop:
   - **Subtract From Date** — one day from `vPrev`.
   - If `vPrev.DayOfWeek` ∈ {Saturday, Sunday} → continue.
   - If `vPrev` (formatted `yyyy-MM-dd`) is in `vHolidays` → continue.
   - Else break.
4. Return `vPrev`.

### Main flow
1. **Get Current Date** → `vNow`.
2. **Invoke Subflow** `PreviousWorkingDay(vNow)` → `vPrev`.
3. **Format Date** → `vDisplay` as `dddd, d MMMM yyyy`.
4. **Log Message** — `Previous working day: {vDisplay}`.

### Test matrix
| Reference date | Expected prev working day (assume no holidays) |
|---|---|
| Tue → Mon | Mon |
| Mon → Fri | Fri |
| Sun → Fri | Fri |
| Day after a Monday holiday | Prior Friday |

## Expected Outcome
The subflow produces correct "previous working day" answers for weekdays, post-weekend Mondays, and post-holiday mornings. Unit-test style: feed fixed reference dates and assert the output.

## Variables
| Name | Scope | Purpose |
|------|-------|---------|
| `vRef` / `vPrev` | Message | Subflow input/output |
| `vHolidays` | Flow | Cached holiday list |

## Notes
- This tutorial's real teaching value is **Subflow composition**: isolate the date-math logic so downstream flows (invoicing, SLAs) can reuse it without copy-paste.
- Cache `vHolidays` at Flow scope so the CSV only gets read once per run.
