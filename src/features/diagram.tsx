// src/features/diagram/Diagram.tsx
import { useCallback, useMemo } from 'react';
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
import '@xyflow/react/dist/style.css';

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

  // ✅ useReactFlow is now inside the provider
  const rf = useReactFlow();

  const nodes: Node[] = useMemo(() => {
    const actorNodes: Node[] = actors.map((a, i) => ({
      id: a.id,
      type: 'default',
      position: nodePositions?.[a.id] ?? { x: 50, y: i * 120 },
      data: {
        label: (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem' }}>{a.icon === 'person' ? '👤' : '💻'}</div>
            <div>{a.name}</div>
          </div>
        ),
      },
      style: { background: 'transparent', border: 'none', boxShadow: 'none' },
    }));

    const useCaseNodes: Node[] = useCases.map((u, i) => ({
      id: u.id,
      type: 'default',
      position: nodePositions?.[u.id] ?? { x: 400, y: i * 100 },
      data: { label: u.name },
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

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const uid = () =>
    (crypto?.randomUUID?.() ??
      Math.random().toString(36).slice(2) + Date.now().toString(36));

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const payload = e.dataTransfer.getData('application/uml-entity');
    if (!payload) return;

    const data = JSON.parse(payload) as {
      entityType: 'ACTOR' | 'USE_CASE' | 'NOTE' | 'PACKAGE' | 'SUBJECT';
      name?: string;
    };

    // ✅ new API: screenToFlowPosition
    const pos = rf.screenToFlowPosition({ x: e.clientX, y: e.clientY });

    if (data.entityType === 'ACTOR') {
      const id = uid();
      addActor({ id, name: data.name || 'Novo Ator', icon: 'person', description: '' } as any);
      setNodePosition(id, pos);
    } else if (data.entityType === 'USE_CASE') {
      const id = uid();
      addUseCase({ id, name: data.name || 'Novo Caso de Uso', description: '' } as any);
      setNodePosition(id, pos);
    }
  }, [rf, addActor, addUseCase, setNodePosition]);

  const onNodeDragStop = useCallback((_, node: Node) => {
    setNodePosition(node.id, node.position);
  }, [setNodePosition]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onNodeDragStop={onNodeDragStop}
      fitView
      style={{ width: '100%', height: '100%' }}
    >
      <Background variant={BackgroundVariant.Dots} />
      <MiniMap nodeStrokeWidth={3} />
    </ReactFlow>
  );
}

export default function Diagram() {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      {/* ✅ Provider wraps anything that uses useReactFlow */}
      <ReactFlowProvider>
        <DiagramCanvas />
      </ReactFlowProvider>
    </div>
  );
}
