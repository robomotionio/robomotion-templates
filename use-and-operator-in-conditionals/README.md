# Use the AND Operator in Conditionals

Logical operators enable users to create complex logical expressions and implement advanced logic in their flows. For example, they can use the "AND" logical operator to create expressions that are true when all the provided conditions are valid.

## What Use the AND Operator in Conditionals can do

- Seed inputs (`Core.Programming.Function`) — `msg.tool = 'Robomotion'; msg.company = 'Robomotion Inc.';`.
- AND test (`Core.Programming.Function`, `outputs: 2`) — `return (msg.tool === 'Robomotion' && msg.company === 'Robomotion Inc.') ? [msg, null] : [null, msg];`.
- Port 0 shows `Core.Dialog.MessageBox` titled `Flow ran successfully!` with body `All the provided conditions were true.` (`optType: 'info'`).
- Port 1 goes straight to `Core.Flow.Stop` (no else branch).

## Behind the scenes

- The teaching point is that **every predicate must be true** to enter the then-branch. Learners often assume `AND` short-circuits are distinct from `OR` — emphasise the truth-table.
- Both seeded values deliberately match, so the happy-path dialog fires on first run; flip either assignment to see the else path short-circuit to `Core.Flow.Stop`.
