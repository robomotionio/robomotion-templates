// One left-to-right band: Start, the three calls in the order the lesson makes them, and
// Debug at the end holding all three answers. The engine's LINEAR_1COL pass stacks this
// into a column, and a column that tall fits the 3.2:1 screenshot frame by height, which
// leaves the node labels too small to read. Same 250 px grid as the rest of the repo,
// comments in their own column clear of the flow, and Start nudged +6 px because a
// trigger node is shorter than a regular one.
//
// cameraPositions is deliberately absent: auto-fit frames this better than a hand-picked
// camera does.
export default {
  flowId: '138d77ca-d077-4d80-950a-ef6f5866c1cb',
  sourceHash: 'ea87a982',
  positions: {
    // ---- comments, in their own left column ----
    'c30001': { x: 80, y: 100 },
    'c30002': { x: 80, y: 450 },
    // ---- three calls, left to right ----
    'ca0001': { x: 600, y: 556 },     // Start        (trigger, +6)
    'ca0002': { x: 850, y: 550 },     // Get Rates    — a plain read
    'ca0004': { x: 1100, y: 550 },    // Sign In      — behind a password
    'ca0005': { x: 1350, y: 550 },    // Build Upload
    'ca0006': { x: 1600, y: 550 },    // Post File    — carrying a file
    'ca0003': { x: 1850, y: 550 },    // Debug
  },
  nodeColors: {
  },
  nodeIcons: {
  },
  commentExtras: {
    'c30001': { colorIndex: 4, size: { width: 440, height: 270 } },
    'c30002': { colorIndex: 0, size: { width: 440, height: 560 } },
  },
};
