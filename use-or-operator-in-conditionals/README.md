# Use the OR Operator in Conditionals

Logical operators enable users to create complex logical expressions and implement advanced logic in their flows. For example, they can use the "OR" logical operator to create expressions that are true when at least one of the provided conditions is valid.

## What Use the OR Operator in Conditionals can do

- Set Variables — Function node: `msg.vTool = 'Power Automate'; msg.vCompany = 'Microsoft';`.
- OR Conditional — a `Core.Programming.Function` with `outputs: 2`: `if (msg.vTool === 'Power Automate' || msg.vCompany === 'Microsoft') { …
- Show Message on port 0 (`Core.Dialog.MessageBox`, icon `None`, `OK`) titled `Flow ran successfully!` with body `At least one of the provi…
- Port 1 → `Core.Flow.Stop` (no else branch in the PA flow).

## Behind the scenes

- Mirrors the AND tutorial; the only structural difference is `||` vs `&&` inside the Function node.
- As with the AND example, do not replicate PA's double-compare `(…) = 'True'` — a single `||` already returns a boolean.
