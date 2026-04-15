---
name: planning-flow
description: Researches packages and creates implementation plans for Robomotion flows. Read-only exploration of available packages, nodes, and schemas. Use when user wants to plan a flow before building it.
allowed-tools: Read, Glob, Grep, mcp__sdk-mcp__*, mcp__api__vault_list, mcp__api__vault_item_list, mcp__browser__*
argument-hint: [flow-description]
---

# /planning-flow

Research packages and create an implementation plan for a Robomotion flow.

**This is a READ-ONLY skill** — No code generation, just research and planning.

## Step 1: Understand Requirements

Ask clarifying questions to gather all requirements.

### Credential Discovery (MANDATORY)

**If ANY node in the flow requires credentials, you MUST:**

1. **List available vaults** using `vault_list`
2. **List items** in the likely vault using `vault_item_list`
3. **Pick the best match** based on service name and item name
4. **Add to plan** — include vault_id and item_id
5. **User corrects if wrong** — they'll tell you to change or pick different ones

Do NOT ask the user to select via options buttons. Just discover, pick the best match, and put it in the plan.

### Other Requirements

- **URLs/Endpoints** — Target websites or API endpoints. Ask user if not specified.
- **Files** — Input/output paths. Output dirs MUST be created by the flow using `Core.FileSystem.Create` (never bash).
- **Iteration** — Multiple items -> ForEach loop. Pagination -> while loop. Single item -> simple chain.
- **Error Handling** — Retry, skip, or stop on failure.

### Browser Flow Discovery (MANDATORY)

If the flow involves browser automation (`Core.Browser.*` nodes):

1. DO NOT plan selectors by guessing — you MUST explore the site first
2. Use `/exploring-browser` to walk through the target site
3. Discover ALL selectors, page transitions, and dynamic elements interactively
4. Only THEN include verified selectors and flow structure in your plan

## Step 2: Search Packages and Templates

```
mcp__sdk-mcp__unified_search
  query: "reddit wordpress blog"
  semantic: true
  fuzzy: true
```

For direct package search: `search_packages(query)`.
For node schemas: `get_node_cards(nodeTypes[])`.
For package docs: `get_llms_txt(namespace)` — MANDATORY for every package used. Returns compact header with description, auth patterns, dos/don'ts.
For templates: `search_templates(query)` or `search_template_examples(query)`.

## Step 3: Present Plan

```markdown
## Flow Plan: [Flow Name]

### Requirements Resolved
- **Credentials:** Service A: vaultId=`xxx`, itemId=`yyy`
- **URLs:** https://example.com
- **Files:** Output: /path/to/output/
- **Iteration:** ForEach loop over items
- **Error Handling:** Skip errors, log failures

### Flow Structure
1. **Start** -> Core.Trigger.Inject
2. **Initialize** -> Core.Programming.Function
3. **Loop Label** -> Core.Flow.Label
4. **For Each** -> Core.Programming.ForEach (port 0: body, port 1: done)
5. **Process** -> [describe]
6. **Goto** -> Core.Flow.GoTo (back to Label)
7. **Stop** -> Core.Flow.Stop

### Packages Used
- **Core.Programming:** Function, ForEach
- **Core.Net:** HTTPRequest

### Node Properties (Verified)
- **Core.Programming.Function:** func, outputs, optTimeout
```

Then use `AskUserQuestion` for approval:
```
question: "Ready to build this flow?"
options:
  - "Build it"
  - "Modify plan"
```

**When user selects "Build it":** Immediately invoke `/creating-flow` to generate the TypeScript code. Do NOT wait for another message.

**When user selects "Modify plan":** Ask what they want to change, revise the plan, and present it again.

## Allowed Operations (READ-ONLY)

**Allowed:** `search_packages`, `search_nodes`, `list_nodes`, `get_node_cards`, `get_llms_txt`, `unified_search`, `search_templates`, `get_template`, `vault_list`, `vault_item_list`, Read files, Ask questions

**Blocked:** Write/edit flow files, Run flows, Git operations, Any destructive operations

## Related Skills

- `/creating-flow` — Generate TypeScript from this plan
- `/searching-packages` — Deep dive into package discovery
