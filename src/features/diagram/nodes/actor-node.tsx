// src/features/diagram/nodes/ActorNode.tsx
import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';

export default memo(function ActorNode({ data }: NodeProps<{ name: string; icon?: 'person'|'system' }>) {
  return (
    <div style={{ textAlign: 'center', background: 'transparent' }}>
      <div style={{ fontSize: '2rem', lineHeight: 1 }}>{data.icon === 'system' ? '💻' : '👤'}</div>
      <div style={{ marginTop: 4 }}>{data.name}</div>

      {/* invisible handles for linking */}
      <Handle type="source" position={Position.Right} className="rf-handle-invisible" />
      <Handle type="target" position={Position.Left} className="rf-handle-invisible" />
    </div>
  );
});
