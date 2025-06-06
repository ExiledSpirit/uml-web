import type { ProjectData } from './project.repository';
import { ProjectRepository } from './project.repository';

const STORAGE_KEY = 'uml-project-data';

class LocalStorageProjectAdapter extends ProjectRepository {
  load(): ProjectData | null {
    const json = localStorage.getItem(STORAGE_KEY);
    if (!json) return null;
    try {
      return JSON.parse(json);
    } catch {
      return null;
    }
  }

  save(data: ProjectData) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  clear() {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export const localStorageProjectAdapter = new LocalStorageProjectAdapter();
