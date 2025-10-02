// src/components/navbar/index.tsx
import { useRef } from 'react';
import { useProjectStore } from '@/store/use-project.store';
import { exportProjectToXml } from '@/services/xml/export-xml';
import { importXmlToProject } from '@/services/xml/import-xml';

export default function NavbarComponent() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const state = useProjectStore();
  const loadProject = useProjectStore((s) => s.loadProject);

  const handleExport = () => {
    const xml = exportProjectToXml({
      actors: state.actors,
      useCases: state.useCases,
      actorUseCaseLinks: state.actorUseCaseLinks,
      useCaseAssociations: state.useCaseAssociations,
      nodePositions: (state as any).nodePositions ?? {},
    });

    const blob = new Blob([xml], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `uml-project-${new Date().toISOString().slice(0, 19)}.xml`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleOpen = () => inputRef.current?.click();

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const project = importXmlToProject(text); // -> ProjectData
    loadProject(project);
  };

  return (
    <div className="w-full h-12 flex items-center justify-between px-4 bg-[#111] text-white z-[10000]">
      <div className="font-semibold select-none">UML Web</div>
      <div className="flex gap-2">
        <button onClick={handleOpen} className="px-3 py-1 rounded bg-[#2b2b2b] hover:bg-[#3a3a3a]">
          Import XML…
        </button>
        <button onClick={handleExport} className="px-3 py-1 rounded bg-[#4a7] hover:bg-[#59a]">
          Export XML
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".xml,text/xml,application/xml"
          className="hidden"
          onChange={handleImport}
        />
      </div>
    </div>
  );
}
