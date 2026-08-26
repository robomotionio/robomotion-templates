export default {
  flowId: '2ac9d5c7-5213-4880-abe6-445de6851260',
  sourceHash: '2d15447f',
  positions: {
    'c00001': { x: 60, y: 0 },

    // ---- 1. sign in --------------------------------------------------------
    'c00002': { x: 536, y: 0 },
    'a1c001': { x: 600, y: 250 },
    'b2d102': { x: 600, y: 320 },
    'c3e203': { x: 600, y: 390 },
    'd4f304': { x: 600, y: 460 },
    'e5a405': { x: 600, y: 530 },
    'f6b506': { x: 600, y: 600 },
    '07c607': { x: 600, y: 670 },
    '18d708': { x: 600, y: 740 },
    '29e809': { x: 600, y: 810 },

    // ---- 2. sweep every page -----------------------------------------------
    // Label at the top of the loop, GoTo at the bottom of it.
    'c00003': { x: 1056, y: 0 },
    '3a1b10': { x: 1120, y: 250 },
    '4b2c11': { x: 1120, y: 320 },
    '5c3d12': { x: 1120, y: 390 },
    '3af90a': { x: 1120, y: 460 },
    '4b0a0b': { x: 1120, y: 530 },
    '6e4f13': { x: 1120, y: 600 },
    '7f5014': { x: 1120, y: 670 },
    '806115': { x: 1120, y: 740 },

    // ---- 3. the exceptions --------------------------------------------------
    // Debug hangs off the side of the chain; the run carries on downward.
    'c00004': { x: 1576, y: 0 },
    '917216': { x: 1640, y: 250 },
    'a28317': { x: 1640, y: 320 },
    'b39418': { x: 1640, y: 390 },
    '5c1b0c': { x: 1880, y: 390 },
    'c4a519': { x: 1640, y: 460 },
    'd5b61a': { x: 1640, y: 530 },

    // ---- 4. close out -------------------------------------------------------
    'c00005': { x: 2176, y: 0 },
    'e6c71b': { x: 2240, y: 250 },
    '6d2c0d': { x: 2240, y: 320 },
    '7e3d0e': { x: 2240, y: 390 },
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
    'c00002': { size: { width: 484, height: 907 } },
    'c00003': { size: { width: 484, height: 837 } },
    'c00004': { colorIndex: 6, size: { width: 580, height: 627 } },
    'c00005': { size: { width: 484, height: 487 } },
  },
};
