import { create } from 'zustand';
import type { IActor, IUseCase } from '@/types/uml';
import type { ProjectData } from '@/services/project.repository';
import { localStorageProjectAdapter } from '@/services/local-storage-project.adapter';

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
      nodePositions: (data as any).nodePositions || {},
    });
  },
}));
