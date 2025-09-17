// src/features/diagram/nodes/UseCaseNode.tsx
import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';

export default memo(function UseCaseNode({ data }: NodeProps<{ name: string }>) {
  return (
    <div
      style={{
        border: '1px solid #666',
        borderRadius: 9999,
        padding: '10px 16px',
        background: 'white',
        display: 'inline-block',
        whiteSpace: 'nowrap',
      }}
    >
      {data.name}
      <Handle type="source" position={Position.Right} className="rf-handle-invisible" />
      <Handle type="target" position={Position.Left} className="rf-handle-invisible" />
    </div>
  );
});
