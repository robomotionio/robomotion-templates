---
name: searching-packages
description: Searches for Robomotion packages, nodes, templates, and examples using Bleve-powered full-text search with fuzzy matching and semantic expansion. Use when user wants to find packages, explore templates, or understand available automation capabilities.
allowed-tools: Read, mcp__sdk-mcp__*
argument-hint: <query>
---

# /searching-packages

Search for Robomotion packages, nodes, templates, and examples using intelligent full-text search.

## Search Engine Capabilities

The SDK MCP server uses **Bleve** (Go full-text search library) with advanced features:

| Feature | Description |
|---------|-------------|
| **Full-text search** | BM25 ranking across title, name, description, content, keywords |
| **Fuzzy matching** | Levenshtein distance (max 2 chars) - tolerates typos |
| **Semantic search** | Synonym expansion (e.g., "browser" → "chrome", "web", "scraping") |
| **Multi-source search** | Searches rules, templates, and examples simultaneously |
| **Smart ranking** | Multi-factor scoring: text (60%) + fuzzy (20%) + semantic (20%) |

### Built-in Synonyms

The semantic search expands queries automatically:

- `browser` ↔ `chrome`, `firefox`, `web`, `automation`, `scraping`
- `automation` ↔ `robot`, `flow`, `workflow`, `process`
- `wordpress` ↔ `blog`, `cms`, `post`, `article`
- `database` ↔ `sql`, `sqlite`, `query`, `table`
- `email` ↔ `mail`, `smtp`, `send`, `message`
- `file` ↔ `filesystem`, `directory`, `folder`, `path`

## When to Use

- Finding the right package/node for a task
- Exploring available functionality and templates
- Discovering working examples for a use case
- Before writing any flow code

## Usage

```
/searching-packages <query>
```

Examples:
- `/searching-packages http request`
- `/searching-packages excel read`
- `/searching-packages browser click`
- `/searching-packages reddit wordpress` (multi-term)

## MCP Tools Reference

### Package Discovery (3 tools)

| Tool | Purpose |
|------|---------|
| `search_packages` | Search packages by name or functionality |
| `list_packages` | List all available packages (core + external) |
| `get_package_info` | Get detailed package metadata |

### Node/Schema Discovery (3 tools)

| Tool | Purpose |
|------|---------|
| `search_nodes` | Search nodes by keyword across ALL packages |
| `list_nodes` | List all nodes in a specific package |
| `get_node_schema` | Get node properties (names + descriptions) |

### Template & Example Discovery (5 tools)

| Tool | Purpose |
|------|---------|
| `search_templates` | Search templates with filters (packages, patterns, complexity) |
| `list_templates` | List all indexed flow templates |
| `get_template` | Get full template metadata + source code |
| `search_template_examples` | Search template-examples repository |
| `get_template_example` | Get template example source by filename |

### Unified Search (2 tools)

| Tool | Purpose |
|------|---------|
| `unified_search` | Search ALL sources (rules, templates, examples) with fuzzy + semantic |
| `refresh_search_index` | Force rebuild search indexes (pulls git repos) |

### Documentation (1 tool)

| Tool | Purpose |
|------|---------|
| `get_llms_txt` | Get AI guidance (llms.txt) for a package |

## Recommended Workflow

### Step 1: Unified Search (Best Starting Point)

For open-ended queries, use unified search across all sources:

```
mcp__sdk-mcp__unified_search
  query: "wordpress blog automation"
  semantic: true
  fuzzy: true
```

Returns results from rules, templates, and examples with relevance scores (0-100).

### Step 2: Search Specific Nodes

If you know what type of node you need:

```
mcp__sdk-mcp__search_nodes
  query: "http request"
```

Returns matching nodes across all packages.

### Step 3: Get Node Schema

**CRITICAL**: Always verify property names before using them:

```
mcp__sdk-mcp__get_node_schema
  nodeType: "Core.Net.HttpRequest"
```

Shows:
- All input properties (`inUrl`, `inMethod`, etc.)
- All output properties
- Descriptions for each property

### Step 4: Find Working Templates

Search for complete flow examples:

```
mcp__sdk-mcp__search_templates
  query: "reddit"
  complexity: ["beginner", "intermediate"]
```

