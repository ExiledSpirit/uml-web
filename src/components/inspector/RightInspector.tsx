// src/components/inspector/RightInspector.tsx
import { useState } from 'react';
import { useProjectStore } from '@/store/use-project.store';
import UseCaseScenariosTree from '@/features/usecases/UseCaseScenariosTree';

export default function RightInspector() {
  const {
    inspector, closeInspector,
    actors, useCases,
    renameActor, renameUseCase,
  } = useProjectStore();

  const [width, setWidth] = useState(360); // resizable

  if (!inspector) return null;

  const isActor = inspector.kind === 'actor';
  const entity = isActor
    ? actors.find((a) => a.id === inspector.id)
    : useCases.find((u) => u.id === inspector.id);

  if (!entity) return null;

  return (
    <>
      {/* resize handle */}
      <div
        className="fixed top-0 right-[calc(var(--insp-w,360px))] h-full w-[6px] cursor-ew-resize z-[9999]"
        style={{ right: `${width}px` }}
        onMouseDown={(e) => {
          e.preventDefault();
          const startX = e.clientX;
          const startW = width;
          const onMove = (ev: MouseEvent) => {
            const delta = startX - ev.clientX;
            const next = Math.min(640, Math.max(280, startW + delta));
            setWidth(next);
          };
          const onUp = () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
          };
          window.addEventListener('mousemove', onMove);
          window.addEventListener('mouseup', onUp);
        }}
      />

      <aside
        className="fixed top-0 right-0 h-full bg-white border-l shadow-xl z-[10000] flex flex-col"
        style={{ width }}
      >
        {/* Header sticky */}
        <div className="px-3 py-2 border-b bg-white sticky top-0 flex items-center gap-2">
          <strong className="text-sm">{isActor ? 'Ator' : 'Caso de Uso'}</strong>
          <span className="text-xs text-gray-500 truncate">· {entity.name || '(sem nome)'}</span>
          <button
            onClick={closeInspector}
            className="ml-auto text-xs px-2 py-1 border rounded hover:bg-gray-50"
            title="Fechar"
          >
            Fechar
          </button>
        </div>

        {/* Body scrollable */}
        <div className="flex-1 overflow-auto px-3 py-3">
          <section className="space-y-2">
            <label className="block text-[11px] text-gray-500">Nome</label>
            <NameRow
              initialValue={entity.name}
              onSave={(name) =>
                isActor ? renameActor(entity.id, name) : renameUseCase(entity.id, name)
              }
            />
          </section>

          {!isActor && (
            <div className="mt-4">
              <UseCaseScenariosTree useCaseId={entity.id} />
            </div>
          )}
        </div>

        {/* Footer sticky (optional actions) */}
        <div className="px-3 py-2 border-t bg-white sticky bottom-0 text-[11px] text-gray-500">
          Dica: clique no título do fluxo para renomear; use “Retorna em” para finalizar/retornar.
        </div>
      </aside>
    </>
  );
}

function NameRow({
  initialValue,
  onSave,
}: {
  initialValue: string;
  onSave: (v: string) => void;
}) {
  const [v, setV] = useState(initialValue);
  return (
    <div className="flex items-center gap-2">
      <input
        className="border px-2 py-1 rounded text-sm w-full"
        value={v}
        onChange={(e) => setV(e.target.value)}
        placeholder="Nome…"
      />
      <button
        className="text-xs px-2 py-1 border rounded hover:bg-gray-50"
        onClick={() => onSave(v.trim())}
      >
        Salvar
      </button>
    </div>
  );
}
