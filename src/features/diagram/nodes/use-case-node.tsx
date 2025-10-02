import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';

export default memo(function UseCaseNode({ data }: NodeProps<{ name: string }>) {
  return (
    <div className="uc-node">
      <div className="uc-ellipse">{data.name}</div>

      {/* Target handle to END connection */}
      <Handle
        id="in"
        type="target"
        position={Position.Left}
        className="handle-dot"
        connectable={true}
      />
      {/* Source handle (optional now) */}
      <Handle
        id="out"
        type="source"
        position={Position.Right}
        className="handle-dot"
        connectable={true}
      />
    </div>
  );
});
