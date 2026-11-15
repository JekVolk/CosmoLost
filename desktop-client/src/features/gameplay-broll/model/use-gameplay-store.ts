import { usePublicationStore } from '@/entities/publication';
import { create } from 'zustand';
import type { RecordedBrollClip } from './types';

interface GameplayBrollState {
  isModalOpen: boolean;
  savedClips: RecordedBrollClip[];
  activeClip: RecordedBrollClip | null;
  openModal: () => void;
  closeModal: () => void;
  addClip: (clip: RecordedBrollClip) => void;
  deleteClip: (id: string) => void;
  setActiveClip: (clip: RecordedBrollClip | null) => void;
  attachToActiveProject: (clip: RecordedBrollClip) => void;
}

export const useGameplayStore = create<GameplayBrollState>((set) => ({
  isModalOpen: false,
  savedClips: [],
  activeClip: null,
  openModal: () => set({ isModalOpen: true }),
  closeModal: () => set({ isModalOpen: false }),
  addClip: (clip) =>
    set((state) => ({
      savedClips: [clip, ...state.savedClips],
      activeClip: clip,
    })),
  deleteClip: (id) =>
    set((state) => ({
      savedClips: state.savedClips.filter((c) => c.id !== id),
      activeClip: state.activeClip?.id === id ? null : state.activeClip,
    })),
  setActiveClip: (clip) => set({ activeClip: clip }),
  attachToActiveProject: (clip) => {
    const pubStore = usePublicationStore.getState();
    pubStore.attachBrollVideo(clip.videoBlobUrl, clip.preset, clip.durationSec);
  },
}));
