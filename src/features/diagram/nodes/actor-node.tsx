// src/features/diagram/nodes/ActorNode.tsx
import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';

export default memo(function ActorNode({ data }: NodeProps<{ name: string; icon?: 'person'|'system' }>) {
  return (
    <div className="actor-node">
      <div className="actor-emoji">{data.icon === 'system' ? '💻' : '👤'}</div>
      <div className="actor-name">{data.name}</div>

      <Handle type="source" position={Position.Right} className="rf-handle-invisible" />
      <Handle type="target" position={Position.Left} className="rf-handle-invisible" />
    </div>
  );
});
