/**
 * Parses main.ts and main.designer.ts files to extract flow data.
 * Uses regex-based extraction since the TS files follow highly consistent patterns.
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { classifyNode, getNodeDimensions, type NodeType } from './node-classifier.js';
import { resolveColor, setPspecColors } from './color-map.js';
import { getPspecDefaults } from './pspec-defaults.js';
import { loadPspecsForDependencies, type Dependency, type PspecNodeData } from './pspec-loader.js';

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
  /** For comment nodes: the background/border color */
  commentColor?: string;
  /** Number of input ports (0 for inject/trigger nodes) */
  inputs: number;
  /** Number of output ports (default 1, can be more for Switch/Function) */
  outputs: number;
  /** Lucide icon name from pspec */
  icon: string;
  /** Icon panel position for label-type nodes */
  iconPosition?: 'left' | 'right';
}

export interface FlowEdge {
  id: string;
  source: string;
  sourceHandle: string;
  target: string;
  targetHandle: string;
}

export interface CameraPosition {
  x: number;
  y: number;
  zoom: number;
}

export interface ParsedFlow {
  flowId: string;
  name: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
  cameraPosition?: CameraPosition;
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
  cameraPositions: Record<string, CameraPosition>;
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

/** Parse f.addDependency() calls from main.ts */
function parseDependencies(content: string): Dependency[] {
  const deps: Dependency[] = [];
  const depRegex = /f\.addDependency\(\s*'([^']+)'\s*,\s*'([^']+)'\s*\)/g;
  let match: RegExpExecArray | null;
  while ((match = depRegex.exec(content)) !== null) {
    deps.push({ namespace: match[1], version: match[2] });
  }
  return deps;
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

  // Strategy: find all f.node() and .then() calls, tracking chains
  // We need to find entire node call blocks including their options

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

/** Parse main.designer.ts to extract positions, colors, comment extras, and camera positions */
export function parseDesignerTs(content: string): DesignerData {
  const positions: Record<string, { x: number; y: number }> = {};
  const nodeColors: Record<string, string> = {};
  const commentExtras: Record<string, { colorIndex?: number; size?: { width: number; height: number } }> = {};
  const cameraPositions: Record<string, CameraPosition> = {};

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
    const entryRegex = /'([a-f0-9]+)':\s*\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g;
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

  // Extract cameraPositions
  const cameraSection = extractSection(content, 'cameraPositions');
  if (cameraSection) {
    const camRegex = /'([^']+)':\s*\{\s*x:\s*(-?\d+(?:\.\d+)?)\s*,\s*y:\s*(-?\d+(?:\.\d+)?)\s*,\s*zoom:\s*(\d+(?:\.\d+)?)\s*\}/g;
    let match: RegExpExecArray | null;
    while ((match = camRegex.exec(cameraSection)) !== null) {
      cameraPositions[match[1]] = {
        x: parseFloat(match[2]),
        y: parseFloat(match[3]),
        zoom: parseFloat(match[4]),
      };
    }
  }

  return { positions, nodeColors, commentExtras, cameraPositions };
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
  const pkg = parts[parts.length - 2];
  const action = parts[parts.length - 1];
  return `${pkg} → ${action}`;
}

/** Comment color palette by index (dark-mode, matching the designer themes.css) */
const COMMENT_COLORS: Record<number, string> = {
  0: 'hsl(240, 6%, 20%)',   // Dark Gray (default)
  1: 'hsl(210, 6%, 25%)',   // Slate
  2: 'hsl(213, 30%, 25%)',  // Blue
  3: 'hsl(142, 30%, 25%)',  // Green
  4: 'hsl(250, 30%, 25%)',  // Purple
  5: 'hsl(327, 30%, 25%)',  // Pink
  6: 'hsl(0, 30%, 25%)',    // Red
  7: 'hsl(48, 30%, 25%)',   // Amber
  8: 'hsl(226, 30%, 25%)',  // Indigo
};

