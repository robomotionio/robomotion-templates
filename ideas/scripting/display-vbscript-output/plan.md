# Display VBScript Output

**Level:** Intermediate

## Description
Microsoft VBScript is a general-purpose, active scripting language designed for various environments. Robomotion users can run VBScript scripts through their flows and unlock unlimited automation capabilities.

## Objective
Run a VBScript that queries a piece of system information (computer name + OS version via WMI) and bring the result back into the flow.

## Prerequisites
- Windows with `cscript.exe` available
- Robomotion Scripting / Shell package

## Steps
1. **Run VBScript** — inline:
   ```vbscript
   Set objWMI = GetObject("winmgmts:\\.\root\cimv2")
   Set colOS  = objWMI.ExecQuery("Select Caption, Version, CSName from Win32_OperatingSystem")
   For Each os In colOS
       WScript.Echo os.CSName & "|" & os.Caption & "|" & os.Version
   Next
   ```
2. Capture stdout → `vRaw`.
3. **Split Text** on `|` → `[vHost, vCaption, vVersion]`.
4. **Log Message** — `Host={vHost} OS={vCaption} Ver={vVersion}`.

## Expected Outcome
The log shows accurate host name, OS caption, and OS version pulled straight from WMI.

## Variables
| Name | Scope | Purpose |
|------|-------|---------|
| `vRaw` | Message | Script stdout |
| `vHost` / `vCaption` / `vVersion` | Message | Parsed fields |

## Notes
- VBScript is legacy tech (deprecated in Windows 11 24H2); include this tutorial mainly because many enterprise environments still rely on it for administrative scripts.
- Prefer PowerShell for new work — note this explicitly.
