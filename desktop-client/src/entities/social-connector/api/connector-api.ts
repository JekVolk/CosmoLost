import { type PlatformConnectorDto, tauriCommands } from '@/shared/api';

export const connectorApi = {
  async fetchConnectors(): Promise<PlatformConnectorDto[]> {
    return tauriCommands.listPlatformConnectors();
  },
};
