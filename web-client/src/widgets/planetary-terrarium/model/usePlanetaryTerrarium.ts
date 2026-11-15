import { create } from 'zustand';

export interface TerrariumArtifact {
  id: string;
  name: string;
  equipment_class?: string;
  rarity?: string;
  latitude: number;
  longitude: number;
  image_url?: string | null;
  model_3d_url?: string | null;
  first_person_monologue?: string | null;
  cause_of_deactivation?: string | null;
  manufacturer?: string | null;
  landing_date?: string | null;
}

export interface PlanetaryTerrariumState {
  selectedArtifact: TerrariumArtifact | null;
  flyToTarget: { lat: number; lon: number } | null;
  setSelectedArtifact: (artifact: TerrariumArtifact | null) => void;
  flyTo: (lat: number, lon: number) => void;
  clearFlyTo: () => void;
}

export const usePlanetaryTerrarium = create<PlanetaryTerrariumState>((set) => ({
  selectedArtifact: null,
  flyToTarget: null,
  setSelectedArtifact: (selectedArtifact) => set({ selectedArtifact }),
  flyTo: (lat, lon) => set({ flyToTarget: { lat, lon } }),
  clearFlyTo: () => set({ flyToTarget: null }),
}));
