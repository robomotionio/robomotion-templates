---
name: creating-flow
description: Creates Robomotion automation flows with TypeScript SDK. Handles complete workflow from requirements gathering through planning, building, testing, and deploying. Also use when user has a plan ready and wants to write flow code.
allowed-tools: Read, Glob, Grep, Edit, Write, Bash(git:*), Bash(robomotion:*), mcp__sdk-mcp__*, mcp__api__*, discover_browser_flow
argument-hint: [flow-description]
references: ../../../docs/sdk-grammar.md, ../../../docs/patterns/loops.md, ../../../docs/patterns/conditions.md, ../../../docs/patterns/credentials.md, ../../../docs/patterns/exceptions.md, ../../../docs/patterns/branches.md, ../../../docs/patterns/subflows.md, ../../../docs/architecture.md, ../../../docs/patterns/data-tables.md, ../../../docs/patterns/browser.md, ../../../docs/patterns/captcha.md, ../../../docs/patterns/proxy.md, ../../../docs/reference/system-variables.md
auto-inject: true
---

# /creating-flow

All-in-one skill: requirements → plan → build → validate → deploy.

**See AGENTS.md for SDK grammar, rules, and examples.**

## ⚡ DIRECT MODE (Non-Interactive / Automated)

**If you are directly asked to write a flow** (e.g., "Write main.ts for X", "Generate a flow that does Y"), **skip Steps 0–2 entirely** and jump straight to **Step 3: Write Flow**.

