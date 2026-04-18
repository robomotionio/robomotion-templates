# Use the OR Operator in Conditionals

Logical operators enable users to create complex logical expressions and implement advanced logic in their flows. For example, they can use the "OR" logical operator to create expressions that are true when at least one of the provided conditions is valid.

## What Use the OR Operator in Conditionals can do

- Seed inputs (`Core.Programming.Function`) — `msg.tool = 'Robomotion'; msg.company = 'Some Other Corp';`.
- OR test (`Core.Programming.Function`, `outputs: 2`) — `return (msg.tool === 'Robomotion' || msg.company === 'Robomotion Inc.') ? [msg, null] : [null, msg];`.
- Port 0 shows `Core.Dialog.MessageBox` titled `Flow ran successfully!` with body `At least one of the provided conditions was true.` (`optType: 'info'`).
- Port 1 goes straight to `Core.Flow.Stop` (no else branch).

## Behind the scenes

- Mirrors the AND tutorial; the only structural difference is `||` vs `&&` inside the Function node.
- Seeded values are deliberately mixed (one matches, one doesn't) to demonstrate that a single true operand is enough for the OR branch to fire.
