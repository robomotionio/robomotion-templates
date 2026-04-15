---
name: validating-flow
description: Validates a compiled Robomotion flow against pspec schemas. Prefer the `robomotion validate <flow-dir>` CLI (build + pspec check, exits 0/1, no stdout on success). Use when the user says "validate this flow", "check the flow", "is this correct", or before `/running-flow` / `/saving-flow`. **Does NOT run the flow — for behavioral tests use `/testing-flow`.**
allowed-tools: Read, Glob, Bash(robomotion:*), mcp__sdk__validate_flow
argument-hint: [flow-path]
---

# /validating-flow

Build + validate a flow against pspec schemas, including all subflows.

## When to Use

- After writing or editing a flow with the TypeScript SDK
- Before running, saving, or committing a flow
- In a tight validate-then-fix loop while iterating

## Preferred: `robomotion validate` CLI

```bash
robomotion validate <flow-dir>      # e.g. robomotion validate write-to-clipboard
robomotion validate                  # defaults to main.ts in cwd
robomotion validate path/to/main.ts  # also accepts a file
```

The CLI builds the flow (via Bun + `@robomotion/sdk`) and runs it through pspec
validation. On success, exits 0 with a single `✔ <name> validated` line on
stderr and **no stdout output** — composes cleanly in shell pipelines:

```bash
robomotion validate write-to-clipboard/ && robomotion run write-to-clipboard/
```

On failure, exits 1 and prints node-by-node errors on stderr. Designer side
files (`*.designer.ts`) are NOT regenerated on validate — use `robomotion build`
when you want JSON output or designer refresh.

### Validate-then-fix loop

```bash
robomotion validate write-to-clipboard/    # exit 1, error report on stderr
# read the error, edit main.ts to fix, then:
robomotion validate write-to-clipboard/    # exit 0
```

## Alternative: MCP tool

```
mcp__sdk__validate_flow
  flowPath: "path/to/flow-directory"
```

Equivalent to `robomotion validate` — returns the result as a structured JSON
object instead of stderr text. Use this when you need the structured
`ValidationResult` (e.g. iterating errors programmatically). The MCP tool
auto-builds via `robomotion build` — no manual build step needed.

This validates:
- Node properties against pspec schemas
- Port connections and wire counts
- Node types exist in their packages

Checks performed:
- Invalid node property names (typos, wrong names)
- Unknown node types (not found in pspec)
- Invalid output port numbers (exceeding node's output count)

### Step 2: Interpret Results

**Valid Flow:**
```json
{
  "valid": true,
  "errors": [],
  "warnings": [],
  "errorCount": 0,
  "warningCount": 0,
  "flowPath": "path/to/flow-directory",
  "message": "Flow validation passed"
}
```

**Invalid Flow:**
```json
{
  "valid": false,
  "errors": [
    {
      "nodeId": "7dbafc",
      "nodeName": "Invalid Node",
      "nodeType": "Core.Programming.InvalidNode",
      "error": "Node type Core.Programming.InvalidNode not found in pspec",
      "severity": "error"
    }
  ],
  "errorCount": 1,
  "flowPath": "path/to/flow-directory",
  "message": "Flow validation failed with 1 error(s)"
}
```

## Validation Errors

### Unknown Property
```
Error: Unknown property 'inCode'. Valid properties: func, outputs, variables, optTimeout
Fix: Check schema with mcp__sdk__get_node_schema - use 'func' not 'inCode'
```

### Unknown Node Type
```
Error: Node type Core.Programming.Log not found in pspec for Core.Programming
Fix: Use correct node type - probably 'Core.Programming.Debug'
```

### Invalid Port Number
```
Error: Invalid output port 2. Node has 2 output(s) (ports 0-1).
Fix: Use port 0 or 1
```

## Validation Warnings

### Could Not Load Pspec
```
Warning: Could not load pspec for Robomotion.CustomPackage: ...
Fix: Check package name spelling and ensure it exists
```

### Invalid Node Type Format
```
Warning: Invalid node type format: InvalidType
Fix: Use full node type like 'Core.Programming.Function'
```

## What the Validator Does NOT Check

The validator only checks against pspec schemas. It does NOT verify:
- Loop wiring patterns (Goto→Label)
- Missing required properties
- Variable references (Message('varName'))
- Resource cleanup patterns
- Connection ID correctness
- Business logic correctness

These must be verified manually or through code review.

## Pre-Run Checklist

Before running a flow:

- [ ] Validation passes (`mcp__sdk__validate_flow`) — this also compiles the flow
- [ ] All loops have Goto→Label wiring (manual check)
- [ ] All required properties specified (manual check)
- [ ] Port numbers correct for multi-output nodes

## Quick Fix Guide

| Error Type | Fix |
|------------|-----|
| Unknown property | Use `mcp__sdk__get_node_schema` to find correct name |
| Invalid port | Check node docs for available ports (usually 0 and 1) |
| Unknown node type | Verify spelling and package namespace |

## Related Skills

- `/creating-flow` - Generate a flow
- `/running-flow` - Execute after validation
- `/searching-packages` - Find correct node types
