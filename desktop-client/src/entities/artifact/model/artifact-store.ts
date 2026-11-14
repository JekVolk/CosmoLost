import { create } from 'zustand';
import type { ArtifactDomainModel } from './types';

interface ArtifactState {
  selectedArtifactId: string;
  selectedArtifact: ArtifactDomainModel | null;
  selectArtifact: (artifact: ArtifactDomainModel) => void;
  selectArtifactById: (id: string) => void;
}

export const useArtifactStore = create<ArtifactState>((set) => ({
  selectedArtifactId: 'opportunity-rover',
  selectedArtifact: null,
  selectArtifact: (artifact) =>
    set({
      selectedArtifactId: artifact.id,
      selectedArtifact: artifact,
    }),
  selectArtifactById: (id) =>
    set({
      selectedArtifactId: id,
    }),
}));
