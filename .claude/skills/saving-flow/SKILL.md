---
name: saving-flow
description: Saves a compiled flow to the Robomotion cloud via `robomotion-api-mcp` so it can be opened in the Flow Designer. Use when the user says "save the flow", "deploy to cloud", "send to Designer", or after `/creating-flow` produces a validated flow. Automatically manages flow IDs — first save creates a new flow and rewrites `main.ts`; subsequent saves update the same flow.
allowed-tools: Read, Bash(ls:*), mcp__sdk__validate_flow, mcp__api__save_flow
argument-hint: [flow-path]
---

<command-name>saving-flow</command-name>

# Saving Flow to Robomotion Cloud

This skill saves a compiled flow to Robomotion cloud so it can be opened in the Flow Designer.

## Purpose

- Save local flows to Robomotion cloud
- Get a Designer URL for visual editing
- **Automatic ID management** - creates new flows and updates existing ones

## Prerequisites

- Flow must be built (`robomotion build main.ts`)
- Flow should be validated (`mcp__sdk__validate_flow`)
- Recommended: Flow should run successfully first

---

## Automatic Flow ID Management

The save tool automatically manages flow IDs:

| `flow.create()` ID | Action | Result |
|-------------------|--------|--------|
| `'main'` or any non-UUID | Creates NEW flow | main.ts auto-updated with UUID |
| Valid UUID | Updates EXISTING flow | No file changes needed |

**First save:**
```typescript
// Before save
flow.create('main', 'Flow Name', (f) => { ... });

// After save - main.ts is automatically updated!
flow.create('21aa8f30-588a-427f-ba1e-00fc3791ae95', 'Flow Name', (f) => { ... });
```

**Subsequent saves:** Uses the embedded UUID to update the same flow (no duplicates).

---

## Workflow

### Step 1: Verify Flow is Compiled

Compile the flow (validator does this automatically, but you can compile manually):
```bash
cd {flow-path} && robomotion build main.ts
```

### Step 2: Validate Flow

Always validate before saving:

```
mcp__sdk__validate_flow flowPath="{flow-path}"
```

### Step 3: Save to Cloud

```
mcp__api__save_flow flowPath="{flow-path}" name="{flow-name}"
```

**Response (new flow):**
```json
{
  "ok": true,
  "flow_id": "21aa8f30-588a-427f-ba1e-00fc3791ae95",
  "name": "My Flow",
  "message": "Flow saved! main.ts updated with flow ID. Open in Designer: https://app.robomotion.io/flows/21aa8f30-...",
  "updated": false,
  "main_ts_updated": true
}
```

**Response (existing flow):**
```json
{
  "ok": true,
  "flow_id": "21aa8f30-588a-427f-ba1e-00fc3791ae95",
  "name": "My Flow",
  "message": "Flow saved! Open in Designer: https://app.robomotion.io/flows/21aa8f30-...",
  "updated": true
}
```

### Step 4: Report URL to User

After saving, provide the Designer URL:
```
https://app.robomotion.io/flows/{flow_id}
```

---

## Opening in Designer

After saving, the flow can be opened at:
```
https://app.robomotion.io/flows/{flow_id}
```

The Designer will:
1. Load the flow from cloud
2. Auto-layout nodes (no designer positions sent)
3. Allow visual editing and execution

---

## Related Skills

- `/creating-flow` - Create flow code
- `/testing-flow` - Validate flow
- `/running-flow` - Execute on robot
