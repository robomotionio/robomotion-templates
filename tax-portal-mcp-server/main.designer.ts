export default {
  flowId: 'main',
  sourceHash: '3b4b6feb',
  // Laid out by stage rather than by the engine. It classifies this as a DAG and orders by
  // dependency depth, which stacks fifteen nodes into a 520x630 column: the screenshot frame
  // is 3.2:1, so that renders as unreadable text. One left-to-right band per stage on the
  // 280px grid, with the three tools fanning out of the server and the two readers fanning
  // out of the lookup, keeps the shape of the flow visible at a glance.
  positions: {
    'b21001': { x: 100, y: 400 },   // Serve The Tool — the MCP server
    'b21002': { x: 380, y: 60 },    // three Tool In nodes on the tools port
    'b21003': { x: 380, y: 400 },
    'b21004': { x: 380, y: 740 },
    'b21005': { x: 660, y: 400 },   // every call signs in first
    'b21006': { x: 940, y: 400 },
    'b21007': { x: 1220, y: 400 },  // Route By Tool
    'b21008': { x: 1500, y: 60 },   // list_clients needs nothing more
    'b21009': { x: 1500, y: 480 },  // Find The Company, three outputs
    'b2100a': { x: 1780, y: 340 },  // the VAT reader
    'b2100b': { x: 2060, y: 340 },
    'b2100c': { x: 1780, y: 700 },  // the invoice reader
    'b2100d': { x: 2060, y: 700 },
    'b2100e': { x: 2340, y: 400 },  // every path meets here
    'b2100f': { x: 2620, y: 400 },
  },
  nodeColors: {
  },
  nodeIcons: {
  },
  commentExtras: {

  },
};