Or search the template-examples repository:

```
mcp__sdk-mcp__search_template_examples
  query: "reddit wordpress"
  difficulty: "intermediate"
```

### Step 5: Get Template Source Code

Once you find a relevant template:

```
mcp__sdk-mcp__get_template
  filePath: "examples/reddit-wordpress-flow/main.ts"
```

Or for template examples:

```
mcp__sdk-mcp__get_template_example
  file: "reddit-wordpress-blog.ts"
```

### Step 6: Get Package Documentation

For comprehensive package guidance:

```
mcp__sdk-mcp__get_llms_txt
  namespace: "Robomotion.WordPress"
```

Returns llms.txt documentation with patterns, best practices, and examples.

## Package Categories

| Task Type | Packages |
|-----------|----------|
| Web automation | `Core.Browser` |
| API calls | `Core.Net` |
| File operations | `Core.FileSystem`, `Core.CSV`, `Core.Excel` |
| Database | `Robomotion.SQLite` |
| Email | `Core.Mail` |
| Data transform | `Core.Programming` |
| Flow control | `Core.Flow`, `Core.Programming` |
| Credentials | `Core.Vault` |
| FTP/SFTP | `Core.FTP` |
| Desktop | `Core.Keyboard`, `Core.Mouse`, `Core.Clipboard` |
| Dialogs | `Core.Dialog` |
| AI Services | `Robomotion.GoogleGemini` |
| Social Media | `Robomotion.Reddit` |
| CMS | `Robomotion.WordPress` |

## Action Quick Reference

| I want to... | Search for |
|--------------|------------|
| Open browser | `browser` |
| Navigate to URL | `browser` |
| Click button | `browser click` |
| Fill form | `browser setvalue` |
| Get page text | `browser getvalue` |
| Extract table | `browser scrapetable` |
| Make API call | `http request` |
| Read CSV | `csv read` |
| Write CSV | `csv write` |
| Loop over items | `foreach` |
| Transform data | `function` |
| Wait/delay | `delay` or `sleep` |
| SQLite query | `sqlite` |
| Send email | `mail` |
| Reddit API | `reddit` |
| Gemini AI | `gemini` |
| WordPress | `wordpress` |

## Search Tips

### Fuzzy Matching

Tolerates up to 2 character differences:
- `wordpres` → finds `wordpress`
- `browsr` → finds `browser`
- `excell` → finds `excel`

### Semantic Expansion

Your query is automatically expanded with synonyms:
- Searching `browser` also searches `chrome`, `web`, `scraping`
- Searching `email` also searches `mail`, `smtp`

### Filtering Results

Use filters to narrow results:

```
mcp__sdk-mcp__search_templates
  query: "automation"
  packages: ["Core.Browser", "Robomotion.Reddit"]
  patterns: ["loop", "browser-automation"]
  complexity: ["intermediate"]
  minNodeCount: 5
  maxNodeCount: 20
```

## Example Session

User: `/searching-packages reddit wordpress`

Response:
```
Using unified search across all sources...

mcp__sdk-mcp__unified_search
  query: "reddit wordpress"
  semantic: true
  fuzzy: true

Results (sorted by relevance):

1. [Template] reddit-wordpress-blog (Score: 87)
   Fetches Reddit posts and publishes to WordPress
   Packages: Robomotion.Reddit, Robomotion.WordPress

2. [Example] reddit-to-wordpress.ts (Score: 72)
   Complete flow for Reddit → WordPress pipeline

3. [Rule] WordPress Publishing Pattern (Score: 65)
   Best practices for WordPress automation

Found packages:
- Robomotion.Reddit (4 nodes)
- Robomotion.WordPress (5 nodes)

Would you like to see the template source or node schemas?
```

## Caching Behavior

The SDK MCP server uses 3-tier caching:

| Cache Level | TTL | Purpose |
|-------------|-----|---------|
| In-memory | 1 hour | Package specs, HTTP responses |
| Disk cache | 24 hours | Package index, template index |
| Search index | 5 minutes | Bleve indexes, fuzzy matchers |

Use `refresh_search_index` to force rebuild if needed.

## Related Skills

- `/creating-flow` - Generate a flow using found nodes
- `/validating-flow` - Check compiled flow
