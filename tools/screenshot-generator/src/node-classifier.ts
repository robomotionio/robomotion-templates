/**
 * Classifies node namespaces into visual node types for React Flow rendering.
 * Matches the logic of getNodeTypeByNamespace in the Robomotion designer.
 */

export type NodeType =
  | 'injectNode'
  | 'endingNode'
  | 'boxNode'
  | 'rectangularNode'
  | 'labelNode'
  | 'commentNode'
  | 'defaultNode';

const INJECT_NAMESPACES = new Set([
  'Core.Trigger.Inject',
  'Core.Net.HttpIn',
  'Core.Trigger.Catch',
  'Robomotion.ChatAssistant.ChatIn',
]);

const ENDING_NAMESPACES = new Set([
  'Core.Flow.Stop',
  'Core.Net.HttpOut',
  'Robomotion.ChatAssistant.ChatOut',
]);

const BOX_NAMESPACES = new Set([
  'Core.Programming.Switch',
  'Core.Programming.ForEach',
  'Core.Flow.ForkBranch',
  'Core.WaitGroup.Done',
]);

const RECTANGULAR_NAMESPACES = new Set([
  'Core.Programming.Function',
  'Core.Flow.SubFlow',
]);

const LABEL_NAMESPACES = new Set([
  'Core.Flow.Label',
  'Core.Flow.GoTo',
  'Core.Flow.Begin',
  'Core.Flow.End',
]);

export function classifyNode(namespace: string): NodeType {
  if (namespace === 'Core.Flow.Comment') return 'commentNode';
  if (INJECT_NAMESPACES.has(namespace)) return 'injectNode';
  if (ENDING_NAMESPACES.has(namespace)) return 'endingNode';
  if (BOX_NAMESPACES.has(namespace)) return 'boxNode';
  if (RECTANGULAR_NAMESPACES.has(namespace)) return 'rectangularNode';
  if (LABEL_NAMESPACES.has(namespace)) return 'labelNode';
  return 'defaultNode';
}

/** Get default dimensions for a node type */
export function getNodeDimensions(
  nodeType: NodeType,
  commentSize?: { width: number; height: number },
  portCount?: number,
): { width: number; height: number } {
  switch (nodeType) {
    case 'injectNode':
      return { width: 150, height: 36 };
    case 'endingNode':
      return { width: 160, height: 36 };
    case 'boxNode': {
      // BASE(50) + (MIN_PORTS(3)-1)*12 = 74, +12 per extra port beyond 3
      const ports = portCount ?? 3;
      const height = 50 + (Math.max(ports, 3) - 1) * 12;
      return { width: 80, height };
    }
    case 'rectangularNode': {
      // BASE(35) + (MIN_PORTS(2)-1)*12 = 47, +12 per extra port beyond 2
      const ports = portCount ?? 2;
      const height = 35 + (Math.max(ports, 2) - 1) * 12;
      return { width: 200, height };
    }
    case 'labelNode':
      return { width: 150, height: 36 };
    case 'commentNode':
      return commentSize ?? { width: 300, height: 200 };
    case 'defaultNode':
      return { width: 200, height: 47 };
  }
}
