export interface IProject {
  id: string;
  name: string;
  description: string;
  projectType: TProjectType;
  createdAt: Date;
  updatedAt: Date;
}

export type TProjectType = 'use-case';
