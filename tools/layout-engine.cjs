#!/usr/bin/env node
/**
 * layout-engine.cjs
 *
 * Auto-layout engine for Robomotion template designers. Parses main.ts (and
 * any subflows/*.ts), classifies the flow shape, and writes a matching
 * main.designer.ts (and subflows/<id>.designer.ts) following the conventions
 * in docs/layout-guide.md and docs/wiring-guide.md.
 *
 * Patterns:
 *   - LINEAR_1COL  — no branches, no loop, ≤7 non-trigger nodes. Single column.
 *   - LINEAR_2COL  — no branches, no loop, ≥8 non-trigger nodes. Two columns.
 *   - DAG          — has branching (Switch / Fork / ForEach / Function outputs>1
 *                    or convergence via explicit edges). Sugiyama-style
 *                    layered layout with barycenter ordering.
 *   - LOOP         — has Label referenced by a GoTo. Horizontal main chain.
 *
 * Placement rules (from docs/wiring-guide.md):
 *   - Inject  y = first successor's y + TRIG_NUDGE
 *   - Stop    y = aligned with ONE predecessor (main-chain pred if available,
 *                 else first pred in source order); never the mean.
 *   - Stop    x = max(pred.x) + COL_W
 *
 * Usage:
 *   node tools/layout-engine.cjs <slug> [<slug>...]
 *   node tools/layout-engine.cjs --all
 *   node tools/layout-engine.cjs <slug> --check      # dry-run, print pattern + warnings
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const TEMPLATES_ROOT = process.env.TEMPLATES_ROOT
  || path.resolve(__dirname, '..');

// ---------------------------------------------------------------------------
// Node classification
// ---------------------------------------------------------------------------

const INJECT_NS = new Set([
  'Core.Trigger.Inject', 'Core.Net.HttpIn', 'Core.Trigger.Catch',
  'Robomotion.ChatAssistant.ChatIn',
]);
const ENDING_NS = new Set([
  'Core.Flow.Stop', 'Core.Net.HttpOut', 'Robomotion.ChatAssistant.ChatOut',
]);
const LABEL_NS = 'Core.Flow.Label';
const GOTO_NS = 'Core.Flow.GoTo';
const BRANCH_NS = new Set([
  'Core.Programming.Switch', 'Core.Programming.ForEach', 'Core.Flow.ForkBranch',
]);

function classify(ns) {
  if (ns === 'Core.Flow.Comment') return 'comment';
  if (INJECT_NS.has(ns)) return 'inject';
  if (ENDING_NS.has(ns)) return 'ending';
  if (ns === LABEL_NS) return 'label';
  if (ns === GOTO_NS) return 'goto';
  if (ns === 'Core.Flow.Begin') return 'begin';
  if (ns === 'Core.Flow.End') return 'end';
  return 'default';
}

function isTrigger(node) {
  return node.kind === 'inject' || node.kind === 'ending'
    || node.kind === 'label' || node.kind === 'goto'
    || node.kind === 'begin' || node.kind === 'end';
}

// ---------------------------------------------------------------------------
// main.ts / subflow .ts parser
// ---------------------------------------------------------------------------

function extractCallBlock(content, startIdx) {
  let depth = 0, started = false, i = startIdx;
  while (i < content.length && content[i] !== '(') i++;
  for (; i < content.length; i++) {
    const ch = content[i];
    if (ch === '(') { depth++; started = true; }
    else if (ch === ')') depth--;
    if (started && depth === 0) return content.slice(startIdx, i + 1);
  }
  return content.slice(startIdx);
}

function extractOptText(callStr) {
  const m1 = callStr.match(/optText:\s*'((?:[^'\\]|\\.)*)'/s);
  if (m1) return m1[1].replace(/\\'/g, "'").replace(/\\n/g, '\n');
  const m2 = callStr.match(/optText:\s*"((?:[^"\\]|\\.)*)"/s);
  if (m2) return m2[1].replace(/\\"/g, '"').replace(/\\n/g, '\n');
  return undefined;
}

function extractOutputs(callStr) {
  const m = callStr.match(/outputs:\s*(\d+)/);
  return m ? parseInt(m[1], 10) : undefined;
}

function extractGotoTargets(callStr) {
  const m = callStr.match(/ids:\s*\[([^\]]*)\]/);
  if (!m) return [];
  return [...m[1].matchAll(/'([^']+)'/g)].map(x => x[1]);
}

function parseFlow(content) {
  const nodes = [];
  const refs = [];
  const chainEdges = [];
  const explicitEdges = [];
  const gotoLinks = [];

  const pushNode = (id, ns, name, callStr) => {
    nodes.push({
      id, namespace: ns, name,
      kind: classify(ns),
      optText: ns === 'Core.Flow.Comment' ? extractOptText(callStr) : undefined,
      outputs: extractOutputs(callStr),
      gotoTargets: ns === GOTO_NS ? extractGotoTargets(callStr) : undefined,
      isBranch: BRANCH_NS.has(ns),
    });
  };

  const nodeRegex = /f\.node\(\s*'([a-f0-9]+)'\s*,\s*'([^']+)'\s*,\s*'([^']+)'/g;
  let m;
  while ((m = nodeRegex.exec(content)) !== null) {
    const [, id, ns, name] = m;
    const callStr = extractCallBlock(content, m.index);
    pushNode(id, ns, name, callStr);
    refs.push({ id, index: m.index, type: 'node' });
  }

  const thenRegex = /\.then\(\s*'([a-f0-9]+)'\s*,\s*'([^']+)'\s*,\s*'([^']+)'/g;
  while ((m = thenRegex.exec(content)) !== null) {
    const [, id, ns, name] = m;
    const callStr = extractCallBlock(content, m.index);
    pushNode(id, ns, name, callStr);
    refs.push({ id, index: m.index, type: 'then' });
  }

  refs.sort((a, b) => a.index - b.index);
  for (let i = 0; i < refs.length; i++) {
    if (refs[i].type === 'then' && i > 0) {
      chainEdges.push({ source: refs[i - 1].id, target: refs[i].id, sourcePort: 0 });
    }
  }

  const edgeRegex = /f\.edge\(\s*'([a-f0-9]+)'\s*,\s*(\d+)\s*,\s*'([a-f0-9]+)'\s*,\s*(\d+)\s*\)/g;
  while ((m = edgeRegex.exec(content)) !== null) {
    explicitEdges.push({
      source: m[1], sourcePort: parseInt(m[2], 10),
      target: m[3], targetPort: parseInt(m[4], 10),
    });
  }

  for (const n of nodes) {
    if (n.kind === 'goto' && n.gotoTargets) {
      for (const t of n.gotoTargets) gotoLinks.push({ source: n.id, target: t, sourcePort: 0 });
    }
  }

  const seen = new Set();
  const uniq = [];
  for (const n of nodes) { if (!seen.has(n.id)) { seen.add(n.id); uniq.push(n); } }

  return { nodes: uniq, chainEdges, explicitEdges, gotoLinks, refs };
}

// ---------------------------------------------------------------------------
// Flow-shape classification
// ---------------------------------------------------------------------------

function classifyFlow(parsed) {
  const { nodes, gotoLinks } = parsed;
  const nonComment = nodes.filter(n => n.kind !== 'comment');
  const nonTrigger = nonComment.filter(n => n.kind !== 'inject' && n.kind !== 'ending');
  const hasBranch = nonComment.some(n => n.isBranch || (n.outputs && n.outputs > 1));
  const hasLabel = nonComment.some(n => n.kind === 'label');
  const hasGoto = nonComment.some(n => n.kind === 'goto');
  const hasLoop = hasLabel && hasGoto && gotoLinks.some(l => nodes.find(n => n.id === l.target && n.kind === 'label'));

  // Multi-pred convergence (beyond a single Stop collecting all ends) also
  // qualifies as a DAG.
  const predMap = new Map();
  for (const e of [...parsed.chainEdges, ...parsed.explicitEdges]) {
    if (!predMap.has(e.target)) predMap.set(e.target, new Set());
    predMap.get(e.target).add(e.source);
  }
  const hasConvergence = [...predMap.values()].some(s => s.size >= 2);

  // LOOP pattern (horizontal walker) only handles simple single-chain loops.
  // If there's any branching OR convergence, use the DAG layered layout —
  // it removes back-edges, lays out main chain + loop body as two columns,
  // and handles branches with proper ordering.
  if (hasLoop && !hasBranch && !hasConvergence) {
    return { pattern: 'LOOP', nonComment, nonTrigger, hasBranch };
  }
  if (hasBranch || hasConvergence || hasLoop) return { pattern: 'DAG', nonComment, nonTrigger, hasBranch };
  if (nonTrigger.length >= 8) return { pattern: 'LINEAR_2COL', nonComment, nonTrigger, hasBranch };
  return { pattern: 'LINEAR_1COL', nonComment, nonTrigger, hasBranch };
}

// ---------------------------------------------------------------------------
// Geometry constants
// ---------------------------------------------------------------------------

const ROW_H = 70;
const COL_W = 260;
const MAIN_X = 600;
const START_X_OFFSET = 260;
const STOP_X_OFFSET = 260;
const DEFAULT_NODE_H = 47;   // canonical height (default rectangular node)
const DEFAULT_PORT_Y = DEFAULT_NODE_H / 2;   // 23.5
const DETACHED_GAP = 150;
const COMMENT_W = 440;
const COMMENT_H = 214;
const COMMENT_CLEARANCE = 80;
const NODE_H_HALF = 24;   // approx vertical radius for collision check

// Node height mirrors screenshot-generator/node-classifier getNodeDimensions.
// Used to position node tops such that port centres (vertical middle) align.
const BOX_NS = new Set([
  'Core.Programming.Switch', 'Core.Programming.ForEach',
  'Core.Flow.ForkBranch', 'Core.WaitGroup.Done',
]);
const RECT_NS = new Set(['Core.Programming.Function', 'Core.Flow.SubFlow']);
const LABEL_SHAPE_NS = new Set(['Core.Flow.Label', 'Core.Flow.GoTo', 'Core.Flow.Begin', 'Core.Flow.End']);

function nodeHeight(node) {
  const ns = node.namespace;
  if (INJECT_NS.has(ns) || ENDING_NS.has(ns) || LABEL_SHAPE_NS.has(ns)) return 36;
  if (BOX_NS.has(ns)) {
    // boxNode: BASE(50) + (MIN_PORTS(3)-1)*12 = 74 at 3 ports; +12 each extra.
    // `outputs` counts branches; total ports = outputs + 1 (input).
    const outs = node.outputs ?? 2;   // default ForEach has 2 outputs
    const ports = Math.max(outs + 1, 3);
    return 50 + (ports - 1) * 12;
  }
  if (RECT_NS.has(ns)) {
    // rectangularNode: BASE(35) + (MIN_PORTS(2)-1)*12 = 47 at 2 ports; +12 each extra.
    const outs = node.outputs ?? 1;
    const ports = Math.max(outs + 1, 2);
    return 35 + (ports - 1) * 12;
  }
  // defaultNode: flat 47
  return DEFAULT_NODE_H;
}

// Given a row's port-y, return the top-y this node should use so its port
// (vertical centre) coincides with the row.
function topYForPort(portY, node) {
  return Math.round(portY - nodeHeight(node) / 2);
}

// Row's canonical port-y (centre of a default-height node placed at grid).
function rowPortY(y0, row) {
  return y0 + row * ROW_H + DEFAULT_PORT_Y;
}

// Port-y (vertical centre) of an already-positioned node.
function portYOf(topY, node) {
  return topY + nodeHeight(node) / 2;
}

// Place `node` so its port sits at `portY`, column `x`.
function placePort(positions, node, x, portY) {
  positions[node.id] = { x, y: topYForPort(portY, node) };
}

// ---------------------------------------------------------------------------
// Graph helpers
// ---------------------------------------------------------------------------

function buildGraph(parsed) {
  const edges = [...parsed.chainEdges, ...parsed.explicitEdges];
  const succByPort = new Map();
  const succ = new Map();
  const pred = new Map();
  for (const n of parsed.nodes) {
    succ.set(n.id, []);
    pred.set(n.id, []);
    succByPort.set(n.id, new Map());
  }
  for (const e of edges) {
    if (!succ.has(e.source) || !pred.has(e.target)) continue;
    succ.get(e.source).push(e.target);
    pred.get(e.target).push(e.source);
    const portMap = succByPort.get(e.source);
    const port = e.sourcePort ?? 0;
    if (!portMap.has(port)) portMap.set(port, []);
    portMap.get(port).push(e.target);
  }
  return { edges, succ, pred, succByPort };
}

// Walk port 0 from `start` (through layerable nodes) to collect the main chain.
function buildMainChain(start, succ, layerableSet) {
  const chain = new Set();
  if (!start) return chain;
  let cur = (succ.get(start.id) || [])[0];
  while (cur && layerableSet.has(cur) && !chain.has(cur)) {
    chain.add(cur);
    const outs = succ.get(cur) || [];
    cur = outs[0];
  }
  return chain;
}

// ---------------------------------------------------------------------------
// Trigger placement
// ---------------------------------------------------------------------------

function placeInject(positions, start, succ, nodeById) {
  if (!start) return;
  const succs = (succ.get(start.id) || []).filter(s => positions[s]);
  if (succs.length === 0) {
    placePort(positions, start, MAIN_X - START_X_OFFSET, rowPortY(100, 0));
    return;
  }
  // Align Inject's port with its first successor's port.
  const firstId = succs[0];
  const firstNode = nodeById.get(firstId);
  const firstPortY = portYOf(positions[firstId].y, firstNode);
  placePort(positions, start, positions[firstId].x - START_X_OFFSET, firstPortY);
}

// Place an ending (Stop). x is right of the rightmost predecessor. Port-y
// aligned with that single predecessor when there's only one; otherwise
// the arithmetic mean of predecessor port-ys (standard Sugiyama convergence).
function placeEnding(positions, ending, preds, nodeById) {
  const placedPreds = preds.filter(p => positions[p]);
  if (placedPreds.length === 0) {
    placePort(positions, ending, MAIN_X + STOP_X_OFFSET, rowPortY(100, 0));
    return;
  }
  const rightmostX = Math.max(...placedPreds.map(p => positions[p].x));
  const x = rightmostX + STOP_X_OFFSET;

  const predPortYs = placedPreds.map(p => portYOf(positions[p].y, nodeById.get(p)));
  let portY;
  if (placedPreds.length === 1) {
    portY = predPortYs[0];
  } else {
    portY = predPortYs.reduce((s, v) => s + v, 0) / placedPreds.length;
  }
  let y = topYForPort(portY, ending);
  let attempts = 0;
  while (attempts < 6) {
    const clash = Object.entries(positions).some(([id, p]) =>
      id !== ending.id && Math.abs(p.x - x) < 20 && Math.abs(p.y - y) < NODE_H_HALF + 10);
    if (!clash) break;
    y += ROW_H;
    attempts++;
  }
  positions[ending.id] = { x, y };
}

// ---------------------------------------------------------------------------
// LINEAR layouts (unchanged from conventions, but using new trigger rules)
// ---------------------------------------------------------------------------

function layoutLinear1Col(parsed, graph) {
  const { succ, pred } = graph;
  const { nonComment } = classifyFlow(parsed);
  const nodeById = new Map(parsed.nodes.map(n => [n.id, n]));
  const start = nonComment.find(n => n.kind === 'inject');
  const endings = nonComment.filter(n => n.kind === 'ending');
  const middle = nonComment.filter(n => n !== start && !endings.includes(n));
  const ordered = orderFromStart(start, middle, succ);

  const positions = {};
  const y0 = 100;
  ordered.forEach((n, i) => placePort(positions, n, MAIN_X, rowPortY(y0, i)));

  placeInject(positions, start, succ, nodeById);
  for (const e of endings) placeEnding(positions, e, pred.get(e.id) || [], nodeById);

  const lastY = ordered.length ? y0 + (ordered.length - 1) * ROW_H : y0;
  placeComments(positions, parsed, y0);
  placeDetached(positions, parsed, graph, lastY);
  return positions;
}

function layoutLinear2Col(parsed, graph) {
  const { succ, pred } = graph;
  const { nonComment } = classifyFlow(parsed);
  const nodeById = new Map(parsed.nodes.map(n => [n.id, n]));
  const start = nonComment.find(n => n.kind === 'inject');
  const endings = nonComment.filter(n => n.kind === 'ending');
  const middle = nonComment.filter(n => n !== start && !endings.includes(n));
  const ordered = orderFromStart(start, middle, succ);

  const half = Math.ceil(ordered.length / 2);
  const col1 = ordered.slice(0, half);
  const col2 = ordered.slice(half);

  const positions = {};
  const y0 = 100;
  const col1X = MAIN_X;
  const col2X = MAIN_X + COL_W + 40;
  col1.forEach((n, i) => placePort(positions, n, col1X, rowPortY(y0, i)));
  col2.forEach((n, i) => placePort(positions, n, col2X, rowPortY(y0, i)));

  placeInject(positions, start, succ, nodeById);
  for (const e of endings) placeEnding(positions, e, pred.get(e.id) || [], nodeById);

  const maxI = Math.max(col1.length, col2.length) - 1;
  placeComments(positions, parsed, y0);
  placeDetached(positions, parsed, graph, y0 + maxI * ROW_H);
  return positions;
}

// ---------------------------------------------------------------------------
// DAG layout — Sugiyama-style layered layout with barycenter ordering
// ---------------------------------------------------------------------------

function layoutDAG(parsed, graph) {
  const { succ, pred } = graph;
  const { nonComment } = classifyFlow(parsed);
  const start = nonComment.find(n => n.kind === 'inject');
  const endings = nonComment.filter(n => n.kind === 'ending');

  // Layerable nodes exclude triggers and endings (placed after).
  const layerable = nonComment.filter(n => n.kind !== 'inject' && n.kind !== 'ending');
  const layerSet = new Set(layerable.map(n => n.id));

  // Back-edges from GoTo → Label are excluded from the DAG.
  const backEdges = new Set(parsed.gotoLinks.map(l => `${l.source}→${l.target}`));
  const lPred = (id) => (pred.get(id) || []).filter(p => layerSet.has(p) && !backEdges.has(`${p}→${id}`));
  const lSucc = (id) => (succ.get(id) || []).filter(s => layerSet.has(s) && !backEdges.has(`${id}→${s}`));

  // --- Step 1: topological order ---
  const inDeg = new Map(layerable.map(n => [n.id, lPred(n.id).length]));
  const topoOrder = [];
  const queue = layerable.filter(n => inDeg.get(n.id) === 0).map(n => n.id);
  const inQueue = new Set(queue);
  while (queue.length) {
    const id = queue.shift();
    topoOrder.push(id);
    for (const s of lSucc(id)) {
      inDeg.set(s, inDeg.get(s) - 1);
      if (inDeg.get(s) === 0 && !inQueue.has(s)) {
        queue.push(s);
        inQueue.add(s);
      }
    }
  }
  for (const n of layerable) if (!topoOrder.includes(n.id)) topoOrder.push(n.id);

  // --- Step 2: longest-path row assignment ---
  const row = new Map();
  for (const id of topoOrder) {
    const preds = lPred(id);
    const r = preds.length === 0 ? 0
      : Math.max(...preds.map(p => row.get(p) ?? 0)) + 1;
    row.set(id, r);
  }
  const maxRow = Math.max(0, ...[...row.values()]);

  // --- Step 3: identify the main chain (port 0 from start, through layerables) ---
  const mainChain = buildMainChain(start, succ, layerSet);

  // --- Step 4: group by row ---
  const rows = Array.from({ length: maxRow + 1 }, () => []);
  for (const n of layerable) rows[row.get(n.id)].push(n);

  // Initial order: main-chain node first, then source-order for the rest.
  for (let R = 0; R <= maxRow; R++) {
    rows[R].sort((a, b) => {
      const aM = mainChain.has(a.id) ? 0 : 1;
      const bM = mainChain.has(b.id) ? 0 : 1;
      if (aM !== bM) return aM - bM;
      return layerable.findIndex(n => n.id === a.id) - layerable.findIndex(n => n.id === b.id);
    });
  }

  // --- Step 5: barycenter ordering (iterate both directions) ---
  const bary = (ids, idxMap, fallback) => {
    const vals = ids.map(id => idxMap.get(id)).filter(v => v !== undefined);
    if (vals.length === 0) return fallback;
    return vals.reduce((s, v) => s + v, 0) / vals.length;
  };

  for (let iter = 0; iter < 24; iter++) {
    let changed = false;
    // Forward pass: order each row by barycenter of predecessors.
    for (let R = 1; R <= maxRow; R++) {
      const prevIdx = new Map(rows[R - 1].map((n, i) => [n.id, i]));
      const withBary = rows[R].map((n, origI) => ({
        n,
        // Pin main-chain nodes to slot 0.
        bary: mainChain.has(n.id) ? -Infinity : bary(lPred(n.id), prevIdx, origI),
        origI,
      }));
      withBary.sort((a, b) => (a.bary - b.bary) || (a.origI - b.origI));
      const newOrder = withBary.map(w => w.n);
      if (!sameOrder(rows[R], newOrder)) { rows[R] = newOrder; changed = true; }
    }
    // Backward pass: order each row by barycenter of successors.
    for (let R = maxRow - 1; R >= 0; R--) {
      const nextIdx = new Map(rows[R + 1].map((n, i) => [n.id, i]));
      const withBary = rows[R].map((n, origI) => ({
        n,
        bary: mainChain.has(n.id) ? -Infinity : bary(lSucc(n.id), nextIdx, origI),
        origI,
      }));
      withBary.sort((a, b) => (a.bary - b.bary) || (a.origI - b.origI));
      const newOrder = withBary.map(w => w.n);
      if (!sameOrder(rows[R], newOrder)) { rows[R] = newOrder; changed = true; }
    }
    if (!changed) break;
  }

  // --- Step 6: assign coordinates (port-aligned, not top-aligned) ---
  const positions = {};
  const y0 = 100;
  const nodeById = new Map(parsed.nodes.map(n => [n.id, n]));
  for (let R = 0; R <= maxRow; R++) {
    rows[R].forEach((n, slot) => {
      placePort(positions, n, MAIN_X + slot * COL_W, rowPortY(y0, R));
    });
  }

  // --- Step 7: place triggers (Inject + endings) ---
  placeInject(positions, start, succ, nodeById);
  for (const e of endings) placeEnding(positions, e, pred.get(e.id) || [], nodeById);

  placeComments(positions, parsed, y0);
  placeDetached(positions, parsed, graph, y0 + maxRow * ROW_H);
  return positions;
}

function sameOrder(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i].id !== b[i].id) return false;
  return true;
}

// ---------------------------------------------------------------------------
// LOOP layout — horizontal main chain with Label+GoTo loop-back
// ---------------------------------------------------------------------------

function layoutLoop(parsed, graph) {
  const { succ, pred } = graph;
  const { nonComment } = classifyFlow(parsed);
  const start = nonComment.find(n => n.kind === 'inject');
  const endings = nonComment.filter(n => n.kind === 'ending');
  const nodeById = new Map(nonComment.map(n => [n.id, n]));

  const labelIds = new Set(nonComment.filter(n => n.kind === 'label').map(n => n.id));
  const gotoTargets = new Set(parsed.gotoLinks.map(l => l.target));
  const loopLabels = [...labelIds].filter(id => gotoTargets.has(id));

  const positions = {};
  const visited = new Set();
  const y0 = 200;

  const mainPortY = cursorY + DEFAULT_PORT_Y;
  let cursorX = MAIN_X;
  if (start) {
    placePort(positions, start, cursorX - START_X_OFFSET, mainPortY);
    visited.add(start.id);
  }

  function walkHorizontal(seedId) {
    let id = seedId;
    while (id && !visited.has(id)) {
      const node = nodeById.get(id);
      if (!node) break;
      placePort(positions, node, cursorX, mainPortY);
      visited.add(id);
      if (loopLabels.includes(id)) return id;
      if (node.kind === 'ending') return null;
      const outs = succ.get(id) ?? [];
      if (outs.length === 0) return null;
      id = outs[0];
      cursorX += COL_W;
    }
    return id;
  }

  const startSuccs = succ.get(start?.id ?? '') ?? [];
  let labelReached = null;
  if (startSuccs.length > 0) labelReached = walkHorizontal(startSuccs[0]);

  if (labelReached) {
    let bodyX = positions[labelReached].x + COL_W;
    const bodyPortY = mainPortY + ROW_H + 20;
    let id = succ.get(labelReached)?.[0];
    while (id && !visited.has(id)) {
      const node = nodeById.get(id);
      if (!node) break;
      placePort(positions, node, bodyX, bodyPortY);
      visited.add(id);
      if (node.kind === 'goto') break;
      const outs = succ.get(id) ?? [];
      if (outs.length === 0) break;
      id = outs[0];
      bodyX += COL_W;
    }
  }

  placeComments(positions, parsed, y0 - 180);
  const endingSet = new Set(endings.map(e => e.id));
  placeDetached(positions, parsed, graph, cursorY + 200,
    new Set([...visited, ...endingSet]));
  for (const e of endings) {
    if (visited.has(e.id)) continue;
    placeEnding(positions, e, pred.get(e.id) || [], nodeById);
    visited.add(e.id);
  }
  return positions;
}

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

function orderFromStart(start, middle, succ) {
  const middleSet = new Set(middle.map(n => n.id));
  const order = [];
  const seen = new Set();
  const queue = start ? [...(succ.get(start.id) ?? [])] : [...middle.map(n => n.id)];
  while (queue.length) {
    const id = queue.shift();
    if (seen.has(id) || !middleSet.has(id)) continue;
    seen.add(id);
    order.push(middle.find(n => n.id === id));
    for (const s of succ.get(id) ?? []) queue.push(s);
  }
  for (const n of middle) if (!seen.has(n.id)) order.push(n);
  return order.filter(Boolean);
}

function placeComments(positions, parsed, topY) {
  const comments = parsed.nodes.filter(n => n.kind === 'comment');
  const commentX = MAIN_X - 30;
  let y = topY - COMMENT_CLEARANCE - COMMENT_H;
  for (const c of comments) {
    positions[c.id] = { x: commentX, y };
    y -= COMMENT_H + 40;
  }
}

function placeDetached(positions, parsed, graph, mainBottomY, visited = null) {
  const placedIds = new Set(Object.keys(positions));
  const { nodes } = parsed;
  const { succ } = graph;
  const detached = nodes.filter(n =>
    n.kind !== 'comment' && !placedIds.has(n.id) && !(visited && visited.has(n.id))
  );
  if (detached.length === 0) return;

  const nodeById = new Map(nodes.map(n => [n.id, n]));
  const idSet = new Set(detached.map(n => n.id));
  const compSeen = new Set();
  const components = [];
  // BFS within each component so port-0 successors come before port-1 (edges
  // are iterated in declaration order, which matches source port order).
  for (const n of detached) {
    if (compSeen.has(n.id)) continue;
    const comp = [];
    const queue = [n.id];
    compSeen.add(n.id);
    while (queue.length) {
      const id = queue.shift();
      comp.push(id);
      for (const s of succ.get(id) ?? []) {
        if (idSet.has(s) && !compSeen.has(s)) {
          compSeen.add(s);
          queue.push(s);
        }
      }
    }
    components.push(comp);
  }

  let y = mainBottomY + DETACHED_GAP;
  for (const comp of components) {
    const portY = y + DEFAULT_PORT_Y;
    comp.forEach((id, i) => {
      placePort(positions, nodeById.get(id), MAIN_X + i * COL_W, portY);
    });
    y += ROW_H + 40;
  }
}

// ---------------------------------------------------------------------------
// Routing warnings (cheap heuristics)
// ---------------------------------------------------------------------------

function routingWarnings(positions, parsed) {
  const warnings = [];
  const { edges } = buildGraph(parsed);
  const nodeEntries = Object.entries(positions);
  for (const e of edges) {
    const a = positions[e.source], b = positions[e.target];
    if (!a || !b) continue;
    const dx = b.x - a.x, dy = b.y - a.y;
    if (dx < -COL_W * 0.5 && Math.abs(dy) > ROW_H * 2) {
      warnings.push(`backward+diagonal wire ${e.source}→${e.target}`);
      continue;
    }
    if (Math.abs(dx) > COL_W * 3 && Math.abs(dy) > ROW_H * 3) {
      warnings.push(`long diagonal wire ${e.source}→${e.target}`);
      continue;
    }
    // Detect wire-through-node: for any node whose (x,y) lies between a and b
    // within small tolerance, warn.
    for (const [nid, p] of nodeEntries) {
      if (nid === e.source || nid === e.target) continue;
      if (p.x < Math.min(a.x, b.x) - 5 || p.x > Math.max(a.x, b.x) + 5) continue;
      const dxAB = b.x - a.x;
      if (Math.abs(dxAB) < 5) continue;
      const t = (p.x - a.x) / dxAB;
      if (t < 0.05 || t > 0.95) continue;
      const wireY = a.y + t * (b.y - a.y);
      if (Math.abs(p.y - wireY) < NODE_H_HALF) {
        warnings.push(`wire-through-node ${e.source}→${e.target} passes through ${nid}`);
        break;
      }
    }
  }
  return warnings;
}

// ---------------------------------------------------------------------------
// Designer emission
// ---------------------------------------------------------------------------

function emitDesigner(flowId, positions, commentIds, sourceHash, cameraKey = 'main') {
  const posLines = Object.entries(positions)
    .map(([id, p]) => `    '${id}': { x: ${Math.round(p.x)}, y: ${Math.round(p.y)} },`)
    .join('\n');
  const commentLines = commentIds
    .map(id => `    '${id}': { colorIndex: 4, size: { width: ${COMMENT_W}, height: ${COMMENT_H} } },`)
    .join('\n');
  return `export default {
  flowId: '${flowId}',
  sourceHash: '${sourceHash}',
  positions: {
${posLines}
  },
  cameraPositions: {
    '${cameraKey}': { x: 20, y: 139, zoom: 1.0 },
  },
  nodeColors: {
  },
  nodeIcons: {
  },
  commentExtras: {
${commentLines}
  },
};
`;
}

// ---------------------------------------------------------------------------
// Driver
// ---------------------------------------------------------------------------

function runLayout(parsed) {
  const cls = classifyFlow(parsed);
  const graph = buildGraph(parsed);
  let positions;
  switch (cls.pattern) {
    case 'LINEAR_1COL': positions = layoutLinear1Col(parsed, graph); break;
    case 'LINEAR_2COL': positions = layoutLinear2Col(parsed, graph); break;
    case 'DAG':         positions = layoutDAG(parsed, graph); break;
    case 'LOOP':        positions = layoutLoop(parsed, graph); break;
    default:            positions = layoutLinear1Col(parsed, graph); break;
  }
  return { positions, pattern: cls.pattern };
}

function processFile(filePath, cameraKey = null, checkOnly = false) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const parsed = parseFlow(content);
  const { positions, pattern } = runLayout(parsed);
  const warnings = routingWarnings(positions, parsed);

  let flowId;
  let flowIdMatch = content.match(/flow\.create\(\s*'([^']+)'/);
  const subIdMatch = content.match(/subflow\.create\(/);
  // Fallback: `const FLOW_ID = '<uuid>';` + `flow.create(FLOW_ID, ...)`
  if (!flowIdMatch) {
    const idRefMatch = content.match(/flow\.create\(\s*([A-Za-z_][\w]*)/);
    if (idRefMatch) {
      const varName = idRefMatch[1];
      const constMatch = content.match(new RegExp(`(?:const|let|var)\\s+${varName}\\s*=\\s*'([^']+)'`));
      if (constMatch) flowIdMatch = { 1: constMatch[1] };
    }
  }
  if (flowIdMatch) flowId = flowIdMatch[1];
  else if (subIdMatch) flowId = path.basename(filePath, '.ts');
  else throw new Error(`no flow.create / subflow.create in ${filePath}`);

  const commentIds = parsed.nodes.filter(n => n.kind === 'comment').map(n => n.id);
  const sourceHash = crypto.createHash('sha256').update(content).digest('hex').slice(0, 8);
  const designerPath = filePath.replace(/\.ts$/, '.designer.ts');
  const cameraKeyUsed = cameraKey || (flowIdMatch ? 'main' : flowId);
  const designer = emitDesigner(flowId, positions, commentIds, sourceHash, cameraKeyUsed);

  if (!checkOnly) fs.writeFileSync(designerPath, designer);
  return { pattern, warnings, nodeCount: parsed.nodes.length };
}

function processTemplate(templateDir, checkOnly = false) {
  const mainTsPath = path.join(templateDir, 'main.ts');
  if (!fs.existsSync(mainTsPath)) throw new Error(`main.ts missing in ${templateDir}`);
  const main = processFile(mainTsPath, 'main', checkOnly);
  let subflowCount = 0;
  const subDir = path.join(templateDir, 'subflows');
  if (fs.existsSync(subDir)) {
    for (const f of fs.readdirSync(subDir)) {
      if (f.endsWith('.ts') && !f.endsWith('.designer.ts')) {
        processFile(path.join(subDir, f), null, checkOnly);
        subflowCount++;
      }
    }
  }
  return { ...main, subflowCount };
}

function discoverTemplates() {
  return fs.readdirSync(TEMPLATES_ROOT).filter(e => {
    if (e === 'tools' || e.startsWith('.')) return false;
    const dir = path.join(TEMPLATES_ROOT, e);
    try { if (!fs.statSync(dir).isDirectory()) return false; } catch { return false; }
    return fs.existsSync(path.join(dir, 'main.ts'));
  }).sort();
}

function main() {
  const args = process.argv.slice(2);
  const checkOnly = args.includes('--check');
  const targets = args.includes('--all')
    ? discoverTemplates()
    : args.filter(a => !a.startsWith('-'));
  if (targets.length === 0) {
    console.error('Usage: layout-engine.cjs <slug> [<slug>...] [--check] | --all [--check]');
    process.exit(1);
  }

  let ok = 0, fail = 0, totalWarn = 0;
  for (const slug of targets) {
    const dir = path.join(TEMPLATES_ROOT, slug);
    try {
      const r = processTemplate(dir, checkOnly);
      const sfTxt = r.subflowCount ? `, ${r.subflowCount} subflow(s)` : '';
      const warn = r.warnings.length ? `   \u26a0 ${r.warnings.length} routing warning(s)` : '';
      console.log(`  ${slug}  [${r.pattern}]  ${r.nodeCount} nodes${sfTxt}${warn}`);
      if (r.warnings.length) {
        for (const w of r.warnings) console.log(`      ${w}`);
        totalWarn += r.warnings.length;
      }
      ok++;
    } catch (err) {
      console.error(`  FAIL ${slug}: ${err.message}`);
      fail++;
    }
  }
  console.log(`\n${checkOnly ? 'Check' : 'Wrote'}: ${ok} ok, ${fail} failed${totalWarn ? `, ${totalWarn} warning(s)` : ''}.`);
  process.exit(fail > 0 ? 1 : 0);
}

main();
