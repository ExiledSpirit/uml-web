import { create } from 'zustand';
import type { IActor, IUseCase } from '@/types/uml';
import type { ProjectData } from '@/services/project.repository';
import { localStorageProjectAdapter } from '@/services/local-storage-project.adapter';
import {
  addPhrase,
  addAltFlow,
  setAltReturn,
  addAltFlowStep,
} from "@/utils/usecase-helpers";

export interface ActorUseCaseLink {
  id: string;
  actorId: string;
  useCaseId: string;
}

export interface UseCaseAssociation {
  id: string;
  sourceId: string;
  targetId: string;
  type: 'include' | 'extend' | 'generalization' | 'association' | 'default';
}

export interface NodePosition { x: number; y: number; }

export type InspectorTarget =
  | { kind: 'actor'; id: string }
  | { kind: 'usecase'; id: string }
  | null;

interface ProjectState {
  actors: IActor[];
  useCases: IUseCase[];
  actorUseCaseLinks: ActorUseCaseLink[];
  useCaseAssociations: UseCaseAssociation[];
  selectedEntityId: string | null;
  nodePositions: Record<string, NodePosition>;
  addActor: (actor: IActor) => void;
  addUseCase: (useCase: IUseCase) => void;
  removeActor: (id: string) => void;
  removeUseCase: (id: string) => void;
  addActorUseCaseLink: (link: ActorUseCaseLink) => void;
  addUseCaseAssociation: (association: UseCaseAssociation) => void;
  focusElement: (id: string) => void;
  loadProject: (data: ProjectData) => void;
  setNodePosition: (id: string, pos: NodePosition) => void;
  inspector: InspectorTarget;
  openInspector: (t: Exclude<InspectorTarget, null>) => void;
  closeInspector: () => void;

  // renomear
  renameActor: (id: string, name: string) => void;
  renameUseCase: (id: string, name: string) => void;

  // === Cenários (se ainda não tiver) ===
  addUseCasePhrase: (useCaseId: string, text: string) => void;
  editUseCasePhrase: (useCaseId: string, index: number, text: string) => void;
  removeUseCasePhrase: (useCaseId: string, index: number) => void;

  addAlternativeFlow: (useCaseId: string, name: string, kind: "alternative" | "exception", parentPhraseId: string, returnPhraseId?: string) => void;
  renameAlternativeFlow: (useCaseId: string, altId: string, name: string) => void;
  removeAlternativeFlow: (useCaseId: string, altId: string) => void;

  addAlternativeFlowStep: (useCaseId: string, altId: string, text: string) => void;
  editAlternativeFlowStep: (useCaseId: string, altId: string, index: number, text: string) => void;
  removeAlternativeFlowStep: (useCaseId: string, altId: string, index: number) => void;// src/store/use-project.store.ts (inside ProjectState)
  setAlternativeFlowReturn: (useCaseId: string, altId: string, returnPhraseId?: string) => void;
  setAlternativeFlowKind: (useCaseId: string, altId: string, kind: "alternative" | "exception") => void;
}

const initialData = localStorageProjectAdapter.load();

