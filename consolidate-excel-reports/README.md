# Consolidate Excel Reports

Large-scale reporting is a typical process across many businesses and organizations. Robomotion makes gathering data and creating reports a fast and fully automated task.

## What Consolidate Excel Reports can do

- Combines rows from multiple Excel workbooks in a folder into one consolidated sheet. A reporting helper that removes repetitive copy-paste work.

## Behind the scenes

- The PA flow uses a **numeric** `FOR LoopIndex FROM 0 TO List.Count - 1` (not ForEach) because `ReadWriteExcelData` looks up `List[LoopIndex]`. In Robomotion either keep a counter in a Function node or use ForEach that emits `item` and pass the item (not the index) into the subflow.
- `Excel.WriteToExcel.WriteCell` with a 2-D range value pastes the whole block starting at the target cell — preserve this semantic; don't substitute with per-cell loops.
- The retry decorator on `SendEmail` (`REPEAT 1 TIMES WAIT 5`) is important — email sends flake on first try if Outlook hasn't finished initialising.
- `Outlook.Close` is intentionally **not** called in the PA flow — the Outlook instance is left open so the user can inspect the Sent folder.
