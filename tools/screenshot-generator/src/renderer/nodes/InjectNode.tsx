import React from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { LucideIcon } from './LucideIcon';

export interface InjectNodeData {
  label: string;
  color: string;
  outputs: number;
  icon: string;
  [key: string]: unknown;
}

export function InjectNode({ id, data }: NodeProps) {
  const { label, color, outputs, icon } = data as unknown as InjectNodeData;
  const outputCount = (outputs as number) || 1;

  return (
    <div className="node-inject">
      <div className="node-icon-panel" style={{ backgroundColor: color + 'D9' }}>
        <LucideIcon name={icon || 'play'} size={14} color="white" />
      </div>
      <div className="node-label">{label}</div>
      {Array.from({ length: outputCount }, (_, i) => (
        <Handle
          key={i}
          type="source"
          position={Position.Right}
          id={`${id}-source-${i + 1}`}
          style={{ top: outputCount === 1 ? '50%' : `${((i + 1) / (outputCount + 1)) * 100}%` }}
        />
      ))}
    </div>
  );
}