export const useProjectStore = create<ProjectState>((set, get) => ({
  actors: initialData?.actors || [],
  useCases: initialData?.useCases || [],
  actorUseCaseLinks: initialData?.actorUseCaseLinks || [],
  useCaseAssociations: initialData?.useCaseAssociations || [],
  selectedEntityId: null,
  nodePositions: initialData?.nodePositions || {},

  addActor: (actor) => {
    const newActors = [...get().actors, actor];
    localStorageProjectAdapter.save({
      ...get(),
      actors: newActors
    });
    set({ actors: newActors });
  },

  addUseCase: (useCase) => {
    const newUseCases = [...get().useCases, useCase];
    localStorageProjectAdapter.save({
      ...get(),
      useCases: newUseCases
    });
    set({ useCases: newUseCases });
  },

  removeActor: (id) => {
    const newActors = get().actors.filter((a) => a.id !== id);
    const newLinks = get().actorUseCaseLinks.filter((l) => l.actorId !== id);
    localStorageProjectAdapter.save({
      ...get(),
      actors: newActors,
      actorUseCaseLinks: newLinks
    });
    set({ actors: newActors, actorUseCaseLinks: newLinks });
  },

  removeUseCase: (id) => {
    const newUseCases = get().useCases.filter((u) => u.id !== id);
    const newLinks = get().actorUseCaseLinks.filter((l) => l.useCaseId !== id);
    const newAssociations = get().useCaseAssociations.filter((a) => a.sourceId !== id && a.targetId !== id);
    localStorageProjectAdapter.save({
      ...get(),
      useCases: newUseCases,
      actorUseCaseLinks: newLinks,
      useCaseAssociations: newAssociations
    });
    set({ useCases: newUseCases, actorUseCaseLinks: newLinks, useCaseAssociations: newAssociations });
  },

  addActorUseCaseLink: (link) => {
    const newLinks = [...get().actorUseCaseLinks, link];
    localStorageProjectAdapter.save({
      ...get(),
      actorUseCaseLinks: newLinks
    });
    set({ actorUseCaseLinks: newLinks });
  },

  addUseCaseAssociation: (association) => {
    const newAssociations = [...get().useCaseAssociations, association];
    localStorageProjectAdapter.save({
      ...get(),
      useCaseAssociations: newAssociations
    });
    set({ useCaseAssociations: newAssociations });
  },

  setNodePosition: (id, pos) => {
    const next = { ...get().nodePositions, [id]: pos };
    localStorageProjectAdapter.save({ ...get(), nodePositions: next } as any);
    set({ nodePositions: next });
  },

  focusElement: (id) => set({ selectedEntityId: id }),

  loadProject: (data) => {
    localStorageProjectAdapter.save(data);
    set({
      actors: data.actors,
      useCases: data.useCases,
      actorUseCaseLinks: data.actorUseCaseLinks || [],
      useCaseAssociations: data.useCaseAssociations || [],
      selectedEntityId: null,
      ...( (data as any).nodePositions ? { nodePositions: (data as any).nodePositions } : {} ),
    });
  },inspector: null,

  openInspector: (t) => set({ inspector: t }),
  closeInspector: () => set({ inspector: null }),

  renameActor: (id, name) => {
    const useCases = get().useCases;
    const actors = get().actors.map(a => a.id === id ? { ...a, name } : a);
    localStorageProjectAdapter.save({ ...get(), actors, useCases });
    set({ actors });
  },

  renameUseCase: (id, name) => {
    const actors = get().actors;
    const useCases = get().useCases.map(u => u.id === id ? { ...u, name } : u);
    localStorageProjectAdapter.save({ ...get(), actors, useCases });
    set({ useCases });
  },

  // ===== CENÁRIOS (copie somente se não tiver) =====
  addUseCasePhrase: (useCaseId, text) => set((s) => {
    const useCases = addPhrase(s.useCases, useCaseId, text);
    localStorageProjectAdapter.save({ ...get(), useCases });
    return { useCases };
  }),

  editUseCasePhrase: (useCaseId, index, text) => set((s) => {
    const useCases = s.useCases.map((u) => {
      if (u.id !== useCaseId) return u;
      const phrases = [...(u.phrases ?? [])];
      phrases[index] = text;
      return { ...u, phrases };
    });
    localStorageProjectAdapter.save({ ...get(), useCases });
    return { useCases };
  }),

  removeUseCasePhrase: (useCaseId, index) => set((s) => {
    const useCases = s.useCases.map((u) => {
      if (u.id !== useCaseId) return u;
      const phrases = [...(u.phrases ?? [])];
      phrases.splice(index, 1);
      return { ...u, phrases };
    });
    localStorageProjectAdapter.save({ ...get(), useCases });
    return { useCases };
  }),

  addAlternativeFlow: (useCaseId: string, name: string, kind: "alternative" | "exception", parentPhraseId: string, returnPhraseId?: string) => set((s) => {
    const useCases = s.useCases.map((u) =>
      u.id !== useCaseId
        ? u
        : {
            ...u,
            alternativeFlows: [
              ...(u.alternativeFlows ?? []),
              { id: crypto.randomUUID?.() ?? `af-${Date.now()}`, useCaseId, parentPhraseId, returnPhraseId, kind, name, flows: [] },
            ],
          }
    );
    localStorageProjectAdapter.save({ ...get(), useCases });
    return { useCases };
  }),

  renameAlternativeFlow: (useCaseId, altId, name) => set((s) => {
    const useCases = s.useCases.map((u) => {
      if (u.id !== useCaseId) return u;
      const alternativeFlows = (u.alternativeFlows ?? []).map((af) =>
        af.id === altId ? { ...af, name } : af
      );
      return { ...u, alternativeFlows };
    });
    localStorageProjectAdapter.save({ ...get(), useCases });
    return { useCases };
  }),

  removeAlternativeFlow: (useCaseId, altId) => set((s) => {
    const useCases = s.useCases.map((u) => {
      if (u.id !== useCaseId) return u;
      const alternativeFlows = (u.alternativeFlows ?? []).filter((af) => af.id !== altId);
      return { ...u, alternativeFlows };
    });
    localStorageProjectAdapter.save({ ...get(), useCases });
    return { useCases };
  }),

  addAlternativeFlowStep: (useCaseId, altId, text) => set((s) => {
    const useCases = s.useCases.map((u) => {
      if (u.id !== useCaseId) return u;
      const alternativeFlows = (u.alternativeFlows ?? []).map((af) =>
        af.id === altId ? { ...af, flows: [...af.flows, text] } : af
      );
      return { ...u, alternativeFlows };
    });
    localStorageProjectAdapter.save({ ...get(), useCases });
    return { useCases };
  }),

  editAlternativeFlowStep: (useCaseId, altId, index, text) => set((s) => {
    const useCases = s.useCases.map((u) => {
      if (u.id !== useCaseId) return u;
      const alternativeFlows = (u.alternativeFlows ?? []).map((af) => {
        if (af.id !== altId) return af;
        const flows = [...af.flows];
        flows[index] = text;
        return { ...af, flows };
      });
      return { ...u, alternativeFlows };
    });
    localStorageProjectAdapter.save({ ...get(), useCases });
    return { useCases };
  }),

  removeAlternativeFlowStep: (useCaseId, altId, index) => set((s) => {
    const useCases = s.useCases.map((u) => {
      if (u.id !== useCaseId) return u;
      const alternativeFlows = (u.alternativeFlows ?? []).map((af) => {
        if (af.id !== altId) return af;
        const flows = [...af.flows];
        flows.splice(index, 1);
        return { ...af, flows };
      });
      return { ...u, alternativeFlows };
    });
    localStorageProjectAdapter.save({ ...get(), useCases });
    return { useCases };
  }),
  setAlternativeFlowReturn: (useCaseId, altId, returnPhraseId) =>
    set((s) => {
      const useCases = s.useCases.map((u) => {
        if (u.id !== useCaseId) return u;
        const alternativeFlows = (u.alternativeFlows ?? []).map((af) =>
          af.id === altId ? { ...af, returnPhraseId } : af
        );
        return { ...u, alternativeFlows };
      });
      localStorageProjectAdapter.save({ ...get(), useCases });
      return { useCases };
    }),
  setAlternativeFlowKind: (useCaseId: string, altId: string, kind: "alternative" | "exception") =>
    set((s) => {
      const useCases = s.useCases.map((u) => {
        if (u.id !== useCaseId) return u;
        const alternativeFlows = (u.alternativeFlows ?? []).map((af) =>
          af.id === altId ? { ...af, kind } : af
        );
        return { ...u, alternativeFlows };
      });
      localStorageProjectAdapter.save({ ...get(), useCases });
      return { useCases };
    }),
  }),
);
