/**
 * Parses main.ts and main.designer.ts files to extract flow data.
 * Uses regex-based extraction since the TS files follow highly consistent patterns.
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { classifyNode, getNodeDimensions, type NodeType } from './node-classifier.js';
import { resolveColor } from './color-map.js';
import { getPspecDefaults } from './pspec-defaults.js';

export interface FlowNode {
  id: string;
  namespace: string;
  name: string;
  nodeType: NodeType;
  color: string;
  position: { x: number; y: number };
  dimensions: { width: number; height: number };
  /** For subtitle display: "PackageName → ActionName" */
  subtitle: string;
  /** For comment nodes: the markdown text */
  commentText?: string;
  /** Number of input ports (0 for inject/trigger nodes) */
  inputs: number;
  /** Number of output ports (default 1, can be more for Switch/Function) */
  outputs: number;
  /** Lucide icon name from pspec */
  icon: string;
}

export interface FlowEdge {
  id: string;
  source: string;
  sourceHandle: string;
  target: string;
  targetHandle: string;
}

export interface ParsedFlow {
  flowId: string;
  name: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
}

interface RawNode {
  id: string;
  namespace: string;
  name: string;
  optText?: string;
  outputs?: number;
  conditionCount?: number;
}

interface DesignerData {
  positions: Record<string, { x: number; y: number }>;
  nodeColors: Record<string, string>;
  commentExtras: Record<string, { colorIndex?: number; size?: { width: number; height: number } }>;
}

/** Extract the optText content from a node call string */
function extractOptText(nodeCallStr: string): string | undefined {
  // Match optText: 'content' or optText: "content"
  // The content can contain escaped quotes and newlines
  const match = nodeCallStr.match(/optText:\s*'((?:[^'\\]|\\.)*)'/s);
  if (match) return match[1].replace(/\\'/g, "'").replace(/\\n/g, '\n');

  const match2 = nodeCallStr.match(/optText:\s*"((?:[^"\\]|\\.)*)"/s);
  if (match2) return match2[1].replace(/\\"/g, '"').replace(/\\n/g, '\n');

  return undefined;
}

/** Extract output count from a node call string */
function extractOutputs(nodeCallStr: string): number | undefined {
  const match = nodeCallStr.match(/outputs:\s*(\d+)/);
  return match ? parseInt(match[1], 10) : undefined;
}

/** Count conditions in a Switch node */
function extractConditionCount(nodeCallStr: string): number | undefined {
  const match = nodeCallStr.match(/optConditions:\s*\[([^\]]*)\]/s);
  if (!match) return undefined;
  // Count the number of elements (strings or objects)
  const inner = match[1];
  const items = inner.match(/'[^']*'|"[^"]*"|\{[^}]*\}/g);
  return items ? items.length : undefined;
}

/**
 * Parse main.ts to extract nodes and edges.
 * Handles:
 * - f.node('ID', 'NS', 'NAME', {...}) — standalone nodes
 * - .then('ID', 'NS', 'NAME', {...}) — chained nodes (creates edge from previous)
 * - f.edge('SRC', PORT, 'TGT', PORT) — explicit edges
 */
