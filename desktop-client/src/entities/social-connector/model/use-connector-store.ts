import { create } from 'zustand';
import type { ConnectorItem } from './types';

interface ConnectorState {
  connectors: ConnectorItem[];
  selectedConnectorIds: string[];
  setConnectors: (items: ConnectorItem[]) => void;
  toggleSelection: (id: string) => void;
}

export const useConnectorStore = create<ConnectorState>((set) => ({
  connectors: [],
  selectedConnectorIds: ['local-folder-export', 'youtube-shorts'],
  setConnectors: (connectors) => set({ connectors }),
  toggleSelection: (id) =>
    set((state) => ({
      selectedConnectorIds: state.selectedConnectorIds.includes(id)
        ? state.selectedConnectorIds.filter((item) => item !== id)
        : [...state.selectedConnectorIds, id],
    })),
}));
