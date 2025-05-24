export interface IActor {
  id: string;
  name: string;
  description?: string;
  icon: TActorType;
}

export type TActorType = 'person' | 'system';
