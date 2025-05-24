export interface IUseCaseAssociation {
  id: string;
  sourceId: string;
  targetId: string;
  type: TUseCaseAssociationType;
}

export type TUseCaseAssociationType = 'association' | 'include' | 'extend' | 'generalization';
