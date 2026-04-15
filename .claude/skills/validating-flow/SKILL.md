---
name: validating-flow
description: Validates a compiled Robomotion flow against pspec schemas via `robomotion-sdk-mcp`. Checks node property names, port counts, and node types. Use when the user says "validate this flow", "check the flow", "is this correct", or before `/running-flow` / `/saving-flow`. **Does NOT run the flow — for behavioral tests use `/testing-flow`.**
allowed-tools: Read, Glob, mcp__sdk__validate_flow
argument-hint: [flow-path]
---

# /validating-flow

Validate a compiled flow against pspec schemas, including all subflows.

## When to Use

- After writing a flow with TypeScript SDK
- Before running a flow
- To check flow structure for errors

## Workflow

### Step 1: Validate Flow

```
mcp__sdk__validate_flow
  flowPath: "path/to/flow-directory"
```

The validator automatically builds `main.ts` (via `robomotion build`) and validates the output — no manual build step needed.

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
