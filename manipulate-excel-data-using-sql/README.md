# Manipulate Excel Data Using SQL

SQL queries can efficiently handle significant amounts of Excel data and reduce the need for complex data handling approaches. Robomotion allows you to access and update Excel spreadsheets using SQL queries.

## What Manipulate Excel Data Using SQL can do

- Resolve Local AppData path — in a `Core.Programming.Function` compute `vSpecialFolderPath = global.get('$Home$') + '/AppData/Local'` (Win…
- Build workbook path — set `vExcel_File_Path = %vSpecialFolderPath%\Temp\PadExamples\Financial_Sample.xlsx`.
- Database Connect — connection string `Provider=Microsoft.ACE.OLEDB.12.0;Data Source=%vExcel_File_Path%;Extended Properties="Excel 12.0 Xm…
- Execute SQL — `SELECT * FROM [Sheet1$];`, timeout 30 → `vQueryResult`.
- Execute SQL — `SELECT [Country/Region] FROM [Sheet1$] WHERE [Country/Region] = 'United States of America';`, timeout 30 → `vQueryResult2`.

## Behind the scenes

- ACE OLEDB 12.0 is **32/64-bit sensitive**. The Robot process bitness must match the installed driver, otherwise `Connect` fails with `Provider cannot be found and properly installed.`
- The flow writes strings ( `'2408'`, `'24,080'` etc.) even for numeric columns — preserve this. The Excel ISAM driver treats most columns as text when `HDR=YES`, so literal strings match the column type.
- The two `SELECT` results are captured into variables but never consumed. Preserve these nodes — they are teaching beats, not dead code to prune.
- `INSERT INTO [Sheet1$]` appends a row **at the bottom of the used range**; it does not update existing rows.
