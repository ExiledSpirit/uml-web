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

/** Add a main flow phrase */
export function addPhrase(useCases: IUseCase[], ucId: string, text: string): IUseCase[] {
  return updateUseCase(useCases, ucId, (u) => ({
    ...u,
    phrases: [...(u.phrases ?? []), { id: uid(), text }],
  }));
}

/** Add an alternative flow */
export function addAltFlow(
  useCases: IUseCase[],
  ucId: string,
  parentPhraseId: string,
  name: string,
  kind: "alternative" | "exception" = "alternative"
): IUseCase[] {
  return updateUseCase(useCases, ucId, (u) => ({
    ...u,
    alternativeFlows: [
      ...(u.alternativeFlows ?? []),
      { id: uid(), name, kind, parentPhraseId, flows: [] },
    ],
  }));
}

/** Change the return phrase of an alternative flow */
export function setAltReturn(
  useCases: IUseCase[],
  ucId: string,
  altId: string,
  returnPhraseId?: string
): IUseCase[] {
  return updateUseCase(useCases, ucId, (u) => ({
    ...u,
    alternativeFlows: (u.alternativeFlows ?? []).map((af) =>
      af.id === altId ? { ...af, returnPhraseId } : af
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
