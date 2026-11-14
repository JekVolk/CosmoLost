import { isTauri } from '@tauri-apps/api/core';
import { LazyStore } from '@tauri-apps/plugin-store';
import type { StateStorage } from 'zustand/middleware';

export function createTauriStorage(storePath = 'cosmolost-settings.json'): StateStorage {
  if (isTauri()) {
    const store = new LazyStore(storePath, { autoSave: true });

    return {
      getItem: async (name: string): Promise<string | null> => {
        try {
          const value = await store.get<string>(name);
          return value ?? null;
        } catch (error) {
          console.warn(`[TauriStorage] Failed to read "${name}" from store:`, error);
          return null;
        }
      },
      setItem: async (name: string, value: string): Promise<void> => {
        try {
          await store.set(name, value);
          await store.save();
        } catch (error) {
          console.warn(`[TauriStorage] Failed to write "${name}" to store:`, error);
        }
      },
      removeItem: async (name: string): Promise<void> => {
        try {
          await store.delete(name);
          await store.save();
        } catch (error) {
          console.warn(`[TauriStorage] Failed to remove "${name}" from store:`, error);
        }
      },
    };
  }

  return {
    getItem: (name: string): string | null => {
      try {
        return localStorage.getItem(name);
      } catch {
        return null;
      }
    },
    setItem: (name: string, value: string): void => {
      try {
        localStorage.setItem(name, value);
      } catch {
        // Ignore storage errors in restricted contexts
      }
    },
    removeItem: (name: string): void => {
      try {
        localStorage.removeItem(name);
      } catch {
        // Ignore storage errors
      }
    },
  };
}

export const tauriStorage: StateStorage = createTauriStorage();
