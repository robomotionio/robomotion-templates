export default {
  flowId: 'e13a7c0',
  sourceHash: '5a9ccebb',
  positions: {
    'c00001': { x: 60, y: 0 },

    // ---- 1. open the draft run ---------------------------------------------
    'c00002': { x: 560, y: 0 },
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
    'a1000c': { x: 960, y: 250 },
    'a1000d': { x: 960, y: 320 },
    'a1000e': { x: 960, y: 390 },
    'a1000f': { x: 960, y: 460 },
    'a10010': { x: 960, y: 530 },

    // ---- 2. validate the register / 3. confirm the bank agrees -------------
    'c00003': { x: 1420, y: 0 },
    'a10011': { x: 1460, y: 250 },

    // ---- 4. report ---------------------------------------------------------
    'c00005': { x: 1900, y: 0 },
    'c30001': { x: 1940, y: 250 },
    'c30002': { x: 1940, y: 320 },
    'c30003': { x: 1940, y: 390 },
    'c30004': { x: 1940, y: 460 },

    // section-3 note (bank check) sits with the validate step
    'c00004': { x: 1420, y: 400 },
  },
  cameraPositions: {
    'main': { x: 20, y: 60, zoom: 0.85 },
  },
  nodeColors: {
    'c00001': 'hsl(var(--comment-dark-gray))',
    'c00002': 'hsl(var(--comment-dark-gray))',
    'c00003': 'hsl(var(--comment-dark-gray))',
    'c00004': 'hsl(var(--comment-dark-gray))',
    'c00005': 'hsl(var(--comment-dark-gray))',
  },
  nodeIcons: {
  },
  commentExtras: {
    'c00001': { colorIndex: 4, size: { width: 440, height: 230 } },
    'c00002': { size: { width: 720, height: 1050 } },
    'c00003': { colorIndex: 2, size: { width: 380, height: 330 } },
    'c00004': { colorIndex: 6, size: { width: 380, height: 300 } },
    'c00005': { size: { width: 460, height: 516 } },
  },
};
