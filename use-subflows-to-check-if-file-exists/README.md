# Use Subflows to Check if File Exists

Automating complex scenarios may lead to large flows with recurrent nodes. Subflows are reusable groups of nodes that split flows, making them more manageable and easier to maintain.

## What Use Subflows to Check if File Exists can do

- Encapsulates a "does this file exist?" check inside a reusable subflow so the main flow stays linear and readable.

## Behind the scenes

- The teaching point is **subflow routing**: instead of an `IF/ELSE` with inline nodes, route to two differently-named subflows. Keep each subflow minimal — they show the difference from the label and the IF-based versions of this tutorial.
- `vUserInput` must be **Flow-scoped** (or explicitly passed) so the subflows can read it. Power Automate resolves this implicitly via its global variable table.
