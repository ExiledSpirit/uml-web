// src/features/diagram/Diagram.tsx
import { useMemo, useCallback } from 'react';
import { useProjectStore } from '@/store/use-project.store';
import {
  Background,
  BackgroundVariant,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type Node,
  type Edge,
} from '@xyflow/react';
import ActorNode from './diagram/nodes/actor-node';
import UseCaseNode from './diagram/nodes/use-case-node';
import '@xyflow/react/dist/style.css';
import '@/styles/diagram.css';

function DiagramCanvas() {
  const {
    actors,
    useCases,
    actorUseCaseLinks,
    useCaseAssociations,
    nodePositions,
    addActor,
    addUseCase,
    setNodePosition,
  } = useProjectStore();

  const rf = useReactFlow(); // gives screenToFlowPosition

  const nodeTypes = useMemo(
    () => ({
      actor: ActorNode,
      usecase: UseCaseNode,
    }),
    []
  );

  const nodes: Node[] = useMemo(() => {
    const actorNodes: Node[] = actors.map((a, i) => ({
      id: a.id,
      type: 'actor',
      position: nodePositions?.[a.id] ?? { x: 50, y: i * 120 },
      data: { name: a.name, icon: a.icon ?? 'person' },
      draggable: true,
      selectable: true,
    }));

    const useCaseNodes: Node[] = useCases.map((u, i) => ({
      id: u.id,
      type: 'usecase',
      position: nodePositions?.[u.id] ?? { x: 420, y: i * 110 },
      data: { name: u.name },
      draggable: true,
      selectable: true,
    }));

    return [...actorNodes, ...useCaseNodes];
  }, [actors, useCases, nodePositions]);

  const edges: Edge[] = useMemo(
    () => [
      ...actorUseCaseLinks.map((l) => ({
        id: l.id,
        source: l.actorId,
        target: l.useCaseId,
        style: { stroke: '#999' },
      })),
      ...useCaseAssociations.map((a) => ({
        id: a.id,
        source: a.sourceId,
        target: a.targetId,
        label: a.type,
        style: {
          stroke:
            a.type === 'include' ? 'blue' :
            a.type === 'extend' ? 'orange' :
            a.type === 'generalization' ? 'purple' :
            a.type === 'association' ? 'green' : 'black',
        },
      })),
    ],
    [actorUseCaseLinks, useCaseAssociations]
  );

  const onNodeDragStop = useCallback(
    (_: any, node: Node) => {
      setNodePosition(node.id, node.position);
    },
    [setNodePosition]
  );

  // 🔑 REQUIRED for HTML5 DnD to drop on the canvas
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  // Create ids safely without pulling extra libs
  const uid = () =>
    (crypto?.randomUUID?.() ??
      Math.random().toString(36).slice(2) + Date.now().toString(36));

  // 🔑 Re-enable Sidebar → Diagram drop
  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();

      const raw = e.dataTransfer.getData('application/uml-entity');
      if (!raw) return;

      const payload = JSON.parse(raw) as {
        entityType: 'ACTOR' | 'USE_CASE' | 'NOTE' | 'PACKAGE' | 'SUBJECT';
        name?: string;
      };

      // NEW API: convert screen coords to flow coords
      const pos = rf.screenToFlowPosition({ x: e.clientX, y: e.clientY });

      if (payload.entityType === 'ACTOR') {
        const id = uid();
        addActor({ id, name: payload.name || 'Novo Ator', icon: 'person', description: '' } as any);
        setNodePosition(id, pos);
      } else if (payload.entityType === 'USE_CASE') {
        const id = uid();
        addUseCase({ id, name: payload.name || 'Novo Caso de Uso', description: '' } as any);
        setNodePosition(id, pos);
      }
      // NOTE/PACKAGE/SUBJECT → same idea once you add them to your domain
    },
    [rf, addActor, addUseCase, setNodePosition]
  );

  return (
    <ReactFlow
      nodeTypes={nodeTypes}
      nodes={nodes}
      edges={edges}
      onNodeDragStop={onNodeDragStop}
      onDragOver={onDragOver}
      onDrop={onDrop}
      fitView
      proOptions={{ hideAttribution: true }}
      style={{ width: '100%', height: '100%' }}
    >
      <Background variant={BackgroundVariant.Dots} />
      <MiniMap nodeStrokeWidth={2} />
    </ReactFlow>
  );
}

export default function Diagram() {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlowProvider>
        <DiagramCanvas />
      </ReactFlowProvider>
    </div>
  );
}
