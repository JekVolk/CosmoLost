import { create } from 'zustand';

export interface ContainerSlot {
  slot_index: number;
  filled_at: string;
  is_opened: boolean;
}

interface ContainerState {
  slots: ContainerSlot[];
  setSlots: (slots: ContainerSlot[]) => void;
}

export const useContainerStore = create<ContainerState>((set) => ({
  slots: [],
  setSlots: (slots) => set({ slots }),
}));
