// Laid out by stage rather than by the engine's DAG pass, which is the case docs/
// layout-guide.md calls out: it ranks by dependency depth, so the two tool chains came
// out as vertical columns with their Tool In below their Tool Out and the wires crossing
// the canvas. Here each stage is one left-to-right band on the 250 x 130 grid:
//
//   the request        Serve The Assistant -> Ask Harborview -> Read -> the fork
//   the two agents     visitor above, signed-in patient below
//   what each may use  the documents above, the patient's own tools below
//   the answer         Log The Turn -> Write The Log -> Answer
//
// sourceHash is the engine's, and main.ts has not changed since it ran.
export default {
  flowId: 'main',
  sourceHash: 'cd51755e',
  positions: {
    'c10001': { x: 80, y: 100 },
    'c10002': { x: 80, y: 474 },

    'd61001': { x: 600, y: 450 },
    'd61002': { x: 850, y: 450 },
    'd61003': { x: 1100, y: 450 },
    'd61004': { x: 1350, y: 450 },

    'd61005': { x: 1600, y: 320 },
    'd61006': { x: 1600, y: 580 },

    'd61007': { x: 1870, y: 210 },

    'd61010': { x: 2120, y: 320 },
    'd61011': { x: 2370, y: 320 },
    'd61012': { x: 2620, y: 320 },

    'd61008': { x: 1870, y: 580 },
    'd61009': { x: 2120, y: 580 },
    'd6100a': { x: 2370, y: 580 },
    'd6100b': { x: 2620, y: 580 },

    'd6100c': { x: 1870, y: 710 },
    'd6100d': { x: 2120, y: 710 },
    'd6100e': { x: 2370, y: 710 },
    'd6100f': { x: 2620, y: 710 },
  },
  nodeColors: {
  },
  nodeIcons: {
  },
  commentExtras: {
    'c10001': { colorIndex: 4, size: { width: 440, height: 334 } },
    'c10002': { colorIndex: 0, size: { width: 440, height: 456 } },
  },
};
