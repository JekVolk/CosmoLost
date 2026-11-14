import { create } from 'zustand';
import type { PublicationProject, VideoScriptSlide } from './types';

interface PublicationState {
  currentProject: PublicationProject | null;
  projects: PublicationProject[];
  setCurrentProject: (project: PublicationProject | null) => void;
  updateSlides: (slides: VideoScriptSlide[]) => void;
  updateStatus: (status: PublicationProject['status']) => void;
  updateSeo: (seoCaption: PublicationProject['seoCaption'], pinComment: string) => void;
  setRenderTimeout: (sec: number) => void;
}

export const usePublicationStore = create<PublicationState>((set) => ({
  currentProject: null,
  projects: [],
  setCurrentProject: (project) => set({ currentProject: project }),
  updateSlides: (slides) =>
    set((state) => ({
      currentProject: state.currentProject ? { ...state.currentProject, slides } : null,
    })),
  updateStatus: (status) =>
    set((state) => ({
      currentProject: state.currentProject ? { ...state.currentProject, status } : null,
    })),
  updateSeo: (seoCaption, pinComment) =>
    set((state) => ({
      currentProject: state.currentProject
        ? { ...state.currentProject, seoCaption, pinComment }
        : null,
    })),
  setRenderTimeout: (sec) =>
    set((state) => ({
      currentProject: state.currentProject
        ? { ...state.currentProject, renderTimeoutSec: sec }
        : null,
    })),
}));
