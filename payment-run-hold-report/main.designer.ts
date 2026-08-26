export default {
  flowId: 'c56050d7-2952-4623-a63a-ed16294f98ff',
  sourceHash: 'bb7450f0',
  positions: {
    'c00001': { x: 60, y: 0 },

    // ---- 1. sign in from the vault -----------------------------------------
    'c00002': { x: 536, y: 0 },
    'a10f01': { x: 600, y: 250 },
    'a10f02': { x: 600, y: 320 },
    'a10f03': { x: 600, y: 390 },
    'a10f04': { x: 600, y: 460 },
    'a10f05': { x: 600, y: 530 },
    'a10f06': { x: 600, y: 600 },
    'a10f07': { x: 600, y: 670 },
    'a10f08': { x: 600, y: 740 },

    // ---- 2. propose and confirm --------------------------------------------
    // Debug hangs off the side of the chain; the run carries on downward.
    'c00003': { x: 1056, y: 0 },
    'a10f09': { x: 1120, y: 250 },
    'a10f0a': { x: 1120, y: 320 },
    'a20f0b': { x: 1120, y: 390 },
    'a20f0c': { x: 1120, y: 460 },
    'a20f0d': { x: 1120, y: 530 },
    'a20f0e': { x: 1120, y: 600 },
    'a20f0f': { x: 1120, y: 670 },
    'a20f14': { x: 1360, y: 670 },
    'a20f10': { x: 1120, y: 740 },
    'a20f11': { x: 1120, y: 810 },

    // ---- 3. account for what was left out ----------------------------------
    'c00004': { x: 1696, y: 0 },
    'a30f01': { x: 1760, y: 250 },
    'a30f02': { x: 1760, y: 320 },
    'a30f0c': { x: 1760, y: 390 },
    'a30f03': { x: 1760, y: 460 },

    // ---- 4. report ----------------------------------------------------------
    // Create Reports Folder is the "only if missing" leg and rejoins at Write.
    'c00005': { x: 2216, y: 0 },
    'a30f04': { x: 2280, y: 250 },
    'a30f05': { x: 2280, y: 320 },
    'a30f06': { x: 2280, y: 390 },
    'a30f07': { x: 2280, y: 460 },
    'a30f08': { x: 2520, y: 530 },
    'a30f09': { x: 2280, y: 600 },
    'a30f0a': { x: 2280, y: 670 },
    'a30f0b': { x: 2280, y: 740 },
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
    'c00001': { colorIndex: 4, size: { width: 440, height: 260 } },
    'c00002': { size: { width: 484, height: 837 } },
    'c00003': { size: { width: 580, height: 907 } },
    'c00004': { colorIndex: 6, size: { width: 484, height: 557 } },
    'c00005': { size: { width: 580, height: 837 } },
  },
};
