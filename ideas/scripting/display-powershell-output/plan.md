# Display PowerShell Script Output

**Level:** Intermediate

## Description
PowerShell is a cross-platform shell and scripting language that allows users to interact with the operating system. Flows support the implementation of PowerShell scripts to retrieve system information and automate administrative operations.

## Objective
Run a PowerShell script from a flow, capture stdout + stderr, and parse the structured output into a Robomotion variable for downstream logic.

## Prerequisites
- Windows machine (or PowerShell Core on other platforms)
- Robomotion Scripting / Shell package

## Steps
1. **Run PowerShell Script** — inline script:
   ```powershell
   $disk = Get-PSDrive -PSProvider FileSystem | Select-Object Name, @{n='FreeGB';e={[math]::Round($_.Free/1GB,1)}}
   $disk | ConvertTo-Json -Compress
   ```
2. Capture `stdout` into `vRaw`.
3. **Parse JSON** — `vRaw` → `vDrives`.
4. **For Each** drive → **Log Message** `"{Name}: {FreeGB} GB free"`.
5. **If** stderr is non-empty → **Throw Error** with the stderr content.

### Error handling
- Non-zero exit code: capture and rethrow.
- PowerShell execution policy: run with `-ExecutionPolicy Bypass -NoProfile` to avoid corp-policy blocks.

## Expected Outcome
The console lists every logical drive with free space in GB, parsed from PowerShell's JSON output.

## Variables
| Name | Scope | Purpose |
|------|-------|---------|
| `vRaw` | Message | Raw stdout |
| `vDrives` | Message | Parsed drive list |

## Notes
- Teach `ConvertTo-Json` as the canonical way to hand PowerShell output back to a flow — it eliminates text-parsing bugs.
- Cross-platform note: PowerShell Core (`pwsh`) works on Linux/macOS too; pick the right binary.