export function parseMainTs(content: string): { nodes: RawNode[]; chainEdges: FlowEdge[]; explicitEdges: FlowEdge[] } {
  const nodes: RawNode[] = [];
  const chainEdges: FlowEdge[] = [];
  const explicitEdges: FlowEdge[] = [];

  // Extract flow name
  // const flowNameMatch = content.match(/flow\.create\('[^']+',\s*'([^']+)'/);

  // Strategy: find all f.node() and .then() calls, tracking chains
  // We need to find entire node call blocks including their options

  // First, find all f.node() calls with their full content up to the closing paren
  // We'll work line by line to handle multiline content
  const lines = content.split('\n');
  const fullContent = content;

  // Find f.node() calls — these start new chains
  // Pattern: f.node('id', 'namespace', 'name', {
  const nodeRegex = /f\.node\(\s*'([a-f0-9]+)'\s*,\s*'([^']+)'\s*,\s*'([^']+)'/g;
  let match: RegExpExecArray | null;

  // Track the last node id in the current chain for .then() linking
  const nodePositionsInSource: { id: string; index: number }[] = [];

  while ((match = nodeRegex.exec(fullContent)) !== null) {
    const [, id, namespace, name] = match;
    const startIdx = match.index;

    // Get the full node call including options to extract optText, outputs, etc.
    const nodeCallStr = extractCallBlock(fullContent, startIdx);

    const node: RawNode = {
      id,
      namespace,
      name,
      optText: namespace === 'Core.Flow.Comment' ? extractOptText(nodeCallStr) : undefined,
      outputs: extractOutputs(nodeCallStr),
    };

    if (namespace === 'Core.Programming.Switch') {
      node.conditionCount = extractConditionCount(nodeCallStr);
    }

    nodes.push(node);
    nodePositionsInSource.push({ id, index: startIdx });
  }

  // Find .then() calls — these chain from the previous node
  const thenRegex = /\.then\(\s*'([a-f0-9]+)'\s*,\s*'([^']+)'\s*,\s*'([^']+)'/g;
  const thenNodes: { id: string; namespace: string; name: string; index: number; callStr: string }[] = [];

  while ((match = thenRegex.exec(fullContent)) !== null) {
    const [, id, namespace, name] = match;
    const startIdx = match.index;
    const callStr = extractCallBlock(fullContent, startIdx);

    thenNodes.push({ id, namespace, name, index: startIdx, callStr });

    const node: RawNode = {
      id,
      namespace,
      name,
      optText: namespace === 'Core.Flow.Comment' ? extractOptText(callStr) : undefined,
      outputs: extractOutputs(callStr),
    };

    if (namespace === 'Core.Programming.Switch') {
      node.conditionCount = extractConditionCount(callStr);
    }

    nodes.push(node);
  }

  // Build chain edges: for each .then(), find the preceding node/then
  // Sort all node references by source position
  const allNodeRefs = [
    ...nodePositionsInSource.map(n => ({ ...n, type: 'node' as const })),
    ...thenNodes.map(n => ({ id: n.id, index: n.index, type: 'then' as const })),
  ].sort((a, b) => a.index - b.index);

  for (let i = 0; i < allNodeRefs.length; i++) {
    const ref = allNodeRefs[i];
    if (ref.type === 'then') {
      // Find the preceding node in the chain
      const prevRef = allNodeRefs[i - 1];
      if (prevRef) {
        const edgeId = `chain-${prevRef.id}-${ref.id}`;
        chainEdges.push({
          id: edgeId,
          source: prevRef.id,
          sourceHandle: `${prevRef.id}-source-1`,
          target: ref.id,
          targetHandle: `${ref.id}-target-1`,
        });
      }
    }
  }

  // Find explicit f.edge() calls
  const edgeRegex = /f\.edge\(\s*'([a-f0-9]+)'\s*,\s*(\d+)\s*,\s*'([a-f0-9]+)'\s*,\s*(\d+)\s*\)/g;
  while ((match = edgeRegex.exec(fullContent)) !== null) {
    const [, source, sourcePort, target, targetPort] = match;
    explicitEdges.push({
      id: `edge-${source}-${sourcePort}-${target}-${targetPort}`,
      source,
      sourceHandle: `${source}-source-${parseInt(sourcePort) + 1}`,
      target,
      targetHandle: `${target}-target-${parseInt(targetPort) + 1}`,
    });
  }

  return { nodes, chainEdges, explicitEdges };
}

/** Extract the full call block starting from a position (handles nested braces/parens) */
function extractCallBlock(content: string, startIdx: number): string {
  let depth = 0;
  let started = false;
  let i = startIdx;

  // Find the opening paren
  while (i < content.length && content[i] !== '(') i++;

  for (; i < content.length; i++) {
    const ch = content[i];
    if (ch === '(') { depth++; started = true; }
    else if (ch === ')') { depth--; }

    if (started && depth === 0) {
      return content.slice(startIdx, i + 1);
    }
  }
  return content.slice(startIdx);
}

/** Parse main.designer.ts to extract positions, colors, and comment extras */
export function parseDesignerTs(content: string): DesignerData {
  const positions: Record<string, { x: number; y: number }> = {};
  const nodeColors: Record<string, string> = {};
  const commentExtras: Record<string, { colorIndex?: number; size?: { width: number; height: number } }> = {};

  // Extract positions
  const posRegex = /'([a-f0-9]+)':\s*\{\s*x:\s*(-?\d+(?:\.\d+)?)\s*,\s*y:\s*(-?\d+(?:\.\d+)?)\s*\}/g;
  const posSection = extractSection(content, 'positions');
  if (posSection) {
    let match: RegExpExecArray | null;
    while ((match = posRegex.exec(posSection)) !== null) {
      positions[match[1]] = { x: parseFloat(match[2]), y: parseFloat(match[3]) };
    }
  }

  // Extract nodeColors
  const colorSection = extractSection(content, 'nodeColors');
  if (colorSection) {
    const colorRegex = /'([a-f0-9]+)':\s*'([^']+)'/g;
    let match: RegExpExecArray | null;
    while ((match = colorRegex.exec(colorSection)) !== null) {
      nodeColors[match[1]] = match[2];
    }
  }

  // Extract commentExtras
  const commentSection = extractSection(content, 'commentExtras');
  if (commentSection) {
    // Match each entry: 'id': { colorIndex: N, size: { width: W, height: H } }
    const entryRegex = /'([a-f0-9]+)':\s*\{([^}]*(?:\{[^}]*\}[^}]*)*)\}/g;
    let match: RegExpExecArray | null;
    while ((match = entryRegex.exec(commentSection)) !== null) {
      const id = match[1];
      const body = match[2];
      const extra: { colorIndex?: number; size?: { width: number; height: number } } = {};

      const colorIdxMatch = body.match(/colorIndex:\s*(\d+)/);
      if (colorIdxMatch) extra.colorIndex = parseInt(colorIdxMatch[1], 10);

      const sizeMatch = body.match(/size:\s*\{\s*width:\s*(\d+)\s*,\s*height:\s*(\d+)\s*\}/);
      if (sizeMatch) extra.size = { width: parseInt(sizeMatch[1], 10), height: parseInt(sizeMatch[2], 10) };

      commentExtras[id] = extra;
    }
  }

  return { positions, nodeColors, commentExtras };
}

