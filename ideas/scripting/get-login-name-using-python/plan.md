# Get Login Name Using Python

**Level:** Advanced

## Description
Besides the Python built-in functions, Robomotion enables users to extend scripting capabilities using external modules. External modules facilitate code reuse and prevent users from redeveloping the same functionality.

## Objective
Use Python (with a non-trivial external module — e.g. `psutil` or `getpass` + `pwd`) to identify the account under which the current robot process is running, plus the interactive desktop user, and feed both back into the flow.

## Prerequisites
- Python 3.9+ on PATH
- `psutil` installed in the robot's Python environment (`pip install psutil`)
- Robomotion Scripting / Code package

## Steps
1. **Run Python Script**:
   ```python
   import getpass, json, os, psutil, sys

   def interactive_user():
       # the user running explorer.exe on Windows, or the primary session on *nix
       for p in psutil.process_iter(["name", "username"]):
           if p.info["name"] in ("explorer.exe", "gnome-shell", "Finder"):
               return p.info["username"]
       return None

   print(json.dumps({
       "process_user":     getpass.getuser(),
       "effective_uid":    os.getuid() if hasattr(os, "getuid") else None,
       "interactive_user": interactive_user(),
       "hostname":         os.uname().nodename if hasattr(os, "uname") else os.environ.get("COMPUTERNAME"),
   }))
   ```
2. Capture stdout → `vRaw`.
3. **Parse JSON** → `vIdentity`.
4. **Log Message** — `Process={vIdentity.process_user} Interactive={vIdentity.interactive_user} Host={vIdentity.hostname}`.
5. (Optional) **If** `vIdentity.process_user != vIdentity.interactive_user` → warn about service-account context.

## Expected Outcome
The flow logs both the account running the script and the user physically logged into the desktop — different when the robot runs as a service.

## Variables
| Name | Scope | Purpose |
|------|-------|---------|
| `vRaw` | Message | Script stdout |
| `vIdentity` | Message | Parsed identity object |

## Notes
- The teaching point is **using an external module (`psutil`)** — call out that the robot's Python env needs the dependency installed.
- Pin versions in a `requirements.txt` and run `pip install -r` as part of robot setup.
- On Windows, `psutil.Process().username()` can return `NT AUTHORITY\SYSTEM` for service-run robots, which is the most common "why does this behave differently in prod?" bug.
