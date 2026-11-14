import { tauriStorage } from '@/shared';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { DEFAULT_MCP_SERVERS } from './defaults';
import type { McpInvocationLog, McpServer, McpStatus } from './schema';

export interface McpStoreState {
  servers: McpServer[];
  selectedServerId: string;
  logs: McpInvocationLog[];
  isHydrated: boolean;
  setSelectedServer: (serverId: string) => void;
  toggleServer: (serverId: string) => void;
  addServer: (server: Omit<McpServer, 'id' | 'status' | 'latencyMs' | 'toolsCount'>) => void;
  removeServer: (serverId: string) => void;
  updateServerStatus: (
    serverId: string,
    status: McpStatus,
    latencyMs?: number,
    toolsCount?: number,
  ) => void;
  recordCallLog: (log: Omit<McpInvocationLog, 'id' | 'timestamp'>) => void;
  clearLogs: () => void;
  resetToDefaults: () => void;
  setHydrated: (hydrated: boolean) => void;
}

export const useMcpStore = create<McpStoreState>()(
  persist(
    (set) => ({
      servers: DEFAULT_MCP_SERVERS,
      selectedServerId: 'tauri',
      logs: [],
      isHydrated: false,

      setSelectedServer: (selectedServerId: string) => set({ selectedServerId }),

      toggleServer: (serverId: string) =>
        set((state) => ({
          servers: state.servers.map((s) => {
            if (s.id === serverId) {
              const enabled = !s.enabled;
              return {
                ...s,
                enabled,
                status: enabled ? 'connected' : 'disconnected',
              };
            }
            return s;
          }),
        })),

      addServer: (serverData) => {
        const id = `mcp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        const newServer: McpServer = {
          ...serverData,
          id,
          status: 'connected',
          latencyMs: null,
          toolsCount: 0,
        };
        set((state) => ({ servers: [...state.servers, newServer] }));
      },

      removeServer: (serverId: string) =>
        set((state) => ({
          servers: state.servers.filter((s) => s.id !== serverId),
          logs: state.logs.filter((l) => l.serverId !== serverId),
        })),

      updateServerStatus: (serverId, status, latencyMs, toolsCount) =>
        set((state) => ({
          servers: state.servers.map((s) => {
            if (s.id === serverId) {
              return {
                ...s,
                status,
                latencyMs: latencyMs !== undefined ? latencyMs : s.latencyMs,
                toolsCount: toolsCount !== undefined ? toolsCount : s.toolsCount,
              };
            }
            return s;
          }),
        })),

      recordCallLog: (log) => {
        const id = `mcp-call-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        const entry: McpInvocationLog = {
          ...log,
          id,
          timestamp: new Date().toISOString(),
        };
        set((state) => ({ logs: [entry, ...state.logs.slice(0, 39)] }));
      },

      clearLogs: () => set({ logs: [] }),

      resetToDefaults: () =>
        set({
          servers: DEFAULT_MCP_SERVERS,
          selectedServerId: 'tauri',
          logs: [],
        }),

      setHydrated: (isHydrated: boolean) => set({ isHydrated }),
    }),
    {
      name: 'cosmolost-mcp-state',
      storage: createJSONStorage(() => tauriStorage),
      partialize: (state) => ({
        servers: state.servers,
        selectedServerId: state.selectedServerId,
        logs: state.logs.slice(0, 15),
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);
