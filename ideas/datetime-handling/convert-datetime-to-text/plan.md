# Convert Datetime to Text

**Level:** Beginner

## Description
Handling datetime data can be challenging, as numerous formats have been adopted across the globe. Robomotion enables the conversion of datetime variables to predefined and custom formats so that flows can handle data independently of the originating region.

## Objective
Take a datetime variable and produce multiple text representations: ISO 8601, US locale, EU locale, and a custom fully-qualified format.

## Prerequisites
- Robomotion DateTime package

## Steps
1. **Get Current Date** → `vNow` (datetime value).
2. **Format Date** (ISO) → `vIso` = `2026-04-15T13:05:22Z`. Format string: `yyyy-MM-ddTHH:mm:ssZ`.
3. **Format Date** (US) → `vUs` = `04/15/2026 01:05 PM`. Format string: `MM/dd/yyyy hh:mm tt`.
4. **Format Date** (EU) → `vEu` = `15/04/2026 13:05`. Format string: `dd/MM/yyyy HH:mm`.
5. **Format Date** (custom) → `vLong` = `Wednesday, 15 April 2026`. Format string: `dddd, d MMMM yyyy`.
6. **Log Message** — print all four for side-by-side comparison.

## Expected Outcome
Four distinct string variables, each representing the same moment in time in a different locale/format.

## Variables
| Name | Scope | Purpose |
|------|-------|---------|
| `vNow` | Message | Source datetime |
| `vIso` / `vUs` / `vEu` / `vLong` | Message | Formatted strings |

## Notes
Introduce tokens (`yyyy`, `MM`, `dd`, `HH`, `tt`) explicitly — this is the foundation every later DateTime tutorial will lean on.
