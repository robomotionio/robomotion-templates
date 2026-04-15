# Robomotion Flow Builder

RPA platform with TypeScript SDK and visual node editor. Create, validate, and execute automation flows using builder SDK + MCP tools.

## Core Principles

1. **Import from `@robomotion/sdk` only** — `flow`, `Message`, `Custom`, `Credential`, `JS`, `Global`
2. **`f.node(id, type, name, props)`** — correct param order, 6-char hex IDs
3. **Only non-default properties** — Go runtime fills ALL defaults from pspec. *Pspec is the source of truth; emitting defaults shadows future schema changes.*
4. **`Message()` for variables, `Custom()` for literals, `JS()` for one-liner Javascript, `Credential()` for secrets**
5. **`func` is literal string** (NOT `JS()`), enum props are plain strings (NOT `Custom()`)
6. **Loops: Label -> ForEach -> body -> GoTo** — visual flows have no implicit loop
7. **Verify before coding** — use `robomotion describe node <type>` (or `robomotion search <query>`) to get schemas, NEVER guess property names. *Guessed names fail validation silently when the real property has a different scope or casing.*
8. **Self-contained flows** — NEVER use bash to create dirs/files; use `Core.FileSystem.Create`
9. **`addDependency` for non-`Core.*` packages** — every non-`Core.*` package needs `f.addDependency(ns, ver)`. When updating existing flows: NEVER change existing versions, only add missing ones with latest. *Without `addDependency`, the Designer shows an empty version field and the robot can't resolve the package.*
10. **NEVER use `ScrapeList` or `ScrapeTable`** — `Core.Browser.ScrapeList` and `Core.Browser.ScrapeTable` are unreliable. Use `Core.Browser.RunScript` to extract data in Data Table format instead.
11. **ES5 only in `func`** — no `=>`, no `` ` ``, no `const`/`let`, no destructuring. Use `var`, `function()`, string concat (`+`)
12. **Function nodes are NOT Node.js** — no `require()`, `fs`, `Buffer`, `process`. Pure JS sandbox only
13. **`Core.Programming.If` does NOT exist** — use `Core.Programming.Function` with `outputs: 2` for conditionals
14. **Terminal nodes have 0 outputs** — `Debug`, `Log`, `Stop`, `GoTo`, `End`, `WaitGroup.Done` cannot chain `.then()` AFTER them. You can wire TO them; NEVER FROM them. In loops: GoTo ends the body chain — Stop must be a standalone `f.node()` wired via `f.edge()` on ForEach port 1. *The builder throws "Cannot chain from node (outputs=0)" at compile time, so any chained Debug inside a body breaks the whole flow.*
15. **Common properties use literal values** — `delayBefore: 2`, `delayAfter: 0.5`, `continueOnError: true` — NOT `Custom()`
16. **System variables only work in `global.get()`** — `$Home$`, `$TempDir$` must be resolved via `global.get('$Home$')` in Function nodes
17. **Library projects use `library.create()`** — Begin/End nodes, not `flow.create()` with Inject/Stop
18. **GoTo is `Core.Flow.GoTo`** (capital T) — uses `optNodes: { ids: [...], type: 'goto', all: false }`, NOT `inLabel`

## Common Mistakes

### Syntax
| Mistake | Consequence | Fix |
|---------|-------------|-----|
| `f.node('id', 'Start', {type: '...'})` | Wrong param order | `f.node(id, type, name, props)` |
| `func: JS(\`return msg;\`)` or `func: Custom(\`...\`)` | Validation fails | `func: \`return msg;\`` (literal string) |
| `optType: Custom('directory')` | OnCreate failure, empty flow_id | `optType: 'directory'` (plain string) |
| `delayAfter: Custom('2')` | Parse error | `delayAfter: 2` (literal value) |
| Missing `return msg;` in func | Data lost, next node gets nothing | Always `return msg;` |
| Arrow functions / template literals in `func` | Sandbox parse error | Use `var`, `function()`, string concat (`+`) |
| `require('fs')` in Function | Runtime crash | Use `Core.FileSystem.*` nodes |

### Terminal chaining
| Mistake | Consequence | Fix |
|---------|-------------|-----|
| Chain `.then()` after Debug/Log/Stop/GoTo/End | Compile error (`lastNode.outputs === 0`) | Wire TO terminals; attach Debug/Log via `f.edge()` from a non-terminal |
| Missing Goto in loop | Loop runs once | Label → ForEach → body → GoTo |
| `inLabel` on GoTo node | Property doesn't exist | `optNodes: { ids: [...], type: 'goto', all: false }` |
| `Core.Programming.If` | Node doesn't exist | `Core.Programming.Function` with `outputs: 2` |

### Credentials
| Mistake | Consequence | Fix |
|---------|-------------|-----|
| Writing credential code without loading doc | Wrong `Credential()` pattern | `get_reference_doc(doc='credentials')` FIRST |
| Using `optApiKey` vs `inCredentials` wrong | Auth failure | Verify with `robomotion describe node <type>` first |
| Missing `optCredentials` on `Core.Vault.GetItem` | "Vault has to be selected" error | `optCredentials: Credential({vaultId, itemId})` REQUIRED |

### System variables / scope
| Mistake | Consequence | Fix |
|---------|-------------|-----|
| `inPath: Custom('$Home$/file.xlsx')` | Literal string, not resolved | `global.get('$Home$') + '/file.xlsx'` in Function node |
| `ScrapeList` / `ScrapeTable` | Unreliable | Use `RunScript` returning `{ columns, rows }` JSON |

### Library vs flow
| Mistake | Consequence | Fix |
|---------|-------------|-----|
| Using Inject/Stop in Library | Library won't work | Use Begin/End — libraries are subflows |
| Using `flow.create()` in Library | Library won't compile | Use `library.create(id, name, fn)` |

### Dependencies
| Mistake | Consequence | Fix |
|---------|-------------|-----|
| Missing `addDependency` for non-Core | Empty version in Designer | `f.addDependency('Ns', 'vN.N.N')` |
| Bumping existing `addDependency` version | Breaks pinned dependency | NEVER change existing versions |

### Wrong node names
| Mistake | Consequence | Fix |
|---------|-------------|-----|
| Any wrong node name (CSV.Read, Flow.Goto, Programming.Log/RandomSleep, Browser.Click/Type/GetCookie, …) | Node not found, schema lookup fails | See `docs/reference/node-naming.md` |

## Quick Reference Map

Pattern docs live on disk under `docs/`. Read them directly.

| Topic | File |
|-------|------|
| SDK syntax & grammar (incl. terminal nodes) | docs/sdk-grammar.md |
| Architecture | docs/architecture.md |
| Loop patterns | docs/patterns/loops.md |
| Conditions | docs/patterns/conditions.md |
| Credentials | docs/patterns/credentials.md |
| Browser automation (incl. proxy) | docs/patterns/browser.md |
| Exception handling | docs/patterns/exceptions.md |
| Branches & parallel | docs/patterns/branches.md |
| Subflows | docs/patterns/subflows.md |
| Data tables | docs/patterns/data-tables.md |
| Captcha solving | docs/patterns/captcha.md |
| System variables | docs/reference/system-variables.md |
| Node naming (wrong → correct) | docs/reference/node-naming.md |
| Credential categories (field layouts) | docs/reference/credential-categories.md |

For schemas, examples, and package docs use the `robomotion` CLI:

| Need | Command |
|------|---------|
| Cross-source fuzzy/semantic search | `robomotion search <query>` |
| List / filter packages | `robomotion get packages [query]` |
| List / filter nodes | `robomotion get nodes [query] [--in <ns>]` |
| List / filter templates, examples | `robomotion get templates/examples [query]` |
| Full node schema + docs + example | `robomotion describe node <type>[,<type>...]` |
| Package info | `robomotion describe package <namespace>` |
| Template / example source | `robomotion describe template \| example <name>` |
| Package docs (llms.txt) | `robomotion docs <namespace>` |
| Grep package docs | `robomotion docs <namespace> --grep <pattern>` |
| List vaults | `robomotion get vaults` |
| List items in a vault | `robomotion get vault-items <vault-id>` |
| List robots | `robomotion get robots` |

## Available Skills

| Skill | Purpose | Load with |
|-------|---------|-----------|
| `/creating-flow` | Create flows: plan → build → validate → run | `get_skill('creating-flow')` |
| `/running-flow` | Execute flow on robot | `get_skill('running-flow')` |
| `/testing-flow` | Write and run behavioral tests | `get_skill('testing-flow')` |
| `/validating-flow` | Schema validation | `get_skill('validating-flow')` |
| `/searching-packages` | Find packages, nodes, templates | `get_skill('searching-packages')` |
| `/exploring-browser` | Interactive browser automation | `get_skill('exploring-browser')` |
| `/reversing-network` | Reverse-engineer browser traffic to HTTP | `get_skill('reversing-network')` |

## CLI & MCP Servers

The Robomotion binaries live on `PATH` (Mac, Windows, Linux). Always call them by their bare name — never with absolute paths.

| Binary | Purpose |
|--------|---------|
| `robomotion` | Self-sufficient CLI. Builds, validates, runs, searches, inspects. See `robomotion help` for the full verb list. |
| `robomotion-browser-mcp` | MCP server for interactive browser exploration. Used inside `discover_browser_flow` and via `mcp__browser__*` tools when the `/exploring-browser` skill is active. |

No other MCP servers are required. `robomotion` shells out to `robomotion-sdk-mcp` internally for search-backed commands, and calls `api.robomotion.io` directly for run/stop/vault/robot operations.

### CLI verbs

| Verb | Purpose |
|------|---------|
| `robomotion build` | compile flow to merged JSON |
| `robomotion validate` | pspec-check without emitting JSON |
| `robomotion run` | submit + stream agent-mode events |
| `robomotion stop` | stop the flow currently running on a robot |
| `robomotion search` | fuzzy + semantic cross-source search |
| `robomotion get <resource>` | list / filter — packages, nodes, templates, examples, vaults, vault-items, robots |
| `robomotion describe <resource>` | detailed view — node, package, template, example |
| `robomotion docs <namespace>` | read or grep llms.txt |
| `robomotion install` / `skills` / `version` | admin |

## Per-Turn Reminders

The five drift-prone rules to re-check before EVERY `Write`/`Edit` that emits flow code:

- **NEVER output TypeScript as chat text** — always use `Write`/`Edit`. Natural-language plans and explanations stay in chat.
- `f.node(id, type, name, props)` — param order. `.then()` for sequential, `.edge()` for multi-port.
- `Message(variable)` for variables · `Custom(literal)` for literals · `Credential({vaultId, itemId})` for secrets · `func` is a literal string (not `JS()`) · enum props are plain strings (not `Custom()`).
- Loops require `Label → ForEach → body → GoTo(label_id)`. GoTo is terminal; `Stop` hangs off ForEach port 1 via `f.edge()`.
- Every flow ends with `.start()` (libraries use `library.create()` and omit `.start()`).

## Workflow

1. **Gather requirements** — credentials (`robomotion get vaults` + `robomotion get vault-items <id>`), URLs, files, iteration, errors
2. **Discover** — `robomotion search <description>` for templates/nodes that match; `robomotion get nodes <keyword>` for specific nodes
3. **Read package docs** — `robomotion docs <namespace>` — MANDATORY per non-`Core.*` package used
4. **Browser?** — if browser automation: `discover_browser_flow(description, url)` MANDATORY
5. **Read pattern docs** — read 1-2 topic-relevant files from `docs/patterns/*.md` or `docs/reference/*.md`
6. **Load skill** — for non-standard workflows (CAPTCHA, network reversal), call `get_skill(name)` first
7. **Verify schemas** — `robomotion describe node <type>[,<type>...]` before writing main.ts
8. **Write flow** with the `Write` tool
9. **Validate** — `robomotion validate <flow-dir>` (MANDATORY before run)
10. **Verify selectors** — if browser flow: query EVERY selector on live page MANDATORY
11. **Run** — `robomotion run <flow-dir>` streams agent events until completion. Commit + `git push` to persist.

## Canonical Examples

### Simple Chain

```typescript
import { flow, Message, Custom } from '@robomotion/sdk';

const myFlow = flow.create('main', 'Simple Flow', (f) => {
  f.node('42ec21', 'Core.Trigger.Inject', 'Start', {})
    .then('7dbafc', 'Core.Programming.Function', 'Setup', {
      func: `msg.url = 'https://example.com'; return msg;`
    })
    .then('a06926', 'Core.Browser.Open', 'Open Browser', {
      outBrowserId: Message('browser_id')
    })
    .then('8e1c4b', 'Core.Browser.OpenLink', 'Navigate', {
      inBrowserId: Message('browser_id'),
      inUrl: Message('url'),
      outPageId: Message('page_id')
    })
    .then('d52f73', 'Core.Browser.Close', 'Close', {
      inBrowserId: Message('browser_id')
    })
    .then('b9a841', 'Core.Flow.Stop', 'Stop', {});
});

myFlow.start();
```

### Loop (ForEach with Goto->Label)

```typescript
import { flow, Message, Custom } from '@robomotion/sdk';

const myFlow = flow.create('main', 'Loop Flow', (f) => {
  f.node('42ec21', 'Core.Trigger.Inject', 'Start', {})
    .then('7dbafc', 'Core.Programming.Function', 'Setup', {
      func: `msg.items = [1, 2, 3]; return msg;`
    })
    .then('a06926', 'Core.Flow.Label', 'Next Item', {})
    .then('8e1c4b', 'Core.Programming.ForEach', 'For Each', {
      optInput: Message('items'),
      optOutput: Message('item')
    });

  // Loop body (port 0)
  f.node('d52f73', 'Core.Programming.Function', 'Process', {
    func: `console.log('Item:', msg.item); return msg;`
  })
    .then('c47e90', 'Core.Flow.GoTo', 'Continue', {
      optNodes: { ids: ['a06926'], type: 'goto', all: false }
    });

  f.edge('8e1c4b', 0, 'd52f73', 0);  // Port 0: loop body

  // After loop (port 1)
  f.node('5f2d18', 'Core.Flow.Stop', 'Stop', {});
  f.edge('8e1c4b', 1, '5f2d18', 0);  // Port 1: done
});

myFlow.start();
```

### Conditional (Function with outputs: 2)

```typescript
import { flow, Message } from '@robomotion/sdk';

const myFlow = flow.create('main', 'Conditional Flow', (f) => {
  f.node('42ec21', 'Core.Trigger.Inject', 'Start', {})
    .then('7dbafc', 'Core.Programming.Function', 'Check Value', {
      outputs: 2,
      func: `
        if (msg.value > 10) {
          return [msg, null];  // Port 0: true
        }
        return [null, msg];    // Port 1: false
      `
    });

  f.node('a06926', 'Core.Flow.Stop', 'True Branch', {});
  f.edge('7dbafc', 0, 'a06926', 0);

  f.node('d8b90a', 'Core.Flow.Stop', 'False Branch', {});
  f.edge('7dbafc', 1, 'd8b90a', 0);
});

myFlow.start();
```

### SubFlow (Begin/End/SubFlow pattern)

**Subflow file** (`subflows/7dbafc.ts`) — use `subflow.create()`, NOT `flow.create()`:

```typescript
import { subflow, Message } from '@robomotion/sdk';

subflow.create('My SubFlow', (f) => {
  f.node('42ec21', 'Core.Flow.Begin', 'Begin', {})
    // ← PLACEHOLDER: replace with actual task nodes (e.g. OpenLink+RunScript for browser, HttpRequest for API)
    .then('a3f21c', 'Core.Programming.Function', 'Process', {
      func: `msg.result = msg.input; return msg;`
    })
    .then('e4f6c8', 'Core.Flow.End', 'End', { sfPort: 0 });
});
```

**Parent flow** (`main.ts`) — SubFlow node ID must match the subflow filename:

```typescript
import { flow } from '@robomotion/sdk';

flow.create('main', 'Main with SubFlow', (f) => {
  f.node('inject', 'Core.Trigger.Inject', 'Start', {})
    .then('7dbafc', 'Core.Flow.SubFlow', 'My SubFlow', {})  // '7dbafc' → subflows/7dbafc.ts
    .then('stop', 'Core.Flow.Stop', 'Stop', {});
}).start();
```

Key rules: `subflow.create(name, fn)` (no ID, no `.start()`) • Begin (entry) → nodes → End (`sfPort: 0`) • SubFlow node ID = subflow filename (no `subflow` property needed)

### Error Handling (Catch pattern)

```typescript
import { flow, Message, Custom } from '@robomotion/sdk';

flow.create('main', 'Error Handling', (f) => {
  // Main flow
  f.node('42ec21', 'Core.Trigger.Inject', 'Start', {})
    .then('7dbafc', 'Core.Net.HttpRequest', 'Fetch', {
      optUrl: Custom('https://api.example.com/data'),
      optMethod: 'GET',
      outBody: Message('response'),
    })
    .then('a06926', 'Core.Flow.Stop', 'Stop', {});

  // Error handler — STANDALONE node, NEVER chain with .then() from main flow
  f.node('c3f81b', 'Core.Trigger.Catch', 'Catch Error', {
    optNodes: { ids: ['7dbafc'], all: false }  // ids = GUIDs of nodes to monitor
  });
  f.node('d5e2a4', 'Core.Programming.Function', 'Handle Error', {
    func: `msg.errorMsg = msg.error || 'unknown'; return msg;`
  });
  f.node('e1f392', 'Core.Flow.Stop', 'Error Stop', {});
  f.edge('c3f81b', 0, 'd5e2a4', 0);
  f.edge('d5e2a4', 0, 'e1f392', 0);
}).start();
```

Key rules: `Core.Trigger.Catch` is a standalone trigger — `f.node()` only, NEVER `.then()` • `optNodes.ids` = array of monitored node GUIDs • `optNodes.all = true` catches ALL nodes in scope • connect with `f.edge()`, not `.then()`
