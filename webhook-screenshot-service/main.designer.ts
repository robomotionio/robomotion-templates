// One left-to-right band, which is the shape of the flow: a request arrives on the left
// and a PNG leaves on the right. The engine's LINEAR_1COL pass stacks the chain into a
// column instead, and a column that tall fits the 3.2:1 screenshot frame by height — the
// node labels come out too small to read. Same 250 px grid as the rest of the repo,
// comments in their own column clear of the flow, and the two nodes that carry only one
// port (Http In, Http Out) nudged +6 px so the wire runs level.
//
// cameraPositions is deliberately absent: auto-fit frames this better than a hand-picked
// camera does.
export default {
  flowId: '073ee472-5082-4d91-8720-af9f78d2cae9',
  sourceHash: '91b551bc',
  positions: {
    // ---- comments, in their own left column ----
    'c30001': { x: 80, y: 100 },
    'c30002': { x: 80, y: 395 },
    // ---- the call, left to right ----
    'a50001': { x: 600, y: 506 },     // Http In        (one port, +6)
    'a50002': { x: 850, y: 500 },     // Read Request
    'a50003': { x: 1100, y: 500 },    // Open Browser
    'a50004': { x: 1350, y: 500 },    // Open Link
    'a50005': { x: 1600, y: 500 },    // Screenshot
    'a50006': { x: 1850, y: 500 },    // Close Browser
    'a50007': { x: 2100, y: 506 },    // Http Out       (one port, +6)
  },
  nodeColors: {
  },
  nodeIcons: {
  },
  commentExtras: {
    'c30001': { colorIndex: 4, size: { width: 440, height: 215 } },
    'c30002': { colorIndex: 0, size: { width: 440, height: 450 } },
  },
};
