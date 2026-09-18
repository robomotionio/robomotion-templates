// Laid out by stage, not by the auto-layout engine: it classifies this flow as a DAG and
// stacks it into one tall column, which the 3.2:1 screenshot frame shrinks to unreadable.
// Four bands, and no wire leaves its band: where one would cross the canvas, a GoTo hands
// the message to a Label instead. Set up and sign in on top; the order loop under it; then
// the sheet; then the browser closing. 280 px / 140 px on the grid in docs/layout-guide.md;
// Start, Label, GoTo and Stop are short nodes, so they carry the +6 px nudge that keeps a
// wire level. Act's ports are Continue, Needs a person, Done from the top, so Sign In's
// Needs a person goes up to its GoTo and Done goes down to the other.
export default {
  flowId: '929b22bc-0d17-4b95-84bc-dd1274c5af78',
  sourceHash: '5b1bfb02',
  positions: {
    // ---- set up, and sign in ----
    'c10001': { x: 600, y: 246 },     // Start
    'c10002': { x: 880, y: 240 },     // Get the Carrier Login
    'c10003': { x: 1160, y: 240 },    // Read Today's Orders
    'c10004': { x: 1440, y: 240 },    // The Runbook
    'c10005': { x: 1720, y: 240 },    // Open Chrome
    'c10006': { x: 2000, y: 240 },    // Open the Carrier
    'c10007': { x: 2280, y: 240 },    // Sign In (Act)
    'c10015': { x: 2560, y: 196 },    // Go To Close  (Needs a person)
    'c10014': { x: 2560, y: 286 },    // Start the Orders  (Done)
    // ---- the order loop ----
    'c10008': { x: 600, y: 386 },     // Label: Next Order
    'c10009': { x: 880, y: 380 },     // For Each Order
    'c1000a': { x: 1160, y: 380 },    // Write the Instructions
    'c1000b': { x: 1440, y: 380 },    // Open a Blank Shipment
    'c1000c': { x: 1720, y: 380 },    // Book the Order (Act)
    'c1000d': { x: 2000, y: 430 },    // Read the Tracking Number, set low so Needs a person passes over it
    'c1000e': { x: 2280, y: 380 },    // Note It Down
    'c1000f': { x: 2560, y: 386 },    // Go To Next Order
    // ---- the sheet (For Each, done port) ----
    'c10010': { x: 1160, y: 540 },    // Make the Sheet
    'c10011': { x: 1440, y: 540 },    // Write the Booked Sheet
    'c10012': { x: 1720, y: 540 },    // Say What Happened
    // ---- close the browser ----
    'c10016': { x: 1440, y: 666 },    // Label: Close the Browser
    'c10013': { x: 1720, y: 660 },    // Close Chrome
    'c10099': { x: 2000, y: 666 },    // Stop
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
