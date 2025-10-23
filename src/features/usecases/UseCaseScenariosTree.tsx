// src/features/usecases/UseCaseScenariosTree.tsx
import { useEffect, useMemo, useState } from 'react';
import { useProjectStore } from '@/store/use-project.store';
import clsx from "clsx";

type Kind = 'alternative' | 'exception';

export default function UseCaseScenariosTree({ useCaseId }: { useCaseId: string }) {
  const uc = useProjectStore((s) => s.useCases.find((u) => u.id === useCaseId));

  // Actions
  const addPhrase = useProjectStore((s) => s.addUseCasePhrase);
  const editPhrase = useProjectStore((s) => s.editUseCasePhrase);
  const removePhrase = useProjectStore((s) => s.removeUseCasePhrase);

  const addAlt = useProjectStore((s) => s.addAlternativeFlow);
  const renameAlt = useProjectStore((s) => s.renameAlternativeFlow);
  const removeAlt = useProjectStore((s) => s.removeAlternativeFlow);
  const setAltReturn = useProjectStore((s) => s.setAlternativeFlowReturn);

  const addAltPhrase = useProjectStore((s) => s.addAlternativeFlowPhrase);
  const editAltPhrase = useProjectStore((s) => s.editAlternativeFlowPhrase);
  const removeAltPhrase = useProjectStore((s) => s.removeAlternativeFlowPhrase);
  const setAlternativeFlowKind = useProjectStore((s) => s.setAlternativeFlowKind);

  const [newPhraseText, setNewPhraseText] = useState('');

  if (!uc) return null;

  const phrases = uc.phrases ?? [];
  const altByParent = useMemo(() => {
    const map: Record<string, NonNullable<typeof uc>['alternativeFlows']> = {};
    (uc.alternativeFlows ?? []).forEach((af) => {
      (map[af.parentPhraseId] ||= []).push(af);
    });
    return map;
  }, [uc]);

  return (
    <div className="space-y-3 text-[13px]">
      {/* Add phrase row */}
      <div className="flex items-center gap-2">
        <input
          className="border px-2 py-1 rounded text-sm flex-1"
          value={newPhraseText}
          onChange={(e) => setNewPhraseText(e.target.value)}
          placeholder="Nova frase…"
        />
        <button
          className="px-2 py-1 border rounded text-xs hover:bg-gray-50"
          onClick={() => {
            const t = newPhraseText.trim();
            if (!t) return;
            addPhrase(uc.id, t);
            setNewPhraseText('');
          }}
        >
          + Frase
        </button>
      </div>

      {/* Phrases list — collapsible */}
      <ol className="space-y-2">
        {phrases.map((p, idx) => (
          <li key={p.id} className="border rounded overflow-hidden">
            <details>
              <summary className="flex items-center gap-2 px-2 py-2 bg-gray-50 cursor-pointer">
                <span className="text-gray-500 select-none">{idx + 1}.</span>
                <EditableInline
                  value={p.text}
                  onSave={(t) => editPhrase(uc.id, p.id, t)}
                  className="flex-1"
                />
                <button
                  className="text-xs text-red-600 px-2 py-1 border rounded hover:bg-red-50"
                  onClick={(e) => {
                    e.preventDefault();
                    removePhrase(uc.id, p.id);
                  }}
                  title="Remover frase"
                >
                  Remover
                </button>
              </summary>

                
              {/* Alt flows */}
              <div className="p-2 space-y-2">
              <span className='text-lg bold text-gray-600 mt-1'>Fluxos Alternativos:</span>
                <AddAltInline
                  onCreate={(name) => {
                    const n = name.trim();
                    if (!n) return;
                    // NOTE: if your addAlternativeFlow signature is (useCaseId, name),
                    // keep as below; if you extended to include parent, swap to (uc.id, p.id, n, 'alternative')
                    addAlt(uc.id, n, "alternative", p.id, undefined);
                  }}
                />
                {(altByParent[p.id] ?? []).map((af) => (
                  <AltCard
                    key={af.id}
                    ucId={uc.id}
                    phrases={phrases}
                    alt={af}
                    renameAlt={renameAlt}
                    removeAlt={removeAlt}
                    setAltReturn={setAltReturn}
                    addAltPhrase={addAltPhrase}
                    editAltPhrase={editAltPhrase}
                    removeAltPhrase={removeAltPhrase}
                    setAlternativeFlowKind={setAlternativeFlowKind}
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
  return (
    <div className={`flex truncate items-center gap-2 ${className || ''}`}>
      {(!editing ? <span
        className={`truncate max-w-min w-min ${className || ''}`}
        title={value}
        onClick={(e) => {setEditing(true); e.preventDefault()}}
      >
        {value || <span className="text-gray-400 italic">Sem texto</span>}
      </span> : <input
          className="border px-2 py-1 rounded text-sm"
          value={v}
          onChange={(e) => setV(e.target.value)}
          autoFocus
        />)
      }
      <button
        className={clsx("text-xs px-2 py-1 border rounded hover:bg-gray-50", editing ? "visible" : "invisible")}
        onClick={() => {
          const t = v.trim();
          if (!t) return setEditing(false);
          onSave(t);
          setEditing(false);
        }}
      >
        OK
      </button>
      <button className={clsx("text-xs px-2 py-1 border rounded", editing ? "visible" : "invisible")} onClick={() => { setV(value); setEditing(false); }}>
        Cancel
      </button>
    </div>
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
  phrases: { id: string; text: string }[];
  alt: {
    id: string;
    name: string;
    kind?: Kind;
    parentPhraseId: string;
    returnPhraseId?: string;
    flows: { id: string; text: string }[];
  };
  renameAlt: (useCaseId: string, altId: string, name: string) => void;
  removeAlt: (useCaseId: string, altId: string) => void;
  setAltReturn: (useCaseId: string, altId: string, returnPhraseId?: string) => void;
  setAlternativeFlowKind: (useCaseId: string, altId: string, kind: "alternative" | "exception") => void;
  addAltPhrase: (useCaseId: string, altId: string, t: string) => void;
  editAltPhrase: (useCaseId: string, altId: string, phraseId: string, t: string) => void;
  removeAltPhrase: (useCaseId: string, altId: string, phraseId: string) => void;
}) {
  const { ucId, phrases, alt } = props;
  const [name, setName] = useState(alt.name);
  const [editing, setEditing] = useState(false);
  const [kind, setKind] = useState<Kind>(alt.kind ?? 'alternative');
  const [ret, setRet] = useState<string>(alt.returnPhraseId || '');
  const [newPhrase, setNewPhrase] = useState('');

  // Apply name changes
  useEffect(() => {
    props.renameAlt(ucId, alt.id, name);
  }, [name]);

  // Apply kind changes
  useEffect(() => {
    props.setAlternativeFlowKind(ucId, alt.id, kind);
  }, [kind]);

  // Apply returnToPhraseId changes
  useEffect(() => {
    props.setAltReturn(ucId, alt.id, ret);
  }, [ret]);

  return (
    <div className="border rounded p-2">
      <div className="flex items-center gap-2 flex-row border-b-2 border-b-gray-300">
        <div className='flex flex-wrap flex-col'>
          <EditableInline onSave={(e: string) => setName(e)} value={name} />

          <div className='flex flex-row flex-wrap items-center gap-2'>
            <label className="text-[11px] text-gray-600">Tipo</label>
            <select
              className="border px-2 py-1 rounded text-xs"
              value={kind}
              onChange={(e) => {
                setKind(e.target.value as Kind);
              }}
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
                setRet(e.target.value);
              }}
            >
              <option value="">(termina)</option>
              {phrases.map((p, i) => (
                <option key={p.id} value={p.id}>
                  {i + 1}. {p.text.slice(0, 50)}
                </option>
              ))}
            </select>
          </div>
        </div>
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
            {idx + 1}.
            <EditableInline className='w-full' onSave={(value: string) => props.editAltPhrase(ucId, alt.id, f.id, value)} value={f.text} />
            <button
              className="text-xs text-red-600 underline"
              onClick={() => props.removeAltPhrase(ucId, alt.id, f.id)}
            >
              Remover
            </button>
          </li>
        ))}
      </ol>

      <div className="flex items-center gap-2 mt-2">
        <input
          className="border px-2 py-1 rounded text-sm flex-1"
          value={newPhrase}
          onChange={(e) => setNewPhrase(e.target.value)}
          placeholder="Nova etapa…"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const t = newPhrase.trim();
              if (!t) return;
              props.addAltPhrase(ucId, alt.id, t);
              setNewPhrase('');
            }
          }}
        />
        <button
          className="px-2 py-1 border rounded text-xs"
          onClick={() => {
            const t = newPhrase.trim();
            if (!t) return;
            props.addAltPhrase(ucId, alt.id, t);
            setNewPhrase('');
          }}
        >
          + Etapa
        </button>
      </div>
    </div>
  );
}
