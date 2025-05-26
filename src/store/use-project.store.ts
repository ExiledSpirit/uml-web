import { create } from "zustand";
import type { IActor, IActorUseCaseLink, IUseCase, IUseCaseAssociation } from "../types/uml";
import { nanoid } from "nanoid";

interface IProjectState {
  actors: IActor[];
  useCases: IUseCase[];
  useCaseAssociations: IUseCaseAssociation[];
  actorUseCaseLinks: IActorUseCaseLink[];
  addActor: (actor: Omit<IActor, 'id'>) => void;
  addUseCase: (useCase: Omit<IUseCase, 'id'>) => void;
  addUseCaseAssociation: (association: Omit<IUseCaseAssociation, 'id'>) => void;
  addActorUseCaseLink: (link: Omit<IActorUseCaseLink, 'id'>) => void;
}

export const useProjectStore = create<IProjectState>((set) => ({
  actors: [],
  useCases: [],
  useCaseAssociations: [],
  actorUseCaseLinks: [],
  addActor: (actor) => set((state) => ({
    actors: [...state.actors, { ...actor, id: nanoid() }],
  })),
  addUseCase: (useCase) => set((state) => ({
    useCases: [...state.useCases, { ...useCase, id: nanoid() }],
  })),
  addUseCaseAssociation: (association) => set((state) => ({
    useCaseAssociations: [...state.useCaseAssociations, { ...association, id: nanoid() }],
  })),
  addActorUseCaseLink: (link) => set((state) => ({
    actorUseCaseLinks: [...state.actorUseCaseLinks, { ...link, id: nanoid() }],
  })),
}));
