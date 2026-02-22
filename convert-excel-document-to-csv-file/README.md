# Convert Excel to CSV

Converts an Excel file (.xls/.xlsx) into a CSV file with a configurable delimiter.

## How It Works

The flow reads data from your Excel file using a **Read Excel** subflow, optionally targeting a specific sheet, then writes it out as CSV using a **Write CSV** subflow with the separator you choose.

## Configuration

Open the **Config** node and set:

| Variable | Description | Example |
|---|---|---|
| `msg.excel_path` | Path to the input Excel file | `"/home/user/data.xlsx"` |
| `msg.csv_path` | Path for the output CSV file | `"/home/user/data.csv"` |
| `msg.separator` | Delimiter character (`,` or `;`) | `";"` |
| `msg.sheet_name` | Sheet name to convert (empty = default sheet) | `""` |
