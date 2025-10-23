// src/components/inspector/RightInspector.tsx
import { useEffect, useState } from 'react';
import { useProjectStore } from '@/store/use-project.store';
import UseCaseScenariosTree from '@/features/usecases/UseCaseScenariosTree';

export default function RightInspector() {
  const {
    inspector, closeInspector,
    actors, useCases,
    renameActor, renameUseCase,
  } = useProjectStore();

  if (!inspector) return null;

  const isActor = inspector.kind === 'actor';
  const entity = isActor
    ? actors.find((a) => a.id === inspector.id)
    : useCases.find((u) => u.id === inspector.id);

  if (!entity) return null;

  return (
    <aside
      className="h-[85%] rounded-2xl bg-white shadow-2xl z-[10000] flex flex-col overflow-hidden"
    >
      <div className="px-3 py-2 border-b-1 border-gray-300 flex items-center gap-2">
        <strong className="text-sm">{isActor ? 'Ator' : 'Caso de Uso'}</strong>
        <span className="text-xs text-gray-500 truncate">· {entity.name || '(sem nome)'}</span>
        <button
          onClick={closeInspector}
          className="ml-auto text-xs px-2 py-1 border rounded hover:bg-gray-50 text-red-400 font-bold"
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
      <div className="px-3 py-2 border-t-1 border-gray-300 text-[11px] text-gray-500">
        Dica: clique no título do fluxo para renomear; use “Retorna em” para finalizar/retornar.
      </div>
    </aside>
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
  useEffect(() => {
    if (initialValue) {
      setV(initialValue);
    }
  }, [initialValue]);
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
