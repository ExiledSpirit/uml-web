// src/store/usecase-helpers.ts
import type { IUseCase } from "@/types/uml";

const uid = () => crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);

/** Update a use case inside a list immutably */
export function updateUseCase(
  useCases: IUseCase[],
  id: string,
  updater: (u: IUseCase) => IUseCase
): IUseCase[] {
  return useCases.map((u) => (u.id === id ? updater(u) : u));
}

/** Add a main flow phase */
export function addPhase(useCases: IUseCase[], ucId: string, text: string): IUseCase[] {
  return updateUseCase(useCases, ucId, (u) => ({
    ...u,
    phases: [...(u.phases ?? []), { id: uid(), text }],
  }));
}

/** Add an alternative flow */
export function addAltFlow(
  useCases: IUseCase[],
  ucId: string,
  parentPhaseId: string,
  name: string,
  kind: "alternative" | "exception" = "alternative"
): IUseCase[] {
  return updateUseCase(useCases, ucId, (u) => ({
    ...u,
    alternativeFlows: [
      ...(u.alternativeFlows ?? []),
      { id: uid(), name, kind, parentPhaseId, flows: [] },
    ],
  }));
}

/** Change the return phase of an alternative flow */
export function setAltReturn(
  useCases: IUseCase[],
  ucId: string,
  altId: string,
  returnPhaseId?: string
): IUseCase[] {
  return updateUseCase(useCases, ucId, (u) => ({
    ...u,
    alternativeFlows: (u.alternativeFlows ?? []).map((af) =>
      af.id === altId ? { ...af, returnPhaseId } : af
    ),
  }));
}

/** Add a step inside an alt flow */
export function addAltFlowStep(
  useCases: IUseCase[],
  ucId: string,
  altId: string,
  text: string
): IUseCase[] {
  return updateUseCase(useCases, ucId, (u) => ({
    ...u,
    alternativeFlows: (u.alternativeFlows ?? []).map((af) =>
      af.id === altId
        ? { ...af, flows: [...af.flows, { id: uid(), text }] }
        : af
    ),
  }));
}
