export default {
  flowId: 'e12a7c0',
  sourceHash: '58d47fd3',
  positions: {
    'c00001': { x: 60, y: 0 },

    // ---- 1. open the deal board --------------------------------------------
    'c00002': { x: 536, y: 0 },
    'a10001': { x: 600, y: 250 },
    'a10002': { x: 600, y: 320 },
    'a10003': { x: 600, y: 390 },
    'a10004': { x: 600, y: 460 },
    'a10005': { x: 600, y: 530 },
    'a10006': { x: 600, y: 600 },
    'a10007': { x: 600, y: 670 },
    'a10008': { x: 600, y: 740 },
    'a10009': { x: 600, y: 810 },
    'a1000a': { x: 600, y: 880 },
    'a1000b': { x: 600, y: 950 },
    'a1000c': { x: 600, y: 1020 },

    // ---- 2. find the unbilled wins -----------------------------------------
    'c00003': { x: 1056, y: 0 },
    'a1000d': { x: 1120, y: 250 },
    'a1000e': { x: 1120, y: 320 },

    // ---- 3. report ---------------------------------------------------------
    'c00004': { x: 1556, y: 0 },
    'c30001': { x: 1600, y: 250 },
    'c30002': { x: 1600, y: 320 },
    'c30003': { x: 1600, y: 390 },
  },
  cameraPositions: {
    'main': { x: 20, y: 60, zoom: 0.9 },
  },
  nodeColors: {
    'c00001': 'hsl(var(--comment-dark-gray))',
    'c00002': 'hsl(var(--comment-dark-gray))',
    'c00003': 'hsl(var(--comment-dark-gray))',
    'c00004': 'hsl(var(--comment-dark-gray))',
  },
  nodeIcons: {
  },
  commentExtras: {
    'c00001': { colorIndex: 4, size: { width: 440, height: 230 } },
    'c00002': { size: { width: 484, height: 1117 } },
    'c00003': { colorIndex: 2, size: { width: 484, height: 417 } },
    'c00004': { size: { width: 464, height: 476 } },
  },
};
