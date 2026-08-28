// One left-to-right band: a question arrives, it is searched for, and one of two answers
// goes back out on the same request. The auto-layout engine stacked the two answer
// branches in a single column, which routed Build The Answer's wire straight through Say
// We Do Not Know; splitting them above and below the line keeps both wires short and the
// branch readable. Grid and the +6 px trigger nudge per docs/layout-guide.md.
export default {
  flowId: '7862039e-7946-4bb9-96a0-d4808e64a3d5',
  sourceHash: '7da8f693',
  positions: {
    'a10001': { x: 600, y: 456 },     // Ask Endpoint (Http In)
    'a10002': { x: 920, y: 450 },     // Read The Question
    'a10003': { x: 1240, y: 450 },    // Search The Documents
    'a10004': { x: 1560, y: 450 },    // Did We Find Anything
    'a10005': { x: 1880, y: 380 },     // Build The Answer      (something cleared Min Score)
    'a10006': { x: 1880, y: 520 },    // Say We Do Not Know    (nothing did)
    'a10007': { x: 2200, y: 456 },    // Send It Back (Http Out)
    // ---- comments, in their own column, clear of the flow ----
    'c30001': { x: -180, y: 60 },
    'c30002': { x: -180, y: 410 },
  },
  nodeColors: {
  },
  commentExtras: {
    'c30001': { colorIndex: 4, size: { width: 440, height: 270 } },
    'c30002': { colorIndex: 0, size: { width: 440, height: 468 } },
  },
};
