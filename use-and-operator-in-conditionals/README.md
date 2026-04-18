# Use the AND Operator in Conditionals

Logical operators enable users to create complex logical expressions and implement advanced logic in their flows. For example, they can use the "AND" logical operator to create expressions that are true when all the provided conditions are valid.

## What Use the AND Operator in Conditionals can do

- Set Variables — in a `Core.Programming.Function` assign `msg.vTool = 'Power Automate'` and `msg.vCompany = 'Microsoft'`.
- AND Conditional — a `Core.Programming.Function` with `outputs: 2` implementing the two-predicate AND: `if (msg.vTool === 'Power Automate'…
- Show Message on port 0 (`Core.Dialog.MessageBox`, icon `None`, buttons `OK`) titled `Flow ran successfully!` with body `All the provided …
- Port 1 → `Core.Flow.Stop` (the PA flow has no else branch).

## Behind the scenes

- The teaching point is that **every predicate must be true** to enter the then-branch. Learners often assume `AND` short-circuits are distinct from `OR` — emphasise the truth-table.
- The PA syntax `(Tool = 'Power Automate' AND Company = 'Microsoft') = $'''True'''` is an odd double-check (the inner comparison already returns `True`/`False`; PA then equates that to the string `'True'`). In Robomotion, a single `&&` is enough — do not replicate the double-compare.
