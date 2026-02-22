# Duplicate File Remover

Finds and deletes duplicate files in a directory by comparing file content, not file names.

## How It Works

The flow lists all files in the target directory, computes a SHA-256 hash for each one, and keeps track of hashes already seen. If a file's hash matches a previous one, it's a duplicate and gets deleted. Only the top-level directory is scanned — subdirectories are not included.

## Configuration

Open the **Config** node and set:

| Variable | Description | Example |
|---|---|---|
| `msg.dir` | Directory to scan for duplicates | `"/home/user/Downloads/"` |

## Prerequisites

- Install the **Robomotion.Cryptography** package from the package manager in Flow Designer
