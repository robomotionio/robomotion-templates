// Laid out by stage, not by the auto-layout engine: it classifies this flow as a DAG and
// stacks it into one tall column, which the 3.2:1 screenshot frame shrinks to unreadable.
// Three bands instead, the layout the flow was filmed in: set up and sign in on top, the
// order loop's control row in the middle, and the per-order work underneath, with the
// browser closing below it. 280 px / 140 px on the grid in docs/layout-guide.md; Start,
// Label, GoTo and Stop are short nodes, so they carry the +6 px nudge that keeps a wire level.
export default {
  flowId: '929b22bc-0d17-4b95-84bc-dd1274c5af78',
  sourceHash: '4df181cf',
  positions: {
    // ---- set up: the login, the orders, the runbook, the browser ----
    'c10001': { x: 600, y: 246 },     // Start
    'c10002': { x: 880, y: 240 },     // Get the Carrier Login
    'c10003': { x: 1160, y: 240 },    // Read Today's Orders
    'c10004': { x: 1440, y: 240 },    // The Runbook
    'c10005': { x: 1720, y: 240 },    // Open Chrome
    'c10006': { x: 2000, y: 240 },    // Open the Carrier
    // ---- sign in, then the loop; its done port writes the sheet ----
    'c10007': { x: 600, y: 380 },     // Sign In (Act)
    'c10008': { x: 880, y: 316 },     // Label: Next Order, between the bands so Sign In's wire runs clear
    'c10009': { x: 1160, y: 380 },    // For Each Order
    'c10010': { x: 1440, y: 380 },    // Make the Sheet
    'c10011': { x: 1720, y: 380 },    // Write the Booked Sheet
    'c10012': { x: 2000, y: 380 },    // Say What Happened
    // ---- one order: instructions, a blank form, the Act node, the proof ----
    'c1000a': { x: 600, y: 520 },     // Write the Instructions
    'c1000b': { x: 880, y: 520 },     // Open a Blank Shipment
    'c1000c': { x: 1160, y: 520 },    // Book the Order (Act)
    'c1000d': { x: 1440, y: 496 },    // Read the Tracking Number, lifted so Book the Order's Needs-a-person wire passes under it
    'c1000e': { x: 1720, y: 520 },    // Note It Down
    'c1000f': { x: 2000, y: 526 },    // Go To Next Order
    // ---- close ----
    'c10013': { x: 2000, y: 660 },    // Close Chrome
    'c10099': { x: 2280, y: 666 },    // Stop
    // ---- comments, in their own column, clear of the flow ----
    'c30001': { x: -180, y: 100 },
    'c30002': { x: -180, y: 474 },
  },
  nodeColors: {
  },
  nodeIcons: {
  },
  commentExtras: {
    'c30001': { colorIndex: 4, size: { width: 440, height: 334 } },
    'c30002': { colorIndex: 0, size: { width: 440, height: 432 } },
  },
};
