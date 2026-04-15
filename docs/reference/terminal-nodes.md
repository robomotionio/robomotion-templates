# Terminal Nodes (0 Outputs)

These nodes CANNOT be chained with `.then()`:

- `Core.Programming.Debug` — dumps msg for inspection
- `Core.Flow.Log` — logs text (NOT `Core.Application.Log`)
- `Core.Flow.Stop` — stops the flow

Wire them as side-effects with `.edge()`:

```typescript
.then('d1e4b8', 'Core.Programming.Function', 'Process', {...})
.then('e3a592', 'Core.Flow.Stop', 'Stop', {});

// Debug as parallel branch
f.node('b4d7f1', 'Core.Programming.Debug', 'Debug', { optDebugData: Message('result') });
f.edge('d1e4b8', 0, 'b4d7f1', 0);
```
