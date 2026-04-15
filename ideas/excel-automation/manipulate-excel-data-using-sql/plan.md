# Manipulate Excel Data Using SQL

**Level:** Advanced

## Description
SQL queries can efficiently handle significant amounts of Excel data and reduce the need for complex data handling approaches. Robomotion allows you to access and update Excel spreadsheets using SQL queries.

## Objective
Treat an `.xlsx` file as a database and run `SELECT` / `UPDATE` / `INSERT` statements against it using an ODBC/ACE connection (or Robomotion's SQL-over-Excel node).

## Prerequisites
- Windows machine with the Microsoft ACE OLEDB driver installed (matching Office bitness)
- Sample workbook with a single well-formed table (e.g. `orders.xlsx` — sheet `Orders$`)
- Robomotion Database package

## Steps
1. **Database Connect** — connect using a connection string such as:
   `Provider=Microsoft.ACE.OLEDB.12.0;Data Source=orders.xlsx;Extended Properties="Excel 12.0 Xml;HDR=YES";`
   Store handle in `vDb`.
2. **Database Query** — run `SELECT CustomerId, SUM(Total) AS Total FROM [Orders$] GROUP BY CustomerId` into `vTopCustomers`.
3. **For Each** row in `vTopCustomers` — log customer totals.
4. **Database Execute** — run an `UPDATE [Orders$] SET Status = 'REVIEWED' WHERE Total > 10000`.
5. **Database Execute** — `INSERT INTO [Orders$] (Id, Customer, Total, Status) VALUES (?, ?, ?, ?)` with parameterized values.
6. **Database Disconnect**.
7. (Optional) Open the file with an Excel node to visually verify the changes.

## Expected Outcome
Aggregated totals are logged, existing rows are updated in place, and a new row is appended — all without opening Excel's UI.

## Variables
| Name | Scope | Purpose |
|------|-------|---------|
| `vDb` | Message | Database connection handle |
| `vTopCustomers` | Message | Query result set |

## Notes
- Call out the ACE driver bitness gotcha (32-bit vs 64-bit Robot must match the installed driver).
- Emphasize parameterized queries over string concatenation to avoid injection even in this "just Excel" context.
- This is the capstone of the Excel tutorial track — assumes the learner has done the earlier Beginner/Intermediate tutorials.
