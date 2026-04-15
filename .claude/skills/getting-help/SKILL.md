---
name: getting-help
description: Shows available skills and quick start guide for Robomotion flow creation. Provides overview of Claude Code features for automation development. Use when user asks for help or wants to know what skills are available.
allowed-tools: Read
---

# /getting-help

Get help with available skills and Claude Code features for Robomotion flow generation.

## Available Skills

### Flow Creation (All-in-One)
- `/creating-flow` - Complete workflow (plan → build → test → commit)

### Flow Creation (Modular)
- `/planning-flow` - Research packages and create plan (read-only)
- `/creating-flow` - Generate TypeScript code from plan
- `/testing-flow` - Validate and test flow

**When to use modular skills:**
- Want fine-grained control over each step
- Iterative development (repeat steps as needed)
- Learning or experimenting with flows
- Complex flows requiring multiple iterations

**When to use /creating-flow:**
- Quick, straightforward flows
- Clear requirements from the start
- One-shot creation without iteration

### Package Discovery
- `/searching-packages` - Search for packages, nodes, templates with Bleve full-text search
- `/validating-flow` - Validate a compiled flow

### Flow Execution
- `/running-flow` - Execute a flow on a robot

### Browser Automation
- `/exploring-browser` - Interactive browser automation with recording

## Quick Start

### 1. Create a Flow
```
I want to create a flow that fetches Reddit posts and saves them to CSV
```

Claude will:
- Search for Reddit packages
- Get node schemas
- Write TypeScript flow using builder SDK
- Compile to .flow format
- Validate the flow
- Run tests (if they exist)
- Git commit with descriptive message
- Offer to run it

### 2. Search for Nodes
```
/searching-packages reddit
```

Uses Bleve full-text search with fuzzy matching and semantic expansion.

### 3. Run a Flow
```
/running-flow
```

Lists available robots, executes the flow, monitors progress.

## MCP Servers

| Server | Purpose | Key Tools |
|--------|---------|-----------|
| **sdk-mcp** | Package discovery, validation, search | `unified_search`, `search_packages`, `search_nodes`, `get_node_schema`, `get_llms_txt`, `validate_flow`, `search_templates`, `get_template` |
| **api-mcp** | Flow execution, credentials | `list_robots`, `run_flow`, `poll_logs`, `vault_list`, `vault_item_list` |
| **browser-mcp** | Browser automation | `browser_open`, `browser_navigate`, `browser_click`, `browser_screenshot` |

### SDK MCP Search Capabilities

The SDK MCP server uses **Bleve** full-text search with:
- **Fuzzy matching** - Tolerates typos (up to 2 char differences)
- **Semantic search** - Expands queries with synonyms (browser → chrome, web, scraping)
- **Multi-source search** - Searches templates, examples, and packages simultaneously
- **Smart ranking** - Multi-factor scoring for relevance

## Golden Rules

1. **Search before writing** - Use `mcp__sdk-mcp__unified_search` or `search_packages` to find nodes
2. **Get package docs** - Use `mcp__sdk-mcp__get_llms_txt` for comprehensive documentation + examples
3. **Check schemas** - Use `mcp__sdk-mcp__get_node_schema` to verify property names
4. **ONLY non-defaults** - Go runtime fills ALL default values from pspec
5. **Loops need Goto→Label** - No implicit continue in visual flows
6. **Use Message() for variables** - Dynamic values require `Message('varName')`
7. **Validate before running** - ALWAYS run `mcp__sdk-mcp__validate_flow`
8. **Test after validation** - Run `bun test` if tests exist
9. **Commit after validation** - Git commit with descriptive message
10. **Check CLAUDE.md first** - Team knowledge for common mistakes

---

## Git & Testing Workflow

### Git Commit After Flow Creation

After successful validation, commit the flow:

```bash
git add {flow-dir}/main.ts
git commit -m "feat: Add {flow-name} flow

- {Description}
- {Key features}

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

### Testing Workflow

1. Validate flow: `mcp__sdk-mcp__validate_flow`
2. Run tests: `bun test` (if tests exist)
3. If tests fail: fix → re-validate → re-test
4. Commit when tests pass

---

## Compilation Flow

1. Write `main.ts` with builder SDK
2. Run: `robomotion build main.ts`
3. Output: JSON to stdout
4. Go runtime fills defaults from pspec
5. Robot executes from `.flow` file

**NO YAML** - Direct JSON output!

## Common Packages

| Package | Use Case |
|---------|----------|
| `Core.Programming` | Data transformation, loops, conditions |
| `Core.Net` | HTTP requests, API calls |
| `Core.Browser` | Web automation |
| `Core.CSV` | CSV file operations |
| `Core.Excel` | Excel file operations |
| `Core.FileSystem` | File/directory operations |
| `Robomotion.SQLite` | SQLite database |
| `Robomotion.Reddit` | Reddit API |
| `Robomotion.GoogleGemini` | Gemini AI |
| `Robomotion.WordPress` | WordPress CMS |

## Getting More Help

- **CLAUDE.md** - Team knowledge base (common mistakes, patterns, workflows)
- **llms.txt** - `mcp__sdk-mcp__get_llms_txt("Package.Name")` for package docs + examples
- `/creating-flow` skill folder - Contains all reference documentation
- `/searching-packages <keyword>` - Find relevant nodes with fuzzy search
- Ask questions about specific nodes or patterns
