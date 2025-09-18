// src/features/diagram/nodes/UseCaseNode.tsx
import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';

export default memo(function UseCaseNode({ data }: NodeProps<{ name: string }>) {
  return (
    <div className="uc-node">
      <div className="uc-ellipse">
        {data.name}
      </div>

      {/* invisible handles so you can still connect */}
      <Handle type="source" position={Position.Right} className="rf-handle-invisible" />
      <Handle type="target" position={Position.Left} className="rf-handle-invisible" />
    </div>
  );
});
