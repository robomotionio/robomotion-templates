## TypeScript Format Reminder (Re-injected Every Turn)

**Critical rules — verify before EVERY Write/Edit call:**

- **NEVER output TypeScript as text** — always use `Write` or `Edit` tool
- `flow.create('{flow_id}', 'Name', f => { ... }).start()` — flow_id MUST match context exactly
- `f.node(id, type, name, props)` — correct param order: id, type, name, props
- `f.addDependency(namespace, version)` — required for EVERY non-`Core.*` package
- `Message(variable)` for variables | `Custom(literal)` for literals | `Credential({vaultId, itemId})` for secrets
- `.then(id, type, name, props)` for sequential flow | `.edge(id, type, name, props)` for multi-port
- Enum properties are plain strings — e.g., `method: 'GET'` **not** `method: Custom('GET')`
- `func` is a literal string — e.g., `func: '(ctx) => ctx.message'` **not** `func: JS('...')`
- ForEach loops require: `Label` → `ForEach` → body nodes → `GoTo(label_id)`
- Flow MUST end with `.start()`

**After writing code:**
1. `validate_flow` — compiles + validates
2. `save_flow` — deploy to Designer
