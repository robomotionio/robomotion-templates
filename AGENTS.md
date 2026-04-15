# Robomotion Flow Builder

RPA platform with TypeScript SDK and visual node editor. Create, validate, and execute automation flows using builder SDK + MCP tools.

## Core Principles

1. **Import from `@robomotion/sdk` only** — `flow`, `Message`, `Custom`, `Credential`, `JS`, `Global`
2. **`f.node(id, type, name, props)`** — correct param order, 6-char hex IDs
3. **Only non-default properties** — Go runtime fills ALL defaults from pspec
4. **`Message()` for variables, `Custom()` for literals, `JS()` for one-liner Javascript, `Credential()` for secrets**
5. **`func` is literal string** (NOT `JS()`), enum props are plain strings (NOT `Custom()`)
6. **Loops: Label -> ForEach -> body -> GoTo** — visual flows have no implicit loop
7. **Verify before coding** — use `plan_flow` or `get_node_cards` to get schemas, NEVER guess property names
8. **Self-contained flows** — NEVER use bash to create dirs/files; use `Core.FileSystem.Create`
9. **`addDependency` for non-`Core.*` packages** — every non-`Core.*` package needs `f.addDependency(ns, ver)`. When updating existing flows: NEVER change existing versions, only add missing ones with latest.
10. **NEVER use `ScrapeList` or `ScrapeTable`** — `Core.Browser.ScrapeList` and `Core.Browser.ScrapeTable` are unreliable. Use `Core.Browser.RunScript` to extract data in Data Table format instead.
11. **ES5 only in `func`** — no `=>`, no `` ` ``, no `const`/`let`, no destructuring. Use `var`, `function()`, string concat (`+`)
12. **Function nodes are NOT Node.js** — no `require()`, `fs`, `Buffer`, `process`. Pure JS sandbox only
13. **`Core.Programming.If` does NOT exist** — use `Core.Programming.Function` with `outputs: 2` for conditionals
14. **Terminal nodes have 0 outputs** — `Debug`, `Log`, `Stop`, `GoTo`, `End` cannot chain `.then()` AFTER them. You can wire TO them; NEVER FROM them. In loops: GoTo ends the body chain — Stop must be a standalone `f.node()` wired via `f.edge()`
15. **Common properties use literal values** — `delayBefore: 2`, `delayAfter: 0.5`, `continueOnError: true` — NOT `Custom()`
16. **System variables only work in `global.get()`** — `$Home$`, `$TempDir$` must be resolved via `global.get('$Home$')` in Function nodes
17. **Library projects use `library.create()`** — Begin/End nodes, not `flow.create()` with Inject/Stop
18. **GoTo is `Core.Flow.GoTo`** (capital T) — uses `optNodes: { ids: [...], type: 'goto', all: false }`, NOT `inLabel`

## Common Mistakes

| Mistake | Consequence | Fix |
|---------|-------------|-----|
| `f.node('id', 'Start', {type: '...'})` | Wrong param order | `f.node(id, type, name, props)` |
| `func: JS(\`return msg;\`)` or `func: Custom(\`...\`)` | Validation fails | `func: \`return msg;\`` (literal string) |
| `optType: Custom('directory')` | OnCreate failure, empty flow\_id | `optType: 'directory'` (plain string) |
| Missing `return msg;` in func | Data lost, next node gets nothing | Always `return msg;` |
| Arrow functions / template literals in `func` | Sandbox parse error | Use `var`, `function()`, string concat (`+`) |
| `require('fs')` in Function | Runtime crash | Use Core.FileSystem nodes |
| Chain `.then()` after Debug/Log/Stop/GoTo/End | Compile error (lastNode.outputs === 0) | These are terminal (0 outputs); wire TO them, NEVER `.then()` FROM them |
| Missing Goto in loop | Loop runs once | Label→ForEach→body→GoTo |
| `Core.Programming.If` | Node doesn't exist | Function with `outputs: 2` |
| `ScrapeList` / `ScrapeTable` | Unreliable | Use `RunScript` with Data Table format |
| `delayAfter: Custom('2')` | Parse error | `delayAfter: 2` (literal value) |
| `inPath: Custom('$Home$/file.xlsx')` | Literal string, not resolved | `global.get('$Home$') + '/file.xlsx'` in Function |
| Using Inject/Stop in Library | Library won't work | Use Begin/End — libraries are subflows |
| Using `flow.create()` in Library | Library won't compile | Use `library.create(id, name, fn)` |
| Missing `addDependency` for non-Core | Empty version in designer | `f.addDependency('Ns', 'vN.N.N')` |
| Bumping existing `addDependency` version | Breaks pinned dependency | NEVER change existing versions |
| `Core.CSV.Read` / `Core.CSV.Write` / `Core.CSV.Append` | Node not found, schema lookup fails | Use `Core.CSV.ReadCSV`, `Core.CSV.WriteCSV`, `Core.CSV.AppendCSV` |
| `Core.Flow.Goto` (lowercase t) | Node not found | `Core.Flow.GoTo` (capital T) |
| `Core.Programming.Log` | Node doesn't exist | Use `Core.Flow.Log` (0 outputs, property: `inText`) or `Core.Programming.Debug` |
| `Core.Browser.Click` | Node doesn't exist | Use `Core.Browser.ClickElement` |
| `Core.Browser.Type` | Node doesn't exist | Use `Core.Browser.TypeText` |
| `Core.Browser.GetCookie` (singular) | Node doesn't exist | Use `Core.Browser.GetCookies` (plural, property: `outCookies`) |
| `Core.Programming.RandomSleep` / `Core.Programming.Delay` | Node doesn't exist | Use `Core.Programming.Sleep` with `optRandom: true`, `optRandMin`, `optRandMax` |
| `inLabel` on GoTo node | Property doesn't exist | `optNodes: { ids: [...], type: 'goto', all: false }` |
| Writing credential code without loading doc | Wrong Credential() pattern | `get_reference_doc(doc='credentials')` FIRST |
| Using `optApiKey` vs `inCredentials` wrong | Auth failure | Verify with `get_node_cards` first |
| Missing `optCredentials` on `Core.Vault.GetItem` | "Vault has to be selected" error | `optCredentials: Credential({vaultId, itemId})` REQUIRED |

## Quick Reference Map

Load these with `get_reference_doc(doc='<topic>')` BEFORE writing code.

| Topic | `doc` param | Where to Look |
|-------|------------|--------------|
| SDK syntax & grammar | `sdk-grammar` | docs/sdk-grammar.md |
| Loop patterns | `loops` | docs/patterns/loops.md |
| Conditions | `conditions` | docs/patterns/conditions.md |
| Credentials | `credentials` | docs/patterns/credentials.md |
| Browser automation | `browser` | docs/patterns/browser.md |
| Exception handling | `exceptions` | docs/patterns/exceptions.md |
| Branches & parallel | `branches` | docs/patterns/branches.md |
| Subflows | `subflows` | docs/patterns/subflows.md |
| Data tables | `data-tables` | docs/patterns/data-tables.md |
| Captcha solving | `captcha` | docs/patterns/captcha.md |
| Proxy config | `proxy` | docs/patterns/proxy.md |
| System variables | `system-variables` | docs/reference/system-variables.md |
| Common packages | `packages` | docs/reference/packages.md |
| Terminal nodes | `terminal-nodes` | docs/reference/terminal-nodes.md |
| Architecture | `architecture` | docs/architecture.md |
| Node schemas & examples | — | Use `get_node_cards(nodeTypes[])` |
| Package overview | — | Use `plan_flow(description)` |
| Package docs (compact) | — | `get_llms_txt(namespace)` — compact header: description, auth, dos/don'ts (~10 lines). MANDATORY for every package |
| Full package docs | — | `get_llms_txt(namespace, full=true)` — complete documentation with all node sections |
| Single node docs | — | `get_llms_txt(namespace, section='NodeName')` — one node's section only |

## Available Skills

| Skill | Purpose | Load with |
|-------|---------|-----------|
| `/creating-flow` | Create flows: plan → build → validate → deploy | `get_skill('creating-flow')` |
| `/planning-flow` | Research packages and create plan | `get_skill('planning-flow')` |
| `/running-flow` | Execute flow on robot | `get_skill('running-flow')` |
| `/saving-flow` | Save flow to cloud | `get_skill('saving-flow')` |
| `/testing-flow` | Write and run behavioral tests | `get_skill('testing-flow')` |
| `/validating-flow` | Schema validation | `get_skill('validating-flow')` |
| `/searching-packages` | Find packages and nodes | `get_skill('searching-packages')` |
| `/exploring-browser` | Interactive browser automation | `get_skill('exploring-browser')` |

## MCP Tools

| Tool | Purpose |
|------|---------|
| `plan_flow` | Get packages + node cards + template for a description |
| `get_node_cards` | Batch schema + docs for specific node types |
| `validate_flow` | Compile + validate against pspec schemas |
| `search_packages` | Find packages by keyword |
| `search_nodes` | Find nodes across all packages |
| `get_llms_txt` | Full package documentation |
| `generate_dependencies` | Get dependency namespaces + latest versions from node types |
| `unified_search` | Cross-source search (templates, examples, rules) |
| `list_robots` | List available robots |
| `run_flow` | Execute flow on a robot |
| `save_flow` | Save compiled flow to cloud |
| `vault_list` | List credential vaults |
| `vault_item_list` | List items in a vault |
| `get_reference_doc` | Load a reference doc by topic (browser, loops, conditions, etc.) |
| `get_skill` | Load a skill's full instructions by name |
| `discover_browser_flow` | Explore site with sub-agent (browser tools only available here) |

## Advanced Techniques

Call `get_skill` before writing code that requires special handling:

| Scenario | Call |
|----------|------|
| Reverse-engineer browser traffic to HTTP | `get_skill('technique-network-reversal')` |

## Workflow

1. **Gather requirements** — credentials (`vault_list`), URLs, files, iteration, errors
2. **Plan** — `plan_flow(description)` — returns packages, node cards, template, AND package docs (llms.txt headers) for all matched packages
3. **Read package docs** — `plan_flow` includes llms.txt automatically. For packages added later, call `get_llms_txt(namespace)` — this is MANDATORY for every package used in the flow
4. **Browser?** — if browser automation: `discover_browser_flow(description, url)` MANDATORY
5. **Get approval** — output plan as text, then `AskUserQuestion` ("Build it" / "Modify plan")
6. **Read reference docs** — `get_reference_doc` for 1-2 topic-relevant pattern docs
7. **Load skill** — for non-standard workflows (run, save, search, CAPTCHA, proxy), call `get_skill(name)` first
8. **Write flow** — verify schemas with `get_node_cards` first, then write main.ts
9. **Validate** — `validate_flow(flowPath)` — compiles + validates (MANDATORY before save/run)
11. **Verify selectors** — if browser flow: query EVERY selector on live page MANDATORY
12. **Save or run** — `save_flow` / `run_flow`

> **"NEVER output code" means TypeScript/JSON source code.** You MUST still output natural-language plans and explanations as chat text.

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
