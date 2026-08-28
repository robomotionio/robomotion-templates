// Laid out by hand. The engine calls this LINEAR_1COL and stacks Take The Next Application
// over Show The Application in one column, which is right for a long chain and wrong here:
// three nodes over two rows next to a 536 px setup guide gives a 1.2:1 bounding box, and
// the screenshot frame is 3.2:1 — everything zooms out to unreadable text.
//
// Instead: the two comments side by side on the left, the three nodes as one left-to-right
// band beside them, vertically centred against the comment block. 1900 x 470 is 4:1,
// which fits the frame with the node labels still legible. Grid is docs/layout-guide.md —
// 280 px columns, and the +6 px nudge on Inject because a trigger node is shorter than the
// nodes it feeds. cameraPositions is deliberately omitted so auto-fit does the framing.
export default {
  flowId: '5e030ada-80dc-443e-b7fc-5eccdc7ba9ca',
  sourceHash: '246ee1da',
  positions: {
    'd10001': { x: 880, y: 306 },     // Start
    'd10002': { x: 1160, y: 300 },    // Take The Next Application
    'd10003': { x: 1440, y: 300 },    // Show The Application
    // ---- comments, side by side, clear of the flow ----
    'c50001': { x: -180, y: 100 },
    'c50002': { x: 300, y: 100 },
  },
  nodeColors: {
  },
  nodeIcons: {
  },
  commentExtras: {
    'c50001': { colorIndex: 4, size: { width: 440, height: 302 } },
    'c50002': { colorIndex: 0, size: { width: 440, height: 470 } },
  },
};
