// Laid out by hand, not by the auto-layout engine: it reads this canvas as LINEAR_1COL and
// stacks it into one column, which the 3.2:1 screenshot frame shrinks to unreadable. The main
// canvas of an app is one SubFlow box per screen, so they sit in one row, in the order a tester
// meets them, with the app-wide Catch under them and the two comments to their left.
// 280 px columns on the grid in docs/layout-guide.md; the Catch carries the +6 px nudge.
export default {
  flowId: 'main',
  sourceHash: '2ee29dd7',
  positions: {
    // ---- one SubFlow per screen ----
    'b3ea2a': { x: 900, y: 120 },     // Suites
    '5a9f01': { x: 1180, y: 120 },    // Runs: the robot that tests
    'a243e8': { x: 1460, y: 120 },    // Releases
    '2211ca': { x: 1740, y: 120 },    // Report
    // ---- any error, from any screen, goes back to the app ----
    'd5e061': { x: 900, y: 286 },     // Catch: Say What Went Wrong
    'e7f2a8': { x: 1180, y: 280 },    // Tell Them The Problem
    // ---- comments, in their own columns, clear of the flow ----
    'c30001': { x: -180, y: 0 },
    'c30002': { x: 340, y: 0 },
  },
  nodeColors: {
  },
  nodeIcons: {
  },
  commentExtras: {
    'c30001': { colorIndex: 4, size: { width: 480, height: 350 } },
    'c30002': { colorIndex: 0, size: { width: 480, height: 450 } },
  },
};
