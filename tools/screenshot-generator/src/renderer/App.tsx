import React, { useCallback, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
  type Node,
  type Edge,
} from '@xyflow/react';
// CSS is loaded separately in the HTML shell
import { DefaultNode } from './nodes/DefaultNode';
import { InjectNode } from './nodes/InjectNode';
import { EndingNode } from './nodes/EndingNode';
import { BoxNode } from './nodes/BoxNode';
import { LabelNode } from './nodes/LabelNode';
import { CommentNode } from './nodes/CommentNode';
import { RectangularNode } from './nodes/RectangularNode';

const nodeTypes = {
  defaultNode: DefaultNode,
  injectNode: InjectNode,
  endingNode: EndingNode,
  boxNode: BoxNode,
  rectangularNode: RectangularNode,
  labelNode: LabelNode,
  commentNode: CommentNode,
};

declare global {
  interface Window {
    __FLOW_DATA__: {
      nodes: Node[];
      edges: Edge[];
    };
    __FLOW_READY__: boolean;
  }
}

function FlowCanvas() {
  const flowData = window.__FLOW_DATA__;
  const [nodes, , onNodesChange] = useNodesState(flowData?.nodes ?? []);
  const [edges, , onEdgesChange] = useEdgesState(flowData?.edges ?? []);
  const { fitView } = useReactFlow();

  useEffect(() => {
    // Wait a tick for layout, then fitView and signal ready
    const timer = setTimeout(() => {
      fitView({ padding: 0.15 }).then(() => {
        // Signal to Playwright that we're ready for screenshot
        window.__FLOW_READY__ = true;
      });
    }, 200);
    return () => clearTimeout(timer);
  }, [fitView]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={nodeTypes}
      fitView
      fitViewOptions={{ padding: 0.15 }}
      defaultEdgeOptions={{
        type: 'default',
        style: { stroke: '#666', strokeWidth: 2 },
        animated: false,
      }}
      proOptions={{ hideAttribution: true }}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable={false}
      panOnDrag={false}
      zoomOnScroll={false}
      zoomOnPinch={false}
      zoomOnDoubleClick={false}
      minZoom={0.1}
      maxZoom={4}
    >
      <Background
        variant={BackgroundVariant.Dots}
        gap={20}
        size={1}
        color="hsl(0, 0%, 30.2%)"
        style={{ opacity: 1 }}
      />
    </ReactFlow>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <div style={{ width: '100vw', height: '100vh', background: 'hsl(240, 6%, 14%)' }}>
        <FlowCanvas />
      </div>
    </ReactFlowProvider>
  );
}
