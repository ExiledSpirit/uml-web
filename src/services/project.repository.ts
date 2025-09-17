import type { ActorUseCaseLink, NodePosition, UseCaseAssociation } from '@/store/use-project.store';
import type { IActor, IUseCase } from '@/types/uml';

export interface ProjectData {
  actors: IActor[];
  useCases: IUseCase[];
  actorUseCaseLinks?: ActorUseCaseLink[];
  useCaseAssociations?: UseCaseAssociation[];
  nodePositions?: Record<string, NodePosition>;
}

export abstract class ProjectRepository {
  abstract load(): ProjectData | null;
  abstract save(data: ProjectData): void;
  abstract clear(): void;
}
