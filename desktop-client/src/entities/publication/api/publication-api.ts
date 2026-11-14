import type { PublicationProject } from '../model/types';

const STORAGE_KEY = 'cosmolost-publication-projects';

let memoryCache: PublicationProject[] = [];

export const publicationApi = {
  loadProjects(): PublicationProject[] {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          return JSON.parse(raw);
        }
      }
    } catch (e) {
      console.warn('Failed to load publication projects from storage:', e);
    }
    return memoryCache;
  },

  saveProjects(projects: PublicationProject[]): void {
    memoryCache = [...projects];
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
      }
    } catch (e) {
      console.error('Failed to save publication projects to storage:', e);
    }
  },
};
