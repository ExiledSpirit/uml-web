// src/components/navbar/index.tsx
import { useProjectStore } from '@/store/use-project.store';
import { exportProjectToXml } from '@/services/xml/export-xml';
import { importProjectFromXml } from '@/services/xml/import-xml';

export default function NavbarComponent() {
  const state = useProjectStore();
  const loadProject = useProjectStore((s) => s.loadProject);

  const doExport = (compatOnly = false) => {
    const xml = exportProjectToXml({
      useCases: state.useCases,
      actors: state.actors,
      actorUseCaseLinks: state.actorUseCaseLinks,
      nodePositions: (state as any).nodePositions ?? {},
      compatOnly,
    });
    const blob = new Blob([xml], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `uml-project-${new Date().toISOString().slice(0, 19)}.xml`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const onImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const proj = importProjectFromXml(text);

    // adapt to your store.loadProject signature
    loadProject({
      actors: proj.actors,
      useCases: proj.useCases,
      actorUseCaseLinks: proj.actorUseCaseLinks,
      useCaseAssociations: [], // keep if you use them later
      nodePositions: proj.nodePositions,
    } as any);
  };

  return (
    <div className="w-full h-12 flex items-center justify-between px-4 bg-[#111] text-white z-[10000]">
      <div className="font-semibold select-none">UML Web</div>
      <div className="flex gap-2">
      <button onClick={() => doExport(false)}>Export XML</button>
      <button onClick={() => doExport(true)}>Export Compat (sem ext)</button>
      <input type="file" accept=".xml" onChange={onImport} className="hidden" />
      </div>
    </div>
  );
}
