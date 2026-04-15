---
name: creating-flow
description: Creates Robomotion automation flows with the @robomotion/sdk TypeScript builder. Handles the full workflow: requirements → plan → build → validate → deploy. Also use when the user has a plan ready and wants the flow code written.
allowed-tools: Read, Glob, Grep, Edit, Write, Bash(git:*), Bash(robomotion:*), mcp__sdk-mcp__*, mcp__api__*, discover_browser_flow
argument-hint: [flow-description]
references: ../../../docs/sdk-grammar.md, ../../../docs/patterns/loops.md, ../../../docs/patterns/conditions.md, ../../../docs/patterns/credentials.md, ../../../docs/patterns/exceptions.md, ../../../docs/patterns/branches.md, ../../../docs/patterns/subflows.md, ../../../docs/architecture.md, ../../../docs/patterns/data-tables.md, ../../../docs/patterns/browser.md, ../../../docs/patterns/captcha.md, ../../../docs/reference/system-variables.md, ../../../docs/reference/node-naming.md
auto-inject: true
---

# /creating-flow

All-in-one skill: requirements → plan → build → validate → deploy.

**See AGENTS.md for SDK grammar, core principles, and canonical examples.**

> **Line-1 rule.** `main.ts` MUST start with the import line. If line 1 is an arrow (`→`), a plan description, or a comment, delete it and start with the import:
>
> ```typescript
> import { flow, Message, Custom } from '@robomotion/sdk';
> ```
>
> Never write diagrams, arrows, or pseudo-code to `main.ts` — that belongs in chat text, not the file.

## Direct Mode (non-interactive)

**If you are directly asked to write a flow** ("Write main.ts for X", "Generate a flow that does Y"), skip Steps 0–2 and jump to Step 3. Steps 0–2 are for interactive sessions only.

In direct mode:
1. Read schemas from context, or call `get_node_cards` if unsure.
2. Write `main.ts` with the `Write` tool. If the flow uses `Core.Flow.SubFlow` nodes, write each subflow file at `subflows/{id}.ts` immediately — ID matches the SubFlow node's ID. Subflow files use `subflow.create(name, fn)` (NOT `flow.create()`), with `Core.Flow.Begin` → task nodes → `Core.Flow.End({sfPort: 0})`.
3. Validate with `validate_flow` — fix errors and re-validate.

## Step 0: Gather Requirements (interactive)

1. **Credentials** — API keys/passwords? Use `vault_list` + `vault_item_list`; pick the best match and add to the plan.
2. **URLs/Endpoints** — confirm with user.
3. **Files** — input/output? The flow MUST create dirs with `Core.FileSystem.Create` (never bash).
4. **Iteration** — multiple items → ForEach loop with Goto→Label. Single item → simple chain.
5. **Error handling** — retry / skip / stop.

## Step 1: Plan

```
plan_flow(description: "...")
```

Returns packages, node cards, best-matching template, and package docs (llms.txt headers).

If more detail is needed:
- `get_node_cards(nodeTypes[])` — batch schemas for specific nodes
- `get_llms_txt(namespace)` — MANDATORY for any package not returned by `plan_flow`
- `search_packages(query)` / `search_nodes(query)` — find packages / nodes

## Step 2: Present Plan for Approval

Output the plan as **text content in chat** (not inside a tool call), then call `AskUserQuestion`:

```markdown
## Flow Plan: [Name]
### Requirements
- Credentials: [vault/item IDs]
- URLs: [targets]
- Files: [I/O paths]
- Pattern: [simple_chain / loop / conditional]
### Flow Structure
1. Start → Inject
2. …
### Packages: [list with nodes used]
```

Options: `"Build it"` | `"Modify plan"`. On "Build it", proceed to Step 3 immediately.

## Step 3: Write Flow

**Before writing code, load the 1–2 reference docs most relevant to the task:**
- `get_reference_doc(doc='browser')` — MANDATORY for any `Core.Browser.*` flow
- `get_reference_doc(doc='loops')` — ForEach/Label/GoTo
- `get_reference_doc(doc='conditions')` — Function with `outputs: 2`
- `get_reference_doc(doc='credentials')` — any `Credential()` usage
- `get_reference_doc(doc='data-tables')` — Excel / CSV / Sheets

