# Get Current Time

**Level:** Beginner

## Description
Creating and handling datetime values are vital for time-related operations, such as generating logs. Robomotion provides various nodes to create, convert and manipulate datetime values.

## Objective
Capture the current date/time in several representations (local, UTC, epoch seconds) and demonstrate how to use them as log prefixes and filename stamps.

## Prerequisites
- Robomotion DateTime package

## Steps
1. **Get Current Date** — local → `vLocal`.
2. **Convert Timezone** — convert `vLocal` to UTC → `vUtc`.
3. **Date To Timestamp** — epoch seconds → `vEpoch`.
4. **Format Date** — produce `vStamp` as `yyyyMMdd_HHmmss`.
5. **Log Message** — `[{vLocal}] Flow started`.
6. **Write To File** — create `./logs/run-{vStamp}.log` with the three representations printed inside.

## Expected Outcome
A timestamped log file appears in `./logs/` and the run's local/UTC/epoch representations are visible in the console.

## Variables
| Name | Scope | Purpose |
|------|-------|---------|
| `vLocal` / `vUtc` | Message | Datetime values |
| `vEpoch` | Message | Seconds since 1970 |
| `vStamp` | Message | Filename-safe timestamp |

## Notes
Call out that robots running in different regions/timezones will see different `vLocal` values — teach UTC as the safe default for inter-machine coordination.
