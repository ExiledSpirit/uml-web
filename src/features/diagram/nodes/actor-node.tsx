import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';

export default memo(function ActorNode({ data }: NodeProps<{ name: string; icon?: 'person' | 'system' }>) {
  return (
    <div className="actor-node text-center">
      <div className="actor-emoji">
        <img src="/actor.svg" alt="Actor" className="w-10 h-10 mx-auto" />
      </div>
      <div className="actor-name">{data.name}</div>

      {/* Handles for connections */}
      <Handle
        id="out"
        type="source"
        position={Position.Right}
        className="handle-dot"
        connectable={true}
      />
      <Handle
        id="in"
        type="target"
        position={Position.Left}
        className="handle-dot"
        connectable={true}
      />
    </div>
  );
});
