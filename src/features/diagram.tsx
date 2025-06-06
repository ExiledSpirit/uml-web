import { useMemo } from "react";
import { useProjectStore } from "@/store/use-project.store";
import { Background, BackgroundVariant, type Edge, MiniMap, type Node, ReactFlow,  } from "@xyflow/react";
import "reactflow/dist/style.css";

export function Diagram() {
  const actors = useProjectStore((s) => s.actors);
  const useCases = useProjectStore((s) => s.useCases);
  const actorUseCaseLinks = useProjectStore((s) => s.actorUseCaseLinks);
  const useCaseAssociations = useProjectStore((s) => s.useCaseAssociations);

  const nodes: Node[] = useMemo(() => [
    ...actors.map((a, i) => ({
      id: a.id,
      data: {
        label: (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem' }}>{a.icon === 'person' ? '👤' : '💻'}</div>
            <div>{a.name}</div>
          </div>
        )
      },
      position: { x: 50, y: i * 120 },
      style: { background: 'transparent', border: 'none', boxShadow: 'none' },
    })),
    ...useCases.map((u, i) => ({
      id: u.id,
      data: { label: u.name },
      position: { x: 400, y: i * 100 },
      type: 'default'
    })),
  ], [actors, useCases]);

  const edges: Edge[] = useMemo(() => {
    return [
      ...actorUseCaseLinks.map((link) => ({
        id: link.id,
        source: link.actorId,
        target: link.useCaseId,
        style: { stroke: "#555" },
      })),
      ...useCaseAssociations.map((assoc) => ({
        id: assoc.id,
        source: assoc.sourceId,
        target: assoc.targetId,
        label: assoc.type,
        style: {
          stroke:
            assoc.type === "include"
              ? "blue"
              : assoc.type === "extend"
              ? "orange"
              : "black",
        },
      })),
    ];
  }, [actorUseCaseLinks, useCaseAssociations]);

  return (
    <div className="text-foreground" style={{ width: "100%", height: "100%" }}>
      <ReactFlow nodes={nodes} edges={edges} fitView>
        <Background variant={BackgroundVariant.Dots} />
        <MiniMap nodeStrokeWidth={2} />
      </ReactFlow>
    </div>
  );
}