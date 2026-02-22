import React from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { LucideIcon } from './LucideIcon';

export interface DefaultNodeData {
  label: string;
  subtitle: string;
  color: string;
  inputs: number;
  outputs: number;
  icon: string;
  [key: string]: unknown;
}

export function DefaultNode({ id, data }: NodeProps) {
  const { label, subtitle, color, inputs, outputs, icon } = data as unknown as DefaultNodeData;
  const inputCount = (inputs as number) ?? 1;
  const outputCount = (outputs as number) || 1;

  return (
    <div className="node-default" style={{ borderColor: color }}>
      {inputCount > 0 && (
        <Handle type="target" position={Position.Left} id={`${id}-target-1`} />
      )}
      <div className="node-icon-panel" style={{ backgroundColor: color + 'D9' }}>
        <LucideIcon name={icon || 'package'} size={16} color="white" />
      </div>
      <div className="node-content">
        <div className="node-subtitle">{subtitle}</div>
        <div className="node-label">{label}</div>
      </div>
      {outputCount > 0 && Array.from({ length: outputCount }, (_, i) => (
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
