# Template Layout Guide

This document describes the conventions for laying out nodes in `main.designer.ts` and adding Comment nodes to `main.ts` across all Robomotion templates.

## File overview

Every template has two layout-relevant files:

| File | Purpose |
|---|---|
| `main.ts` | Flow logic and node definitions, including the Comment node |
| `main.designer.ts` | Node positions, camera, colors, and comment sizing |

After editing either file, regenerate the screenshot:

```bash
cd tools/screenshot-generator
npx tsx src/cli.ts <template-name>
```

---

## Comment node

Every template should have exactly one `Core.Flow.Comment` node. It is a standalone node with no edges — it exists only as an on-canvas description.

### Adding to main.ts

Place the comment as the first `f.node()` call, before the Start node:

```ts
f.node('<id>', 'Core.Flow.Comment', 'Comment', {
  optText: '### Template Name\nShort description of what the flow does.\n\nAny extra context or instructions.'
});

f.node('...', 'Core.Trigger.Inject', 'Start', {})
  .then(...)
```

### Comment text style

There are two styles depending on the template complexity:

**Short style** — for templates without a Config node or with simple setup:

```
### DuckDuckGo Scraper
Searches DuckDuckGo for a user provided query using browser automation,
scrapes every result title and link from the page, and saves them to an Excel file.

Just run the flow and enter your search query when prompted.
```

**How-To style** — for templates with a Config node that needs user editing:

```
##### API Health check How-To

This template uses the *Net > Http Request* node to test if an endpoint works or not.

Follow these steps to test this template;

**1.** Edit the Config Node

**2.** Set the msg.endpoint URL to the API you want to test
```

Use markdown: `###` for titles, `*italic*` for node names, `**bold**` for numbered steps.

---

## Designer file structure

```ts
export default {
  flowId: '<uuid>',
  sourceHash: '<8-char hex>',
  positions: {
    '<nodeId>': { x: <number>, y: <number> },
    // ...
  },
  cameraPositions: {
    '<flowId or "main">': { x: <number>, y: <number>, zoom: <number> },
  },
  nodeColors: {
    '<commentId>': 'hsl(var(--comment-dark-gray))',
  },
  commentExtras: {
    '<commentId>': { colorIndex: <0-6>, size: { width: <number>, height: <number> } },
  },
};
```

### Comment designer properties

| Property | Description |
|---|---|
| `nodeColors` | Always set to `'hsl(var(--comment-dark-gray))'` for the comment node |
| `commentExtras.colorIndex` | Theme color: `2` = blue, `4` = purple, `6` = gray. Purple (`4`) is the most common |
| `commentExtras.size` | Pixel dimensions of the rendered comment box. Scale to fit the text |

Typical comment sizes:

| Text length | Width | Height |
|---|---|---|
| Short (3-4 lines) | 400-550 | 150-200 |
| Medium (how-to, ~10 lines) | 380-450 | 250-300 |
| Long (detailed how-to, 20+ lines) | 650-990 | 650-1000 |

---

## Positioning conventions

### Grid spacing

| Axis | Spacing | Usage |
|---|---|---|
| Vertical (y) | **70 px** | Between consecutive nodes in a column |
| Horizontal (x) | **250-330 px** | Between columns |

### Comment placement

