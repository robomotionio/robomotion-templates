# SQLite Quick Start

Demonstrates core SQLite operations — create a database, insert rows, batch-insert from a table, and run a SELECT query.

## How It Works

The flow runs four subflows in sequence: **Create DB** creates a new SQLite file, **Insert Row** adds a single record, **Insert Table** batch-inserts multiple rows, and **Select** queries the data back. All operations target a local `.db` file at the path you configure.

## Configuration

Open the **Config** node and update the `home` variable to the directory where the database file should be created:

```js
var home = "/home/user/databases/";
```

The flow automatically builds `msg.dbFile` and `msg.dbConnStr` from this path.

## Prerequisites

- Install the **Robomotion.SQLite** package from the package manager in Flow Designer
