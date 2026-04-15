---
name: running-flow
description: Executes a Robomotion flow on a robot using the API. Validates first, then runs and monitors execution logs. Use when user wants to run a flow on a robot.
allowed-tools: Read, Glob, Bash(bun:*), mcp__sdk__validate_flow, mcp__api__*
argument-hint: [flow-path]
---

# /running-flow

Execute a flow on a robot using the API.

## When to Use

- After creating and validating a flow
- Re-running an existing flow
- Testing flow changes

## Prerequisites

Before running:

- [ ] **CRITICAL: Flow validated** - Run `mcp__sdk__validate_flow`
- [ ] **Tests passed** (if tests exist) - Run `bun test`
- [ ] **Git committed** - Flow changes committed with descriptive message
- [ ] Robot available (check with `mcp__api__list_robots`)
- [ ] ROBOMOTION_API_KEY environment variable set

**NEVER run a flow without validation passing first!** The validator catches:
- Invalid property names (typos, wrong casing, invented properties)
- Invalid port connections (connecting to non-existent ports)
- Missing pspec schemas (warnings for unknown node types)

**See CLAUDE.md for common mistakes to avoid before running.**

## Workflow

### Step 1: Validate Flow (MANDATORY)

```
mcp__sdk__validate_flow
  flowPath: "path/to/flow/directory"
```

This will:
1. **Validate** all node properties against pspec schemas
2. **Validate** all port connections
3. **Check** for unknown node types
4. **Report** any errors

**Example output (success):**
```json
{
  "valid": true,
  "message": "Flow validation passed"
}
```

**Example output (failure):**
```json
{
  "valid": false,
  "errors": [
    "Node '7dbafc': Unknown property 'inURL'. Valid properties: optUrl, inBody, outBody...",
    "Node 'a06926': Unknown property 'inCode'. Valid properties: func, outputs, variables..."
  ]
}
```

**DO NOT PROCEED if validation fails!** Fix the errors first.

### Step 1.5: Run Tests (if they exist)

After successful validation:

```bash
cd /path/to/project && bun test
```

If tests fail:
1. Read error output
2. Identify the issue
3. Fix the flow
4. Re-validate
5. Re-run tests

**Note:** Testing is optional if no test suite exists. Validation is mandatory.

### Step 2: List Available Robots

```
mcp__api__list_robots
```

This shows all available robots with their IDs and status.

### Step 3: Start Flow

Choose a robot and start the flow:

```
mcp__api__run_flow
  flowPath: "path/to/flow/directory"
  robotId: "robot-uuid"  (optional, uses default if not specified)
```

**IMPORTANT:**
- `flowPath` should be the directory containing `main.ts`
- Returns a `studio_id` for polling logs

### Step 4: Poll for Completion

Use the returned `studio_id` to monitor execution:

```
mcp__api__poll_logs
  studioId: "<studio-id-from-step-3>"
```

Keep polling until you see completion status.

### Step 5: Check Status (if needed)

To check current robot status:

```
mcp__api__get_flow_status
  robotId: "<robot-uuid>"
```

## Event Types

When polling logs, you'll see various events:

| Event Type | Meaning |
|------------|---------|
| `flow_start` | Flow execution began |
| `node_start` | Node starting execution |
| `node_end` | Node completed |
| `node_error` | Node failed with error |
| `log` | Debug/info message from `Core.Flow.Log` |
| `flow_end` | Flow completed successfully |
| `flow_error` | Flow failed |

## Example Response

### Success
```json
{
  "status": "completed",
  "events": [
    {"type": "flow_start", "flowName": "My Flow"},
    {"type": "node_start", "nodeName": "HTTP Request"},
    {"type": "log", "message": "Fetching data..."},
    {"type": "node_end", "nodeName": "HTTP Request"},
    {"type": "flow_end", "status": "success"}
  ]
}
```

### Error
```json
{
  "status": "failed",
  "events": [
    {"type": "flow_start", "flowName": "My Flow"},
    {"type": "node_start", "nodeName": "Function"},
    {"type": "node_error", "nodeName": "Function", "error": "TypeError: Cannot read property 'data' of undefined"},
    {"type": "flow_error", "error": "TypeError: ..."}
  ]
}
```

## Error Handling

When flow fails:

1. **Find the failing node** - Look for `node_error` event
2. **Read the error message** - Usually indicates the problem
3. **Fix the flow code** - Update TypeScript in flow directory
4. **Rebuild** - `robomotion build main.ts`
5. **Re-validate** - `mcp__sdk__validate_flow`
6. **Run again** - Retry execution

### Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `Cannot read property 'X' of undefined` | Missing variable | Check variable names with `f.msg('X')` |
| `Network timeout` | URL unreachable | Check URL, increase timeout |
| `Selector not found` | Wrong browser selector | Verify selectors exist |
| `Connection refused` | Service unavailable | Check connection string |
| `property not found in pspec` | Invalid property name | Use `mcp__sdk__get_node_schema` to verify |

## Auto-Fix Loop

For autonomous operation:

1. Run flow
2. If error:
   - Parse `node_error` event
   - Identify the issue
   - Fix the TypeScript
   - Rebuild with `robomotion build main.ts`
   - Re-validate with `mcp__sdk__validate_flow`
   - Retry (max 3 times)
3. If success: Report results to user

## Stopping a Flow

To stop a running flow:

```
mcp__api__stop_flow
  robotId: "<robot-uuid>"
```

## API Commands Reference

| Command | Description |
|---------|-------------|
| `mcp__api__list_robots` | List available robots |
| `mcp__api__run_flow` | Start flow execution |
| `mcp__api__poll_logs` | Get execution logs |
| `mcp__api__get_flow_status` | Current robot/flow state |
| `mcp__api__stop_flow` | Stop running flow |

## Environment Setup

Ensure environment variable is set:

```bash
export ROBOMOTION_API_KEY=your-api-key-here
```

This should be in your environment or MCP server configuration.

## Monitoring Best Practices

1. **Poll regularly** - Check logs every 2-3 seconds during execution
2. **Look for `log` events** - These show `Core.Flow.Log` output (visible to AI)
3. **Check for errors early** - `node_error` indicates immediate failure
4. **Track progress** - Use index in loops to show progress

## Related Skills

- `/creating-flow` - Generate a flow
- `/validating-flow` - Check before running
- `/searching-packages` - Find packages/nodes
- **CLAUDE.md** - Team knowledge base (common mistakes, testing workflows)

## Example Full Workflow

```
1. User: "Create a flow to fetch Reddit posts"

2. Assistant: Creates flow with builder SDK

3. Assistant: Validates with mcp__sdk__validate_flow

4. Assistant: Runs tests with `bun test` (if they exist)

5. Assistant: Git commits with descriptive message

6. Assistant: Lists robots with mcp__api__list_robots

7. Assistant: Starts flow with mcp__api__run_flow

8. Assistant: Polls logs with mcp__api__poll_logs until completion

9. Assistant: Reports results to user
```
