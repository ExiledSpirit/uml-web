// src/features/usecases/UseCaseScenariosTree.tsx
import { useMemo, useState } from 'react';
import { useProjectStore } from '@/store/use-project.store';

type Kind = 'alternative' | 'exception';

export default function UseCaseScenariosTree({ useCaseId }: { useCaseId: string }) {
  const uc = useProjectStore((s) => s.useCases.find((u) => u.id === useCaseId));

  // Actions
  const addPhase = useProjectStore((s) => s.addUseCasePhase);
  const editPhase = useProjectStore((s) => s.editUseCasePhase);
  const removePhase = useProjectStore((s) => s.removeUseCasePhase);

  const addAlt = useProjectStore((s) => s.addAlternativeFlow);
  const renameAlt = useProjectStore((s) => s.renameAlternativeFlow);
  const removeAlt = useProjectStore((s) => s.removeAlternativeFlow);
  const setAltReturn = useProjectStore((s) => s.setAlternativeFlowReturn);

  const addAltStep = useProjectStore((s) => s.addAlternativeFlowStep);
  const editAltStep = useProjectStore((s) => s.editAlternativeFlowStep);
  const removeAltStep = useProjectStore((s) => s.removeAlternativeFlowStep);

  const [newPhaseText, setNewPhaseText] = useState('');

  if (!uc) return null;

  const phases = uc.phases ?? [];
  const altByParent = useMemo(() => {
    const map: Record<string, NonNullable<typeof uc>['alternativeFlows']> = {};
    (uc.alternativeFlows ?? []).forEach((af) => {
      (map[af.parentPhaseId] ||= []).push(af);
    });
    return map;
  }, [uc]);

  return (
    <div className="space-y-3 text-[13px]">
      {/* Add phase row */}
      <div className="flex items-center gap-2">
        <input
          className="border px-2 py-1 rounded text-sm flex-1"
          value={newPhaseText}
          onChange={(e) => setNewPhaseText(e.target.value)}
          placeholder="Nova fase…"
        />
        <button
          className="px-2 py-1 border rounded text-xs hover:bg-gray-50"
          onClick={() => {
            const t = newPhaseText.trim();
            if (!t) return;
            addPhase(uc.id, t);
            setNewPhaseText('');
          }}
        >
          + Fase
        </button>
      </div>

      {/* Phases list — collapsible */}
      <ol className="space-y-2">
        {phases.map((p, idx) => (
          <li key={p.id} className="border rounded">
            <details>
              <summary className="flex items-center gap-2 px-2 py-2 bg-gray-50 cursor-pointer">
                <span className="text-gray-500 select-none">{idx + 1}.</span>
                <EditableInline
                  value={p.text}
                  onSave={(t) => editPhase(uc.id, idx, t)}
                  className="flex-1"
                />
                <button
                  className="text-xs text-red-600 px-2 py-1 border rounded hover:bg-red-50"
                  onClick={(e) => {
                    e.preventDefault();
                    removePhase(uc.id, idx);
                  }}
                  title="Remover fase"
                >
                  Remover
                </button>
              </summary>

              {/* Alt flows */}
              <div className="p-2 space-y-2">
                <AddAltInline
                  onCreate={(name) => {
                    const n = name.trim();
                    if (!n) return;
                    // NOTE: if your addAlternativeFlow signature is (useCaseId, name),
                    // keep as below; if you extended to include parent, swap to (uc.id, p.id, n, 'alternative')
                    addAlt(uc.id, n);
                  }}
                />
                {(altByParent[p.id] ?? []).map((af) => (
                  <AltCard
                    key={af.id}
                    ucId={uc.id}
                    phases={phases}
                    alt={af}
                    renameAlt={renameAlt}
                    removeAlt={removeAlt}
                    setAltReturn={setAltReturn}
                    addAltStep={addAltStep}
                    editAltStep={editAltStep}
                    removeAltStep={removeAltStep}
                  />
                ))}
                {(!altByParent[p.id] || altByParent[p.id]!.length === 0) && (
                  <div className="text-[12px] text-gray-500 px-1">Sem fluxos alternativos.</div>
                )}
              </div>
            </details>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ------- small pieces (super compact) ------- */

function EditableInline({
  value,
  onSave,
  className,
}: { value: string; onSave: (v: string) => void; className?: string }) {
  const [editing, setEditing] = useState(false);
  const [v, setV] = useState(value);
  return editing ? (
    <span className={`flex items-center gap-2 ${className || ''}`}>
      <input
        className="border px-2 py-1 rounded text-sm w-full"
        value={v}
        onChange={(e) => setV(e.target.value)}
        autoFocus
      />
      <button
        className="text-xs px-2 py-1 border rounded hover:bg-gray-50"
        onClick={() => {
          const t = v.trim();
          if (!t) return setEditing(false);
          onSave(t);
          setEditing(false);
        }}
      >
        OK
      </button>
      <button className="text-xs px-2 py-1 border rounded" onClick={() => { setV(value); setEditing(false); }}>
        Cancel
      </button>
    </span>
  ) : (
    <span
      className={`truncate ${className || ''}`}
      title={value}
      onClick={() => setEditing(true)}
    >
      {value || <span className="text-gray-400 italic">Sem texto</span>}
    </span>
  );
}

function AddAltInline({ onCreate }: { onCreate: (name: string) => void }) {
  const [v, setV] = useState('');
  return (
    <div className="flex items-center gap-2">
      <input
        className="border px-2 py-1 rounded text-sm flex-1"
        value={v}
        onChange={(e) => setV(e.target.value)}
        placeholder="Nome do fluxo alternativo…"
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            const t = v.trim();
            if (!t) return;
            onCreate(t);
            setV('');
          }
        }}
      />
      <button
        className="px-2 py-1 border rounded text-xs hover:bg-gray-50"
        onClick={() => {
          const t = v.trim();
          if (!t) return;
          onCreate(t);
          setV('');
        }}
      >
        + Alt
      </button>
    </div>
  );
}

function AltCard(props: {
  ucId: string;
  phases: { id: string; text: string }[];
  alt: {
    id: string;
    name: string;
    kind?: Kind;
    parentPhaseId: string;
    returnPhaseId?: string;
    flows: { id: string; text: string }[];
  };
  renameAlt: (useCaseId: string, altId: string, name: string) => void;
  removeAlt: (useCaseId: string, altId: string) => void;
  setAltReturn: (useCaseId: string, altId: string, returnPhaseId?: string) => void;
  addAltStep: (useCaseId: string, altId: string, t: string) => void;
  editAltStep: (useCaseId: string, altId: string, i: number, t: string) => void;
  removeAltStep: (useCaseId: string, altId: string, i: number) => void;
}) {
  const { ucId, phases, alt } = props;
  const [name, setName] = useState(alt.name);
  const [editing, setEditing] = useState(false);
  const [kind, setKind] = useState<Kind>(alt.kind ?? 'alternative');
  const [ret, setRet] = useState<string>(alt.returnPhaseId || '');
  const [newStep, setNewStep] = useState('');

  return (
    <div className="border rounded p-2">
      <div className="flex flex-wrap items-center gap-2">
        {editing ? (
          <>
            <input
              className="border px-2 py-1 rounded text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
            <button
              className="text-xs px-2 py-1 border rounded"
              onClick={() => {
                const t = name.trim();
                if (!t) return setEditing(false);
                props.renameAlt(ucId, alt.id, t);
                setEditing(false);
              }}
            >
              OK
            </button>
            <button className="text-xs px-2 py-1 border rounded" onClick={() => { setName(alt.name); setEditing(false); }}>
              Cancel
            </button>
          </>
        ) : (
          <>
            <strong className="truncate max-w-[14rem]" title={alt.name}>{alt.name || 'Fluxo Alternativo'}</strong>
            <button className="text-xs underline" onClick={() => setEditing(true)}>Renomear</button>
          </>
        )}

        <span className="text-gray-300 mx-1">|</span>

        <label className="text-[11px] text-gray-600">Tipo</label>
        <select
          className="border px-2 py-1 rounded text-xs"
          value={kind}
          onChange={(e) => setKind(e.target.value as Kind)}
          // TODO: persist kind (add a store action if you want to save it)
        >
          <option value="alternative">Alternative</option>
          <option value="exception">Exception</option>
        </select>

        <span className="text-gray-300 mx-1">|</span>

        <label className="text-[11px] text-gray-600">Retorna em</label>
        <select
          className="border px-2 py-1 rounded text-xs"
          value={ret}
          onChange={(e) => {
            const v = e.target.value || undefined;
            setRet(e.target.value);
            props.setAltReturn(ucId, alt.id, v);
          }}
        >
          <option value="">(termina)</option>
          {phases.map((p, i) => (
            <option key={p.id} value={p.id}>
              {i + 1}. {p.text.slice(0, 50)}
            </option>
          ))}
        </select>

        <button
          className="ml-auto text-xs px-2 py-1 border rounded text-red-600 hover:bg-red-50"
          onClick={() => props.removeAlt(ucId, alt.id)}
        >
          Remover
        </button>
      </div>

      <ol className="list-decimal ml-6 mt-2 space-y-1">
        {alt.flows.map((f, idx) => (
          <li key={f.id} className="flex items-center gap-2">
            <span className="flex-1 break-words">{f.text}</span>
            <button
              className="text-xs underline"
              onClick={() => {
                const t = prompt('Editar etapa', f.text);
                if (t != null && t.trim()) props.editAltStep(ucId, alt.id, idx, t.trim());
              }}
            >
              Editar
            </button>
            <button
              className="text-xs text-red-600 underline"
              onClick={() => props.removeAltStep(ucId, alt.id, idx)}
            >
              Remover
            </button>
          </li>
        ))}
      </ol>

      <div className="flex items-center gap-2 mt-2">
        <input
          className="border px-2 py-1 rounded text-sm flex-1"
          value={newStep}
          onChange={(e) => setNewStep(e.target.value)}
          placeholder="Nova etapa…"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const t = newStep.trim();
              if (!t) return;
              props.addAltStep(ucId, alt.id, t);
              setNewStep('');
            }
          }}
        />
        <button
          className="px-2 py-1 border rounded text-xs"
          onClick={() => {
            const t = newStep.trim();
            if (!t) return;
            props.addAltStep(ucId, alt.id, t);
            setNewStep('');
          }}
        >
          + Etapa
        </button>
      </div>
    </div>
  );
}