/** Build a FlowNode from a raw node, using pspec data when available */
function buildFlowNode(
  raw: RawNode,
  designer: DesignerData,
  pspecData: Map<string, PspecNodeData>,
): FlowNode {
  const nodeType = classifyNode(raw.namespace);
  const commentExtra = designer.commentExtras[raw.id];
  const commentSize = commentExtra?.size;
  const position = designer.positions[raw.id] ?? { x: 0, y: 0 };
  const color = resolveColor(raw.id, raw.namespace, designer.nodeColors);
  const pspec = getPspecDefaults(raw.namespace);
  const pspecNode = pspecData.get(raw.namespace);

  // Determine output count: explicit in code > pspec download > pspec defaults
  let outputs = raw.outputs ?? pspecNode?.outputs ?? pspec.outputs;
  if (raw.conditionCount) {
    outputs = raw.conditionCount;
  }
  if (raw.namespace === 'Core.Programming.ForEach') outputs = 2;
  if (raw.namespace === 'Core.Flow.ForkBranch') outputs = 2;

  const inputs = pspecNode?.inputs ?? pspec.inputs;

  const portCount = outputs + inputs;
  const dimensions = getNodeDimensions(nodeType, commentSize, portCount);

  // Resolve comment color from palette
  const commentColorIndex = commentExtra?.colorIndex ?? 0;
  const commentColor = nodeType === 'commentNode' ? (COMMENT_COLORS[commentColorIndex] ?? COMMENT_COLORS[0]) : undefined;

  // Label/Begin → icon on left, GoTo/End → icon on right
  const LEFT_ICON_NS = new Set(['Core.Flow.Label', 'Core.Flow.Begin']);
  const iconPosition = nodeType === 'labelNode'
    ? (LEFT_ICON_NS.has(raw.namespace) ? 'left' as const : 'right' as const)
    : undefined;

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
    commentColor,
    inputs,
    outputs,
    icon: pspec.icon,
    iconPosition,
  };
}

/**
 * Parse a full template directory and return combined flow data.
 */
export async function parseTemplate(templateDir: string): Promise<ParsedFlow> {
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

  // Parse dependencies and download pspec data
  const deps = parseDependencies(mainContent);
  let pspecData = new Map<string, PspecNodeData>();
  if (deps.length > 0) {
    try {
      pspecData = await loadPspecsForDependencies(deps);
      // Set pspec colors for the color resolver
      const colorMap: Record<string, string> = {};
      for (const [ns, data] of pspecData) {
        colorMap[ns] = data.color;
      }
      setPspecColors(colorMap);
    } catch (err) {
      console.warn(`    [pspec] Failed to load pspec data: ${err instanceof Error ? err.message : err}`);
    }
  } else {
    // No deps — clear any stale pspec colors from previous template
    setPspecColors({});
  }

  // Extract flow ID and name
  const flowIdMatch = mainContent.match(/flow\.create\(\s*'([^']+)'\s*,\s*'([^']+)'/);
  const flowId = flowIdMatch?.[1] ?? '';
  const flowName = flowIdMatch?.[2] ?? '';

  // Get camera position for this flow
  const cameraPosition = designer.cameraPositions[flowId];

  // Build final nodes
  const nodes: FlowNode[] = rawNodes.map(raw => buildFlowNode(raw, designer, pspecData));

  // Combine edges, deduplicating
  const edgeMap = new Map<string, FlowEdge>();
  for (const edge of [...chainEdges, ...explicitEdges]) {
    const key = `${edge.source}-${edge.sourceHandle}-${edge.target}-${edge.targetHandle}`;
    edgeMap.set(key, edge);
  }

  // Also parse subflows if they exist
  const subflowsDir = join(templateDir, 'subflows');
  if (existsSync(subflowsDir)) {
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
        nodes.push(buildFlowNode(raw, subDesigner, pspecData));
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
    cameraPosition,
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
