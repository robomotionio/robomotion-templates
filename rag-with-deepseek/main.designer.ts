// Laid out in bands, one stage per row, reading left to right inside each row:
//   1. setup and the "is it already built?" branch
//   2. the ingest loop, one pass per document
//   3. embedding, the table, and the two indexes
//   4. the question and the agent
//   5. the search_knowledge tool
//
// sourceHash is deliberately absent — the Designer stamps it on first save.
export default {
  flowId: '7d3e1a94-2c6b-4f08-9a51-8be4d7c02f13',
  positions: {
    'c10001': { x: -580, y: 240 },
    'c10002': { x: -580, y: 600 },

    // ---- 1. setup ----------------------------------------------------------
    'a10001': { x: 120, y: 300 },
    'a10002': { x: 380, y: 300 },
    'a10003': { x: 640, y: 300 },
    'a10004': { x: 900, y: 300 },
    'a10005': { x: 1160, y: 300 },
    'a10006': { x: 1420, y: 190 },

    // ---- 2. the ingest loop ------------------------------------------------
    'b20001': { x: 120, y: 570 },
    'b20002': { x: 380, y: 570 },
    'b20015': { x: 640, y: 570 },
    'b20003': { x: 900, y: 570 },
    'b20004': { x: 1160, y: 570 },
    'b20005': { x: 1420, y: 570 },
    'b20006': { x: 1680, y: 570 },
    'b20007': { x: 1940, y: 570 },
    'b20008': { x: 2200, y: 570 },
    'b2000d': { x: 2200, y: 700 },
    'b20009': { x: 2460, y: 570 },

    // ---- 3. embed, store, index --------------------------------------------
    'b2000a': { x: 120, y: 900 },
    'b2000b': { x: 380, y: 790 },
    'b2000c': { x: 380, y: 1010 },
    'b2000e': { x: 640, y: 900 },
    'b2000f': { x: 900, y: 900 },
    'b20010': { x: 1160, y: 900 },
    'b20011': { x: 1420, y: 900 },
    'b20012': { x: 1680, y: 900 },
    'b20013': { x: 1940, y: 820 },
    'b20014': { x: 1940, y: 990 },

    // ---- 4. the question ---------------------------------------------------
    'd30001': { x: 120, y: 1230 },
    'd30002': { x: 380, y: 1230 },
    'd30003': { x: 640, y: 1230 },
    'd30004': { x: 960, y: 1150 },
    'd30005': { x: 960, y: 1320 },

    // ---- 5. the tool -------------------------------------------------------
    'e40001': { x: 120, y: 1540 },
    'e40002': { x: 380, y: 1540 },
    'e40003': { x: 640, y: 1540 },
    'e40004': { x: 900, y: 1540 },
    'e40005': { x: 1160, y: 1540 },
    'e40006': { x: 1420, y: 1540 },
  },
  nodeColors: {
  },
  commentExtras: {
    'c10001': { colorIndex: 4, size: { width: 500, height: 320 } },
    'c10002': { colorIndex: 0, size: { width: 500, height: 500 } },
  },
};
