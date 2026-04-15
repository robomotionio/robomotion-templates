---
name: creating-flow
description: Creates Robomotion automation flows with the @robomotion/sdk TypeScript builder. Handles the full workflow: requirements → plan → build → validate → deploy. Also use when the user has a plan ready and wants the flow code written.
allowed-tools: Read, Glob, Grep, Edit, Write, Bash(git:*), Bash(robomotion:*), mcp__browser__*, Skill
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
1. Verify schemas with `robomotion describe node <type>[,<type2>...]` if unsure.
2. Write `main.ts` with the `Write` tool. If the flow uses `Core.Flow.SubFlow` nodes, write each subflow file at `subflows/{id}.ts` immediately — ID matches the SubFlow node's ID. Subflow files use `subflow.create(name, fn)` (NOT `flow.create()`), with `Core.Flow.Begin` → task nodes → `Core.Flow.End({sfPort: 0})`.
3. Validate with `robomotion validate <flow-dir>` — fix errors and re-validate.

## Step 0: Gather Requirements (interactive)

1. **Credentials** — API keys/passwords? Use `robomotion get vaults` then `robomotion get vault-items <vault-id>`; pick the best match by service/item name and put it in the plan. Let the user *correct* if you picked wrong. Do NOT pepper them with `AskUserQuestion` option buttons to choose a vault item — just commit to a pick and move on.
2. **URLs/Endpoints** — confirm with user.
3. **Files** — input/output? The flow MUST create dirs with `Core.FileSystem.Create` (never bash).
4. **Iteration** — multiple items → ForEach loop with Goto→Label. Single item → simple chain.
5. **Error handling** — retry / skip / stop.

## Step 1: Discover

```bash
robomotion search "<what the flow should do>"       # unified fuzzy+semantic search
robomotion get nodes <keyword> [--in <namespace>]   # find specific nodes
robomotion get packages <keyword>                   # find a package
robomotion docs <namespace>                         # read llms.txt (auth + dos/don'ts)
```

`robomotion docs <namespace>` is MANDATORY for every non-`Core.*` package you use — it carries auth patterns and gotchas that aren't in node schemas.

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

**Before writing code, read the 1–2 pattern docs most relevant to the task (they're on disk under `docs/`):**

- `docs/patterns/browser.md` — MANDATORY for any `Core.Browser.*` flow
- `docs/patterns/loops.md` — ForEach/Label/GoTo
- `docs/patterns/conditions.md` — Function with `outputs: 2`
- `docs/patterns/credentials.md` — any `Credential()` usage
- `docs/patterns/data-tables.md` — Excel / CSV / Sheets

Core rules are already in AGENTS.md. Then verify property names with `robomotion describe node <type>[,<type>...]` before writing.

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

SubFlow/Begin/End schemas are in AGENTS.md — do NOT call `robomotion describe node` for them. Follow the canonical SubFlow example: `subflow.create(name, fn)` with `Begin` → nodes → `End(sfPort: 0)`. SubFlow node ID in the parent equals the subflow filename (no `subflow` property).

### Browser flows — mandatory exploration

If the flow uses `Core.Browser.*`, you MUST explore the page before writing code. **Do this in the main session** — MCP servers are scoped to the main conversation, so `Agent` sub-agents cannot use `mcp__browser__*` tools.

Two ways to explore, in order of preference:

1. **Invoke the `exploring-browser` skill** via the `Skill` tool: `Skill(skill="exploring-browser", args="login to <url>")`. The skill uses `mcp__browser__*` directly, records a sequence with resolved XPaths, and returns JSON you convert to SDK code.
2. **Call `mcp__browser__*` tools inline** if you prefer not to branch into the skill — the tools are in this skill's `allowed-tools`. Minimum sequence: `browser_open` → `browser_navigate` → `browser_snapshot` → action tools (`browser_click`, `browser_type`) → `browser_snapshot` after every page change → `browser_close` to get the recorded sequence JSON.

> **Load schemas before the first call.** `mcp__browser__*` tools are *deferred* — only their names are in the catalog until you pull the schema via `ToolSearch`. Invoking one cold sends empty/malformed JSON over stdio, which crashes `robomotion-browser-mcp` and blacklists ALL browser tools for the rest of the session (they stop appearing in `ToolSearch` results even though `claude mcp list` still says ✓ Connected — that's a fresh probe, not the session's dead pipe). Before your first `browser_*` call, run `ToolSearch query="select:mcp__browser__browser_open,mcp__browser__browser_navigate,mcp__browser__browser_snapshot,mcp__browser__browser_type,mcp__browser__browser_click,mcp__browser__browser_close"` (plus any others you need). If you've already crashed the server, only a Claude Code restart brings the tools back — the connection can't be reattached from inside the session.

If the `browser` MCP server shows `failed` in `/mcp` (or `mcp__browser__*` tools don't surface in your catalog), stop and ask the user to restart Claude Code — do NOT fall back to guessing selectors from `curl` + HTML for production flows. A one-off, plain-HTML form is tolerable as a *last resort*, but verified selectors from a live browser are the norm.

### Credentials

Read `docs/patterns/credentials.md` MANDATORY before writing any `Credential()`. Key rule: `Core.Vault.GetItem` REQUIRES `optCredentials: Credential({vaultId, itemId})` — omitting it fails at runtime.

## Step 4: Validate (MANDATORY)

```bash
robomotion validate <flow-dir>
```

Compiles AND validates. Fix any errors → re-validate. Exit 0 with `✔ <name> validated` on stderr means you're good.

## Step 5: Verify Browser Selectors (if browser flow)

Selectors are verified during exploration (Step 3). If the code changed (different selectors, new actions), re-run the exploration — either `Skill(exploring-browser)` or `mcp__browser__*` inline — against the current page to re-verify before running.

## Step 6: Run

```bash
robomotion run <flow-dir>                      # interactive robot picker
robomotion run <flow-dir> --robot <robot-id>   # scripted
```

Streams agent events until the flow ends; exit code reflects outcome. See `/running-flow` for the full validate → run → observe → fix loop.

When you're satisfied with the flow, `git commit` and `git push` — the flow is persisted via the repo, no "save to cloud" step is needed.

## Related Skills

- `/validating-flow` — schema validation
- `/testing-flow` — behavioral tests
- `/running-flow` — execute on robot
- `/reversing-network` — convert a browser flow to HTTP after capturing traffic
