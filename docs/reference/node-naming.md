# Node Naming Reference

AI models frequently invent or misspell node names. Verify the exact name with `get_node_cards(nodeTypes[])` or `search_nodes(query)` before writing.

This table lists the most common wrong names we have seen, the correct canonical name, and why the wrong form fails.

| Wrong | Correct | Why |
|-------|---------|-----|
| `Core.CSV.Read` | `Core.CSV.ReadCSV` | Node not found — CSV nodes use `…CSV` suffix |
| `Core.CSV.Write` | `Core.CSV.WriteCSV` | Node not found — CSV nodes use `…CSV` suffix |
| `Core.CSV.Append` | `Core.CSV.AppendCSV` | Node not found — CSV nodes use `…CSV` suffix |
| `Core.Flow.Goto` | `Core.Flow.GoTo` | Capital T in `GoTo`; lowercase variant is not a registered type |
| `Core.Programming.Log` | `Core.Flow.Log` **or** `Core.Programming.Debug` | `Core.Programming.Log` does not exist. `Core.Flow.Log` takes `inText` (0 outputs). `Core.Programming.Debug` takes `optDebugData` (0 outputs) |
| `Core.Programming.RandomSleep` | `Core.Programming.Sleep` with `optRandom: true`, `optRandMin`, `optRandMax` | No dedicated RandomSleep node — use Sleep with random options |
| `Core.Programming.Delay` | `Core.Programming.Sleep` with `optDuration: Custom('N')` | No Delay node — Sleep handles fixed and random durations |
| `Core.Browser.Click` | `Core.Browser.ClickElement` | Selector-based click uses `ClickElement` |
| `Core.Browser.Type` | `Core.Browser.TypeText` | Selector-based typing uses `TypeText` |
| `Core.Browser.GetCookie` (singular) | `Core.Browser.GetCookies` (plural, returns `outCookies`) | Robomotion always reads all cookies at once |
| `Core.Programming.If` | `Core.Programming.Function` with `outputs: 2` | No `If` node — branch by returning `[msg, null]` / `[null, msg]` |
| `Core.Browser.ScrapeList` / `ScrapeTable` | `Core.Browser.RunScript` returning `{ columns, rows }` JSON | Scrape nodes are unreliable; extract with JS and parse as Data Table |

## How to check

```
get_node_cards(['Core.CSV.ReadCSV', 'Core.Flow.GoTo'])   // batch schema lookup
search_nodes('csv read')                                  // fuzzy search
```

When in doubt, call `get_node_cards` — the schema is the source of truth.
