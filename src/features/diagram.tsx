// src/features/diagram/Diagram.tsx
import { useEffect, useMemo, useCallback } from 'react';
import { useProjectStore } from '@/store/use-project.store';
import {
  Background,
  BackgroundVariant,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  useNodesState,
  useEdgesState,
  applyNodeChanges,
  ConnectionMode,
  ConnectionLineType,
  MarkerType,
  type Node,
  type Edge,
  type Connection,
  type NodeChange,
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
    addActorUseCaseLink,
    setNodePosition,
  } = useProjectStore();

  const rf = useReactFlow();
  const openInspector = useProjectStore(s => s.openInspector);

  // 1) Local, live node/edge state for smooth dragging
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // 2) Register custom node types
  const nodeTypes = useMemo(
    () => ({ actor: ActorNode, usecase: UseCaseNode }),
    []
  );

  // 3) Build nodes & edges from store once (or when store content changes)
  useEffect(() => {
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
    setNodes([...actorNodes, ...useCaseNodes]);
  }, [actors, useCases, nodePositions, setNodes]);

  useEffect(() => {
    const actorEdges: Edge[] = actorUseCaseLinks.map((l) => ({
      id: l.id,
      source: l.actorId,
      target: l.useCaseId,
      type: 'straight',
      markerEnd: { type: MarkerType.ArrowClosed, width: 14, height: 14 },
      style: { stroke: '#333' },
    }));
    const assocEdges: Edge[] = useCaseAssociations.map((a) => ({
      id: a.id,
      source: a.sourceId,
      target: a.targetId,
      label: a.type,
      type: 'straight',
      markerEnd: { type: MarkerType.ArrowClosed, width: 14, height: 14 },
      style: {
        stroke:
          a.type === 'include' ? 'blue' :
          a.type === 'extend' ? 'orange' :
          a.type === 'generalization' ? 'purple' :
          a.type === 'association' ? 'green' : 'black',
      },
    }));
    setEdges([...actorEdges, ...assocEdges]);
  }, [actorUseCaseLinks, useCaseAssociations, setEdges]);

  // 4) Allow XYFlow to update positions live
  const handleNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
  }, [setNodes]);

  // 5) Persist position to store when drag ends
  const onNodeDragStop = useCallback((_: any, node: Node) => {
    setNodePosition(node.id, node.position);
  }, [setNodePosition]);

  // 6) HTML5 DnD from Sidebar → canvas
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const uid = () =>
    (crypto?.randomUUID?.() ??
      Math.random().toString(36).slice(2) + Date.now().toString(36));

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const raw = e.dataTransfer.getData('application/uml-entity');
    if (!raw) return;

    const payload = JSON.parse(raw) as {
      entityType: 'ACTOR' | 'USE_CASE' | 'NOTE' | 'PACKAGE' | 'SUBJECT';
      name?: string;
    };

    const pos = rf.screenToFlowPosition({ x: e.clientX, y: e.clientY });

    if (payload.entityType === 'ACTOR') {
      const id = uid();
      addActor({ id, name: payload.name || 'Novo Ator', icon: 'person', description: '' } as any);
      setNodePosition(id, pos);
      // also inject to local nodes immediately for instant feedback
      setNodes((nds) => [...nds, { id, type: 'actor', position: pos, data: { name: payload.name || 'Novo Ator', icon: 'person' } }]);
    } else if (payload.entityType === 'USE_CASE') {
      const id = uid();
      addUseCase({ id, name: payload.name || 'Novo Caso de Uso', description: '' } as any);
      setNodePosition(id, pos);
      setNodes((nds) => [...nds, { id, type: 'usecase', position: pos, data: { name: payload.name || 'Novo Caso de Uso' } }]);
    }
  }, [rf, addActor, addUseCase, setNodePosition, setNodes]);

  // 7) Only allow Actor → UseCase connections, and add to store
  const isValidConnection = useCallback((c: Connection) => {
    if (!c.source || !c.target) return false;
    const src = rf.getNode(c.source);
    const tgt = rf.getNode(c.target);
    return src?.type === 'actor' && tgt?.type === 'usecase';
  }, [rf]);

  const onConnect = useCallback((c: Connection) => {
    if (!c.source || !c.target) return;
    const src = rf.getNode(c.source);
    const tgt = rf.getNode(c.target);
    if (src?.type === 'actor' && tgt?.type === 'usecase') {
      addActorUseCaseLink({ id: uid(), actorId: c.source, useCaseId: c.target });
    }
  }, [rf, addActorUseCaseLink]);

  // 8) straight edges + arrowhead + strict handles
  const defaultEdgeOptions: Partial<Edge> = {
    type: 'straight',
    markerEnd: { type: MarkerType.ArrowClosed, width: 14, height: 14 },
    style: { stroke: '#333' },
  };

  return (
    <ReactFlow
      nodeTypes={nodeTypes}
      nodes={nodes}
      edges={edges}
      defaultEdgeOptions={defaultEdgeOptions}
      connectionLineType={ConnectionLineType.Straight}
      connectionMode={ConnectionMode.Strict}
      isValidConnection={isValidConnection}
      onConnect={onConnect}
      onNodesChange={handleNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeDragStop={onNodeDragStop}
      onDragOver={onDragOver}
      onDrop={onDrop}
      fitView
      onNodeClick={(_, node) => {
        if (node.type === 'actor') openInspector({ kind: 'actor', id: node.id });
        else if (node.type === 'usecase') openInspector({ kind: 'usecase', id: node.id });
      }}
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