Core rules are already in AGENTS.md. Then verify property names with `get_node_cards` before writing.

### Write-step checklist

- [ ] Line 1 is `import { flow, Message, Custom } from '@robomotion/sdk';`
- [ ] `f.addDependency(namespace, version)` for every non-`Core.*` package (add missing only — never bump existing)
- [ ] Loops: `Label → ForEach → body → GoTo`. `Stop` is standalone, wired via `f.edge()` on ForEach port 1. **GoTo/Debug/Log/Stop/End are terminal — NEVER `.then()` after them.**
- [ ] Every flow has a `Core.Flow.Stop` node
- [ ] Ends with `.start()` (libraries omit `.start()`)

### Loop-flow illustration (terminal-node discipline)

```typescript
import { flow, Custom, Message } from '@robomotion/sdk';

flow.create('flow-id', 'Loop Flow', (f) => {
  f.node('inject', 'Core.Trigger.Inject', 'Start', {})
    .then('label', 'Core.Flow.Label', 'Next Item', {})
    .then('foreach', 'Core.Programming.ForEach', 'For Each', {
      optInput: Message('items'), optOutput: Message('item')
    })
    .then('process', 'Core.Programming.Function', 'Process', { func: 'return msg;' })
    .then('sleep', 'Core.Programming.Sleep', 'Wait', { optDuration: Custom('1') })
    .then('goto', 'Core.Flow.GoTo', 'Loop Back', {
      optNodes: { ids: ['label'], type: 'goto', all: false }
    });

  // Stop is standalone — ForEach port 1 (done) via f.edge(), NOT .then()
  f.node('stop', 'Core.Flow.Stop', 'Stop', {});
  f.edge('foreach', 1, 'stop', 0);

  // Debug inside the loop: f.edge() from a non-terminal body node (never from goto/stop)
  f.node('debug', 'Core.Programming.Debug', 'Log Item', { optDebugData: Message('item') });
  f.edge('sleep', 0, 'debug', 0);
}).start();
```

### SubFlow files

SubFlow/Begin/End schemas are in AGENTS.md — do NOT call `get_node_cards` for them. Follow the canonical SubFlow example: `subflow.create(name, fn)` with `Begin` → nodes → `End(sfPort: 0)`. SubFlow node ID in the parent equals the subflow filename (no `subflow` property).

### Browser flows — mandatory exploration

If the flow uses `Core.Browser.*`, call `discover_browser_flow(description, url)` BEFORE writing code. It launches a sub-agent with browser tools and returns verified selectors. Raw `browser_*` tools are NOT available to you directly — only inside `discover_browser_flow`.

### Credentials

Call `get_reference_doc(doc='credentials')` MANDATORY before writing any `Credential()`. Key rule: `Core.Vault.GetItem` REQUIRES `optCredentials: Credential({vaultId, itemId})` — omitting it fails at runtime.

## Step 4: Validate (MANDATORY)

```
validate_flow(flowPath: "path/to/flow")
```

Compiles AND validates. Fix any errors → re-validate.

## Step 5: Verify Browser Selectors (if browser flow)

`discover_browser_flow` verifies selectors during exploration. If code changed, re-call it to re-verify.

## Step 6: Save / Run

Ask the user:
- "Run now" → `run_flow`
- "Save to cloud" → `save_flow`
- "Review first" → show code

## Designer Integration

When running inside the Robomotion Designer, a Flow ID is provided in context:
- Write `main.ts` to the workspace path from context
- Regular flows: `flow.create('{flow_id}', ...).start()`
- Library projects: `library.create('{flow_id}', 'Library Name', (f) => { ... })` — no `.start()`
- Use `save_flow` (Designer auto-reloads). Do NOT call `create_flow` (flow already exists).

## Related Skills

- `/planning-flow` — research only (no code)
- `/validating-flow` — schema validation
- `/testing-flow` — behavioral tests
- `/running-flow` — execute on robot
- `/saving-flow` — save to cloud
- `/reversing-network` — convert a browser flow to HTTP after capturing traffic
