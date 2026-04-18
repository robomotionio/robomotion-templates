# Get Previous Working Date

Apart from performing simple calculations with dates, some scenarios may require more complex logic to get the desired results. Using datetime and conditional nodes, you can make calculations based on specific conditions, such as calculating the previous working day.

## What Get Previous Working Date can do

- Get Now (`Robomotion.DateTime.Now`, mode `DateAndTime`) → `vToday`.
- Split Date (`Robomotion.DateTime.Split`) on `vToday` → extract `vDay` = day-of-week name.
- Conditional Chain — implement the PA `IF / ELSE IF / ELSE` ladder with `Core.Programming.Function` nodes (each with `outputs: 2`). Branches:
- Split Date on `vBusinessDayBeforeToday` → extract `vDayNum` and `vYear`.
- Format (`Robomotion.DateTime.Format`, layout `MMMM`) on `vBusinessDayBeforeToday` → `vMonthName`.

## Behind the scenes

- The three `IF/ELSE IF/ELSE` branches in the PA flow are identical except for the day offset; collapse them into one Function node that returns the offset and a single `DateTime.Add` + one `MessageBox`, if preferred. Either design matches the observable behaviour.
- The PA flow pulls `.Day` and `.Year` directly off the datetime object; in Robomotion use `DateTime.Split` (or a Function node) to obtain the numeric components.