/** Extract a section by key name from the designer export */
function extractSection(content: string, key: string): string | null {
  const regex = new RegExp(`${key}:\\s*\\{`, 'g');
  const match = regex.exec(content);
  if (!match) return null;

  let depth = 0;
  let started = false;
  const startIdx = match.index;

  for (let i = match.index + match[0].length - 1; i < content.length; i++) {
    if (content[i] === '{') { depth++; started = true; }
    else if (content[i] === '}') { depth--; }

    if (started && depth === 0) {
      return content.slice(startIdx, i + 1);
    }
  }
  return null;
}

/** Build subtitle from namespace: "Package → Action" */
function buildSubtitle(namespace: string): string {
  const parts = namespace.split('.');
  if (parts.length <= 2) return namespace;
  // E.g. "Robomotion.GoogleSheets.SetCellValue" → "GoogleSheets → SetCellValue"
  // E.g. "Core.Programming.Function" → "Programming → Function"
  const pkg = parts[parts.length - 2];
  const action = parts[parts.length - 1];
  return `${pkg} → ${action}`;
}

/** Comment color palette by index (matching the designer) */
const COMMENT_COLORS: Record<number, string> = {
  0: '#CCCCCC',  // light gray
  1: '#FBE364',  // yellow
  2: '#FBE364',  // yellow (alt)
  3: '#A8D5BA',  // green
  4: '#4A5568',  // dark gray
  5: '#E2B6CF',  // pink
  6: '#4A5568',  // dark gray (alt)
  7: '#B8C9E8',  // blue
  8: '#F5C6AA',  // peach
};

/**
 * Parse a full template directory and return combined flow data.
 */
