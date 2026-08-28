// Laid out by stage, not by the auto-layout engine: it classifies this flow as a DAG and
// orders by dependency depth, which interleaves the intake loop with the worker loop and
// crosses every wire. Two bands instead — fill the queue on top, drain it underneath —
// on the 280 px / 70 px grid in docs/layout-guide.md. GoTo, Label, Start and Stop are
// short nodes, so they carry the +6 px nudge that keeps a wire level.
export default {
  flowId: 'a0fc670c-f6ea-489c-aff0-e4b1e1436ae8',
  sourceHash: '9b8918d3',
  positions: {
    // ---- intake: fill the queue ----
    'a10001': { x: 600, y: 106 },     // Start
    'a10002': { x: 880, y: 100 },     // List Refund Requests
    'a10006': { x: 1440, y: 106 },    // Go To Next Request  (loop tail, and the way in)
    'a10003': { x: 600, y: 246 },     // Label: Next Request
    'a10004': { x: 880, y: 240 },     // For Each Request
    'a10005': { x: 1160, y: 240 },    // Put It On The Queue
    'a10011': { x: 1160, y: 350 },    // Start Working The Queue  (For Each, done port)
    // ---- worker: drain the queue ----
    'a10008': { x: 600, y: 506 },     // Label: Next Item
    'a10009': { x: 880, y: 500 },     // Take The Next Item
    'a1000a': { x: 1160, y: 500 },    // Did We Get One
    'a1000b': { x: 1440, y: 626 },    // Queue Is Empty (Stop)
    'a1000c': { x: 1440, y: 500 },    // Check The Refund
    'a1000d': { x: 1720, y: 500 },    // Can We Refund It
    'a1000e': { x: 2000, y: 450 },    // Mark It Successful
    'a1000f': { x: 2000, y: 550 },    // Mark It Failed
    'a10010': { x: 2280, y: 506 },    // Go To Next Item
    // ---- comments, in their own column, clear of the flow ----
    'c30001': { x: -180, y: 100 },
    'c30002': { x: -180, y: 420 },
  },
  nodeColors: {
  },
  commentExtras: {
    'c30001': { colorIndex: 4, size: { width: 440, height: 286 } },
    'c30002': { colorIndex: 0, size: { width: 440, height: 452 } },
  },
};
