# Manipulate Excel Data Using SQL

SQL queries can efficiently handle significant amounts of Excel data and reduce the need for complex data handling approaches. Robomotion allows you to access and update Excel spreadsheets using SQL queries.

## What Manipulate Excel Data Using SQL can do

- `Download Fixtures` subflow then `Build Paths` (`Core.Programming.Function`) sets `msg.excel_path = <fixtures>/sales.csv` and `msg.output_csv_path = <fixtures>/sales_filtered.csv`.
- `Core.CSV.ReadCSV` loads the sales CSV with `optHeaders: true` and `optSeparator: 'comma'` into `msg.full_table`.
- `Filter Country USA` (`Core.Programming.Function`) — SELECT-equivalent that stores rows where `r.Country === 'USA'` into `msg.usa_rows`.
- `Insert New Sale` (`Core.Programming.Function`) — INSERT-equivalent that pushes `{ Country: 'Greece', Product: 'Paseo', Units: '2408' }` onto `msg.full_table.rows`.
- `Update Carretera Units` (`Core.Programming.Function`) — UPDATE-equivalent that rewrites any row with `Product === 'Carretera'` to `Units: '1000'`.
- `Core.CSV.WriteCSV` persists `msg.full_table` back to `msg.output_csv_path`, then `Core.Dialog.MessageBox` titled `Flow run completed ` reports counts and the output path via `msg.dialog_text`.

## Behind the scenes

- The flow writes numeric columns as strings (`'2408'`, `'1000'`) because `Core.CSV.ReadCSV` with headers returns string cells — keeping the same type avoids a schema mismatch when `Core.CSV.WriteCSV` serialises the table.
- `msg.usa_rows` is captured but not written to disk; it remains as a teaching beat for the SELECT step and is still available for downstream nodes.
- The INSERT step appends to the end of `msg.full_table.rows`, mirroring how a SQL `INSERT INTO` against an Excel range would land at the bottom of the used range.
- Using in-memory table manipulation (rather than an ODBC driver) keeps the flow portable across OSes and removes the 32/64-bit driver mismatch that plagues ACE OLEDB setups.
