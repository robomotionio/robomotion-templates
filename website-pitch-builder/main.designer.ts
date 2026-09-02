// One left-to-right band, which is the shape of the job: a niche goes in on the left and a
// packet you can act on comes out on the right. The layout engine classifies this as a DAG
// and orders by dependency depth, which puts *Build The Site* back at x 600 while *Gather
// The Material* sits at x 860 — the chain then runs right, left, right and reads as a
// tangle. Same 250-320 px grid as the rest of the repo, comments in their own left column
// clear of the flow, and the three trigger-shaped nodes (Inject, the two Stops) nudged
// +6 px so the wires run level.
//
// The two ends of *Find The Lead* stack around the band rather than after it: the debug
// and the onward chain both hang off port 0, and the "nothing qualified" Stop off port 1.
//
// cameraPositions is deliberately absent: auto-fit frames this better than a hand-picked
// camera does, and a fixed camera goes stale the moment a node moves.
export default {
  flowId: 'e25280b2-f023-42b3-b962-d982b7eec07e',
  sourceHash: '139a31fb',
  positions: {
    // ---- comments, in their own left column ----
    'c30001': { x: 80, y: 100 },
    'c30002': { x: 80, y: 430 },
    // ---- the job, left to right ----
    'a41c07': { x: 600, y: 526 },     // Start                  (trigger, +6)
    '3b9d42': { x: 880, y: 520 },     // Find The Lead
    '0d3e81': { x: 1200, y: 450 },    // Winner                 (port 0, above the band)
    '4c7e10': { x: 1200, y: 520 },    // Gather The Material    (port 0, on the band)
    '2e85fa': { x: 1200, y: 596 },    // Nothing Worth Pitching (port 1, +6)
    '5d8f21': { x: 1520, y: 520 },    // Build The Site
    '6e9032': { x: 1840, y: 520 },    // Shoot The Page
    '7fa143': { x: 2160, y: 520 },    // Send The Packet
    '1c74b9': { x: 2480, y: 526 },    // Done                   (+6)
  },
  nodeColors: {
  },
  nodeIcons: {
  },
  commentExtras: {
    'c30001': { colorIndex: 4, size: { width: 500, height: 285 } },
    'c30002': { colorIndex: 0, size: { width: 500, height: 495 } },
  },
};
