---
name: running-flow
description: Executes a Robomotion flow on a robot via `robomotion run <flow-dir>`, then follows the agent-mode JSONL logs emitted on the connected robot's stdout to drive a run → observe → fix loop. Use when the user says "run the flow", "start on robot X", "trigger this on the robot", "test on a robot", or "deploy and run". Falls back to the `robomotion-api-mcp` MCP tools when scripted control is needed.
allowed-tools: Read, Glob, Bash(bun:*), Bash(robomotion:*), Bash(robomotion-deskbot:*), Bash(tail:*), Bash(grep:*), mcp__sdk__validate_flow, mcp__api__*
argument-hint: [flow-path]
---

# /running-flow

Run a flow on a robot, watch the agent-mode event stream, react to failures. Three moving parts:

1. **Robot process** — `robomotion-deskbot connect` keeps the robot online. One long-lived process.
2. **Trigger** — `robomotion run <flow-dir>` builds locally, uploads, and submits a run.
3. **Observation** — the deskbot prints JSONL agent events to its stdout, bracketed by `{"event":"agent_mode","status":"start"}` and `{"event":"agent_mode","status":"end"}`. Tail those to drive the fix loop.

## Step 1 — Robot must be connected

The robot must be connected BEFORE `robomotion run` can schedule anything on it. Usually a long-lived session in a separate terminal:

```bash
robomotion-deskbot connect -i "$ROBOMOTION_USER_EMAIL" -w demo.robomotion.io -r Extremis
```

Flags: `-i` identity (email), `-w` workspace domain, `-r` robot name/id, `--token` to skip password prompt. See `robomotion-deskbot connect --help`.

No log-tee setup needed — `robomotion run` reads the session log file the deskbot writes to `~/.config/robomotion/agent/logs/sessions/<studio_id>.jsonl`.

## Step 2 — Trigger the run

```bash
export ROBOMOTION_API_KEY=<your-api-key>
export ROBOMOTION_USER_EMAIL=<your-email>

robomotion run <flow-dir>                          # interactive robot picker
robomotion run <flow-dir> --robot <robot-id>       # scripted
robomotion run                                     # defaults to main.ts in cwd
```

The CLI accepts either a flow directory (resolves to `main.ts` inside) or a `.ts` file. It:

1. Builds the flow (validates against pspec; fails fast on errors).
2. Picks a robot (or uses `--robot`).
3. `POST /v1/flows.agent.run` with a fresh `studio_id` (printed on success).

**Prereqs:** `ROBOMOTION_API_KEY` set; the target robot online (Step 1).

## Step 3 — Observe the agent event stream

`robomotion run` **follows** the stream by default — it tails a session log file the deskbot writes at:

```
~/.config/robomotion/agent/logs/sessions/<studio_id>.jsonl           (Linux/macOS)
%LOCALAPPDATA%\Robomotion\agent\logs\sessions\<studio_id>.jsonl      (Windows)
```

Events are compact one-line JSON, terminated by `agent_mode:end`. Example:

```
{"event":"agent_mode","status":"start"}
{"event":"flow_start","flow":"Imported Write To Clipboard","version":"local"}
{"event":"node_start","node":"Start"}
{"event":"node_end","node":"Start","duration_ms":21}
{"event":"node_start","node":"Get Clipboard Data"}
{"event":"node_end","node":"Get Clipboard Data","duration_ms":4780}
{"event":"flow_end","status":"success","duration_ms":8852}
{"event":"agent_mode","status":"end"}
```

Exit codes from `robomotion run`:

| Code | Meaning |
|-----:|---------|
| `0` | `flow_end status=success` |
| `1` | `flow_end status=error` or `flow_error` |
| `2` | Tail timeout (session still running) — raise `--timeout` or re-read the log file |
| `3` | Session submitted but log file never appeared — robot is remote, or an older api-service doesn't forward `studio_id`. Fall back to MCP `poll_logs`. |

Flags: `--no-follow` (fire-and-forget, no stream), `--log-wait <s>` (how long to wait for the file to appear, default 5), `--timeout <s>` (overall follow budget, default 300).

### Event reference