Steps 0–2 (requirements gathering, plan presentation, user approval) are ONLY for interactive sessions where a human is present to respond. In direct/automated mode:
1. Read the node schemas provided in context (or call `mcp__sdk__get_node_cards` if unsure)
2. Write `main.ts` using the **Write tool** (path: `main.ts`) — the file content MUST start with `import { flow, Message, Custom } from '@robomotion/sdk';` on line 1. NEVER write flow descriptions, arrows (→), comments, or pseudo-code as file content.
   **SUBFLOWS**: If the flow uses `Core.Flow.SubFlow` nodes, you MUST call the **Write tool** a second time to create each subflow file at `subflows/{id}.ts` (where `{id}` matches the SubFlow node's ID). Writing subflow files is NOT optional — do it immediately after writing main.ts, before validating. Each subflow file MUST use `subflow.create(name, fn)` (NOT `flow.create()`), with `Core.Flow.Begin` as entry, ALL the task-specific nodes in the middle (for browser tasks: `OpenLink`, `RunScript`; for API tasks: `HttpRequest`; etc. — use whatever nodes the prompt describes, NOT a generic Function placeholder), and `Core.Flow.End` (with `sfPort: 0`) as exit. To add `Debug` inside a subflow: `f.node('debug', 'Core.Programming.Debug', 'Log', { optDebugData: Message('result') })` + `f.edge('lastNode', 0, 'debug', 0)` (same terminal-safe pattern as main flows). Missing subflow files = SubFlow nodes with no content.
3. Validate with `mcp__sdk__validate_flow` — fix any errors and re-validate

**⚠️ FIRST LINE RULE: The very first line of main.ts MUST be:**
```
import { flow, Message, Custom } from '@robomotion/sdk';
```
**If line 1 is ANYTHING else — an arrow (→), a flow description, a comment — it is WRONG. Delete it and start with the import.**

**CRITICAL**: Write TypeScript SDK code to `main.ts`. Never write diagrams, arrows (→), or plan text to the file.

**WRONG** — do NOT write this to `main.ts`:
```
Inject → HttpRequest → Debug → Stop
```

**CORRECT** — write actual TypeScript to `main.ts`:
```typescript
import { flow, Custom, Message } from '@robomotion/sdk';
flow.create('flow-id', 'My Flow', (f) => {
    f.node('inject', 'Core.Trigger.Inject', 'Start', {})
        .then('fetch', 'Core.Net.HttpRequest', 'Fetch', { optUrl: Custom('https://example.com') })
        .then('stop', 'Core.Flow.Stop', 'Stop', {});
}).start();
```

**LOOP FLOWS** — GoTo is terminal (outputs=0). Stop MUST be a standalone `f.node()` wired via `f.edge()` on ForEach port 1, NEVER `.then()` after GoTo. ⚠️ **`Core.Flow.Begin` and `Core.Flow.End` are for subflow files ONLY — NEVER in loop flows.** Loops use Label/ForEach/GoTo, not Begin/End:
```typescript
import { flow, Custom, Message } from '@robomotion/sdk';
flow.create('flow-id', 'Loop Flow', (f) => {
    f.node('inject', 'Core.Trigger.Inject', 'Start', {})
        .then('label', 'Core.Flow.Label', 'Next Item', {})
        .then('foreach', 'Core.Programming.ForEach', 'For Each', {
            optInput: Message('items'), optOutput: Message('item')
        })
        // Loop body (port 0) — GoTo is TERMINAL (outputs=0), NEVER .then() after it
        .then('process', 'Core.Programming.Function', 'Process', { func: 'return msg;' })
        .then('sleep', 'Core.Programming.Sleep', 'Wait', { optDuration: Custom('1') })
        .then('goto', 'Core.Flow.GoTo', 'Loop Back', {
            optNodes: { ids: ['label'], type: 'goto', all: false }
        });
    // Stop MUST be standalone — wired to ForEach port 1 (done) via f.edge(), NOT .then()
    f.node('stop', 'Core.Flow.Stop', 'Stop', {});
    f.edge('foreach', 1, 'stop', 0);
    // ⚠️ NEVER put Debug in the .then() chain — Debug has outputs=0, will crash next .then() call:
    //   WRONG: .then('process').then('debug').then('sleep')  ← throws "Cannot chain from node (outputs=0)"
    //   WRONG: .then('process').then('sleep').then('debug').then('goto')  ← same crash
    //   WRONG: f.node('stop', ...).then('debug', ...)  ← Stop is ALSO terminal (outputs=0), same crash
    //   WRONG: f.node('debug', ...).then('stop', ...)  ← Debug is ALSO terminal (outputs=0), same crash
    //   WRONG: f.edge('goto', 0, 'debug', 0)  ← f.edge() ALSO throws when source has outputs=0 (goto is terminal)
    // CORRECT: standalone f.node() + f.edge() from the last NON-TERMINAL body node (sleep/process), NOT from goto or stop:
    f.node('debug', 'Core.Programming.Debug', 'Log Item', { optDebugData: Message('item') });
    f.edge('sleep', 0, 'debug', 0);  // wire from last NON-TERMINAL body node (sleep) — NEVER from goto or stop (both terminal)
}).start();
```

---

## Step 0: Gather Requirements (MANDATORY for interactive sessions)

Before ANY planning:

1. **Credentials** — Does this need API keys/passwords? Use `vault_list` + `vault_item_list` to find them. Add to plan — user corrects if wrong.
2. **URLs/Endpoints** — Specific URLs involved? Confirm with user.
3. **Files** — Input/output files? Flow MUST create dirs with `Core.FileSystem.Create` (never bash).
4. **Iteration** — Multiple items? → ForEach loop with Goto→Label. Single item? → Simple chain.
5. **Error Handling** — Retry? Skip? Stop?

## Step 1: Plan with plan_flow (1 call)

```
mcp__sdk-mcp__plan_flow
  description: "Scrape DuckDuckGo results and save to Excel"
```

Returns: relevant packages, node cards (schema + docs), best-matching template, AND **package docs** (llms.txt headers with description, auth patterns, dos/don'ts) for all matched packages.

**If plan_flow doesn't return enough info**, use these individually:
- `get_node_cards(nodeTypes[])` — batch schemas for specific nodes (also includes package-level guidance)
- `get_llms_txt(namespace)` — compact package docs (MANDATORY for every package not already covered by `plan_flow`)
- `search_packages(query)` / `search_nodes(query)` — find packages/nodes

## Step 2: Present Plan for Approval

**CRITICAL: Output the plan below as TEXT CONTENT in the chat — NOT inside a tool call.** The user must see the plan in the chat before you ask for approval.

```markdown
## Flow Plan: [Name]

### Requirements
- Credentials: [vault/item IDs]
- URLs: [targets]
- Files: [I/O paths]
- Pattern: [simple_chain / loop / conditional]

### Flow Structure
1. Start → Inject
2. [Node] → [Description]
3. ...

### Packages: [list with nodes used]
```

Then use `AskUserQuestion` for approval:
```
question: "Ready to build this flow?"
options:
  - "Build it"
  - "Modify plan"
```

**When user selects "Build it":** Immediately proceed to Step 3 below — call `get_node_cards` and write the flow code. Do NOT wait for another message.

**When user selects "Modify plan":** Ask what they want to change, revise the plan, and present it again.

## Step 3: Write Flow (After Approval)

**Read reference docs BEFORE writing code** — call `get_reference_doc` for relevant topics:
- `get_reference_doc(doc='browser')` — MANDATORY for any Core.Browser.* flow
- `get_reference_doc(doc='loops')` — if flow uses ForEach/Label/GoTo
- `get_reference_doc(doc='conditions')` — if flow uses Function with outputs: 2
- `get_reference_doc(doc='credentials')` — if flow uses Credential()
- `get_reference_doc(doc='data-tables')` — if flow reads/writes Excel or Data Tables
- Load 1-2 docs relevant to your task. Core rules are already in AGENTS.md.

**Read package docs for each package** — If you used `plan_flow`, package docs are already included in the response (`packageDocs` field). For any packages added later (not covered by `plan_flow`), call `get_llms_txt(namespace)` — this is MANDATORY. It returns critical dos/don'ts and auth patterns (~10 lines).

Then use `get_node_cards` to batch-verify property names before writing:

```
mcp__sdk-mcp__get_node_cards
  nodeTypes: ["Core.Browser.Open", "Core.Browser.OpenLink", "Core.Excel.Open"]
```

Follow AGENTS.md patterns. Key checklist:
- [ ] Import from `@robomotion/sdk`
- [ ] Credentials as constants at top
- [ ] `f.addDependency(namespace, version)` for every non-`Core.*` package — add missing ones only, NEVER change existing versions
- [ ] `f.node(id, type, name, props)` — correct param order
- [ ] Only non-default properties
- [ ] `Message()` for variables, `Custom()` for literals
- [ ] `Credential()` for secrets (never hardcode)
- [ ] `func` is literal string (NOT wrapped in `JS()`)
- [ ] Enum props are plain strings (NOT `Custom()`)
- [ ] Loops: Label → ForEach → body → GoTo — **GoTo is TERMINAL (outputs=0): NEVER `.then()` after GoTo. To add Debug/Log inside a loop, wire it via `f.edge()` from the last body node BEFORE GoTo, never after GoTo**
- [ ] `.then()` for sequential, `.edge()` for multi-port — **Debug/Log/Stop/GoTo/End are ALL terminal; never chain `.then()` from any of them**
- [ ] **MANDATORY: Every flow includes `Core.Flow.Stop`** — add `f.node('stop', 'Core.Flow.Stop', 'Stop', {})` as the final node, even if flow also ends with Log/Debug (wire both to Stop or wire Stop separately)
- [ ] Ends with `.start()`
- [ ] Property names verified with `get_node_cards`
- [ ] **NEVER use `ScrapeList`/`ScrapeTable`** — use `RunScript` with Data Table format

### Minimal Reference Example

Use `Write` tool to produce code in this exact format (never output as text):

```typescript
import { flow, Message, Custom } from '@robomotion/sdk';

flow.create('{flow_id}', 'Fetch and Save', (f) => {
    // f.node(id, type, name, props) — correct param order
    f.node('inject', 'Core.Trigger.Inject', 'Start', {})
        .then('fetch', 'Core.Net.HttpRequest', 'Fetch', {
            optUrl: Custom('https://api.example.com/data'),
            optMethod: 'GET',              // enum: plain string, NOT Custom()
            outBody: Message('body'),      // output: Message() saves to msg.body
        })
        .then('stop', 'Core.Flow.Stop', 'Stop', {});
}).start();
```

Key: `Message(variable)` vs `Custom(literal)` vs `Credential({vaultId, itemId})` for secrets.

**HttpRequest properties**: `optUrl` (NOT `inUrl`), `optMethod` (NOT `inMethod`), `outBody` for response body.

**Logging**: use `Core.Flow.Log` with `inText: Message(...)` — outputs=0 (terminal), so connect with `.edge()` not `.then()`. Flow STILL needs `Core.Flow.Stop`:
```typescript
f.node('inject', 'Core.Trigger.Inject', 'Start', {})
    .then('fetch', 'Core.Net.HttpRequest', 'Fetch', { optUrl: Custom('...'), outBody: Message('body') })
    .then('stop', 'Core.Flow.Stop', 'Stop', {});
f.node('log', 'Core.Flow.Log', 'Log', { inText: Message('body') });
f.edge('fetch', 0, 'log', 0);  // log is terminal — Stop is still required above
```

### SubFlow Files

SubFlow/Begin/End node schemas are documented in AGENTS.md — **do NOT call `get_node_cards`, `list_nodes`, or `get_llms_txt` for these nodes**. Just follow the canonical SubFlow example in AGENTS.md directly:
- Subflow file: `subflow.create(name, fn)` with `Begin` → nodes → `End(sfPort: 0)`
- Parent flow: `.then(ID, 'Core.Flow.SubFlow', name, {})` where node ID = subflow filename
- Write subflow files the same way you write main.ts — no extra research needed

### Browser Flows — MANDATORY Interactive Exploration

If the flow uses `Core.Browser.*` nodes, you MUST explore the target site BEFORE writing code. **NEVER guess selectors.**

Call `discover_browser_flow(description, url)` — this launches a sub-agent with full browser access that:
- Opens the browser, navigates to the URL
- Explores the page, discovers selectors
- Returns verified CSS selectors and a flow action sequence

**CRITICAL:** Browser tools (`browser_open`, `browser_navigate`, etc.) are NOT available to you directly. They are only available inside the `discover_browser_flow` sub-agent. Do NOT call them via Bash or as MCP tools.

> **CRITICAL — read before writing any credential code:**
> - Call `get_reference_doc(doc='credentials')` MANDATORY before writing credential code
> - Node has `inCredentials` property → use `Credential({vaultId, itemId})` directly on the node
> - Some nodes (e.g., Gemini, HTTP) use `optApiKey` instead of `inCredentials` — verify with `get_node_cards` first
> - Browser form filling → MUST use `Core.Vault.GetItem` with `optCredentials: Credential({vaultId, itemId})`
> - `optCredentials` on `Core.Vault.GetItem` is REQUIRED — omitting it = "Vault has to be selected" error

### Credential Selection

1. `mcp__api__vault_list` → list vaults
2. `mcp__api__vault_item_list` → list items in the relevant vault
3. Pick the best-match credential and add to the plan
4. User corrects if the chosen credential is wrong
5. Use `Credential({vaultId, itemId})` in flow

## Step 4: Compile & Validate (MANDATORY)

```
mcp__sdk-mcp__validate_flow flowPath="path/to/flow"
```

`validate_flow` compiles AND validates in one step. Fix any errors → revalidate.

## Step 5.5: Verify Browser Selectors (MANDATORY for browser flows)

**Before saving or running ANY flow that uses `Core.Browser.*` nodes, selectors MUST be verified.** Unverified selectors cause "element not found" at runtime.

The `discover_browser_flow` sub-agent already verifies selectors during exploration. If you need to re-verify after code changes, call `discover_browser_flow` again with the updated URL/description.

## Step 6: Save / Run

Ask user:
- "Run now" → `mcp__api__run_flow`
- "Save to cloud" → `mcp__api__save_flow`
- "Review first" → show code

## Designer Integration (when Flow ID is in context)

When running inside the Robomotion Designer:
- Write main.ts to the workspace path provided in context
- For regular flows: `flow.create('{flow_id}', ...).start()`
- For library projects: `library.create('{flow_id}', 'Library Name', (f) => { ... })` — no `.start()`
- Use `save_flow` to save (Designer auto-reloads canvas)
- Do NOT use `create_flow` (flow already exists)

## Related Skills

- `/planning-flow` — Research only (no code)
- `/validating-flow` — Schema validation
- `/testing-flow` — Behavioral tests
- `/running-flow` — Execute on robot
- `/saving-flow` — Save to cloud

## Advanced Techniques

If the flow requires special handling, load the relevant technique skill BEFORE writing code:

| Scenario | Call |
|----------|------|
| Reverse-engineer browser traffic to HTTP | `get_skill('technique-network-reversal')` |
