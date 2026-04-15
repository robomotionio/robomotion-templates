# Delete Files of Specific Size Range

**Level:** Intermediate

## Description
Managing considerable amounts of files can be inefficient when performed by manual labor. Robomotion enables you to filter and handle files and manage your machine's storage automatically.

## Objective
Scan a folder and delete files whose size falls within a configurable range (e.g. between 10 MB and 500 MB), logging everything for auditability.

## Prerequisites
- Target folder (`./downloads/`) populated with files of varied sizes
- Robomotion Files package
- A "dry run" mode toggle so learners can inspect matches before enabling deletion

## Steps
1. Define Flow variables: `vMinBytes`, `vMaxBytes`, `vDryRun` (boolean).
2. **List Files in Folder** — recursive = `true` → `vFiles`.
3. Initialize `vMatches = []` (Flow).
4. **For Each** file in `vFiles`:
   1. **Get File Info** → `vInfo`.
   2. **If** `vInfo.size >= vMinBytes && vInfo.size <= vMaxBytes`:
      - Append `{path, size}` to `vMatches`.
5. **Log Message** — print `vMatches` (JSON).
6. **If** `vDryRun == false`:
   - **For Each** match → **Delete File**.
7. **Write To File** — append `vMatches` to `./logs/deleted.log` with a timestamp header (keeps an audit trail regardless of dry-run state).

## Expected Outcome
With `vDryRun = true`, only a log is produced. With `vDryRun = false`, matching files are deleted and the audit log is still written.

## Variables
| Name | Scope | Purpose |
|------|-------|---------|
| `vMinBytes` / `vMaxBytes` | Flow | Size window |
| `vDryRun` | Flow | Safety toggle |
| `vFiles` | Message | Full scan |
| `vMatches` | Flow | Qualified deletions |
| `vInfo` | Message | Per-file metadata |

## Notes
- Emphasize the dry-run pattern — learners shouldn't run destructive flows blind.
- Good place to introduce **If** conditions with compound boolean logic.