| Event | Fields | Meaning |
|-------|--------|---------|
| `agent_mode` | `status: "start" \| "end"` | Brackets the run. `end` is a safety-net terminal event. |
| `flow_start` | `flow`, `version` | Flow started. |
| `flow_end` | `status: "success" \| "error"`, `duration_ms`, `error?` | Flow finished — primary terminal event. |
| `flow_error` | `error`, `node?`, `node_id?`, `duration_ms` | Unhandled flow-level error. |
| `node_start` | `node` | Node entered. |
| `node_end` | `node`, `duration_ms` | Node completed. |
| `node_error` | `node`, `error`, `duration_ms` | Node threw — your signal to fix. |
| `log` | `node?`, `level`, `msg` | `Core.Flow.Log` output. |
| `debug` | `node`, `msg` | `Core.Programming.Debug` payload (truncated to 255 bytes per field). |
| `connected` | `msg` | Robot registered with the workspace. |
| `ready` | — | Robot ready to accept commands. |

### Re-reading after the run

`robomotion run` consumes the log while streaming. The file persists afterwards; re-read it with any JSONL tool:

```bash
jq . ~/.config/robomotion/agent/logs/sessions/<studio_id>.jsonl
```

## Step 4 — The run → observe → fix loop

Target autonomous iteration (bounded retries; stop on user request):

1. `validate_flow` locally (or rely on `robomotion run`'s build-time validation).
2. `robomotion run <flow-dir> --robot <id>` — capture the `Studio ID`.
3. Tail the agent stream until `agent_mode:end` for this run.
4. Classify the outcome:
   - `flow_end status=success` → report and stop.
   - `node_error` or `flow_error` → inspect `error` + `node`, fix `main.ts`, re-validate, re-run. Max 3 retries without user confirmation.
   - Timeout (no `agent_mode:end` within the flow's expected budget) → report and ask.
5. Between retries, keep mock fixtures stable so you can tell whether a change actually fixed anything.

### Common `node_error` patterns

| `error` fragment | Likely cause | Fix |
|------------------|--------------|-----|
| `Cannot read property 'X' of undefined` | Upstream node didn't set `msg.X` | Check the writing node's `out*` property; verify `Message('X')` upstream. |
| `Network timeout` / `ETIMEDOUT` | URL unreachable from robot | Confirm URL, raise timeout, check proxy. |
| `element not found` / selector failure | Stale selector | Re-run `/exploring-browser` and update `inSelector`. |
| `property not found in pspec` | Invalid property name | `get_node_cards` to verify the schema. |
| `Vault has to be selected` | Missing `optCredentials` on `Core.Vault.GetItem` | Add `optCredentials: Credential({vaultId, itemId})`. |

## Alternative: MCP tool chain (scripted)

When you need structured JSON or can't run background processes, use the API MCP directly:

```
validate_flow(flowPath: "path/to/flow")
list_robots()
run_flow(flowPath: "path/to/flow", robotId: "robot-uuid")   # returns studio_id
poll_logs(studioId: "<studio-id>")                           # same event shape
stop_flow(robotId: "<robot-uuid>")                           # if needed
```

`poll_logs` returns the same event types as the deskbot stream (`flow_start`, `node_start`, `node_end`, `node_error`, `log`, `flow_end`, `flow_error`). Use it if tailing a log file isn't available.

## Quick errors and fixes

| Message | Cause | Fix |
|---------|-------|-----|
| `ROBOMOTION_API_KEY environment variable is required` | Env var missing | `export ROBOMOTION_API_KEY=<key>` |
| `No main.ts found in directory: <path>` | Wrong dir or missing main.ts | Point at a directory that contains `main.ts`. |
| `Flow validation failed` | pspec violation at build time | Fix errors (use `/validating-flow` for a detailed report) and re-run. |
| `No robots found` | No robots registered in workspace | Create a robot at https://app.robomotion.io, then `robomotion-deskbot connect`. |
| Run submits but no `agent_mode:start` appears | Robot offline or in another workspace | Confirm `connected` event in the agent log; match `-w` and `-r` on the deskbot. |

## Related Skills

- `/creating-flow` — generate the flow
- `/validating-flow` — schema check (local, no robot needed)
- `/testing-flow` — behavioral tests with mocks (no robot needed)
- `/saving-flow` — save to cloud Designer