The Comment node must **never overlap or intersect** with any flow node. Place it **above** the flow with enough vertical clearance (at least 80 px gap between the comment's bottom edge and the nearest node).

```
Comment bottom edge = comment.y + comment.height
Nearest node y      = first row y

Gap = Nearest node y - Comment bottom edge  →  must be ≥ 80 px
```

**Example** — duckduckgo-scraper:

```
Comment: (x: 350, y: -430), size: 430×170  →  bottom edge at y: -260
First node row: y: -175
Gap: -175 - (-260) = 85 px ✓
```

### Start and Stop nodes

`Core.Trigger.Inject` (Start) and `Core.Flow.Stop` (Stop) are **small trigger nodes** — visually just an icon circle with a label. They are smaller than regular rectangular nodes.

**Rules:**

1. Start and Stop each go on their **own column** — no other nodes share their x position
2. Start aligns with the **first row** of the next column (the first regular node it connects to)
3. Stop aligns with the **last row** of the previous column (the last regular node that connects to it)
4. Because trigger nodes are shorter than regular nodes, nudge their y position by **+6 px** relative to the regular node row to keep the wire straight at port height

```
Regular node row y: -175
Start y:            -169  (−175 + 6)

Regular node row y:  175
Stop y:              181  ( 175 + 6)
```

---

## Layout patterns

### Pattern 1: Two-column top-to-bottom

Best for **linear flows with many nodes** (8+ nodes in a chain). Split the chain into two balanced columns with Start and Stop on their own outer columns.

```
              [Comment]

  Start ─→  Column 1 (x: 650)     Column 2 (x: 980)
             ┌──────────────┐       ┌──────────────┐
             │ Get Query    │       │ Scrape       │
             │ Open Browser │       │ Parse        │
             │ Navigate     │  →    │ Create Excel │
             │ Type Query   │       │ Write Results│
             │ Search       │       │ Save Excel   │
             │ Wait Results │       │ Close Browser│ ─→  Stop
             └──────────────┘       └──────────────┘
```

Start aligns with the first row. Stop aligns with the last row. The connection from the last node of column 1 goes to the first node of column 2.

**Example** — duckduckgo-scraper (15 nodes including Comment):

```ts
positions: {
  'e7c1a2': { x: 350, y: -430 },   // Comment (above, clear of nodes)
  'dd39a8': { x: 400, y: -169 },   // Start   (own column, row 0 + 6px)
  'd25a94': { x: 650, y: -175 },   // Get Query        (col 1, row 0)
  'd3fbf4': { x: 650, y: -105 },   // Open Browser     (col 1, row 1)
  '92c2b0': { x: 650, y: -35 },    // Navigate         (col 1, row 2)
  '9f9204': { x: 650, y: 35 },     // Type Query       (col 1, row 3)
  'f4a190': { x: 650, y: 105 },    // Search           (col 1, row 4)
  'aebce4': { x: 650, y: 175 },    // Wait for Results (col 1, row 5)
  'cbdffc': { x: 980, y: -175 },   // Scrape Results   (col 2, row 0)
  'a4d044': { x: 980, y: -105 },   // Parse Results    (col 2, row 1)
  'b8306c': { x: 980, y: -35 },    // Create Excel     (col 2, row 2)
  '5a7688': { x: 980, y: 35 },     // Write Results    (col 2, row 3)
  'f12128': { x: 980, y: 105 },    // Save Excel       (col 2, row 4)
  '9528f0': { x: 980, y: 175 },    // Close Browser    (col 2, row 5)
  '9262e8': { x: 1230, y: 181 },   // Stop   (own column, row 5 + 6px)
},
```

### Pattern 2: Vertical stack with branching

Best for **flows with Switch/Fork nodes** that branch into parallel paths. The main chain goes top-to-bottom, then branches spread horizontally.

```
  [Comment]

  Start
  Config
  Test Endpoint
       │
  Check Status ──→ Error 500
       │                │
       └──→ OK 200 ─────┴──→ Stop
```

**Example** — api-health-check:

```ts
positions: {
  'df5ef9': { x: 299, y: 68 },    // Comment
  '156d06': { x: 723, y: 96 },    // Start
  '9c904f': { x: 723, y: 156 },   // Config         (same x, +60)
  '7acefa': { x: 723, y: 216 },   // Test Endpoint   (same x, +60)
  'd533df': { x: 959, y: 203 },   // Switch          (shift right)
  'c2c30e': { x: 1085, y: 169 },  // Error 500       (branch up)
  'e75a00': { x: 1085, y: 263 },  // OK 200          (branch down)
  '28a999': { x: 1326, y: 222 },  // Stop            (converge)
},
```

### Pattern 3: Horizontal with loop

Best for **flows that iterate** (ForEach, GoTo patterns). The main chain goes left-to-right, with the loop section extending horizontally and a GoTo linking back.

```
  [Comment]

  Start → Open → Get Range
                    │
            ┌── For Each ──→ Stop
            │      │
            │   SSL → Set Cell → Set Expires → Set Valid
            │                                     │
            └──────────────── Go To ←─────────────┘
```

**Example** — ssl-watch:

```ts
positions: {
  '17a078': { x: 500, y: -200 },   // Comment (above)
  '1e22a2': { x: 25, y: 97 },      // Start (far left)
  '4f83bf': { x: 250, y: 92 },     // Open Spreadsheet
  'aaf3c5': { x: 500, y: 92 },     // Get Range
  'd5384d': { x: 525, y: 189 },    // Label (loop target)
  'd81714': { x: 750, y: 136 },    // For Each
  '0198c8': { x: 880, y: 183 },    // SSL
  'ca1f14': { x: 1130, y: 183 },   // Set Cell Coord
  '4a1cce': { x: 1380, y: 183 },   // Set Expires In
  '1881e0': { x: 1630, y: 183 },   // Set Valid
  'c4e967': { x: 1880, y: 189 },   // Go To
  '402a38': { x: 900, y: 97 },     // Stop
},
```

---

## Choosing a pattern

| Flow shape | Node count | Pattern |
|---|---|---|
| Straight chain, no branching | 8+ | Two-column top-to-bottom |
| Straight chain, no branching | < 8 | Single column top-to-bottom |
| Has Switch/Fork with parallel paths | Any | Vertical stack with branching |
| Has ForEach/GoTo loop | Any | Horizontal with loop |

When grouping into columns, split by **logical phase**:
- Input / setup / browser navigation in column 1
- Processing / export / cleanup in column 2

---

## Camera position

Set the camera so the entire flow (including the comment) is visible at once:

```ts
cameraPositions: {
  '<flowId>': { x: <centerX>, y: <centerY>, zoom: <level> },
},
```

| Field | Guideline |
|---|---|
| `x`, `y` | Approximate center of all node positions |
| `zoom` | `1.0` for most flows. Use `0.8-0.9` for large flows, `1.2-1.5` for small flows |

---

## Checklist

When adding or updating a template layout:

1. Add `Core.Flow.Comment` as the first node in `main.ts`
2. Write comment text with a `###` title and brief description
3. Position all nodes in `main.designer.ts` using the appropriate pattern
4. Use **70 px** vertical spacing and **250-330 px** column gaps
5. Place the comment **above** the flow with at least **80 px** clearance — never overlapping nodes
6. Place **Start** and **Stop** on their own columns, aligned to the first/last row with a **+6 px y nudge**
7. Add `nodeColors`, `commentExtras` for the comment node
8. Set `cameraPositions` to frame the entire flow
9. Regenerate the screenshot with the screenshot-generator tool
10. **Verify the screenshot** — check that no nodes overlap, wires are straight between same-row nodes, and the comment is clearly separated from the flow
