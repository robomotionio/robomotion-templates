# Wiring & Routing Guide

Extends [`layout-guide.md`](layout-guide.md) with the routing discipline that keeps wires legible at all sizes — specifically, the rules the auto-layout engine at [`tools/layout-engine.cjs`](../tools/layout-engine.cjs) applies when it positions nodes.

Read the layout guide first (grid, comment, start/stop, camera). This document focuses on the *edges* between nodes, not the nodes themselves.

## Port anatomy

Every rectangular node in Robomotion has a left edge and a right edge. Ports live only on those edges:

| Side | Meaning |
|---|---|
| **Left** | Input ports (1 per node by default) |
| **Right** | Output ports (1 per node by default; more for Switch, Fork, ForEach, Function with `outputs: N`) |

A wire always connects **right-port of the source** to **left-port of the target**. This is why stacking two nodes vertically at the same x produces a small S-curve: the wire exits right, loops over, and enters left.

Trigger-shaped nodes (`Inject`, `Stop`, `Catch`, label/goto nodes) are shorter (~36 px) than rectangular nodes (~47 px). Port y lives at the vertical centre of the node. A +6 px nudge on trigger y aligns its port with the port of the neighbouring rectangular node (see rule 6 in the layout guide).

## Wire shapes

The renderer draws smooth bezier curves based on the (x, y) of the two ports. Three shapes dominate:

| Arrangement | Wire shape | Visual weight |
|---|---|---|
| Same y, target to the right | Straight horizontal | **Best** — use for the main happy path |
| Same x, target below (70 px) | Tight S-curve | Good — acceptable for column stacks |
| Diagonal (different x *and* y) | Long sweeping curve | Costly — avoid unless required |
| Target to the left of source (backward) | U-shape (output-right → loops up/down → target-left) | Only for explicit loops (`GoTo` → `Label`) |

Rule of thumb: **change one axis, not two.** If the target is below, keep x constant. If it's to the right, keep y constant. Two-axis movement happens only at logical turns (a Switch fanning to branches, a branch re-entering the main chain).

## Routing principles

### 1. One primary axis per flow

Pick horizontal *or* vertical for the main chain. Don't alternate.

- **Vertical** (default): Start at top, each successor 70 px below, Stop at bottom. Wires are tight S-curves inside the column.
- **Horizontal**: Start at left, each successor 250 px to the right at the same y. Wires are straight lines. Use when the flow has a loop (`ForEach` + `GoTo` back to a `Label`) so the loop body can extend horizontally without pushing Stop far away.

Mixing axes (one node right, next node down, next right again) produces zigzag wires. Never do this for the main chain.

### 2. Branches fan *perpendicular* to the main axis

When a Switch/Fork/Function node has multiple outputs:

- In a **vertical** main chain, branches fan to the right. Keep all branches at the same x offset from the branch node and spread them across slots at the branch node's y ± 35 px per slot. Convergence node sits one column further right, at the mean y of the branches.
- In a **horizontal** main chain, branches fan downward. Keep all branches at the same y offset from the branch node.

Fanning along the main axis makes downstream successors leapfrog each other, which is the primary source of crossed wires.

### 3. Convergence placement

When two or more branches rejoin (typically at `Stop`), place the convergence node:

- x = max(branch_x) + COL_W
- y = mean(branch_y)

This makes every incoming wire a straight horizontal, regardless of which branch it came from. Avoid placing Stop in the main column and drawing long diagonals back into it from far-right branches.

### 4. Loops sit beside the main chain, not through it

For `Label` + `GoTo` loops:

- The loop body (the chain between the `Label` and the `GoTo`) lives at its own x column next to the main chain, not inline with it.
- The `GoTo` is the last node in the loop body; its wire to the `Label` is a long U-curve. That's fine — there's only one per loop and it's visually clear as a loop-back.
- If a conditional decides whether to loop or exit, place the exit target (the node after the `GoTo`) at the same y as the conditional but shifted right — the "escape hatch" reads left-to-right.

### 5. Detached subgraphs go below

Subgraphs not reachable from the main Start (Catch-trigger chains, orphaned Label entry points, GoTo targets without a caller) must not share y-space with the main chain — they pull the reader's eye off the happy path.

Place them in a separate row group at `y = bottom_of_main + 150`, preserving their own internal layout. A Catch trigger then reads as "runs in parallel, downstairs."

### 6. No node-crossing wires

A wire must never cross *through* a node. If placement makes that unavoidable:

- Shift the intermediate node out of the wire's path (nudge 40 px off-axis).
- Or reroute by inserting a slot between the involved columns.

The auto-engine detects and warns on likely crossings; see `--check` below.

### 7. Respect the camera

The camera crop (default 1600×500 at zoom 1.0) frames roughly `x ∈ [20, 1620]` and `y ∈ [0, 500]`. Keep the main-chain bounding box inside that window. Wide flows should drop zoom to 0.8; tall flows should split columns instead of scrolling.

## Summary table — pick the wiring pattern

| Flow shape | Main axis | Branches fan | Stop placement |
|---|---|---|---|
| Linear ≤ 8 non-trigger nodes | Vertical (single column) | n/a | Own column right, same y as last |
| Linear ≥ 8 non-trigger nodes | Vertical (two columns) | n/a (chain crosses once from col 1 bottom to col 2 top) | Own column right of col 2 |
| Branching (Switch / Fork / `outputs: N`) | Vertical | Right | Far right, mean y of branches |
| Loop (`Label` + `GoTo`) | Horizontal | Down | End of main row, right of GoTo |
| Catch + main | Main flow as above, Catch group below | — | Separate Stop for catch path |

## Using the auto-engine

```bash
# Regenerate main.designer.ts + all subflow designers for a slug
node tools/layout-engine.cjs <slug>

# Dry-run: print the chosen pattern and any routing warnings
node tools/layout-engine.cjs <slug> --check

# All templates in-place (destructive, commit first)
node tools/layout-engine.cjs --all
```

The engine reads `main.ts` via regex, classifies the flow shape, applies the matching pattern, and writes a new `main.designer.ts`. It also regenerates any `subflows/<id>.designer.ts`. It never touches `main.ts`.

After running, regenerate screenshots (`cd tools/screenshot-generator && npx tsx src/cli.ts <slug>`) and spot-check the result against the principles above.
