import React from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { LucideIcon } from './LucideIcon';

export interface EndingNodeData {
  label: string;
  color: string;
  icon: string;
  [key: string]: unknown;
}

export function EndingNode({ id, data }: NodeProps) {
  const { label, color, icon } = data as unknown as EndingNodeData;

  return (
    <div className="node-ending">
      <Handle type="target" position={Position.Left} id={`${id}-target-1`} />
      <div className="node-label">{label}</div>
      <div className="node-icon-panel" style={{ backgroundColor: color + 'D9' }}>
        <LucideIcon name={icon || 'circle-stop'} size={14} color="white" />
      </div>
    </div>
  );
}
