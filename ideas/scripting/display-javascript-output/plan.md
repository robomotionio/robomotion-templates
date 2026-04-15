# Display JavaScript Output

**Level:** Intermediate

## Description
JavaScript is a web programming language used both on the client-side and server-side. Flows allow users to implement custom web automation behavior and handle web components through JavaScript code.

## Objective
Execute a JavaScript snippet from a flow, capture its return value, and log it. Demonstrate both "JavaScript in page context" (via a browser node) and "JavaScript standalone" (via Node.js / the built-in JS engine).

## Prerequisites
- Robomotion Scripting / Code package
- (For browser variant) Browser package + extension

## Steps
### Variant A — standalone JavaScript
1. **Run JavaScript** — inline snippet:
   ```js
   const items = [1, 2, 3, 4];
   const sum = items.reduce((a, b) => a + b, 0);
   return { count: items.length, sum };
   ```
2. Capture return value into `vResult`.
3. **Log Message** — `Count={vResult.count} Sum={vResult.sum}`.

### Variant B — in-page JavaScript
1. **Open Browser**, **Navigate** to a target URL.
2. **Execute JavaScript in Page** — `return document.title + " | " + document.links.length;`.
3. Capture into `vPageInfo`.
4. **Log Message** — `vPageInfo`.
5. **Close Browser**.

## Expected Outcome
`vResult` contains the computed object (e.g. `{ count: 4, sum: 10 }`) and `vPageInfo` contains live DOM-derived data from the page.

## Variables
| Name | Scope | Purpose |
|------|-------|---------|
| `vResult` | Message | Standalone JS return |
| `vPageInfo` | Message | In-page JS return |

## Notes
- Use `return` explicitly — the script's final value must be returned to the flow.
- In-page JS runs in the page's security context; mention CSP limits and the Same-Origin boundary.
