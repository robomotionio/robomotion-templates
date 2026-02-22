import React from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { LucideIcon } from './LucideIcon';

export interface BoxNodeData {
  label: string;
  color: string;
  inputs: number;
  outputs: number;
  icon: string;
  [key: string]: unknown;
}

export function BoxNode({ id, data }: NodeProps) {
  const { label, color, inputs, outputs, icon } = data as unknown as BoxNodeData;
  const inputCount = (inputs as number) ?? 1;
  const outputCount = (outputs as number) || 1;

  return (
    <div className="node-box">
      {inputCount > 0 && (
        <Handle type="target" position={Position.Left} id={`${id}-target-1`} />
      )}
      <div className="node-box-icon" style={{ color }}>
        <LucideIcon name={icon || 'package'} size={24} color={color} />
      </div>
      <div className="node-label">{label}</div>
      {outputCount > 0 && Array.from({ length: outputCount }, (_, i) => (
        <Handle
          key={i}
          type="source"
          position={i === 0 ? Position.Right : Position.Bottom}
          id={`${id}-source-${i + 1}`}
        />
      ))}
    </div>
  );
}
