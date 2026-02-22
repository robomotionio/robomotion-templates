# Merge CSV

Combines all `.csv` files from a directory into a single CSV file.

## How It Works

The flow scans the input directory for CSV files, reads each one using a **Read CSV Files** subflow, merges them into a single table via a **Merge CSV** subflow, and writes the combined result to the output path with your chosen delimiter.

## Configuration

Open the **Config** node and set:

| Variable | Description | Example |
|---|---|---|
| `msg.in_dir` | Directory containing the CSV files | `"/home/user/csv-files/"` |
| `msg.csv_path` | Output path for the merged file | `"/home/user/merged.csv"` |
| `msg.separator` | Delimiter (`,`, `;`, `TAB`, `SPACE`) | `";"` |