export function parseTemplate(templateDir: string): ParsedFlow {
  const mainTsPath = join(templateDir, 'main.ts');
  const designerTsPath = join(templateDir, 'main.designer.ts');

  if (!existsSync(mainTsPath)) {
    throw new Error(`main.ts not found in ${templateDir}`);
  }
  if (!existsSync(designerTsPath)) {
    throw new Error(`main.designer.ts not found in ${templateDir}`);
  }

  const mainContent = readFileSync(mainTsPath, 'utf-8');
  const designerContent = readFileSync(designerTsPath, 'utf-8');

  const { nodes: rawNodes, chainEdges, explicitEdges } = parseMainTs(mainContent);
  const designer = parseDesignerTs(designerContent);

  // Extract flow ID and name
  const flowIdMatch = mainContent.match(/flow\.create\(\s*'([^']+)'\s*,\s*'([^']+)'/);
  const flowId = flowIdMatch?.[1] ?? '';
  const flowName = flowIdMatch?.[2] ?? '';

  // Build final nodes
  const nodes: FlowNode[] = rawNodes.map(raw => {
    const nodeType = classifyNode(raw.namespace);
    const commentExtra = designer.commentExtras[raw.id];
    const commentSize = commentExtra?.size;
    const position = designer.positions[raw.id] ?? { x: 0, y: 0 };
    const color = resolveColor(raw.id, raw.namespace, designer.nodeColors);
    const pspec = getPspecDefaults(raw.namespace);

    // Determine output count
    let outputs = raw.outputs ?? pspec.outputs;
    if (raw.conditionCount) {
      outputs = raw.conditionCount;
    }
    // ForEach has 2 outputs (iterate + complete)
    if (raw.namespace === 'Core.Programming.ForEach') outputs = 2;
    // ForkBranch has 2 outputs (branch + complete)
    if (raw.namespace === 'Core.Flow.ForkBranch') outputs = 2;

    const inputs = pspec.inputs;

    // Port count for dynamic height calculation (inputs + outputs)
    const portCount = outputs + inputs;
    const dimensions = getNodeDimensions(nodeType, commentSize, portCount);

    return {
      id: raw.id,
      namespace: raw.namespace,
      name: raw.name,
      nodeType,
      color,
      position,
      dimensions,
      subtitle: buildSubtitle(raw.namespace),
      commentText: raw.optText,
      inputs,
      outputs,
      icon: pspec.icon,
    };
  });

  // Combine edges, deduplicating
  const edgeMap = new Map<string, FlowEdge>();
  for (const edge of [...chainEdges, ...explicitEdges]) {
    const key = `${edge.source}-${edge.sourceHandle}-${edge.target}-${edge.targetHandle}`;
    edgeMap.set(key, edge);
  }

  // Also parse subflows if they exist
  const subflowsDir = join(templateDir, 'subflows');
  if (existsSync(subflowsDir)) {
    // We'll include subflow nodes/edges in the main rendering
    // by finding all .ts files (not .designer.ts) in subflows/
    const subflowFiles = readdirSyncSafe(subflowsDir)
      .filter(f => f.endsWith('.ts') && !f.endsWith('.designer.ts'));

    for (const subFile of subflowFiles) {
      const subId = subFile.replace('.ts', '');
      const subMainPath = join(subflowsDir, subFile);
      const subDesignerPath = join(subflowsDir, `${subId}.designer.ts`);

      if (!existsSync(subDesignerPath)) continue;

      const subMainContent = readFileSync(subMainPath, 'utf-8');
      const subDesignerContent = readFileSync(subDesignerPath, 'utf-8');

      const subParsed = parseMainTs(subMainContent);
      const subDesigner = parseDesignerTs(subDesignerContent);

      for (const raw of subParsed.nodes) {
        const nodeType = classifyNode(raw.namespace);
        const commentExtra = subDesigner.commentExtras[raw.id];
        const commentSize = commentExtra?.size;
        const position = subDesigner.positions[raw.id] ?? { x: 0, y: 0 };
        const color = resolveColor(raw.id, raw.namespace, subDesigner.nodeColors);
        const pspec = getPspecDefaults(raw.namespace);

        let outputs = raw.outputs ?? pspec.outputs;
        if (raw.conditionCount) outputs = raw.conditionCount;
        if (raw.namespace === 'Core.Programming.ForEach') outputs = 2;
        if (raw.namespace === 'Core.Flow.ForkBranch') outputs = 2;

        const inputs = pspec.inputs;
        const portCount = outputs + inputs;
        const dimensions = getNodeDimensions(nodeType, commentSize, portCount);

        nodes.push({
          id: raw.id,
          namespace: raw.namespace,
          name: raw.name,
          nodeType,
          color,
          position,
          dimensions,
          subtitle: buildSubtitle(raw.namespace),
          commentText: raw.optText,
          inputs,
          outputs,
          icon: pspec.icon,
        });
      }

      for (const edge of [...subParsed.chainEdges, ...subParsed.explicitEdges]) {
        const key = `${edge.source}-${edge.sourceHandle}-${edge.target}-${edge.targetHandle}`;
        edgeMap.set(key, edge);
      }
    }
  }

  return {
    flowId,
    name: flowName,
    nodes,
    edges: Array.from(edgeMap.values()),
  };
}

function readdirSyncSafe(dir: string): string[] {
  try {
    const { readdirSync } = require('fs');
    return readdirSync(dir);
  } catch {
    return [];
  }
}
