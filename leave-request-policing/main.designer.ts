export default {
  flowId: 'e14a7c0',
  sourceHash: 'f5d7e179',
  positions: {
    'c00001': { x: 60, y: 0 },

    // ---- 1. open the leave desk / 2. read pending --------------------------
    'c00002': { x: 536, y: 0 },
    'c00003': { x: 916, y: 0 },
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
    'a1000b': { x: 960, y: 250 },
    'a1000c': { x: 960, y: 320 },
    'a1000d': { x: 960, y: 390 },
    'a1000e': { x: 960, y: 460 },

    // ---- 3. approve the clean, deny the rest -------------------------------
    'c00004': { x: 1396, y: 0 },
    'b20001': { x: 1460, y: 250 },
    'b20000': { x: 1820, y: 250 },
    'b20002': { x: 1460, y: 320 },
    'b20003': { x: 1460, y: 390 },
    // deny branch (left)
    'b20010': { x: 1460, y: 490 },
    'b20011': { x: 1460, y: 560 },
    'b20012': { x: 1460, y: 630 },
    'b20013': { x: 1460, y: 700 },
    'b20014': { x: 1460, y: 770 },
    // approve branch (right)
    'b20020': { x: 1820, y: 490 },
    'b20021': { x: 1820, y: 560 },
    // record + loop
    'b20030': { x: 1640, y: 870 },
    'b20031': { x: 1640, y: 940 },
    'b20032': { x: 2000, y: 870 },

    // ---- 4. report ---------------------------------------------------------
    'c00005': { x: 2192, y: 0 },
    'c30001': { x: 2240, y: 250 },
    'c30002': { x: 2240, y: 320 },
    'c30003': { x: 2240, y: 390 },
    'c30004': { x: 2240, y: 460 },
    'c30005': { x: 2240, y: 530 },
  },
  cameraPositions: {
    'main': { x: 20, y: 60, zoom: 0.8 },
  },
  nodeColors: {
    'c00001': 'hsl(var(--comment-dark-gray))',
    'c00002': 'hsl(var(--comment-dark-gray))',
    'c00003': 'hsl(var(--comment-dark-gray))',
    'c00004': 'hsl(var(--comment-dark-gray))',
    'c00005': 'hsl(var(--comment-dark-gray))',
    'b20000': '#6610F2',
    'b20032': '#6610F2',
  },
  nodeIcons: {
  },
  commentExtras: {
    'c00001': { colorIndex: 4, size: { width: 440, height: 247 } },
    'c00002': { size: { width: 364, height: 977 } },
    'c00003': { size: { width: 344, height: 557 } },
    'c00004': { colorIndex: 2, size: { width: 780, height: 1037 } },
    'c00005': { size: { width: 468, height: 616 } },
  },
};
